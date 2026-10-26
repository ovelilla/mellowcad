import { describe, expect, it } from "vitest"
import { createHarness } from "../../../test/harness"
import {
  arcOf,
  circleOf,
  hatchOf,
  layerOf,
  lineOf,
  loopOf,
  p,
  textOf,
} from "../../../test/builders"
import type { Vec2 } from "../../geometry/Vec2"
import { normalizeDegrees } from "../../geometry/primitives"
import {
  blockAttribute,
  CircleEntity,
  EllipseEntity,
  HatchEntity,
  ellipseEndPoint,
  ellipseStartPoint,
  ellipseSweepParams,
  hatchGeometry,
  createAttributeDefinition,
  createBlockDefinition,
  createInsert,
  insertFlatGeometry,
  insertGeometry,
  entityBounds,
  InsertEntity,
  LineEntity,
  TextEntity,
} from "../../domain/entities"
import {
  parseDrawingFile,
  serializeDrawing,
} from "../../serialization/drawingFile"
import { THEME } from "../../scene/theme"
import type { ScenePrimitive } from "../../scene/types"

const RED = "#ff0000"

/** A one-line block: a 100-unit run along +X from its base point. */
const barBlock = (name = "BAR") =>
  createBlockDefinition(name, p(0, 0), [
    lineOf(p(0, 0), p(100, 0), { id: "bar-line" }),
  ])

/** Runs BLOCK up to the "Select objects" prompt. */
function startBlock(
  cad: ReturnType<typeof createHarness>,
  name: string,
  base = p(0, 0)
) {
  return cad.command("BLOCK").type(name).enter().click(base)
}

describe("BLOCK", () => {
  it("files the selected objects under the name and leaves a reference", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })
    startBlock(cad, "BAR").click(p(50, 0)).enter()

    const block = cad.runtime.document.getBlock("BAR")
    expect(block?.name).toBe("BAR")
    expect(block?.basePoint).toBeCloseToPoint(p(0, 0))
    expect(block?.entities).toHaveLength(1)

    // Convert to Block: the geometry is gone from the drawing and one
    // reference stands in its place, so the drawing looks unchanged.
    expect(cad.runtime.document.get("L1")).toBeUndefined()
    const insert = cad.only<InsertEntity>("insert")
    expect(insert.blockId).toBe("BAR")
    expect(insert.position).toBeCloseToPoint(p(0, 0))
    expect([insert.scaleX, insert.scaleY]).toEqual([1, 1])
    expect(insert.rotation).toBeCloseTo(0)
  })

  it("pins the geometry to the base point it was given", () => {
    const cad = createHarness({
      entities: [lineOf(p(100, 0), p(200, 0), { id: "L1" })],
    })
    startBlock(cad, "BAR", p(100, 0)).click(p(150, 0)).enter()

    const insert = cad.only<InsertEntity>("insert")
    const drawn = insertGeometry(insert, cad.runtime.document.getBlock("BAR"))
    // The reference redraws the line exactly where it was.
    expect((drawn[0] as LineEntity).start).toBeCloseToPoint(p(100, 0))
    expect((drawn[0] as LineEntity).end).toBeCloseToPoint(p(200, 0))
  })

  it("reverts the definition and the geometry in one undo step", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })
    startBlock(cad, "BAR").click(p(50, 0)).enter()
    cad.undo()

    expect(cad.runtime.document.getBlock("BAR")).toBeUndefined()
    expect(cad.byId<LineEntity>("L1").end).toBeCloseToPoint(p(100, 0))
    expect(cad.typeCounts().insert).toBeUndefined()
  })

  it("lists what is already defined at the ? prompt, then ends (probe blocks/p104)", () => {
    const cad = createHarness({ blocks: [barBlock()] })
    cad.command("BLOCK").option("?")
    expect(cad.state().commandLine.prompt).toBe(
      "BLOCK Enter block(s) to list <*>:"
    )
    cad.enter()

    expect(cad.commandLog().at(-1)).toContain('  "BAR"')
    expect(cad.activeToolId()).toBe("select")
  })

  it("previews the object a click would add to the set", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })
    startBlock(cad, "BAR")
    const hovering = () =>
      cad
        .scene()
        .primitives.filter(
          (prim) => "stroke" in prim && prim.stroke?.color === THEME.entityHover
        ).length

    cad.moveTo(p(400, 400))
    expect(hovering()).toBe(0)
    cad.moveTo(p(50, 0))
    expect(hovering()).toBeGreaterThan(0)
  })

  it("leaves the drawing alone when cancelled", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })
    startBlock(cad, "BAR").click(p(50, 0)).escape()

    expect(cad.runtime.document.getBlock("BAR")).toBeUndefined()
    expect(cad.byId<LineEntity>("L1")).toBeDefined()
  })

  it("redefining a block updates every reference to it (probe blocks/p113)", () => {
    const cad = createHarness({
      blocks: [barBlock()],
      entities: [
        createInsert("BAR", p(0, 200), { id: "I1" }),
        lineOf(p(0, 0), p(40, 0), { id: "L1" }),
      ],
    })
    cad.command("BLOCK").type("BAR").enter().option("Yes")
    cad.click(p(0, 0)).click(p(20, 0)).enter()

    const drawn = insertGeometry(
      cad.byId<InsertEntity>("I1"),
      cad.runtime.document.getBlock("BAR")
    )
    expect((drawn[0] as LineEntity).end).toBeCloseToPoint(p(40, 200))
  })
})

describe("INSERT", () => {
  const withBar = () => createHarness({ blocks: [barBlock()] })

  it("places a reference at the picked point", () => {
    const cad = withBar()
    // The X scale, the Y scale and the rotation at their defaults (p02).
    cad
      .command("-INSERT")
      .type("BAR")
      .enter()
      .click(p(300, 50))
      .enter()
      .enter()
      .enter()

    const insert = cad.only<InsertEntity>("insert")
    expect(insert.blockId).toBe("BAR")
    expect(insert.position).toBeCloseToPoint(p(300, 50))
    expect(cad.activeToolId()).toBe("select")
  })

  it("takes a scale factor from the Scale keyword", () => {
    const cad = withBar()
    cad
      .command("-INSERT")
      .type("BAR")
      .enter()
      .option("Scale")
      .type("2")
      .enter()
      .click(p(0, 0))
      // Scale skips the X and Y scale; the rotation is still asked (p205).
      .enter()

    const insert = cad.only<InsertEntity>("insert")
    expect([insert.scaleX, insert.scaleY]).toEqual([2, 2])
    const drawn = insertGeometry(insert, cad.runtime.document.getBlock("BAR"))
    expect((drawn[0] as LineEntity).end).toBeCloseToPoint(p(200, 0))
  })

  it("takes an angle from the Rotate keyword", () => {
    const cad = withBar()
    cad
      .command("-INSERT")
      .type("BAR")
      .enter()
      .option("Rotate")
      .type("90")
      .enter()
      .click(p(0, 0))
      // Rotate skips the rotation; the X and Y scale are still asked (p206).
      .enter()
      .enter()

    const insert = cad.only<InsertEntity>("insert")
    expect(insert.rotation).toBeCloseTo(Math.PI / 2)
    const drawn = insertGeometry(insert, cad.runtime.document.getBlock("BAR"))
    expect((drawn[0] as LineEntity).end).toBeCloseToPoint(p(0, 100))
  })

  it("starts each run at scale 1 and angle 0 (probe blocks/p204)", () => {
    const cad = withBar()
    cad
      .command("-INSERT")
      .type("BAR")
      .enter()
      .option("Scale")
      .type("3")
      .enter()
      .option("Rotate")
      .type("30")
      .enter()
      .click(p(0, 0))
    // Enter at the name prompt takes the last block, as its <default>.
    cad.command("-INSERT").enter()
    expect(cad.state().commandLine.prompt).toBe(
      "-INSERT Specify insertion point or [Scale/Rotate]:"
    )
    cad.option("Scale")
    expect(cad.state().commandLine.prompt).toBe(
      "-INSERT Specify scale factor for XYZ axes <1>:"
    )
    cad.enter().option("Rotate")
    expect(cad.state().commandLine.prompt).toBe(
      "-INSERT Specify rotation angle <0>:"
    )
    cad.enter().click(p(0, 300))

    const placed = cad.latest() as InsertEntity
    expect([placed.scaleX, placed.scaleY]).toEqual([1, 1])
    expect(placed.rotation).toBe(0)
  })

  it("reports a name that is not defined and asks again", () => {
    const cad = withBar()
    cad.command("-INSERT").type("NOPE").enter()

    expect(cad.commandLog().join("\n")).toContain(
      'Block "NOPE" is not defined.'
    )
    expect(cad.activeToolId()).toBe("insert")
    expect(cad.entityCount).toBe(0)
  })

  it("previews exactly what it commits, drawn as the reference will be (desktop d06-7)", () => {
    // A red line and an attribute whose default the ghost shows.
    const cad = createHarness({
      blocks: [
        createBlockDefinition("TAGGED", p(0, 0), [
          { ...lineOf(p(0, 0), p(100, 0), { id: "red-line" }), color: RED },
          createAttributeDefinition(p(0, 10), "T1", {
            prompt: "Prompt one",
            value: "def1",
            id: "tag-def",
          }),
        ]),
      ],
    })
    cad.command("-INSERT").type("TAGGED").enter().moveTo(p(120, 60))
    // The reference's own: its red line and its attribute's text, not the
    // cursor's crosshair.
    const shown = (prim: ScenePrimitive) =>
      prim.kind === "text" ||
      (prim.kind === "segment" && prim.stroke.color === RED)
    const ghost = cad.scene().primitives.filter(shown)
    expect(ghost.map((prim) => prim.kind).sort()).toEqual(["segment", "text"])
    expect(ghost).toContainEqual(expect.objectContaining({ text: "def1" }))

    // The X scale, the Y scale, the rotation, then the attribute's default.
    cad.click(p(120, 60)).enter().enter().enter().enter().moveTo(p(900, 700))
    expect(cad.only<InsertEntity>("insert").position).toBeCloseToPoint(
      p(120, 60)
    )
    expect(cad.scene().primitives.filter(shown)).toEqual(ghost)
  })

  it("is one undo step", () => {
    const cad = withBar()
    cad.command("-INSERT").type("BAR").enter().click(p(0, 0))
    cad.undo()

    expect(cad.entityCount).toBe(0)
  })
})

describe("a block reference in the drawing", () => {
  const placed = (options: Parameters<typeof createInsert>[2] = {}) =>
    createHarness({
      blocks: [barBlock()],
      entities: [createInsert("BAR", p(0, 0), { id: "I1", ...options })],
    })

  it("draws the block's geometry, transformed", () => {
    const cad = placed({ scale: 2, rotation: Math.PI / 2 })
    cad.moveTo(p(500, 500))
    const segments = cad
      .scene()
      .primitives.filter(
        (prim) => prim.kind === "segment" && prim.stroke.color === THEME.entity
      )

    expect(segments).toHaveLength(1)
    const drawn = insertGeometry(
      cad.byId<InsertEntity>("I1"),
      cad.runtime.document.getBlock("BAR")
    )
    expect((drawn[0] as LineEntity).end).toBeCloseToPoint(p(0, 200))
  })

  it("gives layer-0 objects the reference's layer and leaves the rest alone", () => {
    const cad = createHarness()
    cad.runtime.document.load(
      [createInsert("MIX", p(0, 0), { id: "I1", layerId: "walls" })],
      {
        layers: [layerOf("0"), layerOf("walls"), layerOf("pinned")],
        blocks: [
          createBlockDefinition("MIX", p(0, 0), [
            lineOf(p(0, 0), p(10, 0), { id: "a" }),
            lineOf(p(0, 10), p(10, 10), { id: "b", layerId: "pinned" }),
          ]),
        ],
      }
    )

    const drawn = insertGeometry(
      cad.byId<InsertEntity>("I1"),
      cad.runtime.document.getBlock("MIX")
    )
    expect(drawn[0].layerId).toBe("walls")
    expect(drawn[1].layerId).toBe("pinned")
  })

  it("is picked by the geometry it draws", () => {
    const cad = placed()
    cad.click(p(50, 0))

    expect(cad.selectedIds()).toEqual(["I1"])
  })

  it("is measured by the geometry it draws", () => {
    const cad = placed({ scale: 2 })
    const bounds = entityBounds(
      cad.byId<InsertEntity>("I1"),
      cad.runtime.document.blockLookup()
    )

    expect(bounds.max.x).toBeCloseTo(200)
  })

  it("is caught by a crossing box", () => {
    const cad = placed()
    cad.click(p(300, 40)).click(p(40, -40))

    expect(cad.selectedIds()).toEqual(["I1"])
  })

  it("has one grip, on its insertion point, that moves the whole reference", () => {
    const cad = placed()
    cad.select("I1")
    cad.drag(p(0, 0), p(0, 150))

    expect(cad.byId<InsertEntity>("I1").position).toBeCloseToPoint(p(0, 150))
  })

  it("moves, rotates and scales as one object", () => {
    const cad = placed()
    // move/p211: MOVE takes the reference whole.
    cad.select("I1").command("MOVE").click(p(0, 0)).click(p(0, 40))
    expect(cad.byId<InsertEntity>("I1").position).toBeCloseToPoint(p(0, 40))

    // transforms/p138: ROTATE turns the reference's rotation.
    cad.select("I1").command("ROTATE").click(p(0, 40)).type("90").enter()
    expect(cad.byId<InsertEntity>("I1").rotation).toBeCloseTo(Math.PI / 2)

    cad.select("I1").command("SCALE").click(p(0, 40)).type("2").enter()
    const scaled = cad.byId<InsertEntity>("I1")
    expect([scaled.scaleX, scaled.scaleY]).toEqual([2, 2])
  })

  // probe transforms/p282: the reference reflected about the Y axis.
  it("mirrors by reflecting the reference, not just its insertion point", () => {
    const cad = placed()
    cad
      .select("I1")
      .command("MIRROR")
      .click(p(0, 0))
      .click(p(0, 100))
      .option("Yes")

    const insert = cad.only<InsertEntity>("insert")
    const drawn = insertGeometry(insert, cad.runtime.document.getBlock("BAR"))
    // The bar ran to +X; reflected across the Y axis it runs to −X.
    expect((drawn[0] as LineEntity).end).toBeCloseToPoint(p(-100, 0))
  })

  it("MIRROR negates its X scale and turns its rotation, as AutoCAD's (probe blocks/p332)", () => {
    const cad = createHarness({
      blocks: [barBlock()],
      entities: [
        createInsert("BAR", p(100, 0), {
          id: "I1",
          scaleX: 2,
          scaleY: 3,
          rotation: Math.PI / 6,
        }),
      ],
    })
    const mirror = () =>
      cad
        .select(cad.only<InsertEntity>("insert").id)
        .command("MIRROR")
        .click(p(0, 0))
        .click(p(0, 100))
        .option("Yes")

    mirror()
    const once = cad.only<InsertEntity>("insert")
    expect(once.position).toBeCloseToPoint(p(-100, 0))
    expect(once.rotation).toBeCloseToAngle((330 * Math.PI) / 180)
    expect([once.scaleX, once.scaleY]).toEqual([-2, 3])
    // Drawn where the reflection of the original lies.
    const end = (insertGeometry(once, barBlock())[0] as LineEntity).end
    expect(end).toBeCloseToPoint(p(-100 - 200 * Math.cos(Math.PI / 6), 100))

    mirror()
    const twice = cad.only<InsertEntity>("insert")
    expect([twice.scaleX, twice.scaleY]).toEqual([2, 3])
    expect(twice.rotation).toBeCloseToAngle(Math.PI / 6)
  })

  it("snaps to the geometry inside the block", () => {
    const cad = createHarness({
      snap: true,
      blocks: [barBlock()],
      entities: [createInsert("BAR", p(0, 0), { id: "I1" })],
    })
    // 3 units off the block's far endpoint: only a snap lands it exactly.
    cad.command("LINE").click(p(97, 3)).click(p(300, 300)).escape()

    expect(cad.only<LineEntity>("line").start).toBeCloseToPoint(p(100, 0))
  })
})

describe("a reference scaled apart on X and Y (probes blocks/p02, p219)", () => {
  const shapes = createBlockDefinition("SHAPES", p(0, 0), [
    lineOf(p(0, 0), p(10, 10), { id: "s-line" }),
    circleOf(p(0, 0), 10, { id: "s-circle" }),
    arcOf(p(0, 0), 10, 0, Math.PI / 2, { id: "s-arc" }),
  ])
  const lookup = (id: string) => (id === "SHAPES" ? shapes : undefined)

  it("maps each object through its affine map: a circle becomes an ellipse", () => {
    const insert = createInsert("SHAPES", p(100, 0), { scaleX: 2, scaleY: 3 })
    const [line, circle, arc] = insertFlatGeometry(insert, lookup)

    expect((line as LineEntity).end).toBeCloseToPoint(p(120, 30))
    expect(circle.type).toBe("ellipse")
    const ellipse = circle as EllipseEntity
    expect(ellipse.center).toBeCloseToPoint(p(100, 0))
    expect(Math.hypot(ellipse.majorAxis.x, ellipse.majorAxis.y)).toBeCloseTo(30)
    expect(Math.abs(ellipse.majorAxis.x)).toBeCloseTo(0)
    expect(ellipse.ratio).toBeCloseTo(2 / 3)
    expect(arc.type).toBe("ellipse")
    expect(ellipseStartPoint(arc as EllipseEntity)).toBeCloseToPoint(p(120, 0))
    expect(ellipseEndPoint(arc as EllipseEntity)).toBeCloseToPoint(p(100, 30))
  })

  it("draws an arc the right way round under a reflection that stretches", () => {
    const insert = createInsert("SHAPES", p(0, 0), { scaleX: -2, scaleY: 3 })
    const arc = insertFlatGeometry(insert, lookup)[2] as EllipseEntity
    // The quarter from +X to +Y lands from −X to +Y: still the short way.
    const ends = [ellipseStartPoint(arc), ellipseEndPoint(arc)]
    expect(ends).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          x: expect.closeTo(-20),
          y: expect.closeTo(0),
        }),
        expect.objectContaining({
          x: expect.closeTo(0),
          y: expect.closeTo(30),
        }),
      ])
    )
    expect(ellipseSweepParams(arc).sweep).toBeCloseTo(Math.PI / 2)
  })

  it("draws a text at X's scale, its point where the map puts it (INSERT's Missing)", () => {
    const labelled = createBlockDefinition("LABEL", p(0, 0), [
      textOf(p(10, 10), "A", { height: 2.5 }),
    ])
    const insert = createInsert("LABEL", p(0, 0), { scaleX: 2, scaleY: 3 })
    const [text] = insertFlatGeometry(insert, () => labelled) as TextEntity[]
    expect(text.position).toBeCloseToPoint(p(20, 30))
    expect(text.height).toBeCloseTo(5)
    expect(text.rotation).toBeCloseTo(0)
  })

  it("places a nested reference through the outer one's map", () => {
    const inner = barBlock()
    const outer = createBlockDefinition("OUTER", p(0, 0), [
      createInsert("BAR", p(10, 10), { scaleX: 2, scaleY: 2 }),
    ])
    const lookup = (id: string) =>
      id === "OUTER" ? outer : id === "BAR" ? inner : undefined
    const insert = createInsert("OUTER", p(0, 0), { scaleX: 3, scaleY: -1 })
    const [line] = insertFlatGeometry(insert, lookup) as LineEntity[]
    expect(line.start).toBeCloseToPoint(p(30, -10))
    expect(line.end).toBeCloseToPoint(p(630, -10))
  })

  it("draws a hatch's pattern stretched with its loops", () => {
    const hatched = createBlockDefinition("HB", p(0, 0), [
      hatchOf([loopOf(p(0, 0), p(100, 50))], { patternId: "ANSI31" }),
    ])
    const insert = createInsert("HB", p(0, 0), { scaleX: 1, scaleY: 2 })
    const [hatch] = insertFlatGeometry(insert, () => hatched) as HatchEntity[]
    expect(hatch.loops[0].vertices).toBeCloseToPoints([
      p(0, 0),
      p(100, 0),
      p(100, 100),
      p(0, 100),
    ])
    const { lines } = hatchGeometry(hatch)
    expect(lines.length).toBeGreaterThan(0)
    for (const [a, b] of lines) {
      // ANSI31's 45° lines, twice as steep.
      expect((b.y - a.y) / (b.x - a.x)).toBeCloseTo(2)
      expect(a.x).toBeGreaterThanOrEqual(-1e-9)
      expect(a.y).toBeLessThanOrEqual(100 + 1e-9)
    }
  })

  it("keeps the uniform path for equal factors", () => {
    const insert = createInsert("SHAPES", p(0, 0), { scaleX: 2, scaleY: 2 })
    expect(insertFlatGeometry(insert, lookup)[1].type).toBe("circle")
  })
})

describe("a hatch in a reflected reference (probes blocks/p227–p231)", () => {
  // ANSI31 over 0,0–100,50, as -HATCH drew it in the probes: 45° lines 3.175
  // apart, on the lattice through the origin.
  const hatched = createBlockDefinition("HB", p(0, 0), [
    hatchOf([loopOf(p(0, 0), p(100, 50))], { patternId: "ANSI31" }),
  ])
  /** Whether a 45° line through `at` lies on the lattice through `origin`. */
  const onLattice = (at: Vec2, origin: Vec2) => {
    const steps = (at.y - origin.y - (at.x - origin.x)) / (3.175 * Math.SQRT2)
    return Math.abs(steps - Math.round(steps)) < 1e-6
  }
  /** The world slopes, in whole degrees, of the segments the scene draws. */
  const slopes = (scaleX: number) => {
    const cad = createHarness({
      blocks: [hatched],
      entities: [createInsert("HB", p(200, 0), { id: "I1", scaleX })],
    })
    cad.moveTo(p(-400, -300))
    const found = new Set<number>()
    for (const prim of cad.scene().primitives) {
      if (prim.kind !== "segment" || prim.stroke.color !== THEME.entity)
        continue
      const angle = Math.atan2(prim.a.y - prim.b.y, prim.b.x - prim.a.x)
      found.add(Math.round(normalizeDegrees((angle * 180) / Math.PI)) % 180)
    }
    return [...found]
  }

  it("draws its pattern reflected with the reference (plots p230, p231)", () => {
    expect(slopes(1)).toEqual([45])
    expect(slopes(-1)).toEqual([135])
  })

  it("EXPLODE keeps the pattern's angle and its lattice through the origin (probes blocks/p227, p228)", () => {
    const cad = createHarness({
      blocks: [hatched],
      entities: [createInsert("HB", p(200, 0), { id: "I1", scaleX: -1 })],
    })
    cad.select("I1").command("EXPLODE")
    const hatch = cad.only<HatchEntity>("hatch")
    expect(hatch.patternAngle).toBe(0)
    expect(hatch.origin).toBeCloseToPoint(p(0, 0))
    expect(hatch.loops[0].vertices).toBeCloseToPoints([
      p(200, 0),
      p(100, 0),
      p(100, 50),
      p(200, 50),
    ])
    const { lines } = hatchGeometry(hatch)
    expect(lines.length).toBeGreaterThan(0)
    expect(lines.every(([a]) => onLattice(a, p(0, 0)))).toBe(true)
  })

  it("EXPLODE of one not reflected moves the lattice with it (probe blocks/p229)", () => {
    const cad = createHarness({
      blocks: [hatched],
      entities: [createInsert("HB", p(300, 0), { id: "I1" })],
    })
    cad.select("I1").command("EXPLODE")
    const { lines } = hatchGeometry(cad.only<HatchEntity>("hatch"))
    expect(lines.every(([a]) => onLattice(a, p(300, 0)))).toBe(true)
  })
})

describe("EXPLODE of a block reference", () => {
  // probe pieces/p252: B (a B0 reference at 0,0, a line 0,0 → 20,0 on layer
  // 0, a circle r5 on L2 colour 3, a B0 reference at 0,10, a text HI at
  // 0,-10 h2) inserted on L1, red, at 10,10, scale 2, rotation 30 → B0 at
  // 10,10 turned 30; LINE 10,10 → 44.641016,30 on layer 0 ByLayer; CIRCLE
  // r10 on L2 colour 3; B0 at 0,27.320508; TEXT at 20,-7.320508 h4 turned 30.
  it("places one level of the block where the reference drew it, in the objects' own colours (pieces/p252)", () => {
    const b0 = createBlockDefinition("B0", p(0, 0), [lineOf(p(0, 0), p(10, 0))])
    const b = createBlockDefinition("B", p(0, 0), [
      createInsert("B0", p(0, 0)),
      lineOf(p(0, 0), p(20, 0)),
      { ...circleOf(p(0, 0), 5, { layerId: "L2" }), color: "#00ff00" },
      createInsert("B0", p(0, 10)),
      textOf(p(0, -10), "HI", { height: 2 }),
    ])
    const cad = createHarness()
    cad.runtime.document.load(
      [
        {
          ...createInsert("B", p(10, 10), {
            id: "I",
            scale: 2,
            rotation: Math.PI / 6,
            layerId: "L1",
          }),
          color: "#ff0000",
        },
      ],
      {
        layers: [layerOf("0"), layerOf("L1"), layerOf("L2")],
        blocks: [b0, b],
      }
    )
    cad.select("I").command("EXPLODE")

    const [first, line, circle, second, text] = cad.entities() as [
      InsertEntity,
      LineEntity,
      CircleEntity,
      InsertEntity,
      TextEntity,
    ]
    expect([first.blockId, first.scaleX, first.scaleY, first.rotation]).toEqual(
      ["B0", 2, 2, Math.PI / 6]
    )
    expect(first.position).toBeCloseToPoint(p(10, 10))
    expect(line.start).toBeCloseToPoint(p(10, 10))
    expect(line.end).toBeCloseToPoint(p(44.641016, 30))
    expect([line.layerId, line.color]).toEqual(["0", undefined])
    expect(circle.center).toBeCloseToPoint(p(10, 10))
    expect([circle.radius, circle.layerId, circle.color]).toEqual([
      10,
      "L2",
      "#00ff00",
    ])
    expect(second.position).toBeCloseToPoint(p(0, 27.320508))
    expect(text.position).toBeCloseToPoint(p(20, -7.320508))
    expect(text.height).toBeCloseTo(4)
    expect(text.rotation).toBeCloseTo(Math.PI / 6)
  })

  it("gives back copies of the objects that compose the block", () => {
    const cad = createHarness({
      blocks: [barBlock()],
      entities: [createInsert("BAR", p(0, 200), { id: "I1", scale: 2 })],
    })
    cad.select("I1").command("EXPLODE")

    const line = cad.only<LineEntity>("line")
    expect(line.id).not.toBe("bar-line")
    expect(line.start).toBeCloseToPoint(p(0, 200))
    expect(line.end).toBeCloseToPoint(p(200, 200))
    expect(cad.typeCounts().insert).toBeUndefined()
  })

  it("removes one grouping level at a time", () => {
    const cad = createHarness({
      blocks: [
        barBlock(),
        createBlockDefinition("OUTER", p(0, 0), [
          createInsert("BAR", p(0, 0), { id: "inner" }),
        ]),
      ],
      entities: [createInsert("OUTER", p(0, 0), { id: "I1" })],
    })
    cad.select("I1").command("EXPLODE")

    // The nested reference comes back as a reference, to be exploded again.
    const insert = cad.only<InsertEntity>("insert")
    expect(insert.blockId).toBe("BAR")
    expect(cad.typeCounts().line).toBeUndefined()
  })

  it("is one undo step", () => {
    const cad = createHarness({
      blocks: [barBlock()],
      entities: [createInsert("BAR", p(0, 0), { id: "I1" })],
    })
    cad.select("I1").command("EXPLODE").undo()

    expect(cad.byId<InsertEntity>("I1").blockId).toBe("BAR")
  })

  it("gives the objects back their own layer, not the one they were shown on", () => {
    const cad = createHarness()
    cad.runtime.document.load(
      [createInsert("MIX", p(0, 0), { id: "I1", layerId: "walls" })],
      {
        layers: [layerOf("0"), layerOf("walls"), layerOf("pinned")],
        blocks: [
          createBlockDefinition("MIX", p(0, 0), [
            lineOf(p(0, 0), p(10, 0), { id: "a" }),
            lineOf(p(0, 10), p(10, 10), { id: "b", layerId: "pinned" }),
          ]),
        ],
      }
    )
    cad.select("I1").command("EXPLODE")

    // The layer-0 object was only *displayed* on "walls"; exploded it reverts.
    const layers = cad.entities().map((entity) => entity.layerId)
    expect(layers.sort()).toEqual(["0", "pinned"])
  })
})

describe("blocks in the drawing file", () => {
  const snapshot = (cad: ReturnType<typeof createHarness>) => ({
    settings: cad.runtime.document.getSettings(),
    layers: cad.runtime.document.getLayers(),
    currentLayerId: cad.runtime.document.getCurrentLayerId(),
    textStyles: cad.runtime.document.getTextStyles(),
    currentTextStyleId: cad.runtime.document.getCurrentTextStyleId(),
    dimStyles: cad.runtime.document.getDimStyles(),
    currentDimStyleId: cad.runtime.document.getCurrentDimStyleId(),
    blocks: cad.runtime.document.getBlocks(),
    entities: cad.entities(),
  })

  it("survives a save and reload, with its two factors, its height, colour and attributes", () => {
    const reference: InsertEntity = {
      ...createInsert("BAR", p(10, 20), {
        id: "I1",
        scaleX: -3,
        scaleY: 2,
        rotation: 1,
        attributes: [
          blockAttribute(createAttributeDefinition(p(0, 5), "T1"), "V1"),
        ],
      }),
      elevation: 7,
      color: RED,
    }
    const cad = createHarness({ blocks: [barBlock()], entities: [reference] })
    const parsed = parseDrawingFile(serializeDrawing(snapshot(cad)))

    expect(parsed.blocks).toHaveLength(1)
    expect(parsed.blocks[0].entities).toHaveLength(1)
    expect(parsed.entities[0]).toEqual(reference)
  })

  it("drops a reference whose block the file does not define", () => {
    const cad = createHarness({
      entities: [createInsert("GONE", p(0, 0), { id: "I1" })],
    })
    const parsed = parseDrawingFile(serializeDrawing(snapshot(cad)))

    expect(parsed.entities).toHaveLength(0)
  })

  it("opens a file written before blocks existed", () => {
    const legacy = JSON.stringify({
      type: "easycad-drawing",
      version: 15,
      entities: [
        { id: "L1", type: "line", start: { x: 0, y: 0 }, end: { x: 1, y: 0 } },
      ],
    })
    const parsed = parseDrawingFile(legacy)

    expect(parsed.blocks).toEqual([])
    expect(parsed.entities).toHaveLength(1)
  })
})

describe("the blocks palette", () => {
  const withBlocks = () =>
    createHarness({
      blocks: [barBlock("DOOR"), barBlock("WINDOW")],
      entities: [createInsert("DOOR", p(0, 0), { id: "I1" })],
    })

  it("lists the drawing's blocks with how many references each has", () => {
    const cad = withBlocks()
    expect(cad.state().blocks).toEqual([
      { id: "DOOR", name: "DOOR", referenceCount: 1 },
      { id: "WINDOW", name: "WINDOW", referenceCount: 0 },
    ])
  })

  it("is closed until BLOCKSPALETTE opens it", () => {
    const cad = withBlocks()
    expect(cad.state().palette.open).toBe(false)

    cad.command("BLOCKSPALETTE")
    expect(cad.state().palette).toEqual({ open: true, tab: "blocks" })

    cad.runtime.togglePalette("blocks")
    expect(cad.state().palette.open).toBe(false)
  })

  it("stays open through one insertion after another", () => {
    const cad = withBlocks()
    cad.command("BLOCKSPALETTE")

    cad.runtime.insertBlock("WINDOW")
    cad.click(p(250, 0)).enter().enter().enter()
    cad.runtime.insertBlock("DOOR")
    cad.click(p(500, 0)).enter().enter().enter()

    expect(cad.state().palette).toEqual({ open: true, tab: "blocks" })
    expect(
      cad
        .entities()
        .filter((entity) => entity.type === "insert")
        .map((entity) => (entity as InsertEntity).blockId)
    ).toEqual(["DOOR", "WINDOW", "DOOR"])
  })

  it("previews a block through the same scene the drawing is built from", () => {
    const cad = withBlocks()
    const scene = cad.runtime.buildBlockPreview("DOOR", 64, 64)

    expect(scene?.width).toBe(64)
    expect(scene?.primitives.filter((prim) => prim.kind === "segment")).toEqual(
      // The one line the block is made of, framed inside the thumbnail.
      [expect.objectContaining({ kind: "segment" })]
    )
    expect(cad.runtime.buildBlockPreview("NOPE", 64, 64)).toBeNull()
  })

  it("clicking a block starts INSERT with it already chosen", () => {
    const cad = withBlocks()
    cad.runtime.insertBlock("WINDOW")

    expect(cad.activeToolId()).toBe("insert")
    // Straight to the insertion point: the name prompt has been answered.
    expect(cad.state().dynamicInput?.fields[0].label).toBe("X,Y")

    cad.click(p(250, 0)).enter().enter().enter()
    expect(cad.latest()).toMatchObject({ type: "insert", blockId: "WINDOW" })
  })

  it("asks -INSERT's point with no echo, and U and REDO name it -INSERT (desktop d06-6, d06-9)", () => {
    const cad = withBlocks()
    cad.runtime.insertBlock("WINDOW")

    expect(cad.state().commandLine.prompt).toBe(
      "-INSERT Specify insertion point or [Scale/Rotate]:"
    )
    expect(cad.commandLog()).toEqual([])

    answer(cad, "250,0", "", "", "", "U", "REDO")
    expect(cad.commandLog()).toEqual([
      "Specify insertion point or [Scale/Rotate]: 250,0",
      "Enter X scale factor, specify opposite corner, or [Corner/XYZ] <1>:",
      "Enter Y scale factor <use X scale factor>:",
      "Specify rotation angle <0>:",
      "U",
      "-INSERT",
      "REDO",
      "-INSERT",
      "Everything has been redone",
    ])
  })

  it("ignores a block that is not defined", () => {
    const cad = withBlocks()
    cad.runtime.insertBlock("NOPE")

    expect(cad.activeToolId()).toBe("select")
  })
})

/** Typed at the command line and confirmed, as AutoCAD's prompt reads it. */
function answer(cad: ReturnType<typeof createHarness>, ...texts: string[]) {
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

/** A block holding one reference to `inner`, and nothing else. */
const holding = (name: string, inner: string) =>
  createBlockDefinition(name, p(0, 0), [
    createInsert(inner, p(0, 0), { id: `${name}-${inner}` }),
  ])

const blockNames = (cad: ReturnType<typeof createHarness>) =>
  cad.runtime.document.getBlocks().map((block) => block.name)

describe("PURGE", () => {
  it("keeps a block used only inside a referenced block, which still draws it (probe blocks/p150)", () => {
    const cad = createHarness({
      blocks: [barBlock("B1"), holding("B2", "B1")],
      entities: [createInsert("B2", p(0, 0), { id: "I2" })],
    })
    answer(cad, "-PURGE", "B", "*", "N")

    expect(blockNames(cad)).toEqual(["B1", "B2"])
    expect(cad.commandLog().at(-1)).toBe("No unreferenced blocks found.")
    const shown = insertFlatGeometry(
      cad.byId<InsertEntity>("I2"),
      cad.runtime.document.blockLookup()
    )
    expect(shown).toHaveLength(1)
  })

  it("takes a chain of unused nested blocks in one run (probe blocks/p142)", () => {
    const cad = createHarness({
      blocks: [barBlock("B1"), holding("B2", "B1")],
    })
    answer(cad, "-PURGE", "B", "*", "N")

    expect(blockNames(cad)).toEqual([])
    expect(cad.commandLog().slice(-3)).toEqual([
      'Deleting block "B1".',
      'Deleting block "B2".',
      "2 blocks deleted.",
    ])
  })

  it("takes an erased array's anonymous block, by its name (probe blocks/p147)", () => {
    const cad = createHarness({
      blocks: [
        createBlockDefinition("*U1", p(0, 0), [lineOf(p(0, 0), p(1, 0))]),
      ],
    })
    answer(cad, "-PURGE", "B", "*", "N")

    expect(blockNames(cad)).toEqual([])
    expect(cad.commandLog().slice(-2)).toEqual([
      'Deleting block "*U1".',
      "1 block deleted.",
    ])
  })

  it("keeps a block in use, whatever the names (probe blocks/p145)", () => {
    const cad = createHarness({
      blocks: [barBlock("DOOR"), barBlock("WINDOW")],
      entities: [createInsert("DOOR", p(0, 0), { id: "I1" })],
    })
    answer(cad, "PURGE", "B", "DOOR", "N")

    expect(blockNames(cad)).toEqual(["DOOR", "WINDOW"])
    expect(cad.runtime.purgeBlocks(["DOOR"])).toBe(0)
  })

  it("matches the names case-blind (probes blocks/p140, p154)", () => {
    const cad = createHarness({
      blocks: [barBlock("B1"), barBlock("B2"), barBlock("C1")],
    })
    answer(cad, "-PURGE", "B", "b*", "N")

    expect(blockNames(cad)).toEqual(["C1"])
  })

  it("asks each name when verifying, and takes those answered Yes (probe blocks/p141)", () => {
    const cad = createHarness({ blocks: [barBlock("B1"), barBlock("B2")] })
    answer(cad, "-PURGE", "B", "*", "", "Y", "")

    expect(blockNames(cad)).toEqual(["B2"])
  })

  it("never takes a block that one kept still holds", () => {
    // B2 holds B1; answering Yes to B1 and No to B2 would leave B2 drawing
    // nothing, the outcome probe blocks/p150 rules out.
    const cad = createHarness({
      blocks: [barBlock("B1"), holding("B2", "B1")],
    })
    answer(cad, "-PURGE", "B", "*", "Y", "Y", "N")

    expect(blockNames(cad)).toEqual(["B1", "B2"])
  })

  it("is one undo step, named as the command was typed (probe blocks/p138)", () => {
    const cad = createHarness({ blocks: [barBlock("B1"), barBlock("B2")] })
    answer(cad, "-PU", "B", "*", "N")
    expect(blockNames(cad)).toEqual([])

    cad.command("U")
    expect(cad.commandLog().at(-1)).toBe("-PURGE")
    expect(blockNames(cad)).toEqual(["B1", "B2"])
  })

  it("purges what the drawing stops referencing", () => {
    const cad = createHarness({
      blocks: [barBlock("DOOR")],
      entities: [createInsert("DOOR", p(0, 0), { id: "I1" })],
    })
    cad.select("I1").press("Delete")
    answer(cad, "PURGE", "B", "", "N")

    expect(blockNames(cad)).toEqual([])
  })
})

describe("block names", () => {
  it("INSERT takes b1 for B1 (probe blocks/p210)", () => {
    const cad = createHarness({ blocks: [barBlock("B1")] })
    answer(cad, "-INSERT", "b1", "5,5", "", "", "")

    expect(cad.latest()).toMatchObject({ type: "insert", blockId: "B1" })
  })

  it("BLOCK b1 beside B1 leaves one block, named B1 (probe blocks/p115)", () => {
    const cad = createHarness({
      blocks: [barBlock("B1")],
      entities: [lineOf(p(0, 0), p(0, 50), { id: "L1" })],
    })
    answer(cad, "BLOCK", "b1", "Y", "0,0", "L")
    cad.enter()

    expect(blockNames(cad)).toEqual(["B1"])
    expect(cad.runtime.document.getBlock("B1")?.entities).toHaveLength(1)
    expect(cad.only<InsertEntity>("insert").blockId).toBe("B1")
  })
})

describe("the properties palette", () => {
  // desktop blocks/d03-2 (B1 at 30,10 with TAG2 and TAG1) and d03-3 (the one
  // inserted at X −1, Y 1).
  it("files a reference under Geometry, Misc and Attributes, in AutoCAD's order", () => {
    const tagged = createBlockDefinition("B1", p(0, 0), [
      lineOf(p(0, 0), p(20, 0)),
    ])
    const cad = createHarness({
      blocks: [tagged],
      entities: [
        createInsert("B1", p(80, 10), {
          id: "I1",
          scaleX: -1,
          scaleY: 1,
          attributes: [
            blockAttribute(createAttributeDefinition(p(2, 1), "TAG2"), "def2"),
            blockAttribute(createAttributeDefinition(p(2, 4), "TAG1"), "def1"),
          ],
        }),
      ],
    })
    cad.select("I1")

    const info = cad.state().properties.info
    // AutoCAD's name, capital R (desktop properties/d06-2).
    expect(info?.title).toBe("Block Reference")
    expect(
      info?.groups.map((group) => [
        group.title,
        group.rows.map((row) => `${row.label}=${row.value}`),
      ])
    ).toEqual([
      [
        "Geometry",
        [
          "Position X=80.00",
          "Position Y=10.00",
          "Position Z=0.00",
          "Scale X=-1.00",
          "Scale Y=1.00",
          "Scale Z=1.00",
        ],
      ],
      ["Misc", ["Name=B1", "Rotation=0°"]],
      ["Attributes", ["TAG2=def2", "TAG1=def1"]],
    ])
    const rows = info?.groups.flatMap((group) => group.rows) ?? []
    const editable = rows.filter((row) => row.edit).map((row) => row.label)
    expect(editable).toEqual([
      "Position X",
      "Position Y",
      "Position Z",
      "Scale X",
      "Scale Y",
      "Rotation",
    ])
  })

  it("retypes the X and Y scale in place, refusing 0", () => {
    const cad = createHarness({
      blocks: [barBlock()],
      entities: [createInsert("BAR", p(0, 0), { id: "I1" })],
    })
    cad.select("I1")
    cad.runtime.setSelectionProperty("insertScaleX", "4")
    cad.runtime.setSelectionProperty("insertScaleY", "-2")
    cad.runtime.setSelectionProperty("insertScaleY", "0")

    const insert = cad.byId<InsertEntity>("I1")
    expect([insert.scaleX, insert.scaleY]).toEqual([4, -2])
  })
})
