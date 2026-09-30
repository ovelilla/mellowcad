import fc from "fast-check"
import {
  createBlockDefinition,
  MTEXT_ATTACHMENTS,
  mtextContents,
  TEXT_JUSTIFICATIONS,
  type ArcEntity,
  type CircleEntity,
  type DimensionEntity,
  type EllipseEntity,
  type Entity,
  type HatchEntity,
  type InsertEntity,
  type LineEntity,
  type MTextEntity,
  type PolylineEntity,
  type TextEntity,
} from "../cad/domain/entities"
import { DEFAULT_HATCH_PATTERN_ID } from "../cad/domain/hatchPatterns"
import { DEFAULT_LAYER_ID } from "../cad/domain/layers"
import { DEFAULT_TEXT_STYLE_ID } from "../cad/domain/textStyles"
import { DEFAULT_DIM_STYLE_ID } from "../cad/domain/dimStyles"
import { LengthUnit } from "../cad/domain/units"
import type { Vec2 } from "../cad/geometry/Vec2"
import type { DrawingSnapshot } from "../cad/serialization/drawingFile"
import { snapshotOf } from "./builders"

/**
 * Generators for property-based tests.
 *
 * Coordinates are deliberately *well-conditioned*: bounded magnitude and two
 * decimals. Feeding a geometry kernel the full double range proves little —
 * every algebraic identity dies to catastrophic cancellation at 1e300 — while
 * hiding the real bugs (wrong branch, wrong sign, wrong winding) behind
 * floating-point noise. Robustness against extreme input is asserted
 * separately, as "does not throw / returns null", using {@link wildCoordinate}.
 */

/** Bounded, two-decimal coordinate: realistic drawing values, stable algebra. */
export const coordinate: fc.Arbitrary<number> = fc
  .integer({ min: -100_000, max: 100_000 })
  .map((n) => n / 100)

/** Any finite double, for "must not crash / must degrade gracefully" checks. */
export const wildCoordinate: fc.Arbitrary<number> = fc.double({
  noNaN: true,
  noDefaultInfinity: true,
})

export const point: fc.Arbitrary<Vec2> = fc
  .tuple(coordinate, coordinate)
  .map(([x, y]) => ({ x, y }))

export const wildPoint: fc.Arbitrary<Vec2> = fc
  .tuple(wildCoordinate, wildCoordinate)
  .map(([x, y]) => ({ x, y }))

/** Radians over a full turn, including the exact axis angles. */
export const angle: fc.Arbitrary<number> = fc.oneof(
  {
    weight: 3,
    arbitrary: fc.double({ min: 0, max: 2 * Math.PI, noNaN: true }),
  },
  {
    weight: 1,
    arbitrary: fc.constantFrom(
      0,
      Math.PI / 4,
      Math.PI / 2,
      Math.PI,
      (3 * Math.PI) / 2
    ),
  }
)

/** A length that never collapses to zero, so segments/radii stay meaningful. */
export const positiveLength: fc.Arbitrary<number> = fc
  .integer({ min: 1, max: 100_000 })
  .map((n) => n / 100)

/**
 * Two points guaranteed to be a real distance apart, built polar-style rather
 * than by filtering so generation never stalls near the degenerate case.
 */
export const distinctPoints: fc.Arbitrary<readonly [Vec2, Vec2]> = fc
  .tuple(point, angle, positiveLength)
  .map(([a, theta, length]) => [
    a,
    { x: a.x + Math.cos(theta) * length, y: a.y + Math.sin(theta) * length },
  ])

/** Three points that are not collinear, so a circumcircle always exists. */
export const nonCollinearPoints: fc.Arbitrary<readonly [Vec2, Vec2, Vec2]> = fc
  .tuple(point, positiveLength, angle, angle, angle)
  .map(([center, radius, a, b, c]) => {
    // Three distinct angles on a common circle can never be collinear.
    const spread = [
      a,
      a + Math.PI / 3 + (b % 1),
      a + (2 * Math.PI) / 3 + (c % 1),
    ]
    return spread.map((theta) => ({
      x: center.x + Math.cos(theta) * radius,
      y: center.y + Math.sin(theta) * radius,
    })) as unknown as readonly [Vec2, Vec2, Vec2]
  })

/** Bulge values spanning gentle curves through to the semicircle limit. */
export const bulge: fc.Arbitrary<number> = fc
  .integer({ min: -300, max: 300 })
  .map((n) => n / 100)

function withId<T extends Entity>(entity: Omit<T, "id">, id: string): T {
  return { ...entity, id } as T
}

export const lineEntity: fc.Arbitrary<LineEntity> = distinctPoints.map(
  ([start, end]) =>
    withId<LineEntity>(
      { type: "line", layerId: DEFAULT_LAYER_ID, start, end },
      "line"
    )
)

export const circleEntity: fc.Arbitrary<CircleEntity> = fc
  .tuple(point, positiveLength)
  .map(([center, radius]) =>
    withId<CircleEntity>(
      { type: "circle", layerId: DEFAULT_LAYER_ID, center, radius },
      "circle"
    )
  )

export const arcEntity: fc.Arbitrary<ArcEntity> = fc
  .tuple(point, positiveLength, angle, angle)
  .map(([center, radius, startAngle, endAngle]) =>
    withId<ArcEntity>(
      {
        type: "arc",
        layerId: DEFAULT_LAYER_ID,
        center,
        radius,
        startAngle,
        endAngle,
      },
      "arc"
    )
  )

/**
 * Ellipses both whole and swept, with the ratio kept clear of the degenerate
 * ends: at 1 an ellipse is a circle and its major axis stops being determined,
 * and near 0 it collapses to a segment — neither says anything about the
 * algebra the properties are checking.
 */
export const ellipseEntity: fc.Arbitrary<EllipseEntity> = fc
  .tuple(
    point,
    positiveLength,
    angle,
    fc.integer({ min: 5, max: 95 }).map((n) => n / 100),
    fc.option(
      fc.tuple(
        angle,
        // A sweep clear of both ends: zero and a whole turn both *are* a full
        // ellipse, which stores no parameters, so generating one would compare
        // a swept entity against a whole one after any round trip.
        fc.integer({ min: 10, max: 618 }).map((n) => n / 100)
      ),
      { nil: undefined }
    )
  )
  .map(([center, semiMajor, rotation, ratio, params]) =>
    withId<EllipseEntity>(
      {
        type: "ellipse",
        layerId: DEFAULT_LAYER_ID,
        center,
        majorAxis: {
          x: Math.cos(rotation) * semiMajor,
          y: Math.sin(rotation) * semiMajor,
        },
        ratio,
        ...(params
          ? { startParam: params[0], endParam: params[0] + params[1] }
          : {}),
      },
      "ellipse"
    )
  )

export const polylineEntity: fc.Arbitrary<PolylineEntity> = fc
  .tuple(
    fc.array(point, { minLength: 2, maxLength: 8 }),
    fc.boolean(),
    fc.option(fc.array(bulge, { minLength: 1, maxLength: 8 }), {
      nil: undefined,
    })
  )
  .map(([vertices, closed, bulges]) => {
    const entity: PolylineEntity = {
      id: "polyline",
      type: "polyline",
      layerId: DEFAULT_LAYER_ID,
      vertices,
      closed,
      ...(bulges && bulges.some((b) => b !== 0) ? { bulges } : {}),
    }
    return entity
  })

export const textEntity: fc.Arbitrary<TextEntity> = fc
  .tuple(
    point,
    fc.string({ minLength: 1, maxLength: 12 }),
    positiveLength,
    angle,
    fc.constantFrom(...TEXT_JUSTIFICATIONS)
  )
  .map(([position, value, height, rotation, justify]) =>
    withId<TextEntity>(
      {
        type: "text",
        layerId: DEFAULT_LAYER_ID,
        position,
        value,
        height,
        rotation,
        justify,
        styleId: DEFAULT_TEXT_STYLE_ID,
      },
      "text"
    )
  )

/** Paragraphs of typed text, so the contents carry `\P` and escapes. */
export const mtextEntity: fc.Arbitrary<MTextEntity> = fc
  .tuple(
    point,
    fc.array(fc.string({ maxLength: 16 }), { minLength: 1, maxLength: 4 }),
    positiveLength,
    fc.oneof(fc.constant(0), positiveLength),
    angle,
    fc.constantFrom(...MTEXT_ATTACHMENTS),
    fc.constantFrom("atLeast" as const, "exactly" as const),
    fc.integer({ min: 1, max: 16 }).map((n) => n / 4)
  )
  .map(
    ([
      position,
      paragraphs,
      height,
      width,
      rotation,
      attachment,
      lineSpacingStyle,
      lineSpacingFactor,
    ]) =>
      withId<MTextEntity>(
        {
          type: "mtext",
          layerId: DEFAULT_LAYER_ID,
          position,
          contents: mtextContents(paragraphs.join("\n")),
          height,
          width,
          rotation,
          attachment,
          lineSpacingStyle,
          lineSpacingFactor,
          styleId: DEFAULT_TEXT_STYLE_ID,
        },
        "mtext"
      )
  )

export const dimensionEntity: fc.Arbitrary<DimensionEntity> = fc
  .tuple(
    point,
    point,
    point,
    point,
    angle,
    fc.constantFrom("linear", "aligned", "angular", "radius", "diameter")
  )
  .map(([first, second, linePoint, vertex, rotation, kind]) =>
    withId<DimensionEntity>(
      {
        type: "dimension",
        layerId: DEFAULT_LAYER_ID,
        kind: kind as DimensionEntity["kind"],
        first,
        second,
        linePoint,
        // Only an angular dimension carries a vertex, and it is the point every
        // transform is most likely to forget.
        ...(kind === "angular" ? { vertex } : {}),
        rotation,
        styleId: DEFAULT_DIM_STYLE_ID,
      },
      "dim"
    )
  )

export const hatchEntity: fc.Arbitrary<HatchEntity> = fc
  .tuple(
    fc.array(point, { minLength: 3, maxLength: 6 }),
    fc.array(bulge, { minLength: 3, maxLength: 6 }),
    positiveLength,
    angle,
    point
  )
  .map(([vertices, bulges, patternScale, patternAngle, origin]) =>
    withId<HatchEntity>(
      {
        type: "hatch",
        layerId: DEFAULT_LAYER_ID,
        loops: [{ vertices, bulges }],
        patternId: DEFAULT_HATCH_PATTERN_ID,
        patternScale,
        patternAngle,
        origin,
      },
      "hatch"
    )
  )

export const insertEntity: fc.Arbitrary<InsertEntity> = fc
  .tuple(point, positiveLength, angle, fc.boolean())
  .map(([position, scale, rotation, mirrored]) =>
    withId<InsertEntity>(
      {
        type: "insert",
        layerId: DEFAULT_LAYER_ID,
        blockId: "BLOCK",
        position,
        scale,
        rotation,
        // Reflection is stored only when it applies, so the round-trip has to
        // survive the field being absent as well as present.
        ...(mirrored ? { mirrored: true } : {}),
      },
      "insert"
    )
  )

export const entity: fc.Arbitrary<Entity> = fc.oneof(
  lineEntity,
  circleEntity,
  arcEntity,
  ellipseEntity,
  polylineEntity,
  textEntity,
  mtextEntity,
  dimensionEntity,
  hatchEntity,
  insertEntity
)

/** A whole drawing, with ids made unique so it can populate a document. */
export const drawingSnapshot: fc.Arbitrary<DrawingSnapshot> = fc
  .tuple(
    fc.array(entity, { maxLength: 12 }),
    fc.constantFrom(...Object.values(LengthUnit)),
    fc.integer({ min: 0, max: 8 })
  )
  .map(([entities, unit, precision]) =>
    snapshotOf(
      entities.map((item, index) => ({ ...item, id: `e${index}` })),
      {
        settings: { unit, precision, ltScale: 1, lwDisplay: true },
        // The block every generated reference points at: a reader drops a
        // reference whose definition the file does not carry.
        blocks: [
          createBlockDefinition("BLOCK", { x: 0, y: 0 }, [
            {
              id: "b0",
              type: "line",
              layerId: DEFAULT_LAYER_ID,
              start: { x: 0, y: 0 },
              end: { x: 10, y: 0 },
            },
          ]),
        ],
      }
    )
  )
