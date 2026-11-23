import { readFileSync } from "node:fs"
import { gunzipSync } from "node:zlib"
import { describe, expect, it } from "vitest"
import { ellipseOf, hatchOf, loopOf, p } from "../../../test/builders"
import {
  BlockLookup,
  Entity,
  createDimension,
  createMText,
  dimensionGeometry,
  entitiesBounds,
} from "../../domain/entities"
import { DEFAULT_DIM_STYLE } from "../../domain/dimStyles"
import { Vec2 } from "../../geometry/Vec2"
import { parseDxf } from "./readDxf"
import {
  R12Names,
  R12Source,
  r12AngularDimensionTexts,
  r12Conversion,
  r12Name,
} from "./dxfR12"

// What AutoCAD 2027's DXFOUT R12 makes of what R12 has no object for:
// scripts/research/probes/dxf/r12.sh wrote each fixture of AutoCAD's as R12
// (research/probes/dxf, mcaddxf\r12), x027 and x028 the names and the
// properties of a converted object.

function fixture(name: string) {
  const path = new URL(`./fixtures/${name}.dxf.gz`, import.meta.url)
  return parseDxf(new Uint8Array(gunzipSync(readFileSync(path)))).drawing
}

const lookup: BlockLookup = Object.assign(() => undefined, {
  attributeDisplay: "normal" as const,
})

function sourceOf(entities: readonly Entity[]): R12Source {
  return {
    blocks: lookup,
    dimStyle: () => DEFAULT_DIM_STYLE,
    extents: entitiesBounds(entities, lookup),
  }
}

describe("R12 names", () => {
  it("are uppercase, an underscore for what R12 takes no character of, 26 long (x027, x028)", () => {
    expect(r12Name("my walls layer with a very long name over 32")).toBe(
      "MY_WALLS_LAYER_WITH_A_VERY"
    )
    expect(r12Name("x.y#z@w(v)")).toBe("X_Y_Z_W_V_")
    expect(r12Name("Señales")).toBe("SEÑALES")
    expect(r12Name("my-block$2")).toBe("MY-BLOCK$2")
  })

  it("number a name another took first, per stem, as AutoCAD does (x028)", () => {
    const names = new R12Names()
    const long = "abcdefghijklmnopqrstuvwxyz"
    expect(names.of(`${long}0123456789ABCDEF`)).toBe(long.toUpperCase())
    expect(names.of(`${long}0123456`)).toBe("ABCDEFGHIJKLMNOPQRSTUVWXY0")
    expect(names.of(`${long}012345`)).toBe("ABCDEFGHIJKLMNOPQRSTUVWXY1")
    expect(names.of("aaaa bbbb cccc dddd eeee ffff gggg hhhh")).toBe(
      "AAAA_BBBB_CCCC_DDDD_EEEE_F"
    )
    expect(names.of("aaaa bbbb cccc dddd eeee ffff gg")).toBe(
      "AAAA_BBBB_CCCC_DDDD_EEEE_0"
    )
    expect(names.of(`${long}0123456789ABCDEFxxx`)).toBe(
      "ABCDEFGHIJKLMNOPQRSTUVWXY2"
    )
    // A name asked for again is the one it was given.
    expect(names.of(`${long}0123456`)).toBe("ABCDEFGHIJKLMNOPQRSTUVWXY0")
  })
})

describe("r12Conversion", () => {
  it("leaves out images and wipeouts, and writes R12's own objects as they are", () => {
    const drawing = fixture("fixture-2018")
    const source = sourceOf(drawing.entities)
    for (const name of ["images-2018", "wipeouts-2018"]) {
      for (const e of fixture(name).entities) {
        const conversion = r12Conversion(e, source)
        if (e.type === "image" || e.type === "wipeout")
          expect(conversion).toEqual({ kind: "dropped" })
        else expect(conversion).toBeNull()
      }
    }
  })

  it("makes an ellipse a 3D polyline of 128 steps, an arc of one too (f002)", () => {
    const whole = ellipseOf(p(80, 30), p(10, 0), 0.3, { layerId: "walls" })
    const arc = ellipseOf(p(100, 30), p(10, 0), 0.3, {
      startParam: 0,
      endParam: (3 * Math.PI) / 2,
    })
    const source = sourceOf([])
    for (const [e, last] of [
      [whole, { x: 90, y: 30 }],
      [arc, { x: 100, y: 27 }],
    ] as const) {
      const c = r12Conversion(e, source)
      if (c?.kind !== "replaced") throw new Error("not replaced")
      const [polyline] = c.entities
      if (polyline.type !== "polyline3d") throw new Error("no 3D polyline")
      expect(polyline.vertices).toHaveLength(129)
      expect(polyline.layerId).toBe(e.layerId)
      expect(polyline.vertices.at(-1)!.x).toBeCloseTo(last.x)
      expect(polyline.vertices.at(-1)!.y).toBeCloseTo(last.y)
    }
    // AutoCAD's second vertex of the whole one: 89.9880, 30.1472.
    const c = r12Conversion(whole, source)
    const second =
      c?.kind === "replaced" && c.entities[0].type === "polyline3d"
        ? c.entities[0].vertices[1]
        : null
    expect(second?.x).toBeCloseTo(89.988, 3)
    expect(second?.y).toBeCloseTo(30.1472, 4)
  })

  it("makes a spline a 3D polyline of 32 points per control point (f002, x027)", () => {
    const drawing = fixture("fixture-2018")
    const source = sourceOf(drawing.entities)
    const splines = drawing.entities.filter((e) => e.type === "spline")
    const counts = splines.map((e) => {
      const c = r12Conversion(e, source)
      return c?.kind === "replaced" && c.entities[0].type === "polyline3d"
        ? c.entities[0].vertices.length
        : 0
    })
    // AutoCAD's: 192 for the fit spline's 6 control points, 128 for 4.
    expect(counts).toEqual([192, 128])
  })

  it("cuts an XLINE or a RAY to the drawing's extents as AutoCAD did (r12.sh's xlines)", () => {
    const drawing = fixture("xlines-2018")
    const source = sourceOf(drawing.entities)
    const ends = drawing.entities
      .filter((e) => e.type === "xline" || e.type === "ray")
      .map((e) => {
        const c = r12Conversion(e, source)
        const line = c?.kind === "replaced" ? c.entities[0] : null
        return line?.type === "line"
          ? [line.start.x, line.start.y, line.end.x, line.end.y].map(
              (v) => Math.round(v * 1e6) / 1e6 || 0
            )
          : null
      })
    // Each as AutoCAD wrote it, where its own line is not numerical noise:
    // through 0,0 along X, a point; the ray from 50,20 that misses, a line
    // of no length there; the ray down from 100,0, to −50.
    expect(ends[0]).toEqual([0, 0, 0, 0])
    expect(ends[3]).toEqual([50, 20, 50, 20])
    expect(ends[4]).toEqual([100, 0, 100, -50])
  })

  it("puts an MTEXT's lines in a block, each a TEXT with its layer and colour (x027)", () => {
    const mtext = {
      ...createMText(p(0, 20), "red mtext", {
        height: 2.5,
        width: 40,
        layerId: "walls",
      }),
      color: "1",
    }
    const c = r12Conversion(mtext, sourceOf([]))
    if (c?.kind !== "block") throw new Error("no block")
    expect(c.prefix).toBe("*U")
    expect(c.dressed).toBeUndefined()
    expect(c.pieces).toHaveLength(1)
    const [text] = c.pieces
    expect(text).toMatchObject({
      type: "text",
      layerId: "walls",
      color: "1",
      value: "red mtext",
    })
    // AutoCAD's TEXT: its baseline a height under the top, at y 17.5.
    if (text.type === "text") expect(text.position.y).toBeCloseTo(17.5, 1)
  })

  it("puts a pattern's lines in a *X block, ByBlock, its reference dressed Continuous (x027)", () => {
    const hatch = {
      ...hatchOf([loopOf(p(100, 0), p(120, 20))], {
        patternId: "ANSI31",
        layerId: "walls",
      }),
      color: "1",
    }
    const c = r12Conversion(hatch, sourceOf([]))
    if (c?.kind !== "block") throw new Error("no block")
    expect(c.prefix).toBe("*X")
    expect(c.dressed).toMatchObject({
      layerId: "walls",
      color: "1",
      linetype: "Continuous",
    })
    expect(c.pieces.length).toBeGreaterThan(0)
    for (const piece of c.pieces) {
      expect(piece).toMatchObject({
        type: "line",
        layerId: "0",
        color: "ByBlock",
      })
    }
  })

  it("fills a solid hatch with SOLIDs and its outline, on its layer with its colour, Continuous (x030)", () => {
    const hatch = {
      ...hatchOf([loopOf(p(0, 0), p(10, 5))], {
        patternId: "SOLID",
        layerId: "red",
      }),
      color: "3",
    }
    const c = r12Conversion(hatch, sourceOf([]))
    if (c?.kind !== "block") throw new Error("no block")
    expect(c.prefix).toBe("*U")
    expect(c.dressed).toMatchObject({ layerId: "red", color: "3" })
    const types = c.pieces.map((e) => e.type)
    expect(types.filter((t) => t === "solid2d")).toHaveLength(1)
    expect(types.filter((t) => t === "line")).toHaveLength(4)
    for (const piece of c.pieces) {
      expect(piece).toMatchObject({
        layerId: "red",
        color: "3",
        linetype: "Continuous",
      })
    }
  })

  it("fills a gradient with SOLIDs of the hatch's colour alone, no outline (r12.sh's gradients, x029)", () => {
    const drawing = fixture("gradients-2018")
    const gradients = drawing.entities.filter(
      (e) => e.type === "hatch" && e.gradient
    )
    expect(gradients).toHaveLength(12)
    const triangle = (a: Vec2, b: Vec2, c: Vec2) =>
      Math.abs((b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y)) / 2
    for (const gradient of gradients) {
      const c = r12Conversion(gradient, sourceOf([]))
      if (c?.kind !== "block") throw new Error("no block")
      expect(c.prefix).toBe("*U")
      expect(c.dressed).toMatchObject({ layerId: "0", linetype: "Continuous" })
      expect(c.dressed?.color).toBeUndefined()
      // AutoCAD's covers each 100 × 50 rectangle in 2 to 285 triangles.
      let area = 0
      for (const piece of c.pieces) {
        if (piece.type !== "solid2d") throw new Error(piece.type)
        expect(piece).toMatchObject({ layerId: "0", linetype: "Continuous" })
        expect(piece.color).toBeUndefined()
        const [a, b, cc, d] = piece.corners
        area += triangle(a, b, cc) + triangle(b, cc, d)
      }
      expect(area).toBeCloseTo(5000, 6)
    }
  })

  it("breaks a multileader and a table up into R12's objects, flat (r12.sh)", () => {
    for (const name of ["mleaders-2018", "tables-2018"]) {
      const drawing = fixture(name)
      const blocks = new Map(drawing.blocks.map((b) => [b.id, b]))
      const source: R12Source = {
        blocks: Object.assign((id: string) => blocks.get(id), {
          attributeDisplay: "normal" as const,
        }),
        dimStyle: () => DEFAULT_DIM_STYLE,
        extents: null,
      }
      for (const e of drawing.entities) {
        if (e.type !== "mleader" && e.type !== "table") continue
        const c = r12Conversion(e, source)
        if (c?.kind !== "block") throw new Error("no block")
        const kinds = new Set(c.pieces.map((piece) => piece.type))
        for (const kind of kinds) {
          expect([
            "line",
            "polyline",
            "polyline3d",
            "solid2d",
            "text",
            "insert",
          ]).toContain(kind)
        }
      }
    }
  })
})

describe("an angular dimension's text in R12", () => {
  // Each angular dimension's MTEXT middle in AutoCAD's 2018 file, and the
  // TEXTs its R12 wrote for it in the *D block, at 6 digits (fixture2's *D5,
  // x031: heights 2.5 and 5, DIMGAP 2, DIMTAD 0, an override, a right
  // angle; x032: é ü, %%c and %%p, `x\U+03B1\Py`, DIMTIH 1).
  type Case = [[number, number], [number, number, string][]]
  const cases: [string, Case[]][] = [
    ["fixture2-2018", [[[626.0027, 10.77067], [[626.003, 7.52067, "45?"]]]]],
    [
      "angulars-2018",
      [
        [[22.41054, 9.28275], [[22.4105, 6.03275, "45?"]]],
        [[123.58509, 9.76926], [[123.585, 3.26926, "45?"]]],
        [[223.68088, 9.80894], [[223.681, 6.55894, "45?"]]],
        [[320.65857, 8.55706], [[320.659, 5.30706, "45?"]]],
        [[422.40975, 9.28242], [[422.41, 6.03242, "abc"]]],
        [[521.34452, 21.34452], [[521.345, 18.0945, "90?"]]],
      ],
    ],
    [
      "angulars2-2018",
      [
        [[22.41684, 9.28536], [[22.4168, 6.03536, "é ü"]]],
        [[122.47986, 9.31146], [[122.48, 6.06146, "%%c5 %%p1"]]],
        [
          [224.65512, 10.21249],
          [
            [224.655, 6.96249, "x?"],
            [224.655, 3.71249, "y"],
          ],
        ],
        [[320.65857, 8.55706], [[320.659, 5.30706, "45?"]]],
      ],
    ],
  ]
  it("puts the measurement, its degree sign a ?, where an override says <>", () => {
    const dim = createDimension("angular", p(40, 0), p(30, 30), p(20, 10), {
      vertex: p(0, 0),
      text: "<> max",
    })
    const style = DEFAULT_DIM_STYLE
    const texts = r12AngularDimensionTexts(
      dim,
      style,
      dimensionGeometry(dim, style)
    )
    expect(texts.map((t) => t.value)).toEqual(["45? max"])
  })

  for (const [name, expected] of cases) {
    it(`is AutoCAD's horizontal TEXT, 1.3 heights a line under the middle (${name})`, () => {
      const drawing = fixture(name)
      const angulars = drawing.entities.flatMap((e) =>
        e.type === "dimension" && e.kind === "angular" ? [e] : []
      )
      expect(angulars).toHaveLength(expected.length)
      angulars.forEach((dim, i) => {
        const style =
          drawing.dimStyles.find((s) => s.id === dim.styleId) ??
          DEFAULT_DIM_STYLE
        const g = dimensionGeometry(dim, style)
        const texts = r12AngularDimensionTexts(dim, style, g)
        const [middle, lines] = expected[i]
        expect(texts).toHaveLength(lines.length)
        texts.forEach((t, j) => {
          const [x, y, value] = lines[j]
          // From the middle of the text drawn: the model's places it a
          // little apart from AutoCAD's at times (DIMTAD 0), not this rule.
          expect(t.position.x - g.textPoint.x).toBeCloseTo(x - middle[0], 2)
          expect(t.position.y - g.textPoint.y).toBeCloseTo(y - middle[1], 2)
          expect(t.value).toBe(value)
          expect(t).toMatchObject({
            height: g.textHeight,
            rotation: 0,
            justify: "left",
            color: "ByBlock",
            layerId: "0",
          })
        })
      })
    })
  }
})
