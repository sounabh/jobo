import { JOB_PLATFORMS, type JobPlatform, type ProfileContext } from "./types";

const MAX_QUERY_LENGTH = 350; // Tavily recommends staying well under ~400 chars

export function buildJobSearchQuery(context: ProfileContext): string {
  // Priority order per spec: role, skills/stack, location, work mode,
  // experience level, job type. Each piece is only added if present, so
  // a sparse profile still produces a short, sane query.
  const parts = [
    context.role,
    context.skills.slice(0, 4).join(" "),
    context.location,
    context.workMode,
    context.experienceLevel,
    context.jobType,
  ].filter(Boolean);

  const query = parts.join(" ").replace(/\s+/g, " ").trim();
  return query.length > MAX_QUERY_LENGTH ? query.slice(0, MAX_QUERY_LENGTH) : query;
}

export function buildSearchesForPlatforms(
  platforms: JobPlatform[],
  context: ProfileContext
): { platform: JobPlatform; query: string; includeDomains: string[] }[] {
  const query = buildJobSearchQuery(context);

  return JOB_PLATFORMS.filter((p) => platforms.includes(p.id)).map((p) => ({
    platform: p.id,
    query,
    includeDomains: p.domains,
  }));
}

export function buildProfileContext(params: {
  preferredRole?: string | null;
  preferredLocation?: string | null;
  preferredJobType?: string | null;
  preferredExperienceLevel?: string | null;
  profileLocation?: string | null;
  skills?: string[] | null;
  latestJobTitle?: string | null;
}): ProfileContext {
  return {
    role: params.preferredRole || params.latestJobTitle || "Software Engineer",
    location: params.preferredLocation || params.profileLocation || "",
    workMode: inferWorkMode(params.preferredLocation, params.profileLocation),
    experienceLevel: params.preferredExperienceLevel || "",
    jobType: params.preferredJobType || "",
    skills: params.skills ?? [],
  };
}

function inferWorkMode(preferredLocation?: string | null, profileLocation?: string | null): string {
  const text = `${preferredLocation ?? ""} ${profileLocation ?? ""}`.toLowerCase();
  if (text.includes("remote")) return "remote";
  if (text.includes("hybrid")) return "hybrid";
  return "";
}