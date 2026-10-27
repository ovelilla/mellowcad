import { describe, expect, it } from "vitest"
import { withElevation } from "../../domain/entities"
import type { ScenePrimitive } from "../../scene/types"
import { THEME } from "../../scene/theme"
import { createHarness, type CadHarness } from "../../../test/harness"
import { circleOf, lineOf, p, polylineOf } from "../../../test/builders"
import { es } from "../../locales/es"

/**
 * The inquiry commands. MEASURE creates no geometry at all — its whole output
 * is the on-screen readout — so the scene's label primitives are its
 * observable contract.
 */

function readout(cad: CadHarness): string[] {
  return cad
    .scene()
    .primitives.filter(
      (primitive): primitive is Extract<ScenePrimitive, { kind: "label" }> =>
        primitive.kind === "label"
    )
    .map((label) => label.text)
}

describe("DIST", () => {
  it("reads distance, angle and the deltas while the second point is picked", () => {
    const cad = createHarness()

    cad.command("DIST").click(p(0, 0)).moveTo(p(300, 0))

    const lines = readout(cad)
    expect(lines.some((line) => /Dist\s+300\.00 mm/.test(line))).toBe(true)
    expect(lines.some((line) => /Angle\s+0°/.test(line))).toBe(true)
    expect(lines.some((line) => /ΔX\s+300\.00/.test(line))).toBe(true)
    expect(lines.some((line) => /ΔY\s+0\.00/.test(line))).toBe(true)
  })

  it("measures a diagonal", () => {
    const cad = createHarness()

    cad.command("DIST").click(p(0, 0)).moveTo(p(300, 400))

    const lines = readout(cad)
    expect(lines.some((line) => /Dist\s+500\.00 mm/.test(line))).toBe(true)
    expect(lines.some((line) => new RegExp(`Angle\\s+53°`).test(line))).toBe(
      true
    )
  })

  it("creates no geometry", () => {
    const cad = createHarness()

    cad.command("DIST").click(p(0, 0)).click(p(300, 0))

    expect(cad.entityCount).toBe(0)
  })

  it("follows the document's unit and precision", () => {
    const cad = createHarness()
    cad.runtime.setDocumentPrecision(0)

    cad.command("DIST").click(p(0, 0)).moveTo(p(300, 0))

    expect(readout(cad).some((line) => /Dist\s+300 mm/.test(line))).toBe(true)
  })

  it("ends after one pair, its readout with it, as AutoCAD's DIST does", () => {
    const cad = createHarness()

    cad.command("DIST").click(p(0, 0)).click(p(300, 0))

    expect(cad.activeToolId()).toBe("select")
    expect(readout(cad)).toEqual([])
  })

  it("writes AutoCAD's report at the command prompt", () => {
    const cad = createHarness()

    cad.command("DIST").click(p(0, 0)).click(p(300, 400))

    expect(cad.commandLog().at(-1)).toBe(
      "Distance = 500.00,  Angle in XY Plane = 53,  Angle from XY Plane = 0\n" +
        "Delta X = 300.00,  Delta Y = 400.00,   Delta Z = 0.00"
    )
  })

  it("measures in 3D, putting a typed point without a Z at the elevation", () => {
    const cad = createHarness()
    cad.command("ELEV").type("5").enter().type("0").enter()

    cad.command("DIST").type("0,0,-7").enter().moveTo(p(3, 4))
    expect(readout(cad)).toContain("ΔZ    12.00")
    cad.type("3,4").enter()

    expect(cad.commandLog().at(-1)).toBe(
      "Distance = 13.00,  Angle in XY Plane = 53,  Angle from XY Plane = 67\n" +
        "Delta X = 3.00,  Delta Y = 4.00,   Delta Z = 12.00"
    )
  })

  it("takes a snapped point's Z from the object", () => {
    const raised = withElevation(lineOf(p(0, 0), p(100, 0)), 10)
    const cad = createHarness({ entities: [raised], snap: true })

    cad.command("DIST").click(p(100, 0)).click(p(100, 50))

    // Below the XY plane the angle reads the way AutoCAD's do, from 0 to 360.
    expect(cad.commandLog().at(-1)).toBe(
      "Distance = 50.99,  Angle in XY Plane = 90,  Angle from XY Plane = 349\n" +
        "Delta X = 0.00,  Delta Y = 50.00,   Delta Z = -10.00"
    )
  })

  it("reads the deltas and the angle in the UCS", () => {
    const cad = createHarness()
    cad.command("UCS").option("Z").type("90").enter()

    cad.command("DIST").click(p(0, 0)).click(p(0, 100))

    expect(cad.commandLog().at(-1)).toBe(
      "Distance = 100.00,  Angle in XY Plane = 0,  Angle from XY Plane = 0\n" +
        "Delta X = 100.00,  Delta Y = 0.00,   Delta Z = 0.00"
    )
  })

  it("takes LASTPOINT on Enter at the first point", () => {
    const cad = createHarness()

    cad.command("DIST").enter().type("3,4").enter()

    expect(cad.commandLog().at(-1)).toBe(
      "Distance = 5.00,  Angle in XY Plane = 53,  Angle from XY Plane = 0\n" +
        "Delta X = 3.00,  Delta Y = 4.00,   Delta Z = 0.00"
    )
  })
})

describe("ID", () => {
  it("reports a typed point's X, Y and Z in the UCS", () => {
    const cad = createHarness()
    cad.command("UCS").type("10,20,3").enter().enter()

    cad.command("ID").type("1,2,3").enter()

    expect(cad.commandLog().at(-1)).toBe(" X = 1.00     Y = 2.00     Z = 3.00")
    expect(cad.activeToolId()).toBe("select")
    expect(cad.entityCount).toBe(0)
  })

  // probe inquiry/p313
  it("takes the Z of the object snapped to, and the elevation otherwise", () => {
    const raised = withElevation(lineOf(p(0, 0), p(100, 0)), 10)
    const cad = createHarness({ entities: [raised], snap: true })

    cad.command("ID").click(p(100, 0))
    expect(cad.commandLog().at(-1)).toBe(
      " X = 100.00     Y = 0.00     Z = 10.00"
    )

    cad.command("ELEV").type("4").enter().type("0").enter()
    cad.command("ID").click(p(50, 80))
    expect(cad.commandLog().at(-1)).toBe(
      " X = 50.00     Y = 80.00     Z = 4.00"
    )
  })

  // probe inquiry/p303
  it("ends at Enter without a word", () => {
    const cad = createHarness()
    answer(cad, "_ID", "")
    expect(cad.commandLog()).toEqual(["ID", "Specify point:"])
    expect(cad.activeToolId()).toBe("select")
  })

  // probes inquiry/p310, p311, p312
  it("takes an object snap typed at its prompt", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0)), circleOf(p(50, 50), 20)],
    })
    const reports = (...texts: string[]) =>
      answer(cad, "_ID", ...texts)
        .commandLog()
        .at(-1)
    expect(reports("_END", "99,1")).toBe(
      " X = 100.00     Y = 0.00     Z = 0.00"
    )
    expect(reports("_MID", "49,1")).toBe(" X = 50.00     Y = 0.00     Z = 0.00")
    expect(reports("_CEN", "70,50")).toBe(
      " X = 50.00     Y = 50.00     Z = 0.00"
    )
    expect(reports("_NEA", "50,71")).toBe(
      " X = 50.00     Y = 70.00     Z = 0.00"
    )
    expect(reports("_FRO", "10,10", "@5,5")).toBe(
      " X = 15.00     Y = 15.00     Z = 0.00"
    )
  })

  // probes inquiry/p316 (UCS Z 30), p317 (UCS X 90), at LUPREC 4
  it("reports in a rotated and in a tilted UCS", () => {
    const cad = createHarness({ entities: [lineOf(p(0, 0), p(100, 0))] })
    cad.runtime.setDocumentPrecision(4)
    answer(cad, "_UCS", "_Z", "30", "_ID", "10,0", "_ID", "_END", "*99,1")
    expect(cad.commandLog().filter((line) => line.startsWith(" X"))).toEqual([
      " X = 10.0000     Y = 0.0000     Z = 0.0000",
      " X = 86.6025     Y = -50.0000     Z = 0.0000",
    ])
    answer(cad, "_UCS", "_W", "_UCS", "_X", "90", "_ID", "10,20")
    answer(cad, "_ID", "*10,20,5")
    expect(cad.commandLog().slice(-5)).toEqual([
      "Specify point: 10,20",
      " X = 10.0000     Y = 20.0000     Z = 0.0000",
      "ID",
      "Specify point: *10,20,5",
      " X = 10.0000     Y = 5.0000     Z = -20.0000",
    ])
  })

  it("writes a value that rounds to zero unsigned", () => {
    const cad = createHarness()
    // probe inquiry/p315, LUPREC 4
    cad.runtime.setDocumentPrecision(4)
    answer(cad, "_ID", "1.5,-2.25,3", "_ID", "12345.6789,-0.00004")
    // probe inquiry/p355, LUPREC 0: half rounds away from zero
    cad.runtime.setDocumentPrecision(0)
    answer(cad, "_ID", "12.5,30,-3", "_ID", "0.2,-0.4", "_ID", "13.5,-2.5")
    expect(cad.commandLog().filter((line) => line.startsWith(" X"))).toEqual([
      " X = 1.5000     Y = -2.2500     Z = 3.0000",
      " X = 12345.6789     Y = 0.0000     Z = 0.0000",
      " X = 13     Y = 30     Z = -3",
      " X = 0     Y = 0     Z = 0",
      " X = 14     Y = -3     Z = 0",
    ])
  })

  // probes inquiry/p349 (ID), p350 (DIST), p351 (AREA): `(ssget "_I")` at
  // the first prompt finds no set.
  it("drops a preselection as it starts, as DIST and AREA do", () => {
    for (const command of ["_ID", "_DIST", "_AREA"]) {
      const cad = createHarness({
        entities: [lineOf(p(0, 0), p(100, 0), { id: "A" })],
      })
      cad.select("A")
      answer(cad, command)
      expect(cad.selectedIds()).toEqual([])
    }
  })
})

/** Typed at the command line and confirmed, as AutoCAD's prompt reads it. */
function answer(cad: CadHarness, ...texts: string[]): CadHarness {
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

// AutoCAD 2027's console answering the same input.
describe("DIST and ID ask as AutoCAD 2027", () => {
  // probes inquiry/p107, p108, p111
  it("DIST asks its two points, and Enter at the second measures to the first", () => {
    const cad = createHarness()
    cad.command("DIST")
    answer(cad, "FOO", "0,0", "FOO", "3,4")
    expect(cad.commandLog()).toEqual([
      "DIST",
      "Specify first point: FOO",
      "Invalid point.",
      "Specify first point: 0,0",
      "Specify second point or [Multiple points]: FOO",
      "Point or option keyword required.",
      "Specify second point or [Multiple points]: 3,4",
      "Distance = 5.00,  Angle in XY Plane = 53,  Angle from XY Plane = 0\nDelta X = 3.00,  Delta Y = 4.00,   Delta Z = 0.00",
    ])
    expect(cad.activeToolId()).toBe("select")
    cad.command("DIST")
    answer(cad, "1,1")
    cad.enter()
    expect(cad.commandLog().slice(-2)).toEqual([
      "Specify second point or [Multiple points]:",
      "Distance = 0.00,  Angle in XY Plane = 0,  Angle from XY Plane = 0\nDelta X = 0.00,  Delta Y = 0.00,   Delta Z = 0.00",
    ])
  })

  // probe inquiry/p302
  it("ID asks its point and refuses what is none", () => {
    const cad = createHarness()
    cad.command("ID")
    answer(cad, "FOO", "1,2")
    expect(cad.commandLog()).toEqual([
      "ID",
      "Specify point: FOO",
      "Invalid point.",
      "Specify point: 1,2",
      " X = 1.00     Y = 2.00     Z = 0.00",
    ])
  })

  // probes inquiry/p100 es, p302 es
  it("asks in Autodesk's Spanish", () => {
    const cad = createHarness({ locale: es })
    cad.command("DIST")
    answer(cad, "0,0")
    expect(cad.state().commandLine.prompt).toBe(
      "DIST Especifique segundo punto o [puntos Múltiples]:"
    )
    answer(cad, "3,4")
    expect(cad.activeToolId()).toBe("select")
    cad.command("ID")
    answer(cad, "FOO")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Precise punto: FOO",
      "Punto no válido.",
    ])
  })
})

// AutoCAD 2027's console, the same input (probes inquiry/p112, p115, p118,
// p120): the run so far before each next point.
describe("DIST's Multiple points", () => {
  it("adds up the run, says it again after a refusal and undoes a point", () => {
    const cad = createHarness()
    cad.command("DIST")
    answer(cad, "0,0", "M", "3,4", "6,8", "FOO", "U", "U", "U", "6,0")
    cad.enter()
    expect(cad.commandLog()).toEqual([
      "DIST",
      "Specify first point: 0,0",
      "Specify second point or [Multiple points]: M",
      "Specify next point or [Arc/Length/Undo/Total] <Total>: 3,4",
      "Distance = 5.00",
      "Specify next point or [Arc/Close/Length/Undo/Total] <Total>: 6,8",
      "Distance = 10.00",
      "Specify next point or [Arc/Close/Length/Undo/Total] <Total>: FOO",
      "Point or option keyword required.",
      "Distance = 10.00",
      "Specify next point or [Arc/Close/Length/Undo/Total] <Total>: U",
      "Distance = 5.00",
      "Specify next point or [Arc/Close/Length/Undo/Total] <Total>: U",
      "Specify next point or [Arc/Length/Undo/Total] <Total>: U",
      "All segments already undone.",
      "Specify next point or [Arc/Length/Undo/Total] <Total>: 6,0",
      "Distance = 6.00",
      "Specify next point or [Arc/Close/Length/Undo/Total] <Total>:",
      "Distance = 6.00",
    ])
    expect(cad.activeToolId()).toBe("select")
  })

  it("closes back to the first point", () => {
    const cad = createHarness()
    cad.command("DIST")
    answer(cad, "0,0", "M", "10,0", "10,10", "C")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Specify next point or [Arc/Close/Length/Undo/Total] <Total>: C",
      "Distance = 34.14",
    ])
    expect(cad.activeToolId()).toBe("select")
  })

  // probes inquiry/p115, p118: Length's point is measured from LASTPOINT,
  // 10,0, which no Length moves; `@0,5` gives 5 from the run's end too, which
  // p158 tells apart.
  it("goes on by a length, along the last segment, else east", () => {
    const cad = createHarness()
    cad.command("DIST")
    answer(cad, "0,0", "M", "L", "7", "10,0", "L", "FOO")
    cad.enter()
    answer(cad, "-4", "L", "@0,5", "T")
    expect(cad.commandLog().slice(3)).toEqual([
      "Specify next point or [Arc/Length/Undo/Total] <Total>: L",
      "Specify length of line: 7",
      "Distance = 7.00",
      "Specify next point or [Arc/Close/Length/Undo/Total] <Total>: 10,0",
      "Distance = 10.00",
      "Specify next point or [Arc/Close/Length/Undo/Total] <Total>: L",
      "Specify length of line: FOO",
      "Requires numeric distance or second point.",
      "Specify length of line:",
      "Requires numeric distance or second point.",
      "Specify length of line: -4",
      "Distance = 14.00",
      "Specify next point or [Arc/Close/Length/Undo/Total] <Total>: L",
      "Specify length of line: @0,5",
      "Distance = 19.00",
      "Specify next point or [Arc/Close/Length/Undo/Total] <Total>: T",
      "Distance = 19.00",
    ])
    expect(lastPoint(cad)).toBe(" X = 10.00     Y = 0.00     Z = 0.00")
  })

  it("reads the run on screen as it goes", () => {
    const cad = createHarness()
    cad.command("DIST").click(p(0, 0))
    answer(cad, "M")
    cad.click(p(300, 0)).moveTo(p(300, 400))
    expect(readout(cad)).toEqual(["Dist  700.00 mm"])
  })

  it("asks in Autodesk's Spanish", () => {
    const cad = createHarness({ locale: es })
    cad.command("DIST")
    answer(cad, "0,0", "M", "3,4", "FOO", "C")
    expect(cad.commandLog().slice(2)).toEqual([
      "Especifique segundo punto o [puntos Múltiples]: M",
      "Precise punto siguiente o [Arco/Longitud/desHacer/Total] <Total>: 3,4",
      "Distancia = 5.00",
      "Precise punto siguiente o [Arco/Cerrar/Longitud/desHacer/Total] <Total>: FOO",
      "Se requiere un punto o una opción.",
      "Distancia = 5.00",
      "Precise punto siguiente o [Arco/Cerrar/Longitud/desHacer/Total] <Total>: C",
      "Distancia = 10.00",
    ])
    cad.command("DIST")
    answer(cad, "0,0", "M", "L")
    expect(cad.state().commandLine.prompt).toBe(
      "DIST Precise longitud de línea:"
    )
  })

  // PLINE's arc options, as AutoCAD 2027's console asks them in DIST
  // (pline/p145).
  it("Arc adds the arcs' lengths to the run", () => {
    const cad = createHarness()
    cad.command("DIST")
    answer(cad, "0,0", "M", "10,0", "A", "FOO", "R", "10", "A", "90")
    cad.enter()
    expect(cad.commandLog().slice(5)).toEqual([
      "Specify next point or [Arc/Close/Length/Undo/Total] <Total>: A",
      "Distance = 10.00",
      "Specify endpoint of arc (hold Ctrl to switch direction) or [Angle/CEnter/CLose/Direction/Line/Radius/Second pt/Undo]: FOO",
      "2D point or option keyword required.",
      "Distance = 10.00",
      "Specify endpoint of arc (hold Ctrl to switch direction) or [Angle/CEnter/CLose/Direction/Line/Radius/Second pt/Undo]: R",
      "Specify radius of arc: 10",
      "Specify endpoint of arc (hold Ctrl to switch direction) or [Angle]: A",
      "Specify included angle: 90",
      "Specify direction of chord for arc (hold Ctrl to switch direction) <0>:",
      "Distance = 25.71",
    ])
    cad.enter()
    expect(cad.commandLog().slice(-2)).toEqual([
      "Specify endpoint of arc (hold Ctrl to switch direction) or [Angle/CEnter/CLose/Direction/Line/Radius/Second pt/Undo]:",
      "Distance = 25.71",
    ])
    expect(cad.activeToolId()).toBe("select")
  })

  it("Arc's endpoint goes on tangent to the run, and Line back", () => {
    const cad = createHarness()
    cad.command("DIST")
    // A half circle of radius 5 from the line's end: 5π on its 10.
    answer(cad, "0,0", "M", "10,0", "A", "10,10", "L", "0,10", "T")
    expect(cad.commandLog().slice(-6)).toEqual([
      "Specify endpoint of arc (hold Ctrl to switch direction) or [Angle/CEnter/CLose/Direction/Line/Radius/Second pt/Undo]: L",
      "Distance = 25.71",
      "Specify next point or [Arc/Close/Length/Undo/Total] <Total>: 0,10",
      "Distance = 35.71",
      "Specify next point or [Arc/Close/Length/Undo/Total] <Total>: T",
      "Distance = 35.71",
    ])
  })

  it("Arc's Undo stays in Arc, and CLose closes straight where no arc can", () => {
    // probe pline/p148: unlike PLINE's (p128), which goes on as the segment
    // left was drawn.
    const undo = createHarness()
    answer(undo, "DIST", "0,0", "M", "10,0", "A", "20,10", "U")
    expect(undo.commandLog().slice(-2)).toEqual([
      "Specify endpoint of arc (hold Ctrl to switch direction) or [Angle/CEnter/CLose/Direction/Line/Radius/Second pt/Undo]: U",
      "Distance = 10.00",
    ])
    expect(undo.state().commandLine.prompt).toBe(
      "DIST Specify endpoint of arc (hold Ctrl to switch direction) or [Angle/CEnter/CLose/Direction/Line/Radius/Second pt/Undo]:"
    )
    answer(undo, "L", "U")
    expect(undo.state().commandLine.prompt).toBe(
      "DIST Specify next point or [Arc/Length/Undo/Total] <Total>:"
    )

    // probe pline/p147
    const close = createHarness()
    close.command("DIST")
    answer(close, "0,0", "M", "10,0", "A", "CL")
    expect(close.commandLog().slice(-2)).toEqual([
      "Specify endpoint of arc (hold Ctrl to switch direction) or [Angle/CEnter/CLose/Direction/Line/Radius/Second pt/Undo]: CL",
      "Distance = 20.00",
    ])
  })

  it("Arc refuses Total, and CLose closes with the tangent arc", () => {
    // probe pline/p146
    const cad = createHarness()
    answer(cad, "DIST", "0,0", "M", "10,0", "A", "20,10", "T", "CL")
    expect(cad.commandLog().slice(-5)).toEqual([
      "Specify endpoint of arc (hold Ctrl to switch direction) or [Angle/CEnter/CLose/Direction/Line/Radius/Second pt/Undo]: T",
      "2D point or option keyword required.",
      "Distance = 25.71",
      "Specify endpoint of arc (hold Ctrl to switch direction) or [Angle/CEnter/CLose/Direction/Line/Radius/Second pt/Undo]: CL",
      "Distance = 76.57",
    ])
  })

  it("Arc's CEnter asks its included angle without Ctrl", () => {
    // probe pline/p145: PLINE's says `(hold Ctrl to switch direction)`.
    const cad = createHarness()
    answer(cad, "DIST", "0,0", "M", "10,0", "A", "CE", "30,10", "A")
    expect(cad.state().commandLine.prompt).toBe("DIST Specify included angle:")
  })

  // The first arc leaves as PLINE's does (pline/p09), along the last line or
  // polyline drawn, else east — the chord's default after an included angle
  // of 90 and a radius.
  it("Arc's first arc leaves along what was drawn last, else east", () => {
    for (const [drawn, chord] of [
      [[], "<0>"],
      [[lineOf(p(0, 0), p(0, 10))], "<90>"],
      [[polylineOf([p(0, 0), p(0, 10)])], "<90>"],
    ] as const) {
      const cad = createHarness({ entities: [...drawn] })
      cad.command("DIST")
      answer(cad, "50,50", "M", "A", "A", "90", "R", "10")
      expect(cad.state().commandLine.prompt).toBe(
        `DIST Specify direction of chord for arc (hold Ctrl to switch direction) ${chord}:`
      )
    }

    // probe pline/p115: after `ARC 0,10 7.0710678,7.0710678 10,0`, drawn
    // clockwise, the way it ends: (0,-1).
    const clockwise = createHarness()
    answer(clockwise, "ARC", "0,10", "7.0710678,7.0710678", "10,0")
    answer(clockwise, "DIST", "20,0", "M", "A", "A", "90", "R", "10")
    expect(clockwise.state().commandLine.prompt).toBe(
      "DIST Specify direction of chord for arc (hold Ctrl to switch direction) <270>:"
    )

    const spanish = createHarness({
      locale: es,
      entities: [lineOf(p(0, 0), p(0, 10))],
    })
    spanish.command("DIST")
    answer(spanish, "50,50", "M", "A", "U", "90", "R", "10")
    expect(spanish.state().commandLine.prompt).toMatch(/<90>:$/)
  })

  it("draws the arc on screen as it goes", () => {
    const cad = createHarness()
    cad.command("DIST").click(p(0, 0))
    answer(cad, "M")
    cad.click(p(100, 0))
    answer(cad, "A")
    cad.moveTo(p(100, 100))
    expect(readout(cad)).toEqual(["Dist  257.08 mm"])
  })

  it("asks Arc in Autodesk's Spanish", () => {
    const cad = createHarness({ locale: es })
    cad.command("DIST")
    answer(cad, "0,0", "M", "10,0", "A")
    expect(cad.state().commandLine.prompt).toBe(
      "DIST Precise punto final del arco (mantenga pulsada la tecla Ctrl para cambiar de dirección) o [ángUlo/cEntro/Cerrar/Dirección/líNea/Radio/Segundo pto./desHacer]:"
    )
  })
})

/** A harness at the console's LUPREC 4. */
function console4(
  options: Parameters<typeof createHarness>[0] = {}
): CadHarness {
  const cad = createHarness(options)
  cad.runtime.setDocumentPrecision(4)
  return cad
}

/** LASTPOINT as `ID @` writes it. */
function lastPoint(cad: CadHarness): string {
  answer(cad, "ID", "@")
  return cad.commandLog().at(-1) ?? ""
}

/** The point `ID` writes, at LUPREC 4. */
const at = (x: string, y: string, z = "0.0000") =>
  ` X = ${x}     Y = ${y}     Z = ${z}`

/** DIST's report, at LUPREC 4. */
const report = (
  d: string,
  a: string,
  f: string,
  x: string,
  y: string,
  z: string
) =>
  `Distance = ${d},  Angle in XY Plane = ${a},  Angle from XY Plane = ${f}\n` +
  `Delta X = ${x},  Delta Y = ${y},   Delta Z = ${z}`

/** Where the console's fixed cursor stands in its initial view. */
const CONSOLE_CURSOR = { x: 289.98397, y: 116.30379 }

// AutoCAD 2027's console, the same input: Multiple points reads `@`, a bare
// number, Length's point and Ortho from LASTPOINT, which Length and a line's
// Undo leave where it was (p118's trace: Length's BasePoint is LASTPOINT).
describe("DIST's Multiple points reads LASTPOINT", () => {
  // probe inquiry/p158
  it("measures Length's point from LASTPOINT", () => {
    const cad = console4()
    answer(cad, "DIST", "0,0", "M", "10,0", "L", "-4", "L", "6,5", "T")
    expect(cad.commandLog().at(-1)).toBe("Distance = 20.4031")
  })

  // probes inquiry/p160, p165
  it("reads `@` from LASTPOINT after a Length and after Undo", () => {
    const length = console4()
    answer(length, "DIST", "0,0", "M", "10,0", "L", "5", "@0,5", "T")
    expect(length.commandLog().at(-1)).toBe("Distance = 22.0711")

    const undo = console4()
    answer(undo, "DIST", "0,0", "M", "10,0", "U", "@0,5", "T")
    expect(undo.commandLog().at(-1)).toBe("Distance = 11.1803")
    expect(lastPoint(undo)).toBe(at("10.0000", "5.0000"))
  })

  // probes inquiry/p166, p167, p171
  it("runs a bare number from LASTPOINT after a Length and after Undo", () => {
    const length = console4()
    answer(length, "DIST", "0,0", "M", "10,0", "L", "5")
    length.moveTo(CONSOLE_CURSOR)
    answer(length, "5", "T")
    expect(length.commandLog().at(-1)).toBe("Distance = 16.9558")

    const undo = console4()
    answer(undo, "DIST", "0,0", "M", "10,0", "20,0", "U")
    undo.moveTo(CONSOLE_CURSOR)
    answer(undo, "5", "T")
    expect(undo.commandLog().at(-1)).toBe("Distance = 24.7255")

    const back = console4()
    answer(back, "DIST", "0,0", "M", "280,100", "L", "-200")
    back.moveTo(CONSOLE_CURSOR)
    answer(back, "5", "T")
    expect(back.commandLog().at(-1)).toBe("Distance = 701.2387")
    // (getvar "LASTPOINT") → (282.611 104.264 0.0)
    expect(lastPoint(back)).toBe(at("282.6112", "104.2640"))
  })

  // probe inquiry/p170: from LASTPOINT the cursor is nearer the Y axis, from
  // the run's end nearer the X.
  it("bends a bare number with Ortho from LASTPOINT", () => {
    const cad = console4()
    cad.press("F8")
    answer(cad, "DIST", "0,0", "M", "280,100", "L", "-200")
    cad.moveTo(CONSOLE_CURSOR)
    answer(cad, "5", "T")
    expect(cad.commandLog().at(-1)).toBe("Distance = 699.0580")
    expect(lastPoint(cad)).toBe(at("280.0000", "105.0000"))
  })

  // probes inquiry/p169, p168
  it("keeps LASTPOINT at a line's Undo, and puts it at the run's end at an arc's", () => {
    const line = console4()
    answer(line, "DIST", "0,0", "M", "10,0", "U", "T")
    expect(line.commandLog().at(-1)).toBe("Distance = 0.0000")
    expect(lastPoint(line)).toBe(at("10.0000", "0.0000"))

    const arc = console4()
    answer(arc, "DIST", "0,0", "M", "10,0", "A", "20,10", "U", "L", "T")
    expect(arc.commandLog().at(-1)).toBe("Distance = 10.0000")
    expect(lastPoint(arc)).toBe(at("10.0000", "0.0000"))
  })

  // probe inquiry/p172
  it("puts LASTPOINT at the run's end when Arc follows a Length", () => {
    const cad = console4()
    answer(cad, "DIST", "0,0", "M", "10,0", "L", "5", "A", "L", "T")
    expect(cad.commandLog().at(-1)).toBe("Distance = 15.0000")
    expect(lastPoint(cad)).toBe(at("15.0000", "0.0000"))
  })

  // probes inquiry/p121, p154, p155, p119
  it("leaves LASTPOINT at the last point given, at Close and at an arc's end", () => {
    const close = console4()
    answer(close, "DIST", "0,0", "M", "10,0", "10,10", "C")
    expect(close.commandLog().at(-1)).toBe("Distance = 34.1421")
    expect(lastPoint(close)).toBe(at("10.0000", "10.0000"))

    const relative = console4()
    answer(relative, "DIST", "0,0", "M", "3,4", "@3,4", "T")
    expect(relative.commandLog().at(-1)).toBe("Distance = 10.0000")
    expect(lastPoint(relative)).toBe(at("6.0000", "8.0000"))

    const arc = console4()
    answer(arc, "DIST", "0,0", "M", "10,0", "A", "20,10", "L", "T")
    expect(arc.commandLog().at(-1)).toBe("Distance = 25.7080")
    expect(lastPoint(arc)).toBe(at("20.0000", "10.0000"))

    const length = console4()
    answer(length, "DIST", "0,0", "M", "10,0", "A", "20,10", "L", "L", "5")
    answer(length, "T")
    expect(length.commandLog().at(-1)).toBe("Distance = 30.7080")
    expect(lastPoint(length)).toBe(at("20.0000", "10.0000"))
  })

  // probes inquiry/p157, p164
  it("runs the first Length along what was drawn last, else the WCS's east", () => {
    const rotated = console4()
    answer(rotated, "UCS", "Z", "30")
    answer(rotated, "DIST", "0,0", "M", "L", "10", "10,10", "T")
    expect(rotated.commandLog().at(-1)).toBe("Distance = 25.0597")

    const drawn = console4()
    answer(drawn, "LINE", "50,50", "50,60", "")
    answer(drawn, "DIST", "0,0", "M", "L", "10", "10,0", "T")
    expect(drawn.commandLog().at(-1)).toBe("Distance = 24.1421")
  })

  // probes inquiry/p115, p162
  it("adds no point at a Length of 0", () => {
    const first = console4()
    answer(first, "DIST", "0,0", "M", "L", "0")
    expect(first.commandLog().at(-1)).toBe("Specify length of line: 0")
    expect(first.state().commandLine.prompt).toBe(
      "DIST Specify next point or [Arc/Length/Undo/Total] <Total>:"
    )

    const later = console4()
    answer(later, "DIST", "0,0", "M", "3,4", "L", "0")
    expect(later.commandLog().slice(-2)).toEqual([
      "Specify length of line: 0",
      "Distance = 5.0000",
    ])
    answer(later, "U")
    expect(later.state().commandLine.prompt).toBe(
      "DIST Specify next point or [Arc/Length/Undo/Total] <Total>:"
    )
    answer(later, "T")
    expect(later.commandLog().at(-1)).toBe("Distance = 0.0000")
  })
})

describe("DIST's points and aids, as AutoCAD 2027's console", () => {
  // probe inquiry/p141
  it("bends a bare number at the second point with Ortho", () => {
    const cad = console4()
    cad.press("F8")
    answer(cad, "DIST", "0,0")
    cad.moveTo(CONSOLE_CURSOR)
    answer(cad, "5")
    expect(cad.commandLog().at(-1)).toBe(
      report("5.0000", "0", "0", "5.0000", "0.0000", "0.0000")
    )
  })

  // probe inquiry/p140
  it("leaves a typed point alone under Ortho", () => {
    const cad = console4()
    cad.press("F8")
    answer(cad, "DIST", "0,0", "3,4")
    expect(cad.commandLog().at(-1)).toBe(
      report("5.0000", "53", "0", "3.0000", "4.0000", "0.0000")
    )
  })

  // probe inquiry/p131
  it("refuses `#` at the command line", () => {
    const cad = console4()
    answer(cad, "UCS", "Z", "30", "DIST", "1,1", "#4,5")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Specify second point or [Multiple points]: #4,5",
      "Point or option keyword required.",
    ])
  })

  // probes inquiry/p135–p138
  it("takes the object snaps and FROM typed at its points", () => {
    const raised = createHarness({
      entities: [withElevation(lineOf(p(0, 0), p(10, 0)), 5)],
    })
    raised.runtime.setDocumentPrecision(4)
    answer(raised, "DIST", "END", "9.9,0.1", "MID", "4.9,0.1")
    expect(raised.commandLog().at(-1)).toBe(
      report("5.0000", "180", "0", "-5.0000", "0.0000", "0.0000")
    )
    answer(raised, "DIST", "END", "9.9,0.1", "10,5")
    expect(raised.commandLog().at(-1)).toBe(
      report("7.0711", "90", "315", "0.0000", "5.0000", "-5.0000")
    )

    const shapes = createHarness({
      entities: [lineOf(p(0, 0), p(10, 0)), circleOf(p(5, 10), 3)],
    })
    shapes.runtime.setDocumentPrecision(4)
    answer(shapes, "DIST", "CEN", "8,10.05", "PER", "3,0.05")
    expect(shapes.commandLog().at(-1)).toBe(
      report("10.0000", "270", "0", "0.0000", "-10.0000", "0.0000")
    )
    answer(shapes, "DIST", "0,10", "TAN", "3.2,12.4")
    expect(shapes.commandLog().at(-1)).toBe(
      report("4.0000", "37", "0", "3.2000", "2.4000", "0.0000")
    )

    const from = console4()
    answer(from, "DIST", "0,0", "FRO", "10,0", "@0,5")
    expect(from.commandLog().at(-1)).toBe(
      report("11.1803", "27", "0", "10.0000", "5.0000", "0.0000")
    )
  })

  // probe inquiry/p147
  it("reports in a tilted UCS", () => {
    const cad = console4()
    answer(cad, "UCS", "X", "90", "DIST", "*0,0,0", "*3,4,5")
    expect(cad.commandLog().at(-1)).toBe(
      report("7.0711", "59", "326", "3.0000", "5.0000", "-4.0000")
    )
  })

  // probe inquiry/p142
  it("writes its angles at AUPREC", () => {
    const cad = console4()
    answer(cad, "AUPREC", "2", "DIST", "0,0", "3,4")
    expect(cad.commandLog().at(-1)).toBe(
      report("5.0000", "53.13", "0.00", "3.0000", "4.0000", "0.0000")
    )
  })
})

describe("AREA", () => {
  it("reports the area and perimeter of the picked polygon, and ends", () => {
    const cad = createHarness()

    cad
      .command("AREA")
      .click(p(0, 0))
      .click(p(100, 0))
      .click(p(100, 100))
      .moveTo(p(0, 100))

    const lines = readout(cad)
    expect(lines.some((line) => /Area\s+10000\.00 mm²/.test(line))).toBe(true)
    expect(lines.some((line) => /Perim\s+400\.00 mm/.test(line))).toBe(true)

    cad.click(p(0, 100)).enter()
    expect(cad.commandLog().at(-1)).toBe("Area = 10000.00, Perimeter = 400.00")
    expect(cad.activeToolId()).toBe("select")
  })

  it("offers Object, Add area and Subtract area, then Undo from the second point and Total from the fourth", () => {
    const cad = createHarness()

    cad.command("AREA")
    expect(cad.optionAbbreviations()).toEqual(["O", "A", "S"])
    cad.click(p(0, 0)).click(p(100, 0))
    expect(cad.optionAbbreviations()).toEqual(["U"])

    // Step back over the mistaken vertex and replace it.
    cad.option("Undo").click(p(200, 0)).click(p(200, 100))
    expect(cad.optionAbbreviations()).toEqual(["U", "T"])
    cad.click(p(0, 100)).option("Total")

    expect(cad.commandLog().at(-1)).toBe("Area = 20000.00, Perimeter = 600.00")
  })

  it("refuses Enter before a shape has three points", () => {
    const cad = createHarness()

    cad.command("AREA").click(p(0, 0)).click(p(100, 0)).enter()

    expect(cad.activeToolId()).toBe("measurearea")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Specify next point or [Undo]:",
      "Point or option keyword required.",
    ])
  })

  it("measures an object, the prompt's default", () => {
    const cad = createHarness({
      entities: [
        lineOf(p(0, 0), p(100, 100), { id: "L" }),
        circleOf(p(500, 0), 5, { id: "C" }),
      ],
    })

    cad.command("AREA").enter().click(p(50, 50)).click(p(505, 0))

    expect(cad.commandLog()).toEqual([
      "AREA",
      "Specify first corner point or [Object/Add area/Subtract area] <Object>:",
      "Select objects:",
      "Selected object does not have an area",
      "Select objects:",
      "Area = 78.54, Circumference = 31.42",
    ])
    expect(cad.activeToolId()).toBe("select")
  })

  // cad-tools.md "Pick feedback": a single object's pick wears the rollover
  it("rolls over the object under the cursor at Object's prompt", () => {
    const cad = createHarness({ entities: [circleOf(p(50, 50), 20)] })
    cad.command("AREA").enter().moveTo(p(70, 50))
    const strokes = cad
      .scene()
      .primitives.flatMap((primitive) =>
        "stroke" in primitive && primitive.stroke
          ? [`${primitive.stroke.color}/${primitive.stroke.width}`]
          : []
      )
    expect(strokes).toContain(`${THEME.entityHover}/2`)
    expect(strokes).not.toContain(`${THEME.selected}/2`)
  })

  it("closes an open curve and reports its length, as AutoCAD's does", () => {
    const cad = createHarness({
      entities: [polylineOf([p(0, 0), p(10, 0), p(10, 10)])],
    })

    cad.command("AREA")
    answer(cad, "O", "FOO", "L")

    expect(cad.commandLog().slice(1)).toEqual([
      "Specify first corner point or [Object/Add area/Subtract area] <Object>: O",
      "Select objects: FOO",
      "*Invalid selection*",
      "Expects a point or Last",
      "Select objects: L",
      "Area = 50.00, Length = 20.00",
    ])
  })

  it("keeps the first corner when Undo has nothing else to take back", () => {
    const cad = createHarness()

    cad.command("AREA")
    answer(cad, "FOO", "0,0", "U", "FOO", "10,0", "10,10", "0,10")
    cad.enter()

    expect(cad.commandLog()).toEqual([
      "AREA",
      "Specify first corner point or [Object/Add area/Subtract area] <Object>: FOO",
      "Point or option keyword required.",
      "Specify first corner point or [Object/Add area/Subtract area] <Object>: 0,0",
      "Specify next point or [Undo]: U",
      "All segments already undone.",
      "Command has been completely undone.",
      "Specify next point or [Undo]: FOO",
      "Point or option keyword required.",
      "Specify next point or [Undo]: 10,0",
      "Specify next point or [Undo]: 10,10",
      "Specify next point or [Undo/Total] <Total>: 0,10",
      "Specify next point or [Undo/Total] <Total>:",
      "Area = 100.00, Perimeter = 40.00",
    ])
  })

  // AutoCAD 2027's console: probes inquiry/p212, p213 (the refusal says the
  // last measurement and the total again).
  it("adds and subtracts areas to a running total until Enter", () => {
    const cad = createHarness({ entities: [circleOf(p(5, 5), 2)] })

    cad.command("AREA")
    answer(cad, "A", "0,0", "10,0", "10,10", "0,10", "", "S", "O", "L", "")
    answer(cad, "FOO", "")

    expect(cad.commandLog()).toEqual([
      "AREA",
      "Specify first corner point or [Object/Add area/Subtract area] <Object>: A",
      "Specify first corner point or [Object/Subtract area]: 0,0",
      " (ADD mode)Specify next point or [Undo]: 10,0",
      " (ADD mode)Specify next point or [Undo]: 10,10",
      " (ADD mode)Specify next point or [Undo/Total] <Total>: 0,10",
      " (ADD mode)Specify next point or [Undo/Total] <Total>:",
      "Area = 100.00, Perimeter = 40.00",
      "Total area = 100.00",
      "Specify first corner point or [Object/Subtract area]: S",
      "Specify first corner point or [Object/Add area]: O",
      "(SUBTRACT mode) Select objects: L",
      "Area = 12.57, Circumference = 12.57",
      "Total area = 87.43",
      "(SUBTRACT mode) Select objects:",
      "Area = 12.57, Circumference = 12.57",
      "Total area = 87.43",
      "Specify first corner point or [Object/Add area]: FOO",
      "Point or option keyword required.",
      "Area = 12.57, Circumference = 12.57",
      "Total area = 87.43",
      "Specify first corner point or [Object/Add area]:",
      "Total area = 87.43",
    ])
    expect(cad.activeToolId()).toBe("select")
  })

  it("says the mode's last area again only once it has one", () => {
    const cad = createHarness({ entities: [circleOf(p(50, 50), 1)] })

    cad.command("AREA")
    answer(cad, "A", "FOO", "O", "FOO", "", "0,0", "10,0", "10,10", "U")
    answer(cad, "10,10", "T", "A", "O", "L", "", "S", "FOO", "")

    expect(cad.commandLog().slice(1)).toEqual([
      "Specify first corner point or [Object/Add area/Subtract area] <Object>: A",
      "Specify first corner point or [Object/Subtract area]: FOO",
      "Point or option keyword required.",
      "Specify first corner point or [Object/Subtract area]: O",
      "(ADD mode) Select objects: FOO",
      "*Invalid selection*",
      "Expects a point or Last",
      "(ADD mode) Select objects:",
      "Specify first corner point or [Object/Subtract area]: 0,0",
      " (ADD mode)Specify next point or [Undo]: 10,0",
      " (ADD mode)Specify next point or [Undo]: 10,10",
      " (ADD mode)Specify next point or [Undo/Total] <Total>: U",
      " (ADD mode)Specify next point or [Undo]: 10,10",
      " (ADD mode)Specify next point or [Undo/Total] <Total>: T",
      "Area = 50.00, Perimeter = 34.14",
      "Total area = 50.00",
      "Specify first corner point or [Object/Subtract area]: A",
      "Specify first corner point or [Object/Subtract area]: O",
      "(ADD mode) Select objects: L",
      "Area = 3.14, Circumference = 6.28",
      "Total area = 53.14",
      "(ADD mode) Select objects:",
      "Area = 3.14, Circumference = 6.28",
      "Total area = 53.14",
      "Specify first corner point or [Object/Subtract area]: S",
      "Specify first corner point or [Object/Add area]: FOO",
      "Point or option keyword required.",
      "Specify first corner point or [Object/Add area]:",
      "Total area = 53.14",
    ])
  })

  // AutoCAD 2027's console (probe inquiry/p215): the first corner declares
  // Entity and eXit unlisted (table 20164), and eXit says the total there is.
  it("takes Entity as Object and eXit to end, without listing them", () => {
    const cad = createHarness({ entities: [circleOf(p(5, 5), 2)] })

    cad.command("AREA")
    answer(cad, "E", "FOO", "L")
    expect(cad.commandLog().slice(1)).toEqual([
      "Specify first corner point or [Object/Add area/Subtract area] <Object>: E",
      "Select objects: FOO",
      "*Invalid selection*",
      "Expects a point or Last",
      "Select objects: L",
      "Area = 12.57, Circumference = 12.57",
    ])

    cad.command("AREA")
    answer(cad, "X")
    expect(cad.commandLog().at(-1)).toBe(
      "Specify first corner point or [Object/Add area/Subtract area] <Object>: X"
    )
    expect(cad.activeToolId()).toBe("select")

    cad.command("AREA")
    answer(cad, "A", "ENTITY", "L", "", "EXIT")
    expect(cad.commandLog().slice(-9)).toEqual([
      "Specify first corner point or [Object/Subtract area]: ENTITY",
      "(ADD mode) Select objects: L",
      "Area = 12.57, Circumference = 12.57",
      "Total area = 12.57",
      "(ADD mode) Select objects:",
      "Area = 12.57, Circumference = 12.57",
      "Total area = 12.57",
      "Specify first corner point or [Object/Subtract area]: EXIT",
      "Total area = 12.57",
    ])
    expect(cad.activeToolId()).toBe("select")
  })

  it("takes Entity and eXit in Autodesk's Spanish", () => {
    const cad = createHarness({
      locale: es,
      entities: [circleOf(p(0, 0), 5)],
    })

    cad.command("AREA")
    answer(cad, "E", "LT")
    expect(cad.commandLog().slice(-3)).toEqual([
      "Precise primer punto de esquina o [Objeto/Añadir área/Sustraer área] <Objeto>: E",
      "Designe objetos: LT",
      "Área = 78.54, Circunferencia = 31.42",
    ])

    cad.command("AREA")
    answer(cad, "S", "SA")
    expect(cad.commandLog().at(-1)).toBe(
      "Precise primer punto de esquina o [Objeto/Añadir área]: SA"
    )
    expect(cad.activeToolId()).toBe("select")
  })

  it("takes a subtracted area below zero", () => {
    const cad = createHarness()

    cad.command("AREA")
    answer(cad, "S", "0,0", "5,0", "5,5", "", "")

    expect(cad.commandLog().slice(-4)).toEqual([
      "Area = 12.50, Perimeter = 17.07",
      "Total area = -12.50",
      "Specify first corner point or [Object/Add area]:",
      "Total area = -12.50",
    ])
  })

  it("asks in Autodesk's Spanish", () => {
    const cad = createHarness({
      locale: es,
      entities: [circleOf(p(0, 0), 5)],
    })

    cad.command("AREA")
    answer(cad, "A", "0,0", "10,0", "10,10", "", "S", "O", "LT", "", "")
    expect(cad.commandLog().slice(1)).toEqual([
      "Precise primer punto de esquina o [Objeto/Añadir área/Sustraer área] <Objeto>: A",
      "Precise primer punto de esquina o [Objeto/Sustraer área]: 0,0",
      " (modo AÑADIR)Precise punto siguiente o [desHacer]: 10,0",
      " (modo AÑADIR)Precise punto siguiente o [desHacer]: 10,10",
      " (modo AÑADIR)Precise punto siguiente o [desHacer/Total] <Total>:",
      "Área = 50.00, Perímetro = 34.14",
      "Área total = 50.00",
      "Precise primer punto de esquina o [Objeto/Sustraer área]: S",
      "Precise primer punto de esquina o [Objeto/Añadir área]: O",
      "(modo SUSTRAER) Designe objetos: LT",
      "Área = 78.54, Circunferencia = 31.42",
      "Área total = -28.54",
      "(modo SUSTRAER) Designe objetos:",
      "Área = 78.54, Circunferencia = 31.42",
      "Área total = -28.54",
      "Precise primer punto de esquina o [Objeto/Añadir área]:",
      "Área total = -28.54",
    ])
  })

  it("asks in Autodesk's Spanish, its plain run too", () => {
    const cad = createHarness({
      locale: es,
      entities: [circleOf(p(0, 0), 5)],
    })

    cad.command("AREA")
    expect(cad.state().commandLine.prompt).toBe(
      "AREA Precise primer punto de esquina o [Objeto/Añadir área/Sustraer área] <Objeto>:"
    )
    answer(cad, "0,0", "H", "10,0", "10,10")
    expect(cad.state().commandLine.prompt).toBe(
      "AREA Precise punto siguiente o [desHacer/Total] <Total>:"
    )
    answer(cad, "T")
    expect(cad.commandLog().slice(3, 5)).toEqual([
      "Ya están deshechos todos los segmentos.",
      "Todos los efectos del comando han sido deshechos.",
    ])
    expect(cad.commandLog().at(-1)).toBe("Área = 50.00, Perímetro = 34.14")

    cad.command("AREA")
    answer(cad, "O", "LT")
    expect(cad.commandLog().slice(-3)).toEqual([
      "Precise primer punto de esquina o [Objeto/Añadir área/Sustraer área] <Objeto>: O",
      "Designe objetos: LT",
      "Área = 78.54, Circunferencia = 31.42",
    ])
  })
})

/** A harness at LUPREC 4 framing the probes' `ZOOM W -20,-20 20,20`. */
function consoleWindow(
  options: Parameters<typeof createHarness>[0] = {}
): CadHarness {
  return answer(console4(options), "ZOOM", "W", "-20,-20", "20,20")
}

// AutoCAD 2027's console, the same input.
describe("AREA's Select objects, as AutoCAD 2027's", () => {
  // probe circle/p241
  it("takes a typed point as its pick", () => {
    const cad = console4({ entities: [circleOf(p(0, 0), 10)] })
    answer(cad, "ZOOM", "W", "-30,-30", "50,40", "AREA", "O", "10,0")
    expect(cad.commandLog().slice(-3)).toEqual([
      "Specify first corner point or [Object/Add area/Subtract area] <Object>: O",
      "Select objects: 10,0",
      "Area = 314.1593, Circumference = 62.8319",
    ])
    expect(cad.activeToolId()).toBe("select")
  })

  // probes inquiry/p218, p240: a point on nothing or off the screen is asked
  // again without a word; the selection modes are no answer there.
  it("asks again, silent, at a point on nothing or off the screen", () => {
    const cad = consoleWindow({
      entities: [circleOf(p(500, 500), 5), circleOf(p(0, 0), 5)],
    })
    answer(cad, "AREA", "O", "FOO", "W", "U", "15,15", "505,500", "L")
    expect(cad.commandLog().slice(-13)).toEqual([
      "Select objects: FOO",
      "*Invalid selection*",
      "Expects a point or Last",
      "Select objects: W",
      "*Invalid selection*",
      "Expects a point or Last",
      "Select objects: U",
      "*Invalid selection*",
      "Expects a point or Last",
      "Select objects: 15,15",
      "Select objects: 505,500",
      "Select objects: L",
      "Area = 78.5398, Circumference = 31.4159",
    ])
  })

  // probe inquiry/p219: LASTPOINT 0,0, the cursor south-west of it
  it("picks at a number's distance from LASTPOINT towards the cursor", () => {
    const cad = consoleWindow({ entities: [circleOf(p(0, 0), 5)] })
    answer(cad, "ID", "0,0", "AREA", "O")
    cad.moveTo(p(-12, -9))
    answer(cad, "5")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Select objects: 5",
      "Area = 78.5398, Circumference = 31.4159",
    ])
  })

  // probe inquiry/p228: the centre is no point of the circle, so nothing is
  // found there and the prompt is asked again, nothing measured.
  it("picks where a typed object snap finds its point", () => {
    const objects = [lineOf(p(0, 0), p(10, 0)), circleOf(p(0, 10), 2)]
    const typed = consoleWindow({ entities: objects })
    answer(typed, "AREA", "O", "CEN", "2,10")
    expect(typed.activeToolId()).toBe("measurearea")
    expect(typed.commandLog().at(-1)).toBe("Select objects: CEN of 2,10")
    answer(typed, "L")
    expect(typed.commandLog().at(-1)).toBe(
      "Area = 12.5664, Circumference = 12.5664"
    )

    const clicked = consoleWindow({ entities: objects })
    answer(clicked, "AREA", "O", "CEN")
    clicked.click(p(2, 10))
    expect(clicked.activeToolId()).toBe("measurearea")
    expect(
      clicked.commandLog().filter((line) => line.startsWith("Area ="))
    ).toEqual([])
  })

  // probes inquiry/p220 (`5,0` typed), p217's trace
  // (`AllowObjectOnLockedLayer: true`)
  it("measures an object on a locked layer", () => {
    for (const pick of ["typed", "clicked", "Last"] as const) {
      const cad = consoleWindow({ entities: [circleOf(p(0, 0), 5)] })
      cad.runtime.updateLayer("0", { locked: true })
      answer(cad, "AREA", "O")
      if (pick === "clicked") cad.click(p(5, 0))
      else answer(cad, pick === "typed" ? "5,0" : "L")
      expect(cad.commandLog().at(-1)).toBe(
        "Area = 78.5398, Circumference = 31.4159"
      )
    }
  })

  // probe inquiry/p253: the pick is LASTPOINT; Last leaves it
  it("puts LASTPOINT at the pick, where Last leaves it", () => {
    const entities = [circleOf(p(0, 0), 5), lineOf(p(20, 20), p(30, 30))]
    const typed = consoleWindow({ entities })
    answer(typed, "AREA", "O", "5,0")
    expect(lastPoint(typed)).toBe(at("5.0000", "0.0000"))

    const clicked = consoleWindow({ entities })
    answer(clicked, "AREA", "O")
    clicked.click(p(5, 0))
    expect(lastPoint(clicked)).toBe(at("5.0000", "0.0000"))

    answer(clicked, "AREA", "O", "L", "")
    expect(clicked.commandLog().slice(-3)).toEqual([
      "Select objects: L",
      "Selected object does not have an area",
      "Select objects:",
    ])
    expect(lastPoint(clicked)).toBe(at("5.0000", "0.0000"))
  })

  // probe inquiry/p217
  it("ends without a word at Enter", () => {
    const cad = console4({ entities: [circleOf(p(0, 0), 5)] })
    answer(cad, "AREA", "", "")
    expect(cad.commandLog()).toEqual([
      "AREA",
      "Specify first corner point or [Object/Add area/Subtract area] <Object>:",
      "Select objects:",
    ])
    expect(cad.activeToolId()).toBe("select")
  })

  // probe inquiry/p222
  it("says a wide polyline's width is left out", () => {
    const wide = polylineOf([p(0, 0), p(10, 0), p(10, 10), p(0, 10)], {
      closed: true,
      bulges: [0, 1, 0, 0],
      widths: [
        [2, 2],
        [2, 2],
        [2, 2],
        [2, 2],
      ],
    })
    const en = console4({ entities: [wide] })
    answer(en, "AREA", "O", "L")
    expect(en.commandLog().slice(-2)).toEqual([
      "Area = 139.2699, Perimeter = 45.7080",
      "Polyline's width ignored in area calculation.",
    ])

    const spanish = console4({ locale: es, entities: [wide] })
    answer(spanish, "AREA", "O", "LT")
    expect(spanish.commandLog().slice(-2)).toEqual([
      "Área = 139.2699, Perímetro = 45.7080",
      "Grosor de polilínea ignorado en cálculo de área.",
    ])
  })
})

describe("AREA's Add area and Subtract area, as AutoCAD 2027's", () => {
  // probes inquiry/p215, p254, p258: the total once there is one
  it("says the total at eXit and at Enter once it has measured", () => {
    const measured = console4({ entities: [circleOf(p(0, 0), 5)] })
    answer(measured, "AREA", "A", "E", "L", "", "X")
    expect(measured.commandLog().slice(-8)).toEqual([
      "(ADD mode) Select objects: L",
      "Area = 78.5398, Circumference = 31.4159",
      "Total area = 78.5398",
      "(ADD mode) Select objects:",
      "Area = 78.5398, Circumference = 31.4159",
      "Total area = 78.5398",
      "Specify first corner point or [Object/Subtract area]: X",
      "Total area = 78.5398",
    ])
    expect(measured.activeToolId()).toBe("select")

    const exited = console4()
    answer(exited, "AREA", "A", "O", "", "X")
    expect(exited.commandLog().slice(1)).toEqual([
      "Specify first corner point or [Object/Add area/Subtract area] <Object>: A",
      "Specify first corner point or [Object/Subtract area]: O",
      "(ADD mode) Select objects:",
      "Specify first corner point or [Object/Subtract area]: X",
    ])
    expect(exited.activeToolId()).toBe("select")

    const entered = console4()
    answer(entered, "AREA", "A", "")
    expect(entered.commandLog().slice(1)).toEqual([
      "Specify first corner point or [Object/Add area/Subtract area] <Object>: A",
      "Specify first corner point or [Object/Subtract area]:",
    ])
    expect(entered.activeToolId()).toBe("select")
  })

  // probe inquiry/p216 es
  it("says it at SAlir in Autodesk's Spanish", () => {
    const cad = console4({ locale: es, entities: [circleOf(p(0, 0), 5)] })
    answer(cad, "AREA", "A", "O", "LT", "", "S", "O", "LT", "", "SA")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Precise primer punto de esquina o [Objeto/Añadir área]: SA",
      "Área total = 0.0000",
    ])
  })

  // probes inquiry/p212 (87.5), p213 (0), p214 (-12.5); a plain run's own
  // area, p211, p248
  it("leaves the running total in AREA", () => {
    const area = (cad: CadHarness) => {
      answer(cad, "'AREA")
      return cad.commandLog().at(-1)
    }
    const both = console4()
    answer(both, "AREA", "A", "0,0", "10,0", "10,10", "0,10", "")
    answer(both, "S", "0,0", "5,0", "5,5", "", "")
    expect(area(both)).toBe("AREA = 87.5000 (read only)")

    const none = console4({ entities: [circleOf(p(5, 5), 2)] })
    answer(none, "AREA", "A", "O", "L", "", "S", "O", "L", "", "")
    expect(area(none)).toBe("AREA = 0.0000 (read only)")

    const below = console4()
    answer(below, "AREA", "S", "0,0", "5,0", "5,5", "", "")
    expect(area(below)).toBe("AREA = -12.5000 (read only)")

    const plain = console4({ entities: [circleOf(p(0, 0), 1)] })
    answer(plain, "AREA", "0,0", "10,0", "10,10", "")
    expect(area(plain)).toBe("AREA = 50.0000 (read only)")
    answer(plain, "AREA", "O", "L")
    expect(area(plain)).toBe("AREA = 3.1416 (read only)")
  })

  // probe inquiry/p255
  it("says the last area and the total again after 'AREA at the first corner", () => {
    const cad = console4()
    answer(cad, "AREA", "A", "0,0", "10,0", "10,10", "", "'AREA")
    expect(cad.commandLog().slice(-5)).toEqual([
      "Specify first corner point or [Object/Subtract area]: 'AREA",
      "AREA = 50.0000 (read only)",
      "Resuming AREA command.",
      "Area = 50.0000, Perimeter = 34.1421",
      "Total area = 50.0000",
    ])
    answer(cad, "X")
    expect(cad.commandLog().at(-1)).toBe("Total area = 50.0000")
  })
})

describe("AREA's corners, as AutoCAD 2027's", () => {
  // probes inquiry/p206, p207: a number is direct distance from LASTPOINT
  it("takes a number at the first corner from LASTPOINT", () => {
    const zero = console4()
    answer(zero, "AREA", "0", "10,0", "10,10", "")
    expect(zero.commandLog().at(-1)).toBe("Area = 50.0000, Perimeter = 34.1421")

    const back = console4()
    back.moveTo(CONSOLE_CURSOR)
    answer(back, "AREA")
    back.moveTo(CONSOLE_CURSOR)
    answer(back, "-5", "10,0", "10,10", "")
    expect(back.commandLog().at(-1)).toBe("Area = 73.2033, Perimeter = 43.6010")
  })

  // probe inquiry/p241: only the last Undo, at the first corner, says so
  it("undoes back to the first corner from three points", () => {
    const cad = console4()
    answer(cad, "AREA", "0,0", "10,0", "10,10", "U", "U", "U", "10,0", "10,10")
    answer(cad, "")
    expect(cad.commandLog().slice(4)).toEqual([
      "Specify next point or [Undo/Total] <Total>: U",
      "Specify next point or [Undo]: U",
      "Specify next point or [Undo]: U",
      "All segments already undone.",
      "Command has been completely undone.",
      "Specify next point or [Undo]: 10,0",
      "Specify next point or [Undo]: 10,10",
      "Specify next point or [Undo/Total] <Total>:",
      "Area = 50.0000, Perimeter = 34.1421",
    ])
  })

  // probes inquiry/p231 (UCS Z 30), p232 (UCS X 90), p233 (a bow-tie)
  it("measures in the UCS, and a bow-tie as nothing", () => {
    const turned = console4()
    answer(turned, "UCS", "Z", "30", "AREA", "0,0", "10,0", "10,10", "0,10", "")
    expect(turned.commandLog().at(-1)).toBe(
      "Area = 100.0000, Perimeter = 40.0000"
    )
    expect(lastPoint(turned)).toBe(at("0.0000", "10.0000"))

    const tilted = console4()
    answer(tilted, "UCS", "X", "90", "AREA", "0,0", "10,0", "10,5", "")
    expect(tilted.commandLog().at(-1)).toBe(
      "Area = 25.0000, Perimeter = 26.1803"
    )
    expect(lastPoint(tilted)).toBe(at("10.0000", "5.0000"))

    const bowTie = console4()
    answer(bowTie, "AREA", "0,0", "10,10", "10,0", "0,10", "")
    expect(bowTie.commandLog().at(-1)).toBe(
      "Area = 0.0000, Perimeter = 48.2843"
    )
  })

  // probes inquiry/p208, p357: LASTPOINT is the last corner, whatever was
  // before
  it("leaves LASTPOINT at the last corner", () => {
    const cad = console4()
    answer(cad, "ID", "7,8", "AREA", "0,0", "10,0", "10,10", "")
    expect(lastPoint(cad)).toBe(at("10.0000", "10.0000"))
  })
})
