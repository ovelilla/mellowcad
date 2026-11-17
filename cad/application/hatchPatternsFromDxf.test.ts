import { readFileSync } from "node:fs"
import { gunzipSync } from "node:zlib"
import { describe, expect, it } from "vitest"
import { createHarness, type CadHarness } from "../../test/harness"
import { p } from "../../test/builders"
import type { HatchEntity, LineEntity } from "../domain/entities"
import { hatchGeometry } from "../domain/entities"
import { hatchLines } from "../domain/hatchPatternEdits"
import { hatchPatternLines } from "../domain/hatchPatterns"
import {
  parseDrawingFile,
  serializeDrawing,
} from "../serialization/drawingFile"
import { parseDxf } from "../serialization/dxf/readDxf"
import { writeDxf } from "../serialization/dxf/writeDxf"
import { documentSnapshot } from "./runtimeFiles"
import { de } from "../locales/de"
import { ptBR } from "../locales/pt-BR"
import type { EngineLocale } from "../locales/types"

// A hatch whose pattern AutoCAD 2027 does not have, and a User-defined one
// (probes scripts/research/probes/hatchpat/): AutoCAD's own DXFOUT of two
// rectangles, 0,0-100,50 hatched ANSI31 at 2 and 200,0-300,50 hatched `_U`
// at 30°, spacing 5, Double (p00), the first made MYPAT, custom, by
// editing its lines (make.py): 0, 0,0, 2,5, 4,-2 / 90, 0,0, 0,6, 3,-3 at 2.

function hatchpatFile(): Uint8Array {
  const path = new URL(
    "../serialization/dxf/fixtures/hatchpat-2018.dxf.gz",
    import.meta.url
  )
  return new Uint8Array(gunzipSync(readFileSync(path)))
}

// The reader is a chunk of its own, loaded once here so each open finds it.
await import("../serialization/dxf/readDxf")

async function opened(
  bytes: Uint8Array = hatchpatFile(),
  locale?: EngineLocale
): Promise<CadHarness> {
  const cad = createHarness(locale ? { locale } : {})
  await cad.openFile({ name: "hatchpat.dxf", bytes })
  return cad
}

const hatches = (cad: CadHarness): HatchEntity[] =>
  cad.entities().filter((e): e is HatchEntity => e.type === "hatch")
const named = (cad: CadHarness, name: string): HatchEntity =>
  hatches(cad).find((h) => h.patternId === name)!

function typed(cad: CadHarness, ...texts: string[]): string[] {
  const from = cad.commandLog().length
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad.commandLog().slice(from)
}

/** A hatch's drawn segments, rounded, sorted: what it looks like. */
function drawn(hatch: HatchEntity): string[] {
  const r = (n: number) => (Math.round(n * 1e6) / 1e6 || 0).toFixed(6)
  return hatchGeometry(hatch)
    .lines.map(([a, b]) => `${r(a.x)},${r(a.y)} ${r(b.x)},${r(b.y)}`)
    .sort()
}

/**
 * An ENTITIES-only DXF of one HATCH over 0,0-100,50 whose pattern lines are
 * given as AutoCAD writes them: drawn, turned and scaled.
 */
function hatchDxf(
  name: string,
  type: number,
  scale: number,
  angle: number,
  lines: readonly (readonly number[])[]
): Uint8Array {
  const g = (code: number, value: string | number) => [
    String(code).padStart(3),
    String(value),
  ]
  const groups = [
    ...g(0, "SECTION"),
    ...g(2, "ENTITIES"),
    ...g(0, "HATCH"),
    ...g(100, "AcDbEntity"),
    ...g(8, "0"),
    ...g(100, "AcDbHatch"),
    ...g(10, 0),
    ...g(20, 0),
    ...g(30, 0),
    ...g(2, name),
    ...g(70, 0),
    ...g(71, 0),
    ...g(91, 1),
    ...g(92, 2),
    ...g(72, 0),
    ...g(73, 1),
    ...g(93, 4),
    ...[0, 0, 100, 0, 100, 50, 0, 50].flatMap((v, i) => g(i % 2 ? 20 : 10, v)),
    ...g(97, 0),
    ...g(75, 0),
    ...g(76, type),
    ...g(52, angle),
    ...g(41, scale),
    ...g(77, 0),
    ...g(78, lines.length),
    ...lines.flatMap(([a, x, y, dx, dy, ...dashes]) => [
      ...g(53, a),
      ...g(43, x),
      ...g(44, y),
      ...g(45, dx),
      ...g(46, dy),
      ...g(79, dashes.length),
      ...dashes.flatMap((d) => g(49, d)),
    ]),
    ...g(98, 0),
    ...g(0, "ENDSEC"),
    ...g(0, "EOF"),
  ]
  return new TextEncoder().encode(groups.join("\n"))
}

describe("a hatch's own pattern, from a DXF", () => {
  it("keeps the lines of a pattern AutoCAD has not, and its type", async () => {
    const cad = await opened()
    const mypat = named(cad, "MYPAT")
    expect(mypat.patternType).toBe("custom")
    expect(mypat.patternScale).toBe(2)
    expect(mypat.patternAngle).toBe(0)
    expect(mypat.patternLines).toHaveLength(2)
    const [across, up] = mypat.patternLines!
    expect([across.deltaX, across.deltaY, ...across.dashes]).toEqual([
      2, 5, 4, -2,
    ])
    expect(up.angle).toBeCloseTo(Math.PI / 2, 12)
    expect(up.deltaX).toBeCloseTo(0, 12)
    expect(up.deltaY).toBeCloseTo(6, 12)
    expect(up.dashes).toEqual([3, -3])
    expect(mypat.origin).toBeCloseToPoint(p(0, 0))
  })

  // p05a: plotted, its rows of dashes 8 long, 4 apart, each row 10 above the
  // last and shifted 4 along, with the 90° family's dashes of 6.
  it("draws it as AutoCAD draws it", async () => {
    const lines = drawn(named(await opened(), "MYPAT"))
    expect(lines).toContain("4.000000,10.000000 12.000000,10.000000")
    expect(lines).toContain("16.000000,10.000000 24.000000,10.000000")
    expect(lines).toContain("8.000000,20.000000 16.000000,20.000000")
    expect(lines).toContain("12.000000,0.000000 12.000000,6.000000")
  })

  it("keeps a User-defined one's lines, its scale the spacing", async () => {
    const user = named(await opened(), "_U")
    expect(user.patternType).toBe("user")
    expect(user.patternScale).toBe(5)
    expect(user.patternAngle).toBeCloseTo(Math.PI / 6, 12)
    expect(
      user.patternLines!.map((l) => [l.angle, l.deltaX, l.deltaY])
    ).toEqual([
      [expect.closeTo(0, 12), expect.closeTo(0, 12), expect.closeTo(1, 12)],
      [
        expect.closeTo(Math.PI / 2, 12),
        expect.closeTo(0, 12),
        expect.closeTo(1, 12),
      ],
    ])
  })

  // 291 hatches of 10 of AutoCAD's samples: an ANSI31 drawn with acad.pat's
  // inch lines in a metric drawing, 25.4 times denser than acadiso.pat's.
  it("keeps acad.pat's lines where they are not acadiso.pat's", async () => {
    const r = 0.25 / Math.SQRT2
    const inch = (
      await opened(hatchDxf("ANSI31", 1, 2, 0, [[45, 0, 0, -r, r]]))
    )
      .entities()
      .find((e): e is HatchEntity => e.type === "hatch")!
    expect(inch.patternLines?.[0].deltaY).toBeCloseTo(0.125, 12)
    const s = 6.35 / Math.SQRT2
    const metric = (
      await opened(hatchDxf("ANSI31", 1, 2, 0, [[45, 0, 0, -s, s]]))
    )
      .entities()
      .find((e): e is HatchEntity => e.type === "hatch")!
    expect(metric.patternLines).toBeUndefined()
    expect(hatchLines(metric)).toBe(hatchPatternLines("ANSI31"))
  })

  // p06l: a name AutoCAD does not know it reads in capitals.
  it("reads an unknown name in capitals, and a User-defined one with no lines from its spacing", async () => {
    const cad = await opened(hatchDxf("grass2", 2, 1, 0, [[0, 0, 0, 0, 5]]))
    expect(hatches(cad)[0].patternId).toBe("GRASS2")
    const bare = (await opened(hatchDxf("_U", 0, 4, 0, []))).entities()[0]
    expect((bare as HatchEntity).patternLines).toHaveLength(1)
    expect(drawn(bare as HatchEntity)).toContain(
      "0.000000,4.000000 100.000000,4.000000"
    )
  })
})

describe("editing a hatch whose pattern a DXF brought", () => {
  // p02, p05b: -HATCHEDIT's scale 3 on MYPAT, which AutoCAD cannot find:
  // 41 is 3, the lines and the plot unchanged.
  it("a pattern AutoCAD cannot find keeps what it draws when scaled or turned", async () => {
    const cad = await opened()
    const before = drawn(named(cad, "MYPAT"))
    cad.select(named(cad, "MYPAT").id)
    expect(cad.runtime.setSelectionProperty("patternScale", "3")).toBe(true)
    expect(named(cad, "MYPAT").patternScale).toBe(3)
    expect(drawn(named(cad, "MYPAT"))).toEqual(before)
    expect(cad.runtime.setSelectionProperty("patternAngle", "30")).toBe(true)
    expect(drawn(named(cad, "MYPAT"))).toEqual(before)
  })

  // p04: the inch ANSI31 at scale 3 is acadiso.pat's, 3.175 × 3 apart.
  it("a pattern acadiso.pat has is generated from it again", async () => {
    const r = 0.25 / Math.SQRT2
    const cad = await opened(hatchDxf("ANSI31", 1, 2, 0, [[45, 0, 0, -r, r]]))
    cad.select(hatches(cad)[0].id)
    cad.runtime.setSelectionProperty("patternScale", "3")
    const hatch = hatches(cad)[0]
    expect(hatch.patternLines).toBeUndefined()
    expect(hatchLines(hatch)[0].deltaY * hatch.patternScale).toBeCloseTo(
      9.525,
      9
    )
  })

  it("a User-defined one turns its lines with its angle", async () => {
    const cad = await opened()
    cad.select(named(cad, "_U").id)
    cad.runtime.setSelectionProperty("patternAngle", "0")
    expect(drawn(named(cad, "_U"))).toContain(
      "200.000000,5.000000 300.000000,5.000000"
    )
  })

  // p03: SCALE and ROTATE carry the lines, AutoCAD's 41 and 52 with them.
  it("SCALE, COPY and ROTATE carry its lines", async () => {
    const cad = await opened()
    const id = named(cad, "MYPAT").id
    cad.select(id)
    typed(cad, "_SCALE", "0,0", "2")
    const scaled = named(cad, "MYPAT")
    expect(scaled.patternScale).toBe(4)
    expect(drawn(scaled)).toContain("8.000000,20.000000 24.000000,20.000000")
    cad.select(id)
    typed(cad, "_COPY", "0,0", "0,200", "")
    const copies = hatches(cad).filter((h) => h.patternId === "MYPAT")
    expect(copies).toHaveLength(2)
    expect(copies[1].patternLines).toEqual(copies[0].patternLines)
    expect(copies[1].patternType).toBe("custom")
  })

  it("EXPLODE makes its lines", async () => {
    const cad = await opened()
    const mypat = named(cad, "MYPAT")
    const count = hatchGeometry(mypat).lines.length
    cad.select(mypat.id)
    typed(cad, "_EXPLODE")
    expect(hatches(cad).map((h) => h.patternId)).toEqual(["_U"])
    expect(
      cad.entities().filter((e): e is LineEntity => e.type === "line").length
    ).toBe(count)
  })
})

describe("MATCHPROP between a DXF's patterns", () => {
  // p07: from MYPAT, the `_U` hatch takes 0° and 2 but keeps its name,
  // type and lines (Autodesk: the destination "reverts previous pattern").
  it("from one AutoCAD cannot find, the target keeps its pattern", async () => {
    const cad = await opened()
    const before = drawn(named(cad, "_U"))
    typed(cad, "_MATCHPROP")
    cad.click(p(8, 10)).click(p(250.825, 23.571)).enter()
    const user = named(cad, "_U")
    expect([user.patternType, user.patternScale, user.patternAngle]).toEqual([
      "user",
      2,
      0,
    ])
    expect(drawn(user)).toEqual(before)
  })

  // p08: from `_U`, MYPAT becomes `_U`, User-defined, at 30° spaced 5.
  it("from a User-defined one, the target becomes it", async () => {
    const cad = await opened()
    const target = named(cad, "MYPAT").id
    typed(cad, "_MATCHPROP")
    cad.click(p(250.825, 23.571)).click(p(8, 10)).enter()
    const matched = hatches(cad).find((h) => h.id === target)!
    expect(matched.patternId).toBe("_U")
    expect(matched.patternType).toBe("user")
    expect(matched.patternScale).toBe(5)
    expect(matched.patternLines).toEqual(named(cad, "_U").patternLines)
  })
})

describe("LIST and the palette of a DXF's patterns", () => {
  const listed = (log: string[]) =>
    log.flatMap((l) => l.split("\n")).filter((l) => /^ {17}\S/.test(l))

  // p06u: `_U` is listed as its language's letter with its spacing.
  it("lists `_U` as AutoCAD does, in English and German", async () => {
    const cad = await opened()
    typed(cad, "LUPREC", "4")
    cad.select(named(cad, "_U").id)
    expect(listed(typed(cad, "_LIST")).slice(0, 4)).toEqual([
      "                 Hatch pattern U",
      "                 Annotative: No",
      "                 Hatch spacing for user pattern    5.0000",
      "                 Hatch angle     30",
    ])
    const german = await opened(hatchpatFile(), de)
    typed(german, "LUPREC", "4")
    german.select(named(german, "_U").id)
    expect(listed(typed(german, "_LIST")).slice(0, 4)).toEqual([
      "                 Schraffurmuster B",
      "                 Beschriftung: Nein",
      "                 Schraffurabstand für Benutzermuster    5.0000",
      "                 Schraffurwinkel     30",
    ])
  })

  // p06 pt-BR: no space between the angle's label and its column.
  it("lists MYPAT by name and scale, in Portuguese too", async () => {
    const cad = await opened(hatchpatFile(), ptBR)
    typed(cad, "LUPREC", "4")
    cad.select(named(cad, "MYPAT").id)
    expect(listed(typed(cad, "_LIST")).slice(0, 4)).toEqual([
      "                 Padrão de hachura MYPAT",
      "                 Anotativo: Não",
      "                 Escala de hachura    2.0000",
      "                 Ângulo de hachura     0",
    ])
  })

  // ax26res 84; the Scale of a User-defined one is not typed (its Spacing
  // and Double rows are not built).
  it("names the type in the palette", async () => {
    const cad = await opened()
    const rows = (name: string) => {
      cad.select(named(cad, name).id)
      const all = cad.state().properties.info?.groups.flatMap((g) => g.rows)
      cad.escape()
      return all ?? []
    }
    const custom = rows("MYPAT")
    expect(custom.find((r) => r.id === "type")?.value).toBe("Custom")
    expect(custom.find((r) => r.id === "patternName")?.value).toBe("MYPAT")
    const user = rows("_U")
    expect(user.find((r) => r.id === "type")?.value).toBe("User-defined")
    expect(user.find((r) => r.id === "scale")?.edit).toBeUndefined()
  })
})

describe("saving a DXF's pattern", () => {
  it("DXFOUT writes its lines, type and Double as AutoCAD wrote them", async () => {
    const cad = await opened()
    const drawing = parseDxf(hatchpatFile()).drawing
    const { bytes } = writeDxf(drawing, {
      version: "2018",
      binary: false,
      precision: 16,
    })
    const back = parseDxf(bytes).drawing.entities.filter(
      (e): e is HatchEntity => e.type === "hatch"
    )
    for (const hatch of back) {
      const before = named(cad, hatch.patternId)
      expect(hatch.patternType).toBe(before.patternType)
      expect(drawn(hatch)).toEqual(drawn(before))
    }
    const text = new TextDecoder().decode(bytes).replace(/\r\n/g, "\n")
    expect(text).toMatch(/\n {2}2\nMYPAT\n[\s\S]*?\n 76\n {5}2\n/)
    expect(text).toMatch(
      /\n {2}2\n_U\n[\s\S]*?\n 76\n {5}0\n[\s\S]*?\n 77\n {5}1\n/
    )
  })

  it("the drawing file keeps them (version 55)", async () => {
    const cad = await opened()
    const back = parseDrawingFile(
      serializeDrawing(documentSnapshot(cad.runtime.document))
    )
    const reread = back.entities.filter(
      (e): e is HatchEntity => e.type === "hatch"
    )
    expect(reread.map((h) => [h.patternId, h.patternType])).toEqual([
      ["MYPAT", "custom"],
      ["_U", "user"],
    ])
    expect(reread[0].patternLines).toEqual(named(cad, "MYPAT").patternLines)
  })

  it("a file's malformed lines are dropped, a User-defined one drawn 1 apart", async () => {
    const cad = await opened()
    const file = JSON.parse(
      serializeDrawing(documentSnapshot(cad.runtime.document))
    ) as { entities: Record<string, unknown>[] }
    const [mypat, user] = file.entities.filter((e) => e.type === "hatch")
    mypat.patternLines = [{ angle: 0, deltaY: 0 }, "line"]
    delete user.patternLines
    const [custom, bare] = parseDrawingFile(
      JSON.stringify(file)
    ).entities.filter((e): e is HatchEntity => e.type === "hatch")
    expect(custom.patternLines).toBeUndefined()
    expect(bare.patternLines).toBeUndefined()
    expect(hatchLines(bare)).toHaveLength(1)
    expect(drawn(bare).length).toBeGreaterThan(0)
  })
})
