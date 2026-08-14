import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // eslint-plugin-react's "detect" React-version heuristic calls the
  // removed `context.getFilename()` API under ESLint 10. Pin a concrete
  // version so linting works without crashing.
  {
    settings: {
      react: {
        version: "19.2.8",
      },
    },
  },
  // New react-hooks v7 rules flag intentional pre-existing patterns
  // (localStorage hydration after mount, URL-query sync, react-hook-form
  // reset in edit mode). These are not bugs, so keep them disabled to
  // preserve app behavior.
  {
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/incompatible-library": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
