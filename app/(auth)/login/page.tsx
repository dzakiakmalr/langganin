import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Masuk",
};

export default function LoginPage() {
  return (
    <section>
      <h1 className="font-display text-3xl font-bold">Masuk</h1>
      <p className="mt-3 text-text-muted">
        Form login Supabase Auth (email &amp; password, plus Google OAuth) akan
        ada di halaman ini.
      </p>
      <p className="mt-6 text-sm text-text-muted">
        Belum punya akun?{" "}
        <Link
          href="/register"
          className="font-medium text-primary underline underline-offset-4 hover:text-primary-hover"
        >
          Daftar
      </Link>
      </p>
    </section>
  );
}
