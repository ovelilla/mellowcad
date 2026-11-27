import { describe, expect, it } from "vitest"

import { type CadHarness, createHarness } from "../../../test/harness"
import { es } from "../../locales/es"
import { THEME } from "../../scene/theme"

/** Typed at the command line and confirmed, as AutoCAD's prompt reads it. */
function answer(cad: CadHarness, ...texts: string[]): CadHarness {
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

/** The current UCS's origin and axes, as UCSORG, UCSXDIR and UCSYDIR. */
function axes(cad: CadHarness) {
  const { origin, xAxis, yAxis } = cad.runtime.document.getSettings().ucs
  const round = (v: { x: number; y: number; z: number }) =>
    [v.x, v.y, v.z].map((n) => +n.toFixed(4) + 0)
  return { origin: round(origin), x: round(xAxis), y: round(yAxis) }
}

/** `ID @`'s line: LASTPOINT read in the current UCS. */
function lastPoint(cad: CadHarness): string {
  answer(cad, "ID", "@")
  return cad.commandLog().at(-1)!
}

/** Whether the UCS icon is drawn with its origin at `point`: three arms leave it. */
function iconAt(cad: CadHarness, point: { x: number; y: number; z: number }) {
  const at = cad.toScreen(point)
  const arms = cad
    .scene()
    .primitives.filter(
      (p) =>
        p.kind === "segment" &&
        Math.hypot(p.a.x - at.x, p.a.y - at.y) < 0.5 &&
        p.stroke.color === THEME.ucsIcon
    )
  return arms.length === 3
}

const FACE = "Select face of solid, surface, or mesh:"
const OPTION = "Enter an option [Next/Xflip/Yflip] <accept>:"

/** The console's probes: a 10 box at the origin seen from (-1.3,-2.2,±1.6). */
function box(below = false): CadHarness {
  const cad = createHarness()
  cad.runtime.setDocumentPrecision(4)
  answer(cad, "BOX", "0,0,0", "10,10", "10", "-VPOINT")
  answer(cad, below ? "-1.3,-2.2,-1.6" : "-1.3,-2.2,1.6")
  return cad
}

/** UCS Face picked at `point` (typed), then the option prompt answered. */
function face(cad: CadHarness, point: string, ...options: string[]) {
  answer(cad, "UCS", "F", point, ...options, "")
  return axes(cad)
}

describe("UCS Face on a solid", () => {
  // probes ucs/p500, p501: the face the line of sight through the point
  // crosses first, its origin there, Z out of the solid.
  it("lays the UCS on the face picked, at the point", () => {
    const cad = box()
    answer(cad, "UCS", "F", "3,7,10")
    expect(cad.state().commandLine.prompt).toBe(`UCS ${OPTION}`)
    answer(cad, "")
    expect(axes(cad)).toEqual({
      origin: [3, 7, 10],
      x: [1, 0, 0],
      y: [0, 1, 0],
    })
    expect(cad.commandLog().slice(-2)).toEqual([`${FACE} 3,7,10`, OPTION])
    expect(cad.runtime.document.getSettings().ucsName).toBeNull()
    expect(face(box(), "5,0,5")).toEqual({
      origin: [5, 0, 5],
      x: [1, 0, 0],
      y: [0, 0, 1],
    })
  })

  // probe ucs/p502: a point on a face turned away is not on it; the line of
  // sight through it meets the front face first, where the UCS goes, while
  // LASTPOINT stays at the point typed (p514 the same from the bottom's).
  it("takes the face the line of sight meets first, LASTPOINT at the point", () => {
    const cad = box()
    expect(face(cad, "10,5,5")).toEqual({
      origin: [7.0455, 0, 8.6364],
      x: [1, 0, 0],
      y: [0, 0, 1],
    })
    expect(lastPoint(cad)).toBe(" X = 2.9545     Y = -3.6364     Z = -5.0000")
    expect(face(box(), "5,5,0").origin).toEqual([2.0455, 0, 3.6364])
  })

  // probes ucs/p503, p506, p521: Next is the next face the line of sight
  // crosses, round; p504, p505, p518: Xflip and Yflip turn it 180° about X or Y.
  it("walks the faces along the line of sight and flips the axes", () => {
    const back = { origin: [4.7727, 10, 7.8182], x: [1, 0, 0], y: [0, 0, -1] }
    expect(face(box(), "3,7,10", "N")).toEqual(back)
    expect(face(box(), "3,7,10", "N", "N", "N")).toEqual(back)
    expect(face(box(), "5,0,5", "N")).toEqual({
      origin: [9.0625, 6.875, 0],
      x: [0, -1, 0],
      y: [-1, 0, 0],
    })
    expect(face(box(), "3,7,10", "X")).toEqual({
      origin: [3, 7, 10],
      x: [1, 0, 0],
      y: [0, -1, 0],
    })
    expect(face(box(), "3,7,10", "Y")).toEqual({
      origin: [3, 7, 10],
      x: [-1, 0, 0],
      y: [0, 1, 0],
    })
    expect(face(box(), "3,7,10", "N", "X", "Y")).toEqual({
      origin: [4.7727, 10, 7.8182],
      x: [-1, 0, 0],
      y: [0, 0, 1],
    })
  })

  // probes ucs/p511, p512, p522, p523: on an edge or a vertex the face most
  // turned to the viewer, Next the edge's other face and back.
  it("takes an edge's faces in turn", () => {
    const front = { origin: [5, 0, 10], x: [1, 0, 0], y: [0, 0, 1] }
    expect(face(box(), "5,0,10")).toEqual(front)
    expect(face(box(), "5,0,10", "N")).toEqual({
      origin: [5, 0, 10],
      x: [1, 0, 0],
      y: [0, 1, 0],
    })
    expect(face(box(), "5,0,10", "N", "N")).toEqual(front)
    expect(face(box(), "10,0,10")).toEqual({
      origin: [10, 0, 10],
      x: [1, 0, 0],
      y: [0, 0, 1],
    })
  })

  // probes ucs/p524–p531: on a level face X runs along the edge nearest the
  // point, signed towards the WCS's +X, else its −Y; p552: the WCS's, in a
  // UCS turned 90° too.
  it("lays X along the nearest edge", () => {
    const alongY = { x: [0, -1, 0], y: [1, 0, 0] }
    const alongX = { x: [1, 0, 0], y: [0, 1, 0] }
    const top = (point: string) => {
      const { x, y } = face(box(), point)
      return { x, y }
    }
    expect(top("1,5,10")).toEqual(alongY)
    expect(top("9,5,10")).toEqual(alongY)
    expect(top("5,1,10")).toEqual(alongX)
    expect(top("5,9,10")).toEqual(alongX)
    // p549, p550: 3 off two edges, the first of the face's loop.
    expect(top("3,7,10")).toEqual(alongX)
    expect(top("7,3,10")).toEqual(alongY)
    const bottom = (point: string) => {
      const { x, y } = face(box(true), point)
      return { x, y }
    }
    expect(bottom("1,5,0")).toEqual({ x: [0, -1, 0], y: [-1, 0, 0] })
    expect(bottom("9,5,0")).toEqual({ x: [0, -1, 0], y: [-1, 0, 0] })
    expect(bottom("5,1,0")).toEqual({ x: [1, 0, 0], y: [0, -1, 0] })
    expect(bottom("5,9,0")).toEqual({ x: [1, 0, 0], y: [0, -1, 0] })
    const turned = box()
    answer(turned, "UCS", "Z", "90")
    expect(face(turned, "*1,5,10")).toEqual({
      origin: [1, 5, 10],
      x: [0, -1, 0],
      y: [1, 0, 0],
    })
  })

  // probes ucs/p532–p536, p545, p546, p543: by an upright edge X lies level
  // across the face (Z × its normal), whichever edge is nearest.
  it("lays X level by an upright edge", () => {
    const xy = (cad: CadHarness, point: string) => {
      const { x, y } = face(cad, point)
      return { x, y }
    }
    expect(xy(box(), "0,1,5")).toEqual({ x: [0, -1, 0], y: [0, 0, 1] })
    expect(xy(box(), "0,5,9")).toEqual({ x: [0, -1, 0], y: [0, 0, 1] })
    expect(xy(box(), "1,0,5")).toEqual({ x: [1, 0, 0], y: [0, 0, 1] })
    const right = () => {
      const cad = createHarness()
      answer(cad, "BOX", "0,0,0", "10,10", "10", "-VPOINT", "1.3,-2.2,1.6")
      return cad
    }
    expect(xy(right(), "10,5,5")).toEqual({ x: [0, 1, 0], y: [0, 0, 1] })
    expect(xy(right(), "10,9,5")).toEqual({ x: [0, 1, 0], y: [0, 0, 1] })
  })

  // probes ucs/p515, p542–p544: a wedge's slope and its triangular side,
  // whose sloped edge, signed downwards, is X near it.
  it("lays X down a sloped edge", () => {
    const wedge = () => {
      const cad = createHarness()
      answer(cad, "WEDGE", "0,0,0", "10,10", "10", "-VPOINT", "-1.3,-2.2,1.6")
      return cad
    }
    const s = Math.SQRT1_2
    const round = (n: number) => +n.toFixed(4)
    expect(face(wedge(), "5,5,5")).toEqual({
      origin: [5, 5, 5],
      x: [round(s), 0, round(-s)],
      y: [0, 1, 0],
    })
    expect(face(wedge(), "4,0,5.5")).toEqual({
      origin: [4, 0, 5.5],
      x: [round(s), 0, round(-s)],
      y: [round(s), 0, round(s)],
    })
    expect(face(wedge(), "0.5,0,4").x).toEqual([1, 0, 0])
    expect(face(wedge(), "4,0,0.5").x).toEqual([1, 0, 0])
  })

  // probes ucs/p508, p509, p516, p540, p541: a curved face's normal at the
  // point, X level; a cap with no straight edge the WCS's X. A sphere's line
  // of sight crosses no other face: no Next, its default worded apart, and
  // Next typed there asks again (p554).
  it("lays the UCS on curved faces", () => {
    const solid = (...made: string[]) => {
      const cad = createHarness()
      cad.runtime.setDocumentPrecision(4)
      answer(cad, ...made, "-VPOINT", "-1.3,-2.2,1.6")
      return cad
    }
    expect(face(solid("CYLINDER", "0,0,0", "5", "10"), "0,-5,5")).toEqual({
      origin: [0, -5, 5],
      x: [1, 0, 0],
      y: [0, 0, 1],
    })
    expect(face(solid("CYLINDER", "0,0,0", "5", "10"), "3,0,10")).toEqual({
      origin: [3, 0, 10],
      x: [1, 0, 0],
      y: [0, 1, 0],
    })
    expect(face(solid("CONE", "0,0,0", "5", "10"), "0,-2.5,5")).toEqual({
      origin: [0, -2.5, 5],
      x: [1, 0, 0],
      y: [0, 0.4472, 0.8944],
    })
    // A cap made in a turned UCS, its normal off Z by rounding: still level.
    const turned = solid("UCS", "X", "180", "CYLINDER", "0,0,0", "5", "10")
    answer(turned, "UCS", "W")
    expect(face(turned, "*3,0,0")).toEqual({
      origin: [3, 0, 0],
      x: [1, 0, 0],
      y: [0, 1, 0],
    })
    const sphere = solid("SPHERE", "0,0,0", "5")
    answer(sphere, "UCS", "F", "0,-5,0")
    const flip = "Enter an option [Xflip/Yflip] <accept>:"
    expect(sphere.state().commandLine.prompt).toBe(`UCS ${flip}`)
    answer(sphere, "N")
    expect(sphere.commandLog().at(-1)).toBe(`${flip} N`)
    expect(sphere.state().commandLine.prompt).toBe(`UCS ${flip}`)
    answer(sphere, "")
    expect(axes(sphere)).toEqual({
      origin: [0, -5, 0],
      x: [1, 0, 0],
      y: [0, 0, 1],
    })
  })

  // probes ucs/p510, p507, p517: in plan the top face; FOO is refused; U
  // puts the WCS back, naming UCS.
  it("picks in plan, refuses a word and is one step", () => {
    const cad = createHarness()
    cad.runtime.setDocumentPrecision(4)
    answer(cad, "BOX", "0,0,0", "10,10", "10")
    expect(face(cad, "3,7")).toEqual({
      origin: [3, 7, 10],
      x: [1, 0, 0],
      y: [0, 1, 0],
    })
    expect(lastPoint(cad)).toBe(" X = 0.0000     Y = 0.0000     Z = -10.0000")
    const refused = box()
    answer(refused, "UCS", "F", "3,7,10", "FOO")
    expect(refused.commandLog().slice(-2)).toEqual([
      `${OPTION} FOO`,
      "Invalid option keyword.",
    ])
    answer(refused, "", "U")
    expect(refused.commandLog().at(-1)).toBe("UCS")
    expect(axes(refused).origin).toEqual([0, 0, 0])
  })

  // Desktop ucs/d10: X is laid as the cursor comes onto the face, by the edge
  // nearest it then, and kept while it stays there; the face glows and the
  // UCS icon shows the UCS at the cursor.
  it("keeps the X the cursor came onto the face with", () => {
    const cad = createHarness({ ucsIcon: true })
    answer(cad, "BOX", "0,0,0", "10,10", "10", "-VPOINT", "-1.3,-2.2,1.6")
    answer(cad, "UCS", "F")
    cad.moveTo({ x: 5, y: 9, z: 10 })
    cad.moveTo({ x: 0.7, y: 4.8, z: 10 })
    cad.click({ x: 0.7, y: 4.8, z: 10 })
    answer(cad, "")
    expect(axes(cad)).toEqual({
      origin: [0.7, 4.8, 10],
      x: [1, 0, 0],
      y: [0, 1, 0],
    })
    answer(cad, "UCS", "W", "UCS", "F")
    cad.moveTo({ x: 0.7, y: 4.8, z: 10 })
    cad.moveTo({ x: 5.3, y: 0.5, z: 10 })
    expect(iconAt(cad, { x: 5.3, y: 0.5, z: 10 })).toBe(true)
    cad.click({ x: 5.3, y: 0.5, z: 10 })
    // Once picked the icon stays on the face.
    cad.moveTo({ x: 40, y: 40, z: 0 })
    expect(iconAt(cad, { x: 5.3, y: 0.5, z: 10 })).toBe(true)
    answer(cad, "")
    expect(axes(cad).x).toEqual([0, -1, 0])
  })

  // A typed point is a face entered there, whatever the cursor came by (the
  // console's: p524); off the solids the icon is the current UCS's.
  it("reads a typed point as the console does, and glows the face", () => {
    const cad = createHarness({ ucsIcon: true })
    answer(cad, "BOX", "0,0,0", "10,10", "10", "-VPOINT", "-1.3,-2.2,1.6")
    answer(cad, "UCS", "F")
    cad.moveTo({ x: 30, y: 30, z: 0 })
    expect(iconAt(cad, { x: 30, y: 30, z: 0 })).toBe(false)
    const plain = cad.scene().primitives.length
    cad.moveTo({ x: 5, y: 9, z: 10 })
    // The face's four edges glow, and the icon is drawn there.
    expect(cad.scene().primitives.length).toBeGreaterThan(plain)
    expect(iconAt(cad, { x: 5, y: 9, z: 10 })).toBe(true)
    answer(cad, "1,5,10", "")
    expect(axes(cad).x).toEqual([0, -1, 0])
  })

  it("comes round to the axes picked, and Escape leaves the UCS", () => {
    const cad = createHarness()
    answer(cad, "BOX", "0,0,0", "10,10", "10", "-VPOINT", "-1.3,-2.2,1.6")
    answer(cad, "UCS", "F")
    cad.moveTo({ x: 5, y: 9, z: 10 })
    cad.click({ x: 0.7, y: 4.8, z: 10 })
    answer(cad, "N", "N", "")
    expect(axes(cad).x).toEqual([1, 0, 0])
    const before = cad.runtime.document.getSettings()
    answer(cad, "UCS", "F", "3,7,10")
    cad.escape()
    expect(cad.runtime.document.getSettings().ucs).toBe(before.ucs)
    // A solid there but not under the point: none found.
    answer(cad, "UCS", "F", "30,30,0")
    expect(cad.commandLog().at(-1)).toBe(
      "No 3D solid, surface or mesh detected."
    )
  })

  it("asks in Spanish", () => {
    const cad = createHarness({ locale: es })
    answer(
      cad,
      "PRISMARECT",
      "0,0,0",
      "10,10",
      "10",
      "-PTOVISTA",
      "-1.3,-2.2,1.6"
    )
    answer(cad, "SCP", "C", "3,7,10")
    expect(cad.state().commandLine.prompt).toBe(
      "SCP Indique una opción [Siguiente/volverX/volverY] <aceptar>:"
    )
    answer(cad, "X", "")
    expect(axes(cad).y).toEqual([0, -1, 0])
  })
})
