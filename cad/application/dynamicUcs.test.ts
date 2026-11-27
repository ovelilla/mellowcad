import { describe, expect, it } from "vitest"

import { type CadHarness, createHarness } from "../../test/harness"
import { es } from "../locales/es"
import { lineEndZ, lineStartZ } from "../domain/entities"

function answer(cad: CadHarness, ...texts: string[]): CadHarness {
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

/** A 10 box at the origin seen from (-1.3,-2.2,1.6), as the desktop's (ucs/d11). */
function box(): CadHarness {
  const cad = createHarness()
  answer(cad, "BOX", "0,0,0", "10,10", "10", "-VPOINT", "-1.3,-2.2,1.6")
  return cad
}

function newest(cad: CadHarness) {
  return cad.runtime.document.getEntities().at(-1)!
}

describe("the dynamic UCS (UCSDETECT)", () => {
  // Desktop ucs/d11-2, d11-3: LINE's first point over the box's front face
  // lays the work plane on it, and the line's second point off the box still
  // lies in that plane; the UCS is the WCS again once LINE ends.
  it("lays the first point's work plane on the face under the cursor", () => {
    const cad = box()
    const before = cad.runtime.document.getSettings()
    answer(cad, "LINE")
    cad.moveTo({ x: 4, y: 0, z: 6 })
    cad.click({ x: 4, y: 0, z: 6 })
    // Off the box, where the cursor's line of sight meets the face's plane.
    cad.click({ x: 15, y: 0, z: 12 })
    cad.enter()
    const line = newest(cad)
    expect(line.type).toBe("line")
    if (line.type !== "line") return
    expect(line.start.y).toBeCloseTo(0, 9)
    expect(line.end.y).toBeCloseTo(0, 9)
    expect([line.start.x, lineStartZ(line)]).toEqual([
      expect.closeTo(4, 9),
      expect.closeTo(6, 9),
    ])
    expect(cad.runtime.document.getSettings()).toBe(before)
    expect(cad.state().dynamicUcsActive).toBe(true)
  })

  // Desktop ucs/d11-6: BOX's first corner over a face builds the box on it,
  // its height out of the solid.
  it("builds BOX on the face", () => {
    const cad = box()
    answer(cad, "BOX")
    cad.moveTo({ x: 2, y: 0, z: 2 })
    cad.click({ x: 2, y: 0, z: 2 })
    answer(cad, "@4,4", "3")
    const made = newest(cad)
    expect(made.type).toBe("solid3d")
    if (made.type !== "solid3d") return
    const ys = made.brep.vertices.map((v) => +v.y.toFixed(9))
    expect(Math.min(...ys)).toBeCloseTo(-3, 9)
    expect(Math.max(...ys)).toBeCloseTo(0, 9)
  })

  // Desktop ucs/d11-4, d11-5: never at a later prompt, nor at a command that
  // draws nothing.
  it("waits for the first point of a command that draws", () => {
    const later = box()
    answer(later, "LINE")
    later.click({ x: 30, y: -20, z: 0 })
    later.moveTo({ x: 4, y: 0, z: 6 })
    later.click({ x: 4, y: 0, z: 6 })
    later.enter()
    const line = newest(later)
    if (line.type !== "line") throw new Error("no line")
    expect(lineEndZ(line)).toBeCloseTo(0, 9)

    const move = box()
    answer(move, "MOVE", "L", "")
    move.moveTo({ x: 4, y: 0, z: 6 })
    expect(move.scene().primitives.length).toBe(
      move.moveTo({ x: 40, y: 40, z: 0 }).scene().primitives.length
    )
  })

  // F6 and the status bar's button, echoed as the desktop's English profile
  // does (ucs/d11); off, LINE's first point lies on the WCS's XY plane.
  it("is toggled by F6 and UCSDETECT", () => {
    const cad = box()
    cad.press("F6")
    expect(cad.commandLog().at(-1)).toBe(" <Dynamic UCS off>")
    expect(cad.state().dynamicUcsActive).toBe(false)
    answer(cad, "LINE")
    cad.moveTo({ x: 4, y: 0, z: 6 })
    cad.click({ x: 4, y: 0, z: 6 })
    cad.click({ x: 15, y: 0, z: 12 })
    cad.enter()
    const line = newest(cad)
    if (line.type !== "line") throw new Error("no line")
    expect(lineStartZ(line)).toBeCloseTo(0, 9)
    answer(cad, "UCSDETECT")
    expect(cad.state().commandLine.prompt).toBe(
      "UCSDETECT Enter new value for UCSDETECT <0>:"
    )
    answer(cad, "1")
    expect(cad.state().dynamicUcsActive).toBe(true)
    cad.press("F6")
    cad.press("F6")
    expect(cad.commandLog().slice(-2)).toEqual([
      " <Dynamic UCS off>",
      " <Dynamic UCS on>",
    ])
  })

  // A point held on a face keeps its plane whatever F6 does then; Escape
  // ends it with the command; a transparent command reads in the UCS.
  it("holds through F6, ends with Escape, and leaves a transparent command alone", () => {
    const cad = box()
    answer(cad, "LINE")
    cad.moveTo({ x: 4, y: 0, z: 6 })
    cad.click({ x: 4, y: 0, z: 6 })
    cad.press("F6")
    cad.click({ x: 15, y: 0, z: 12 })
    cad.escape()
    const line = newest(cad)
    if (line.type !== "line") throw new Error("no line")
    expect([line.start.y, line.end.y]).toEqual([
      expect.closeTo(0, 9),
      expect.closeTo(0, 9),
    ])
    cad.press("F6")

    answer(cad, "LINE")
    cad.moveTo({ x: 4, y: 0, z: 6 })
    answer(cad, "'DIST", "0,0,0", "10,0,0")
    expect(
      cad.commandLog().some((l) => l.startsWith("Distance = 10.00,"))
    ).toBe(true)
    cad.escape()
    // The next command, over nothing, is in the WCS.
    answer(cad, "LINE", "30,-20,0", "40,-20,0", "")
    const next = newest(cad)
    if (next.type !== "line") throw new Error("no line")
    expect(lineStartZ(next)).toBe(0)
  })

  // A point typed with the cursor never moved over a face is read in the
  // UCS, as the console's, which has no cursor; a curved face lays none.
  it("reads a typed point in the UCS, and passes a curved face over", () => {
    const cad = box()
    answer(cad, "LINE", "4,0,6", "4,0,0", "")
    const typed = newest(cad)
    if (typed.type !== "line") throw new Error("no line")
    expect(lineEndZ(typed)).toBe(0)

    const round = createHarness({ ucsIcon: true })
    answer(round, "CYLINDER", "0,0,0", "5", "10", "-VPOINT", "-1.3,-2.2,1.6")
    answer(round, "LINE")
    const before = round.scene().primitives.length
    round.moveTo({ x: 0, y: -5, z: 5 })
    expect(round.scene().primitives.length).toBe(before)
  })

  // The face's edges glow and the icon is drawn at the cursor on it (d11-1).
  it("lights the face and shows the icon on it", () => {
    const cad = createHarness({ ucsIcon: true })
    answer(cad, "BOX", "0,0,0", "10,10", "10", "-VPOINT", "-1.3,-2.2,1.6")
    answer(cad, "LINE")
    cad.moveTo({ x: 40, y: 40, z: 0 })
    const plain = cad.scene().primitives.length
    cad.moveTo({ x: 4, y: 0, z: 6 })
    const at = cad.toScreen({ x: 4, y: 0, z: 6 })
    const arms = cad
      .scene()
      .primitives.filter(
        (p) =>
          p.kind === "segment" && Math.hypot(p.a.x - at.x, p.a.y - at.y) < 0.5
      )
    expect(arms.length).toBeGreaterThanOrEqual(2)
  })

  it("echoes in Spanish", () => {
    const cad = createHarness({ locale: es })
    cad.press("F6")
    expect(cad.commandLog().at(-1)).toBe(" <SCP dinámico desactivado>")
  })
})
