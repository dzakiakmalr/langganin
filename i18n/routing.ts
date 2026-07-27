import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // Indonesian stays the default, prefix-free experience (01-PRD.md §9);
  // English exists for international reviewers/stakeholders.
  locales: ["id", "en"],
  defaultLocale: "id",
  localePrefix: "as-needed",
});
