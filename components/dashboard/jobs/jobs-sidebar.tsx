"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Bookmark, Send, X } from "lucide-react";
import { dismissActivity } from "@/app/dashboard/jobs/action";
import type { JobRow } from "@/lib/jobs/types";

export function JobsSidebar({
  completeness,
  recentActivity,
}: {
  completeness: number;
  recentActivity: JobRow[];
}) {
  const [activity, setActivity] = useState(recentActivity);
  const [isPending, startTransition] = useTransition();

  function handleDismiss(jobId: string) {
    setActivity((prev) => prev.filter((j) => j.id !== jobId));
    startTransition(async () => {
      const result = await dismissActivity(jobId);
      if (result?.error) {
        toast.error(result.error);
        setActivity(recentActivity);
      }
    });
  }

  return (
    <div className="min-w-0 space-y-6">
      <div className="rounded-sm border border-[var(--jobo-line)] bg-white/60 p-5">
        <h2 className="mb-3 font-[family-name:var(--font-jobo-display)] text-[15px] tracking-[-0.02em] text-[var(--jobo-ink)]">
          Profile completeness
        </h2>
        <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--jobo-line)]">
          <div className="h-full rounded-full bg-[var(--jobo-amber)] transition-[width]" style={{ width: `${completeness}%` }} />
        </div>
        <p className="text-[12px] text-[var(--jobo-muted)]">{completeness}% complete</p>
        {completeness < 100 && (
          <a href="/dashboard/profile" className="mt-2 inline-block text-[11.5px] text-[var(--jobo-accent)] underline-offset-2 hover:underline">
            Finish your profile →
          </a>
        )}
      </div>

      <div className="rounded-sm border border-[var(--jobo-line)] bg-white/60 p-5">
        <h2 className="mb-3 font-[family-name:var(--font-jobo-display)] text-[15px] tracking-[-0.02em] text-[var(--jobo-ink)]">
          Recent activity
        </h2>
        {activity.length === 0 ? (
          <p className="text-[12.5px] text-[var(--jobo-muted)]">
            Nothing yet — save or apply to a role and it&apos;ll show up here.
          </p>
        ) : (
          <ul className="space-y-1">
            {activity.map((job) => (
              <li
                key={job.id}
                className="group flex min-w-0 items-start gap-2 rounded-sm px-1.5 py-1.5 text-[12.5px] transition-colors hover:bg-[var(--jobo-surface)]"
              >
                {job.applied_status ? (
                  <Send className="mt-0.5 size-3.5 shrink-0 text-[var(--jobo-accent)]" strokeWidth={1.75} />
                ) : (
                  <Bookmark className="mt-0.5 size-3.5 shrink-0 text-[var(--jobo-amber)]" strokeWidth={1.75} />
                )}
                <span className="min-w-0 flex-1 break-words text-[var(--jobo-ink)]">
                  {job.applied_status ? "Applied to" : "Saved"}{" "}
                  <span className="text-[var(--jobo-muted)]">
                    {job.title}
                    {job.company ? ` at ${job.company}` : ""}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => handleDismiss(job.id)}
                  disabled={isPending}
                  title="Remove from recent activity"
                  className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full text-[var(--jobo-muted)] opacity-0 transition-colors group-hover:opacity-100 hover:bg-red-100 hover:text-red-600"
                >
                  <X className="size-3" strokeWidth={2} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}