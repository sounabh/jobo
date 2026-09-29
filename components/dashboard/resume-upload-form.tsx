/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { uploadResume, type UploadResumeState } from "@/app/dashboard/resume/actions";
import { Button } from "@/components/ui/button";
import { UploadCloud } from "lucide-react";

const initialState: UploadResumeState = {}; // intialstate is empty

export function ResumeUploadForm() {
  
  const [state, formAction, pending] = useActionState(uploadResume, initialState); // server action 

  // state = returns data
  // pending = action is currently running

  const [fileName, setFileName] = useState<string | null>(null); //filename

  const formRef = useRef<HTMLFormElement>(null); // form ref

  const wasPending = useRef(false); //wasPending helps detect the transition: true to false


  /*
  *User clicks Upload
        ↓
pending: false → true
 */

  useEffect(() => {

    if (wasPending.current && !pending) {
   // upload just finished
      if (state.error) { // form action err
        toast.error(state.error); // set toast
      } else if (state.message) {
        toast.success(state.message);
        setFileName(null);
        formRef.current?.reset(); // reset form 
      }
    }
    wasPending.current = pending; // when upload start pending will be true as well as waspending to track prev state and first block get ignored
  }, [pending, state]); // when these changes run the effect

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-col gap-3 rounded-sm border border-(--jobo-line) bg-white/60 p-5 sm:flex-row sm:items-center sm:justify-between"
    >
      <label
        htmlFor="resume-file"
        className="flex flex-1 cursor-pointer items-center gap-3 text-[13px] text-(--jobo-muted)"
      >
        <UploadCloud className="size-4 shrink-0 text-(--jobo-ink)" strokeWidth={1.75} />
        <span className="truncate">{fileName ?? "Choose a PDF, DOCX, or TXT file to upload"}</span>
        <input
          id="resume-file"
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
        className="h-9 shrink-0 rounded-sm border border-(--jobo-ink) bg-(--jobo-ink) px-4 text-[13px] font-normal tracking-wide text-white shadow-none hover:bg-(--jobo-ink)/90"
      >
        {pending ? "Uploading…" : "Upload resume"}
      </Button>
    </form>
  );
}