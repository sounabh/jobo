import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getJobsForUser } from "@/lib/jobs/service";
import { JOB_PLATFORMS } from "@/lib/jobs/types";
import { JobsBoard } from "@/components/dashboard/jobs/jobs-board";

export const metadata: Metadata = { title: "Jobs · JOBO" };

export default async function JobsPage() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub as string | undefined;

  if (!userId) return null;

  const [{ data: profile }, { data: workExperience }, { data: education }] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, phone, location, professional_summary, skills")
      .eq("id", userId)
      .maybeSingle(),
    supabase.from("work_experience").select("id").eq("user_id", userId),
    supabase.from("education").select("id").eq("user_id", userId),
  ]);

 const { jobs, refreshedAt, error } = await getJobsForUser(userId, {
  platforms: JOB_PLATFORMS.map((p) => p.id),
});

  const completeness = computeProfileCompleteness({
    hasName: !!profile?.full_name,
    hasPhone: !!profile?.phone,
    hasLocation: !!profile?.location,
    hasSummary: !!profile?.professional_summary,
    hasSkills: (profile?.skills?.length ?? 0) > 0,
    hasExperience: (workExperience?.length ?? 0) > 0,
    hasEducation: (education?.length ?? 0) > 0,
  });

  const recentActivity = jobs
    .filter((j) => j.saved_status || j.applied_status)
    .sort((a, b) => (b.updated_at ?? b.created_at).localeCompare(a.updated_at ?? a.created_at))
    .slice(0, 5);

  return (
    <JobsBoard
      displayName={profile?.full_name}
      jobs={jobs}
      refreshedAt={refreshedAt}
      fetchError={error}
      completeness={completeness}
      recentActivity={recentActivity}
    />
  );
}

function computeProfileCompleteness(flags: Record<string, boolean>): number {
  const values = Object.values(flags);
  return Math.round((values.filter(Boolean).length / values.length) * 100);
}