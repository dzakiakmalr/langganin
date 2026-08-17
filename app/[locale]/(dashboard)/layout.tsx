import { setRequestLocale } from "next-intl/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { SidebarProvider } from "@/components/layout/sidebar-context";
import { SubscriptionsProvider } from "@/components/subscriptions/SubscriptionsProvider";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { createClient } from "@/lib/supabase/server";
import { DEMO_COOKIE, DEMO_COOKIE_VALUE } from "@/lib/demo";

export default async function DashboardLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Defense-in-depth: the proxy already redirects unauthenticated users, but
  // re-check the session here so /dashboard is never rendered without a user.
  // Demo mode (temporary) also passes via a cookie set by the landing page.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const cookieStore = await cookies();
  const isDemo = cookieStore.get(DEMO_COOKIE)?.value === DEMO_COOKIE_VALUE;

  if (!user && !isDemo) {
    redirect(locale === "en" ? "/en/login" : "/login");
  }

  return (
    <SidebarProvider>
      <SubscriptionsProvider>
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="relative z-10 flex min-w-0 flex-1 flex-col bg-page">
            <Topbar />
            <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
          </div>
        </div>
      </SubscriptionsProvider>
    </SidebarProvider>
  );
}
