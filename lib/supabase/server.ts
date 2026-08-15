import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase client untuk server (Server Components, Server Actions,
 * Route Handlers).
 *
 * Membaca session pengguna dari cookie dan mengirim cookie hasil refresh
 * kembali ke browser. Belum dipakai sampai auth di-wire (Phase 1).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Dipanggil dari Server Component — aman diabaikan bila session
            // di-refresh oleh middleware (akan ditambah saat auth di-wire).
          }
        },
      },
    },
  );
}
