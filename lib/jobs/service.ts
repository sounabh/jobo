import { createClient } from "@/lib/supabase/server";
import { exaSearch } from "@/lib/exa/search";
import { buildSearchesForPlatforms, buildProfileContext } from "./build-queries";
import { normalizeExaResult, isPlausibleJobUrl, type NormalizedJob } from "./normalize";
import { resolveCompanyLogo } from "./logo";
import { computeMatchScore } from "./match";
import type { JobPlatform, JobRow, ProfileContext } from "./types";

const CACHE_WINDOW_MS = 6 * 60 * 60 * 1000; // 6 hours
const RESULTS_PER_PLATFORM = 15; // one Exa call per platform returns this many
const LINK_CHECK_TIMEOUT_MS = 4000;

export async function getJobsForUser(
  userId: string,
  options: { forceRefresh?: boolean; platforms: JobPlatform[] }
): Promise<{ jobs: JobRow[]; refreshedAt: string | null; error: string | null }> {
  const platforms = options.platforms;
  const supabase = await createClient();

  // No platform selected: deliberately show nothing and call nothing.
  // This is a valid state, not an error.
  if (platforms.length === 0) {
    return { jobs: [], refreshedAt: null, error: null };
  }

  const { data: existingJobs } = await supabase
    .from("jobs")
    .select("*")
    .eq("user_id", userId)
    .in("platform", platforms)
    .order("match_score", { ascending: false });

  const freshestByPlatform = new Map<JobPlatform, string>();
  for (const job of existingJobs ?? []) {
    const platform = job.platform as JobPlatform;
    const current = freshestByPlatform.get(platform);
    if (!current || job.fetched_at > current) freshestByPlatform.set(platform, job.fetched_at);
  }

  // Only the platforms that are actually missing or stale get refetched —
  // selecting a new platform alongside an already-fresh one doesn't
  // re-call Exa for the fresh one.
  const stalePlatforms = platforms.filter((platform) => {
    if (options.forceRefresh) return true;
    const fetchedAt = freshestByPlatform.get(platform);
    if (!fetchedAt) return true;
    return Date.now() - new Date(fetchedAt).getTime() > CACHE_WINDOW_MS;
  });

  if (stalePlatforms.length === 0) {
    const overallFreshest = [...freshestByPlatform.values()].sort().at(-1) ?? null;
    return { jobs: (existingJobs ?? []) as unknown as JobRow[], refreshedAt: overallFreshest, error: null };
  }

  try {
    await refreshJobsFromExa(userId, stalePlatforms);
  } catch (err) {
    console.error("[getJobsForUser] refresh failed:", err);
    return {
      jobs: (existingJobs ?? []) as unknown as JobRow[],
      refreshedAt: [...freshestByPlatform.values()].sort().at(-1) ?? null,
      error:
        (existingJobs?.length ?? 0) > 0
          ? "Couldn't fetch fresh listings for some platforms. Showing what's cached."
          : "Couldn't fetch jobs right now. Try again in a moment.",
    };
  }

  const { data: refreshedJobs } = await supabase
    .from("jobs")
    .select("*")
    .eq("user_id", userId)
    .in("platform", platforms)
    .order("match_score", { ascending: false });

  const jobs = (refreshedJobs ?? []) as unknown as JobRow[];

  return {
    jobs,
    refreshedAt: new Date().toISOString(),
    error: jobs.length === 0 ? "No matching jobs found for your profile on the selected platforms." : null,
  };
}

async function refreshJobsFromExa(userId: string, platforms: JobPlatform[]) {
  const supabase = await createClient();

  const [{ data: profile }, { data: workExperience }] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "preferred_role, preferred_location, preferred_job_type, preferred_experience_level, location, skills"
      )
      .eq("id", userId)
      .maybeSingle(),
    supabase.from("work_experience").select("title").eq("user_id", userId).order("sort_order").limit(1),
  ]);

  const context: ProfileContext = buildProfileContext({
    preferredRole: profile?.preferred_role,
    preferredLocation: profile?.preferred_location,
    preferredJobType: profile?.preferred_job_type,
    preferredExperienceLevel: profile?.preferred_experience_level,
    profileLocation: profile?.location,
    skills: profile?.skills,
    latestJobTitle: workExperience?.[0]?.title,
  });

  const searches = buildSearchesForPlatforms(platforms, context);

  // Exactly one Exa search call per selected (stale) platform.
  const resultsByPlatform = await Promise.allSettled(
    searches.map(async ({ platform, query, includeDomains }) => ({
      platform,
      results: await exaSearch({ query, numResults: RESULTS_PER_PLATFORM, includeDomains }),
    }))
  );

  let candidates: NormalizedJob[] = [];
  for (const outcome of resultsByPlatform) {
    if (outcome.status !== "fulfilled") {
      console.error("[refreshJobsFromExa] platform search failed:", outcome.reason);
      continue;
    }
    const { platform, results } = outcome.value;
    for (const result of results) {
      if (!isPlausibleJobUrl(platform, result.url)) continue; // drop non-job pages
      const job = normalizeExaResult(result, platform, context.skills);
      if (job) candidates.push(job);
    }
  }

  // Legitimate "nothing found" for a narrow profile/niche platform —
  // not an error, caller decides how to message it.
  if (candidates.length === 0) return;

  candidates = dedupeByContent(dedupeByJobUrl(candidates));
  candidates = await filterDeadLinks(candidates);

  if (candidates.length === 0) return;

  const withLogos = await attachCompanyLogos(candidates);

  const now = new Date().toISOString();
  // saved_status / applied_status are intentionally absent from this
  // payload — Postgres only touches columns present in the upsert, so a
  // conflicting row keeps whatever the user already set.
  const rows = withLogos.map((job) => ({
    user_id: userId,
    ...job,
    match_score: computeMatchScore(job, context),
    fetched_at: now,
  }));

  const { error } = await supabase.from("jobs").upsert(rows, { onConflict: "user_id,job_url" });
  if (error) throw error;
}

function dedupeByJobUrl<T extends { job_url: string }>(jobs: T[]): T[] {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const job of jobs) {
    const key = normalizeUrlKey(job.job_url);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(job);
  }
  return result;
}

function normalizeUrlKey(url: string): string {
  try {
    const u = new URL(url);
    let key = `${u.hostname.replace(/^www\./, "")}${u.pathname}`;
    if (key.endsWith("/")) key = key.slice(0, -1);
    return key.toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

function dedupeByContent<T extends { title: string; company: string | null }>(jobs: T[]): T[] {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const job of jobs) {
    const key = `${normalizeForDedupe(job.title)}::${normalizeForDedupe(job.company ?? "")}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(job);
  }
  return result;
}

function normalizeForDedupe(value: string): string {
  return value.toLowerCase().replace(/\(clone\)/gi, "").replace(/[^a-z0-9]+/g, " ").trim();
}

/**
 * Best-effort dead-link check. Only drops a job on an explicit 404/410 —
 * timeouts, 403s, and blocked bot-checks are ambiguous (many ATS sites
 * reject HEAD requests even though the page works fine in a browser), so
 * those are kept rather than risk discarding a real listing.
 */
async function filterDeadLinks<T extends { job_url: string }>(jobs: T[]): Promise<T[]> {
  const checks = await Promise.allSettled(
    jobs.map(async (job) => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), LINK_CHECK_TIMEOUT_MS);
      try {
        const res = await fetch(job.job_url, {
          method: "HEAD",
          redirect: "follow",
          signal: controller.signal,
        });
        return res.status === 404 || res.status === 410 ? null : job;
      } catch {
        // Timeout / network error / blocked: ambiguous, so keep the job.
        return job;
      } finally {
        clearTimeout(timer);
      }
    })
  );

  return checks
    .map((r) => (r.status === "fulfilled" ? r.value : null))
    .filter((j): j is T => j !== null);
}

async function attachCompanyLogos<T extends { company: string | null; company_logo: string | null }>(
  jobs: T[]
): Promise<T[]> {
  const results = await Promise.allSettled(
    jobs.map(async (job) => {
      if (!job.company) return job;
      const logo = await resolveCompanyLogo(job.company);
      return logo ? { ...job, company_logo: logo } : job;
    })
  );
  return results.map((r, i) => (r.status === "fulfilled" ? r.value : jobs[i]));
}