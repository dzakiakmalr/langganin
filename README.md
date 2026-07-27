# Langganin

Subscription & free-trial tracker untuk pengguna Indonesia: lacak semua langganan digital, dapatkan pengingat sebelum perpanjangan otomatis / trial berakhir, dan lihat total pengeluaran bulanan dalam satu dasbor.

## Stack

Next.js 15 (App Router) · TypeScript (strict) · Tailwind CSS v4 · Supabase (Auth + Postgres) · Drizzle ORM · Resend · Vercel

## Getting Started

```bash
npm install
npm run dev
```

Buka http://localhost:3000. Health check: http://localhost:3000/health.

Environment variables: salin `.env.example` → `.env.local` dan isi nilainya (jangan pernah commit `.env*` selain `.env.example`).

## Dokumentasi

Semua dokumen desain & arsitektur ada di [`docs/claudeai_mds/`](docs/claudeai_mds/):

- `AGENTS.md` — konteks utama & aturan coding untuk AI agent
- `01-PRD.md` — product requirements
- `02-TECH-STACK.md` — stack & struktur folder
- `03-DATABASE-SCHEMA.md` — skema Postgres/Drizzle
- `04-DESIGN-SYSTEM.md` — token warna, tipografi, resep clay/glass
- `05-SITEMAP-AND-FLOWS.md` — sitemap, komponen, UX flow
- `06-API-CONTRACT.md` — kontrak API route handlers
