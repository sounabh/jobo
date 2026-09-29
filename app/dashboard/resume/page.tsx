import type { Metadata } from "next";
import { ResumeList } from "@/components/dashboard/resume-list";
import { ResumeUploadForm } from "@/components/dashboard/resume-upload-form";
import { getCurrentUser } from "@/lib/supabase/user";

export const metadata: Metadata = { title: "Resume · JOBO" };

export default async function ResumePage() {
  const { supabase, userId } = await getCurrentUser();

  //postgre query to supabase for fetching resumes
  const { data: resumes } = userId
    ? await supabase
        .from("resumes")
        .select(
          "id, file_name, file_size, mime_type, status, file_path, created_at",
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-[11px] tracking-[0.14em] text-(--jobo-muted) uppercase">
          Resume
        </p>
        <h1 className="font-(family-name:--font-jobo-display) text-[28px] tracking-[-0.03em] text-(--jobo-ink)">
          Your resumes
        </h1>
        <p className="max-w-md text-[13.5px] leading-relaxed text-(--jobo-muted)">
          Upload a new version any time — JOBO re-reads it and refreshes your
          profile.
        </p>
      </div>

      {/* components * */}
      <ResumeUploadForm />
      <ResumeList resumes={resumes ?? []} />
    </div>
  );
}
