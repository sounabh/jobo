"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type UpdateProfileState = { error?: string; message?: string };

export interface ProfileFormPayload {
  full_name: string;
  phone: string;
  location: string;
  professional_summary: string;
  skills: string[];

  work_experience: {
    company: string;
    title: string;
    location?: string | null;
    start_date?: string | null;
    end_date?: string | null;
    is_current?: boolean;
    responsibilities: string[];
  }[];

  education: {
    institution: string;
    degree?: string | null;
    field_of_study?: string | null;
    start_date?: string | null;
    end_date?: string | null;
    description?: string | null;
  }[];

  projects: {
    name: string;
    description?: string | null;
    technologies: string[];
    url?: string | null;
  }[];

  certifications: {
    name: string;
    issuer?: string | null;
    issue_date?: string | null;
    url?: string | null;
  }[];

  links: {
    label: string;
    url: string;
  }[];
}

export async function updateProfile(
  _prev: UpdateProfileState,
  formData: FormData
): Promise<UpdateProfileState> {
  
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub as string | undefined;
  if (!userId) return { error: "You must be signed in." };

  const raw = formData.get("payload");
  if (typeof raw !== "string") return { error: "Missing form data." };

  let payload: ProfileFormPayload;
  try {
    payload = JSON.parse(raw);
  } catch {
    return { error: "Couldn't read the form data. Try again." };
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: payload.full_name || null,
      phone: payload.phone || null,
      location: payload.location || null,
      professional_summary: payload.professional_summary || null,
      skills: payload.skills ?? [],
    })
    .eq("id", userId);

  if (profileError) return { error: "Couldn't save your profile. Try again." };

  await Promise.all([
    supabase.from("work_experience").delete().eq("user_id", userId),
    supabase.from("education").delete().eq("user_id", userId),
    supabase.from("projects").delete().eq("user_id", userId),
    supabase.from("certifications").delete().eq("user_id", userId),
    supabase.from("resume_links").delete().eq("user_id", userId),
  ]);

  if (payload.work_experience?.length) {
    await supabase.from("work_experience").insert(
      payload.work_experience.map((item, index) => ({
        ...item,
        user_id: userId,
        sort_order: index,
      }))
    );
  }
  if (payload.education?.length) {
    await supabase.from("education").insert(
      payload.education.map((item, index) => ({
        ...item,
        user_id: userId,
        sort_order: index,
      }))
    );
  }
  if (payload.projects?.length) {
    await supabase.from("projects").insert(
      payload.projects.map((item, index) => ({
        ...item,
        user_id: userId,
        sort_order: index,
      }))
    );
  }
  if (payload.certifications?.length) {
    await supabase.from("certifications").insert(
      payload.certifications.map((item, index) => ({
        ...item,
        user_id: userId,
        sort_order: index,
      }))
    );
  }
  if (payload.links?.length) {
    await supabase
      .from("resume_links")
      .insert(payload.links.map((item) => ({ ...item, user_id: userId })));
  }

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");

  return { message: "Profile updated." };
}