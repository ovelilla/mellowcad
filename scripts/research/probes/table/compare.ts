// Prints what the engine draws of each table of a DXF beside what AutoCAD's
// block of it holds (the *T block it wrote, a DXFOUT of the console's), each
// piece in the table's own frame: lines, MTEXTs and references.
//   REPO=<worktree> node node_modules/jiti/lib/jiti-cli.mjs compare.ts <acad.dxf>
import { readFileSync } from "node:fs"

const repo = process.env.REPO ?? "/home/oveli/projects/mellowcad"
const { parseDxf } = await import(`${repo}/cad/serialization/dxf/readDxf.ts`)
const { tableGeometry } = await import(`${repo}/cad/domain/entityQueries.ts`)

const file = readFileSync(process.argv[2], "latin1")
const { drawing } = parseDxf(file)
const blocks = new Map(
  drawing.blocks.map((b: { id: string }) => [b.id, b] as const)
)
const lookup = (id: string) => blocks.get(id)
const round = (n: number) => Math.round(n * 1e4) / 1e4

for (const table of drawing.entities.filter(
  (e: { type: string }) => e.type === "table"
)) {
  const ox = table.position.x
  const oy = table.position.y
  const local = (p: { x: number; y: number }) =>
    `${round(p.x - ox)},${round(p.y - oy)}`
  for (const piece of tableGeometry(table, lookup)) {
    if (piece.type === "polyline") {
      console.log(
        `LINE ${local(piece.vertices[0])} ${local(piece.vertices[1])}`
      )
    } else if (piece.type === "mtext") {
      console.log(
        `MTEXT ${local(piece.position)} h${round(piece.height)} w${round(piece.width)} ${piece.attachment} ${JSON.stringify(piece.contents)}`
      )
    } else if (piece.type === "insert") {
      console.log(
        `INSERT ${piece.blockId} ${local(piece.position)} s${round(piece.scaleX)}`
      )
    }
  }
}

// AutoCAD's *T blocks, from the file's own groups.
const lines = file.split(/\r?\n/)
let inBlock = false
let entity: Record<string, string> | null = null
const flush = () => {
  if (!entity) return
  const n = (k: string) => round(Number(entity![k] ?? 0))
  if (entity.type === "LINE") {
    console.log(`acad LINE ${n("10")},${n("20")} ${n("11")},${n("21")}`)
  } else if (entity.type === "MTEXT") {
    const attach = ["tl", "tc", "tr", "ml", "mc", "mr", "bl", "bc", "br"][
      Number(entity["71"]) - 1
    ]
    console.log(
      `acad MTEXT ${n("10")},${n("20")} h${n("40")} w${n("41")} ${attach} ${JSON.stringify(entity["1"])}`
    )
  } else if (entity.type === "INSERT") {
    console.log(`acad INSERT ${entity["2"]} ${n("10")},${n("20")} s${n("41")}`)
  }
  entity = null
}
for (let i = 0; i + 1 < lines.length; i += 2) {
  const code = lines[i].trim()
  const value = lines[i + 1]
  if (code === "0") {
    flush()
    if (value === "ENDBLK") inBlock = false
    else if (inBlock) entity = { type: value }
    continue
  }
  if (
    code === "2" &&
    /^\*T\d+$/.test(value) &&
    lines[i - 2]?.trim() !== "330"
  ) {
    if (!inBlock && lines.slice(Math.max(0, i - 40), i).includes("BLOCK")) {
      inBlock = true
      console.log(`== ${value}`)
    }
    continue
  }
  if (entity && !(code in entity)) entity[code] = value
}
