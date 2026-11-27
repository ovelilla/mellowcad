import { readFileSync } from "node:fs"
import { gunzipSync } from "node:zlib"
import { describe, expect, it } from "vitest"
import { createHarness, type CadHarness } from "../../../test/harness"
import { p } from "../../../test/builders"
import "../../../test/matchers"
import type {
  BlockDefinition,
  Entity,
  LineEntity,
  TableEntity,
} from "../../domain/entities"
import {
  createBlockDefinition,
  createCircle,
  mapTable,
  purgeableBlocks,
  tableGeometry,
} from "../../domain/entities"
import { es } from "../../locales/es"
import { parseDxf } from "../../serialization/dxf/readDxf"
import {
  parseDrawingFile,
  serializeDrawing,
} from "../../serialization/drawingFile"
import { documentSnapshot } from "../runtimeFiles"

// The tables of AutoCAD 2027's own DXF (probes scripts/research/probes/table/,
// t10): ezdxf's acad_table_with_blk_ref, AutoCAD's copy of it scaled by 0.5,
// one turned 30°, one mirrored, a red one on L1, and an empty -TABLE.

const FIXTURE = new URL(
  "../../serialization/dxf/fixtures/tables-2018.dxf.gz",
  import.meta.url
)
const text = gunzipSync(readFileSync(FIXTURE)).toString("latin1")
const parsed = parseDxf(text).drawing
const blocks = new Map(parsed.blocks.map((b) => [b.id, b] as const))
const lookup = (id: string): BlockDefinition | undefined => blocks.get(id)
const tables = parsed.entities.filter(
  (e): e is TableEntity => e.type === "table"
)
const ez = tables.find(
  (t) => Math.abs(t.position.x - 746.478536) < 1e-5 && t.position.y > 100
)!

/** AutoCAD's `*T` blocks in the file: each piece as `kind x,y …`, rounded. */
function acadBlocks(): Map<string, string[]> {
  const lines = text.split(/\r?\n/)
  const out = new Map<string, string[]>()
  let name: string | null = null
  let record: Record<string, string> | null = null
  const r = (v: string | undefined) =>
    (Math.round(Number(v ?? 0) * 1e4) / 1e4).toString()
  const flush = () => {
    if (!record || !name) return
    const at = `${r(record["10"])},${r(record["20"])}`
    if (record.type === "LINE") {
      out.get(name)!.push(`LINE ${at} ${r(record["11"])},${r(record["21"])}`)
    } else if (record.type === "MTEXT") {
      out
        .get(name)!
        .push(
          `MTEXT ${at} ${r(record["40"])} ${r(record["41"])} ${record["71"]?.trim()} ${record["1"]}`
        )
    } else if (record.type === "INSERT") {
      out.get(name)!.push(`INSERT ${at} ${r(record["41"])}`)
    }
    record = null
  }
  let section = ""
  for (let i = 0; i + 1 < lines.length; i += 2) {
    const code = lines[i].trim()
    const value = lines[i + 1]
    if (code === "2" && lines[i - 1] === "SECTION") section = value
    if (section !== "BLOCKS") continue
    if (code === "0") {
      flush()
      if (value === "BLOCK") name = null
      else if (value === "ENDBLK") name = null
      else if (name) record = { type: value }
      continue
    }
    if (
      code === "2" &&
      name === null &&
      record === null &&
      /^\*T\d+$/.test(value)
    ) {
      name = value
      out.set(name, [])
      continue
    }
    if (record && !(code in record)) record[code] = value
  }
  return out
}

/** Ours, each piece moved to its table's insertion point as the block holds it. */
function ours(table: TableEntity): string[] {
  const r = (v: number) => (Math.round(v * 1e4) / 1e4).toString()
  const local = (q: { x: number; y: number }) =>
    `${r(q.x - table.position.x)},${r(q.y - table.position.y)}`
  return tableGeometry(table, lookup).map((piece: Entity) => {
    if (piece.type === "polyline") {
      return `LINE ${local(piece.vertices[0])} ${local(piece.vertices[1])}`
    }
    if (piece.type === "mtext") {
      const n = ["tl", "tc", "tr", "ml", "mc", "mr", "bl", "bc", "br"].indexOf(
        piece.attachment
      )
      return `MTEXT ${local(piece.position)} ${r(piece.height)} ${r(piece.width)} ${n + 1} ${piece.contents}`
    }
    if (piece.type === "insert") {
      return `INSERT ${local(piece.position)} ${r(piece.scaleX)}`
    }
    return piece.type
  })
}

const tablesOf = (cad: CadHarness): TableEntity[] =>
  cad.entities().filter((e): e is TableEntity => e.type === "table")

function typed(cad: CadHarness, ...texts: string[]): string[] {
  const from = cad.commandLog().length
  for (const t of texts) {
    cad.runtime.setCommandLineText(t)
    cad.runtime.submitCommandLine()
  }
  return cad.commandLog().slice(from)
}

const withEz = () =>
  createHarness({ entities: [{ ...ez, id: "t1" }], blocks: parsed.blocks })

describe("a table, as AutoCAD 2027 draws it from its cells", () => {
  // t01: AutoCAD redraws a table's block from its cells on opening; t10's
  // file holds what it drew of each, which ours must be, piece by piece.
  it("draws each table of AutoCAD's file as AutoCAD's block of it", () => {
    const acad = acadBlocks()
    expect(tables).toHaveLength(6)
    const names = text
      .split(/\r?\n/)
      .reduce<string[]>((found, line, i, all) => {
        if (line === "ACAD_TABLE" && all[i - 1].trim() === "0") {
          const at = all.indexOf("AcDbBlockReference", i)
          found.push(all[at + 2])
        }
        return found
      }, [])
    expect(names).toHaveLength(6)
    // Read in the file's order: each table's block is the one it names.
    tables.forEach((table, i) => {
      const theirs = acad.get(names[i])!.filter((l) => l !== "LINE 0,0 0,0")
      expect(ours(table)).toEqual(theirs)
    })
  })

  // t02: SCALE 2 about 0,0, ROTATE 30 about 0,0, MIRROR about X = 0.
  it("is scaled in its sizes, turned, and mirrored unreflected", () => {
    const cad = withEz()
    cad.zoomToFit()
    typed(cad, "_SCALE", "_ALL", "", "0,0", "2")
    let [t] = tablesOf(cad)
    expect(t.position).toBeCloseToPoint(p(1492.957072, 279.101525), 5)
    expect(t.rowHeights).toEqual([22, 18, 18, 18, 18, 18, 18, 18, 18, 18])
    expect(t.columnWidths).toEqual([80, 80, 80, 80, 80])
    expect(t.overrides).toEqual({
      horizontalMargin: 3,
      verticalMargin: 3,
      textHeights: { data: 9, title: 12, header: 9 },
    })
    // Every cell a span does not cover gets its own height (91 32 and 140).
    expect(t.cells[0].textHeight).toBe(12)
    expect(t.cells[1]).toEqual({ merged: true })
    expect(t.cells[5].textHeight).toBe(9)
    typed(cad, "_ROTATE", "_ALL", "", "0,0", "30")
    typed(cad, "_MIRROR", "_ALL", "", "0,0", "0,10", "_Y")
    ;[t] = tablesOf(cad)
    expect(t.position).toBeCloseToPoint(p(-1499.8, 1188.19), 1)
    expect(t.direction).toBeCloseToPoint(p(0.866025, -0.5), 6)
  })

  // t05: caught in part or whole, it stays.
  it("is left by STRETCH", () => {
    const cad = withEz()
    cad.zoomToFit()
    typed(cad, "_STRETCH", "C", "700,30", "1000,200", "", "0,0", "5,-3")
    expect(tablesOf(cad)[0].position).toEqual(ez.position)
    typed(cad, "_STRETCH", "C", "940,45", "950,50", "", "0,0", "5,-3")
    expect(tablesOf(cad)[0]).toEqual({ ...ez, id: "t1" })
  })

  // t06, t06b: its texts, its block cell, its grid's lines and a grey line
  // of no length, each on its layer and in its colour.
  it("EXPLODE leaves its texts, its block and its lines", () => {
    const cad = createHarness({
      entities: [{ ...ez, id: "t1", layerId: "0", color: "#ff0000" }],
      blocks: parsed.blocks,
    })
    cad.select("t1")
    const log = typed(cad, "_EXPLODE")
    expect(log).toEqual(["EXPLODE", "1 found"])
    const left = cad.entities()
    const count = (type: string) => left.filter((e) => e.type === type).length
    expect(count("mtext")).toBe(20)
    expect(count("insert")).toBe(1)
    expect(count("line")).toBe(21)
    expect(count("table")).toBe(0)
    const lines = left.filter((e): e is LineEntity => e.type === "line")
    expect(lines.slice(0, 20).every((l) => l.color === "#ff0000")).toBe(true)
    const marker = lines[20]
    expect(marker.start).toEqual(marker.end)
    expect(marker.color).toBe("8")
    expect(marker.lineweight).toBe(0)
  })

  // t08 (en-US, es-ES).
  it("lists itself as AutoCAD does", () => {
    const cad = withEz()
    cad.select("t1")
    const lines = typed(cad, "_LIST").flatMap((l) => l.split("\n"))
    expect(lines.slice(2)).toEqual([
      '                  ACAD_TABLE  Layer: "0"',
      "                            Space: Model space",
      "Position:        X= 746.478536, Y= 139.550762, Z= 0.000000",
      "Normal:          X= 0.000000, Y= 0.000000, Z= 1.000000",
      "Horizontal Dir:  X= 1.000000, Y= 0.000000, Z= 0.000000",
      "Number of columns:  5",
      "Number of rows:     10",
      "Table Style:        Standard",
    ])
    const spanish = createHarness({
      locale: es,
      entities: [{ ...ez, id: "t1" }],
      blocks: parsed.blocks,
    })
    spanish.select("t1")
    const lineas = typed(spanish, "_LIST").flatMap((l) => l.split("\n"))
    expect(lineas).toContain('                  ACAD_TABLE  Capa: "0"')
    expect(lineas).toContain(
      "Dir. horizontal:  X= 1.000000, Y= 0.000000, Z= 0.000000"
    )
    expect(lineas).toContain("Número de filas: 10")
    expect(lineas).toContain("Estilo de tabla:        Standard")
  })

  // list/p219 (en-US): in UCS Z 30 its position is the UCS's, its normal and
  // direction the WCS's.
  it("lists its position in the UCS, its directions in the WCS", () => {
    const cad = withEz()
    typed(cad, "_UCS", "_Z", "30")
    cad.select("t1")
    const lines = typed(cad, "_LIST").flatMap((l) => l.split("\n"))
    expect(lines.slice(4, 7)).toEqual([
      "Position:        X= 716.244757, Y= -252.384763, Z= 0.000000",
      "Normal:          X= 0.000000, Y= 0.000000, Z= 1.000000",
      "Horizontal Dir:  X= 1.000000, Y= 0.000000, Z= 0.000000",
    ])
  })

  // t04, t04b, t04c: what the edit commands say of it.
  it("is refused by OFFSET, AREA, BREAK, DIVIDE, TRIM, FILLET and CHAMFER", () => {
    const refused = (command: string, ...rest: string[]) => {
      const cad = withEz()
      cad.zoomToFit()
      typed(cad, command, ...rest)
      cad.click(p(800, 139.551))
      return cad.commandLog().join("\n")
    }
    expect(refused("_OFFSET", "1")).toContain("Cannot offset that object.")
    expect(refused("_AREA", "O")).toContain(
      "Selected object does not have an area"
    )
    expect(refused("_BREAK")).toContain("Object can't be broken")
    expect(refused("_DIVIDE")).toContain("Cannot divide that object.")
    expect(refused("_TRIM", "")).toContain("Cannot TRIM this object.")
    expect(refused("_FILLET")).toContain(
      "Fillet requires 2 lines, arcs, or circles (not Table objects)."
    )
    expect(refused("_CHAMFER")).toContain(
      "Chamfer requires 2 lines (not Table objects)."
    )
  })

  // t07: END and MID on its grid's runs, INS a cell's text, CEN in a block cell.
  it("snaps to its grid, its texts and its block cells' objects", () => {
    const cad = withEz()
    cad.zoomToFit()
    typed(cad, "LUPREC", "3")
    const found = (mode: string, at: string) => {
      typed(cad, "ID", mode, at)
      const line = cad.commandLog().at(-1) ?? ""
      const xyz = line.match(/X = (\S+)\s+Y = (\S+)/)
      return xyz ? [+xyz[1], +xyz[2]] : line
    }
    expect(found("_END", "786.6,128.6")).toEqual([786.479, 128.551])
    expect(found("_MID", "786,101.6")).toEqual([786.479, 101.551])
    expect(found("_INS", "806.5,124.5")).toEqual([806.479, 124.051])
    expect(found("_CEN", "925.4,96")).toEqual([925.366, 98.059])
  })

  it("is picked by what it draws and moved by its corner grip", () => {
    const cad = withEz()
    cad.zoomToFit()
    cad.click(p(800, 139.551))
    expect(cad.selectedIds()).toEqual(["t1"])
    cad.click(ez.position).click(p(700, 100))
    expect(tablesOf(cad)[0].position).toBeCloseToPoint(p(700, 100), 6)
  })

  it("is saved in the drawing file", () => {
    const cad = withEz()
    const back = parseDrawingFile(
      serializeDrawing(documentSnapshot(cad.runtime.document))
    )
    expect(back.entities).toEqual([{ ...ez, id: "t1" }])
  })

  it("mirrors about any line unreflected, reading as before", () => {
    const turned = mapTable(ez, (q) => ({ x: q.y, y: q.x }))
    // Reflected about y = x: its direction runs down, its up to the left,
    // its corner the image of its far one.
    expect(turned.direction).toBeCloseToPoint(p(0, -1), 9)
    expect(turned.position).toBeCloseToPoint(
      p(ez.position.y, ez.position.x + 200),
      9
    )
  })

  // A block only a cell uses is in use: PURGE leaves it, the file keeps it.
  it("keeps a block a cell uses from PURGE and in the file", () => {
    expect(purgeableBlocks(parsed.blocks, [ez]).map((b) => b.name)).toEqual([])
    const cad = withEz()
    const back = parseDrawingFile(
      serializeDrawing(documentSnapshot(cad.runtime.document))
    )
    expect(back.blocks.map((b) => b.name)).toContain("B1")
  })

  it("redraws its block cells when their block is redefined", () => {
    const at = (lookup: (id: string) => BlockDefinition | undefined) =>
      tableGeometry(ez, lookup).find((piece) => piece.type === "insert")
    const before = at(lookup)
    const bigger = createBlockDefinition("B1", { x: 0, y: 0 }, [
      createCircle({ x: 0, y: 0 }, 50),
    ])
    let redefined = false
    const changing = (id: string) =>
      redefined && id === "B1" ? bigger : lookup(id)
    expect(at(changing)).toEqual(before)
    redefined = true
    const after = at(changing)
    expect(after?.type === "insert" && after.scaleX).toBeCloseTo(6 / 100, 9)
  })

  it("takes a dangling text style for the base, as a text does", () => {
    const cad = createHarness({
      entities: [
        {
          ...ez,
          id: "t1",
          style: {
            ...ez.style,
            data: { ...ez.style.data, textStyleId: "ghost" },
          },
          cells: ez.cells.map((cell, i) =>
            i === 5 ? { ...cell, textStyleId: "ghost" } : cell
          ),
        },
      ],
      blocks: parsed.blocks,
    })
    const [t] = tablesOf(cad)
    expect(t.style.data.textStyleId).toBe(ez.style.title.textStyleId)
    expect(t.cells[5].textStyleId).toBe(ez.style.title.textStyleId)
  })

  it("lets no span reach into one already covered", () => {
    // Row 0 spans all five; a covered cell's own span is ignored.
    const overlapped: TableEntity = {
      ...ez,
      cells: ez.cells.map((cell, i) =>
        i === 2 ? { ...cell, span: { columns: 3, rows: 2 } } : cell
      ),
    }
    const lines = (t: TableEntity) =>
      tableGeometry(t, lookup).filter((piece) => piece.type === "polyline")
    expect(lines(overlapped)).toEqual(lines(ez))
  })
})
