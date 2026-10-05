import type { JobPlatform } from "./types";

export const PLATFORM_ACCENT: Record<JobPlatform, string> = {
  greenhouse: "#2f8f5b",
  lever: "#3a6fb0",
  workable: "#7a57b0",
  wellfound: "#c97a2e",
};

export function matchScoreColor(score: number): string {
  if (score >= 70) return "var(--jobo-accent)";
  if (score >= 40) return "var(--jobo-amber)";
  return "var(--jobo-coral)";
}