import { describe, expect, it } from "vitest"
import { CadHarness, createHarness } from "../../test/harness"
import { lineOf, p } from "../../test/builders"
import { createBlockDefinition, LineEntity } from "../domain/entities"

// What AutoCAD keeps per drawing without saving it goes back to its default
// when another drawing is opened: the console's OPEN test, a blank drawing
// saved, the value set, saved again, both reopened, the default in each
// (rectang/p301, p303, p305, p309–p311, p314, p315, p321). The console has no
// NEW (p300); NEW here starts the blank drawing OPEN stands in for.

/** Typed at the command line and confirmed, as AutoCAD's prompt reads it. */
function answer(cad: CadHarness, ...texts: string[]): CadHarness {
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

const prompt = (cad: CadHarness) => cad.state().commandLine.prompt

/** The lines written from `from` on. */
const since = (cad: CadHarness, from: number) => cad.commandLog().slice(from)

/** A drawing with BAR and POST in its block table, saved before anything was set. */
function saved(): string {
  const cad = createHarness({
    blocks: ["BAR", "POST"].map((name) =>
      createBlockDefinition(name, p(0, 0), [lineOf(p(0, 0), p(10, 0))])
    ),
  })
  return cad.runtime.serializeDrawing()
}

const RESETS: [string, (cad: CadHarness) => void][] = [
  ["NEW", (cad) => answer(cad, "_NEW")],
  ["OPEN", (cad) => cad.runtime.loadDrawing(saved())],
]

/** A session whose drawing has BAR, POST and one line, from 5,5 to 15,5. */
function session(): CadHarness {
  const cad = createHarness()
  cad.runtime.loadDrawing(saved())
  return answer(cad, "_LINE", "5,5", "15,5", "")
}

function line(cad: CadHarness): void {
  answer(cad, "_LINE", "5,5", "15,5", "")
}

describe.each(RESETS)("after %s", (_, reset) => {
  it("CIRCLE offers no radius (CIRCLERAD 0, rectang/p301)", () => {
    const cad = answer(session(), "_CIRCLE", "5,5", "3")
    reset(cad)
    answer(cad, "_CIRCLE", "5,5")
    expect(prompt(cad)).toBe("CIRCLE Specify radius of circle or [Diameter]:")
    cad.escape()
  })

  it("POLYGON offers 4 sides and Inscribed (POLYSIDES, rectang/p309)", () => {
    const cad = answer(session(), "_POLYGON", "6", "5,5", "_C", "3")
    reset(cad)
    answer(cad, "_POLYGON")
    expect(prompt(cad)).toBe("POLYGON Enter number of sides <4>:")
    answer(cad, "", "5,5")
    expect(prompt(cad)).toBe(
      "POLYGON Enter an option [Inscribed in circle/Circumscribed about circle] <I>:"
    )
    cad.escape()
  })

  it("OFFSET offers Through, keeping Erase and Layer (OFFSETDIST, rectang/p310)", () => {
    const cad = answer(session(), "_OFFSET", "_E", "_Y", "_L", "_C", "2", "")
    reset(cad)
    const from = cad.commandLog().length
    answer(cad, "_OFFSET")
    expect(since(cad, from)).toContain(
      "Current settings: Erase source=Yes  Layer=Current  OFFSETGAPTYPE=0"
    )
    expect(prompt(cad)).toBe(
      "OFFSET Specify offset distance or [Through/Erase/Layer] <Through>:"
    )
    cad.escape()
  })

  it("HATCH offers ANSI31 (HPNAME, rectang/p303)", () => {
    const cad = answer(session(), "_HATCH", "_P", "SOLID", "")
    reset(cad)
    answer(cad, "_HATCH", "_P")
    expect(prompt(cad)).toBe(
      "HATCH Enter a pattern name or [?/Solid] <ANSI31>:"
    )
    cad.escape()
  })

  it("HATCH offers scale 1 and angle 0 (HPSCALE, HPANG, rectang/p303)", () => {
    const cad = answer(session(), "_HATCH", "_P", "ANSI31", "2", "30", "")
    reset(cad)
    answer(cad, "_HATCH", "_P", "")
    expect(prompt(cad)).toBe("HATCH Specify a scale for the pattern <1.00>:")
    answer(cad, "")
    expect(prompt(cad)).toBe("HATCH Specify an angle for the pattern <0>:")
    cad.escape()
  })

  // With INSNAME empty INSERT offers the last block defined, if any.
  it("INSERT no longer offers the block inserted (INSNAME, rectang/p303)", () => {
    const cad = answer(session(), "_INSERT", "BAR", "20,20")
    reset(cad)
    answer(cad, "_INSERT")
    expect(prompt(cad)).not.toContain("<BAR>")
    cad.escape()
  })

  it("ROTATE offers 0 (rectang/p314)", () => {
    const cad = answer(session(), "_ROTATE", "_L", "", "5,5", "30")
    reset(cad)
    line(cad)
    answer(cad, "_ROTATE", "_L", "", "5,5")
    expect(prompt(cad)).toBe(
      "ROTATE Specify rotation angle or [Copy/Reference] <0>:"
    )
    cad.escape()
  })

  it("SCALE's Enter is a factor of 1 again (rectang/p315)", () => {
    const cad = answer(session(), "_SCALE", "_L", "", "5,5", "2")
    reset(cad)
    line(cad)
    answer(cad, "_SCALE", "_L", "", "5,5", "")
    expect(cad.only<LineEntity>("line").end).toBeCloseToPoint(p(15, 5))
  })

  it("MOVE offers no displacement (rectang/p315)", () => {
    const cad = answer(session(), "_MOVE", "_L", "", "_D", "3,4")
    reset(cad)
    line(cad)
    answer(cad, "_MOVE", "_L", "", "_D")
    expect(prompt(cad)).toBe("MOVE Specify displacement <0.00, 0.00, 0.00>:")
    cad.escape()
  })

  it("COPY offers no displacement (rectang/p314)", () => {
    const cad = answer(session(), "_COPY", "_L", "", "_D", "3,4")
    reset(cad)
    line(cad)
    answer(cad, "_COPY", "_L", "", "_D")
    expect(prompt(cad)).toBe("COPY Specify displacement <0.00, 0.00, 0.00>:")
    cad.escape()
  })

  it("TEXT offers a rotation of 0 (rectang/p311)", () => {
    const cad = answer(session(), "_TEXT", "5,5", "3", "15", "A", "")
    reset(cad)
    answer(cad, "_TEXT", "5,5", "")
    expect(prompt(cad)).toBe("TEXT Specify rotation angle of text <0>:")
    cad.escape()
  })

  it("UNDO's Control is All again (UNDOCTL, rectang/p305)", () => {
    const cad = answer(session(), "_UNDO", "_C", "_O")
    reset(cad)
    const from = cad.commandLog().length
    answer(cad, "_UNDO")
    expect(since(cad, from)).toContain(
      "Current settings: Auto = On, Control = All, Combine = Yes, Layer = Yes"
    )
    cad.escape()
  })

  it("RECTANG keeps its modes, which are program-wide (rectang/p306)", () => {
    const cad = answer(session(), "_RECTANG", "_E", "3", "5,5", "15,10")
    reset(cad)
    const from = cad.commandLog().length
    answer(cad, "_RECTANG")
    expect(since(cad, from)).toContain(
      "Current rectangle modes:  Elevation=3.00"
    )
    cad.escape()
  })
})

// WHY: AutoCAD's NEW opens another document, so nothing takes the old one's
// unsaved values back; undoing NEW here brings the drawing back without them
// (RECTANG-D42).
it("undoing NEW leaves the values NEW reset", () => {
  const cad = answer(session(), "_ROTATE", "_L", "", "5,5", "30", "_NEW", "_U")
  answer(cad, "_ROTATE", "_L", "", "5,5")
  expect(prompt(cad)).toBe(
    "ROTATE Specify rotation angle or [Copy/Reference] <0>:"
  )
  cad.escape()
})
