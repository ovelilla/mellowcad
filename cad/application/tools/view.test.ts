import { describe, expect, it } from "vitest"
import { createHarness, type CadHarness } from "../../../test/harness"
import { circleOf, lineOf, p } from "../../../test/builders"

/**
 * The view commands. They touch no geometry at all — their whole contract is
 * the camera (scale and what sits at the centre of the view) and, for ZOOM
 * Previous, the history of views a gesture left behind.
 *
 * The default harness viewport is 1000×800 at scale 1, so a framed rectangle's
 * scale is the smaller of `1000 / width` and `800 / height`.
 */

function pointerAt(x: number, y: number, button = 0) {
  return {
    screen: { x, y },
    button,
    shiftKey: false,
    ctrlKey: false,
    altKey: false,
  }
}

function view(cad: CadHarness) {
  return {
    scale: cad.runtime.viewport.scale,
    center: cad.runtime.viewport.worldCenter(),
  }
}

describe("ZOOM", () => {
  it("frames the window picked by two corners", () => {
    const cad = createHarness()

    cad.command("ZOOM").click(p(-100, -100)).click(p(100, 100))

    expect(view(cad).scale).toBeCloseTo(4)
    expect(view(cad).center).toBeCloseToPoint(p(0, 0))
    expect(cad.activeToolId()).toBe("select")
  })

  it("frames a window drawn as a single drag", () => {
    const cad = createHarness()

    cad.runtime.pointerDown(pointerAt(300, 200))
    cad.command("ZOOM")
    cad.runtime.pointerDown(pointerAt(400, 300))
    cad.runtime.pointerMove(pointerAt(600, 500))
    cad.runtime.pointerUp(pointerAt(600, 500))

    // 200×200 screen pixels of world at the original scale of 1.
    expect(view(cad).scale).toBeCloseTo(4)
    expect(cad.activeToolId()).toBe("select")
  })

  it("ignores an empty window and keeps asking", () => {
    const cad = createHarness()

    cad.command("ZOOM").click(p(50, 50)).click(p(50, 50))

    expect(view(cad).scale).toBeCloseTo(1)
    expect(cad.activeToolId()).toBe("zoom")
  })

  it("offers AutoCAD's keywords", () => {
    const cad = createHarness()

    cad.command("ZOOM")

    expect(cad.optionAbbreviations()).toEqual(["A", "E", "P", "S", "W", "O"])
  })

  it("Extents frames the whole drawing", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(400, 0)), lineOf(p(400, 0), p(400, 200))],
    })

    cad.command("ZOOM").option("Extents")

    // 400×200 of world, minus a 40px margin on each side: 920/400 < 720/200.
    expect(view(cad).scale).toBeCloseTo(2.3)
    expect(view(cad).center).toBeCloseToPoint(p(200, 100))
    expect(cad.activeToolId()).toBe("select")
  })

  it("All behaves like Extents (there are no drawing limits)", () => {
    const entities = [
      lineOf(p(0, 0), p(400, 0)),
      lineOf(p(400, 0), p(400, 200)),
    ]
    const extents = createHarness({ entities })
    const all = createHarness({ entities })

    extents.command("ZOOM").option("Extents")
    all.command("ZOOM").option("All")

    expect(view(all).scale).toBeCloseTo(view(extents).scale)
    expect(view(all).center).toBeCloseToPoint(view(extents).center)
  })

  it("Scale multiplies the current magnification", () => {
    const cad = createHarness()

    cad.command("ZOOM").option("Scale").type("2").enter()

    expect(view(cad).scale).toBeCloseTo(2)
    expect(cad.activeToolId()).toBe("select")
  })

  it("rejects a scale factor of zero or less", () => {
    const cad = createHarness()

    cad.command("ZOOM").option("Scale").type("-2").enter()

    expect(view(cad).scale).toBeCloseTo(1)
  })

  it("Object frames the selected objects", () => {
    const cad = createHarness({
      entities: [
        lineOf(p(0, 0), p(400, 0), { id: "l1" }),
        circleOf(p(-900, 0), 50),
      ],
    })
    cad.select("l1")

    cad.command("ZOOM").option("Object")

    expect(view(cad).center).toBeCloseToPoint(p(200, 0))
    expect(cad.activeToolId()).toBe("select")
  })

  it("Object frames the object picked when nothing is selected", () => {
    const cad = createHarness({
      entities: [
        circleOf(p(200, 100), 50, { id: "c1" }),
        lineOf(p(-900, 0), p(-800, 0)),
      ],
    })

    cad.command("ZOOM").option("Object").click(p(250, 100)).enter()

    expect(view(cad).center).toBeCloseToPoint(p(200, 100))
    expect(cad.activeToolId()).toBe("select")
  })

  it("creates no geometry", () => {
    const cad = createHarness({ entities: [lineOf(p(0, 0), p(100, 0))] })

    cad.command("ZOOM").click(p(-10, -10)).click(p(10, 10))

    expect(cad.entityCount).toBe(1)
  })
})

describe("ZOOM Previous", () => {
  it("steps back to the view before the last zoom", () => {
    const cad = createHarness()

    cad.command("ZOOM").click(p(-100, -100)).click(p(100, 100))
    expect(view(cad).scale).toBeCloseTo(4)

    cad.command("ZOOM").option("Previous")

    expect(view(cad).scale).toBeCloseTo(1)
    expect(view(cad).center).toBeCloseToPoint(p(0, 0))
  })

  it("treats one scroll burst as a single view", () => {
    const cad = createHarness()

    cad.wheel(p(0, 0), -100).wheel(p(0, 0), -100).wheel(p(0, 0), -100)
    expect(view(cad).scale).toBeGreaterThan(1)

    cad.runtime.zoomPrevious()

    expect(view(cad).scale).toBeCloseTo(1)
  })

  it("does nothing when there is no earlier view", () => {
    const cad = createHarness()

    expect(cad.runtime.zoomPrevious()).toBe(false)
    expect(view(cad).scale).toBeCloseTo(1)
  })
})

describe("PAN", () => {
  it("slides the view with a left-button drag", () => {
    const cad = createHarness()
    cad.command("PAN")
    const before = cad.runtime.viewport.translation

    cad.runtime.pointerDown(pointerAt(400, 300))
    cad.runtime.pointerMove(pointerAt(450, 320))
    cad.runtime.pointerUp(pointerAt(450, 320))

    expect(cad.runtime.viewport.translation).toEqual({
      x: before.x + 50,
      y: before.y + 20,
    })
    expect(view(cad).scale).toBeCloseTo(1)
  })

  it("does not move the view without a button held", () => {
    const cad = createHarness()
    cad.command("PAN")
    const before = cad.runtime.viewport.translation

    cad.runtime.pointerMove(pointerAt(450, 320))

    expect(cad.runtime.viewport.translation).toEqual(before)
  })

  it("shows the hand cursor instead of the drawing crosshair", () => {
    const cad = createHarness()

    cad.command("PAN")

    expect(cad.host.cursors.at(-1)).toBe("grab")
  })

  it("can be stepped back with ZOOM Previous", () => {
    const cad = createHarness()
    cad.command("PAN")
    const before = cad.runtime.viewport.translation

    cad.runtime.pointerDown(pointerAt(400, 300))
    cad.runtime.pointerMove(pointerAt(500, 300))
    cad.runtime.pointerUp(pointerAt(500, 300))
    cad.runtime.zoomPrevious()

    expect(cad.runtime.viewport.translation).toEqual(before)
  })

  it("ends with Escape, like any other command", () => {
    const cad = createHarness()

    cad.command("PAN").escape()

    expect(cad.activeToolId()).toBe("select")
  })
})
