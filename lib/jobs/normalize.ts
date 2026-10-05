import type { ExaSearchResult } from "@/lib/exa/search";
import type { JobPlatform } from "./types";

export interface NormalizedJob {
  platform: JobPlatform;
  title: string;
  company: string | null;
  company_logo: string | null;
  location: string | null;
  salary: string | null;
  job_type: string | null;
  experience_level: string | null;
  description: string | null;
  tags: string[];
  job_url: string;
  source_url: string;
  posted_at: string | null;
}

const JOB_TYPE_PATTERNS: { pattern: RegExp; label: string }[] = [
  { pattern: /\bfull[\s-]?time\b/i, label: "Full-time" },
  { pattern: /\bpart[\s-]?time\b/i, label: "Part-time" },
  { pattern: /\bcontract\b/i, label: "Contract" },
  { pattern: /\bintern(ship)?\b/i, label: "Internship" },
  { pattern: /\bfreelance\b/i, label: "Freelance" },
];

const EXPERIENCE_PATTERNS: { pattern: RegExp; label: string }[] = [
  { pattern: /\b(senior|sr\.?|staff|lead|principal)\b/i, label: "Senior" },
  { pattern: /\b(junior|jr\.?|entry[\s-]?level|graduate)\b/i, label: "Junior" },
  { pattern: /\bmid[\s-]?level\b/i, label: "Mid-level" },
];

const REMOTE_PATTERN = /\bremote\b/i;
const HYBRID_PATTERN = /\bhybrid\b/i;
const SALARY_PATTERN = /\$\s?\d{2,3}(?:,\d{3}|k)(?:\s?-\s?\$?\s?\d{2,3}(?:,\d{3}|k))?/i;
const ROLE_WORDS =
  /\b(developer|engineer|intern(ship)?|manager|designer|lead|senior|junior|specialist|analyst|architect|consultant|full\s*stack|frontend|backend)\b/i;
const PLATFORM_WORDS = /\b(wellfound|greenhouse|lever|workable)\b/i;
const LABELED_LOCATION_PATTERN =
  /\b(?:location|based in|office(?:s)? in)\s*[:\-]?\s*([A-Z][\w.\-]+(?:,\s*[A-Z][\w.\-]+){0,2})/i;

export function isPlausibleJobUrl(platform: JobPlatform, url: string): boolean {
  try {
    const path = new URL(url).pathname;
    switch (platform) {
      case "greenhouse": return /\/jobs\/[\w-]+/.test(path);
      case "lever": return /^\/[^/]+\/[0-9a-f-]{8,}/i.test(path);
      case "workable": return /\/j\//.test(path);
      case "wellfound": return /\/jobs\//.test(path);
      default: return true;
    }
  } catch {
    return false;
  }
}

export function normalizeExaResult(
  result: ExaSearchResult,
  platform: JobPlatform,
  skills: string[]
): NormalizedJob | null {
  if (!result.url || !result.title) return null;

  const company = extractCompanyFromUrl(result.url, platform);
  const rawTitle = cleanText(result.title);
  const highlightText = (result.highlights ?? []).join(" ");
  const bodyText = cleanText(result.text || highlightText);
  const combinedText = `${rawTitle} ${bodyText}`;

  return {
    platform,
    title: deriveTitle(rawTitle, company),
    company,
    company_logo: result.image || result.favicon || null, // upgraded later if a real logo resolves
    location:
      workModeFromText(combinedText) ??
      extractLocationFromTitle(rawTitle, skills) ??
      extractLabeledLocation(combinedText),
    salary: combinedText.match(SALARY_PATTERN)?.[0] ?? null,
    job_type: JOB_TYPE_PATTERNS.find((p) => p.pattern.test(combinedText))?.label ?? null,
    experience_level: EXPERIENCE_PATTERNS.find((p) => p.pattern.test(combinedText))?.label ?? null,
    description: cleanText(highlightText || bodyText).slice(0, 600) || null,
    tags: buildTags(combinedText, skills),
    job_url: result.url,
    source_url: result.url,
    posted_at: result.publishedDate ?? null,
  };
}

function workModeFromText(text: string): string | null {
  if (REMOTE_PATTERN.test(text)) return "Remote";
  if (HYBRID_PATTERN.test(text)) return "Hybrid";
  return null;
}

function extractLocationFromTitle(rawTitle: string, skills: string[]): string | null {
  const segments = rawTitle.split(/[•|]|(?:\sI\s)|(?:\s-\s)/).map((s) => s.trim()).filter(Boolean);
  const skillSet = new Set(skills.map((s) => s.toLowerCase()));

  for (const segment of segments) {
    if (segment.length < 2 || segment.length > 40) continue;
    if (ROLE_WORDS.test(segment)) continue;
    if (PLATFORM_WORDS.test(segment)) continue;
    if (/^at\s/i.test(segment)) continue;
    const parts = segment.split(",").map((p) => p.trim().toLowerCase()).filter(Boolean);
    if (parts.length > 0 && parts.every((p) => skillSet.has(p))) continue;
    if (skillSet.has(segment.toLowerCase())) continue;
    return segment;
  }
  return null;
}

function extractLabeledLocation(text: string): string | null {
  return text.match(LABELED_LOCATION_PATTERN)?.[1]?.trim() ?? null;
}

function extractCompanyFromUrl(url: string, platform: JobPlatform): string | null {
  try {
    const u = new URL(url);
    const segments = u.pathname.split("/").filter(Boolean);
    switch (platform) {
      case "greenhouse":
      case "lever":
        return segments[0] ? humanizeSlug(segments[0]) : null;
      case "workable": {
        const subdomain = u.hostname.split(".")[0];
        if (subdomain && !["apply", "www", "workable"].includes(subdomain)) return humanizeSlug(subdomain);
        return segments[0] ? humanizeSlug(segments[0]) : null;
      }
      case "wellfound": {
        const i = segments.indexOf("company");
        return i !== -1 && segments[i + 1] ? humanizeSlug(segments[i + 1]) : null;
      }
      default:
        return null;
    }
  } catch {
    return null;
  }
}

function humanizeSlug(slug: string): string {
  return slug.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()).trim();
}

function cleanText(value: string): string {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/^\s*[-*]\s+/gm, "")
    .replace(/^title:\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function deriveTitle(rawTitle: string, company: string | null): string {
  let title = rawTitle;
  if (company) {
    const escaped = company.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    title = title.replace(new RegExp(`\\s*[-|–—]?\\s*(at\\s+)?${escaped}\\s*`, "i"), " ").trim();
  }
  title = title.replace(/^[-|–—\s]+|[-|–—\s]+$/g, "").trim();
  return title || rawTitle;
}

function buildTags(text: string, skills: string[]): string[] {
  const lower = text.toLowerCase();
  const matched = skills.filter((s) => lower.includes(s.toLowerCase()));
  const tags = new Set(matched.slice(0, 6));
  if (REMOTE_PATTERN.test(text)) tags.add("Remote");
  return Array.from(tags);
}