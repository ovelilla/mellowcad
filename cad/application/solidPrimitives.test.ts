import { describe, expect, it } from "vitest"

import { type CadHarness, createHarness } from "../../test/harness"
import type { Vec3 } from "../geometry/Vec3"
import { brepArea, brepIsClosed, brepVolume } from "../geometry/solids"
import {
  lineStartZ,
  type RegionEntity,
  type Solid3dEntity,
} from "../domain/entities"
import {
  parseDrawingFile,
  serializeDrawing,
} from "../serialization/drawingFile"
import { snapshotOf } from "../../test/builders"
import { es } from "../locales/es"
import { ptBR } from "../locales/pt-BR"

/** Each answer typed at the command line and confirmed, as the console types it. */
function answer(cad: CadHarness, ...texts: string[]): CadHarness {
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

/** The lines `texts` add to the history. */
function written(cad: CadHarness, ...texts: string[]): string[] {
  const from = cad.commandLog().length
  answer(cad, ...texts)
  return cad.commandLog().slice(from)
}

const solids = (cad: CadHarness) =>
  cad.entities().filter((e): e is Solid3dEntity => e.type === "solid3d")

const last = (cad: CadHarness) => solids(cad).at(-1)!

/** The console's own: LUPREC 4, its cursor at the initial view's corner. */
function console(locale?: typeof es): CadHarness {
  const cad = createHarness(locale ? { locale } : {})
  answer(cad, "LUPREC", "4")
  cad.moveTo({ x: 289.98397, y: 116.30379 })
  return cad
}

/** LIST of the last object, from its Solid type line on. */
function listed(cad: CadHarness): string[] {
  return written(cad, "_LIST", "_L", "")
    .slice(4)
    .flatMap((line) => line.split("\n"))
    .slice(4)
}

/** LIST of every object, newest first, each from its Solid type line on. */
function listedAll(cad: CadHarness): string[][] {
  const lines = written(cad, "_LIST", "_ALL", "")
    .slice(4)
    .flatMap((line) => line.split("\n"))
  const out: string[][] = []
  for (const line of lines) {
    if (line.includes("3DSOLID")) out.push([])
    else out.at(-1)?.push(line)
  }
  return out.map((block) => block.slice(3))
}

function expectAt(actual: Vec3, expected: Vec3, digits = 5) {
  expect(actual.x).toBeCloseTo(expected.x, digits)
  expect(actual.y).toBeCloseTo(expected.y, digits)
  expect(actual.z).toBeCloseTo(expected.z, digits)
}

/** The vertices of a solid's edges, start and end, as MPDUMP prints them. */
function edgeEnds(solid: Solid3dEntity): number[][][] {
  const { vertices, edges } = solid.brep
  const at = (i: number) =>
    [vertices[i].x, vertices[i].y, vertices[i].z].map(
      (v) => Math.round(v * 1e4) / 1e4 + 0
    )
  return edges.map((e) => [at(e.start), at(e.end)])
}

describe("WEDGE", () => {
  it("asks BOX's prompts and makes a wedge, its slope down from the first corner (solid/w01)", () => {
    const cad = console()
    expect(written(cad, "WEDGE", "0,0,0", "10,20", "5")).toEqual([
      "WEDGE",
      "Specify first corner or [Center]: 0,0,0",
      "Specify other corner or [Cube/Length]: 10,20",
      "Specify height or [2Point]: 5",
    ])
    expect(listed(cad)).toEqual([
      "      Solid type = Wedge",
      "         Position, X = 5.0000    Y = 10.0000   Z = 0.0000",
      "           Length: 10.0000",
      "            Width: 20.0000",
      "           Height: 5.0000",
      "         Rotation: 0",
    ])
    const wedge = last(cad)
    expect(brepIsClosed(wedge.brep)).toBe(true)
    expect(brepVolume(wedge.brep)).toBeCloseTo(500, 9)
    // ACIS's edges, in its order and sense (w01's MPDUMP).
    expect(edgeEnds(wedge)).toEqual([
      [
        [10, 20, 0],
        [0, 20, 5],
      ],
      [
        [10, 0, 0],
        [10, 20, 0],
      ],
      [
        [0, 20, 5],
        [0, 20, 0],
      ],
      [
        [0, 0, 5],
        [0, 20, 5],
      ],
      [
        [0, 20, 0],
        [10, 20, 0],
      ],
      [
        [0, 0, 0],
        [0, 20, 0],
      ],
      [
        [0, 0, 0],
        [10, 0, 0],
      ],
      [
        [10, 0, 0],
        [0, 0, 5],
      ],
      [
        [0, 0, 5],
        [0, 0, 0],
      ],
    ])
    expect(written(cad, "AREA", "O", "L").at(-1)).toBe(
      "Area = 573.6068, Perimeter = 0.0000"
    )
  })

  it("centres, cubes and lengthens along the UCS's X, sharing BOX's defaults (w02, w08)", () => {
    const cad = console()
    answer(cad, "WEDGE", "C", "0,0,0", "10,20", "5")
    expect(listed(cad).slice(1, 3)).toEqual([
      "         Position, X = 0.0000    Y = 0.0000    Z = -2.5000",
      "           Length: 20.0000",
    ])
    answer(cad, "WEDGE", "50,0,0", "C", "8")
    expect(listed(cad)).toEqual([
      "      Solid type = Wedge",
      "         Position, X = 54.0000   Y = 4.0000    Z = 0.0000",
      "           Length: 8.0000",
      "            Width: 8.0000",
      "           Height: 8.0000",
      "         Rotation: 0",
    ])
    expect(written(cad, "WEDGE", "100,0,0", "L", "10", "6", "")).toEqual([
      "WEDGE",
      "Specify first corner or [Center]: 100,0,0",
      "Specify other corner or [Cube/Length]: L",
      "Specify length <8.0000>: 10",
      "Specify width: 6",
      "Specify height or [2Point] <8.0000>:",
    ])
    expect(listed(cad)[1]).toBe(
      "         Position, X = 105.0000  Y = 3.0000    Z = 0.0000"
    )
    // BOX and WEDGE share a height (w02).
    expect(written(cad, "BOX", "200,0,0", "210,10", "3")[3]).toBe(
      "Specify height or [2Point] <8.0000>: 3"
    )
    expect(written(cad, "WEDGE", "300,0,0", "310,10", "")[3]).toBe(
      "Specify height or [2Point] <3.0000>:"
    )
    answer(cad, "WEDGE", "400,0,0", "410,10,-4")
    expect(listed(cad).slice(1, 3)).toEqual([
      "         Position, X = 405.0000  Y = 5.0000    Z = 0.0000",
      "           Normal: X = 0.0000    Y = 0.0000    Z = -1.0000",
    ])
    // A point gives the length, along X all the same (w08).
    answer(cad, "WEDGE", "500,0,0", "L", "510,10", "6", "4")
    expect(listed(cad).slice(1)).toEqual([
      "         Position, X = 507.0711  Y = 3.0000    Z = 0.0000",
      "           Length: 14.1421",
      "            Width: 6.0000",
      "           Height: 4.0000",
      "         Rotation: 0",
    ])
    expect(
      written(cad, "WEDGE", "600,0,0", "L", "-10", "-6", "4").slice(3, 5)
    ).toEqual(["Specify length <14.1421>: -10", "Specify width <6.0000>: -6"])
    expect(listed(cad).slice(1)).toEqual([
      "         Position, X = 595.0000  Y = -3.0000   Z = 0.0000",
      "           Length: 10.0000",
      "            Width: 6.0000",
      "           Height: 4.0000",
      "         Rotation: 180",
    ])
    answer(cad, "WEDGE", "700,0,0", "L", "10", "710,-10", "4")
    expect(listed(cad)[1]).toBe(
      "         Position, X = 705.0000  Y = 5.0000    Z = 0.0000"
    )
    // Its tall end is at the first corner (w08), or opposite the corner
    // given from its centre (w09).
    answer(cad, "WEDGE", "800,0,0", "790,-20", "5")
    expect(listed(cad).at(-1)).toBe("         Rotation: 180")
    // A negative cube is wide back along the UCS's Y too (v04).
    answer(cad, "WEDGE", "1000,0,0", "C", "-8")
    expect(listed(cad)[1]).toBe(
      "         Position, X = 996.0000  Y = -4.0000   Z = 0.0000"
    )
    answer(cad, "WEDGE", "C", "900,0,0", "890,-20", "5")
    const tall = last(cad).brep.vertices.filter((p) => p.z > 0)
    expect(tall.map((p) => p.x)).toEqual([910, 910])
  })

  it("measures a width or a cube's point in space, from the length's end or the corner (primitives/p124, p125)", () => {
    const cad = console()
    answer(cad, "WEDGE", "300,0,0", "_L", "10", "300,6", "4")
    expect(listed(cad)[3]).toBe("            Width: 11.6619")
    answer(cad, "WEDGE", "400,0,0", "_L", "410,10", "@0,6", "4")
    expect(listed(cad)[3]).toBe("            Width: 6.0000")
    answer(cad, "WEDGE", "200,0,0", "_L", "10", "210,6,8", "4")
    expect(listed(cad)[3]).toBe("            Width: 10.0000")
    answer(cad, "WEDGE", "0,0,0", "_C", "0,30,8")
    expect(listed(cad)[2]).toBe("           Length: 31.0483")
  })

  it("from its centre, Length by a point is twice its distance, unturned (p356)", () => {
    const cad = console()
    answer(cad, "_WEDGE", "_C", "1,2,0", "_L", "4,6,0", "6", "5")
    expect(listed(cad).slice(1)).toEqual([
      "         Position, X = 1.0000    Y = 2.0000    Z = -2.5000",
      "           Length: 10.0000",
      "            Width: 6.0000",
      "           Height: 5.0000",
      "         Rotation: 0",
    ])
  })

  it("refuses as BOX does, in its own words, and Enter at the width too (w03, w04)", () => {
    const cad = console()
    expect(
      written(cad, "WEDGE", "FOO", "", "0,0,0", "FOO", "0,0", "10,0", "10,20")
    ).toEqual([
      "WEDGE",
      "Specify first corner or [Center]: FOO",
      "Point or option keyword required.",
      "Specify first corner or [Center]:",
      "Point or option keyword required.",
      "Specify first corner or [Center]: 0,0,0",
      "Specify other corner or [Cube/Length]: FOO",
      "Point or option keyword required.",
      "Specify other corner or [Cube/Length]: 0,0",
      "Wedge of zero length not permitted.",
      "Specify other corner or [Cube/Length]: 10,0",
      "Wedge of zero width not permitted.",
      "Specify other corner or [Cube/Length]: 10,20",
    ])
    expect(written(cad, "FOO", "", "0", "-5")).toEqual([
      "Specify height or [2Point]: FOO",
      "Requires numeric distance, second point, or option keyword.",
      "Specify height or [2Point]:",
      "Requires numeric distance, second point, or option keyword.",
      "Specify height or [2Point]: 0",
      "Value must be nonzero.",
      "Specify height or [2Point]: -5",
    ])
    expect(listed(cad)[2]).toBe(
      "           Normal: X = 0.0000    Y = 0.0000    Z = -1.0000"
    )
    answer(cad, "WEDGE", "C", "200,0,0", "C", "0", "FOO", "-8")
    // From the centre a negative cube is twice as long (w04, w09).
    expect(listed(cad).slice(1)).toEqual([
      "         Position, X = 200.0000  Y = 0.0000    Z = -8.0000",
      "           Length: 16.0000",
      "            Width: 16.0000",
      "           Height: 16.0000",
      "         Rotation: 180",
    ])
    expect(
      written(cad, "WEDGE", "300,0,0", "L", "0", "10", "0", "FOO", "", "6", "7")
    ).toEqual([
      "WEDGE",
      "Specify first corner or [Center]: 300,0,0",
      "Specify other corner or [Cube/Length]: L",
      "Specify length <16.0000>: 0",
      "Wedge of zero length not permitted.",
      "Specify length <16.0000>: 10",
      "Specify width: 0",
      "Wedge of zero width not permitted.",
      "Specify width: FOO",
      "Requires numeric distance, second point, or option keyword.",
      "Specify width:",
      "Wedge of zero width not permitted.",
      "Specify width: 6",
      "Specify height or [2Point] <16.0000>: 7",
    ])
  })

  it("lies in the UCS and at its Z, LIST reading it there (w05)", () => {
    const cad = console()
    answer(cad, "UCS", "X", "30", "WEDGE", "0,0,0", "10,20", "5")
    expect(listed(cad)[1]).toBe(
      "         Position, X = 5.0000    Y = 10.0000   Z = 0.0000"
    )
    answer(cad, "UCS", "W", "UCS", "Z", "30", "WEDGE", "50,0,3", "60,20", "5")
    answer(cad, "UCS", "W")
    expect(listedAll(cad)).toEqual([
      [
        "      Solid type = Wedge",
        "         Position, X = 42.6314   Y = 36.1603   Z = 3.0000",
        "           Length: 10.0000",
        "            Width: 20.0000",
        "           Height: 5.0000",
        "         Rotation: 30",
      ],
      [
        "      Solid type = Wedge",
        "         Position, X = 5.0000    Y = 8.6603    Z = 5.0000",
        "           Normal: X = 0.0000    Y = -0.5000   Z = 0.8660",
        "           Length: 10.0000",
        "            Width: 20.0000",
        "           Height: 5.0000",
        "         Rotation: 0",
      ],
    ])
  })

  it("moves, turns, mirrors and scales as a wedge (w06)", () => {
    const cad = console()
    answer(cad, "WEDGE", "0,0,0", "10,20", "5")
    answer(
      cad,
      "MOVE",
      "L",
      "",
      "0,0,0",
      "5,5,3",
      "ROTATE",
      "L",
      "",
      "0,0",
      "30"
    )
    expect(listed(cad)[1]).toBe(
      "         Position, X = 1.1603    Y = 17.9904   Z = 3.0000"
    )
    answer(cad, "MIRROR", "L", "", "0,40", "10,40", "N")
    expect(listed(cad).at(-1)).toBe("         Rotation: 330")
    answer(cad, "MIRROR", "L", "", "0,0", "0,10", "Y")
    expect(listed(cad).at(-1)).toBe("         Rotation: 210")
    answer(cad, "SCALE", "L", "", "0,0", "2")
    expect(listed(cad).slice(1)).toEqual([
      "         Position, X = -2.3205   Y = 124.0192  Z = 6.0000",
      "           Length: 20.0000",
      "            Width: 40.0000",
      "           Height: 10.0000",
      "         Rotation: 210",
    ])
    for (const solid of solids(cad)) expect(brepIsClosed(solid.brep)).toBe(true)
    expect(brepVolume(last(cad).brep)).toBeCloseTo(4000, 6)
  })

  it("explodes into a region of each face (w07)", () => {
    const cad = console()
    answer(cad, "WEDGE", "0,0,0", "10,20", "5", "EXPLODE", "L", "")
    const regions = cad
      .entities()
      .filter((e): e is RegionEntity => e.type === "region")
    expect(regions).toHaveLength(5)
  })

  it("asks in each language, by its own name (n02)", () => {
    const spanish = console(es)
    expect(written(spanish, "CUÑA", "0,0", "0,0")).toEqual([
      "CUÑA",
      "Precise primera esquina o [Centro]: 0,0",
      "Precise otra esquina o [Cubo/Longitud]: 0,0",
      "No puede ser un Cuña de longitud cero.",
    ])
    answer(spanish, "10,20", "5")
    expect(listed(spanish)[0]).toBe("    Tipo de sólido = Cuña")
    // es acad.pgp's `CU, *CUÑA` (primitives/p100).
    expect(written(spanish, "CU", "0,0,0", "10,20", "5")[0]).toBe("CU CUÑA")
    expect(listed(spanish)[0]).toBe("    Tipo de sólido = Cuña")
    const portuguese = console(ptBR)
    expect(written(portuguese, "CN", "0,0", "10,0")[3]).toBe(
      "Não é permitida uma Cunha de largura zero."
    )
  })
})

describe("PYRAMID", () => {
  it("says its sides and Type, and turns its base towards the cursor (solid/y01)", () => {
    const cad = console()
    expect(written(cad, "PYRAMID", "0,0,0", "5", "8")).toEqual([
      "PYRAMID",
      " 4 sides  Circumscribed",
      "Specify center point of base or [Edge/Sides]: 0,0,0",
      "Specify base radius or [Inscribed]: 5",
      "Specify height or [2Point/Axis endpoint/Top radius]: 8",
    ])
    expect(listed(cad)).toEqual([
      "      Solid type = Pyramid",
      "         Position, X = 0.0000    Y = 0.0000    Z = 0.0000",
      "    Inscribed base radius: 7.0711",
      "Circumscribed base radius: 5.0000",
      "     Inscribed top radius: 0.0000",
      " Circumscribed top radius: 0.0000",
      "           Height: 8.0000",
      "         Rotation: 22",
      "  Number of sides: 4",
    ])
    const pyramid = last(cad)
    expect(brepIsClosed(pyramid.brep)).toBe(true)
    expect(brepVolume(pyramid.brep)).toBeCloseTo(800 / 3, 9)
    expect(brepArea(pyramid.brep)).toBeCloseTo(288.679623, 6)
    // A corner half a side round from the cursor's heading (y01's MPDUMP).
    expect(
      pyramid.brep.vertices.some(
        (p) =>
          Math.abs(p.x - 2.779438) < 1e-6 && Math.abs(p.y - 6.501902) < 1e-6
      )
    ).toBe(true)
  })

  it("takes Sides, Inscribed, Edge, Top radius, Axis endpoint and 2Point (y02)", () => {
    const cad = console()
    expect(
      written(cad, "PYRAMID", "S", "6", "50,0,0", "I", "5", "8").slice(1)
    ).toEqual([
      " 4 sides  Circumscribed",
      "Specify center point of base or [Edge/Sides]: S",
      "Enter number of sides <4>: 6",
      "Specify center point of base or [Edge/Sides]: 50,0,0",
      "Specify base radius or [Inscribed]: I",
      "Specify base radius or [Circumscribed]: 5",
      "Specify height or [2Point/Axis endpoint/Top radius]: 8",
    ])
    expect(listed(cad).slice(2, 4)).toEqual([
      "    Inscribed base radius: 5.0000",
      "Circumscribed base radius: 4.3301",
    ])
    expect(listed(cad)[7]).toBe("         Rotation: 56")
    expect(
      written(cad, "PYRAMID", "E", "100,0,0", "110,0", "T", "3", "6").slice(1)
    ).toEqual([
      " 6 sides  Inscribed",
      "Specify center point of base or [Edge/Sides]: E",
      "Specify first endpoint of edge: 100,0,0",
      "Specify second endpoint of edge: 110,0",
      "Specify height or [2Point/Axis endpoint/Top radius] <8.0000>: T",
      "Specify top radius <0.0000>: 3",
      "Specify height or [2Point/Axis endpoint] <8.0000>: 6",
    ])
    expect(listed(cad).slice(1)).toEqual([
      "         Position, X = 105.0000  Y = 8.6603    Z = 0.0000",
      "    Inscribed base radius: 10.0000",
      "Circumscribed base radius: 8.6603",
      "     Inscribed top radius: 3.0000",
      " Circumscribed top radius: 2.5981",
      "           Height: 6.0000",
      "         Rotation: 270",
      "  Number of sides: 6",
    ])
    expect(
      written(cad, "PYRAMID", "200,0,0", "5", "A", "200,0,10").slice(2)
    ).toEqual([
      "Specify center point of base or [Edge/Sides]: 200,0,0",
      "Specify base radius or [Circumscribed] <10.0000>: 5",
      "Specify height or [2Point/Axis endpoint/Top radius] <6.0000>: A",
      "Specify axis endpoint: 200,0,10",
    ])
    expect(listed(cad).slice(6, 8)).toEqual([
      "           Height: 10.0000",
      "         Rotation: 82",
    ])
    answer(cad, "PYRAMID", "300,0,0", "5", "2P", "0,0,0", "0,0,7")
    expect(listed(cad).slice(6, 8)).toEqual([
      "           Height: 7.0000",
      "         Rotation: 125",
    ])
  })

  it("refuses what makes no pyramid (y03, y04, y06)", () => {
    const cad = console()
    expect(
      written(cad, "PYRAMID", "S", "FOO", "2", "33", "", "FOO", "", "0,0,0")
    ).toEqual([
      "PYRAMID",
      " 4 sides  Circumscribed",
      "Specify center point of base or [Edge/Sides]: S",
      "Enter number of sides <4>: FOO",
      "Requires an integer between 3 and 32.",
      "Enter number of sides <4>: 2",
      "Requires an integer between 3 and 32.",
      "Enter number of sides <4>: 33",
      "Requires an integer between 3 and 32.",
      "Enter number of sides <4>:",
      "Specify center point of base or [Edge/Sides]: FOO",
      "Point or option keyword required.",
      "Specify center point of base or [Edge/Sides]:",
      "Point or option keyword required.",
      "Specify center point of base or [Edge/Sides]: 0,0,0",
    ])
    expect(written(cad, "FOO", "", "0", "-3", "5")).toEqual([
      "Specify base radius or [Inscribed]: FOO",
      "Requires numeric distance, second point, or option keyword.",
      "Specify base radius or [Inscribed]:",
      "Requires numeric distance, second point, or option keyword.",
      "Specify base radius or [Inscribed]: 0",
      "Value must be positive and nonzero.",
      "Specify base radius or [Inscribed]: -3",
      "Value must be positive and nonzero.",
      "Specify base radius or [Inscribed]: 5",
    ])
    expect(written(cad, "FOO", "", "0", "-4")).toEqual([
      "Specify height or [2Point/Axis endpoint/Top radius]: FOO",
      "Requires numeric distance, second point, or option keyword.",
      "Specify height or [2Point/Axis endpoint/Top radius]:",
      "Requires numeric distance, second point, or option keyword.",
      "Specify height or [2Point/Axis endpoint/Top radius]: 0",
      "Value must be nonzero.",
      "Specify height or [2Point/Axis endpoint/Top radius]: -4",
    ])
    expect(listed(cad)[2]).toBe(
      "           Normal: X = 0.0000    Y = 0.0000    Z = -1.0000"
    )
    expect(
      written(cad, "PYRAMID", "E", "FOO", "0,0,0", "0,0", "10,0", "4").slice(3)
    ).toEqual([
      "Specify first endpoint of edge: FOO",
      "Invalid point.",
      "Specify first endpoint of edge: 0,0,0",
      "Specify second endpoint of edge: 0,0",
      "Value must be positive and nonzero.",
      "Specify second endpoint of edge: 10,0",
      "Specify height or [2Point/Axis endpoint/Top radius] <-4.0000>: 4",
    ])
    expect(listed(cad)[1]).toBe(
      "         Position, X = 5.0000    Y = 5.0000    Z = 0.0000"
    )
    expect(
      written(
        cad,
        "PYRAMID",
        "50,0,0",
        "5",
        "A",
        "FOO",
        "50,0,0",
        "50,10,10"
      ).slice(5)
    ).toEqual([
      "Specify axis endpoint: FOO",
      "Invalid point.",
      "Specify axis endpoint: 50,0,0",
      "Value must be nonzero.",
      "Specify axis endpoint: 50,10,10",
    ])
    expect(listed(cad).slice(2, 3)).toEqual([
      "           Normal: X = 0.0000    Y = 0.7071    Z = 0.7071",
    ])
  })

  it("refuses Enter, FOO and a keyword at 2Point's points with `Invalid point.` (primitives/p154, p312)", () => {
    const cad = console()
    const out = written(
      cad,
      "_PYRAMID",
      "0,0,0",
      "5",
      "_2P",
      "",
      "FOO",
      "_A",
      "1,1,1",
      "",
      "FOO",
      "1,1,6"
    )
    expect(out.slice(5)).toEqual([
      "Specify first point:",
      "Invalid point.",
      "Specify first point: FOO",
      "Invalid point.",
      "Specify first point: _A",
      "Invalid point.",
      "Specify first point: 1,1,1",
      "Specify second point:",
      "Invalid point.",
      "Specify second point: FOO",
      "Invalid point.",
      "Specify second point: 1,1,6",
    ])
  })

  it("takes the top radius and the last ones as defaults, Enter's base unturned (y05, y10)", () => {
    const cad = console()
    expect(
      written(cad, "PYRAMID", "0,0,0", "5", "T", "FOO", "", "-1").slice(5)
    ).toEqual([
      "Specify top radius <0.0000>: FOO",
      "Requires numeric distance or second point.",
      "Specify top radius <0.0000>:",
      "Specify height or [2Point/Axis endpoint]: -1",
    ])
    expect(
      written(cad, "PYRAMID", "50,0,0", "", "T", "5", "7").slice(3)
    ).toEqual([
      "Specify base radius or [Inscribed] <7.0711>:",
      "Specify height or [2Point/Axis endpoint/Top radius] <-1.0000>: T",
      "Specify top radius <0.0000>: 5",
      "Specify height or [2Point/Axis endpoint] <-1.0000>: 7",
    ])
    expect(listed(cad).slice(2)).toEqual([
      "    Inscribed base radius: 7.0711",
      "Circumscribed base radius: 5.0000",
      "     Inscribed top radius: 7.0711",
      " Circumscribed top radius: 5.0000",
      "           Height: 7.0000",
      "         Rotation: 0",
      "  Number of sides: 4",
    ])
    // The top radius is kept as its corners' circle, which Enter gives (y10).
    expect(written(cad, "PYRAMID", "100,0,0", "5", "T", "", "8")[5]).toBe(
      "Specify top radius <7.0711>:"
    )
    expect(listed(cad).slice(4, 6)).toEqual([
      "     Inscribed top radius: 7.0711",
      " Circumscribed top radius: 5.0000",
    ])
  })

  it("turns the base Enter takes to put a corner on the UCS's X, Inscribed (v04)", () => {
    const cad = console()
    answer(
      cad,
      "PYRAMID",
      "50,0,0",
      "I",
      "5",
      "8",
      "PYRAMID",
      "100,0,0",
      "",
      "8"
    )
    expect(listed(cad)[7]).toBe("         Rotation: 45")
    answer(cad, "PYRAMID", "150,0,0", "C", "", "8")
    expect(listed(cad).slice(2, 4)).toEqual([
      "    Inscribed base radius: 5.0000",
      "Circumscribed base radius: 3.5355",
    ])
    expect(listed(cad)[7]).toBe("         Rotation: 0")
  })

  it("lies in the UCS, its base turned in the axis' OCS when tilted (y07, y09)", () => {
    // A radius given by a point turns the base towards it, in the UCS.
    const cad = console()
    answer(cad, "UCS", "X", "30", "PYRAMID", "0,0,0", "3,3", "8")
    expect(listed(cad)[7]).toBe("         Rotation: 45")
    answer(cad, "UCS", "W")
    expect(listed(cad).slice(1, 3)).toEqual([
      "         Position, X = 0.0000    Y = 0.0000    Z = 0.0000",
      "           Normal: X = 0.0000    Y = -0.5000   Z = 0.8660",
    ])
    expect(listed(cad)[8]).toBe("         Rotation: 41")
    const tilted = console()
    answer(tilted, "PYRAMID", "S", "3", "0,0,0", "5", "A", "0,10,10")
    expectAt(
      last(tilted).brep.vertices.find((p) => p.z > 6)!,
      { x: -1.416921, y: -6.999726, z: 6.999726 },
      5
    )
    answer(tilted, "PYRAMID", "100,0,0", "5", "A", "100,0,-10")
    expect(
      last(tilted).brep.vertices.some(
        (p) =>
          Math.abs(p.x - 100.257234) < 1e-5 && Math.abs(p.y - 9.996691) < 1e-5
      )
    ).toBe(true)
  })

  it("moves, turns, mirrors and scales as a pyramid (y08)", () => {
    const cad = console()
    answer(cad, "PYRAMID", "0,0,0", "5", "8")
    answer(
      cad,
      "MOVE",
      "L",
      "",
      "0,0,0",
      "5,5,3",
      "ROTATE",
      "L",
      "",
      "0,0",
      "30"
    )
    expect(listed(cad).slice(1, 2)).toEqual([
      "         Position, X = 1.8301    Y = 6.8301    Z = 3.0000",
    ])
    expect(listed(cad)[7]).toBe("         Rotation: 52")
    answer(cad, "MIRROR", "L", "", "0,40", "10,40", "N")
    expect(listed(cad)[7]).toBe("         Rotation: 308")
    answer(cad, "SCALE", "L", "", "0,0", "2")
    expect(listed(cad).slice(1, 4)).toEqual([
      "         Position, X = 3.6603    Y = 146.3397  Z = 6.0000",
      "    Inscribed base radius: 14.1421",
      "Circumscribed base radius: 10.0000",
    ])
    for (const solid of solids(cad)) expect(brepIsClosed(solid.brep)).toBe(true)
    answer(cad, "PYRAMID", "100,0,0", "5", "T", "1", "8", "EXPLODE", "L", "")
    expect(cad.typeCounts().region).toBe(6)
  })

  it("is saved and read back with its primitive", () => {
    const cad = console()
    answer(cad, "PYRAMID", "S", "5", "0,0,0", "I", "5", "T", "2", "8")
    answer(cad, "WEDGE", "20,0,0", "30,10", "4")
    const document = cad.runtime.document
    const file = serializeDrawing(
      snapshotOf(document.getEntities(), { settings: document.getSettings() })
    )
    expect(parseDrawingFile(file).entities).toEqual(document.getEntities())
  })

  it("asks in each language, by its own name (n02)", () => {
    const spanish = console(es)
    expect(written(spanish, "PIR", "0,0,0", "5", "8")).toEqual([
      "PIR PIRAMIDE",
      " 4 lados circunscritos",
      "Precise centro de base o [Arista/Lados]: 0,0,0",
      "Precise radio de base o [Inscrito]: 5",
      "Indique altura o [2Puntos/punto final Eje/Radio superior]: 8",
    ])
    expect(listed(spanish).slice(2)).toEqual([
      "   Radio de base inscrito: 7.0711",
      "Radio de base circunscrito: 5.0000",
      "  Radio superior inscrito: 0.0000",
      "Radio superior circunscrito: 0.0000",
      "           Altura: 8.0000",
      "         Rotación: 22",
      "  Número de lados: 4",
    ])
    const portuguese = console(ptBR)
    expect(
      written(portuguese, "PIRAMIDE", "0,0,0", "5", "R", "", "8").slice(1)
    ).toEqual([
      " 4 lados circunscritos",
      "Especificar ponto central da base ou [Aresta/Lados]: 0,0,0",
      "Especificar raio base  ou [Inscrito]: 5",
      "Especificar altura ou [2Pontos/ponto final Eixo/Raio superior]: R",
      "Especificar raio superior <0.0000>:",
      "Especificar altura ou [2Pontos/ponto final Eixo]: 8",
    ])
  })
})

describe("PYRAMID, answer by answer", () => {
  it("refuses a zero height, axis, 2Point and edge in each language's words (solid/y03, y06, primitives/p311, p351)", () => {
    const zeros = (cad: CadHarness) => [
      written(cad, "_PYRAMID", "0,0,0", "5", "0").at(-1),
      written(cad, "0,0,0").at(-1),
      written(cad, "_A", "0,0,0").at(-1),
      written(cad, "0").at(-1),
      written(
        cad.escape(),
        "_PYRAMID",
        "0,0,0",
        "5",
        "_2P",
        "0,0,0",
        "0,0,0"
      ).at(-1),
      written(cad.escape(), "_PYRAMID", "_E", "0,0,0", "0,0").at(-1),
    ]
    expect(zeros(console())).toEqual([
      "Value must be nonzero.",
      "Value must be nonzero.",
      "Value must be nonzero.",
      "Value must be nonzero.",
      "Value must be nonzero.",
      "Value must be positive and nonzero.",
    ])
    expect(zeros(console(es))).toEqual([
      "El valor debe ser diferente de cero.",
      "El valor debe ser diferente de cero.",
      "El valor no puede ser cero.",
      "El valor no puede ser cero.",
      "El valor no puede ser cero.",
      "El valor debe ser positivo y distinto de cero.",
    ])
    expect(zeros(console(ptBR))).toEqual([
      "O valor deve ser diferente de zero.",
      "O valor deve ser diferente de zero.",
      "Este valor precisa ser diferente de zero.",
      "Este valor precisa ser diferente de zero.",
      "Este valor precisa ser diferente de zero.",
      "O valor deve ser positivo e diferente de zero.",
    ])
  })

  it("measures a point typed at Top radius from where the height prompt left the axis (primitives/p315)", () => {
    const cad = console()
    answer(cad, "_PYRAMID", "150,0,0", "5", "_T", "@2,0", "8")
    expect(listed(cad).slice(4, 6)).toEqual([
      "     Inscribed top radius: 2.8284",
      " Circumscribed top radius: 2.0000",
    ])
    const top = last(cad).primitive
    expect(top?.kind === "pyramid" && top.topRadius).toBeCloseTo(
      2 / Math.cos(Math.PI / 4),
      9
    )
  })

  it("refuses Enter at a height with no default in pt-BR too (solid/y03, primitives/p352: pt-BR's console ends it, PRIM-D40)", () => {
    const portuguese = console(ptBR)
    expect(
      written(portuguese, "_PYRAMID", "0,0,0", "5", "", "8").slice(4)
    ).toEqual([
      "Especificar altura ou [2Pontos/ponto final Eixo/Raio superior]:",
      "Requer distância numérica, segundo ponto ou opção.",
      "Especificar altura ou [2Pontos/ponto final Eixo/Raio superior]: 8",
    ])
    expect(solids(portuguese)).toHaveLength(1)
  })

  it("says its sides and Type again when repeated by Enter (primitives/p300, p302)", () => {
    const cad = console()
    answer(cad, "_PYRAMID", "_S", "6", "0,0,0", "_I", "5", "8")
    expect(written(cad, "", "10,0,0", "5", "8")).toEqual([
      "PYRAMID",
      " 6 sides  Inscribed",
      "Specify center point of base or [Edge/Sides]: 10,0,0",
      "Specify base radius or [Circumscribed] <5.0000>: 5",
      "Specify height or [2Point/Axis endpoint/Top radius] <8.0000>: 8",
    ])
    expect(listed(cad).slice(1, 4)).toEqual([
      "         Position, X = 10.0000   Y = 0.0000    Z = 0.0000",
      "    Inscribed base radius: 5.0000",
      "Circumscribed base radius: 4.3301",
    ])
    expect(listed(cad)[7]).toBe("         Rotation: 53")
    const portuguese = console(ptBR)
    answer(portuguese, "PIR", "0,0,0", "5", "8")
    expect(written(portuguese, "", "10,0,0", "5", "8")).toEqual([
      "PIRAMIDE",
      " 4 lados circunscritos",
      "Especificar ponto central da base ou [Aresta/Lados]: 10,0,0",
      "Especificar raio base  ou [Inscrito] <7.0711>: 5",
      "Especificar altura ou [2Pontos/ponto final Eixo/Raio superior] <8.0000>: 8",
    ])
  })

  it("is refused transparently, 'PYRAMID at LINE's prompt (primitives/p303)", () => {
    const cad = console()
    expect(
      written(cad, "_LINE", "'_PYRAMID", "0,0", "10,0", "").slice(2, 5)
    ).toEqual([
      "** That command may not be invoked transparently **",
      "Invalid point.",
      "Specify first point: 0,0",
    ])
  })

  it("takes 3 to 32 sides and refuses 4.5, -4 and 0 (primitives/p304, p305)", () => {
    const cad = console()
    expect(
      written(cad, "_PYRAMID", "_S", "4.5", "3", "0,0,0", "5", "8").slice(3, 6)
    ).toEqual([
      "Enter number of sides <4>: 4.5",
      "Requires an integer between 3 and 32.",
      "Enter number of sides <4>: 3",
    ])
    expect(listed(cad).slice(2, 4)).toEqual([
      "    Inscribed base radius: 10.0000",
      "Circumscribed base radius: 5.0000",
    ])
    expect(
      written(cad, "_PYRAMID", "_S", "-4", "0", "32", "0,0,0", "5", "8").slice(
        3,
        8
      )
    ).toEqual([
      "Enter number of sides <3>: -4",
      "Requires an integer between 3 and 32.",
      "Enter number of sides <3>: 0",
      "Requires an integer between 3 and 32.",
      "Enter number of sides <3>: 32",
    ])
    expect(listed(cad).slice(2, 4)).toEqual([
      "    Inscribed base radius: 5.0242",
      "Circumscribed base radius: 5.0000",
    ])
    expect(listed(cad)[8]).toBe("  Number of sides: 32")
  })

  it("refuses another prompt's keyword at each prompt (primitives/p306–p310)", () => {
    const cad = console()
    expect(
      written(cad, "_PYRAMID", "_S", "_E", "3", "_I", "_T", "0,0,0").slice(3)
    ).toEqual([
      "Enter number of sides <4>: _E",
      "Requires an integer between 3 and 32.",
      "Enter number of sides <4>: 3",
      "Specify center point of base or [Edge/Sides]: _I",
      "Point or option keyword required.",
      "Specify center point of base or [Edge/Sides]: _T",
      "Point or option keyword required.",
      "Specify center point of base or [Edge/Sides]: 0,0,0",
    ])
    expect(written(cad, "_C", "_T", "_S", "_I", "_I", "5")).toEqual([
      "Specify base radius or [Inscribed]: _C",
      "Requires numeric distance, second point, or option keyword.",
      "Specify base radius or [Inscribed]: _T",
      "Requires numeric distance, second point, or option keyword.",
      "Specify base radius or [Inscribed]: _S",
      "Requires numeric distance, second point, or option keyword.",
      "Specify base radius or [Inscribed]: _I",
      "Specify base radius or [Circumscribed]: _I",
      "Requires numeric distance, second point, or option keyword.",
      "Specify base radius or [Circumscribed]: 5",
    ])
    expect(written(cad, "_I", "_E", "_S", "_T", "2", "_T", "3")).toEqual([
      "Specify height or [2Point/Axis endpoint/Top radius]: _I",
      "Requires numeric distance, second point, or option keyword.",
      "Specify height or [2Point/Axis endpoint/Top radius]: _E",
      "Requires numeric distance, second point, or option keyword.",
      "Specify height or [2Point/Axis endpoint/Top radius]: _S",
      "Requires numeric distance, second point, or option keyword.",
      "Specify height or [2Point/Axis endpoint/Top radius]: _T",
      "Specify top radius <0.0000>: 2",
      "Specify height or [2Point/Axis endpoint]: _T",
      "Requires numeric distance, second point, or option keyword.",
      "Specify height or [2Point/Axis endpoint]: 3",
    ])
    expect(listed(cad).slice(2, 7)).toEqual([
      "    Inscribed base radius: 5.0000",
      "Circumscribed base radius: 2.5000",
      "     Inscribed top radius: 2.0000",
      " Circumscribed top radius: 1.0000",
      "           Height: 3.0000",
    ])
  })

  it("refuses Enter and other keywords at Edge's points and the axis, a 0 there along the cursor (primitives/p311, p313)", () => {
    const cad = console()
    expect(
      written(cad, "_PYRAMID", "_E", "", "_S", "0,0,0", "", "_S", "10,0", "4")
    ).toEqual([
      "PYRAMID",
      " 4 sides  Circumscribed",
      "Specify center point of base or [Edge/Sides]: _E",
      "Specify first endpoint of edge:",
      "Invalid point.",
      "Specify first endpoint of edge: _S",
      "Invalid point.",
      "Specify first endpoint of edge: 0,0,0",
      "Specify second endpoint of edge:",
      "Invalid point.",
      "Specify second endpoint of edge: _S",
      "Invalid point.",
      "Specify second endpoint of edge: 10,0",
      "Specify height or [2Point/Axis endpoint/Top radius]: 4",
    ])
    expect(listed(cad)[1]).toBe(
      "         Position, X = 5.0000    Y = 5.0000    Z = 0.0000"
    )
    expect(
      written(cad, "_PYRAMID", "0,0,0", "5", "_A", "", "_T", "0", "5").slice(4)
    ).toEqual([
      "Specify height or [2Point/Axis endpoint/Top radius] <4.0000>: _A",
      "Specify axis endpoint:",
      "Invalid point.",
      "Specify axis endpoint: _T",
      "Invalid point.",
      "Specify axis endpoint: 0",
      "Value must be nonzero.",
      "Specify axis endpoint: 5",
    ])
    expect(listed(cad).slice(2, 3)).toEqual([
      "           Normal: X = 0.9281    Y = 0.3722    Z = 0.0000",
    ])
  })

  it("takes every point form: ELEVATION, `@`, polar, `*` and a bare number (primitives/p314–p318)", () => {
    const cad = console()
    answer(cad, "_ELEVATION", "3", "_PYRAMID", "0,0", "5", "8")
    answer(cad, "_PYRAMID", "_E", "10,0", "20,0", "8")
    answer(cad, "_PYRAMID", "50,0", "5", "_A", "50,5")
    answer(cad, "_PYRAMID", "100,0", "5", "_2P", "0,0", "0,10")
    answer(cad, "_PYRAMID", "150,0,1", "5", "8")
    expect(listedAll(cad).map((block) => block.slice(1, 3))).toEqual([
      [
        "         Position, X = 150.0000  Y = 0.0000    Z = 1.0000",
        "    Inscribed base radius: 7.0711",
      ],
      [
        "         Position, X = 100.0000  Y = 0.0000    Z = 3.0000",
        "    Inscribed base radius: 7.0711",
      ],
      [
        "         Position, X = 50.0000   Y = 0.0000    Z = 3.0000",
        "           Normal: X = 0.0000    Y = 1.0000    Z = 0.0000",
      ],
      [
        "         Position, X = 15.0000   Y = 5.0000    Z = 3.0000",
        "    Inscribed base radius: 7.0711",
      ],
      [
        "         Position, X = 0.0000    Y = 0.0000    Z = 3.0000",
        "    Inscribed base radius: 7.0711",
      ],
    ])
    expect(listedAll(cad)[1][6]).toBe("           Height: 10.0000")
    const typed = console()
    answer(typed, "_PYRAMID", "0,0,0", "@3,4", "8")
    expect(listed(typed)[7]).toBe("         Rotation: 53")
    answer(typed, "_PYRAMID", "_E", "10,0,0", "@10,0", "_A", "@0,0,10")
    expect(listed(typed).slice(1, 2)).toEqual([
      "         Position, X = 15.0000   Y = 5.0000    Z = 0.0000",
    ])
    expect(listed(typed)[6]).toBe("           Height: 10.0000")
    answer(typed, "_PYRAMID", "100,0,0", "5", "_2P", "@", "@0,0,6")
    expect(listed(typed)[6]).toBe("           Height: 6.0000")
    const polar = console()
    answer(polar, "_PYRAMID", "10<30", "5", "8")
    answer(polar, "_PYRAMID", "_E", "10,0,0", "@10<90", "8")
    answer(polar, "_PYRAMID", "50,0,0", "@5<45", "8")
    answer(polar, "_PYRAMID", "100,0,0", "5", "_A", "@10<90")
    const [axis, radius, edge, centre] = listedAll(polar)
    expect(centre[1]).toBe(
      "         Position, X = 8.6603    Y = 5.0000    Z = 0.0000"
    )
    expect([edge[1], edge[7]]).toEqual([
      "         Position, X = 5.0000    Y = 5.0000    Z = 0.0000",
      "         Rotation: 0",
    ])
    expect(radius[7]).toBe("         Rotation: 45")
    expect(axis.slice(2, 3)).toEqual([
      "           Normal: X = 0.0000    Y = 1.0000    Z = 0.0000",
    ])
    const world = console()
    answer(world, "_UCS", "_Z", "30", "_PYRAMID", "*10,0,0", "5", "8")
    answer(world, "_PYRAMID", "_E", "*100,0,0", "*110,0,0", "8")
    answer(world, "_PYRAMID", "300,0,0", "5", "_2P", "*0,0,0", "*0,0,6")
    // LIST reads them in the UCS, as the console's (p317).
    const [twoPoint, worldEdge, worldCentre] = listedAll(world)
    expect(worldCentre[1]).toBe(
      "         Position, X = 8.6603    Y = -5.0000   Z = 0.0000"
    )
    expect(worldEdge[1]).toBe(
      "         Position, X = 93.4327   Y = -48.1699  Z = 0.0000"
    )
    expect(worldEdge[7]).toBe("         Rotation: 240")
    expect(twoPoint[6]).toBe("           Height: 6.0000")
    const bare = console()
    answer(bare, "_PYRAMID", "10", "5", "8")
    answer(bare, "_PYRAMID", "_E", "50,0,0", "10", "8")
    answer(bare, "_PYRAMID", "100,0,0", "5", "_A", "10")
    answer(bare, "_PYRAMID", "150,0,0", "5", "_2P", "150,0,0", "6")
    const [bareTwo, bareAxis, bareEdge, bareCentre] = listedAll(bare)
    expect(bareCentre[1]).toBe(
      "         Position, X = 9.2813    Y = 3.7225    Z = 0.0000"
    )
    expect([bareEdge[1], bareEdge[7]]).toEqual([
      "         Position, X = 52.3189   Y = 6.6800    Z = 0.0000",
      "         Rotation: 296",
    ])
    expect(bareAxis.slice(2, 3)).toEqual([
      "           Normal: X = 0.8529    Y = 0.5221    Z = 0.0000",
    ])
    expect(bareTwo[6]).toBe("           Height: 6.0000")
  })

  it("takes END, MID and FRO at its prompts (primitives/p320, p321)", () => {
    const cad = console()
    answer(cad, "_LINE", "0,0,0", "10,0,0", "10,10,4", "", "_ZOOM", "_E")
    answer(cad, "_PYRAMID", "_END", "9.9,0.1", "_MID", "5.1,0.1")
    answer(cad, "_END", "10.1,9.9")
    expect(listed(cad).slice(1, 7)).toEqual([
      "         Position, X = 10.0000   Y = 0.0000    Z = 0.0000",
      "    Inscribed base radius: 7.0711",
      "Circumscribed base radius: 5.0000",
      "     Inscribed top radius: 0.0000",
      " Circumscribed top radius: 0.0000",
      "           Height: 10.7703",
    ])
    answer(cad, "_PYRAMID", "_E", "_END", "0.1,0.1", "_MID", "5,0.1")
    answer(cad, "_A", "_END", "10.1,9.9")
    expect(listed(cad).slice(1, 4)).toEqual([
      "         Position, X = 2.5000    Y = 2.5000    Z = 0.0000",
      "           Normal: X = 0.6616    Y = 0.6616    Z = 0.3529",
      "    Inscribed base radius: 3.5355",
    ])
    expect(listed(cad)[7]).toBe("           Height: 11.3358")
    answer(cad, "_PYRAMID", "20,0,0", "5", "_2P", "_END", "0.1,0.1")
    answer(cad, "_END", "10.1,9.9")
    expect(listed(cad)[6]).toBe("           Height: 14.6969")
    const from = console()
    answer(from, "_PYRAMID", "_FRO", "10,0,0", "@5,5", "5", "8")
    expect(listed(from)[1]).toBe(
      "         Position, X = 15.0000   Y = 5.0000    Z = 0.0000"
    )
    answer(from, "_PYRAMID", "150,0,0", "_FRO", "150,0,0", "@3,4", "8")
    expect(listed(from)[7]).toBe("         Rotation: 53")
  })

  it("leaves typed points to Ortho (primitives/p322)", () => {
    const cad = console()
    answer(cad, "ORTHOMODE", "1", "_PYRAMID", "_E", "0,0,0", "10,3", "8")
    answer(cad, "_PYRAMID", "50,0,0", "53,4", "8")
    answer(cad, "_PYRAMID", "100,0,0", "5", "_A", "103,4,10")
    answer(cad, "_PYRAMID", "150,0,0", "5", "_2P", "150,0,0", "153,4,6")
    const [twoPoint, axis, radius, edge] = listedAll(cad)
    expect(edge.slice(1, 4)).toEqual([
      "         Position, X = 3.5000    Y = 6.5000    Z = 0.0000",
      "    Inscribed base radius: 7.3824",
      "Circumscribed base radius: 5.2202",
    ])
    expect(radius[7]).toBe("         Rotation: 53")
    expect(axis.slice(2, 3)).toEqual([
      "           Normal: X = 0.2683    Y = 0.3578    Z = 0.8944",
    ])
    expect(twoPoint[6]).toBe("           Height: 7.8102")
  })

  it("lets transparent commands run at its prompts (primitives/p323, p324)", () => {
    const cad = console()
    const out = written(
      cad,
      "_PYRAMID",
      "'_ZOOM",
      "_E",
      "_S",
      "'ORTHOMODE",
      "1",
      "6",
      "0,0,0",
      "'_LINE",
      "5",
      "'_-PAN",
      "0,0",
      "1,1",
      "8"
    )
    expect(
      out.filter((l) => l.startsWith("**") || l.startsWith("Resum"))
    ).toEqual([
      "** Requires a regen, cannot be transparent.",
      "Resuming PYRAMID command.",
      "Resuming PYRAMID command.",
      "** That command may not be invoked transparently **",
      "Resuming PYRAMID command.",
    ])
    expect(listed(cad)[8]).toBe("  Number of sides: 6")
    const edge = console()
    answer(
      edge,
      "_PYRAMID",
      "_E",
      "'ORTHOMODE",
      "0",
      "0,0,0",
      "'ORTHOMODE",
      "0"
    )
    answer(edge, "10,0", "_T", "'_ZOOM", "_E", "", "_2P", "'ORTHOMODE", "0")
    answer(edge, "0,0,0", "'ORTHOMODE", "0", "0,0,5")
    expect(listed(edge).slice(1, 7)).toEqual([
      "         Position, X = 5.0000    Y = 5.0000    Z = 0.0000",
      "    Inscribed base radius: 7.0711",
      "Circumscribed base radius: 5.0000",
      "     Inscribed top radius: 0.0000",
      " Circumscribed top radius: 0.0000",
      "           Height: 5.0000",
    ])
  })

  it("wears the current layer and properties at ELEVATION, those of its end when set mid-command (primitives/p325, p326)", () => {
    const cad = console()
    const l1 = cad.runtime.createLayer("L1", undefined, true)
    answer(cad, "_-COLOR", "1", "_CELWEIGHT", "50", "_ELEVATION", "3")
    answer(cad, "_PYRAMID", "0,0", "5", "8")
    expect(last(cad)).toMatchObject({
      layerId: l1,
      color: "#ff0000",
      lineweight: 0.5,
    })
    expect(last(cad).primitive?.position.z).toBe(3)
    const later = console()
    const l2 = later.runtime.createLayer("L2", undefined, false)
    answer(later, "_PYRAMID", "'CECOLOR", "3", "0,0", "'ELEVATION", "5", "5")
    answer(later, "'CECOLOR", "5", "'CLAYER", "L2", "8")
    expect(last(later)).toMatchObject({ layerId: l2, color: "#0000ff" })
    expect(last(later).primitive?.position.z).toBe(0)
  })
})

describe("the primitives' defaults", () => {
  it("share a height, a length and a width, kept as made (x06, x07, p10)", () => {
    const cad = console()
    answer(cad, "BOX", "0,0,0", "L", "-10", "-6", "4")
    expect(written(cad, "WEDGE", "50,0,0", "L", "12", "7", "")).toEqual([
      "WEDGE",
      "Specify first corner or [Center]: 50,0,0",
      "Specify other corner or [Cube/Length]: L",
      "Specify length <10.0000>: 12",
      "Specify width <6.0000>: 7",
      "Specify height or [2Point] <4.0000>:",
    ])
    // The height reaches PYRAMID as it does CONE (x01).
    expect(written(cad, "PYRAMID", "100,0,0", "3", "")[4]).toBe(
      "Specify height or [2Point/Axis endpoint/Top radius] <4.0000>:"
    )
    // From the centre a negative length is twice as long, BOX's too (x07).
    answer(cad, "BOX", "C", "150,0,0", "L", "-10", "6", "4")
    const box = last(cad).primitive
    expect(box?.kind === "box" && box.length).toBe(20)
    expect(written(cad, "BOX", "200,0,0", "L", "5")[3]).toBe(
      "Specify length <20.0000>: 5"
    )
  })

  it("share no length with the radius, and a negative height everywhere (primitives/p156)", () => {
    const cad = console()
    answer(cad, "BOX", "0,0,0", "_L", "10", "6", "4")
    expect(written(cad, "CYLINDER", "50,0,0", "3", "")[2]).toBe(
      "Specify base radius or [Diameter]: 3"
    )
    expect(written(cad, "BOX", "100,0,0", "_L", "7", "7", "")[3]).toBe(
      "Specify length <10.0000>: 7"
    )
    answer(cad, "BOX", "200,0,0", "210,20", "-5")
    for (const [cmd, ...rest] of [
      ["CYLINDER", "250,0,0", "3", ""],
      ["PYRAMID", "300,0,0", "3", ""],
      ["CONE", "350,0,0", "3", ""],
      ["WEDGE", "400,0,0", "410,20", ""],
    ]) {
      expect(written(cad, cmd, ...rest).at(-1)).toMatch(/<-5\.0000>:$/)
    }
    // An Axis endpoint's length is the next height.
    answer(cad, "PYRAMID", "500,0,0", "3", "_A", "500,0,9")
    expect(written(cad, "BOX", "600,0,0", "610,20", "").at(-1)).toBe(
      "Specify height or [2Point] <9.0000>:"
    )
  })

  it("take Ttr's radius as the shared radius (primitives/p157)", () => {
    const cad = console()
    answer(cad, "LINE", "200,0", "300,0", "", "LINE", "200,0", "200,100", "")
    answer(cad, "ZOOM", "E")
    const ttr = ["_T", "_TAN", "250,0", "_TAN", "200,50"]
    expect(written(cad, "CYLINDER", ...ttr, "7", "5")[4]).toBe(
      "Specify radius of circle: 7"
    )
    expect(written(cad, "SPHERE", "400,0,0", "3")[2]).toBe(
      "Specify radius or [Diameter] <7.0000>: 3"
    )
    expect(written(cad, "TORUS", ...ttr, "4", "1").slice(4)).toEqual([
      "Specify radius of circle <3.0000>: 4",
      "Specify tube radius or [2Point/Diameter]: 1",
    ])
    expect(written(cad, "CONE", ...ttr, "5", "3").slice(4)).toEqual([
      "Specify radius of circle <4.0000>: 5",
      "Specify height or [2Point/Axis endpoint/Top radius] <5.0000>: 3",
    ])
    answer(cad, "PYRAMID", "600,0,0", "2", "3")
    expect(written(cad, "SPHERE", ...ttr, "6")[4]).toBe(
      "Specify radius of circle <2.8284>: 6"
    )
  })

  it("leave the defaults as the undone run set them (primitives/p148)", () => {
    const cad = console()
    answer(
      cad,
      "BOX",
      "0,0,0",
      "10,20",
      "5",
      "BOX",
      "50,0,0",
      "_L",
      "12",
      "7",
      "9",
      "_U"
    )
    expect(
      written(cad, "BOX", "100,0,0", "_L", "3", "3", "3").slice(3)
    ).toEqual([
      "Specify length <12.0000>: 3",
      "Specify width <7.0000>: 3",
      "Specify height or [2Point] <9.0000>: 3",
    ])
    answer(cad, "CYLINDER", "150,0,0", "6", "11", "_U")
    answer(cad, "CYLINDER", "200,0,0", "2", "2", "_U", "_U")
    expect(
      written(cad, "BOX", "250,0,0", "_L", "3", "3", "3").slice(3)
    ).toEqual([
      "Specify length <3.0000>: 3",
      "Specify width <3.0000>: 3",
      "Specify height or [2Point] <2.0000>: 3",
    ])
  })

  // NEW too: the console has none, NEW stands for the blank drawing OPEN
  // brings (PRIM-D1). LUPREC is the drawing's, so it is set again.
  const RESETS: [string, (cad: CadHarness) => void][] = [
    ["NEW", (cad) => answer(cad, "_NEW", "LUPREC", "4")],
    [
      "OPEN",
      (cad) => {
        cad.runtime.loadDrawing(serializeDrawing(snapshotOf([])))
        answer(cad, "LUPREC", "4")
      },
    ],
  ]

  it.each(RESETS)(
    "survive %s, all but the top radius (primitives/p155, p158)",
    (_, reset) => {
      const cad = console()
      answer(
        cad,
        "BOX",
        "0,0,0",
        "_L",
        "10",
        "6",
        "4",
        "CYLINDER",
        "50,0,0",
        "5",
        "8",
        "CONE",
        "80,0,0",
        "5",
        "_T",
        "2",
        "8",
        "TORUS",
        "100,0,0",
        "5",
        "1",
        "PYRAMID",
        "_S",
        "6",
        "120,0,0",
        "_I",
        "5",
        "8"
      )
      reset(cad)
      expect(
        written(cad, "BOX", "0,0,0", "_L", "3", "3", "3").slice(3)
      ).toEqual([
        "Specify length <10.0000>: 3",
        "Specify width <6.0000>: 3",
        "Specify height or [2Point] <8.0000>: 3",
      ])
      expect(written(cad, "CONE", "80,0,0", "3", "_T", "1", "3")[4]).toBe(
        "Specify top radius <0.0000>: 1"
      )
      expect(written(cad, "TORUS", "100,0,0", "3", "0.5")[3]).toBe(
        "Specify tube radius or [2Point/Diameter] <1.0000>: 0.5"
      )
      expect(written(cad, "PYRAMID", "120,0,0", "3", "3")[1]).toBe(
        " 6 sides  Inscribed"
      )
    }
  )

  it.each(RESETS)(
    "keep TORUS's tube diameter offer after a diameter over %s (primitives/p158)",
    (_, reset) => {
      const cad = console()
      answer(cad, "CYLINDER", "50,0,0", "_D", "6", "4")
      reset(cad)
      expect(written(cad, "TORUS", "150,0,0", "5", "_D", "2")[4]).toBe(
        "Specify tube diameter <0.0000>: 2"
      )
    }
  )
})

/** Where a LINE starts snapped by `mode` at `at`, or the refusal it met. */
function snapped(cad: CadHarness, mode: string, at: string): Vec3 | string {
  const out = written(cad, "LINE", mode, at, "@1,0,0", "")
  const line = cad.latest()
  if (line.type !== "line" || out.some((l) => l.startsWith("No "))) {
    answer(cad, "\u001b")
    return out.find((l) => l.startsWith("No ")) ?? out.join(" | ")
  }
  answer(cad, "ERASE", "L", "")
  return { ...line.start, z: lineStartZ(line) }
}

describe("CYLINDER", () => {
  it("asks a base and a height, its seam on the UCS's X (solid/c01)", () => {
    const cad = console()
    expect(written(cad, "CYLINDER", "0,0,0", "5", "8")).toEqual([
      "CYLINDER",
      "Specify center point of base or [3P/2P/Ttr/Elliptical]: 0,0,0",
      "Specify base radius or [Diameter]: 5",
      "Specify height or [2Point/Axis endpoint]: 8",
    ])
    expect(listed(cad)).toEqual([
      "      Solid type = Cylinder",
      "         Position, X = 0.0000    Y = 0.0000    Z = 0.0000",
      "           Radius: 5.0000",
      "           Height: 8.0000",
    ])
    const { brep } = last(cad)
    expect(brepIsClosed(brep)).toBe(true)
    // ACIS's: a vertex on each circle, the base's run about -Z (c01's MPDUMP).
    expect(brep.vertices).toEqual([
      { x: 5, y: 0, z: 0 },
      { x: 5, y: 0, z: 8 },
    ])
    expect(brep.edges.map((e) => e.curve.kind)).toEqual(["circle", "circle"])
    const base = brep.edges[0].curve
    expect(base.kind === "circle" && base.normal).toEqual({ x: 0, y: 0, z: -1 })
    expect(brep.faces.map((f) => f.surface.kind)).toEqual([
      "cylinder",
      "plane",
      "plane",
    ])
    expect(brepVolume(brep)).toBeCloseTo(628.318531, 6)
    expect(written(cad, "AREA", "O", "L").at(-1)).toBe(
      "Area = 408.4070, Perimeter = 0.0000"
    )
  })

  it("takes 3P, 2P and Diameter, a 3P base tilted into its points' plane (c02)", () => {
    const cad = console()
    answer(cad, "CYLINDER", "3P", "0,0,0", "10,0,0", "0,10,0", "5")
    expect(listed(cad).slice(1, 3)).toEqual([
      "         Position, X = 5.0000    Y = 5.0000    Z = 0.0000",
      "           Radius: 7.0711",
    ])
    expect(
      written(cad, "CYLINDER", "2P", "50,0,0", "60,0,0", "5").slice(1, 3)
    ).toEqual([
      "Specify center point of base or [3P/2P/Ttr/Elliptical]: 2P",
      "Specify first end point of diameter: 50,0,0",
    ])
    expect(listed(cad)[2]).toBe("           Radius: 5.0000")
    expect(
      written(cad, "CYLINDER", "100,0,0", "D", "6", "5").slice(2, 4)
    ).toEqual([
      "Specify base radius or [Diameter] <5.0000>: D",
      "Specify diameter <10.0000>: 6",
    ])
    answer(cad, "CYLINDER", "3P", "200,0,0", "210,0,0", "200,0,10", "5")
    expect(listed(cad).slice(1, 4)).toEqual([
      "         Position, X = 205.0000  Y = 0.0000    Z = 5.0000",
      "           Normal: X = 0.0000    Y = -1.0000   Z = 0.0000",
      "           Radius: 7.0711",
    ])
    // Its seam turned to the plane's arbitrary axis' -X (c02's MPDUMP).
    expectAt(last(cad).brep.vertices[0], { x: 197.928932, y: 0, z: 5 })
    // 2P's second point is read in the first's plane (c02).
    answer(cad, "CYLINDER", "2P", "300,0,0", "310,0,4", "5")
    expect(listed(cad).slice(1, 3)).toEqual([
      "         Position, X = 305.0000  Y = 0.0000    Z = 0.0000",
      "           Radius: 5.0000",
    ])
  })

  it("makes Ttr's base tangent to two objects picked under TAN (c03, v05)", () => {
    const cad = console()
    answer(cad, "LINE", "0,0", "100,0", "", "LINE", "0,0", "0,100", "")
    answer(cad, "ZOOM", "E")
    expect(
      written(
        cad,
        "CYLINDER",
        "T",
        "FOO",
        "50,0",
        "_TAN",
        "50,0",
        "_TAN",
        "0,50",
        "FOO",
        "",
        "0",
        "10",
        "5"
      )
    ).toEqual([
      "CYLINDER",
      "Specify center point of base or [3P/2P/Ttr/Elliptical]: T",
      "Specify point on object for first tangent: FOO",
      "Requires a TAN object-snap and selection of Circle, Arc, or Line.",
      "Specify point on object for first tangent: 50,0",
      // Starred for a point typed without TAN (primitives/p244).
      "*Requires a TAN object-snap and selection of Circle, Arc, or Line.",
      "Specify point on object for first tangent: _TAN to 50,0",
      "Specify point on object for second tangent: _TAN to 0,50",
      "Specify radius of circle: FOO",
      "Requires numeric distance or two points.",
      "Specify radius of circle:",
      "Requires numeric distance or two points.",
      "Specify radius of circle: 0",
      "Value must be positive and nonzero.",
      "Specify radius of circle: 10",
      "Specify height or [2Point/Axis endpoint]: 5",
    ])
    expect(listed(cad).slice(1, 3)).toEqual([
      "         Position, X = 10.0000   Y = 10.0000   Z = 0.0000",
      "           Radius: 10.0000",
    ])
    answer(cad, "CIRCLE", "300,300", "5")
    expect(
      written(
        cad,
        "CYLINDER",
        "T",
        "_TAN",
        "50,0",
        "_TAN",
        "305,300",
        "1"
      ).slice(-2)
    ).toEqual([
      "Specify radius of circle <10.0000>: 1",
      "Circle does not exist.",
    ])
  })

  it("takes Elliptical's axes, the second's end giving the seam (c04, v05)", () => {
    const cad = console()
    expect(
      written(cad, "CYLINDER", "E", "0,0,0", "10,0,0", "0,3,0", "8").slice(1, 5)
    ).toEqual([
      "Specify center point of base or [3P/2P/Ttr/Elliptical]: E",
      "Specify endpoint of first axis or [Center]: 0,0,0",
      "Specify other endpoint of first axis: 10,0,0",
      "Specify endpoint of second axis: 0,3,0",
    ])
    expect(listed(cad).slice(1)).toEqual([
      "         Position, X = 5.0000    Y = 0.0000    Z = 0.0000",
      "     Major radius: 5.8310",
      "     Minor radius: 5.0000",
      "           Height: 8.0000",
      "         Rotation: 149",
    ])
    expect(last(cad).brep.vertices[0]).toEqual({ x: 0, y: 3, z: 0 })
    expect(
      written(cad, "CYLINDER", "E", "C", "50,0,0", "5", "3", "8").slice(2, 6)
    ).toEqual([
      "Specify endpoint of first axis or [Center]: C",
      "Specify center point: 50,0,0",
      "Specify distance to first axis: 5",
      "Specify endpoint of second axis: 3",
    ])
    expect(listed(cad).slice(2, 6)).toEqual([
      "     Major radius: 5.0000",
      "     Minor radius: 3.0000",
      "           Height: 8.0000",
      "         Rotation: 26",
    ])
    answer(cad, "CYLINDER", "E", "100,0,0", "100,10,0", "103,5,0", "8")
    expect(listed(cad).at(-1)).toBe("         Rotation: 0")
    expect(
      written(
        cad,
        "CYLINDER",
        "E",
        "C",
        "0,0,0",
        "FOO",
        "",
        "0",
        "-2",
        "5"
      ).slice(4)
    ).toEqual([
      "Specify distance to first axis: FOO",
      "Requires numeric distance, second point, or option keyword.",
      "Specify distance to first axis:",
      "Requires numeric distance, second point, or option keyword.",
      "Specify distance to first axis: 0",
      "Value must be positive and nonzero.",
      "Specify distance to first axis: -2",
      "Value must be positive and nonzero.",
      "Specify distance to first axis: 5",
    ])
    expect(written(cad, "FOO", "0,0,0", "3", "8").slice(0, 4)).toEqual([
      "Specify endpoint of second axis: FOO",
      "Point or option keyword required.",
      "Specify endpoint of second axis: 0,0,0",
      "Ellipse axes lengths must be positive and nonzero",
    ])
    // A first axis of no length refuses every second axis (c07).
    expect(
      written(cad, "CYLINDER", "E", "50,0,0", "50,0,0", "60,0,0").slice(-1)
    ).toEqual(["Ellipse axes lengths must be positive and nonzero"])
    answer(cad, "\u001b")
  })

  it("rises to Axis endpoint or 2Point, down when negative (c05, c07, c13)", () => {
    const cad = console()
    answer(cad, "CYLINDER", "0,0,0", "5", "A", "10,0,10")
    expect(listed(cad).slice(1, 5)).toEqual([
      "         Position, X = 0.0000    Y = 0.0000    Z = 0.0000",
      "           Normal: X = 0.7071    Y = 0.0000    Z = 0.7071",
      "           Radius: 5.0000",
      "           Height: 14.1421",
    ])
    // Its seam at the axis' arbitrary axis' -X (c05's MPDUMP).
    expectAt(last(cad).brep.vertices[0], { x: 0, y: -5, z: 0 })
    answer(cad, "CYLINDER", "50,0,0", "5", "2P", "0,0,0", "0,0,7")
    expect(listed(cad).at(-1)).toBe("           Height: 7.0000")
    answer(cad, "CYLINDER", "100,0,0", "5", "-6")
    expect(listed(cad)[2]).toBe(
      "           Normal: X = 0.0000    Y = 0.0000    Z = -1.0000"
    )
    expect(
      written(
        cad,
        "CYLINDER",
        "0,0,0",
        "5",
        "A",
        "FOO",
        "0,0,0",
        "0,0,9"
      ).slice(3)
    ).toEqual([
      "Specify height or [2Point/Axis endpoint] <-6.0000>: A",
      "Specify axis endpoint: FOO",
      "Point or option keyword required.",
      "Specify axis endpoint: 0,0,0",
      "Value must be nonzero.",
      "Specify axis endpoint: 0,0,9",
    ])
    // Straight up its seam stays on the UCS's X (c15).
    expect(last(cad).brep.vertices[0]).toEqual({ x: 5, y: 0, z: 0 })
    // Center, which the height declares, asks the axis endpoint (c13).
    expect(
      written(cad, "CYLINDER", "0,0,0", "2", "C", "0,0,4").slice(-2)
    ).toEqual([
      "Specify height or [2Point/Axis endpoint] <9.0000>: C",
      "Specify axis endpoint: 0,0,4",
    ])
  })

  it("refuses what makes no cylinder (c06, c08)", () => {
    const cad = console()
    expect(
      written(
        cad,
        "CYLINDER",
        "FOO",
        "",
        "0,0,0",
        "FOO",
        "",
        "0",
        "-2",
        "D",
        "FOO",
        "",
        "0",
        "10",
        "FOO",
        "",
        "0",
        "4"
      ).slice(1)
    ).toEqual([
      "Specify center point of base or [3P/2P/Ttr/Elliptical]: FOO",
      "Point or option keyword required.",
      "Specify center point of base or [3P/2P/Ttr/Elliptical]:",
      "Point or option keyword required.",
      "Specify center point of base or [3P/2P/Ttr/Elliptical]: 0,0,0",
      "Specify base radius or [Diameter]: FOO",
      "Requires numeric distance, second point, or option keyword.",
      "Specify base radius or [Diameter]:",
      "Requires numeric distance, second point, or option keyword.",
      "Specify base radius or [Diameter]: 0",
      "Value must be positive and nonzero.",
      "Specify base radius or [Diameter]: -2",
      "Value must be positive and nonzero.",
      "Specify base radius or [Diameter]: D",
      "Specify diameter: FOO",
      "Requires numeric distance, second point, or option keyword.",
      "Specify diameter:",
      "Requires numeric distance, second point, or option keyword.",
      "Specify diameter: 0",
      "Value must be positive and nonzero.",
      "Specify diameter: 10",
      "Specify height or [2Point/Axis endpoint]: FOO",
      "Requires numeric distance, second point, or option keyword.",
      "Specify height or [2Point/Axis endpoint]:",
      "Requires numeric distance, second point, or option keyword.",
      "Specify height or [2Point/Axis endpoint]: 0",
      "Value must be nonzero.",
      "Specify height or [2Point/Axis endpoint]: 4",
    ])
    expect(written(cad, "CYLINDER", "50,0,0", "", "").slice(2)).toEqual([
      "Specify base radius or [Diameter] <5.0000>:",
      "Specify height or [2Point/Axis endpoint] <4.0000>:",
    ])
    expect(
      written(
        cad,
        "CYLINDER",
        "3P",
        "0,0,0",
        "0,0,0",
        "10,0,0",
        "20,0,0",
        "0,10,0",
        "5"
      ).slice(3, 8)
    ).toEqual([
      "Specify second point: 0,0,0",
      "Points cannot be collinear. *Invalid*",
      "Specify second point: 10,0,0",
      "Specify third point: 20,0,0",
      "Points cannot be collinear. *Invalid*",
    ])
    expect(
      written(cad, "CYLINDER", "2P", "50,0,0", "50,0,0", "60,0,0", "5").slice(
        3,
        5
      )
    ).toEqual([
      "Specify second end point of diameter: 50,0,0",
      "Points cannot be coincident. *Invalid*",
    ])
  })

  it("lies in the UCS, an ellipse's Rotation read there (c09)", () => {
    const cad = console()
    answer(cad, "UCS", "X", "30", "CYLINDER", "0,0,0", "5", "8")
    answer(cad, "UCS", "W", "UCS", "Z", "30")
    answer(cad, "CYLINDER", "E", "50,0,3", "60,0", "52,3", "5")
    expect(listed(cad).slice(2, 4)).toEqual([
      "     Major radius: 5.0000",
      "     Minor radius: 4.2426",
    ])
    expect(listed(cad).at(-1)).toBe("         Rotation: 135")
    answer(cad, "UCS", "W")
    const [ellipse, tilted] = listedAll(cad)
    expect(ellipse.at(-1)).toBe("         Rotation: 165")
    expect(tilted[2]).toBe(
      "           Normal: X = 0.0000    Y = -0.5000   Z = 0.8660"
    )
    // In a tilted UCS its seam is the UCS's X (c09's MPDUMP).
    expect(solids(cad)[0].brep.vertices[0]).toEqual({ x: 5, y: 0, z: 0 })
  })

  // probe primitives/p240: whichever axis was given second, its major lies
  // along the axis' arbitrary -X, its minor along its Y (0.8944, 0.4472, 0
  // here), its seam at the second axis' end.
  it.each([
    [["0,0,0", "10,0", "5,3"], 5, 3, { x: 5.8944, y: -1.7889, z: 2.2361 }],
    [["50,0,0", "60,0", "58,0"], 5, 3, { x: 55.8944, y: -1.7889, z: 2.2361 }],
    [
      ["100,0,0", "110,0", "108,3"],
      5,
      4.2426,
      { x: 106.2649, y: -2.5298, z: 3.1623 },
    ],
    [["150,0,0", "160,0", "155,8"], 8, 5, { x: 162.1554, y: 3.5777, z: 0 }],
    [["200,0,0", "210,0", "197,0"], 8, 5, { x: 212.1554, y: 3.5777, z: 0 }],
  ])(
    "tilts an elliptical base %j by Axis endpoint, its major along the arbitrary -X (primitives/p240)",
    ([first, other, second], major, minor, seam) => {
      const cad = console()
      const center = first.split(",").map(Number)
      const axis = `${center[0]},10,10`
      answer(cad, "CYLINDER", "E", first, other, second, "A", axis)
      const { brep } = last(cad)
      const base = brep.edges[0].curve
      if (base.kind !== "ellipse") throw new Error(base.kind)
      const length = Math.hypot(
        base.majorAxis.x,
        base.majorAxis.y,
        base.majorAxis.z
      )
      expect(length).toBeCloseTo(major, 4)
      expect(length * base.ratio).toBeCloseTo(minor, 4)
      expect(Math.abs(base.majorAxis.x / length)).toBeCloseTo(0.8944, 4)
      expect(Math.abs(base.majorAxis.y / length)).toBeCloseTo(0.4472, 4)
      expect(base.majorAxis.z).toBeCloseTo(0, 9)
      expectAt(brep.vertices[0], seam, 4)
    }
  )

  it("says a height of 0 in the input function's words, 2Point's and the axis' none in its own (primitives/p214, solid/c06, c07)", () => {
    const spanish = console(es)
    expect(
      written(
        spanish,
        "CILINDRO",
        "0,0,0",
        "5",
        "0",
        "_2P",
        "0,0,0",
        "0,0,0",
        "0,0,8",
        "CILINDRO",
        "50,0,0",
        "5",
        "_A",
        "50,0,0",
        "50,0,9",
        "CONO",
        "100,0,0",
        "5",
        "0",
        "8"
      )
    ).toEqual([
      "CILINDRO",
      "Precise centro de base o [3P/2P/Ttr/Elíptico]: 0,0,0",
      "Precise radio de base o [Diámetro]: 5",
      "Precise altura o [2Puntos/punto final Eje]: 0",
      "El valor debe ser diferente de cero.",
      "Precise altura o [2Puntos/punto final Eje]: _2P",
      "Precise primer punto: 0,0,0",
      "Precise segundo punto: 0,0,0",
      "No puede ser un valor igual a cero.",
      "Precise segundo punto: 0,0,8",
      "CILINDRO",
      "Precise centro de base o [3P/2P/Ttr/Elíptico]: 50,0,0",
      "Precise radio de base o [Diámetro] <5.0000>: 5",
      "Precise altura o [2Puntos/punto final Eje] <8.0000>: _A",
      "Precise punto final de eje: 50,0,0",
      "No puede ser un valor igual a cero.",
      "Precise punto final de eje: 50,0,9",
      "CONO",
      "Precise centro de base o [3P/2P/Ttr/Elíptico]: 100,0,0",
      "Precise radio de base o [Diámetro] <5.0000>: 5",
      "Indique altura o [2Puntos/punto final Eje/Radio superior] <9.0000>: 0",
      "El valor debe ser diferente de cero.",
      "Indique altura o [2Puntos/punto final Eje/Radio superior] <9.0000>: 8",
    ])
    const portuguese = console(ptBR)
    expect(
      written(
        portuguese,
        "CILINDRO",
        "0,0,0",
        "5",
        "0",
        "_2P",
        "0,0,0",
        "0,0,0",
        "0,0,8",
        "CILINDRO",
        "50,0,0",
        "5",
        "_A",
        "50,0,0",
        "50,0,9",
        "CONE",
        "100,0,0",
        "5",
        "0"
      ).filter((line) => line.endsWith("zero."))
    ).toEqual([
      "O valor deve ser diferente de zero.",
      "Este valor precisa ser diferente de zero.",
      "Este valor precisa ser diferente de zero.",
      "O valor deve ser diferente de zero.",
    ])
  })

  it("moves, turns, mirrors and scales as a cylinder, not exploded (c10, c11)", () => {
    const cad = console()
    answer(cad, "CYLINDER", "0,0,0", "5", "8")
    answer(
      cad,
      "MOVE",
      "L",
      "",
      "0,0,0",
      "5,5,3",
      "ROTATE",
      "L",
      "",
      "0,0",
      "30"
    )
    expect(listed(cad)[1]).toBe(
      "         Position, X = 1.8301    Y = 6.8301    Z = 3.0000"
    )
    answer(
      cad,
      "MIRROR",
      "L",
      "",
      "0,40",
      "10,40",
      "N",
      "SCALE",
      "L",
      "",
      "0,0",
      "2"
    )
    expect(listed(cad).slice(1)).toEqual([
      "         Position, X = 3.6603    Y = 146.3397  Z = 6.0000",
      "           Radius: 10.0000",
      "           Height: 16.0000",
    ])
    answer(cad, "CYLINDER", "E", "100,0,0", "110,0", "102,3", "5")
    answer(
      cad,
      "ROTATE",
      "L",
      "",
      "100,0",
      "30",
      "MIRROR",
      "L",
      "",
      "0,40",
      "10,40",
      "Y"
    )
    expect(listed(cad).at(-1)).toBe("         Rotation: 195")
    for (const solid of solids(cad)) expect(brepIsClosed(solid.brep)).toBe(true)
    expect(brepVolume(solids(cad)[1].brep)).toBeCloseTo(8 * 628.318531, 5)
    // AutoCAD explodes it into regions and a SURFACE: no surface here.
    expect(written(cad, "EXPLODE", "L", "").slice(1, 4)).toEqual([
      "Select objects: L",
      "1 found",
      "1 was not able to be exploded.",
    ])
    answer(cad, "")
  })

  it("snaps at its circles' centres and quadrants, nothing on its isolines (s03, s10)", () => {
    const cad = console()
    answer(
      cad,
      "ZOOM",
      "W",
      "-10,-10",
      "40,40",
      "CYLINDER",
      "10,10,0",
      "5",
      "8"
    )
    expect(snapped(cad, "_END", "15.1,10.1")).toBe(
      "No Endpoint found for specified point."
    )
    expect(snapped(cad, "_CEN", "15.1,10.1")).toEqual({ x: 10, y: 10, z: 0 })
    expectAt(snapped(cad, "_QUA", "10.1,15.1") as Vec3, { x: 10, y: 15, z: 0 })
    answer(cad, "-VIEW", "_SEISO", "ZOOM", "E")
    expect(snapped(cad, "_NEA", "10,15,4")).toBe(
      "No found for specified point."
    )
    expect(snapped(cad, "_CEN", "10,15,4")).toBe(
      "No Center found for specified point."
    )
    expectAt(snapped(cad, "_QUA", "10,15,7.9") as Vec3, { x: 10, y: 15, z: 8 })
    expectAt(snapped(cad, "_CEN", "10,15,7.9") as Vec3, { x: 10, y: 10, z: 8 })
  })
})

describe("CONE", () => {
  it("measures a point typed at Top radius from where the height prompt left the axis (primitives/p248)", () => {
    const cad = console()
    answer(cad, "_CONE", "0,0,0", "5", "_T", "@2,0", "8")
    const top = last(cad).primitive
    expect(top?.kind === "cone" && top.topRadius).toBeCloseTo(2, 9)
  })

  it("narrows to an apex, an Endpoint (solid/k01, s10)", () => {
    const cad = console()
    expect(written(cad, "CONE", "0,0,0", "5", "8")).toEqual([
      "CONE",
      "Specify center point of base or [3P/2P/Ttr/Elliptical]: 0,0,0",
      "Specify base radius or [Diameter]: 5",
      "Specify height or [2Point/Axis endpoint/Top radius]: 8",
    ])
    expect(listed(cad)).toEqual([
      "      Solid type = Cone",
      "         Position, X = 0.0000    Y = 0.0000    Z = 0.0000",
      "      Base radius: 5.0000",
      "       Top radius: 0.0000",
      "           Height: 8.0000",
    ])
    const { brep } = last(cad)
    expect(brep.vertices).toEqual([
      { x: 5, y: 0, z: 0 },
      { x: 0, y: 0, z: 8 },
    ])
    expect(brep.edges.map((e) => e.curve.kind)).toEqual(["circle", "point"])
    expect(brepIsClosed(brep)).toBe(true)
    expect(brepVolume(brep)).toBeCloseTo(209.43951, 5)
    expect(written(cad, "AREA", "O", "L").at(-1)).toBe(
      "Area = 226.7284, Perimeter = 0.0000"
    )
    answer(cad, "-VIEW", "_SEISO", "ZOOM", "E")
    expect(snapped(cad, "_END", "0,0,8")).toEqual({ x: 0, y: 0, z: 8 })
    expect(snapped(cad, "_END", "5,0,0")).toBe(
      "No Endpoint found for specified point."
    )
  })

  it("takes Top radius, kept for the next, a top as wide making a cylinder (k02, k04)", () => {
    const cad = console()
    expect(written(cad, "CONE", "0,0,0", "5", "T", "2", "8").slice(3)).toEqual([
      "Specify height or [2Point/Axis endpoint/Top radius]: T",
      "Specify top radius <0.0000>: 2",
      "Specify height or [2Point/Axis endpoint]: 8",
    ])
    expect(written(cad, "AREA", "O", "L").at(-1)).toBe(
      "Area = 278.9986, Perimeter = 0.0000"
    )
    expect(written(cad, "CONE", "50,0,0", "5", "T", "5", "8")[4]).toBe(
      "Specify top radius <2.0000>: 5"
    )
    expect(last(cad).brep.faces[0].surface.kind).toBe("cylinder")
    answer(cad, "CONE", "100,0,0", "5", "T", "8", "6")
    expect(listed(cad).slice(2, 4)).toEqual([
      "      Base radius: 5.0000",
      "       Top radius: 8.0000",
    ])
    expect(brepArea(last(cad).brep)).toBeCloseTo(553.569521, 5)
    expect(
      written(cad, "CONE", "150,0,0", "5", "T", "FOO", "-1", "", "-4").slice(4)
    ).toEqual([
      "Specify top radius <8.0000>: FOO",
      "Requires numeric distance, second point, or option keyword.",
      "Specify top radius <8.0000>: -1",
      "Value must be positive.",
      "Specify top radius <8.0000>:",
      "Specify height or [2Point/Axis endpoint] <6.0000>: -4",
    ])
    expect(listed(cad)[2]).toBe(
      "           Normal: X = 0.0000    Y = 0.0000    Z = -1.0000"
    )
  })

  it("takes Elliptical, LIST giving its base's radii and its top's major (k03)", () => {
    const cad = console()
    answer(cad, "CONE", "E", "0,0,0", "10,0,0", "0,3,0", "8")
    expect(listed(cad).slice(2)).toEqual([
      "Base major radius: 5.8310",
      "Base minor radius: 5.0000",
      " Top major radius: 0.0000",
      "           Height: 8.0000",
      "         Rotation: 149",
    ])
    expect(brepVolume(last(cad).brep)).toBeCloseTo(244.246342, 5)
    answer(cad, "CONE", "E", "50,0,0", "60,0,0", "50,3,0", "T", "2", "8")
    expect(listed(cad)[4]).toBe(" Top major radius: 2.0000")
    expect(written(cad, "AREA", "O", "L").at(-1)).toBe(
      "Area = 302.5128, Perimeter = 0.0000"
    )
  })

  it("offers the shared radius at Elliptical's distance to the first axis, which an ellipse leaves (primitives/p151, p236, p247)", () => {
    const cad = console()
    answer(cad, "CYLINDER", "0,0,0", "7", "8")
    expect(
      written(cad, "CYLINDER", "_E", "_C", "50,0,0", "", "50,3,0", "8").slice(
        4,
        6
      )
    ).toEqual([
      "Specify distance to first axis <7.0000>:",
      "Specify endpoint of second axis: 50,3,0",
    ])
    expect(listed(cad).slice(2, 4)).toEqual([
      "     Major radius: 7.0000",
      "     Minor radius: 3.0000",
    ])
    answer(cad, "CYLINDER", "_E", "_C", "100,0,0", "4", "100,2,0", "8")
    expect(
      written(cad, "CONE", "_E", "_C", "150,0,0", "", "150,2,0", "8")[4]
    ).toBe("Specify distance to first axis <7.0000>:")
    answer(cad, "CONE", "_E", "200,0,0", "212,0", "206,3", "8")
    answer(cad, "SPHERE", "300,0,0", "3")
    expect(
      written(cad, "CONE", "_E", "_C", "350,0,0", "", "350,1,0", "8")[4]
    ).toBe("Specify distance to first axis <3.0000>:")
    expect(listed(cad).slice(2, 4)).toEqual([
      "Base major radius: 3.0000",
      "Base minor radius: 1.0000",
    ])
    expect(written(cad, "CYLINDER", "400,0,0", "", "8")[2]).toBe(
      "Specify base radius or [Diameter] <3.0000>:"
    )
  })

  it("offers the top radius the last cone was made with, not one answered in its run (primitives/p207, p418)", () => {
    const cad = console()
    expect(
      written(cad, "CONE", "0,0,0", "5", "_T", "_D", "2", "_T", "3", "8").slice(
        3
      )
    ).toEqual([
      "Specify height or [2Point/Axis endpoint/Top radius]: _T",
      "Specify top radius <0.0000>: _D",
      "Requires numeric distance, second point, or option keyword.",
      "Specify top radius <0.0000>: 2",
      "Specify height or [2Point/Axis endpoint]: _T",
      "Specify top radius <0.0000>: 3",
      "Specify height or [2Point/Axis endpoint]: 8",
    ])
    expect(listed(cad)[3]).toBe("       Top radius: 3.0000")
    // A cone made with no Top radius leaves 0 for the next, PYRAMID's too.
    answer(cad, "CONE", "60,0,0", "5", "_T", "2", "8")
    answer(cad, "CONE", "_E", "80,0,0", "90,0", "85,3", "-8")
    expect(
      written(cad, "PYRAMID", "200,0,0", "5", "_T", "2", "8").slice(4, 6)
    ).toEqual([
      "Specify height or [2Point/Axis endpoint/Top radius] <-8.0000>: _T",
      "Specify top radius <0.0000>: 2",
    ])
  })

  it("refuses Enter at a height with no default in pt-BR too (k04, p215, p239: pt-BR's console ends it)", () => {
    const portuguese = console(ptBR)
    expect(written(portuguese, "CONE", "0,0,0", "5", "", "8").slice(3)).toEqual(
      [
        "Especificar altura ou [2Pontos/ponto final Eixo/Raio superior]:",
        "Requer distância numérica, segundo ponto ou opção.",
        "Especificar altura ou [2Pontos/ponto final Eixo/Raio superior]: 8",
      ]
    )
    expect(solids(portuguese)).toHaveLength(1)
  })

  it("asks in each language, by its own name (n02)", () => {
    const spanish = console(es)
    expect(written(spanish, "CONO", "0,0,0", "5", "R", "2", "8")).toEqual([
      "CONO",
      "Precise centro de base o [3P/2P/Ttr/Elíptico]: 0,0,0",
      "Precise radio de base o [Diámetro]: 5",
      "Indique altura o [2Puntos/punto final Eje/Radio superior]: R",
      "Precise radio superior <0.0000>: 2",
      "Precise altura o [2Puntos/punto final Eje]: 8",
    ])
    expect(listed(spanish).slice(2, 4)).toEqual([
      "    Radio de base: 5.0000",
      "   Radio superior: 2.0000",
    ])
    const portuguese = console(ptBR)
    expect(
      written(portuguese, "CILINDRO", "E", "0,0,0", "10,0,0", "0,3,0", "8")
    ).toEqual([
      "CILINDRO",
      "Especificar centro do ponto base ou [3P/2P/Ttr/Elíptico]: E",
      "Especificar ponto final do primeiro eixo ou [Centro]: 0,0,0",
      "Especificar outro ponto final do primeiro eixo: 10,0,0",
      "Especificar ponto final do segundo eixo: 0,3,0",
      "Especificar altura ou [2Pontos/ponto final Eixo]: 8",
    ])
    expect(listed(portuguese).slice(2, 4)).toEqual([
      "       Raio maior: 5.8310",
      "       Raio menor: 5.0000",
    ])
  })

  it("is saved and read back, a frustum and an elliptical cone too", () => {
    const cad = console()
    answer(cad, "CONE", "0,0,0", "5", "T", "2", "8")
    answer(cad, "CONE", "E", "50,0,0", "60,0,0", "50,3,0", "8")
    answer(cad, "CYLINDER", "100,0,0", "5", "A", "110,0,10")
    const document = cad.runtime.document
    const file = serializeDrawing(
      snapshotOf(document.getEntities(), { settings: document.getSettings() })
    )
    expect(parseDrawingFile(file).entities).toEqual(document.getEntities())
  })
})

describe("CYLINDER and CONE, answer by answer", () => {
  it("refuses another prompt's keyword at each prompt (primitives/p205, p206, p210)", () => {
    const cad = console()
    expect(
      written(
        cad,
        "_CYLINDER",
        "_D",
        "_A",
        "0,0,0",
        "_A",
        "_E",
        "5",
        "_T",
        "_D",
        "_E",
        "8"
      ).slice(1)
    ).toEqual([
      "Specify center point of base or [3P/2P/Ttr/Elliptical]: _D",
      "Point or option keyword required.",
      "Specify center point of base or [3P/2P/Ttr/Elliptical]: _A",
      "Point or option keyword required.",
      "Specify center point of base or [3P/2P/Ttr/Elliptical]: 0,0,0",
      "Specify base radius or [Diameter]: _A",
      "Requires numeric distance, second point, or option keyword.",
      "Specify base radius or [Diameter]: _E",
      "Requires numeric distance, second point, or option keyword.",
      "Specify base radius or [Diameter]: 5",
      "Specify height or [2Point/Axis endpoint]: _T",
      "Requires numeric distance, second point, or option keyword.",
      "Specify height or [2Point/Axis endpoint]: _D",
      "Requires numeric distance, second point, or option keyword.",
      "Specify height or [2Point/Axis endpoint]: _E",
      "Requires numeric distance, second point, or option keyword.",
      "Specify height or [2Point/Axis endpoint]: 8",
    ])
    // CONE's height takes no Center, which CYLINDER's hides (p206).
    expect(written(cad, "_CONE", "50,0,0", "5", "_C", "8").slice(3)).toEqual([
      "Specify height or [2Point/Axis endpoint/Top radius] <8.0000>: _C",
      "Requires numeric distance, second point, or option keyword.",
      "Specify height or [2Point/Axis endpoint/Top radius] <8.0000>: 8",
    ])
    answer(cad, "_LINE", "0,0", "100,0", "", "_LINE", "0,0", "0,100", "")
    answer(cad, "_ZOOM", "_E")
    expect(
      written(
        cad,
        "_CYLINDER",
        "_T",
        "_D",
        "_TAN",
        "50,0",
        "_D",
        "_TAN",
        "0,50",
        "_D",
        "10",
        "5"
      ).slice(1)
    ).toEqual([
      "Specify center point of base or [3P/2P/Ttr/Elliptical]: _T",
      "Specify point on object for first tangent: _D",
      "Requires a TAN object-snap and selection of Circle, Arc, or Line.",
      "Specify point on object for first tangent: _TAN to 50,0",
      "Specify point on object for second tangent: _D",
      "Requires a TAN object-snap and selection of Circle, Arc, or Line.",
      "Specify point on object for second tangent: _TAN to 0,50",
      "Specify radius of circle <5.0000>: _D",
      "Requires numeric distance or two points.",
      "Specify radius of circle <5.0000>: 10",
      "Specify height or [2Point/Axis endpoint] <8.0000>: 5",
    ])
  })

  it("refuses Enter at every point prompt (primitives/p211, p238)", () => {
    const cad = console()
    expect(
      written(
        cad,
        "_CYLINDER",
        "_3P",
        "",
        "0,0,0",
        "",
        "10,0,0",
        "",
        "0,10,0",
        "5"
      ).slice(2)
    ).toEqual([
      "Specify first point:",
      "Point or option keyword required.",
      "Specify first point: 0,0,0",
      "Specify second point:",
      "Point or option keyword required.",
      "Specify second point: 10,0,0",
      "Specify third point:",
      "Point or option keyword required.",
      "Specify third point: 0,10,0",
      "Specify height or [2Point/Axis endpoint]: 5",
    ])
    expect(
      written(cad, "_CYLINDER", "_2P", "", "50,0,0", "", "60,0,0", "5").slice(2)
    ).toEqual([
      "Specify first end point of diameter:",
      "Point or option keyword required.",
      "Specify first end point of diameter: 50,0,0",
      "Specify second end point of diameter:",
      "Point or option keyword required.",
      "Specify second end point of diameter: 60,0,0",
      "Specify height or [2Point/Axis endpoint] <5.0000>: 5",
    ])
    expect(
      written(
        cad,
        "_CYLINDER",
        "_E",
        "",
        "100,0,0",
        "",
        "110,0,0",
        "",
        "100,3,0",
        "5"
      ).slice(2)
    ).toEqual([
      "Specify endpoint of first axis or [Center]:",
      "Point or option keyword required.",
      "Specify endpoint of first axis or [Center]: 100,0,0",
      "Specify other endpoint of first axis:",
      "Point or option keyword required.",
      "Specify other endpoint of first axis: 110,0,0",
      "Specify endpoint of second axis:",
      "Point or option keyword required.",
      "Specify endpoint of second axis: 100,3,0",
      "Specify height or [2Point/Axis endpoint] <5.0000>: 5",
    ])
    expect(
      written(
        cad,
        "_CYLINDER",
        "_E",
        "_C",
        "",
        "150,0,0",
        "3",
        "",
        "150,5,0",
        "5"
      ).slice(3)
    ).toEqual([
      "Specify center point:",
      "Point or option keyword required.",
      "Specify center point: 150,0,0",
      "Specify distance to first axis <5.0000>: 3",
      "Specify endpoint of second axis:",
      "Point or option keyword required.",
      "Specify endpoint of second axis: 150,5,0",
      "Specify height or [2Point/Axis endpoint] <5.0000>: 5",
    ])
    expect(
      written(cad, "_CYLINDER", "200,0,0", "5", "_A", "", "200,0,8").slice(4)
    ).toEqual([
      "Specify axis endpoint:",
      "Point or option keyword required.",
      "Specify axis endpoint: 200,0,8",
    ])
    expect(
      written(
        cad,
        "_CYLINDER",
        "250,0,0",
        "5",
        "_2P",
        "",
        "0,0,0",
        "",
        "0,0,5"
      ).slice(4)
    ).toEqual([
      "Specify first point:",
      "Point or option keyword required.",
      "Specify first point: 0,0,0",
      "Specify second point:",
      "Point or option keyword required.",
      "Specify second point: 0,0,5",
    ])
    expect(
      written(
        cad,
        "_CONE",
        "_3P",
        "",
        "300,0,0",
        "",
        "310,0,0",
        "",
        "300,10,0",
        "5"
      ).slice(2, 4)
    ).toEqual(["Specify first point:", "Point or option keyword required."])
    expect(
      written(cad, "_CONE", "_2P", "", "350,0,0", "", "360,0,0", "5").slice(
        2,
        4
      )
    ).toEqual([
      "Specify first end point of diameter:",
      "Point or option keyword required.",
    ])
    expect(solids(cad)).toHaveLength(8)
  })

  it("reads `@` from the prompt's base, a bare `@` its base itself (primitives/p216, p218, p219)", () => {
    const cad = console()
    answer(cad, "_CYLINDER", "_E", "0,0,0", "10,0,0", "@0,3", "8")
    expect(listed(cad).slice(2)).toEqual([
      "     Major radius: 5.0000",
      "     Minor radius: 3.0000",
      "           Height: 8.0000",
      "         Rotation: 90",
    ])
    answer(cad, "_CYLINDER", "0,0,0", "10,0,0", "@0,5,0")
    expect(listed(cad).slice(2)).toEqual([
      "           Radius: 10.0000",
      "           Height: 5.0000",
    ])
    answer(cad, "_CYLINDER", "50,0,0", "60,0,0", "_A", "@0,0,9")
    expect(listed(cad).slice(1)).toEqual([
      "         Position, X = 50.0000   Y = 0.0000    Z = 0.0000",
      "           Radius: 10.0000",
      "           Height: 9.0000",
    ])
    expect(
      written(cad, "_CYLINDER", "_E", "0,0,0", "10,0,0", "@").slice(-2)
    ).toEqual([
      "Specify endpoint of second axis: @",
      "Ellipse axes lengths must be positive and nonzero",
    ])
  })

  it("runs a bare number from the base toward the cursor (primitives/p221, p222)", () => {
    const cad = console()
    answer(cad, "_CYLINDER", "_E", "0,0,0", "10,0,0", "3", "8")
    expect(listed(cad).slice(2)).toEqual([
      "     Major radius: 5.0000",
      "     Minor radius: 3.0000",
      "           Height: 8.0000",
      "         Rotation: 22",
    ])
    answer(cad, "_CYLINDER", "_3P", "0,0,0", "10", "0,10,0", "5")
    expect(listed(cad).slice(1, 3)).toEqual([
      "         Position, X = 3.3818    Y = 5.0000    Z = 0.0000",
      "           Radius: 6.0363",
    ])
    answer(cad, "_CYLINDER", "100,0,0", "5", "_A", "8")
    expect(listed(cad).slice(1, 5)).toEqual([
      "         Position, X = 100.0000  Y = 0.0000    Z = 0.0000",
      "           Normal: X = 0.8529    Y = 0.5221    Z = 0.0000",
      "           Radius: 5.0000",
      "           Height: 8.0000",
    ])
  })

  it("measures a radius point off the base's plane in space (primitives/p242)", () => {
    const cad = console()
    answer(cad, "_CYLINDER", "0,0,0", "3,0,4", "8")
    expect(listed(cad)[2]).toBe("           Radius: 5.0000")
    answer(cad, "_SPHERE", "50,0,0", "53,0,4")
    expect(listed(cad)[2]).toBe("           Radius: 5.0000")
    answer(cad, "_TORUS", "100,0,0", "103,0,4", "1")
    expect(listed(cad)[2]).toBe("     Torus radius: 5.0000")
  })

  it("makes Ttr's base tangent to a circle and an arc (primitives/p225)", () => {
    const cad = console()
    answer(cad, "_CIRCLE", "0,0", "10", "_ARC", "_C", "30,0", "40,0", "20,0")
    answer(cad, "_ZOOM", "_E")
    answer(cad, "_CYLINDER", "_T", "_TAN", "0,10", "_TAN", "30,10", "10", "5")
    expect(listed(cad).slice(1, 3)).toEqual([
      "         Position, X = 15.0000   Y = 13.2288   Z = 0.0000",
      "           Radius: 10.0000",
    ])
  })

  it("leaves a typed point to Ortho, which bends a bare number (primitives/p228)", () => {
    const cad = console()
    answer(cad, "_ORTHOMODE", "1", "_CYLINDER", "0,0,0", "3,4", "8")
    answer(cad, "_CYLINDER", "50,0,0", "5", "_A", "53,0,4")
    answer(cad, "_CYLINDER", "150,0,0", "5", "_A", "8")
    const [bent, typed, radius] = listedAll(cad)
    expect(bent.slice(1, 3)).toEqual([
      "         Position, X = 150.0000  Y = 0.0000    Z = 0.0000",
      "           Normal: X = 1.0000    Y = 0.0000    Z = 0.0000",
    ])
    expect(typed.slice(2, 5)).toEqual([
      "           Normal: X = 0.6000    Y = 0.0000    Z = 0.8000",
      "           Radius: 5.0000",
      "           Height: 5.0000",
    ])
    expect(radius[2]).toBe("           Radius: 5.0000")
  })

  it("wears the current layer and properties at ELEVATION, those of its end when set mid-command (primitives/p234, p235)", () => {
    const cad = console()
    const l1 = cad.runtime.createLayer("L1", undefined, true)
    answer(cad, "_-COLOR", "3", "_CELTYPE", "DASHED", "_CELWEIGHT", "50")
    answer(cad, "_ELEVATION", "5", "_THICKNESS", "3")
    answer(cad, "_CYLINDER", "0,0", "5", "8", "_CONE", "20,0", "5", "8")
    answer(cad, "_SPHERE", "40,0", "5", "_TORUS", "60,0", "5", "1")
    for (const solid of solids(cad)) {
      expect(solid).toMatchObject({
        layerId: l1,
        color: "#00ff00",
        linetype: "Dashed",
        lineweight: 0.5,
      })
      expect(solid.primitive?.position.z).toBe(5)
    }
    const later = console()
    const l2 = later.runtime.createLayer("L2", undefined, true)
    answer(
      later,
      "_CYLINDER",
      "0,0",
      "'_-COLOR",
      "1",
      "5",
      "'_ELEVATION",
      "7",
      "8"
    )
    answer(later, "_TORUS", "50,0", "'_CLAYER", "0", "5", "'_-COLOR", "4", "1")
    const [cylinder, torus] = solids(later)
    expect(cylinder).toMatchObject({ layerId: l2, color: "#ff0000" })
    expect(cylinder.primitive?.position.z).toBe(0)
    expect(torus).toMatchObject({ layerId: "0", color: "#00ffff" })
    expect(torus.primitive?.position.z).toBe(7)
  })

  it("lies in a tilted UCS at its ELEVATION (primitives/p243)", () => {
    const cad = console()
    answer(cad, "_UCS", "_X", "30", "_ELEVATION", "5")
    answer(cad, "_SPHERE", "0,0", "5", "_TORUS", "50,0", "10", "2")
    answer(
      cad,
      "_CONE",
      "100,0",
      "5",
      "8",
      "_CYLINDER",
      "_2P",
      "150,0",
      "160,0",
      "8"
    )
    answer(cad, "_UCS", "_W")
    expect(listedAll(cad).map((block) => block[1])).toEqual([
      "         Position, X = 155.0000  Y = -2.5000   Z = 4.3301",
      "         Position, X = 100.0000  Y = -2.5000   Z = 4.3301",
      "         Position, X = 50.0000   Y = -2.5000   Z = 4.3301",
      "         Position, X = 0.0000    Y = -2.5000   Z = 4.3301",
    ])
  })
})

describe("SPHERE", () => {
  it("asks a centre and a radius, its one face with no edge (solid/h01)", () => {
    const cad = console()
    expect(written(cad, "SPHERE", "0,0,0", "5")).toEqual([
      "SPHERE",
      "Specify center point or [3P/2P/Ttr]: 0,0,0",
      "Specify radius or [Diameter]: 5",
    ])
    expect(listed(cad)).toEqual([
      "      Solid type = Sphere",
      "         Position, X = 0.0000    Y = 0.0000    Z = 0.0000",
      "           Radius: 5.0000",
    ])
    const { brep } = last(cad)
    expect(brep.vertices).toEqual([])
    expect(brep.edges).toEqual([])
    expect(brep.faces.map((f) => [f.surface.kind, f.loops.length])).toEqual([
      ["sphere", 0],
    ])
    expect(brepIsClosed(brep)).toBe(true)
    expect(brepVolume(brep)).toBeCloseTo(523.598776, 6)
    expect(written(cad, "AREA", "O", "L").at(-1)).toBe(
      "Area = 314.1593, Perimeter = 0.0000"
    )
  })

  it("takes 3P, 2P in space, Diameter and Ttr, its frame the UCS's (h02)", () => {
    const cad = console()
    answer(cad, "SPHERE", "3P", "0,0,0", "10,0,0", "0,10,0")
    expect(listed(cad).slice(1)).toEqual([
      "         Position, X = 5.0000    Y = 5.0000    Z = 0.0000",
      "           Radius: 7.0711",
    ])
    expect(written(cad, "SPHERE", "2P", "50,0,0", "60,0,4")).toEqual([
      "SPHERE",
      "Specify center point or [3P/2P/Ttr]: 2P",
      "Specify first end point of diameter: 50,0,0",
      "Specify second end point of diameter: 60,0,4",
    ])
    expect(listed(cad).slice(1)).toEqual([
      "         Position, X = 55.0000   Y = 0.0000    Z = 2.0000",
      "           Radius: 5.3852",
    ])
    expect(written(cad, "SPHERE", "100,0,0", "D", "6").slice(2)).toEqual([
      "Specify radius or [Diameter] <5.3852>: D",
      "Specify diameter <10.7703>: 6",
    ])
    expect(listed(cad)[2]).toBe("           Radius: 3.0000")
    answer(cad, "LINE", "200,0", "300,0", "", "LINE", "200,0", "200,100", "")
    answer(cad, "ZOOM", "E")
    expect(
      written(cad, "SPHERE", "T", "_TAN", "250,0", "_TAN", "200,50", "10")
    ).toEqual([
      "SPHERE",
      "Specify center point or [3P/2P/Ttr]: T",
      "Specify point on object for first tangent: _TAN to 250,0",
      "Specify point on object for second tangent: _TAN to 200,50",
      "Specify radius of circle <3.0000>: 10",
    ])
    expect(listed(cad).slice(1)).toEqual([
      "         Position, X = 210.0000  Y = 10.0000   Z = 0.0000",
      "           Radius: 10.0000",
    ])
    answer(cad, "SPHERE", "3P", "400,0,0", "410,0,0", "400,0,10")
    expect(listed(cad).slice(1)).toEqual([
      "         Position, X = 405.0000  Y = 0.0000    Z = 5.0000",
      "           Radius: 7.0711",
    ])
    // Upright whatever its points (h02's MPDUMP).
    const [{ surface }] = last(cad).brep.faces
    expect(surface.kind === "sphere" && surface.axis).toEqual({
      x: 0,
      y: 0,
      z: 1,
    })
  })

  it("refuses what makes no sphere, coincident points by that name (h03)", () => {
    const cad = console()
    expect(
      written(
        cad,
        "SPHERE",
        "FOO",
        "",
        "0,0,0",
        "FOO",
        "",
        "0",
        "-2",
        "D",
        "FOO",
        "0",
        "8"
      )
    ).toEqual([
      "SPHERE",
      "Specify center point or [3P/2P/Ttr]: FOO",
      "Point or option keyword required.",
      "Specify center point or [3P/2P/Ttr]:",
      "Point or option keyword required.",
      "Specify center point or [3P/2P/Ttr]: 0,0,0",
      "Specify radius or [Diameter]: FOO",
      "Requires numeric distance, second point, or option keyword.",
      "Specify radius or [Diameter]:",
      "Requires numeric distance, second point, or option keyword.",
      "Specify radius or [Diameter]: 0",
      "Value must be positive and nonzero.",
      "Specify radius or [Diameter]: -2",
      "Value must be positive and nonzero.",
      "Specify radius or [Diameter]: D",
      "Specify diameter: FOO",
      "Requires numeric distance, second point, or option keyword.",
      "Specify diameter: 0",
      "Value must be positive and nonzero.",
      "Specify diameter: 8",
    ])
    expect(written(cad, "SPHERE", "50,0,0", "")[2]).toBe(
      "Specify radius or [Diameter] <4.0000>:"
    )
    expect(listed(cad)[2]).toBe("           Radius: 4.0000")
    expect(
      written(
        cad,
        "SPHERE",
        "3P",
        "0,0,0",
        "0,0,0",
        "10,0,0",
        "20,0,0",
        "0,10,0"
      ).slice(2)
    ).toEqual([
      "Specify first point: 0,0,0",
      "Specify second point: 0,0,0",
      "Points cannot be coincident. *Invalid*",
      "Specify second point: 10,0,0",
      "Specify third point: 20,0,0",
      "Points cannot be collinear. *Invalid*",
      "Specify third point: 0,10,0",
    ])
    expect(
      written(cad, "SPHERE", "2P", "0,0,0", "0,0,0", "10,0,0").slice(3)
    ).toEqual([
      "Specify second end point of diameter: 0,0,0",
      "Points cannot be coincident. *Invalid*",
      "Specify second end point of diameter: 10,0,0",
    ])
  })

  it("says `Invalid point.` at 3P's first two points and 2P's ends, the third keeping the keyword's words (primitives/p143, p153, p212, p237)", () => {
    const cad = console()
    expect(
      written(
        cad,
        "_SPHERE",
        "_3P",
        "",
        "FOO",
        "_U",
        "0,0,0",
        "",
        "FOO",
        "_U",
        "10,0,0",
        "",
        "FOO",
        "_U",
        "0,10,0"
      ).slice(2)
    ).toEqual([
      "Specify first point:",
      "Invalid point.",
      "Specify first point: FOO",
      "Invalid point.",
      "Specify first point: _U",
      "Invalid point.",
      "Specify first point: 0,0,0",
      "Specify second point:",
      "Invalid point.",
      "Specify second point: FOO",
      "Invalid point.",
      "Specify second point: _U",
      "Invalid point.",
      "Specify second point: 10,0,0",
      "Specify third point:",
      "Point or option keyword required.",
      "Specify third point: FOO",
      "Point or option keyword required.",
      "Specify third point: _U",
      "Point or option keyword required.",
      "Specify third point: 0,10,0",
    ])
    expect(
      written(cad, "_SPHERE", "_2P", "", "_U", "50,0,0", "FOO", "60,0,0").slice(
        2
      )
    ).toEqual([
      "Specify first end point of diameter:",
      "Invalid point.",
      "Specify first end point of diameter: _U",
      "Invalid point.",
      "Specify first end point of diameter: 50,0,0",
      "Specify second end point of diameter: FOO",
      "Invalid point.",
      "Specify second end point of diameter: 60,0,0",
    ])
    expect(solids(cad)).toHaveLength(2)
    const refusals = (locale: typeof es) =>
      written(
        console(locale),
        "_SPHERE",
        "_3P",
        "",
        "0,0,0",
        "10,0,0",
        "",
        "0,10,0"
      )
        .slice(1)
        .filter((line) => !line.includes(":"))
    expect(refusals(es)).toEqual([
      "Punto no válido.",
      "Se requiere un punto o una opción.",
    ])
    expect(refusals(ptBR)).toEqual([
      "Ponto inválido.",
      "Ponto ou opção necessário.",
    ])
  })

  it("refuses another prompt's keyword at its centre and radius (primitives/p208)", () => {
    expect(
      written(
        console(),
        "_SPHERE",
        "_E",
        "_A",
        "0,0,0",
        "_A",
        "_2P",
        "5"
      ).slice(1)
    ).toEqual([
      "Specify center point or [3P/2P/Ttr]: _E",
      "Point or option keyword required.",
      "Specify center point or [3P/2P/Ttr]: _A",
      "Point or option keyword required.",
      "Specify center point or [3P/2P/Ttr]: 0,0,0",
      "Specify radius or [Diameter]: _A",
      "Requires numeric distance, second point, or option keyword.",
      "Specify radius or [Diameter]: _2P",
      "Requires numeric distance, second point, or option keyword.",
      "Specify radius or [Diameter]: 5",
    ])
  })

  it("lies in the UCS, moves, turns, mirrors and scales, not exploded (h04, h05)", () => {
    const cad = console()
    answer(cad, "UCS", "X", "30", "SPHERE", "0,0,0", "5")
    const tilted = [
      "         Position, X = 0.0000    Y = 0.0000    Z = 0.0000",
      "           Radius: 5.0000",
    ]
    expect(listed(cad).slice(1)).toEqual(tilted)
    answer(cad, "UCS", "W")
    // No Normal: a sphere has none to list.
    expect(listed(cad).slice(1)).toEqual(tilted)
    // Its frame the UCS's (h05's MPDUMP).
    const [{ surface }] = last(cad).brep.faces
    if (surface.kind !== "sphere") throw new Error("not a sphere")
    expectAt(surface.axis, { x: 0, y: -0.5, z: Math.sqrt(3) / 2 })
    answer(cad, "MOVE", "L", "", "0,0,0", "5,5,3")
    answer(cad, "ROTATE", "L", "", "0,0", "30")
    answer(cad, "MIRROR", "L", "", "0,40", "10,40", "N")
    answer(cad, "SCALE", "L", "", "0,0", "2")
    expect(listed(cad).slice(1)).toEqual([
      "         Position, X = 3.6603    Y = 146.3397  Z = 6.0000",
      "           Radius: 10.0000",
    ])
    for (const solid of solids(cad)) expect(brepIsClosed(solid.brep)).toBe(true)
    expect(written(cad, "EXPLODE", "L", "").slice(1, 4)).toEqual([
      "Select objects: L",
      "1 found",
      "1 was not able to be exploded.",
    ])
    answer(cad, "")
  })

  it("snaps at its centre from any isoline, at nothing else (s06, s09, s10)", () => {
    const cad = console()
    answer(cad, "ZOOM", "W", "-10,-10", "40,40", "SPHERE", "10,10,5", "5")
    expect(snapped(cad, "_CEN", "15.1,10.1")).toEqual({ x: 10, y: 10, z: 5 })
    expect(snapped(cad, "_CEN", "10.1,10.1")).toEqual({ x: 10, y: 10, z: 5 })
    expect(snapped(cad, "_QUA", "10.1,15.1")).toBe(
      "No Quadrant found for specified point."
    )
    expect(snapped(cad, "_END", "10.1,10.1")).toBe(
      "No Endpoint found for specified point."
    )
    expect(snapped(cad, "_NEA", "10.1,15.1")).toBe(
      "No found for specified point."
    )
    answer(cad, "-VIEW", "_SEISO", "ZOOM", "E")
    expect(snapped(cad, "_CEN", "13.5355,10,8.5355")).toEqual({
      x: 10,
      y: 10,
      z: 5,
    })
    answer(cad, "ISOLINES", "0")
    expect(snapped(cad, "_CEN", "15,10,5")).toBe(
      "No Center found for specified point."
    )
  })

  it("asks in each language, by its own name (n02)", () => {
    const spanish = console(es)
    expect(written(spanish, "ESFERA", "0,0,0", "D", "8")).toEqual([
      "ESFERA",
      "Precise centro o [3P/2P/Ttr]: 0,0,0",
      "Precise radio o [Diámetro]: D",
      "Precise diámetro: 8",
    ])
    expect(listed(spanish)).toEqual([
      "    Tipo de sólido = Esfera",
      "         Posición, X = 0.0000    Y = 0.0000    Z = 0.0000",
      "            Radio: 4.0000",
    ])
    const portuguese = console(ptBR)
    expect(written(portuguese, "ESFERA", "0,0,0", "5")).toEqual([
      "ESFERA",
      "Especificar ponto central ou [3P/2P/Ttr]: 0,0,0",
      "Especificar raio ou [Diâmetro]: 5",
    ])
    expect(listed(portuguese)[0]).toBe("  Tipo de sólido = Esfera")
  })
})

describe("TORUS", () => {
  it("asks a centre, a radius and a tube, its one face with no edge (solid/r01)", () => {
    const cad = console()
    expect(written(cad, "TORUS", "0,0,0", "10", "2")).toEqual([
      "TORUS",
      "Specify center point or [3P/2P/Ttr]: 0,0,0",
      "Specify radius or [Diameter]: 10",
      "Specify tube radius or [2Point/Diameter]: 2",
    ])
    expect(listed(cad)).toEqual([
      "      Solid type = Torus",
      "         Position, X = 0.0000    Y = 0.0000    Z = 0.0000",
      "     Torus radius: 10.0000",
      "      Tube radius: 2.0000",
    ])
    const { brep } = last(cad)
    expect(brep.vertices).toEqual([])
    expect(brep.edges).toEqual([])
    expect(brep.faces.map((f) => [f.surface.kind, f.loops.length])).toEqual([
      ["torus", 0],
    ])
    expect(brepIsClosed(brep)).toBe(true)
    expect(brepVolume(brep)).toBeCloseTo(2 * Math.PI ** 2 * 10 * 4, 6)
    expect(written(cad, "AREA", "O", "L").at(-1)).toBe(
      "Area = 789.5684, Perimeter = 0.0000"
    )
  })

  it("takes 3P, 2P, Diameter, the tube's 2Point and Diameter (r02, r07)", () => {
    const cad = console()
    answer(cad, "TORUS", "3P", "0,0,0", "20,0,0", "0,20,0", "2")
    expect(listed(cad).slice(1)).toEqual([
      "         Position, X = 10.0000   Y = 10.0000   Z = 0.0000",
      "     Torus radius: 14.1421",
      "      Tube radius: 2.0000",
    ])
    expect(
      written(cad, "TORUS", "2P", "50,0,0", "70,0,0", "2P", "0,0,0", "0,0,4")
    ).toEqual([
      "TORUS",
      "Specify center point or [3P/2P/Ttr]: 2P",
      "Specify first end point of diameter: 50,0,0",
      "Specify second end point of diameter: 70,0,0",
      "Specify tube radius or [2Point/Diameter] <2.0000>: 2P",
      "Specify first point: 0,0,0",
      "Specify second point: 0,0,4",
    ])
    expect(listed(cad).slice(1)).toEqual([
      "         Position, X = 60.0000   Y = 0.0000    Z = 0.0000",
      "     Torus radius: 10.0000",
      "      Tube radius: 4.0000",
    ])
    expect(
      written(cad, "TORUS", "100,0,0", "D", "20", "D", "6").slice(2)
    ).toEqual([
      "Specify radius or [Diameter] <10.0000>: D",
      "Specify diameter of torus <20.0000>: 20",
      "Specify tube radius or [2Point/Diameter] <4.0000>: D",
      "Specify tube diameter <8.0000>: 6",
    ])
    expect(listed(cad).slice(2)).toEqual([
      "     Torus radius: 10.0000",
      "      Tube radius: 3.0000",
    ])
    // 2P's second point is read in the first's plane (r07).
    answer(cad, "TORUS", "2P", "200,0,0", "210,0,5", "1")
    expect(listed(cad).slice(1, 3)).toEqual([
      "         Position, X = 205.0000  Y = 0.0000    Z = 0.0000",
      "     Torus radius: 5.0000",
    ])
  })

  it("measures its tube from the ring's point last given (r01, r02, r04, r06)", () => {
    const cad = console()
    answer(cad, "TORUS", "0,0,0", "10,0,0", "10,0,3")
    expect(listed(cad).at(-1)).toBe("      Tube radius: 3.0000")
    answer(cad, "TORUS", "3P", "50,0,0", "70,0,0", "50,20,0", "50,24,0")
    expect(listed(cad).at(-1)).toBe("      Tube radius: 4.0000")
    answer(cad, "TORUS", "100,0,0", "-5", "100,6,0")
    expect(listed(cad).at(-1)).toBe("      Tube radius: 6.0000")
  })

  it("asks no Diameter's default before any is given (r07, r08)", () => {
    const cad = console()
    expect(
      written(cad, "TORUS", "0,0,0", "D", "", "20", "D", "", "4").slice(2)
    ).toEqual([
      "Specify radius or [Diameter]: D",
      "Specify diameter of torus:",
      "Requires numeric distance, second point, or option keyword.",
      "Specify diameter of torus: 20",
      "Specify tube radius or [2Point/Diameter]: D",
      "Specify tube diameter:",
      "Requires numeric distance, second point, or option keyword.",
      "Specify tube diameter: 4",
    ])
    const after = console()
    answer(after, "SPHERE", "0,0,0", "D", "5")
    expect(
      written(after, "TORUS", "20,0,0", "5", "D", "", "2").slice(3)
    ).toEqual([
      "Specify tube radius or [2Point/Diameter]: D",
      "Specify tube diameter <0.0000>:",
      "Requires numeric distance, second point, or option keyword.",
      "Specify tube diameter <0.0000>: 2",
    ])
    expect(written(after, "TORUS", "40,0,0", "5", "D", "").slice(3)).toEqual([
      "Specify tube radius or [2Point/Diameter] <1.0000>: D",
      "Specify tube diameter <2.0000>:",
    ])
    expect(listed(after).at(-1)).toBe("      Tube radius: 1.0000")
  })

  it("refuses what makes no torus, a negative radius a lemon's (r03, r05, r06, r09)", () => {
    const cad = console()
    expect(
      written(
        cad,
        "TORUS",
        "FOO",
        "0,0,0",
        "FOO",
        "",
        "0",
        "-2",
        "FOO",
        "",
        "0",
        "-1",
        "4"
      )
    ).toEqual([
      "TORUS",
      "Specify center point or [3P/2P/Ttr]: FOO",
      "Point or option keyword required.",
      "Specify center point or [3P/2P/Ttr]: 0,0,0",
      "Specify radius or [Diameter]: FOO",
      "Requires numeric distance, second point, or option keyword.",
      "Specify radius or [Diameter]:",
      "Requires numeric distance, second point, or option keyword.",
      "Specify radius or [Diameter]: 0",
      "Value must be nonzero.",
      "Specify radius or [Diameter]: -2",
      "Specify tube radius or [2Point/Diameter]: FOO",
      "Requires numeric distance, second point, or option keyword.",
      "Specify tube radius or [2Point/Diameter]:",
      "Requires numeric distance, second point, or option keyword.",
      "Specify tube radius or [2Point/Diameter]: 0",
      "Value must be positive and nonzero.",
      "Specify tube radius or [2Point/Diameter]: -1",
      "Value must be positive and nonzero.",
      "Specify tube radius or [2Point/Diameter]: 4",
    ])
    expect(listed(cad).slice(2)).toEqual([
      "     Torus radius: -2.0000",
      "      Tube radius: 4.0000",
    ])
    // A negative radius is no default (r03).
    expect(written(cad, "TORUS", "50,0,0", "100,0,0", "5")[2]).toBe(
      "Specify radius or [Diameter]: 100,0,0"
    )
    expect(listed(cad)[2]).toBe("     Torus radius: 50.0000")
    expect(
      written(cad, "TORUS", "150,0,0", "-5", "4", "", "7").slice(3)
    ).toEqual([
      "Specify tube radius or [2Point/Diameter] <5.0000>: 4",
      "If torus radius is -5.0000, tube radius must be greater than 5.0000.",
      "Specify tube radius or [2Point/Diameter] <5.0000>:",
      "If torus radius is -5.0000, tube radius must be greater than 5.0000.",
      "Specify tube radius or [2Point/Diameter] <5.0000>: 7",
    ])
    // 2Point's none says so whatever the ring, and asks its point again (r09).
    expect(
      written(cad, "TORUS", "200,0,0", "10", "2P", "0,0,0", "0,0,0", "0,0,1")
    ).toEqual([
      "TORUS",
      "Specify center point or [3P/2P/Ttr]: 200,0,0",
      "Specify radius or [Diameter] <50.0000>: 10",
      "Specify tube radius or [2Point/Diameter] <7.0000>: 2P",
      "Specify first point: 0,0,0",
      "Specify second point: 0,0,0",
      "If torus radius is 10.0000, tube radius must be greater than 10.0000.",
      "Specify second point: 0,0,1",
    ])
    expect(
      written(cad, "TORUS", "300,0,0", "10", "D", "0", "-1", "4").slice(4)
    ).toEqual([
      "Specify tube diameter <2.0000>: 0",
      "Value must be positive and nonzero.",
      "Specify tube diameter <2.0000>: -1",
      "Value must be positive and nonzero.",
      "Specify tube diameter <2.0000>: 4",
    ])
    expect(
      written(cad, "TORUS", "3P", "0,0,0", "0,0,0", "10,0,0", "20,0,0").slice(3)
    ).toEqual([
      "Specify second point: 0,0,0",
      "Points cannot be coincident. *Invalid*",
      "Specify second point: 10,0,0",
      "Specify third point: 20,0,0",
      "Points cannot be collinear. *Invalid*",
    ])
    answer(cad, "\u001b")
    for (const solid of solids(cad)) expect(brepIsClosed(solid.brep)).toBe(true)
  })

  it("says `Invalid point.` at 3P's points, 2P's ends and the tube's 2Point (primitives/p144, p153, p212, p237, p350)", () => {
    const cad = console()
    expect(
      written(
        cad,
        "_TORUS",
        "_3P",
        "",
        "100,0,0",
        "FOO",
        "110,0,0",
        "_U",
        "100,10,0",
        "2"
      ).slice(2, -1)
    ).toEqual([
      "Specify first point:",
      "Invalid point.",
      "Specify first point: 100,0,0",
      "Specify second point: FOO",
      "Invalid point.",
      "Specify second point: 110,0,0",
      "Specify third point: _U",
      "Invalid point.",
      "Specify third point: 100,10,0",
    ])
    expect(
      written(
        cad,
        "_TORUS",
        "_2P",
        "_U",
        "200,0,0",
        "",
        "210,0,0",
        "_2P",
        "",
        "FOO",
        "0,0,0",
        "_D",
        "0,0,2"
      ).slice(2)
    ).toEqual([
      "Specify first end point of diameter: _U",
      "Invalid point.",
      "Specify first end point of diameter: 200,0,0",
      "Specify second end point of diameter:",
      "Invalid point.",
      "Specify second end point of diameter: 210,0,0",
      "Specify tube radius or [2Point/Diameter] <2.0000>: _2P",
      "Specify first point:",
      "Invalid point.",
      "Specify first point: FOO",
      "Invalid point.",
      "Specify first point: 0,0,0",
      "Specify second point: _D",
      "Invalid point.",
      "Specify second point: 0,0,2",
    ])
    expect(solids(cad)).toHaveLength(2)
    const refusals = (locale: typeof es) =>
      written(
        console(locale),
        "_TORUS",
        "300,0,0",
        "10",
        "_2P",
        "",
        "0,0,0",
        "0,0,2"
      )
        .slice(1)
        .filter((line) => !line.includes(":"))
    expect(refusals(es)).toEqual(["Punto no válido."])
    expect(refusals(ptBR)).toEqual(["Ponto inválido."])
  })

  it("refuses another prompt's keyword at its centre, radius and tube (primitives/p209)", () => {
    expect(
      written(
        console(),
        "_TORUS",
        "_E",
        "0,0,0",
        "_A",
        "10",
        "_A",
        "_C",
        "_E",
        "2"
      ).slice(1)
    ).toEqual([
      "Specify center point or [3P/2P/Ttr]: _E",
      "Point or option keyword required.",
      "Specify center point or [3P/2P/Ttr]: 0,0,0",
      "Specify radius or [Diameter]: _A",
      "Requires numeric distance, second point, or option keyword.",
      "Specify radius or [Diameter]: 10",
      "Specify tube radius or [2Point/Diameter]: _A",
      "Requires numeric distance, second point, or option keyword.",
      "Specify tube radius or [2Point/Diameter]: _C",
      "Requires numeric distance, second point, or option keyword.",
      "Specify tube radius or [2Point/Diameter]: _E",
      "Requires numeric distance, second point, or option keyword.",
      "Specify tube radius or [2Point/Diameter]: 2",
    ])
  })

  it("refuses a diameter of 0 and takes a negative one, a lemon's (primitives/p213)", () => {
    const cad = console()
    expect(
      written(cad, "_TORUS", "0,0,0", "_D", "0", "-10", "6").slice(3)
    ).toEqual([
      "Specify diameter of torus: 0",
      "Value must be nonzero.",
      "Specify diameter of torus: -10",
      "Specify tube radius or [2Point/Diameter]: 6",
    ])
    expect(listed(cad).slice(2)).toEqual([
      "     Torus radius: -5.0000",
      "      Tube radius: 6.0000",
    ])
    expect(written(console(es), "_TORUS", "0,0,0", "_D", "0").at(-1)).toBe(
      "El valor debe ser diferente de cero."
    )
  })

  it("reads `@` at the tube from the ring's point, a bare `@` that point itself (primitives/p217, p220)", () => {
    const cad = console()
    answer(cad, "_TORUS", "0,0,0", "10", "@0,3")
    expect(listed(cad).at(-1)).toBe("      Tube radius: 3.0000")
    expect(written(cad, "_TORUS", "50,0,0", "10", "@").slice(-2)).toEqual([
      "Specify tube radius or [2Point/Diameter] <3.0000>: @",
      "Value must be positive and nonzero.",
    ])
  })

  it("lies in its 3P's plane, turned as they turn (r05's MPDUMP)", () => {
    const cad = console()
    answer(cad, "TORUS", "3P", "0,0,0", "20,0,0", "0,0,20", "2")
    answer(cad, "TORUS", "3P", "50,0,0", "50,20,0", "50,0,20", "2")
    const [lying, standing] = solids(cad).map((s) => s.brep.faces[0].surface)
    expect(lying.kind === "torus" && [lying.axis, lying.xAxis]).toEqual([
      { x: 0, y: -1, z: 0 },
      { x: 1, y: 0, z: 0 },
    ])
    expect(
      standing.kind === "torus" && [standing.axis, standing.xAxis]
    ).toEqual([
      { x: 1, y: 0, z: 0 },
      { x: 0, y: 1, z: 0 },
    ])
    expect(listed(cad).slice(1, 3)).toEqual([
      "         Position, X = 50.0000   Y = 10.0000   Z = 10.0000",
      "           Normal: X = 1.0000    Y = 0.0000    Z = 0.0000",
    ])
  })

  it("makes Ttr's ring tangent to two objects, measures from it in the UCS (r04)", () => {
    const cad = console()
    answer(cad, "LINE", "200,0", "300,0", "", "LINE", "200,0", "200,100", "")
    answer(cad, "ZOOM", "E")
    expect(
      written(
        cad,
        "TORUS",
        "T",
        "_TAN",
        "250,0",
        "_TAN",
        "200,50",
        "10",
        "2"
      ).slice(4)
    ).toEqual([
      "Specify radius of circle: 10",
      "Specify tube radius or [2Point/Diameter]: 2",
    ])
    expect(listed(cad).slice(1)).toEqual([
      "         Position, X = 210.0000  Y = 10.0000   Z = 0.0000",
      "     Torus radius: 10.0000",
      "      Tube radius: 2.0000",
    ])
    answer(cad, "UCS", "X", "30", "TORUS", "0,0,0", "10", "2")
    expect(listed(cad)[2]).toBe("     Torus radius: 10.0000")
    answer(cad, "UCS", "W")
    expect(listed(cad)[2]).toBe(
      "           Normal: X = 0.0000    Y = -0.5000   Z = 0.8660"
    )
    answer(cad, "ROTATE", "L", "", "0,0", "30")
    answer(cad, "MIRROR", "L", "", "0,40", "10,40", "N")
    answer(cad, "SCALE", "L", "", "0,0", "2")
    expect(listed(cad).slice(1)).toEqual([
      "         Position, X = 0.0000    Y = 160.0000  Z = 0.0000",
      "           Normal: X = 0.2500    Y = 0.4330    Z = 0.8660",
      "     Torus radius: 20.0000",
      "      Tube radius: 4.0000",
    ])
    for (const solid of solids(cad)) expect(brepIsClosed(solid.brep)).toBe(true)
  })

  it("snaps at its centre from any isoline, at nothing else (s07, s09, s10)", () => {
    const cad = console()
    answer(cad, "ZOOM", "W", "-20,-20", "40,40", "TORUS", "10,10,0", "10", "2")
    expect(snapped(cad, "_CEN", "22.1,10.1")).toEqual({ x: 10, y: 10, z: 0 })
    expect(snapped(cad, "_CEN", "18.1,10.1")).toEqual({ x: 10, y: 10, z: 0 })
    expect(snapped(cad, "_CEN", "10.1,10.1")).toBe(
      "No Center found for specified point."
    )
    expect(snapped(cad, "_QUA", "10.1,20.1")).toBe(
      "No Quadrant found for specified point."
    )
    answer(cad, "-VIEW", "_SEISO", "ZOOM", "E")
    expect(snapped(cad, "_CEN", "20,10,2")).toEqual({ x: 10, y: 10, z: 0 })
    expect(snapped(cad, "_NEA", "20,10,2")).toBe(
      "No found for specified point."
    )
  })

  it("snaps an apple's and a lemon's poles as Endpoints (primitives/p241, p402)", () => {
    const cad = console()
    answer(cad, "_TORUS", "0,0,0", "2", "4", "_TORUS", "50,0,0", "-4", "5")
    answer(cad, "-VIEW", "_SEISO", "_ZOOM", "_E")
    expect(snapped(cad, "_END", "0.05,0,3.42")).toEqual({
      x: 0,
      y: 0,
      z: expect.closeTo(3.4641, 4),
    })
    expect(snapped(cad, "_END", "0.05,0,-3.42")).toEqual({
      x: 0,
      y: 0,
      z: expect.closeTo(-3.4641, 4),
    })
    expect(snapped(cad, "_END", "50.05,0,2.97")).toEqual({
      x: 50,
      y: 0,
      z: expect.closeTo(3, 4),
    })
  })

  it("asks in each language, by its own name and alias (n02, n03)", () => {
    const spanish = console(es)
    expect(written(spanish, "TOR", "0,0,0", "10", "D", "4")).toEqual([
      "TOR TOROIDE",
      "Precise centro o [3P/2P/Ttr]: 0,0,0",
      "Precise radio o [Diámetro]: 10",
      "Precise radio de sección o [2Puntos/Diámetro]: D",
      "Precise diámetro de sección: 4",
    ])
    expect(listed(spanish)).toEqual([
      "    Tipo de sólido = Toroide",
      "         Posición, X = 0.0000    Y = 0.0000    Z = 0.0000",
      " Radio de toroide: 10.0000",
      " Radio de sección: 2.0000",
    ])
    expect(written(spanish, "TOROIDE", "50,0,0", "-5", "4").slice(-1)).toEqual([
      "Si el radio del toroide es -5.0000, el radio de sección debe ser superior a 5.0000.",
    ])
    const portuguese = console(ptBR)
    // pt-BR's acad.pgp sends TOR to TORO, which its console runs as TORUS
    // and refuses through TOR (n03).
    expect(written(portuguese, "TORO", "0,0,0", "10", "2")).toEqual([
      "TORO TOROIDE",
      "Especificar ponto central ou [3P/2P/Ttr]: 0,0,0",
      "Especificar raio ou [Diâmetro]: 10",
      "Especificar raio ou [2Pontos/Diâmetro]: 2",
    ])
    expect(listed(portuguese).slice(2)).toEqual([
      "  Raio do toroide: 10.0000",
      "     Raio do tubo: 2.0000",
    ])
  })

  it("is stretched whole by a frame round its centre, never by its rim (t06)", () => {
    const cad = console()
    answer(cad, "ZOOM", "W", "-20,-20", "80,40")
    answer(cad, "SPHERE", "0,0,0", "5", "TORUS", "50,0,0", "10", "2")
    const at = () => listedAll(cad).map((block) => block[1].replace(/ +/g, " "))
    const stretch = (from: string, to: string, by: string) =>
      answer(cad, "STRETCH", "C", from, to, "", "0,0", by)
    stretch("-1,-1", "1,1", "10,0")
    stretch("14,-1", "16,1", "0,10")
    stretch("45,-1", "59,1", "10,0")
    stretch("70,-1", "73,1", "0,10")
    expect(at()).toEqual([
      " Position, X = 60.0000 Y = 0.0000 Z = 0.0000",
      " Position, X = 10.0000 Y = 0.0000 Z = 0.0000",
    ])
  })

  it("is saved and read back, a lemon and an apple too", () => {
    const cad = console()
    answer(cad, "TORUS", "0,0,0", "10", "2")
    answer(cad, "TORUS", "50,0,0", "-4", "5")
    answer(cad, "TORUS", "100,0,0", "2", "4")
    answer(cad, "SPHERE", "3P", "0,0,0", "10,0,0", "0,10,0")
    const document = cad.runtime.document
    const file = serializeDrawing(
      snapshotOf(document.getEntities(), { settings: document.getSettings() })
    )
    expect(parseDrawingFile(file).entities).toEqual(document.getEntities())
  })
})
