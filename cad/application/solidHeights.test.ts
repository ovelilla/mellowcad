import { describe, expect, it } from "vitest"

import { type CadHarness, createHarness } from "../../test/harness"
import type { Vec3 } from "../geometry/Vec3"
import { brepBox } from "../geometry/solids"
import type { Solid3dEntity } from "../domain/entities"

/** Each answer typed at the command line and confirmed, as the console types it. */
function answer(cad: CadHarness, ...texts: string[]): CadHarness {
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

function seIsometric(cad: CadHarness): CadHarness {
  return answer(cad, "-VIEW", "_SEISO")
}

/** The last solid's lowest and highest Z, as AutoCAD's bounding box reads them. */
function zRange(cad: CadHarness): [number, number] {
  const solid = cad
    .entities()
    .filter((e): e is Solid3dEntity => e.type === "solid3d")
    .at(-1)!
  const box = brepBox(solid.brep)!
  return [box.min.z, box.max.z]
}

function expectRange(cad: CadHarness, low: number, high: number): void {
  const [min, max] = zRange(cad)
  expect(min).toBeCloseTo(low, 6)
  expect(max).toBeCloseTo(high, 6)
}

/** The first box's top corner, which the desktop and the console snapped to. */
const TOP_CORNER: Vec3 = { x: 100, y: 100, z: 50 }

// AutoCAD 2027's desktop, dragging with the mouse in SE Isometric
// (solid/dsk3.sh, extrude/dsk.sh), and its console under a typed snap
// (solid/z01–z03): the height is read along the axis it rises on, with its
// sign; in plan it is the distance to the point.
describe("a solid's height given with the mouse in a 3D view", () => {
  it("follows the cursor up and down the Z through BOX's corner (desktop solid/d11, d12)", () => {
    const cad = seIsometric(createHarness())

    answer(cad, "BOX", "200,0,0", "300,100")
    cad.moveTo({ x: 300, y: 100, z: 40 }).click({ x: 300, y: 100, z: 40 })
    expectRange(cad, 0, 40)

    answer(cad, "BOX", "200,0,0", "300,100")
    cad.moveTo({ x: 300, y: 100, z: -25 }).click({ x: 300, y: 100, z: -25 })
    expectRange(cad, -25, 0)
  })

  it("reads the cursor beside the axis where it falls along it (extrude/d03)", () => {
    const cad = seIsometric(createHarness())

    // Straight to the right of 300,100,40 on the screen.
    answer(cad, "BOX", "200,0,0", "300,100")
    cad.moveTo({ x: 330, y: 130, z: 40 }).click({ x: 330, y: 130, z: 40 })
    expectRange(cad, 0, 40)
  })

  it("takes the height of another solid's corner, or of a point below (d13, z01)", () => {
    const cad = seIsometric(createHarness({ snap: true }))
    answer(cad, "BOX", "0,0,0", "100,100", "50")
    answer(cad, "LINE", "0,-100,-30", "50,-100,-30", "")

    answer(cad, "BOX", "200,0,0", "300,100")
    cad.moveTo(TOP_CORNER).click(TOP_CORNER)
    expectRange(cad, 0, 50)

    answer(cad, "BOX", "200,200,0", "300,300")
    const below = { x: 50, y: -100, z: -30 }
    cad.moveTo(below).click(below)
    expectRange(cad, -30, 0)
  })

  it("is the same for CYLINDER, CONE and PYRAMID (z01)", () => {
    const cad = seIsometric(createHarness({ snap: true }))
    answer(cad, "BOX", "0,0,0", "100,100", "50")

    for (const command of ["CYLINDER", "CONE", "PYRAMID"]) {
      answer(cad, command, "400,0,0", "20")
      cad.moveTo(TOP_CORNER).click(TOP_CORNER)
      expectRange(cad, 0, 50)
    }
  })

  it("follows the free cursor for CYLINDER, CONE and PYRAMID too (primitives/d01)", () => {
    const cad = seIsometric(createHarness())
    for (const command of ["CYLINDER", "CONE", "PYRAMID"]) {
      for (const [at, low, high] of [
        [{ x: 300, y: 100, z: 40 }, 0, 40],
        [{ x: 300, y: 100, z: -25 }, -25, 0],
        [{ x: 330, y: 130, z: 40 }, 0, 40],
      ] as const) {
        answer(cad, command, "300,100,0", "20")
        cad.moveTo(at).click(at)
        expectRange(cad, low, high)
      }
    }
  })

  it("follows the cursor along EXTRUDE's profile, up, down and beside it (extrude/d02–d04)", () => {
    const cad = seIsometric(createHarness())

    answer(cad, "CIRCLE", "150,-100", "20", "EXTRUDE", "_L", "")
    cad.moveTo({ x: 150, y: -100, z: 40 }).click({ x: 150, y: -100, z: 40 })
    expectRange(cad, 0, 40)

    answer(cad, "CIRCLE", "350,-100", "20", "EXTRUDE", "_L", "")
    cad.moveTo({ x: 380, y: -70, z: -25 }).click({ x: 380, y: -70, z: -25 })
    expectRange(cad, -25, 0)
  })

  it("reads a point typed where the cursor would be on it (z01, z02)", () => {
    const cad = seIsometric(createHarness())

    // 100,200,0 lies 40.82 below 300,500,0 on the screen: 50 down the Z.
    answer(cad, "BOX", "200,400,0", "300,500", "100,200,0")
    expectRange(cad, -50, 0)

    answer(cad, "CIRCLE", "400,-400", "20", "EXTRUDE", "_L", "", "300,-400,0")
    expectRange(cad, 0, 50)
  })

  it("extrudes to another solid's corner (extrude/d05, z02)", () => {
    const cad = seIsometric(createHarness({ snap: true }))
    answer(cad, "BOX", "0,0,0", "100,100", "50")

    answer(cad, "CIRCLE", "200,-200", "20", "EXTRUDE", "_L", "")
    cad.moveTo(TOP_CORNER).click(TOP_CORNER)
    expectRange(cad, 0, 50)
  })
})

describe("a solid's height given with the mouse in plan", () => {
  it("is the distance to the cursor, either side (desktop solid/d14)", () => {
    const cad = createHarness()

    answer(cad, "BOX", "200,0,0", "300,100")
    cad.moveTo({ x: 300, y: 130 }).click({ x: 300, y: 130 })
    expectRange(cad, 0, 30)

    answer(cad, "BOX", "200,0,0", "300,100")
    cad.moveTo({ x: 270, y: 100 }).click({ x: 270, y: 100 })
    expectRange(cad, 0, 30)
  })

  it("is the distance to a raised point snapped to (d14, z03)", () => {
    const cad = createHarness({ snap: true })
    answer(cad, "LINE", "200,-100,50", "250,-100,50", "")

    answer(cad, "BOX", "200,0,0", "300,100")
    const end = { x: 250, y: -100, z: 50 }
    cad.moveTo(end).click(end)
    expectRange(cad, 0, Math.sqrt(45000))
  })
})

/** The last solid's primitive. */
function made(cad: CadHarness) {
  return cad
    .entities()
    .filter((e): e is Solid3dEntity => e.type === "solid3d")
    .at(-1)!.primitive!
}

// Desktop primitives/d02, SE Isometric: a radius clicked 100 px right of a
// centre at Z 30 reads 25.8839, as at Z 0, where its line of sight meets the
// plane through the centre; the work plane's point is 57.9 away.
describe("a size given with the mouse in a 3D view", () => {
  it("reads a radius or a diameter on the plane through the centre", () => {
    const cad = seIsometric(createHarness())
    const rim = { x: 325, y: 100, z: 30 }
    for (const [command, ...rest] of [
      ["CYLINDER", "10"],
      ["SPHERE"],
      ["TORUS", "5"],
    ]) {
      answer(cad, command, "300,100,30")
      cad.moveTo(rim).click(rim)
      answer(cad, ...rest)
      expect(made(cad)).toMatchObject({ radius: expect.closeTo(25, 9) })
    }
    answer(cad, "PYRAMID", "300,100,30")
    cad.moveTo(rim).click(rim)
    answer(cad, "10")
    expect(made(cad)).toMatchObject({
      radius: expect.closeTo(25 * Math.SQRT2, 9),
    })
    answer(cad, "CONE", "300,100,30", "_D")
    const across = { x: 350, y: 100, z: 30 }
    cad.moveTo(across).click(across)
    answer(cad, "10")
    expect(made(cad)).toMatchObject({ radius: expect.closeTo(25, 9) })
  })

  it("reads TORUS's tube on the ring's plane", () => {
    const cad = seIsometric(createHarness())
    answer(cad, "TORUS", "300,100,30")
    for (const at of [
      { x: 340, y: 100, z: 30 },
      { x: 347, y: 100, z: 30 },
    ]) {
      cad.moveTo(at).click(at)
    }
    expect(made(cad)).toMatchObject({
      radius: expect.closeTo(40, 9),
      tubeRadius: expect.closeTo(7, 9),
    })
  })

  it("reads CONE's top on the top's plane, at the height the cursor read at Top", () => {
    const cad = seIsometric(createHarness())
    answer(cad, "CONE", "300,100,0", "20")
    cad.moveTo({ x: 300, y: 100, z: 21.85 })
    answer(cad, "_T")
    const edge = { x: 328, y: 100, z: 21.85 }
    cad.moveTo(edge).click(edge)
    answer(cad, "30")
    expect(made(cad)).toMatchObject({ topRadius: expect.closeTo(28, 6) })
  })

  it("keeps a point snapped to or typed at its distance in space (primitives/p242)", () => {
    const cad = seIsometric(createHarness({ snap: true }))
    answer(cad, "LINE", "325,100,0", "325,150,0", "")
    answer(cad, "CYLINDER", "300,100,30")
    const end = { x: 325, y: 100, z: 0 }
    cad.moveTo(end).click(end)
    answer(cad, "10")
    expect(made(cad)).toMatchObject({
      radius: expect.closeTo(Math.hypot(25, 30), 9),
    })
    answer(cad, "CYLINDER", "300,100,30", "@25,0,-30", "10")
    expect(made(cad)).toMatchObject({
      radius: expect.closeTo(Math.hypot(25, 30), 9),
    })
  })
})
