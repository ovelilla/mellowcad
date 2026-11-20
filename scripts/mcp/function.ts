import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { rolldown } from "rolldown"

// Bundles the MCP server's handler into the file `api/mcp.js` re-exports, run
// by `npm run build` before `next build`. WHY a bundle: a Vercel function
// outside Next runs what Node can, and Node cannot run the engine's source
// (its imports carry no extension) nor the `@/` paths.
//
//   node scripts/mcp/function.ts
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..")

const build = await rolldown({
  input: resolve(ROOT, "lib/mcp/handler.ts"),
  platform: "node",
  resolve: {
    alias: {
      "@mellowcad/engine": resolve(ROOT, "cad/index.ts"),
      "@": ROOT,
    },
  },
  logLevel: "warn",
})
await build.write({
  // WHY the underscore: Vercel makes no function of an `api/` file named so.
  file: resolve(ROOT, "api/_handler.mjs"),
  format: "esm",
  codeSplitting: false,
  minify: true,
})
