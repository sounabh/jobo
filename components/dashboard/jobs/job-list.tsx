import { SearchX } from "lucide-react";
import type { JobRow } from "@/lib/jobs/types";
import { JobCard } from "./job-card";
import { JobCardSkeleton } from "./job-card-skeleton";

export function JobList({
  jobs,
  isRefreshing,
  noPlatformSelected,
}: {
  jobs: JobRow[];
  isRefreshing: boolean;
  noPlatformSelected?: boolean;
}) {
  if (noPlatformSelected) {
    return (
      <div className="flex min-h-[35vh] flex-col items-center justify-center gap-2 rounded-sm border border-dashed border-[var(--jobo-line)] bg-white/40 text-center">
        <p className="text-[13.5px] text-[var(--jobo-ink)]">No platform selected</p>
        <p className="max-w-xs text-[12.5px] text-[var(--jobo-muted)]">
          Pick at least one platform above to see job matches.
        </p>
      </div>
    );
  }
  if (isRefreshing && jobs.length === 0) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <JobCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="flex min-h-[35vh] flex-col items-center justify-center gap-2 rounded-sm border border-dashed border-[var(--jobo-line)] bg-white/40 text-center">
        <SearchX className="size-5 text-[var(--jobo-muted)]" strokeWidth={1.5} />
        <p className="text-[13.5px] text-[var(--jobo-ink)]">No matching roles yet</p>
        <p className="max-w-xs text-[12.5px] text-[var(--jobo-muted)]">
          Select at least one platform and hit refresh, or fill out your profile so JOBO can match better roles.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}