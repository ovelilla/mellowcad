import { describe, expect, it } from "vitest"
import { createHarness, type CadHarness } from "../../../test/harness"
import { circleOf, lineOf, p } from "../../../test/builders"
import { es as spanish } from "../../locales/es"

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

/** Typed at the command line and confirmed, as the probes type it. */
function answer(cad: CadHarness, ...texts: string[]): CadHarness {
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

/** VIEWSIZE: the view's height in drawing units. */
const viewSize = (cad: CadHarness) =>
  cad.runtime.viewport.height / cad.runtime.viewport.scale

const aspect = (cad: CadHarness) =>
  cad.runtime.viewport.width / cad.runtime.viewport.height

/** The probes' drawing, a line 0,0 to 100,50, framed by ZOOM Extents. */
function framed(locale?: typeof spanish): CadHarness {
  const cad = createHarness({
    locale,
    entities: [lineOf(p(0, 0), p(100, 50), { id: "L" })],
  })
  return answer(cad, "_ZOOM", "_E")
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

  // probes view/p120 (Window), p121 (a point at the first prompt)
  it("ends with *Invalid* at a window of no size, the view left", () => {
    for (const [locale, invalid] of [
      [undefined, "*Invalid*"],
      [spanish, "*No válido*"],
    ] as const) {
      for (const typed of [
        ["_W", "10,10", "10,10"],
        ["10,10", "10,10"],
      ]) {
        const cad = framed(locale)
        const size = viewSize(cad)
        answer(cad, "_ZOOM", ...typed)
        expect(cad.commandLog().at(-1)).toBe(invalid)
        expect(cad.activeToolId()).toBe("select")
        expect(viewSize(cad)).toBeCloseTo(size, 6)
      }
    }
    const picked = createHarness()
    picked.command("ZOOM").click(p(50, 50)).click(p(50, 50))
    expect(picked.commandLog().at(-1)).toBe("*Invalid*")
    expect(view(picked).scale).toBeCloseTo(1)
    expect(picked.activeToolId()).toBe("select")
  })

  // probe view/p121: the first prompt's point is LASTPOINT all the same.
  it("keeps the first prompt's point as LASTPOINT after *Invalid*", () => {
    const cad = answer(framed(), "_ZOOM", "10,10", "10,10", "ID", "@")
    expect(cad.commandLog().at(-1)).toBe(
      " X = 10.00     Y = 10.00     Z = 0.00"
    )
  })

  // probes view/p156, p157: the extent that is not zero is framed.
  it("frames a window of no width or no height by the other", () => {
    const tall = answer(framed(), "_ZOOM", "_W", "10,10", "10,50")
    expect(view(tall).center).toBeCloseToPoint(p(10, 30), 6)
    expect(viewSize(tall)).toBeCloseTo(40, 6)
    const wide = answer(framed(), "_ZOOM", "_W", "10,10", "50,10")
    expect(view(wide).center).toBeCloseToPoint(p(30, 10), 6)
    expect(viewSize(wide)).toBeCloseTo(40 / aspect(wide), 6)
    expect(wide.activeToolId()).toBe("select")
  })

  // probe view/p138: a window is framed exactly, with no margin.
  it("fits a window exactly", () => {
    const cad = answer(framed(), "_ZOOM", "_W", "0,0", "100,10")
    expect(viewSize(cad)).toBeCloseTo(100 / aspect(cad), 6)
    expect(view(cad).center).toBeCloseToPoint(p(50, 5), 6)
  })

  // probes view/p122 (@ from LASTPOINT, then from the first corner), p123
  // (polar), p124 and p133 (@ alone, at Window's corner and the first
  // prompt), p125 (*x,y in a UCS turned 30°, the window upright on the
  // screen), p126 (# refused).
  it("reads a typed corner in each of AutoCAD's forms", () => {
    const relative = answer(framed(), "ID", "10,10")
    answer(relative, "_ZOOM", "_W", "@5,5", "@50,25")
    expect(view(relative).center).toBeCloseToPoint(p(40, 27.5), 6)

    const polar = answer(framed(), "_ZOOM", "_W", "10<0", "50<45")
    expect(view(polar).center).toBeCloseToPoint(p(22.6777, 17.6777), 4)
    expect(viewSize(polar)).toBeCloseTo(35.3553, 4)

    for (const typed of [
      ["_W", "@", "50,50"],
      ["@", "50,50"],
    ]) {
      const cad = answer(framed(), "ID", "10,10", "_ZOOM", ...typed)
      expect(view(cad).center).toBeCloseToPoint(p(30, 30), 6)
      expect(viewSize(cad)).toBeCloseTo(40, 6)
    }

    const world = answer(framed(), "_UCS", "_Z", "30")
    answer(world, "_ZOOM", "_W", "*0,0", "*50,25")
    expect(view(world).center).toBeCloseToPoint(p(25, 12.5), 4)
    expect(viewSize(world)).toBeCloseTo(50 / aspect(world), 4)

    const hash = answer(framed(), "_ZOOM", "_W", "#0,0")
    expect(hash.commandLog().slice(-2)).toEqual([
      "Specify first corner: #0,0",
      "Invalid window specification.",
    ])
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

    // probes view/p100, p108: about 3 px a side, 994/400 < 794/200.
    expect(view(cad).scale).toBeCloseTo(2.485)
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

  // probes view/p114, p116
  it("rejects a scale factor of zero or less, and asks again", () => {
    const cad = createHarness()

    cad.command("ZOOM").option("Scale").type("-2").enter()

    expect(view(cad).scale).toBeCloseTo(1)
    expect(cad.commandLog().at(-1)).toBe("Value must be positive and nonzero.")
    expect(cad.activeToolId()).toBe("zoom")
    cad.type("2").enter()
    expect(view(cad).scale).toBeCloseTo(2)
    expect(cad.activeToolId()).toBe("select")
  })

  // probe view/p115
  it("ends at Enter at Scale's prompt, the view left", () => {
    const cad = framed()
    const size = viewSize(cad)
    answer(cad, "_ZOOM", "_S", "")
    expect(cad.commandLog().at(-1)).toBe("Enter a scale factor (nX or nXP):")
    expect(cad.activeToolId()).toBe("select")
    expect(viewSize(cad)).toBeCloseTo(size, 6)
  })

  // probe view/p158: after a window 0,0 20,20, `2` is half ZOOM All's
  // height about the view's own centre (p135 keeps it in an empty drawing).
  it("keeps the view's centre at a factor without X, at All's scale", () => {
    const cad = framed()
    const all = view(cad).scale
    answer(cad, "_ZOOM", "_W", "0,0", "20,20", "_ZOOM", "2")
    expect(view(cad).center).toBeCloseToPoint(p(10, 10), 6)
    expect(view(cad).scale).toBeCloseTo(all * 2, 6)
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

  // probe view/p147: the set is counted, framed, regenerated and dropped.
  it("Object counts a preselected set, then drops it", () => {
    const cad = answer(framed(), "_ZOOM", "_W", "0,0", "10,10")
    cad.select("L")
    answer(cad, "_ZOOM", "_O")
    expect(cad.commandLog().slice(-3)).toEqual([
      "Specify corner of window, enter a scale factor (nX or nXP), or [All/Extents/Previous/Scale/Window/Object]: _O",
      "1 found",
      "Regenerating model.",
    ])
    expect(view(cad).center).toBeCloseToPoint(p(50, 25), 6)
    expect(cad.selectedIds()).toEqual([])
  })

  // probes view/p148–p150: every ZOOM drops the set selected before it.
  it.each([["_E"], ["2X"], ["_W", "0,0", "50,50"]])(
    "drops a preselection after %s",
    (...typed) => {
      const cad = framed()
      cad.select("L")
      answer(cad, "_ZOOM", ...typed)
      expect(cad.activeToolId()).toBe("select")
      expect(cad.selectedIds()).toEqual([])
    }
  )

  // probe view/p152
  it("Object ends silently at Enter with nothing selected", () => {
    const cad = framed()
    const size = viewSize(cad)
    answer(cad, "_ZOOM", "_O", "")
    expect(cad.commandLog().at(-1)).toBe("Select objects:")
    expect(cad.activeToolId()).toBe("select")
    expect(viewSize(cad)).toBeCloseTo(size, 6)
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

  // probe view/p162: 31 views, 20 steps back, then No previous view saved.
  it("keeps 20 views", () => {
    const cad = answer(framed(), "_ZOOM", "_W", "0,0", "1000,1000")
    for (let i = 0; i < 30; i++) answer(cad, "_ZOOM", "1.5X")
    let steps = 0
    for (let i = 0; i < 33; i++) {
      answer(cad, "_ZOOM", "_P")
      if (cad.commandLog().at(-1) === "No previous view saved.") break
      steps++
    }
    expect(steps).toBe(20)
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

    expect(cad.runtime.viewport.translation).toBeCloseToPoint({
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

    expect(cad.runtime.viewport.translation).toBeCloseToPoint(before)
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

    expect(cad.runtime.viewport.translation).toBeCloseToPoint(before)
  })

  // AutoCAD 2023's console, and Autodesk's Spanish table.
  it("says how to leave, as AutoCAD's does", () => {
    const cad = createHarness()
    cad.command("PAN")
    expect(cad.commandLog()).toEqual([
      "PAN",
      "Press ESC or ENTER to exit, or right-click to display shortcut menu.",
    ])

    const es = createHarness({ locale: spanish })
    es.command("ENCUADRE")
    expect(es.commandLog().at(-1)).toBe(
      "Pulse Esc o Intro para salir, o haga clic con el botón derecho para activar el menú contextual."
    )
  })

  it("ends with Escape, like any other command", () => {
    const cad = createHarness()

    cad.command("PAN").escape()

    expect(cad.activeToolId()).toBe("select")
  })
})
