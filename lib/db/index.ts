import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

// DATABASE_URL = Supabase transaction pooler (port 6543) — hemat koneksi
// untuk runtime/serverless. Migrasi (drizzle-kit) pakai DIRECT_URL.
//
// `prepare: false` wajib karena pgbouncer transaction mode tidak mendukung
// prepared statements (gotcha klasik Supabase + Drizzle).
const client = postgres(process.env.DATABASE_URL!, { prepare: false });

export const db = drizzle(client, { schema });
