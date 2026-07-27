import { Bricolage_Grotesque, Plus_Jakarta_Sans } from "next/font/google";

// Shared by the two root layouts: app/[locale]/layout.tsx (localized pages)
// and app/health/layout.tsx (unlocalized health check).
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

export const fontVariables = `${bricolage.variable} ${jakarta.variable}`;
