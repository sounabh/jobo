/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  FileText,
  User,
  ListChecks,
  PanelLeft,
  PanelLeftClose,
  Zap,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard/jobs", label: "Jobs", icon: Briefcase },
  { href: "/dashboard/resume", label: "Resume", icon: FileText },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/applications", label: "Application status", icon: ListChecks },
] as const;

const STORAGE_KEY = "jobo:sidebar-collapsed";

export function DashboardSidebar({
  userName,
  credits = 0,
  creditsLimit = 100,
}: {
  userName?: string;
  credits?: number;
  creditsLimit?: number;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setCollapsed(stored === "1");
    } catch {
      // localStorage unavailable — fall back to expanded, no big deal.
    }
    setHydrated(true);
  }, []);

  function toggle() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        // ignore write failures (private browsing, etc.)
      }
      return next;
    });
  }

  const pct =
    creditsLimit > 0 ? Math.min(100, Math.round((credits / creditsLimit) * 100)) : 0;

  return (
    <aside
      className={cn(
        "sticky top-0 flex h-svh shrink-0 flex-col border-r border-(--jobo-line) bg-(--jobo-surface)/70 backdrop-blur-sm",
        hydrated && "transition-[width] duration-200 ease-out",
        collapsed ? "w-16" : "w-59"
      )}
    >
      {/* Logo + app name */}
      <div
        className={cn(
          "flex h-14 items-center gap-2.5 border-b border-(--jobo-line) px-4",
          collapsed && "justify-center px-0"
        )}
      >
        <div className="flex size-7 shrink-0 items-center justify-center rounded-sm bg-(--jobo-ink) font-(family-name:--font-jobo-display) text-[14px] text-white">
          J
        </div>
        {!collapsed && (
          <span className="font-(family-name:--font-jobo-display) text-[16px] tracking-[-0.03em] text-(--jobo-ink)">
            JOBO
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5 px-2.5 py-4">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "group relative flex items-center gap-2.5 rounded-sm px-2.5 py-2 text-[13px] tracking-wide transition-colors",
                collapsed && "justify-center px-0",
                active
                  ? "bg-(--jobo-ink) text-white"
                  : "text-(--jobo-muted) hover:bg-white/60 hover:text-(--jobo-ink)"
              )}
            >
              <Icon className="size-3.75 shrink-0" strokeWidth={1.75} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        type="button"
        onClick={toggle}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className={cn(
          "mx-2.5 mb-2 flex items-center gap-2 rounded-sm px-2.5 py-2 text-[12px] text-(--jobo-muted) transition-colors hover:bg-white/60 hover:text-(--jobo-ink)",
          collapsed && "justify-center px-0"
        )}
      >
        {collapsed ? (
          <PanelLeft className="size-3.75" strokeWidth={1.75} />
        ) : (
          <PanelLeftClose className="size-3.75" strokeWidth={1.75} />
        )}
        {!collapsed && <span>Collapse</span>}
      </button>

      {/* Footer: credits + profile settings */}
      <div className={cn("border-t border-(--jobo-line) px-3 py-3.5", collapsed && "px-2")}>
        {!collapsed ? (
          <div className="mb-2.5 rounded-sm border border-(--jobo-line) bg-white/60 px-3 py-2.5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[11px] text-(--jobo-muted)">
                <Zap className="size-3 text-(--jobo-amber)" strokeWidth={2} />
                Credits
              </span>
              <span className="text-[12px] text-(--jobo-ink)">
                {credits}/{creditsLimit}
              </span>
            </div>
            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-(--jobo-line)">
              <div
                className="h-full rounded-full bg-(--jobo-amber) transition-[width]"
                style={{ width: `${pct}%` }}
              />
            </div>
            <Link
              href="/dashboard/billing"
              className="mt-2 inline-block text-[11px] text-(--jobo-accent) underline-offset-2 hover:underline"
            >
              Manage billing
            </Link>
          </div>
        ) : (
          <Link
            href="/dashboard/billing"
            title={`Credits: ${credits}/${creditsLimit}`}
            className="mb-2.5 flex items-center justify-center rounded-sm border border-(--jobo-line) bg-white/60 py-2 text-(--jobo-amber) hover:bg-white"
          >
            <Zap className="size-3.75" strokeWidth={2} />
          </Link>
        )}

        <Link
          href="/dashboard/profile/settings"
          title={collapsed ? "Profile & settings" : undefined}
          className={cn(
            "flex items-center gap-2.5 rounded-sm px-2.5 py-2 text-[13px] text-(--jobo-muted) transition-colors hover:bg-white/60 hover:text-(--jobo-ink)",
            collapsed && "justify-center px-0"
          )}
        >
          <Settings className="size-3.75 shrink-0" strokeWidth={1.75} />
          {!collapsed && <span>{userName ? `${userName.split(" ")[0]}'s settings` : "Settings"}</span>}
        </Link>
      </div>
    </aside>
  );
}