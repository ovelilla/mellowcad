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
 * other as SW Isometric draws them (AutoCAD 2027's desktop, solid-edits/d01).
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

const stroked = (cad: CadHarness, color: string) =>
  cad
    .scene()
    .primitives.filter((p) => "stroke" in p && p.stroke?.color === color).length

const padlock = (cad: CadHarness) =>
  cad
    .scene()
    .primitives.some((p) => p.kind === "rect" && p.fill === THEME.lockedBadge)

describe("a solid's subobjects, Ctrl+clicked", () => {
  it("takes the face under the cursor, its edges glowing and its grip red (solid-edits/d01-b, d01-c)", () => {
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

  it("takes a vertex over its edges, an edge over its faces, and adds them up (solid-edits/d01-b, d01-c)", () => {
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

  it("takes one out with Ctrl+Shift, and Escape drops them all (solid-edits/d01-e)", () => {
    const cad = box()
    cad.click({ x: 3, y: 7, z: 10 }, CTRL)
    cad.click({ x: 5, y: 0, z: 10 }, CTRL)
    cad.click({ x: 3, y: 7, z: 10 }, { ctrlKey: true, shiftKey: true })
    expect(subobjects(cad).map((s) => s.kind)).toEqual(["edge"])
    cad.escape()
    expect(subobjects(cad)).toEqual([])
  })

  it("walks to the face behind with Ctrl+Space: the top, then the back (solid-edits/d01-d, d01-e)", () => {
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

  // WHY no `1 found`: AutoCAD's LIST, MOVE and ERASE take a selected face
  // as their preselection (solid-edits/d01-f), phase 6c's here (EDITS-D133).
  it("is no set a command takes here: ERASE asks for objects", () => {
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

  it("lights the face as Ctrl goes down with the cursor still, unlit as it comes up (solid-edits/d01-a)", () => {
    const cad = box()
    cad.moveTo({ x: 3, y: 7, z: 10 })
    expect(stroked(cad, THEME.entityHover)).toBe(0)
    cad.press("Control", CTRL)
    expect(stroked(cad, THEME.entityHover)).toBe(4)
    cad.release("Control")
    expect(stroked(cad, THEME.entityHover)).toBe(0)
  })

  it("shows a locked solid's face with the padlock and no glow, and takes it with no grip (solid-edits/d01-h)", () => {
    const cad = box()
    cad.runtime.updateLayer(cad.latest().layerId, { locked: true })
    cad.moveTo({ x: 3, y: 7, z: 10 }, CTRL)
    expect(padlock(cad)).toBe(true)
    expect(stroked(cad, THEME.entityHover)).toBe(0)
    cad.click({ x: 3, y: 7, z: 10 }, CTRL)
    expect(subobjects(cad)).toEqual([{ kind: "face", index: TOP }])
    cad.moveTo({ x: 500, y: 500, z: 0 })
    expect(padlock(cad)).toBe(false)
    expect(stroked(cad, THEME.selected)).toBe(4)
    expect(filled(cad, THEME.gripHot)).toBe(0)
  })
})

// AutoCAD's SUbobject mode takes a solid's faces, edges and vertices (`1
// found`, solid-edits/p241–p264), phase 6c's here, where it finds nothing
// (command-line.md, Missing). What it answers already as AutoCAD does:
describe("SUbobject at Select objects: on a solid", () => {
  const written = (cad: CadHarness, ...texts: string[]) => {
    const from = cad.commandLog().length
    answer(cad, ...texts)
    return cad.commandLog().slice(from)
  }
  const SU_MODES =
    "Window/Crossing/BOX/Fence/WPolygon/CPolygon/Add/Remove/Multiple/Previous/Undo/AUto/SIngle/SUbobject/Object"

  it("refuses ALL and Last, and Previous says there is none (solid-edits/p256)", () => {
    const cad = box()
    answer(cad, "_ERASE", "_SU")
    expect(written(cad, "_ALL", "_L", "_P")).toEqual([
      "Select objects: _ALL",
      "*Invalid selection*",
      `Expects a point or ${SU_MODES}`,
      "Select objects: _L",
      "*Invalid selection*",
      `Expects a point or ${SU_MODES}`,
      "Select objects: _P",
      "No previous selection set.",
    ])
  })

  it("finds nothing in a crossing inside a face (solid-edits/p258)", () => {
    const cad = box()
    answer(cad, "_MOVE", "_SU")
    expect(written(cad, "_C", "4,4,10", "6,6,10")).toEqual([
      "Select objects: _C",
      "Specify first corner: 4,4,10",
      "Specify opposite corner: 6,6,10",
      "0 found",
    ])
  })

  it("starts a window at a point on nothing (solid-edits/p263)", () => {
    const cad = box()
    answer(cad, "_MOVE", "_SU")
    expect(written(cad, "50,50,50", "60,60,60")).toEqual([
      "Select objects: 50,50,50",
      "Specify opposite corner: 60,60,60",
      "0 found",
    ])
  })

  it("is refused by LIST, whose set is of whole objects (solid-edits/p248)", () => {
    const cad = box()
    answer(cad, "_LIST")
    expect(written(cad, "_SU")).toEqual([
      "Select objects: _SU",
      "*Invalid selection*",
      "Expects a point or Window/Last/Crossing/BOX/ALL/Fence/WPolygon/CPolygon/Group/Add/Remove/Multiple/Previous/Undo/AUto/SIngle",
    ])
  })
})
