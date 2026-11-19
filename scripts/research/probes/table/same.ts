// Whether two DXFs hold the same tables, as the engine's reader reads them:
// what AutoCAD wrote back of a file of ours (t11) against the file it came
// from. Prints each table's differences, or "same".
//   REPO=<worktree> node node_modules/jiti/lib/jiti-cli.mjs same.ts <a.dxf> <b.dxf>
import { readFileSync } from "node:fs"

const repo = process.env.REPO ?? "/home/oveli/projects/mellowcad"
const { parseDxf } = await import(`${repo}/cad/serialization/dxf/readDxf.ts`)

const round = (value: unknown): unknown => {
  if (typeof value === "number") return Math.round(value * 1e6) / 1e6 || 0
  if (Array.isArray(value)) return value.map(round)
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([k]) => k !== "id")
        .map(([k, v]) => [k, round(v)])
    )
  }
  return value
}
const tables = (path: string) =>
  parseDxf(readFileSync(path))
    .drawing.entities.filter((e: { type: string }) => e.type === "table")
    .map(round)
    .map((t: unknown) => JSON.stringify(t))
    .sort()

const a = tables(process.argv[2])
const b = tables(process.argv[3])
console.log(`${a.length} and ${b.length} tables`)
a.forEach((t: string, i: number) => {
  if (t === b[i]) return console.log(`${i}: same`)
  const x = JSON.parse(t)
  const y = JSON.parse(b[i])
  for (const key of Object.keys({ ...x, ...y })) {
    if (key === "cells" || key === "layerId") continue
    if (JSON.stringify(x[key]) !== JSON.stringify(y[key])) {
      console.log(
        `${i}: ${key} ${JSON.stringify(x[key])} / ${JSON.stringify(y[key])}`
      )
    }
  }
  x.cells.forEach((c: unknown, k: number) => {
    const d = JSON.stringify(y.cells[k])
    if (JSON.stringify(c) !== d)
      console.log(`${i}: cell ${k} ${JSON.stringify(c)} / ${d}`)
  })
})
