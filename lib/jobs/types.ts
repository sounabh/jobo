export type JobPlatform = "greenhouse" | "lever" | "workable" | "wellfound";

export const JOB_PLATFORMS: { id: JobPlatform; label: string; domains: string[] }[] = [
  { id: "greenhouse", label: "Greenhouse", domains: ["greenhouse.io"] },
  { id: "lever", label: "Lever", domains: ["lever.co"] },
  { id: "workable", label: "Workable", domains: ["workable.com"] },
  { id: "wellfound", label: "Wellfound", domains: ["wellfound.com"] },
];

export interface JobRow {
  id: string;
  user_id: string;
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
  match_score: number;
  job_url: string;
  source_url: string | null;
  applied_status: boolean;
  saved_status: boolean;
  posted_at: string | null; // NEW — from Exa's publishedDate
  fetched_at: string;
  updated_at: string;
  created_at: string;
}

export interface ProfileContext {
  role: string;
  location: string;
  workMode: string;
  experienceLevel: string;
  jobType: string;
  skills: string[];
}