import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client untuk browser (Client Components).
 *
 * Hanya memakai env var `NEXT_PUBLIC_*` (anon key) yang aman diekspos.
 * Akses data dibatasi Row-Level Security — service role key TIDAK boleh
 * dipakai di sini.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
