import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";


//// Page metadata for seo
export const metadata: Metadata = {
  title: "Sign in · JOBO",
  description: "Sign in to your JOBO job-hunting agent.",
};

type SearchParams = Promise<{ next?: string; error?: string; mode?: string }>; // /login?next=/dashboard&mode=signup url eg

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams; 
}) {
  const params = await searchParams; //get url query params
  const next = params.next?.startsWith("/") ? params.next : "/dashboard"; //after login
  const mode = params.mode === "signup" ? "signup" : "signin";

  return (
    <div className="jobo-auth relative flex h-svh flex-1 overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 jobo-auth-grid opacity-[0.35]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-105 w-180 -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(201,122,46,0.10),transparent_65%)]"
      />

      {/* Left: form column. Fixed height, everything sized to fit without scroll. */}
      <section className="relative z-10 flex h-svh w-full flex-col justify-center gap-8 overflow-y-auto px-6 py-6 sm:justify-between md:w-[46%] md:px-12 lg:px-16">
        <p className="font-(family-name:--font-jobo-display) text-[24px] tracking-[-0.04em] text-(--jobo-ink) md:text-[28px]">
          JOBO
        </p>

        <div className="flex flex-col gap-6">
          <div className="max-w-sm space-y-2.5">
            <h1 className="font-(family-name:--font-jobo-display) text-[28px] leading-[1.1] tracking-[-0.03em] text-(--jobo-ink) font-normal md:text-[34px]">
              Apply while you focus on what matters.
            </h1>
            <p className="max-w-[32ch] text-[13.5px] leading-relaxed text-(--jobo-muted)">
              Your quiet agent for searching roles and sending applications —
              calm, precise, always on.
            </p>
          </div>

          <AuthForm mode={mode} next={next} errorFromUrl={params.error} />
        </div>

        <span className="hidden sm:block" aria-hidden />
      </section>

      {/* Right: decorative panel, hidden below md so the form always fits the viewport */}
      <aside className="relative hidden min-h-svh flex-1 md:block">
        <div className="absolute inset-0 bg-[linear-gradient(155deg,#e8efe9_0%,#d7e4df_38%,#c5d5d8_72%,#b8c7c4_100%)]" />
        <div
          aria-hidden
          className="absolute inset-0 opacity-40 mix-blend-multiply jobo-auth-grid"
        />
        <div className="absolute inset-0 flex flex-col justify-end p-12 lg:p-16">
          <div className="max-w-md space-y-4">
            <p className="font-(family-name:--font-jobo-display) text-[44px] leading-none tracking-[-0.04em] text-(--jobo-ink)/90 lg:text-[52px]">
              JOBO
            </p>
            <p className="text-[14px] leading-relaxed text-(--jobo-ink)/65">
              Match the right roles. Draft applications. Track every submission — so you can focus on landing interviews.
            </p>
            <ul className="mt-6 space-y-2.5 text-[13px] text-(--jobo-ink)/55">
              <li className="flex items-center gap-2.5">
                <span className="size-1.5 shrink-0 rounded-full bg-(--jobo-amber)" />
                Smart role matching based on your profile
              </li>
              <li className="flex items-center gap-2.5">
                <span className="size-1.5 shrink-0 rounded-full bg-(--jobo-amber)" />
               Personalized application drafts
              </li>
              <li className="flex items-center gap-2.5">
                <span className="size-1.5 shrink-0 rounded-full bg-(--jobo-amber)" />
             Complete application tracking and status history
              </li>
            </ul>
          </div>
        </div>
      </aside>
    </div>
  );
}