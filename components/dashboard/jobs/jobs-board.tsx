"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import { refreshJobs } from "@/app/dashboard/jobs/action";
import { JOB_PLATFORMS, type JobPlatform, type JobRow } from "@/lib/jobs/types";
import { PlatformSelector } from "./platform-selector";
import { JobList } from "./job-list";
import { JobsSidebar } from "./jobs-sidebar";
import { JobPagination } from "./jobs-pagination";

const PAGE_SIZE = 8;

export function JobsBoard({
  displayName,
  jobs,
  refreshedAt,
  fetchError,
  completeness,
  recentActivity,
}: {
  displayName?: string | null;
  jobs: JobRow[];
  refreshedAt: string | null;
  fetchError: string | null;
  completeness: number;
  recentActivity: JobRow[];
}) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<JobPlatform[]>(
    JOB_PLATFORMS.map((p) => p.id)
  );
  const [isPending, startTransition] = useTransition();
  const [page, setPage] = useState(1);

  // Reset to page 1 whenever the platform selection changes — done during
  // render (React's recommended pattern), not in a useEffect, so this
  // never triggers an extra effect-driven render pass.
  const platformsKey = useMemo(() => [...selectedPlatforms].sort().join(","), [selectedPlatforms]);
  const [prevPlatformsKey, setPrevPlatformsKey] = useState(platformsKey);
  if (platformsKey !== prevPlatformsKey) {
    setPrevPlatformsKey(platformsKey);
    setPage(1);
  }

  const filteredJobs = useMemo(
    () => jobs.filter((job) => selectedPlatforms.includes(job.platform)),
    [jobs, selectedPlatforms]
  );

  // Clamp separately from the reset above, so a shrinking result set
  // (e.g. after a refresh) never leaves `page` pointing past the end.
  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(page, 1), totalPages);

  const pagedJobs = useMemo(
    () => filteredJobs.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filteredJobs, safePage]
  );

  function togglePlatform(platform: JobPlatform) {
    setSelectedPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
    );
  }

  function handleRefresh() {
    if (selectedPlatforms.length === 0) {
      toast.error("Select at least one platform first.");
      return;
    }
    startTransition(async () => {
      const result = await refreshJobs(selectedPlatforms);
      if (result?.error) toast.error(result.error);
      else toast.success(result?.message ?? "Jobs refreshed.");
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div className="min-w-0 space-y-6">
        <div className="rounded-sm border border-[var(--jobo-line)] bg-white/60 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] tracking-[0.14em] text-[var(--jobo-muted)] uppercase">Jobs</p>
              <h1 className="font-[family-name:var(--font-jobo-display)] text-[26px] tracking-[-0.03em] text-[var(--jobo-ink)]">
                {displayName ? `Good to see you, ${displayName.split(" ")[0]}.` : "Your job matches"}
              </h1>
              <p className="mt-1 text-[13px] text-[var(--jobo-muted)]">
                {refreshedAt ? `Last updated ${new Date(refreshedAt).toLocaleString()}` : "No jobs fetched yet."}
              </p>
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isPending}
              className="flex h-9 items-center gap-2 rounded-sm border border-[var(--jobo-line)] bg-white px-3.5 text-[12.5px] text-[var(--jobo-ink)] transition-colors hover:bg-[var(--jobo-surface)] disabled:opacity-60"
            >
              <RefreshCw className={`size-3.5 ${isPending ? "animate-spin" : ""}`} strokeWidth={1.75} />
              {isPending ? "Refreshing…" : "Refresh jobs"}
            </button>
          </div>
        </div>

        <PlatformSelector selected={selectedPlatforms} onToggle={togglePlatform} />

        {fetchError && (
          <div className="rounded-sm border border-amber-300 bg-amber-50 px-4 py-3 text-[13px] text-amber-800">
            {fetchError}
          </div>
        )}

        <JobList jobs={pagedJobs} isRefreshing={isPending} noPlatformSelected={selectedPlatforms.length === 0} />

        {!isPending && filteredJobs.length > 0 && (
          <JobPagination page={safePage} totalItems={filteredJobs.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
        )}
      </div>

      <JobsSidebar completeness={completeness} recentActivity={recentActivity} />
    </div>
  );
}