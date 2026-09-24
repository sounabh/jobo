import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "JOBO — Your Job-Hunting Agent",
  description:
    "JOBO searches roles, drafts applications and apply them automatically, and helps you manage your job search.",
};

export default function Home() {
  return (
    <div className="jobo-auth relative flex min-h-svh flex-1 flex-col overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 jobo-auth-grid opacity-40"
      />
      <header className="relative z-10 flex items-center justify-between px-6 py-6 md:px-12">
        <p className="font-(family-name:--font-jobo-display) text-[24px] tracking-[-0.04em] text-(--jobo-ink)">
          JOBO
        </p>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="inline-flex h-8 items-center rounded-sm px-3 text-[12px] tracking-wide text-(--jobo-ink) transition-colors hover:bg-white/40"
          >
            Sign in
          </Link>
          <Link
            href="/login?mode=signup"
            className="inline-flex h-8 items-center rounded-sm border border-(--jobo-ink) bg-(--jobo-ink) px-3 text-[12px] tracking-wide text-white transition-colors hover:bg-(--jobo-ink)/90"
          >
            Get started
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-6 pb-24 md:px-12">
        <p className="font-(family-name:--font-jobo-display) text-[56px] leading-[0.95] tracking-[-0.045em] text-(--jobo-ink) md:text-[72px]">
          JOBO
        </p>
        <h1 className="mt-6 max-w-[18ch] text-[22px] font-normal leading-snug tracking-[-0.02em] text-(--jobo-ink) md:text-[28px]">
          A calm agent for searching roles and sending applications.
        </h1>
        <p className="mt-4 max-w-[36ch] text-[15px] leading-relaxed text-(--jobo-muted)">
          Sign in to open your dashboard and let JOBO handle the busywork of
          job hunting.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/login?mode=signup"
            className="inline-flex h-9 items-center rounded-sm border border-(--jobo-ink) bg-(--jobo-ink) px-4 text-[13px] tracking-wide text-white transition-colors hover:bg-(--jobo-ink)/90"
          >
            Create account
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex h-9 items-center rounded-sm border border-(--jobo-line) bg-transparent px-4 text-[13px] tracking-wide text-(--jobo-ink) transition-colors hover:bg-white/50"
          >
            Go to dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
