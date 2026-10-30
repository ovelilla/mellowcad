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
import { Ucs, createUcs } from "../domain/ucs"
import { createDefaultTextStyle, createTextStyle } from "../domain/textStyles"
import { DEFAULT_DIM_STYLE, createDefaultDimStyle } from "../domain/dimStyles"
import {
  DEFAULT_HATCH_ANGLE,
  DEFAULT_HATCH_PATTERN_ID,
  DEFAULT_HATCH_SCALE,
} from "../domain/hatchPatterns"
import {
  Entity,
  HatchEntity,
  InsertEntity,
  createBlockDefinition,
  createDimension,
  createHatch,
  createInsert,
} from "../domain/entities"
import {
  drawingSnapshot,
  entity as entityArbitrary,
} from "../../test/arbitraries"
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

  it("reads the old default layer colour as index 7, keeping any other", () => {
    // Before 2026-10-23 layer 0 and new layers stored #e2e8f0, the stand-in
    // for AutoCAD's colour 7 (p300).
    const layers = [
      layerOf("0", { color: "#e2e8f0" }),
      layerOf("walls", { color: "#ff0000" }),
    ]
    const parsed = parseDrawingFile(
      serializeDrawing(snapshotOf([], { layers }))
    )
    expect(parsed.layers.map((layer) => layer.color)).toEqual([
      "#ffffff",
      "#ff0000",
    ])
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
    const ucs = createUcs({ x: 10, y: -5, z: 4 }, { x: 0.6, y: 0.8 })!
    const settings = {
      anglePrecision: 3,
      unit: LengthUnit.Meter,
      precision: 5,
      ltScale: 2.5,
      lwDisplay: false,
      attributeDisplay: "off" as const,
      ucs,
      ucsName: "Plot",
      ucsOrthographic: "front" as const,
      namedUcs: [{ name: "Plot", ucs }],
      ucsIcon: { visible: true, atOrigin: false },
      elevation: 3,
      thickness: -1.5,
      viewCube: {
        visible: false,
        home: {
          direction: { x: 0.6, y: -0.8, z: 0 },
          up: { x: 0, y: 0, z: 1 },
        },
      },
      currentColor: "#00ff00",
      currentLinetype: "Center",
      currentLineweight: 0.5,
      fillMode: false,
      polylineWidth: 4,
      filletRadius: 3,
      chamferDistance1: 2,
      chamferDistance2: 1,
      textSize: 3.5,
      textJustify: "mc" as const,
      textRotation: 0,
      hatchPatternName: "ANGLE",
      hatchPatternScale: 1,
      hatchPatternAngle: 0,
      orthoMode: true,
      snapMode: true,
      snapUnit: { x: 5, y: 2.5 },
      gridMode: false,
    }
    const parsed = parseDrawingFile(
      serializeDrawing(snapshotOf([], { settings }))
    )
    expect(parsed.settings).toEqual(settings)
  })

  it("leaves TEXT's rotation out: per drawing, never saved (rectang/p311)", () => {
    const settings = { ...DEFAULT_DOCUMENT_SETTINGS, textRotation: 1 }
    const file = serializeDrawing(snapshotOf([], { settings }))

    expect(file).not.toContain("textRotation")
    expect(parseDrawingFile(file).settings.textRotation).toBe(0)
  })

  it("leaves HPNAME, HPSCALE and HPANG out: per drawing, never saved (rectang/p303)", () => {
    const settings = {
      ...DEFAULT_DOCUMENT_SETTINGS,
      hatchPatternName: "_ANSI31",
      hatchPatternScale: 5,
      hatchPatternAngle: 0.5,
    }
    const file = serializeDrawing(snapshotOf([], { settings }))

    expect(file).not.toMatch(/hatchPattern(Name|Scale|Angle)/)
    expect(parseDrawingFile(file).settings).toEqual(DEFAULT_DOCUMENT_SETTINGS)
  })

  // What AutoCAD saves in the drawing, read back after OPEN (rectang/p302,
  // p304, p311, p316, p321), each left out of the file at its default.
  it("keeps FILLETRAD, CHAMFERA/B, TEXTSIZE, the justification and the drafting modes out at their defaults, as before 28", () => {
    const text = serializeDrawing(snapshotOf([]))
    expect(text).not.toMatch(
      /filletRadius|chamferDistance|textSize|textJustify|orthoMode|snapMode|snapUnit|gridMode/
    )
  })

  it("reads damaged saved command settings as their defaults", () => {
    const parsed = parseDrawingFile(
      serializeDrawing(snapshotOf([])).replace(
        '"namedUcs": []',
        `"namedUcs": [], "filletRadius": -1, "chamferDistance1": "2",
        "chamferDistance2": null, "textSize": 0, "textJustify": "sideways",
        "orthoMode": 1, "snapMode": "yes", "snapUnit": { "x": 0, "y": 5 },
        "gridMode": 0`
      )
    ).settings
    expect(parsed).toMatchObject({
      filletRadius: 0,
      chamferDistance1: 0,
      chamferDistance2: 0,
      textSize: DEFAULT_DOCUMENT_SETTINGS.textSize,
      textJustify: "left",
      orthoMode: false,
      snapMode: false,
      snapUnit: { x: 10, y: 10 },
      gridMode: true,
    })
  })

  it("writes a ByLayer CECOLOR, CELTYPE and CELWEIGHT as before 25", () => {
    const text = serializeDrawing(snapshotOf([]))
    expect(text).not.toMatch(/"current(Color|Linetype|Lineweight)"/)
    expect(parseDrawingFile(text).settings).toMatchObject({
      currentColor: "ByLayer",
      currentLinetype: "ByLayer",
      currentLineweight: "ByLayer",
    })
  })

  it("writes no orthographic UCS when there is none, as before 26", () => {
    const text = serializeDrawing(snapshotOf([]))
    expect(text).not.toMatch(/"ucsOrthographic"/)
    expect(parseDrawingFile(text).settings.ucsOrthographic).toBeNull()
    const read = (ucsOrthographic: unknown) =>
      parseDrawingFile(
        JSON.stringify({
          type: DRAWING_FILE_TYPE,
          version: DRAWING_FILE_VERSION,
          settings: { ucsOrthographic },
          entities: [],
        })
      ).settings.ucsOrthographic
    expect(read("back")).toBe("back")
    expect(read("BACK")).toBeNull()
  })

  it("opens a drawing from before 25 with everything new ByLayer", () => {
    const parsed = parseDrawingFile(
      JSON.stringify({
        type: DRAWING_FILE_TYPE,
        version: 24,
        settings: { unit: "mm" },
        entities: [],
      })
    )
    expect(parsed.settings).toMatchObject({
      currentColor: "ByLayer",
      currentLinetype: "ByLayer",
      currentLineweight: "ByLayer",
    })
  })

  it("reads a malformed current colour, linetype or lineweight tolerantly", () => {
    const read = (settings: object) =>
      parseDrawingFile(
        JSON.stringify({
          type: DRAWING_FILE_TYPE,
          version: DRAWING_FILE_VERSION,
          settings,
          entities: [],
        })
      ).settings
    expect(
      read({ currentColor: "#F00", currentLinetype: "", currentLineweight: 9 })
    ).toMatchObject({
      currentColor: "#ff0000",
      currentLinetype: "ByLayer",
      currentLineweight: 2.11,
    })
    expect(
      read({ currentColor: "red", currentLinetype: 3, currentLineweight: "x" })
    ).toMatchObject({
      currentColor: "ByLayer",
      currentLinetype: "ByLayer",
      currentLineweight: "ByLayer",
    })
  })

  it("writes no zero ELEVATION or THICKNESS", () => {
    const text = serializeDrawing(snapshotOf([]))
    expect(text).not.toMatch(/"(elevation|thickness)"/)
    expect(parseDrawingFile(text).settings).toMatchObject({
      elevation: 0,
      thickness: 0,
    })
  })

  it("writes a shown ViewCube and the default Home view as before 24", () => {
    const text = serializeDrawing(snapshotOf([]))
    expect(text).not.toMatch(/"(navVCubeDisplay|homeView)"/)
    expect(parseDrawingFile(text).settings.viewCube).toEqual({
      visible: true,
      home: null,
    })
  })

  it("opens a drawing from before 24 with the ViewCube shown and the default Home", () => {
    const parsed = parseDrawingFile(
      JSON.stringify({
        type: DRAWING_FILE_TYPE,
        version: 23,
        settings: { unit: "mm" },
        entities: [],
      })
    )
    expect(parsed.settings.viewCube).toEqual({ visible: true, home: null })
  })

  it("drops a Home view whose directions are not square", () => {
    const parsed = parseDrawingFile(
      JSON.stringify({
        type: DRAWING_FILE_TYPE,
        version: DRAWING_FILE_VERSION,
        settings: {
          navVCubeDisplay: 0,
          homeView: {
            direction: { x: 0, y: 0, z: 1 },
            up: { x: 0, y: 0.5, z: 0.5 },
          },
        },
        entities: [],
      })
    )
    expect(parsed.settings.viewCube).toEqual({ visible: false, home: null })
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
      origin: { x: 1, y: 2, z: 0 },
      xAxis: { x: 0, y: 1, z: 0 },
      yAxis: { x: -1, y: 0, z: 0 },
    })
    expect(parsed.settings.ucsName).toBeNull()
  })

  it("keeps a level UCS as before and a tilted one with both axes", () => {
    const front: Ucs = {
      origin: { x: 1, y: 2, z: 3 },
      xAxis: { x: 1, y: 0, z: 0 },
      yAxis: { x: 0, y: 0, z: 1 },
    }
    const level = createUcs({ x: 1, y: 2, z: 3 }, { x: 0, y: 1 })!
    const settings = { ...DEFAULT_DOCUMENT_SETTINGS, ucs: front }
    const text = serializeDrawing(
      snapshotOf([], {
        settings: {
          ...settings,
          namedUcs: [{ name: "Level", ucs: level }],
        },
      })
    )
    const file = JSON.parse(text)
    expect(file.settings.ucs).toEqual(front)
    expect(file.settings.namedUcs[0].ucs).toEqual({
      origin: { x: 1, y: 2, z: 3 },
      xAxis: { x: 0, y: 1 },
    })
    const parsed = parseDrawingFile(text).settings
    expect(parsed.ucs).toEqual(front)
    expect(parsed.namedUcs[0].ucs).toEqual(level)
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

  it("is fed every entity type, so the round trip reaches each reader", () => {
    // A new member of `Entity` fails to compile here until it is listed, and
    // the sample then fails until the arbitrary generates it — which is what
    // puts the type through the writer and the reader above: the reader
    // drops a type it does not know without a word.
    const ENTITY_TYPES = {
      line: true,
      circle: true,
      arc: true,
      ellipse: true,
      spline: true,
      polyline: true,
      polyline3d: true,
      text: true,
      mtext: true,
      attdef: true,
      dimension: true,
      hatch: true,
      insert: true,
    } satisfies Record<Entity["type"], true>
    const sampled = fc.sample(entityArbitrary, { numRuns: 1000, seed: 1 })
    expect(new Set(sampled.map((e) => e.type))).toEqual(
      new Set(Object.keys(ENTITY_TYPES))
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

describe("polyline widths", () => {
  it("writes one constant width as DXF's 43 does, and reads it back per segment", () => {
    const poly = polylineOf([p(0, 0), p(10, 0), p(10, 10)], {
      id: "P",
      closed: true,
      widths: [
        [2, 2],
        [2, 2],
        [2, 2],
      ],
    })
    const text = serializeDrawing(snapshotOf([poly]))
    expect(text).toMatch(/"constantWidth": 2/)
    expect(text).not.toMatch(/"widths"/)
    expect(parseDrawingFile(text).entities).toEqual([poly])
  })

  it("writes varying widths per segment, as DXF's 40 and 41", () => {
    const poly = polylineOf([p(0, 0), p(10, 0), p(10, 10)], {
      id: "P",
      widths: [
        [0, 5],
        [2, 2],
      ],
    })
    const text = serializeDrawing(snapshotOf([poly]))
    expect(text).not.toMatch(/constantWidth/)
    expect(parseDrawingFile(text).entities).toEqual([poly])
  })

  it("keeps the closing width of a closed polyline of two vertices", () => {
    // probe pline/p227: bulges 0.4142 and 2.4142, widths 2 and 4.
    const poly = polylineOf([p(0, 0), p(10, 10)], {
      id: "P",
      closed: true,
      bulges: [Math.tan(Math.PI / 8), Math.tan((3 * Math.PI) / 8)],
      widths: [
        [2, 2],
        [4, 4],
      ],
    })
    const text = serializeDrawing(snapshotOf([poly]))
    expect(parseDrawingFile(text).entities).toEqual([poly])
    const even = polylineOf([p(0, 0), p(10, 0)], {
      id: "Q",
      closed: true,
      widths: [
        [3, 3],
        [3, 3],
      ],
    })
    const evenText = serializeDrawing(snapshotOf([even]))
    expect(evenText).toMatch(/"constantWidth": 3/)
    expect(parseDrawingFile(evenText).entities).toEqual([even])
  })

  it("keeps widths and bulges together, segment by segment", () => {
    const poly = polylineOf([p(0, 0), p(10, 0), p(20, 10), p(30, 10)], {
      id: "P",
      bulges: [0, 0.41421356, -2],
      widths: [
        [0, 2],
        [2, 2],
        [1, 3],
      ],
    })
    const text = serializeDrawing(snapshotOf([poly]))
    expect(parseDrawingFile(text).entities).toEqual([poly])
  })

  it("writes no widths for a polyline with none", () => {
    const text = serializeDrawing(snapshotOf([polylineOf([p(0, 0), p(1, 0)])]))
    expect(text).not.toMatch(/idth/)
  })

  it("reads damaged widths tolerantly", () => {
    const vertices = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
    ]
    const read = (extra: Record<string, unknown>) => {
      const [entity] = parseDrawingFile(
        JSON.stringify({
          type: DRAWING_FILE_TYPE,
          version: DRAWING_FILE_VERSION,
          entities: [{ type: "polyline", vertices, ...extra }],
        })
      ).entities
      return entity.type === "polyline" ? entity.widths : "not a polyline"
    }
    expect(read({ widths: [[1, "x"], "nonsense", [-3, 2], [9, 9]] })).toEqual([
      [1, 0],
      [0, 0],
    ])
    expect(read({ widths: [[1, 2]] })).toEqual([
      [1, 2],
      [0, 0],
    ])
    expect(read({ widths: [[0, 0]] })).toBeUndefined()
    expect(read({ constantWidth: -1 })).toBeUndefined()
    expect(read({ constantWidth: 3, widths: [[1, 1]] })).toEqual([
      [3, 3],
      [3, 3],
    ])
  })

  it("keeps FILLMODE on and PLINEWID 0 out of the file, as before 27", () => {
    const text = serializeDrawing(snapshotOf([]))
    expect(text).not.toMatch(/fillMode|polylineWidth/)
    expect(parseDrawingFile(text).settings).toMatchObject({
      fillMode: true,
      polylineWidth: 0,
    })
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

  it("version 33 — a style from before DIMDSEP and DIMZIN reads ISO-25's (probe dimensions/p02)", () => {
    const parsed = parseDrawingFile(
      JSON.stringify({
        type: DRAWING_FILE_TYPE,
        version: 33,
        dimStyles: [{ id: "ISO-25", name: "ISO-25", decimals: 3 }],
        entities: [],
      })
    )
    expect(parsed.dimStyles[0].decimalSeparator).toBe(",")
    expect(parsed.dimStyles[0].suppressTrailingZeros).toBe(true)
  })

  it("version 34 — a style from before DIMTOFL reads ISO-25's On (probe dimensions/p06)", () => {
    const parsed = parseDrawingFile(
      JSON.stringify({
        type: DRAWING_FILE_TYPE,
        version: 34,
        dimStyles: [{ id: "ISO-25", name: "ISO-25", forceLineInside: "no" }],
        entities: [],
      })
    )
    expect(parsed.dimStyles[0].forceLineInside).toBe(true)
  })

  it("keeps a style's separator, zeros and DIMTOFL, and a moved dimension text", () => {
    const style = {
      ...createDefaultDimStyle(),
      decimalSeparator: ".",
      suppressTrailingZeros: false,
      forceLineInside: false,
    }
    const moved = createDimension("linear", p(0, 0), p(40, 0), p(30, 20), {
      textPoint: p(30, 20),
    })
    const parsed = parseDrawingFile(
      serializeDrawing({ ...snapshotOf([moved]), dimStyles: [style] })
    )
    expect(parsed.dimStyles[0]).toEqual(style)
    expect(parsed.entities[0]).toEqual(moved)
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

  it("version 26 — a drawing from before widths has none, fills and starts PLINE at 0", () => {
    const parsed = parseDrawingFile(
      JSON.stringify({
        type: DRAWING_FILE_TYPE,
        version: 26,
        settings: { unit: "mm", precision: 2 },
        entities: [
          {
            id: "p1",
            type: "polyline",
            layerId: "0",
            vertices: [
              { x: 0, y: 0 },
              { x: 10, y: 0 },
            ],
            closed: false,
          },
        ],
      })
    )
    const [polyline] = parsed.entities
    expect(polyline.type === "polyline" && polyline.widths).toBeUndefined()
    expect(parsed.settings.fillMode).toBe(true)
    expect(parsed.settings.polylineWidth).toBe(0)
  })

  it("version 27 — a drawing from before saved command settings gets acadiso's", () => {
    const parsed = parseDrawingFile(
      JSON.stringify({
        type: DRAWING_FILE_TYPE,
        version: 27,
        settings: { unit: "mm", precision: 2 },
        entities: [],
      })
    )
    expect(parsed.settings).toMatchObject({
      filletRadius: 0,
      chamferDistance1: 0,
      chamferDistance2: 0,
      textSize: 2.5,
      textJustify: "left",
      orthoMode: false,
      snapMode: false,
      snapUnit: { x: 10, y: 10 },
      gridMode: true,
    })
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

  // HATCH-D63: until version 31 the registry held acad.pat's imperial ANSI31
  // (spacing 0.125), since 32 acadiso.pat's (3.175, probe hatch/p300).
  it("version 31 — an ANSI31 hatch keeps the spacing it was drawn with", () => {
    const old = (patternId?: string) =>
      parseDrawingFile(
        JSON.stringify({
          type: DRAWING_FILE_TYPE,
          version: 31,
          entities: [
            {
              id: "h1",
              type: "hatch",
              loops: [{ vertices: [p(0, 0), p(100, 0), p(100, 50)] }],
              ...(patternId ? { patternId } : {}),
              patternScale: 20,
            },
          ],
        })
      ).entities[0] as HatchEntity
    expect(old("ANSI31").patternScale).toBeCloseTo(20 / 25.4, 12)
    // A hatch saved without a name was the default of its day, ANSI31.
    expect(old().patternId).toBe("ANSI31")
    expect(old().patternScale).toBeCloseTo(20 / 25.4, 12)
    expect(old("SOLID").patternScale).toBe(20)
    expect(DRAWING_FILE_VERSION).toBeGreaterThanOrEqual(32)
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

  const reference = (fields: Record<string, unknown>, version?: number) => {
    const parsed = file({
      ...(version === undefined ? {} : { version }),
      blocks: [{ name: "BAR", entities: bar }],
      entities: [
        {
          id: "i1",
          type: "insert",
          blockId: "BAR",
          position: { x: 5, y: 6 },
          ...fields,
        },
      ],
    })
    const entity = parsed.entities[0]
    if (entity?.type !== "insert") throw new Error("no reference read")
    return entity
  }
  const factors = (entity: InsertEntity) => [entity.scaleX, entity.scaleY]

  it("fills a reference's missing or unusable factors and rotation", () => {
    expect(factors(reference({}))).toEqual([1, 1])
    const damaged = reference({
      scaleX: 0,
      scaleY: "tall",
      rotation: "sideways",
    })
    expect(factors(damaged)).toEqual([1, 1])
    expect(damaged.rotation).toBe(0)
    // A factor missing reads as the other's size.
    expect(factors(reference({ scaleX: -2 }))).toEqual([-2, 2])
  })

  it("keeps a negative or unequal factor on either axis", () => {
    expect(factors(reference({ scaleX: 2, scaleY: -3 }))).toEqual([2, -3])
  })

  it("reads a file before version 33's one scale and its mirror flag", () => {
    expect(factors(reference({ scale: 3 }, 32))).toEqual([3, 3])
    expect(factors(reference({ scale: 3, mirrored: true }, 32))).toEqual([
      -3, 3,
    ])
    // That scale was always positive: anything else read as 1.
    expect(factors(reference({ scale: -2, mirrored: "yes" }, 32))).toEqual([
      1, 1,
    ])
  })

  it("reads an array's parameters, and keeps a damaged one's reference plain", () => {
    const array = (parameters: Record<string, unknown>) => ({
      id: "a",
      type: "insert",
      blockId: "*U1",
      position: { x: 0, y: 0 },
      array: parameters,
    })
    const rect = {
      kind: "rectangular",
      columns: 4,
      rows: 3,
      colSpacing: 6,
      rowSpacing: -6,
      rowElevation: 0,
      axis: { x: 0, y: 2 },
    }
    const polar = {
      kind: "polar",
      center: { x: 0, y: 0 },
      basePoint: { x: 10, y: 10 },
      items: 6,
      fill: 360,
      clockwise: false,
      rotate: true,
    }
    const path = {
      kind: "path",
      path: {
        pieces: [
          { kind: "line", a: { x: 0, y: 0 }, b: { x: 100, y: 0 } },
          {
            kind: "arc",
            center: { x: 100, y: 10 },
            radius: 10,
            start: -Math.PI / 2,
            sweep: Math.PI,
          },
        ],
        length: 1,
        closed: false,
      },
      pathId: "P",
      method: "measure",
      items: 17,
      spacing: 6,
      align: true,
    }
    const damaged = [
      { ...rect, columns: 0 },
      { ...rect, rows: 32768 },
      { ...rect, axis: { x: 0, y: 0 } },
      { ...rect, colSpacing: "6" },
      { ...polar, fill: 0 },
      { ...polar, fill: 361 },
      { ...polar, rotate: "Yes" },
      { ...polar, center: null },
      { ...path, method: "along" },
      { ...path, spacing: 0 },
      { ...path, pathId: 7 },
      { ...path, path: { ...path.path, pieces: [] } },
      { ...path, path: { ...path.path, pieces: [{ kind: "spline" }] } },
      { ...path, path: { ...path.path, closed: "no" } },
      { ...path, path: "line" },
      { kind: "spiral" },
    ]
    const parsed = file({
      blocks: [{ name: "*U1", entities: bar }],
      entities: [rect, polar, path, ...damaged].map(array),
    })

    expect(parsed.entities).toHaveLength(3 + damaged.length)
    const [r, o, a] = parsed.entities.map((e) =>
      e.type === "insert" ? e.array : undefined
    )
    expect(r).toEqual({ ...rect, axis: { x: 0, y: 1 } })
    expect(o).toEqual(polar)
    // From 31 a stretched ring keeps its source's anchor; a malformed one is
    // none, the source where it stands.
    const stretched = file({
      blocks: [{ name: "*U1", entities: bar }],
      entities: [
        { ...polar, sourceBase: { x: 10, y: 5 } },
        { ...polar, sourceBase: { x: "10", y: 5 } },
      ].map(array),
    }).entities.map((e) => (e.type === "insert" ? e.array : undefined))
    expect(stretched[0]).toEqual({ ...polar, sourceBase: { x: 10, y: 5 } })
    expect(stretched[1]).toEqual(polar)
    // The length is the pieces', whatever the file says.
    expect(a?.kind === "path" && a.path.length).toBeCloseTo(100 + 10 * Math.PI)
    for (const plain of parsed.entities.slice(3)) {
      expect(plain).not.toHaveProperty("array")
    }
  })

  it("writes no anonymous block that no reference places", () => {
    const anonymous = (name: string) =>
      createBlockDefinition(name, p(0, 0), [
        lineOf(p(0, 0), p(10, 0), { id: `${name}-line` }),
      ])
    const holder = createBlockDefinition("HOLDER", p(0, 0), [
      createInsert("*U3", p(0, 0), { id: "nested" }),
    ])
    const written = parseDrawingFile(
      serializeDrawing({
        ...snapshotOf([createInsert("*U1", p(0, 0), { id: "array" })]),
        blocks: [anonymous("*U1"), anonymous("*U2"), anonymous("*U3"), holder],
      })
    )
    expect(written.blocks.map((block) => block.name)).toEqual([
      "*U1",
      "*U3",
      "HOLDER",
    ])
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

describe("tolerates damaged content in the later types and tables", () => {
  const file = (extra: Record<string, unknown>) =>
    JSON.stringify({
      type: DRAWING_FILE_TYPE,
      version: DRAWING_FILE_VERSION,
      ...extra,
    })
  const square = { x: 1, y: 0, z: 0 }

  it("fills a spline's unknown method, knots and degree with the defaults", () => {
    const parsed = parseDrawingFile(
      file({
        entities: [
          {
            id: "S",
            type: "spline",
            method: "bezier",
            knots: "centripetal",
            points: [{ x: 0, y: 0 }, { x: 10, y: 5 }, "bad", { x: 20, y: 0 }],
          },
          { id: "S1", type: "spline", points: [{ x: 0, y: 0 }] },
        ],
      })
    )
    expect(parsed.entities).toHaveLength(1)
    expect(parsed.entities[0]).toMatchObject({
      type: "spline",
      method: "fit",
      knots: "chord",
      closed: false,
    })
  })

  it("fills a multiline text's malformed settings and drops one with no contents", () => {
    const parsed = parseDrawingFile(
      file({
        entities: [
          {
            id: "M",
            type: "mtext",
            position: { x: 0, y: 0 },
            contents: "A\PB",
            height: -2,
            width: "wide",
            rotation: null,
            attachment: "zz",
            lineSpacingStyle: "exactly",
            lineSpacingFactor: "x",
          },
          { id: "M2", type: "mtext", position: { x: 0, y: 0 } },
        ],
      })
    )
    expect(parsed.entities).toHaveLength(1)
    expect(parsed.entities[0]).toMatchObject({
      type: "mtext",
      width: 0,
      rotation: 0,
      attachment: "tl",
      lineSpacingStyle: "exactly",
      lineSpacingFactor: 1,
    })
  })

  it("reads an attribute definition's modes one by one and drops one with no tag", () => {
    const parsed = parseDrawingFile(
      file({
        entities: [
          {
            id: "A",
            type: "attdef",
            position: { x: 0, y: 0 },
            tag: " PART ",
            modes: { invisible: true, constant: "yes" },
            height: 0,
            justify: "nowhere",
          },
          { id: "A2", type: "attdef", position: { x: 0, y: 0 }, tag: "  " },
          { id: "A3", type: "attdef", tag: "NO_POSITION" },
        ],
      })
    )
    expect(parsed.entities).toHaveLength(1)
    expect(parsed.entities[0]).toMatchObject({
      type: "attdef",
      tag: "PART",
      prompt: "",
      value: "",
      justify: "left",
      modes: { invisible: true, constant: false, lockPosition: true },
    })
  })

  it("keeps a reference's usable attributes and skips the rest", () => {
    const parsed = parseDrawingFile(
      file({
        blocks: [
          {
            name: "B",
            entities: [
              { type: "line", start: { x: 0, y: 0 }, end: { x: 1, y: 0 } },
            ],
          },
          { name: "B", entities: [] },
          { entities: [] },
          "not a block",
        ],
        entities: [
          {
            id: "I",
            type: "insert",
            blockId: "B",
            position: { x: 0, y: 0 },
            attributes: [
              "bad",
              { tag: "NO_POSITION" },
              { position: { x: 0, y: 0 }, tag: "" },
              {
                tag: "PART",
                position: { x: 1, y: 2 },
                elevation: 3,
                color: "#ff0000",
                linetype: "Dashed",
                lineweight: 0.5,
              },
            ],
          },
        ],
      })
    )
    expect(parsed.blocks.map((block) => block.name)).toEqual(["B"])
    const insert = parsed.entities[0]
    expect(insert.type === "insert" && insert.attributes).toEqual([
      expect.objectContaining({
        tag: "PART",
        value: "",
        elevation: 3,
        color: "#ff0000",
        linetype: "Dashed",
        layerId: DEFAULT_LAYER_ID,
      }),
    ])
  })

  it("keeps the named UCSs that are whole, once each, and squares a skewed one", () => {
    const parsed = parseDrawingFile(
      file({
        settings: {
          ucs: { origin: { x: 1, y: 2 }, xAxis: { x: 0, y: 1 } },
          namedUcs: [
            "bad",
            { name: 7 },
            { name: "A", ucs: { origin: { x: 0, y: 0 } } },
            { name: "A", ucs: { origin: { x: 0, y: 0 }, xAxis: square } },
            { name: "a", ucs: { origin: { x: 5, y: 0 }, xAxis: square } },
            {
              name: "Skewed",
              ucs: {
                origin: { x: 0, y: 0, z: 4 },
                xAxis: { x: 2, y: 0, z: 0 },
                yAxis: { x: 1, y: 1, z: 0 },
              },
            },
          ],
          homeView: { direction: { x: 0, y: 0, z: 1 } },
        },
      })
    )
    const { ucs, namedUcs, viewCube } = parsed.settings
    expect(ucs.origin).toEqual({ x: 1, y: 2, z: 0 })
    expect(namedUcs.map((entry) => entry.name)).toEqual(["A", "Skewed"])
    const skewed = namedUcs[1].ucs
    expect(skewed.origin.z).toBe(4)
    expect(skewed.xAxis).toEqual({ x: 1, y: 0, z: 0 })
    expect(skewed.yAxis.x).toBeCloseTo(0)
    expect(viewCube.home).toBeNull()
  })

  it("skips malformed and repeated style entries, keeping the base ones", () => {
    const parsed = parseDrawingFile(
      file({
        textStyles: [
          "bad",
          { id: "" },
          { id: "T" },
          { id: "T", name: "Again" },
        ],
        dimStyles: ["bad", { id: "" }, { id: "D" }, { id: "D", name: "Again" }],
        layers: ["bad", { id: "" }],
        entities: [
          {
            type: "hatch",
            loops: [
              "bad",
              { vertices: [{ x: 0, y: 0 }] },
              {
                vertices: [
                  { x: 0, y: 0 },
                  { x: 10, y: 0 },
                ],
                bulges: [1, "x"],
              },
            ],
          },
        ],
      })
    )
    expect(parsed.textStyles.map((style) => style.name)).toContain("T")
    expect(parsed.textStyles.filter((style) => style.id === "T")).toHaveLength(
      1
    )
    expect(parsed.dimStyles.filter((style) => style.id === "D")).toEqual([
      expect.objectContaining({ name: "D" }),
    ])
    expect(parsed.layers.map((layer) => layer.id)).toEqual([DEFAULT_LAYER_ID])
    const hatch = parsed.entities[0]
    expect(hatch.type === "hatch" && hatch.loops).toEqual([
      { vertices: [p(0, 0), p(10, 0)], bulges: [1, 0] },
    ])
  })
})
