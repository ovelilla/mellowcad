import { describe, expect, it } from "vitest"

import { type CadHarness, createHarness } from "../../test/harness"
import { THEME } from "../scene/theme"

function answer(cad: CadHarness, ...texts: string[]): CadHarness {
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

/**
 * A 10 box seen from (-1.3, -2.2, 1.6), the desktop's view of it: its top,
 * front (Y 0) and left (X 0) towards the viewer, no two edges drawn over each
 * other as SW Isometric draws them.
 */
function box(): CadHarness {
  const cad = createHarness()
  answer(cad, "BOX", "0,0,0", "10,10", "10", "VPOINT", "-1.3,-2.2,1.6")
  answer(cad, "ZOOM", "E")
  return cad
}

const CTRL = { ctrlKey: true }
const TOP = 0
const BACK = 4

const subobjects = (cad: CadHarness) =>
  cad.runtime.selection.subobjects().map(({ kind, index }) => ({ kind, index }))

const filled = (cad: CadHarness, color: string) =>
  cad.scene().primitives.filter((p) => p.kind === "path" && p.fill === color)
    .length

describe("a solid's subobjects, Ctrl+clicked", () => {
  it("takes the face under the cursor, its edges glowing and its grip red", () => {
    const cad = box()
    cad.moveTo({ x: 3, y: 7, z: 10 }, CTRL)
    // Held over it, its four edges glow as a rollover does.
    expect(
      cad
        .scene()
        .primitives.filter(
          (p) => "stroke" in p && p.stroke?.color === THEME.entityHover
        ).length
    ).toBe(4)
    cad.click({ x: 3, y: 7, z: 10 }, CTRL)
    expect(subobjects(cad)).toEqual([{ kind: "face", index: TOP }])
    // A set of subobjects is no set of objects.
    expect(cad.runtime.selection.isEmpty()).toBe(true)
    cad.moveTo({ x: 500, y: 500, z: 0 })
    expect(filled(cad, THEME.gripHot)).toBe(1)
    expect(
      cad
        .scene()
        .primitives.filter(
          (p) => "stroke" in p && p.stroke?.color === THEME.selected
        ).length
    ).toBe(4)
  })

  it("takes a vertex over its edges, an edge over its faces, and adds them up", () => {
    const cad = box()
    cad.click({ x: 10, y: 0, z: 10 }, CTRL)
    cad.click({ x: 5, y: 0, z: 10 }, CTRL)
    const [vertex, edge] = cad.runtime.selection.subobjects()
    expect(vertex.kind).toBe("vertex")
    const solid = cad.runtime.document.get(vertex.id)
    if (solid?.type !== "solid3d") throw new Error("no solid")
    expect(solid.brep.vertices[vertex.index]).toEqual({ x: 10, y: 0, z: 10 })
    expect(edge.kind).toBe("edge")
    const e = solid.brep.edges[edge.index]
    expect(
      [e.start, e.end]
        .map((v) => solid.brep.vertices[v])
        .sort((a, b) => a.x - b.x)
    ).toEqual([
      { x: 0, y: 0, z: 10 },
      { x: 10, y: 0, z: 10 },
    ])
  })

  it("takes one out with Ctrl+Shift, and Escape drops them all", () => {
    const cad = box()
    cad.click({ x: 3, y: 7, z: 10 }, CTRL)
    cad.click({ x: 5, y: 0, z: 10 }, CTRL)
    cad.click({ x: 3, y: 7, z: 10 }, { ctrlKey: true, shiftKey: true })
    expect(subobjects(cad).map((s) => s.kind)).toEqual(["edge"])
    cad.escape()
    expect(subobjects(cad)).toEqual([])
  })

  it("walks to the face behind with Ctrl+Space (desktop: the top, then the back)", () => {
    const cad = box()
    cad.moveTo({ x: 3, y: 7, z: 10 }, CTRL)
    expect(cad.press(" ", CTRL)).toBe(true)
    cad.click({ x: 3, y: 7, z: 10 }, CTRL)
    expect(subobjects(cad)).toEqual([{ kind: "face", index: BACK }])
    // Round again past the last.
    cad.moveTo({ x: 3, y: 7, z: 10 }, CTRL)
    cad.press(" ", CTRL)
    cad.press(" ", CTRL)
    cad.click({ x: 3, y: 7, z: 10 }, CTRL)
    expect(subobjects(cad).at(-1)).toEqual({ kind: "face", index: BACK })
  })

  it("finds an edge a face hides only in 2D Wireframe", () => {
    // The back bottom edge's middle, drawn inside the front face.
    const hiddenEdge = { x: 5, y: 10, z: 0 }
    const wire = box()
    wire.click(hiddenEdge, CTRL)
    expect(subobjects(wire).map((s) => s.kind)).toEqual(["edge"])
    const hidden = box()
    answer(hidden, "VSCURRENT", "H")
    hidden.click(hiddenEdge, CTRL)
    expect(subobjects(hidden).map((s) => s.kind)).toEqual(["face"])
  })

  it("is no set a command takes: ERASE asks for objects", () => {
    const cad = box()
    cad.click({ x: 3, y: 7, z: 10 }, CTRL)
    const from = cad.commandLog().length
    answer(cad, "ERASE")
    expect(cad.commandLog().slice(from)).toEqual(["ERASE"])
    expect(
      cad
        .state()
        .commandLine.question?.map((s) => s.text)
        .join("")
    ).toBe("Select objects:")
  })

  it("picks as any click does where Ctrl finds none", () => {
    const cad = box()
    cad.click({ x: 40, y: 40, z: 0 }, CTRL)
    expect(subobjects(cad)).toEqual([])
  })
})
