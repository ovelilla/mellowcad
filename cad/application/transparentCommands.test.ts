import { describe, expect, it } from "vitest"

import { type CadHarness, createHarness } from "../../test/harness"
import { lineOf, p } from "../../test/builders"
import { es } from "../locales/es"

/** Typed at the command line and confirmed, as AutoCAD's prompt reads it. */
function answerLine(cad: CadHarness, text: string): CadHarness {
  cad.runtime.setCommandLineText(text)
  cad.runtime.submitCommandLine()
  return cad
}

const ZOOM_PROMPT =
  ">>Specify corner of window, enter a scale factor (nX or nXP), or [All/Extents/Previous/Scale/Window/Object]:"

// AutoCAD 2023's console: `'ZOOM` typed at LINE's prompt asks ZOOM's
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
    // The zoom is no step of LINE's: U takes back the two lines.
    cad.undo()
    expect(cad.typeCounts().line ?? 0).toBe(0)
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
      "Regenerating model.",
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

  it("just runs at the Command prompt", () => {
    const cad = createHarness()
    answerLine(cad, "'ZOOM")
    expect(cad.commandLog()).toEqual(["'ZOOM"])
    expect(cad.state().commandLine.prompt).toBe(
      "ZOOM Specify corner of window, enter a scale factor (nX or nXP), or [All/Extents/Previous/Scale/Window/Object]:"
    )
    cad.escape()
    answerLine(cad, "'L")
    expect(cad.commandLog().slice(-2)).toEqual([
      "'L 'LINE",
      "** That command may not be invoked transparently **",
    ])
    expect(cad.activeToolId()).toBe("select")
    answerLine(cad, "'FOO")
    expect(cad.commandLog().at(-1)).toBe('Unknown command "FOO".')
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
  })
})
