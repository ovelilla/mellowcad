import { describe, expect, it } from "vitest"

import { type CadHarness, createHarness } from "../../../test/harness"
import { lineOf, p } from "../../../test/builders"
import type { PolylineEntity } from "../../domain/entities"
import { es } from "../../locales/es"
import { THEME } from "../../scene/theme"
import type { Vec2 } from "../../geometry/Vec2"

/** Typed at the command line and confirmed, as AutoCAD's prompt reads it. */
function answerLine(cad: CadHarness, ...answers: string[]): CadHarness {
  for (const text of answers) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

/** The polyline drawn, as `x,y` vertices and the bulge of each segment. */
function drawn(cad: CadHarness): { at: string[]; bulges: number[] } {
  const polyline = cad.only<PolylineEntity>("polyline")
  const round = (n: number) => Math.round(n * 10000) / 10000
  return {
    at: polyline.vertices.map((v) => `${round(v.x)},${round(v.y)}`),
    bulges: (polyline.bulges ?? []).map(round),
  }
}

/** `ARC 0,10 7.0710678,7.0710678 10,0`: a quarter drawn clockwise (pline/p32). */
const CLOCKWISE_ARC = ["ARC", "0,10", "7.0710678,7.0710678", "10,0"] as const

const ARC_PROMPT =
  "Specify endpoint of arc (hold Ctrl to switch direction) or [Angle/CEnter/CLose/Direction/Halfwidth/Line/Radius/Second pt/Undo/Width]:"

// AutoCAD 2027's console is the reference for every prompt, refusal and
// bulge below (pline/p01, p09, p10, p100–p136: its MPDUMP of the polyline
// drawn by the same answers).
describe("PLINE's arc mode", () => {
  it("lists AutoCAD's arc options, Close once a segment exists", () => {
    const cad = createHarness()
    cad.command("PLINE")
    answerLine(cad, "0,0")
    expect(cad.state().commandLine.prompt).toBe(
      "PLINE Specify next point or [Arc/Halfwidth/Length/Undo/Width]:"
    )
    answerLine(cad, "10,0")
    expect(cad.state().commandLine.prompt).toBe(
      "PLINE Specify next point or [Arc/Close/Halfwidth/Length/Undo/Width]:"
    )
    answerLine(cad, "A", "FOO")
    expect(cad.commandLog().slice(-2)).toEqual([
      `${ARC_PROMPT} FOO`,
      "2D point or option keyword required.",
    ])
  })

  it("closes after one segment, as the console does", () => {
    const cad = createHarness()
    cad.command("PLINE")
    answerLine(cad, "0,0", "10,0", "C")
    const polyline = cad.only<PolylineEntity>("polyline")
    expect(polyline.closed).toBe(true)
    expect(polyline.vertices).toHaveLength(2)
  })

  it("Angle: an included angle, then an endpoint, a centre or a radius", () => {
    const cad = createHarness()
    cad.command("PLINE")
    answerLine(cad, "0,0", "A", "A", "FOO", "90", "R", "FOO", "10", "FOO", "45")
    expect(cad.commandLog().slice(2, 14)).toEqual([
      "Current line-width is 0.00",
      "Specify next point or [Arc/Halfwidth/Length/Undo/Width]: A",
      "Specify endpoint of arc (hold Ctrl to switch direction) or [Angle/CEnter/Direction/Halfwidth/Line/Radius/Second pt/Undo/Width]: A",
      "Specify included angle: FOO",
      "Requires valid numeric angle or second point.",
      "Specify included angle: 90",
      "Specify endpoint of arc (hold Ctrl to switch direction) or [CEnter/Radius]: R",
      "Specify radius of arc: FOO",
      "Requires numeric distance or two points.",
      "Specify radius of arc: 10",
      "Specify direction of chord for arc (hold Ctrl to switch direction) <0>: FOO",
      "Requires valid numeric angle or second point.",
    ])
    answerLine(cad, "A", "-90", "30,0", "CE", "40,0", "L", "-10", "")
    expect(drawn(cad)).toEqual({
      at: ["0,0", "10,10", "30,0", "35,8.6603"],
      bulges: [0.4142, -0.4142, 3.7321],
    })
  })

  it("Radius: the minor arc counter-clockwise, or a chord's direction", () => {
    const left = createHarness()
    left.command("PLINE")
    answerLine(left, "0,0", "10,0", "A", "R", "10", "10,-10", "")
    expect(drawn(left).bulges).toEqual([0, 0.2679])

    const chord = createHarness()
    chord.command("PLINE")
    // Enter takes the chord's `<0>`: where the line before it heads.
    answerLine(chord, "0,0", "10,0", "A", "R", "10", "A", "60", "", "")
    expect(drawn(chord)).toEqual({
      at: ["0,0", "10,0", "20,0"],
      bulges: [0, 0.2679],
    })
  })

  it("Direction, Second pt and CEnter's endpoint", () => {
    const cad = createHarness()
    cad.command("PLINE")
    answerLine(cad, "0,0", "10,0", "A", "D", "90", "20,10")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Specify the tangent direction for the start point of arc: 90",
      "Specify endpoint of the arc (hold Ctrl to switch direction): 20,10",
    ])
    answerLine(cad, "S", "25,15", "30,10", "CE", "40,10", "40,-30", "")
    expect(drawn(cad)).toEqual({
      at: ["0,0", "10,0", "20,10", "30,10", "40,0"],
      bulges: [0, -0.4142, -1, 0.4142],
    })
  })

  it("CLose closes with the tangent arc, or `*Invalid*` and a line", () => {
    const arc = createHarness()
    arc.command("PLINE")
    answerLine(arc, "0,0", "10,0", "A", "20,10", "CL")
    expect(arc.only<PolylineEntity>("polyline").closed).toBe(true)
    expect(drawn(arc).bulges).toEqual([0, 0.4142, 1.618])

    const back = createHarness()
    back.command("PLINE")
    answerLine(back, "0,0", "10,0", "A", "CL")
    expect(back.commandLog().at(-1)).toBe("*Invalid*")
    expect(back.only<PolylineEntity>("polyline").closed).toBe(true)
    expect(drawn(back).bulges.some((bulge) => bulge !== 0)).toBe(false)
  })

  it("leaves the start along the last thing drawn, or refuses an end straight ahead", () => {
    const after = createHarness({
      entities: [lineOf(p(50, 50), p(60, 60))],
    })
    after.command("PLINE")
    answerLine(after, "0,0", "A", "10,0", "")
    expect(drawn(after).bulges).toEqual([-0.4142])

    const blank = createHarness()
    blank.command("PLINE")
    answerLine(blank, "0,0", "A", "10,0")
    expect(blank.commandLog().slice(-2)).toEqual([
      "Specify endpoint of arc (hold Ctrl to switch direction) or [Angle/CEnter/Direction/Halfwidth/Line/Radius/Second pt/Undo/Width]: 10,0",
      "*Invalid*",
    ])
  })

  it("leaves the start the way a clockwise arc was drawn, ending", () => {
    // probes pline/p33, p35, p37: the arc drawn from (0,10) ends heading
    // (0,-1), at (10,0), its stored start.
    const half = answerLine(createHarness(), ...CLOCKWISE_ARC)
    answerLine(half, "PLINE", "20,0", "A", "@10,0", "")
    expect(drawn(half).bulges[0]).toBeCloseTo(1, 6)

    const continued = answerLine(createHarness(), ...CLOCKWISE_ARC)
    answerLine(continued, "PLINE", "", "A", "@10,10", "")
    expect(drawn(continued)).toEqual({
      at: ["10,0", "20,10"],
      bulges: [2.4142],
    })

    const chord = answerLine(createHarness(), ...CLOCKWISE_ARC)
    answerLine(chord, "PLINE", "20,0", "A", "R", "10", "A", "90")
    expect(chord.state().commandLine.prompt).toBe(
      "PLINE Specify direction of chord for arc (hold Ctrl to switch direction) <270>:"
    )
  })

  it("leaves the start along the UCS's X with nothing drawn", () => {
    // probe pline/p193: UCS Z 30, a half circle to @0,10.
    const cad = answerLine(createHarness(), "UCS", "Z", "30")
    answerLine(cad, "PLINE", "0,0", "A", "@0,10", "")

    expect(drawn(cad).bulges[0]).toBeCloseTo(1, 6)
  })

  it("refuses a Z, `*` and `#` at a sub-prompt's point", () => {
    // probe pline/p137: CEnter's centre.
    const cad = answerLine(createHarness(), "PLINE", "0,0", "10,0", "A", "CE")
    const from = cad.commandLog().length
    answerLine(cad, "20,0,5", "*20,0", "#20,0", "20,0")

    expect(cad.commandLog().slice(from)).toEqual([
      "Specify center point of arc: 20,0,5",
      "Invalid 2D point.",
      "Specify center point of arc: *20,0",
      "Invalid 2D point.",
      "Specify center point of arc: #20,0",
      "Invalid 2D point.",
      "Specify center point of arc: 20,0",
    ])
  })

  it("undoes nothing with nothing drawn, and an arc back to the line prompt", () => {
    const cad = createHarness()
    cad.command("PLINE")
    answerLine(cad, "0,0", "U")
    expect(cad.commandLog().at(-1)).toBe("All segments already undone.")
    answerLine(cad, "A", "R", "10", "10,10", "U")
    expect(cad.state().commandLine.prompt).toBe(
      "PLINE Specify next point or [Arc/Halfwidth/Length/Undo/Width]:"
    )
  })

  it("refuses Enter where the step has no default, rather than ending", () => {
    const cad = createHarness()
    cad.command("PLINE")
    answerLine(cad, "0,0", "A", "CE", "10,0", "")
    expect(cad.commandLog().at(-1)).toBe("2D point or option keyword required.")
    answerLine(cad, "A", "")
    expect(cad.commandLog().at(-1)).toBe(
      "Requires valid numeric angle or second point."
    )
    expect(cad.activeToolId()).toBe("polyline")
  })

  it("draws a dashed chord from the arc's start to its end at the cursor", () => {
    // desktop pline/d03, d06: the arc's jig and an amber dashed line from its
    // start point, at the arc prompt as at an option's endpoint.
    const chord = (cad: CadHarness) =>
      cad
        .scene()
        .primitives.flatMap((q) =>
          q.kind === "segment" && q.stroke.dash ? [q] : []
        )
    const dashed = (cad: CadHarness, from: Vec2, to: Vec2) => [
      expect.objectContaining({
        a: expect.objectContaining(cad.toScreen(from)),
        b: expect.objectContaining(cad.toScreen(to)),
        stroke: { color: THEME.dashedRubberBand, width: 1, dash: [2, 3] },
      }),
    ]
    const cad = createHarness()
    cad.command("PLINE").click(p(0, 0)).click(p(50, 0)).moveTo(p(80, 30))
    expect(chord(cad)).toEqual([])

    cad.option("Arc").moveTo(p(80, 30))
    expect(chord(cad)).toEqual(dashed(cad, p(50, 0), p(80, 30)))

    answerLine(cad, "R", "40")
    cad.moveTo(p(90, 20))
    expect(chord(cad)).toEqual(dashed(cad, p(50, 0), p(90, 20)))
  })

  it("is measured by picks, and Ctrl turns the arc the other way", () => {
    const cad = createHarness()
    cad.command("PLINE").click(p(0, 0)).click(p(10, 0)).option("Arc")
    cad.option("Radius").click(p(0, 0)).moveTo(p(0, 5))
    expect(cad.state().commandLine.prompt).toBe("PLINE Specify second point:")
    cad.click(p(0, 10)).click(p(10, 10))
    cad.option("Center").click(p(20, 10)).click(p(20, -30), { ctrlKey: true })
    cad.enter()
    expect(drawn(cad)).toEqual({
      // Clockwise from 180° round to the ray at 270°: three quarters.
      at: ["0,0", "10,0", "10,10", "20,0"],
      bulges: [0, 0.2679, -2.4142],
    })
  })

  it("asks in Spanish", () => {
    const cad = createHarness({ locale: es })
    cad.command("POL")
    answerLine(cad, "0,0", "10,0", "A")
    expect(cad.state().commandLine.prompt).toBe(
      "POL Precise punto final del arco (mantenga pulsada la tecla Ctrl para cambiar de dirección) o [ángUlo/cEntro/Cerrar/Dirección/Mitad grosor/líNea/Radio/Segundo pto./desHacer/Grosor]:"
    )
    answerLine(cad, "E", "20,0", "U", "FOO")
    expect(cad.commandLog().slice(-4)).toEqual([
      "Precise punto central del arco: 20,0",
      "Precise punto final del arco (mantenga pulsada la tecla Ctrl para cambiar de dirección) o [ángUlo/Longitud]: U",
      "Precise ángulo incluido (mantenga pulsada la tecla Ctrl para cambiar de dirección): FOO",
      "Requiere un ángulo numérico válido o un segundo punto.",
    ])
  })
})

/** PLINE from (0,0) to (10,0), in arc mode, then `answers`. */
function arcFromLine(...answers: string[]): CadHarness {
  return answerLine(createHarness(), "PLINE", "0,0", "10,0", "A", ...answers)
}

/** LASTPOINT as `ID @` writes it, once PLINE has ended. */
function lastPoint(cad: CadHarness): string | undefined {
  answerLine(cad, "", "ID", "@")
  return cad.commandLog().at(-1)
}

// AutoCAD 2027's console, each test citing its probe.
describe("PLINE's arc options", () => {
  it("cancel at `*Invalid*` and ask the arc prompt again, LASTPOINT kept", () => {
    for (const [answers, probe] of [
      [["CE", "20,0", "L", "100"], "p118, p254"],
      [["D", "90", "20,10", "D", "0", "10,10"], "p119"],
      [["D", "0", "30,0"], "p120, p253"],
      [["R", "10", "50,0"], "p123, p255"],
      [["S", "15,5", "20,0", "S", "25,0", "30,0"], "p125"],
      [["CE", "20,0", "A", "0"], "p250"],
      [["CE", "20,0", "A", "360"], "p251"],
    ] as const) {
      const cad = arcFromLine(...answers)
      expect(cad.commandLog().at(-1), probe).toBe("*Invalid*")
      expect(cad.state().commandLine.prompt, probe).toBe(`PLINE ${ARC_PROMPT}`)
    }
    // pline/p252–p255: the arc's start, whatever the option's points set.
    for (const answers of [
      ["CE", "20,0", "L", "100"],
      ["D", "0", "30,0"],
      ["R", "10", "50,0"],
      ["S", "25,0", "30,0"],
    ]) {
      expect(lastPoint(arcFromLine(...answers))).toMatch(
        /^ X = 10\.00 +Y = 0\.00 /
      )
    }
  })

  it("refuse an included angle of 0 or 360 at Angle", () => {
    // pline/p110, p111
    const cad = arcFromLine("A", "0", "360")
    expect(cad.commandLog().slice(-4)).toEqual([
      "Specify included angle: 0",
      "Value must be nonzero.",
      "Specify included angle: 360",
      "Value must be nonzero.",
    ])
    answerLine(cad, "90", "20,0", "")
    expect(drawn(cad).bulges).toEqual([0, 0.4142])

    const spanish = createHarness({ locale: es })
    answerLine(spanish, "POL", "0,0", "10,0", "A", "U", "0")
    expect(spanish.commandLog().at(-1)).toBe(
      "El valor debe ser diferente de cero."
    )
  })

  it("take a negative radius as the major arc, and refuse 0", () => {
    // pline/p122
    expect(drawn(arcFromLine("R", "-10", "20,0", "")).bulges).toEqual([
      0, 3.7321,
    ])
    // pline/p136
    const zero = arcFromLine("R", "0")
    expect(zero.commandLog().at(-1)).toBe("Value must be nonzero.")
    expect(zero.state().commandLine.prompt).toBe("PLINE Specify radius of arc:")
    answerLine(zero, "10", "A", "90", "45", "")
    expect(drawn(zero)).toEqual({
      at: ["0,0", "10,0", "20,10"],
      bulges: [0, 0.4142],
    })
  })

  it("take Angle's radius 0, a segment of no length, and a negative one", () => {
    // pline/p131
    const cad = arcFromLine("A", "90", "R", "0", "10", "")
    expect(cad.commandLog()).toContain(
      "Specify direction of chord for arc (hold Ctrl to switch direction) <0>: 10"
    )
    expect(drawn(cad)).toEqual({
      at: ["0,0", "10,0", "10,0"],
      bulges: [0, 0.4142],
    })
    // pline/p256, p257: a negative one as long as the positive, after Angle
    // or Radius.
    for (const answers of [
      ["A", "90", "R", "-10", "0", ""],
      ["R", "-10", "A", "90", "0", ""],
    ]) {
      expect(drawn(arcFromLine(...answers))).toEqual({
        at: ["0,0", "10,0", "24.1421,0"],
        bulges: [0, 0.4142],
      })
    }
  })

  it("refuse CEnter's chord of 0", () => {
    // pline/p133, p117
    const cad = arcFromLine("CE", "20,0", "L", "0")
    expect(cad.commandLog().at(-1)).toBe("Value must be nonzero.")
    expect(cad.state().commandLine.prompt).toBe(
      "PLINE Specify length of chord (hold Ctrl to switch direction):"
    )
    answerLine(cad, "10", "")
    expect(drawn(cad)).toEqual({
      at: ["0,0", "10,0", "15,-8.6603"],
      bulges: [0, 0.2679],
    })
  })

  it("keep the chain's heading at Direction's Enter, no default shown", () => {
    // pline/p134
    const cad = createHarness()
    answerLine(cad, "PLINE", "0,0", "0,10", "A", "D", "", "10,20", "")
    expect(cad.commandLog()).toContain(
      "Specify the tangent direction for the start point of arc:"
    )
    expect(drawn(cad)).toEqual({
      at: ["0,0", "0,10", "10,20"],
      bulges: [0, -0.4142],
    })
  })

  it("read a typed point from LASTPOINT", () => {
    // pline/p138: Second pt's end from its second point.
    const cad = arcFromLine("S", "@5,5", "@5,-5", "CE", "@10<0", "30,-30")
    expect(drawn(answerLine(cad, ""))).toEqual({
      at: ["0,0", "10,0", "20,0", "30,-10"],
      bulges: [0, -1, 0.4142],
    })
    answerLine(cad, "ID", "@")
    expect(cad.commandLog().at(-1)).toMatch(/^ X = 30\.00 +Y = -10\.00 /)
  })

  it("write the chord's default again as first written, after 'AUPREC", () => {
    // pline/p114
    const cad = createHarness()
    answerLine(cad, "PLINE", "0,0", "30,20", "A", "A", "90", "R", "10", "")
    answerLine(cad, "A", "90", "R", "10", "'AUPREC", "4")
    expect(cad.state().commandLine.prompt).toBe(
      "PLINE Specify direction of chord for arc (hold Ctrl to switch direction) <79>:"
    )
    answerLine(cad, "", "")
    expect(drawn(cad).at.at(-1)).toBe("44.5405,41.7122")
  })

  it("say a heading off the UCS's plane is taken in it", () => {
    // pline/p149: the last line drawn rises.
    const cad = answerLine(createHarness(), "LINE", "0,0,0", "10,0,10", "")
    answerLine(cad, "PLINE", "20,0", "A", "A", "90", "R", "10", "")
    const said = "Previous direction not UCS parallel, using 0."
    expect(cad.commandLog().filter((line) => line === said)).toHaveLength(2)
    expect(cad.commandLog().indexOf(said)).toBe(
      cad
        .commandLog()
        .indexOf("Specify next point or [Arc/Halfwidth/Length/Undo/Width]: A") +
        1
    )
    expect(drawn(answerLine(cad, "")).at).toEqual(["20,0", "34.1421,0"])
  })

  it("declare Spanish `Segundo` for Second pt, listed `Segundo pto.`", () => {
    // pline/p101, p102: `SEGUNDO` at both arc prompts.
    const cad = createHarness({ locale: es })
    answerLine(cad, "POL", "0,0", "A")
    const second = () =>
      cad.state().commandOptions.find((option) => option.id === "Second pt")
    expect(second()).toMatchObject({
      keyword: "Segundo",
      label: "Segundo pto.",
    })
    answerLine(cad, "SEGUNDO", "5,5", "10,0", "SEGUNDO", "15,-5", "20,0", "")
    expect(drawn(cad)).toEqual({
      at: ["0,0", "10,0", "20,0"],
      bulges: [-1, 1],
    })
  })

  it("take Spanish `CE` at the arc prompt as Cerrar, English's as CEnter", () => {
    // pline/p104 es: straight back, `*No válido*` and a line.
    const spanish = createHarness({ locale: es })
    answerLine(spanish, "POL", "0,0", "10,0", "A", "CE")
    expect(spanish.commandLog().at(-1)).toBe("*No válido*")
    expect(spanish.only<PolylineEntity>("polyline").closed).toBe(true)
    // pline/p104 en
    const english = arcFromLine("CE", "E", "20,0", "20,-30", "")
    expect(english.commandLog()).toContain("Invalid 2D point.")
    expect(drawn(english)).toEqual({
      at: ["0,0", "10,0", "20,-10"],
      bulges: [0, 0.4142],
    })
  })
})

// AutoCAD 2027's console, each case citing its probe (MPDUMP's bulges).
describe("PLINE's arc options as the console draws them", () => {
  it("takes Second pt by its capitals, its start or its word", () => {
    // pline/p100
    const cad = arcFromLine("S", "15,5", "20,0", "SE", "25,-5", "30,0")
    answerLine(cad, "SECOND", "35,5", "40,0", "")
    expect(drawn(cad)).toEqual({
      at: ["0,0", "10,0", "20,0", "30,0", "40,0"],
      bulges: [0, -1, 1, -1],
    })
  })

  it("takes Spanish `C` as Cerrar, a hidden ARc, and `_CEN` at CEnter's centre", () => {
    // pline/p103 es
    const spanish = createHarness({ locale: es })
    answerLine(spanish, "POL", "0,0", "10,0", "A", "20,10", "C")
    expect(spanish.only<PolylineEntity>("polyline").closed).toBe(true)
    // pline/p108: ARc asks the arc prompt again.
    const hidden = answerLine(createHarness(), "PLINE", "0,0", "A", "AR")
    answerLine(hidden, "10,10", "L", "20,10", "")
    expect(drawn(hidden)).toEqual({
      at: ["0,0", "10,10", "20,10"],
      bulges: [0.4142, 0],
    })
    // pline/p106, p107: the snaps at the arc prompt's options.
    const snapped = answerLine(createHarness(), "CIRCLE", "50,20", "5")
    answerLine(snapped, "ZOOM", "W", "-10,-30", "70,40")
    answerLine(snapped, "PLINE", "0,0", "10,0", "A", "CE", "_CEN", "55,20")
    answerLine(snapped, "A", "90", "")
    expect(drawn(snapped).at).toEqual(["0,0", "10,0", "70,-20"])
    const spelled = answerLine(createHarness({ locale: es }), "POL", "0,0")
    answerLine(spelled, "10,0", "A", "CENTER")
    expect(spelled.commandLog().at(-1)).toBe(
      "Se requiere un punto 2D o una opción."
    )
  })

  it("draws Angle's arcs", () => {
    // pline/p109
    expect(drawn(arcFromLine("A", "-90", "20,0", "")).bulges).toEqual([
      0, -0.4142,
    ])
    // pline/p112
    const center = arcFromLine("A", "90", "CE", "20,10", "A", "-90", "CE")
    expect(drawn(answerLine(center, "40,-10", ""))).toEqual({
      at: ["0,0", "10,0", "30,0", "50,0"],
      bulges: [0, 0.4142, -0.4142],
    })
    // pline/p113: the chord's default where the chain heads.
    const chord = arcFromLine("A", "90", "R", "10", "45", "A", "-90", "R")
    answerLine(chord, "10")
    expect(chord.state().commandLine.prompt).toBe(
      "PLINE Specify direction of chord for arc (hold Ctrl to switch direction) <90>:"
    )
    expect(drawn(answerLine(chord, "", ""))).toEqual({
      at: ["0,0", "10,0", "20,10", "20,24.1421"],
      bulges: [0, 0.4142, -0.4142],
    })
  })

  it("draws CEnter's, Radius's and Second pt's arcs", () => {
    // pline/p116
    const ray = arcFromLine("CE", "20,0", "20,-30", "CE", "20,0", "A", "-90")
    expect(drawn(answerLine(ray, ""))).toEqual({
      at: ["0,0", "10,0", "20,-10", "10,0"],
      bulges: [0, 0.4142, -0.4142],
    })
    // pline/p117: the second centre `@` from the first arc's end.
    const chord = arcFromLine("CE", "20,0", "L", "10", "CE", "@10,0", "L")
    expect(drawn(answerLine(chord, "-10", ""))).toEqual({
      at: ["0,0", "10,0", "15,-8.6603", "20,0"],
      bulges: [0, 0.2679, 3.7321],
    })
    // pline/p121: the minor arc counter-clockwise, whichever side.
    const radius = arcFromLine("R", "10", "20,10", "R", "10", "30,0", "")
    expect(drawn(radius).bulges).toEqual([0, 0.4142, 0.4142])
    // pline/p124
    expect(drawn(arcFromLine("R", "10", "A", "90", "45", ""))).toEqual({
      at: ["0,0", "10,0", "20,10"],
      bulges: [0, 0.4142],
    })
  })

  it("measures an option's angles, radius and chord by points", () => {
    // pline/p140
    const angle = arcFromLine("A", "20,10", "R", "0,0", "0,10", "10,20", "")
    expect(drawn(angle)).toEqual({
      at: ["0,0", "10,0", "10,7.6537"],
      bulges: [0, 0.1989],
    })
    // pline/p141
    const chord = arcFromLine("CE", "20,0", "L", "10,10", "D", "15,0", "25,0")
    expect(drawn(answerLine(chord, ""))).toEqual({
      at: ["0,0", "10,0", "15,-8.6603", "25,0"],
      bulges: [0, 0.2679, -0.4569],
    })
  })

  it("refuses Enter and FOO at the points, and CLose or `@` at the first arc prompt", () => {
    // pline/p132
    const center = arcFromLine("A", "90", "CE", "", "FOO", "20,10", "")
    expect(
      center.commandLog().filter((line) => line === "Invalid 2D point.")
    ).toHaveLength(2)
    expect(drawn(center).at).toEqual(["0,0", "10,0", "30,0"])
    // pline/p135
    const second = arcFromLine("S", "", "FOO", "15,5", "", "FOO", "20,0", "")
    expect(
      second.commandLog().filter((line) => line === "Invalid 2D point.")
    ).toHaveLength(4)
    expect(drawn(second).bulges).toEqual([0, -1])
    // pline/p130
    const first = answerLine(createHarness(), "PLINE", "0,0", "A", "CL", "@")
    expect(first.commandLog().slice(-3)).toEqual([
      "2D point or option keyword required.",
      `${ARC_PROMPT.replace("CLose/", "")} @`,
      "*Invalid*",
    ])
    expect(drawn(answerLine(first, "10,10", "")).bulges).toEqual([0.4142])
  })

  it("runs a transparent command at a sub-prompt", () => {
    // pline/p142 ('ORTHOMODE there is TRK-02's, LINE's review)
    const ltscale = arcFromLine("R", "'LTSCALE", "2", "10", "20,10", "")
    expect(ltscale.commandLog()).toEqual(
      expect.arrayContaining([
        ">>Enter new linetype scale factor <1.0000>: 2",
        "Resuming PLINE command.",
        "Specify radius of arc: 10",
      ])
    )
    expect(ltscale.runtime.document.getSettings().ltScale).toBe(2)
    // pline/p143
    const zoom = arcFromLine("CE", "'ZOOM", "W", "-10,-30", "70,40", "20,0")
    expect(drawn(answerLine(zoom, "20,-30", "")).at).toEqual([
      "0,0",
      "10,0",
      "20,-10",
    ])
  })
})

// AutoCAD 2027's console (pline/p152–p160): the line's length, on along the
// chain.
describe("PLINE's Length", () => {
  it("asks the length with no default and runs on along the last segment", () => {
    const cad = createHarness()
    cad.command("PLINE")
    answerLine(cad, "0,0", "100,0", "L")
    expect(cad.state().commandLine.prompt).toBe("PLINE Specify length of line:")
    answerLine(cad, "FOO", "", "50")
    expect(cad.commandLog().slice(-6)).toEqual([
      "Specify next point or [Arc/Close/Halfwidth/Length/Undo/Width]: L",
      "Specify length of line: FOO",
      "Requires numeric distance or second point.",
      "Specify length of line:",
      "Requires numeric distance or second point.",
      "Specify length of line: 50",
    ])
    expect(cad.state().commandLine.prompt).toBe(
      "PLINE Specify next point or [Arc/Close/Halfwidth/Length/Undo/Width]:"
    )
    answerLine(cad, "")
    expect(drawn(cad).at).toEqual(["0,0", "100,0", "150,0"])
  })

  it("runs tangent to an arc, and first along the last thing drawn, else east", () => {
    const arc = createHarness()
    arc.command("PLINE")
    answerLine(arc, "0,0", "100,0", "A", "200,100", "L", "L", "50", "")
    expect(drawn(arc).at).toEqual(["0,0", "100,0", "200,100", "200,150"])

    const blank = createHarness()
    blank.command("PLINE")
    answerLine(blank, "0,0", "L", "50", "")
    expect(drawn(blank).at).toEqual(["0,0", "50,0"])

    const after = createHarness({ entities: [lineOf(p(0, 0), p(0, 10))] })
    after.command("PLINE")
    answerLine(after, "100,100", "L", "50", "")
    expect(drawn(after).at).toEqual(["100,100", "100,150"])
  })

  it("runs first the way a clockwise arc was drawn, ending", () => {
    // probe pline/p34
    const cad = answerLine(createHarness(), ...CLOCKWISE_ARC)
    answerLine(cad, "PLINE", "20,0", "L", "10", "")

    expect(drawn(cad).at).toEqual(["20,0", "20,-10"])
  })

  it("runs first along the UCS's X with nothing drawn", () => {
    // probe pline/p161: UCS Z 30.
    const cad = answerLine(createHarness(), "UCS", "Z", "30")
    answerLine(cad, "PLINE", "0,0", "L", "10", "")

    expect(drawn(cad).at).toEqual(["0,0", "8.6603,5"])
  })

  it("measures a point from the last vertex, runs back when negative, and adds 0", () => {
    const typed = createHarness()
    typed.command("PLINE")
    answerLine(typed, "0,0", "100,0", "L", "130,40", "")
    expect(drawn(typed).at).toEqual(["0,0", "100,0", "150,0"])

    const picked = createHarness()
    picked.command("PLINE").click(p(0, 0)).click(p(100, 0)).option("Length")
    picked.click(p(130, 40)).enter()
    expect(drawn(picked).at).toEqual(["0,0", "100,0", "150,0"])

    const back = createHarness()
    back.command("PLINE")
    answerLine(back, "0,0", "100,0", "L", "-50", "L", "0", "")
    expect(drawn(back).at).toEqual(["0,0", "100,0", "50,0", "50,0"])
  })

  it("asks in Spanish", () => {
    const cad = createHarness({ locale: es })
    cad.command("POL")
    answerLine(cad, "0,0", "100,0")
    expect(cad.state().commandLine.prompt).toBe(
      "POL Precise punto siguiente o [Arco/Cerrar/Mitad grosor/Longitud/desHacer/Grosor]:"
    )
    answerLine(cad, "L", "FOO", "50", "")
    expect(cad.commandLog().slice(-4, -1)).toEqual([
      "Precise longitud de línea: FOO",
      "Requiere una distancia numérica o un segundo punto.",
      "Precise longitud de línea: 50",
    ])
    expect(drawn(cad).at).toEqual(["0,0", "100,0", "150,0"])
  })
})
