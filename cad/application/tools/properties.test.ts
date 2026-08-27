import { describe, expect, it } from "vitest"
import type { LineEntity } from "../../domain/entities"
import { DEFAULT_LINETYPE_ID } from "../../domain/linetypes"
import { createHarness, type CadHarness } from "../../../test/harness"
import { layerOf, lineOf, p } from "../../../test/builders"

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
      undefined,
      [layerOf("0"), layerOf("red", { color: "#ff0000" })]
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
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "src" })],
    })

    paint(cad).click(p(50, 0)).click(p(50, 0))

    expect(cad.byId("src").linetype ?? DEFAULT_LINETYPE_ID).toBe("Continuous")
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
