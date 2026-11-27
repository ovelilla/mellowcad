import { describe, expect, it } from "vitest"

import { type CadHarness, createHarness } from "../../test/harness"
import { brepVolume } from "../geometry/solids"
import { Solid3dEntity } from "../domain/entities"

function answer(cad: CadHarness, ...texts: string[]): CadHarness {
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

/** The console's 10 box seen from (-1.3,-2.2,1.6) (solid-edits/p241–p264). */
function box(): CadHarness {
  const cad = createHarness()
  answer(cad, "BOX", "0,0,0", "10,10", "10", "-VPOINT", "-1.3,-2.2,1.6")
  return cad
}

function solids(cad: CadHarness): Solid3dEntity[] {
  return cad.runtime.document
    .getEntities()
    .filter((e): e is Solid3dEntity => e.type === "solid3d")
}

function zTop(solid: Solid3dEntity): number {
  return Math.max(...solid.brep.vertices.map((v) => v.z))
}

describe("a solid's faces, edges and vertices as a set", () => {
  // solid-edits/p244, p245: SUbobject's pick takes the face or the edge under
  // the point, `1 found`, and MOVE reshapes the solid by it, which is no box
  // any more (p264).
  it("moves a face and an edge picked in SUbobject", () => {
    const face = box()
    answer(face, "MOVE", "SU", "3,7,10")
    expect(face.commandLog().slice(-2)).toEqual([
      "Select objects: 3,7,10",
      "1 found",
    ])
    answer(face, "", "0,0,0", "0,0,5")
    const [raised] = solids(face)
    expect(brepVolume(raised.brep)).toBeCloseTo(1500, 9)
    expect(zTop(raised)).toBeCloseTo(15, 9)
    expect(raised.primitive).toBeUndefined()

    const edge = box()
    answer(edge, "MOVE", "SU", "5,0,10", "", "0,0,0", "0,-2,0")
    expect(brepVolume(solids(edge)[0].brep)).toBeCloseTo(1100, 9)
  })

  // p247: COPY of a face copies the whole solid.
  it("copies the whole solid", () => {
    const cad = box()
    answer(cad, "COPY", "SU", "3,7,10", "", "0,0,0", "20,0,0", "")
    const all = solids(cad)
    expect(all).toHaveLength(2)
    expect(brepVolume(all[1].brep)).toBeCloseTo(1000, 9)
  })

  // p261: SCALE of the top face by 2 about its middle makes a frustum.
  it("scales a face, its sides sloping", () => {
    const cad = box()
    answer(cad, "SCALE", "SU", "3,7,10", "", "5,5,10", "2")
    expect(brepVolume(solids(cad)[0].brep)).toBeCloseTo(7000 / 3, 9)
  })

  // ROTATE turns a part about the UCS's Z: an upright edge about another
  // corner leaves the two faces on it planes. p249's top face turned in its
  // plane, whose sides AutoCAD tilts as no plane through their corners
  // could, is refused here as SOLIDEDIT refuses an edit (Missing).
  it("rotates an edge, and refuses a face turned in its plane", () => {
    const edge = box()
    answer(edge, "ROTATE", "SU", "0,0,5", "", "10,10", "10")
    const [turned] = solids(edge)
    expect(turned.primitive).toBeUndefined()
    expect(brepVolume(turned.brep)).not.toBeCloseTo(1000, 3)

    const face = box()
    answer(face, "ROTATE", "SU", "3,7,10", "", "5,5,10", "10")
    expect(face.commandLog()).toContain("Modeling Operation Error:")
    expect(brepVolume(solids(face)[0].brep)).toBeCloseTo(1000, 9)
  })

  // A face dragged across another part of a solid that is not convex would
  // cross itself: refused, the solid as it was; the drag shows it so.
  it("refuses a face carried across the solid, and previews what it commits", () => {
    const cad = createHarness()
    answer(cad, "BOX", "0,0,0", "30,10", "10", "BOX", "0,0,0", "10,30", "10")
    answer(cad, "UNION", "ALL", "", "-VPOINT", "1.3,2.2,1.6")
    answer(cad, "MOVE", "SU", "20,10,5", "", "0,0,0")
    cad.moveTo({ x: -15, y: 5, z: 0 })
    const [solid] = solids(cad)
    // The drag draws the solid where it is, which is what the click leaves.
    expect(cad.state().commandLine.prompt).toContain("second point")
    answer(cad, "-15,5,0")
    expect(cad.commandLog()).toContain("Modeling Operation Error:")
    expect(brepVolume(solids(cad)[0].brep)).toBeCloseTo(
      brepVolume(solid.brep),
      9
    )
  })

  // EXTRUDE offers SUbobject but acts on no part here: none is found.
  it("finds no part where the command takes none", () => {
    const cad = box()
    answer(cad, "EXTRUDE", "SU", "3,7,10")
    expect(cad.commandLog()).not.toContain("1 found")
  })

  // p241, p264: ERASE of a face leaves the solid, which is no box any more.
  it("erases a part as the solid's history", () => {
    const cad = box()
    answer(cad, "ERASE", "SU", "3,7,10", "")
    const [left] = solids(cad)
    expect(brepVolume(left.brep)).toBeCloseTo(1000, 9)
    expect(left.primitive).toBeUndefined()
  })

  // p260: the same face again is a duplicate, Remove takes it out.
  it("counts a duplicate and a removal", () => {
    const cad = box()
    answer(cad, "MOVE", "SU", "3,7,10", "3,7,10", "R", "3,7,10")
    expect(cad.commandLog().slice(-5)).toEqual([
      "Select objects: 3,7,10",
      "1 found (1 duplicate), 1 total",
      "Select objects: R",
      "Remove objects: 3,7,10",
      "1 found, 1 removed, 0 total",
    ])
  })

  // p257: a window round the box in SUbobject finds its 12 edges and 8
  // vertices; p258: a crossing inside a face, none.
  it("takes a window's edges and vertices", () => {
    const cad = box()
    answer(cad, "ERASE", "SU", "W", "-20,-20,0", "30,30,0")
    expect(cad.commandLog().at(-1)).toBe("20 found")
    answer(cad, "C", "4,4,10", "6,6,10")
    expect(cad.commandLog().at(-1)).toContain("0 found")
  })

  // Desktop solid-edits/d01-f: a face Ctrl+clicked at Command: is MOVE's
  // set, `1 found`, and MOVE asks its base point.
  it("takes a face selected before the command", () => {
    const cad = box()
    cad.click({ x: 3, y: 7, z: 10 }, { ctrlKey: true })
    answer(cad, "MOVE")
    expect(cad.commandLog().at(-1)).toBe("1 found")
    expect(cad.state().commandLine.prompt).toBe(
      "MOVE Specify base point or [Displacement] <Displacement>:"
    )
    answer(cad, "0,0,0", "0,0,5")
    expect(zTop(solids(cad)[0])).toBeCloseTo(15, 9)
  })

  // Ctrl+click at MOVE's Select objects: takes the face (About Selecting
  // Subobjects: "Press and hold Ctrl to select subobjects at the selection
  // prompts of the MOVE, ROTATE, SCALE, and ERASE commands").
  it("takes a face Ctrl+clicked at Select objects:", () => {
    const cad = box()
    answer(cad, "MOVE")
    cad.click({ x: 3, y: 7, z: 10 }, { ctrlKey: true })
    answer(cad, "", "0,0,0", "0,0,5")
    expect(zTop(solids(cad)[0])).toBeCloseTo(15, 9)
  })
})
