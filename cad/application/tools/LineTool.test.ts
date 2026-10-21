import { describe, expect, it, onTestFinished, vi } from "vitest"
import { type LineEntity, lineEndZ, lineStartZ } from "../../domain/entities"
import { COLOR_BYLAYER } from "../../domain/colors"
import { type CadHarness, createHarness } from "../../../test/harness"
import { arcOf, circleOf, deg, lineOf, p } from "../../../test/builders"
import { SnapType } from "../snapping/types"

/**
 * LINE end-to-end, driven exactly as a user drives it: start the command, move
 * the pointer, click, type into dynamic input, press keywords. Nothing is
 * stubbed — the real snapping, constraint, dynamic-input and command pipelines
 * run, so these tests fail if any of them regresses, not just the tool.
 */

function lines(entities: readonly { type: string }[]): LineEntity[] {
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

/** What answering `texts` writes to the history. */
function written(cad: CadHarness, ...texts: string[]): string[] {
  const from = cad.commandLog().length
  answer(cad, ...texts)
  return cad.commandLog().slice(from)
}

/** A line's ends as numbers, Z included: x, y, z of the start, then the end. */
function ends(line: LineEntity): number[] {
  const { start, end } = line
  return [start.x, start.y, lineStartZ(line), end.x, end.y, lineEndZ(line)]
}

function expectEnds(cad: CadHarness, want: readonly number[][]): void {
  const got = lines(cad.entities()).map(ends)
  expect(got).toHaveLength(want.length)
  got.forEach((row, i) => {
    row.forEach((value, j) => expect(value).toBeCloseTo(want[i][j], 9))
  })
}

describe("LINE", () => {
  it("draws a segment between two picked points", () => {
    const cad = createHarness()

    cad.command("LINE").click(p(0, 0)).click(p(100, 0)).escape()

    const line = cad.only<LineEntity>("line")
    expect(line.start).toBeCloseToPoint(p(0, 0))
    expect(line.end).toBeCloseToPoint(p(100, 0))
  })

  it("chains segments that share their endpoints", () => {
    const cad = createHarness()

    cad
      .command("LINE")
      .click(p(0, 0))
      .click(p(100, 0))
      .click(p(100, 100))
      .escape()

    const drawn = lines(cad.entities())
    expect(drawn).toHaveLength(2)
    expect(drawn[0].end).toBeCloseToPoint(drawn[1].start)
    expect(drawn[1].end).toBeCloseToPoint(p(100, 100))
  })

  it("returns to the neutral Select tool on Escape, keeping what was drawn", () => {
    const cad = createHarness()

    cad.command("LINE").click(p(0, 0)).click(p(100, 0)).escape()

    expect(cad.activeToolId()).toBe("select")
    expect(cad.entityCount).toBe(1)
  })

  it("skips a second pick on the point before, as a double click draws nothing", () => {
    // desktop line/d17: a double click on one point leaves one segment and no
    // zero-length line; a zero length typed is drawn (line/p09, p14).
    const cad = createHarness()

    cad.command("LINE").click(p(50, 50)).click(p(50, 50)).escape()

    expect(cad.entityCount).toBe(0)
  })

  describe("a zero-length segment typed", () => {
    it("is drawn from `0` at the next point, said, and counted", () => {
      // probe line/p09
      const cad = answer(createHarness(), "LINE", "0,0")

      expect(written(cad, "0")).toEqual([
        "Specify next point or [Undo]: 0",
        "Zero length line created at (0.00, 0.00, 0.00)",
      ])
      expect(lines(cad.entities())).toHaveLength(1)
      // probe line/p08: it is a segment, so the next one offers Close.
      answer(cad, "@10,0")
      expect(cad.state().commandLine.prompt).toBe(
        "LINE Specify next point or [Close/Undo]:"
      )
    })

    it("is drawn from `@` at the next point, said where it lies", () => {
      // probe line/p14
      const cad = answer(createHarness(), "LINE", "5,5")

      expect(written(cad, "@")).toEqual([
        "Specify next point or [Undo]: @",
        "Zero length line created at (5.00, 5.00, 0.00)",
      ])
      expectEnds(cad, [[5, 5, 0, 5, 5, 0]])
    })

    it("is drawn from `0` at Continue's length", () => {
      // probe line/p08: the arc drawn clockwise ends at (100,0).
      const cad = answer(createHarness(), "ARC", "0,0", "50,50", "100,0")
      answer(cad, "LINE", "")

      expect(written(cad, "FOO", "0")).toEqual([
        "Length of line: FOO",
        "Requires numeric distance or second point.",
        "Length of line: 0",
        "Zero length line created at (100.00, 0.00, 0.00)",
      ])
      expect(cad.state().commandLine.prompt).toBe(
        "LINE Specify next point or [Undo]:"
      )
    })
  })

  describe("typed coordinates", () => {
    it("accepts an absolute first point and a relative second", () => {
      const cad = createHarness()

      cad.command("LINE").type("0,0").enter().type("@100,0").enter().escape()

      const line = cad.only<LineEntity>("line")
      expect(line.start).toBeCloseToPoint(p(0, 0))
      expect(line.end).toBeCloseToPoint(p(100, 0))
    })

    it("accepts relative polar input", () => {
      const cad = createHarness()

      cad.command("LINE").click(p(0, 0)).type("100<45").enter().escape()

      const line = cad.only<LineEntity>("line")
      expect(line.end).toBeCloseToPoint(
        p(100 * Math.cos(deg(45)), 100 * Math.sin(deg(45))),
        6
      )
    })

    it("forces an absolute point with the # prefix", () => {
      const cad = createHarness()

      cad.command("LINE").click(p(200, 200)).type("#0,0").enter().escape()

      expect(cad.only<LineEntity>("line").end).toBeCloseToPoint(p(0, 0))
    })

    it("takes a length and an angle as separate fields", () => {
      const cad = createHarness()

      cad
        .command("LINE")
        .click(p(0, 0))
        .type("100", "distance")
        .type("30", "angle")
        .enter()
        .escape()

      expect(cad.only<LineEntity>("line").end).toBeCloseToPoint(
        p(100 * Math.cos(deg(30)), 100 * Math.sin(deg(30))),
        6
      )
    })

    it("reads the angle field's forms as a typed point's angle", () => {
      // the forms of probe line/p151
      const cad = createHarness()

      for (const angle of ["50g", "N45dE"]) {
        cad.command("LINE").click(p(0, 0)).moveTo(p(50, 60))
        cad.type("100", "distance").type(angle, "angle").enter().escape()
      }

      const drawn = lines(cad.entities())
      expect(drawn).toHaveLength(2)
      for (const line of drawn) {
        expect(line.end).toBeCloseToPoint(p(50 * Math.SQRT2, 50 * Math.SQRT2))
      }
    })

    it("hard-locks a typed value so a click cannot override it", () => {
      // AutoCAD's dimensional input: once you type a value the mouse stops
      // deciding it, and clicking commits the typed geometry.
      const cad = createHarness()

      cad
        .command("LINE")
        .click(p(0, 0))
        .type("100", "distance")
        .type("60", "angle")
        .click(p(900, 900))
        .escape()

      expect(cad.only<LineEntity>("line").end).toBeCloseToPoint(
        p(100 * Math.cos(deg(60)), 100 * Math.sin(deg(60))),
        6
      )
    })

    it("locks only the typed component, letting the cursor drive the rest", () => {
      const cad = createHarness()

      cad
        .command("LINE")
        .click(p(0, 0))
        .type("80", "distance")
        .click(p(500, 0))
        .escape()

      // Distance locked to 80, direction still taken from the pick.
      expect(cad.only<LineEntity>("line").end).toBeCloseToPoint(p(80, 0), 6)
    })
  })

  describe("command options", () => {
    it("offers Close only once the chain has two segments", () => {
      const cad = createHarness()

      cad.command("LINE").click(p(0, 0))
      expect(cad.optionAbbreviations()).not.toContain("C")

      cad.click(p(100, 0))
      expect(cad.optionAbbreviations()).toEqual(["U"])

      cad.click(p(100, 100))
      expect(cad.optionAbbreviations()).toEqual(["C", "U"])
    })

    it("Close draws back to the first vertex and ends the command", () => {
      const cad = createHarness()

      cad
        .command("LINE")
        .click(p(0, 0))
        .click(p(100, 0))
        .click(p(100, 100))
        .option("Close")

      const drawn = lines(cad.entities())
      expect(drawn).toHaveLength(3)
      expect(drawn[2].start).toBeCloseToPoint(p(100, 100))
      expect(drawn[2].end).toBeCloseToPoint(p(0, 0))
      expect(cad.activeToolId()).toBe("select")
    })

    it("says All segments already undone. when Undo takes the first point back", () => {
      // probe line/p02, p103, p108
      const cad = answer(createHarness(), "LINE", "0,0", "@100,0", "@0,50")

      expect(written(cad, "U", "U", "U")).toEqual([
        "Specify next point or [Close/Undo]: U",
        "Specify next point or [Undo]: U",
        "Specify next point or [Undo]: U",
        "All segments already undone.",
      ])
      expect(cad.state().commandLine.prompt).toBe("LINE Specify first point:")
      expect(cad.entityCount).toBe(0)
    })

    it("Undo takes back a transparent command's step with the last segment", () => {
      // probe line/p117: LTSCALE back to 1, `Regenerating model.` said by the
      // Undo, and nothing more when LINE ends.
      const cad = answer(createHarness(), "LINE", "0,0", "@10,0", "@0,10")
      answer(cad, "'LTSCALE", "2")

      expect(written(cad, "U")).toEqual([
        "Specify next point or [Close/Undo]: U",
        "Regenerating model.",
      ])
      expect(lines(cad.entities())).toHaveLength(1)
      expect(cad.runtime.document.getSettings().ltScale).toBe(1)
      expect(cad.state().commandLine.prompt).toBe(
        "LINE Specify next point or [Undo]:"
      )
      expect(written(cad, "")).toEqual(["Specify next point or [Undo]:"])
    })

    it("Undo takes back a transparent -COLOR with the last segment", () => {
      // probe line/p118: CECOLOR back to BYLAYER.
      const cad = answer(createHarness(), "LINE", "0,0", "@10,0", "@0,10")
      answer(cad, "'-COLOR", "1", "U", "@5,5")

      expect(lines(cad.entities())).toHaveLength(2)
      expect(cad.runtime.document.getSettings().currentColor).toBe(
        COLOR_BYLAYER
      )
      expect(cad.state().commandLine.prompt).toBe(
        "LINE Specify next point or [Close/Undo]:"
      )
    })

    it("Undo removes the last segment but keeps drawing", () => {
      const cad = createHarness()

      cad.command("LINE").click(p(0, 0)).click(p(100, 0)).click(p(100, 100))
      expect(cad.entityCount).toBe(2)

      cad.option("Undo")
      expect(cad.entityCount).toBe(1)
      expect(cad.activeToolId()).toBe("line")

      // The chain continues from the vertex the undo stepped back to.
      cad.click(p(200, 0)).escape()
      const drawn = lines(cad.entities())
      expect(drawn).toHaveLength(2)
      expect(drawn[1].start).toBeCloseToPoint(p(100, 0))
      expect(drawn[1].end).toBeCloseToPoint(p(200, 0))
    })
  })

  describe("drafting aids", () => {
    it("Ortho locks the segment to the dominant axis", () => {
      const cad = createHarness()
      cad.runtime.toggleOrtho()

      cad.command("LINE").click(p(0, 0)).click(p(100, 30)).escape()

      expect(cad.only<LineEntity>("line").end).toBeCloseToPoint(p(100, 0))
    })

    it("Ortho picks the vertical axis when the cursor leans that way", () => {
      const cad = createHarness()
      cad.runtime.toggleOrtho()

      cad.command("LINE").click(p(0, 0)).click(p(30, 100)).escape()

      expect(cad.only<LineEntity>("line").end).toBeCloseToPoint(p(0, 100))
    })

    it("snaps the start point onto an existing endpoint", () => {
      const cad = createHarness({
        entities: [
          {
            id: "L1",
            type: "line",
            layerId: "0",
            start: p(0, 0),
            end: p(100, 0),
          },
        ],
        snap: true,
      })

      // Pick slightly off the existing endpoint: the endpoint snap must win.
      cad.command("LINE").click(p(101.5, 1.5)).click(p(200, 0)).escape()

      const drawn = lines(cad.entities())
      expect(drawn).toHaveLength(2)
      expect(drawn[1].start).toBeCloseToPoint(p(100, 0))
    })
  })

  describe("undo history", () => {
    it("undoes the whole command with one U, as AutoCAD does", () => {
      const cad = createHarness()

      cad
        .command("LINE")
        .click(p(0, 0))
        .click(p(100, 0))
        .click(p(100, 100))
        .escape()
      cad.command("LINE").click(p(200, 0)).click(p(300, 0)).escape()
      expect(cad.entityCount).toBe(3)

      cad.undo()
      expect(cad.entityCount).toBe(2)
      cad.undo()
      expect(cad.entityCount).toBe(0)
      cad.redo()
      expect(cad.entityCount).toBe(2)
    })

    it("takes Ctrl+Z inside the command as its Undo option", () => {
      const cad = createHarness()

      cad.command("LINE").click(p(0, 0)).click(p(100, 0)).click(p(100, 100))
      cad.press("z", { ctrlKey: true })

      expect(cad.entityCount).toBe(1)
      expect(cad.activeToolId()).toBe("line")
      cad.click(p(0, 100)).escape()
      expect(lines(cad.entities())[1].start).toBeCloseToPoint(p(100, 0))
    })

    it("ends the command before UNDO, which takes all it drew", () => {
      const cad = createHarness()

      cad.command("LINE").click(p(0, 0)).click(p(100, 0)).click(p(100, 100))
      cad.undo()

      expect(cad.entityCount).toBe(0)
      expect(cad.activeToolId()).toBe("select")
    })
  })

  it("draws on the current layer", () => {
    const cad = createHarness()
    const layerId = cad.runtime.createLayer("Walls")

    cad.command("LINE").click(p(0, 0)).click(p(100, 0)).escape()

    expect(cad.only<LineEntity>("line").layerId).toBe(layerId)
  })
  describe("the next-point prompt", () => {
    it("offers Undo from the first point on, which takes that point back", () => {
      // AutoCAD: "Specify next point or [Undo]:" straight after the first point.
      const cad = createHarness()

      cad.command("LINE").click(p(10, 10))
      expect(cad.optionIds()).toEqual(["Undo"])

      cad.option("Undo")
      expect(cad.activeToolId()).toBe("line")
      expect(cad.optionIds()).toEqual([])
      expect(cad.state().dynamicInput?.fields[0].id).toBe("point")

      cad.click(p(20, 20)).click(p(60, 20)).escape()
      const line = cad.only<LineEntity>("line")
      expect(line.start).toBeCloseToPoint(p(20, 20))
    })

    it("runs a typed length the other way when it is negative", () => {
      // "If you had typed -6, the vertical line would have been drawn downward"
      const cad = createHarness()

      cad.command("LINE").click(p(0, 0)).moveTo(p(50, 0)).type("-30").enter()

      expect(cad.only<LineEntity>("line").end).toBeCloseToPoint(p(-30, 0))
    })

    it("measures a length typed next from where the cursor still stands", () => {
      const cad = createHarness()

      cad.command("LINE").click(p(0, 0)).moveTo(p(50, 0))
      cad.type("100").enter().type("30").enter()

      // The cursor, unmoved at (50, 0), lies back towards the start.
      expect(lines(cad.entities())[1].end).toBeCloseToPoint(p(70, 0))
    })

    it("shows only acute angles, and reads a typed one on the cursor's side", () => {
      // "dimension input displays only acute angles … Angles specified when
      // creating new objects rely on the cursor location to determine the
      // positive angle direction."
      const cad = createHarness()

      cad.command("LINE").click(p(0, 0)).moveTo(p(-30, -40))
      const angle = cad.state().dynamicInput?.fields[1]
      expect(angle?.placeholder).toBe("127")

      cad.type("100", "distance").type("30", "angle").enter()
      expect(cad.only<LineEntity>("line").end).toBeCloseToPoint(
        p(100 * Math.cos(deg(-30)), 100 * Math.sin(deg(-30))),
        6
      )
    })

    it("locks the next point to a typed <angle", () => {
      // probe line/p18
      const cad = createHarness()

      cad.command("LINE").click(p(0, 0)).type("<45").enter()
      expect(cad.commandLog()).toContain("Angle Override: 45")

      cad.click(p(80, 20)).escape()
      const end = cad.only<LineEntity>("line").end
      expect(end.x).toBeCloseTo(end.y, 9)
      expect(end.x).toBeCloseTo(50, 9)
    })

    it("refuses <angle at the first point, which has no base", () => {
      // probe line/p161
      const cad = answer(createHarness(), "LINE")

      expect(written(cad, "<30")).toEqual([
        "Specify first point: <30",
        "Invalid point.",
      ])
    })

    it("reads the angle forms in an override", () => {
      // the forms of probe line/p151
      const cad = answer(createHarness(), "LINE", "0,0")
      cad.moveTo(p(100, 0))
      answer(cad, "<50g", "10", "<N45dE", "10", "")

      const [a, b] = lines(cad.entities())
      expect(a.end).toBeCloseToPoint(p(5 * Math.SQRT2, 5 * Math.SQRT2))
      expect(b.end).toBeCloseToPoint(p(10 * Math.SQRT2, 10 * Math.SQRT2))
    })

    it("refuses a second <angle while one holds, and drops the first", () => {
      // probe line/p161: the 10 after the refusal runs towards the cursor
      const cad = answer(createHarness(), "LINE", "0,0", "<30")
      cad.moveTo(p(289.98397, 116.30379))

      expect(written(cad, "<45")).toEqual([
        "Specify next point or [Undo]: <45",
        "Point or option keyword required.",
      ])
      answer(cad, "10", "")
      expect(cad.only<LineEntity>("line").end).toBeCloseToPoint(
        p(9.2813394, 3.7224642),
        6
      )
    })

    it("lets a typed point or an object snap win over the override", () => {
      // probe line/p161 (a coordinate), p165 (_END)
      const cad = answer(createHarness(), "LINE", "0,0", "<30", "@10,0", "")
      expect(cad.only<LineEntity>("line").end).toBeCloseToPoint(p(10, 0))

      answer(cad, "LINE", "100,0", "0,0", "", "LINE", "0,20", "<30", "_END")
      cad.click(p(99, 1))
      answer(cad, "")
      expect(lines(cad.entities())[2].end).toBeCloseToPoint(p(100, 0))
    })

    it("holds the angle override for one point only", () => {
      const cad = createHarness()

      cad.command("LINE").click(p(0, 0)).type("<90").enter()
      cad.moveTo(p(10, 100)).type("100").enter()
      cad.click(p(200, 130)).escape()

      const drawn = lines(cad.entities())
      expect(drawn[0].end).toBeCloseToPoint(p(0, 100))
      expect(drawn[1].end).toBeCloseToPoint(p(200, 130))
    })
  })

  describe("Continue", () => {
    it("leaves an arc drawn clockwise from its drawn end", () => {
      // probe line/p07: the arc is stored counter-clockwise from (100,0).
      const cad = answer(createHarness(), "ARC", "0,0", "50,50", "100,0")
      answer(cad, "LINE", "", "30")

      expectEnds(cad, [[100, 0, 0, 100, -30, 0]])
    })

    it("runs a negative length back along the arc's heading", () => {
      // probe line/p102
      const cad = answer(createHarness(), "ARC", "0,0", "50,50", "100,0")
      answer(cad, "LINE", "", "-30")

      expectEnds(cad, [[100, 0, 0, 100, 30, 0]])
    })

    it("asks the length from a polyline ending in an arc, tangent to it", () => {
      // probe line/p116
      const cad = answer(createHarness(), "PLINE", "0,0", "A", "10,10", "")
      answer(cad, "LINE", "")

      expect(cad.state().commandLine.prompt).toBe("LINE Length of line:")
      answer(cad, "5", "")
      expect(cad.only<LineEntity>("line").end).toBeCloseToPoint(p(10, 15))

      // …and from a closed one's first vertex, asking the next point.
      answer(cad, "PLINE", "50,0", "@10,0", "@0,10", "C", "LINE", "")
      expect(cad.state().commandLine.prompt).toBe(
        "LINE Specify next point or [Undo]:"
      )
      answer(cad, "@0,-5", "")
      expect(lines(cad.entities())[1].start).toBeCloseToPoint(p(50, 0))
    })

    it("refuses Enter at the length, by the command line or the box", () => {
      // probe line/p114
      const cad = answer(createHarness(), "ARC", "0,0", "50,50", "100,0")
      answer(cad, "LINE", "")

      expect(written(cad, "")).toEqual([
        "Length of line:",
        "Requires numeric distance or second point.",
      ])
      cad.enter()
      expect(cad.commandLog().at(-1)).toBe(
        "Requires numeric distance or second point."
      )
      expect(cad.state().commandLine.prompt).toBe("LINE Length of line:")
      answer(cad, "30")
      expect(cad.state().commandLine.prompt).toBe(
        "LINE Specify next point or [Undo]:"
      )
    })

    it("Undo of the tangent line asks the length again, where Undo is refused", () => {
      // probe line/p115
      const cad = answer(createHarness(), "ARC", "0,0", "50,50", "100,0")
      answer(cad, "LINE", "", "30", "U")

      expect(cad.entityCount).toBe(1)
      expect(cad.state().commandLine.prompt).toBe("LINE Length of line:")
      expect(written(cad, "_U")).toEqual([
        "Length of line: _U",
        "Requires numeric distance or second point.",
      ])
      answer(cad, "0,0")
      expect(cad.state().commandLine.prompt).toBe(
        "LINE Specify next point or [Undo]:"
      )
      answer(cad, "@1,0")
      expect(cad.state().commandLine.prompt).toBe(
        "LINE Specify next point or [Close/Undo]:"
      )
    })

    it("leaves the last arc tangent to it, asking only the length", () => {
      const cad = createHarness({ entities: [arcOf(p(0, 0), 50, 0, deg(90))] })

      cad.command("LINE").enter()
      expect(cad.state().dynamicInput?.fields.map((f) => f.id)).toEqual([
        "distance",
      ])
      cad.type("40").enter()

      const line = cad.only<LineEntity>("line")
      expect(line.start).toBeCloseToPoint(p(0, 50))
      expect(line.end).toBeCloseToPoint(p(-40, 50))
      // …and goes on from its end.
      cad.click(p(-40, 0)).escape()
      expect(lines(cad.entities())[1].end).toBeCloseToPoint(p(-40, 0))
    })

    it("takes a pick at the length prompt as the length", () => {
      const cad = createHarness({ entities: [arcOf(p(0, 0), 50, 0, deg(90))] })

      cad.command("LINE").enter().click(p(0, 80)).escape()

      expect(cad.only<LineEntity>("line").end).toBeCloseToPoint(p(-30, 50))
    })
  })

  describe("the points it is given", () => {
    it("keeps the Z typed, absolute and relative, polar and * forms", () => {
      // probe line/p15 (its `#5,5` is the PIN block's)
      const cad = answer(createHarness(), "LINE", "10,20,30", "@5,0,5")
      answer(cad, "50<45", "@10<90", "*1,1", "")

      const c = 50 * Math.SQRT1_2
      expectEnds(cad, [
        [10, 20, 30, 15, 20, 35],
        [15, 20, 35, c, c, 0],
        [c, c, 0, c, c + 10, 0],
        [c, c + 10, 0, 1, 1, 0],
      ])
    })

    it("draws at ELEVATION, a Z typed relative to it", () => {
      // probe line/p31
      const cad = answer(createHarness(), "ELEV", "5", "0", "LINE", "0,0")
      answer(cad, "@10,0", "@0,0,3", "10,10", "")

      expectEnds(cad, [
        [0, 0, 5, 10, 0, 5],
        [10, 0, 5, 10, 0, 8],
        [10, 0, 8, 10, 10, 5],
      ])
    })

    it("puts a * point without a Z on the WCS's XY plane, whatever ELEVATION", () => {
      // probe line/p163
      const cad = answer(createHarness(), "ELEV", "5", "0")
      answer(cad, "LINE", "0,0", "*1,1", "*2,2,1", "")

      expectEnds(cad, [
        [0, 0, 5, 1, 1, 0],
        [1, 1, 0, 2, 2, 1],
      ])
    })

    it("reads @*, *d<a and *x,y in a turned UCS with ELEVATION", () => {
      // probe line/p152
      const cad = answer(createHarness(), "ELEV", "5", "0", "UCS", "Z", "30")
      answer(cad, "LINE", "0,0", "@*10,0", "*10<0", "*1,1", "")

      expectEnds(cad, [
        [0, 0, 5, 10, 0, 5],
        [10, 0, 5, 10, 0, 0],
        [10, 0, 0, 1, 1, 0],
      ])
    })

    it("puts *x,y on the WCS's XY plane in a tilted UCS", () => {
      // probe line/p153
      const cad = answer(createHarness(), "UCS", "X", "90")
      answer(cad, "LINE", "0,0", "*10,10", "*10,10,3", "")

      expectEnds(cad, [
        [0, 0, 0, 10, 10, 0],
        [10, 10, 0, 10, 10, 3],
      ])
    })

    it("reads exponents and fractions, and refuses feet, hex and a dangling comma", () => {
      // probe line/p150
      const cad = answer(createHarness(), "LINE", "0,0", "1e1,0", "1/2,0")
      answer(cad, "1-1/2,0", "")
      expect(lines(cad.entities()).map((line) => line.end.x)).toEqual([
        10, 0.5, 1.5,
      ])

      answer(cad, "LINE", "0,0")
      expect(written(cad, `1'6",0`, "0x10,0", "5,5,")).toEqual([
        `Specify next point or [Undo]: 1'6",0`,
        "Point or option keyword required.",
        "Specify next point or [Undo]: 0x10,0",
        "Point or option keyword required.",
        "Specify next point or [Undo]: 5,5,",
        "Point or option keyword required.",
      ])
    })

    it("reads the angle forms after <, and cylindrical and spherical points", () => {
      // probe line/p151
      const cad = answer(createHarness(), "LINE", "0,0", "10<30d30'", "")
      answer(cad, "LINE", "0,0", "10<0.5r", "")
      answer(cad, "LINE", "0,0", "10<30,5", "")
      answer(cad, "LINE", "0,0", "10<30<45", "")

      const [a, b, c, d] = lines(cad.entities()).map((line) =>
        ends(line).slice(3)
      )
      expect(a).toEqual([
        expect.closeTo(8.61629, 5),
        expect.closeTo(5.07538, 5),
        0,
      ])
      expect(b).toEqual([
        expect.closeTo(8.77583, 5),
        expect.closeTo(4.79426, 5),
        0,
      ])
      expect(c).toEqual([expect.closeTo(8.66025, 5), expect.closeTo(5, 5), 5])
      expect(d).toEqual([
        expect.closeTo(6.12372, 5),
        expect.closeTo(3.53553, 5),
        expect.closeTo(7.07107, 5),
      ])
    })

    it("reads relative polar angles past a turn and negative distances", () => {
      // probe line/p27
      const cad = answer(createHarness(), "LINE", "0,0", "@10<-45")
      answer(cad, "@10<450", "@-10<0", "")

      const ends = lines(cad.entities()).map((line) => line.end)
      expect(ends[0]).toBeCloseToPoint(p(7.0710678118654, -7.0710678118654))
      expect(ends[1]).toBeCloseToPoint(p(7.0710678118654, 2.9289321881345))
      expect(ends[2]).toBeCloseToPoint(p(-2.9289321881345, 2.9289321881345))
    })

    it("Close draws back to the first point, the lines in order", () => {
      // probe line/p03
      const cad = answer(createHarness(), "LINE", "0,0", "@100,0", "@0,50", "C")

      expectEnds(cad, [
        [0, 0, 0, 100, 0, 0],
        [100, 0, 0, 100, 50, 0],
        [100, 50, 0, 0, 0, 0],
      ])
    })
  })

  describe("refusals", () => {
    it("refuses what each prompt does not take, in its words", () => {
      // probe line/p09, p23, p103
      const cad = answer(createHarness(), "LINE")

      expect(written(cad, "FOO", "_C", "_U", "_UNDO")).toEqual([
        "Specify first point: FOO",
        "Invalid point.",
        "Specify first point: _C",
        "Invalid point.",
        "Specify first point: _U",
        "Invalid point.",
        "Specify first point: _UNDO",
        "Invalid point.",
      ])
      answer(cad, "0,0")
      expect(written(cad, "FOO", "_CLOSE", "_LINE")).toEqual([
        "Specify next point or [Undo]: FOO",
        "Point or option keyword required.",
        "Specify next point or [Undo]: _CLOSE",
        "Point or option keyword required.",
        "Specify next point or [Undo]: _LINE",
        "Point or option keyword required.",
      ])
      answer(cad, "@10,0")
      expect(written(cad, "_CLOSE")).toEqual([
        "Specify next point or [Undo]: _CLOSE",
        "Point or option keyword required.",
      ])
    })
  })

  describe("# typed at the command line", () => {
    it("is refused there, as a point the box takes", () => {
      // probes line/p15, p28; desktop d02 (DYNMODE 3), d11 (the tooltip)
      const cad = answer(createHarness(), "LINE")
      expect(written(cad, "#5,5")).toEqual([
        "Specify first point: #5,5",
        "Invalid point.",
      ])
      answer(cad, "0,0")
      expect(written(cad, "#5,5")).toEqual([
        "Specify next point or [Undo]: #5,5",
        "Point or option keyword required.",
      ])
      expect(lines(cad.entities())).toHaveLength(0)

      cad.type("#30,30").enter().escape()
      expect(cad.only<LineEntity>("line").end).toBeCloseToPoint(p(30, 30))
    })
  })

  describe("typed points", () => {
    it("reads @ at the first point from the last point given", () => {
      const cad = createHarness()

      cad.command("LINE").click(p(30, 30)).click(p(80, 30)).escape()
      cad.command("LINE").type("@10,10").enter().click(p(150, 40)).escape()

      expect(lines(cad.entities())[1].start).toBeCloseToPoint(p(90, 40))
    })

    it("runs a length typed on an OTRACK guide from the acquired point", () => {
      vi.useFakeTimers()
      onTestFinished(() => {
        vi.useRealTimers()
      })
      const cad = createHarness({
        entities: [lineOf(p(80, 60), p(120, 60))],
        snap: true,
      })

      cad.command("LINE").click(p(0, 0)).moveTo(p(80, 60))
      vi.advanceTimersByTime(500)
      cad.moveTo(p(80.5, 20)).type("25").enter().escape()

      expect(lines(cad.entities())[1].end).toBeCloseToPoint(p(80, 35))
    })
  })

  describe("the keyboard", () => {
    it("takes keys typed on the drawing into the box, and Space as Enter", () => {
      const cad = createHarness()

      cad.command("LINE").click(p(0, 0)).moveTo(p(50, 0))
      for (const key of "100") cad.press(key)
      cad.press(" ")
      expect(cad.only<LineEntity>("line").end).toBeCloseToPoint(p(100, 0))

      cad.press(" ")
      expect(cad.activeToolId()).toBe("select")
      cad.press(" ")
      expect(cad.activeToolId()).toBe("line")
    })

    it("answers the prompt from the command line, coordinates absolute", () => {
      const cad = createHarness()

      cad.command("LINE").click(p(10, 10))
      cad.runtime.setCommandLineText("100,50")
      cad.runtime.submitCommandLine()
      cad.runtime.setCommandLineText("CIRCLE")
      cad.runtime.submitCommandLine()

      expect(cad.only<LineEntity>("line").end).toBeCloseToPoint(p(100, 50))
      expect(cad.activeToolId()).toBe("line")
    })
  })

  describe("the prompt and its history", () => {
    it("names the command before each question, and the tooltip only asks", () => {
      // probe line/p01
      const cad = createHarness()
      const asked = () => [
        cad.state().commandLine.prompt,
        cad.state().dynamicInput?.prompt,
      ]

      cad.command("LINE")
      expect(asked()).toEqual([
        "LINE Specify first point:",
        "Specify first point:",
      ])
      cad.click(p(0, 0))
      expect(asked()).toEqual([
        "LINE Specify next point or [Undo]:",
        "Specify next point or",
      ])
      cad.click(p(100, 0)).click(p(100, 100))
      expect(asked()[0]).toBe("LINE Specify next point or [Close/Undo]:")
    })

    it("writes each prompt with its answer: bare for a pick or Enter", () => {
      const cad = createHarness()

      cad.command("LINE").click(p(0, 0)).moveTo(p(10, 0))
      cad.type("100").enter()
      cad.type("@0,50").enter()
      cad.click(p(0, 50))
      cad.option("Undo")
      cad.press("Enter")

      expect(cad.commandLog()).toEqual([
        "LINE",
        "Specify first point:",
        "Specify next point or [Undo]: 100",
        "Specify next point or [Undo]: @0,50",
        "Specify next point or [Close/Undo]:",
        "Specify next point or [Close/Undo]: U",
        "Specify next point or [Close/Undo]:",
      ])
      expect(cad.state().commandLine.recent.map((line) => line.text)).toEqual([
        "Specify next point or [Close/Undo]:",
        "Specify next point or [Close/Undo]: U",
        "Specify next point or [Close/Undo]:",
      ])
    })

    it("writes *Cancel* after the prompt Escape leaves", () => {
      const cad = createHarness()

      cad.command("LINE").click(p(0, 0)).escape()
      cad.command("LINE").press("Escape")

      expect(cad.commandLog()).toEqual([
        "LINE",
        "Specify first point:",
        "Specify next point or [Undo]: *Cancel*",
        "LINE",
        "Specify first point: *Cancel*",
      ])
    })

    it("writes what was typed at the command line, before what it reported", () => {
      const cad = createHarness()

      cad.command("LINE").click(p(0, 0))
      cad.runtime.setCommandLineText("<45")
      cad.runtime.submitCommandLine()

      expect(cad.commandLog().slice(2)).toEqual([
        "Specify next point or [Undo]: <45",
        "Angle Override: 45",
      ])
    })

    it("asks Continue's length from an arc as Length of line", () => {
      // probe line/p07
      const cad = createHarness({ entities: [arcOf(p(0, 0), 50, 0, deg(90))] })

      cad.command("LINE").enter()
      expect(cad.state().commandLine.prompt).toBe("LINE Length of line:")
      cad.type("40").enter()

      expect(cad.commandLog()).toEqual([
        "LINE",
        "Specify first point:",
        "Length of line: 40",
      ])
      expect(cad.state().commandLine.prompt).toBe(
        "LINE Specify next point or [Undo]:"
      )
    })

    it("continues on Enter before the pointer has moved, as with it", () => {
      const cad = createHarness()
      cad.runtime.runCommand("LINE")
      cad.press("Enter")

      expect(cad.activeToolId()).toBe("line")
      expect(cad.commandLog().at(-1)).toBe("No line or arc to continue.")
    })

    it("says there is nothing to continue and asks for the first point again", () => {
      // probe line/p05
      const cad = createHarness()

      cad.command("LINE").enter()

      expect(cad.activeToolId()).toBe("line")
      expect(cad.commandLog()).toEqual([
        "LINE",
        "Specify first point:",
        "No line or arc to continue.",
      ])
      expect(cad.state().commandLine.prompt).toBe("LINE Specify first point:")
    })

    it("still asks for the first point while a guide offers an offset", () => {
      vi.useFakeTimers()
      onTestFinished(() => {
        vi.useRealTimers()
      })
      const cad = createHarness({
        entities: [lineOf(p(80, 60), p(120, 60))],
        snap: true,
      })

      cad.command("LINE").moveTo(p(80, 60))
      vi.advanceTimersByTime(500)
      cad.moveTo(p(80.5, 20))
      expect(cad.state().dynamicInput?.fields[0].label).toBe("Offset")
      expect(cad.state().commandLine.prompt).toBe("LINE Specify first point:")
      cad.type("25").enter()

      expect(cad.commandLog().at(-1)).toBe("Specify first point: 25")
    })

    it("asks for the next point once a deferred tangent is picked", () => {
      const cad = createHarness({ entities: [circleOf(p(0, 0), 20)] })

      cad.command("LINE").type("tan").enter().click(p(-5, 19))

      expect(cad.state().commandLine.prompt).toBe(
        "LINE Specify next point or [Undo]:"
      )
      expect(cad.commandLog()).toEqual(["LINE", "Specify first point: tan to"])
    })

    it("writes an object snap on the line its pick answers", () => {
      const cad = createHarness({ entities: [lineOf(p(0, 0), p(50, 0))] })

      cad.command("LINE").type("end").enter().click(p(49, 1))
      cad.runtime.setSnapOverride(SnapType.Midpoint)
      cad.click(p(24, 1)).escape()

      expect(cad.commandLog()).toEqual([
        "LINE",
        "Specify first point: end of",
        "Specify next point or [Undo]: _mid of",
        "Specify next point or [Undo]: *Cancel*",
      ])
    })
  })

  describe("Shift", () => {
    it("turns Ortho off while it is held, as it turns it on", () => {
      const cad = createHarness()
      cad.runtime.toggleOrtho()

      cad.command("LINE").click(p(0, 0)).click(p(100, 30), { shiftKey: true })
      cad.click(p(130, 80)).escape()

      const drawn = lines(cad.entities())
      expect(drawn[0].end).toBeCloseToPoint(p(100, 30))
      expect(drawn[1].end).toBeCloseToPoint(p(100, 80))
    })
  })
  describe("a Tangent or Perpendicular at the first point", () => {
    const twoCircles = () =>
      createHarness({
        entities: [circleOf(p(0, 0), 20), circleOf(p(100, 0), 20)],
      })

    it("draws the line tangent to two circles, the one nearest the picks", () => {
      const cad = twoCircles()

      cad.command("LINE").type("tan").enter().click(p(2, 19.5))
      expect(cad.entityCount).toBe(2)
      expect(cad.optionIds()).toEqual(["Undo"])
      cad.type("tan").enter().click(p(98, 19.5)).escape()

      const line = cad.only<LineEntity>("line")
      expect(line.start).toBeCloseToPoint(p(0, 20))
      expect(line.end).toBeCloseToPoint(p(100, 20))
    })

    it("takes the crossing tangent when the picks are on opposite sides", () => {
      const cad = twoCircles()

      cad.command("LINE").type("tan").enter().click(p(5, 19))
      cad.type("tan").enter().click(p(95, -19)).escape()

      const { start, end } = cad.only<LineEntity>("line")
      // Through the midpoint between the circles, touching each square.
      expect((start.y + end.y) / 2).toBeCloseTo(0, 9)
      expect(start.y).toBeGreaterThan(0)
      expect(end.y).toBeLessThan(0)
      expect(Math.hypot(start.x, start.y)).toBeCloseTo(20, 9)
    })

    it("works the tangent point out from a plain next point", () => {
      const cad = twoCircles()

      cad.command("LINE").type("tan").enter().click(p(-5, 19)).click(p(0, 40))
      cad.escape()

      // From (0, 40) the tangents touch at 30° above the horizontal.
      const { start } = cad.only<LineEntity>("line")
      expect(start).toBeCloseToPoint(
        p(-20 * Math.cos(deg(30)), 20 * Math.sin(deg(30))),
        6
      )
    })

    it("drops a perpendicular onto a line from the next point", () => {
      const cad = createHarness({ entities: [lineOf(p(-100, 0), p(100, 0))] })

      cad.command("LINE").type("per").enter().click(p(30, 0.5)).click(p(60, 80))
      cad.escape()

      const drawn = lines(cad.entities())[1]
      expect(drawn.start).toBeCloseToPoint(p(60, 0))
      expect(drawn.end).toBeCloseToPoint(p(60, 80))
    })

    it("takes the pick back with Undo", () => {
      const cad = twoCircles()

      cad.command("LINE").type("tan").enter().click(p(2, 19.5)).option("Undo")
      cad.click(p(200, 200)).click(p(250, 200)).escape()

      expect(cad.only<LineEntity>("line").start).toBeCloseToPoint(p(200, 200))
    })
  })
})
