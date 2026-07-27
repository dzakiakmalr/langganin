import type { Metadata } from "next";
import { Bricolage_Grotesque, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: {
    default: "Langganin",
    template: "%s — Langganin",
  },
  description:
    "Langganin membantumu melacak langganan & free trial, mengingatkan sebelum perpanjangan otomatis, dan merangkum pengeluaran bulananmu.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${bricolage.variable} ${jakarta.variable}`}>
      <body className="bg-bg font-sans text-text antialiased">{children}</body>
    </html>
  );
}
