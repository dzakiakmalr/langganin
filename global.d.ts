import type messages from "./messages/id.json";

// Type-safe message keys for next-intl (id.json is the source of truth).
// Note: Locale is intentionally not augmented — Next.js's generated route
// types require params.locale to be `string`.
declare module "next-intl" {
  interface AppConfig {
    Messages: typeof messages;
  }
}
