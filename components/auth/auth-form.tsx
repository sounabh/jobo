"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import {
  signInWithEmail,
  signInWithGitHub,
  signUpWithEmail,
  type AuthState,
} from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Mode = "signin" | "signup";

const initialState: AuthState = {}; //before submitting the form initial state

export function AuthForm({
  mode: initialMode = "signin",
  next = "/dashboard",
  errorFromUrl,
}: {
  mode?: Mode;
  next?: string;
  errorFromUrl?: string;
}) {
  const [mode, setMode] = useState<Mode>(initialMode);

  const action = mode === "signin" ? signInWithEmail : signUpWithEmail;

  const [state, formAction, pending] = useActionState(action, initialState);

  // Toast any error handed back from an OAuth redirect (GitHub, etc).
  useEffect(() => {
    if (errorFromUrl) {
      toast.error(decodeURIComponent(errorFromUrl));
    }
    // Only on mount — this is a one-time redirect result.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Toast the result of every email/password submit, success or error based on pending true or false
  const wasPending = useRef(false);
  useEffect(() => {
    if (wasPending.current && !pending) {
      if (state.error) {
        toast.error(state.error);
      } else if (state.message) {
        toast.success(state.message);
      }
    }
    wasPending.current = pending;
  }, [pending, state]);

  return (
    <div className="flex w-full max-w-90 flex-col gap-6">
      <div className="flex gap-1 border-b border-(--jobo-line)">
        <button
          type="button"
          onClick={() => setMode("signin")}
          className={cn(
            "relative -mb-px px-1 pb-2.5 text-[13px] tracking-wide transition-colors",
            mode === "signin"
              ? "text-(--jobo-ink) after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-(--jobo-ink)"
              : "text-(--jobo-muted) hover:text-(--jobo-ink)"
          )}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={cn(
            "relative -mb-px px-1 pb-2.5 text-[13px] tracking-wide transition-colors",
            mode === "signup"
              ? "text-(--jobo-ink) after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-(--jobo-ink)"
              : "text-(--jobo-muted) hover:text-(--jobo-ink)"
          )}
        >
          Create account
        </button>
      </div>

      <form action={formAction} className="flex flex-col gap-3.5">
        <input type="hidden" name="next" value={next} />

        {mode === "signup" ? (
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="full_name"
              className="text-[11px] font-normal tracking-[0.08em] text-(--jobo-muted) uppercase"
            >
              Full name
            </Label>
            <Input
              id="full_name"
              name="full_name"
              type="text"
              autoComplete="name"
              placeholder="Alex Rivera"
              className="h-9 rounded-sm border-(--jobo-line) bg-white/70 px-3 text-[13px] shadow-none"
            />
          </div>
        ) : null}

        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="email"
            className="text-[11px] font-normal tracking-[0.08em] text-(--jobo-muted) uppercase"
          >
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@company.com"
            className="h-9 rounded-sm border-(--jobo-line) bg-white/70 px-3 text-[13px] shadow-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="password"
            className="text-[11px] font-normal tracking-[0.08em] text-(--jobo-muted) uppercase"
          >
            Password
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete={
              mode === "signin" ? "current-password" : "new-password"
            }
            placeholder={mode === "signin" ? "••••••••" : "At least 8 characters"}
            minLength={mode === "signup" ? 8 : undefined}
            className="h-9 rounded-sm border-(--jobo-line) bg-white/70 px-3 text-[13px] shadow-none"
          />
        </div>

        <Button
          type="submit"
          disabled={pending}
          className="mt-1 h-9 w-full rounded-sm border border-(--jobo-ink) bg-(--jobo-ink) text-[13px] font-normal tracking-wide text-white shadow-none hover:bg-(--jobo-ink)/90"
        >
          {pending
            ? "Please wait…"
            : mode === "signin"
              ? "Continue"
              : "Create account"}
        </Button>
      </form>

      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-(--jobo-line)" />
        <span className="text-[11px] tracking-[0.12em] text-(--jobo-muted) uppercase">
          or
        </span>
        <span className="h-px flex-1 bg-(--jobo-line)" />
      </div>

      <form action={signInWithGitHub}>
        <input type="hidden" name="next" value={next} />
        <Button
          type="submit"
          variant="outline"
          className="h-9 w-full rounded-sm border-(--jobo-line) bg-transparent text-[13px] font-normal tracking-wide text-(--jobo-ink) shadow-none hover:bg-white/50"
        >
          <GitHubIcon className="size-3.5 opacity-70" />
          Continue with GitHub
        </Button>
      </form>

      <p className="text-[11.5px] leading-relaxed text-(--jobo-muted)">
        By continuing you agree to JOBO applying on your behalf with care and
        transparency.{" "}
        <Link href="/" className="text-(--jobo-ink) underline-offset-2 hover:underline">
          Learn more
        </Link>
      </p>
    </div>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}