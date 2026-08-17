/**
 * Temporary "demo mode" — lets reviewers/assignments open the dashboard
 * without a real account. The landing page sets a cookie via `enterDemo()`,
 * and the auth guard (proxy + dashboard layout) treats that cookie as an
 * authenticated session.
 *
 * This is intentionally isolated here so it can be deleted in one place
 * when the real auth flow is finalized.
 */

/** Cookie name checked by the proxy middleware + dashboard layout. */
export const DEMO_COOKIE = "langganin_demo";

export const DEMO_COOKIE_VALUE = "1";

/** Set the demo cookie (client-side) and let the guard pass. */
export function enterDemo(): void {
  if (typeof document === "undefined") return;
  // 24h — enough for a review session, but self-expires so it never lingers.
  document.cookie = `${DEMO_COOKIE}=${DEMO_COOKIE_VALUE}; path=/; max-age=86400; SameSite=Lax`;
}

/** Remove the demo cookie (e.g. on logout). */
export function clearDemo(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${DEMO_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

/** Read the demo cookie (client-side). */
export function hasDemoCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie
    .split("; ")
    .some((c) => c.startsWith(`${DEMO_COOKIE}=${DEMO_COOKIE_VALUE}`));
}
