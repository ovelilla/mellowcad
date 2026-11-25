import { describe, expect, it } from "vitest"

import { DEFAULT_DXF_SETTINGS } from "./runtimeFiles"
import { createHarness, MemoryFileTransport } from "../../test/harness"
import { es } from "../locales/es"
import { ja } from "../locales/ja"

// DWGNAME, as AutoCAD 2027's title shows it: a saved drawing by its name
// alone, no path, and nothing marking a change (desktop, 2026-11-25:
// `Planta baja.dwg`); a new one as the session numbers it (acadres 4125,
// `Drawing.dwg`: `Drawing1.dwg`, es `Dibujo1.dwg`).
describe("the drawing's name", () => {
  it("is the session's first new drawing's at the start", () => {
    expect(createHarness().state().drawingName).toBe("Drawing1.dwg")
    expect(createHarness({ locale: es }).state().drawingName).toBe(
      "Dibujo1.dwg"
    )
    // Japanese AutoCAD's table keeps the English name, as every language
    // with no command language of its own does here.
    expect(createHarness({ locale: ja }).state().drawingName).toBe(
      "Drawing1.dwg"
    )
  })

  it("takes the next number with each NEW", () => {
    const cad = createHarness()
    cad.command("NEW")
    expect(cad.state().drawingName).toBe("Drawing2.dwg")
    cad.command("NEW")
    expect(cad.state().drawingName).toBe("Drawing3.dwg")
  })

  it("is the file's once one is opened, and a new drawing's after NEW", async () => {
    const files = new MemoryFileTransport()
    const saved = createHarness({ files })
    saved.command("LINE").type("0,0").enter().type("10,0").enter().enter()
    saved.command("QSAVE")

    const opened = createHarness()
    await opened.runtime.openFile({
      name: "Planta baja.ecad.json",
      bytes: new TextEncoder().encode(files.saved[0].text),
    })
    expect(opened.state().drawingName).toBe("Planta baja.ecad.json")
    expect(opened.state().drawingTitled).toBe(true)
    opened.command("NEW")
    expect(opened.state().drawingName).toBe("Drawing2.dwg")
    expect(opened.state().drawingTitled).toBe(false)
  })

  it("is the file's QSAVE wrote a new drawing to, and stays", () => {
    const files = new MemoryFileTransport()
    const cad = createHarness({ files })
    cad.command("QSAVE")
    const written = files.saved[0].fileName
    expect(cad.state().drawingName).toBe(written)
    expect(cad.state().drawingTitled).toBe(true)
    cad.command("QSAVE")
    expect(files.saved[1].fileName).toBe(written)
  })

  it("is the name SAVEAS wrote the drawing under", async () => {
    const cad = createHarness({ files: new MemoryFileTransport() })
    cad.command("SAVEAS")
    await cad.runtime.saveAs({
      fileName: "plan",
      fileType: "drawing",
      dxf: DEFAULT_DXF_SETTINGS,
    })
    expect(cad.state().drawingName).toBe("plan.ecad.json")
  })
})
