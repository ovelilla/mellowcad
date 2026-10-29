import path from "node:path"
import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

const rootDir = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  resolve: {
    // Prefix-anchored so package names such as `@base-ui/react` are untouched.
    alias: [
      { find: /^@\//, replacement: `${rootDir}/` },
      // The engine from source, as tsconfig's `paths` resolve it: the
      // workspace link would reach the package's built `dist/`.
      { find: /^@mellowcad\/engine$/, replacement: `${rootDir}/cad/index.ts` },
      {
        find: /^@mellowcad\/engine\/locales\/([\w-]+)$/,
        replacement: `${rootDir}/cad/locales/$1.ts`,
      },
    ],
  },
  test: {
    // The whole CAD core is DOM-free by design — only `cad/adapters` touches the
    // browser — so the suite runs in plain Node. A test that suddenly needs jsdom
    // is a signal that a layering rule was broken.
    environment: "node",
    // Explicit imports over ambient globals: the same code style as the app.
    globals: false,
    include: [
      "cad/**/*.test.ts",
      "test/**/*.test.ts",
      // The landing's scripts and derived facts: the page cannot lie about the
      // product while these pass.
      "content/**/*.test.ts",
      // The URL scheme, the message catalogs and the helpers that read them.
      "i18n/**/*.test.ts",
      "lib/**/*.test.ts",
    ],
    setupFiles: ["./test/setup.ts"],
    server: {
      deps: {
        // next-intl imports `next/navigation` without an extension, which only
        // a bundler resolves; inlined, Vite resolves it as Next would.
        inline: ["next-intl"],
      },
    },
    // WHY: the slowest test takes under a second, but the commit hook runs
    // the suite on a machine other projects load too, and at the default 5 s
    // a busy CPU failed it with timeouts alone. 30 s still catches a hang.
    testTimeout: 30_000,
    hookTimeout: 30_000,
    restoreMocks: true,
    unstubEnvs: true,
    unstubGlobals: true,
    coverage: {
      provider: "v8",
      include: ["cad/**/*.ts"],
      exclude: [
        "cad/**/*.test.ts",
        // Test infrastructure, not product code.
        "test/**",
        // The package's build: its config and its output.
        "cad/tsdown.config.ts",
        "cad/dist/**",
        // Barrels are re-exports; covering them measures nothing.
        "cad/index.ts",
        "cad/**/index.ts",
        // Browser adapters are the one layer that needs a real DOM; they are
        // deliberately kept thin and are exercised end-to-end instead.
        "cad/adapters/**",
        // Presentation constants, not logic.
        "cad/scene/theme.ts",
      ],
      reporter: ["text-summary", "html", "lcov"],
      thresholds: {
        // A ratchet, set just under what the suite achieves today: raise these
        // as coverage grows, never lower them to make a red build green.
        statements: 76.5,
        branches: 67,
        functions: 85.5,
        lines: 80.2,
        // The pure layers are where a silent regression is most expensive and
        // where tests are cheapest, so they are held much higher.
        "cad/geometry/**": {
          statements: 92,
          branches: 85,
          functions: 98,
          lines: 96,
        },
        "cad/domain/**": {
          statements: 90,
          branches: 84,
          functions: 94,
          lines: 93,
        },
        "cad/serialization/**": {
          statements: 92,
          branches: 90,
          functions: 98,
          lines: 98,
        },
      },
    },
  },
})
