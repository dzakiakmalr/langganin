import type { Metadata } from "next";

import { fontVariables } from "@/lib/fonts";
import "../globals.css";

export const metadata: Metadata = {
  title: "Health — Langganin",
};

/**
 * Root layout for the unlocalized health check (app/health/page.tsx stays
 * outside app/[locale]/ on purpose — no translation needed there).
 */
export default function HealthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={fontVariables}>
      <body className="bg-bg font-sans text-text antialiased">{children}</body>
    </html>
  );
}
