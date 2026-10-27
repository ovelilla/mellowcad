import { describe, expect, it } from "vitest"

import { type CadHarness, createHarness } from "../../test/harness"
import { circleOf, lineOf, p } from "../../test/builders"
import { es } from "../locales/es"
import type { LineEntity } from "../domain/entities"

/** Typed at the command line and confirmed, as AutoCAD's prompt reads it. */
function answerLine(cad: CadHarness, text: string): CadHarness {
  cad.runtime.setCommandLineText(text)
  cad.runtime.submitCommandLine()
  return cad
}

const ZOOM_PROMPT =
  ">>Specify corner of window, enter a scale factor (nX or nXP), or [All/Extents/Previous/Scale/Window/Object]:"

/** LINE started at 0,0, a command typed after it. */
function lineThen(cad: CadHarness, ...texts: string[]): CadHarness {
  cad.command(cad.runtime.text.commandNames("LINE")[0]).click(p(0, 0))
  for (const text of texts) answerLine(cad, text)
  return cad
}

// AutoCAD's console typing each at LINE's `Specify next point or [Undo]:`
// (2023's; DIST and ID 2027's); the reports a transparent command writes are
// not headed `>>`.
describe("the other commands AutoCAD runs transparently", () => {
  // probes inquiry/p321, p320
  it("measures with DIST and ID, and LINE goes on from its own point", () => {
    const cad = lineThen(cad0(), "'DIST", "0,0", "3,4")
    expect(cad.commandLog().slice(-5)).toEqual([
      "Specify next point or [Undo]: 'DIST",
      ">>Specify first point: 0,0",
      ">>Specify second point or [Multiple points]: 3,4",
      "Distance = 5.00,  Angle in XY Plane = 53,  Angle from XY Plane = 0\nDelta X = 3.00,  Delta Y = 4.00,   Delta Z = 0.00",
      "Resuming LINE command.",
    ])
    answerLine(cad, "'ID")
    answerLine(cad, "5,6")
    expect(cad.commandLog().slice(-4)).toEqual([
      "Specify next point or [Undo]: 'ID",
      ">>Specify point: 5,6",
      " X = 5.00     Y = 6.00     Z = 0.00",
      "Resuming LINE command.",
    ])
    answerLine(cad, "@10,0")
    expect(cad.entities()[0]).toMatchObject({ end: { x: 10, y: 0 } })
  })

  it("queues the regeneration LTSCALE and ATTDISP ask for until LINE ends", () => {
    const cad = lineThen(cad0(), "'LTSCALE", "2", "'ATTDISP", "ON")
    expect(cad.commandLog().slice(-8)).toEqual([
      "Specify next point or [Undo]: 'LTSCALE",
      ">>Enter new linetype scale factor <1.0000>: 2",
      "Regen queued.",
      "Resuming LINE command.",
      "Specify next point or [Undo]: 'ATTDISP",
      ">>Enter attribute visibility setting [Normal/ON/OFF] <Normal>: ON",
      "Regen queued.",
      "Resuming LINE command.",
    ])
    expect(cad.state().ltScale).toBe(2)
    cad.click(p(10, 0)).enter()
    expect(cad.commandLog().slice(-2)).toEqual([
      "Specify next point or [Undo]:",
      "Regenerating model.",
    ])
    // The same value changes nothing, so nothing is regenerated.
    lineThen(cad, "'LTSCALE", "2")
    expect(cad.commandLog().slice(-2)).toEqual([
      ">>Enter new linetype scale factor <2.0000>: 2",
      "Resuming LINE command.",
    ])
    cad.escape()
    expect(cad.commandLog().at(-1)).not.toBe("Regenerating model.")
  })

  // probe line/p19
  it("takes the global names typed with an apostrophe", () => {
    const cad = lineThen(cad0(), "'_-OSNAP", "_END")
    expect(cad.commandLog().slice(-4)).toEqual([
      // Echoed with the command language's name: the coverage's WHY.
      "Specify next point or [Undo]: '-OSNAP",
      "Current osnap modes: End,Cen,Int,Ext",
      ">>Enter list of object snap modes: _END",
      "Resuming LINE command.",
    ])
    expect(cad.activeToolId()).toBe("line")
  })

  it("sets the running object snaps and the current properties", () => {
    const cad = lineThen(cad0(), "'-OSNAP", "FOO")
    expect(cad.commandLog().slice(-4)).toEqual([
      "Specify next point or [Undo]: '-OSNAP",
      "Current osnap modes: End,Cen,Int,Ext",
      ">>Enter list of object snap modes: FOO",
      "Invalid object snap modes.",
    ])
    answerLine(cad, "END")
    expect(cad.commandLog().at(-1)).toBe("Resuming LINE command.")
    answerLine(cad, "'-COLOR")
    answerLine(cad, "1")
    expect(cad.commandLog().slice(-2)).toEqual([
      ">>Enter default object color [Truecolor] <BYLAYER>: 1",
      "Resuming LINE command.",
    ])
    // WHY twice: the console writes the current lineweight as two prompts.
    answerLine(cad, "'-LWEIGHT")
    expect(cad.commandLog().at(-1)).toBe(">>Current lineweight: >>BYLAYER")
    answerLine(cad, "0.3")
    answerLine(cad, "'ELEV")
    answerLine(cad, "5")
    answerLine(cad, "0")
    expect(cad.commandLog().slice(-3)).toEqual([
      ">>Specify new default elevation <0.00>: 5",
      ">>Specify new default thickness <0.00>: 0",
      "Resuming LINE command.",
    ])
    expect(cad.activeToolId()).toBe("line")
    cad.click(p(10, 0))
    expect(cad.entities()[0]).toMatchObject({
      color: "#ff0000",
      lineweight: 0.3,
    })
  })

  it("refuses -VIEW's views, which need a regeneration", () => {
    const cad = lineThen(cad0(), "'-VIEW", "O", "F")
    expect(cad.commandLog().slice(-4)).toEqual([
      ">>Enter an option [Orthographic]: O",
      ">>Enter an option [Top/Bottom/Front/BAck/Left/Right]<Top>: F",
      "** Requires a regen, cannot be transparent.",
      "Resuming LINE command.",
    ])
    const { up } = cad.runtime.viewport
    expect([up.x, up.y, up.z]).toEqual(
      [0, 1, 0].map((v) => expect.closeTo(v, 12))
    )
  })

  // SNAP asks its spacing (2027's console, probe line/p158); UNITS' dialog
  // asks nothing at the command line.
  it("asks SNAP's spacing, and runs in place what asks nothing, as UNITS", () => {
    const cad = lineThen(cad0(), "'SNAP", "5")
    expect(cad.commandLog().slice(-3)).toEqual([
      "Specify next point or [Undo]: 'SNAP",
      ">>Specify snap spacing or [ON/OFF/Aspect] <10.00>: 5",
      "Resuming LINE command.",
    ])
    expect(cad.state().snapModeActive).toBe(true)
    answerLine(cad, "'UN")
    expect(cad.state().unitsDialog).toBe(true)
    expect(cad.commandLog().slice(-2)).toEqual([
      "Specify next point or [Undo]: 'UN 'UNITS",
      "Resuming LINE command.",
    ])
    expect(cad.activeToolId()).toBe("line")
  })

  it("refuses what AutoCAD does not run transparently", () => {
    const cad = lineThen(cad0())
    for (const command of ["'UCS", "'PLAN", "'-VPOINT", "'ERASE", "'VIEW"]) {
      answerLine(cad, command)
      expect(cad.commandLog().slice(-2)).toEqual([
        "** That command may not be invoked transparently **",
        "Point or option keyword required.",
      ])
    }
    expect(cad.activeToolId()).toBe("line")
  })

  it("runs them in Spanish", () => {
    const cad = lineThen(createHarness({ locale: es }), "'EC", "2")
    expect(cad.commandLog().slice(-4)).toEqual([
      "Precise punto siguiente o [desHacer]: 'EC 'ESCALATL",
      ">>Indique nuevo factor de escala del tipo de línea <1.0000>: 2",
      "La regeneración está en espera.",
      "Reanudando el comando LINEA.",
    ])
    answerLine(cad, "'-VISTA")
    answerLine(cad, "_TOP")
    expect(cad.commandLog().slice(-2)).toEqual([
      "** Regeneración necesaria, no puede ser transparente.",
      "Reanudando el comando LINEA.",
    ])
    answerLine(cad, "'SCP")
    expect(cad.commandLog().slice(-2)).toEqual([
      "** Este comando no funciona de forma transparente **",
      "Se requiere un punto o una opción.",
    ])
    cad.escape()
    expect(cad.commandLog().at(-1)).toBe("Regenerando modelo.")
  })
})

function cad0(): CadHarness {
  return createHarness()
}

// AutoCAD 2027's console (probes view/p143, p144): `'ZOOM` typed at LINE's prompt asks ZOOM's
// questions headed `>>`, and once ZOOM is done says `Resuming LINE command.`
// and asks LINE's again.
describe("a transparent command", () => {
  it("runs inside the running command, which then resumes", () => {
    const cad = createHarness()
    cad.command("LINE").click(p(0, 0))
    answerLine(cad, "'ZOOM")
    expect(cad.activeToolId()).toBe("zoom")
    expect(cad.state().commandLine.prompt).toBe(`'ZOOM ${ZOOM_PROMPT}`)
    answerLine(cad, "2X")
    expect(cad.commandLog().slice(-3)).toEqual([
      "Specify next point or [Undo]: 'ZOOM",
      `${ZOOM_PROMPT} 2X`,
      "Resuming LINE command.",
    ])
    expect(cad.activeToolId()).toBe("line")
    expect(cad.state().commandLine.prompt).toBe(
      "LINE Specify next point or [Undo]:"
    )
    cad.click(p(100, 0)).click(p(100, 100)).escape()
    expect(cad.typeCounts().line).toBe(2)
    // The zoom is part of LINE's step: U takes back the two lines and the
    // zoom (probe view/p358).
    const zoomed = cad.runtime.viewport.scale
    cad.undo()
    expect(cad.typeCounts().line ?? 0).toBe(0)
    expect(cad.runtime.viewport.scale).toBeCloseTo(zoomed / 2, 9)
  })

  it("is typed by its alias, echoed with its name", () => {
    const cad = createHarness()
    cad.command("LINE").click(p(0, 0))
    answerLine(cad, "'z")
    expect(cad.commandLog().at(-1)).toBe(
      "Specify next point or [Undo]: 'z 'ZOOM"
    )
    expect(cad.activeToolId()).toBe("zoom")
  })

  it("heads its sub-prompts too, and Escape cancels only it", () => {
    const cad = createHarness()
    cad.command("LINE").click(p(0, 0))
    answerLine(cad, "'ZOOM")
    answerLine(cad, "W")
    expect(cad.state().commandLine.prompt).toBe("'ZOOM >>Specify first corner:")
    cad.escape()
    expect(cad.commandLog().slice(-2)).toEqual([
      ">>Specify first corner: *Cancel*",
      "Resuming LINE command.",
    ])
    expect(cad.activeToolId()).toBe("line")
    cad.click(p(50, 0))
    expect(cad.typeCounts().line).toBe(1)
  })

  it("is typed in the box too", () => {
    const cad = createHarness()
    cad.command("LINE").click(p(0, 0)).moveTo(p(10, 10))
    cad.type("'Z").enter()
    expect(cad.activeToolId()).toBe("zoom")
    cad.enter()
    expect(cad.commandLog().slice(-2)).toEqual([
      ZOOM_PROMPT,
      "Resuming LINE command.",
    ])
    expect(cad.state().dynamicInput?.fields[0]?.value).toBe("")
  })

  it("pans, its exit prompt headed as a prompt", () => {
    const cad = createHarness()
    cad.command("LINE").click(p(0, 0))
    answerLine(cad, "'P")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Specify next point or [Undo]: 'P 'PAN",
      ">>Press ESC or ENTER to exit, or right-click to display shortcut menu.",
    ])
    cad.enter()
    expect(cad.commandLog().at(-1)).toBe("Resuming LINE command.")
    expect(cad.activeToolId()).toBe("line")
  })

  // probe view/p145: Object always regenerates, so a transparent one refuses.
  it("keeps the running command's selection set", () => {
    const cad = createHarness({
      entities: [
        lineOf(p(0, 0), p(100, 0), { id: "A" }),
        lineOf(p(0, 50), p(100, 50), { id: "B" }),
      ],
    })
    cad.command("MOVE").click(p(50, 0)).enter()
    answerLine(cad, "'ZOOM")
    answerLine(cad, "O")
    expect(cad.state().commandLine.prompt).toBe("'ZOOM >>Select objects:")
    answerLine(cad, "ALL")
    cad.enter()
    expect(cad.commandLog().slice(-6)).toEqual([
      `${ZOOM_PROMPT} O`,
      ">>Select objects: ALL",
      "2 found",
      ">>Select objects:",
      "** Requires a regen, cannot be transparent.",
      "Resuming MOVE command.",
    ])
    expect(cad.activeToolId()).toBe("move")
    expect(cad.selectedIds()).toEqual(["A"])
    answerLine(cad, "0,0")
    answerLine(cad, "0,10")
    const moved = cad.entities().find((entity) => entity.id === "A")
    expect(moved).toMatchObject({ start: { x: 0, y: 10 } })
    expect(cad.entities().find((entity) => entity.id === "B")).toMatchObject({
      start: { x: 0, y: 50 },
    })
  })

  // probe transforms/p204: at the second of two points the runtime measures,
  // the first is kept for after it.
  it("keeps the first of two measuring points", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "A" })],
    })
    for (const typed of ["SCALE", "L", "", "0,0", "R", "10", "P", "10,0"])
      answerLine(cad, typed)
    answerLine(cad, "'ZOOM")
    answerLine(cad, "E")
    expect(cad.commandLog().slice(-2)).toEqual([
      `${ZOOM_PROMPT} E`,
      "Resuming SCALE command.",
    ])
    expect(cad.state().commandLine.prompt).toBe("SCALE Specify second point:")
    answerLine(cad, "30,0")
    expect(cad.commandLog().at(-1)).toBe(" Specify second point: 30,0")
    expect(cad.byId<LineEntity>("A").end).toBeCloseToPoint(p(200, 0))
  })

  // probes offset/p150–p153: OFFSET's Erase, Layer, object and side prompts.
  it("resumes OFFSET at the prompt it interrupted", () => {
    for (const [answers, prompt] of [
      [["E"], "Erase source object after offsetting? [Yes/No] <No>:"],
      [
        ["L"],
        "Enter layer option for offset objects [Current/Source] <Source>:",
      ],
      [["10"], "Select object to offset or [Exit/Undo] <Exit>:"],
      [
        ["10", "50,0"],
        "Specify point on side to offset or [Exit/Multiple/Undo] <Exit>:",
      ],
    ] as const) {
      const cad = createHarness({
        entities: [lineOf(p(0, 0), p(100, 0), { id: "A" })],
      })
      cad.command("OFFSET")
      for (const typed of answers) answerLine(cad, typed)
      answerLine(cad, "'ZOOM")
      answerLine(cad, "E")
      expect(cad.commandLog().slice(-3)).toEqual([
        `${prompt} 'ZOOM`,
        `${ZOOM_PROMPT} E`,
        "Resuming OFFSET command.",
      ])
      expect(cad.state().commandLine.prompt).toBe(`OFFSET ${prompt}`)
    }
  })

  // probe view/p145, both languages: Object refuses, the view left.
  it("refuses a transparent Object, which needs a regen", () => {
    for (const [locale, line, refusal, resuming] of [
      [
        undefined,
        "LINE",
        "** Requires a regen, cannot be transparent.",
        "Resuming LINE command.",
      ],
      [
        es,
        "LINEA",
        "** Regeneración necesaria, no puede ser transparente.",
        "Reanudando el comando LINEA.",
      ],
    ] as const) {
      const cad = createHarness({
        locale,
        entities: [lineOf(p(0, 0), p(100, 50))],
      })
      answerLine(cad, "_ZOOM")
      answerLine(cad, "_E")
      const scale = cad.state().scale
      const center = cad.runtime.viewport.worldCenter()
      for (const typed of [line, "0,0", "'_ZOOM", "_O", "_L", ""])
        answerLine(cad, typed)
      expect(cad.commandLog().slice(-2)).toEqual([refusal, resuming])
      expect(cad.state().scale).toBe(scale)
      expect(cad.runtime.viewport.worldCenter()).toBeCloseToPoint(center)
      expect(cad.activeToolId()).toBe("line")
    }
  })

  // AutoCAD's transparent ZOOM cannot regenerate: it zooms without a word
  // when it needs no regeneration, which here is whenever something is drawn
  // (probe line/p112).
  it("zooms to the extents or all without regenerating", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(1000, 500), { id: "A" })],
    })
    cad.command("LINE").click(p(0, 0))
    const before = cad.state().scale
    answerLine(cad, "'ZOOM")
    answerLine(cad, "E")
    expect(cad.commandLog().slice(-2)).toEqual([
      `${ZOOM_PROMPT} E`,
      "Resuming LINE command.",
    ])
    expect(cad.state().scale).not.toBe(before)
    answerLine(cad, "'ZOOM")
    answerLine(cad, "A")
    expect(cad.commandLog().slice(-2)).toEqual([
      `${ZOOM_PROMPT} A`,
      "Resuming LINE command.",
    ])
    cad.escape()
    // Not transparently, Object still regenerates (probe view/p139).
    answerLine(cad, "ZOOM")
    answerLine(cad, "O")
    answerLine(cad, "L")
    cad.enter()
    expect(cad.commandLog().at(-1)).toBe("Regenerating model.")
  })

  // probes arrays/p155 (a transparent command at ARRAYRECT's count,
  // getint's, resumes it there) and p154, p158 ('_ZOOM _E at its point and
  // distance prompts). WHY 'ZOOM here, not p155's 'ORTHOMODE: ORTHOMODE is
  // no variable yet (drafting-aids, Missing). POLYGON's sides is a number box
  // too, unprobed.
  it("runs at a number prompt as at a distance one", () => {
    const cad = createHarness({
      entities: [circleOf(p(10, 10), 2, { id: "C" })],
    })
    answerLine(cad, "_ARRAYRECT")
    answerLine(cad, "_L")
    answerLine(cad, "")
    answerLine(cad, "_COU")
    answerLine(cad, "'_ZOOM")
    answerLine(cad, "_E")
    answerLine(cad, "3")
    expect(cad.commandLog().slice(-4)).toEqual([
      "Enter the number of columns <4>: 'ZOOM",
      `${ZOOM_PROMPT} _E`,
      "Resuming ARRAYRECT command.",
      "Enter the number of columns <4>: 3",
    ])
    cad.escape()

    answerLine(cad, "_POLYGON")
    answerLine(cad, "'_ZOOM")
    answerLine(cad, "_E")
    answerLine(cad, "5")
    expect(cad.commandLog().slice(-4)).toEqual([
      "Enter number of sides <4>: 'ZOOM",
      `${ZOOM_PROMPT} _E`,
      "Resuming POLYGON command.",
      "Enter number of sides <4>: 5",
    ])
    expect(cad.state().commandLine.prompt).toBe(
      "POLYGON Specify center of polygon or [Edge]:"
    )
  })

  // probe line/p19: an empty drawing's extents need a regeneration, so a
  // transparent Extents or All refuses and the view stays.
  it("refuses Extents and All in an empty drawing, which need a regen", () => {
    const cad = createHarness()
    cad.command("LINE").click(p(0, 0))
    const before = cad.state().scale
    for (const option of ["E", "A"]) {
      answerLine(cad, "'ZOOM")
      answerLine(cad, option)
      expect(cad.commandLog().slice(-3)).toEqual([
        `${ZOOM_PROMPT} ${option}`,
        "** Requires a regen, cannot be transparent.",
        "Resuming LINE command.",
      ])
    }
    expect(cad.state().scale).toBe(before)
    // A factor needs none.
    answerLine(cad, "'ZOOM")
    answerLine(cad, "2")
    expect(cad.commandLog().at(-1)).toBe("Resuming LINE command.")
    expect(cad.state().scale).not.toBe(before)
    // Once the first segment is drawn, Extents runs.
    cad.click(p(100, 0))
    const drawn = cad.state().scale
    answerLine(cad, "'ZOOM")
    answerLine(cad, "E")
    expect(cad.commandLog().at(-1)).toBe("Resuming LINE command.")
    expect(cad.state().scale).not.toBe(drawn)
  })

  it("refuses an empty drawing's Extents in Spanish", () => {
    const cad = createHarness({ locale: es })
    cad.command("LINEA").click(p(0, 0))
    answerLine(cad, "'ZOOM")
    answerLine(cad, "E")
    expect(cad.commandLog().slice(-2)).toEqual([
      "** Regeneración necesaria, no puede ser transparente.",
      "Reanudando el comando LINEA.",
    ])
  })

  it("zooms without regenerating in Spanish too", () => {
    const cad = createHarness({
      locale: es,
      entities: [lineOf(p(0, 0), p(1000, 500))],
    })
    cad.command("LINEA").click(p(0, 0))
    answerLine(cad, "'ZOOM")
    answerLine(cad, "E")
    expect(cad.commandLog().at(-1)).toBe("Reanudando el comando LINEA.")
  })

  it("refuses a command that cannot run transparently, saying why", () => {
    const cad = createHarness()
    cad.command("LINE").click(p(0, 0))
    answerLine(cad, "'LINE")
    expect(cad.commandLog().slice(-3)).toEqual([
      "Specify next point or [Undo]: 'LINE",
      "** That command may not be invoked transparently **",
      "Point or option keyword required.",
    ])
    answerLine(cad, "'FOO")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Specify next point or [Undo]: 'FOO",
      "Point or option keyword required.",
    ])
    expect(cad.activeToolId()).toBe("line")
  })

  it("is refused inside another, as its prompt refuses any answer", () => {
    const cad = createHarness()
    cad.command("LINE").click(p(0, 0))
    answerLine(cad, "'ZOOM")
    answerLine(cad, "'ZOOM")
    expect(cad.commandLog().slice(-2)).toEqual([
      `${ZOOM_PROMPT} 'ZOOM`,
      "Requires a distance, numberX, or option keyword.",
    ])
    expect(cad.activeToolId()).toBe("zoom")
  })

  it("is refused inside itself, as any answer", () => {
    const cad = createHarness()
    answerLine(cad, "ZOOM")
    answerLine(cad, "W")
    answerLine(cad, "'ZOOM")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Specify first corner: 'ZOOM",
      "Invalid window specification.",
    ])
    expect(cad.state().commandLine.prompt).toBe("ZOOM Specify first corner:")
    answerLine(cad, "'PAN")
    expect(cad.activeToolId()).toBe("pan")
    cad.enter()
    expect(cad.commandLog().at(-1)).toBe("Resuming ZOOM command.")
    expect(cad.state().commandLine.prompt).toBe("ZOOM Specify first corner:")
    cad.escape()

    answerLine(cad, "PAN")
    cad.runtime.navigate("PAN")
    expect(cad.activeToolId()).toBe("pan")
    expect(cad.commandLog().at(-1)).not.toBe("Resuming PAN command.")
  })

  // probe line/p40
  it("just runs at the Command prompt", () => {
    const cad = createHarness()
    answerLine(cad, "'ZOOM")
    expect(cad.commandLog()).toEqual(["'ZOOM"])
    expect(cad.state().commandLine.prompt).toBe(
      "ZOOM Specify corner of window, enter a scale factor (nX or nXP), or [All/Extents/Previous/Scale/Window/Object]:"
    )
    // Not transparent there, so an empty drawing's Extents regenerates.
    answerLine(cad, "_E")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Specify corner of window, enter a scale factor (nX or nXP), or [All/Extents/Previous/Scale/Window/Object]: _E",
      "Regenerating model.",
    ])
    answerLine(cad, "'_LINE")
    expect(cad.commandLog().slice(-2)).toEqual([
      "'LINE",
      "** That command may not be invoked transparently **",
    ])
    answerLine(cad, "'L")
    expect(cad.commandLog().slice(-2)).toEqual([
      "'L 'LINE",
      "** That command may not be invoked transparently **",
    ])
    expect(cad.activeToolId()).toBe("select")
    for (const typed of ["FOO", "'FOO"]) {
      answerLine(cad, typed)
      expect(cad.commandLog().at(-1)).toBe(
        'Unknown command "FOO".  Press F1 for help.'
      )
    }
  })

  it("ends with the one it interrupted on ^C^C and on U", () => {
    const cad = createHarness()
    cad.command("LINE").click(p(0, 0)).click(p(100, 0))
    answerLine(cad, "'ZOOM")
    cad.runtime.cancelCommand()
    expect(cad.activeToolId()).toBe("select")
    expect(cad.typeCounts().line).toBe(1)

    cad.command("LINE").click(p(0, 50)).click(p(100, 50))
    answerLine(cad, "'P")
    cad.undo()
    expect(cad.activeToolId()).toBe("select")
    expect(cad.typeCounts().line).toBe(1)
  })

  // The navigation bar's buttons run AutoCAD's macros '_pan and '_zoom _w,
  // the answer typed as the macro types it.
  it("is what the navigation bar's Pan and Zoom Window run", () => {
    const cad = createHarness()
    cad.command("LINE").click(p(0, 0)).moveTo(p(10, 10))
    cad.type("12")
    cad.runtime.navigate("ZOOM", "_w")
    expect(cad.state().commandLine.prompt).toBe("'ZOOM >>Specify first corner:")
    cad.click(p(0, 0)).click(p(50, 50))
    expect(cad.commandLog().slice(-4)).toEqual([
      "Specify next point or [Undo]: 'ZOOM",
      `${ZOOM_PROMPT} _w`,
      ">>Specify first corner: >>Specify opposite corner:",
      "Resuming LINE command.",
    ])
    // A button types nothing at the prompt, so what was typed there stays.
    expect(cad.state().dynamicInput?.fields[0]?.value).toBe("12")
    cad.runtime.navigate("PAN")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Specify next point or [Undo]: 'PAN",
      ">>Press ESC or ENTER to exit, or right-click to display shortcut menu.",
    ])
    cad.enter()
    expect(cad.activeToolId()).toBe("line")
    cad.escape()

    cad.runtime.navigate("PAN")
    expect(cad.commandLog().slice(-2)).toEqual([
      "'PAN",
      "Press ESC or ENTER to exit, or right-click to display shortcut menu.",
    ])
    cad.escape()
    cad.runtime.navigate("ZOOM", "_w")
    expect(cad.state().commandLine.prompt).toBe("ZOOM Specify first corner:")
  })

  // acad.cuix (en-us, es-es) ID_Id is `'_id `: the rail's ID runs inside
  // LINE as `'_ID` typed there does (probe inquiry/p320).
  it("is what the rail's ID runs, LINE resuming from its own point", () => {
    const cad = createHarness()
    cad.command("LINE").click(p(0, 0))
    cad.tool("id")
    expect(cad.activeToolId()).toBe("id")
    expect(cad.state().commandLine.prompt).toBe("'ID >>Specify point:")
    answerLine(cad, "10,10")
    expect(cad.commandLog().slice(-4)).toEqual([
      "Specify next point or [Undo]: '_id",
      ">>Specify point: 10,10",
      " X = 10.00     Y = 10.00     Z = 0.00",
      "Resuming LINE command.",
    ])
    expect(cad.activeToolId()).toBe("line")
    answerLine(cad, "@5,0")
    expect(cad.entities()[0]).toMatchObject({ end: { x: 5, y: 0 } })
    cad.escape()

    cad.tool("id")
    expect(cad.commandLog().at(-1)).toBe("'_id")
    answerLine(cad, "1,2")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Specify point: 1,2",
      " X = 1.00     Y = 2.00     Z = 0.00",
    ])
  })

  it("asks and resumes in Spanish", () => {
    const cad = createHarness({ locale: es })
    cad.command("LINEA").click(p(0, 0))
    answerLine(cad, "'ZOOM")
    expect(cad.state().commandLine.prompt).toMatch(/^'ZOOM >>/)
    answerLine(cad, "2X")
    expect(cad.commandLog().at(-1)).toBe("Reanudando el comando LINEA.")
    answerLine(cad, "'LINEA")
    expect(cad.commandLog().slice(-2)).toEqual([
      "** Este comando no funciona de forma transparente **",
      "Se requiere un punto o una opción.",
    ])
    answerLine(cad, "'E")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Precise punto siguiente o [desHacer]: 'E 'ENCUADRE",
      ">>Pulse Esc o Intro para salir, o haga clic con el botón derecho para activar el menú contextual.",
    ])
    cad.enter()
    cad.runtime.navigate("ZOOM", "_w")
    expect(cad.state().commandLine.prompt).toBe(
      "'ZOOM >>Designe primera esquina:"
    )
    cad.escape().escape()
    answerLine(cad, "ZOOM")
    answerLine(cad, "V")
    answerLine(cad, "'ZOOM")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Designe primera esquina: 'ZOOM",
      "Designación de ventana no válida.",
    ])
  })
})

// AutoCAD 2027's desktop (research/probes/view d04, VWD-08): its exit words
// are a report, not a prompt, so they take no `>>`.
describe("'3DORBIT", () => {
  it("runs at LINE's prompt and U takes it with LINE", () => {
    const answer = (cad: CadHarness, ...texts: string[]) => {
      for (const text of texts) answerLine(cad, text)
      return cad
    }
    const written = (cad: CadHarness, ...texts: string[]) => {
      const from = cad.commandLog().length
      answer(cad, ...texts)
      return cad.commandLog().slice(from)
    }
    const cad = answer(
      createHarness({ entities: [lineOf(p(0, 0), p(100, 50))] }),
      "_LINE",
      "200,200",
      "210,200",
      "",
      "_LINE",
      "0,0",
      "10,0"
    )
    expect(written(cad, "'3DORBIT", "")).toEqual([
      "Specify next point or [Undo]: '3DORBIT",
      "Press ESC or ENTER to exit, or right-click to display shortcut-menu.",
      "Regenerating model.",
      "Resuming LINE command.",
    ])
    answer(cad, "20,0", "")
    expect(written(cad, "U")).toEqual(["U", "LINE Regenerating model."])
  })
})
