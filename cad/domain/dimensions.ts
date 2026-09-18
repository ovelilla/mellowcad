import { Vec2, V } from "../geometry/Vec2"
import {
  angleWithinSweep,
  normalizeAngle,
  polarPoint,
} from "../geometry/primitives"
import { DEFAULT_LAYER_ID, LayerId } from "./layers"
import {
  DEFAULT_DIM_STYLE,
  DEFAULT_DIM_STYLE_ID,
  DimStyle,
  DimStyleId,
  angleDecimalsOf,
  scaledDimStyle,
} from "./dimStyles"
import { EntityId, DimensionKind, DimensionEntity } from "./entityTypes"
import { nextEntityId } from "./entityFactories"

/** The optional settings of a dimension; enough of them to want a bag. */
export interface DimensionOptions {
  /** Measurement direction in radians CCW; `linear` dimensions only. */
  readonly rotation?: number
  /** The angle vertex; `angular` dimensions only. */
  readonly vertex?: Vec2
  readonly text?: string
  readonly textAngle?: number
  readonly styleId?: DimStyleId
  readonly layerId?: LayerId
  readonly id?: EntityId
}

export function createDimension(
  kind: DimensionKind,
  first: Vec2,
  second: Vec2,
  linePoint: Vec2,
  options: DimensionOptions = {}
): DimensionEntity {
  return {
    id: options.id ?? nextEntityId(),
    type: "dimension",
    layerId: options.layerId ?? DEFAULT_LAYER_ID,
    kind,
    first: { x: first.x, y: first.y },
    second: { x: second.x, y: second.y },
    linePoint: { x: linePoint.x, y: linePoint.y },
    ...(options.vertex
      ? { vertex: { x: options.vertex.x, y: options.vertex.y } }
      : {}),
    rotation: options.rotation ?? 0,
    ...(options.text !== undefined ? { text: options.text } : {}),
    ...(options.textAngle !== undefined
      ? { textAngle: options.textAngle }
      : {}),
    styleId: options.styleId ?? DEFAULT_DIM_STYLE_ID,
  }
}

/** The definition points of a dimension: three, or four for an angular one. */
export interface DimensionPoints {
  readonly first: Vec2
  readonly second: Vec2
  readonly linePoint: Vec2
  readonly vertex?: Vec2
}

/**
 * Every definition point of `dim` put through `map`, including the vertex only
 * when there is one.
 *
 * The single place that knows how many points a dimension has. Every transform
 * spreads its result, because spreading the entity and naming the points by
 * hand silently drops the optional vertex — TypeScript cannot catch a field
 * that is merely inherited from `...entity`.
 */
export function mapDimensionPoints(
  dim: DimensionEntity,
  map: (point: Vec2) => Vec2
): DimensionPoints {
  return {
    first: map(dim.first),
    second: map(dim.second),
    linePoint: map(dim.linePoint),
    ...(dim.vertex ? { vertex: map(dim.vertex) } : {}),
  }
}

/** The direction a dimension measures along, radians CCW from +X. */
export function dimensionAxisAngle(dim: DimensionEntity): number {
  if (dim.kind === "linear") return dim.rotation
  const offset = V.sub(dim.second, dim.first)
  return V.length(offset) < 1e-9 ? 0 : Math.atan2(offset.y, offset.x)
}

/** The point an angular dimension turns about; its `first` origin if unset. */
export function dimensionVertex(dim: DimensionEntity): Vec2 {
  return dim.vertex ?? dim.first
}

/** Whether a kind reports a length or an angle in radians. */
export function dimensionMeasurementUnit(
  kind: DimensionKind
): "length" | "angle" {
  return kind === "angular" ? "angle" : "length"
}

/**
 * What a dimension reports: the two origins projected onto its axis, the radius
 * (doubled for a diameter) of the circle a radial one measures, or — for an
 * angular one — the angle they subtend, **in radians**. Ask
 * {@link dimensionMeasurementUnit} which of the two a kind returns.
 */
export function dimensionMeasurement(dim: DimensionEntity): number {
  if (dim.kind === "angular") return angularFrame(dim).sweep
  const offset = V.sub(dim.second, dim.first)
  if (dim.kind === "radius") return V.length(offset)
  if (dim.kind === "diameter") return 2 * V.length(offset)
  const angle = dimensionAxisAngle(dim)
  const dir = { x: Math.cos(angle), y: Math.sin(angle) }
  return Math.abs(V.dot(offset, dir))
}

/**
 * What a dimension reads. Derived from the definition points and formatted to
 * the style's decimal places, never stored — so the number can never drift from
 * the geometry. A radial measurement carries AutoCAD's radius or diameter
 * symbol in front of it. An explicit `text` override replaces the lot, with
 * `<>` standing in for the bare measurement exactly as AutoCAD's Text option
 * does.
 */
export function dimensionText(
  dim: DimensionEntity,
  style: DimStyle = DEFAULT_DIM_STYLE
): string {
  const measured = formatMeasurement(dim, style)
  return dim.text === undefined
    ? radialPrefix(dim.kind) + measured
    : dim.text.replace(/<>/g, measured)
}

/**
 * The measurement as a string. An angular one is written in degrees with the
 * degree sign, which is part of how the value itself reads rather than a
 * prefix — so `<>` in a Text override substitutes it complete.
 *
 * Angular dimensions count their decimals with DIMADEC rather than DIMDEC, so
 * the two can be set apart: AutoCAD ships with DIMADEC 0, which is why a fresh
 * angular dimension reads whole degrees while a linear one keeps two places.
 * AutoCAD's angular unit formats (DIMAUNIT) are not modelled — only decimal
 * degrees.
 */
function formatMeasurement(dim: DimensionEntity, style: DimStyle): string {
  const measured = dimensionMeasurement(dim)
  return dimensionMeasurementUnit(dim.kind) === "angle"
    ? `${((measured * 180) / Math.PI).toFixed(angleDecimalsOf(style))}\u00b0`
    : measured.toFixed(style.decimals)
}

/**
 * The symbol AutoCAD puts in front of a radial measurement. The diameter sign
 * is written with U+00D8 rather than the typographically correct U+2300, which
 * the UI fonts do not reliably carry — a missing glyph would render as a box.
 */
function radialPrefix(kind: DimensionKind): string {
  if (kind === "radius") return "R"
  return kind === "diameter" ? "\u00d8" : ""
}

/** Everything a dimension draws, resolved from its definition points. */
export interface DimensionGeometry {
  /** Where the dimension line starts; for a radial one, its inner end. */
  readonly lineStart: Vec2
  /** Where it ends: the far extension line, or the measured arc. */
  readonly lineEnd: Vec2
  /**
   * Halfway along the dimension line — around the arc when there is one, which
   * for a wide angular sweep is nowhere near the midpoint of the chord.
   */
  readonly lineMidpoint: Vec2
  /**
   * The dimension line itself when it curves: an angular dimension draws it as
   * an arc between the extension lines, its ends being `lineStart`/`lineEnd`.
   */
  readonly arc?: {
    readonly center: Vec2
    readonly radius: number
    readonly startAngle: number
    readonly endAngle: number
  }
  /**
   * Every other straight run the dimension draws: the two extension lines of a
   * linear dimension, or a radial one's centre mark and outside arrow stub.
   */
  readonly lines: readonly (readonly [Vec2, Vec2])[]
  /** Filled arrowhead outlines, tips on the dimension line's ends. */
  readonly arrows: readonly (readonly Vec2[])[]
  /** Justification point of the measurement text (it sits above the line). */
  readonly textPosition: Vec2
  /** Text baseline angle, radians CCW — always kept readable. */
  readonly textAngle: number
  /** Capital height of the measurement text, DIMSCALE already applied. */
  readonly textHeight: number
  readonly text: string
}

/**
 * Resolves a dimension into the lines, arrowheads and text it draws.
 *
 * The dimension line is the two origins projected onto the axis through
 * `linePoint`, so dragging the location slides the whole assembly while the
 * measurement stays put. The text sits *above* the dimension line rather than
 * breaking it (ISO's DIMTAD 1) — which is also the only placement this engine
 * can honour, having no glyph metrics with which to size a gap in the line.
 */
export function dimensionGeometry(
  dim: DimensionEntity,
  style: DimStyle = DEFAULT_DIM_STYLE
): DimensionGeometry {
  const sized = scaledDimStyle(style)
  if (dim.kind === "angular") return angularGeometry(dim, sized)
  if (dim.kind === "radius" || dim.kind === "diameter")
    return radialGeometry(dim, sized)

  const angle = dimensionAxisAngle(dim)
  const dir = { x: Math.cos(angle), y: Math.sin(angle) }
  const project = (p: Vec2): Vec2 =>
    V.add(dim.linePoint, V.scale(dir, V.dot(V.sub(p, dim.linePoint), dir)))

  const lineStart = project(dim.first)
  const lineEnd = project(dim.second)
  const mid = V.midpoint(lineStart, lineEnd)

  return {
    lineStart,
    lineEnd,
    lineMidpoint: mid,
    lines: [
      extensionLine(dim.first, lineStart, sized),
      extensionLine(dim.second, lineEnd, sized),
    ],
    arrows: [
      arrowHead(lineStart, lineEnd, sized.arrowSize),
      arrowHead(lineEnd, lineStart, sized.arrowSize),
    ],
    ...textPlacement(dim, angle, mid, sized),
  }
}

/**
 * The sweep an angular dimension measures, resolved from its four definition
 * points.
 *
 * Two arcs join the endpoints around the vertex; the measured one is whichever
 * contains the location the dimension arc was placed at. That is what AutoCAD
 * means by the location "determining the direction to draw the extension
 * lines", and it is why dragging the location across a ray gives the reflex
 * angle instead.
 */
interface AngularFrame {
  readonly vertex: Vec2
  /** Distance from the vertex to the dimension arc. */
  readonly radius: number
  readonly startAngle: number
  readonly endAngle: number
  readonly sweep: number
  /** Where each angle endpoint lies: its bearing and distance from the vertex. */
  readonly firstAngle: number
  readonly secondAngle: number
}

function angularFrame(dim: DimensionEntity): AngularFrame {
  const vertex = dimensionVertex(dim)
  const firstAngle = bearingFrom(vertex, dim.first)
  const secondAngle = bearingFrom(vertex, dim.second)
  const placed = bearingFrom(vertex, dim.linePoint)
  const forward = angleWithinSweep(firstAngle, secondAngle, placed)
  const startAngle = forward ? firstAngle : secondAngle
  const endAngle = forward ? secondAngle : firstAngle
  return {
    vertex,
    radius: V.distance(vertex, dim.linePoint),
    startAngle,
    endAngle,
    sweep: normalizeAngle(endAngle - startAngle),
    firstAngle,
    secondAngle,
  }
}

/** The bearing of `to` seen from `from`, radians CCW; 0 when they coincide. */
function bearingFrom(from: Vec2, to: Vec2): number {
  const offset = V.sub(to, from)
  return V.length(offset) < 1e-9 ? 0 : Math.atan2(offset.y, offset.x)
}

/**
 * An angular dimension. "The dimension line is drawn as an arc between the
 * extension lines. The extension lines are drawn from the angle endpoints to
 * the intersection of the dimension line" — so an extension line exists only
 * where the arc has been pulled past that endpoint, and the arrowheads sit
 * tangent to the arc at its two ends.
 */
function angularGeometry(
  dim: DimensionEntity,
  sized: DimStyle
): DimensionGeometry {
  const frame = angularFrame(dim)
  const { vertex, radius, startAngle, endAngle, sweep } = frame
  const at = (angle: number) => polarPoint(vertex, radius, angle)
  const lineStart = at(startAngle)
  const lineEnd = at(endAngle)
  const midAngle = startAngle + sweep / 2

  const lines: (readonly [Vec2, Vec2])[] = []
  for (const [origin, angle] of [
    [dim.first, frame.firstAngle],
    [dim.second, frame.secondAngle],
  ] as const) {
    if (radius > V.distance(vertex, origin) + 1e-9)
      lines.push(extensionLine(origin, at(angle), sized))
  }

  // Tangents pointing out of the measured sweep, so each arrowhead lies along
  // the arc it terminates exactly as a straight dimension's lies along its line.
  const tangent = (angle: number, sign: number): Vec2 => ({
    x: -sign * Math.sin(angle),
    y: sign * Math.cos(angle),
  })

  return {
    lineStart,
    lineEnd,
    lineMidpoint: at(midAngle),
    arc: { center: vertex, radius, startAngle, endAngle },
    lines,
    arrows: [
      arrowHead(
        lineStart,
        V.add(lineStart, tangent(startAngle, 1)),
        sized.arrowSize
      ),
      arrowHead(
        lineEnd,
        V.add(lineEnd, tangent(endAngle, -1)),
        sized.arrowSize
      ),
    ],
    ...angularTextPlacement(dim, frame, midAngle, sized),
  }
}

/**
 * The measurement of an angular dimension: on the outside of the arc, reading
 * along its tangent at the midpoint.
 *
 * The glyphs grow along the text's own "up"; when keeping the number readable
 * turns that inwards, the baseline moves a text height further out so the
 * lettering still occupies the same band clear of the arc.
 */
function angularTextPlacement(
  dim: DimensionEntity,
  frame: AngularFrame,
  midAngle: number,
  sized: DimStyle
): Pick<
  DimensionGeometry,
  "textPosition" | "textAngle" | "textHeight" | "text"
> {
  const readable = readableAngle(midAngle - Math.PI / 2)
  const up = { x: -Math.sin(readable), y: Math.cos(readable) }
  const outward = { x: Math.cos(midAngle), y: Math.sin(midAngle) }
  const gap = sized.textGap + (V.dot(up, outward) >= 0 ? 0 : sized.textHeight)
  return {
    textPosition: polarPoint(frame.vertex, frame.radius + gap, midAngle),
    textAngle: dim.textAngle ?? readable,
    textHeight: sized.textHeight,
    text: dimensionText(dim, sized),
  }
}

/**
 * A radius or diameter dimension. The dimension line runs along the radius
 * through `second`: from the centre (or, for a diameter, right across from the
 * far side) out to the measured point when the text was placed inside the
 * circle, and as a leader coming in from the text when it was placed outside —
 * where AutoCAD also marks the centre it no longer reaches (DIMCEN).
 *
 * A simplification: AutoCAD's leader ends in a horizontal landing under the
 * text, whose length depends on how wide the text is. This engine has no glyph
 * metrics, so the text sits above the end of the leader, as it does on every
 * other dimension here.
 */
function radialGeometry(
  dim: DimensionEntity,
  sized: DimStyle
): DimensionGeometry {
  const center = dim.first
  const offset = V.sub(dim.second, center)
  const radius = V.length(offset)
  const dir = radius < 1e-9 ? { x: 1, y: 0 } : V.scale(offset, 1 / radius)
  const at = (distance: number): Vec2 => V.add(center, V.scale(dir, distance))

  const arcPoint = at(radius)
  const far = at(-radius)
  // The text is pinned to the radial line, so the assembly always reads
  // straight however the location has since been dragged.
  const along = V.dot(V.sub(dim.linePoint, center), dir)
  const outside = along > radius
  const textAnchor = at(outside ? along : Math.max(along, 0))

  const lines: [Vec2, Vec2][] = []
  const arrows: Vec2[][] = []
  let lineStart: Vec2

  if (outside) {
    // A leader coming in from the text, with the arrowhead against the circle.
    lineStart = textAnchor
    arrows.push(arrowHead(arcPoint, textAnchor, sized.arrowSize))
    if (dim.kind === "diameter") {
      // The opposite arrowhead sits outside too, on a stub of its own.
      const stub = at(-radius - 2 * sized.arrowSize)
      lines.push([far, stub])
      arrows.push(arrowHead(far, stub, sized.arrowSize))
    }
    if (sized.centerMark > 0)
      lines.push(...centerMark(center, sized.centerMark))
  } else {
    lineStart = dim.kind === "diameter" ? far : center
    arrows.push(arrowHead(arcPoint, lineStart, sized.arrowSize))
    if (dim.kind === "diameter")
      arrows.push(arrowHead(far, arcPoint, sized.arrowSize))
  }

  return {
    lineStart,
    lineEnd: arcPoint,
    lineMidpoint: V.midpoint(lineStart, arcPoint),
    lines,
    arrows,
    ...textPlacement(dim, Math.atan2(dir.y, dir.x), textAnchor, sized),
  }
}

/** The two crossing runs of a centre mark, aligned with the drawing axes. */
function centerMark(center: Vec2, size: number): [Vec2, Vec2][] {
  return [
    [
      { x: center.x - size, y: center.y },
      { x: center.x + size, y: center.y },
    ],
    [
      { x: center.x, y: center.y - size },
      { x: center.x, y: center.y + size },
    ],
  ]
}

/** The measurement text, sitting DIMGAP above `anchor` and never upside down. */
function textPlacement(
  dim: DimensionEntity,
  angle: number,
  anchor: Vec2,
  sized: DimStyle
): Pick<
  DimensionGeometry,
  "textPosition" | "textAngle" | "textHeight" | "text"
> {
  const readable = readableAngle(angle)
  const up = { x: -Math.sin(readable), y: Math.cos(readable) }
  return {
    textPosition: V.add(anchor, V.scale(up, sized.textGap)),
    textAngle: dim.textAngle ?? readable,
    textHeight: sized.textHeight,
    text: dimensionText(dim, sized),
  }
}

/**
 * Keeps text the right way up: a dimension is read from below or from the
 * right, so any axis angle is folded into (−90°, 90°].
 */
function readableAngle(angle: number): number {
  const folded = normalizeAngle(angle)
  return folded > Math.PI / 2 && folded <= (3 * Math.PI) / 2
    ? folded - Math.PI
    : normalizeAngle(folded + Math.PI / 2) - Math.PI / 2
}

/**
 * One extension line: it starts a gap away from the point being measured
 * (DIMEXO) and runs a little past the dimension line (DIMEXE). A degenerate
 * case — the dimension line passing through the origin — yields a zero-length
 * segment, which simply draws nothing.
 */
function extensionLine(
  origin: Vec2,
  onLine: Vec2,
  style: DimStyle
): readonly [Vec2, Vec2] {
  const offset = V.sub(onLine, origin)
  const distance = V.length(offset)
  if (distance < 1e-9) return [onLine, onLine]
  const dir = V.scale(offset, 1 / distance)
  return [
    V.add(origin, V.scale(dir, Math.min(style.extensionOffset, distance))),
    V.add(onLine, V.scale(dir, style.extensionBeyond)),
  ]
}

/**
 * A solid arrowhead: a closed triangle with its tip on `tip`, pointing away
 * from `away`. The 1:6 length-to-half-width ratio is AutoCAD's closed-filled
 * arrow.
 */
function arrowHead(tip: Vec2, away: Vec2, size: number): Vec2[] {
  const offset = V.sub(away, tip)
  const distance = V.length(offset)
  if (distance < 1e-9) return []
  const dir = V.scale(offset, 1 / distance)
  const base = V.add(tip, V.scale(dir, size))
  const half = V.scale({ x: -dir.y, y: dir.x }, size / 6)
  return [tip, V.add(base, half), V.sub(base, half)]
}
