import type { Metadata } from "next";
import { Manrope, Syne } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-jobo-sans",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-jobo-display",
});

export const metadata: Metadata = {
  title: "JOBO — Job hunting agent",
  description:
    "JOBO quietly searches roles and applies for you — so you can focus on interviews.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full antialiased",
        manrope.variable,
        syne.variable,
        "font-(family-name:--font-jobo-sans)"
      )}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}