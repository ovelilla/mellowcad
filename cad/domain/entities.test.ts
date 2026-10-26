import fc from "fast-check"
import { describe, expect, it } from "vitest"
import { V, type Vec2 } from "../geometry/Vec2"
import { normalizeAngle } from "../geometry/primitives"
import {
  type Entity,
  type ArcEntity,
  type CircleEntity,
  type LineEntity,
  type PolylineEntity,
  applyEntityProperty,
  arcEndPoint,
  arcLength,
  arcMidpoint,
  arcStartPoint,
  arcSweepAngle,
  assignEntityColor,
  assignEntityLayer,
  assignEntityLinetype,
  assignEntityLineweight,
  carryPiece,
  circleArea,
  circleCircumference,
  closestOnEntity,
  coplanar,
  copyEntity,
  createAttributeDefinition,
  createBlockDefinition,
  createDimension,
  createHatch,
  createInsert,
  createLine,
  createMText,
  createPolyline,
  dimensionAxisAngle,
  dimensionMeasurement,
  dimensionText,
  distanceToEntity,
  createEllipse,
  ellipseEndPoint,
  ellipseLengthTable,
  ellipseMidpoint,
  ellipseQuadrantPoints,
  ellipseSemiMajor,
  ellipseSemiMinor,
  ellipseStartPoint,
  entityBounds,
  entityCrossesRect,
  entityElevation,
  entityNormal,
  entityThickness,
  entityWithinRect,
  hatchGeometry,
  hatchLoopFromEntity,
  hatchLoopSegments,
  insertGeometry,
  insertPolylineVertex,
  lineAngleDegrees,
  lineEndZ,
  lineLength,
  lineMidpoint,
  lineStartZ,
  matchEntityProperties,
  measureTextInk,
  measureTextWidth,
  mirrorEntity,
  mirrorEntityCopy,
  mirrorPoint,
  polylineArea,
  polylineBulge,
  polylineConstantWidth,
  polylineLength,
  polylineSegmentGeometries,
  polylineSegments,
  pointInsideHatch,
  removePolylineVertex,
  replacePolylineVertex,
  rotateEntity,
  rotateEntityCopy,
  rotatePoint,
  scaleEntity,
  scaleEntityCopy,
  scalePoint,
  setPolylineBulge,
  stretchPolylineVertices,
  splineEndPoint,
  splineStartPoint,
  stretchEntity,
  textBox,
  textCorners,
  textInsertionPoint,
  translateEntity,
  withElevation,
  withThickness,
} from "./entities"
import { DEFAULT_LAYER_ID } from "./layers"
import { SOLID_HATCH_PATTERN_ID } from "./hatchPatterns"
import {
  angle,
  distinctPoints,
  entity as entityArb,
  point,
  positiveLength,
  zValue,
} from "../../test/arbitraries"
import {
  arcOf,
  circleOf,
  deg,
  ellipseOf,
  lineOf,
  loopOf,
  p,
  polylineOf,
  textOf,
} from "../../test/builders"

describe("text", () => {
  const note = () =>
    textOf(p(10, 20), "NOTE", { height: 5, rotation: 0, id: "T1" })

  it("turns with a rotation and grows with a scale", () => {
    const rotated = rotateEntity(note(), p(10, 20), deg(90))
    expect(rotated.type === "text" && rotated.rotation).toBeCloseTo(deg(90))

    const scaled = scaleEntity(note(), p(0, 0), 3)
    expect(scaled.type === "text" && scaled.height).toBeCloseTo(15)
    expect(scaled.type === "text" && scaled.position).toBeCloseToPoint(
      p(30, 60)
    )
  })

  // probes transforms/p283, p290–p294 (MIRRTEXT 0): AutoCAD's rotations. A
  // text the mirror moved out of the half-plane it read in, (−90°, 90°] or
  // the other, turns half round and runs back along its baseline; one it
  // stood on its head flips across the baseline.
  const sortedPoints = (points: readonly Vec2[]) =>
    [...points].sort(
      (u, v) => Math.round((u.x - v.x) * 1e6) || Math.round((u.y - v.y) * 1e6)
    )
  const MIRROR_LINES = {
    "x = 0": [p(0, 0), p(0, 10)],
    "y = 0": [p(0, 0), p(10, 0)],
    "y = x": [p(0, 0), p(10, 10)],
  } as const
  it.each([
    ["p283", "x = 0", 30, 330],
    ["p290", "x = 0", 0, 0],
    ["p290", "x = 0", 100, 260],
    ["p294", "x = 0", 45, 315],
    ["p294", "x = 0", 90, 90],
    ["p294", "x = 0", 135, 225],
    ["p294", "x = 0", 270, 270],
    ["p291", "y = 0", 0, 0],
    ["p291", "y = 0", 100, 260],
    ["p293", "y = 0", 45, 315],
    ["p293", "y = 0", 90, 90],
    ["p293", "y = 0", 135, 225],
    ["p293", "y = 0", 270, 270],
    ["p292", "y = x", 0, 90],
    ["p292", "y = x", 100, 170],
  ] as const)(
    "%s: mirrored about %s, a text at %s° reads at %s°, its box mirrored",
    (_, line, from, to) => {
      const [a, b] = MIRROR_LINES[line]
      // Not Right nor Middle, whose point AutoCAD mirrors otherwise (p337).
      for (const justify of ["left", "center", "tl", "mc", "br"] as const) {
        const text = textOf(p(10, 20), "Hola", {
          height: 5,
          rotation: deg(from),
          justify,
        })
        const mirrored = mirrorEntity(text, a, b)
        if (mirrored.type !== "text") throw new Error("not a text")
        expect(mirrored.rotation).toBeCloseToAngle(deg(to), 9)
        expect(mirrored.justify).toBe(justify)
        expect(mirrored.value).toBe("Hola")
        expect(sortedPoints(textCorners(mirrored))).toBeCloseToPoints(
          sortedPoints(textCorners(text).map((c) => mirrorPoint(c, a, b))),
          9
        )
        const copy = mirrorEntityCopy(text, a, b)
        if (copy.type !== "text") throw new Error("not a text")
        expect(copy.position).toBeCloseToPoint(mirrored.position, 12)
        expect(copy.rotation).toBeCloseToAngle(mirrored.rotation, 12)
      }
    }
  )

  // probe transforms/p283: Hola, BaseLeft at 10,10, 30°, mirrored about x = 0
  // starts at the image of its ink box's end: (-22.668, 17.314), the ink
  // spanning 14.628 from the point; a right-justified one is aligned at the
  // image of its ink's start, (-32.527, 40) for Adios.
  it("lands where AutoCAD's MIRRTEXT 0 puts it (transforms/p283)", () => {
    const hola = mirrorEntity(
      textOf(p(10, 10), "Hola", { height: 5, rotation: deg(30) }),
      p(0, 0),
      p(0, 10)
    )
    expect(hola.type === "text" && hola.position).toBeCloseToPoint(
      p(-22.668, 17.314),
      3
    )
    const adios = mirrorEntity(
      textOf(p(50, 40), "Adios", { height: 5, justify: "right" }),
      p(0, 0),
      p(0, 10)
    )
    expect(adios.type === "text" && adios.position.x).toBeCloseTo(-32.527, 3)
    expect(adios.type === "text" && adios.position.y).toBeCloseTo(40, 9)
  })

  // probe text/p337: Adios and Hola at 5, each justification's point at x 40,
  // mirrored about x = 0, turned back to read: refitted in the mirrored ink
  // box, but Right's point goes to the image of the baseline's start and
  // Middle's to its own image.
  it.each([
    ["left", "Adios", -57.19304229195089],
    ["left", "Hola", -54.62824010914052],
    ["center", "Adios", -39.73055934515689],
    ["center", "Hola", -40.26261937244202],
    ["right", "Adios", -22.527285129604365],
    ["right", "Hola", -25.6343792633015],
    ["middle", "Adios", -40],
    ["middle", "Hola", -40],
    ["tl", "Adios", -57.19304229195089],
    ["mc", "Hola", -40.26261937244202],
    ["br", "Adios", -22.247612551159623],
    ["br", "Hola", -25.89699863574352],
    ["bc", "Adios", -39.73055934515689],
  ] as const)(
    "puts a %s %s mirrored back along its baseline where AutoCAD does (text/p337)",
    (justify, value, x) => {
      const mirrored = mirrorEntity(
        textOf(p(40, 15), value, { height: 5, justify }),
        p(0, 0),
        p(0, 10)
      )
      if (mirrored.type !== "text") throw new Error("not a text")
      expect(mirrored.position.x).toBeCloseTo(x, 4)
      expect(mirrored.position.y).toBeCloseTo(15, 9)
      expect(mirrored.rotation).toBeCloseToAngle(0, 9)
    }
  )

  // probe text/p338: flipped across the baseline (about y = 0), Right and
  // Middle refit in the ink box like the rest: Right Agh at y 10 → −13.530.
  it.each([
    ["right", "Agh", -13.530013642564802],
    ["right", "HHH", -15],
    ["middle", "Agh", -10],
    ["center", "Agh", -13.530013642564802],
  ] as const)(
    "flips a %s %s across its baseline as AutoCAD (text/p338)",
    (justify, value, y) => {
      const mirrored = mirrorEntity(
        textOf(p(-85, 10), value, { height: 5, justify }),
        p(0, 0),
        p(10, 0)
      )
      if (mirrored.type !== "text") throw new Error("not a text")
      expect(mirrored.position).toBeCloseToPoint(p(-85, y), 4)
    }
  )

  // probe text/p331: Agh at 10, BL at 0,0, TL at 60,0, Middle at 120,0,
  // mirrored about y = 20: each is refitted in its reflected ink box, so the
  // BL point lands at 27.019, not at 30 (TXO-01).
  it.each([
    ["bl", p(0, 0), p(0, 27.01909959072306), p(0, 29.97953615279673)],
    ["tl", p(60, 0), p(60, 52.93997271487039), p(60, 42.93997271487039)],
    ["middle", p(120, 0), p(120, 40), p(107.5818553888131, 36.4699863574352)],
  ] as const)(
    "refits a %s text in its mirrored ink box (text/p331)",
    (justify, at, point, insertion) => {
      const mirrored = mirrorEntity(
        textOf(at, "Agh", { height: 10, justify }),
        p(0, 20),
        p(10, 20)
      )
      if (mirrored.type !== "text") throw new Error("not a text")
      expect(mirrored.position).toBeCloseToPoint(point, 4)
      expect(textInsertionPoint(mirrored)).toBeCloseToPoint(insertion, 4)
      expect(mirrored.rotation).toBeCloseToAngle(0, 9)
    }
  )

  // probes transforms/p283, p290, p291, p292: MTEXT's attachment point
  // reflects, and its attachment swaps sides as TEXT turns back: TopLeft
  // becomes TopRight about x = 0, BottomLeft about y = 0 and y = x.
  it.each([
    ["p290", "x = 0", p(-10, 80), "tr", 0],
    ["p291", "y = 0", p(10, -80), "bl", 0],
    ["p292", "y = x", p(80, 10), "bl", 90],
  ] as const)(
    "%s: an MTEXT mirrored about %s attaches at %s, %s",
    (_, line, position, attachment, rotation) => {
      const [a, b] = MIRROR_LINES[line]
      const mtext = createMText(p(10, 80), "Hola", { height: 5, width: 30 })
      for (const mirrored of [
        mirrorEntity(mtext, a, b),
        mirrorEntityCopy(mtext, a, b),
      ]) {
        if (mirrored.type !== "mtext") throw new Error("not an MTEXT")
        expect(mirrored.position).toBeCloseToPoint(position, 9)
        expect(mirrored.attachment).toBe(attachment)
        expect(mirrored.rotation).toBeCloseToAngle(deg(rotation), 9)
        expect(mirrored.width).toBe(30)
      }
    }
  )

  it("mirrors an attribute definition as a text of its tag", () => {
    const definition = createAttributeDefinition(p(10, 10), "PART", {
      height: 5,
      rotation: deg(30),
    })
    const text = mirrorEntity(
      textOf(p(10, 10), "PART", { height: 5, rotation: deg(30) }),
      p(0, 0),
      p(0, 10)
    )
    if (text.type !== "text") throw new Error("not a text")
    for (const mirrored of [
      mirrorEntity(definition, p(0, 0), p(0, 10)),
      mirrorEntityCopy(definition, p(0, 0), p(0, 10)),
    ]) {
      if (mirrored.type !== "attdef") throw new Error("not a definition")
      expect(mirrored.position).toBeCloseToPoint(text.position, 9)
      expect(mirrored.rotation).toBeCloseToAngle(text.rotation, 9)
    }
  })

  it("moves whole when its insertion point is caught by a stretch frame", () => {
    const inside = stretchEntity(note(), p(5, 0), () => true)
    const outside = stretchEntity(note(), p(5, 0), () => false)
    expect(inside.type === "text" && inside.position).toBeCloseToPoint(
      p(15, 20)
    )
    expect(outside).toEqual(note())
  })

  it("bounds the box its justification places", () => {
    const text = textOf(p(0, 0), "ABCD", { height: 10, justify: "left" })
    const bounds = entityBounds(text)
    const ink = measureTextInk("ABCD", 10)
    expect(bounds.min).toBeCloseToPoint(p(ink.x0, ink.y0))
    expect(bounds.max).toBeCloseToPoint(p(ink.x1, ink.y1))
    expect(textCorners(text)).toHaveLength(4)
  })

  it("measures with Arial's advance widths, scaled by H's ink height (text/p301, p302)", () => {
    // Arial: W 1933, i 455 font units; H 1466 units tall, not OS/2's 1467
    // (TXO-04): H's advance at 10 is 10.0887, Agh's 24.85675.
    expect(measureTextWidth("W", 1466)).toBeCloseTo(1933)
    expect(measureTextWidth("i", 1466)).toBeCloseTo(455)
    expect(measureTextWidth("Wi", 2.5)).toBeCloseTo(((1933 + 455) / 1466) * 2.5)
    expect(measureTextWidth("H", 10)).toBeCloseTo((99.7613 - 19.0518) / 8, 4)
    expect(measureTextWidth("Agh", 10)).toBeCloseTo(24.85675306957708, 9)
  })

  // probe text/p301: AutoCAD's (textbox) at 10, the ink box from the
  // baseline's left end.
  it.each([
    ["H", 1.11869, 0, 8.96317, 10],
    ["HHHHHHHHHH", 1.11869, 0, 99.7613, 10],
    ["x", 0.102319, 0, 6.88267, 7.2442],
    ["g", 0.450205, -2.93997, 6.83492, 7.40791],
    ["OLD", 0.675307, -0.170532, 27.9809, 10.1774],
    ["Hola", 1.11869, -0.163711, 28.1378, 10],
    ["Ag", -0.0204638, -2.93997, 16.1528, 10],
    ["The quick brown fox", 0.327422, -2.77626, 124.911, 10.1705],
    ["ñÁé", 0.920873, -0.163711, 24.2769, 12.5239],
  ] as const)(
    "boxes %s as AutoCAD's textbox (text/p301)",
    (value, x0, y0, x1, y1) => {
      const ink = measureTextInk(value, 10)
      expect(ink.x0).toBeCloseTo(x0, 4)
      expect(ink.y0).toBeCloseTo(y0, 4)
      expect(ink.x1).toBeCloseTo(x1, 3)
      expect(ink.y1).toBeCloseTo(y1, 4)
    }
  )

  // probe text/p302: Agh at 10 at 0,0, AutoCAD's DXF 10 per justification.
  // Bottom puts the baseline Arial's descent above the point (TXO-01),
  // Middle centres the ink (TXO-05), and Center halves the span from A's
  // overhang to the advance's end.
  it.each([
    ["left", 0, 0],
    ["center", -12.418144611186904, 0],
    ["right", -24.85675306957708, 0],
    ["middle", -12.418144611186904, -3.530013642564802],
    ["tl", 0, -10],
    ["tc", -12.418144611186904, -10],
    ["tr", -24.85675306957708, -10],
    ["ml", 0, -5],
    ["mc", -12.418144611186904, -5],
    ["mr", -24.85675306957708, -5],
    ["bl", 0, 2.96043656207367],
    ["bc", -12.418144611186904, 2.96043656207367],
    ["br", -24.85675306957708, 2.96043656207367],
  ] as const)(
    "places a %s text's baseline as AutoCAD (text/p302)",
    (justify, x, y) => {
      const text = textOf(p(0, 0), "Agh", { height: 10, justify })
      expect(textInsertionPoint(text)).toBeCloseToPoint(p(x, y), 6)
      // The box is the ink's where the glyphs stand: a BL text's covers them.
      const box = textBox(justify, "Agh", 10)
      expect(box.y0).toBeCloseTo(y - 2.93997, 4)
      expect(box.y1).toBeCloseTo(y + 10, 4)
    }
  )

  // probe text/p327: Middle at 0,-100 and 0,-200 puts HHH's baseline 5 below,
  // ggg's 2.234: the ink's middle on the point, its advance centred.
  it.each([
    ["HHH", p(-15.133015006821283, -105)],
    ["ggg", p(-11.654160982264667, -202.23396998635744)],
  ] as const)(
    "centres a Middle %s on its ink (text/p327)",
    (value, insertion) => {
      const at = p(0, value === "HHH" ? -100 : -200)
      const text = textOf(at, value, { height: 10, justify: "middle" })
      expect(textInsertionPoint(text)).toBeCloseToPoint(insertion, 6)
    }
  )

  it("turns its insertion point with the text", () => {
    const text = textOf(p(10, 10), "Agh", {
      height: 10,
      justify: "tl",
      rotation: deg(90),
    })
    expect(textInsertionPoint(text)).toBeCloseToPoint(p(20, 10), 9)
  })

  it("measures every printable ASCII and Spanish character from the font", () => {
    const average = measureTextWidth("\u4e00", 1)
    for (const char of " !~0AzáéíóúñÑ¿¡°±Ø") {
      expect(measureTextWidth(char, 1)).not.toBe(average)
    }
  })

  it("retypes its height, rotation and position", () => {
    expect(applyEntityProperty(note(), "textHeight", 8)).toMatchObject({
      height: 8,
      id: "T1",
    })
    expect(applyEntityProperty(note(), "rotation", 90)).toMatchObject({
      rotation: Math.PI / 2,
    })
    expect(applyEntityProperty(note(), "positionX", -5)).toMatchObject({
      position: { x: -5, y: 20 },
    })
    expect(applyEntityProperty(note(), "textHeight", 0)).toBeNull()
    expect(applyEntityProperty(note(), "radius", 3)).toBeNull()
  })
})

describe("dimension", () => {
  /** 100 units apart, measured horizontally, dimension line 40 above. */
  const dim = () =>
    createDimension("linear", p(0, 0), p(100, 0), p(50, 40), { id: "D1" })

  const asDimension = (entity: Entity) => {
    if (entity.type !== "dimension") throw new Error("not a dimension")
    return entity
  }

  it("derives the measurement from its definition points", () => {
    expect(dimensionMeasurement(dim())).toBeCloseTo(100)
    expect(dimensionText(dim())).toBe("100.00")
  })

  it("projects a linear measurement onto its own direction", () => {
    // Two points 100 apart in X and 40 in Y, measured horizontally.
    const diagonal = createDimension("linear", p(0, 0), p(100, 40), p(50, 90))
    expect(dimensionMeasurement(diagonal)).toBeCloseTo(100)
    expect(dimensionAxisAngle(diagonal)).toBeCloseTo(0)
  })

  it("takes an aligned direction from the origins themselves", () => {
    const aligned = createDimension("aligned", p(0, 0), p(60, 80), p(-40, 60))
    expect(dimensionMeasurement(aligned)).toBeCloseTo(100)
    expect(dimensionAxisAngle(aligned)).toBeCloseTo(Math.atan2(80, 60))
  })

  it("substitutes the measurement into a text override", () => {
    const overridden = createDimension("linear", p(0, 0), p(50, 0), p(25, 20), {
      text: "<> max",
    })
    expect(dimensionText(overridden)).toBe("50.00 max")
  })

  it("moves rigidly and keeps its id", () => {
    const moved = asDimension(translateEntity(dim(), p(10, -5)))
    expect(moved.id).toBe("D1")
    expect(moved.first).toBeCloseToPoint(p(10, -5))
    expect(moved.linePoint).toBeCloseToPoint(p(60, 35))
  })

  it("turns its measurement direction with a rotation", () => {
    const rotated = asDimension(rotateEntity(dim(), ORIGIN, deg(90)))
    expect(rotated.rotation).toBeCloseTo(deg(90))
    expect(dimensionMeasurement(rotated)).toBeCloseTo(100)
  })

  it("scales the definition points, leaving the style to size the text", () => {
    const scaled = asDimension(scaleEntity(dim(), ORIGIN, 2))
    expect(dimensionMeasurement(scaled)).toBeCloseTo(200)
  })

  it("reflects its direction when mirrored", () => {
    const mirrored = asDimension(
      mirrorEntity(
        createDimension("linear", p(0, 0), p(100, 0), p(50, 40), {
          rotation: Math.PI / 4,
        }),
        p(0, 0),
        p(0, 1) // the Y axis: a 45° direction reflects to 135°
      )
    )
    expect(mirrored.rotation).toBeCloseTo((3 * Math.PI) / 4)
  })

  // probes transforms/p273, p274: the line follows its own point, DXF 10.
  it("restates the measurement when a stretch frame catches one origin", () => {
    const stretched = asDimension(
      stretchEntity(dim(), p(40, 0), (point) => point.x > 50 && point.y < 20)
    )
    expect(dimensionMeasurement(stretched)).toBeCloseTo(140)
    // Only one origin moved, so the dimension line stays where it was placed.
    expect(stretched.linePoint).toBeCloseToPoint(p(50, 40))
    // Its own point on the line, at the second extension line, caught too:
    // the line follows.
    const raised = asDimension(
      stretchEntity(dim(), p(40, 10), (point) => point.x > 50)
    )
    expect(raised.second).toBeCloseToPoint(p(140, 10))
    expect(raised.linePoint).toBeCloseToPoint(p(90, 50))
  })

  it("slides whole when the frame catches both origins", () => {
    const stretched = asDimension(stretchEntity(dim(), p(0, 20), () => true))
    expect(dimensionMeasurement(stretched)).toBeCloseTo(100)
    expect(stretched.linePoint).toBeCloseToPoint(p(50, 60))
  })

  it("is picked by its line work, not its text", () => {
    // On the dimension line, halfway along it.
    expect(closestOnEntity(dim(), p(50, 40)).distance).toBeCloseTo(0)
    // On an extension line.
    expect(closestOnEntity(dim(), p(0, 20)).distance).toBeCloseTo(0)
    // Well clear of everything.
    expect(closestOnEntity(dim(), p(50, 200)).distance).toBeGreaterThan(100)
  })

  it("bounds everything it draws", () => {
    const bounds = entityBounds(dim())
    expect(bounds.min.x).toBeCloseTo(0)
    expect(bounds.max.x).toBeCloseTo(100)
    expect(bounds.min.y).toBeCloseTo(0)
    // The extension lines run past the dimension line.
    expect(bounds.max.y).toBeGreaterThan(40)
  })

  it("crosses a selection box that touches its line work", () => {
    expect(entityCrossesRect(dim(), p(40, 30), p(60, 50))).toBe(true)
    expect(entityCrossesRect(dim(), p(200, 200), p(300, 300))).toBe(false)
  })

  it("retypes a linear direction but never an aligned one", () => {
    expect(applyEntityProperty(dim(), "dimensionRotation", 90)).toMatchObject({
      rotation: Math.PI / 2,
      id: "D1",
    })
    const aligned = createDimension("aligned", p(0, 0), p(60, 80), p(-40, 60))
    expect(applyEntityProperty(aligned, "dimensionRotation", 90)).toBeNull()
    expect(applyEntityProperty(dim(), "startX", 10)).toBeNull()
  })

  it("carries its ByObject overrides onto a copy", () => {
    const red = assignEntityColor(dim(), "#ff0000")
    const copied = copyEntity(red, p(10, 10))
    expect(copied.color).toBe("#ff0000")
    expect(copied.id).not.toBe("D1")
  })
})

/**
 * The domain's pure functions are the shared vocabulary of every tool: MOVE,
 * COPY, ROTATE, SCALE, MIRROR, ARRAY, STRETCH and the grips all delegate here.
 * The tests below are mostly *algebraic*: a transform composed with its inverse
 * must be the identity, and each transform must preserve the invariants the
 * rest of the system assumes (stable ids for in-place edits, fresh ids for
 * copies, CCW arcs, carried ByObject overrides).
 */

const ORIGIN = p(0, 0)

function expectSameShape(actual: Entity, expected: Entity, precision = 6) {
  expect(actual.type).toBe(expected.type)
  // Optional, so a transform that rebuilds an object can drop them silently.
  expect(entityElevation(actual)).toBeCloseTo(
    entityElevation(expected),
    precision
  )
  expect(entityThickness(actual)).toBeCloseTo(
    entityThickness(expected),
    precision
  )
  const normal = entityNormal(actual)
  const expectedNormal = entityNormal(expected)
  expect(normal.x).toBeCloseTo(expectedNormal.x, precision)
  expect(normal.y).toBeCloseTo(expectedNormal.y, precision)
  expect(normal.z).toBeCloseTo(expectedNormal.z, precision)
  if (actual.type === "line" && expected.type === "line") {
    expect(lineEndZ(actual)).toBeCloseTo(lineEndZ(expected), precision)
    expect(actual.start).toBeCloseToPoint(expected.start, precision)
    expect(actual.end).toBeCloseToPoint(expected.end, precision)
  } else if (actual.type === "circle" && expected.type === "circle") {
    expect(actual.center).toBeCloseToPoint(expected.center, precision)
    expect(actual.radius).toBeCloseTo(expected.radius, precision)
  } else if (actual.type === "arc" && expected.type === "arc") {
    expect(actual.center).toBeCloseToPoint(expected.center, precision)
    expect(actual.radius).toBeCloseTo(expected.radius, precision)
    expect(actual.startAngle).toBeCloseToAngle(expected.startAngle, precision)
    expect(actual.endAngle).toBeCloseToAngle(expected.endAngle, precision)
  } else if (actual.type === "ellipse" && expected.type === "ellipse") {
    expect(actual.center).toBeCloseToPoint(expected.center, precision)
    expect(actual.majorAxis).toBeCloseToPoint(expected.majorAxis, precision)
    expect(actual.ratio).toBeCloseTo(expected.ratio, precision)
    // Both parameters are optional together, so a transform can silently turn
    // an elliptical arc back into a whole ellipse.
    expect(actual.startParam !== undefined).toBe(
      expected.startParam !== undefined
    )
    if (actual.startParam !== undefined && expected.startParam !== undefined) {
      expect(actual.startParam).toBeCloseToAngle(expected.startParam, precision)
      expect(actual.endParam!).toBeCloseToAngle(expected.endParam!, precision)
    }
  } else if (actual.type === "spline" && expected.type === "spline") {
    expect(actual.points).toBeCloseToPoints(expected.points, precision)
    expect(actual.method).toBe(expected.method)
    expect(actual.degree).toBe(expected.degree)
    expect(actual.knots).toBe(expected.knots)
    expect(actual.closed).toBe(expected.closed)
    // Optional, so a transform can drop one without TypeScript noticing; its
    // length is part of the curve (the derivative itself, spline/p302).
    for (const key of ["startTangent", "endTangent"] as const) {
      const a = actual[key]
      const e = expected[key]
      expect(a !== undefined).toBe(e !== undefined)
      if (a && e) expect(a).toBeCloseToPoint(e, precision)
    }
  } else if (actual.type === "polyline" && expected.type === "polyline") {
    expect(actual.vertices).toBeCloseToPoints(expected.vertices, precision)
    expect(actual.closed).toBe(expected.closed)
    expect(actual.bulges ?? []).toEqual(expected.bulges ?? [])
    expect(actual.widths !== undefined).toBe(expected.widths !== undefined)
    const widths = (actual.widths ?? []).flat()
    const expectedWidths = (expected.widths ?? []).flat()
    expect(widths.length).toBe(expectedWidths.length)
    widths.forEach((w, i) =>
      expect(w).toBeCloseTo(expectedWidths[i], precision)
    )
  } else if (actual.type === "text" && expected.type === "text") {
    expect(actual.position).toBeCloseToPoint(expected.position, precision)
    expect(actual.height).toBeCloseTo(expected.height, precision)
    expect(actual.rotation).toBeCloseToAngle(expected.rotation, precision)
    expect(actual.value).toBe(expected.value)
    expect(actual.justify).toBe(expected.justify)
  } else if (actual.type === "attdef" && expected.type === "attdef") {
    expect(actual.position).toBeCloseToPoint(expected.position, precision)
    expect(actual.height).toBeCloseTo(expected.height, precision)
    expect(actual.rotation).toBeCloseToAngle(expected.rotation, precision)
    expect(actual.justify).toBe(expected.justify)
    expect(actual.tag).toBe(expected.tag)
    expect(actual.modes).toEqual(expected.modes)
  } else if (actual.type === "mtext" && expected.type === "mtext") {
    expect(actual.position).toBeCloseToPoint(expected.position, precision)
    expect(actual.height).toBeCloseTo(expected.height, precision)
    expect(actual.width).toBeCloseTo(expected.width, precision)
    expect(actual.rotation).toBeCloseToAngle(expected.rotation, precision)
    expect(actual.contents).toBe(expected.contents)
    expect(actual.attachment).toBe(expected.attachment)
    expect(actual.lineSpacingStyle).toBe(expected.lineSpacingStyle)
    expect(actual.lineSpacingFactor).toBe(expected.lineSpacingFactor)
  } else if (actual.type === "dimension" && expected.type === "dimension") {
    expect(actual.first).toBeCloseToPoint(expected.first, precision)
    expect(actual.second).toBeCloseToPoint(expected.second, precision)
    expect(actual.linePoint).toBeCloseToPoint(expected.linePoint, precision)
    // The angular vertex is optional, which is exactly why a transform can drop
    // it without TypeScript noticing.
    expect(actual.vertex !== undefined).toBe(expected.vertex !== undefined)
    if (actual.vertex && expected.vertex) {
      expect(actual.vertex).toBeCloseToPoint(expected.vertex, precision)
    }
    expect(actual.kind).toBe(expected.kind)
  } else if (actual.type === "hatch" && expected.type === "hatch") {
    expect(actual.loops.length).toBe(expected.loops.length)
    actual.loops.forEach((loop, i) => {
      expect(loop.vertices).toBeCloseToPoints(
        expected.loops[i].vertices,
        precision
      )
      expect(loop.bulges ?? []).toEqual(expected.loops[i].bulges ?? [])
    })
    expect(actual.patternId).toBe(expected.patternId)
    expect(actual.patternScale).toBeCloseTo(expected.patternScale, precision)
    expect(actual.patternAngle).toBeCloseToAngle(
      expected.patternAngle,
      precision
    )
  } else if (actual.type === "insert" && expected.type === "insert") {
    expect(actual.blockId).toBe(expected.blockId)
    expect(actual.position).toBeCloseToPoint(expected.position, precision)
    // A negative factor is a reflection MIRROR toggles, so a lost sign means a
    // reference that silently came back the wrong way round.
    expect(actual.scaleX).toBeCloseTo(expected.scaleX, precision)
    expect(actual.scaleY).toBeCloseTo(expected.scaleY, precision)
    expect(actual.rotation).toBeCloseToAngle(expected.rotation, precision)
    // Held in the block's frame, so no transform of the reference may touch them.
    expect(actual.attributes).toEqual(expected.attributes)
  }
}

/** Every point that defines the entity's placement, for length/extent checks. */
function characteristicPoints(entity: Entity): Vec2[] {
  switch (entity.type) {
    case "line":
      return [entity.start, entity.end]
    case "circle":
      return [entity.center]
    case "arc":
      return [entity.center, arcStartPoint(entity), arcEndPoint(entity)]
    case "ellipse":
      // Not the centre: an elliptical arc's extent is its swept curve, which
      // need not reach the middle of the ellipse it was cut from.
      return [ellipseStartPoint(entity), ellipseEndPoint(entity)]
    case "spline":
      // Not the points: a CV spline's vertices lie off the curve.
      return [splineStartPoint(entity), splineEndPoint(entity)]
    case "polyline":
      return [...entity.vertices]
    case "text":
    case "mtext":
    case "attdef":
      return [entity.position]
    case "dimension":
      // Not `linePoint`: only its *projection* onto the measured axis is drawn,
      // so the raw point can legitimately sit outside the bounds.
      return [entity.first, entity.second]
    case "hatch":
      return entity.loops.flatMap((loop) => [...loop.vertices])
    case "insert":
      return [entity.position]
  }
}

describe("point transforms", () => {
  it("rotates counter-clockwise about a pivot", () => {
    expect(rotatePoint(p(100, 0), ORIGIN, deg(90))).toBeCloseToPoint(p(0, 100))
    expect(rotatePoint(p(10, 10), p(10, 0), deg(180))).toBeCloseToPoint(
      p(10, -10)
    )
  })

  it("scales about a base point", () => {
    expect(scalePoint(p(10, 0), ORIGIN, 3)).toBeCloseToPoint(p(30, 0))
    expect(scalePoint(p(10, 10), p(10, 10), 99)).toBeCloseToPoint(p(10, 10))
  })

  it("reflects across an infinite line", () => {
    expect(mirrorPoint(p(5, 7), ORIGIN, p(1, 0))).toBeCloseToPoint(p(5, -7))
    expect(mirrorPoint(p(5, 7), ORIGIN, p(0, 1))).toBeCloseToPoint(p(-5, 7))
    // The diagonal y = x swaps the coordinates.
    expect(mirrorPoint(p(5, 7), ORIGIN, p(1, 1))).toBeCloseToPoint(p(7, 5))
  })

  it("leaves a point untouched when the mirror line is degenerate", () => {
    expect(mirrorPoint(p(5, 7), p(2, 2), p(2, 2))).toBeCloseToPoint(p(5, 7))
  })

  it("keeps distances under rotation and reflection", () => {
    fc.assert(
      fc.property(point, point, point, angle, (a, b, pivot, theta) => {
        expect(
          V.distance(rotatePoint(a, pivot, theta), rotatePoint(b, pivot, theta))
        ).toBeCloseTo(V.distance(a, b), 6)
      })
    )
  })
})

describe("in-place transforms", () => {
  it("preserve the entity id — an edit, never a replacement", () => {
    fc.assert(
      fc.property(entityArb, point, angle, (entity, delta, theta) => {
        expect(translateEntity(entity, delta).id).toBe(entity.id)
        expect(rotateEntity(entity, delta, theta).id).toBe(entity.id)
        expect(scaleEntity(entity, delta, 2).id).toBe(entity.id)
        expect(mirrorEntity(entity, ORIGIN, p(1, 0)).id).toBe(entity.id)
      })
    )
  })

  it("translate then translate back is the identity", () => {
    fc.assert(
      fc.property(entityArb, point, (entity, delta) => {
        const round = translateEntity(
          translateEntity(entity, delta),
          V.scale(delta, -1)
        )
        expectSameShape(round, entity)
      })
    )
  })

  it("rotate then rotate back is the identity", () => {
    fc.assert(
      fc.property(entityArb, point, angle, (entity, pivot, theta) => {
        const round = rotateEntity(
          rotateEntity(entity, pivot, theta),
          pivot,
          -theta
        )
        expectSameShape(round, entity, 5)
      })
    )
  })

  it("scale then scale by the reciprocal is the identity", () => {
    fc.assert(
      fc.property(entityArb, point, positiveLength, (entity, base, factor) => {
        const round = scaleEntity(
          scaleEntity(entity, base, factor),
          base,
          1 / factor
        )
        expectSameShape(round, entity, 4)
      })
    )
  })

  it("mirroring twice across the same line is the identity", () => {
    fc.assert(
      fc.property(entityArb, distinctPoints, (entity, [a, b]) => {
        const round = mirrorEntity(mirrorEntity(entity, a, b), a, b)
        expectSameShape(round, entity, 5)
      })
    )
  })

  // probes trim/p01 (y = x), p02 (y = −x), MIRRTEXT 0: 270→180→270,
  // 90→0→90, 0→90→0, 180→270→180 across both. AutoCAD's box is wider than
  // this engine's, so only the rotations are its; the second mirror must give
  // the position back.
  const DIAGONALS = { "y = x": p(10, 10), "y = −x": p(-10, 10) } as const
  it.each(
    (
      [
        ["p01", "y = x"],
        ["p02", "y = −x"],
      ] as const
    ).flatMap(([probe, line]) =>
      [270, 90, 0, 180].map((from) => [probe, line, from] as const)
    )
  )(
    "%s: mirrored about %s, a text at %s° reads as AutoCAD's",
    (_, line, from) => {
      const [a, b] = [p(0, 0), DIAGONALS[line]]
      const text = textOf(p(20, 40), "A270", { height: 5, rotation: deg(from) })
      const once = mirrorEntity(text, a, b)
      if (once.type !== "text") throw new Error("not a text")
      expect(once.rotation).toBeCloseToAngle(deg(90 - from), 9)
      const twice = mirrorEntity(once, a, b)
      if (twice.type !== "text") throw new Error("not a text")
      expect(twice.rotation).toBeCloseToAngle(text.rotation, 9)
      expect(twice.position).toBeCloseToPoint(text.position, 9)
    }
  )

  // fast-check's counterexample: a vertical text reflected a hair off the
  // vertical came back judged by an x of 0.
  it("mirrors a vertical text back across a line a hair off horizontal", () => {
    const text = textOf(p(0, 0), " ", { height: 0.01, rotation: deg(90) })
    const [a, b] = [p(0, 0), p(0.01, 5e-12)]
    expectSameShape(mirrorEntity(mirrorEntity(text, a, b), a, b), text, 5)
  })

  it("translation and rotation are isometries; scaling is a similarity", () => {
    fc.assert(
      fc.property(
        entityArb,
        point,
        angle,
        positiveLength,
        (entity, base, theta, factor) => {
          const original = characteristicPoints(entity)
          const spread = (points: Vec2[]) =>
            points.length < 2 ? 0 : V.distance(points[0], points[1])

          expect(
            spread(characteristicPoints(translateEntity(entity, base)))
          ).toBeCloseTo(spread(original), 5)
          expect(
            spread(characteristicPoints(rotateEntity(entity, base, theta)))
          ).toBeCloseTo(spread(original), 5)
          expect(
            spread(characteristicPoints(scaleEntity(entity, base, factor))) /
              factor
          ).toBeCloseTo(spread(original), 4)
        }
      )
    )
  })

  it("scales a circle's radius but not a rotation or reflection", () => {
    const circle = circleOf(p(10, 10), 25)
    expect(
      (scaleEntity(circle, ORIGIN, 4) as typeof circle).radius
    ).toBeCloseTo(100)
    expect(
      (rotateEntity(circle, ORIGIN, deg(37)) as typeof circle).radius
    ).toBeCloseTo(25)
    expect(
      (mirrorEntity(circle, ORIGIN, p(1, 0)) as typeof circle).radius
    ).toBeCloseTo(25)
  })
})

describe("Z", () => {
  const raised = (): LineEntity => ({
    ...lineOf(p(0, 0), p(10, 0), { id: "L1" }),
    elevation: 10,
    deltaZ: 5,
    thickness: 2,
  })

  it("translating with a Z and back is the identity", () => {
    fc.assert(
      fc.property(entityArb, point, zValue, (entity, delta, dz) => {
        const there = translateEntity(entity, { ...delta, z: dz })
        // The elevation is measured along the normal (a line's is its start's Z).
        const normal = entity.type === "line" ? null : entityNormal(entity)
        const along = normal
          ? normal.x * delta.x + normal.y * delta.y + normal.z * dz
          : dz
        expect(entityElevation(there)).toBeCloseTo(
          entityElevation(entity) + along,
          6
        )
        const back = translateEntity(there, { ...V.scale(delta, -1), z: -dz })
        expectSameShape(back, entity)
      })
    )
  })

  it("a 2D move stays in the object's plane", () => {
    const moved = translateEntity(raised(), p(3, 4)) as LineEntity
    expect(moved.elevation).toBe(10)
    expect(lineEndZ(moved)).toBe(15)
  })

  it("scales the plane, the rise and the thickness about the base's Z", () => {
    const scaled = scaleEntity(raised(), { x: 0, y: 0, z: 4 }, 2) as LineEntity
    expect(scaled.elevation).toBeCloseTo(16)
    expect(scaled.deltaZ).toBeCloseTo(10)
    expect(scaled.thickness).toBeCloseTo(4)
    expectSameShape(scaleEntityCopy(raised(), { x: 0, y: 0, z: 4 }, 2), scaled)
  })

  it("stretches a caught line end in Z, and moves a caught circle whole", () => {
    const up = { x: 0, y: 0, z: 5 }
    const line = stretchEntity(raised(), up, (q) => q.x > 5) as LineEntity
    expect(line.elevation).toBe(10)
    expect(lineEndZ(line)).toBe(20)
    const start = stretchEntity(raised(), up, (q) => q.x < 5) as LineEntity
    expect(start.elevation).toBe(15)
    expect(lineEndZ(start)).toBe(15)
    expect(start.deltaZ).toBeUndefined()

    const circle = stretchEntity(circleOf(p(0, 0), 5), up, () => true)
    expect(circle.elevation).toBe(5)
    // A polyline is planar: its vertices cannot rise one by one.
    const poly = polylineOf([p(0, 0), p(10, 0)])
    expect(stretchEntity(poly, up, (q) => q.x > 5).elevation).toBeUndefined()
  })

  it("stretching an object with every point caught moves it whole, Z included", () => {
    fc.assert(
      fc.property(entityArb, point, zValue, (entity, delta, dz) => {
        const displacement = { ...delta, z: dz }
        expectSameShape(
          stretchEntity(entity, displacement, () => true),
          translateEntity(entity, displacement)
        )
      })
    )
  })

  it("gives a piece of a line the Z the line has at each of its ends", () => {
    const sloping: LineEntity = {
      ...lineOf(p(0, 0), p(100, 0), { id: "L1" }),
      elevation: 10,
      deltaZ: 20,
      thickness: 2,
    }
    const piece = carryPiece(sloping, createLine(p(25, 0), p(150, 0)))
    expect(lineStartZ(piece)).toBeCloseTo(15)
    expect(lineEndZ(piece)).toBeCloseTo(40)
    expect(piece.thickness).toBe(2)

    fc.assert(
      fc.property(entityArb, (entity) => {
        fc.pre(entity.type === "line" && !V.equals(entity.start, entity.end))
        const line = entity as LineEntity
        expectSameShape(
          carryPiece(line, createLine(line.start, line.end, line.layerId)),
          line
        )
      })
    )
  })

  it("counts as coplanar only objects at one elevation with no line rising", () => {
    const flat = withElevation(lineOf(p(0, 0), p(10, 0)), 4)
    expect(coplanar(flat, withElevation(circleOf(p(0, 0), 5), 4))).toBe(true)
    expect(coplanar(flat, withElevation(lineOf(p(0, 0), p(0, 10)), 5))).toBe(
      false
    )
    expect(coplanar(flat, { ...flat, deltaZ: 3 })).toBe(false)
  })

  it("keeps a polyline's overrides and plane through a grip edit", () => {
    const poly: PolylineEntity = {
      ...polylineOf([p(0, 0), p(10, 0), p(10, 10)]),
      color: "#ff0000",
      elevation: 7,
      thickness: 2,
    }
    for (const edited of [
      insertPolylineVertex(poly, 0, p(5, 0)),
      removePolylineVertex(poly, 1)!,
      setPolylineBulge(poly, 0, 0.5),
    ]) {
      expect(edited.color).toBe("#ff0000")
      expect(edited.elevation).toBe(7)
      expect(edited.thickness).toBe(2)
    }
  })

  it("places a block's objects by the base's Z and the reference's", () => {
    const block = createBlockDefinition(
      "B",
      p(0, 0),
      [{ ...circleOf(p(0, 0), 1), elevation: 5 }],
      2
    )
    const insert = createInsert("B", p(100, 0), { scale: 2 })
    const [placed] = insertGeometry(withElevation(insert, 10), block)
    expect(placed.elevation).toBeCloseTo(16)
  })

  it("matches thickness between objects that have one", () => {
    const source = withThickness(circleOf(p(0, 0), 1), 3)
    expect(
      (matchEntityProperties(source, lineOf(p(0, 0), p(1, 0))) as LineEntity)
        .thickness
    ).toBe(3)
    const text = textOf(p(0, 0), "A")
    expect(matchEntityProperties(source, text)).not.toHaveProperty("thickness")
  })

  // The help's Property Settings (MATCHPROP, 2027): "Linetype … Available for
  // all objects except attributes, hatches, multiline text, points, and
  // viewports".
  it("gives no linetype to a hatch, a multiline text or an attribute definition", () => {
    const source = { ...lineOf(p(0, 0), p(1, 0)), linetype: "Dashed" }
    const kept = [
      { ...createHatch([loopOf(p(0, 0), p(1, 1))]), linetype: "Hidden" },
      createMText(p(0, 0), "A"),
      createAttributeDefinition(p(0, 0), "TAG"),
    ]
    for (const target of kept) {
      expect(matchEntityProperties(source, target).linetype).toBe(
        target.linetype
      )
    }
    expect(matchEntityProperties(source, textOf(p(0, 0), "A")).linetype).toBe(
      "Dashed"
    )
  })

  // Property Settings' special properties (help, 2027; on by default,
  // desktop properties/d07-6): Text, Dimension and Hatch, between objects of
  // that kind.
  // desktop text/d08: SRC, a TEXT in S2, MC at 20,30, height 7, rotation 15;
  // SRCM, an MTEXT BR, height 4, rotation 0, Standard.
  it("matches a text's style, height and rotation, and TEXT to TEXT its justification (desktop text/d08)", () => {
    const src = textOf(p(20, 30), "SRC", {
      styleId: "S2",
      justify: "mc",
      height: 7,
      rotation: deg(15),
    })
    const srcm = createMText(p(50, 10), "SRCM", {
      height: 4,
      attachment: "br",
    })

    // TEXT → MTEXT: the attachment is kept.
    expect(
      matchEntityProperties(src, createMText(p(50, 40), "DST", { height: 4 }))
    ).toMatchObject({
      styleId: "S2",
      height: 7,
      rotation: deg(15),
      attachment: "tl",
      position: { x: 50, y: 40 },
    })
    // MTEXT → TEXT: the justification is kept.
    expect(
      matchEntityProperties(
        srcm,
        textOf(p(20, 0), "DSTT", {
          styleId: "S2",
          justify: "mc",
          height: 7,
          rotation: deg(15),
        })
      )
    ).toMatchObject({
      styleId: "Standard",
      height: 4,
      rotation: 0,
      justify: "mc",
    })
    // TEXT → TEXT: a Left text at 70,20 turns MC about 70,20.
    expect(
      matchEntityProperties(src, textOf(p(70, 20), "TT", { height: 3 }))
    ).toMatchObject({
      styleId: "S2",
      height: 7,
      rotation: deg(15),
      justify: "mc",
      position: { x: 70, y: 20 },
    })
    expect(
      matchEntityProperties(src, createAttributeDefinition(p(0, 0), "T"))
    ).toMatchObject({ styleId: "Standard" })
  })

  it("matches the dimension style between dimensions", () => {
    const source = createDimension("linear", p(0, 0), p(10, 0), p(5, 5), {
      styleId: "Arch",
    })
    const target = createDimension("aligned", p(0, 0), p(0, 10), p(5, 5))
    expect(matchEntityProperties(source, target)).toMatchObject({
      styleId: "Arch",
      kind: "aligned",
    })
  })

  // Desktop hatch/d07: MATCHPROP copies an ANSI31 2/30 hatch's name, angle
  // and scale onto an ANGLE hatch; its pattern base (DXF 43/44) stays 0,0.
  it("matches a hatch's pattern, scale and angle, not its origin or boundary", () => {
    const source = createHatch([loopOf(p(0, 0), p(1, 1))], {
      patternId: "ANSI37",
      patternScale: 2,
      patternAngle: Math.PI / 4,
      origin: p(7, 7),
    })
    const target = createHatch([loopOf(p(10, 10), p(20, 20))], {
      patternId: "SOLID",
    })
    const matched = matchEntityProperties(source, target)
    expect(matched).toMatchObject({
      patternId: "ANSI37",
      patternScale: 2,
      patternAngle: Math.PI / 4,
      loops: target.loops,
    })
    expect((matched as typeof target).origin).toBeCloseToPoint(target.origin)
  })
})

describe("arc orientation", () => {
  it("keeps the counter-clockwise sweep when reflected", () => {
    // Reflection reverses orientation, so the angles must be mirrored *and*
    // swapped; otherwise every downstream sweep calculation inverts.
    fc.assert(
      fc.property(
        point,
        positiveLength,
        angle,
        angle,
        distinctPoints,
        (center, radius, start, end, [a, b]) => {
          const arc = arcOf(center, radius, start, end)
          const mirrored = mirrorEntity(arc, a, b)
          expect(mirrored.type).toBe("arc")
          if (mirrored.type !== "arc") return
          expect(arcSweepAngle(mirrored)).toBeCloseTo(arcSweepAngle(arc), 5)
          // The reflected arc starts where the original ended.
          expect(arcStartPoint(mirrored)).toBeCloseToPoint(
            mirrorPoint(arcEndPoint(arc), a, b),
            4
          )
        }
      )
    )
  })

  it("carries the sweep along when rotated", () => {
    const arc = arcOf(ORIGIN, 100, 0, deg(90))
    const rotated = rotateEntity(arc, ORIGIN, deg(45))
    expect(rotated.type).toBe("arc")
    if (rotated.type !== "arc") return
    expect(rotated.startAngle).toBeCloseToAngle(deg(45))
    expect(rotated.endAngle).toBeCloseToAngle(deg(135))
    expect(arcSweepAngle(rotated)).toBeCloseTo(deg(90))
  })

  it("treats a zero sweep as a full circle", () => {
    expect(arcSweepAngle(arcOf(ORIGIN, 10, 1, 1))).toBeCloseTo(2 * Math.PI)
    expect(arcLength(arcOf(ORIGIN, 10, 1, 1))).toBeCloseTo(2 * Math.PI * 10)
  })

  it("locates its endpoints and midpoint", () => {
    const arc = arcOf(ORIGIN, 100, 0, Math.PI)
    expect(arcStartPoint(arc)).toBeCloseToPoint(p(100, 0))
    expect(arcEndPoint(arc)).toBeCloseToPoint(p(-100, 0))
    expect(arcMidpoint(arc)).toBeCloseToPoint(p(0, 100))
    expect(arcLength(arc)).toBeCloseTo(Math.PI * 100)
  })
})

describe("ellipse", () => {
  it("stores the longer axis as the major one, whichever was given", () => {
    const given = ellipseOf(ORIGIN, p(40, 0), 2.5)
    expect(ellipseSemiMajor(given)).toBeCloseTo(100)
    expect(given.ratio).toBeCloseTo(0.4)
    // The axis swap turns the parameter frame with it.
    expect(given.majorAxis).toBeCloseToPoint(p(0, 100))
  })

  it("keeps a swept range pointing at the same two ends after that swap", () => {
    const swapped = ellipseOf(ORIGIN, p(40, 0), 2.5, {
      startParam: 0,
      endParam: deg(90),
    })
    // Parameter 0 named the end of the *given* axis, which is now the minor one.
    expect(ellipseStartPoint(swapped)).toBeCloseToPoint(p(40, 0), 5)
    expect(ellipseEndPoint(swapped)).toBeCloseToPoint(p(0, 100), 5)
  })

  it("is picked on the curve, not across its inside", () => {
    const ellipse = ellipseOf(ORIGIN, p(100, 0), 0.4)
    // An outline, unlike text and hatches: the middle belongs to nothing.
    expect(distanceToEntity(ellipse, ORIGIN)).toBeCloseTo(40)
    expect(distanceToEntity(ellipse, p(100, 0))).toBeCloseTo(0)
    expect(distanceToEntity(ellipse, p(0, 40))).toBeCloseTo(0)
  })

  it("finds the closest point on a curve that has no closed form", () => {
    const ellipse = ellipseOf(ORIGIN, p(100, 0), 0.5)
    // Off the minor axis of a flat ellipse the nearest point is *not* the one
    // the radial direction suggests — the naive answer is p(0, 50).
    const closest = closestOnEntity(ellipse, p(0, 30)).point
    expect(closest.y).toBeCloseTo(50, 5)
    expect(V.distance(closest, p(0, 30))).toBeCloseTo(20, 5)

    const oblique = closestOnEntity(ellipse, p(60, 60)).point
    // Whatever it is, it is on the ellipse and no sample beats it.
    expect((oblique.x / 100) ** 2 + (oblique.y / 50) ** 2).toBeCloseTo(1, 5)
  })

  it("bounds a rotated ellipse exactly, not by its axis ends", () => {
    const ellipse = ellipseOf(ORIGIN, p(100, 0), 0.5)
    const turned = rotateEntity(ellipse, ORIGIN, deg(45))
    // √((a·cos45)² + (b·sin45)²) = √(5000 + 1250) ≈ 79.06 in both directions.
    const bounds = entityBounds(turned)
    expect(bounds.max.x).toBeCloseTo(Math.hypot(100 * 0.7071, 50 * 0.7071), 2)
    expect(bounds.max.y).toBeCloseTo(bounds.max.x, 5)
  })

  it("bounds an elliptical arc by what it actually sweeps", () => {
    const quarter = ellipseOf(ORIGIN, p(100, 0), 0.5, {
      startParam: 0,
      endParam: Math.PI / 2,
    })
    const bounds = entityBounds(quarter)
    expect(bounds.min).toBeCloseToPoint(ORIGIN, 5)
    expect(bounds.max).toBeCloseToPoint(p(100, 50), 5)
  })

  it("keeps the counter-clockwise sweep when reflected", () => {
    const quarter = ellipseOf(ORIGIN, p(100, 0), 0.5, {
      startParam: 0,
      endParam: Math.PI / 2,
    })
    const mirrored = mirrorEntity(quarter, ORIGIN, p(1, 0))
    expect(mirrored.type).toBe("ellipse")
    if (mirrored.type !== "ellipse") return
    // The reflected arc starts where the original ended.
    expect(ellipseStartPoint(mirrored)).toBeCloseToPoint(p(0, -50), 5)
    expect(ellipseEndPoint(mirrored)).toBeCloseToPoint(p(100, 0), 5)
  })

  it("quadrants are the axis ends the sweep reaches", () => {
    const full = ellipseOf(ORIGIN, p(100, 0), 0.5)
    expect(ellipseQuadrantPoints(full)).toHaveLength(4)

    const half = ellipseOf(ORIGIN, p(100, 0), 0.5, {
      startParam: 0,
      endParam: Math.PI,
    })
    expect(ellipseQuadrantPoints(half)).toHaveLength(3)
  })

  // probe ellipse/p303: the quarter arc's Midpoint is halfway along its
  // length (60.5528 / 2), not at its middle parameter (35.3553, 17.6777).
  it("puts an elliptical arc's midpoint halfway along its length", () => {
    const quarter = ellipseOf(ORIGIN, p(50, 0), 0.5, {
      startParam: 0,
      endParam: Math.PI / 2,
    })
    expect(ellipseMidpoint(quarter)).toBeCloseToPoint(
      p(29.72359457451975, 20.102909774268873),
      9
    )
  })

  // probe ellipse/p328: AREA's Perimeter 242.2112 and the 10°→100° arc's
  // Length 56.0148, the lengths the table measures along.
  it("measures an ellipse along its length", () => {
    const whole = ellipseLengthTable(ellipseOf(ORIGIN, p(50, 0), 0.5))
    expect(whole.length).toBeCloseTo(242.2112, 4)
    expect(whole.paramAt(0)).toBe(0)
    expect(whole.paramAt(whole.length)).toBeCloseTo(2 * Math.PI, 12)
    // A quarter of the way round a whole ellipse is its minor axis's end.
    expect(whole.paramAt(whole.length / 4)).toBeCloseTo(Math.PI / 2, 9)
    const arc = ellipseLengthTable(
      ellipseOf(ORIGIN, p(50, 0), 0.5, {
        startParam: 0.33903719097228474,
        endParam: 1.6587324508186057,
      })
    )
    expect(arc.length).toBeCloseTo(56.0148, 4)
    expect(arc.paramAt(-1)).toBe(0.33903719097228474)
    expect(arc.paramAt(100)).toBe(1.6587324508186057)
  })

  // probes ellipse/p152, p153, p220, p224, p226, p235, p236: an arc whose end
  // comes round to its start is a closed ellipse; this app stores it whole
  // (AutoCAD keeps its start, ELLIPSE-D21).
  it.each([
    [0.8570719478501309, 0.8570719478501309],
    [0.8570719478501309, 0.85707194785013],
    [0.8570719478501309, 0.8570719478501309 + 2 * Math.PI],
    [-1, -1 - 2 * Math.PI + 1e-12],
  ])("stores a whole turn from %s to %s as a whole ellipse", (start, end) => {
    const turn = createEllipse(ORIGIN, p(50, 0), 0.5, {
      startParam: start,
      endParam: end,
    })
    expect(turn).not.toHaveProperty("startParam")
    expect(turn).not.toHaveProperty("endParam")
  })

  // probes ellipse/p134, p148, p154, p179, p180: the start in [0, 2π), the
  // end after it, whatever the angles typed.
  it.each([
    [-0.8571, 1.8518, 5.4261, 8.135],
    [0.8571, -1.2898, 0.8571, 4.9934],
    [0.8571, -2.2845, 0.8571, 3.9987],
    [-0.7854, 3.1416, 5.4978, 9.4248],
    [-Math.PI / 2, Math.PI, (3 * Math.PI) / 2, 3 * Math.PI],
  ])("stores the parameters %s → %s as %s → %s", (start, end, stored, then) => {
    const arc = createEllipse(ORIGIN, p(50, 0), 0.5, {
      startParam: start,
      endParam: end,
    })
    expect(arc.startParam).toBeCloseTo(stored, 3)
    expect(arc.endParam).toBeCloseTo(then, 3)
  })

  it("keeps parameters already in AutoCAD's form to the bit", () => {
    const arc = createEllipse(ORIGIN, p(50, 0), 0.5, {
      startParam: 5.4261,
      endParam: 8.135,
    })
    expect(arc.startParam).toBe(5.4261)
    expect(arc.endParam).toBe(8.135)
  })

  it("normalises the range the axis swap turns", () => {
    const swapped = createEllipse(ORIGIN, p(20, 0), 2, {
      startParam: 0,
      endParam: Math.PI / 2,
    })
    expect(swapped.startParam).toBeCloseTo((3 * Math.PI) / 2, 12)
    expect(swapped.endParam).toBeCloseTo(2 * Math.PI, 12)
  })

  // probe ellipse/p168: with both axes 25 long the first stays the major
  // one, MajorAxis −23.2033, −9.3062, though the ratio computed is a hair
  // above 1.
  it("keeps the first axis major when the two tie", () => {
    const first = p(-23.20327, -9.30622)
    const tie = createEllipse(ORIGIN, first, 1 + 2 ** -52)
    expect(tie.majorAxis).toBeCloseToPoint(first, 9)
    expect(tie.ratio).toBe(1)
  })

  it("retypes one radius while holding the other", () => {
    const ellipse = ellipseOf(ORIGIN, p(100, 0), 0.5, { id: "E1" })
    const wider = applyEntityProperty(ellipse, "majorRadius", 200)
    expect(wider).toMatchObject({ id: "E1" })
    expect(ellipseSemiMajor(wider as typeof ellipse)).toBeCloseTo(200)
    expect(ellipseSemiMinor(wider as typeof ellipse)).toBeCloseTo(50)

    // Growing the minor axis past the major one swaps their roles.
    const taller = applyEntityProperty(ellipse, "minorRadius", 300)
    expect(ellipseSemiMajor(taller as typeof ellipse)).toBeCloseTo(300)
    expect(applyEntityProperty(ellipse, "majorRadius", 0)).toBeNull()
  })
})

describe("copy transforms", () => {
  const cases = [
    {
      name: "copyEntity",
      copy: (entity: Entity) => copyEntity(entity, p(10, 20)),
      inPlace: (entity: Entity) => translateEntity(entity, p(10, 20)),
    },
    {
      name: "rotateEntityCopy",
      copy: (entity: Entity) => rotateEntityCopy(entity, p(5, 5), deg(30)),
      inPlace: (entity: Entity) => rotateEntity(entity, p(5, 5), deg(30)),
    },
    {
      name: "scaleEntityCopy",
      copy: (entity: Entity) => scaleEntityCopy(entity, p(5, 5), 2.5),
      inPlace: (entity: Entity) => scaleEntity(entity, p(5, 5), 2.5),
    },
    {
      name: "mirrorEntityCopy",
      copy: (entity: Entity) => mirrorEntityCopy(entity, ORIGIN, p(1, 1)),
      inPlace: (entity: Entity) => mirrorEntity(entity, ORIGIN, p(1, 1)),
    },
  ]

  for (const { name, copy, inPlace } of cases) {
    describe(name, () => {
      it("produces the same shape as its in-place twin", () => {
        // Guards against a copy/paste slip between these four near-identical
        // functions, which is exactly how a wrong transform sneaks in.
        fc.assert(
          fc.property(entityArb, (entity) => {
            expectSameShape(copy(entity), inPlace(entity), 5)
          })
        )
      })

      it("issues a fresh id and keeps the layer", () => {
        fc.assert(
          fc.property(entityArb, (entity) => {
            const source = assignEntityLayer(entity, "walls")
            const result = copy(source)
            expect(result.id).not.toBe(source.id)
            expect(result.layerId).toBe("walls")
          })
        )
      })

      it("carries the ByObject overrides onto the copy", () => {
        fc.assert(
          fc.property(entityArb, (entity) => {
            const source = assignEntityLineweight(
              assignEntityLinetype(
                assignEntityColor(entity, "#ff0000"),
                "Dashed"
              ),
              1.4
            )
            const result = copy(source)
            expect(result.color).toBe("#ff0000")
            expect(result.linetype).toBe("Dashed")
            expect(result.lineweight).toBe(1.4)
          })
        )
      })

      it("leaves an entity without overrides inheriting ByLayer", () => {
        fc.assert(
          fc.property(entityArb, (entity) => {
            const result = copy(entity)
            expect(result.color).toBeUndefined()
            expect(result.linetype).toBeUndefined()
            expect(result.lineweight).toBeUndefined()
          })
        )
      })
    })
  }
})

describe("ByObject overrides", () => {
  it("apply to every entity type and are individually clearable", () => {
    fc.assert(
      fc.property(entityArb, (entity) => {
        expect(assignEntityColor(entity, "#123456").color).toBe("#123456")
        expect(assignEntityLinetype(entity, "Hidden").linetype).toBe("Hidden")
        expect(assignEntityLineweight(entity, 0.5).lineweight).toBe(0.5)
        expect(assignEntityLayer(entity, "roof").layerId).toBe("roof")

        const overridden = assignEntityLinetype(entity, "Hidden")
        expect(
          assignEntityLinetype(overridden, undefined).linetype
        ).toBeUndefined()
      })
    )
  })

  it("preserves the id, so an override is an edit not a replacement", () => {
    const line = lineOf(ORIGIN, p(10, 0), { id: "L1" })
    expect(assignEntityColor(line, "#fff").id).toBe("L1")
    expect(assignEntityLayer(line, "other").id).toBe("L1")
  })
})

describe("stretchEntity", () => {
  const insideRightHalf = (q: Vec2) => q.x > 50

  it("moves only the framed endpoint of a line", () => {
    const line = lineOf(ORIGIN, p(100, 0), { id: "L1" })
    const result = stretchEntity(line, p(0, 25), insideRightHalf)
    expect(result.type).toBe("line")
    if (result.type !== "line") return
    expect(result.start).toBeCloseToPoint(ORIGIN)
    expect(result.end).toBeCloseToPoint(p(100, 25))
    expect(result.id).toBe("L1")
  })

  it("moves a circle rigidly, and only when its centre is framed", () => {
    // AutoCAD never deforms a circle: the centre decides, all or nothing.
    const inside = circleOf(p(80, 0), 40)
    const outside = circleOf(p(10, 0), 40)
    const moved = stretchEntity(inside, p(0, 10), insideRightHalf)
    expect(moved.type).toBe("circle")
    if (moved.type !== "circle") return
    expect(moved.center).toBeCloseToPoint(p(80, 10))
    expect(moved.radius).toBe(40)
    expect(stretchEntity(outside, p(0, 10), insideRightHalf)).toBe(outside)
  })

  // probes transforms/p271, p281: an arc segment with one end moved keeps
  // its chord height, one with both its bulge.
  it("bends a polyline, an arc segment's chord height kept", () => {
    const poly = polylineOf([ORIGIN, p(100, 0), p(200, 0)], {
      bulges: [0.5, 0.5],
      id: "P1",
    })
    const result = stretchEntity(poly, p(0, 30), (q) => q.x >= 100)
    expect(result.type).toBe("polyline")
    if (result.type !== "polyline") return
    expect(result.vertices).toBeCloseToPoints([ORIGIN, p(100, 30), p(200, 30)])
    const height = (0.5 * 100) / 2
    expect(result.bulges?.[0]).toBeCloseTo(height / (Math.hypot(100, 30) / 2))
    expect(result.bulges?.[1]).toBe(0.5)
  })

  // probe transforms/p271: an arc's ends are its stretch points.
  it("refits an arc caught at one end, still counter-clockwise, and leaves one caught at its centre", () => {
    const quarter = arcOf(p(0, 0), 10, 0, Math.PI / 2, { id: "A1" })
    const bent = stretchEntity(quarter, p(0, 5), (q) => q.x > 5)
    if (bent.type !== "arc") throw new Error("not an arc")
    expect(bent.id).toBe("A1")
    expect(arcStartPoint(bent)).toBeCloseToPoint(p(10, 5), 9)
    expect(arcEndPoint(bent)).toBeCloseToPoint(p(0, 10), 9)
    const chord = Math.hypot(10, 5)
    const sagitta = bent.radius - Math.sqrt(bent.radius ** 2 - (chord / 2) ** 2)
    expect(sagitta).toBeCloseTo(10 - 10 * Math.cos(Math.PI / 4), 9)
    expect(stretchEntity(quarter, p(0, 5), (q) => q.x < 1 && q.y < 1)).toBe(
      quarter
    )
    // The ends meeting leave it as it was.
    expect(stretchEntity(quarter, p(-10, 10), (q) => q.x > 5)).toBe(quarter)
  })
})

describe("polyline structure", () => {
  it("drops an all-zero bulge array so straight polylines stay canonical", () => {
    expect(
      polylineOf([ORIGIN, p(10, 0)], { bulges: [0] }).bulges
    ).toBeUndefined()
    expect(polylineOf([ORIGIN, p(10, 0)]).bulges).toBeUndefined()
    expect(polylineOf([ORIGIN, p(10, 0)], { bulges: [0.5] }).bulges).toEqual([
      0.5,
    ])
  })

  it("copies its vertices defensively", () => {
    const source = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
    ]
    const poly = createPolyline(source)
    source[0].x = 999
    expect(poly.vertices[0]).toBeCloseToPoint(ORIGIN)
  })

  it("adds the closing segment to any closed polyline, two vertices too", () => {
    const open = polylineOf([ORIGIN, p(10, 0), p(10, 10)])
    const closed = polylineOf([ORIGIN, p(10, 0), p(10, 10)], { closed: true })
    const twoPointClosed = polylineOf([ORIGIN, p(10, 0)], { closed: true })

    expect(polylineSegments(open)).toHaveLength(2)
    expect(polylineSegments(closed)).toHaveLength(3)
    // probe pline/p04: Close after one segment closes there and back.
    expect(polylineSegments(twoPointClosed)).toEqual([
      [ORIGIN, p(10, 0)],
      [p(10, 0), ORIGIN],
    ])
  })

  it("resolves each segment as a line or an arc", () => {
    const poly = polylineOf([ORIGIN, p(100, 0), p(100, 100)], {
      bulges: [0, 1],
    })
    const [straight, curved] = polylineSegmentGeometries(poly)
    expect(straight.kind).toBe("line")
    expect(curved.kind).toBe("arc")
    if (curved.kind !== "arc") return
    expect(curved.center).toBeCloseToPoint(p(100, 50))
    expect(curved.radius).toBeCloseTo(50)
    expect(polylineBulge(poly, 1)).toBe(1)
    expect(polylineBulge(poly, 5)).toBe(0)
  })

  it("treats a zero-length bulged segment as straight rather than dividing by it", () => {
    const poly = polylineOf([ORIGIN, ORIGIN], { bulges: [0.5] })
    expect(polylineSegmentGeometries(poly)[0].kind).toBe("line")
  })
})

describe("polyline measurement", () => {
  it("measures a closed square", () => {
    const square = polylineOf([ORIGIN, p(100, 0), p(100, 100), p(0, 100)], {
      closed: true,
    })
    expect(polylineLength(square)).toBeCloseTo(400)
    expect(polylineArea(square)).toBeCloseTo(10_000)
  })

  it("includes a bulged segment's arc in both length and area", () => {
    // A 100×100 rectangle whose right edge is a semicircle of radius 50.
    const shape = polylineOf([p(50, 0), p(150, 0), p(150, 100), p(50, 100)], {
      closed: true,
      bulges: [0, 1, 0, 0],
    })
    expect(polylineLength(shape)).toBeCloseTo(100 + Math.PI * 50 + 100 + 100, 6)
    expect(polylineArea(shape)).toBeCloseTo(10_000 + (Math.PI * 50 * 50) / 2, 6)
  })

  it("measures a closed polyline of two vertices with its closing segment", () => {
    // probe pline/p04: `0,0 10,0 C` is closed, Length 20.
    expect(
      polylineLength(polylineOf([ORIGIN, p(10, 0)], { closed: true }))
    ).toBeCloseTo(20, 9)
    // probe pline/p227: `0,0 W 2 / A 10,10 / W 4 / CL`, a whole circle:
    // Length 62.8319, Area 314.1593, widths 2 and 4 (DXF 43 none).
    const circle = polylineOf([ORIGIN, p(10, 10)], {
      closed: true,
      bulges: [Math.tan(Math.PI / 8), Math.tan((3 * Math.PI) / 8)],
      widths: [
        [2, 2],
        [4, 4],
      ],
    })
    expect(polylineLength(circle)).toBeCloseTo(20 * Math.PI, 9)
    expect(polylineArea(circle)).toBeCloseTo(100 * Math.PI, 9)
    expect(polylineConstantWidth(circle)).toBeNull()
    // The 270° band, half-width 2, round the centre (0, 10).
    const { min, max } = entityBounds(circle)
    expect([min.x, min.y, max.x, max.y]).toEqual([
      expect.closeTo(-12, 2),
      expect.closeTo(-2, 2),
      expect.closeTo(12, 2),
      expect.closeTo(22, 2),
    ])
  })

  it("reports no area for a degenerate polyline", () => {
    expect(polylineArea(polylineOf([ORIGIN, p(10, 0)]))).toBe(0)
  })

  it("is independent of vertex winding", () => {
    const clockwise = polylineOf([ORIGIN, p(0, 100), p(100, 100), p(100, 0)], {
      closed: true,
    })
    expect(polylineArea(clockwise)).toBeCloseTo(10_000)
  })
})

describe("polyline vertex editing", () => {
  const poly = polylineOf([ORIGIN, p(100, 0), p(100, 100)], { id: "P1" })

  it("replaces a vertex in place", () => {
    const result = replacePolylineVertex(poly, 1, p(50, 50))
    expect(result.vertices).toBeCloseToPoints([ORIGIN, p(50, 50), p(100, 100)])
    expect(result.id).toBe("P1")
  })

  it("stretches vertices, an arc with one end moved bent through its old midpoint", () => {
    // desktop pline/d09: a quarter arc after a line, re-bulged 0.4142 → 0.1702.
    const chain = polylineOf([p(10, 60), p(30, 60), p(40, 70), p(55, 70)], {
      bulges: [0, Math.tan(Math.PI / 8), 0],
      id: "P1",
    })
    const moved = stretchPolylineVertices(
      chain,
      new Map([
        [0, p(10, 55.0257)],
        [1, p(30, 55.0257)],
      ])
    )
    expect(moved.bulges?.[1]).toBeCloseTo(0.1702, 4)
    expect(moved.id).toBe("P1")
    // Both ends moved: the arc keeps its bulge, round a closed one too.
    const circle = polylineOf([ORIGIN, p(10, 0)], {
      closed: true,
      bulges: [1, 1],
    })
    const shifted = stretchPolylineVertices(
      circle,
      new Map([
        [0, p(0, 5)],
        [1, p(10, 5)],
      ])
    )
    expect(shifted.bulges).toEqual([1, 1])
  })

  it("inserts a vertex, splitting the segment into two straight halves", () => {
    const curved = polylineOf([ORIGIN, p(100, 0), p(100, 100)], {
      bulges: [0.5, 0.25],
      id: "P1",
    })
    const result = insertPolylineVertex(curved, 0, p(50, 40))
    expect(result.vertices).toBeCloseToPoints([
      ORIGIN,
      p(50, 40),
      p(100, 0),
      p(100, 100),
    ])
    expect(result.bulges).toEqual([0, 0, 0.25])
    expect(result.id).toBe("P1")
  })

  it("removes a vertex and straightens the merged segment", () => {
    const curved = polylineOf([ORIGIN, p(100, 0), p(100, 100), p(0, 100)], {
      bulges: [0.5, 0.5, 0.5],
      id: "P1",
    })
    const result = removePolylineVertex(curved, 1)
    expect(result?.vertices).toBeCloseToPoints([ORIGIN, p(100, 100), p(0, 100)])
    expect(result?.bulges).toEqual([0, 0.5])
    expect(result?.id).toBe("P1")
  })

  it("refuses to remove a vertex that would destroy the polyline", () => {
    expect(removePolylineVertex(polylineOf([ORIGIN, p(10, 0)]), 0)).toBeNull()
    expect(
      removePolylineVertex(
        polylineOf([ORIGIN, p(10, 0), p(10, 10)], { closed: true }),
        0
      )
    ).toBeNull()
  })

  it("sets a segment's bulge, snapping a negligible one to straight", () => {
    expect(setPolylineBulge(poly, 1, 0.75).bulges).toEqual([0, 0.75])
    expect(setPolylineBulge(poly, 1, 1e-12).bulges).toBeUndefined()
    expect(setPolylineBulge(poly, 0, 0.5).id).toBe("P1")
  })
})

describe("bulge handling across transforms", () => {
  const curved = polylineOf([ORIGIN, p(100, 0), p(100, 100)], {
    bulges: [0, 0.5],
  })

  it("preserves bulges under translate, rotate and scale", () => {
    expect((translateEntity(curved, p(5, 5)) as PolylineEntity).bulges).toEqual(
      [0, 0.5]
    )
    expect(
      (rotateEntity(curved, ORIGIN, deg(30)) as PolylineEntity).bulges
    ).toEqual([0, 0.5])
    expect((scaleEntity(curved, ORIGIN, 3) as PolylineEntity).bulges).toEqual([
      0, 0.5,
    ])
    expect((copyEntity(curved, p(5, 5)) as PolylineEntity).bulges).toEqual([
      0, 0.5,
    ])
  })

  it("negates bulges under reflection, because mirroring reverses the turn", () => {
    expect(
      (mirrorEntity(curved, ORIGIN, p(0, 1)) as PolylineEntity).bulges
    ).toEqual([-0, -0.5])
    expect(
      (mirrorEntityCopy(curved, ORIGIN, p(0, 1)) as PolylineEntity).bulges
    ).toEqual([-0, -0.5])
  })
})

describe("entityBounds", () => {
  it("bounds a line by its endpoints", () => {
    const bounds = entityBounds(lineOf(p(10, 50), p(-30, 5)))
    expect(bounds.min).toBeCloseToPoint(p(-30, 5))
    expect(bounds.max).toBeCloseToPoint(p(10, 50))
  })

  it("bounds a circle by its extents", () => {
    const bounds = entityBounds(circleOf(p(10, 10), 5))
    expect(bounds.min).toBeCloseToPoint(p(5, 5))
    expect(bounds.max).toBeCloseToPoint(p(15, 15))
  })

  it("includes the cardinal points an arc actually sweeps through", () => {
    // Upper semicircle: the top of the circle is inside the sweep, the bottom
    // is not, so the box hugs the arc instead of the whole circle.
    const bounds = entityBounds(arcOf(ORIGIN, 100, 0, Math.PI))
    expect(bounds.min).toBeCloseToPoint(p(-100, 0))
    expect(bounds.max).toBeCloseToPoint(p(100, 100))
  })

  it("includes the part of a polyline arc that bulges past its vertices", () => {
    const poly = polylineOf([ORIGIN, p(100, 0)], { bulges: [1] })
    const bounds = entityBounds(poly)
    // A bulge of 1 is a semicircle dipping 50 below the chord.
    expect(bounds.min).toBeCloseToPoint(p(0, -50))
    expect(bounds.max).toBeCloseToPoint(p(100, 0))
  })

  it("contains every characteristic point of any entity", () => {
    fc.assert(
      fc.property(entityArb, (entity) => {
        const bounds = entityBounds(entity)
        // Nor a text's point: its extents are its ink, which a Bottom
        // justification's point lies below and a first glyph's bearing
        // beside (text/p301, p302).
        if (entity.type === "text" || entity.type === "attdef") return
        for (const q of characteristicPoints(entity)) {
          if (entity.type === "circle" || entity.type === "arc") continue
          expect(q.x).toBeGreaterThanOrEqual(bounds.min.x - 1e-9)
          expect(q.x).toBeLessThanOrEqual(bounds.max.x + 1e-9)
          expect(q.y).toBeGreaterThanOrEqual(bounds.min.y - 1e-9)
          expect(q.y).toBeLessThanOrEqual(bounds.max.y + 1e-9)
        }
      })
    )
  })
})

describe("rectangle selection rules", () => {
  const min = p(0, 0)
  const max = p(100, 100)

  it("window selection requires full enclosure", () => {
    expect(entityWithinRect(lineOf(p(10, 10), p(90, 90)), min, max)).toBe(true)
    expect(entityWithinRect(lineOf(p(10, 10), p(190, 90)), min, max)).toBe(
      false
    )
    expect(entityWithinRect(circleOf(p(50, 50), 40), min, max)).toBe(true)
    expect(entityWithinRect(circleOf(p(50, 50), 60), min, max)).toBe(false)
  })

  it("crossing selection also catches objects that merely touch the box", () => {
    expect(entityCrossesRect(lineOf(p(-50, 50), p(50, 50)), min, max)).toBe(
      true
    )
    expect(entityCrossesRect(lineOf(p(-50, 500), p(50, 500)), min, max)).toBe(
      false
    )
    // A circle enclosing the whole box crosses no edge — the classic
    // window/crossing subtlety, so both rules are needed to select it.
    expect(entityCrossesRect(circleOf(p(50, 50), 500), min, max)).toBe(false)
  })

  it("detects an arc that dips into the box", () => {
    expect(entityCrossesRect(arcOf(p(50, -50), 70, 0, Math.PI), min, max)).toBe(
      true
    )
    expect(entityCrossesRect(arcOf(p(50, -50), 70, Math.PI, 0), min, max)).toBe(
      false
    )
  })

  it("detects a polyline by vertex or by crossing segment", () => {
    expect(
      entityCrossesRect(polylineOf([p(50, 50), p(500, 500)]), min, max)
    ).toBe(true)
    expect(
      entityCrossesRect(polylineOf([p(-50, 50), p(500, 50)]), min, max)
    ).toBe(true)
    expect(
      entityCrossesRect(polylineOf([p(-50, 500), p(500, 500)]), min, max)
    ).toBe(false)
  })

  it("says any fully-enclosed entity also crosses nothing but is within", () => {
    fc.assert(
      fc.property(entityArb, (entity) => {
        const bounds = entityBounds(entity)
        const pad = 10
        const big = {
          min: p(bounds.min.x - pad, bounds.min.y - pad),
          max: p(bounds.max.x + pad, bounds.max.y + pad),
        }
        fc.pre(Number.isFinite(big.min.x) && Number.isFinite(big.max.y))
        expect(entityWithinRect(entity, big.min, big.max)).toBe(true)
      })
    )
  })
})

describe("hit testing", () => {
  it("measures the distance to each entity type", () => {
    expect(distanceToEntity(lineOf(ORIGIN, p(100, 0)), p(50, 7))).toBeCloseTo(7)
    expect(distanceToEntity(circleOf(ORIGIN, 100), p(130, 0))).toBeCloseTo(30)
    expect(
      distanceToEntity(arcOf(ORIGIN, 100, 0, Math.PI), p(0, 130))
    ).toBeCloseTo(30)
  })

  it("picks the nearest polyline segment, arcs included", () => {
    const poly = polylineOf([ORIGIN, p(100, 0), p(100, 100)], {
      bulges: [0, 1],
    })
    // Near the straight first segment.
    expect(closestOnEntity(poly, p(50, 5)).point).toBeCloseToPoint(p(50, 0))
    // The second segment bulges right to a semicircle of radius 50.
    expect(distanceToEntity(poly, p(160, 50))).toBeCloseTo(10)
  })

  it("never reports a negative distance", () => {
    fc.assert(
      fc.property(entityArb, point, (entity, q) => {
        expect(distanceToEntity(entity, q)).toBeGreaterThanOrEqual(0)
      })
    )
  })
})

describe("measurement helpers", () => {
  it("measures a line", () => {
    const line = lineOf(p(0, 0), p(3, 4))
    expect(lineLength(line)).toBeCloseTo(5)
    expect(lineMidpoint(line)).toBeCloseToPoint(p(1.5, 2))
  })

  it("reports a line's angle in [0, 360)", () => {
    expect(lineAngleDegrees(lineOf(ORIGIN, p(1, 0)))).toBeCloseTo(0)
    expect(lineAngleDegrees(lineOf(ORIGIN, p(0, 1)))).toBeCloseTo(90)
    expect(lineAngleDegrees(lineOf(ORIGIN, p(-1, 0)))).toBeCloseTo(180)
    // Pointing down is 270°, never −90°.
    expect(lineAngleDegrees(lineOf(ORIGIN, p(0, -1)))).toBeCloseTo(270)
  })

  it("stays inside [0, 360) for any direction", () => {
    fc.assert(
      fc.property(distinctPoints, ([a, b]) => {
        const degrees = lineAngleDegrees(lineOf(a, b))
        expect(degrees).toBeGreaterThanOrEqual(0)
        expect(degrees).toBeLessThan(360)
      })
    )
  })

  it("measures a circle", () => {
    const circle = circleOf(ORIGIN, 10)
    expect(circleCircumference(circle)).toBeCloseTo(2 * Math.PI * 10)
    expect(circleArea(circle)).toBeCloseTo(Math.PI * 100)
  })
})

describe("property editing", () => {
  it("moves a single endpoint coordinate", () => {
    const line = lineOf(p(0, 0), p(100, 0))

    expect(
      (applyEntityProperty(line, "endY", 40) as LineEntity).end
    ).toBeCloseToPoint(p(100, 40))
    expect(
      (applyEntityProperty(line, "startX", -20) as LineEntity).start
    ).toBeCloseToPoint(p(-20, 0))
  })

  it("refuses values that would degenerate the entity", () => {
    expect(applyEntityProperty(circleOf(ORIGIN, 10), "radius", -1)).toBeNull()
    expect(applyEntityProperty(circleOf(ORIGIN, 10), "radius", 0)).toBeNull()
  })

  // LINE keeps a zero-length line typed (line/p08); the palette lets one be.
  it("lets a line's end be retyped onto its start", () => {
    const line = lineOf(p(0, 0), p(100, 0))
    expect(
      (applyEntityProperty(line, "endX", 0) as LineEntity).end
    ).toBeCloseToPoint(p(0, 0))
  })

  it("preserves the id and every ByObject override", () => {
    const line = assignEntityLinetype(
      assignEntityColor(lineOf(p(0, 0), p(10, 0)), "#ff0000"),
      "Dashed"
    )

    const edited = applyEntityProperty(line, "endX", 20) as LineEntity

    expect(edited.id).toBe(line.id)
    expect(edited.color).toBe("#ff0000")
    expect(edited.linetype).toBe("Dashed")
    expect(edited.layerId).toBe(line.layerId)
  })

  it("halves a circle's diameter into its radius", () => {
    const circle = circleOf(p(5, 5), 10)

    const edited = applyEntityProperty(circle, "diameter", 50) as CircleEntity

    expect(edited.radius).toBeCloseTo(25)
    expect(edited.center).toBeCloseToPoint(p(5, 5))
  })

  // desktop circle/d10: Circumference and Area are not greyed; either sets
  // the radius.
  it("sets a circle's radius from its circumference or area", () => {
    const circle = circleOf(p(5, 5), 10)

    const around = applyEntityProperty(circle, "circumference", 100)
    expect((around as CircleEntity).radius).toBeCloseTo(50 / Math.PI, 12)
    const area = applyEntityProperty(circle, "area", 100) as CircleEntity
    expect(area.radius).toBeCloseTo(Math.sqrt(100 / Math.PI), 12)
    expect(area.center).toBeCloseToPoint(p(5, 5))
    expect(applyEntityProperty(circle, "circumference", 0)).toBeNull()
    expect(applyEntityProperty(circle, "area", -1)).toBeNull()
  })

  it("swings an arc's end angle when the total angle is retyped", () => {
    const arc = arcOf(ORIGIN, 10, deg(0), deg(90))

    const edited = applyEntityProperty(arc, "totalAngle", 180) as ArcEntity

    expect(edited.startAngle).toBeCloseToAngle(deg(0))
    expect(arcSweepAngle(edited)).toBeCloseToAngle(deg(180))
    expect(edited.radius).toBeCloseTo(10)
  })

  it("ignores properties that do not apply to the entity", () => {
    expect(applyEntityProperty(circleOf(ORIGIN, 10), "endX", 5)).toBeNull()
    expect(applyEntityProperty(lineOf(ORIGIN, p(1, 0)), "radius", 5)).toBeNull()
    // Polyline vertices are edited with grips, not the properties palette.
    expect(
      applyEntityProperty(polylineOf([ORIGIN, p(1, 0)]), "endX", 5)
    ).toBeNull()
  })
})

describe("entity defaults", () => {
  it("places new geometry on the base layer unless told otherwise", () => {
    expect(lineOf(ORIGIN, p(1, 1)).layerId).toBe(DEFAULT_LAYER_ID)
    expect(circleOf(ORIGIN, 1).layerId).toBe(DEFAULT_LAYER_ID)
    expect(arcOf(ORIGIN, 1, 0, 1).layerId).toBe(DEFAULT_LAYER_ID)
    expect(polylineOf([ORIGIN, p(1, 1)]).layerId).toBe(DEFAULT_LAYER_ID)
  })

  it("issues unique ids", () => {
    const ids = new Set(
      Array.from({ length: 200 }, () => lineOf(ORIGIN, p(1, 1)).id)
    )
    expect(ids.size).toBe(200)
  })

  it("normalises the angle range for a rotated arc without wrapping", () => {
    // Angles are stored raw; consumers normalise. Pinned so a future
    // "helpful" normalisation cannot silently break the CCW sweep contract.
    const arc = arcOf(ORIGIN, 10, deg(350), deg(10))
    expect(arcSweepAngle(arc)).toBeCloseTo(deg(20))
    expect(normalizeAngle(arc.startAngle)).toBeCloseTo(deg(350))
  })
})

describe("hatch", () => {
  const square = loopOf(p(0, 0), p(100, 100))

  it("takes a boundary only from objects that close on their own", () => {
    expect(hatchLoopFromEntity(circleOf(ORIGIN, 10))).not.toBeNull()
    expect(
      hatchLoopFromEntity(
        polylineOf([p(0, 0), p(1, 0), p(1, 1)], { closed: true })
      )
    ).not.toBeNull()
    expect(
      hatchLoopFromEntity(polylineOf([p(0, 0), p(1, 0), p(1, 1)]))
    ).toBeNull()
    // Two vertices cannot enclose an area without bulges, so they are refused.
    expect(
      hatchLoopFromEntity(polylineOf([p(0, 0), p(1, 0)], { closed: true }))
    ).toBeNull()
    // probe pline/p227: with them they are a whole circle.
    expect(
      hatchLoopFromEntity(
        polylineOf([p(0, 0), p(10, 10)], { closed: true, bulges: [0.5, 2] })
      )
    ).not.toBeNull()
    expect(hatchLoopFromEntity(lineOf(ORIGIN, p(1, 0)))).toBeNull()
    expect(hatchLoopFromEntity(arcOf(ORIGIN, 10, 0, 1))).toBeNull()
    expect(hatchLoopFromEntity(textOf(ORIGIN, "hi"))).toBeNull()
  })

  it("closes a loop even when it is only two vertices", () => {
    const loop = hatchLoopFromEntity(circleOf(ORIGIN, 10))!
    const segments = hatchLoopSegments(loop)
    expect(segments).toHaveLength(2)
    expect(segments.every((seg) => seg.kind === "arc")).toBe(true)
    expect(hatchLoopSegments({ vertices: [p(0, 0)] })).toHaveLength(0)
  })

  // HATCH-D64: a pattern hatch by its lines (desktop hatch/d06-2, d06-3,
  // probes p322, p327), a SOLID by its area (d06-5).
  it("picks a pattern by its lines and a SOLID as a filled area", () => {
    // ANSI31 at scale 10: 45° lines 31.75 apart, one through the origin.
    const pattern = createHatch([square], {
      patternId: "ANSI31",
      patternScale: 10,
    })
    expect(distanceToEntity(pattern, p(50, 50))).toBeCloseTo(0, 9)
    expect(distanceToEntity(pattern, p(30, 10))).toBeCloseTo(
      Math.SQRT1_2 * 20,
      9
    )
    // On the boundary off the lines: nothing there either (p327).
    expect(distanceToEntity(pattern, p(78, 0))).toBeGreaterThan(5)

    const solid = createHatch([square], { patternId: SOLID_HATCH_PATTERN_ID })
    expect(distanceToEntity(solid, p(30, 10))).toBe(0)
    expect(distanceToEntity(solid, p(120, 50))).toBeCloseTo(20)
    expect(pointInsideHatch(solid, p(50, 50))).toBe(true)
    expect(pointInsideHatch(solid, p(150, 50))).toBe(false)
  })

  it("treats a nested loop as a hole", () => {
    const hatch = createHatch([square, loopOf(p(40, 40), p(60, 60))])
    expect(pointInsideHatch(hatch, p(50, 50))).toBe(false)
    expect(pointInsideHatch(hatch, p(10, 10))).toBe(true)
  })

  it("bounds the area its arcs reach, not just its vertices", () => {
    const loop = hatchLoopFromEntity(circleOf(p(0, 0), 50))!
    const bounds = entityBounds(createHatch([loop]))
    expect(bounds.min.y).toBeCloseTo(-50, 1)
    expect(bounds.max.y).toBeCloseTo(50, 1)
    expect(entityBounds(createHatch([]))).toEqual({
      min: ORIGIN,
      max: ORIGIN,
    })
  })

  // HATCH-D64, probes hatch/p322, p326: a crossing between a pattern's lines
  // finds nothing; one wholly inside a SOLID takes it.
  it("is crossed by a box on its lines, or anywhere inside a SOLID", () => {
    const pattern = createHatch([square], {
      patternId: "ANSI31",
      patternScale: 10,
    })
    expect(entityCrossesRect(pattern, p(25, 5), p(35, 15))).toBe(false)
    expect(entityCrossesRect(pattern, p(45, 45), p(55, 55))).toBe(true)
    expect(entityCrossesRect(pattern, p(90, 40), p(150, 60))).toBe(true)
    const solid = createHatch([square], { patternId: SOLID_HATCH_PATTERN_ID })
    expect(entityCrossesRect(solid, p(25, 5), p(35, 15))).toBe(true)
    expect(entityCrossesRect(solid, p(-50, -50), p(-10, -10))).toBe(false)
  })

  it("retypes its pattern scale and angle, and refuses the rest", () => {
    const hatch = createHatch([square])
    const scaled = applyEntityProperty(hatch, "patternScale", 20)
    expect(scaled && scaled.type === "hatch" && scaled.patternScale).toBe(20)
    const turned = applyEntityProperty(hatch, "patternAngle", 90)
    expect(
      turned && turned.type === "hatch" && turned.patternAngle
    ).toBeCloseTo(Math.PI / 2)
    expect(applyEntityProperty(hatch, "patternScale", 0)).toBeNull()
    expect(applyEntityProperty(hatch, "radius", 5)).toBeNull()
    // Its Origin X and Y (desktop hatch/d05-1).
    const moved = applyEntityProperty(hatch, "originX", 5)
    const both = moved && applyEntityProperty(moved, "originY", 3)
    expect(both && both.type === "hatch" && both.origin).toEqual({ x: 5, y: 3 })
  })

  it("draws nothing for a pattern it does not ship", () => {
    const geometry = hatchGeometry(
      createHatch([square], { patternId: "NOSUCHPATTERN" })
    )
    expect(geometry.solid).toBe(false)
    expect(geometry.lines).toHaveLength(0)
    expect(geometry.rings).toHaveLength(1)
  })

  it("draws nothing at all without a boundary", () => {
    expect(hatchGeometry(createHatch([])).lines).toHaveLength(0)
    expect(
      hatchGeometry(createHatch([{ vertices: [p(0, 0), p(1, 0)] }])).rings
    ).toHaveLength(0)
  })

  it("scales its pattern along with the area", () => {
    const hatch = createHatch([square], { patternScale: 2 })
    const scaled = scaleEntity(hatch, ORIGIN, 3)
    expect(scaled.type === "hatch" && scaled.patternScale).toBe(6)
    const copy = scaleEntityCopy(hatch, ORIGIN, 3)
    expect(copy.type === "hatch" && copy.patternScale).toBe(6)
    expect(copy.id).not.toBe(hatch.id)
  })

  it("turns its pattern with the area", () => {
    const hatch = createHatch([square], { patternAngle: deg(10) })
    const turned = rotateEntity(hatch, ORIGIN, deg(20))
    expect(turned.type === "hatch" && turned.patternAngle).toBeCloseToAngle(
      deg(30)
    )
    const copy = rotateEntityCopy(hatch, ORIGIN, deg(20))
    expect(copy.type === "hatch" && copy.patternAngle).toBeCloseToAngle(deg(30))
  })

  it("stretches the vertices the frame catches", () => {
    const hatch = createHatch([square])
    const stretched = stretchEntity(hatch, p(10, 0), (pt) => pt.x > 50)
    expect(stretched.type === "hatch" && stretched.loops[0].vertices).toEqual([
      p(0, 0),
      p(110, 0),
      p(110, 100),
      p(0, 100),
    ])
  })

  it("carries its ByObject overrides onto a copy", () => {
    const hatch = assignEntityColor(createHatch([square]), "#ff0000")
    const copy = copyEntity(hatch, p(1, 1))
    expect(copy.color).toBe("#ff0000")
    expect(copy.id).not.toBe(hatch.id)
  })
})

// What a reference that reflects or stretches a hatch shows of it (probe
// blocks/p230): its pattern under a frame, which turns and reflects with it.
describe("a hatch's pattern frame", () => {
  const framed = {
    ...createHatch([{ vertices: [p(0, 0), p(40, 0), p(40, 30), p(0, 30)] }], {
      patternId: "ANSI31",
    }),
    patternFrame: [1, 0, 0, -1] as const,
  }
  const sorted = (lines: readonly (readonly [Vec2, Vec2])[]) =>
    lines
      .flat()
      .map((point) =>
        [point.x, point.y].map((n) => Math.round(n * 1e6) / 1e6 + 0)
      )
      .sort((a, b) => a[0] - b[0] || a[1] - b[1])

  it("reflects the pattern it lies over", () => {
    for (const [a, b] of hatchGeometry(framed).lines) {
      // ANSI31's 45° lines, reflected to 135°.
      expect((b.y - a.y) / (b.x - a.x)).toBeCloseTo(-1)
    }
  })

  it("turns and reflects with the hatch", () => {
    const turn = Math.PI / 3
    const turned = rotateEntity(framed, p(5, 5), turn)
    expect(sorted(hatchGeometry(turned as typeof framed).lines)).toEqual(
      sorted(
        hatchGeometry(framed).lines.map(
          ([a, b]) =>
            [
              rotatePoint(a, p(5, 5), turn),
              rotatePoint(b, p(5, 5), turn),
            ] as const
        )
      )
    )
    const reflected = mirrorEntity(framed, p(0, 0), p(1, 1), "patternReflected")
    expect(sorted(hatchGeometry(reflected as typeof framed).lines)).toEqual(
      sorted(
        hatchGeometry(framed).lines.map(
          ([a, b]) =>
            [
              mirrorPoint(a, p(0, 0), p(1, 1)),
              mirrorPoint(b, p(0, 0), p(1, 1)),
            ] as const
        )
      )
    )
  })

  it("draws nothing under a frame that flattens it", () => {
    const flat = { ...framed, patternFrame: [1, 0, 2, 0] as const }
    expect(hatchGeometry(flat).lines).toEqual([])
  })
})
