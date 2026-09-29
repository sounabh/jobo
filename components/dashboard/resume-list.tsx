"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { FileText, Download, Trash2, Loader2 } from "lucide-react";
import { getSignedResumeUrl, deleteResume } from "@/app/dashboard/resume/actions";
import { cn } from "@/lib/utils";

type Resume = {
  id: string;
  file_name: string;
  file_size: number | null;
  mime_type: string | null;
  status: string;
  file_path: string;
  created_at: string;
};

const STATUS_LABEL: Record<string, string> = {
  processing: "Reading…",
  parsed: "Parsed",
  failed: "Needs manual entry",
};

export function ResumeList({ resumes }: { resumes: Resume[] }) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleOpen(path: string, id: string) {
    setDownloadingId(id); // show spinner when downloading id == resumeid 
    const url = await getSignedResumeUrl(path); // generate a temp url so user visit in browser and download cuz it will expire quickly

    setDownloadingId(null);
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      toast.error("Couldn't get a download link. Try again.");
    }
  }

  function handleDelete(resume: Resume) {
    setDeletingId(resume.id);
    startTransition(async () => {
      const result = await deleteResume(resume.id, resume.file_path);
      setDeletingId(null);
      if (result?.error) toast.error(result.error);
      else toast.success(result?.message ?? "Resume deleted.");
    });
  }

  if (resumes.length === 0) {
    return (
      <div className="flex min-h-[30vh] flex-col items-center justify-center gap-2 rounded-sm border border-dashed border-(--jobo-line) bg-white/40 text-center">
        <p className="text-[13.5px] text-(--jobo-muted)">No resumes uploaded yet.</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-(--jobo-line) rounded-sm border border-(--jobo-line) bg-white/60">
      {resumes.map((resume) => (
        <li key={resume.id} className="flex items-center justify-between gap-4 px-4 py-3.5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-(--jobo-surface) text-(--jobo-ink)">
              <FileText className="size-4" strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[13px] text-(--jobo-ink)">{resume.file_name}</p>
              <p className="text-[11.5px] text-(--jobo-muted)">
                {new Date(resume.created_at).toLocaleDateString()}
                {resume.file_size ? ` · ${Math.round(resume.file_size / 1024)} KB` : ""}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <span
              className={cn(
                "mr-2 text-[11px]",
                resume.status === "parsed" && "text-(--jobo-accent)",
                resume.status === "processing" && "text-(--jobo-amber)",
                resume.status === "failed" && "text-red-600"
              )}
            >
              {STATUS_LABEL[resume.status] ?? resume.status}
            </span>

            <button
              type="button"
              onClick={() => handleOpen(resume.file_path, resume.id)}
              disabled={downloadingId === resume.id}
              title="Download resume"
              className="flex size-7 items-center justify-center rounded-sm text-(--jobo-muted) transition-colors hover:bg-white hover:text-(--jobo-ink)"
            > {/* means link is generating when generated make it null again* */}
              {downloadingId === resume.id ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Download className="size-3.5" strokeWidth={1.75} />
              )}
            </button>

            <button
              type="button"
              onClick={() => handleDelete(resume)}
              disabled={isPending && deletingId === resume.id}
              title="Delete resume"
              className="flex size-7 items-center justify-center rounded-sm text-(--jobo-muted) transition-colors hover:bg-red-50 hover:text-red-600"
            >
              {isPending && deletingId === resume.id ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Trash2 className="size-3.5" strokeWidth={1.75} />
              )}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}