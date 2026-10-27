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
import { measureTextInk } from "./text"
import { nextEntityId } from "./entityFactories"

/** The optional settings of a dimension; enough of them to want a bag. */
export interface DimensionOptions {
  /** Measurement direction in radians CCW; `linear` dimensions only. */
  readonly rotation?: number
  /** The angle vertex; `angular` dimensions only. */
  readonly vertex?: Vec2
  /** Where the user put the text (DXF 11 with flag 70's 128); absent when centred. */
  readonly textPoint?: Vec2
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
    ...(options.textPoint
      ? { textPoint: { x: options.textPoint.x, y: options.textPoint.y } }
      : {}),
    rotation: options.rotation ?? 0,
    ...(options.text !== undefined ? { text: options.text } : {}),
    ...(options.textAngle !== undefined
      ? { textAngle: options.textAngle }
      : {}),
    styleId: options.styleId ?? DEFAULT_DIM_STYLE_ID,
  }
}

/**
 * The definition points of a dimension: three, or four for an angular one,
 * and the text's own point once the user has moved it.
 */
export interface DimensionPoints {
  readonly first: Vec2
  readonly second: Vec2
  readonly linePoint: Vec2
  readonly vertex?: Vec2
  readonly textPoint?: Vec2
}

/**
 * Every definition point of `dim` put through `map`, including the vertex and
 * the text's point only when there is one.
 *
 * The single place that knows how many points a dimension has. Every transform
 * spreads its result, because spreading the entity and naming the points by
 * hand silently drops an optional point — TypeScript cannot catch a field that
 * is merely inherited from `...entity`, and a moved dimension would leave its
 * text behind.
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
    ...(dim.textPoint ? { textPoint: map(dim.textPoint) } : {}),
  }
}

/**
 * The dimension with its text put at `point` as Move with Dim Line puts it,
 * the default of the text grip and of DIMTMOVE 0 (desktop d03-1): the line
 * goes through the point and the text stays there (DXF 11, flag 70's 128). A
 * radial one's leader swings round to the point instead, its radius kept.
 */
export function dimensionWithTextAt(
  dim: DimensionEntity,
  point: Vec2
): DimensionEntity {
  const at = { x: point.x, y: point.y }
  if (dim.kind === "radius" || dim.kind === "diameter") {
    const out = V.sub(at, dim.first)
    const reach = V.length(out)
    const radius = V.distance(dim.first, dim.second)
    return {
      ...dim,
      second:
        reach < 1e-9
          ? dim.second
          : V.add(dim.first, V.scale(out, radius / reach)),
      linePoint: at,
    }
  }
  return { ...dim, linePoint: at, textPoint: at }
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
 * What a dimension reads. Derived from the definition points and formatted by
 * its style, never stored — so the number can never drift from the geometry. A
 * radial measurement carries AutoCAD's radius or diameter symbol in front of
 * it. An explicit `text` override replaces the lot, with `<>` standing in for
 * the measurement as drawn, symbol and all, exactly as AutoCAD's Text option
 * does (`12,5 mm`, p15; `R50 TYP`, p320).
 */
export function dimensionText(
  dim: DimensionEntity,
  style: DimStyle = DEFAULT_DIM_STYLE
): string {
  const measured = radialPrefix(dim.kind) + dimensionMeasurementText(dim, style)
  return dim.text === undefined ? measured : dim.text.replace(/<>/g, measured)
}

/**
 * The measurement as a string. A drawn angle is written in degrees with the
 * degree sign, which is part of how the value itself reads rather than a
 * prefix — so `<>` in a Text override substitutes it complete.
 *
 * `drawn` is the dimension's own text: DIMDSEP's separator, and a length's
 * trailing zeros dropped under DIMZIN 8 (`12,5`, `100`, `0,5`; p02) while an
 * angle keeps them (DIMAZIN 0: `22,50°`, p366). `reported` is what the command
 * line writes (`Dimension text = 12.5`, p01) and Text offers (`<12.5>`, p15):
 * a point, the zeros dropped from an angle too (`22.5`, p366), and no degree
 * sign (`Dimension text = 90`, `<90>`; p342, p359).
 *
 * Angular dimensions count their decimals with DIMADEC rather than DIMDEC, so
 * the two can be set apart: AutoCAD ships with DIMADEC 0, which is why a fresh
 * angular dimension reads whole degrees. AutoCAD's angular unit formats
 * (DIMAUNIT) are not modelled — only decimal degrees.
 */
export function dimensionMeasurementText(
  dim: DimensionEntity,
  style: DimStyle = DEFAULT_DIM_STYLE,
  form: "drawn" | "reported" = "drawn"
): string {
  const measured = dimensionMeasurement(dim)
  const drawn = form === "drawn"
  const separator = drawn ? style.decimalSeparator : "."
  if (dimensionMeasurementUnit(dim.kind) === "angle") {
    const degrees = (measured * 180) / Math.PI
    const suppress = !drawn && style.suppressTrailingZeros
    const value = decimalNumber(
      degrees,
      angleDecimalsOf(style),
      suppress,
      separator
    )
    return drawn ? `${value}\u00b0` : value
  }
  return decimalNumber(
    measured,
    style.decimals,
    style.suppressTrailingZeros,
    separator
  )
}

/** `value` to `places` decimals, its trailing zeros dropped if `suppress`. */
function decimalNumber(
  value: number,
  places: number,
  suppress: boolean,
  separator: string
): string {
  const fixed = value.toFixed(places)
  const text =
    suppress && fixed.includes(".") ? fixed.replace(/\.?0+$/, "") : fixed
  return text.replace(".", separator)
}

/**
 * The symbol AutoCAD puts in front of a radial measurement. WHY U+00D8 for
 * the diameter where AutoCAD writes ∅ (U+2205, p302): the drawing font (Arial's
 * metrics, Arimo) has no ∅, which a fallback face would draw and measure
 * otherwise; Ø's ink is the box AutoCAD lays out (8.235 wide for `∅100`, p302).
 */
function radialPrefix(kind: DimensionKind): string {
  if (kind === "radius") return "R"
  return kind === "diameter" ? "\u00d8" : ""
}

/** Everything a dimension draws, resolved from its definition points. */
export interface DimensionGeometry {
  /** Where the dimension line starts; for a radial one, the text's far end. */
  readonly lineStart: Vec2
  /** Where it ends: the far extension line, or a radial one's arrow base. */
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
   * linear dimension, or a radial one's DIMTOFL line or centre mark and a
   * diameter's outside arrow stub.
   */
  readonly lines: readonly (readonly [Vec2, Vec2])[]
  /** Filled arrowhead outlines, tips on the dimension line's ends. */
  readonly arrows: readonly (readonly Vec2[])[]
  /** Justification point of the measurement text (it sits above the line). */
  readonly textPosition: Vec2
  /**
   * DXF 11, where the text's grip sits: the point the user put the text at,
   * else the text's middle (d04-2: Text position Y 11.875 over a line at 10),
   * or a radial one's the end of its leader, under the text (desktop d01-1).
   */
  readonly textPoint: Vec2
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
  // A text the user moved stays where it was put along the line, still above
  // it (ISO-25's DIMTAD 1, d03-1).
  const anchor = dim.textPoint ? project(dim.textPoint) : mid

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
    ...textPlacement(dim, angle, anchor, sized),
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
 * the intersection of the dimension line" — outward where the arc is beyond
 * an endpoint, inward where it is short of it, DIMEXO off the endpoint and
 * DIMEXE past the arc either way (probes dimensions/p340: 50.625→71.25 to an
 * arc at 70; p342: 49.375→41.18 to one at 42.43) — and the arrowheads sit
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
    if (Math.abs(radius - V.distance(vertex, origin)) > 1e-9)
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
    ...angularTextPlacement(
      dim,
      frame,
      dim.textPoint ? bearingFrom(vertex, dim.textPoint) : midAngle,
      sized
    ),
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
  "textPosition" | "textPoint" | "textAngle" | "textHeight" | "text"
> {
  const readable = readableAngle(midAngle - Math.PI / 2)
  const up = { x: -Math.sin(readable), y: Math.cos(readable) }
  const outward = { x: Math.cos(midAngle), y: Math.sin(midAngle) }
  const gap = sized.textGap + (V.dot(up, outward) >= 0 ? 0 : sized.textHeight)
  const textPosition = polarPoint(frame.vertex, frame.radius + gap, midAngle)
  return {
    textPosition,
    textPoint:
      dim.textPoint ?? V.add(textPosition, V.scale(up, sized.textHeight / 2)),
    textAngle: dim.textAngle ?? readable,
    textHeight: sized.textHeight,
    text: dimensionText(dim, sized),
  }
}

/**
 * A radius or diameter dimension, laid out as AutoCAD's exploded ones are
 * (probes dimensions/p300–p303, p306, p320, p321). The text is centred on the
 * location, pinned to the radial line through `second`, so the assembly reads
 * straight however the location has since been dragged; one run goes from the
 * far end of the text to the base of the one arrowhead on the rim, inside the
 * circle or out (`LINE 26.39→47.5` under `R50` at 30, p300). The text's
 * extent is its ink with DIMGAP each side (`R50 TYP`: 13.74 + 2 × 0.625,
 * p320). Under an explicit Angle the text's middle sits on the line and the
 * run stops at that box (p321).
 *
 * Outside, DIMTOFL draws the line across from the centre (a diameter's from
 * the far rim, its second arrowhead outside on a stub; p301, p303) and off,
 * the centre mark DIMCEN instead (p306).
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
  const lineAngle = Math.atan2(dir.y, dir.x)

  const arcPoint = at(radius)
  const along = V.dot(V.sub(dim.linePoint, center), dir)
  const outside = along > radius
  const textAlong = outside ? along : Math.max(along, 0)
  const textAnchor = at(textAlong)
  // Along the line from the text towards the arrowhead on the rim.
  const toward = outside ? -1 : 1
  const arrowBase = at(radius - toward * sized.arrowSize)

  const text = dimensionText(dim, sized)
  const ink = measureTextInk(text, sized.textHeight)
  const halfLong = (ink.x1 - ink.x0) / 2 + sized.textGap
  const halfAcross = (ink.y1 - ink.y0) / 2 + sized.textGap
  let lineStart: Vec2
  let placed: ReturnType<typeof textPlacement>
  if (dim.textAngle === undefined) {
    lineStart = at(textAlong - toward * halfLong)
    placed = textPlacement(dim, lineAngle, textAnchor, sized)
  } else {
    const turn = dim.textAngle - lineAngle
    const reach = Math.min(
      halfLong / Math.max(Math.abs(Math.cos(turn)), 1e-9),
      halfAcross / Math.max(Math.abs(Math.sin(turn)), 1e-9)
    )
    lineStart = at(textAlong + toward * reach)
    const up = { x: -Math.sin(dim.textAngle), y: Math.cos(dim.textAngle) }
    placed = {
      textPosition: V.sub(textAnchor, V.scale(up, (ink.y0 + ink.y1) / 2)),
      textPoint: textAnchor,
      textAngle: dim.textAngle,
      textHeight: sized.textHeight,
      text,
    }
  }

  const lines: [Vec2, Vec2][] = []
  const arrows: Vec2[][] = [
    arrowHead(arcPoint, at(radius - toward), sized.arrowSize),
  ]
  if (outside) {
    const far = at(-radius)
    if (dim.kind === "diameter") {
      // The far arrowhead outside too, on a stub as long as it (p303).
      arrows.push(arrowHead(far, at(-radius - 1), sized.arrowSize))
      lines.push([
        at(-radius - sized.arrowSize),
        at(-radius - 2 * sized.arrowSize),
      ])
    }
    if (sized.forceLineInside) {
      lines.push([dim.kind === "diameter" ? far : center, arcPoint])
    } else if (sized.centerMark > 0) {
      lines.push(...centerMark(center, sized.centerMark))
    }
  }

  return {
    lineStart,
    lineEnd: arrowBase,
    lineMidpoint: V.midpoint(lineStart, arrowBase),
    lines,
    arrows,
    ...placed,
    textPoint: textAnchor,
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
  "textPosition" | "textPoint" | "textAngle" | "textHeight" | "text"
> {
  const readable = readableAngle(angle)
  const up = { x: -Math.sin(readable), y: Math.cos(readable) }
  return {
    textPosition: V.add(anchor, V.scale(up, sized.textGap)),
    textPoint:
      dim.textPoint ??
      V.add(anchor, V.scale(up, sized.textGap + sized.textHeight / 2)),
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
