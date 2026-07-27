import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <div className="w-full max-w-2xl text-center">
        <h1 className="font-display text-4xl font-bold sm:text-5xl">
          Langganin
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-text-muted">
          Landing page publik akan ada di sini — tempatmu mengenal cara
          Langganin melacak langganan & free trial, mengingatkan sebelum
          perpanjangan otomatis, dan merangkum pengeluaran bulananmu.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/login"
            className="rounded-pill bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            Masuk
          </Link>
          <Link
            href="/register"
            className="rounded-pill bg-clay-surface px-6 py-2.5 text-sm font-semibold text-text transition-colors hover:bg-primary-tint"
          >
            Daftar
          </Link>
        </div>
        <p className="mt-8 text-sm text-text-muted">
          <Link href="/dashboard" className="underline underline-offset-4 hover:text-primary">
            Lihat dasbor (placeholder)
          </Link>
        </p>
      </div>
    </main>
  );
}
