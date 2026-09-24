import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard · JOBO",
  description: "Your JOBO job-hunting agent dashboard.",
};

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-[11px] tracking-[0.14em] text-(--jobo-muted) uppercase">
          Dashboard
        </p>
        <h1 className="font-(family-name:--font-jobo-display) text-[32px] font-normal tracking-[-0.03em] text-(--jobo-ink) md:text-[36px]">
          Welcome back.
        </h1>
        <p className="max-w-md text-[14px] leading-relaxed text-(--jobo-muted)">
          Your agent is ready. Role matching and application flows will live
          here next.
        </p>
      </div>

      <div className="grid gap-px border border-(--jobo-line) bg-(--jobo-line) sm:grid-cols-3">
        {[
          { label: "Open roles", value: "—" },
          { label: "Drafts", value: "—" },
          { label: "Sent", value: "—" },
        ].map((item) => (
          <div key={item.label} className="bg-(--jobo-surface) px-5 py-6">
            <p className="text-[11px] tracking-widest text-(--jobo-muted) uppercase">
              {item.label}
            </p>
            <p className="mt-3 font-(family-name:--font-jobo-display) text-[28px] tracking-[-0.03em] text-(--jobo-ink)">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}