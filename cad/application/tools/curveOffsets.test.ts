import { describe, expect, it } from "vitest"
import type { EllipseEntity, Entity, SplineEntity } from "../../domain/entities"
import { createSpline } from "../../domain/entities"
import { createHarness } from "../../../test/harness"
import { ellipseOf, layerOf, p } from "../../../test/builders"
import { drawnColor, THEME } from "../../scene/theme"

// OFFSET of an ellipse or a spline, as AutoCAD 2027's console leaves it
// (probes offset/p196–p198, spline-knots/k38–k56): a CV spline on knots of its
// own, or pieces of one, one undo step a point, wearing what the source wears
// but its lineweight. Its shape against the dumps: domain/splineOffset.test.ts.

const SELECT = "OFFSET Select object to offset or [Exit/Undo] <Exit>:"
const ELLIPSE = () => ellipseOf(p(0, 0), p(50, 0), 0.5, { id: "E" })
const FIT = () =>
  createSpline("fit", [p(0, 0), p(50, 30), p(100, 0)], { id: "S" })
const splines = (entities: readonly Entity[]) =>
  entities.filter((e): e is SplineEntity => e.type === "spline")

describe("OFFSET of an ellipse or a spline", () => {
  it("makes a closed CV spline of an ellipse, one undo step (p196)", () => {
    const cad = createHarness({ entities: [ELLIPSE()] })
    cad.command("OFFSET").type("10").enter().click(p(50, 0)).click(p(70, 0))

    const [copy] = splines(cad.entities())
    expect(copy).toMatchObject({ method: "cv", degree: 3, closed: true })
    expect(copy.knotVector!.slice(0, 4)).toEqual([0, 0, 0, 0])
    expect(copy.knotVector!.at(-1)).toBe(2 * Math.PI)
    expect(copy.points[0]).toBeCloseToPoint(p(60, 0))
    expect(cad.state().commandLine.prompt).toBe(SELECT)

    cad.escape().undo()
    expect(cad.entities().map((e) => e.type)).toEqual(["ellipse"])
  })

  it("keeps the source's layer, colour and linetype, not its lineweight (k50, k53, k56)", () => {
    const cad = createHarness()
    const wearing = {
      layerId: "L1",
      color: "#ff0000",
      linetype: "DASHED",
      lineweight: 0.5,
    } as const
    cad.runtime.document.load(
      [
        { ...ELLIPSE(), ...wearing },
        { ...FIT(), ...wearing },
        { ...ellipseOf(p(200, 0), p(30, 0), 1, { id: "R" }), ...wearing },
      ],
      { layers: [layerOf("0"), layerOf("L1")], currentLayerId: "0" }
    )
    cad.command("OFFSET").type("3").enter()
    cad.click(p(50, 0)).click(p(80, 0))
    cad.click(p(50, 30)).click(p(50, 80))
    cad.click(p(200, 30)).click(p(200, 0))
    cad.escape()

    const copies = cad.entities().filter((e) => !["E", "S", "R"].includes(e.id))
    expect(copies.map((e) => e.type)).toEqual(["spline", "spline", "ellipse"])
    for (const copy of copies) {
      expect(copy).toMatchObject({
        layerId: "L1",
        color: "#ff0000",
        linetype: "DASHED",
      })
      expect(copy.lineweight).toBeUndefined()
    }
    // A round ellipse's is a concentric ellipse (k41, k56).
    expect((copies[2] as EllipseEntity).majorAxis).toBeCloseToPoint(p(27, 0))
  })

  it("puts each piece of one that crosses itself in one undo step (k38)", () => {
    const cad = createHarness({ entities: [ELLIPSE()] })
    cad.command("OFFSET").type("20").enter().click(p(50, 0)).click(p(0, 0))
    expect(splines(cad.entities())).toHaveLength(2)

    cad.escape().undo()
    expect(cad.entityCount).toBe(1)
  })

  it("says it cannot offset what nothing is left of, or a curve with a corner (k38, k51)", () => {
    const corner = createSpline(
      "cv",
      [p(0, 60), p(10, 70), p(20, 60), p(30, 70)],
      { id: "C", degree: 1 }
    )
    const cad = createHarness({ entities: [ELLIPSE(), corner] })
    cad.command("OFFSET").type("30").enter().click(p(50, 0)).click(p(0, 0))
    expect(cad.commandLog()).toContain("Cannot offset that object.")
    expect(cad.state().commandLine.prompt).toBe(SELECT)

    cad.click(p(10, 70)).click(p(0, 80)).escape()
    expect(
      cad.commandLog().filter((line) => line === "Cannot offset that object.")
    ).toHaveLength(2)
    expect(cad.entityCount).toBe(2)
  })

  it("passes over a spline out of every plane in silence (k46)", () => {
    const twisted = createSpline(
      "fit",
      [
        { x: 0, y: 0, z: 0 },
        { x: 10, y: 10, z: 5 },
        { x: 20, y: 0, z: 10 },
        { x: 30, y: 10, z: 0 },
      ],
      { id: "T" }
    )
    const cad = createHarness({ entities: [twisted] })
    cad.command("OFFSET").type("2").enter().click(p(0, 0))
    expect(cad.state().commandLine.prompt).toBe(SELECT)
    cad.escape()
    expect(cad.entityCount).toBe(1)
    expect(cad.commandLog()).not.toContain("Cannot offset that object.")
  })

  it("passes Through a point, refusing one on the curve and the ellipse's centre (k48)", () => {
    const cad = createHarness({ entities: [ELLIPSE(), FIT()] })
    cad.command("OFFSET").option("Through")
    cad.click(p(50, 0)).click(p(60, 0))
    const [copy] = splines(cad.entities()).filter((s) => s.id !== "S")
    expect(copy.points[0]).toBeCloseToPoint(p(60, 0))

    cad.click(p(0, 25)).click(p(0, 25))
    expect(cad.commandLog()).toContain("Invalid through point.")
    cad.click(p(-50, 0)).click(p(0, 0))
    expect(cad.commandLog()).toContain("Cannot offset that object.")
    cad.click(p(50, 30)).click(p(50, 35)).escape()
    expect(splines(cad.entities())).toHaveLength(3)
  })

  it("erases the source with Erase, puts the copy on the current layer with Layer, and steps out with Multiple (k49)", () => {
    const cad = createHarness()
    cad.runtime.document.load([{ ...ELLIPSE(), layerId: "L1" }], {
      layers: [layerOf("0"), layerOf("L1")],
      currentLayerId: "0",
    })
    cad.command("OFFSET").option("Erase").option("Yes")
    cad.option("Layer").option("Current")
    cad.type("5").enter().click(p(50, 0)).click(p(80, 0)).escape()
    const [first] = cad.entities() as SplineEntity[]
    expect(cad.entityCount).toBe(1)
    expect(first).toMatchObject({ type: "spline", layerId: "0" })

    cad.command("OFFSET").option("Erase").option("No")
    cad.type("3").enter().click(p(55, 0)).option("Multiple")
    cad.click(p(80, 0)).click(p(80, 0)).escape()
    const offsets = splines(cad.entities()).map((s) => s.points[0].x)
    expect(offsets).toHaveLength(3)
    expect(offsets[1]).toBeCloseTo(58, 9)
    expect(offsets[2]).toBeCloseTo(61, 9)
  })

  it("offsets a tilted ellipse in its own plane, its normal kept (k47)", () => {
    const normal = { x: 0, y: -0.5, z: Math.sqrt(3) / 2 }
    const cad = createHarness({ entities: [{ ...ELLIPSE(), normal }] })
    cad.command("OFFSET").type("5").enter().click(p(50, 0)).click(p(90, 0))

    const [copy] = splines(cad.entities())
    expect(copy.normal!.y).toBeCloseTo(-0.5, 12)
    expect(copy.normal!.z).toBeCloseTo(Math.sqrt(3) / 2, 12)
    expect(copy.points[0]).toBeCloseToPoint(p(55, 0))
    expect(copy.points.every((point) => point.z === 0)).toBe(true)
  })

  it("keeps a level spline's height (p218's plane, for a spline)", () => {
    const high = createSpline(
      "fit",
      [
        { x: 0, y: 0, z: 5 },
        { x: 50, y: 30, z: 5 },
        { x: 100, y: 0, z: 5 },
      ],
      { id: "S" }
    )
    const cad = createHarness({ entities: [high] })
    cad.command("OFFSET").type("1").enter().click(p(50, 30)).click(p(50, 80))
    const copy = splines(cad.entities()).find((s) => s.id !== "S")!
    expect(copy.points.every((point) => point.z === 5)).toBe(true)
  })

  it("rolls over the curve, then drags its copy in its colour, the source selected (desktop d01-4, d01-5's look)", () => {
    const cad = createHarness({
      entities: [{ ...ELLIPSE(), color: "#ff0000" }],
    })
    const strokes = () =>
      cad
        .scene()
        .primitives.flatMap((prim) =>
          "stroke" in prim && prim.stroke ? [prim.stroke] : []
        )
    cad.command("OFFSET").type("10").enter().moveTo(p(50, 0))
    expect(strokes()).toContainEqual({ color: THEME.entityHover, width: 2 })

    cad.click(p(50, 0)).moveTo(p(70, 0))
    expect(strokes()).toContainEqual({ color: THEME.selected, width: 2 })
    expect(strokes()).toContainEqual({
      color: drawnColor("#ff0000"),
      width: 1,
    })
  })
})
