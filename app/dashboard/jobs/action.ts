"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getJobsForUser } from "@/lib/jobs/service";
import type { JobPlatform } from "@/lib/jobs/types";

export async function refreshJobs(platforms: JobPlatform[]) {
  if (platforms.length === 0) {
    return { error: "Select at least one platform first." };
  }

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub as string | undefined;
  if (!userId) return { error: "You must be signed in." };

  const result = await getJobsForUser(userId, { forceRefresh: true, platforms });
  revalidatePath("/dashboard/jobs");

  if (result.error) return { error: result.error };
  return { message: `Found ${result.jobs.length} matching roles.` };
}

export async function toggleSaveJob(jobId: string, saved: boolean) {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub as string | undefined;
  if (!userId) return { error: "You must be signed in." };

  const { error } = await supabase
    .from("jobs")
    .update({ saved_status: saved, updated_at: new Date().toISOString() })
    .eq("id", jobId)
    .eq("user_id", userId);

  if (error) {
    console.error("[toggleSaveJob] error:", error);
    return { error: "Couldn't update that job. Try again." };
  }

  revalidatePath("/dashboard/jobs");
  return { message: saved ? "Job saved." : "Removed from saved." };
}

export async function markJobApplied(jobId: string) {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub as string | undefined;
  if (!userId) return { error: "You must be signed in." };

  const { error } = await supabase
    .from("jobs")
    .update({ applied_status: true, updated_at: new Date().toISOString() })
    .eq("id", jobId)
    .eq("user_id", userId);

  if (error) {
    console.error("[markJobApplied] error:", error);
    return { error: "Couldn't record that application." };
  }

  revalidatePath("/dashboard/jobs");
  return { message: "Marked as applied." };
}



export async function dismissActivity(jobId: string) {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub as string | undefined;
  if (!userId) return { error: "You must be signed in." };

  const { error } = await supabase
    .from("jobs")
    .update({ saved_status: false, applied_status: false, updated_at: new Date().toISOString() })
    .eq("id", jobId)
    .eq("user_id", userId);

  if (error) {
    console.error("[dismissActivity] error:", error);
    return { error: "Couldn't remove that activity item." };
  }

  revalidatePath("/dashboard/jobs");
  return { message: "Removed from recent activity." };
}