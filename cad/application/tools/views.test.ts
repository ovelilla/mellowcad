import { describe, expect, it } from "vitest"
import { withDeltaZ, withElevation, withThickness } from "../../domain/entities"
import type { Vec3 } from "../../geometry/Vec3"
import type { ScenePrimitive } from "../../scene/types"
import { createHarness, type CadHarness } from "../../../test/harness"
import { circleOf, lineOf, p, textOf } from "../../../test/builders"
import { entityScreenOutline } from "../viewOutline"
import { es } from "../../locales/es"

const ROOT3 = Math.sqrt(3)

function direction(cad: CadHarness) {
  return cad.runtime.viewport.direction
}

/** `v` against x, y, z coordinate by coordinate, so a -0 reads as 0. */
function expectVector(v: Vec3, x: number, y: number, z: number): void {
  expect(v.x).toBeCloseTo(x, 12)
  expect(v.y).toBeCloseTo(y, 12)
  expect(v.z).toBeCloseTo(z, 12)
}

/** Typed at the command line and confirmed, as the console types it. */
function answer(cad: CadHarness, ...texts: string[]): CadHarness {
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

/** The UCS's name, as UCS's first line reads it. */
function ucsName(cad: CadHarness): string | undefined {
  answer(cad, "_UCS")
  const name = cad.commandLog().at(-1)
  cad.escape()
  return name
}

function screenOf(cad: CadHarness, x: number, y: number, z: number) {
  return cad.runtime.viewport.worldToScreen({ x, y, z })
}

function kinds(cad: CadHarness): ScenePrimitive["kind"][] {
  return cad
    .scene()
    .primitives.filter((primitive) => primitive.kind !== "label")
    .map((primitive) => primitive.kind)
}

describe("VPOINT", () => {
  it("looks from the view point back at the origin, the world's Z up", () => {
    const cad = createHarness({ entities: [lineOf(p(0, 0), p(100, 0))] })

    cad.command("VPOINT").type("1,-1,1").enter()

    expect(direction(cad).x).toBeCloseTo(1 / ROOT3, 12)
    expect(direction(cad).y).toBeCloseTo(-1 / ROOT3, 12)
    expect(direction(cad).z).toBeCloseTo(1 / ROOT3, 12)
    const origin = screenOf(cad, 0, 0, 0)
    const up = screenOf(cad, 0, 0, 10)
    expect(up.x).toBeCloseTo(origin.x, 9)
    expect(up.y).toBeLessThan(origin.y)
    expect(cad.commandLog()).toContain(
      "Current view direction:  VIEWDIR=0.00,0.00,1.00"
    )
    expect(cad.commandLog().at(-1)).toBe("Regenerating model.")
    expect(cad.activeToolId()).toBe("select")
  })

  it("reads the view point in the WCS whatever the UCS (WORLDVIEW 1)", () => {
    const cad = createHarness()
    cad.command("UCS").type("50,50,20").enter().enter()

    cad.command("-VPOINT").type("0,-1,0").enter()

    expect(direction(cad).y).toBeCloseTo(-1, 12)
  })

  it("takes Rotate's two angles, and 270 / 90 is the plan", () => {
    const cad = createHarness()

    cad.command("VPOINT").option("Rotate").type("225").enter()
    cad.type("35.2644").enter()
    expect(direction(cad).x).toBeCloseTo(-1 / ROOT3, 5)
    expect(direction(cad).y).toBeCloseTo(-1 / ROOT3, 5)

    cad.command("VPOINT").option("Rotate").type("270").enter()
    cad.type("90").enter()
    expect(cad.runtime.viewport.isPlan).toBe(true)
  })

  // probes view/p203, p245: 0,0,0 gives VIEWDIR 0,0,1, twist 0, the extents
  // fitted and `Regenerating model.`, and the command ends.
  it("takes a zero view point as the WCS plan, fitted", () => {
    const cad = createHarness({ entities: [lineOf(p(0, 0), p(100, 50))] })
    cad.command("VPOINT").type("1,-1,1").enter()

    cad.command("VPOINT").type("0,0,0").enter()

    expect(cad.commandLog().at(-1)).toBe("Regenerating model.")
    expect(cad.activeToolId()).toBe("select")
    expect(cad.runtime.viewport.isPlan).toBe(true)
    expectVector(cad.runtime.viewport.right, 1, 0, 0)
    expect(cad.runtime.viewport.worldCenter()).toBeCloseToPoint(p(50, 25))
  })

  it("leaves the view at Enter", () => {
    const cad = createHarness()
    cad.command("VPOINT").type("1,1,1").enter()
    const before = cad.runtime.viewport.direction

    cad.command("VPOINT").type("").enter()

    expect(cad.activeToolId()).toBe("select")
    expectVector(cad.runtime.viewport.direction, before.x, before.y, before.z)
  })

  it("is stepped back through by ZOOM Previous", () => {
    const cad = createHarness()
    cad.command("VPOINT").type("1,1,1").enter()

    cad.command("ZOOM").option("Previous")

    expect(cad.runtime.viewport.isPlan).toBe(true)
  })
})

describe("-VIEW", () => {
  it("restores an orthographic view and fits the extents", () => {
    const line = withElevation(lineOf(p(0, 0), p(100, 0)), 50)
    const cad = createHarness({ entities: [line] })

    cad.command("-VIEW").option("Orthographic").option("Front")

    expect(direction(cad).y).toBeCloseTo(-1, 12)
    const start = screenOf(cad, 0, 0, 50)
    const end = screenOf(cad, 100, 0, 50)
    expect(start.y).toBeCloseTo(end.y, 9)
    // Fitted as ZOOM Extents frames it, a 3 px margin a side (view/p100, p304).
    expect(start.x).toBeCloseTo(3, 6)
    expect(end.x).toBeCloseTo(997, 6)
  })

  it("takes Enter at Orthographic as Top, the plan of the WCS", () => {
    const cad = createHarness()
    cad.command("VPOINT").type("1,1,1").enter()

    cad.command("VIEW").option("Orthographic").enter()

    expect(cad.runtime.viewport.isPlan).toBe(true)
    expectVector(cad.runtime.viewport.right, 1, 0, 0)
  })

  // probes view/p246, p247, p305, p332: -VIEW Bottom, then UCSXDIR / UCSYDIR,
  // and VPOINT then UCS View, read the screen's horizontal — twist 0 is the
  // line of sight's arbitrary-axis X.
  it("shows Bottom with the X to the left, as twist 0 does", () => {
    const cad = createHarness()
    cad.command("-VIEW").option("Orthographic").option("Bottom")
    expectVector(cad.runtime.viewport.right, -1, 0, 0)
    const { xAxis, yAxis } = cad.runtime.document.getSettings().ucs
    expect([xAxis, yAxis]).toEqual([
      { x: -1, y: 0, z: 0 },
      { x: 0, y: 1, z: 0 },
    ])
    expect(cad.state().view.preset).toBe("Bottom")

    const vpoint = createHarness()
    vpoint.command("VPOINT").type("0,0,-1").enter()
    expectVector(vpoint.runtime.viewport.right, -1, 0, 0)
    vpoint.command("VPOINT").type("0.01,0,-1").enter()
    const right = vpoint.runtime.viewport.right
    expect([right.x, right.y, right.z].map((v) => +v.toFixed(4) + 0)).toEqual([
      -1, 0, -0.01,
    ])
  })

  it("answers the preset names AutoCAD's menus type without listing them", () => {
    const cad = createHarness()

    cad.command("-VIEW")
    expect(cad.state().commandOptions.map((option) => option.id)).toEqual([
      "Orthographic",
    ])
    for (const char of "_SWISO") cad.press(char)
    cad.press("Enter")

    expect(direction(cad).x).toBeCloseTo(-1 / ROOT3, 12)
    expect(direction(cad).y).toBeCloseTo(-1 / ROOT3, 12)
    expect(direction(cad).z).toBeCloseTo(1 / ROOT3, 12)
  })
})

describe("PLAN", () => {
  it("brings a view off the plan back to the plan", () => {
    const cad = createHarness()
    cad.command("VPOINT").type("1,-1,1").enter()

    cad.command("PLAN").option("World")

    expect(cad.runtime.viewport.isPlan).toBe(true)
  })

  // probe view/p232: VIEWTWIST 330, the extents' middle 50,25 in the centre.
  it("draws a UCS turned 30 about Z with its X to the right", () => {
    const cad = createHarness({ entities: [lineOf(p(0, 0), p(100, 50))] })
    answer(cad, "UCS", "Z", "30", "PLAN", "")
    const { right, direction } = cad.runtime.viewport
    expectVector(direction, 0, 0, 1)
    expectVector(right, Math.cos(Math.PI / 6), 0.5, 0)
    expect(cad.runtime.viewport.worldCenter()).toBeCloseToPoint(p(50, 25))
  })

  // probe view/p233: looking down the UCS's Z (the WCS's -Y), its X right.
  it("looks down a UCS tilted 90 about X", () => {
    const cad = createHarness({ entities: [lineOf(p(0, 0), p(100, 50))] })
    answer(cad, "UCS", "X", "90", "PLAN", "")
    expectVector(cad.runtime.viewport.direction, 0, -1, 0)
    expectVector(cad.runtime.viewport.right, 1, 0, 0)
  })
})

// AutoCAD 2027's console after LINE 0,0 100,50 and ZOOM E: VIEWDIR (read in
// the aligned UCS), UCSXDIR, UCSYDIR and UCSNAME, en-US and es-ES.
describe("-VIEW's presets", () => {
  const drawn = (locale?: typeof es) =>
    createHarness({ locale, entities: [lineOf(p(0, 0), p(100, 50))] })
  const ucs = (cad: CadHarness) => cad.runtime.document.getSettings().ucs

  type Axis = readonly [number, number, number]
  // probes view/p304–p309
  const ORTHOGRAPHIC: readonly (readonly [
    string,
    Axis,
    Axis,
    Axis,
    string,
    string,
  ])[] = [
    ["_TOP", [0, 0, 1], [1, 0, 0], [0, 1, 0], "*TOP*", "*SUPERIOR*"],
    ["_BOTTOM", [0, 0, -1], [-1, 0, 0], [0, 1, 0], "*BOTTOM*", "*INFERIOR*"],
    ["_FRONT", [0, -1, 0], [1, 0, 0], [0, 0, 1], "*FRONT*", "*FRONTAL*"],
    ["_BACK", [0, 1, 0], [-1, 0, 0], [0, 0, 1], "*BACK*", "*POSTERIOR*"],
    ["_LEFT", [-1, 0, 0], [0, -1, 0], [0, 0, 1], "*LEFT*", "*IZQUIERDA*"],
    ["_RIGHT", [1, 0, 0], [0, 1, 0], [0, 0, 1], "*RIGHT*", "*DERECHA*"],
  ]
  for (const [preset, view, x, y, en, spanish] of ORTHOGRAPHIC) {
    it(`${preset} aligns the UCS with the screen and names it`, () => {
      const cad = answer(drawn(), "_-VIEW", preset)
      expect(cad.commandLog().at(-1)).toBe("Regenerating model.")
      expectVector(direction(cad), ...view)
      expectVector(cad.runtime.viewport.right, ...x)
      expectVector(ucs(cad).xAxis, ...x)
      expectVector(ucs(cad).yAxis, ...y)
      expect(ucsName(cad)).toBe(`Current ucs name:  ${en}`)
      const inSpanish = answer(drawn(es), "_-VIEW", preset)
      expect(ucsName(inSpanish)).toBe(`Nombre de scp actual:  ${spanish}`)
    })
  }

  // probes view/p310–p313
  for (const preset of ["_SWISO", "_SEISO", "_NEISO", "_NWISO"]) {
    it(`${preset} looks from its corner and leaves the WCS`, () => {
      const cad = answer(drawn(), "_-VIEW", preset)
      const sign = { SW: [-1, -1], SE: [1, -1], NE: [1, 1], NW: [-1, 1] }[
        preset.slice(1, 3) as "SW" | "SE" | "NE" | "NW"
      ]
      expectVector(direction(cad), sign[0] / ROOT3, sign[1] / ROOT3, 1 / ROOT3)
      expect(ucsName(cad)).toBe("Current ucs name:  *WORLD*")
    })
  }

  // probes view/p304, p310: Top's VIEWSIZE is ZOOM Extents', an iso view's
  // is its own fit, which ZOOM Extents then keeps.
  it("fits the extents", () => {
    const cad = answer(drawn(), "_ZOOM", "_E")
    const extents = cad.runtime.viewport.scale
    answer(cad, "_-VIEW", "_TOP")
    expect(cad.runtime.viewport.scale / extents).toBeCloseTo(1, 6)
    answer(cad, "_-VIEW", "_SWISO")
    const iso = cad.runtime.viewport.scale
    answer(cad, "_ZOOM", "_E")
    expect(cad.runtime.viewport.scale / iso).toBeCloseTo(1, 6)
  })

  // probe view/p330: from the WCS, whatever the UCS before.
  it("aligns an orthographic view's UCS from the WCS after UCS Z 30", () => {
    const cad = answer(drawn(), "UCS", "Z", "30", "_-VIEW", "_FRONT")
    expectVector(ucs(cad).xAxis, 1, 0, 0)
    expectVector(ucs(cad).yAxis, 0, 0, 1)
  })

  // probe view/p331
  it("keeps the UCS at an iso view after UCS Z 30, looking from the WCS's SW", () => {
    const cad = answer(drawn(), "UCS", "Z", "30", "_-VIEW", "_SWISO")
    expectVector(direction(cad), -1 / ROOT3, -1 / ROOT3, 1 / ROOT3)
    expectVector(ucs(cad).xAxis, Math.cos(Math.PI / 6), 0.5, 0)
  })
})

describe("the scene off the plan", () => {
  it("draws a circle as the ellipse its plane shows", () => {
    const cad = createHarness({ entities: [circleOf(p(0, 0), 50)] })

    cad.command("-VIEW").option("Orthographic").option("Front")
    const edgeOn = cad
      .scene()
      .primitives.find((primitive) => primitive.kind === "ellipse")
    expect(edgeOn?.kind === "ellipse" && edgeOn.radiusY).toBeLessThan(0.02)

    cad.command("VPOINT").type("1,-1,1").enter()
    const ellipse = cad
      .scene()
      .primitives.find((primitive) => primitive.kind === "ellipse")
    if (ellipse?.kind !== "ellipse") throw new Error("no ellipse")
    expect(ellipse.radiusY / ellipse.radiusX).toBeCloseTo(1 / ROOT3, 6)
  })

  it("draws an object's thickness: two faces and the edges between", () => {
    const line = withThickness(lineOf(p(0, 0), p(100, 0)), 30)
    const circle = withThickness(circleOf(p(300, 0), 40), 30)
    const cad = createHarness({ entities: [line, circle] })
    cad.press("F7")
    cad.command("VPOINT").type("1,-1,1").enter()

    const primitives = kinds(cad)
    const segments = cad
      .scene()
      .primitives.filter((primitive) => primitive.kind === "segment")
    const joins = (a: { x: number; y: number }, b: { x: number; y: number }) =>
      segments.some(
        (segment) =>
          segment.kind === "segment" &&
          Math.hypot(segment.a.x - a.x, segment.a.y - a.y) < 1e-6 &&
          Math.hypot(segment.b.x - b.x, segment.b.y - b.y) < 1e-6
      )

    expect(joins(screenOf(cad, 0, 0, 0), screenOf(cad, 100, 0, 0))).toBe(true)
    expect(joins(screenOf(cad, 0, 0, 30), screenOf(cad, 100, 0, 30))).toBe(true)
    expect(joins(screenOf(cad, 0, 0, 0), screenOf(cad, 0, 0, 30))).toBe(true)
    expect(joins(screenOf(cad, 100, 0, 0), screenOf(cad, 100, 0, 30))).toBe(
      true
    )
    expect(primitives.filter((kind) => kind === "ellipse").length).toBe(2)
  })

  it("draws a sloping line from end to end at their heights", () => {
    const line = withDeltaZ(lineOf(p(0, 0), p(100, 0)), 100)
    const cad = createHarness({ entities: [line] })
    cad.press("F7")
    cad.command("-VIEW").option("Orthographic").option("Front")

    const segment = cad
      .scene()
      .primitives.find((primitive) => primitive.kind === "segment")
    if (segment?.kind !== "segment") throw new Error("no segment")
    expect(segment.a).toBeCloseToPoint(screenOf(cad, 0, 0, 0), 9)
    expect(segment.b).toBeCloseToPoint(screenOf(cad, 100, 0, 100), 9)
  })

  it("leans a text with its plane", () => {
    const cad = createHarness({
      entities: [textOf(p(0, 0), "ABC", { height: 10 })],
    })
    cad.command("VPOINT").type("1,-1,1").enter()

    const text = cad
      .scene()
      .primitives.find((primitive) => primitive.kind === "text")
    if (text?.kind !== "text") throw new Error("no text")
    expect(text.matrix).toBeDefined()
    const [a, b] = text.matrix!
    const baseline = {
      x: screenOf(cad, 1, 0, 0).x - screenOf(cad, 0, 0, 0).x,
      y: screenOf(cad, 1, 0, 0).y - screenOf(cad, 0, 0, 0).y,
    }
    expect(Math.atan2(b, a)).toBeCloseTo(Math.atan2(baseline.y, baseline.x), 9)
  })

  it("keeps the plan's primitives, with no matrix on a text", () => {
    const cad = createHarness({
      entities: [
        withThickness(circleOf(p(0, 0), 40), 30),
        textOf(p(0, 0), "ABC", { height: 10 }),
      ],
    })

    const primitives = cad.scene().primitives
    expect(primitives.some((primitive) => primitive.kind === "circle")).toBe(
      true
    )
    const text = primitives.find((primitive) => primitive.kind === "text")
    expect(text?.kind === "text" && text.matrix).toBeUndefined()
  })

  it("outlines a raised object where the scene draws it", () => {
    const circle = withElevation(circleOf(p(0, 0), 50), 100)
    const cad = createHarness({ entities: [circle] })
    cad.command("VPOINT").type("1,-1,1").enter()

    const outline = entityScreenOutline(cad.runtime.viewport, circle).flat()
    const top = screenOf(cad, 0, 0, 100)
    const xs = outline.map((point) => point.x)
    expect((Math.min(...xs) + Math.max(...xs)) / 2).toBeCloseTo(top.x, 6)
  })
})
