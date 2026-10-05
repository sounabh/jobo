"use client";

import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { JOB_PLATFORMS, type JobPlatform } from "@/lib/jobs/types";
import { PLATFORM_ACCENT } from "@/lib/jobs/colors";

export function PlatformSelector({
  selected,
  onToggle,
}: {
  selected: JobPlatform[];
  onToggle: (platform: JobPlatform) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {JOB_PLATFORMS.map((platform) => {
        const isActive = selected.includes(platform.id);
        return (
          <button
            key={platform.id}
            type="button"
            onClick={() => onToggle(platform.id)}
            aria-pressed={isActive}
            style={isActive ? { borderColor: PLATFORM_ACCENT[platform.id] } : undefined}
            className={cn(
              "flex flex-col items-center gap-2 rounded-sm border-2 px-3 py-4 text-center transition-colors",
              isActive
                ? "bg-white text-[var(--jobo-ink)]"
                : "border-[var(--jobo-line)] bg-white/60 text-[var(--jobo-muted)] hover:bg-white"
            )}
          >
            <Building2
              className="size-4"
              strokeWidth={1.75}
              style={isActive ? { color: PLATFORM_ACCENT[platform.id] } : undefined}
            />
            <span className="text-[12.5px] tracking-wide">{platform.label}</span>
          </button>
        );
      })}
    </div>
  );
}