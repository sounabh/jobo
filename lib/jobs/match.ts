import type { ProfileContext } from "./types";
import type { NormalizedJob } from "./normalize";

export function computeMatchScore(job: NormalizedJob, context: ProfileContext): number {
  const text = `${job.title} ${job.description ?? ""}`.toLowerCase();
  let score = 0;

  // Role/title similarity — up to 30
  if (context.role && text.includes(context.role.toLowerCase())) {
    score += 30;
  } else if (context.role) {
    const roleWords = context.role.toLowerCase().split(/\s+/).filter(Boolean);
    const matchedWords = roleWords.filter((w) => text.includes(w));
    score += Math.round((matchedWords.length / Math.max(roleWords.length, 1)) * 20);
  }

  // Skills / tech stack — up to 30
  if (context.skills.length) {
    const matched = context.skills.filter((skill) => text.includes(skill.toLowerCase()));
    score += Math.round((matched.length / context.skills.length) * 30);
  }

  // Location — up to 15
  if (context.location && job.location?.toLowerCase().includes(context.location.toLowerCase())) {
    score += 15;
  } else if (context.workMode === "remote" && job.location?.toLowerCase() === "remote") {
    score += 15;
  }

  // Experience level — up to 15
  if (context.experienceLevel && job.experience_level?.toLowerCase() === context.experienceLevel.toLowerCase()) {
    score += 15;
  }

  // Job type — up to 10
  if (context.jobType && job.job_type?.toLowerCase() === context.jobType.toLowerCase()) {
    score += 10;
  }

  return Math.max(0, Math.min(100, score));
}