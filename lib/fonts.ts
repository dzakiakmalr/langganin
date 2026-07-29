import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";

// Shared by the two root layouts: app/[locale]/layout.tsx (localized pages)
// and app/health/layout.tsx (unlocalized health check).
const space = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

export const fontVariables = `${space.variable} ${jakarta.variable}`;
