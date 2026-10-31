import { describe, expect, it } from "vitest"
import type { Vec3 } from "../../geometry/Vec3"
import {
  createLine,
  lineEndZ,
  lineStartZ,
  type Entity,
} from "../../domain/entities"
import { createHarness, type CadHarness } from "../../../test/harness"
import { lineOf, p } from "../../../test/builders"

/**
 * Object snaps on objects off the work plane, each case a console probe of
 * AutoCAD 2027 (scripts/research/probes/interaction3d/): a point typed under
 * an override is found where it is drawn, as a pick there is.
 */

function line3(a: Vec3, b: Vec3, id?: string): Entity {
  return createLine(a, b, "0", id)
}

/** The drawing, in AutoCAD's SE isometric view, zoomed to its extents. */
function seIsometric(entities: readonly Entity[]): CadHarness {
  const cad = createHarness({ entities })
  answer(cad, "-VIEW", "_SEISO", "ZOOM", "E")
  return cad
}

function plan(entities: readonly Entity[]): CadHarness {
  const cad = createHarness({ entities })
  answer(cad, "ZOOM", "E")
  return cad
}

/** Each answer typed at the command line and confirmed, as the console types it. */
function answer(cad: CadHarness, ...texts: string[]): CadHarness {
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

/** LINE's first segment drawn with `answers`, its two ends in space. */
function drawn(cad: CadHarness, ...answers: string[]): Vec3[] {
  const before = cad.entities().length
  answer(cad, "LINE", ...answers, "")
  expect(cad.entities()).toHaveLength(before + 1)
  const line = cad.latest()
  if (line.type !== "line") throw new Error(`expected a line, got ${line.type}`)
  return [
    { ...line.start, z: lineStartZ(line) },
    { ...line.end, z: lineEndZ(line) },
  ]
}

function expectAt(actual: Vec3, expected: Vec3) {
  expect(actual.x).toBeCloseTo(expected.x, 6)
  expect(actual.y).toBeCloseTo(expected.y, 6)
  expect(actual.z).toBeCloseTo(expected.z, 6)
}

const VERTICAL = line3({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 50 }, "V")

describe("a vertical line, a point in plan", () => {
  it("gives its top end where the top is drawn (i01)", () => {
    const others = [lineOf(p(50, 50), p(80, 50))]
    const cad = seIsometric([VERTICAL, ...others])
    expectAt(drawn(cad, "_END", "0,0,50", "@10,0,0")[0], { x: 0, y: 0, z: 50 })
    // -50,50,0 is drawn where the top is in SEISO: on its line of sight.
    expectAt(drawn(cad, "_END", "-50,50,0", "@10,0,0")[0], {
      x: 0,
      y: 0,
      z: 50,
    })
  })

  it("gives its middle and the point under the cursor (i01)", () => {
    const cad = seIsometric([VERTICAL, lineOf(p(50, 50), p(80, 50))])
    expectAt(drawn(cad, "_MID", "-25,25,0", "@10,0,0")[0], {
      x: 0,
      y: 0,
      z: 25,
    })
    expectAt(drawn(cad, "_NEA", "-40,40,0", "@10,0,0")[0], {
      x: 0,
      y: 0,
      z: 40,
    })
  })

  it("is snapped to by the running Endpoint under the mouse", () => {
    const cad = seIsometric([VERTICAL, lineOf(p(50, 50), p(80, 50))])
    cad.runtime.snapping.setActive(true)
    cad.command("LINE").click({ x: 0, y: 0, z: 50 })
    cad.click({ x: 60, y: 60, z: 0 }).escape()
    const line = cad.latest()
    if (line.type !== "line") throw new Error("expected a line")
    expectAt({ ...line.start, z: lineStartZ(line) }, { x: 0, y: 0, z: 50 })
  })

  it("gives its start in plan, where both ends are one point (i06)", () => {
    const cad = plan([VERTICAL, lineOf(p(-50, 0), p(50, 0))])
    expectAt(drawn(cad, "_END", "0,0", "@10,0,0")[0], { x: 0, y: 0, z: 0 })
  })

  it("meets a level line at that line's height (i14)", () => {
    const level = line3({ x: -50, y: 0, z: 25 }, { x: 50, y: 0, z: 25 })
    const cad = seIsometric([VERTICAL, level])
    expectAt(drawn(cad, "_INT", "0,0,25", "@10,0,0")[0], {
      x: 0,
      y: 0,
      z: 25,
    })
  })

  it("takes a perpendicular from a point beside it at that point's height (i08, i14)", () => {
    const level = line3({ x: -50, y: 0, z: 25 }, { x: 50, y: 0, z: 25 })
    const cad = seIsometric([VERTICAL, level])
    expectAt(drawn(cad, "80,0,25", "_PER", "-25,25,0")[1], {
      x: 0,
      y: 0,
      z: 25,
    })
  })

  it("is a 3D polyline's segment too: its middle (i07)", () => {
    const cad = createHarness()
    answer(cad, "3DPOLY", "0,0,0", "0,0,40", "30,0,40", "")
    answer(cad, "-VIEW", "_SEISO", "ZOOM", "E")
    expectAt(drawn(cad, "_END", "-40,40,0", "@10,0,0")[0], {
      x: 0,
      y: 0,
      z: 40,
    })
    expectAt(drawn(cad, "_MID", "-20,20,0", "@10,0,0")[0], {
      x: 0,
      y: 0,
      z: 20,
    })
  })
})

describe("Perpendicular in space", () => {
  const SLOPED = line3({ x: 0, y: 10, z: 0 }, { x: 100, y: 10, z: 100 })

  it("gives the foot in space on a sloped line, in plan and in SEISO (i04)", () => {
    for (const cad of [plan([SLOPED]), seIsometric([SLOPED])]) {
      expectAt(drawn(cad, "0,0,50", "_PER", "50,10,50")[1], {
        x: 25,
        y: 10,
        z: 25,
      })
    }
  })
})

describe("Apparent Intersection of two lines at different heights", () => {
  const LOW = line3({ x: 0, y: -50, z: 0 }, { x: 0, y: 50, z: 0 })
  const HIGH = line3({ x: -50, y: 0, z: 30 }, { x: 50, y: 0, z: 30 })

  it("is at the newer one's height in plan (i02, i03)", () => {
    expect(drawn(plan([LOW, HIGH]), "_APP", "0,0", "@10,0,0")[0].z).toBe(30)
    expect(drawn(plan([HIGH, LOW]), "_APP", "0,0", "@10,0,0")[0].z).toBe(0)
  })

  it("is on the older one in SEISO (i12, i13)", () => {
    expectAt(drawn(seIsometric([LOW, HIGH]), "_APP", "0,30,0", "@10,0,0")[0], {
      x: 0,
      y: 30,
      z: 0,
    })
    expectAt(drawn(seIsometric([HIGH, LOW]), "_APP", "0,30,0", "@10,0,0")[0], {
      x: 30,
      y: 0,
      z: 30,
    })
  })

  it("is no Intersection: they do not meet (i02)", () => {
    const cad = plan([LOW, HIGH])
    answer(cad, "LINE", "_INT", "0,0")
    expect(cad.commandLog()).toContain(
      "No Intersection found for specified point."
    )
  })
})

describe("Quadrant of a circle oblique to the UCS", () => {
  it("finds none (i09)", () => {
    const cad = createHarness()
    answer(cad, "UCS", "_X", "90", "CIRCLE", "0,0", "20", "UCS", "_W")
    answer(cad, "-VIEW", "_SEISO", "ZOOM", "E")
    answer(cad, "LINE", "_QUA", "0,0,20")
    expect(cad.commandLog()).toContain("No Quadrant found for specified point.")
    answer(cad, "_CEN", "20,0,0", "@10,0,0", "")
    const line = cad.latest()
    if (line.type !== "line") throw new Error("expected a line")
    expectAt({ ...line.start, z: lineStartZ(line) }, { x: 0, y: 0, z: 0 })
  })
})
