import babel from "@rolldown/plugin-babel"
import { defineConfig } from "tsdown"

// The engine's build (cad/tsdown.config.ts), its locales included, with the
// React Compiler: Oxc writes the declarations, one module per source file.
export default defineConfig({
  entry: {
    index: "src/index.ts",
    "locales/en": "src/locales/en.ts",
    "locales/es": "src/locales/es.ts",
    "locales/ar": "src/locales/ar.ts",
  },
  format: "esm",
  platform: "neutral",
  tsconfig: "tsconfig.build.json",
  // WHY the tsc resolver: the catalog's types read `./en.json`'s from
  // `en.d.json.ts` (`allowArbitraryExtensions`), as the engine's do.
  dts: { generator: "oxc", resolver: "tsc" },
  outDir: "dist",
  unbundle: true,
  // WHY in the package: a host without the compiler would get the chrome
  // unmemoized, ~7 ms a state change against ~3 (next.config.ts). The Babel
  // plugin directly, not tsdown's recipe through @vitejs/plugin-react, which
  // asks for vite as a peer.
  plugins: [babel({ plugins: ["babel-plugin-react-compiler"] })],
  inputOptions: {
    // WHY: rolldown warns that a module's "use client" may be lost when
    // modules are merged; unbundled, each module keeps its own, and
    // scripts/packages/client-directive.ts checks that dist does.
    onLog(level, log, handler) {
      if (log.code !== "MODULE_LEVEL_DIRECTIVE") handler(level, log)
    },
  },
})
