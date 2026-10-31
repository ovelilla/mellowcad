import fc from "fast-check"
import {
  createBlockDefinition,
  createSpline,
  splineWithoutFitData,
  hasThickness,
  MTEXT_ATTACHMENTS,
  mtextContents,
  TEXT_JUSTIFICATIONS,
  withDeltaZ,
  withElevation,
  withNormal,
  withThickness,
  type ArcEntity,
  type ArrayParameters,
  type ArrayPathPiece,
  type AttributeDefinitionEntity,
  type AttributeModes,
  type BlockAttribute,
  type CircleEntity,
  type DimensionEntity,
  type EllipseEntity,
  type Entity,
  type HatchEntity,
  type InsertEntity,
  type LineEntity,
  type MTextEntity,
  type PolylineEntity,
  type Polyline3dEntity,
  type RegionEntity,
  type SplineEntity,
  type TextEntity,
  polylineFitted,
  polylineSplined,
  polyline3dSplined,
} from "../cad/domain/entities"
import { arrayPathOfPieces } from "../cad/domain/arrays"
import { DEFAULT_HATCH_PATTERN_ID } from "../cad/domain/hatchPatterns"
import { DEFAULT_LAYER_ID } from "../cad/domain/layers"
import { DEFAULT_TEXT_STYLE_ID } from "../cad/domain/textStyles"
import { DEFAULT_DIM_STYLE_ID } from "../cad/domain/dimStyles"
import { DEFAULT_DOCUMENT_SETTINGS, LengthUnit } from "../cad/domain/units"
import { COLOR_BYLAYER } from "../cad/domain/colors"
import { LINETYPES, LINETYPE_BYLAYER } from "../cad/domain/linetypes"
import { LINEWEIGHTS, LINEWEIGHT_BYLAYER } from "../cad/domain/lineweights"
import type { Vec2 } from "../cad/geometry/Vec2"
import type { PlanarCurve } from "../cad/geometry/planarCurves"
import type { RegionFace } from "../cad/geometry/planarRegions"
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

/** A Z value, zero as often as not: most drawings are flat. */
export const zValue: fc.Arbitrary<number> = fc.oneof(fc.constant(0), coordinate)

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
/** A polyline segment's width: often none, else up to a few units. */
export const width: fc.Arbitrary<number> = fc.oneof(
  fc.constant(0),
  fc.double({ min: 0.01, max: 20, noNaN: true })
)

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
        // The start as the factory stores it, in [0, 2π).
        ...(params
          ? {
              startParam: params[0] % (2 * Math.PI),
              endParam: (params[0] % (2 * Math.PI)) + params[1],
            }
          : {}),
      },
      "ellipse"
    )
  )
/**
 * Both methods, open and closed, with and without end tangents, on derived
 * knots or their own: a fit spline's custom ones, the control data a fit
 * spline leaves (`splineWithoutFitData`), a CV spline's weights. Built
 * through the factory, which is where a CV spline's degree is lowered to fit
 * its vertex count — the only shape the rest of the engine ever sees.
 */
export const splineEntity: fc.Arbitrary<SplineEntity> = fc
  .tuple(
    fc.constantFrom("fit" as const, "cv" as const),
    fc.array(point, { minLength: 2, maxLength: 6 }),
    fc.integer({ min: 1, max: 5 }),
    fc.constantFrom("chord" as const, "sqrtChord" as const, "uniform" as const),
    fc.boolean(),
    fc.option(point, { nil: undefined }),
    fc.option(point, { nil: undefined }),
    fc.constantFrom("derived" as const, "custom" as const, "control" as const),
    fc.array(fc.double({ min: 0.1, max: 10, noNaN: true }), {
      minLength: 9,
      maxLength: 9,
    }),
    fc.boolean()
  )
  .map(
    ([
      method,
      points,
      degree,
      knots,
      closed,
      startTangent,
      endTangent,
      own,
      numbers,
      weighted,
    ]) => {
      // A custom fit spline's parameters, rising by the numbers.
      const params = [0]
      for (let i = 0; i < (closed ? points.length : points.length - 1); i++) {
        params.push(params[i] + numbers[i])
      }
      const first = params[0]
      const last = params[params.length - 1]
      const spline = createSpline(method, points, {
        degree,
        knots,
        closed,
        startTangent,
        endTangent,
        ...(own === "custom"
          ? {
              knotVector: closed
                ? params
                : [first, first, first, ...params, last, last, last],
            }
          : {}),
        id: "spline",
      })
      const shaped = own === "control" ? splineWithoutFitData(spline) : spline
      return weighted && shaped.method === "cv"
        ? { ...shaped, weights: numbers.slice(0, shaped.points.length) }
        : shaped
    }
  )

export const polylineEntity: fc.Arbitrary<PolylineEntity> = fc
  .tuple(
    fc.array(point, { minLength: 2, maxLength: 8 }),
    fc.boolean(),
    fc.option(fc.array(bulge, { minLength: 1, maxLength: 8 }), {
      nil: undefined,
    }),
    fc.option(
      fc.array(fc.tuple(width, width), { minLength: 8, maxLength: 8 }),
      {
        nil: undefined,
      }
    ),
    fc.boolean(),
    fc.option(
      fc.tuple(
        fc.constantFrom("curve", "quadratic", "cubic"),
        fc.integer({ min: -16, max: 16 }).filter((n) => n !== 0),
        fc.option(fc.double({ min: -Math.PI, max: Math.PI, noNaN: true }), {
          nil: null,
        })
      ),
      { nil: undefined }
    )
  )
  .map(([vertices, closed, bulges, widthList, linetypeGeneration, fit]) => {
    // One width pair per segment, as the factory and the file keep them.
    const segments = closed ? vertices.length : vertices.length - 1
    const widths = widthList?.slice(0, segments)
    const entity: PolylineEntity = {
      id: "polyline",
      type: "polyline",
      layerId: DEFAULT_LAYER_ID,
      vertices,
      closed,
      ...(bulges && bulges.some((b) => b !== 0) ? { bulges } : {}),
      ...(widths && widths.some(([s, e]) => s > 0 || e > 0) ? { widths } : {}),
      ...(linetypeGeneration ? { linetypeGeneration: true } : {}),
    }
    if (!fit) return entity
    // PEDIT's Fit or Spline, a tangent given at the first vertex.
    const [kind, perSpan, tangent] = fit
    const tangents = vertices.map((_, i) => (i === 0 ? tangent : null))
    return kind === "curve"
      ? polylineFitted(entity, tangents)
      : (polylineSplined(entity, kind, perSpan, tangents) ?? entity)
  })

export const polyline3dEntity: fc.Arbitrary<Polyline3dEntity> = fc
  .tuple(
    fc.array(fc.tuple(point, zValue), { minLength: 1, maxLength: 8 }),
    fc.boolean()
  )
  .map(([points, closed]) =>
    withId<Polyline3dEntity>(
      {
        type: "polyline3d",
        layerId: DEFAULT_LAYER_ID,
        vertices: points.map(([p, z]) => ({ ...p, z })),
        closed,
      },
      "polyline3d"
    )
  )
  .chain((poly) =>
    fc
      .option(
        fc.tuple(
          fc.constantFrom("quadratic" as const, "cubic" as const),
          fc.integer({ min: 1, max: 16 })
        ),
        { nil: undefined }
      )
      .map((fit) => (fit && polyline3dSplined(poly, fit[0], fit[1])) ?? poly)
  )

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

/** Tags as ATTDEF keeps them: uppercase, no spaces or `!`. */
const attributeTag: fc.Arbitrary<string> =
  fc.stringMatching(/^[A-Z0-9_-]{1,8}$/)

const attributeModes: fc.Arbitrary<AttributeModes> = fc.record({
  invisible: fc.boolean(),
  constant: fc.boolean(),
  verify: fc.boolean(),
  preset: fc.boolean(),
  lockPosition: fc.boolean(),
})

export const attdefEntity: fc.Arbitrary<AttributeDefinitionEntity> = fc
  .tuple(
    point,
    attributeTag,
    fc.string({ maxLength: 12 }),
    fc.string({ maxLength: 12 }),
    positiveLength,
    angle,
    fc.constantFrom(...TEXT_JUSTIFICATIONS),
    attributeModes
  )
  .map(([position, tag, prompt, value, height, rotation, justify, modes]) =>
    withId<AttributeDefinitionEntity>(
      {
        type: "attdef",
        layerId: DEFAULT_LAYER_ID,
        position,
        height,
        rotation,
        justify,
        styleId: DEFAULT_TEXT_STYLE_ID,
        tag,
        prompt,
        value,
        modes,
      },
      "attdef"
    )
  )

const blockAttribute: fc.Arbitrary<BlockAttribute> = fc
  .tuple(
    point,
    attributeTag,
    fc.string({ maxLength: 12 }),
    positiveLength,
    angle,
    fc.boolean(),
    zValue
  )
  .map(([position, tag, value, height, rotation, invisible, elevation]) => ({
    tag,
    value,
    position,
    ...(elevation !== 0 ? { elevation } : {}),
    height,
    rotation,
    justify: "left",
    styleId: DEFAULT_TEXT_STYLE_ID,
    invisible,
    layerId: DEFAULT_LAYER_ID,
  }))

export const dimensionEntity: fc.Arbitrary<DimensionEntity> = fc
  .tuple(
    point,
    point,
    point,
    point,
    angle,
    fc.constantFrom("linear", "aligned", "angular", "radius", "diameter"),
    fc.option(point, { nil: undefined })
  )
  .map(([first, second, linePoint, vertex, rotation, kind, textPoint]) =>
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
        // A moved text's point is optional too, so every transform must map it.
        ...(textPoint && kind !== "radius" && kind !== "diameter"
          ? { textPoint }
          : {}),
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

const count = fc.integer({ min: 1, max: 5 })

const arrayPathPiece: fc.Arbitrary<ArrayPathPiece> = fc.oneof(
  fc.tuple(point, point).map(([a, b]) => ({ kind: "line" as const, a, b })),
  fc
    .tuple(point, positiveLength, angle, angle)
    .map(([center, radius, start, sweep]) => ({
      kind: "arc" as const,
      center,
      radius,
      start,
      sweep,
    }))
)

/** An array's parameters, small counts so that its items stay cheap to derive. */
export const arrayParameters: fc.Arbitrary<ArrayParameters> = fc.oneof(
  fc
    .tuple(
      fc.tuple(count, count, count),
      coordinate,
      coordinate,
      coordinate,
      coordinate,
      angle
    )
    .map(
      ([
        [columns, rows, levels],
        colSpacing,
        rowSpacing,
        rowElevation,
        levelSpacing,
        turn,
      ]) => ({
        kind: "rectangular" as const,
        columns,
        rows,
        colSpacing,
        rowSpacing,
        rowElevation,
        levels,
        levelSpacing,
        axis: { x: Math.cos(turn), y: Math.sin(turn) },
      })
    ),
  fc
    .tuple(
      point,
      point,
      count,
      fc.integer({ min: 1, max: 360 }),
      fc.boolean(),
      fc.boolean()
    )
    .map(([center, basePoint, items, fill, clockwise, rotate]) => ({
      kind: "polar" as const,
      center,
      basePoint,
      items,
      fill,
      clockwise,
      rotate,
    })),
  fc
    .tuple(
      fc.array(arrayPathPiece, { minLength: 1, maxLength: 3 }),
      fc.boolean(),
      fc.constantFrom("divide" as const, "measure" as const),
      count,
      positiveLength,
      fc.boolean()
    )
    .map(([pieces, closed, method, items, spacing, align]) => ({
      pieces,
      closed,
      method,
      items,
      spacing,
      align,
    }))
    .filter(({ pieces, closed }) => arrayPathOfPieces(pieces, closed) !== null)
    .map(({ pieces, closed, ...layout }) => ({
      kind: "path" as const,
      path: arrayPathOfPieces(pieces, closed)!,
      pathId: "path",
      ...layout,
    }))
)

export const insertEntity: fc.Arbitrary<InsertEntity> = fc
  .tuple(
    point,
    positiveLength,
    fc.oneof(fc.constant(null), positiveLength),
    angle,
    fc.boolean(),
    fc.boolean(),
    fc.array(blockAttribute, { maxLength: 3 }),
    fc.option(arrayParameters, { freq: 3, nil: undefined })
  )
  .map(([position, x, y, rotation, flipX, flipY, attributes, array]) =>
    withId<InsertEntity>(
      {
        type: "insert",
        layerId: DEFAULT_LAYER_ID,
        blockId: "BLOCK",
        position,
        // Either sign on either axis, and X and Y often one size.
        scaleX: flipX ? -x : x,
        scaleY: (flipY ? -1 : 1) * (y ?? x),
        rotation,
        ...(attributes.length > 0 ? { attributes } : {}),
        ...(array ? { array } : {}),
      },
      "insert"
    )
  )

/**
 * A face of a region: a circle, an ellipse, a polygon with a round hole, or
 * a spline closed by a line — each kind of edge a region keeps.
 */
export const regionFace: fc.Arbitrary<RegionFace> = fc
  .tuple(
    fc.constantFrom("circle", "ellipse", "polygon", "spline"),
    point,
    positiveLength,
    angle,
    fc.integer({ min: 3, max: 6 }),
    fc.boolean()
  )
  .map(([kind, center, radius, turn, sides, holed]): RegionFace => {
    const at = (a: number, r = radius): Vec2 => ({
      x: center.x + r * Math.cos(a),
      y: center.y + r * Math.sin(a),
    })
    switch (kind) {
      case "circle":
        return {
          loops: [
            [
              {
                kind: "arc",
                center,
                radius,
                startAngle: turn,
                sweep: 2 * Math.PI,
              },
            ],
          ],
        }
      case "ellipse":
        return {
          loops: [
            [
              {
                kind: "ellipse",
                center,
                majorAxis: {
                  x: radius * Math.cos(turn),
                  y: radius * Math.sin(turn),
                },
                ratio: 0.5,
                startParam: 0,
                sweep: 2 * Math.PI,
              },
            ],
          ],
        }
      case "polygon": {
        const corners = Array.from({ length: sides }, (_, i) =>
          at(turn + (2 * Math.PI * i) / sides)
        )
        const outline: PlanarCurve[] = corners.map((start, i) => ({
          kind: "line",
          start,
          end: corners[(i + 1) % sides],
        }))
        const hole: PlanarCurve[] = [
          {
            kind: "arc",
            center,
            radius: radius / 4,
            startAngle: 0,
            sweep: -2 * Math.PI,
          },
        ]
        return { loops: holed ? [outline, hole] : [outline] }
      }
      case "spline": {
        const points = [0, 1, 2, 3].map((i) =>
          at(
            turn + (Math.PI * i) / 3,
            i === 1 || i === 2 ? radius * 1.5 : radius
          )
        )
        return {
          loops: [
            [
              {
                kind: "spline",
                curve: {
                  degree: 3,
                  knots: [0, 0, 0, 0, 1, 1, 1, 1],
                  controlPoints: points.map((p) => ({ ...p, z: 0 })),
                },
                from: 0,
                to: 1,
              },
              { kind: "line", start: points[3], end: points[0] },
            ],
          ],
        }
      }
    }
  })

export const regionEntity: fc.Arbitrary<RegionEntity> = fc
  .array(regionFace, { minLength: 1, maxLength: 2 })
  .map((faces) =>
    withId<RegionEntity>(
      { type: "region", layerId: DEFAULT_LAYER_ID, faces },
      "region"
    )
  )

export const entity: fc.Arbitrary<Entity> = fc
  .tuple(
    fc.oneof(
      lineEntity,
      circleEntity,
      arcEntity,
      ellipseEntity,
      splineEntity,
      polylineEntity,
      polyline3dEntity,
      textEntity,
      mtextEntity,
      attdefEntity,
      dimensionEntity,
      hatchEntity,
      insertEntity,
      regionEntity
    ),
    zValue,
    zValue,
    zValue,
    fc.oneof(
      { weight: 3, arbitrary: fc.constant(null) },
      {
        weight: 1,
        arbitrary: fc
          .tuple(
            fc.double({ min: -Math.PI, max: Math.PI, noNaN: true }),
            fc.double({ min: -Math.PI / 2, max: Math.PI / 2, noNaN: true })
          )
          .map(([azimuth, tilt]) => ({
            x: Math.cos(tilt) * Math.cos(azimuth),
            y: Math.cos(tilt) * Math.sin(azimuth),
            z: Math.sin(tilt),
          })),
      }
    )
  )
  .map(([flat, elevation, deltaZ, thickness, normal]) => {
    // Every transform has to carry the Z fields and the normal, which
    // TypeScript cannot check on optional ones; a flat drawing alone would
    // never notice one dropped. A 3D polyline has none: its vertices hold Z.
    if (flat.type === "polyline3d") return flat
    let placed: Entity = withElevation(flat, elevation)
    if (placed.type === "line") placed = withDeltaZ(placed, deltaZ)
    if (hasThickness(placed)) placed = withThickness(placed, thickness)
    if (normal) placed = withNormal(placed, normal)
    return placed
  })

/** A whole drawing, with ids made unique so it can populate a document. */
export const drawingSnapshot: fc.Arbitrary<DrawingSnapshot> = fc
  .tuple(
    fc.array(entity, { maxLength: 12 }),
    fc.constantFrom(...Object.values(LengthUnit)),
    fc.integer({ min: 0, max: 8 }),
    fc.constantFrom(COLOR_BYLAYER, "#ff0000", "#1a2b3c"),
    fc.constantFrom(LINETYPE_BYLAYER, ...LINETYPES.map((l) => l.id)),
    fc.constantFrom<number | typeof LINEWEIGHT_BYLAYER>(
      LINEWEIGHT_BYLAYER,
      ...LINEWEIGHTS
    )
  )
  .map(
    ([
      entities,
      unit,
      precision,
      currentColor,
      currentLinetype,
      currentLineweight,
    ]) =>
      snapshotOf(
        entities.map((item, index) => ({ ...item, id: `e${index}` })),
        {
          settings: {
            ...DEFAULT_DOCUMENT_SETTINGS,
            unit,
            precision,
            currentColor,
            currentLinetype,
            currentLineweight,
          },
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
