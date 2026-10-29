import { defineConfig } from "tsdown"

// The engine's build (cad/tsdown.config.ts), without its locales: Oxc writes
// the declarations, one module per source file.
export default defineConfig({
  entry: { index: "src/index.ts" },
  format: "esm",
  platform: "neutral",
  tsconfig: "tsconfig.build.json",
  dts: { generator: "oxc" },
  outDir: "dist",
  unbundle: true,
  inputOptions: {
    // WHY: rolldown warns that a module's "use client" may be lost when
    // modules are merged; unbundled, each module keeps its own, and
    // scripts/packages/client-directive.ts checks that dist does.
    onLog(level, log, handler) {
      if (log.code !== "MODULE_LEVEL_DIRECTIVE") handler(level, log)
    },
  },
})
