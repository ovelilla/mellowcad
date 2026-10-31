import { describe, expect, it } from "vitest"
import { lineEndZ, lineStartZ } from "../../domain/entities"
import { createHarness, type CadHarness } from "../../../test/harness"

/**
 * OSNAPZ 1: an object snap found as under 0, then given ELEVATION's Z in the
 * UCS. Each case a console probe of AutoCAD 2027,
 * scripts/research/probes/osnapz/ (the same in en-US, es-ES and pt-BR).
 */

/** Each answer typed at the command line and confirmed, as the console types it. */
function answer(cad: CadHarness, ...texts: string[]): CadHarness {
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

/** The console's drawing: LUPREC 4, the probes' window. */
function drawing(...answers: string[]): CadHarness {
  const cad = answer(createHarness(), "LUPREC", "4", "ZOOM", "W")
  answer(cad, "-50,-50", "150,150", ...answers)
  return cad
}

/** What `texts` wrote in the history. */
function written(cad: CadHarness, ...texts: string[]): string[] {
  const from = cad.commandLog().length
  answer(cad, ...texts)
  return cad.commandLog().slice(from)
}

/** The line ID writes for the point `answers` give it. */
function identified(cad: CadHarness, ...answers: string[]): string {
  answer(cad, "ID", ...answers)
  return cad.commandLog().at(-1)!.trim()
}

/** The last line's two ends, rounded as the console prints them. */
function lastLine(cad: CadHarness): number[][] {
  const line = cad.latest()
  if (line.type !== "line") throw new Error(`expected a line, got ${line.type}`)
  const round = (value: number) => Math.round(value * 1e4) / 1e4 + 0
  return [
    [line.start.x, line.start.y, lineStartZ(line)].map(round),
    [line.end.x, line.end.y, lineEndZ(line)].map(round),
  ]
}

const at = (x: string, y: string, z: string) =>
  `X = ${x}     Y = ${y}     Z = ${z}`

describe("OSNAPZ 1", () => {
  // probe osnapz/o04
  it("puts every snap at the elevation", () => {
    const cad = drawing(
      ...["LINE", "0,0,10", "100,0,30", ""],
      ...["CIRCLE", "50,50,10", "20"],
      ...["LINE", "0,100,10", "100,100,10", ""],
      ...["LINE", "80,-20,10", "80,120,10", ""],
      ...["-TEXT", "20,-30,7", "5", "0", "T"],
      ...["OSNAPZ", "1"]
    )
    for (const [snap, pick, x, y] of [
      ["_END", "99,0", "100.0000", "0.0000"],
      ["_MID", "50,1", "50.0000", "0.0000"],
      ["_NEA", "25,0", "25.0000", "0.0000"],
      ["_CEN", "70,50", "50.0000", "50.0000"],
      ["_QUA", "50,70", "50.0000", "70.0000"],
      ["_INT", "80,100", "80.0000", "100.0000"],
      ["_APP", "80,100", "80.0000", "100.0000"],
      ["_INS", "20,-30", "20.0000", "-30.0000"],
    ]) {
      expect(identified(cad, snap, pick)).toBe(at(x, y, "0.0000"))
    }
    answer(cad, "ELEVATION", "5")
    expect(identified(cad, "_END", "99,0")).toBe(
      at("100.0000", "0.0000", "5.0000")
    )
    expect(identified(cad, "_CEN", "70,50")).toBe(
      at("50.0000", "50.0000", "5.0000")
    )
    expect(identified(cad, "_INT", "80,100")).toBe(
      at("80.0000", "100.0000", "5.0000")
    )
    answer(cad, "ELEVATION", "0", "OSNAPZ", "0")
    expect(identified(cad, "_END", "99,0")).toBe(
      at("100.0000", "0.0000", "30.0000")
    )
    expect(identified(cad, "_INT", "80,100")).toBe(
      at("80.0000", "100.0000", "10.0000")
    )
  })

  // probe osnapz/o05
  it("finds a Perpendicular foot and a Tangent point in 3D first", () => {
    const cad = drawing(
      ...["LINE", "0,0,0", "100,0,100", ""],
      ...["CIRCLE", "50,60,20", "10"]
    )
    answer(cad, "LINE", "50,50,0", "_PER", "60,0", "")
    expect(lastLine(cad)).toEqual([
      [50, 50, 0],
      [25, 0, 25],
    ])
    answer(cad, "OSNAPZ", "1", "LINE", "50,50,0", "_PER", "60,0", "")
    expect(lastLine(cad)).toEqual([
      [50, 50, 0],
      [25, 0, 0],
    ])
    answer(cad, "LINE", "50,30,0", "_TAN", "60,60", "")
    expect(lastLine(cad)).toEqual([
      [50, 30, 0],
      [59.4281, 56.6667, 0],
    ])
    answer(cad, "ELEVATION", "7", "LINE", "50,50,0", "_PER", "60,0", "")
    expect(lastLine(cad)).toEqual([
      [50, 50, 0],
      [25, 0, 7],
    ])
    answer(cad, "LINE", "_END", "99,0", "@10,0", "")
    expect(lastLine(cad)).toEqual([
      [100, 0, 7],
      [110, 0, 7],
    ])
  })

  // probe osnapz/o06
  it("puts the snap at the elevation of the UCS, turned or tilted", () => {
    const cad = drawing(
      ...["LINE", "0,0,10", "100,0,30", ""],
      ...["UCS", "Z", "30", "OSNAPZ", "1", "ELEVATION", "5"]
    )
    expect(identified(cad, "_END", "86.6,-50")).toBe(
      at("86.6025", "-50.0000", "5.0000")
    )
    answer(cad, "ELEVATION", "0", "UCS", "W", "UCS", "X", "90")
    answer(cad, "ELEVATION", "5")
    expect(identified(cad, "_END", "100,30,0")).toBe(
      at("100.0000", "30.0000", "5.0000")
    )
    expect(identified(cad, "_MID", "50,20,0")).toBe(
      at("50.0000", "20.0000", "5.0000")
    )
  })

  // probe osnapz/o07; its circle seen edge-on in plan finds no Center here
  // (drafting-aids.md, Missing)
  it("puts a 3D polyline's and a 3D spline's snaps at the elevation", () => {
    const cad = drawing(
      ...["3DPOLY", "0,-30,0", "10,-30,5", "10,-20,-3", "20,-20,0", ""],
      ...["SPLINE", "60,-30,5", "70,-20,5", "80,-30,8", "90,-20,-3", ""],
      ...["OSNAPZ", "1", "ELEVATION", "2"]
    )
    for (const [snap, pick, x, y] of [
      ["_END", "10,-26", "10.0000", "-30.0000"],
      ["_MID", "5,-30", "5.0000", "-30.0000"],
      ["_NEA", "10,-25", "10.0000", "-25.0000"],
      ["_END", "90,-20", "90.0000", "-20.0000"],
      ["_NEA", "70,-20", "70.0000", "-20.0000"],
    ]) {
      expect(identified(cad, snap, pick)).toBe(at(x, y, "2.0000"))
    }
    answer(cad, "ELEVATION", "0", "OSNAPZ", "0")
    expect(identified(cad, "_MID", "5,-30")).toBe(
      at("5.0000", "-30.0000", "2.5000")
    )
  })

  // probe osnapz/o10
  it("puts the Center of a circle in another plane at the elevation", () => {
    const cad = drawing(
      ...["UCS", "X", "45", "CIRCLE", "50,20", "10", "UCS", "W"],
      ...["OSNAPZ", "1", "ELEVATION", "2"]
    )
    expect(identified(cad, "_CEN", "60,14.1421")).toBe(
      at("50.0000", "14.1421", "2.0000")
    )
    answer(cad, "ELEVATION", "0", "OSNAPZ", "0")
    expect(identified(cad, "_CEN", "60,14.1421")).toBe(
      at("50.0000", "14.1421", "14.1421")
    )
  })

  // probe osnapz/o08 (and filters/f25)
  it("gives a point filter the snap at the elevation", () => {
    const cad = drawing(
      ...["LINE", "0,0,10", "100,0,30", ""],
      ...["OSNAPZ", "1", "ELEVATION", "5"]
    )
    expect(identified(cad, ".XY", "_END", "99,0", "3")).toBe(
      at("100.0000", "0.0000", "3.0000")
    )
    expect(identified(cad, ".Z", "_END", "99,0", "20,20")).toBe(
      at("20.0000", "20.0000", "5.0000")
    )
    expect(identified(cad, ".X", "_END", "99,0", "0,50")).toBe(
      at("100.0000", "50.0000", "5.0000")
    )
    expect(identified(cad, ".XY", "0,50", "_END", "99,0")).toBe(
      at("0.0000", "50.0000", "5.0000")
    )
  })

  // probe osnapz/o09
  it("still finds no Intersection where two objects only cross in plan", () => {
    const cad = drawing(
      ...["LINE", "0,0,0", "100,100,0", ""],
      ...["LINE", "0,100,10", "100,0,10", ""],
      ...["OSNAPZ", "1", "ID", "_INT", "50,50"]
    )
    expect(cad.commandLog().slice(-2)).toEqual([
      "No Intersection found for specified point.",
      "Invalid point.",
    ])
    expect(cad.activeToolId()).toBe("id")
  })
})

describe("OSNAPZ typed", () => {
  // probe osnapz/o03: U names it, REDO sets it again
  it("is a step of its own at Command:", () => {
    const cad = answer(createHarness(), "OSNAPZ", "1", "U")
    expect(cad.commandLog().slice(-2)).toEqual(["U", "OSNAPZ"])
    expect(written(cad, "REDO")).toEqual([
      "REDO",
      "OSNAPZ",
      "Everything has been redone",
    ])
    answer(cad, "OSNAPZ")
    expect(cad.state().commandLine.prompt).toMatch(/<1>:$/)
  })

  // probe osnapz/o03: transparent, and part of the command it interrupts
  it("is set inside LINE and taken back with it", () => {
    const cad = answer(createHarness(), "LINE", "0,0", "'OSNAPZ")
    expect(cad.state().commandLine.prompt).toBe(
      "'OSNAPZ >>Enter new value for OSNAPZ <0>:"
    )
    answer(cad, "1")
    expect(cad.commandLog().at(-1)).toBe("Resuming LINE command.")
    answer(cad, "10,0", "", "U", "OSNAPZ")
    expect(cad.state().commandLine.prompt).toMatch(/<0>:$/)
  })
})
