import { describe, expect, it } from "vitest"

import { createHarness } from "../../../test/harness"
import { p } from "../../../test/builders"
import type { Entity, LeaderEntity, MTextEntity } from "../../domain/entities"
import { es } from "../../locales/es"
import { V } from "../../geometry/Vec2"

type Cad = ReturnType<typeof createHarness>

const get = (cad: Cad, id: string) =>
  cad.entities().find((e: Entity) => e.id === id)

const leaders = (cad: Cad) =>
  cad.entities().filter((e): e is LeaderEntity => e.type === "leader")
const texts = (cad: Cad) =>
  cad.entities().filter((e): e is MTextEntity => e.type === "mtext")
const xy = (points: readonly { x: number; y: number }[]) =>
  points.map((v) => [+v.x.toFixed(6), +v.y.toFixed(6)])
const answerLine = (cad: Cad, text: string) => {
  cad.runtime.setCommandLineText(text)
  cad.runtime.submitCommandLine()
}

describe("LEADER (leader/p01–p04)", () => {
  it("asks AutoCAD's prompts and makes the leader and its MTEXT, the text above the end", () => {
    const cad = createHarness()
    cad.command("LEADER")
    expect(cad.state().commandLine.prompt).toBe(
      "LEADER Specify leader start point:"
    )
    cad.type("0,0").enter()
    expect(cad.state().commandLine.prompt).toBe("LEADER Specify next point:")
    cad.type("10,10").enter()
    expect(cad.state().commandLine.prompt).toBe(
      "LEADER Specify next point or [Annotation/Format/Undo] <Annotation>:"
    )
    cad.type("20,10").enter()
    cad.enter()
    expect(cad.state().commandLine.prompt).toBe(
      "LEADER Enter first line of annotation text or <options>:"
    )
    answerLine(cad, "Hello")
    expect(cad.state().commandLine.prompt).toBe(
      "LEADER Enter next line of annotation text:"
    )
    answerLine(cad, "World")
    cad.enter()
    expect(cad.activeToolId()).toBe("select")
    // p01: no hook (the last segment level), the text Bottom Left DIMGAP
    // over and up from the end, DIMTXT tall, its lines \P-joined.
    const [leader] = leaders(cad)
    const [text] = texts(cad)
    expect(xy(leader.vertices)).toEqual([
      [0, 0],
      [10, 10],
      [20, 10],
    ])
    expect(leader.hook).toBe(false)
    expect(leader.annotation).toEqual({ kind: "mtext", id: text.id })
    expect(text.contents).toBe("Hello\\PWorld")
    expect(text.attachment).toBe("bl")
    expect(text.height).toBe(2.5)
    expect(text.position).toBeCloseToPoint(p(20.625, 10.625))
  })

  it("adds the hook a DIMASZ short of the end when the last segment rises over 15° (p02, p12)", () => {
    const cad = createHarness()
    cad.command("LEADER").type("0,0").enter().type("10,10").enter().enter()
    answerLine(cad, "Single")
    cad.enter()
    const [leader] = leaders(cad)
    expect(xy(leader.vertices)).toEqual([
      [0, 0],
      [7.5, 10],
      [10, 10],
    ])
    expect(leader.hook).toBe(true)
    // Leftwards: Bottom Right, before the end.
    cad.command("LEADER").type("100,0").enter().type("90,10").enter().enter()
    answerLine(cad, "Left side")
    cad.enter()
    const left = texts(cad).at(-1)!
    expect(left.attachment).toBe("br")
    expect(left.position).toBeCloseToPoint(p(89.375, 10.625))
    // 8.5° rises too little for one.
    cad.command("LEADER").type("200,0").enter().type("210,1.5").enter().enter()
    answerLine(cad, "Shallow")
    cad.enter()
    expect(leaders(cad).at(-1)!.hook).toBe(false)
  })

  it("ends with nothing at Enter on the first two points, and Undo goes back to the second (p04)", () => {
    const cad = createHarness()
    cad.command("LEADER").enter()
    expect(cad.activeToolId()).toBe("select")
    cad.command("LEADER").type("0,0").enter().enter()
    expect(cad.activeToolId()).toBe("select")
    expect(leaders(cad)).toHaveLength(0)
    cad.command("LEADER").type("0,0").enter().type("10,0").enter()
    cad.option("Undo")
    expect(cad.state().commandLine.prompt).toBe("LEADER Specify next point:")
  })

  it("Format sets spline and arrowhead, back at the point prompt; None makes the leader alone (p03–p05)", () => {
    const cad = createHarness()
    cad.command("LEADER").type("0,0").enter().type("10,10").enter()
    cad.option("Format")
    expect(cad.state().commandLine.prompt).toBe(
      "LEADER Enter leader format option [Spline/STraight/Arrow/None] <Exit>:"
    )
    cad.option("Spline")
    cad.option("Format")
    cad.option("None")
    cad.type("20,0").enter().enter().enter()
    expect(cad.state().commandLine.prompt).toBe(
      "LEADER Enter an annotation option [Copy/None/Mtext] <Mtext>:"
    )
    cad.option("None")
    const [leader] = leaders(cad)
    expect(leader.spline).toBe(true)
    expect(leader.arrow).toBe(false)
    expect(leader.annotation).toBeUndefined()
    expect(texts(cad)).toHaveLength(0)
  })

  it("is DIRECTRIZ in Spanish, its words AutoCAD's (AcDimRes 5509–5529, p17)", () => {
    const cad = createHarness({ locale: es })
    cad.command("DIREC")
    expect(cad.state().commandLine.prompt).toBe(
      "DIRECTRIZ Precise punto inicial de directriz:"
    )
    cad.type("0,0").enter().type("10,10").enter()
    expect(cad.state().commandLine.prompt).toBe(
      "DIRECTRIZ Precise siguiente punto o [Anotación/Formato/desHacer] <Anotación>:"
    )
    cad.enter()
    expect(cad.state().commandLine.prompt).toBe(
      "DIRECTRIZ Indique la primera línea de texto de anotación u <opciones>:"
    )
  })
})

describe("a leader follows its text (leader/p08, p09, p14, p18)", () => {
  const made = () => {
    const cad = createHarness()
    cad.command("LEADER").type("0,0").enter().type("10,10").enter()
    cad.type("20,10").enter().enter()
    answerLine(cad, "Moved")
    cad.enter()
    return { cad, leader: leaders(cad)[0], text: texts(cad)[0] }
  }

  it("moves its end with the text, the hook worked out again, as one step (p08)", () => {
    const { cad, leader, text } = made()
    cad.command("MOVE").click(text.position).enter()
    cad.type("0,0").enter().type("5,7").enter()
    const moved = get(cad, leader.id) as LeaderEntity
    expect(xy(moved.vertices)).toEqual([
      [0, 0],
      [10, 10],
      [22.5, 17],
      [25, 17],
    ])
    expect(moved.hook).toBe(true)
    cad.command("U")
    expect(xy((get(cad, leader.id) as LeaderEntity).vertices)).toEqual([
      [0, 0],
      [10, 10],
      [20, 10],
    ])
  })

  it("turns the text to Bottom Right, its box kept, once moved across the leader (p18)", () => {
    const { cad, leader, text } = made()
    cad.select(text.id).command("MOVE").type("0,0").enter()
    cad.type("-30,0").enter()
    const turned = get(cad, text.id) as MTextEntity
    expect(turned.attachment).toBe("br")
    expect(turned.position.x).toBeGreaterThan(text.position.x - 30)
    const moved = get(cad, leader.id) as LeaderEntity
    expect(moved.vertices.at(-1)).toBeCloseToPoint(
      V.add(turned.position, p(0.625, -0.625))
    )
    // Moved again on that side, it stays Bottom Right.
    cad.select(text.id).command("MOVE").type("0,0").enter()
    cad.type("-5,0").enter()
    expect((get(cad, text.id) as MTextEntity).attachment).toBe("br")
  })

  it("loses its annotation and hook when the text is erased (p08)", () => {
    const { cad, leader, text } = made()
    cad.command("MOVE").click(text.position).enter()
    cad.type("0,0").enter().type("5,7").enter()
    cad.command("ERASE").click(p(26, 18.5)).enter()
    const left = get(cad, leader.id) as LeaderEntity
    expect(left.annotation).toBeUndefined()
    expect(left.hook).toBe(false)
    expect(xy(left.vertices)).toEqual([
      [0, 0],
      [10, 10],
      [25, 17],
    ])
  })

  it("copied alone keeps no text, copied with it points at the copy (p09)", () => {
    const { cad, leader, text } = made()
    cad.command("COPY").click(p(5, 5)).enter().type("0,0").enter()
    cad.type("0,-30").enter().enter()
    const lone = leaders(cad).find((l) => l.id !== leader.id)!
    expect(lone.annotation).toBeUndefined()
    cad.command("COPY").click(p(5, 5)).click(text.position).enter()
    cad.type("0,0").enter().type("50,0").enter().enter()
    const pair = leaders(cad).at(-1)!
    const copy = texts(cad).at(-1)!
    expect(copy.id).not.toBe(text.id)
    expect(pair.annotation).toEqual({ kind: "mtext", id: copy.id })
  })

  it("an array of the pair exploded pairs each leader with its own text", () => {
    const { cad, leader, text } = made()
    cad.select(leader.id, text.id).command("ARRAYRECT").enter()
    cad.command("EXPLODE").click(p(5, 5)).enter()
    const all = leaders(cad)
    expect(all.length).toBeGreaterThan(1)
    for (const each of all) {
      const own = get(cad, each.annotation!.id) as MTextEntity
      expect(V.distance(each.vertices.at(-1)!, own.position)).toBeLessThan(1)
    }
    expect(new Set(all.map((l) => l.annotation!.id)).size).toBe(all.length)
  })

  it("lets go of a text BLOCK takes into a definition", () => {
    const { cad, leader, text } = made()
    cad.select(text.id).command("-BLOCK").type("B1").enter()
    cad.type("0,0").enter()
    expect(get(cad, text.id)).toBeUndefined()
    const left = get(cad, leader.id) as LeaderEntity
    expect(left.annotation).toBeUndefined()
    cad.command("U")
    expect((get(cad, leader.id) as LeaderEntity).annotation?.id).toBe(text.id)
  })

  it("a copy SCALE makes follows its own text from where it was made", () => {
    const { cad, leader, text } = made()
    cad.select(leader.id, text.id).command("SCALE").type("0,0").enter()
    cad.option("Copy")
    cad.type("2").enter()
    const copy = leaders(cad).find((l) => l.id !== leader.id)!
    const its = get(cad, copy.annotation!.id) as MTextEntity
    expect(its.id).not.toBe(text.id)
    const end = copy.vertices.at(-1)!
    cad.select(its.id).command("MOVE").type("0,0").enter()
    cad.type("0,1").enter()
    const moved = get(cad, copy.id) as LeaderEntity
    expect(moved.vertices.at(-1)).toBeCloseToPoint(V.add(end, p(0, 1)))
  })
})

describe("a leader's vertices in the Properties palette (d01)", () => {
  it("reads and edits Vertex X in the UCS, the Current Vertex and the elevation", () => {
    const cad = createHarness()
    cad.command("LEADER").type("0,0").enter().type("10,10").enter()
    cad.type("20,10").enter().enter().enter()
    cad.option("None")
    const [leader] = leaders(cad)
    cad.command("UCS").type("100,100").enter().enter()
    cad.select(leader.id)
    expect(cad.runtime.setSelectionProperty("vertexX", "5")).toBe(true)
    expect((get(cad, leader.id) as LeaderEntity).vertices[0]).toBeCloseToPoint(
      p(105, 0)
    )
    expect(cad.runtime.setSelectionProperty("vertex", "3")).toBe(true)
    expect(cad.runtime.setSelectionProperty("vertexY", "0")).toBe(true)
    expect((get(cad, leader.id) as LeaderEntity).vertices[2]).toBeCloseToPoint(
      p(20, 100)
    )
    expect(cad.runtime.setSelectionProperty("elevation", "5")).toBe(true)
    expect((get(cad, leader.id) as LeaderEntity).elevation).toBe(5)
  })
})
