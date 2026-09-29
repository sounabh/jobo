import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { ResumeOnboardingDialog } from "@/components/onboarding/resume-onboarding-dialog";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub as string | undefined;

  const { data: profile } = userId
    ? await supabase
        .from("profiles")
        .select("full_name, email, avatar_url")
        .eq("id", userId)
        .maybeSingle()
    : { data: null };

  const displayName =
    profile?.full_name ||
    profile?.email ||
    (claimsData?.claims?.email as string | undefined);

  const { count: resumeCount } = userId
    ? await supabase
        .from("resumes")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
    : { count: 0 };

  const needsOnboarding = !!userId && (resumeCount ?? 0) === 0;

  const credits = 0;
  const creditsLimit = 100;

  return (
    <div className="jobo-auth flex min-h-svh">
      {needsOnboarding && <ResumeOnboardingDialog />}

      <DashboardSidebar userName={displayName} credits={credits} creditsLimit={creditsLimit} />

      <div className="flex min-h-svh flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-(--jobo-line) px-6">
          <p className="text-[13px] text-(--jobo-muted)">
            {displayName ? `Signed in as ${displayName}` : "Signed in"}
          </p>
          <form action={signOut}>
            <Button
              type="submit"
              variant="outline"
              className="h-8 rounded-sm border-(--jobo-line) bg-transparent px-3 text-[12px] font-normal tracking-wide text-(--jobo-ink) shadow-none hover:bg-white/40"
            >
              Sign out
            </Button>
          </form>
        </header>

        <main className="flex-1 px-6 py-8 md:px-10">{children}</main>
      </div>
    </div>
  );
}