import { describe, expect, it } from "vitest"
import type {
  Entity,
  PolylineEntity,
  Polyline3dEntity,
} from "../../domain/entities"
import {
  createLine,
  createPolyline3d,
  createSpline,
  polylineSegments,
} from "../../domain/entities"
import { createHarness } from "../../../test/harness"
import { arcOf, circleOf, lineOf, p, polylineOf } from "../../../test/builders"
import { es } from "../../locales/es"

// PEDIT, as AutoCAD 2027's console asks it and leaves the polyline (probes
// pedit/p01–p146, traced, MPDUMP, en and es).

const ARC = -1.0000000000000004
const RED = "#ff0000"
/** p01's polyline: 0,0 10,0 10,10, an arc to 20,10, a line to 30,0. */
const pl = () =>
  polylineOf([p(0, 0), p(10, 0), p(10, 10), p(20, 10), p(30, 0)], {
    id: "P",
    bulges: [0, 0, ARC, 0],
  })
/** p63's: five vertices along X. */
const p5 = () =>
  polylineOf([p(0, 0), p(10, 0), p(20, 0), p(30, 0), p(40, 0)], { id: "P" })
const square = () =>
  polylineOf([p(0, 0), p(10, 0), p(10, 10), p(0, 10)], {
    id: "P",
    closed: true,
  })

function edit(...entities: Entity[]) {
  const cad = createHarness({ entities })
  cad.command("PEDIT").click(p(5, 0))
  return cad
}
type Harness = ReturnType<typeof createHarness>
const poly = (cad: Harness, id = "P") => cad.byId<PolylineEntity>(id)
const asked = (cad: Harness) =>
  cad.state().commandLine.prompt.replace(/^\S+ /, "")
const typeAnswer = (cad: Harness, text: string) => {
  cad.runtime.setCommandLineText(text)
  cad.runtime.submitCommandLine()
  return cad
}
const xy = (poly: PolylineEntity) => poly.vertices.map((v) => [v.x, v.y])

const MAIN =
  "Enter an option [Close/Join/Width/Edit vertex/Ltype gen/Reverse/Undo]:"
const VERTEX =
  "Enter a vertex editing option [Next/Previous/Break/Insert/Move/Regen/Straighten/Tangent/Width/eXit]"

describe("PEDIT's prompts", () => {
  it("asks AutoCAD's options and ends at Enter (p01)", () => {
    const cad = edit(pl())
    for (const key of "FOO") cad.press(key)
    cad.press("Enter")
    expect(cad.commandLog()).toEqual([
      "PEDIT",
      "Select polyline or [Multiple]:",
      `${MAIN} FOO`,
      "Invalid option keyword.",
    ])
    expect(asked(cad)).toBe(MAIN)
    cad.enter()
    expect(cad.state().activeToolId).toBe("select")
  })

  it("lists Open on a closed one, both answering either way (p02)", () => {
    const cad = edit(square())
    expect(asked(cad)).toBe(
      "Enter an option [Open/Join/Width/Edit vertex/Ltype gen/Reverse/Undo]:"
    )
    cad.option("Open")
    expect(poly(cad).closed).toBe(false)
    expect(asked(cad)).toBe(MAIN)
    cad.option("Close")
    expect(poly(cad).closed).toBe(true)
    expect(polylineSegments(poly(cad))).toHaveLength(4)
  })

  it("asks a 3D polyline its own options (p09, p10)", () => {
    const cad = createHarness({
      entities: [
        createPolyline3d(
          [
            { x: 0, y: 0, z: 0 },
            { x: 10, y: 0, z: 5 },
            { x: 10, y: 10, z: 0 },
          ],
          false,
          undefined,
          "Q"
        ),
      ],
    })
    cad.command("PEDIT").click(p(5, 0))
    expect(asked(cad)).toBe(
      "Enter an option [Close/Join/Edit vertex/Reverse/Undo]:"
    )
    cad.option("Close")
    expect(cad.byId<Polyline3dEntity>("Q").closed).toBe(true)
    expect(asked(cad)).toBe(
      "Enter an option [Open/Join/Edit vertex/Reverse/Undo]:"
    )
    cad.option("Edit vertex")
    expect(asked(cad)).toBe(
      "Enter a vertex editing option [Next/Previous/Break/Insert/Move/Regen/Straighten/eXit] <N>:"
    )
  })

  it("asks again at a miss, a word and Enter (p03, p19)", () => {
    const cad = createHarness({ entities: [pl()] })
    cad.command("PEDIT").click(p(50, 30))
    typeAnswer(cad, "FOO")
    cad.enter()
    expect(cad.commandLog()).toEqual([
      "PEDIT",
      "Select polyline or [Multiple]:",
      "Select polyline or [Multiple]: FOO",
      "*Invalid selection*",
      "Expects a point or Window/Last/Crossing/BOX/ALL/Fence/WPolygon/CPolygon/Multiple]:",
      "Select polyline or [Multiple]:",
    ])
    expect(asked(cad)).toBe("Select polyline or [Multiple]:")
    typeAnswer(cad, "L")
    expect(asked(cad)).toBe(MAIN)
  })

  it("edits the polyline selected before it, a set not (p37, p38)", () => {
    const cad = createHarness({ entities: [pl()] })
    cad.select("P").command("PEDIT")
    expect(asked(cad)).toBe(MAIN)
    const two = createHarness({ entities: [pl(), lineOf(p(0, 20), p(10, 20))] })
    two.runtime.selectAll()
    two.command("PEDIT")
    expect(asked(two)).toBe("Select polyline or [Multiple]:")
  })

  it("opens on a polyline double-clicked, as `^C^C_pedit` (DoubleClickRoot.cui)", () => {
    const cad = createHarness({ entities: [pl()] })
    cad.doubleClick(p(5, 0))
    expect(cad.commandLog()).toEqual(["_pedit"])
    expect(asked(cad)).toBe(MAIN)
  })

  it("takes Spanish AutoCAD's words (p01, p09, p21, es)", () => {
    const cad = createHarness({ entities: [pl()], locale: es })
    cad.command("EDITPOL").click(p(5, 0))
    expect(asked(cad)).toBe(
      "Indique una opción [Cerrar/Juntar/Grosor/Editar vértices/generarTlínea/Invertir/desHacer]:"
    )
    typeAnswer(cad, "E")
    expect(asked(cad)).toBe(
      "Indique una opción de edición de vértices [sigUiente/Precedente/Cortar/Insertar/Desplazar/Regenerar/Alisar/Tangente/Grosor/Salir] <U>:"
    )
    typeAnswer(cad, "P")
    expect(asked(cad)).toMatch(/<P>:$/)
    typeAnswer(cad, "A")
    expect(asked(cad)).toBe(
      "Indique una opción [sigUiente/Precedente/Ejecutar/Salir] <U>:"
    )
    typeAnswer(cad, "E")
    typeAnswer(cad, "S")
    expect(asked(cad)).toMatch(/^Indique una opción \[Cerrar/)
    typeAnswer(cad, "SA")
    expect(cad.state().activeToolId).toBe("select")
  })
})

describe("PEDIT on what is not a polyline", () => {
  it("turns a line into one, a new object in its properties (p04, p05, p11)", () => {
    const cad = createHarness({
      entities: [{ ...lineOf(p(0, 0), p(10, 0), { id: "L" }), color: RED }],
    })
    cad.command("PEDIT").click(p(5, 0))
    for (const key of "FOO") cad.press(key)
    cad.press("Enter")
    expect(cad.commandLog().slice(2)).toEqual([
      "Object selected is not a polyline",
      "Do you want to turn it into one? <Y> FOO",
      "Yes or No, please.",
    ])
    cad.enter()
    expect(cad.entities().some((e) => e.id === "L")).toBe(false)
    const made = cad.only<PolylineEntity>("polyline")
    expect(xy(made)).toEqual([
      [0, 0],
      [10, 0],
    ])
    expect(made.color).toEqual(RED)
    expect(asked(cad)).toBe(MAIN)
    cad.enter().command("U")
    expect(cad.only("line").id).toBe("L")
  })

  it("asks for a polyline again at No (p05)", () => {
    const cad = createHarness({ entities: [lineOf(p(0, 0), p(10, 0))] })
    cad.command("PEDIT").click(p(5, 0)).option("No")
    expect(asked(cad)).toBe("Select polyline or [Multiple]:")
  })

  it("turns an arc into one from its start counter-clockwise (p06)", () => {
    const cad = createHarness({
      entities: [arcOf(p(5, 0), 5, 0, Math.PI)],
    })
    cad.command("PEDIT").click(p(5, 5)).enter()
    const made = cad.only<PolylineEntity>("polyline")
    expect(made.vertices[0]).toBeCloseToPoint(p(10, 0))
    expect(made.vertices[1]).toBeCloseToPoint(p(0, 0))
    expect(made.bulges?.[0]).toBeCloseTo(1, 12)
  })

  it("asks a spline's precision as convert to Polyline does (p07)", () => {
    const cad = createHarness({
      entities: [
        createSpline("fit", [p(0, 0), p(10, 10), p(20, 0), p(30, 10)], {
          id: "S",
        }),
      ],
    })
    cad.command("PEDIT").click(p(0, 0)).option("Yes")
    expect(asked(cad)).toBe("Specify a precision <10>:")
    typeAnswer(cad, "100")
    expect(cad.commandLog().at(-1)).toBe(
      "Requires an integer between 0 and 99."
    )
    cad.enter()
    expect(cad.only<PolylineEntity>("polyline").vertices[0]).toEqual(p(0, 0))
    expect(asked(cad)).toBe(MAIN)
  })

  it("lays a rising line in the upright plane holding it (p97)", () => {
    const line = createLine({ x: 0, y: 0, z: 0 }, { x: 10, y: 0, z: 5 })
    const cad = createHarness({ entities: [line] })
    cad.command("PEDIT").click(p(5, 0)).enter()
    const made = cad.only<PolylineEntity>("polyline")
    expect(made.normal).toEqual({ x: 0, y: 1, z: 0 })
    expect(made.vertices[1]).toBeCloseToPoint(p(-10, 5))
  })

  it("says a circle is no polyline and asks again (p96)", () => {
    const cad = createHarness({ entities: [circleOf(p(0, 0), 5)] })
    cad.command("PEDIT").click(p(5, 0))
    expect(cad.commandLog().at(-1)).toBe("Object selected is not a polyline")
    expect(asked(cad)).toBe("Select polyline or [Multiple]:")
  })
})

describe("PEDIT's options", () => {
  it("gives every segment one width, a point measured two (p20, p75)", () => {
    const cad = edit(pl())
    cad.option("Width")
    expect(asked(cad)).toBe("Specify new width for all segments:")
    typeAnswer(cad, "FOO")
    typeAnswer(cad, "-1")
    expect(cad.commandLog().slice(-3)).toEqual([
      "Requires numeric distance or two points.",
      "Specify new width for all segments: -1",
      "Value must be positive.",
    ])
    typeAnswer(cad, "2")
    expect(poly(cad).widths).toEqual([
      [2, 2],
      [2, 2],
      [2, 2],
      [2, 2],
    ])
    cad.option("Width")
    typeAnswer(cad, "0")
    expect(poly(cad).widths).toBeUndefined()
  })

  it("closes on an arc tangent to the last one (p78, p130, p133)", () => {
    const cad = createHarness({
      entities: [
        polylineOf([p(0, 0), p(10, 0), p(20, 10)], {
          id: "P",
          bulges: [0, 0.41421356237309503],
        }),
      ],
    })
    cad.command("PEDIT").click(p(5, 0)).option("Close")
    expect(poly(cad).bulges?.[2]).toBeCloseTo(1.6180339887498947, 12)
  })

  it("reverses the vertices, each segment turned round (p33, p113)", () => {
    const cad = createHarness({
      entities: [
        polylineOf([p(0, 0), p(10, 0), p(20, 10), p(30, 10)], {
          id: "P",
          bulges: [0, 0.41421356237309503, 0],
          widths: [
            [1, 2],
            [2, 2],
            [3, 4],
          ],
        }),
      ],
    })
    cad.command("PEDIT").click(p(5, 0)).option("Reverse")
    const reversed = poly(cad)
    expect(xy(reversed)).toEqual([
      [30, 10],
      [20, 10],
      [10, 0],
      [0, 0],
    ])
    expect(reversed.bulges?.[1]).toBeCloseTo(-0.41421356237309503, 12)
    expect(reversed.widths).toEqual([
      [4, 3],
      [2, 2],
      [2, 1],
    ])
    expect(cad.commandLog().at(-1)).toBe(`${MAIN} R`)

    const closed = edit(square())
    closed.option("Reverse")
    expect(xy(poly(closed))).toEqual([
      [0, 10],
      [10, 10],
      [10, 0],
      [0, 0],
    ])
  })

  it("turns Ltype gen on and off, its default the polyline's (p32)", () => {
    const cad = edit(pl())
    cad.option("Ltype gen")
    expect(asked(cad)).toBe(
      "Enter polyline linetype generation option [ON/OFF] <Off>:"
    )
    for (const key of "FOO") cad.press(key)
    cad.press("Enter")
    expect(cad.commandLog().at(-1)).toBe("Invalid option keyword.")
    cad.option("ON")
    expect(poly(cad).linetypeGeneration).toBe(true)
    cad.option("Ltype gen")
    expect(asked(cad)).toMatch(/<On>:$/)
    cad.option("OFF")
    expect(poly(cad).linetypeGeneration).toBeUndefined()
  })

  it("keeps Ltype gen on the pieces of a polyline (p32, p66)", () => {
    const cad = edit({ ...p5(), linetypeGeneration: true })
    cad.option("Edit vertex").option("Next").option("Next").option("Break")
    cad.option("Go")
    const pieces = cad.entities() as PolylineEntity[]
    expect(pieces).toHaveLength(2)
    expect(pieces.every((piece) => piece.linetypeGeneration)).toBe(true)
  })

  it("joins as JOIN joins onto a polyline, its widths carried (p17, p76)", () => {
    const cad = createHarness({
      entities: [
        polylineOf([p(0, 0), p(10, 0)], { id: "P" }),
        lineOf(p(10, 0), p(10, 10)),
        arcOf(p(15, 10), 5, 0, Math.PI),
        lineOf(p(25, 10), p(30, 10), { id: "GAP" }),
        lineOf(p(0, 0), p(-5, 5)),
      ],
    })
    cad.command("PEDIT").click(p(5, 0)).option("Join")
    typeAnswer(cad, "ALL")
    cad.enter()
    expect(cad.commandLog().at(-1)).toBe("3 segments added to polyline")
    expect(xy(poly(cad))).toEqual([
      [-5, 5],
      [0, 0],
      [10, 0],
      [10, 10],
      [20, 10],
    ])
    expect(poly(cad).bulges?.[3]).toBeCloseTo(-1, 12)
    expect(cad.byId("GAP")).toBeDefined()
    expect(asked(cad)).toBe(MAIN)
  })

  it("will not join to a closed polyline (p18)", () => {
    const cad = edit(square())
    cad.option("Join")
    expect(cad.commandLog().at(-1)).toBe("Can't join to a closed polyline")
    expect(asked(cad)).toMatch(/^Enter an option \[Open/)
  })

  it("undoes a step at a time, then says so (p34, p46)", () => {
    const cad = edit(pl())
    cad.option("Width")
    typeAnswer(cad, "2")
    cad.option("Close").option("Undo")
    expect(poly(cad).closed).toBe(false)
    expect(poly(cad).widths).toBeDefined()
    cad.option("Undo")
    expect(poly(cad).widths).toBeUndefined()
    expect(cad.commandLog().at(-1)).toBe("Command has been completely undone.")
    cad.option("Undo")
    expect(cad.commandLog().at(-1)).toBe("Command has been completely undone.")
  })

  it("is one step for U, and Escape keeps what it did (p36, p47)", () => {
    const cad = edit(pl())
    cad.option("Width")
    typeAnswer(cad, "2")
    cad.option("Close").escape()
    expect(poly(cad).closed).toBe(true)
    cad.command("U")
    expect(cad.commandLog().at(-1)).toBe("PEDIT")
    expect(poly(cad).closed).toBe(false)
    expect(poly(cad).widths).toBeUndefined()
  })
})

describe("PEDIT's Edit vertex", () => {
  it("steps with Next and Previous, Enter the way it last went (p21, p63–p65)", () => {
    const cad = edit(p5())
    cad.option("Edit vertex")
    expect(asked(cad)).toBe(`${VERTEX} <N>:`)
    for (let i = 0; i < 6; i++) cad.option("Next")
    cad.option("Move")
    expect(asked(cad)).toBe("Specify new location for marked vertex:")
    typeAnswer(cad, "50,50")
    expect(poly(cad).vertices[4]).toEqual(p(50, 50))
    cad.option("Previous")
    expect(asked(cad)).toBe(`${VERTEX} <P>:`)

    const closed = edit(square())
    closed.option("Edit vertex").option("Previous").option("Move")
    typeAnswer(closed, "50,50")
    expect(poly(closed).vertices[0]).toEqual(p(50, 50))
  })

  it("inserts after the X, which moves onto it (p23, p118, p128)", () => {
    const cad = createHarness({
      entities: [
        polylineOf([p(0, 0), p(10, 0), p(20, 0)], {
          id: "P",
          widths: [
            [0, 4],
            [6, 8],
          ],
        }),
      ],
    })
    cad.command("PEDIT").click(p(5, 0)).option("Edit vertex").option("Insert")
    expect(asked(cad)).toBe("Specify location for new vertex:")
    typeAnswer(cad, "5,0")
    expect(poly(cad).widths).toEqual([
      [0, 4],
      [4, 4],
      [6, 8],
    ])
    cad.option("Move")
    typeAnswer(cad, "5,-8")
    expect(poly(cad).vertices[1]).toEqual(p(5, -8))
  })

  it("breaks between two vertices, a new piece after (p66, p67, p70, p71, p101)", () => {
    const at = edit(p5())
    at.option("Edit vertex").option("Next").option("Next").option("Break")
    expect(asked(at)).toBe("Enter an option [Next/Previous/Go/eXit] <N>:")
    at.option("Go").option("Move")
    typeAnswer(at, "50,50")
    expect(xy(poly(at))).toEqual([
      [0, 0],
      [10, 0],
      [50, 50],
    ])
    const piece = at.entities().find((e) => e.id !== "P") as PolylineEntity
    expect(xy(piece)).toEqual([
      [20, 0],
      [30, 0],
      [40, 0],
    ])

    const closed = edit(square())
    closed.option("Edit vertex").option("Next").option("Break").option("Next")
    closed.option("Go")
    expect(xy(poly(closed))).toEqual([
      [0, 0],
      [10, 0],
    ])
    const rest = closed.entities().find((e) => e.id !== "P") as PolylineEntity
    expect(xy(rest)).toEqual([
      [10, 10],
      [0, 10],
      [0, 0],
    ])

    const front = edit(p5())
    front.option("Edit vertex").option("Break").option("Next").option("Next")
    front.option("Go")
    expect(xy(poly(front))).toEqual([
      [20, 0],
      [30, 0],
      [40, 0],
    ])
    expect(front.entities()).toHaveLength(1)
  })

  it("says a break at an end or over all of it is invalid (p68, p69, p100)", () => {
    const cad = edit(p5())
    cad.option("Edit vertex").option("Break").option("Go")
    expect(cad.commandLog().at(-1)).toBe("*Invalid*")
    expect(cad.entities()).toHaveLength(1)
  })

  it("straightens between two vertices, or the arc after one (p26, p27, p72, p73)", () => {
    const cad = edit(pl())
    cad.option("Edit vertex").option("Straighten")
    for (let i = 0; i < 3; i++) cad.option("Next")
    cad.option("Go")
    expect(xy(poly(cad))).toEqual([
      [0, 0],
      [20, 10],
      [30, 0],
    ])

    const arc = edit(pl())
    arc.option("Edit vertex").option("Next").option("Next")
    arc.option("Straighten").option("Go")
    expect(poly(arc).bulges).toBeUndefined()
  })

  it("widens the segment after the X (p22, p79)", () => {
    const cad = edit(p5())
    cad.option("Edit vertex").option("Next").option("Width")
    expect(asked(cad)).toBe("Specify starting width for next segment <0.00>:")
    typeAnswer(cad, "5")
    expect(asked(cad)).toBe("Specify ending width for next segment <5.00>:")
    cad.enter()
    expect(poly(cad).widths?.[1]).toEqual([5, 5])
    expect(asked(cad)).toBe(`${VERTEX} <N>:`)
  })

  it("takes a tangent and keeps none (p28)", () => {
    const cad = edit(pl())
    cad.option("Edit vertex").option("Next").option("Tangent")
    expect(asked(cad)).toBe("Specify direction of vertex tangent:")
    typeAnswer(cad, "FOO")
    expect(cad.commandLog().at(-1)).toBe(
      "Requires valid numeric angle or second point."
    )
    typeAnswer(cad, "45")
    expect(asked(cad)).toBe(`${VERTEX} <N>:`)
  })

  it("is undone whole by PEDIT's Undo (p35, p81)", () => {
    const cad = edit(p5())
    cad.option("Edit vertex").option("Next").option("Next").option("Break")
    cad.option("Go").option("eXit").option("Undo")
    expect(cad.entities()).toHaveLength(1)
    expect(poly(cad).vertices).toHaveLength(5)
    expect(cad.commandLog().at(-1)).toBe("Command has been completely undone.")
  })
})

describe("PEDIT's Multiple", () => {
  const multiple = (...entities: Entity[]) => {
    const cad = createHarness({ entities })
    cad.command("PEDIT").option("Multiple")
    typeAnswer(cad, "ALL")
    cad.enter()
    return cad
  }
  const join = (cad: Harness, type: string | null, fuzz: string) => {
    cad.option("Join")
    if (type) cad.option("Jointype").option(type)
    typeAnswer(cad, fuzz)
    return cad
  }
  const two = (a: [number, number][], b: [number, number][]) => [
    polylineOf(
      a.map(([x, y]) => p(x, y)),
      { id: "A" }
    ),
    polylineOf(
      b.map(([x, y]) => p(x, y)),
      { id: "B" }
    ),
  ]

  it("asks to convert lines and arcs, then its own options (p12, p41)", () => {
    const cad = multiple(lineOf(p(0, 0), p(10, 0)), pl())
    expect(asked(cad)).toBe(
      "Convert Lines, Arcs and Splines to polylines [Yes/No]? <Y>"
    )
    cad.enter()
    expect(asked(cad)).toBe(
      "Enter an option [Close/Open/Join/Width/Ltype gen/Reverse/Undo]:"
    )
    cad.option("Join")
    expect(cad.commandLog().slice(-1)).toEqual(["Join Type = Extend"])
    expect(asked(cad)).toBe("Enter fuzz distance or [Jointype] <0.00>:")
    cad.option("Jointype")
    expect(asked(cad)).toBe("Enter join type [Extend/Add/Both] <Extend>:")
    cad.option("Add")
    expect(cad.commandLog().at(-1)).toBe("Join Type = Add segment")
  })

  it("joins touching ones from the newest (p94)", () => {
    const cad = multiple(
      ...two(
        [
          [0, 0],
          [10, 0],
        ],
        [
          [10, 0],
          [20, 0],
        ]
      )
    )
    join(cad, null, "")
    expect(cad.commandLog().at(-1)).toBe("1 segments added to polyline")
    expect(cad.entities()).toHaveLength(1)
    expect(xy(poly(cad, "B"))).toEqual([
      [0, 0],
      [10, 0],
      [20, 0],
    ])
  })

  it("extends both ends where neither moves past the fuzz (p86, p87, p92, p106, p107)", () => {
    const corner = (fuzz: string) =>
      join(
        multiple(
          ...two(
            [
              [0, 0],
              [10, 0],
            ],
            [
              [11, 2],
              [11, 10],
            ]
          )
        ),
        null,
        fuzz
      )
    expect(corner("1.5").commandLog().at(-1)).toBe(
      "0 segments added to polyline"
    )
    const met = corner("2.1")
    expect(xy(poly(met, "B"))).toEqual([
      [0, 0],
      [11, 0],
      [11, 10],
    ])
    const trimmed = join(
      multiple(
        ...two(
          [
            [0, 0],
            [10, 0],
          ],
          [
            [11, 1],
            [20, 5],
          ]
        )
      ),
      null,
      "3"
    )
    expect(poly(trimmed, "B").vertices[1]).toBeCloseToPoint(p(8.75, 0))
  })

  it("adds a segment where the gap is under fuzz times the far ends' distance (p117, p135, p140, p146)", () => {
    const gap = (b: [number, number][], fuzz: string) =>
      join(
        multiple(
          ...two(
            [
              [0, 0],
              [10, 0],
            ],
            b
          )
        ),
        "Add",
        fuzz
      ).commandLog()
    expect(
      gap(
        [
          [30, 0],
          [40, 0],
        ],
        "0.5"
      ).at(-1)
    ).toBe("0 segments added to polyline")
    expect(
      gap(
        [
          [29.9, 0],
          [39.9, 0],
        ],
        "0.5"
      ).at(-1)
    ).toBe("2 segments added to polyline")
    expect(
      gap(
        [
          [10, 10],
          [0, 10],
        ],
        "0.5"
      ).at(-1)
    ).toBe("0 segments added to polyline")
  })

  it("adds where Both cannot extend (p85, p91)", () => {
    const cad = join(
      multiple(
        ...two(
          [
            [0, 0],
            [10, 0],
          ],
          [
            [11, 1],
            [20, 5],
          ]
        )
      ),
      "Both",
      "2"
    )
    expect(xy(poly(cad, "B"))).toEqual([
      [0, 0],
      [10, 0],
      [11, 1],
      [20, 5],
    ])
  })

  it("closes, widens and reverses them all, Undo one step (p95)", () => {
    const cad = multiple(
      ...two(
        [
          [0, 0],
          [10, 0],
        ],
        [
          [0, 10],
          [10, 10],
        ]
      )
    )
    cad.option("Width")
    typeAnswer(cad, "1")
    cad.option("Close").option("Undo").option("Reverse")
    expect(xy(poly(cad, "A"))).toEqual([
      [10, 0],
      [0, 0],
    ])
    expect(poly(cad, "B").closed).toBe(false)
    expect(poly(cad, "B").widths).toEqual([[1, 1]])
  })
})

describe("PEDIT on a 3D polyline", () => {
  const poly3d = () =>
    createPolyline3d(
      [
        { x: 0, y: 0, z: 0 },
        { x: 10, y: 0, z: 5 },
        { x: 10, y: 10, z: 0 },
        { x: 20, y: 10, z: 3 },
      ],
      false,
      undefined,
      "Q"
    )

  it("moves and inserts vertices with their Z (p30)", () => {
    const cad = createHarness({ entities: [poly3d()] })
    cad.command("PEDIT").click(p(5, 0)).option("Edit vertex").option("Next")
    cad.option("Move")
    typeAnswer(cad, "10,0,9")
    cad.option("Insert")
    typeAnswer(cad, "12,5,4")
    expect(cad.byId<Polyline3dEntity>("Q").vertices).toEqual([
      { x: 0, y: 0, z: 0 },
      { x: 10, y: 0, z: 9 },
      { x: 12, y: 5, z: 4 },
      { x: 10, y: 10, z: 0 },
      { x: 20, y: 10, z: 3 },
    ])
  })

  it("joins nothing to it, as the console (p43, p103, p104)", () => {
    const cad = createHarness({
      entities: [
        poly3d(),
        createLine({ x: 20, y: 10, z: 3 }, { x: 30, y: 10, z: 3 }),
      ],
    })
    cad.command("PEDIT").click(p(5, 0)).option("Join")
    typeAnswer(cad, "ALL")
    cad.enter()
    expect(cad.commandLog().at(-1)).toBe("0 segments added to polyline")
    expect(cad.entities()).toHaveLength(2)
  })

  it("asks Spanish AutoCAD's Unir (p09, es)", () => {
    const cad = createHarness({ entities: [poly3d()], locale: es })
    cad.command("EDITPOL").click(p(5, 0))
    expect(asked(cad)).toBe(
      "Indique una opción [Cerrar/Unir/Editar vértices/Invertir/desHacer]:"
    )
    typeAnswer(cad, "I")
    expect(cad.byId<Polyline3dEntity>("Q").vertices[0]).toEqual({
      x: 20,
      y: 10,
      z: 3,
    })
  })
})
