import type { Metadata } from "next";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Health",
};

type HealthResponse = {
  status: string;
  timestamp: string;
};

async function getHealth(): Promise<HealthResponse> {
  const headerList = await headers();
  const host = headerList.get("host") ?? "localhost:3000";
  const isLocal = host.includes("localhost") || host.includes("127.0.0.1");
  const protocol = isLocal ? "http" : "https";

  const res = await fetch(`${protocol}://${host}/api/health`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Health check request failed: ${res.status}`);
  }
  return res.json();
}

export default async function HealthPage() {
  const health = await getHealth();

  return (
    <main className="grid min-h-screen place-items-center p-6">
      <section className="w-full max-w-xl">
        <h1 className="font-display text-3xl font-bold">Health Check</h1>
        <p className="mt-3 text-text-muted">
          Data di bawah ini diambil secara live dari route handler{" "}
          <code className="rounded bg-clay-100 px-1.5 py-0.5 text-sm text-text">
            /api/health
          </code>{" "}
          pada setiap request — bukan string statis.
        </p>
        <dl className="mt-6 rounded-card bg-surface p-6 shadow-sm">
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-sm text-text-muted">Status</dt>
            <dd className="font-medium text-success">{health.status}</dd>
          </div>
          <div className="mt-4 flex items-baseline justify-between gap-4">
            <dt className="shrink-0 text-sm text-text-muted">Server timestamp</dt>
            <dd className="text-right font-medium tabular-nums">
              {health.timestamp}
            </dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
