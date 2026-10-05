"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Bookmark, BookmarkCheck, ExternalLink, Building2, CheckCircle2 } from "lucide-react";
import { toggleSaveJob, markJobApplied } from "@/app/dashboard/jobs/action";
import { JOB_PLATFORMS, type JobRow } from "@/lib/jobs/types";
import { PLATFORM_ACCENT, matchScoreColor } from "@/lib/jobs/colors";
import { cn } from "@/lib/utils";

function formatRelativeTime(dateString: string | null): string | null {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return null;
  const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Posted today";
  if (days === 1) return "Posted 1 day ago";
  if (days < 30) return `Posted ${days} days ago`;
  const months = Math.floor(days / 30);
  return months < 12 ? `Posted ${months} mo ago` : `Posted ${Math.floor(months / 12)} yr ago`;
}

export function JobCard({ job }: { job: JobRow }) {
  const [saved, setSaved] = useState(job.saved_status);
  const [logoFailed, setLogoFailed] = useState(false);
  const [isPending, startTransition] = useTransition();
  const platformLabel = JOB_PLATFORMS.find((p) => p.id === job.platform)?.label ?? job.platform;
  const postedLabel = formatRelativeTime(job.posted_at);

  function handleSaveToggle() {
    const next = !saved;
    setSaved(next);
    startTransition(async () => {
      const result = await toggleSaveJob(job.id, next);
      if (result?.error) {
        setSaved(!next);
        toast.error(result.error);
      }
    });
  }

  function handleApply() {
    window.open(job.job_url, "_blank", "noopener,noreferrer");
    startTransition(() => {
      markJobApplied(job.id).catch(() => {});
    });
  }

  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-3 rounded-sm border bg-white/60 p-4 sm:flex-row sm:items-start sm:justify-between",
        job.applied_status
          ? "border-y-[var(--jobo-line)] border-r-[var(--jobo-line)] border-l-[3px] border-l-[var(--jobo-accent)]"
          : "border-[var(--jobo-line)]"
      )}
    >
      <div className="flex min-w-0 flex-1 gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-[var(--jobo-line)] bg-[var(--jobo-surface)]">
          {job.company_logo && !logoFailed ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={job.company_logo}
              alt=""
              className="size-full object-contain p-1"
              onError={() => setLogoFailed(true)}
            />
          ) : (
            <Building2 className="size-4 text-[var(--jobo-muted)]" strokeWidth={1.75} />
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-[14px] text-[var(--jobo-ink)]">{job.title}</p>
            <span
              className="rounded-sm border px-1.5 py-0.5 text-[10.5px] tracking-wide"
              style={{ borderColor: PLATFORM_ACCENT[job.platform], color: PLATFORM_ACCENT[job.platform] }}
            >
              {platformLabel}
            </span>
            {job.applied_status && (
              <span className="flex items-center gap-1 rounded-sm bg-[var(--jobo-accent)]/10 px-1.5 py-0.5 text-[10.5px] text-[var(--jobo-accent)]">
                <CheckCircle2 className="size-2.5" strokeWidth={2} />
                Applied
              </span>
            )}
          </div>
          <p className="truncate text-[12.5px] text-[var(--jobo-muted)]">
            {[job.company, job.location].filter(Boolean).join(" · ") || "Details unavailable"}
            {postedLabel && ` · ${postedLabel}`}
          </p>

          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[var(--jobo-muted)]">
            {job.job_type && <Badge>{job.job_type}</Badge>}
            {job.experience_level && <Badge>{job.experience_level}</Badge>}
            {job.salary && <Badge>{job.salary}</Badge>}
            {job.tags.slice(0, 4).map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <div className="h-1 w-28 overflow-hidden rounded-full bg-[var(--jobo-line)]">
              <div
                className="h-full rounded-full"
                style={{ width: `${job.match_score}%`, backgroundColor: matchScoreColor(job.match_score) }}
              />
            </div>
            <span className="text-[11px]" style={{ color: matchScoreColor(job.match_score) }}>
              {job.match_score}% match
            </span>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-stretch">
        <button
          type="button"
          onClick={handleApply}
          className={cn(
            "flex h-8 items-center justify-center gap-1.5 rounded-sm border px-3 text-[12px] transition-colors",
            job.applied_status
              ? "border-[var(--jobo-accent)] bg-[var(--jobo-accent)]/10 text-[var(--jobo-accent)] hover:bg-[var(--jobo-accent)]/15"
              : "border-[var(--jobo-ink)] bg-[var(--jobo-ink)] text-white hover:bg-[var(--jobo-ink)]/90"
          )}
        >
          {job.applied_status ? <CheckCircle2 className="size-3.5" strokeWidth={1.75} /> : null}
          {job.applied_status ? "Applied" : "Apply now"}
          {!job.applied_status && <ExternalLink className="size-3" strokeWidth={2} />}
        </button>
        <button
          type="button"
          onClick={handleSaveToggle}
          disabled={isPending}
          className={cn(
            "flex h-8 items-center justify-center gap-1.5 rounded-sm border px-3 text-[12px] transition-colors",
            saved
              ? "border-[var(--jobo-accent)] text-[var(--jobo-accent)]"
              : "border-[var(--jobo-line)] text-[var(--jobo-muted)] hover:bg-white"
          )}
        >
          {saved ? <BookmarkCheck className="size-3.5" strokeWidth={1.75} /> : <Bookmark className="size-3.5" strokeWidth={1.75} />}
          {saved ? "Saved" : "Save"}
        </button>
      </div>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="rounded-sm bg-[var(--jobo-surface)] px-1.5 py-0.5">{children}</span>;
}