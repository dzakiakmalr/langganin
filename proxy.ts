import { createServerClient } from "@supabase/ssr";
import createIntlMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";

import { routing } from "./i18n/routing";
import { DEMO_COOKIE, DEMO_COOKIE_VALUE } from "./lib/demo";

const intlMiddleware = createIntlMiddleware(routing);

// Locale-aware route guard. Indonesian is the prefix-free default, English
// uses "/en". Protected paths live under /dashboard (id) or /en/dashboard.
const PROTECTED_PREFIX = "/dashboard";

function isEnglish(pathname: string): boolean {
  return pathname === "/en" || pathname.startsWith("/en/");
}

function isProtected(pathname: string): boolean {
  const path = isEnglish(pathname) ? pathname.slice(3) : pathname;
  return path.startsWith(PROTECTED_PREFIX);
}

function loginPath(pathname: string): string {
  return isEnglish(pathname) ? "/en/login" : "/login";
}

export default async function middleware(request: NextRequest) {
  // 1. next-intl handles locale detection / prefixing.
  const response = await intlMiddleware(request);

  // 2. Refresh the Supabase session and write refreshed cookies to the response.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Temporary demo mode: a "view demo" button on the landing page sets a
  // cookie so reviewers can explore the dashboard without a real account.
  const isDemo =
    request.cookies.get(DEMO_COOKIE)?.value === DEMO_COOKIE_VALUE;

  // 3. Redirect unauthenticated users away from protected routes.
  if (!user && !isDemo && isProtected(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = loginPath(request.nextUrl.pathname);
    url.search = "";
    const redirect = NextResponse.redirect(url);
    // Preserve cookies next-intl / Supabase set on the response (locale
    // preference + any cleared session cookies).
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    return redirect;
  }

  return response;
}

export const config = {
  // Localize + protect everything except API routes, the health check, the
  // email-confirmation handler, and static assets.
  matcher: ["/((?!api|health|auth|_next|_vercel|.*\\..*).*)"],
};
