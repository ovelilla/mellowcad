// LASTPOINT after each solid primitive, as AutoCAD 2027's console leaves it
// (probes primitives/p340–p349, p353, p356, p500: `(setvar "LASTPOINT"
// '(7 7 7))`, the run, `(getvar "LASTPOINT")`). Each case asserts AutoCAD's
// value.
import { describe, expect, it } from "vitest"
import { type CadHarness, createHarness } from "../../test/harness"

function answer(cad: CadHarness, ...texts: string[]): CadHarness {
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

/** The console's own: LUPREC 4, its cursor at the initial view's corner. */
function console(): CadHarness {
  const cad = createHarness()
  answer(cad, "LUPREC", "4")
  cad.moveTo({ x: 289.98397, y: 116.30379 })
  return cad
}

/** LASTPOINT after `run`, started from 7,7,7, as `ID @` reads it. */
function after(cad: CadHarness, ...run: string[]): number[] {
  answer(cad, "LASTPOINT", "7,7,7", ...run, "ID", "@")
  const line = cad.commandLog().at(-1)!
  return [...line.matchAll(/-?\d+\.\d+/g)].map((m) => Number(m[0]))
}

function near(actual: number[], expected: number[]) {
  expect(actual).toHaveLength(3)
  actual.forEach((v, i) => expect(v).toBeCloseTo(expected[i], 3))
}

type Case = readonly [string, readonly string[], readonly number[]]

function cases(probe: string, list: readonly Case[]) {
  describe(probe, () => {
    for (const [name, run, expected] of list) {
      it(name, () => near(after(console(), ...run), [...expected]))
    }
  })
}

cases("PYRAMID (p340, p349)", [
  [
    "typed radius and height: the centre",
    ["PYRAMID", "1,2,0", "5", "8"],
    [1, 2, 0],
  ],
  [
    "a radius point does not move it",
    ["PYRAMID", "1,2,0", "4,6,0", "8"],
    [1, 2, 0],
  ],
  [
    "a height point does not move it",
    ["PYRAMID", "1,2,0", "5", "3,3,9"],
    [1, 2, 0],
  ],
  [
    "Edge: the base's centre",
    ["PYRAMID", "E", "10,0,0", "20,0,0", "8"],
    [15, 5, 0],
  ],
  [
    "Axis endpoint: the endpoint",
    ["PYRAMID", "1,2,0", "5", "A", "1,2,10"],
    [1, 2, 10],
  ],
  [
    "2Point: its second point",
    ["PYRAMID", "1,2,0", "5", "2P", "0,0,1", "0,0,6"],
    [0, 0, 6],
  ],
  [
    "a top radius point does not move it",
    ["PYRAMID", "1,2,0", "5", "T", "3,2,0", "8"],
    [1, 2, 0],
  ],
])

cases("BOX and WEDGE (p341, p342, p356, p500)", [
  [
    "two corners: the other corner",
    ["BOX", "1,2,0", "11,12", "5"],
    [11, 12, 0],
  ],
  [
    "a height point does not move it",
    ["BOX", "1,2,0", "11,12", "3,3,9"],
    [11, 12, 0],
  ],
  [
    "Center, then a corner: the corner",
    ["BOX", "C", "1,2,0", "11,12", "5"],
    [11, 12, 0],
  ],
  [
    "Length and width typed: the footprint's far corner",
    ["BOX", "1,2,0", "L", "10", "6", "5"],
    [12.5059, 0.0987, 0],
  ],
  ["Cube typed: the first corner", ["BOX", "1,2,0", "C", "10"], [1, 2, 0]],
  [
    "Length by a point: the far corner",
    ["BOX", "1,2,0", "L", "4,6,0", "6", "5"],
    [8.8, 2.4, 0],
  ],
  [
    "2Point: its second point",
    ["BOX", "1,2,0", "11,12", "2P", "0,0,1", "0,0,6"],
    [0, 0, 6],
  ],
  [
    "width by a point: the far corner",
    ["BOX", "1,2,0", "L", "10", "3,9,0", "5"],
    [8.1754, 11.0471, 0],
  ],
  [
    "Cube by a point: the first corner",
    ["BOX", "1,2,0", "C", "4,6,0"],
    [1, 2, 0],
  ],
  [
    "WEDGE from its centre, Length by a point",
    ["WEDGE", "C", "1,2,0", "L", "4,6,0", "6", "5"],
    [6, 5, 0],
  ],
  [
    "BOX from its centre, Length typed: the corner at the centre's Z (p356)",
    ["BOX", "C", "1,2,0", "L", "10", "6", "5"],
    [6.7529, 1.0493, 0],
  ],
  [
    "BOX from its centre, a Cube: the centre (p356)",
    ["BOX", "C", "1,2,0", "C", "10"],
    [1, 2, 0],
  ],
  [
    "BOX from its centre, Length by a point: the far corner (p500)",
    ["BOX", "C", "1,2,0", "L", "4,6,0", "6", "5"],
    [6.4, 4.2, 0],
  ],
  [
    "WEDGE 2Point",
    ["WEDGE", "1,2,0", "11,12", "2P", "0,0,1", "0,0,6"],
    [0, 0, 6],
  ],
])

cases("CYLINDER (p343, p344, p353)", [
  [
    "typed radius and height: the centre",
    ["CYLINDER", "1,2,0", "5", "8"],
    [1, 2, 0],
  ],
  [
    "a radius point does not move it",
    ["CYLINDER", "1,2,0", "4,6,0", "8"],
    [1, 2, 0],
  ],
  [
    "Axis endpoint: the endpoint",
    ["CYLINDER", "1,2,0", "5", "A", "1,2,10"],
    [1, 2, 10],
  ],
  [
    "2Point: its second point",
    ["CYLINDER", "1,2,0", "5", "2P", "0,0,1", "0,0,6"],
    [0, 0, 6],
  ],
  [
    "a diameter point does not move it",
    ["CYLINDER", "1,2,0", "D", "4,6,0", "8"],
    [1, 2, 0],
  ],
  [
    "3P: the circle's centre",
    ["CYLINDER", "3P", "0,0,0", "10,0,0", "0,10,0", "8"],
    [5, 5, 0],
  ],
  [
    "2P: the circle's centre",
    ["CYLINDER", "2P", "0,0,0", "10,0,0", "8"],
    [5, 0, 0],
  ],
  [
    "Elliptical by its axis: the centre",
    ["CYLINDER", "E", "0,0,0", "10,0,0", "5,4,0", "8"],
    [5, 0, 0],
  ],
  [
    "Elliptical from its centre",
    ["CYLINDER", "E", "C", "0,0,0", "10,0,0", "4", "8"],
    [0, 0, 0],
  ],
])

cases("CONE (p346)", [
  ["typed: the centre", ["CONE", "1,2,0", "5", "8"], [1, 2, 0]],
  [
    "a top radius point does not move it",
    ["CONE", "1,2,0", "5", "T", "3,2,0", "8"],
    [1, 2, 0],
  ],
  [
    "Axis endpoint: the endpoint",
    ["CONE", "1,2,0", "5", "A", "1,2,10"],
    [1, 2, 10],
  ],
])

cases("SPHERE (p347, p353)", [
  ["typed: the centre", ["SPHERE", "1,2,0", "5"], [1, 2, 0]],
  ["a radius point does not move it", ["SPHERE", "1,2,0", "4,6,0"], [1, 2, 0]],
  [
    "3P: the third point",
    ["SPHERE", "3P", "0,0,0", "10,0,0", "0,10,0"],
    [0, 10, 0],
  ],
  ["2P: the second point", ["SPHERE", "2P", "0,0,0", "10,0,0"], [10, 0, 0]],
])

cases("TORUS (p348)", [
  // The tube's base: the ring's point towards the console's cursor.
  [
    "typed: the ring's point towards the cursor",
    ["TORUS", "1,2,0", "5", "1"],
    [5.6495, 3.8391, 0],
  ],
  ["a radius point: that point", ["TORUS", "1,2,0", "4,6,0", "1"], [4, 6, 0]],
  [
    "a tube point does not move it",
    ["TORUS", "1,2,0", "5", "4,6,0"],
    [5.6495, 3.8391, 0],
  ],
  [
    "the tube's 2Point: its second point",
    ["TORUS", "1,2,0", "5", "2P", "0,0,0", "0,0,2"],
    [0, 0, 2],
  ],
  [
    "3P: the third point",
    ["TORUS", "3P", "0,0,0", "10,0,0", "0,10,0", "1"],
    [0, 10, 0],
  ],
  ["2P: the second point", ["TORUS", "2P", "0,0,0", "10,0,0", "1"], [10, 0, 0]],
])
