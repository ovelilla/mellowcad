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
  createBlockDefinition,
  createDimension,
  createHatch,
  createInsert,
  createLine,
  createPolyline,
  dimensionAxisAngle,
  dimensionMeasurement,
  dimensionText,
  distanceToEntity,
  ellipseEndPoint,
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
  textCorners,
  textWidth,
  translateEntity,
  withElevation,
  withThickness,
} from "./entities"
import { DEFAULT_LAYER_ID } from "./layers"
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

  it("stays readable when mirrored (AutoCAD's MIRRTEXT default)", () => {
    const mirrored = mirrorEntity(note(), p(0, 0), p(0, 1))
    expect(mirrored.type === "text" && mirrored.rotation).toBeCloseTo(0)
    expect(mirrored.type === "text" && mirrored.position).toBeCloseToPoint(
      p(-10, 20)
    )
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
    expect(bounds.min).toBeCloseToPoint(p(0, 0))
    expect(bounds.max).toBeCloseToPoint(p(textWidth(text), 10))
    expect(textCorners(text)).toHaveLength(4)
  })

  it("measures with Arial's advance widths, scaled by the capital height", () => {
    // Arial: W 1933, i 455 font units; capitals 1467 units tall.
    expect(measureTextWidth("W", 1467)).toBeCloseTo(1933)
    expect(measureTextWidth("i", 1467)).toBeCloseTo(455)
    expect(measureTextWidth("Wi", 2.5)).toBeCloseTo(((1933 + 455) / 1467) * 2.5)
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

  it("restates the measurement when a stretch frame catches one origin", () => {
    const stretched = asDimension(
      stretchEntity(dim(), p(40, 0), (point) => point.x > 50)
    )
    expect(dimensionMeasurement(stretched)).toBeCloseTo(140)
    // Only one origin moved, so the dimension line stays where it was placed.
    expect(stretched.linePoint).toBeCloseToPoint(p(50, 40))
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
    // Optional, so a transform can drop one without TypeScript noticing; only
    // the direction is meaningful.
    for (const key of ["startTangent", "endTangent"] as const) {
      const a = actual[key]
      const e = expected[key]
      expect(a !== undefined).toBe(e !== undefined)
      if (a && e) {
        expect(V.normalize(a)).toBeCloseToPoint(V.normalize(e), precision)
      }
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
    expect(actual.scale).toBeCloseTo(expected.scale, precision)
    expect(actual.rotation).toBeCloseToAngle(expected.rotation, precision)
    // Reflection is what MIRROR toggles, so a lost flag means a reference that
    // silently came back the wrong way round.
    expect(actual.mirrored ?? false).toBe(expected.mirrored ?? false)
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

  it("bends a polyline while preserving its arc bulges", () => {
    const poly = polylineOf([ORIGIN, p(100, 0), p(200, 0)], {
      bulges: [0, 0.5],
      id: "P1",
    })
    const result = stretchEntity(poly, p(0, 30), (q) => q.x >= 200)
    expect(result.type).toBe("polyline")
    if (result.type !== "polyline") return
    expect(result.vertices).toBeCloseToPoints([ORIGIN, p(100, 0), p(200, 30)])
    expect(result.bulges).toEqual([0, 0.5])
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

  it("picks as a filled area, not as an outline", () => {
    const hatch = createHatch([square])
    expect(distanceToEntity(hatch, p(50, 50))).toBe(0)
    expect(distanceToEntity(hatch, p(120, 50))).toBeCloseTo(20)
    expect(pointInsideHatch(hatch, p(50, 50))).toBe(true)
    expect(pointInsideHatch(hatch, p(150, 50))).toBe(false)
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

  it("is crossed by a box drawn wholly inside it", () => {
    const hatch = createHatch([square])
    expect(entityCrossesRect(hatch, p(40, 40), p(60, 60))).toBe(true)
    expect(entityCrossesRect(hatch, p(-50, -50), p(-10, -10))).toBe(false)
    expect(entityCrossesRect(hatch, p(90, 40), p(150, 60))).toBe(true)
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
