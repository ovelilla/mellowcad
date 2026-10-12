import { describe, expect, it } from "vitest"
import type {
  ArcEntity,
  CircleEntity,
  Entity,
  LineEntity,
  PolylineEntity,
} from "../../domain/entities"
import { createHarness } from "../../../test/harness"
import { THEME } from "../../scene/theme"
import { es } from "../../locales/es"
import {
  arcOf,
  circleOf,
  deg,
  lineOf,
  p,
  polylineOf,
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

describe("MOVE", () => {
  it("writes what each pick at Select objects found", () => {
    const cad = createHarness({
      entities: [HORIZONTAL, lineOf(p(0, 50), p(200, 50), { id: "L2" })],
    })

    cad.command("MOVE").click(p(100, 0)).click(p(100, 0))
    cad.mouseDown(p(-10, -10)).moveTo(p(210, 60)).mouseUp(p(210, 60))
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

    expect(cad.commandLog()).toEqual(["MOVE 1 found"])
  })

  it("moves by a Displacement typed, or Enter's last one", () => {
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
      "MOVE 1 found",
      "Specify base point or [Displacement] <Displacement>:",
      "Specify displacement <10.00, 5.00, 0.00>:",
    ])
  })

  it("ends at an empty Select objects on Space, as on Enter", () => {
    const cad = createHarness({ entities: [HORIZONTAL] })

    cad.command("MOVE").press(" ")

    expect(cad.activeToolId()).toBe("select")
    expect(cad.commandLog()).toEqual(["MOVE", "Select objects:"])
  })

  it("displaces the pre-selected objects and keeps their ids", () => {
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

  it("leaves the drawing untouched when cancelled", () => {
    const cad = createHarness({ entities: [HORIZONTAL] })

    cad.select("L1").command("MOVE").click(p(0, 0)).moveTo(p(80, 80)).escape()

    expect(cad.byId<LineEntity>("L1").start).toBeCloseToPoint(p(0, 0))
    expect(cad.activeToolId()).toBe("select")
  })
})

describe("COPY", () => {
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
      "COPY 1 found",
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

  it("gives each copy a fresh id, and one U undoes the whole COPY", () => {
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
})

describe("ROTATE", () => {
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

  it("asks the reference and the new angle, which offers no Copy", () => {
    const cad = createHarness({ entities: [HORIZONTAL] })

    cad.select("L1").command("ROTATE").click(p(0, 0)).option("Reference")
    expect(cad.state().commandLine.prompt).toBe(
      "ROTATE Specify the reference angle <0>:"
    )
    cad.click(p(0, 0))
    expect(cad.state().commandLine.prompt).toBe("ROTATE Specify second point:")
    cad.click(p(100, 0))
    expect(cad.state().commandLine.prompt).toBe("ROTATE Specify the new angle:")
    expect(cad.optionIds()).toEqual([])
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
})

describe("SCALE", () => {
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

  // AutoCAD 2023's console: Points measures the new length by two points of
  // its own, and both lengths are the next Reference's defaults.
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

  it("refuses a non-positive factor", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })

    cad.select("L1").command("SCALE").click(p(0, 0)).type("-2").enter()

    expect(cad.byId<LineEntity>("L1").end).toBeCloseToPoint(p(100, 0))
  })
})

describe("MIRROR", () => {
  it("asks the mirror line, then whether to erase the source, No kept", () => {
    const cad = createHarness({ entities: [HORIZONTAL] })

    cad.select("L1").command("MIRROR").click(p(0, 10)).click(p(100, 10))
    expect(cad.state().commandLine.prompt).toBe(
      "MIRROR Erase source objects? [Yes/No] <No>:"
    )
    cad.enter()

    expect(cad.commandLog()).toEqual([
      "MIRROR 1 found",
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

  it("cancels without committing anything", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 50), { id: "L1" })],
    })

    cad.select("L1").command("MIRROR").click(p(0, 0)).click(p(100, 0)).escape()

    expect(cad.entityCount).toBe(1)
    expect(cad.byId<LineEntity>("L1").end).toBeCloseToPoint(p(100, 50))
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
      "ARRAYPOLAR 1 found",
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

  it("moves a pre-selected object whole, since it has no frame", () => {
    const cad = createHarness({ entities: [HORIZONTAL] })

    cad.select("L1").command("STRETCH").click(p(0, 0)).click(p(0, 50))

    const line = cad.byId<LineEntity>("L1")
    expect(line.start).toBeCloseToPoint(p(0, 50))
    expect(line.end).toBeCloseToPoint(p(200, 50))
  })
})

describe("EXPLODE and JOIN", () => {
  it("asks JOIN's source or several objects, then the objects to join", () => {
    const cad = createHarness({
      entities: [
        lineOf(p(0, 0), p(50, 0), { id: "A" }),
        lineOf(p(50, 0), p(100, 0), { id: "B" }),
      ],
    })

    cad.command("JOIN")
    expect(cad.state().commandLine.prompt).toBe(
      "JOIN Select source object or multiple objects to join at once:"
    )
    cad.click(p(25, 0))
    expect(cad.state().commandLine.prompt).toBe("JOIN Select objects to join:")
    cad.click(p(75, 0)).enter()

    expect(cad.commandLog().slice(0, 4)).toEqual([
      "JOIN",
      "Select source object or multiple objects to join at once: 1 found",
      "Select objects to join: 1 found, 2 total",
      "Select objects to join:",
    ])
    expect(cad.entityCount).toBe(1)
  })

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

  it("JOIN rebuilds the polyline from the exploded segments", () => {
    const cad = createHarness({ entities: [rectangle] })

    cad.select("P1").command("EXPLODE")
    cad.selectAll().command("JOIN")

    const poly = cad.only<PolylineEntity>("polyline")
    expect(poly.closed).toBe(true)
    expect(poly.vertices).toBeCloseToPoints([
      p(0, 0),
      p(200, 0),
      p(200, 120),
      p(0, 120),
    ])
  })

  it("each is a single undo step", () => {
    const cad = createHarness({ entities: [rectangle] })

    cad.select("P1").command("EXPLODE")
    cad.selectAll().command("JOIN")
    expect(cad.entityCount).toBe(1)

    cad.undo()
    expect(cad.entityCount).toBe(4)
    cad.undo()
    expect(cad.entityCount).toBe(1)
    expect(cad.only<PolylineEntity>("polyline").closed).toBe(true)
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

  it("JOIN keeps an arc's curvature as a bulge", () => {
    const cad = createHarness({
      entities: [
        lineOf(p(0, 0), p(100, 0), { id: "L1" }),
        arcOf(p(0, 0), 100, 0, deg(90), { id: "A1" }),
      ],
    })

    cad.selectAll().command("JOIN")

    const poly = cad.only<PolylineEntity>("polyline")
    expect(poly.vertices).toBeCloseToPoints([p(0, 0), p(100, 0), p(0, 100)], 5)
    // A 90° arc is tan(90°/4) = tan(22.5°).
    expect(poly.bulges?.[1]).toBeCloseTo(Math.tan(deg(22.5)), 6)
  })

  it("JOIN leaves unrelated objects alone", () => {
    const cad = createHarness({
      entities: [
        lineOf(p(0, 0), p(100, 0), { id: "L1" }),
        lineOf(p(500, 500), p(600, 500), { id: "L2" }),
      ],
    })

    cad.selectAll().command("JOIN")

    expect(cad.entityCount).toBe(2)
    expect(cad.typeCounts()).toEqual({ line: 2 })
  })

  it("the pieces and the joined polyline keep colour, plane and thickness", () => {
    const raised: PolylineEntity = {
      ...rectangle,
      color: "#ff0000",
      elevation: 12,
      thickness: 3,
    }
    const cad = createHarness({ entities: [raised] })

    cad.select("P1").command("EXPLODE")
    for (const piece of linesOf(cad.entities())) {
      expect(piece).toMatchObject({
        color: "#ff0000",
        elevation: 12,
        thickness: 3,
      })
    }

    cad.selectAll().command("JOIN")
    expect(cad.only<PolylineEntity>("polyline")).toMatchObject({
      color: "#ff0000",
      elevation: 12,
      thickness: 3,
    })
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

  it("EXPLODE says so when an object cannot be exploded", () => {
    const cad = createHarness({
      entities: [rectangle, lineOf(p(-500, 0), p(-400, 0), { id: "L1" })],
    })

    cad.select("L1").command("EXPLODE")

    expect(cad.commandLog()).toContain("1 was not able to be exploded.")
    expect(cad.entityCount).toBe(2) // the line is left alone

    cad.select("P1", "L1").command("EXPLODE")

    expect(cad.commandLog()).toContain("1 was not able to be exploded.")
    expect(cad.typeCounts()).toEqual({ line: 5 }) // 4 segments + the untouched line
  })
})
