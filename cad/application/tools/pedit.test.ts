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
import {
  arcOf,
  circleOf,
  layerOf,
  lineOf,
  p,
  polylineOf,
} from "../../../test/builders"
import { es } from "../../locales/es"
import { THEME } from "../../scene/theme"
import { ptBR } from "../../locales/pt-BR"

// PEDIT, as AutoCAD 2027's console asks it and leaves the polyline (probes
// pedit/p01–p253, traced, MPDUMP, en, es and pt-BR).

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
const answer = (cad: Harness, ...texts: string[]) => {
  for (const text of texts) typeAnswer(cad, text)
  return cad
}
const since = (cad: Harness, from: number) => cad.commandLog().slice(from)
const rising = () =>
  createPolyline3d(
    [
      { x: 0, y: 0, z: 0 },
      { x: 10, y: 0, z: 5 },
      { x: 20, y: 0, z: 0 },
      { x: 30, y: 0, z: 5 },
      { x: 40, y: 0, z: 0 },
    ],
    false,
    undefined,
    "Q"
  )
const MAIN_3D =
  "Enter an option [Close/Join/Edit vertex/Spline curve/Decurve/Reverse/Undo]:"

const MAIN =
  "Enter an option [Close/Join/Width/Edit vertex/Fit/Spline/Decurve/Ltype gen/Reverse/Undo]:"
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
      "Enter an option [Open/Join/Width/Edit vertex/Fit/Spline/Decurve/Ltype gen/Reverse/Undo]:"
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
      "Enter an option [Close/Join/Edit vertex/Spline curve/Decurve/Reverse/Undo]:"
    )
    cad.option("Close")
    expect(cad.byId<Polyline3dEntity>("Q").closed).toBe(true)
    expect(asked(cad)).toBe(
      "Enter an option [Open/Join/Edit vertex/Spline curve/Decurve/Reverse/Undo]:"
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
      "Indique una opción [Cerrar/Juntar/Grosor/Editar vértices/curVar/Spline/anularcuRVatura/generarTlínea/Invertir/desHacer]:"
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

  it("takes Brazilian AutoCAD's words at the 3D, fuzz and join type prompts (p09, p12, p39, p205, pt-BR)", () => {
    const three = createHarness({
      entities: [
        createPolyline3d(
          [
            { x: 0, y: 0, z: 0 },
            { x: 10, y: 0, z: 5 },
            { x: 20, y: 5, z: 0 },
          ],
          false,
          undefined,
          "Q"
        ),
      ],
      locale: ptBR,
    })
    three.command("EDITARP").click(p(5, 0))
    expect(asked(three)).toBe(
      "Insira uma opção [Fechar/Unir/Editar vértice/curva Spline/desfCurva/Reverter/Desfazer]:"
    )
    const cad = createHarness({
      entities: [
        polylineOf([p(0, 0), p(10, 0)], { id: "A" }),
        polylineOf([p(12, 0), p(20, 0)], { id: "B" }),
      ],
      locale: ptBR,
    })
    cad.command("EDITARP").option("Multiple")
    typeAnswer(cad, "_ALL")
    cad.enter()
    cad.option("Join")
    expect(asked(cad)).toBe(
      "Inserir distância aproximada ou [Tipounião] <0.00>:"
    )
    cad.option("Jointype").option("Both")
    cad.option("Jointype")
    expect(asked(cad)).toBe(
      "Inserir tipo de união [Estender/Adicionar/aMbos] <aMbos>:"
    )
    cad.option("Add").option("Jointype")
    expect(asked(cad)).toBe(
      "Inserir tipo de união [Estender/Adicionar/aMbos] <Adicionar>:"
    )
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
  it("gives every segment one width, a number or two points measured (p20, p75, p305)", () => {
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
    cad.option("Width")
    answer(cad, "10,10", "13,14")
    expect(poly(cad).widths?.[0]).toEqual([5, 5])
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

  it("reads `@` at Move and Insert from the X, not LASTPOINT (p227, p251)", () => {
    // p227: LASTPOINT at 100,100 (ID), then the pick 5,0; the trace's
    // BasePoint is the X, [10,0,0].
    const cad = createHarness({ entities: [p5()] })
    typeAnswer(typeAnswer(cad, "_ID"), "100,100")
    cad.command("PEDIT").click(p(5, 0)).option("Edit vertex").option("Next")
    cad.option("Move")
    typeAnswer(cad, "@5,5")
    expect(poly(cad).vertices[1]).toEqual(p(15, 5))
    const insert = createHarness({ entities: [p5()] })
    typeAnswer(typeAnswer(insert, "_ID"), "100,100")
    insert.command("PEDIT").click(p(5, 0)).option("Edit vertex")
    insert.option("Next").option("Next").option("Insert")
    typeAnswer(insert, "@0,5")
    expect(poly(insert).vertices[3]).toEqual(p(20, 5))
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
      "Enter an option [Close/Open/Join/Width/Fit/Spline/Decurve/Ltype gen/Reverse/Undo]:"
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

  it("asks for a polyline again, in silence, at an empty set (p201)", () => {
    const cad = createHarness({ entities: [pl()] })
    cad.command("PEDIT").option("Multiple")
    cad.enter()
    expect(cad.commandLog().slice(-2)).toEqual([
      "Select polyline or [Multiple]: M",
      "Select objects:",
    ])
    expect(asked(cad)).toBe("Select polyline or [Multiple]:")
  })

  it("keeps Jointype and the fuzz for the next run (p204)", () => {
    const pair = () =>
      two(
        [
          [0, 0],
          [10, 0],
        ],
        [
          [12, 0],
          [20, 0],
        ]
      )
    const cad = join(multiple(...pair()), "Add", "5")
    expect(cad.commandLog().at(-1)).toBe("2 segments added to polyline")
    cad.enter()
    cad.command("PEDIT").option("Multiple")
    typeAnswer(cad, "ALL")
    cad.enter()
    cad.option("Join")
    expect(cad.commandLog().at(-1)).toBe("Join Type = Add segment")
    expect(asked(cad)).toBe("Enter fuzz distance or [Jointype] <5.00>:")
    cad.option("Jointype")
    expect(asked(cad)).toBe("Enter join type [Extend/Add/Both] <Add>:")
    cad.enter()
    expect(asked(cad)).toBe("Enter fuzz distance or [Jointype] <5.00>:")
  })

  describe("the fuzz distance given by two points (p339, p340)", () => {
    /** p340's two polylines 4 apart, LASTPOINT moved off them. */
    const drawn = (locale?: typeof es) =>
      answer(
        createHarness(locale ? { locale } : {}),
        ...["_PLINE", "0,0", "10,0", "", "_PLINE", "14,0", "20,0", ""],
        ...["_ID", "30,30"]
      )
    const toFuzz = (cad: Harness) =>
      answer(cad, "_PEDIT", "_M", "_ALL", "", "_J", "_J", "_A")

    it("measures two typed points, LASTPOINT kept, and keeps 5 (p340)", () => {
      const cad = answer(toFuzz(drawn()), "10,10")
      expect(asked(cad)).toBe("Specify second point:")
      answer(cad, "13,14")
      expect(cad.commandLog().at(-1)).toBe("2 segments added to polyline")
      answer(cad, "", "_ID", "@")
      expect(cad.commandLog().at(-1)).toBe(
        " X = 30.00     Y = 30.00     Z = 0.00"
      )
      answer(cad, "_PEDIT", "_M", "_ALL", "", "_J")
      expect(asked(cad)).toBe("Enter fuzz distance or [Jointype] <5.00>:")
    })

    it("measures two clicks, and asks in Spanish (p340)", () => {
      const cad = toFuzz(drawn())
      cad.click(p(10, 10))
      expect(asked(cad)).toBe("Specify second point:")
      cad.click(p(13, 14))
      expect(cad.commandLog().at(-1)).toBe("2 segments added to polyline")
      expect(asked(answer(toFuzz(drawn(es)), "10,10"))).toBe(
        "Designe segundo punto:"
      )
    })

    it("adds nothing between collinear ends under Extend (p339)", () => {
      const cad = answer(drawn(), "_PEDIT", "_M", "_ALL", "", "_J", "5")
      expect(cad.commandLog().at(-1)).toBe("0 segments added to polyline")
    })
  })

  it("grows an arc end on its circle to a straight end's line (p207)", () => {
    const cad = multiple(
      polylineOf([p(0, 0), p(10, 0), p(15, 5)], {
        id: "A",
        bulges: [0, Math.tan(Math.PI / 8)],
      }),
      polylineOf([p(12, 9), p(2, 9)], { id: "B" })
    )
    join(cad, "Extend", "6")
    expect(cad.commandLog().at(-1)).toBe("2 segments added to polyline")
    expect(cad.entities()).toHaveLength(1)
    const made = cad.entities()[0] as PolylineEntity
    expect(xy(made)).toEqual([
      [0, 0],
      [10, 0],
      [13, 9],
      [2, 9],
    ])
    expect(made.bulges?.[0] ?? 0).toBe(0)
    expect(made.bulges?.[1]).toBeCloseTo(0.7207592200561265, 12)
    expect(made.bulges?.[2] ?? 0).toBe(0)
  })

  it("joins onto the first picked, at a fuzz never given 0 (p202, p203, p206)", () => {
    const touching = () =>
      two(
        [
          [0, 0],
          [10, 0],
        ],
        [
          [10, 0],
          [20, 0],
        ]
      )
    for (const [first, second, kept] of [
      [p(5, 0), p(15, 0), "A"],
      [p(15, 0), p(5, 0), "B"],
    ] as const) {
      const cad = createHarness({ entities: touching() })
      cad.command("PEDIT").option("Multiple").click(first).click(second)
      cad.enter()
      cad.option("Join")
      expect(asked(cad)).toBe("Enter fuzz distance or [Jointype] <0.00>:")
      cad.enter()
      expect(cad.commandLog().at(-1)).toBe("1 segments added to polyline")
      expect(cad.entities().map((e) => e.id)).toEqual([kept])
      expect(xy(poly(cad, kept))).toEqual([
        [0, 0],
        [10, 0],
        [20, 0],
      ])
    }
    const all = multiple(...touching())
    all.option("Join")
    all.enter()
    expect(all.entities().map((e) => e.id)).toEqual(["B"])
  })

  it("keeps Both, Spanish AutoCAD's default <Ambos> (p205, es)", () => {
    const cad = createHarness({
      entities: two(
        [
          [0, 0],
          [10, 0],
        ],
        [
          [12, 0],
          [20, 0],
        ]
      ),
      locale: es,
    })
    answer(cad, "EDITPOL", "_M", "_ALL", "", "_J", "_J", "_B", "0", "")
    answer(cad, "EDITPOL", "_M", "_ALL", "", "_J")
    expect(cad.commandLog().at(-1)).toBe(
      "Tipo de junta = Ambos (Alargar o Añadir)"
    )
    answer(cad, "_J")
    expect(asked(cad)).toBe(
      "Indique el tipo de junta [Alargar/aÑadir/aMbos] <Ambos>:"
    )
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

  it("reads `@` at Move from the X with its Z (p227's rule)", () => {
    const cad = createHarness({ entities: [poly3d()] })
    cad.command("PEDIT").click(p(5, 0)).option("Edit vertex").option("Next")
    cad.option("Move")
    typeAnswer(cad, "@1,2,3")
    expect(cad.byId<Polyline3dEntity>("Q").vertices[1]).toEqual({
      x: 11,
      y: 2,
      z: 8,
    })
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
      "Indique una opción [Cerrar/Unir/Editar vértices/curva Spline/anularcuRVatura/Invertir/desHacer]:"
    )
    typeAnswer(cad, "I")
    expect(cad.byId<Polyline3dEntity>("Q").vertices[0]).toEqual({
      x: 20,
      y: 10,
      z: 3,
    })
  })
})

describe("PEDIT's start, refusals and Enter", () => {
  it("repeats at Enter, refuses 'PEDIT, echoes the rail's macro (p219, p220)", () => {
    const cad = edit(pl())
    cad.enter()
    const from = cad.commandLog().length
    cad.enter()
    expect(since(cad, from)).toEqual(["PEDIT"])
    expect(asked(cad)).toBe("Select polyline or [Multiple]:")

    const line = createHarness()
    answer(line, "_LINE", "0,0")
    const at = line.commandLog().length
    answer(line, "'_PEDIT")
    expect(since(line, at)).toEqual([
      "Specify next point or [Undo]: 'PEDIT",
      "** That command may not be invoked transparently **",
      "Point or option keyword required.",
    ])

    const rail = createHarness({ entities: [pl()] })
    const start = rail.commandLog().length
    rail.tool("pedit")
    expect(since(rail, start)).toEqual(["_pedit"])
  })

  it("opens a 3D polyline double-clicked on its own prompt (DoubleClickRoot.cui)", () => {
    const cad = createHarness({ entities: [rising()] })
    cad.doubleClick(p(5, 0))
    expect(asked(cad)).toBe(MAIN_3D)
  })

  it("goes back to the main prompt at Width's Enter, nothing changed (p200)", () => {
    const cad = edit(pl())
    cad.option("Width")
    cad.enter()
    expect(asked(cad)).toBe(MAIN)
    expect(poly(cad).widths).toBeUndefined()
    typeAnswer(cad, "2")
    expect(cad.commandLog().at(-1)).toBe("Invalid option keyword.")
  })

  it("refuses numbers, other prompts' keywords and a command at its prompts (p221–p223)", () => {
    const main = edit(pl())
    for (const text of ["0", "-1", "_N", "_G", "_LINE", "_T"]) {
      answer(main, text)
      expect(main.commandLog().at(-1)).toBe("Invalid option keyword.")
      expect(asked(main)).toBe(MAIN)
    }
    const vertex = edit(p5())
    vertex.option("Edit vertex")
    for (const text of ["FOO", "0", "_C", "_U", "_J", "_F"]) {
      answer(vertex, text)
      expect(vertex.commandLog().at(-1)).toBe("Invalid option keyword.")
      expect(asked(vertex)).toBe(`${VERTEX} <N>:`)
    }
    const three = createHarness({ entities: [rising()] })
    three.command("PEDIT").click(p(5, 0))
    for (const text of ["FOO", "_F", "_W", "_L"]) {
      answer(three, text)
      expect(three.commandLog().at(-1)).toBe("Invalid option keyword.")
      expect(asked(three)).toBe(MAIN_3D)
    }
  })

  it("refuses a word at Ltype gen, whose Enter keeps it as it stands (p224)", () => {
    const cad = edit(pl())
    answer(cad, "_L", "FOO")
    expect(cad.commandLog().at(-1)).toBe("Invalid option keyword.")
    answer(cad, "_ON", "_L")
    expect(asked(cad)).toBe(
      "Enter polyline linetype generation option [ON/OFF] <On>:"
    )
    cad.enter()
    expect(asked(cad)).toBe(MAIN)
    expect(poly(cad).linetypeGeneration).toBe(true)
  })

  it("takes the widths away at Width 0 (p225)", () => {
    const cad = edit(pl())
    answer(cad, "_W", "2", "_W", "0")
    for (const [start, end] of poly(cad).widths ?? []) {
      expect([start, end]).toEqual([0, 0])
    }
  })

  it("goes back to the vertex prompt at Tangent's Enter, no tangent given (p226)", () => {
    const cad = edit(p5())
    cad.option("Edit vertex").option("Tangent")
    cad.enter()
    expect(asked(cad)).toBe(`${VERTEX} <N>:`)
    cad.option("eXit").option("Fit")
    expect(poly(cad).fit?.tangents).toBeUndefined()
  })
})

describe("PEDIT's points", () => {
  it("refuses a Z, a keyword and a command at Move as no 2D point (p228, p238)", () => {
    const cad = edit(p5())
    cad.option("Edit vertex").option("Next").option("Move")
    for (const text of ["15,5,7", "_N", "_LINE"]) {
      answer(cad, text)
      expect(cad.commandLog().at(-1)).toBe("Invalid 2D point.")
      expect(asked(cad)).toBe("Specify new location for marked vertex:")
    }
  })

  it("refuses `*` at Move in a turned UCS, a point read in it (p229)", () => {
    const cad = createHarness({ entities: [p5()] })
    answer(cad, "_UCS", "_Z", "30", "_PEDIT", "*5,0", "_E", "_N", "_M", "*15,5")
    expect(cad.commandLog().at(-1)).toBe("Invalid 2D point.")
    answer(cad, "15,5")
    expect(poly(cad).vertices[1].x).toBeCloseTo(10.49038105676658, 9)
    expect(poly(cad).vertices[1].y).toBeCloseTo(11.830127018922195, 9)
  })

  it("snaps Move to an END, leaves a typed Insert to ORTHOMODE (p230)", () => {
    const cad = createHarness({
      entities: [p5(), lineOf(p(50, 10), p(60, 20))],
    })
    answer(cad, "_ORTHOMODE", "1", "_PEDIT", "5,0", "_E", "_N", "_M")
    answer(cad, "_END", "59.9,19.9", "_N", "_I", "33,7")
    expect(xy(poly(cad))).toEqual([
      [0, 0],
      [60, 20],
      [20, 0],
      [33, 7],
      [30, 0],
      [40, 0],
    ])
  })
})

describe("PEDIT's transparent commands and undo", () => {
  it("runs them at its prompts and resumes, refusing 'LINE (p231–p234)", () => {
    const cad = edit(p5())
    let from = cad.commandLog().length
    answer(cad, "'_ORTHOMODE", "1")
    expect(since(cad, from)).toEqual([
      `${MAIN} 'ORTHOMODE`,
      ">>Enter new value for ORTHOMODE <0>: 1",
      "Resuming PEDIT command.",
    ])
    from = cad.commandLog().length
    answer(cad, "'_LINE")
    expect(since(cad, from)).toEqual([
      `${MAIN} 'LINE`,
      "** That command may not be invoked transparently **",
      "Invalid option keyword.",
    ])
    answer(cad, "_E", "'_ORTHOMODE", "0", "_N", "_M", "'_ORTHOMODE", "1")
    expect(cad.commandLog().at(-1)).toBe("Resuming PEDIT command.")
    expect(asked(cad)).toBe("Specify new location for marked vertex:")
    answer(cad, "15,5", "_I", "'_-OSNAP", "_END")
    expect(asked(cad)).toBe("Specify location for new vertex:")
    answer(cad, "25,5", "_W", "'_ORTHOMODE", "0")
    expect(asked(cad)).toBe("Specify starting width for next segment <0.00>:")
    answer(cad, "3", "", "_X", "_W", "'_ORTHOMODE", "1", "2", "_L")
    answer(cad, "'_ORTHOMODE", "0", "_ON")
    expect(xy(poly(cad)).slice(0, 3)).toEqual([
      [0, 0],
      [15, 5],
      [25, 5],
    ])
    expect(poly(cad).widths?.[0]).toEqual([2, 2])
    expect(poly(cad).linetypeGeneration).toBe(true)
  })

  it("takes back a transparent change with its step at Undo (p235)", () => {
    const cad = createHarness({ entities: [pl()] })
    answer(cad, "_ORTHOMODE", "0", "_PEDIT", "5,0", "_W", "2")
    answer(cad, "'_ORTHOMODE", "1", "_U")
    expect(cad.commandLog().at(-1)).toBe("Command has been completely undone.")
    expect(cad.state().orthoActive).toBe(false)
    expect(poly(cad).widths).toBeUndefined()
  })

  it("is a step of UNDO and MREDO named PEDIT (p236)", () => {
    const cad = edit(pl())
    answer(cad, "_W", "2", "", "_PEDIT", "5,0", "_C", "")
    const from = cad.commandLog().length
    answer(cad, "_UNDO", "2", "_MREDO", "1", "_MREDO", "1")
    const log = since(cad, from)
    expect(log).toContain("PEDIT PEDIT")
    expect(log.at(-1)).toBe("Everything has been redone")
    expect(poly(cad).closed).toBe(true)
  })

  it("is a step for U and REDO even when it changed nothing (p237, en and es)", () => {
    const cad = edit(pl())
    cad.enter()
    const from = cad.commandLog().length
    answer(cad, "_U", "_REDO")
    expect(since(cad, from)).toEqual([
      "U",
      "PEDIT",
      "REDO",
      "PEDIT",
      "Everything has been redone",
    ])
    const spanish = createHarness({ entities: [pl()], locale: es })
    answer(spanish, "_PEDIT", "5,0", "")
    const at = spanish.commandLog().length
    answer(spanish, "_U", "_REDO")
    expect(since(spanish, at)).toEqual([
      "H",
      "EDITPOL",
      "REHACER",
      "EDITPOL",
      "Todo repetido",
    ])
  })
})

describe("what PEDIT makes and leaves", () => {
  it("goes back to the vertex prompt at eXit in Break's walk (p239)", () => {
    const cad = edit(p5())
    cad.option("Edit vertex").option("Break").option("Next").option("eXit")
    expect(asked(cad)).toBe(`${VERTEX} <N>:`)
    expect(cad.entities()).toHaveLength(1)
  })

  it("turns a line and an arc into polylines in their properties (p240)", () => {
    const cad = createHarness()
    cad.runtime.createLayer("L1")
    answer(cad, "_CECOLOR", "1", "_CELTYPE", "DASHED", "_CELWEIGHT", "30")
    answer(cad, "_THICKNESS", "2", "_LINE", "0,0", "10,0", "")
    answer(cad, "_ARC", "20,0", "25,5", "30,0", "_CLAYER", "0")
    answer(cad, "_CECOLOR", "BYLAYER", "_CELTYPE", "BYLAYER")
    answer(cad, "_CELWEIGHT", "-1", "_THICKNESS", "0")
    answer(cad, "_PEDIT", "5,0", "_Y", "_X", "_PEDIT", "25,5", "_Y", "_X")
    const made = cad.entities() as PolylineEntity[]
    expect(made.map((e) => e.type)).toEqual(["polyline", "polyline"])
    for (const e of made) {
      expect(e.layerId).not.toBe("0")
      expect(e.color).toBe(RED)
      expect(e.linetype).toBe("Dashed")
      expect(e.lineweight).toBe(0.3)
      expect(e.thickness).toBe(2)
    }
  })

  it("keeps a converted line in its plane at its elevation, read in a turned UCS (p241)", () => {
    const cad = createHarness()
    answer(cad, "_UCS", "_Z", "30", "_ELEVATION", "3", "_LINE", "0,0", "10,0")
    answer(cad, "", "_ELEVATION", "0", "_PEDIT", "5,0", "_Y", "_X")
    const made = cad.entities()[0] as PolylineEntity
    expect(made.elevation).toBe(3)
    expect(made.vertices[1].x).toBeCloseTo(8.660254037844387, 9)
    expect(made.vertices[1].y).toBeCloseTo(5, 9)
  })

  it("gives Break's new piece the polyline's properties (p243)", () => {
    const cad = createHarness({
      entities: [
        {
          ...p5(),
          color: RED,
          linetype: "Dashed",
          lineweight: 0.3,
          thickness: 2,
        },
      ],
    })
    answer(cad, "_PEDIT", "5,0", "_E", "_N", "_B", "_N", "_G", "_X", "_X")
    const [kept, piece] = cad.entities() as PolylineEntity[]
    expect(kept.id).toBe("P")
    expect(piece.id).not.toBe("P")
    for (const e of [kept, piece]) {
      expect(e.color).toBe(RED)
      expect(e.linetype).toBe("Dashed")
      expect(e.lineweight).toBe(0.3)
      expect(e.thickness).toBe(2)
    }
  })

  it("edits the one selected before it and leaves nothing selected (p244)", () => {
    const cad = createHarness({ entities: [pl()] })
    cad.select("P")
    answer(cad, "_PEDIT", "_W", "2", "_X")
    expect(poly(cad).widths?.[0]).toEqual([2, 2])
    expect(cad.selectedIds()).toEqual([])
  })
})

describe("PEDIT's Edit vertex and Undo on a 3D polyline", () => {
  it("breaks it in two, a new piece after (p245)", () => {
    const cad = createHarness({ entities: [rising()] })
    answer(cad, "_PEDIT", "5,0", "_E", "_N", "_B", "_N", "_G", "_X", "_X")
    const [kept, piece] = cad.entities() as Polyline3dEntity[]
    expect(kept.id).toBe("Q")
    expect(kept.vertices).toEqual([
      { x: 0, y: 0, z: 0 },
      { x: 10, y: 0, z: 5 },
    ])
    expect(piece.vertices).toEqual([
      { x: 20, y: 0, z: 0 },
      { x: 30, y: 0, z: 5 },
      { x: 40, y: 0, z: 0 },
    ])
  })

  it("straightens between two vertices, then closes (p246)", () => {
    const cad = createHarness({ entities: [rising()] })
    answer(cad, "_PEDIT", "5,0", "_E", "_N", "_S", "_N", "_N", "_G", "_X")
    answer(cad, "_C", "_X")
    const q = cad.byId<Polyline3dEntity>("Q")
    expect(q.vertices).toEqual([
      { x: 0, y: 0, z: 0 },
      { x: 10, y: 0, z: 5 },
      { x: 30, y: 0, z: 5 },
      { x: 40, y: 0, z: 0 },
    ])
    expect(q.closed).toBe(true)
  })

  it("undoes Close, then Spline curve, then says so (p247)", () => {
    const cad = createHarness({ entities: [rising()] })
    answer(cad, "_PEDIT", "5,0", "_S", "_C", "_U")
    expect(cad.byId<Polyline3dEntity>("Q").closed).toBe(false)
    answer(cad, "_U")
    expect(cad.commandLog().at(-1)).toBe("Command has been completely undone.")
    expect(cad.byId<Polyline3dEntity>("Q").fit).toBeUndefined()
    answer(cad, "_U")
    expect(cad.commandLog().at(-1)).toBe("Command has been completely undone.")
  })
})

// AutoCAD 2027's console, en-US and es-ES (probes pedit/p250, p300–p308,
// p332, p333): LASTPOINT after `Select polyline` and each point PEDIT takes,
// as `ID @` says it once PEDIT ends.
describe("PEDIT's LASTPOINT and its pick", () => {
  /** p300's polyline, LASTPOINT moved off it first. */
  const drawn = () =>
    answer(
      createHarness(),
      ...["_PLINE", "0,0", "100,0", "100,50", "", "_ID", "99,99"]
    )
  const lastPoint = (cad: Harness) =>
    answer(cad, "_ID", "@").commandLog().at(-1)
  const at = (x: number, y: number) =>
    ` X = ${x.toFixed(2)}     Y = ${y.toFixed(2)}     Z = 0.00`

  it("is the point a pick typed or clicked, on the plane off the plan too (p300, LPT-04)", () => {
    expect(lastPoint(answer(drawn(), "_PEDIT", "50,0", ""))).toBe(at(50, 0))
    const clicked = drawn()
    clicked.command("PEDIT").click(p(50, 0))
    expect(lastPoint(answer(clicked, ""))).toBe(at(50, 0))
    // Seen from 1,-1,1, the pixel of 50,0,20 is that of 30,20,0 on the
    // work plane, where a click that picks leaves LASTPOINT (solid-inquiry/d10).
    const off = answer(
      createHarness(),
      ...["ELEVATION", "20", "_PLINE", "0,0", "100,0", "", "ELEVATION", "0"],
      ...["VPOINT", "1,-1,1", "_ID", "7,7,7", "_PEDIT"]
    )
    off.click({ x: 50, y: 0, z: 20 })
    expect(asked(off)).toBe(MAIN)
    expect(lastPoint(answer(off, ""))).toBe(at(30, 20))
  })

  it("is the point an object snap override found at the pick (p306)", () => {
    const cad = answer(drawn(), "_PEDIT", "_END", "98,1")
    expect(asked(cad)).toBe(MAIN)
    expect(lastPoint(answer(cad, ""))).toBe(at(100, 0))
  })

  it("says a locked polyline and asks again (p307)", () => {
    for (const [locale, lines] of [
      [
        undefined,
        [
          "Select polyline or [Multiple]: 50,0",
          "The object is on a locked layer.",
          "Select polyline or [Multiple]: 50,50",
        ],
      ],
      [
        es,
        [
          "Designe polilínea o [Múltiple]: 50,0",
          "El objeto está en una capa bloqueada.",
          "Designe polilínea o [Múltiple]: 50,50",
        ],
      ],
    ] as const) {
      const cad = createHarness({ locale })
      cad.runtime.document.load(
        [
          polylineOf([p(0, 0), p(100, 0)], { id: "K", layerId: "L1" }),
          polylineOf([p(0, 50), p(100, 50)], { id: "P" }),
        ],
        { layers: [layerOf("0"), layerOf("L1", { locked: true })] }
      )
      answer(cad, "_PEDIT", "50,0", "50,50")
      expect(cad.commandLog().slice(-3)).toEqual(lines)
      answer(cad, "_C", "")
      expect(poly(cad).closed).toBe(true)
      expect(poly(cad, "K").closed).toBe(false)
      expect(lastPoint(cad)).toMatch(/50[.,]00 .* 50[.,]00 /)
    }
    const clicked = createHarness()
    clicked.runtime.document.load(
      [polylineOf([p(0, 0), p(100, 0)], { id: "K", layerId: "L1" })],
      { layers: [layerOf("0"), layerOf("L1", { locked: true })] }
    )
    clicked.command("PEDIT").click(p(50, 0))
    expect(clicked.commandLog().at(-1)).toBe("The object is on a locked layer.")
    expect(asked(clicked)).toBe("Select polyline or [Multiple]:")
  })

  it("takes the newest of two under the pick (p308)", () => {
    const cad = answer(
      createHarness(),
      ...["_PLINE", "0,0", "100,0", "100,50", ""],
      ...["_PLINE", "0,0", "100,0", "100,-50", ""],
      ...["_PEDIT", "50,0", "_C", ""]
    )
    const closed = cad.entities().map((e) => (e as PolylineEntity).closed)
    expect(closed).toEqual([false, true])
  })

  it("is the point Move and Insert give, `@` from the X (p301, p302)", () => {
    const moved = answer(drawn(), "_PEDIT", "50,0", "_E", "_M", "@30,30")
    expect(lastPoint(answer(moved, "_X", ""))).toBe(at(30, 30))
    const inserted = answer(drawn(), "_PEDIT", "50,0", "_E", "_I", "40,10")
    expect(lastPoint(answer(inserted, "_X", ""))).toBe(at(40, 10))
  })

  it("is kept by Edit vertex entered, stepped and left (p250, p332)", () => {
    const cad = answer(drawn(), "_PEDIT", "50,0", "_E", "_N", "_X", "")
    expect(lastPoint(cad)).toBe(at(50, 0))
  })

  it("measures main Width's two points, LASTPOINT kept (p305)", () => {
    const typed = answer(drawn(), "_PEDIT", "50,0", "_W", "10,10")
    expect(asked(typed)).toBe("Specify second point:")
    answer(typed, "13,14")
    expect(asked(typed)).toBe(MAIN)
    const widths = typed.entities()[0] as PolylineEntity
    expect(widths.widths).toEqual([
      [5, 5],
      [5, 5],
    ])
    expect(lastPoint(answer(typed, ""))).toBe(at(50, 0))
    const clicked = edit(p5())
    clicked.option("Width").click(p(10, 10)).click(p(13, 14))
    expect(poly(clicked).widths?.[0]).toEqual([5, 5])
  })

  it("measures Edit vertex's widths from the X, LASTPOINT on it (p303, p333)", () => {
    const cad = answer(drawn(), "_PEDIT", "50,0", "_E", "_W", "10,10")
    expect(asked(cad)).toBe("Specify ending width for next segment <14.14>:")
    answer(cad, "13,14")
    const widths = (cad.entities()[0] as PolylineEntity).widths?.[0]
    expect(widths?.[0]).toBeCloseTo(Math.hypot(10, 10), 9)
    expect(widths?.[1]).toBeCloseTo(Math.hypot(13, 14), 9)
    expect(lastPoint(answer(cad, "", "_X", ""))).toBe(at(0, 0))
    const numbers = answer(drawn(), "_PEDIT", "50,0", "_E", "_N", "_W", "2")
    expect(lastPoint(answer(numbers, "3", "_X", ""))).toBe(at(100, 0))
    const clicked = edit(p5())
    clicked.option("Edit vertex").option("Width").click(p(10, 10))
    expect(asked(clicked)).toBe(
      "Specify ending width for next segment <14.14>:"
    )
  })

  it("takes Tangent's direction from the X, LASTPOINT on it (p304)", () => {
    const cad = answer(drawn(), "_PEDIT", "50,0", "_E", "_N", "_T", "110,10")
    expect(asked(cad)).toBe(`${VERTEX} <N>:`)
    const twin = answer(drawn(), "_PEDIT", "50,0", "_E", "_N", "_T", "45")
    answer(cad, "_X", "_F")
    answer(twin, "_X", "_F")
    expect(cad.entities()[0]).toEqual({
      ...twin.entities()[0],
      id: cad.entities()[0].id,
    })
    expect(lastPoint(answer(cad, ""))).toBe(at(100, 0))
    const clicked = edit(p5())
    clicked.option("Edit vertex").option("Tangent").click(p(10, 10))
    expect(asked(clicked)).toBe(`${VERTEX} <N>:`)
  })
})

// The desktop's PEDIT (es-ES, desktop pedit/d01, d02).
describe("PEDIT's look", () => {
  const strokeOf = (q: { kind: string }) =>
    "stroke" in q ? (q as { stroke: { color: string } }).stroke : null
  const drawn = () => {
    const cad = createHarness({
      entities: [polylineOf([p(0, 0), p(200, 0), p(200, 150)], { id: "P" })],
    })
    cad.command("PEDIT").click(p(100, 0))
    return cad
  }
  const glows = (cad: Harness) =>
    cad.scene().primitives.filter((q) => strokeOf(q)?.color === THEME.selected)
      .length

  it("glows the polyline at the main prompt, not in Edit vertex (d02-1, d01-2)", () => {
    const cad = drawn()
    expect(glows(cad)).toBe(1)
    answer(cad, "_E")
    expect(glows(cad)).toBe(0)
  })

  it("marks the vertex with an X in the crosshair's colour, 24 px each way (d01-2)", () => {
    const cad = answer(drawn(), "_E")
    const at = cad.runtime.viewport.worldToScreen(p(0, 0))
    const arms = cad
      .scene()
      .primitives.filter(
        (q) =>
          q.kind === "segment" &&
          q.stroke.color === THEME.crosshair &&
          q.a.x !== q.b.x &&
          q.a.y !== q.b.y
      )
    expect(
      arms.map((q) =>
        q.kind === "segment"
          ? [
              q.a.x - at.x,
              q.a.y - at.y,
              q.b.x - at.x,
              q.b.y - at.y,
              q.stroke.width,
            ]
          : []
      )
    ).toEqual([
      [-24, -24, 24, 24, 1],
      [-24, 24, 24, -24, 1],
    ])
  })

  it("draws Move's and Insert's lines from the X amber and dashed (d01-3, d01-5)", () => {
    for (const option of ["_M", "_I"]) {
      const cad = answer(drawn(), "_E", option)
      cad.moveTo(p(60, 90))
      const band = cad
        .scene()
        .primitives.find(
          (q) =>
            q.kind === "segment" && q.stroke.color === THEME.dashedRubberBand
        )
      expect(band?.kind === "segment" && band.stroke.dash).toEqual([2, 3])
    }
  })
})
