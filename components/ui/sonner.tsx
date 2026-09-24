"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

/**
 * Toast host for the app. Styled to match the jobo-auth palette rather than
 * shadcn's default theme, since we don't use next-themes here.
 * Mount once in the root layout: <Toaster />
 */
export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      position="top-right"
      expand={false}
      closeButton
      toastOptions={{
        duration: 4500,
        classNames: {
          toast:
            "!rounded-sm !border !border-[var(--jobo-line)] !bg-white !text-[13px] !text-[var(--jobo-ink)] !shadow-md !font-[family-name:var(--font-jobo-sans)]",
          title: "!text-[var(--jobo-ink)] !font-medium",
          description: "!text-[var(--jobo-muted)]",
          success: "!border-l-[3px] !border-l-[var(--jobo-accent)]",
          error: "!border-l-[3px] !border-l-red-500",
          closeButton:
            "!border-[var(--jobo-line)] !bg-white !text-[var(--jobo-muted)]",
        },
      }}
      {...props}
    />
  );
}