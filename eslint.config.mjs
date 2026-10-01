import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Every word a person reads comes from a catalog (messages/ or the
    // engine's), so no language is hard-wired into the markup. Attribute
    // strings are not checked — class names are strings too — so labels in
    // attributes are held to the same rule by review.
    files: ["components/cad/**/*.tsx", "components/marketing/**/*.tsx"],
    rules: {
      "react/jsx-no-literals": [
        "error",
        {
          noStrings: true,
          ignoreProps: true,
          // Signs and notation, the same in every language: the axis names
          // and the degree sign belong to the drawing; the arrow is the one
          // ForwardArrow mirrors in RTL.
          allowedStrings: ["×", "—", "·", "°", "X", "Y", "→"],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated coverage report.
    "coverage/**",
  ]),
])

export default eslintConfig
