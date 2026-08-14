import createMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Localize everything except API routes, the health check, and static assets.
  matcher: ["/((?!api|health|_next|_vercel|.*\\..*).*)"],
};
