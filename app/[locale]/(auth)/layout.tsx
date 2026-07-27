import type { Locale } from "next-intl";
import { setRequestLocale } from "next-intl/server";

export default async function AuthLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="grid min-h-screen place-items-center p-6">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
