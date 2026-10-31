import { defineConfig } from "tsdown"

export default defineConfig({
  entry: {
    index: "index.ts",
    "locales/en": "locales/en.ts",
    "locales/es": "locales/es.ts",
    "locales/ar": "locales/ar.ts",
    "locales/pt-BR": "locales/pt-BR.ts",
  },
  format: "esm",
  platform: "neutral",
  tsconfig: "tsconfig.build.json",
  // WHY Oxc by name: rolldown-plugin-dts infers it from `isolatedDeclarations`
  // and has changed that inference before; named, a tsconfig that loses the
  // flag fails the build instead of silently falling back to tsc.
  // WHY the tsc resolver: it honours `allowArbitraryExtensions`, so the Oxc
  // declarations read `./en.json`'s type from `en.d.json.ts`; Oxc's own
  // resolver hands it the JSON, which it cannot parse.
  dts: { generator: "oxc", resolver: "tsc" },
  outDir: "dist",
  // WHY unbundled: one module per source file keeps `sideEffects: false`
  // meaningful to the host's bundler. Flattened into one file, the barrel's
  // top-level tables (hatch patterns, linetypes) stayed in a page importing
  // only `matchCommands`: 13.9 KB minified against 0.4 KB.
  unbundle: true,
})
