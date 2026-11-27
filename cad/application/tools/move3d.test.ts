import { describe, expect, it } from "vitest"

import { type CadHarness, createHarness } from "../../../test/harness"
import { Solid3dEntity } from "../../domain/entities"
import { THEME } from "../../scene/theme"
import { es } from "../../locales/es"

function answer(cad: CadHarness, ...texts: string[]): CadHarness {
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

/** The console's 10 box seen from (-1.3,-2.2,1.6) (3dmove/p01). */
function box(): CadHarness {
  const cad = createHarness()
  cad.runtime.setDocumentPrecision(4)
  answer(cad, "BOX", "0,0,0", "10,10", "10", "-VPOINT", "-1.3,-2.2,1.6")
  return cad
}

function solid(cad: CadHarness): Solid3dEntity {
  const found = cad.runtime.document
    .getEntities()
    .find((e): e is Solid3dEntity => e.type === "solid3d")
  if (!found) throw new Error("no solid")
  return found
}

function minX(cad: CadHarness): number {
  return Math.min(...solid(cad).brep.vertices.map((v) => v.x))
}

/** A point `fraction` of the way along the gizmo's arrow `axis` from the box's centre. */
function onArrow(cad: CadHarness, axis: "x" | "y" | "z", fraction: number) {
  const c = { x: 5, y: 5, z: 5 }
  const unit = { x: 0, y: 0, z: 0, [axis]: 1 }
  // Pixels a world unit square to the view spans: the gizmo's arms are 96 of them.
  const a = cad.toScreen(c)
  const b = cad.toScreen({ x: c.x + unit.x, y: c.y + unit.y, z: c.z + unit.z })
  const v = { x: -1.3, y: -2.2, z: 1.6 }
  const length = Math.hypot(v.x, v.y, v.z)
  const along = (unit.x * v.x + unit.y * v.y + unit.z * v.z) / length
  const scale = Math.hypot(b.x - a.x, b.y - a.y) / Math.sqrt(1 - along * along)
  const reach = (96 / scale) * fraction
  return {
    x: c.x + unit.x * reach,
    y: c.y + unit.y * reach,
    z: c.z + unit.z * reach,
  }
}

describe("3DMOVE", () => {
  // 3dmove/p01–p04, p08: MOVE's prompts, `Regenerating model.` as it ends in
  // a 3D view in 2D Wireframe, a step U names 3DMOVE.
  it("asks as MOVE asks, and says it regenerates", () => {
    const cad = box()
    answer(cad, "3DMOVE", "L", "")
    expect(cad.state().commandLine.prompt).toBe(
      "3DMOVE Specify base point or [Displacement] <Displacement>:"
    )
    answer(cad, "0,0,0", "5,0,0")
    expect(minX(cad)).toBeCloseTo(5, 9)
    expect(cad.commandLog().at(-1)).toBe("Regenerating model.")
    answer(cad, "U")
    expect(cad.commandLog().at(-1)).toBe("3DMOVE")
    expect(minX(cad)).toBeCloseTo(0, 9)
    answer(cad, "3M", "L", "", "", "5,0,0")
    expect(minX(cad)).toBeCloseTo(5, 9)
  })

  // p05, p11: in plan or in a 3D visual style it regenerates nothing.
  it("regenerates nothing in plan or in Conceptual", () => {
    const plan = createHarness()
    answer(plan, "BOX", "0,0,0", "10,10", "10")
    const from = plan.commandLog().length
    answer(plan, "3DMOVE", "L", "", "0,0,0", "5,0,0")
    expect(plan.commandLog().slice(from)).not.toContain("Regenerating model.")
    const shaded = box()
    answer(shaded, "VSCURRENT", "C")
    const after = shaded.commandLog().length
    answer(shaded, "3DMOVE", "L", "", "0,0,0", "5,0,0")
    expect(shaded.commandLog().slice(after)).not.toContain(
      "Regenerating model."
    )
  })

  // Desktop 3dmove/d01: the gizmo at the set's centre; the X arrow yellow
  // under the cursor; a click on it says `** MOVE **` and asks the move
  // point along X, where `3` moves the box 3 along X.
  it("moves along the gizmo's arrow taken", () => {
    const cad = box()
    answer(cad, "3DMOVE", "L", "")
    const hot = () =>
      cad
        .scene()
        .primitives.filter(
          (p) => "stroke" in p && p.stroke?.color === THEME.gizmoHot
        ).length
    cad.moveTo({ x: 40, y: 40, z: 0 })
    expect(hot()).toBe(0)
    const arrow = onArrow(cad, "x", 0.5)
    cad.moveTo(arrow)
    expect(hot()).toBeGreaterThan(0)
    cad.click(arrow)
    expect(cad.commandLog().slice(-2)).toEqual([
      "Specify base point or [Displacement] <Displacement>:",
      "** MOVE **",
    ])
    expect(cad.state().commandLine.prompt).toBe(
      "3DMOVE Specify move point or [Base point/Copy/Undo/eXit]:"
    )
    cad.moveTo(onArrow(cad, "x", 0.9))
    answer(cad, "3")
    expect(minX(cad)).toBeCloseTo(3, 9)
  })

  // The drag follows the axis whatever the cursor does off it; Copy makes a
  // copy at each point and eXit ends.
  it("copies along the axis under Copy", () => {
    const cad = box()
    answer(cad, "3DMOVE", "L", "")
    const arrow = onArrow(cad, "x", 0.5)
    cad.moveTo(arrow)
    cad.click(arrow)
    answer(cad, "C")
    cad.moveTo(onArrow(cad, "x", 0.9))
    answer(cad, "20")
    cad.moveTo(onArrow(cad, "x", 0.9))
    answer(cad, "40", "X")
    const solids = cad.runtime.document
      .getEntities()
      .filter((e) => e.type === "solid3d")
    expect(solids).toHaveLength(3)
  })

  // Base point asks a new base, typed or clicked; Undo takes the last copy
  // back, none silently; a point typed is LASTPOINT, as MOVE's (move/p170).
  it("takes a new base, undoes a copy and leaves LASTPOINT at the point", () => {
    const cad = box()
    answer(cad, "3DMOVE", "L", "")
    const arrow = onArrow(cad, "x", 0.5)
    cad.moveTo(arrow)
    cad.click(arrow)
    answer(cad, "U", "B")
    expect(cad.state().commandLine.prompt).toBe("3DMOVE Specify base point:")
    answer(cad, "0,0,0", "C")
    cad.moveTo(onArrow(cad, "x", 0.9))
    answer(cad, "20", "20", "U", "X")
    expect(
      cad.runtime.document.getEntities().filter((e) => e.type === "solid3d")
    ).toHaveLength(2)

    const typed = box()
    answer(typed, "3DMOVE", "L", "")
    const at = onArrow(typed, "x", 0.5)
    typed.moveTo(at)
    typed.click(at)
    answer(typed, "@2,0,0")
    answer(typed, "ID", "@")
    const [x] = typed
      .commandLog()
      .at(-1)!
      .match(/X = (-?[\d.]+)/)!
      .slice(1)
    expect(Number(x)).toBeCloseTo(at.x + 2, 3)
  })

  it("is DESPLAZA3D in Spanish", () => {
    const cad = createHarness({ locale: es })
    answer(cad, "PRISMARECT", "0,0,0", "10,10", "10", "DESPLAZA3D", "_L", "")
    expect(cad.state().commandLine.prompt).toBe(
      "DESPLAZA3D Precise punto base o [Desplazamiento] <Desplazamiento>:"
    )
  })
})
