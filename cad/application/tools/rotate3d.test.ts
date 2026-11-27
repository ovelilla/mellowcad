import { describe, expect, it } from "vitest"

import { type CadHarness, createHarness } from "../../../test/harness"
import { Solid3dEntity } from "../../domain/entities"
import { THEME } from "../../scene/theme"
import { es } from "../../locales/es"

function answer(cad: CadHarness, ...texts: string[]): CadHarness {
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

/** The console's 10 box seen from (-1.3,-2.2,1.6) (3drotate/p01). */
function box(): CadHarness {
  const cad = createHarness()
  cad.runtime.setDocumentPrecision(4)
  answer(cad, "BOX", "0,0,0", "10,10", "10", "-VPOINT", "-1.3,-2.2,1.6")
  return cad
}

function solid(cad: CadHarness): Solid3dEntity {
  const found = cad.runtime.document
    .getEntities()
    .find((e): e is Solid3dEntity => e.type === "solid3d")
  if (!found) throw new Error("no solid")
  return found
}

/** Pixels a world unit square to the view (-1.3,-2.2,1.6) spans here. */
function scale(cad: CadHarness): number {
  const a = cad.toScreen({ x: 0, y: 0, z: 0 })
  const b = cad.toScreen({ x: 1, y: 0, z: 0 })
  const along = -1.3 / Math.hypot(1.3, 2.2, 1.6)
  return Math.hypot(b.x - a.x, b.y - a.y) / Math.sqrt(1 - along ** 2)
}

/** A point on the gizmo's ring about `axis` round `c`, at `t` radians. */
function onRing(
  cad: CadHarness,
  c: { x: number; y: number; z: number },
  axis: "x" | "y" | "z",
  t: number
) {
  const r = 64 / scale(cad)
  const [u, v] =
    axis === "x"
      ? [
          { x: 0, y: 1, z: 0 },
          { x: 0, y: 0, z: 1 },
        ]
      : axis === "y"
        ? [
            { x: 0, y: 0, z: 1 },
            { x: 1, y: 0, z: 0 },
          ]
        : [
            { x: 1, y: 0, z: 0 },
            { x: 0, y: 1, z: 0 },
          ]
  return {
    x: c.x + r * (Math.cos(t) * u.x + Math.sin(t) * v.x),
    y: c.y + r * (Math.cos(t) * u.y + Math.sin(t) * v.y),
    z: c.z + r * (Math.cos(t) * u.z + Math.sin(t) * v.z),
  }
}

describe("3DROTATE", () => {
  // 3drotate/p06: in plan it asks as ROTATE asks.
  it("asks as ROTATE in plan", () => {
    const cad = createHarness()
    answer(cad, "BOX", "0,0,0", "10,10", "10", "3DROTATE")
    expect(cad.commandLog().at(-1)).toBe(
      "Current positive angle in UCS:  ANGDIR=counterclockwise  ANGBASE=0"
    )
    answer(cad, "L", "", "0,0,0")
    expect(cad.state().commandLine.prompt).toBe(
      "3DROTATE Specify rotation angle or [Copy/Reference] <0>:"
    )
    answer(cad, "90")
    const ys = solid(cad).brep.vertices.map((v) => v.x)
    expect(Math.min(...ys)).toBeCloseTo(-10, 9)
  })

  // p01–p05: off the plan the base point opens `Pick a rotation axis:`,
  // which takes only a click on a ring: anything typed, and Enter, are
  // `Invalid 2D point.`.
  it("asks for an axis off the plan, refusing what is typed", () => {
    const cad = box()
    answer(cad, "3DROTATE", "L", "", "0,0,0")
    expect(cad.state().commandLine.prompt).toBe(
      "3DROTATE Pick a rotation axis:"
    )
    answer(cad, "10,0,0")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Pick a rotation axis: 10,0,0",
      "Invalid 2D point.",
    ])
  })

  // Desktop 3drotate/d01: the red ring under the cursor turns yellow; a
  // click takes X; 30 typed turns the box 30° about X through the base.
  it("turns about the ring taken by an angle typed", () => {
    const cad = box()
    answer(cad, "3DROTATE", "L", "", "0,0,0")
    const at = onRing(cad, { x: 0, y: 0, z: 0 }, "x", Math.PI / 3)
    cad.moveTo(at)
    const hot = cad
      .scene()
      .primitives.filter(
        (p) => "stroke" in p && p.stroke?.color === THEME.gizmoHot
      ).length
    expect(hot).toBeGreaterThan(0)
    cad.click(at)
    expect(cad.state().commandLine.prompt).toBe(
      "3DROTATE Specify angle start point or type an angle:"
    )
    answer(cad, "30")
    // (0,10,0) turned 30° about +X: (0, 8.66, 5).
    const v = solid(cad).brep.vertices.find(
      (p) => Math.abs(p.x) < 1e-9 && Math.abs(p.y - 8.660254) < 1e-5
    )
    if (!v) throw new Error("no turned vertex")
    expect(v.z).toBeCloseTo(5, 6)
  })

  // A start point then an end point: the turn between them about the axis.
  it("turns from an angle start point to an end point", () => {
    const cad = box()
    answer(cad, "3DROTATE", "L", "", "0,0,0")
    const at = onRing(cad, { x: 0, y: 0, z: 0 }, "z", Math.PI / 4)
    cad.moveTo(at)
    cad.click(at)
    answer(cad, "10,0,0")
    expect(cad.state().commandLine.prompt).toBe(
      "3DROTATE Specify angle end point:"
    )
    answer(cad, "0,10,0")
    const xs = solid(cad).brep.vertices.map((p) => p.x)
    expect(Math.min(...xs)).toBeCloseTo(-10, 6)
  })

  // The cursor on the work plane would turn nothing but 0° or 180° about an
  // axis lying in it: the angle's points are read on the ring's plane.
  it("turns about a level axis between two points clicked", () => {
    const cad = box()
    answer(cad, "3DROTATE", "L", "", "0,0,0")
    const at = onRing(cad, { x: 0, y: 0, z: 0 }, "x", Math.PI / 3)
    cad.moveTo(at)
    cad.click(at)
    cad.moveTo({ x: 0, y: 0, z: 10 }).click({ x: 0, y: 0, z: 10 })
    cad.moveTo({ x: 0, y: 10, z: 0 }).click({ x: 0, y: 10, z: 0 })
    // From +Z to +Y about +X is -90°: y from z, z from -y.
    const vs = solid(cad).brep.vertices
    expect(Math.min(...vs.map((p) => p.y))).toBeCloseTo(0, 6)
    expect(Math.min(...vs.map((p) => p.z))).toBeCloseTo(-10, 6)
    answer(cad, "U")
    expect(cad.commandLog().at(-1)).toContain("3DROTATE")
  })

  // A start point sets LASTPOINT, as AutoCAD's getpoint does: `@` at the
  // end point's prompt counts from it.
  it("reads @ at the end point from the start point", () => {
    const cad = box()
    answer(cad, "3DROTATE", "L", "", "0,0,0")
    const at = onRing(cad, { x: 0, y: 0, z: 0 }, "z", Math.PI / 4)
    cad.moveTo(at)
    cad.click(at)
    answer(cad, "10,0,0", "@-10,10")
    const xs = solid(cad).brep.vertices.map((p) => p.x)
    expect(Math.min(...xs)).toBeCloseTo(-10, 6)
  })

  // d01: before the cursor moves, the gizmo, and Enter's base point, sit at
  // the set's centre, not at the work plane under a pointer left at rest.
  it("takes the set's centre at Enter before the cursor moves", () => {
    const cad = box()
    cad.moveTo({ x: 30, y: -20, z: 0 })
    answer(cad, "3DROTATE", "L", "", "")
    const center = { x: 5, y: 5, z: 5 }
    const at = onRing(cad, center, "z", Math.PI / 4)
    cad.moveTo(at)
    cad.click(at)
    answer(cad, "90")
    // A quarter turn about the box's own vertical axis leaves it in place.
    const xs = solid(cad).brep.vertices.map((p) => p.x)
    const ys = solid(cad).brep.vertices.map((p) => p.y)
    expect(Math.min(...xs)).toBeCloseTo(0, 6)
    expect(Math.min(...ys)).toBeCloseTo(0, 6)
  })

  it("is ROTACION3D in Spanish", () => {
    const cad = createHarness({ locale: es })
    answer(cad, "PRISMARECT", "0,0,0", "10,10", "10", "ROTACION3D", "_L", "")
    expect(cad.state().commandLine.prompt).toBe(
      "ROTACION3D Precise punto base:"
    )
  })
})
