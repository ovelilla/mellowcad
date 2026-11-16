import { readFileSync } from "node:fs"
import { gunzipSync } from "node:zlib"
import { describe, expect, it } from "vitest"
import { createHarness, type CadHarness } from "../../test/harness"
import type { InsertEntity, TextEntity } from "../domain/entities"
import {
  createBlockDefinition,
  insertGeometry,
  unresolvedXref,
} from "../domain/entities"
import {
  parseDrawingFile,
  serializeDrawing,
} from "../serialization/drawingFile"
import { es } from "../locales/es"
import { ru } from "../locales/ru"
import type { EngineLocale } from "../locales/types"
import { documentSnapshot } from "./runtimeFiles"
import type { OpenedFile } from "./ports"

// A DXF with an external reference, as AutoCAD 2027 opens one whose drawing
// it cannot find (probes scripts/research/probes/xref/): the file is
// AutoCAD's own DXFOUT of a line and an xref of `part.dwg` at 200,100,
// scale 2, rotated 30°, once part.dwg was gone (p04's host2.dxf).

const PATH = String.raw`C:\Users\oveli\AppData\Local\Temp\mcadxref\sub\part.dwg`

function xrefFile(): OpenedFile {
  const path = new URL(
    "../serialization/dxf/fixtures/xref-2018.dxf.gz",
    import.meta.url
  )
  return {
    name: "host.dxf",
    bytes: new Uint8Array(gunzipSync(readFileSync(path))),
  }
}

// The reader is a chunk of its own, loaded once here so each open finds it.
await import("../serialization/dxf/readDxf")

async function opened(locale?: EngineLocale): Promise<{
  cad: CadHarness
  log: string[]
}> {
  const cad = createHarness(locale ? { locale } : {})
  const from = cad.commandLog().length
  await cad.openFile(xrefFile())
  return { cad, log: cad.commandLog().slice(from) }
}

function typed(cad: CadHarness, ...texts: string[]): string[] {
  const from = cad.commandLog().length
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad.commandLog().slice(from)
}

const reference = (cad: CadHarness): InsertEntity =>
  cad.entities().find((e): e is InsertEntity => e.type === "insert")!

describe("opening a DXF with an external reference", () => {
  // p01, p14: before `Regenerating model.`, nothing else said of it.
  it("says AutoCAD's two lines for it, and nothing as not opened", async () => {
    const { log } = await opened()
    expect(log).toEqual([
      `Resolve Xref "part": ${PATH}`,
      `"part.dwg" cannot be found.`,
    ])
  })

  it("in the command language (Spanish, Russian)", async () => {
    expect((await opened(es)).log).toEqual([
      `Resolver RefX "part": ${PATH}`,
      `No se puede encontrar "part.dwg".`,
    ])
    expect((await opened(ru)).log).toEqual([
      `Разрешить Вн-ссылки "part": ${PATH}`,
      `"part.dwg" не найдена.`,
    ])
  })

  // p04, p05, p06: `Xref <path>` 2.5 high in Standard at the insertion
  // point, which the reference scales and turns.
  it("keeps the reference, drawn as the text AutoCAD draws in its place", async () => {
    const { cad } = await opened()
    const block = cad.runtime.document.getBlock("part")
    expect(block?.xref).toEqual({ path: PATH })
    const insert = reference(cad)
    expect(insert).toMatchObject({ blockId: "part", scaleX: 2, scaleY: 2 })
    const [label] = insertGeometry(insert, block) as TextEntity[]
    expect(label).toMatchObject({
      type: "text",
      value: `Xref ${PATH}`,
      height: 5,
      styleId: "Standard",
    })
    expect(label?.position).toBeCloseToPoint({ x: 200, y: 100 })
    expect(label?.rotation).toBeCloseTo(Math.PI / 6)
    expect(cad.extents()?.max.y).toBeGreaterThan(190)
  })

  it("labels it in the command language: RefX in Spanish, Вн-ссылка in Russian", async () => {
    const label = (cad: CadHarness) =>
      (cad.runtime.document.getBlock("part")?.entities[0] as TextEntity).value
    expect(label((await opened(es)).cad)).toBe(`RefX ${PATH}`)
    expect(label((await opened(ru)).cad)).toBe(`Вн-ссылка ${PATH}`)
  })

  it("survives the drawing file, its path and label kept", async () => {
    const { cad } = await opened()
    const back = parseDrawingFile(
      serializeDrawing(documentSnapshot(cad.runtime.document))
    )
    const block = back.blocks.find((b) => b.name === "part")
    expect(block?.xref).toEqual({ path: PATH })
    expect((block?.entities[0] as TextEntity).value).toBe(`Xref ${PATH}`)
  })

  it("is written back by DXFOUT, its BLOCK empty with its path", async () => {
    const { cad } = await opened()
    const { parseDxf } = await import("../serialization/dxf/readDxf")
    const written = await cad.writeDxf()
    const back = parseDxf(written.bytes)
    expect(back.report.xrefs).toEqual([{ name: "part", path: PATH }])
    expect(back.drawing.entities.map((e) => e.type)).toEqual(["line", "insert"])
  })

  it("labels one a drawing file of another program's holds with no objects", async () => {
    const { cad } = await opened()
    const file = JSON.parse(
      serializeDrawing(documentSnapshot(cad.runtime.document))
    ) as { blocks: { entities: unknown[] }[] }
    for (const block of file.blocks) block.entities = []
    const other = createHarness()
    await other.openFile(JSON.stringify(file))
    const block = other.runtime.document.getBlock("part")
    expect((block?.entities[0] as TextEntity).value).toBe(`Xref ${PATH}`)
  })

  it("puts the label at its base point's Z, where the reference puts it", () => {
    const label = unresolvedXref(
      {
        ...createBlockDefinition("B", { x: 1, y: 2 }, [], 5),
        xref: { path: "b.dwg" },
      },
      "Xref b.dwg",
      "Standard"
    ).entities[0] as TextEntity
    expect(label).toMatchObject({ position: { x: 1, y: 2 }, elevation: 5 })
  })

  it("is no block the Blocks palette offers", async () => {
    const { cad } = await opened()
    expect(cad.state().blocks).toEqual([])
  })
})

describe("the block commands on an external reference", () => {
  // p08, p17: under the count, after a refusal of its own kind.
  it("EXPLODE refuses it: 1 was an external reference.", async () => {
    const { cad } = await opened()
    const log = typed(cad, "EXPLODE", "ALL", "")
    expect(log).toContain("1 was not able to be exploded.")
    expect(log.indexOf("1 was an external reference.")).toBe(
      log.indexOf("1 was not able to be exploded.") + 1
    )
    expect(cad.entityCount).toBe(2)
    expect(reference(cad).blockId).toBe("part")
  })

  it("Spanish EXPLODE: 1 era una referencia externa.", async () => {
    const { cad } = await opened(es)
    const log = typed(cad, "DESCOMP", "T", "")
    expect(log.indexOf("1 era una referencia externa.")).toBe(
      log.indexOf("1 no se ha podido descomponer.") + 1
    )
    expect(log).toContain("1 era una referencia externa.")
  })

  it("the palette's insert of it does nothing, as -INSERT refuses it", async () => {
    const { cad } = await opened()
    cad.runtime.insertBlock("part")
    expect(cad.activeToolId()).toBe("select")
  })

  // p09, p14: the command ends.
  it("-INSERT refuses its name, and ? lists no xref", async () => {
    const { cad } = await opened()
    expect(typed(cad, "-INSERT", "PART")).toContain(
      "** Error: Cannot INSERT an Xref. Use XREF Attach, instead."
    )
    expect(cad.activeToolId()).toBe("select")
    // p15
    expect(typed(cad, "-INSERT", "?", "*").join("\n")).toContain(
      "Defined blocks.\nUser     Unnamed\nBlocks   Blocks\n    0        0"
    )
  })

  // p11, p14: the command ends.
  it("-BLOCK refuses to redefine it, and ? says it not found", async () => {
    const { cad } = await opened()
    expect(typed(cad, "-BLOCK", "part")).toContain(
      `"part" is an Xref. It cannot be redefined.`
    )
    expect(cad.activeToolId()).toBe("select")
    // p10: `%-31s` of the quoted name, counted under External References.
    const listing = typed(cad, "-BLOCK", "?", "*").join("\n")
    expect(listing).toContain(
      `Defined blocks.\n  "part"                            Xref: not found\nUser     External     Dependent   Unnamed\nBlocks   References   Blocks      Blocks\n    0         1           0           0`
    )
  })

  // p14: right under its name.
  it("LIST says it is an external reference", async () => {
    const { cad } = await opened()
    const report = typed(cad, "LIST", "L", "").at(-1)
    expect(report).toContain(
      `       Block Name: "part"\n                  External reference\n                at point,`
    )
  })

  // p13: a copy is one more reference of the same xref.
  it("COPY copies it as any reference", async () => {
    const { cad } = await opened()
    typed(cad, "COPY", "L", "", "0,0", "0,50", "")
    const copies = cad
      .entities()
      .filter((e): e is InsertEntity => e.type === "insert")
    expect(copies.map((e) => e.blockId)).toEqual(["part", "part"])
  })
})
