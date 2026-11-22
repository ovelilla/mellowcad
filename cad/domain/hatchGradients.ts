import { Vec2 } from "../geometry/Vec2"
import { EntityColor, colorChannels } from "./colors"

/**
 * AutoCAD's nine gradient fills, by the name a drawing stores (DXF 470), in
 * GFNAME's order (1 to 9), which is the order of -HATCH's `?` listing and of
 * the palette's Gradient name (ax26res 329).
 */
export const HATCH_GRADIENT_NAMES = [
  "LINEAR",
  "CYLINDER",
  "INVCYLINDER",
  "SPHERICAL",
  "HEMISPHERICAL",
  "CURVED",
  "INVSPHERICAL",
  "INVHEMISPHERICAL",
  "INVCURVED",
] as const

export type HatchGradientName = (typeof HATCH_GRADIENT_NAMES)[number]

export function isHatchGradientName(name: string): name is HatchGradientName {
  return (HATCH_GRADIENT_NAMES as readonly string[]).includes(name)
}

/**
 * A hatch's gradient fill (DXF 450 1), which takes the place of its pattern:
 * the hatch is a SOLID one whose colour runs from {@link colors}' first to
 * its second over the boundary's extents.
 */
export interface HatchGradient {
  readonly name: HatchGradientName
  /**
   * Color 1 and Color 2 (DXF 63/421). A one-colour gradient's second is its
   * shade or tint of the first, kept as AutoCAD writes it (gradient/g07: tint
   * 0 black, 0.5 the colour itself, 1 white).
   */
  readonly colors: readonly [EntityColor, EntityColor]
  /** Set on a one-colour gradient (DXF 452 1): its shade or tint, 0 to 1 (462). */
  readonly tint?: number
  /**
   * GFANG (DXF 460), radians CCW from the hatch's own X axis. No transform of
   * the hatch changes it (gradient/g08: ROTATE and MIRROR keep it, and the
   * plot draws the turned hatch's fill at the angle it had); a block
   * reference draws it turned with the rest of its block (g10).
   */
  readonly angle: number
  /**
   * GFSHIFT 0 (DXF 461 0): symmetrical. Off, "the gradient fill is shifted up
   * and to the left, creating the illusion of a light source to the left of
   * the object" (the Gradient tab's help).
   */
  readonly centered: boolean
}

/** One colour stop of a {@link GradientFill}, its offset in [0, 1]. */
export interface GradientStop {
  readonly offset: number
  readonly color: EntityColor
}

/**
 * What a gradient draws, in the hatch's plane: a `linear` fill runs from
 * `origin` (offset 0) to `origin + axisX` (offset 1), constant along
 * `axisY`; a `radial` one from `origin` out to the ellipse `origin +
 * cos·axisX + sin·axisY`, its last colour beyond. Both are the unit space of
 * the canvas's and SVG's own gradients mapped by `[axisX, axisY, origin]`.
 */
export interface GradientFill {
  readonly kind: "linear" | "radial"
  readonly origin: Vec2
  readonly axisX: Vec2
  readonly axisY: Vec2
  readonly stops: readonly GradientStop[]
}

/**
 * How AutoCAD shades a curved gradient: the cosine of a quarter turn sampled
 * at quarters and joined by straight runs. The plots of all nine gradients
 * (gradient/g04, g06: 1600 px over 100 units, R/255 of a blue-to-yellow fill)
 * sit under `cos(π/2·d)` between its quarters by up to 0.03 and on its
 * chords within 0.01: AutoCAD's fill is drawn from those five values.
 */
const QUARTERS = [0, 0.25, 0.5, 0.75, 1]

/** Where a shifted linear or cylindrical gradient turns, along its extents (g04, g06: 31.25 of 100, 15.6 of 50). */
const SHIFTED_MIDDLE = 5 / 16

/**
 * A curved gradient's half-width over its horizontal radius: its colour is
 * `cos(π/2·√(v² + (K·d)²))`, `v` up its extents from the bottom and `d` out
 * from their middle over the half-width (the least-squares fit of g04, g06 in
 * four shapes: 0.31 to 0.32).
 */
const CURVED_SPREAD = 0.3125

/**
 * The fill a gradient draws over `rings`, the hatch's loops in its own plane,
 * or null when they bound no area. The geometry was measured on AutoCAD
 * 2027's plots (probes gradient/g04, g06; rms under 0.015 of the colour range
 * for every name centred in a rectangle, tall or wide, turned or not, and in
 * a circle; 0.025 for CYLINDER and CURVED turned 30°):
 *
 * - LINEAR and CYLINDER run across the extents in the frame turned by the
 *   angle; CYLINDER is Color 2 along their middle.
 * - SPHERICAL is Color 2 at the centre of the unturned extents and Color 1 at
 *   half their larger side, S, whatever the angle; HEMISPHERICAL is centred S/2
 *   below that centre in the turned frame, out to S.
 * - CURVED is an ellipse about the middle of the turned extents' bottom, as
 *   tall as they are and 1/{@link CURVED_SPREAD} times their half-width wide.
 * - Not centred: LINEAR and CYLINDER turn at {@link SHIFTED_MIDDLE} of the
 *   way; SPHERICAL's centre moves (−S/4, S/4) in the turned frame,
 *   HEMISPHERICAL's (−S/2, 0) and CURVED's 3S/16 to the left (fits of g04,
 *   g06; AutoCAD's 144 gradients in its samples are all centred).
 * - An INV name is its name with the colours swapped.
 */
export function gradientFill(
  gradient: HatchGradient,
  rings: readonly (readonly Vec2[])[]
): GradientFill | null {
  const points = rings.flat()
  if (points.length < 3) return null
  const e = { x: Math.cos(gradient.angle), y: Math.sin(gradient.angle) }
  const n = { x: -e.y, y: e.x }
  const turned = extents(points, e, n)
  const plain = extents(points, { x: 1, y: 0 }, { x: 0, y: 1 })
  const width = turned.x1 - turned.x0
  const height = turned.y1 - turned.y0
  const side = Math.max(plain.x1 - plain.x0, plain.y1 - plain.y0)
  if (!(width > 0) || !(height > 0) || !(side > 0)) return null
  const at = (x: number, y: number): Vec2 => ({
    x: e.x * x + n.x * y,
    y: e.y * x + n.y * y,
  })
  const scaled = (v: Vec2, k: number): Vec2 => ({ x: v.x * k, y: v.y * k })
  const inverted = gradient.name.startsWith("INV")
  const [first, second] = inverted
    ? [gradient.colors[1], gradient.colors[0]]
    : gradient.colors
  const color = (t: number) => mixColors(first, second, t)
  const shade = (d: number) => color(Math.cos((Math.PI / 2) * d))
  // From the centre (offset 0, Color 2) out (offset 1, Color 1).
  const outward = QUARTERS.map((d) => ({ offset: d, color: shade(d) }))
  const centre = {
    x: (plain.x0 + plain.x1) / 2,
    y: (plain.y0 + plain.y1) / 2,
  }
  const shift = (x: number, y: number): Vec2 =>
    gradient.centered ? { x: 0, y: 0 } : at(x * side, y * side)
  const across = {
    origin: at(turned.x0, turned.y0),
    axisX: scaled(e, width),
    axisY: scaled(n, height),
  }
  switch (gradient.name.replace(/^INV/, "")) {
    case "LINEAR":
      return {
        kind: "linear",
        ...across,
        stops: gradient.centered
          ? [
              { offset: 0, color: color(0) },
              { offset: 1, color: color(1) },
            ]
          : [
              { offset: 0, color: color(0) },
              { offset: SHIFTED_MIDDLE, color: color(0.5) },
              { offset: 1, color: color(1) },
            ],
      }
    case "CYLINDER": {
      const middle = gradient.centered ? 0.5 : SHIFTED_MIDDLE
      const left = outward.map((stop) => ({
        offset: middle * (1 - stop.offset),
        color: stop.color,
      }))
      const right = outward.slice(1).map((stop) => ({
        offset: middle + (1 - middle) * stop.offset,
        color: stop.color,
      }))
      return { kind: "linear", ...across, stops: [...left.reverse(), ...right] }
    }
    case "SPHERICAL":
      return {
        kind: "radial",
        origin: add(centre, shift(-1 / 4, 1 / 4)),
        axisX: scaled(e, side / 2),
        axisY: scaled(n, side / 2),
        stops: outward,
      }
    case "HEMISPHERICAL":
      return {
        kind: "radial",
        origin: add(add(centre, at(0, -side / 2)), shift(-1 / 2, 0)),
        axisX: scaled(e, side),
        axisY: scaled(n, side),
        stops: outward,
      }
    default:
      return {
        kind: "radial",
        origin: add(
          at((turned.x0 + turned.x1) / 2, turned.y0),
          shift(-3 / 16, 0)
        ),
        axisX: scaled(e, width / 2 / CURVED_SPREAD),
        axisY: scaled(n, height),
        stops: outward,
      }
  }
}

function add(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x + b.x, y: a.y + b.y }
}

/** The extents of `points` along `e` (x) and `n` (y). */
function extents(points: readonly Vec2[], e: Vec2, n: Vec2) {
  let x0 = Infinity
  let x1 = -Infinity
  let y0 = Infinity
  let y1 = -Infinity
  for (const p of points) {
    const x = p.x * e.x + p.y * e.y
    const y = p.x * n.x + p.y * n.y
    x0 = Math.min(x0, x)
    x1 = Math.max(x1, x)
    y0 = Math.min(y0, y)
    y1 = Math.max(y1, y)
  }
  return { x0, x1, y0, y1 }
}

/**
 * `from` blended towards `to` by `t`, channel by channel in RGB: AutoCAD's
 * blue-to-yellow gradient is grey halfway (g03, R = G = B = 127).
 */
export function mixColors(
  from: EntityColor,
  to: EntityColor,
  t: number
): EntityColor {
  const a = colorChannels(from)
  const b = colorChannels(to)
  const k = Math.min(Math.max(t, 0), 1)
  return `#${a
    .map((c, i) => Math.round(c + (b[i] - c) * k))
    .map((c) => c.toString(16).padStart(2, "0"))
    .join("")}`
}
