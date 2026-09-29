import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/dashboard/profile-form";

export const metadata: Metadata = { title: "Profile · JOBO" };

export default async function ProfilePage() {

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub as string | undefined;

  if (!userId) return null;

  // fetch resume user profile from db by query
  const [
    { data: profile },
    { data: workExperience },
    { data: education },
    { data: projects },
    { data: certifications },
    { data: links },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase.from("work_experience").select("*").eq("user_id", userId).order("sort_order"),
    supabase.from("education").select("*").eq("user_id", userId).order("sort_order"),
    supabase.from("projects").select("*").eq("user_id", userId).order("sort_order"),
    supabase.from("certifications").select("*").eq("user_id", userId).order("sort_order"),
    supabase.from("resume_links").select("*").eq("user_id", userId),
  ]);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-[11px] tracking-[0.14em] text-(--jobo-muted) uppercase">Profile</p>
        <h1 className="font-(family-name:--font-jobo-display) text-[28px] tracking-[-0.03em] text-(--jobo-ink)">
          Your profile
        </h1>
        <p className="max-w-md text-[13.5px] leading-relaxed text-(--jobo-muted)">
          Pulled from your resume. Edit anything — JOBO uses this to tailor applications.
        </p>
      </div>

{/* component * */}
      <ProfileForm
        profile={profile}
        workExperience={workExperience ?? []}
        education={education ?? []}
        projects={projects ?? []}
        certifications={certifications ?? []}
        links={links ?? []}
      />
    </div>
  );
}