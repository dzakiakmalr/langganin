import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Daftar",
};

export default function RegisterPage() {
  return (
    <section>
      <h1 className="font-display text-3xl font-bold">Daftar</h1>
      <p className="mt-3 text-text-muted">
        Form registrasi Supabase Auth akan ada di halaman ini — akun baru
        sekaligus menyiapkan kategori default untuk pengguna pertama kali.
      </p>
      <p className="mt-6 text-sm text-text-muted">
        Sudah punya akun?{" "}
        <Link
          href="/login"
          className="font-medium text-primary underline underline-offset-4 hover:text-primary-hover"
        >
          Masuk
        </Link>
      </p>
    </section>
  );
}
