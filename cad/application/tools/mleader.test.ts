import { readFileSync } from "node:fs"
import { gunzipSync } from "node:zlib"
import { describe, expect, it } from "vitest"
import { createHarness, type CadHarness } from "../../../test/harness"
import { p } from "../../../test/builders"
import "../../../test/matchers"
import type { Entity, MLeaderEntity } from "../../domain/entities"
import {
  createBlockDefinition,
  mleaderGeometry,
  mleaderStretched,
  translateEntity,
} from "../../domain/entities"
import { THEME } from "../../scene/theme"
import { es } from "../../locales/es"
import { parseDxf } from "../../serialization/dxf/readDxf"
import { writeDxf } from "../../serialization/dxf/writeDxf"
import {
  parseDrawingFile,
  serializeDrawing,
} from "../../serialization/drawingFile"
import { documentSnapshot } from "../runtimeFiles"

// AutoCAD 2027's own DXF of five multileaders (probes
// scripts/research/probes/mleader/, m03 and m12): HELLO with three leaders
// (one added on its side, one on the other: two branches), one with no
// content, one with a block, a spline through two vertices and a text of
// two lines.

const FIXTURE = new URL(
  "../../serialization/dxf/fixtures/mleaders-2018.dxf.gz",
  import.meta.url
)
const text = gunzipSync(readFileSync(FIXTURE)).toString("latin1")
const parsed = parseDxf(text).drawing
const all = parsed.entities.filter(
  (e): e is MLeaderEntity => e.type === "mleader"
)
const named = (contents: string | null) =>
  all.find((m) =>
    contents === null
      ? !m.content
      : contents === "block"
        ? m.content?.kind === "block"
        : m.content?.kind === "mtext" && m.content.contents === contents
  )!
const hello = named("HELLO")
const none = named(null)
const block = named("block")
const curvy = named("CURVY")

const r = (v: number) => Math.round(v * 1e4) / 1e4
const xy = (q: { x: number; y: number }) => `${r(q.x)},${r(q.y)}`

/** Each piece as `kind x,y …`, as AutoCAD's EXPLODE dumps it, rounded. */
function pieces(entities: readonly Entity[]): string[] {
  return entities.map((e) => {
    switch (e.type) {
      case "mtext":
        return `MTEXT ${xy(e.position)} ${e.attachment} ${e.contents}`
      case "insert":
        return `INSERT ${xy(e.position)} ${e.scaleX} ${r(e.rotation)}`
      case "line":
        return `LINE ${xy(e.start)} ${xy(e.end)}`
      case "polyline":
        return `LWPOLYLINE ${e.vertices.map(xy).join(" ")}`
      case "solid2d":
        return `SOLID ${e.corners.map(xy).join(" ")}`
      case "spline":
        return `SPLINE ${e.points.map(xy).join(" ")}`
      default:
        return e.type
    }
  })
}

function typed(cad: CadHarness, ...texts: string[]): string[] {
  const from = cad.commandLog().length
  for (const t of texts) {
    cad.runtime.setCommandLineText(t)
    cad.runtime.submitCommandLine()
  }
  return cad.commandLog().slice(from)
}

const withOne = (mleader: MLeaderEntity, locale?: typeof es) =>
  createHarness({
    ...(locale ? { locale } : {}),
    entities: [{ ...mleader, id: "m1" }],
    blocks: parsed.blocks,
  })

const only = (cad: CadHarness) =>
  cad.entities().find((e): e is MLeaderEntity => e.type === "mleader")!

describe("a multileader, as AutoCAD 2027 draws it from its context", () => {
  it("opens the five of AutoCAD's file", () => {
    expect(all).toHaveLength(5)
    expect(hello.branches).toHaveLength(2)
    expect(hello.branches[0].lines).toHaveLength(2)
    expect(curvy.path).toBe("spline")
    expect(block.content).toMatchObject({ kind: "block", scaleX: 1 })
    expect(hello.style.name).toBe("Standard")
  })

  // m12: AutoCAD's EXPLODE of each, piece by piece.
  it("draws each as AutoCAD's EXPLODE leaves it", () => {
    expect(pieces(mleaderGeometry(hello))).toEqual([
      "MTEXT 40,30.5307 tl HELLO",
      "LWPOLYLINE 30,29.2594 38,29.2594",
      "LWPOLYLINE 12.8813,12.7746 30,29.2594",
      "SOLID 13.3437,12.2944 10,10 12.4188,13.2548 12.4188,13.2548",
      "LWPOLYLINE 8.9432,25.6718 30,29.2594",
      "SOLID 9.0551,25.0146 5,25 8.8312,26.329 8.8312,26.329",
      "LWPOLYLINE 61.0164,29.2594 53.0164,29.2594",
      "LWPOLYLINE 68.6109,8.7511 61.0164,29.2594",
      "SOLID 69.2361,8.9826 70,5 67.9857,8.5195 67.9857,8.5195",
    ])
    expect(pieces(mleaderGeometry(none))).toEqual([
      "LWPOLYLINE 120,30 128,30",
      "LWPOLYLINE 102.8284,12.8284 120,30",
      "SOLID 103.2998,12.357 100,10 102.357,13.2998 102.357,13.2998",
    ])
    expect(pieces(mleaderGeometry(block))[0]).toBe("INSERT 231,30 1 0")
    // m03: the spline ends at the dogleg's end, along it, and draws no dogleg.
    expect(pieces(mleaderGeometry(curvy))).toEqual([
      "MTEXT 340,30.5298 tl CURVY",
      "SPLINE 328.2111,16.4223 320,0 300,10 338,29.2585",
      "SOLID 327.6149,16.7204 330,20 328.8074,16.1241 328.8074,16.1241",
    ])
  })

  // v7, v15: the dogleg off runs the leader on; a short first segment has
  // no arrowhead.
  it("runs on with no dogleg and leaves a short leader's arrowhead out", () => {
    const one = { ...none, branches: [hello.branches[0]] }
    expect(pieces(mleaderGeometry({ ...one, dogleg: false }))).toEqual([
      "LWPOLYLINE 13.2957,12.2669 38,29.2594",
      "SOLID 13.6735,11.7176 10,10 12.9178,12.8161 12.9178,12.8161",
      "LWPOLYLINE 8.9671,25.512 38,29.2594",
      "SOLID 9.0524,24.8509 5,25 8.8818,26.1732 8.8818,26.1732",
    ])
    const short = {
      ...one,
      branches: [{ ...hello.branches[0], lines: [[p(25, 25)]] }],
    }
    expect(pieces(mleaderGeometry(short))).toEqual([
      "LWPOLYLINE 30,29.2594 38,29.2594",
      "LWPOLYLINE 25,25 30,29.2594",
    ])
  })

  // v18, v21: the leader lines' colour; the text wears the object's (v19, v20).
  it("draws its leader lines in their colour and its text in its own", () => {
    const red = { ...hello, color: "#0000ff", lineColor: "#ff0000" }
    const drawn = mleaderGeometry(red)
    expect(drawn[0].color).toBe("#0000ff")
    expect(drawn.slice(1).every((e) => e.color === "#ff0000")).toBe(true)
    const byBlock = mleaderGeometry({ ...red, lineColor: "ByBlock" })
    expect(byBlock.every((e) => e.color === "#0000ff")).toBe(true)
  })

  // m05: MOVE, ROTATE and SCALE carry every point, SCALE its sizes too.
  it("is moved, turned and scaled as AutoCAD writes it", () => {
    const cad = withOne(hello)
    cad.zoomToFit()
    typed(cad, "_ROTATE", "_ALL", "", "0,0", "30")
    let m = only(cad)
    if (m.content?.kind !== "mtext") throw new Error("no text")
    expect(m.content.rotation).toBeCloseTo(Math.PI / 6, 12)
    expect(m.content.position).toBeCloseToPoint(p(19.3757, 46.4404), 4)
    expect(m.branches[0].direction).toBeCloseToPoint(p(0.866025, 0.5), 6)
    typed(cad, "_ROTATE", "_ALL", "", "0,0", "-30")
    typed(cad, "_SCALE", "_ALL", "", "0,0", "2")
    m = only(cad)
    expect(m.arrowSize).toBeCloseTo(8)
    expect(m.landingGap).toBeCloseTo(4)
    expect(m.branches[0].doglegLength).toBeCloseTo(16)
    expect(m.content).toMatchObject({ height: 5, width: 2 })
    // Its own 41 and 42 left (m05).
    expect(m.kept.doglegLength).toBe(8)
    expect(m.kept.arrowSize).toBe(4)
  })

  // m06, m07: MIRROR lays the text by its landing, reading as before.
  it("mirrors its text back to read, by its landing", () => {
    const one = { ...hello, branches: [hello.branches[0]] }
    const mirrored = (a: string, b: string) => {
      const cad = withOne(one)
      cad.zoomToFit()
      typed(cad, "_MIRROR", "_ALL", "", a, b, "_Y")
      const m = only(cad)
      if (m.content?.kind !== "mtext") throw new Error("no text")
      return m.content
    }
    const aboutY = mirrored("0,0", "0,10")
    expect(aboutY.position).toBeCloseToPoint(p(-40, 30.5307), 4)
    expect(aboutY.attachment).toBe("tr")
    expect(aboutY.rotation).toBeCloseTo(0)
    const aboutX = mirrored("0,0", "10,0")
    expect(aboutX.position).toBeCloseToPoint(p(40, -27.9881), 4)
    expect(aboutX.attachment).toBe("tl")
    const diagonal = mirrored("0,0", "10,10")
    expect(diagonal.position).toBeCloseToPoint(p(27.9881, 40), 4)
    expect(diagonal.rotation).toBeCloseTo(Math.PI / 2)
    const cad = withOne(block)
    cad.zoomToFit()
    typed(cad, "_MIRROR", "_ALL", "", "0,0", "0,10", "_Y")
    expect(only(cad).content).toMatchObject({
      kind: "block",
      scaleX: -1,
      scaleY: 1,
    })
  })

  // m06, m07: STRETCH moves its leader lines' vertices, and its landing and
  // dogleg's end along the dogleg; its text is no point of its own.
  it("is stretched by its vertices, its landing and its dogleg's end", () => {
    const one = { ...hello, branches: [hello.branches[0]] }
    const stretched = (from: string, to: string) => {
      const cad = withOne(one)
      cad.zoomToFit()
      typed(cad, "_STRETCH", "C", from, to, "", "0,0", "5,5")
      return only(cad)
    }
    const tip = stretched("9,9", "11,11")
    expect(tip.branches[0].lines[0][0]).toBeCloseToPoint(p(15, 15), 9)
    const landing = stretched("29,29", "31,30")
    expect(landing.branches[0].landing).toBeCloseToPoint(p(35, 29.2594), 4)
    expect(landing.branches[0].doglegLength).toBeCloseTo(3)
    const end = stretched("37,29", "39,30")
    expect(end.branches[0].doglegLength).toBeCloseTo(13)
    expect(end.content?.position).toBeCloseToPoint(p(45, 30.5307), 4)
    const text = stretched("39,30", "41,31")
    expect(text).toEqual({ ...one, id: "m1" })
  })

  // m03, m12: EXPLODE leaves its pieces, the doglegs as lines.
  it("EXPLODE leaves its text, its doglegs, its leaders and arrowheads", () => {
    const cad = withOne(hello)
    cad.select("m1")
    expect(typed(cad, "_EXPLODE")).toEqual(["EXPLODE", "1 found"])
    expect(pieces(cad.entities())).toEqual([
      "MTEXT 40,30.5307 tl HELLO",
      "LINE 30,29.2594 38,29.2594",
      "LWPOLYLINE 12.8813,12.7746 30,29.2594",
      "SOLID 13.3437,12.2944 10,10 12.4188,13.2548 12.4188,13.2548",
      "LWPOLYLINE 8.9432,25.6718 30,29.2594",
      "SOLID 9.0551,25.0146 5,25 8.8312,26.329 8.8312,26.329",
      "LINE 61.0164,29.2594 53.0164,29.2594",
      "LWPOLYLINE 68.6109,8.7511 61.0164,29.2594",
      "SOLID 69.2361,8.9826 70,5 67.9857,8.5195 67.9857,8.5195",
    ])
  })

  // m10, m12, m14 (en-US, es-ES).
  it("lists itself as AutoCAD does", () => {
    const cad = withOne(hello)
    typed(cad, "LUPREC", "4")
    cad.select("m1")
    const lines = typed(cad, "_LIST").flatMap((l) => l.split("\n"))
    expect(lines.slice(2)).toEqual([
      '                  MULTILEADER  Layer: "0"',
      "                            Space: Model space",
      "Leader Type:        StraightLeader",
      "Content Type:       MTextContent",
      "Landing:            ON",
      "Leader Number:      0",
      "Vertex:             X =   10.0000, Y =   10.0000, Z =    0.0000",
      "Vertex:             X =   30.0000, Y =   29.2594, Z =    0.0000",
      "Leader Number:      1",
      "Vertex:             X =    5.0000, Y =   25.0000, Z =    0.0000",
      "Vertex:             X =   30.0000, Y =   29.2594, Z =    0.0000",
      "Leader Number:      2",
      "Vertex:             X =   70.0000, Y =    5.0000, Z =    0.0000",
      "Vertex:             X =   61.0164, Y =   29.2594, Z =    0.0000",
      "Multileader style:  Standard",
      "Annotative:         NO",
    ])
    const spanish = withOne({ ...none, path: "none", dogleg: false }, es)
    spanish.select("m1")
    const lineas = typed(spanish, "_LIST").flatMap((l) => l.split("\n"))
    expect(lineas.slice(4, 7)).toEqual([
      "Tipo de directriz:       DirectrizInvisible",
      "Tipo de contenido:       SinContenido",
      "Segmento de conexión:    DES",
    ])
  })

  // m08, m09: what the edit commands say of it.
  it("is refused by OFFSET, AREA, BREAK, DIVIDE, EXTEND, FILLET and CHAMFER", () => {
    const refused = (command: string, ...rest: string[]) => {
      const cad = withOne(hello)
      cad.zoomToFit()
      typed(cad, command, ...rest)
      cad.click(p(20, 19.629))
      return cad.commandLog().join("\n")
    }
    expect(refused("_OFFSET", "1")).toContain("Cannot offset that object.")
    expect(refused("_AREA", "O")).toContain(
      "Selected object does not have an area"
    )
    expect(refused("_BREAK")).toContain("Object can't be broken")
    expect(refused("_DIVIDE")).toContain("Cannot divide that object.")
    expect(refused("_EXTEND", "")).toContain("Cannot EXTEND this object.")
    expect(refused("_FILLET")).toContain(
      "Fillet requires 2 lines, arcs, or circles."
    )
    expect(refused("_CHAMFER")).toContain("Chamfer requires 2 lines.")
  })

  // m08: END at its vertices, landings and doglegs' ends, INS at its text.
  it("snaps to its points and its text, never along its leaders", () => {
    const cad = withOne(hello)
    cad.zoomToFit()
    typed(cad, "LUPREC", "4")
    const found = (mode: string, at: string) => {
      typed(cad, "ID", mode, at)
      const line = cad.commandLog().at(-1) ?? ""
      const xyz = line.match(/X = (\S+)\s+Y = (\S+)/)
      return xyz ? [+xyz[1], +xyz[2]] : line
    }
    expect(found("_END", "10.3,10.2")).toEqual([10, 10])
    expect(found("_END", "29.5,29.2")).toEqual([30, 29.2594])
    expect(found("_END", "37.5,29.2")).toEqual([38, 29.2594])
    expect(found("_INS", "41,30")).toEqual([40, 30.5307])
    expect(found("_MID", "20,19.6")).not.toBeInstanceOf(Array)
    expect(found("_NEA", "20,19.6")).not.toBeInstanceOf(Array)
  })

  it("draws its text, its lines and its arrowheads in the scene", () => {
    const cad = withOne(hello)
    cad.zoomToFit()
    cad.moveTo(p(-100, -100))
    const kinds = cad.scene().primitives.map((q) => q.kind)
    expect(kinds.filter((k) => k === "text")).toHaveLength(1)
    // Its two doglegs, three leader lines and three arrowheads.
    expect(kinds.filter((k) => k === "path")).toHaveLength(8)
  })

  it("is picked by what it draws", () => {
    const cad = withOne(hello)
    cad.zoomToFit()
    cad.click(p(20, 19.629))
    expect(cad.selectedIds()).toEqual(["m1"])
  })

  it("drags a grip as STRETCH moves its point alone", () => {
    const cad = withOne({ ...hello, branches: [hello.branches[0]] })
    cad.zoomToFit()
    cad.click(p(20, 19.629))
    cad.click(p(38, 29.2594)).click(p(43, 35))
    const m = only(cad)
    expect(m.branches[0].doglegLength).toBeCloseTo(13)
    expect(m.content?.position).toBeCloseToPoint(p(45, 30.5307), 4)
  })

  it("drags its landing's grip with its dogleg and content", () => {
    // desktop objects/d05: the landing's Stretch moves the three together,
    // where STRETCH catching the landing alone slides it along the dogleg;
    // its dogleg's end is an arrow along it (d04, d07).
    const cad = withOne({ ...hello, branches: [hello.branches[0]] })
    cad.zoomToFit()
    cad.click(p(20, 19.629))
    const arrows = cad
      .scene()
      .primitives.filter((q) => q.kind === "path" && q.fill === THEME.grip)
    expect(arrows).toHaveLength(1)
    cad.click(p(30, 29.2594)).click(p(33, 33))
    const m = only(cad)
    expect(m.branches[0].landing).toBeCloseToPoint(p(33, 33), 4)
    expect(m.branches[0].doglegLength).toBeCloseTo(8)
    expect(m.content?.position).toBeCloseToPoint(p(43, 34.2713), 4)
  })

  it("keeps its dogleg's ends apart and its sizes through moves", () => {
    const one = { ...hello, branches: [hello.branches[0]] }
    const past = mleaderStretched(one, (_, i) => i === 2, p(20, 0))
    expect(past.branches[0].landing).toBeCloseToPoint(p(38, 29.2594), 4)
    expect(past.branches[0].doglegLength).toBe(0)
    const back = mleaderStretched(one, (_, i) => i === 3, p(-20, 0))
    expect(back.branches[0].doglegLength).toBe(0)
    expect(back.content?.position).toBeCloseToPoint(p(32, 30.5307), 4)
    let moved: Entity = one
    for (let i = 0; i < 7; i++) moved = translateEntity(moved, p(0.1, 0.7))
    expect(moved).toMatchObject({ arrowSize: 4, content: { height: 2.5 } })
  })

  it("opens a block that holds itself through its multileader", () => {
    const own = { ...block, id: "inner" }
    if (own.content?.kind !== "block") throw new Error("no block")
    const looped = createBlockDefinition(own.content.blockId, p(0, 0), [own])
    const cad = createHarness({
      entities: [{ ...block, id: "m1" }],
      blocks: [looped],
    })
    cad.zoomToFit()
    expect(cad.scene().primitives.length).toBeGreaterThan(0)
  })

  it("writes a block it no longer has as no content", () => {
    const lost = { ...block, id: "m1" }
    const { bytes } = writeDxf(
      { ...parsed, blocks: [], entities: [lost] },
      { version: "2018", binary: false, precision: 16 }
    )
    const [back] = parseDxf(new TextDecoder("latin1").decode(bytes)).drawing
      .entities
    expect(back).toMatchObject({ type: "mleader" })
    expect((back as MLeaderEntity).content).toBeUndefined()
  })

  it("is saved in the drawing file", () => {
    const cad = withOne(block)
    const back = parseDrawingFile(
      serializeDrawing(documentSnapshot(cad.runtime.document))
    )
    expect(back.entities[0]).toEqual({ ...block, id: "m1" })
  })
})
