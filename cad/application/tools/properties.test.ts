import { describe, expect, it } from "vitest"
import type { LineEntity } from "../../domain/entities"
import { createHarness, type CadHarness } from "../../../test/harness"
import { layerOf, lineOf, p } from "../../../test/builders"
import { es } from "../../locales/es"
import { THEME } from "../../scene/theme"

/**
 * MATCHPROP paints the source object's general properties onto the objects
 * picked after it. What matters is that the destination ends up *drawn like*
 * the source: an override the source does not have is cleared, not left alone.
 */

function paint(cad: CadHarness) {
  return cad.command("MATCHPROP")
}

describe("MATCHPROP", () => {
  it("copies the source layer onto the picked object", () => {
    const cad = createHarness()
    cad.runtime.document.load(
      [
        lineOf(p(0, 0), p(100, 0), { id: "src", layerId: "red" }),
        lineOf(p(0, 100), p(100, 100), { id: "dst" }),
      ],
      { layers: [layerOf("0"), layerOf("red", { color: "#ff0000" })] }
    )

    paint(cad).click(p(50, 0)).click(p(50, 100))

    expect(cad.byId("dst").layerId).toBe("red")
    expect(cad.byId("src").layerId).toBe("red")
  })

  it("copies colour, linetype and lineweight overrides", () => {
    const cad = createHarness({
      entities: [
        lineOf(p(0, 0), p(100, 0), { id: "src" }),
        lineOf(p(0, 100), p(100, 100), { id: "dst" }),
      ],
    })
    cad.select("src")
    cad.runtime.setSelectionColor("#00ff00")
    cad.runtime.setSelectionLinetype("Dashed")
    cad.runtime.setSelectionLineweight(1.2)

    paint(cad).click(p(50, 0)).click(p(50, 100))

    const destination = cad.byId("dst")
    expect(destination.color).toBe("#00ff00")
    expect(destination.linetype).toBe("Dashed")
    expect(destination.lineweight).toBe(1.2)
  })

  it("clears an override the source does not have", () => {
    const cad = createHarness({
      entities: [
        lineOf(p(0, 0), p(100, 0), { id: "src" }),
        lineOf(p(0, 100), p(100, 100), { id: "dst" }),
      ],
    })
    cad.select("dst")
    cad.runtime.setSelectionColor("#00ff00")
    cad.runtime.setSelectionLinetype("Dashed")
    cad.escape()

    paint(cad).click(p(50, 0)).click(p(50, 100))

    const destination = cad.byId("dst")
    expect(destination.color).toBeUndefined()
    expect(destination.linetype).toBeUndefined()
  })

  it("keeps painting until the command ends", () => {
    const cad = createHarness({
      entities: [
        lineOf(p(0, 0), p(100, 0), { id: "src" }),
        lineOf(p(0, 100), p(100, 100), { id: "a" }),
        lineOf(p(0, 200), p(100, 200), { id: "b" }),
      ],
    })
    cad.select("src")
    cad.runtime.setSelectionColor("#0000ff")

    paint(cad).click(p(50, 0)).click(p(50, 100)).click(p(50, 200))

    expect(cad.byId("a").color).toBe("#0000ff")
    expect(cad.byId("b").color).toBe("#0000ff")
    expect(cad.activeToolId()).toBe("matchprop")

    cad.escape()
    expect(cad.activeToolId()).toBe("select")
  })

  it("paints every object caught by a crossing box in one step", () => {
    const cad = createHarness({
      entities: [
        lineOf(p(-300, 0), p(-200, 0), { id: "src" }),
        lineOf(p(0, 100), p(100, 100), { id: "a" }),
        lineOf(p(0, 200), p(100, 200), { id: "b" }),
      ],
    })
    cad.select("src")
    cad.runtime.setSelectionColor("#123456")

    paint(cad).click(p(-250, 0)).drag(p(200, 300), p(-50, 50))

    expect(cad.byId("a").color).toBe("#123456")
    expect(cad.byId("b").color).toBe("#123456")

    cad.undo()
    expect(cad.byId("a").color).toBeUndefined()
    expect(cad.byId("b").color).toBeUndefined()
  })

  it("never paints the source onto itself", () => {
    const cad = createHarness()
    cad.runtime.document.load(
      [
        {
          ...lineOf(p(0, 0), p(100, 0), { id: "src", layerId: "red" }),
          color: "#00ff00",
          linetype: "Dashed",
          lineweight: 0.5,
        },
      ],
      { layers: [layerOf("0"), layerOf("red")] }
    )

    paint(cad).click(p(50, 0)).click(p(50, 0)).enter()

    expect(cad.byId("src")).toMatchObject({
      layerId: "red",
      color: "#00ff00",
      linetype: "Dashed",
      lineweight: 0.5,
    })
    expect(cad.entityCount).toBe(1)
  })

  it("changes no geometry", () => {
    const cad = createHarness({
      entities: [
        lineOf(p(0, 0), p(100, 0), { id: "src" }),
        lineOf(p(0, 100), p(100, 100), { id: "dst" }),
      ],
    })

    paint(cad).click(p(50, 0)).click(p(50, 100))

    const destination = cad.byId<LineEntity>("dst")
    expect(destination.start).toBeCloseToPoint(p(0, 100))
    expect(destination.end).toBeCloseToPoint(p(100, 100))
  })
})

/** An answer typed at the command line and confirmed, as the console takes it. */
function typed(cad: CadHarness, text: string): CadHarness {
  cad.runtime.setCommandLineText(text)
  cad.runtime.submitCommandLine()
  return cad
}

const SETTINGS =
  "Current active settings:  Color Layer Ltype Lineweight Thickness Dim Text Hatch"

/** A source on `red`, a destination at y 50, one on the locked `LK` at y 100. */
function withLocked(cad: CadHarness, sourceLayer = "red"): CadHarness {
  cad.runtime.document.load(
    [
      lineOf(p(0, 0), p(100, 0), { id: "S", layerId: sourceLayer }),
      lineOf(p(0, 50), p(100, 50), { id: "D" }),
      lineOf(p(0, 100), p(100, 100), { id: "K", layerId: "LK" }),
    ],
    {
      layers: [layerOf("0"), layerOf("red"), layerOf("LK", { locked: true })],
    }
  )
  return cad
}

// The words of AutoCAD 2027's MATCHPROP: its string table acmatchRes.dll (en-US
// and es-ES), the desktop's history (probes properties/d07, d08 in English,
// e02 in Spanish). `[Settings]` is left out of the destination prompt while
// the dialog it opens does not exist (PROPS-D46).
describe("MATCHPROP asks as AutoCAD 2027", () => {
  it("asks the source, writes the settings, then paints each destination selection as it is made (d07)", () => {
    const cad = createHarness()
    cad.runtime.document.load(
      [
        lineOf(p(0, 0), p(100, 0), { id: "S", layerId: "red" }),
        lineOf(p(0, 50), p(100, 50), { id: "D" }),
      ],
      { layers: [layerOf("0"), layerOf("red")] }
    )
    cad.command("MATCHPROP")
    expect(cad.state().commandLine.prompt).toBe(
      "MATCHPROP Select source object:"
    )
    cad.click(p(50, 0))
    expect(cad.state().commandLine.prompt).toBe(
      "MATCHPROP Select destination object(s):"
    )
    typed(cad, "L")
    expect(cad.byId<LineEntity>("D").layerId).toBe("red")
    cad.enter()

    expect(cad.commandLog()).toEqual([
      "MATCHPROP",
      "Select source object:",
      SETTINGS,
      "Select destination object(s): L",
      "1 found",
      "Select destination object(s):",
    ])
    expect(cad.activeToolId()).toBe("select")
  })

  it("asks in Spanish AutoCAD's words (acmatchRes 15, 18–26, 35, 13; e02)", () => {
    const cad = createHarness({
      locale: es,
      entities: [
        lineOf(p(0, 0), p(100, 0), { id: "S" }),
        lineOf(p(0, 50), p(100, 50), { id: "D" }),
      ],
    })
    cad.command("IGUALARPROP")
    expect(cad.state().commandLine.prompt).toBe(
      "IGUALARPROP Designe objeto de origen:"
    )
    cad.click(p(50, 0))
    expect(cad.state().commandLine.prompt).toBe(
      "IGUALARPROP Designe objeto(s) de destino:"
    )
    expect(cad.commandLog()).toEqual([
      "IGUALARPROP",
      "Designe objeto de origen:",
      "Parámetros activos actuales:  Color Capa Tlínea Grosor de línea Alt-objeto Acota Texto Sombreado",
    ])
  })

  it("runs as IGUALARPROP, IP and COPIARPROP in Spanish, not COPARPROP (es acad.pgp; acmatchRes 32, 33)", () => {
    for (const name of ["IGUALARPROP", "IP", "COPIARPROP"]) {
      const cad = createHarness({ locale: es })
      cad.command(name)
      expect(cad.activeToolId()).toBe("matchprop")
    }
    const cad = createHarness({ locale: es })
    cad.command("COPARPROP")
    expect(cad.activeToolId()).not.toBe("matchprop")
  })

  it("ends silently at Enter on the source prompt (e02)", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "S" })],
    })
    cad.command("MATCHPROP").enter()
    expect(cad.activeToolId()).toBe("select")
    expect(cad.commandLog()).toEqual(["MATCHPROP", "Select source object:"])
  })

  it("takes one object selected before it as the source (d08-1)", () => {
    const cad = withLocked(createHarness())
    cad.select("S")
    cad.command("MATCHPROP")
    expect(cad.state().commandLine.prompt).toBe(
      "MATCHPROP Select destination object(s):"
    )
    expect(cad.commandLog()).toEqual(["MATCHPROP", SETTINGS])
    cad.click(p(50, 50))
    expect(cad.byId("D").layerId).toBe("red")
  })

  // PROPS-D71, unverified: acmatchRes 11 `Only one entity can be selected as
  // source object.` suggests AutoCAD refuses the set; here it is dropped.
  it("asks the source when several objects were selected before it", () => {
    const cad = withLocked(createHarness())
    cad.select("S", "D")
    cad.command("MATCHPROP")
    expect(cad.state().commandLine.prompt).toBe(
      "MATCHPROP Select source object:"
    )
  })

  it("takes a source on a locked layer (d08-3)", () => {
    const cad = withLocked(createHarness())
    cad.command("MATCHPROP").click(p(50, 100))
    expect(cad.state().commandLine.prompt).toBe(
      "MATCHPROP Select destination object(s):"
    )
    cad.click(p(50, 50))
    expect(cad.byId("D").layerId).toBe("LK")
  })

  it("says a locked destination cannot be updated and asks again (d07; acmatchRes 28)", () => {
    const cad = withLocked(createHarness())
    cad.command("MATCHPROP").click(p(50, 0)).click(p(50, 100))

    expect(cad.byId("K").layerId).toBe("LK")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Select destination object(s):",
      "Destination object on a locked layer. Cannot be updated.",
    ])
    expect(cad.state().commandLine.prompt).toBe(
      "MATCHPROP Select destination object(s):"
    )
    cad.click(p(50, 50))
    expect(cad.byId("D").layerId).toBe("red")
  })

  it("says it in Spanish (acmatchRes 28, es)", () => {
    const cad = withLocked(createHarness({ locale: es }))
    cad.command("IGUALARPROP").click(p(50, 0)).click(p(50, 100))
    expect(cad.commandLog().at(-1)).toBe(
      "El objeto de destino no puede actualizarse porque se encuentra en una capa bloqueada."
    )
  })

  // PROPS-D70: AutoCAD's answer to a window over a locked destination was not
  // probed (unverified); it leaves them out with the pick's words.
  it("leaves a window's locked objects out with the same words", () => {
    const cad = withLocked(createHarness())
    cad
      .command("MATCHPROP")
      .click(p(50, 0))
      .click(p(-10, 40))
      .click(p(110, 110))

    expect(cad.byId("D").layerId).toBe("red")
    expect(cad.byId("K").layerId).toBe("LK")
    expect(cad.commandLog()).toContain(
      "Destination object on a locked layer. Cannot be updated."
    )
  })

  it("is one step U names MATCHPROP (d07)", () => {
    const cad = withLocked(createHarness())
    cad.command("MATCHPROP").click(p(50, 0)).click(p(50, 50)).enter()
    typed(cad, "U")

    expect(cad.byId("D").layerId).toBe("0")
    expect(cad.commandLog().slice(-2)).toEqual(["U", "MATCHPROP"])
  })

  it("draws the paintbrush beside the pick box at the destination prompt (d07-1, d07-4)", () => {
    const cad = withLocked(createHarness())
    const brush = () =>
      cad
        .scene()
        .primitives.filter(
          (q) => q.kind === "path" && q.fill === THEME.paintBadge
        )

    cad.command("MATCHPROP").moveTo(p(50, 200))
    expect(brush()).toEqual([])
    cad.click(p(50, 0)).moveTo(p(50, 200))
    expect(brush()).not.toEqual([])
    cad.escape()
    expect(brush()).toEqual([])
  })
})
