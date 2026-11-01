import { describe, expect, it } from "vitest"

import { type CadHarness, createHarness } from "../../test/harness"
import type { Vec3 } from "../geometry/Vec3"
import { brepIsClosed } from "../geometry/solids"
import type { Solid3dEntity, SolidPrimitive } from "../domain/entities"
import { THEME } from "../scene/theme"

/** Each answer typed at the command line and confirmed, as the console types it. */
function answer(cad: CadHarness, ...texts: string[]): CadHarness {
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

const at = (x: number, y: number, z: number): Vec3 => ({ x, y, z })

function solid(cad: CadHarness): Solid3dEntity {
  const found = cad
    .entities()
    .find((e): e is Solid3dEntity => e.type === "solid3d")
  expect(found).toBeDefined()
  expect(brepIsClosed(found!.brep)).toBe(true)
  return found!
}

function primitive<K extends SolidPrimitive["kind"]>(
  cad: CadHarness,
  kind: K
): Extract<SolidPrimitive, { kind: K }> {
  const p = solid(cad).primitive
  expect(p?.kind).toBe(kind)
  return p as Extract<SolidPrimitive, { kind: K }>
}

/** A box from 0,0,0 to 10,20 and 5 high, selected: g01's. */
function box(view?: "SWISO"): CadHarness {
  const cad = createHarness()
  answer(cad, "_BOX", "0,0,0", "10,20", "5")
  if (view) answer(cad, "-VIEW", `_${view}`)
  cad.escape().select(solid(cad).id)
  return cad
}

function gripCount(cad: CadHarness): number {
  cad.moveTo(at(400, 400, 0))
  return cad
    .scene()
    .primitives.filter(
      (p) =>
        (p.kind === "rect" || p.kind === "path") &&
        "fill" in p &&
        (p.fill === THEME.grip || p.fill === THEME.gripHot)
    ).length
}

describe("a primitive's grips in the editor (solid/g01, d10)", () => {
  it("shows a box's base centre, corners and edges in plan, its heights off it", () => {
    expect(gripCount(box())).toBe(9)
    expect(gripCount(box("SWISO"))).toBe(11)
  })

  it("sizes along an edge's arrow, the opposite face kept, one undo step", () => {
    const cad = box()
    cad.click(at(10, 10, 0)).click(at(13, 4, 0))
    const p = primitive(cad, "box")
    expect(p.length).toBe(13)
    expect(p.position.x).toBe(6.5)
    expect(cad.runtime.getState().selectionCount).toBe(1)
    cad.escape()
    answer(cad, "_U")
    expect(primitive(cad, "box").length).toBe(10)
    expect(cad.commandLog().at(-1)).toBe("Grip Edit")
  })

  it("moves a corner in the base's plane", () => {
    const cad = box()
    cad.click(at(0, 0, 0)).click(at(-2, -3, 0))
    const p = primitive(cad, "box")
    expect([p.length, p.width]).toEqual([12, 23])
    expect(p.position).toEqual(at(4, 8.5, 0))
  })

  it("leaves it as it was where a drag would cross the opposite face", () => {
    const cad = box()
    cad.click(at(10, 10, 0)).click(at(-6, 10, 0))
    expect(primitive(cad, "box").length).toBe(10)
  })

  it("moves it whole from the base's centre", () => {
    const cad = box()
    cad.click(at(5, 10, 0)).click(at(8, 14, 0))
    expect(primitive(cad, "box").position).toEqual(at(8, 14, 0))
  })

  it("takes the arrow's first box as how far, its second as the size", () => {
    const cad = box()
    cad.click(at(10, 10, 0)).moveTo(at(12, 10, 0))
    cad.type("3").enter()
    expect(primitive(cad, "box").length).toBe(13)
    cad.click(at(13, 10, 0)).moveTo(at(14, 10, 0))
    cad.type("8", "size").enter()
    const p = primitive(cad, "box")
    expect(p.length).toBe(8)
    expect(p.position.x).toBe(4)
  })

  it("raises the height off the plan, along the line of sight (SW Isometric)", () => {
    const cad = box("SWISO")
    cad.click(at(5, 10, 5)).click(at(5, 10, 8))
    expect(primitive(cad, "box").height).toBeCloseTo(8, 9)
    cad.click(at(5, 10, 8)).moveTo(at(5, 10, 9))
    cad.type("2").enter()
    expect(primitive(cad, "box").height).toBeCloseTo(10, 9)
  })

  it("sizes a cylinder's radius and a sphere's", () => {
    const cad = createHarness()
    answer(cad, "_CYLINDER", "0,0,0", "5", "10")
    cad.escape().select(solid(cad).id)
    cad.click(at(5, 0, 0)).click(at(7, 1, 0))
    expect(primitive(cad, "cylinder").radius).toBe(7)
    const sphere = createHarness()
    answer(sphere, "_SPHERE", "0,0,0", "5")
    sphere.escape().select(solid(sphere).id)
    sphere.click(at(5, 0, 0)).click(at(7, 0, 0))
    expect(primitive(sphere, "sphere").radius).toBeCloseTo(7, 9)
  })
})

describe("a primitive's Geometry in the palette (solid/g01)", () => {
  function retyped(cad: CadHarness, property: string, value: string) {
    return cad.runtime.setSelectionProperty(property as never, value)
  }

  it("takes a box's sizes, refusing 0 and less, turning it over for a negative height", () => {
    const cad = box()
    for (const value of ["0", "-4"]) retyped(cad, "solidLength", value)
    expect(primitive(cad, "box").length).toBe(10)
    retyped(cad, "solidLength", "7")
    expect(primitive(cad, "box").length).toBe(7)
    retyped(cad, "solidHeight", "0")
    expect(primitive(cad, "box").height).toBe(5)
    retyped(cad, "solidHeight", "-3")
    const p = primitive(cad, "box")
    expect([p.height, p.normal.z]).toEqual([3, -1])
  })

  it("moves it by its Position, read in the UCS", () => {
    const cad = box()
    answer(cad, "_UCS", "_O", "2,3,0")
    cad.select(solid(cad).id)
    retyped(cad, "positionX", "1")
    retyped(cad, "positionZ", "4")
    expect(primitive(cad, "box").position).toEqual(at(3, 10, 4))
  })

  it("takes a pyramid's radii by its Type, its top down to 0, its sides 3 to 32", () => {
    const cad = createHarness()
    answer(cad, "_PYRAMID", "_E", "0,0,0", "10,0,0", "_T", "2", "8")
    cad.escape().select(solid(cad).id)
    const was = primitive(cad, "pyramid")
    expect(was.inscribed).toBe(false)
    for (const value of ["0", "-1"]) retyped(cad, "baseRadius", value)
    retyped(cad, "topRadius", "-1")
    for (const value of ["2", "33", "4.5"]) retyped(cad, "sides", value)
    expect(primitive(cad, "pyramid")).toEqual(was)
    retyped(cad, "baseRadius", "6")
    expect(primitive(cad, "pyramid").radius).toBeCloseTo(6 * Math.SQRT2, 9)
    retyped(cad, "topRadius", "0")
    expect(primitive(cad, "pyramid").topRadius).toBe(0)
    retyped(cad, "sides", "6")
    expect(primitive(cad, "pyramid").sides).toBe(6)
  })

  it("takes a cone's top from 0, a sphere's diameter, a lemon's tube only wider than its ring", () => {
    const cone = createHarness()
    answer(cone, "_CONE", "0,0,0", "5", "_T", "2", "10")
    cone.escape().select(solid(cone).id)
    retyped(cone, "topRadius", "-1")
    expect(primitive(cone, "cone").topRadius).toBe(2)
    for (const value of ["0", "7"]) {
      retyped(cone, "topRadius", value)
      expect(primitive(cone, "cone").topRadius).toBe(Number(value))
    }
    const sphere = createHarness()
    answer(sphere, "_SPHERE", "0,0,0", "5")
    sphere.escape().select(solid(sphere).id)
    retyped(sphere, "diameter", "12")
    expect(primitive(sphere, "sphere").radius).toBe(6)
    const torus = createHarness()
    answer(torus, "_TORUS", "0,0,0", "10", "3")
    torus.escape().select(solid(torus).id)
    for (const value of ["0", "-4"]) retyped(torus, "torusRadius", value)
    expect(primitive(torus, "torus").radius).toBe(10)
    retyped(torus, "torusRadius", "-2")
    expect(primitive(torus, "torus").radius).toBe(-2)
    for (const value of ["2", "0"]) retyped(torus, "tubeRadius", value)
    expect(primitive(torus, "torus").tubeRadius).toBe(3)
  })

  it("is one undo step U names Modify Property", () => {
    const cad = box()
    retyped(cad, "solidWidth", "7")
    cad.escape()
    answer(cad, "_U")
    expect(cad.commandLog().slice(-2)).toEqual(["U", "Modify Property"])
    expect(primitive(cad, "box").width).toBe(20)
  })
})
