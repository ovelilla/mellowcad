import fc from "fast-check"
import { describe, expect, it } from "vitest"
import {
  DRAWING_FILE_TYPE,
  DrawingFileError,
  DRAWING_FILE_VERSION,
  parseDrawingFile,
  serializeDrawing,
  toDrawingFile,
} from "./drawingFile"
import { DEFAULT_LAYER_ID } from "../domain/layers"
import { DEFAULT_LINETYPE_ID } from "../domain/linetypes"
import { DEFAULT_LINEWEIGHT } from "../domain/lineweights"
import { DEFAULT_DOCUMENT_SETTINGS, LengthUnit } from "../domain/units"
import { createDefaultTextStyle, createTextStyle } from "../domain/textStyles"
import { DEFAULT_DIM_STYLE, createDefaultDimStyle } from "../domain/dimStyles"
import {
  DEFAULT_HATCH_ANGLE,
  DEFAULT_HATCH_PATTERN_ID,
  DEFAULT_HATCH_SCALE,
} from "../domain/hatchPatterns"
import { createDimension, createHatch } from "../domain/entities"
import { drawingSnapshot } from "../../test/arbitraries"
import {
  arcOf,
  circleOf,
  ellipseOf,
  layerOf,
  lineOf,
  p,
  polylineOf,
  snapshotOf,
  textOf,
} from "../../test/builders"

/**
 * The file format is the one thing a user cannot recover from. A drawing saved
 * today must still open after any future refactor, so these tests pin three
 * separate promises:
 *
 *  1. round-trip fidelity — nothing is lost between save and load;
 *  2. forward rejection — a file from a newer build fails loudly, never
 *     silently half-parsed;
 *  3. backward tolerance — files written by every previous schema version, and
 *     files with damaged parts, still open with as much content as possible.
 */

describe("serializeDrawing", () => {
  it("writes an identifiable, versioned header", () => {
    const file = JSON.parse(serializeDrawing(snapshotOf([])))
    expect(file.type).toBe(DRAWING_FILE_TYPE)
    expect(file.version).toBe(DRAWING_FILE_VERSION)
    expect(file.generator).toBe("mellowcad")
  })

  it("produces human-diffable JSON", () => {
    // Indented output keeps drawings reviewable in version control.
    expect(serializeDrawing(snapshotOf([]))).toContain("\n  ")
  })

  it("deep-clones so later edits cannot reach the written file", () => {
    const vertices = [p(0, 0), p(10, 0)]
    const snapshot = snapshotOf([polylineOf(vertices, { id: "P1" })])
    const file = toDrawingFile(snapshot)
    const polyline = file.entities[0]
    expect(polyline.type).toBe("polyline")
    if (polyline.type !== "polyline") return
    expect(polyline.vertices[0]).not.toBe(snapshot.entities[0])
    expect(polyline.vertices).toBeCloseToPoints(vertices)
  })
})

describe("round trip", () => {
  it("preserves every entity type exactly", () => {
    const entities = [
      lineOf(p(-10.5, 2.25), p(30, -4), { id: "L1" }),
      circleOf(p(5, 5), 12.5, { id: "C1" }),
      arcOf(p(0, 0), 100, 0.25, 2.75, { id: "A1" }),
      ellipseOf(p(5, -5), p(80, 20), 0.35, { id: "E1" }),
      ellipseOf(p(0, 0), p(60, 0), 0.5, {
        id: "E2",
        startParam: 0.5,
        endParam: 2.5,
      }),
      polylineOf([p(0, 0), p(10, 0), p(10, 10)], {
        id: "P1",
        closed: true,
        bulges: [0, 0.5, 0],
      }),
      textOf(p(3, 4), "NOTE 1", {
        id: "T1",
        height: 2.5,
        rotation: 0.75,
        justify: "mc",
      }),
    ]
    const parsed = parseDrawingFile(serializeDrawing(snapshotOf(entities)))
    expect(parsed.entities).toEqual(entities)
  })

  it("preserves ByObject overrides", () => {
    const entities = [
      {
        ...lineOf(p(0, 0), p(10, 0), { id: "L1" }),
        color: "#ff0000",
        linetype: "Dashed",
        lineweight: 1.4,
      },
    ]
    const parsed = parseDrawingFile(serializeDrawing(snapshotOf(entities)))
    expect(parsed.entities[0]).toEqual(entities[0])
  })

  it("preserves elevation, rise and thickness, and writes no zeros", () => {
    const entities = [
      {
        ...lineOf(p(0, 0), p(10, 0), { id: "L1" }),
        elevation: 5,
        deltaZ: -2,
        thickness: 3,
      },
      { ...textOf(p(0, 0), "A", { id: "T1" }), elevation: -1.5 },
      circleOf(p(0, 0), 4, { id: "C1" }),
    ]
    const text = serializeDrawing(snapshotOf(entities))
    expect(parseDrawingFile(text).entities).toEqual(entities)
    expect(text).not.toMatch(/"(elevation|deltaZ|thickness)": 0/)
  })

  it("reads thickness only on the objects that have one", () => {
    const parsed = parseDrawingFile(
      JSON.stringify({
        type: DRAWING_FILE_TYPE,
        version: DRAWING_FILE_VERSION,
        entities: [
          { ...textOf(p(0, 0), "A", { id: "T1" }), thickness: 3, deltaZ: 1 },
        ],
      })
    )
    expect(parsed.entities[0]).not.toHaveProperty("thickness")
    expect(parsed.entities[0]).not.toHaveProperty("deltaZ")
  })

  it("preserves the layer table and the current layer", () => {
    const layers = [
      layerOf("0"),
      layerOf("walls", {
        name: "Walls",
        color: "#ff0000",
        linetype: "Hidden",
        lineweight: 0.7,
        visible: false,
        locked: true,
      }),
    ]
    const parsed = parseDrawingFile(
      serializeDrawing(snapshotOf([], { layers, currentLayerId: "walls" }))
    )
    expect(parsed.layers).toEqual(layers)
    expect(parsed.currentLayerId).toBe("walls")
  })

  it("preserves the text-style table and the current style", () => {
    const textStyles = [createDefaultTextStyle(), createTextStyle("Title", 20)]
    const parsed = parseDrawingFile(
      serializeDrawing(
        snapshotOf([], { textStyles, currentTextStyleId: "Title" })
      )
    )
    expect(parsed.textStyles).toEqual(textStyles)
    expect(parsed.currentTextStyleId).toBe("Title")
  })

  it("preserves the document settings", () => {
    const ucs = { origin: { x: 10, y: -5 }, xAxis: { x: 0.6, y: 0.8 } }
    const settings = {
      unit: LengthUnit.Meter,
      precision: 5,
      ltScale: 2.5,
      lwDisplay: false,
      attributeDisplay: "off" as const,
      ucs,
      ucsName: "Plot",
      namedUcs: [{ name: "Plot", ucs }],
      ucsIcon: { visible: true, atOrigin: false },
    }
    const parsed = parseDrawingFile(
      serializeDrawing(snapshotOf([], { settings }))
    )
    expect(parsed.settings).toEqual(settings)
  })

  it("reads a UCS name that is not in the table as unnamed", () => {
    const parsed = parseDrawingFile(
      JSON.stringify({
        type: DRAWING_FILE_TYPE,
        version: DRAWING_FILE_VERSION,
        settings: {
          ucs: { origin: { x: 1, y: 2 }, xAxis: { x: 0, y: 3 } },
          ucsName: "Gone",
        },
        entities: [],
      })
    )
    expect(parsed.settings.ucs).toEqual({
      origin: { x: 1, y: 2 },
      xAxis: { x: 0, y: 1 },
    })
    expect(parsed.settings.ucsName).toBeNull()
  })

  it("survives any drawing", () => {
    fc.assert(
      fc.property(drawingSnapshot, (snapshot) => {
        const parsed = parseDrawingFile(serializeDrawing(snapshot))
        expect(parsed.entities).toEqual(snapshot.entities)
        expect(parsed.settings).toEqual(snapshot.settings)
        expect(parsed.currentLayerId).toBe(snapshot.currentLayerId)
      })
    )
  })

  it("is idempotent — saving a loaded drawing yields the same bytes", () => {
    fc.assert(
      fc.property(drawingSnapshot, (snapshot) => {
        const once = serializeDrawing(snapshot)
        const twice = serializeDrawing(parseDrawingFile(once))
        expect(twice).toBe(once)
      })
    )
  })
})

describe("rejects unusable files", () => {
  it("reports invalid JSON", () => {
    expect(() => parseDrawingFile("{ not json")).toThrow(/valid JSON/i)
  })

  it("reports a file that is not a drawing", () => {
    expect(() => parseDrawingFile('{"type":"something-else"}')).toThrow(
      /not a mellowcad drawing/i
    )
    expect(() => parseDrawingFile("[]")).toThrow()
    expect(() => parseDrawingFile("null")).toThrow(/Unrecognised/i)
  })

  it("refuses a file from a newer build instead of dropping its data", () => {
    const future = JSON.stringify({
      type: DRAWING_FILE_TYPE,
      version: DRAWING_FILE_VERSION + 1,
      entities: [],
    })
    expect(() => parseDrawingFile(future)).toThrow(/newer version/i)
  })

  it("names each failure by a code, which the command line words", () => {
    const codeOf = (text: string) => {
      try {
        parseDrawingFile(text)
      } catch (error) {
        return error instanceof DrawingFileError ? error.code : null
      }
      return undefined
    }
    expect(codeOf("{")).toBe("invalidJson")
    expect(codeOf("null")).toBe("unrecognised")
    expect(codeOf('{"type":"x"}')).toBe("notADrawing")
    expect(
      codeOf(JSON.stringify({ type: DRAWING_FILE_TYPE, version: 1e9 }))
    ).toBe("newerVersion")
  })
})

describe("tolerates damaged and legacy content", () => {
  function fileWith(entities: unknown[], extra: Record<string, unknown> = {}) {
    return JSON.stringify({
      type: DRAWING_FILE_TYPE,
      version: DRAWING_FILE_VERSION,
      entities,
      ...extra,
    })
  }

  it("skips a malformed entity and keeps the rest", () => {
    const parsed = parseDrawingFile(
      fileWith([
        { id: "L1", type: "line", start: { x: 0, y: 0 }, end: { x: 10, y: 0 } },
        { id: "BAD", type: "line", start: { x: 0, y: 0 } },
        { id: "C1", type: "circle", center: { x: 0, y: 0 }, radius: 5 },
      ])
    )
    expect(parsed.entities.map((entity) => entity.id)).toEqual(["L1", "C1"])
  })

  it("rejects geometry that cannot exist", () => {
    const parsed = parseDrawingFile(
      fileWith([
        { type: "circle", center: { x: 0, y: 0 }, radius: 0 },
        { type: "circle", center: { x: 0, y: 0 }, radius: -5 },
        { type: "arc", center: { x: 0, y: 0 }, radius: 5, startAngle: 0 },
        { type: "polyline", vertices: [{ x: 0, y: 0 }] },
        { type: "line", start: { x: 0, y: NaN }, end: { x: 1, y: 1 } },
        { type: "unknown-future-entity" },
      ])
    )
    expect(parsed.entities).toEqual([])
  })

  it("drops malformed vertices but keeps a usable polyline", () => {
    const parsed = parseDrawingFile(
      fileWith([
        {
          type: "polyline",
          vertices: [{ x: 0, y: 0 }, "nonsense", { x: 10, y: 0 }, { x: 10 }],
          closed: true,
        },
      ])
    )
    const polyline = parsed.entities[0]
    expect(polyline.type).toBe("polyline")
    if (polyline.type !== "polyline") return
    expect(polyline.vertices).toBeCloseToPoints([p(0, 0), p(10, 0)])
  })

  it("invents an id for an entity that lost one", () => {
    const parsed = parseDrawingFile(
      fileWith([{ type: "line", start: { x: 0, y: 0 }, end: { x: 1, y: 1 } }])
    )
    expect(parsed.entities[0].id).toMatch(/.+/)
  })

  it("always yields a base layer, even for a file that has none", () => {
    const parsed = parseDrawingFile(fileWith([]))
    expect(parsed.layers).toHaveLength(1)
    expect(parsed.layers[0].id).toBe(DEFAULT_LAYER_ID)
    expect(parsed.currentLayerId).toBe(DEFAULT_LAYER_ID)
  })

  it("de-duplicates layers sharing an id", () => {
    const parsed = parseDrawingFile(
      fileWith([], {
        layers: [
          { id: "0", name: "0" },
          { id: "walls", name: "Walls" },
          { id: "walls", name: "Duplicate" },
        ],
      })
    )
    expect(parsed.layers.map((layer) => layer.id)).toEqual(["0", "walls"])
    expect(parsed.layers[1].name).toBe("Walls")
  })

  it("fills in layer properties added by later versions", () => {
    const parsed = parseDrawingFile(
      fileWith([], { layers: [{ id: "0" }, { id: "old", name: "Old" }] })
    )
    const legacy = parsed.layers[1]
    expect(legacy.linetype).toBe(DEFAULT_LINETYPE_ID)
    expect(legacy.lineweight).toBe(DEFAULT_LINEWEIGHT)
    expect(legacy.visible).toBe(true)
    expect(legacy.locked).toBe(false)
  })

  it("falls back to default settings and clamps out-of-range ones", () => {
    expect(parseDrawingFile(fileWith([])).settings).toEqual(
      DEFAULT_DOCUMENT_SETTINGS
    )

    const clamped = parseDrawingFile(
      fileWith([], {
        settings: {
          unit: "furlong",
          precision: 99,
          ltScale: -4,
          lwDisplay: "yes",
        },
      })
    ).settings
    expect(clamped.unit).toBe(DEFAULT_DOCUMENT_SETTINGS.unit)
    expect(clamped.precision).toBe(8)
    expect(clamped.ltScale).toBe(DEFAULT_DOCUMENT_SETTINGS.ltScale)
    expect(clamped.lwDisplay).toBe(DEFAULT_DOCUMENT_SETTINGS.lwDisplay)
  })

  it("clamps an out-of-range lineweight rather than rejecting the entity", () => {
    const parsed = parseDrawingFile(
      fileWith([
        {
          type: "line",
          start: { x: 0, y: 0 },
          end: { x: 1, y: 0 },
          lineweight: 999,
        },
      ])
    )
    expect(parsed.entities[0].lineweight).toBeLessThanOrEqual(2.11)
  })

  it("stores a straight polyline without a redundant bulge array", () => {
    const parsed = parseDrawingFile(
      fileWith([
        {
          type: "polyline",
          vertices: [
            { x: 0, y: 0 },
            { x: 10, y: 0 },
          ],
          bulges: [0],
        },
      ])
    )
    const polyline = parsed.entities[0]
    expect(polyline.type).toBe("polyline")
    if (polyline.type !== "polyline") return
    expect(polyline.bulges).toBeUndefined()
  })
})

describe("opens drawings written by every earlier schema", () => {
  /**
   * Hand-written fixtures, deliberately *not* produced by the current writer:
   * they must keep opening even if the writer changes shape entirely. Each one
   * is the minimal file that version could produce.
   */

  it("version 1 — entities and settings only, no layers", () => {
    const parsed = parseDrawingFile(
      JSON.stringify({
        type: DRAWING_FILE_TYPE,
        version: 1,
        generator: "easy-cad",
        settings: { unit: "mm", precision: 2 },
        entities: [
          {
            id: "l1",
            type: "line",
            start: { x: 0, y: 0 },
            end: { x: 100, y: 0 },
          },
          { id: "c1", type: "circle", center: { x: 50, y: 50 }, radius: 25 },
        ],
      })
    )
    expect(parsed.entities).toHaveLength(2)
    // Properties that did not exist yet get today's defaults.
    expect(parsed.entities[0].layerId).toBe(DEFAULT_LAYER_ID)
    expect(parsed.layers[0].lineweight).toBe(DEFAULT_LINEWEIGHT)
    expect(parsed.settings.ltScale).toBe(1)
  })

  it("version 2 — layers arrive", () => {
    const parsed = parseDrawingFile(
      JSON.stringify({
        type: DRAWING_FILE_TYPE,
        version: 2,
        settings: { unit: "cm", precision: 3 },
        layers: [
          {
            id: "0",
            name: "0",
            color: "#e2e8f0",
            visible: true,
            locked: false,
          },
          {
            id: "l2",
            name: "Red",
            color: "#ff0000",
            visible: true,
            locked: false,
          },
        ],
        currentLayerId: "l2",
        entities: [
          {
            id: "l1",
            type: "line",
            layerId: "l2",
            start: { x: 0, y: 0 },
            end: { x: 1, y: 1 },
          },
        ],
      })
    )
    expect(parsed.currentLayerId).toBe("l2")
    expect(parsed.entities[0].layerId).toBe("l2")
    expect(parsed.settings.unit).toBe(LengthUnit.Centimeter)
  })

  it("version 3 — arcs arrive", () => {
    const parsed = parseDrawingFile(
      JSON.stringify({
        type: DRAWING_FILE_TYPE,
        version: 3,
        entities: [
          {
            id: "a1",
            type: "arc",
            center: { x: 0, y: 0 },
            radius: 100,
            startAngle: 0,
            endAngle: 1.5707963267948966,
          },
        ],
      })
    )
    expect(parsed.entities[0].type).toBe("arc")
  })

  it("version 4 — polylines with bulges arrive", () => {
    const parsed = parseDrawingFile(
      JSON.stringify({
        type: DRAWING_FILE_TYPE,
        version: 4,
        entities: [
          {
            id: "p1",
            type: "polyline",
            vertices: [
              { x: 0, y: 0 },
              { x: 100, y: 0 },
              { x: 100, y: 100 },
            ],
            closed: true,
            bulges: [0, 1, 0],
          },
        ],
      })
    )
    const polyline = parsed.entities[0]
    expect(polyline.type).toBe("polyline")
    if (polyline.type !== "polyline") return
    expect(polyline.bulges).toEqual([0, 1, 0])
    expect(polyline.closed).toBe(true)
  })

  it("versions 5 and 6 — linetype then lineweight arrive", () => {
    const parsed = parseDrawingFile(
      JSON.stringify({
        type: DRAWING_FILE_TYPE,
        version: 6,
        settings: { unit: "mm", precision: 2, ltScale: 3, lwDisplay: false },
        layers: [
          {
            id: "0",
            name: "0",
            color: "#e2e8f0",
            linetype: "Dashed",
            lineweight: 0.5,
            visible: true,
            locked: false,
          },
        ],
        entities: [
          {
            id: "l1",
            type: "line",
            layerId: "0",
            linetype: "Hidden",
            lineweight: 1.2,
            start: { x: 0, y: 0 },
            end: { x: 1, y: 0 },
          },
        ],
      })
    )
    expect(parsed.layers[0].linetype).toBe("Dashed")
    expect(parsed.layers[0].lineweight).toBe(0.5)
    expect(parsed.entities[0].linetype).toBe("Hidden")
    expect(parsed.entities[0].lineweight).toBe(1.2)
    expect(parsed.settings.ltScale).toBe(3)
    expect(parsed.settings.lwDisplay).toBe(false)
  })

  it("version 7 — a drawing from before text still gets a Standard style", () => {
    const parsed = parseDrawingFile(
      JSON.stringify({
        type: DRAWING_FILE_TYPE,
        version: 7,
        entities: [
          {
            id: "l1",
            type: "line",
            start: { x: 0, y: 0 },
            end: { x: 1, y: 0 },
          },
        ],
      })
    )
    expect(parsed.textStyles).toEqual([createDefaultTextStyle()])
    expect(parsed.currentTextStyleId).toBe("Standard")
    expect(parsed.entities).toHaveLength(1)
  })

  it("version 8 — a drawing from before dimensions still gets ISO-25", () => {
    const parsed = parseDrawingFile(
      JSON.stringify({
        type: DRAWING_FILE_TYPE,
        version: 8,
        entities: [
          {
            id: "l1",
            type: "line",
            start: { x: 0, y: 0 },
            end: { x: 1, y: 0 },
          },
        ],
      })
    )
    expect(parsed.dimStyles).toEqual([createDefaultDimStyle()])
    expect(parsed.currentDimStyleId).toBe("ISO-25")
    expect(parsed.entities).toHaveLength(1)
  })

  it("version 11 — a style from before radial dimensions gets DIMCEN", () => {
    const parsed = parseDrawingFile(
      JSON.stringify({
        type: DRAWING_FILE_TYPE,
        version: 11,
        dimStyles: [{ id: "ISO-25", name: "ISO-25", textHeight: 2.5 }],
        entities: [],
      })
    )
    expect(parsed.dimStyles[0].centerMark).toBe(
      createDefaultDimStyle().centerMark
    )
  })

  it("version 12 — a dimension from before angular ones has no vertex", () => {
    const parsed = parseDrawingFile(
      JSON.stringify({
        type: DRAWING_FILE_TYPE,
        version: 12,
        entities: [
          {
            id: "d1",
            type: "dimension",
            kind: "linear",
            first: { x: 0, y: 0 },
            second: { x: 100, y: 0 },
            linePoint: { x: 50, y: 40 },
            rotation: 0,
          },
        ],
      })
    )
    const dimension = parsed.entities[0]
    expect(dimension.type).toBe("dimension")
    expect("vertex" in dimension).toBe(false)
  })

  it("version 21 — a drawing from before Z lies flat", () => {
    const parsed = parseDrawingFile(
      JSON.stringify({
        type: DRAWING_FILE_TYPE,
        version: 21,
        entities: [
          {
            id: "l1",
            type: "line",
            start: { x: 0, y: 0 },
            end: { x: 10, y: 0 },
          },
        ],
        blocks: [
          {
            name: "B",
            basePoint: { x: 1, y: 2 },
            entities: [
              { id: "c1", type: "circle", center: { x: 0, y: 0 }, radius: 1 },
            ],
          },
        ],
      })
    )
    expect(parsed.entities[0]).not.toHaveProperty("elevation")
    expect(parsed.entities[0]).not.toHaveProperty("deltaZ")
    expect(parsed.blocks[0]).not.toHaveProperty("baseElevation")
  })

  it("version 16 — a drawing from before ellipses still opens", () => {
    const parsed = parseDrawingFile(
      JSON.stringify({
        type: DRAWING_FILE_TYPE,
        version: 16,
        entities: [
          { id: "c1", type: "circle", center: { x: 0, y: 0 }, radius: 10 },
        ],
      })
    )
    expect(parsed.entities).toHaveLength(1)
    expect(parsed.entities[0].type).toBe("circle")
  })

  it("normalises an ellipse stored with its shorter axis", () => {
    const parsed = parseDrawingFile(
      JSON.stringify({
        type: DRAWING_FILE_TYPE,
        version: DRAWING_FILE_VERSION,
        entities: [
          {
            id: "e1",
            type: "ellipse",
            center: { x: 0, y: 0 },
            majorAxis: { x: 20, y: 0 },
            // Above 1, so the stored vector is really the minor axis: a
            // hand-edited file that DXF would call malformed.
            ratio: 5,
          },
        ],
      })
    )
    const ellipse = parsed.entities[0]
    expect(ellipse.type).toBe("ellipse")
    if (ellipse.type !== "ellipse") return
    expect(ellipse.ratio).toBeCloseTo(0.2)
    expect(ellipse.majorAxis).toBeCloseToPoint(p(0, 100))
  })

  it("drops an ellipse with no axis to draw", () => {
    const parsed = parseDrawingFile(
      JSON.stringify({
        type: DRAWING_FILE_TYPE,
        version: DRAWING_FILE_VERSION,
        entities: [
          {
            id: "e1",
            type: "ellipse",
            center: { x: 0, y: 0 },
            majorAxis: { x: 0, y: 0 },
            ratio: 0.5,
          },
        ],
      })
    )
    expect(parsed.entities).toHaveLength(0)
  })
})

describe("dimensions", () => {
  const dim = createDimension(
    "linear",
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 50, y: 40 },
    { text: "<> mm", textAngle: Math.PI / 6, id: "d1" }
  )

  it("round-trips every definition point and override", () => {
    const parsed = parseDrawingFile(serializeDrawing(snapshotOf([dim])))
    expect(parsed.entities[0]).toEqual(dim)
  })

  it("round-trips an angular dimension's vertex", () => {
    const angular = createDimension(
      "angular",
      { x: 100, y: 0 },
      { x: 0, y: 100 },
      { x: 60, y: 60 },
      { vertex: { x: 0, y: 0 }, id: "d2" }
    )
    const parsed = parseDrawingFile(serializeDrawing(snapshotOf([angular])))
    expect(parsed.entities[0]).toEqual(angular)
  })

  it("drops a dimension whose definition points are unusable", () => {
    const parsed = parseDrawingFile(
      JSON.stringify({
        type: DRAWING_FILE_TYPE,
        version: DRAWING_FILE_VERSION,
        entities: [{ id: "d1", type: "dimension", first: { x: 0, y: 0 } }],
      })
    )
    expect(parsed.entities).toHaveLength(0)
  })

  it("fills a style's missing sizes from ISO-25", () => {
    const parsed = parseDrawingFile(
      JSON.stringify({
        type: DRAWING_FILE_TYPE,
        version: DRAWING_FILE_VERSION,
        dimStyles: [{ id: "ISO-25", name: "ISO-25", textHeight: 5 }],
      })
    )
    expect(parsed.dimStyles[0].textHeight).toBe(5)
    expect(parsed.dimStyles[0].arrowSize).toBe(DEFAULT_DIM_STYLE.arrowSize)
    expect(parsed.dimStyles[0].decimals).toBe(DEFAULT_DIM_STYLE.decimals)
  })
})

describe("hatches", () => {
  const hatch = createHatch(
    [
      { vertices: [p(0, 0), p(100, 0), p(100, 100), p(0, 100)] },
      { vertices: [p(50, 20), p(30, 20)], bulges: [1, 1] },
    ],
    { patternScale: 20, patternAngle: 0.5, origin: p(3, 4), id: "h1" }
  )

  it("round-trips every loop, bulge and pattern setting", () => {
    const parsed = parseDrawingFile(serializeDrawing(snapshotOf([hatch])))
    expect(parsed.entities[0]).toEqual(hatch)
  })

  it("drops a hatch with no usable boundary", () => {
    const parsed = parseDrawingFile(
      JSON.stringify({
        type: DRAWING_FILE_TYPE,
        version: DRAWING_FILE_VERSION,
        entities: [
          { id: "h1", type: "hatch", loops: [{ vertices: [{ x: 0, y: 0 }] }] },
          { id: "h2", type: "hatch" },
        ],
      })
    )
    expect(parsed.entities).toHaveLength(0)
  })

  it("fills missing pattern settings with the HP* initial values", () => {
    const parsed = parseDrawingFile(
      JSON.stringify({
        type: DRAWING_FILE_TYPE,
        version: DRAWING_FILE_VERSION,
        entities: [
          {
            id: "h1",
            type: "hatch",
            loops: [
              {
                vertices: [
                  { x: 0, y: 0 },
                  { x: 1, y: 0 },
                  { x: 1, y: 1 },
                ],
                bulges: "nonsense",
              },
            ],
            patternScale: -3,
            patternAngle: "sideways",
          },
        ],
      })
    )
    const entity = parsed.entities[0]
    expect(entity.type).toBe("hatch")
    if (entity.type !== "hatch") return
    expect(entity.patternId).toBe(DEFAULT_HATCH_PATTERN_ID)
    expect(entity.patternScale).toBe(DEFAULT_HATCH_SCALE)
    expect(entity.patternAngle).toBe(DEFAULT_HATCH_ANGLE)
    expect(entity.origin).toEqual({ x: 0, y: 0 })
    expect(entity.loops[0].bulges).toBeUndefined()
  })

  it("version 14 — a drawing from before hatches still opens", () => {
    const parsed = parseDrawingFile(
      JSON.stringify({
        type: DRAWING_FILE_TYPE,
        version: 14,
        entities: [
          {
            id: "l1",
            type: "line",
            start: { x: 0, y: 0 },
            end: { x: 1, y: 0 },
          },
        ],
      })
    )
    expect(parsed.entities).toHaveLength(1)
  })
})

describe("blocks", () => {
  const file = (extra: Record<string, unknown>) =>
    parseDrawingFile(
      JSON.stringify({
        type: DRAWING_FILE_TYPE,
        version: DRAWING_FILE_VERSION,
        ...extra,
      })
    )

  const bar = [
    { id: "b1", type: "line", start: { x: 0, y: 0 }, end: { x: 10, y: 0 } },
  ]

  it("names a definition after its id when the name is missing", () => {
    const parsed = file({ blocks: [{ id: "BAR", entities: bar }] })
    expect(parsed.blocks[0].name).toBe("BAR")
    expect(parsed.blocks[0].basePoint).toEqual({ x: 0, y: 0 })
  })

  it("skips definitions that are unusable or repeated", () => {
    const parsed = file({
      blocks: [
        "nonsense",
        { name: "EMPTY", entities: [] },
        { entities: bar },
        { name: "BAR", entities: bar },
        { name: "BAR", entities: bar },
      ],
    })
    expect(parsed.blocks.map((block) => block.name)).toEqual(["BAR"])
  })

  it("fills a reference's missing scale and rotation", () => {
    const parsed = file({
      blocks: [{ name: "BAR", entities: bar }],
      entities: [
        {
          id: "i1",
          type: "insert",
          blockId: "BAR",
          position: { x: 5, y: 6 },
          scale: -2,
          rotation: "sideways",
        },
      ],
    })
    const entity = parsed.entities[0]
    expect(entity.type).toBe("insert")
    if (entity.type !== "insert") return
    expect(entity.scale).toBe(1)
    expect(entity.rotation).toBe(0)
    expect(entity.mirrored).toBeUndefined()
  })

  it("drops a reference with no position or no block name", () => {
    const parsed = file({
      blocks: [{ name: "BAR", entities: bar }],
      entities: [
        { id: "i1", type: "insert", blockId: "BAR" },
        { id: "i2", type: "insert", position: { x: 0, y: 0 } },
      ],
    })
    expect(parsed.entities).toHaveLength(0)
  })
})
