import { describe, expect, it } from "vitest"
import type {
  ArcEntity,
  CircleEntity,
  DimensionEntity,
  EllipseEntity,
  Entity,
  HatchEntity,
  InsertEntity,
  LineEntity,
  MTextEntity,
  PolylineEntity,
  SplineEntity,
  TextEntity,
} from "../../domain/entities"
import {
  assignEntityColor,
  createBlockDefinition,
  createDimension,
  createInsert,
  createMText,
  createSpline,
  createText,
  dimensionMeasurement,
  isFullEllipse,
  measureTextWidth,
  scaleEntity,
} from "../../domain/entities"
import { type CadHarness, createHarness } from "../../../test/harness"
import { THEME } from "../../scene/theme"
import type { Scene, ScenePrimitive } from "../../scene/types"
import { DEFAULT_LAYER_COLOR } from "../../domain/layers"
import { fadedColor } from "../SceneBuilder"
import { es } from "../../locales/es"
import {
  arcOf,
  circleOf,
  deg,
  hatchOf,
  layerOf,
  lineOf,
  loopOf,
  p,
  polylineOf,
  rectOf,
} from "../../../test/builders"

/**
 * The modify commands, driven end-to-end. They share a lot of machinery
 * (PlacementTool, the box-selection helper, the keyword prompts), so these
 * tests double as a regression net for that shared base: a change to
 * PlacementTool that breaks COPY will also fail MOVE and STRETCH here.
 */

const HORIZONTAL = lineOf(p(0, 0), p(200, 0), { id: "L1" })

function sorted(entities: readonly LineEntity[]): LineEntity[] {
  return [...entities].sort(
    (a, b) => a.start.x - b.start.x || a.start.y - b.start.y
  )
}

function linesOf(entities: readonly Entity[]): LineEntity[] {
  return entities.filter((e): e is LineEntity => e.type === "line")
}

/** Each answer typed at the command line and confirmed, as the console types it. */
function answer(cad: CadHarness, ...texts: string[]): CadHarness {
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

/** The console's cursor in the move probes, after `_ZOOM _W -50,-50 700,700`. */
const CONSOLE_CURSOR = p(-336.3515885600009, -49.297753120728885)

describe("MOVE", () => {
  // The prompts as move/p100 and p150 word them.
  it("writes what each pick at Select objects found", () => {
    const cad = createHarness({
      entities: [HORIZONTAL, lineOf(p(0, 50), p(200, 50), { id: "L2" })],
    })

    cad.command("MOVE").click(p(100, 0)).click(p(100, 0))
    cad.click(p(-10, -10)).click(p(210, 60))
    cad.click(p(100, 50), { shiftKey: true })
    cad.press(" ")
    expect(cad.state().commandLine.prompt).toBe(
      "MOVE Specify base point or [Displacement] <Displacement>:"
    )
    cad.click(p(0, 0))
    expect(cad.state().commandLine.prompt).toBe(
      "MOVE Specify second point or <use first point as displacement>:"
    )
    cad.click(p(0, 30))

    expect(cad.commandLog()).toEqual([
      "MOVE",
      "Select objects: 1 found",
      "Select objects: 1 found (1 duplicate), 1 total",
      "Select objects: Specify opposite corner: 2 found (1 duplicate), 2 total",
      "Select objects: 1 found, 1 removed, 1 total",
      "Select objects:",
      "Specify base point or [Displacement] <Displacement>:",
      "Specify second point or <use first point as displacement>:",
    ])
    expect(cad.byId<LineEntity>("L1").start).toBeCloseToPoint(p(0, 30))
    expect(cad.byId<LineEntity>("L2").start).toBeCloseToPoint(p(0, 50))
  })

  it("counts the objects selected before it starts", () => {
    const cad = createHarness({ entities: [HORIZONTAL] })

    cad.select("L1").command("MOVE")

    // A name typed whole: the count on a line of its own (desktop erase/d11).
    expect(cad.commandLog()).toEqual(["MOVE", "1 found"])
  })

  it("moves by a Displacement typed, or Enter's last one (move/p119, p135)", () => {
    const cad = createHarness({ entities: [HORIZONTAL] })

    cad.select("L1").command("MOVE").option("Displacement")
    expect(cad.state().commandLine.prompt).toBe(
      "MOVE Specify displacement <0.00, 0.00, 0.00>:"
    )
    cad.type("10,5").enter()
    expect(cad.byId<LineEntity>("L1").start).toBeCloseToPoint(p(10, 5))
    expect(cad.activeToolId()).toBe("select")

    cad.select("L1").command("MOVE").enter()
    expect(cad.state().commandLine.prompt).toBe(
      "MOVE Specify displacement <10.00, 5.00, 0.00>:"
    )
    cad.enter()

    expect(cad.byId<LineEntity>("L1").start).toBeCloseToPoint(p(20, 10))
    expect(cad.commandLog().slice(-3)).toEqual([
      "1 found",
      "Specify base point or [Displacement] <Displacement>:",
      "Specify displacement <10.00, 5.00, 0.00>:",
    ])
  })

  // `Specify displacement` is a point prompt from the UCS origin: a number is
  // direct distance from it towards the cursor, a snap or a pick the point,
  // which is the vector the objects go by.
  it.each([
    [
      "10, towards the cursor (move/p138)",
      ["10"],
      [-9.894291907, -1.450168146],
    ],
    ["-5, away from it (move/p126)", ["-5"], [4.947145954, 0.725084073]],
    ["0, nothing (move/p125)", ["0"], [0, 0]],
    ["an object snap (move/p128)", ["_END", "99,1"], [100, 0]],
  ])("takes %s at Specify displacement", (_, answers, [x, y]) => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L" })],
    })
    cad.moveTo(CONSOLE_CURSOR)
    answer(cad, "MOVE", "L", "", "_D", ...answers)

    expect(cad.byId<LineEntity>("L").start).toBeCloseToPoint(p(x, y))
    expect(cad.activeToolId()).toBe("select")
  })

  // The pick: the trace's UseBasePoint from 0,0,0 (move/p135).
  it("writes an angle override and takes a pick at Specify displacement (move/p139)", () => {
    const cad = createHarness({ entities: [HORIZONTAL] })
    answer(cad, "MOVE", "L", "", "_D", "<30")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Specify displacement <0.00, 0.00, 0.00>: <30",
      "Angle Override: 30",
    ])
    cad.escape()

    answer(cad, "MOVE", "L", "", "_D")
    cad.click(p(30, 40))
    expect(cad.byId<LineEntity>("L1").start).toBeCloseToPoint(p(30, 40))
  })

  it("ends at an empty Select objects on Space, as on Enter", () => {
    const cad = createHarness({ entities: [HORIZONTAL] })

    cad.command("MOVE").press(" ")

    expect(cad.activeToolId()).toBe("select")
    expect(cad.commandLog()).toEqual(["MOVE", "Select objects:"])
  })

  it("displaces the pre-selected objects and keeps their ids (move/p200)", () => {
    const cad = createHarness({ entities: [HORIZONTAL] })

    cad.select("L1").command("MOVE").click(p(0, 0)).click(p(50, 30))

    const line = cad.byId<LineEntity>("L1")
    expect(line.start).toBeCloseToPoint(p(50, 30))
    expect(line.end).toBeCloseToPoint(p(250, 30))
    expect(cad.entityCount).toBe(1)
  })

  it("ends after a single placement", () => {
    const cad = createHarness({ entities: [HORIZONTAL] })

    cad.select("L1").command("MOVE").click(p(0, 0)).click(p(50, 0))

    expect(cad.activeToolId()).toBe("select")
  })

  it("accepts a typed distance and angle for the displacement", () => {
    const cad = createHarness({ entities: [HORIZONTAL] })

    cad
      .select("L1")
      .command("MOVE")
      .click(p(0, 0))
      .type("100", "distance")
      .type("90", "angle")
      .enter()

    expect(cad.byId<LineEntity>("L1").start).toBeCloseToPoint(p(0, 100), 6)
  })

  it("moves a whole multi-object selection as one undoable step", () => {
    const cad = createHarness({
      entities: [HORIZONTAL, circleOf(p(0, 100), 20, { id: "C1" })],
    })

    cad.select("L1", "C1").command("MOVE").click(p(0, 0)).click(p(10, 10))

    expect(cad.byId<LineEntity>("L1").start).toBeCloseToPoint(p(10, 10))
    expect(cad.byId<CircleEntity>("C1").center).toBeCloseToPoint(p(10, 110))

    cad.undo()
    expect(cad.byId<LineEntity>("L1").start).toBeCloseToPoint(p(0, 0))
    expect(cad.byId<CircleEntity>("C1").center).toBeCloseToPoint(p(0, 100))
  })

  it("selects objects first when nothing was pre-selected", () => {
    const cad = createHarness({ entities: [HORIZONTAL] })

    cad
      .command("MOVE")
      .click(p(100, 0)) // pick the line
      .enter() // confirm the selection set
      .click(p(0, 0))
      .click(p(0, 40))

    expect(cad.byId<LineEntity>("L1").start).toBeCloseToPoint(p(0, 40))
  })

  // Escape halfway: desktop move, after d02.
  it("leaves the drawing untouched when cancelled", () => {
    const cad = createHarness({ entities: [HORIZONTAL] })

    cad.select("L1").command("MOVE").click(p(0, 0)).moveTo(p(80, 80)).escape()

    expect(cad.byId<LineEntity>("L1").start).toBeCloseToPoint(p(0, 0))
    expect(cad.activeToolId()).toBe("select")
  })

  // Every point read in a UCS turned 30° about Z: the base point (move/p131),
  // the second point (p207, p208), the Displacement (p136).
  it("reads its points in a turned UCS", () => {
    const turned = () => {
      const cad = createHarness({
        entities: [
          lineOf(p(0, 0), p(100, 0), { id: "A" }),
          circleOf(p(250, 250), 10, { id: "C" }),
        ],
      })
      return answer(cad, "UCS", "Z", "30")
    }
    const along = p(8.660254037844387, 5)
    const start = (cad: CadHarness) => cad.byId<LineEntity>("A").start
    const lastPoint = (cad: CadHarness) =>
      answer(cad, "ID", "@").commandLog().at(-1)

    const moved = answer(turned(), "MOVE", "_ALL", "", "0,0", "10,0")
    expect(start(moved)).toBeCloseToPoint(along)
    expect(moved.byId<CircleEntity>("C").center).toBeCloseToPoint(
      p(258.66025403784437, 255)
    )
    const copied = answer(turned(), "COPY", "_ALL", "", "0,0", "10,0", "")
    expect((copied.entities()[2] as LineEntity).start).toBeCloseToPoint(along)

    const displaced = turned()
    answer(displaced.select("A"), "MOVE", "_D", "10,0")
    expect(start(displaced)).toBeCloseToPoint(along)
    expect(lastPoint(displaced)).toBe(" X = 10.00     Y = 0.00     Z = 0.00")
    answer(displaced.select("A"), "MOVE", "_D", "*10,0")
    expect(start(displaced)).toBeCloseToPoint(p(18.660254037844387, 5))
    answer(displaced.select("A"), "MOVE", "_D", "@10,0")
    expect(start(displaced)).toBeCloseToPoint(p(27.320508075688775, 10))

    for (const [base, expected] of [
      ["*10,20", " X = 18.66     Y = 12.32     Z = 0.00"],
      ["10,20", " X = 10.00     Y = 20.00     Z = 0.00"],
      ["@5,5", " X = 12.00     Y = 8.00     Z = 0.00"],
    ]) {
      const cad = answer(turned(), "ID", "7,3", "MOVE", "_ALL", "", base, "@")
      expect(start(cad)).toBeCloseToPoint(p(0, 0))
      expect(lastPoint(cad)).toBe(expected)
    }
  })
})

describe("COPY", () => {
  // move/p156–p158: Exit and Undo once a copy is placed.
  it("reports its mode, then offers Exit and Undo once a copy is placed", () => {
    const cad = createHarness({ entities: [HORIZONTAL] })

    cad.select("L1").command("COPY").click(p(0, 0)).click(p(0, 100))
    expect(cad.state().commandLine.prompt).toBe(
      "COPY Specify second point or [Exit/Undo] <Exit>:"
    )
    cad.click(p(0, 200)).option("Undo")
    expect(cad.entityCount).toBe(2)
    cad.option("Exit")

    expect(cad.activeToolId()).toBe("select")
    expect(cad.commandLog()).toEqual([
      "COPY",
      "1 found",
      "Current settings:  Copy mode = Multiple",
      "Specify base point or [Displacement] <Displacement>:",
      "Specify second point or <use first point as displacement>:",
      "Specify second point or [Exit/Undo] <Exit>:",
      "Specify second point or [Exit/Undo] <Exit>: U",
      "Specify second point or [Exit/Undo] <Exit>: E",
    ])
  })

  it("keeps the original and drops a duplicate at each destination", () => {
    const cad = createHarness({ entities: [HORIZONTAL] })

    cad
      .select("L1")
      .command("COPY")
      .click(p(0, 0))
      .click(p(0, 100))
      .click(p(0, 200))
      .escape()

    expect(cad.entityCount).toBe(3)
    const ys = linesOf(cad.entities())
      .map((line) => line.start.y)
      .sort((a, b) => a - b)
    expect(ys).toEqual([0, 100, 200])
  })

  it("measures every copy from the same fixed base point", () => {
    // AutoCAD's Multiple mode does not chain: each destination is measured from
    // the original, not from the previously placed copy.
    const cad = createHarness({ entities: [HORIZONTAL] })

    cad
      .select("L1")
      .command("COPY")
      .click(p(0, 0))
      .click(p(10, 0))
      .click(p(20, 0))
      .escape()

    const xs = sorted(linesOf(cad.entities())).map((line) => line.start.x)
    expect(xs).toEqual([0, 10, 20])
  })

  it("gives each copy a fresh id, and one U undoes the whole COPY (move/p201, p216)", () => {
    const cad = createHarness({ entities: [HORIZONTAL] })

    cad
      .select("L1")
      .command("COPY")
      .click(p(0, 0))
      .click(p(0, 100))
      .click(p(0, 200))
      .escape()

    expect(new Set(cad.entities().map((e) => e.id)).size).toBe(3)
    cad.undo()
    expect(cad.entityCount).toBe(1)
    cad.redo()
    expect(cad.entityCount).toBe(3)
  })

  // A copy by nothing is a copy: AutoCAD leaves the duplicate on top.
  it.each([
    ["the second point at the base (move/p193, p228)", ["0,0", "0,0", ""]],
    ["a Displacement of 0,0,0 (move/p229)", ["_D", "0,0,0"]],
    [
      "Enter at the base point and the Displacement (move/p147, p232)",
      ["", ""],
    ],
    ["Enter at the second point, from 0,0 (move/p230)", ["0,0", ""]],
  ])("duplicates in place by %s", (_, answers) => {
    const cad = createHarness({ entities: [HORIZONTAL] })
    answer(cad, "COPY", "L", "", ...answers)
    cad.escape()

    expect(linesOf(cad.entities()).map((line) => line.start)).toBeCloseToPoints(
      [p(0, 0), p(0, 0)]
    )
    expect(cad.latest().id).not.toBe("L1")
  })

  it("takes a copy in place back with its Undo (move/p193)", () => {
    const cad = createHarness({ entities: [HORIZONTAL] })
    answer(cad, "COPY", "L", "", "3,4", "3,4")
    expect(cad.state().commandLine.prompt).toBe(
      "COPY Specify second point or [Exit/Undo] <Exit>:"
    )
    expect(cad.entityCount).toBe(2)

    answer(cad, "_U")
    expect(cad.entityCount).toBe(1)
    expect(cad.state().commandLine.prompt).toBe(
      "COPY Specify second point or <use first point as displacement>:"
    )
  })
})

describe("COPY's second point (move/p151–p159, p199)", () => {
  /** The probes' drawing: two lines, then `_ZOOM _W -50,-50 700,700`. */
  function drawing(locale?: typeof es): CadHarness {
    const cad = createHarness({
      entities: [
        lineOf(p(0, 0), p(100, 0), { id: "L1" }),
        lineOf(p(0, 50), p(100, 50), { id: "L2" }),
      ],
      locale,
    })
    return answer(cad, "ZOOM", "W", "-50,-50", "700,700")
  }

  const starts = (cad: CadHarness) =>
    linesOf(cad.entities()).map((line) => line.start)

  it("copies by the base point at Enter, then ends (move/p151, p234)", () => {
    const cad = drawing()
    answer(cad, "COPY", "50,0", "", "3,4", "")
    expect(cad.entityCount).toBe(3)
    expect(starts(cad)[2]).toBeCloseToPoint(p(3, 4))
    expect(cad.activeToolId()).toBe("select")
    expect(answer(cad, "ID", "@").commandLog().at(-1)).toBe(
      " X = 3.00     Y = 4.00     Z = 0.00"
    )

    const all = createHarness({ entities: [HORIZONTAL] })
    answer(all, "_COPY", "_ALL", "", "20,10", "")
    expect(all.entityCount).toBe(2)
    expect((all.latest() as LineEntity).start).toBeCloseToPoint(p(20, 10))
    expect(all.activeToolId()).toBe("select")
  })

  it("copies by the base point at Enter once its Undo took every copy back (move/p159, p06)", () => {
    const cad = drawing()
    answer(cad, "COPY", "50,0", "", "3,4", "13,4", "_U", "")
    expect(cad.entityCount).toBe(3)
    expect(starts(cad)[2]).toBeCloseToPoint(p(3, 4))
    expect(cad.activeToolId()).toBe("select")

    const inPlace = drawing()
    answer(inPlace, "_COPY", "50,0", "", "0,0", "0,10", "_U", "_U", "")
    expect(inPlace.selectedIds()).toEqual([])
    expect(inPlace.entityCount).toBe(3)
    expect(inPlace.activeToolId()).toBe("select")
  })

  it("refuses a keyword at the first second point as Array's prompt does (move/p156, p157)", () => {
    const cad = drawing()
    answer(cad, "LINE", "0,100", "10,100", "")
    answer(cad, "COPY", "50,0", "", "3,4", "_U")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Specify second point or <use first point as displacement>: _U",
      "Point or option keyword required.",
    ])
    // Nothing placed, nothing backed out: the LINE before stays.
    expect(cad.entityCount).toBe(3)

    answer(cad, "_E")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Specify second point or <use first point as displacement>: _E",
      "Point or option keyword required.",
    ])
    answer(cad, "FOO")
    expect(cad.commandLog().at(-1)).toBe("Point or option keyword required.")

    answer(cad, "13,4", "_E")
    expect(cad.commandLog().at(-1)).toBe(
      "Specify second point or [Exit/Undo] <Exit>: _E"
    )
    expect(cad.activeToolId()).toBe("select")
    expect(cad.entityCount).toBe(4)
  })

  it("keeps MOVE's second point refusing as a point (move/p154, p155)", () => {
    const cad = drawing()
    answer(cad, "MOVE", "50,0", "", "3,4", "FOO", "_D")
    expect(cad.commandLog().slice(-4)).toEqual([
      "Specify second point or <use first point as displacement>: FOO",
      "Invalid point.",
      "Specify second point or <use first point as displacement>: _D",
      "Invalid point.",
    ])
  })

  it("says the command is undone when its Undo takes the last copy back (move/p158)", () => {
    const cad = drawing()
    answer(cad, "COPY", "50,0", "", "3,4", "13,4", "23,4", "_U")
    expect(cad.commandLog().at(-1)).toBe(
      "Specify second point or [Exit/Undo] <Exit>: _U"
    )
    answer(cad, "_U")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Specify second point or [Exit/Undo] <Exit>: _U",
      "Command has been completely undone.",
    ])
    expect(cad.state().commandLine.prompt).toBe(
      "COPY Specify second point or <use first point as displacement>:"
    )

    answer(cad, "_U")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Specify second point or <use first point as displacement>: _U",
      "Point or option keyword required.",
    ])
    answer(cad, "33,4", "")
    expect(starts(cad).slice(2)).toBeCloseToPoints([p(30, 0)])
  })

  it("says so in Spanish, and refuses in its words (move/p199, p156)", () => {
    const cad = drawing(es)
    answer(cad, "COPIA", "50,0", "", "3,4", "13,4", "H")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Precise el segundo punto o [Salir/desHacer] <Salir>: H",
      "Todos los efectos del comando han sido deshechos.",
    ])
    answer(cad, "_U")
    expect(cad.commandLog().at(-1)).toBe("Se requiere un punto o una opción.")
  })

  it("places the copies in drawing order, whatever order they were picked in (move/p201, p223)", () => {
    const cad = createHarness({
      entities: [
        lineOf(p(0, 0), p(100, 0), { id: "A" }),
        lineOf(p(0, 50), p(100, 50), { id: "B" }),
      ],
    })
    answer(cad, "_COPY", "50,50", "50,0", "", "0,0", "0,200", "0,300", "")
    expect(linesOf(cad.entities()).map((line) => line.start.y)).toEqual([
      0, 50, 200, 250, 300, 350,
    ])

    answer(cad, "_ERASE", "_L", "")
    expect(
      linesOf(cad.entities())
        .map((line) => line.start.y)
        .sort((a, b) => a - b)
    ).toEqual([0, 50, 200, 250, 300])
  })

  it("leaves MOVE's objects where they were in the drawing (move/p226)", () => {
    const cad = createHarness({
      entities: [
        lineOf(p(0, 0), p(100, 0), { id: "A" }),
        lineOf(p(0, 50), p(100, 50), { id: "B" }),
      ],
    })
    answer(cad, "_MOVE", "50,50", "50,0", "", "0,0", "0,10")
    expect(cad.entities().map((entity) => entity.id)).toEqual(["A", "B"])
    expect(cad.byId<LineEntity>("B").start).toBeCloseToPoint(p(0, 60))
  })
})

/** The strokes of the segments drawn from `a` to `b` on the screen. */
function segmentsAt(
  cad: CadHarness,
  a: { x: number; y: number },
  b: { x: number; y: number }
) {
  const near = (q: { x: number; y: number }, r: { x: number; y: number }) =>
    Math.hypot(q.x - r.x, q.y - r.y) < 1e-6
  const [sa, sb] = [cad.toScreen(a), cad.toScreen(b)]
  return cad
    .scene()
    .primitives.flatMap((prim) =>
      prim.kind === "segment" && near(prim.a, sa) && near(prim.b, sb)
        ? [prim.stroke]
        : []
    )
}

function colours(scene: Scene): string[] {
  return scene.primitives.flatMap((prim: ScenePrimitive) =>
    prim.kind === "segment" ? [prim.stroke.color] : []
  )
}

/** The amber dashed line a transform's drag draws from its base point. */
const DRAG_LINE = { color: THEME.dashedRubberBand, width: 1, dash: [2, 3] }

describe("the drag of MOVE and COPY", () => {
  // The set drawn as itself at the cursor, a dashed amber line from the base
  // point: MOVE fades the originals where they were (desktop move/d01).
  it("MOVE drags the objects as they are and fades the originals", () => {
    const cad = createHarness({
      entities: [lineOf(p(30, 15), p(55, 15), { id: "A" })],
    })
    cad.select("A").command("MOVE").click(p(30, 15)).moveTo(p(40, 30))

    expect(segmentsAt(cad, p(40, 30), p(65, 30))).toEqual([
      { color: DEFAULT_LAYER_COLOR, width: 1 },
    ])
    expect(segmentsAt(cad, p(30, 15), p(40, 30))).toEqual([
      { color: THEME.dashedRubberBand, width: 1, dash: [2, 3] },
    ])
    expect(
      segmentsAt(cad, p(30, 15), p(55, 15)).map((stroke) => stroke.color)
    ).toEqual([fadedColor(DEFAULT_LAYER_COLOR)])
    expect(colours(cad.scene())).not.toContain(THEME.selected)
    expect(colours(cad.scene())).not.toContain(THEME.preview)
  })

  it("drags a block reference as its block", () => {
    const block = createBlockDefinition("B1", p(0, 0), [
      lineOf(p(-30, 0), p(30, 0)),
    ])
    const cad = createHarness({
      entities: [createInsert("B1", p(0, 0), { id: "I" })],
      blocks: [block],
    })
    cad.select("I").command("MOVE").click(p(0, 0)).moveTo(p(200, 0))

    expect(segmentsAt(cad, p(170, 0), p(230, 0))).toEqual([
      { color: DEFAULT_LAYER_COLOR, width: 1 },
    ])
  })

  // COPY's originals keep the selection's glow (desktop move/d11).
  it("COPY drags the copy as it is and the originals glow", () => {
    const cad = createHarness({
      entities: [
        assignEntityColor(lineOf(p(30, 15), p(55, 15), { id: "A" }), "#ff0000"),
      ],
    })
    cad.select("A").command("COPY").click(p(30, 15)).moveTo(p(40, 30))

    expect(segmentsAt(cad, p(40, 30), p(65, 30))).toEqual([
      { color: "#ff0000", width: 1 },
    ])
    expect(segmentsAt(cad, p(30, 15), p(40, 30))).toEqual([
      { color: THEME.dashedRubberBand, width: 1, dash: [2, 3] },
    ])
    expect(
      segmentsAt(cad, p(30, 15), p(55, 15)).map((stroke) => stroke.color)
    ).toEqual(["#ff0000", THEME.selected])
  })
})

describe("the drag of ROTATE, SCALE and MIRROR", () => {
  const red = () =>
    createHarness({
      entities: [
        assignEntityColor(lineOf(p(0, 0), p(100, 0), { id: "A" }), "#ff0000"),
      ],
    })
  const originals = (cad: CadHarness) =>
    segmentsAt(cad, p(0, 0), p(100, 0)).map((stroke) => stroke.color)
  const placeholder = (cad: CadHarness) =>
    cad.state().dynamicInput?.fields[0]?.placeholder

  // desktop transforms/d01, d02: the set turned, drawn as itself; the
  // originals faded where they were; an amber dashed line from the base; the
  // field holds the default 0, not the dragged angle.
  it("ROTATE drags the set turned as itself and fades the originals", () => {
    const cad = red()
    cad.select("A").command("ROTATE").click(p(0, 0)).moveTo(p(0, 50))

    expect(segmentsAt(cad, p(0, 0), p(0, 100))).toEqual([
      { color: "#ff0000", width: 1 },
    ])
    expect(segmentsAt(cad, p(0, 0), p(0, 50))).toEqual([DRAG_LINE])
    expect(originals(cad)).toEqual([fadedColor("#ff0000")])
    expect(colours(cad.scene())).not.toContain(THEME.selected)
    expect(colours(cad.scene())).not.toContain(THEME.preview)
    expect(placeholder(cad)).toBe("0")
  })

  // desktop transforms/d03: under Copy the originals are drawn as they are,
  // neither faded nor glowing.
  it("ROTATE's Copy leaves the originals as they are", () => {
    const cad = red()
    cad.select("A").command("ROTATE").click(p(0, 0)).option("Copy")
    cad.moveTo(p(0, 50))

    expect(segmentsAt(cad, p(0, 0), p(0, 100))).toEqual([
      { color: "#ff0000", width: 1 },
    ])
    expect(originals(cad)).toEqual(["#ff0000"])
  })

  // desktop transforms/d04-1, d04-2, d04-3: nothing at the reference angle
  // but its field's default; at its second point the runtime's amber dashed
  // line from the first, no set; the new angle drags the set turned by it
  // less the reference, its field the default.
  it("ROTATE's Reference draws the measure line, then drags the set", () => {
    const cad = red()
    cad.select("A").command("ROTATE").click(p(0, 0)).option("Reference")
    cad.moveTo(p(40, 50))
    expect(placeholder(cad)).toBe("0")
    expect(originals(cad)).toEqual(["#ff0000"])

    cad.click(p(10, 10)).moveTo(p(40, 50))
    expect(segmentsAt(cad, p(10, 10), p(40, 50))).toEqual([DRAG_LINE])
    expect(colours(cad.scene()).filter((c) => c === "#ff0000")).toHaveLength(1)

    cad.click(p(110, 10)).moveTo(p(0, 50))
    expect(cad.state().commandLine.prompt).toBe(
      "ROTATE Specify the new angle or [Points] <0>:"
    )
    expect(segmentsAt(cad, p(0, 0), p(0, 100))).toEqual([
      { color: "#ff0000", width: 1 },
    ])
    expect(segmentsAt(cad, p(0, 0), p(0, 50))).toEqual([DRAG_LINE])
    expect(originals(cad)).toEqual([fadedColor("#ff0000")])
    expect(placeholder(cad)).toBe("0")
  })

  // desktop transforms/d06: the set scaled, drawn as itself, the originals
  // faded, the line from the base; the field the dragged factor.
  it("SCALE drags the set scaled as itself and fades the originals", () => {
    const cad = red()
    cad.select("A").command("SCALE").click(p(0, 0)).moveTo(p(0, 100))

    expect(segmentsAt(cad, p(0, 0), p(200, 0))).toEqual([
      { color: "#ff0000", width: 1 },
    ])
    expect(segmentsAt(cad, p(0, 0), p(0, 100))).toEqual([DRAG_LINE])
    expect(originals(cad)).toEqual([fadedColor("#ff0000")])
    expect(colours(cad.scene())).not.toContain(THEME.selected)
    expect(colours(cad.scene())).not.toContain(THEME.preview)
    expect(placeholder(cad)).toBe("2")
  })

  // desktop transforms/d08-1, d08-2, d08-3: the reference length draws
  // nothing, its field the default; its second point the runtime's line; the
  // new length drags the set, its field the default 1.
  it("SCALE's Reference draws the measure line, then drags the set", () => {
    const cad = red()
    cad.select("A").command("SCALE").click(p(0, 0)).option("Reference")
    cad.moveTo(p(40, 50))
    expect(placeholder(cad)).toBe("1.00")
    expect(originals(cad)).toEqual(["#ff0000"])

    cad.click(p(10, 10)).moveTo(p(40, 50))
    expect(segmentsAt(cad, p(10, 10), p(40, 50))).toEqual([DRAG_LINE])

    cad.click(p(110, 10)).moveTo(p(0, 50))
    expect(segmentsAt(cad, p(0, 0), p(50, 0))).toEqual([
      { color: "#ff0000", width: 1 },
    ])
    expect(segmentsAt(cad, p(0, 0), p(0, 50))).toEqual([DRAG_LINE])
    expect(originals(cad)).toEqual([fadedColor("#ff0000")])
    expect(placeholder(cad)).toBe("1.00")
  })

  // desktop transforms/d10-2, d10-3: the reflection drawn as itself, the
  // originals keeping the selection's glow, an amber dashed line from the
  // first point; both still drawn at `Erase source objects?`.
  it("MIRROR drags the reflection as itself and keeps it at Erase", () => {
    const cad = red()
    cad.select("A").command("MIRROR").click(p(150, -50)).moveTo(p(150, 50))

    expect(segmentsAt(cad, p(300, 0), p(200, 0))).toEqual([
      { color: "#ff0000", width: 1 },
    ])
    expect(segmentsAt(cad, p(150, -50), p(150, 50))).toEqual([DRAG_LINE])
    expect(originals(cad)).toEqual(["#ff0000", THEME.selected])
    expect(colours(cad.scene())).not.toContain(THEME.preview)

    cad.click(p(150, 50)).moveTo(p(120, 20))
    expect(cad.state().commandLine.prompt).toBe(
      "MIRROR Erase source objects? [Yes/No] <No>:"
    )
    expect(segmentsAt(cad, p(300, 0), p(200, 0))).toEqual([
      { color: "#ff0000", width: 1 },
    ])
    expect(segmentsAt(cad, p(150, -50), p(150, 50))).toEqual([DRAG_LINE])
  })
})

/** The segments drawn from `base` to `cursor`, either way round, on the screen. */
function armsFromBase(
  cad: CadHarness,
  base: { x: number; y: number },
  cursor: { x: number; y: number }
): ScenePrimitive[] {
  const near = (q: { x: number; y: number }, r: { x: number; y: number }) =>
    Math.hypot(q.x - r.x, q.y - r.y) < 1e-6
  const [a, b] = [cad.toScreen(base), cad.toScreen(cursor)]
  return cad
    .scene()
    .primitives.filter(
      (prim) =>
        prim.kind === "segment" &&
        ((near(prim.a, a) && near(prim.b, b)) ||
          (near(prim.a, b) && near(prim.b, a)))
    )
}

describe("ROTATE", () => {
  // probes transforms/p104, p109: Copy said at each Copy and still listed,
  // the turn the next run's default.
  it("reports its angle settings, then asks as AutoCAD does", () => {
    const cad = createHarness({ entities: [HORIZONTAL] })

    cad.select("L1").command("RO").click(p(0, 0))
    expect(cad.state().commandLine.prompt).toBe(
      "ROTATE Specify rotation angle or [Copy/Reference] <0>:"
    )
    cad.option("Copy")
    expect(cad.optionIds()).toEqual(["Copy", "Reference"])
    cad.option("Copy")
    cad.type("90").enter()

    expect(cad.commandLog()).toEqual([
      "RO ROTATE",
      "Current positive angle in UCS:  ANGDIR=counterclockwise  ANGBASE=0",
      "1 found",
      "Specify base point:",
      "Specify rotation angle or [Copy/Reference] <0>: C",
      "Rotating a copy of the selected objects.",
      "Specify rotation angle or [Copy/Reference] <0>: C",
      "Rotating a copy of the selected objects.",
      "Specify rotation angle or [Copy/Reference] <0>: 90",
    ])
    expect(cad.entityCount).toBe(2)
    cad.select("L1").command("ROTATE").click(p(0, 0))
    expect(cad.state().commandLine.prompt).toBe(
      "ROTATE Specify rotation angle or [Copy/Reference] <90>:"
    )
  })

  // probes transforms/p105, p106: the reference by two points the runtime
  // measures, the new angle with Points, LASTPOINT left at the base.
  it("asks the reference and the new angle, which offers Points", () => {
    const cad = createHarness({ entities: [lineOf(p(0, 0), p(100, 0))] })

    answer(cad, "_ROTATE", "_L", "", "0,0", "_R")
    expect(cad.state().commandLine.prompt).toBe(
      "ROTATE Specify the reference angle <0>:"
    )
    answer(cad, "0,0")
    expect(cad.state().commandLine.prompt).toBe("ROTATE Specify second point:")
    answer(cad, "100,100")
    expect(cad.state().commandLine.prompt).toBe(
      "ROTATE Specify the new angle or [Points] <0>:"
    )
    expect(cad.optionIds()).toEqual(["Points"])
    answer(cad, "_P")
    expect(cad.state().commandLine.prompt).toBe("ROTATE Specify first point:")
    expect(cad.optionIds()).toEqual([])
    answer(cad, "0,0", "0,100")

    expect(cad.commandLog().slice(-6)).toEqual([
      "Specify rotation angle or [Copy/Reference] <0>: _R",
      "Specify the reference angle <0>: 0,0",
      " Specify second point: 100,100",
      "Specify the new angle or [Points] <0>: _P",
      "Specify first point: 0,0",
      " Specify second point: 0,100",
    ])
    const half = 100 / Math.SQRT2
    expect((cad.latest() as LineEntity).end).toBeCloseToPoint(p(half, half))
    answer(cad, "_ID", "@")
    expect(cad.commandLog().at(-1)).toBe(" X = 0.00     Y = 0.00     Z = 0.00")
  })

  // probe transforms/p154: the new angle is the line from Points' first point
  // to its second, whatever the base.
  it("turns to the new angle Points measures, from any base", () => {
    const cad = createHarness({ entities: [lineOf(p(0, 0), p(100, 0))] })
    answer(cad, "_ROTATE", "_L", "", "10,10", "_R", "0", "_P", "20,20", "30,40")

    expect((cad.latest() as LineEntity).end).toBeCloseToPoint(
      p(59.1935, 86.0263),
      4
    )
    answer(cad, "_ID", "@")
    expect(cad.commandLog().at(-1)).toBe(
      " X = 10.00     Y = 10.00     Z = 0.00"
    )
  })

  // probe transforms/p143: in a UCS turned 30°, a reference by WCS points
  // along the WCS's X is −30° in the UCS.
  it("measures the reference's two points in the UCS", () => {
    const cad = createHarness({ entities: [lineOf(p(0, 0), p(100, 0))] })
    answer(cad, "_UCS", "_Z", "30")
    answer(cad, "_ROTATE", "_L", "", "0,0", "_R", "*0,0", "*100,0", "0")

    expect((cad.latest() as LineEntity).end).toBeCloseToPoint(p(86.6025, 50), 4)
  })

  // probe transforms/p107: Enter at the new angle takes its <0>, a turn by
  // 0 − 30.
  it("turns by the new angle's default less the reference at Enter", () => {
    const cad = createHarness({ entities: [lineOf(p(0, 0), p(100, 0))] })
    answer(cad, "_ROTATE", "_L", "", "0,0", "_R", "30", "")

    expect((cad.latest() as LineEntity).end).toBeCloseToPoint(
      p(86.6025, -50),
      4
    )
  })

  // probes transforms/p111, p112: a Reference run leaves its turn, its
  // reference and its new angle as the next run's defaults.
  it("offers the last run's turn, reference and new angle", () => {
    const cad = createHarness({ entities: [lineOf(p(0, 0), p(100, 0))] })
    answer(cad, "_ROTATE", "_L", "", "0,0", "_R", "12.5", "40")
    answer(cad, "_ROTATE", "_L", "", "0,0")
    expect(cad.state().commandLine.prompt).toBe(
      "ROTATE Specify rotation angle or [Copy/Reference] <28>:"
    )
    answer(cad, "_R")
    expect(cad.state().commandLine.prompt).toBe(
      "ROTATE Specify the reference angle <13>:"
    )
    answer(cad, "")
    expect(cad.state().commandLine.prompt).toBe(
      "ROTATE Specify the new angle or [Points] <40>:"
    )
    answer(cad, "")
    expect((cad.latest() as LineEntity).end).toBeCloseToPoint(
      p(57.3576, 81.9152),
      4
    )

    answer(cad, "_ROTATE", "_L", "", "0,0", "")
    expect((cad.latest() as LineEntity).end).toBeCloseToPoint(
      p(13.0526, 99.1445),
      4
    )
  })

  // probe transforms/p157: Enter at the reference's second point goes on.
  it("goes on to the new angle at Enter at the reference's second point", () => {
    const cad = createHarness({ entities: [lineOf(p(0, 0), p(100, 0))] })
    answer(cad, "_ROTATE", "_L", "", "0,0", "_R", "0,0", "")

    expect(cad.state().commandLine.prompt).toBe(
      "ROTATE Specify the new angle or [Points] <0>:"
    )
    answer(cad, "100,0")
    expect((cad.latest() as LineEntity).end).toBeCloseToPoint(p(100, 0))
  })

  // probes transforms/p158, p136: a refusal at the second point starts the
  // two points over under the same words, where a number is the angle.
  it("starts the reference's two points over after a refusal", () => {
    const cad = createHarness({ entities: [lineOf(p(0, 0), p(100, 0))] })
    answer(cad, "_ROTATE", "_L", "", "0,0", "_R", "0,0", "FOO", "100,100")

    expect(cad.commandLog().slice(-3)).toEqual([
      " Specify second point: FOO",
      "Requires valid numeric angle or two points.",
      " Specify second point: 100,100",
    ])
    expect(cad.state().commandLine.prompt).toBe("ROTATE Specify second point:")
    answer(cad, "_LINE")
    expect(cad.commandLog().at(-1)).toBe(
      "Requires valid numeric angle or two points."
    )
    answer(cad, "90")
    expect(cad.state().commandLine.prompt).toBe(
      "ROTATE Specify the new angle or [Points] <0>:"
    )
    answer(cad, "180")
    expect((cad.latest() as LineEntity).end).toBeCloseToPoint(p(0, 100))
  })

  // probes transforms/p106, p156 (es-ES): `Puntos`, `P`, and the runtime's
  // ` Designe segundo punto:`.
  it("asks Points in Spanish", () => {
    const cad = createHarness({
      locale: es,
      entities: [lineOf(p(0, 0), p(100, 0))],
    })
    answer(cad, "GIRA", "_L", "", "0,0", "C", "R", "0,0", "100,100")
    expect(cad.state().commandLine.prompt).toBe(
      "GIRA Precise el nuevo ángulo o [Puntos] <0>:"
    )
    answer(cad, "P", "0,0", "0,10")
    expect(cad.commandLog().slice(-5)).toEqual([
      "Precise ángulo de referencia <0>: 0,0",
      " Designe segundo punto: 100,100",
      "Precise el nuevo ángulo o [Puntos] <0>: P",
      "Precise primer punto: 0,0",
      " Designe segundo punto: 0,10",
    ])
    const half = 100 / Math.SQRT2
    expect((cad.latest() as LineEntity).end).toBeCloseToPoint(p(half, half))
  })

  // desktop d04-1, d05-1: nothing is drawn at the reference angle nor at
  // Points' first point; the second point's line is the runtime's.
  it("draws nothing at the reference's and Points' first point", () => {
    const cad = createHarness({ entities: [lineOf(p(0, 0), p(100, 0))] })
    const segments = () => armsFromBase(cad, p(0, 0), p(300, 300))
    answer(cad, "_ROTATE", "_L", "", "0,0", "_R")
    cad.moveTo(p(300, 300))
    expect(segments()).toEqual([])
    answer(cad, "0", "_P")
    cad.moveTo(p(300, 300))
    expect(segments()).toEqual([])
  })

  it("turns the selection about the picked pivot", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })

    cad.select("L1").command("ROTATE").click(p(0, 0)).type("90").enter()

    const line = cad.byId<LineEntity>("L1")
    expect(line.start).toBeCloseToPoint(p(0, 0), 6)
    expect(line.end).toBeCloseToPoint(p(0, 100), 6)
  })

  it("rotates an arc's angles, not just its centre", () => {
    const cad = createHarness({
      entities: [arcOf(p(0, 0), 100, 0, deg(90), { id: "A1" })],
    })

    cad.select("A1").command("ROTATE").click(p(0, 0)).type("90").enter()

    const arc = cad.byId<ArcEntity>("A1")
    expect(arc.startAngle).toBeCloseToAngle(deg(90))
    expect(arc.endAngle).toBeCloseToAngle(deg(180))
  })

  it("leaves the original in place under the Copy option", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })

    cad
      .select("L1")
      .command("ROTATE")
      .click(p(0, 0))
      .option("Copy")
      .type("90")
      .enter()

    expect(cad.entityCount).toBe(2)
    expect(cad.byId<LineEntity>("L1").end).toBeCloseToPoint(p(100, 0))
  })

  // probe transforms/p105: a new angle of 100 from a reference of 30.
  it("rotates by the difference under the Reference option", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })

    cad
      .select("L1")
      .command("ROTATE")
      .click(p(0, 0))
      .option("Reference")
      .type("30")
      .enter()
      .type("100")
      .enter()

    // New angle 100° measured from reference 30° = a 70° turn.
    expect(cad.byId<LineEntity>("L1").end).toBeCloseToPoint(
      p(100 * Math.cos(deg(70)), 100 * Math.sin(deg(70))),
      5
    )
  })

  // probe transforms/p123: `<30` at the rotation angle is the angle, no
  // angle override, and ROTATE ends.
  it("takes <30 at the rotation angle as the angle", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })
    answer(cad, "_ROTATE", "_L", "", "0,0", "<30")

    expect(cad.state().commandLine.prompt).toBe("Command:")
    expect(cad.commandLog().at(-1)).toBe(
      "Specify rotation angle or [Copy/Reference] <0>: <30"
    )
    expect(cad.byId<LineEntity>("L1").end).toBeCloseToPoint(p(86.6025, 50), 4)
  })

  // probe transforms/p139: with L picked before H, ERASE Last takes L's copy,
  // the copy of the object later in the drawing.
  it("adds Copy's copies in drawing order, whatever the pick order", () => {
    const cad = createHarness({
      entities: [
        lineOf(p(0, 50), p(50, 100), { id: "H" }),
        lineOf(p(0, 0), p(100, 0), { id: "L" }),
      ],
    })
    answer(cad, "_ROTATE", "50,0", "25,75", "", "0,0", "_C", "90")
    expect(
      linesOf(cad.entities())
        .slice(2)
        .map((line) => line.start)
    ).toBeCloseToPoints([p(-50, 0), p(0, 0)])

    answer(cad, "_ERASE", "_L", "")
    expect(linesOf(cad.entities())).toHaveLength(3)
    expect(linesOf(cad.entities())[2].end).toBeCloseToPoint(p(-100, 50))
  })

  // probes transforms/p131–p134: each run is one step U names, a turn by 0
  // included; a Copy by 0 leaves a duplicate U takes back.
  it("is one step for U, REDO and MREDO", () => {
    const drawing = () =>
      createHarness({
        entities: [
          circleOf(p(200, 200), 20),
          lineOf(p(0, 50), p(50, 100)),
          lineOf(p(0, 0), p(100, 0), { id: "L1" }),
        ],
      })
    const end = (cad: CadHarness) => cad.byId<LineEntity>("L1").end
    const turned = p(86.6025, 50)

    const redone = answer(drawing(), "_ROTATE", "_L", "", "0,0", "30", "_U")
    expect(end(redone)).toBeCloseToPoint(p(100, 0))
    answer(redone, "_REDO")
    expect(end(redone)).toBeCloseToPoint(turned, 4)
    expect(redone.commandLog().slice(-5)).toEqual([
      "U",
      "ROTATE",
      "REDO",
      "ROTATE",
      "Everything has been redone",
    ])
    answer(redone, "_U", "_MREDO", "1")
    expect(end(redone)).toBeCloseToPoint(turned, 4)

    const byZero = answer(drawing(), "_ROTATE", "_L", "", "0,0", "0", "_U")
    expect(byZero.commandLog().at(-1)).toBe("ROTATE")
    expect(byZero.entityCount).toBe(3)

    const copied = answer(drawing(), "_ROTATE", "_L", "", "0,0", "_C", "0")
    expect(copied.entityCount).toBe(4)
    answer(copied, "_U")
    expect(copied.entityCount).toBe(3)
    expect(copied.commandLog().at(-1)).toBe("ROTATE")
  })
})

describe("SCALE", () => {
  // probes transforms/p160, p172.
  it("asks the base point, the factor and the reference lengths", () => {
    const cad = createHarness({ entities: [HORIZONTAL] })

    cad.command("SCALE").click(p(100, 0)).enter()
    expect(cad.state().commandLine.prompt).toBe("SCALE Specify base point:")
    cad.click(p(0, 0))
    expect(cad.state().commandLine.prompt).toBe(
      "SCALE Specify scale factor or [Copy/Reference]:"
    )
    cad.option("Reference")
    expect(cad.state().commandLine.prompt).toBe(
      "SCALE Specify reference length <1.00>:"
    )
    cad.type("100").enter()
    expect(cad.state().commandLine.prompt).toBe(
      "SCALE Specify new length or [Points] <1.00>:"
    )
    cad.type("50").enter()

    expect(cad.commandLog()).toEqual([
      "SCALE",
      "Select objects: 1 found",
      "Select objects:",
      "Specify base point:",
      "Specify scale factor or [Copy/Reference]: R",
      "Specify reference length <1.00>: 100",
      "Specify new length or [Points] <1.00>: 50",
    ])
    expect(cad.byId<LineEntity>("L1").end).toBeCloseToPoint(p(100, 0))
  })

  // probes transforms/p182, p187: Points measures the new length by two points
  // of its own, and both lengths are the next Reference's defaults.
  it("measures the new length by Points, and keeps the lengths as defaults", () => {
    const cad = createHarness({ entities: [HORIZONTAL] })
    const answer = (text: string) => {
      cad.runtime.setCommandLineText(text)
      cad.runtime.submitCommandLine()
    }

    cad.select("L1").command("SCALE").click(p(0, 0)).option("Reference")
    answer("50")
    answer("FOO")
    answer("P")
    expect(cad.state().commandLine.prompt).toBe("SCALE Specify first point:")
    answer("FOO")
    answer("10,0")
    answer("40,0")
    expect(cad.commandLog().slice(-7)).toEqual([
      "Specify new length or [Points] <1.00>: FOO",
      "Requires numeric distance, second point, or option keyword.",
      "Specify new length or [Points] <1.00>: P",
      "Specify first point: FOO",
      "Requires numeric distance or two points.",
      "Specify first point: 10,0",
      " Specify second point: 40,0",
    ])
    expect(cad.byId<LineEntity>("L1").end).toBeCloseToPoint(p(120, 0))

    cad.select("L1").command("SCALE").click(p(0, 0)).option("Reference")
    expect(cad.state().commandLine.prompt).toBe(
      "SCALE Specify reference length <50.00>:"
    )
    cad.enter()
    expect(cad.state().commandLine.prompt).toBe(
      "SCALE Specify new length or [Points] <30.00>:"
    )
    cad.enter()
    expect(cad.byId<LineEntity>("L1").end).toBeCloseToPoint(p(72, 0))

    // A factor typed leaves them.
    cad.select("L1").command("SCALE").click(p(0, 0)).type("2").enter()
    cad.select("L1").command("SCALE").click(p(0, 0)).option("Reference")
    expect(cad.state().commandLine.prompt).toBe(
      "SCALE Specify reference length <50.00>:"
    )
    answer("P")
    expect(cad.commandLog().at(-1)).toBe(
      "Requires numeric distance or two points."
    )
    answer("100")
    answer("P")
    answer("25")
    expect(cad.byId<LineEntity>("L1").end).toBeCloseToPoint(p(36, 0))
  })

  // probe transforms/p182 (es-ES).
  it("asks Points in Spanish", () => {
    const cad = createHarness({ locale: es, entities: [HORIZONTAL] })
    cad.select("L1").command("ESCALA").click(p(0, 0)).option("Reference")
    cad.type("100").enter()
    expect(cad.state().commandLine.prompt).toBe(
      "ESCALA Precise nueva longitud o [Puntos] <1.00>:"
    )
    cad.runtime.setCommandLineText("P")
    cad.runtime.submitCommandLine()
    expect(cad.state().commandLine.prompt).toBe("ESCALA Precise primer punto:")
  })

  // probe transforms/p171.
  it("says it scales a copy each time Copy is chosen", () => {
    const cad = createHarness({ entities: [HORIZONTAL] })

    cad.select("L1").command("SCALE").click(p(0, 0))
    cad.option("Copy").option("Copy").type("2").enter()

    expect(cad.commandLog().slice(-5)).toEqual([
      "Specify scale factor or [Copy/Reference]: C",
      "Scaling a copy of the selected objects.",
      "Specify scale factor or [Copy/Reference]: C",
      "Scaling a copy of the selected objects.",
      "Specify scale factor or [Copy/Reference]: 2",
    ])
    expect(cad.entityCount).toBe(2)
  })

  it("scales about the picked base point", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })

    cad.select("L1").command("SCALE").click(p(0, 0)).type("2").enter()

    expect(cad.byId<LineEntity>("L1").end).toBeCloseToPoint(p(200, 0))
  })

  it("scales a circle's radius too", () => {
    const cad = createHarness({
      entities: [circleOf(p(100, 0), 50, { id: "C1" })],
    })

    cad.select("C1").command("SCALE").click(p(0, 0)).type("3").enter()

    const circle = cad.byId<CircleEntity>("C1")
    expect(circle.center).toBeCloseToPoint(p(300, 0))
    expect(circle.radius).toBeCloseTo(150)
  })

  it("derives the factor from a reference length", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })

    cad
      .select("L1")
      .command("SCALE")
      .click(p(0, 0))
      .option("Reference")
      .type("50")
      .enter()
      .type("150")
      .enter()

    // 150 / 50 = ×3.
    expect(cad.byId<LineEntity>("L1").end).toBeCloseToPoint(p(300, 0))
  })

  // probe transforms/p219: a point at the factor is its distance from the base
  // over half the largest side of the set's extents; 1 when they have no size
  // (a POINT there, a line of no length here).
  it.each<[string, Entity[], number]>([
    ["a 100-long line", [lineOf(p(10, 0), p(110, 0))], 0.2],
    ["a 30×10 rectangle", [rectOf(p(10, 10), p(40, 20))], 2 / 3],
    ["a 10×30 rectangle", [rectOf(p(10, 10), p(20, 40))], 2 / 3],
    ["a 20×20 square", [rectOf(p(10, 10), p(30, 30))], 1],
    ["a 45° line of extents 30×30", [lineOf(p(10, 10), p(40, 40))], 2 / 3],
    ["a circle of radius 5", [circleOf(p(100, 100), 5)], 2],
    ["a line of no length", [lineOf(p(50, 50), p(50, 50))], 10],
    [
      "two lines of extents 210×100",
      [lineOf(p(10, 0), p(20, 0)), lineOf(p(210, 100), p(220, 100))],
      10 / 105,
    ],
  ])("scales %s by @10,0 at the factor as AutoCAD (p219)", (_, set, factor) => {
    const cad = createHarness({ entities: set })
    answer(cad, "_SCALE", "_ALL", "", "0,0", "@10,0")

    expect(cad.entities()).toEqual(
      set.map((entity) => scaleEntity(entity, p(0, 0), factor))
    )
  })

  // probe transforms/p219, desktop d07: a click measures as a typed point.
  it("scales by a click over half the set's extents", () => {
    const cad = createHarness({
      entities: [lineOf(p(10, 0), p(110, 0), { id: "L1" })],
    })
    cad.select("L1").command("SCALE").click(p(0, 0)).click(p(0, 50))

    expect(cad.byId<LineEntity>("L1").start).toBeCloseToPoint(p(10, 0))
    expect(cad.byId<LineEntity>("L1").end).toBeCloseToPoint(p(110, 0))
  })

  // desktop d06: the dragged set and the factor's field read what a click
  // there would scale by.
  it("drags and reads the factor a click would scale by", () => {
    const cad = createHarness({
      entities: [lineOf(p(10, 0), p(110, 0), { id: "L1" })],
    })
    cad.select("L1").command("SCALE").click(p(0, 0)).moveTo(p(0, 100))

    expect(cad.state().dynamicInput?.fields[0].placeholder).toBe("2")
    const [a, b] = [cad.toScreen(p(20, 0)), cad.toScreen(p(220, 0))]
    const near = (q: { x: number; y: number }, r: { x: number; y: number }) =>
      Math.hypot(q.x - r.x, q.y - r.y) < 1e-6
    expect(
      cad
        .scene()
        .primitives.some(
          (prim) =>
            prim.kind === "segment" && near(prim.a, a) && near(prim.b, b)
        )
    ).toBe(true)
    cad.click(p(0, 100))
    expect(cad.byId<LineEntity>("L1").end).toBeCloseToPoint(p(220, 0))
  })

  // probe transforms/p167, p168, p193: AutoCAD refuses and asks again.
  it.each([["0"], ["-2"], ["@"]])(
    "refuses %s at the factor and asks again",
    (bad) => {
      const cad = createHarness({
        entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
      })
      answer(cad, "_SCALE", "_ALL", "", "0,0", bad)

      expect(cad.commandLog().slice(-2)).toEqual([
        `Specify scale factor or [Copy/Reference]: ${bad}`,
        "Value must be positive and nonzero.",
      ])
      expect(cad.state().commandLine.prompt).toBe(
        "SCALE Specify scale factor or [Copy/Reference]:"
      )
      answer(cad, "2")
      expect(cad.byId<LineEntity>("L1").end).toBeCloseToPoint(p(200, 0))
    }
  )

  it("refuses a click on the base point at the factor (p193)", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })
    cad.select("L1").command("SCALE").click(p(0, 0)).click(p(0, 0))

    expect(cad.commandLog().at(-1)).toBe("Value must be positive and nonzero.")
    expect(cad.activeToolId()).toBe("scale")
  })

  it("refuses a factor of 0 in Spanish (p167)", () => {
    const cad = createHarness({
      locale: es,
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })
    answer(cad, "ESCALA", "_ALL", "", "0,0", "0")

    expect(cad.commandLog().at(-1)).toBe(
      "El valor debe ser positivo y diferente de cero."
    )
    expect(cad.state().commandLine.prompt).toBe(
      "ESCALA Precise factor de escala o [Copiar/Referencia]:"
    )
  })

  // probes transforms/p174, p175 (the reference length), p178, p179 (the new
  // length): refused and asked again, the default kept.
  it.each([
    ["the reference length", ["0"], "Specify reference length <1.00>:"],
    ["the reference length", ["-5"], "Specify reference length <1.00>:"],
    ["the new length", ["10", "0"], "Specify new length or [Points] <1.00>:"],
    ["the new length", ["10", "-5"], "Specify new length or [Points] <1.00>:"],
  ])("refuses %s %j and asks again", (_, answers, asked) => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })
    answer(cad, "_SCALE", "_L", "", "0,0", "_R", ...answers)

    expect(cad.commandLog().slice(-2)).toEqual([
      `${asked} ${answers.at(-1)}`,
      "Value must be positive and nonzero.",
    ])
    expect(cad.state().commandLine.prompt).toBe(`SCALE ${asked}`)
    answer(cad, ...(answers.length === 1 ? ["10", "20"] : ["20"]))
    expect(cad.byId<LineEntity>("L1").end).toBeCloseToPoint(p(200, 0))
    cad.select("L1").command("SCALE").click(p(0, 0)).option("Reference")
    expect(cad.state().commandLine.prompt).toBe(
      "SCALE Specify reference length <10.00>:"
    )
  })

  // desktop d08-1: nothing is drawn at the reference length nor at Points'
  // first point; the second point's line is the runtime's.
  it("draws nothing at the reference length's and Points' first point", () => {
    const cad = createHarness({ entities: [lineOf(p(0, 0), p(100, 0))] })
    const segments = () => armsFromBase(cad, p(0, 0), p(300, 300))
    answer(cad, "_SCALE", "_L", "", "0,0", "_R")
    cad.moveTo(p(300, 300))
    expect(segments()).toEqual([])
    answer(cad, "10", "_P")
    cad.moveTo(p(300, 300))
    expect(segments()).toEqual([])
  })

  // probe transforms/p213: the copy of the object earlier in the drawing is
  // appended first, so ERASE Last takes the later one's.
  it("adds Copy's copies in drawing order, whatever the pick order", () => {
    const cad = createHarness({
      entities: [
        lineOf(p(0, 0), p(100, 0), { id: "A" }),
        lineOf(p(0, 50), p(100, 50), { id: "B" }),
      ],
    })
    answer(cad, "_SCALE", "50,50", "50,0", "", "0,0", "_C", "2")
    expect(
      linesOf(cad.entities())
        .slice(2)
        .map((line) => line.start.y)
    ).toEqual([0, 100])

    answer(cad, "_ERASE", "_L", "")
    expect(linesOf(cad.entities()).map((line) => line.start.y)).toEqual([
      0, 50, 0,
    ])
  })

  // probes transforms/p205–p208: each run is one step U names, a scale by 1
  // included; a Copy by 1 leaves a duplicate U takes back.
  it("is one step for U, REDO, UNDO and MREDO", () => {
    const drawing = () =>
      createHarness({
        entities: [
          circleOf(p(200, 200), 20),
          lineOf(p(0, 0), p(100, 0), { id: "L1" }),
        ],
      })
    const end = (cad: CadHarness) => cad.byId<LineEntity>("L1").end

    const redone = answer(drawing(), "_SCALE", "_L", "", "0,0", "2", "_U")
    expect(end(redone)).toBeCloseToPoint(p(100, 0))
    answer(redone, "_REDO")
    expect(end(redone)).toBeCloseToPoint(p(200, 0))
    expect(redone.commandLog().slice(-5)).toEqual([
      "U",
      "SCALE",
      "REDO",
      "SCALE",
      "Everything has been redone",
    ])

    const byOne = answer(drawing(), "_SCALE", "_L", "", "0,0", "1", "_U")
    expect(byOne.commandLog().at(-1)).toBe("SCALE")

    const copied = answer(drawing(), "_SCALE", "_L", "", "0,0", "_C", "1")
    expect(copied.entityCount).toBe(3)
    answer(copied, "_U")
    expect(copied.entityCount).toBe(2)
    expect(copied.commandLog().at(-1)).toBe("SCALE")

    const twice = answer(drawing(), "_SCALE", "_L", "", "0,0", "2")
    answer(twice, "_SCALE", "_L", "", "0,0", "3", "_UNDO", "2")
    expect(end(twice)).toBeCloseToPoint(p(100, 0))
    answer(twice, "_MREDO", "1")
    expect(end(twice)).toBeCloseToPoint(p(200, 0))
  })

  // probe transforms/p212: a hatch's pattern scale and a dimension's
  // measurement scale with it.
  it("scales a hatch's pattern and a dimension's measurement", () => {
    const cad = createHarness({
      entities: [hatchOf([loopOf(p(0, 0), p(10, 10))])],
    })
    answer(cad, "_DIMLINEAR", "0,-30", "50,-30", "25,-40")
    answer(cad, "_SCALE", "_ALL", "", "0,0", "2")

    expect(cad.only<HatchEntity>("hatch").patternScale).toBeCloseTo(2)
    expect(
      dimensionMeasurement(cad.only<DimensionEntity>("dimension"))
    ).toBeCloseTo(100)
  })

  // probe transforms/p218 (es-ES): Copy, Reference and Points by their
  // Spanish letters.
  it("takes C, R and P in Spanish", () => {
    const cad = createHarness({
      locale: es,
      entities: [
        circleOf(p(200, 200), 20),
        lineOf(p(0, 0), p(100, 0), { id: "L1" }),
      ],
    })
    answer(cad, "ESCALA", "_L", "", "0,0", "C", "R", "10", "P", "10,0", "40,0")

    expect(cad.commandLog()).toContain(
      "Escalando una copia de los objetos seleccionados."
    )
    expect(cad.entityCount).toBe(3)
    expect((cad.latest() as LineEntity).end).toBeCloseToPoint(p(300, 0))
    expect(cad.byId<LineEntity>("L1").end).toBeCloseToPoint(p(100, 0))
  })
})

describe("MIRROR", () => {
  // probes transforms/p220 (MIRROR, MI, repeated), p226 (its prompts), p230
  // (Enter at Erase is No).
  it("asks the mirror line, then whether to erase the source, No kept", () => {
    const cad = createHarness({ entities: [HORIZONTAL] })

    cad.select("L1").command("MIRROR").click(p(0, 10)).click(p(100, 10))
    expect(cad.state().commandLine.prompt).toBe(
      "MIRROR Erase source objects? [Yes/No] <No>:"
    )
    cad.enter()

    expect(cad.commandLog()).toEqual([
      "MIRROR",
      "1 found",
      "Specify first point of mirror line:",
      "Specify second point of mirror line:",
      "Erase source objects? [Yes/No] <No>:",
    ])
    expect(cad.entityCount).toBe(2)
  })

  it("adds the reflection and keeps the source by default", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 50), { id: "L1" })],
    })

    cad
      .select("L1")
      .command("MIRROR")
      .click(p(0, 0))
      .click(p(100, 0)) // mirror line = the X axis
      .enter() // accept the default: do not erase the source

    expect(cad.entityCount).toBe(2)
    expect(cad.byId<LineEntity>("L1").end).toBeCloseToPoint(p(100, 50))
    const reflection = linesOf(cad.entities()).find((line) => line.id !== "L1")
    expect(reflection?.end).toBeCloseToPoint(p(100, -50))
  })

  // probe transforms/p227: Yes leaves the reflection under the originals' handles.
  it("flips the source in place when Erase is chosen", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 50), { id: "L1" })],
    })

    cad
      .select("L1")
      .command("MIRROR")
      .click(p(0, 0))
      .click(p(100, 0))
      .option("Yes")

    expect(cad.entityCount).toBe(1)
    expect(cad.byId<LineEntity>("L1").end).toBeCloseToPoint(p(100, -50))
  })

  it("offers the Yes/No prompt as keywords with no numeric field", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 50), { id: "L1" })],
    })

    cad.select("L1").command("MIRROR").click(p(0, 0)).click(p(100, 0))

    expect(cad.optionAbbreviations()).toEqual(["Y", "N"])
    expect(cad.hasFocusedField()).toBe(false)
  })

  // probe arc/p212: a 10°–80° arc mirrored about the Y axis is 100°–170°,
  // its normal still +Z, counter-clockwise as every arc.
  it("mirrors an arc into its reflection, counter-clockwise about +Z", () => {
    const cad = createHarness({
      entities: [arcOf(p(0, 0), 10, deg(10), deg(80), { id: "A1" })],
    })

    cad.select("A1").command("MIRROR").click(p(0, 0)).click(p(0, 10))
    cad.option("No")

    const mirrored = cad
      .entities()
      .find((e): e is ArcEntity => e.type === "arc" && e.id !== "A1")!
    expect(mirrored.center).toBeCloseToPoint(p(0, 0), 9)
    expect(mirrored.startAngle).toBeCloseToAngle(deg(100), 9)
    expect(mirrored.endAngle).toBeCloseToAngle(deg(170), 9)
    expect(mirrored.normal).toBeUndefined()
  })

  it("cancels without committing anything", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 50), { id: "L1" })],
    })

    cad.select("L1").command("MIRROR").click(p(0, 0)).click(p(100, 0)).escape()

    expect(cad.entityCount).toBe(1)
    expect(cad.byId<LineEntity>("L1").end).toBeCloseToPoint(p(100, 50))
  })

  // probe transforms/p283 (MIRRTEXT 0, mirror line x = 0): each text keeps
  // reading left to right in its box's reflection. AutoCAD: Hola, BaseLeft
  // at 10,10, 30°, starts at (-22.668, 17.314), 330°, by its font's width
  // (14.628; the engine's is measureTextWidth's); Adios, right-justified at
  // 50,40, is aligned at (-32.527, 40); the MTEXT TopLeft at 10,80 is TopRight
  // at (-10, 80). Yes flips them so in place.
  it.each([["_N"], ["_Y"]])(
    "mirrors TEXT and MTEXT readable, Erase %s",
    (erase) => {
      const cad = createHarness({
        entities: [
          createText(p(10, 10), "Hola", {
            id: "T1",
            height: 5,
            rotation: deg(30),
          }),
          createText(p(50, 40), "Adios", {
            id: "T2",
            height: 5,
            justify: "right",
          }),
          createMText(p(10, 80), "Hola", { id: "M", height: 5, width: 30 }),
        ],
      })
      answer(cad, "_MIRROR", "_ALL", "", "0,0", "0,10", erase)
      const [hola, adios, mtext] = cad.entities().slice(-3) as [
        TextEntity,
        TextEntity,
        MTextEntity,
      ]
      const w = measureTextWidth("Hola", 5)
      expect(hola.position).toBeCloseToPoint(
        p(-10 - w * Math.cos(deg(30)), 10 + w * Math.sin(deg(30))),
        9
      )
      expect(hola.rotation).toBeCloseToAngle(deg(330), 9)
      expect(hola.justify).toBe("left")
      expect(adios.position).toBeCloseToPoint(
        p(measureTextWidth("Adios", 5) - 50, 40),
        9
      )
      expect(adios.position.x).toBeCloseTo(-32.527, 1)
      expect(adios.rotation).toBeCloseToAngle(0, 9)
      expect(adios.justify).toBe("right")
      expect(mtext.position).toBeCloseToPoint(p(-10, 80), 9)
      expect(mtext.attachment).toBe("tr")
      expect(mtext.rotation).toBeCloseToAngle(0, 9)
      expect(cad.entityCount).toBe(erase === "_Y" ? 3 : 6)
    }
  )

  // probes transforms/p235 (`@`), p236 (the first point again): `Points must
  // be distinct.` and the command ends; p248: U names MIRROR.
  it.each([["@"], ["0,0"]])(
    "ends at a mirror line of no length (%s), saying so",
    (second) => {
      const cad = createHarness({
        entities: [lineOf(p(0, 0), p(100, 0), { id: "A" })],
      })
      answer(cad, "_MIRROR", "_L", "", "0,0", second)
      expect(cad.commandLog().slice(-2)).toEqual([
        `Specify second point of mirror line: ${second}`,
        "Points must be distinct.",
      ])
      expect(cad.activeToolId()).toBe("select")
      expect(cad.entityCount).toBe(1)
      answer(cad, "_U")
      expect(cad.commandLog().at(-1)).toBe("MIRROR")
      expect(cad.entityCount).toBe(1)
    }
  )

  it("says a mirror line of no length in Spanish", () => {
    const cad = createHarness({
      locale: es,
      entities: [lineOf(p(0, 0), p(100, 0), { id: "A" })],
    })
    answer(cad, "_MIRROR", "_L", "", "0,0", "@")
    expect(cad.commandLog().at(-1)).toBe("Los puntos tienen que ser distintos.")
  })

  // probe transforms/p284: B picked before A, A's copy is appended first, so
  // ERASE Last takes B's.
  it("adds its copies in drawing order, whatever the pick order", () => {
    const cad = createHarness({
      entities: [
        lineOf(p(0, 0), p(100, 0), { id: "A" }),
        lineOf(p(0, 50), p(100, 50), { id: "B" }),
      ],
    })
    answer(cad, "_MIRROR", "50,50", "50,0", "", "0,0", "0,10", "_N")
    expect(
      linesOf(cad.entities())
        .slice(2)
        .map((line) => line.start.y)
    ).toEqual([0, 50])

    answer(cad, "_ERASE", "_L", "")
    expect(linesOf(cad.entities()).map((line) => line.start.y)).toEqual([
      0, 50, 0,
    ])
  })

  // probes transforms/p246 (No), p247 (Yes): U names MIRROR and takes back
  // only it.
  it.each([["_N"], ["_Y"]])("is one step for U, Erase %s", (erase) => {
    const cad = createHarness({
      entities: [
        lineOf(p(0, 0), p(100, 0), { id: "A" }),
        lineOf(p(0, 50), p(100, 50), { id: "B" }),
      ],
    })
    answer(cad, "_MIRROR", "_L", "", "0,0", "0,10", erase, "_U")
    expect(cad.commandLog().at(-1)).toBe("MIRROR")
    expect(cad.entityCount).toBe(2)
    expect(cad.byId<LineEntity>("B").end).toBeCloseToPoint(p(100, 50))
  })

  // probe transforms/p242: `_END` and `_MID` typed at the mirror line's points.
  it("takes object snaps typed at the mirror line's points", () => {
    const cad = createHarness({
      snap: true,
      entities: [
        lineOf(p(0, 0), p(100, 0), { id: "A" }),
        lineOf(p(0, 50), p(0, 150), { id: "B" }),
      ],
    })
    answer(cad, "_MIRROR", "50,0", "", "_END", "1,51", "_MID", "1,100", "_N")
    const copy = cad.latest() as LineEntity
    expect(copy.start).toBeCloseToPoint(p(0, 0), 9)
    expect(copy.end).toBeCloseToPoint(p(-100, 0), 9)
  })

  // probe transforms/p238: a number at the second point runs from the first
  // towards the console's cursor; the copy ends at (95.794, 28.6968).
  it("reads a number at the second point as a direct distance", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "A" })],
    })
    cad.moveTo(CONSOLE_CURSOR)
    answer(cad, "_MIRROR", "_L", "", "0,0", "10", "_N")
    expect((cad.latest() as LineEntity).end).toBeCloseToPoint(
      p(95.794, 28.6968),
      3
    )
  })

  // probe transforms/p231: Spanish `S` is Sí, the originals erased.
  it("erases the source at the Spanish S", () => {
    const cad = createHarness({
      locale: es,
      entities: [lineOf(p(0, 0), p(100, 0), { id: "A" })],
    })
    answer(cad, "_MIRROR", "_L", "", "0,0", "0,10", "S")
    expect(cad.entityCount).toBe(1)
    expect(cad.byId<LineEntity>("A").end).toBeCloseToPoint(p(-100, 0))
  })
})

describe("ARRAYRECT", () => {
  it("asks AutoCAD's questions over the preview and writes them answered", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(40, 0), { id: "L1" })],
    })

    cad.command("ARRAYRECT").click(p(20, 0)).enter()
    expect(cad.state().commandLine.prompt).toBe(
      "ARRAYRECT Select grip to edit array or [COUnt/Spacing/COLumns/Rows/eXit] <eXit>:"
    )
    cad.option("COUnt")
    expect(cad.state().commandLine.prompt).toBe(
      "ARRAYRECT Enter the number of columns <4>:"
    )
    cad.type("0").enter().type("2.5").enter().type("3").enter()
    expect(cad.state().commandLine.prompt).toBe(
      "ARRAYRECT Enter the number of rows <3>:"
    )
    cad.type("2").enter().option("Spacing")
    expect(cad.state().commandLine.prompt).toBe(
      "ARRAYRECT Specify the distance between columns or [Unit cell] <60.00>:"
    )
    cad.type("100").enter()
    expect(cad.state().commandLine.prompt).toBe(
      "ARRAYRECT Specify the distance between rows <1.00>:"
    )
    cad.type("50").enter().option("Rows").enter().enter()
    expect(cad.state().commandLine.prompt).toBe(
      "ARRAYRECT Specify the incrementing elevation between rows <0.00>:"
    )
    cad.type("5").enter().enter()

    expect(cad.commandLog()).toEqual([
      "ARRAYRECT",
      "Select objects: 1 found",
      "Select objects:",
      "Type = Rectangular  Associative = No",
      "Select grip to edit array or [COUnt/Spacing/COLumns/Rows/eXit] <eXit>: COU",
      "Enter the number of columns <4>: 0",
      "Value must be positive and nonzero.",
      "Enter the number of columns <4>: 2.5",
      "Requires a positive nonzero integer or option keyword.",
      "Enter the number of columns <4>: 3",
      "Enter the number of rows <3>: 2",
      "Select grip to edit array or [COUnt/Spacing/COLumns/Rows/eXit] <eXit>: S",
      "Specify the distance between columns or [Unit cell] <60.00>: 100",
      "Specify the distance between rows <1.00>: 50",
      "Select grip to edit array or [COUnt/Spacing/COLumns/Rows/eXit] <eXit>: R",
      "Enter the number of rows <2>:",
      "Specify the distance between rows <50.00>:",
      "Specify the incrementing elevation between rows <0.00>: 5",
      "Select grip to edit array or [COUnt/Spacing/COLumns/Rows/eXit] <eXit>:",
    ])
    expect(cad.entityCount).toBe(6)
    const raised = linesOf(cad.entities()).filter((line) => line.start.y === 50)
    expect(raised.map((line) => line.elevation)).toEqual([5, 5, 5])
  })

  it("asks in the words of Autodesk's Spanish table", () => {
    const cad = createHarness({
      locale: es,
      entities: [lineOf(p(0, 0), p(40, 0), { id: "L1" })],
    })

    cad.select("L1").command("MATRIZRECTANG")
    expect(cad.commandLog().at(-1)).toBe("Tipo = Rectangular  Asociativa = No")
    expect(cad.state().commandLine.prompt).toBe(
      "MATRIZRECTANG Seleccione un pinzamiento para editar la matriz o [COntar/Espaciado/Columnas/Filas/Salir] <Salir>:"
    )
    cad.option("COUnt")
    expect(cad.state().commandLine.prompt).toBe(
      "MATRIZRECTANG Indique el número de columnas <4>:"
    )
    cad.enter().enter().option("Spacing")
    expect(cad.state().commandLine.prompt).toBe(
      "MATRIZRECTANG Especificar la distancia entre columnas o [célula de Unidad] <60.00>:"
    )
    cad.runtime.setCommandLineText("U")
    cad.runtime.submitCommandLine()
    expect(cad.state().commandLine.prompt).toBe(
      "MATRIZRECTANG Precise primer punto de esquina de la celda de unidad:"
    )
    cad.runtime.setCommandLineText("FOO")
    cad.runtime.submitCommandLine()
    expect(cad.commandLog().at(-1)).toBe(
      "Necesita un valor numérico distinto de cero."
    )
    cad.option("Spacing")
    cad.enter().enter().option("COLumns").enter()
    expect(cad.state().commandLine.prompt).toBe(
      "MATRIZRECTANG Especifique la distancia entre columnas <60.00>:"
    )
    cad.enter().option("Rows").enter().enter()
    expect(cad.state().commandLine.prompt).toBe(
      "MATRIZRECTANG Especifique la elevación incremental entre filas <0.00>:"
    )
  })

  it("fills a grid, leaving the source in cell (0, 0)", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(40, 0), { id: "L1" })],
    })

    cad.select("L1").command("ARRAYRECT").option("COLumns")
    cad.type("3").enter().type("100").enter()
    cad.option("Rows").type("2").enter().type("50").enter().enter()
    cad.enter()

    expect(cad.entityCount).toBe(6)
    const starts = linesOf(cad.entities())
      .map((line) => `${line.start.x},${line.start.y}`)
      .sort()
    expect(starts).toEqual(
      ["0,0", "0,50", "100,0", "100,50", "200,0", "200,50"].sort()
    )
  })

  // AutoCAD 2023's console: the cell's sides are the two spacings; a wrong
  // first corner leaves Unit cell, a wrong opposite one is asked again.
  it("spaces columns and rows by a unit cell's two corners", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(10, 0), { id: "L1" })],
    })
    const answer = (text: string) => {
      cad.runtime.setCommandLineText(text)
      cad.runtime.submitCommandLine()
    }

    cad.select("L1").command("ARRAYRECT")
    answer("S")
    answer("U")
    expect(cad.state().commandLine.prompt).toBe(
      "ARRAYRECT Specify first corner point of unit cell:"
    )
    answer("FOO")
    answer("S")
    answer("U")
    answer("")
    answer("S")
    answer("U")
    answer("0,0")
    answer("FOO")
    answer("30,20")
    expect(cad.commandLog().slice(-11)).toEqual([
      "Specify first corner point of unit cell: FOO",
      "Requires numeric nonzero value.",
      "Select grip to edit array or [COUnt/Spacing/COLumns/Rows/eXit] <eXit>: S",
      "Specify the distance between columns or [Unit cell] <15.00>: U",
      "Specify first corner point of unit cell:",
      "Select grip to edit array or [COUnt/Spacing/COLumns/Rows/eXit] <eXit>: S",
      "Specify the distance between columns or [Unit cell] <15.00>: U",
      "Specify first corner point of unit cell: 0,0",
      "Specify opposite corner: FOO",
      "Invalid point.",
      "Specify opposite corner: 30,20",
    ])
    answer("S")
    expect(cad.state().commandLine.prompt).toBe(
      "ARRAYRECT Specify the distance between columns or [Unit cell] <30.00>:"
    )
    cad.escape().select("L1").command("ARRAYRECT")
    answer("S")
    answer("U")
    cad.click(p(0, 0)).click(p(-30, -20))
    cad.enter()
    const starts = linesOf(cad.entities())
      .map((line) => `${line.start.x},${line.start.y}`)
      .sort()
    expect(starts).toContain("-90,-40")
    expect(cad.entityCount).toBe(12)
  })

  // AutoCAD 2023's console (acc/wn28–wn30, wn40, wn41, wn50): a number at
  // the first corner is a square cell's side, at the opposite corner a
  // direct distance from the first towards the cursor.
  it("takes a number at a unit cell's corners", () => {
    for (const [locale, command, spacing, prompt, nonzero] of [
      [
        undefined,
        "ARRAYRECT",
        "S",
        "ARRAYRECT Specify the distance between columns or [Unit cell]",
        "Requires numeric nonzero value.",
      ],
      [
        es,
        "MATRIZRECTANG",
        "E",
        "MATRIZRECTANG Especificar la distancia entre columnas o [célula de Unidad]",
        "Necesita un valor numérico distinto de cero.",
      ],
    ] as const) {
      const cad = createHarness({
        locale,
        entities: [lineOf(p(0, 0), p(10, 0), { id: "L1" })],
      })
      const answer = (...texts: string[]) => {
        for (const text of texts) {
          cad.runtime.setCommandLineText(text)
          cad.runtime.submitCommandLine()
        }
      }
      cad.select("L1").command(command)
      for (const refused of ["FOO", "0", "-5"]) {
        answer(spacing, "U", refused)
        expect(cad.commandLog().at(-1)).toBe(nonzero)
      }
      answer(spacing)
      expect(cad.state().commandLine.prompt).toBe(`${prompt} <15.00>:`)
      answer("U", "5", spacing)
      expect(cad.state().commandLine.prompt).toBe(`${prompt} <5.00>:`)
      answer("U", "1e1", spacing)
      expect(cad.state().commandLine.prompt).toBe(`${prompt} <10.00>:`)
      cad.moveTo(p(289.985, 116.3034))
      answer("U", "100,100", "5", spacing)
      expect(cad.state().commandLine.prompt).toBe(`${prompt} <4.98>:`)
      answer("")
      expect(cad.state().commandLine.prompt).toMatch(/<0[.,]43>:$/)
    }
  })

  it("undoes the whole array in one step", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(40, 0), { id: "L1" })],
    })

    cad.select("L1").command("ARRAYRECT").option("eXit")
    cad.undo()

    expect(cad.entityCount).toBe(1)
  })

  it("cancels without creating anything", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(40, 0), { id: "L1" })],
    })

    cad.select("L1").command("ARRAYRECT").escape()

    expect(cad.entityCount).toBe(1)
  })
})

describe("ARRAYPOLAR", () => {
  it("spreads the items evenly around the centre", () => {
    const cad = createHarness({
      entities: [lineOf(p(100, 0), p(100, 20), { id: "L1" })],
    })

    cad.select("L1").command("ARRAYPOLAR").click(p(0, 0))
    cad.option("Items").type("4").enter().enter()

    expect(cad.entityCount).toBe(4)
    // Rotating items keeps them radial: every start stays 100 from the centre.
    for (const line of linesOf(cad.entities())) {
      expect(Math.hypot(line.start.x, line.start.y)).toBeCloseTo(100, 5)
    }
  })
})

describe("ARRAYPOLAR's questions", () => {
  it("asks AutoCAD's questions over the preview and writes them answered", () => {
    const cad = createHarness({
      entities: [lineOf(p(100, 0), p(100, 20), { id: "L1" })],
    })

    cad.select("L1").command("ARRAYPOLAR")
    expect(cad.state().commandLine.prompt).toBe(
      "ARRAYPOLAR Specify center point of array:"
    )
    cad.click(p(0, 0))
    expect(cad.state().commandLine.prompt).toBe(
      "ARRAYPOLAR Select grip to edit array or [Items/Angle between/Fill angle/ROTate items/eXit] <eXit>:"
    )
    cad.option("Items")
    expect(cad.state().commandLine.prompt).toBe(
      "ARRAYPOLAR Enter number of items in array <6>:"
    )
    cad.type("4").enter().option("Angle between")
    expect(cad.state().commandLine.prompt).toBe(
      "ARRAYPOLAR Specify angle between items <90>:"
    )
    cad.type("30").enter().option("Fill angle")
    expect(cad.state().commandLine.prompt).toBe(
      "ARRAYPOLAR Specify the angle to fill (+=ccw, -=cw) <90>:"
    )
    cad.type("180").enter().option("ROTate items")
    expect(cad.state().commandLine.prompt).toBe(
      "ARRAYPOLAR Rotate arrayed items? [Yes/No] <Yes>:"
    )
    cad.option("No").option("eXit")

    expect(cad.commandLog()).toEqual([
      "ARRAYPOLAR",
      "1 found",
      "Type = Polar  Associative = No",
      "Specify center point of array:",
      "Select grip to edit array or [Items/Angle between/Fill angle/ROTate items/eXit] <eXit>: I",
      "Enter number of items in array <6>: 4",
      "Select grip to edit array or [Items/Angle between/Fill angle/ROTate items/eXit] <eXit>: A",
      "Specify angle between items <90>: 30",
      "Select grip to edit array or [Items/Angle between/Fill angle/ROTate items/eXit] <eXit>: F",
      "Specify the angle to fill (+=ccw, -=cw) <90>: 180",
      "Select grip to edit array or [Items/Angle between/Fill angle/ROTate items/eXit] <eXit>: ROT",
      "Rotate arrayed items? [Yes/No] <Yes>: N",
      "Select grip to edit array or [Items/Angle between/Fill angle/ROTate items/eXit] <eXit>: X",
    ])
    // Four items over 180°, 60° apart, carried round without turning.
    const lines = linesOf(cad.entities())
    expect(lines).toHaveLength(4)
    expect(lines.every((line) => line.end.x === line.start.x)).toBe(true)
  })

  it("asks in the words of Autodesk's Spanish table", () => {
    const cad = createHarness({
      locale: es,
      entities: [lineOf(p(100, 0), p(100, 20), { id: "L1" })],
    })

    cad.select("L1").command("MATRIZPOLAR")
    expect(cad.commandLog().at(-1)).toBe("Tipo = Polar  Asociativa = No")
    expect(cad.state().commandLine.prompt).toBe(
      "MATRIZPOLAR Precise el punto central de la matriz:"
    )
    cad.click(p(0, 0))
    expect(cad.state().commandLine.prompt).toBe(
      "MATRIZPOLAR Seleccione un pinzamiento para editar la matriz o [Elementos/ángUlo entre/ángulo de Relleno/Girar objetos/Salir] <Salir>:"
    )
    cad.option("Items")
    expect(cad.state().commandLine.prompt).toBe(
      "MATRIZPOLAR Indique el número de elementos de la matriz <6>:"
    )
    cad.enter().option("Angle between")
    expect(cad.state().commandLine.prompt).toBe(
      "MATRIZPOLAR Indique el ángulo entre elementos <60>:"
    )
    cad.enter().option("Fill angle")
    expect(cad.state().commandLine.prompt).toBe(
      "MATRIZPOLAR Precise el ángulo que se debe rellenar (+ =antihorario, -=horario) <360>:"
    )
    cad.enter().option("ROTate items")
    expect(cad.state().commandLine.prompt).toBe(
      "MATRIZPOLAR ¿Girar elementos de la matriz? [Sí/No] <Sí>:"
    )
  })
})

describe("STRETCH", () => {
  /** Each answer typed at the command line and confirmed, as the console types it. */
  function typed(cad: CadHarness, ...texts: string[]): CadHarness {
    for (const text of texts) {
      cad.runtime.setCommandLineText(text)
      cad.runtime.submitCommandLine()
    }
    return cad
  }
  const A = () => lineOf(p(0, 0), p(100, 0), { id: "A" })
  const B = () => lineOf(p(0, 50), p(100, 50), { id: "B" })
  const ends = (cad: CadHarness, id: string) => {
    const line = cad.byId<LineEntity>(id)
    return [line.start, line.end]
  }
  /** STRETCH with these answers at `Select objects:`, then 0,0 to 10,5. */
  const stretched = (cad: CadHarness, ...selection: string[]) =>
    typed(cad, "_STRETCH", ...selection, "", "0,0", "10,5")

  // probes transforms/p223 (STRETCH, S, repeated), p224 (ESTIRA, EI).
  it.each([
    ["en", undefined, "STRETCH", "S"],
    ["es", es, "ESTIRA", "EI"],
  ] as const)(
    "runs by its name, alias and Enter (%s)",
    (_, locale, name, alias) => {
      const cad = createHarness({ locale, entities: [A()] })
      const by = (x: number) => [
        "_C",
        `${x},-10`,
        `${x + 20},10`,
        "",
        "0,0",
        "10,0",
      ]
      typed(cad, name, ...by(90), alias, ...by(100), "", ...by(110))
      expect(cad.byId<LineEntity>("A").end).toBeCloseToPoint(p(130, 0))
    }
  )

  // probes transforms/p262 (a pick), p263 (W), p267 (Fence), p269 (WP):
  // each moves its objects whole.
  it.each([
    ["a pick", ["50,0"]],
    ["W", ["_W", "-10,-10", "110,10"]],
    ["Fence", ["_F", "50,-10", "50,10", ""]],
    ["WP", ["_WP", "-10,-10", "110,-10", "110,10", "-10,10", ""]],
  ])("moves what %s takes whole", (_, selection) => {
    const cad = stretched(createHarness({ entities: [A(), B()] }), ...selection)
    expect(ends(cad, "A")).toBeCloseToPoints([p(10, 5), p(110, 5)])
    expect(ends(cad, "B")).toBeCloseToPoints([p(0, 50), p(100, 50)])
  })

  // probe transforms/p264: two crossing windows on two lines stretch each by
  // its own; p266: a pick and a window over another.
  it("stretches each object by the window that found it", () => {
    const two = stretched(
      createHarness({ entities: [A(), B()] }),
      ...["_C", "90,-10", "110,10", "_C", "-10,40", "10,60"]
    )
    expect(ends(two, "A")).toBeCloseToPoints([p(0, 0), p(110, 5)])
    expect(ends(two, "B")).toBeCloseToPoints([p(10, 55), p(100, 50)])

    const mixed = stretched(
      createHarness({ entities: [A(), B()] }),
      ...["50,0", "_C", "90,40", "110,60"]
    )
    expect(ends(mixed, "A")).toBeCloseToPoints([p(10, 5), p(110, 5)])
    expect(ends(mixed, "B")).toBeCloseToPoints([p(0, 50), p(110, 55)])
  })

  // probes transforms/p265 (a window, then another over the other end),
  // p279 (a window, then a pick): `1 found (1 duplicate)`, and the object
  // stretches as it was first added.
  it.each([
    [
      ["_C", "-10,-10", "10,10", "_C", "90,-10", "110,10"],
      [p(10, 5), p(100, 0)],
    ],
    [
      ["_C", "90,-10", "110,10", "50,0"],
      [p(0, 0), p(110, 5)],
    ],
  ])("keeps how an object was first added (%s)", (selection, after) => {
    const cad = stretched(createHarness({ entities: [A()] }), ...selection)
    expect(cad.commandLog().join("\n")).toContain(
      "1 found (1 duplicate), 1 total"
    )
    expect(ends(cad, "A")).toBeCloseToPoints(after)
  })

  // probe transforms/p268: Last and ALL find their objects, and STRETCH
  // neither stretches nor moves them.
  it.each([["_L"], ["_ALL"]])("stretches nothing %s finds", (mode) => {
    const cad = stretched(createHarness({ entities: [A(), B()] }), mode)
    expect(ends(cad, "A")).toBeCloseToPoints([p(0, 0), p(100, 0)])
    expect(ends(cad, "B")).toBeCloseToPoints([p(0, 50), p(100, 50)])
  })

  // probe transforms/p270: Remove takes an object out of the window's set.
  it("leaves what Remove takes out", () => {
    const cad = stretched(
      createHarness({ entities: [A(), B()] }),
      ...["_C", "90,-10", "110,60", "_R", "50,50"]
    )
    expect(ends(cad, "A")).toBeCloseToPoints([p(0, 0), p(110, 5)])
    expect(ends(cad, "B")).toBeCloseToPoints([p(0, 50), p(100, 50)])
  })

  // probe transforms/p271, a window over x 90..110: the arc's caught start
  // moves and its end stays, the chord height (14.645) kept on its side; an
  // arc with only its centre caught stays; a circle moves by its centre; a
  // polyline's arc segment with one end moved keeps its height too (bulge 1
  // → 0.908153).
  it("refits an arc and an arc segment caught at one end, their chord height kept", () => {
    const cad = stretched(
      createHarness({
        entities: [
          arcOf(p(50, 100), 50, 0, Math.PI / 2, { id: "ARC1" }),
          arcOf(p(100, 200), 30, 0, Math.PI, { id: "ARC2" }),
          circleOf(p(80, 260), 20, { id: "C1" }),
          circleOf(p(100, 320), 30, { id: "C2" }),
          polylineOf([p(0, 380), p(100, 380)], { id: "P3", bulges: [1, 0] }),
          polylineOf([p(0, 20), p(100, 20), p(100, 40), p(0, 40)], {
            id: "P1",
          }),
        ],
      }),
      ...["_C", "90,-10", "110,400"]
    )
    const arc = cad.byId<ArcEntity>("ARC1")
    expect(arc.center).toBeCloseToPoint(p(55.585971, 94.947962), 6)
    expect(arc.radius).toBeCloseTo(55.334709, 6)
    const start = (a: ArcEntity) =>
      p(
        a.center.x + a.radius * Math.cos(a.startAngle),
        a.center.y + a.radius * Math.sin(a.startAngle)
      )
    const end = (a: ArcEntity) =>
      p(
        a.center.x + a.radius * Math.cos(a.endAngle),
        a.center.y + a.radius * Math.sin(a.endAngle)
      )
    expect(start(arc)).toBeCloseToPoint(p(110, 105), 9)
    expect(end(arc)).toBeCloseToPoint(p(50, 150), 9)
    expect(cad.byId<ArcEntity>("ARC2").center).toBeCloseToPoint(p(100, 200))
    expect(cad.byId<CircleEntity>("C1").center).toBeCloseToPoint(p(80, 260))
    expect(cad.byId<CircleEntity>("C2").center).toBeCloseToPoint(p(110, 325))
    expect(cad.byId<PolylineEntity>("P3").bulges?.[0]).toBeCloseTo(0.908153, 6)
    expect(cad.byId<PolylineEntity>("P1").vertices).toBeCloseToPoints([
      p(0, 20),
      p(110, 25),
      p(110, 45),
      p(0, 40),
    ])
  })

  // probe transforms/p281: bulge -1 with its end 100,0 → 110,5 becomes
  // -0.908153 (the chord height 50 kept); both ends caught, it moves whole.
  it("keeps a clockwise arc segment's chord height, and its bulge when both ends move", () => {
    const poly = () =>
      polylineOf([p(0, 0), p(100, 0)], { id: "P", bulges: [-1, 0] })
    const one = stretched(
      createHarness({ entities: [poly()] }),
      ...["_C", "90,-10", "110,10"]
    )
    expect(one.byId<PolylineEntity>("P").bulges?.[0]).toBeCloseTo(-0.908153, 6)
    const both = stretched(
      createHarness({ entities: [poly()] }),
      ...["_C", "-10,-10", "110,10"]
    )
    expect(both.byId<PolylineEntity>("P").bulges?.[0]).toBe(-1)
  })

  // probes transforms/p273 (the second origin caught: the line stays at 320)
  // and p274 (the dimension line's own point, at 100,320, caught too: DXF 10
  // goes to 110,325, the line with it).
  it.each([
    ["90,290", "110,310", 320],
    ["90,290", "110,330", 325],
  ])("stretches a dimension's line by its own point (%s to %s)", (a, b, y) => {
    const cad = stretched(
      createHarness({
        entities: [
          createDimension("linear", p(0, 300), p(100, 300), p(50, 320), {
            id: "D",
          }),
        ],
      }),
      ...["_C", a, b]
    )
    const dimension = cad.byId<DimensionEntity>("D")
    expect(dimension.first).toBeCloseToPoint(p(0, 300))
    expect(dimension.second).toBeCloseToPoint(p(110, 305))
    expect(dimension.linePoint.y).toBeCloseTo(y, 9)
    expect(dimensionMeasurement(dimension)).toBeCloseTo(110, 9)
  })

  // probe transforms/p272: text, MTEXT and a block reference move whole with
  // their insertion point, and stay without it.
  it("moves text, MTEXT and a reference by their insertion point", () => {
    const bar = createBlockDefinition("B1", p(0, 0), [
      lineOf(p(0, 0), p(20, 0)),
    ])
    const cad = stretched(
      createHarness({
        blocks: [bar],
        entities: [
          createText(p(100, 0), "Hola", { id: "T1", height: 5 }),
          createText(p(75, 20), "HolaHolaHola", { id: "T2", height: 5 }),
          createMText(p(100, 50), "Hola", { id: "M1", height: 2.5, width: 30 }),
          createMText(p(70, 80), "Hola", { id: "M2", height: 2.5, width: 35 }),
          createInsert(bar.id, p(100, 150), { id: "I1" }),
          createInsert(bar.id, p(80, 180), { id: "I2" }),
        ],
      }),
      ...["_C", "90,-10", "110,240"]
    )
    const at = (id: string) =>
      (cad.byId(id) as TextEntity | MTextEntity | InsertEntity).position
    expect(at("T1")).toBeCloseToPoint(p(110, 5))
    expect(at("T2")).toBeCloseToPoint(p(75, 20))
    expect(at("M1")).toBeCloseToPoint(p(110, 55))
    expect(at("M2")).toBeCloseToPoint(p(70, 80))
    expect(at("I1")).toBeCloseToPoint(p(110, 155))
    expect(at("I2")).toBeCloseToPoint(p(80, 180))
  })

  // probe transforms/p278: a fit spline's and a CV spline's caught point
  // moves, the others stay.
  it("moves a spline's caught fit point or control vertex", () => {
    const cad = stretched(
      createHarness({
        entities: [
          createSpline("fit", [p(0, 200), p(50, 250), p(100, 200)], {
            id: "SF",
          }),
          createSpline("cv", [p(0, 300), p(50, 350), p(100, 300)], {
            id: "SC",
            degree: 2,
          }),
        ],
      }),
      ...["_C", "90,190", "110,310"]
    )
    expect(cad.byId<SplineEntity>("SF").points).toBeCloseToPoints([
      p(0, 200),
      p(50, 250),
      p(110, 205),
    ])
    expect(cad.byId<SplineEntity>("SC").points).toBeCloseToPoints([
      p(0, 300),
      p(50, 350),
      p(110, 305),
    ])
  })

  // probes transforms/p252 (the second point on the base), p253 (a
  // Displacement of 0,0,0; Enter twice): nothing changes, and the run is
  // still the step U names (MOVE-D3).
  it.each([
    ["the second point on the base", ["3,4", "3,4"]],
    ["a Displacement of 0,0,0", ["_D", "0,0,0"]],
    ["Enter twice", ["", ""]],
  ])("changes nothing by %s, a step U names", (_, answers) => {
    const cad = createHarness({ entities: [A(), B()] })
    typed(cad, "_STRETCH", "_C", "90,40", "110,60", "", ...answers)
    expect(ends(cad, "B")).toBeCloseToPoints([p(0, 50), p(100, 50)])
    typed(cad, "_U")
    expect(cad.commandLog().at(-1)).toBe("STRETCH")
    expect(cad.entityCount).toBe(2)
  })

  // probe transforms/p271: a line's caught end follows, the other stays.
  it("drags only the vertices caught by the crossing box", () => {
    const cad = createHarness({ entities: [HORIZONTAL] })

    cad
      .command("STRETCH")
      .drag(p(250, 50), p(150, -50)) // right→left crossing over the far end
      .enter()
      .click(p(200, 0))
      .click(p(300, 0))

    const line = cad.byId<LineEntity>("L1")
    expect(line.start).toBeCloseToPoint(p(0, 0))
    expect(line.end).toBeCloseToPoint(p(300, 0))
  })

  // probe transforms/p271: a polyline's caught vertices follow.
  it("bends a polyline instead of moving it whole", () => {
    const cad = createHarness({
      entities: [polylineOf([p(0, 0), p(200, 0), p(200, 200)], { id: "P1" })],
    })

    cad
      .command("STRETCH")
      .drag(p(250, 250), p(150, 150))
      .enter()
      .click(p(200, 200))
      .click(p(320, 200))

    const poly = cad.byId<PolylineEntity>("P1")
    expect(poly.vertices).toBeCloseToPoints([p(0, 0), p(200, 0), p(320, 200)])
  })

  // probe transforms/p289 runs STRETCH noun-verb, its geometry unprobed:
  // moved whole, **unverified**.
  it("moves a pre-selected object whole, since it has no frame", () => {
    const cad = createHarness({ entities: [HORIZONTAL] })

    cad.select("L1").command("STRETCH").click(p(0, 0)).click(p(0, 50))

    const line = cad.byId<LineEntity>("L1")
    expect(line.start).toBeCloseToPoint(p(0, 50))
    expect(line.end).toBeCloseToPoint(p(200, 50))
  })
})

describe("an ellipse transformed", () => {
  function typed(...texts: string[]) {
    const cad = createHarness()
    for (const text of ["ZOOM", "W", "-200,-200", "200,200", ...texts]) {
      cad.runtime.setCommandLineText(text)
      cad.runtime.submitCommandLine()
    }
    return cad
  }
  /** The 10°→100° arc of probes ellipse/p320–p324, its axis at 30°. */
  const A30 = ["ELLIPSE", "A", "C", "0,0", "@50<30", "25", "10", "100"]
  const only = (cad: ReturnType<typeof createHarness>) =>
    cad.entities().find((e): e is EllipseEntity => e.type === "ellipse")!

  // probe ellipse/p322: about 10,10 by 45°, the parameters kept.
  it("rotates an elliptical arc, its parameters kept", () => {
    const arc = only(typed(...A30, "ROTATE", "L", "", "10,10", "45"))
    expect(arc.center).toBeCloseToPoint(p(10, -4.142135623730951), 9)
    expect(arc.majorAxis).toBeCloseToPoint(
      p(12.94095225512605, 48.29629131445343),
      9
    )
    expect(arc.startParam).toBeCloseTo(0.339037, 6)
    expect(arc.endParam).toBeCloseTo(1.658732, 6)
  })

  // probe ellipse/p323: about 10,10 by 2, the parameters kept.
  it("scales an elliptical arc, its parameters kept", () => {
    const arc = only(typed(...A30, "SCALE", "L", "", "10,10", "2"))
    expect(arc.center).toBeCloseToPoint(p(-10, -10), 9)
    expect(arc.majorAxis).toBeCloseToPoint(p(86.60254037844388, 50), 9)
    expect(arc.ratio).toBeCloseTo(0.5, 12)
    expect(arc.startParam).toBeCloseTo(0.339037, 6)
    expect(arc.endParam).toBeCloseTo(1.658732, 6)
  })

  // probes ellipse/p326, p331: STRETCH moves a whole ellipse with its centre
  // and leaves it for a quadrant alone. An elliptical arc's caught end is
  // not stretched here (p324, p332, p333, p336–p338: modify.md, Missing).
  it.each([
    [["ELLIPSE", "C", "0,0", "50,0", "25"], ["45,-5", "55,5"], p(0, 0)],
    [["ELLIPSE", "C", "0,0", "5,0", "2.5"], ["-1,-1", "4.8,1"], p(10, 5)],
  ])("stretches a whole ellipse by its centre only (%s)", (draw, box, at) => {
    const cad = typed(...draw, "STRETCH", "C", ...box, "", "0,0", "10,5")
    expect(only(cad).center).toBeCloseToPoint(at, 9)
    expect(isFullEllipse(only(cad))).toBe(true)
  })
})

describe("EXPLODE", () => {
  const rectangle = polylineOf([p(0, 0), p(200, 0), p(200, 120), p(0, 120)], {
    id: "P1",
    closed: true,
  })

  it("EXPLODE turns a closed polyline into its four segments", () => {
    const cad = createHarness({ entities: [rectangle] })

    cad.select("P1").command("EXPLODE")

    expect(cad.entityCount).toBe(4)
    expect(cad.typeCounts()).toEqual({ line: 4 })
    // The closing segment becomes a line too.
    const closing = linesOf(cad.entities()).find(
      (line) =>
        Math.abs(line.start.x) < 1e-9 && Math.abs(line.start.y - 120) < 1e-9
    )
    expect(closing?.end).toBeCloseToPoint(p(0, 0))
  })

  it("EXPLODE emits an arc for a bulged segment", () => {
    const cad = createHarness({
      entities: [
        polylineOf([p(0, 0), p(100, 0), p(100, 100)], {
          id: "P1",
          bulges: [0, 1],
        }),
      ],
    })

    cad.select("P1").command("EXPLODE")

    expect(cad.typeCounts()).toEqual({ line: 1, arc: 1 })
    const arc = cad.only<ArcEntity>("arc")
    expect(arc.center).toBeCloseToPoint(p(100, 50))
    expect(arc.radius).toBeCloseTo(50)
  })

  it("previews the object under the cursor while selecting", () => {
    const cad = createHarness({ entities: [rectangle] })
    const previews = () =>
      cad
        .scene()
        .primitives.filter(
          (primitive) =>
            "stroke" in primitive &&
            primitive.stroke?.color === THEME.entityHover
        )

    cad.command("EXPLODE").moveTo(p(1000, 1000))
    expect(previews()).toHaveLength(0)

    cad.moveTo(p(100, 0))
    expect(previews()).toHaveLength(1)

    cad.moveTo(p(1000, 1000))
    expect(previews()).toHaveLength(0)
  })

  // probes spline/p324 (two splines: no count, each named once the set is
  // done) and p319 (a line beside it: the line counted, the spline named).
  it.each([
    [undefined, "1 was not able to be exploded.", "Cannot explode SPLINE"],
    [es, "1 no se ha podido descomponer.", "No se puede descomponer SPLINE"],
  ] as const)(
    "EXPLODE names each spline it cannot explode (%#)",
    (locale, counted, named) => {
      const fit = createSpline("fit", [p(0, 5), p(10, 10), p(20, 5)], {
        id: "S1",
      })
      const cv = createSpline(
        "cv",
        [p(0, 20), p(10, 30), p(20, 20), p(30, 30)],
        { id: "S2" }
      )
      const splines = createHarness({ locale, entities: [fit, cv] })
      splines.select("S1", "S2").command("_EXPLODE")
      const log = splines.commandLog()
      expect(log.filter((line) => line === named)).toHaveLength(2)
      expect(log.some((line) => /not able|no se ha/.test(line))).toBe(false)
      expect(splines.typeCounts()).toEqual({ spline: 2 })

      const mixed = createHarness({
        locale,
        entities: [lineOf(p(0, 0), p(10, 0), { id: "L1" }), fit],
      })
      mixed.select("L1", "S1").command("_EXPLODE")
      const lines = mixed.commandLog()
      const at = lines.indexOf(counted)
      expect(at).toBeGreaterThanOrEqual(0)
      expect(lines.slice(at + 1)).toEqual([named])
      expect(mixed.typeCounts()).toEqual({ line: 1, spline: 1 })
    }
  )
})

/**
 * EXPLODE's refusal, said under each selection's count inside `Select
 * objects:` (AutoCAD 2027's console, erase/p213–p219, p241, p242): a line A,
 * a polyline P and a circle C away from them.
 */
describe("EXPLODE's Select objects", () => {
  const explodable = () => [
    lineOf(p(0, 0), p(100, 0), { id: "A" }),
    polylineOf([p(0, 100), p(100, 100), p(100, 150)], { id: "P" }),
    circleOf(p(250, 250), 10, { id: "C" }),
  ]
  const typed = (cad: ReturnType<typeof createHarness>, ...texts: string[]) => {
    for (const text of texts) {
      cad.runtime.setCommandLineText(text)
      cad.runtime.submitCommandLine()
    }
    return cad
  }

  it("says what it cannot explode under each pick's count, kept out of the set (p213)", () => {
    const cad = createHarness({ entities: explodable() })
    typed(cad.command("EXPLODE"), "50,0", "50,100", "50,0")
    cad.enter()

    expect(cad.commandLog().slice(1)).toEqual([
      "Select objects: 50,0",
      "1 found",
      "1 was not able to be exploded.",
      "Select objects: 50,100",
      "1 found, 1 total",
      "Select objects: 50,0",
      "1 found, 1 total",
      "1 was not able to be exploded.",
      "Select objects:",
    ])
    expect(cad.typeCounts()).toEqual({ line: 3, circle: 1 })
  })

  it("says it under a window's count (p214)", () => {
    const cad = createHarness({ entities: explodable() })
    typed(cad.command("EXPLODE"), "W", "-10,-10", "110,160")

    expect(cad.commandLog().slice(-2)).toEqual([
      "2 found",
      "1 was not able to be exploded.",
    ])
  })

  it("says nothing at Remove objects, and None found. for the set Enter closes empty (p215)", () => {
    const cad = createHarness({ entities: explodable() })
    typed(cad.command("EXPLODE"), "ALL", "R", "50,0", "50,100")
    cad.enter()

    expect(cad.commandLog().slice(1)).toEqual([
      "Select objects: ALL",
      "3 found",
      "2 were not able to be exploded.",
      "Select objects: R",
      "Remove objects: 50,0",
      "1 found, 1 total",
      "Remove objects: 50,100",
      "1 found, 1 removed, 0 total",
      "Remove objects:",
      "None found.",
    ])
    expect(cad.activeToolId()).toBe("select")
  })

  it("says None found. for an empty set, after everything was refused too (p205, p216)", () => {
    const cad = createHarness({ entities: explodable() })
    cad.command("EXPLODE").enter()
    expect(cad.commandLog()).toEqual([
      "EXPLODE",
      "Select objects:",
      "None found.",
    ])

    typed(cad.command("EXPLODE"), "50,0")
    cad.enter()
    expect(cad.commandLog().slice(-2)).toEqual([
      "Select objects:",
      "None found.",
    ])
    expect(cad.typeCounts()).toEqual({ line: 1, polyline: 1, circle: 1 })
  })

  it("says the locked layer's line before its own (p219)", () => {
    const cad = createHarness()
    cad.runtime.document.load(
      [
        lineOf(p(0, 0), p(100, 0), { id: "A" }),
        polylineOf([p(0, 100), p(100, 100), p(100, 150)], {
          id: "P",
          layerId: "locked",
        }),
        lineOf(p(0, 50), p(100, 50), { id: "LK", layerId: "locked" }),
      ],
      { layers: [layerOf("0"), layerOf("locked", { locked: true })] }
    )
    typed(cad.command("EXPLODE"), "ALL")
    cad.enter()

    expect(cad.commandLog().slice(1)).toEqual([
      "Select objects: ALL",
      "3 found",
      "2 were on a locked layer.",
      "1 was not able to be exploded.",
      "Select objects:",
      "None found.",
    ])
  })

  it("explodes a preselection at once when it can explode one of it (p217)", () => {
    const cad = createHarness({ entities: explodable() })
    cad.select("A", "P", "C").command("EXPLODE")

    expect(cad.commandLog()).toEqual([
      "EXPLODE",
      "3 found",
      "2 were not able to be exploded.",
    ])
    expect(cad.typeCounts()).toEqual({ line: 3, circle: 1 })
  })

  it("asks again for a preselection it cannot explode, closing at the first selection that adds to the set (p241, p242)", () => {
    const cad = createHarness({ entities: explodable() })
    cad.select("A").command("EXPLODE")
    expect(cad.commandLog()).toEqual([
      "EXPLODE",
      "1 found",
      "1 was not able to be exploded.",
    ])
    expect(cad.state().commandLine.prompt).toBe("EXPLODE Select objects:")

    typed(cad, "50,0", "50,100")
    expect(cad.commandLog().slice(3)).toEqual([
      "Select objects: 50,0",
      "1 found, 0 total",
      "1 was not able to be exploded.",
      "Select objects: 50,100",
      "1 found, 1 total",
    ])
    expect(cad.typeCounts()).toEqual({ line: 3, circle: 1 })
    expect(cad.activeToolId()).toBe("select")

    const window = createHarness({ entities: explodable() })
    window.select("A").command("EXPLODE")
    typed(window, "W", "-10,-10", "110,160")
    expect(window.commandLog().slice(-2)).toEqual([
      "2 found, 1 total",
      "1 was not able to be exploded.",
    ])
    expect(window.typeCounts()).toEqual({ line: 3, circle: 1 })
  })

  it("is said in Autodesk's Spanish (p216)", () => {
    const cad = createHarness({ locale: es, entities: explodable() })
    typed(cad.command("DESCOMP"), "50,0")
    cad.enter()

    expect(cad.commandLog().slice(1)).toEqual([
      "Designe objetos: 50,0",
      "1 encontrados",
      "1 no se ha podido descomponer.",
      "Designe objetos:",
      "No hallada.",
    ])
  })
})
