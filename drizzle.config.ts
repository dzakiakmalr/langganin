import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// drizzle-kit hanya membaca `.env` secara default, bukan `.env.local` (Next.js).
config({ path: ".env.local" });

export default defineConfig({
  dialect: "postgresql",
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DIRECT_URL!,
  },
});
