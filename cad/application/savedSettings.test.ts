import { describe, expect, it } from "vitest"
import { CadHarness, createHarness } from "../../test/harness"

// What AutoCAD saves in the drawing, by the console's OPEN test: a blank
// drawing saved, the value set, saved again, both reopened — the value in the
// second, the default in the first (rectang/p302, p304, p311, p316, p321).

/** Typed at the command line and confirmed, as AutoCAD's prompt reads it. */
function answer(cad: CadHarness, ...texts: string[]): CadHarness {
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

/** What the command writes from its start, up to its first prompt. */
function opening(cad: CadHarness, command: string): string[] {
  const from = cad.commandLog().length
  answer(cad, command)
  const lines = cad.commandLog().slice(from)
  cad.escape()
  return lines
}

/** OPEN of the drawing saved as `text`, in a session of its own. */
function opened(text: string): CadHarness {
  const cad = createHarness()
  cad.runtime.loadDrawing(text)
  return cad
}

function setFilletAndChamfer(cad: CadHarness): void {
  answer(cad, "_FILLET", "_R", "3", "", "_CHAMFER", "_D", "2", "1", "")
}

function setText(cad: CadHarness): void {
  answer(cad, "_TEXT", "_J", "_MC", "5,5", "3", "15", "A", "")
}

const FILLET_SET = "Current settings: Mode = TRIM, Radius = 3.00"
const FILLET_DEFAULT = "Current settings: Mode = TRIM, Radius = 0.00"
const CHAMFER_SET = "(TRIM mode) Current chamfer Dist1 = 2.00, Dist2 = 1.00"
const CHAMFER_DEFAULT = "(TRIM mode) Current chamfer Dist1 = 0.00, Dist2 = 0.00"
const TEXT_SET =
  'Current text style:  "Standard"  Text height:  3.00  Annotative:  No  Justify:  MC'
const TEXT_DEFAULT =
  'Current text style:  "Standard"  Text height:  2.50  Annotative:  No  Justify:  Left'

describe("FILLETRAD, CHAMFERA and CHAMFERB are saved in the drawing (rectang/p302, p316)", () => {
  it("come back with the drawing saved with them", () => {
    const cad = createHarness()
    setFilletAndChamfer(cad)
    const copy = opened(cad.runtime.serializeDrawing())

    expect(opening(copy, "_FILLET")).toContain(FILLET_SET)
    expect(opening(copy, "_CHAMFER")).toContain(CHAMFER_SET)
  })

  it("are the defaults in a drawing saved before, and after NEW", () => {
    const blank = createHarness().runtime.serializeDrawing()
    const cad = createHarness()
    setFilletAndChamfer(cad)
    cad.runtime.loadDrawing(blank)

    expect(opening(cad, "_FILLET")).toContain(FILLET_DEFAULT)
    expect(opening(cad, "_CHAMFER")).toContain(CHAMFER_DEFAULT)

    const fresh = createHarness()
    setFilletAndChamfer(fresh)
    answer(fresh, "_NEW")
    expect(opening(fresh, "_FILLET")).toContain(FILLET_DEFAULT)
    expect(opening(fresh, "_CHAMFER")).toContain(CHAMFER_DEFAULT)
  })
})

describe("TEXTSIZE and TEXT's justification are saved in the drawing (rectang/p311)", () => {
  it("come back with the drawing saved with them", () => {
    const cad = createHarness()
    setText(cad)
    const copy = opened(cad.runtime.serializeDrawing())

    expect(opening(copy, "_TEXT")).toContain(TEXT_SET)
  })

  it("are the defaults in a drawing saved before, and after NEW", () => {
    const blank = createHarness().runtime.serializeDrawing()
    const cad = createHarness()
    setText(cad)
    cad.runtime.loadDrawing(blank)
    expect(opening(cad, "_TEXT")).toContain(TEXT_DEFAULT)

    const fresh = createHarness()
    setText(fresh)
    answer(fresh, "_NEW")
    expect(opening(fresh, "_TEXT")).toContain(TEXT_DEFAULT)
  })
})

// U after FILLET, CHAMFER and -TEXT names each and puts FILLETRAD, CHAMFERA
// and TEXTSIZE back; a FILLET that only set the radius is a step of its own
// (rectang/p317).
describe("U takes back what a command set", () => {
  it("puts FILLETRAD, CHAMFERA/B and TEXTSIZE back, a step per command (rectang/p317)", () => {
    const cad = createHarness()
    setFilletAndChamfer(cad)
    answer(cad, "_TEXT", "5,5", "3", "0", "A", "")
    const from = cad.commandLog().length
    answer(cad, "_U", "_U", "_U")

    expect(cad.commandLog().slice(from)).toEqual([
      "U",
      "TEXT",
      "U",
      "CHAMFER",
      "U",
      "FILLET",
    ])
    expect(cad.runtime.document.getSettings()).toMatchObject({
      filletRadius: 0,
      chamferDistance1: 0,
      chamferDistance2: 0,
      textSize: 2.5,
    })
    expect(opening(cad, "_FILLET")).toContain(FILLET_DEFAULT)
  })

  it("puts TEXT's justification back", () => {
    const cad = createHarness()
    setText(cad)
    answer(cad, "_U")
    expect(opening(cad, "_TEXT")).toContain(TEXT_DEFAULT)
  })

  it("FILLET's own Undo takes a radius given in it back", () => {
    const cad = createHarness()
    answer(cad, "_FILLET", "_R", "3", "_R", "4", "_U")
    expect(cad.runtime.document.getSettings().filletRadius).toBe(3)
    answer(cad, "_U")
    expect(cad.runtime.document.getSettings().filletRadius).toBe(0)
    expect(cad.commandLog().at(-1)).toBe("Command has been completely undone.")
    cad.escape()
  })
})

// ORTHOMODE, SNAPMODE, SNAPUNIT and GRIDMODE: the value after opening the
// drawing saved with it, the default after opening the blank one (rectang/p304,
// p321). F7, F8 and F9 are no command, so no undo step (RECTANG-D44).
describe("ORTHOMODE, SNAPMODE, SNAPUNIT and GRIDMODE are saved in the drawing", () => {
  function aids(cad: CadHarness) {
    const state = cad.state()
    return {
      ortho: state.orthoActive,
      snap: state.snapModeActive,
      spacing: state.snapSpacing,
      grid: state.gridVisible,
    }
  }

  const DEFAULTS = {
    ortho: false,
    snap: false,
    spacing: { x: 10, y: 10 },
    grid: true,
  }
  const SET = { ortho: true, snap: true, spacing: { x: 5, y: 5 }, grid: false }

  function setAids(cad: CadHarness): void {
    cad.press("F8")
    cad.press("F7")
    answer(cad, "_SNAP", "5")
  }

  it("come back with the drawing saved with them (rectang/p304, p321)", () => {
    const cad = createHarness()
    setAids(cad)
    expect(aids(cad)).toEqual(SET)

    expect(aids(opened(cad.runtime.serializeDrawing()))).toEqual(SET)
  })

  it("are the defaults in a drawing saved before, and after NEW (rectang/p304)", () => {
    const blank = createHarness().runtime.serializeDrawing()
    const cad = createHarness()
    setAids(cad)
    cad.runtime.loadDrawing(blank)
    expect(aids(cad)).toEqual(DEFAULTS)

    const fresh = createHarness()
    setAids(fresh)
    answer(fresh, "_NEW")
    expect(aids(fresh)).toEqual(DEFAULTS)
  })

  it("F9 is saved, and F10 turning Ortho off is too", () => {
    const cad = createHarness()
    cad.press("F9")
    cad.press("F8")
    expect(cad.runtime.document.getSettings().orthoMode).toBe(true)
    cad.press("F10")
    expect(cad.runtime.document.getSettings().orthoMode).toBe(false)
    expect(aids(opened(cad.runtime.serializeDrawing()))).toMatchObject({
      ortho: false,
      snap: true,
    })
  })

  it("U takes SNAP back, as it takes ORTHO back (rectang/p317)", () => {
    const cad = createHarness()
    answer(cad, "_SNAP", "5")
    const from = cad.commandLog().length
    answer(cad, "_U")

    expect(cad.commandLog().slice(from)).toEqual(["U", "SNAP"])
    expect(aids(cad)).toMatchObject({ snap: false, spacing: { x: 10, y: 10 } })
  })

  it("an F-key toggle is no undo step", () => {
    const cad = createHarness()
    answer(cad, "_LINE", "0,0", "10,0", "")
    cad.press("F8")
    answer(cad, "_U")

    expect(cad.entityCount).toBe(0)
    expect(aids(cad).ortho).toBe(true)
  })
})
