"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export function JobPagination({
  page,
  totalItems,
  pageSize,
  onPageChange,
}: {
  page: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  if (totalItems === 0) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-[var(--jobo-line)] bg-white/60 px-4 py-3">
      <p className="text-[12px] text-[var(--jobo-muted)]">
        Showing <span className="text-[var(--jobo-ink)]">{start}–{end}</span> of{" "}
        <span className="text-[var(--jobo-ink)]">{totalItems}</span> roles
      </p>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="flex size-7 items-center justify-center rounded-sm border border-[var(--jobo-line)] text-[var(--jobo-ink)] transition-colors hover:bg-white disabled:opacity-40"
        >
          <ChevronLeft className="size-3.5" strokeWidth={1.75} />
        </button>
        <span className="px-2 text-[12px] text-[var(--jobo-muted)]">
          Page <span className="font-medium" style={{ color: "var(--jobo-amber)" }}>{page}</span> of {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="flex size-7 items-center justify-center rounded-sm border border-[var(--jobo-line)] text-[var(--jobo-ink)] transition-colors hover:bg-white disabled:opacity-40"
        >
          <ChevronRight className="size-3.5" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}