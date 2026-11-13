import { readFileSync } from "node:fs"
import { gunzipSync } from "node:zlib"
import { describe, expect, it, vi } from "vitest"
import {
  type CadHarness,
  createHarness,
  MemoryFileTransport,
  MemoryStore,
} from "../../test/harness"
import { circleOf, p } from "../../test/builders"
import { es } from "../locales/es"
import { ptBR } from "../locales/pt-BR"
import type { OpenedFile } from "./ports"

// OPEN of a DXF and DXFIN, as AutoCAD 2027 opens one (probes
// scripts/research/probes/dxf/x004–x006, x009, x010): the files are
// AutoCAD's own, of the reference drawing f001.

function fixture(name: string): OpenedFile {
  const path = new URL(
    `../serialization/dxf/fixtures/${name}.dxf.gz`,
    import.meta.url
  )
  return {
    name: `${name}.dxf`,
    bytes: new Uint8Array(gunzipSync(readFileSync(path))),
  }
}

function typed(cad: CadHarness, ...texts: string[]): string[] {
  const from = cad.commandLog().length
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad.commandLog().slice(from)
}

/** Waits out OPEN: the pick, then the reader, loaded when a DXF is opened. */
async function opened(
  cad: CadHarness,
  files: MemoryFileTransport
): Promise<void> {
  await vi.waitFor(() => expect(files.openCalls).toBeGreaterThan(0))
  for (let i = 0; i < 3; i++) await new Promise((r) => setTimeout(r, 0))
}

// The reader is a chunk of its own, loaded once here so each OPEN finds it.
await import("../serialization/dxf/readDxf")

// Desktop point/d01: after opening plano-prueba.dxf AutoCAD's Save Drawing
// As offers `plano-prueba.dwg`, DXFOUT `plano-prueba.dxf`; NEW is a drawing
// of no name again.
describe("the drawing's name", () => {
  it("is the file opened, which Save Drawing As offers", async () => {
    const files = new MemoryFileTransport(fixture("fixture-2018"))
    const cad = createHarness({ files })
    cad.command("OPEN")
    await opened(cad, files)
    typed(cad, "SAVEAS")
    expect(cad.state().saveAsDialog?.fileName).toBe("fixture-2018.ecad.json")
    cad.runtime.setSaveAsDialog(false)
    typed(cad, "DXFOUT")
    expect(cad.state().saveAsDialog?.fileName).toBe("fixture-2018.dxf")
    cad.runtime.setSaveAsDialog(false)
    typed(cad, "NEW")
    typed(cad, "SAVEAS")
    expect(cad.state().saveAsDialog?.fileName).toMatch(
      /^drawing-.*\.ecad\.json$/
    )
  })
})

describe("OPEN of a DXF", () => {
  it("replaces the drawing with the file's and says what it left out", async () => {
    const files = new MemoryFileTransport(fixture("fixture-2018"))
    const cad = createHarness({ entities: [circleOf(p(0, 0), 5)], files })
    const from = cad.commandLog().length
    cad.command("OPEN")
    await opened(cad, files)

    expect(cad.entityCount).toBe(34)
    expect(cad.runtime.document.getLayers().map((l) => l.name)).toContain(
      "Señales"
    )
    expect(cad.commandLog().slice(from)).toEqual([
      "OPEN",
      "4 objects not opened: 1 XLINE, 1 RAY, 1 3DSOLID, 1 REGION.",
      "1 object in a layout not opened.",
    ])
  })

  it("offers drawings and DXF; DXFIN offers DXF alone", async () => {
    const files = new MemoryFileTransport(null)
    const cad = createHarness({ files })
    cad.command("OPEN")
    cad.command("DXFIN")
    await vi.waitFor(() => expect(files.openCalls).toBe(2))
    expect(files.openedKinds).toEqual([["drawing", "dxf"], ["dxf"]])
  })

  it("reads binary DXF and DXF given as text by a host that reads text", async () => {
    for (const file of [
      fixture("fixture-2018-bin"),
      new TextDecoder().decode(fixture("fixture-2018").bytes),
    ]) {
      const files = new MemoryFileTransport(file)
      const cad = createHarness({ files })
      cad.command("OPEN")
      await opened(cad, files)
      expect(cad.entityCount).toBe(34)
    }
  })

  it("starts a history of its own and autosaves what it opened", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    try {
      const store = new MemoryStore()
      const files = new MemoryFileTransport(fixture("fixture-2018"))
      const cad = createHarness({ files, store })
      typed(cad, "_LINE", "0,0", "10,0", "")
      cad.command("OPEN")
      await opened(cad, files)
      expect(store.writes.at(-1)).toContain("Señales")
      typed(cad, "_U")
      expect(cad.entityCount).toBe(34)
    } finally {
      vi.useRealTimers()
    }
  })

  it("says nothing more for a file it opens whole", async () => {
    const text = [
      "  0",
      "SECTION",
      "  2",
      "ENTITIES",
      "  0",
      "LINE",
      "  8",
      "0",
      " 10",
      "0",
      " 20",
      "0",
      " 11",
      "10",
      " 21",
      "0",
      "  0",
      "ENDSEC",
      "  0",
      "EOF",
    ].join("\n")
    const files = new MemoryFileTransport({
      name: "line.dxf",
      bytes: new TextEncoder().encode(text),
    })
    const cad = createHarness({ files })
    const from = cad.commandLog().length
    cad.command("OPEN")
    await opened(cad, files)
    expect(cad.entityCount).toBe(1)
    expect(cad.commandLog().slice(from)).toEqual(["OPEN"])
  })
})

describe("a DXF AutoCAD discards (x009, x010)", () => {
  it("is no DXF: three lines, the drawing kept", async () => {
    const files = new MemoryFileTransport({
      name: "garbage.dxf",
      bytes: new TextEncoder().encode("hello world\nthis is not a dxf"),
    })
    const cad = createHarness({ entities: [circleOf(p(0, 0), 5)], files })
    const from = cad.commandLog().length
    cad.command("OPEN")
    await opened(cad, files)
    expect(cad.commandLog().slice(from)).toEqual([
      "OPEN",
      "Error in drawing header on line 1.",
      "garbage.dxf is not valid DXF file",
      "Invalid or incomplete DXF input -- drawing discarded.",
    ])
    expect(cad.entityCount).toBe(1)
  })

  it("ends inside a section: where it broke", async () => {
    const whole = fixture("fixture-2018")
    const files = new MemoryFileTransport({
      name: "cut.dxf",
      bytes: whole.bytes.subarray(0, 60000),
    })
    const cad = createHarness({ files })
    cad.command("OPEN")
    await opened(cad, files)
    const log = cad.commandLog()
    expect(log.at(-2)).toMatch(/^DXF read error on line \d+\.$/)
    expect(log.at(-1)).toBe(
      "Invalid or incomplete DXF input -- drawing discarded."
    )
  })

  it("DXFIN reads a drawing of ours as a DXF, which it is not", async () => {
    const source = createHarness({ entities: [circleOf(p(0, 0), 5)] })
    const files = new MemoryFileTransport({
      name: "drawing.json",
      bytes: new TextEncoder().encode(source.runtime.serializeDrawing()),
    })
    const cad = createHarness({ files })
    cad.command("DXFIN")
    await opened(cad, files)
    expect(cad.commandLog().at(-2)).toBe("drawing.json is not valid DXF file")
    expect(cad.entityCount).toBe(0)
  })
})

describe("in the command languages", () => {
  it("Spanish: CARGADXF is DXFIN, and its report and AutoCAD's lines in Spanish", async () => {
    const files = new MemoryFileTransport(fixture("fixture-2018"))
    const cad = createHarness({ locale: es, files })
    const from = cad.commandLog().length
    typed(cad, "CARGADXF")
    await opened(cad, files)
    expect(files.openedKinds).toEqual([["dxf"]])
    expect(cad.commandLog().slice(from)).toEqual([
      "CARGADXF",
      "4 objetos no abiertos: 1 XLINE, 1 RAY, 1 3DSOLID, 1 REGION.",
      "1 objeto de una presentación no abierto.",
    ])
    const garbage = new MemoryFileTransport({
      name: "basura.dxf",
      bytes: new TextEncoder().encode("hola"),
    })
    const again = createHarness({ locale: es, files: garbage })
    typed(again, "ABRE")
    await opened(again, garbage)
    expect(again.commandLog().slice(-3)).toEqual([
      "Error en el encabezamiento del dibujo en línea 1.",
      "basura.dxf no es un archivo DXF válido",
      "Entrada DXF no válida o incompleta -- dibujo descartado.",
    ])
  })

  it("Brazilian Portuguese: IMPDXF is DXFIN, no longer OPEN's alias", async () => {
    const files = new MemoryFileTransport(fixture("fixture-2018"))
    const cad = createHarness({ locale: ptBR, files })
    typed(cad, "IMPDXF")
    await opened(cad, files)
    expect(files.openedKinds).toEqual([["dxf"]])
    expect(cad.commandLog().slice(-2)).toEqual([
      "4 objetos não abertos: 1 XLINE, 1 RAY, 1 3DSOLID, 1 REGION.",
      "1 objeto de um layout não aberto.",
    ])
  })
})

describe("a file the host already holds (openFile)", () => {
  it("opens as OPEN's pick does: the drawing replaced, what it left out said", async () => {
    const cad = createHarness({ entities: [circleOf(p(0, 0), 5)] })
    const from = cad.commandLog().length
    await cad.runtime.openFile(fixture("fixture-2018"))
    expect(cad.entityCount).toBe(34)
    expect(cad.commandLog().slice(from)).toEqual([
      "4 objects not opened: 1 XLINE, 1 RAY, 1 3DSOLID, 1 REGION.",
      "1 object in a layout not opened.",
    ])
  })

  it("says what is no DXF in AutoCAD's lines, the drawing kept", async () => {
    const cad = createHarness({ entities: [circleOf(p(0, 0), 5)] })
    // A DWG's first bytes, its version.
    const dwg = { name: "plan.dwg", bytes: new TextEncoder().encode("AC1032") }
    await cad.runtime.openFile(dwg, ["dxf"])
    expect(cad.commandLog().slice(-2)).toEqual([
      "plan.dwg is not valid DXF file",
      "Invalid or incomplete DXF input -- drawing discarded.",
    ])
    expect(cad.entityCount).toBe(1)
  })
})
