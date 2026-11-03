import { describe, expect, it } from "vitest"

import { type CadHarness, createHarness } from "../../test/harness"
import type { Vec2 } from "../geometry/Vec2"
import type { Vec3 } from "../geometry/Vec3"
import { THEME } from "../scene/theme"
import type { ScenePrimitive } from "../scene/types"
import type { Solid3dEntity } from "../domain/entities"

// What the seven primitives draw and show while they ask, as AutoCAD 2027's
// desktop shows it with dynamic input on (desktop primitives/d01, d02, d07,
// d11): the box reads the cursor, an amber dashed band runs from a size's
// base, and the ghost is the solid or the base the cursor gives.

/** Each answer typed at the command line and confirmed, as the console types it. */
function answer(cad: CadHarness, ...texts: string[]): CadHarness {
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

function plan(): CadHarness {
  return answer(createHarness(), "LUPREC", "4")
}

function seIsometric(): CadHarness {
  return answer(createHarness(), "LUPREC", "4", "-VIEW", "_SEISO")
}

/** The dynamic-input box: each field's label and what it reads. */
function box(cad: CadHarness): { label: string; reads: string }[] {
  return (cad.state().dynamicInput?.fields ?? []).map((field) => ({
    label: field.label,
    reads: field.placeholder,
  }))
}

const near = (a: Vec2, b: Vec2) => Math.hypot(a.x - b.x, a.y - b.y) < 1e-6

/** The amber dashed bands drawn, as screen segments. */
function bands(cad: CadHarness): { a: Vec2; b: Vec2 }[] {
  return cad
    .scene()
    .primitives.filter(
      (p): p is Extract<ScenePrimitive, { kind: "segment" }> =>
        p.kind === "segment" && p.stroke.color === THEME.dashedRubberBand
    )
    .map(({ a, b }) => ({ a, b }))
}

/** Whether one band runs from `from` to `to` (world points). */
function hasBand(cad: CadHarness, from: Vec3, to: Vec3): boolean {
  const a = cad.toScreen(from)
  const b = cad.toScreen(to)
  return bands(cad).some((band) => near(band.a, a) && near(band.b, b))
}

/**
 * The ghost's circles in plan: their centre and radius on the screen (scale
 * 1), a solid's edges drawn as round ellipses too.
 */
function circles(cad: CadHarness): { center: Vec2; radius: number }[] {
  return cad.scene().primitives.flatMap((p) => {
    if (!("stroke" in p) || p.stroke?.color !== THEME.entity) return []
    if (p.kind === "circle") return [{ center: p.center, radius: p.radius }]
    if (p.kind === "ellipse" && Math.abs(p.radiusX - p.radiusY) < 1e-9) {
      return [{ center: p.center, radius: p.radiusX }]
    }
    return []
  })
}

/** Every screen point the ghost (the current colour's strokes) passes through. */
function ghostPoints(cad: CadHarness): Vec2[] {
  return cad.scene().primitives.flatMap((p) => {
    if (!("stroke" in p) || p.stroke?.color !== THEME.entity) return []
    if (p.kind === "segment") return [p.a, p.b]
    if (p.kind === "path") return [...p.points]
    return []
  })
}

/** The dotted dimension's segments (the crosshair's colour, dashed). */
function dotted(cad: CadHarness): { a: Vec2; b: Vec2 }[] {
  return cad
    .scene()
    .primitives.filter(
      (p): p is Extract<ScenePrimitive, { kind: "segment" }> =>
        p.kind === "segment" &&
        p.stroke.color === THEME.crosshair &&
        (p.stroke.dash?.length ?? 0) > 0
    )
    .map(({ a, b }) => ({ a, b }))
}

const solids = (cad: CadHarness) =>
  cad.entities().filter((e): e is Solid3dEntity => e.type === "solid3d")

const BASE: Vec3 = { x: 300, y: 100, z: 0 }

describe("the box reads the cursor at the size prompts (PDJ-01)", () => {
  it("reads the height's size from the cursor, up or down (primitives/d01: 30.9048 for −30.9048)", () => {
    for (const command of ["CYLINDER", "CONE", "PYRAMID"]) {
      const cad = seIsometric()
      answer(cad, command, "300,100,0", "20")
      cad.moveTo({ ...BASE, z: 31.5 })
      expect(box(cad)).toEqual([{ label: "Height", reads: "31.5000" }])
      cad.moveTo({ ...BASE, z: -30.9048 })
      expect(box(cad)).toEqual([{ label: "Height", reads: "30.9048" }])
    }
    for (const command of ["BOX", "WEDGE"]) {
      const cad = seIsometric()
      answer(cad, command, "300,100,0", "350,160")
      cad.moveTo({ x: 350, y: 160, z: 12 })
      expect(box(cad)).toEqual([{ label: "Height", reads: "12.0000" }])
    }
  })

  it("keeps the height's default for Enter, and a typed height, while it reads the cursor", () => {
    const cad = plan()
    answer(cad, "CYLINDER", "0,0,0", "5", "7")
    answer(cad, "CYLINDER", "50,0,0", "5")
    cad.moveTo({ x: 80, y: 0 })
    expect(box(cad)).toEqual([{ label: "Height", reads: "30.0000" }])
    cad.enter()
    expect((solids(cad).at(-1)!.primitive as { height: number }).height).toBe(7)

    answer(cad, "BOX", "100,0,0", "110,10", "6")
    answer(cad, "BOX", "200,0,0", "210,10")
    cad.moveTo({ x: 240, y: 10 })
    cad.enter()
    expect((solids(cad).at(-1)!.primitive as { height: number }).height).toBe(6)
    answer(cad, "BOX", "300,0,0", "310,10")
    cad.moveTo({ x: 340, y: 10 }).type("4").enter()
    expect((solids(cad).at(-1)!.primitive as { height: number }).height).toBe(4)
  })

  it("reads a radius, a diameter, a tube and a top on the plane of their base (primitives/d02, d11)", () => {
    const cad = seIsometric()
    answer(cad, "CYLINDER", "300,100,30")
    // The work plane's point under the cursor is far: the base's plane's is 25 off.
    cad.moveTo({ x: 325, y: 100, z: 30 })
    expect(box(cad)).toEqual([{ label: "Radius", reads: "25.0000" }])
    cad.option("Diameter").moveTo({ x: 325, y: 100, z: 30 })
    expect(box(cad)).toEqual([{ label: "Diameter", reads: "25.0000" }])
    cad.escape().escape()

    for (const command of ["CONE", "SPHERE", "TORUS", "PYRAMID"]) {
      answer(cad, command, "300,100,0")
      cad.moveTo({ x: 300, y: 125.8846, z: 0 })
      expect(box(cad)).toEqual([{ label: "Radius", reads: "25.8846" }])
      cad.escape().escape()
    }

    answer(cad, "TORUS", "300,100,0", "@40,0")
    cad.moveTo({ x: 368.0104, y: 100, z: 0 })
    expect(box(cad)).toEqual([{ label: "Radius", reads: "28.0104" }])
    cad.option("Diameter").moveTo({ x: 368.0104, y: 100, z: 0 })
    expect(box(cad)).toEqual([{ label: "Diameter", reads: "28.0104" }])
    cad.escape().escape()

    answer(cad, "CONE", "300,100,0", "20")
    cad.moveTo({ ...BASE, z: 10 })
    cad.option("Top")
    cad.moveTo({ x: 300, y: 111.5499, z: 10 })
    expect(box(cad)).toEqual([{ label: "Radius", reads: "11.5499" }])
  })

  it("shows the other corner as RECTANG's length and width, a 10 typed there the length (primitives/d11, d03 c)", () => {
    const cad = plan()
    answer(cad, "BOX", "0,0,0")
    cad.moveTo({ x: 10.0742, y: 5.0467 })
    expect(box(cad)).toEqual([
      { label: "Length", reads: "10.0742" },
      { label: "Width", reads: "5.0467" },
    ])
    cad.type("10").enter()
    answer(cad, "5")
    expect(solids(cad).at(-1)!.primitive).toMatchObject({
      length: 10,
      width: expect.closeTo(5.0467, 9),
      height: 5,
    })

    // `10,5` typed in the box is relative to the first corner (d11).
    answer(cad, "BOX", "5,5,0")
    cad.moveTo({ x: 30, y: 30 }).type("10,5").enter()
    answer(cad, "5")
    expect(solids(cad).at(-1)!.primitive).toMatchObject({
      position: { x: 10, y: 7.5, z: 0 },
      length: 10,
      width: 5,
    })

    // A number at the command line is still a direct distance.
    answer(cad, "BOX", "100,0,0")
    cad.moveTo({ x: 106, y: 8 })
    answer(cad, "10", "5")
    expect(solids(cad).at(-1)!.primitive).toMatchObject({
      length: expect.closeTo(6, 9),
      width: expect.closeTo(8, 9),
    })
  })

  it("reads BOX's Length with its angle, and its width square to the length (primitives/d11)", () => {
    const cad = plan()
    answer(cad, "BOX", "0,0,0", "_L")
    cad.moveTo({ x: 30, y: -40 })
    expect(box(cad)).toEqual([
      { label: "Length", reads: "50.0000" },
      { label: "Angle", reads: expect.stringMatching(/^53/) },
    ])
    answer(cad, "40")
    cad.moveTo({ x: 24, y: -32 + 5 })
    expect(box(cad)).toEqual([{ label: "Width", reads: "3.0000" }])
  })

  it("lays a Length typed at an angle typed beside it", () => {
    const cad = plan()
    answer(cad, "BOX", "0,0,0", "_L")
    cad.moveTo({ x: 30, y: 30 }).type("20").type("90", "angle").enter()
    answer(cad, "5", "5")
    const box = solids(cad).at(-1)!.primitive as { xAxis: Vec3 }
    expect(box.xAxis.x).toBeCloseTo(0, 9)
    expect(box.xAxis.y).toBeCloseTo(1, 9)
  })
})

describe("the dashed band from a size's base (PDJ-02)", () => {
  it("runs from the centre at the radius and the diameter (primitives/d11)", () => {
    for (const command of ["CYLINDER", "CONE", "SPHERE", "TORUS"]) {
      const cad = plan()
      answer(cad, command, "0,0,0")
      const cursor = { x: 30, y: 10, z: 0 }
      cad.moveTo(cursor)
      expect(hasBand(cad, { x: 0, y: 0, z: 0 }, cursor)).toBe(true)
      cad.option("Diameter").moveTo(cursor)
      expect(hasBand(cad, { x: 0, y: 0, z: 0 }, cursor)).toBe(true)
    }
  })

  it("runs from the ring's point at the tube, the top's centre at Top, the base at the height (d07, d11)", () => {
    const cad = plan()
    answer(cad, "TORUS", "0,0,0", "40,0")
    cad.moveTo({ x: 60, y: 0 })
    expect(hasBand(cad, { x: 40, y: 0, z: 0 }, { x: 60, y: 0, z: 0 })).toBe(
      true
    )
    cad.escape().escape()

    answer(cad, "CYLINDER", "0,0,0", "5")
    cad.moveTo({ x: 20, y: 20 })
    expect(hasBand(cad, { x: 0, y: 0, z: 0 }, { x: 20, y: 20, z: 0 })).toBe(
      true
    )
    cad.escape().escape()

    const iso = seIsometric()
    answer(iso, "CONE", "300,100,0", "20")
    iso.moveTo({ ...BASE, z: -40 })
    iso.option("Top")
    const cursor = { x: 300, y: 130, z: -40 }
    iso.moveTo(cursor)
    expect(hasBand(iso, { ...BASE, z: -40 }, cursor)).toBe(true)
  })

  it("draws none at PYRAMID's radius and height, nor at BOX's prompts (d02, d11)", () => {
    const cad = plan()
    answer(cad, "PYRAMID", "0,0,0")
    cad.moveTo({ x: 30, y: 10 })
    expect(bands(cad)).toEqual([])
    answer(cad, "20")
    cad.moveTo({ x: 30, y: 10 })
    expect(bands(cad)).toEqual([])
    cad.escape().escape()
    answer(cad, "BOX", "0,0,0", "_L")
    cad.moveTo({ x: 30, y: 10 })
    expect(bands(cad)).toEqual([])
  })
})

describe("the height's dotted dimension beside the axis (primitives/d01, d11)", () => {
  it("runs along the axis from the base to the height, off the plan only", () => {
    const cad = seIsometric()
    answer(cad, "CYLINDER", "300,100,0", "20")
    cad.moveTo({ ...BASE, z: 30 })
    const base = cad.toScreen(BASE)
    const top = cad.toScreen({ ...BASE, z: 30 })
    const rise = { x: top.x - base.x, y: top.y - base.y }
    const along = dotted(cad).filter(({ a, b }) => {
      const d = { x: b.x - a.x, y: b.y - a.y }
      return near(d, rise) || near(d, { x: -rise.x, y: -rise.y })
    })
    expect(along).toHaveLength(1)

    const flat = plan()
    answer(flat, "CYLINDER", "0,0,0", "20")
    flat.moveTo({ x: 30, y: 0 })
    expect(dotted(flat)).toEqual([])
  })
})

describe("the ghosts at the base's prompts (PDJ-03, PDJ-04)", () => {
  it("draws CYLINDER's and CONE's base and TORUS's ring through the cursor (d11)", () => {
    for (const command of ["CYLINDER", "CONE", "TORUS"]) {
      const cad = plan()
      answer(cad, command, "0,0,0")
      cad.moveTo({ x: 30, y: 40 })
      const center = cad.toScreen({ x: 0, y: 0 })
      expect(circles(cad)).toEqual([{ center, radius: 50 }])
      cad.option("Diameter").moveTo({ x: 30, y: 40 })
      expect(circles(cad)).toEqual([{ center, radius: 25 }])
    }
  })

  it("draws the ellipse at Elliptical's axes (d11-cylinder-ell1, ell2)", () => {
    const cad = plan()
    answer(cad, "CYLINDER", "_E", "0,0,0")
    cad.moveTo({ x: 40, y: 0 })
    expect(circles(cad)).toEqual([
      { center: cad.toScreen({ x: 20, y: 0 }), radius: 20 },
    ])
    answer(cad, "40,0")
    cad.moveTo({ x: 20, y: 30 })
    const ellipses = cad
      .scene()
      .primitives.filter(
        (p): p is Extract<ScenePrimitive, { kind: "ellipse" }> =>
          p.kind === "ellipse" && p.stroke.color === THEME.entity
      )
    expect(ellipses).toHaveLength(1)
    const [ellipse] = ellipses
    expect(near(ellipse.center, cad.toScreen({ x: 20, y: 0 }))).toBe(true)
    expect([ellipse.radiusX, ellipse.radiusY].sort()).toEqual([20, 30])
  })

  it("draws the frustum at CONE's Top radius, its top where the height was read (d11-cone-top)", () => {
    const cad = plan()
    answer(cad, "CONE", "0,0,0", "20")
    cad.moveTo({ x: 0, y: 30 })
    cad.option("Top")
    cad.moveTo({ x: 0, y: 10 })
    const center = cad.toScreen({ x: 0, y: 0 })
    const radii = circles(cad)
      .filter((c) => near(c.center, center))
      .map((c) => c.radius)
      .sort((a, b) => a - b)
    expect(radii).toEqual([10, 20])
  })

  it("leans the cylinder to the cursor at Axis endpoint (d11-cylinder-axis)", () => {
    const cad = plan()
    answer(cad, "CYLINDER", "0,0,0", "5", "_A")
    cad.moveTo({ x: 60, y: 0 })
    const far = Math.max(...ghostPoints(cad).map((p) => p.x))
    expect(far).toBeCloseTo(cad.toScreen({ x: 60, y: 0 }).x, 6)
  })

  it("draws BOX's length as a line from the corner, its width as the footprint (d11-box-length, box-width)", () => {
    const cad = plan()
    answer(cad, "BOX", "0,0,0", "_L")
    cad.moveTo({ x: 30, y: 40 })
    const line = ghostPoints(cad)
    expect(line).toHaveLength(2)
    expect(near(line[0], cad.toScreen({ x: 0, y: 0 }))).toBe(true)
    expect(near(line[1], cad.toScreen({ x: 30, y: 40 }))).toBe(true)

    answer(cad, "10")
    cad.moveTo({ x: 6, y: 8 + 5 })
    const corners = ghostPoints(cad)
    expect(corners).toHaveLength(4)
    for (const corner of [
      { x: 0, y: 0 },
      { x: 6, y: 8 },
      { x: 6 - 4 * 0.6, y: 8 + 3 * 0.6 },
    ]) {
      expect(corners.some((p) => near(p, cad.toScreen(corner)))).toBe(true)
    }
  })

  it("draws PYRAMID's base with its edges to the centre, a pyramid of no height (d11-pyramid-radius, edge)", () => {
    const cad = plan()
    answer(cad, "PYRAMID", "0,0,0")
    cad.moveTo({ x: 30, y: 0 })
    const center = cad.toScreen({ x: 0, y: 0 })
    const toCenter = (c: CadHarness) =>
      c
        .scene()
        .primitives.filter(
          (p) =>
            p.kind === "segment" &&
            p.stroke.color === THEME.entity &&
            (near(p.a, center) || near(p.b, center))
        )
    expect(toCenter(cad)).toHaveLength(4)

    cad.escape().escape()
    answer(cad, "PYRAMID", "_E", "-10,-10")
    cad.moveTo({ x: 10, y: -10 })
    expect(toCenter(cad)).toHaveLength(4)
  })
})
