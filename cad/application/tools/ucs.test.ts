import { describe, expect, it } from "vitest"
import { createHarness } from "../../../test/harness"
import {
  arcOf,
  circleOf,
  deg,
  lineOf,
  p,
  polylineOf,
  rectOf,
  textOf,
} from "../../../test/builders"
import {
  createBlockDefinition,
  dimensionMeasurement,
  insertFlatGeometry,
  type DimensionEntity,
  type HatchEntity,
  type InsertEntity,
  type LineEntity,
  type MTextEntity,
  type PolylineEntity,
  type TextEntity,
} from "../../domain/entities"
import type { Ucs } from "../../domain/ucs"
import { parseDrawingFile } from "../../serialization/drawingFile"

type Harness = ReturnType<typeof createHarness>

const ucsOf = (cad: Harness): Ucs => cad.runtime.document.getSettings().ucs

/** Typed at the command line and confirmed, as the console types it. */
function answer(cad: Harness, ...texts: string[]): Harness {
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

/** A drawing written at AutoCAD's LUPREC 4, as the console's is. */
function four(): Harness {
  const cad = createHarness()
  cad.runtime.setDocumentPrecision(4)
  return cad
}

/** What ID @ reports: LASTPOINT, in the current UCS. */
function lastPoint(cad: Harness): string | undefined {
  answer(cad, "ID", "@")
  return cad.commandLog().at(-1)
}

const elevation = (cad: Harness) => cad.runtime.document.getSettings().elevation

/** The UCS at (100, 50) with its X axis along world +Y. */
function turned(cad: Harness): Harness {
  return cad.command("UCS").click(p(100, 50)).click(p(100, 80)).enter()
}

describe("UCS", () => {
  it("moves the origin with one point and keeps the axes on Enter", () => {
    const cad = createHarness()
    cad.command("UCS").click(p(30, 40)).enter()
    expect(ucsOf(cad).origin).toBeCloseToPoint(p(30, 40))
    expect(ucsOf(cad).xAxis).toBeCloseToPoint(p(1, 0))
    expect(cad.activeToolId()).toBe("select")
  })

  it("turns the X axis through a second point, the XY plane accepted", () => {
    const cad = turned(createHarness())
    expect(ucsOf(cad).origin).toBeCloseToPoint(p(100, 50))
    expect(ucsOf(cad).xAxis).toBeCloseToPoint(p(0, 1))
    expect(cad.activeToolId()).toBe("select")
  })

  it("turns the UCS over with a third point on the negative Y side", () => {
    const cad = createHarness()
    cad.command("UCS").click(p(0, 0)).click(p(10, 0)).click(p(5, -10))
    expect(cad.activeToolId()).toBe("select")
    expect(ucsOf(cad).xAxis).toBeCloseToPoint(p(1, 0))
    expect(ucsOf(cad).yAxis).toBeCloseToPoint(p(0, -1))
    expect(ucsOf(cad).yAxis.z).toBeCloseTo(0, 12)
  })

  it("reads the points it asks for in the UCS it is changing", () => {
    const cad = turned(createHarness())
    cad.command("UCS").type("10,0").enter().enter()
    expect(ucsOf(cad).origin).toBeCloseToPoint(p(100, 60))
  })

  // probes ucs/p111, p113, p151: the first prompt's point on X is read in
  // the UCS moved to the origin given, the third along the new X;
  // 3point's in the current UCS.
  it("reads the first prompt's points on X and on the plane from the new origin", () => {
    const typed = (...texts: string[]) => answer(createHarness(), ...texts)
    const fromWorld = typed("UCS", "100,0", "200,50", "100,100")
    expect(ucsOf(fromWorld).origin).toBeCloseToPoint(p(100, 0))
    expect(ucsOf(fromWorld).xAxis).toBeCloseToPoint(p(0.970143, 0.242536))

    const moved = typed("UCS", "O", "30,0", "UCS", "50,0", "60,10", "50,10")
    expect(ucsOf(moved).origin).toBeCloseToPoint(p(80, 0))
    expect(ucsOf(moved).xAxis).toBeCloseToPoint(p(0.986394, 0.164399))
    expect(ucsOf(moved).yAxis).toBeCloseToPoint(p(-0.164399, 0.986394))
    moved.runtime.setCommandLineText("ID")
    moved.runtime.submitCommandLine()
    moved.runtime.setCommandLineText("@")
    moved.runtime.submitCommandLine()
    expect(moved.commandLog().at(-1)).toBe(
      " X = 50.00     Y = 10.00     Z = 0.00"
    )

    const three = typed(
      "UCS",
      "O",
      "30,0",
      "UCS",
      "3",
      "50,0",
      "60,10",
      "50,10"
    )
    expect(ucsOf(three).xAxis).toBeCloseToPoint(p(0.707107, 0.707107))
  })

  // probes ucs/p151, p120, p401: the third point is read in the frame of the
  // new origin and X, its Y the current Z × the new X — so 100,20 above that
  // X keeps Z up, and 0,-10 below it turns Z down —, and LASTPOINT is the
  // point given, typed (`*` in the WCS) or clicked.
  it("reads the first prompt's third point along the new X, LASTPOINT at it", () => {
    const up = answer(four(), "UCS", "100,0", "200,50", "100,20")
    expect(ucsOf(up).yAxis).toBeCloseToPoint(p(-0.242536, 0.970143))
    expect(ucsOf(up).yAxis.z).toBeCloseTo(0, 12)
    expect(lastPoint(up)).toBe(" X = 100.0000     Y = 20.0000     Z = 0.0000")

    const over = answer(four(), "UCS", "0,0", "10,0", "0,-10")
    expect(ucsOf(over).yAxis).toBeCloseToPoint(p(0, -1))
    expect(lastPoint(over)).toBe(" X = 0.0000     Y = 10.0000     Z = 0.0000")

    const world = answer(four(), "UCS", "100,0", "200,50", "*100,100")
    expect(ucsOf(world).yAxis).toBeCloseToPoint(p(-0.242536, 0.970143))
    expect(lastPoint(world)).toBe(" X = 24.2536     Y = 97.0143     Z = 0.0000")

    const clicked = four()
    clicked.command("UCS").click(p(100, 0)).click(p(300, 50)).click(p(100, 100))
    expect(lastPoint(clicked)).toBe(
      " X = 24.2536     Y = 97.0143     Z = 0.0000"
    )
  })

  // probe ucs/p144: an origin typed without a Z lies ELEVATION above the
  // current XY plane.
  it("lays an origin typed without a Z at ELEVATION", () => {
    const cad = answer(createHarness(), "ELEV", "7", "0", "UCS", "10,0", "")
    expect(ucsOf(cad).origin).toEqual({ x: 10, y: 0, z: 7 })
  })

  it("Enter at the first prompt is <World>", () => {
    const cad = turned(createHarness())
    cad.command("UCS").enter()
    expect(ucsOf(cad).origin).toBeCloseToPoint(p(0, 0))
    expect(ucsOf(cad).xAxis).toBeCloseToPoint(p(1, 0))
  })

  // probes ucs/p125, p402: a point at X's or Y's angle is its heading from
  // the UCS's origin in its XY plane, as at Z's; one on the origin is 0.
  it("X and Y take one point as their angle, from the UCS's origin", () => {
    const cad = four()
    answer(cad, "UCS", "Z", "30", "UCS", "50,0", "", "UCS", "X", "0,10")
    expect(cad.activeToolId()).toBe("select")
    expect(ucsOf(cad).origin).toBeCloseToPoint(p(43.3013, 25), 4)
    expect(ucsOf(cad).xAxis).toBeCloseToPoint(p(0.866025, 0.5))
    expect(ucsOf(cad).yAxis.z).toBeCloseTo(1, 12)

    answer(cad, "UCS", "P", "UCS", "Y", "10,10")
    expect(ucsOf(cad).xAxis).toBeCloseToPoint(p(0.612372, 0.353553))
    expect(ucsOf(cad).xAxis.z).toBeCloseTo(-0.707107, 6)
    expect(ucsOf(cad).yAxis).toBeCloseToPoint(p(-0.5, 0.866025))

    const still = answer(createHarness(), "UCS", "X", "0,0")
    expect(still.activeToolId()).toBe("select")
    expect(ucsOf(still).yAxis).toEqual({ x: 0, y: 1, z: 0 })
    expect(lastPoint(still)).toBe(" X = 0.00     Y = 0.00     Z = 0.00")

    const clicked = createHarness()
    clicked.command("UCS").option("X").click(p(0, 10))
    expect(clicked.activeToolId()).toBe("select")
    expect(ucsOf(clicked).yAxis.z).toBeCloseTo(1, 12)
  })

  it("Z turns about the UCS origin, 90° when Enter takes the default", () => {
    const cad = createHarness()
    cad.command("UCS").option("Z").enter()
    expect(ucsOf(cad).xAxis).toBeCloseToPoint(p(0, 1))
    cad.command("UCS").option("Z").type("-45").enter()
    expect(ucsOf(cad).xAxis).toBeCloseToPoint(p(Math.SQRT1_2, Math.SQRT1_2))
  })

  it("World, View and Previous", () => {
    const cad = turned(createHarness())
    cad.command("UCS").option("View")
    expect(ucsOf(cad).origin).toBeCloseToPoint(p(100, 50))
    expect(ucsOf(cad).xAxis).toBeCloseToPoint(p(1, 0))
    cad.command("UCS").option("Previous")
    expect(ucsOf(cad).xAxis).toBeCloseToPoint(p(0, 1))
    cad.command("UCS").option("World")
    expect(ucsOf(cad).origin).toBeCloseToPoint(p(0, 0))
  })

  it("is one undo step", () => {
    const cad = turned(createHarness())
    cad.undo()
    expect(ucsOf(cad).origin).toBeCloseToPoint(p(0, 0))
    cad.redo()
    expect(ucsOf(cad).origin).toBeCloseToPoint(p(100, 50))
  })

  // probe ucs/p159
  it("echoes UCS at U and REDO", () => {
    const cad = answer(createHarness(), "UCS", "Z", "30")
    const from = cad.commandLog().length
    answer(cad, "_U")
    expect(ucsOf(cad).xAxis).toEqual({ x: 1, y: 0, z: 0 })
    answer(cad, "_REDO")
    expect(cad.commandLog().slice(from)).toEqual([
      "U",
      "UCS",
      "REDO",
      "UCS",
      "Everything has been redone",
    ])
    expect(ucsOf(cad).xAxis).toBeCloseToPoint(p(0.866025, 0.5))
  })

  // probe ucs/p132: Previous steps back through the last ten.
  it("Previous goes back ten UCSs, then has none", () => {
    const cad = createHarness()
    for (let i = 0; i < 12; i++) answer(cad, "UCS", "Z", "10")
    for (let i = 0; i < 10; i++) answer(cad, "UCS", "P")
    expect(ucsOf(cad).xAxis).toBeCloseToPoint(
      p(Math.cos(deg(20)), Math.sin(deg(20)))
    )
    answer(cad, "UCS", "P")
    expect(cad.commandLog().at(-1)).toBe("No previous coordinate system saved.")
  })

  describe("ELEVATION", () => {
    // probe ucs/p152: World puts it back to 0 with the WCS current too, a
    // change U takes back; the first prompt's Enter is World.
    it("World puts it back to 0, the WCS current or not", () => {
      const cad = answer(createHarness(), "ELEV", "5", "0", "UCS", "W")
      expect(elevation(cad)).toBe(0)
      answer(cad, "_U")
      expect(elevation(cad)).toBe(5)
      answer(cad, "UCS", "Z", "30", "UCS", "")
      expect(elevation(cad)).toBe(0)
      expect(ucsOf(cad).xAxis).toEqual({ x: 1, y: 0, z: 0 })
    })

    // probes ucs/p153, p400: Previous back to the WCS, orthoGraphic Top and a
    // restored UCS equal to the WCS keep it.
    it("stays when another answer makes the WCS current", () => {
      const previous = answer(createHarness(), "UCS", "Z", "30")
      answer(previous, "ELEV", "5", "0", "UCS", "P")
      expect(elevation(previous)).toBe(5)

      const top = answer(createHarness(), "ELEV", "5", "0", "UCS", "Z", "30")
      answer(top, "UCS", "G", "T")
      expect(elevation(top)).toBe(5)

      const restored = answer(createHarness(), "ELEV", "5", "0")
      answer(restored, "UCS", "NA", "S", "W0", "UCS", "Z", "30")
      answer(restored, "UCS", "NA", "R", "W0")
      expect(elevation(restored)).toBe(5)
      expect(restored.runtime.document.getSettings().ucsName).toBe("W0")
    })
  })

  it("says which UCS is current", () => {
    const cad = createHarness()
    cad.command("UCS").escape()
    turned(cad)
    cad.command("UCS").escape()
    expect(
      cad.commandLog().filter((line) => line.includes("ucs name"))
    ).toEqual([
      "Current ucs name:  *WORLD*",
      "Current ucs name:  *WORLD*",
      "Current ucs name:  *NO NAME*",
    ])
  })

  describe("NAmed", () => {
    // probes ucs/p234, p240–p243
    it("saves, restores, lists and deletes by name", () => {
      const cad = turned(createHarness())
      cad.command("UCS").option("NAmed").option("Save").type("Site").enter()
      cad.command("UCS").option("World")
      cad.command("UCS").option("NAmed").option("Restore").type("site").enter()
      expect(ucsOf(cad).origin).toBeCloseToPoint(p(100, 50))
      expect(cad.runtime.document.getSettings().ucsName).toBe("Site")

      cad.command("UCS").option("NAmed").option("?").enter()
      expect(cad.commandLog().join("\n")).toContain("Saved coordinate systems:")

      cad.escape()
      cad.command("UCS").option("NAmed").option("Delete").type("S*").enter()
      const settings = cad.runtime.document.getSettings()
      expect(settings.namedUcs).toEqual([])
      // Deleting the current one leaves the UCS in place, unnamed.
      expect(settings.ucsName).toBeNull()
      expect(settings.ucs.origin).toBeCloseToPoint(p(100, 50))
    })

    // probes ucs/p231, p232: the entry keeps its name as stored.
    it("asks before replacing a saved UCS", () => {
      const cad = createHarness()
      cad.command("UCS").option("NAmed").option("Save").type("A").enter()
      turned(cad)
      cad.command("UCS").option("NAmed").option("Save").type("a").enter()
      expect(cad.state().commandLine.prompt).toBe(
        'UCS UCS "a" already exists.  Replace it? <N>'
      )
      cad.option("Yes")
      const [entry] = cad.runtime.document.getSettings().namedUcs
      expect(entry.name).toBe("A")
      expect(entry.ucs.origin).toBeCloseToPoint(p(100, 50))
    })

    it("travels in the drawing file", () => {
      const cad = turned(createHarness())
      cad.command("UCS").option("NAmed").option("Save").type("Site").enter()
      const parsed = parseDrawingFile(cad.runtime.serializeDrawing())
      expect(parsed.settings.ucsName).toBe("Site")
      expect(parsed.settings.ucs.origin).toBeCloseToPoint(p(100, 50))
      expect(parsed.settings.namedUcs.map((entry) => entry.name)).toEqual([
        "Site",
      ])
    })
  })

  describe("OBject", () => {
    const align = (cad: Harness, at: ReturnType<typeof p>) =>
      cad.command("UCS").option("OBject").click(at)

    it("puts a line's origin on the nearer end, X towards the other", () => {
      const cad = createHarness({ entities: [lineOf(p(0, 0), p(0, 100))] })
      align(cad, p(0, 90))
      expect(ucsOf(cad).origin).toBeCloseToPoint(p(0, 100))
      expect(ucsOf(cad).xAxis).toBeCloseToPoint(p(0, -1))
    })

    it("centres on a circle, X through the pick", () => {
      const cad = createHarness({ entities: [circleOf(p(0, 0), 50)] })
      align(cad, p(0, -50))
      expect(ucsOf(cad).origin).toBeCloseToPoint(p(0, 0))
      expect(ucsOf(cad).xAxis).toBeCloseToPoint(p(0, -1))
    })

    it("centres on an arc, X to the nearer end", () => {
      const cad = createHarness({
        entities: [arcOf(p(0, 0), 50, 0, Math.PI / 2)],
      })
      align(cad, p(10, 49))
      expect(ucsOf(cad).xAxis).toBeCloseToPoint(p(0, 1))
    })

    it("takes the picked polyline segment", () => {
      const cad = createHarness({
        entities: [polylineOf([p(0, 0), p(100, 0), p(100, 100)])],
      })
      align(cad, p(100, 80))
      expect(ucsOf(cad).origin).toBeCloseToPoint(p(100, 100))
      expect(ucsOf(cad).xAxis).toBeCloseToPoint(p(0, -1))
    })

    it("follows a text's rotation from its insertion point", () => {
      const cad = createHarness({
        entities: [
          textOf(p(10, 10), "ABC", { height: 10, rotation: Math.PI / 2 }),
        ],
      })
      align(cad, p(5, 15))
      expect(ucsOf(cad).origin).toBeCloseToPoint(p(10, 10))
      expect(ucsOf(cad).xAxis).toBeCloseToPoint(p(0, 1))
    })
  })
})

describe("drawing in a UCS", () => {
  it("reads typed coordinates in it, and * in the WCS", () => {
    const cad = turned(createHarness())
    cad.command("LINE").type("0,0").enter().type("@10,0").enter().escape()
    const line = cad.only<LineEntity>("line")
    expect(line.start).toBeCloseToPoint(p(100, 50))
    expect(line.end).toBeCloseToPoint(p(100, 60))

    cad.command("LINE").type("*0,0").enter().type("@*10,0").enter().escape()
    expect(cad.latest()).toMatchObject({ type: "line" })
    const world = cad.latest() as LineEntity
    expect(world.start).toBeCloseToPoint(p(0, 0))
    expect(world.end).toBeCloseToPoint(p(10, 0))
  })

  it("measures a typed angle from the UCS X axis", () => {
    const cad = turned(createHarness())
    cad
      .command("LINE")
      .click(p(0, 0))
      .moveTo(p(0, 20))
      .type("10")
      .enter()
      .escape()
    const line = cad.only<LineEntity>("line")
    expect(line.end).toBeCloseToPoint(p(0, 10))
  })

  it("shows the cursor's coordinates in it", () => {
    const cad = turned(createHarness())
    cad.moveTo(p(90, 60))
    expect(cad.state().cursorUcs).toBeCloseToPoint(p(10, 10))
  })

  it("holds Ortho to its axes", () => {
    const cad = createHarness()
    cad.command("UCS").option("Z").type("45").enter()
    cad.runtime.toggleOrtho()
    cad.command("LINE").click(p(0, 0)).click(p(50, 40)).escape()
    const line = cad.only<LineEntity>("line")
    expect(line.end.x).toBeCloseTo(line.end.y, 6)
  })

  it("lays the snap lattice on it", () => {
    const cad = createHarness()
    cad.command("UCS").click(p(3, 4)).enter()
    cad.command("SNAP").option("ON")
    cad.command("LINE").click(p(11, 13)).click(p(40, 4)).escape()
    expect(cad.only<LineEntity>("line").start).toBeCloseToPoint(p(13, 14))
  })
})

describe("what follows the UCS", () => {
  /** A UCS turned a quarter CCW about the world origin. */
  const quarter = () => {
    const cad = createHarness({
      entities: [rectOf(p(0, 0), p(100, 100), { id: "sq" })],
    })
    cad.command("UCS").option("Z").enter()
    return cad
  }

  it("TEXT's rotation <0> lies along the UCS X axis", () => {
    const cad = quarter()
    cad.command("TEXT").click(p(0, 0)).type("5").enter().enter()
    cad.type("A").enter().escape()
    expect(cad.only<TextEntity>("text").rotation).toBeCloseTo(Math.PI / 2)
  })

  it("MTEXT and INSERT turn with it too", () => {
    const cad = createHarness({
      blocks: [
        createBlockDefinition("B", p(0, 0), [lineOf(p(0, 0), p(10, 0))]),
      ],
    })
    cad.command("UCS").option("Z").enter()
    cad.command("-INSERT").type("B").enter().click(p(50, 50))
    cad.enter().enter().enter()
    expect(cad.only<InsertEntity>("insert").rotation).toBeCloseTo(Math.PI / 2)
    // A point at the rotation is read from the insertion point in the UCS:
    // straight up the world is its X axis, 0 (probe blocks/p219).
    cad.command("-INSERT").type("B").enter().click(p(150, 50))
    cad.enter().enter().click(p(150, 80))
    expect((cad.latest() as InsertEntity).rotation).toBeCloseTo(Math.PI / 2)
    cad.command("ERASE").type("ALL").enter().enter()
    cad.command("MTEXT").click(p(0, 0)).click(p(-50, 100)).type("A").enter()
    expect(cad.only<MTextEntity>("mtext").rotation).toBeCloseTo(Math.PI / 2)
  })

  it("HATCH lines its pattern up with it, from its origin", () => {
    const cad = quarter()
    cad.command("UCS").click(p(7, 0)).enter()
    cad.command("HATCH").click(p(50, 50)).enter()
    const hatch = cad.only<HatchEntity>("hatch")
    expect(hatch.patternAngle).toBeCloseTo(Math.PI / 2)
    expect(hatch.origin).toBeCloseToPoint(p(7, 0))
  })

  it("DIMLINEAR measures along its axes", () => {
    const cad = quarter()
    cad.command("DIMLINEAR").click(p(0, 0)).click(p(30, 40)).click(p(-20, 20))
    const dim = cad.only<DimensionEntity>("dimension")
    expect(dim.rotation).toBeCloseTo(Math.PI / 2)
    expect(dimensionMeasurement(dim)).toBeCloseTo(40)
  })

  it("RECTANG squares up to it", () => {
    const cad = createHarness()
    cad.command("UCS").option("Z").type("30").enter()
    cad.command("RECTANG").click(p(0, 0)).type("@20,10").enter()
    const rect = cad.only<PolylineEntity>("polyline")
    const [a, b] = rect.vertices
    expect(Math.atan2(b.y - a.y, b.x - a.x)).toBeCloseTo(deg(30))
    expect(Math.hypot(b.x - a.x, b.y - a.y)).toBeCloseTo(20)
  })

  // probe arrays/p414: the array is no turned reference; its columns run
  // along the UCS's X as it was.
  it("ARRAYRECT runs its columns along its X axis", () => {
    const cad = createHarness({ entities: [circleOf(p(0, 0), 5, { id: "c" })] })
    cad.command("UCS").option("Z").enter()
    cad.select("c").command("ARRAYRECT").option("COUnt")
    cad.type("2").enter().type("1").enter()
    cad.option("Spacing").type("50").enter().enter().enter()
    const array = cad.only<InsertEntity>("insert")
    expect(array.rotation).toBe(0)
    const centers = insertFlatGeometry(
      array,
      cad.runtime.document.blockLookup()
    ).flatMap((entity) => (entity.type === "circle" ? [entity.center] : []))
    expect(centers[1]).toBeCloseToPoint(p(0, 50))
  })

  it("BLOCK defines the objects in it", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(0, 10), { id: "l" })],
    })
    cad.command("UCS").option("Z").enter()
    cad.command("BLOCK").type("B").enter().click(p(0, 0)).click(p(0, 5)).enter()
    const [line] = cad.runtime.document.getBlocks()[0].entities as LineEntity[]
    expect(line.end).toBeCloseToPoint(p(10, 0))
    expect(cad.only<InsertEntity>("insert").rotation).toBeCloseTo(Math.PI / 2)
  })

  it("the palette reads and retypes coordinates in it", () => {
    const cad = createHarness({
      entities: [lineOf(p(10, 0), p(10, 30), { id: "l" })],
    })
    turned(cad)
    cad.select("l")
    const rows = cad.state().properties.info!.groups.flatMap((g) => g.rows)
    const value = (id: string) => rows.find((row) => row.id === id)?.value
    expect(value("startX")).toBe("-50.00")
    expect(value("startY")).toBe("90.00")
    expect(cad.runtime.setSelectionProperty("startX", "0")).toBe(true)
    expect(cad.only<LineEntity>("line").start).toBeCloseToPoint(p(10, 50))
  })
})

describe("the UCS icon", () => {
  const iconLabels = (cad: Harness) =>
    cad
      .scene()
      .primitives.flatMap((prim) =>
        prim.kind === "label" && (prim.text === "X" || prim.text === "Y")
          ? [prim]
          : []
      )

  it("sits on the origin, in the corner with Noorigin, and goes with OFF", () => {
    const cad = createHarness({ ucsIcon: true })
    const x = () => iconLabels(cad)[0]
    const atOrigin = cad.toScreen(p(0, 0))
    expect(x()).toBeDefined()
    expect(x().at.x).toBeGreaterThan(atOrigin.x)

    cad.command("UCSICON").option("Noorigin")
    expect(cad.runtime.document.getSettings().ucsIcon.atOrigin).toBe(false)
    expect(x().at.x).toBeLessThan(100)

    cad.command("UCSICON").option("OFF")
    expect(iconLabels(cad)).toHaveLength(0)
    cad.undo()
    expect(iconLabels(cad)).toHaveLength(2)
  })
})

describe("PLAN", () => {
  const view = (cad: Harness) => cad.runtime.viewport

  it("turns the view so the UCS X axis points right, the UCS untouched", () => {
    const cad = turned(createHarness())
    cad.command("PLAN").enter()
    expect(view(cad).right).toBeCloseToPoint(p(0, 1))
    expect(ucsOf(cad).xAxis).toBeCloseToPoint(p(0, 1))
    const origin = cad.toScreen(p(100, 50))
    const onX = cad.toScreen(p(100, 80))
    expect(onX.y).toBeCloseTo(origin.y)
    expect(onX.x).toBeGreaterThan(origin.x)
    expect(cad.activeToolId()).toBe("select")
  })

  it("fits the extents in the turned view", () => {
    const cad = createHarness({ entities: [lineOf(p(0, 0), p(0, 500))] })
    cad.command("UCS").option("Z").enter()
    cad.command("PLAN").option("Current ucs")
    const a = cad.toScreen(p(0, 0))
    const b = cad.toScreen(p(0, 500))
    expect(a.y).toBeCloseTo(b.y)
    // ZOOM Extents' margin, 3 px a side (probes view/p100, p108).
    expect(b.x - a.x).toBeCloseTo(1000 - 6)
  })

  it("World, a saved UCS by name, and ZOOM Previous back through them", () => {
    const cad = turned(createHarness())
    cad.command("UCS").option("NAmed").option("Save").type("Site").enter()
    cad.command("UCS").option("World")
    cad.command("PLAN").option("Ucs").type("site").enter()
    expect(view(cad).right).toBeCloseToPoint(p(0, 1))
    expect(ucsOf(cad).xAxis).toBeCloseToPoint(p(1, 0))
    cad.command("PLAN").option("World")
    expect(view(cad).right).toBeCloseToPoint(p(1, 0))
    cad.command("ZOOM").option("Previous")
    expect(view(cad).right).toBeCloseToPoint(p(0, 1))
  })

  it("asks again for a name it cannot find, and lists with ?", () => {
    const cad = createHarness()
    cad.command("PLAN").option("Ucs").type("Nope").enter()
    expect(cad.commandLog().at(-1)).toBe('Cannot find UCS "Nope".')
    expect(cad.activeToolId()).toBe("plan")
    cad.type("?").enter().enter()
    expect(cad.commandLog().join("\n")).toContain("Saved coordinate systems:")
    expect(cad.activeToolId()).toBe("plan")
  })

  it("UCS View takes the view's X axis", () => {
    const cad = turned(createHarness())
    cad.command("PLAN").enter()
    cad.command("UCS").option("World")
    cad.command("UCS").option("View")
    expect(ucsOf(cad).origin).toBeCloseToPoint(p(0, 0))
    expect(ucsOf(cad).xAxis).toBeCloseToPoint(p(0, 1))
  })

  it("draws text turned with the view", () => {
    const cad = createHarness({ entities: [textOf(p(0, 0), "A")] })
    cad.command("UCS").option("Z").enter()
    cad.command("PLAN").enter()
    const text = cad.scene().primitives.find((prim) => prim.kind === "text")
    expect(text?.kind === "text" && text.rotation).toBeCloseTo(Math.PI / 2)
  })

  it("window and crossing selection follow the screen, not world X", () => {
    const cad = createHarness({
      entities: [
        lineOf(p(0, 0), p(0, 10), { id: "along" }),
        lineOf(p(0, 0), p(20, 0), { id: "across" }),
      ],
    })
    cad.command("UCS").option("Z").enter()
    cad.command("PLAN").enter()
    // Screen right is world +Y here, so this runs left to right: a window.
    cad.click(p(5, -5)).click(p(-5, 15))
    expect(cad.selectedIds()).toEqual(["along"])
    cad.escape().click(p(-5, 15)).click(p(5, -5))
    expect(cad.selectedIds().sort()).toEqual(["across", "along"])
  })

  it("ZOOM Window frames the rectangle drawn on screen", () => {
    const cad = createHarness()
    cad.command("UCS").option("Z").type("30").enter()
    cad.command("PLAN").enter()
    const first = view(cad).screenToWorld(p(100, 100))
    const second = view(cad).screenToWorld(p(300, 200))
    cad.command("ZOOM").click(first).click(second)
    const a = cad.toScreen(first)
    const b = cad.toScreen(second)
    expect(b.x - a.x).toBeCloseTo(1000)
    expect(b.y - a.y).toBeCloseTo(500)
  })
})
