/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { uploadResume, type UploadResumeState } from "@/app/dashboard/resume/actions";
import { Button } from "@/components/ui/button";
import { FileText, UploadCloud } from "lucide-react";

const initialState: UploadResumeState = {};

export function ResumeOnboardingDialog() {
  const [open, setOpen] = useState(true);
  const [state, formAction, pending] = useActionState(uploadResume, initialState);
  const [fileName, setFileName] = useState<string | null>(null);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending) {
      if (state.error) {
        toast.error(state.error);
      } else if (state.message) {
        toast.success(state.message);
        setOpen(false);
      }
    }
    wasPending.current = pending;
  }, [pending, state]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-(--jobo-ink)/50 p-4 backdrop-blur-sm">
      <div className="jobo-auth w-full max-w-md rounded-sm border border-(--jobo-line) bg-white p-7 shadow-xl">
        <div className="mb-5 flex size-10 items-center justify-center rounded-sm bg-(--jobo-amber-soft) text-(--jobo-amber)">
          <FileText className="size-5" strokeWidth={1.75} />
        </div>

        <h2 className="font-(family-name:--font-jobo-display) text-[22px] tracking-[-0.02em] text-(--jobo-ink)">
          Upload your resume to continue
        </h2>
        <p className="mt-2 text-[13.5px] leading-relaxed text-(--jobo-muted)">
          JOBO reads your resume once to fill in your profile — skills, experience,
          education, everything. You can edit anything afterward.
        </p>

        <form action={formAction} className="mt-6 flex flex-col gap-3">
          <label
            htmlFor="resume-onboarding-file"
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-sm border border-dashed border-(--jobo-line) bg-(--jobo-surface) px-4 py-8 text-center transition-colors hover:bg-white"
          >
            <UploadCloud className="size-5 text-(--jobo-muted)" strokeWidth={1.75} />
            <span className="text-[13px] text-(--jobo-ink)">
              {fileName ?? "Click to choose a PDF, DOCX, or TXT file"}
            </span>
            <span className="text-[11px] text-(--jobo-muted)">Max 8MB</span>
            <input
              id="resume-onboarding-file"
              name="resume"
              type="file"
              accept=".pdf,.docx,.txt"
              required
              className="hidden"
              onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
            />
          </label>

          <Button
            type="submit"
            disabled={pending || !fileName}
            className="h-9 w-full rounded-sm border border-(--jobo-ink) bg-(--jobo-ink) text-[13px] font-normal tracking-wide text-white shadow-none hover:bg-(--jobo-ink)/90"
          >
            {pending ? "Reading your resume…" : "Upload & continue"}
          </Button>
        </form>
      </div>
    </div>
  );
}