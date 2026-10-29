import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Every word a person reads comes from a catalog (messages/ or the
    // engine's), so no language is hard-wired into the markup. Attributes
    // are not checked here — class names are strings too —; the ones read
    // aloud or shown are, below.
    files: [
      "components/cad/**/*.tsx",
      "components/marketing/**/*.tsx",
      "components/*.tsx",
      "app/**/*.tsx",
    ],
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
  {
    // The engine is DOM-free outside its adapters: a browser global here
    // breaks the headless runtime the tests and the landing's figures use.
    files: ["cad/**/*.ts"],
    ignores: ["cad/adapters/**"],
    rules: {
      "no-restricted-globals": [
        "error",
        ...[
          "window",
          "document",
          "navigator",
          "location",
          "localStorage",
          "sessionStorage",
          "requestAnimationFrame",
          "cancelAnimationFrame",
          "ResizeObserver",
          "devicePixelRatio",
          "getComputedStyle",
        ].map((name) => ({
          name,
          message:
            "cad/ is DOM-free outside adapters/: ask the host through a port (.claude/rules/cad-engine.md).",
        })),
      ],
      "no-restricted-syntax": [
        "error",
        {
          // A tiny negative angle lands on exactly 360 (or 2π) this way.
          selector:
            "ConditionalExpression[test.operator=/^<=?$/][test.right.value=0][consequent.operator='+'][consequent.right.value=360]",
          message:
            "Normalise with normalizeDegrees / normalizeAngle (.claude/rules/cad-engine.md, Conventions).",
        },
      ],
    },
  },
  {
    files: ["components/**/*.tsx", "app/**/*.tsx"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          // Chrome writes a number input in the browser's language, not the
          // page's, and spins it on the wheel.
          selector: "JSXAttribute[name.name='type'][value.value='number']",
          message:
            'A number is typed in DecimalInput (text, inputMode="decimal"), never type="number" (.claude/rules/ui.md).',
        },
        {
          // react/jsx-no-literals does not see attributes; these are read
          // aloud or shown, so they come from a catalog too.
          selector:
            "JSXAttribute[name.name=/^(aria-label|title|placeholder|alt)$/] > Literal",
          message:
            "A label a person reads comes from a catalog (.claude/rules/i18n.md, No literals).",
        },
        {
          selector:
            "CallExpression[callee.property.name='addEventListener'][arguments.0.value=/^key(down|up)$/]",
          message:
            "A shortcut belongs in CadRuntime.keyDown, never in a React listener (.claude/rules/cad-runtime.md).",
        },
      ],
    },
  },
  {
    files: ["hooks/**/*.ts", "hooks/**/*.tsx"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "CallExpression[callee.property.name='addEventListener'][arguments.0.value=/^key(down|up)$/]",
          message:
            "A shortcut belongs in CadRuntime.keyDown, never in a React listener (.claude/rules/cad-runtime.md).",
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
    // The engine package's build output.
    "cad/dist/**",
    // Generated coverage report.
    "coverage/**",
    // Gitignored: AutoCAD's strings and a command review's scratch tests.
    "research/**",
    // Agent worktrees: other branches, with their own .next, dist and coverage.
    ".claude/worktrees/**",
  ]),
])

export default eslintConfig
