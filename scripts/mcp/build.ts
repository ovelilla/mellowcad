import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { rolldown } from "rolldown"

// WHY a bundle: Node cannot run the engine's source (its imports carry no
// extension) and the repo never builds `cad/dist` (`engine-package.md`), so
// the prototype server is bundled from source into one file to be spawned.
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..")

export async function bundle(entry: string, outFile: string): Promise<void> {
  const build = await rolldown({
    input: entry,
    platform: "node",
    // The bench's optional rasteriser; never part of the bundle.
    external: ["sharp"],
    resolve: {
      alias: { "@mellowcad/engine": resolve(ROOT, "cad/index.ts") },
    },
    logLevel: "warn",
  })
  await build.write({ file: outFile, format: "esm", codeSplitting: false })
}

const [entry, outFile] = process.argv.slice(2)
if (entry === undefined || outFile === undefined) {
  console.error("usage: node scripts/mcp/build.ts <entry.ts> <out.mjs>")
  process.exit(1)
}
await bundle(resolve(entry), resolve(outFile))
