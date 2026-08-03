import { setRequestLocale } from "next-intl/server";

import { SidebarProvider } from "@/components/sidebar-context";
import { SubscriptionsProvider } from "@/components/SubscriptionsProvider";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

export default async function DashboardLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  setRequestLocale(locale);

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
