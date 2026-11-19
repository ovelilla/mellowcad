// Prints what the engine draws of each multileader of a DXF, piece by piece,
// to set beside what AutoCAD's EXPLODE leaves of it (m03, m04).
//   node node_modules/jiti/lib/jiti-cli.mjs scripts/research/probes/mleader/compare.ts <file.dxf>
import { readFileSync } from "node:fs"
import type { Entity } from "../../../../cad/domain/entities"

const repo = process.env.REPO ?? process.cwd()
const { parseDxf } = await import(`${repo}/cad/serialization/dxf/readDxf.ts`)
const { mleaderGeometry } = await import(`${repo}/cad/domain/multileaders.ts`)

const n = (v: number) => Number(v.toFixed(4))
const xy = (p: { x: number; y: number }) => `(${n(p.x)} ${n(p.y)})`
const { drawing } = parseDxf(readFileSync(process.argv[2]))
const all = [
  ...drawing.entities,
  ...drawing.blocks.flatMap((b: { entities: unknown[] }) => b.entities),
]
for (const e of all as { type: string }[]) {
  if (e.type !== "mleader") continue
  console.log("== MULTILEADER")
  for (const piece of mleaderGeometry(e as never) as Entity[]) {
    switch (piece.type) {
      case "mtext":
        console.log(
          `MTEXT ${xy(piece.position)} h=${n(piece.height)} w=${n(piece.width)} ${piece.attachment} rot=${n(piece.rotation)} ${JSON.stringify(piece.contents)}`
        )
        break
      case "insert":
        console.log(
          `INSERT ${xy(piece.position)} ${n(piece.scaleX)},${n(piece.scaleY)} rot=${n(piece.rotation)}`
        )
        break
      case "polyline":
        console.log(`PLINE ${piece.vertices.map(xy).join(" ")}`)
        break
      case "solid2d":
        console.log(`SOLID ${piece.corners.map(xy).join(" ")}`)
        break
      case "spline":
        console.log(`SPLINE fit ${piece.points.map(xy).join(" ")}`)
        break
      default:
        console.log(piece.type)
    }
  }
}
