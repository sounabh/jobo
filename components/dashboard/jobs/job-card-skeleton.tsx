export function JobCardSkeleton() {
  return (
    <div className="animate-pulse rounded-sm border border-[var(--jobo-line)] bg-white/60 p-4">
      <div className="flex items-start gap-3">
        <div className="size-10 shrink-0 rounded-sm bg-[var(--jobo-line)]" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 w-1/3 rounded-sm bg-[var(--jobo-line)]" />
          <div className="h-3 w-1/4 rounded-sm bg-[var(--jobo-line)]" />
          <div className="h-3 w-2/3 rounded-sm bg-[var(--jobo-line)]" />
        </div>
        <div className="h-8 w-20 rounded-sm bg-[var(--jobo-line)]" />
      </div>
    </div>
  );
}