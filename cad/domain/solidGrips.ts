import { Vec3, add3, cross3, dot3, scale3, sub3 } from "../geometry/Vec3"
import { SolidPrimitive } from "./entityTypes"

/**
 * What a primitive's grip edits (solid/g01, the desktop's GripData in SW
 * Isometric, d10): a square that moves the solid, or one of a box's or a
 * wedge's base corners; an arrow that sizes it along `along`.
 *
 * - `move`: the base's centre, a sphere's or a torus' centre.
 * - `corner`: a box's or wedge's base corner, `x` and `y` the sides it lies on
 *   (−1 or 1).
 * - `side`: an arrow at the middle of a box's or wedge's base edge, on side
 *   `sign` of `axis`.
 * - `height`: the top's arrow (a wedge's over its tall end), or the base's,
 *   under its centre.
 * - `polygon`: a pyramid's base corner or the middle of a side, `index`
 *   round from the corner before its X.
 * - `top`: a pyramid's or a cone's top radius.
 * - `quadrant`: a cylinder's or a cone's base at a quarter turn, a sphere's
 *   equator.
 * - `ring`: a torus' radius, at its tube's centre opposite its X.
 * - `tube`: a torus' tube at a quarter turn round that centre.
 */
export type SolidGripRole =
  | { readonly kind: "move" }
  | { readonly kind: "corner"; readonly x: 1 | -1; readonly y: 1 | -1 }
  | {
      readonly kind: "side"
      readonly axis: "x" | "y"
      readonly sign: 1 | -1
    }
  | { readonly kind: "height"; readonly end: "top" | "base" }
  | { readonly kind: "polygon"; readonly index: number }
  | { readonly kind: "top" }
  | {
      readonly kind: "quadrant"
      readonly axis: "x" | "y"
      readonly sign: 1 | -1
    }
  | { readonly kind: "ring" }
  | { readonly kind: "tube"; readonly index: 0 | 1 | 2 | 3 }

export interface SolidGrip {
  readonly role: SolidGripRole
  /** Where it is drawn, in the axes the primitive is given in. */
  readonly at: Vec3
  /** Which way it sizes the solid, a unit vector; none on a move or a box's corner. */
  readonly along?: Vec3
  /** Drawn a square, though it sizes: a pyramid's corner (d10). */
  readonly square?: boolean
}

/** How the view meets the grips: its direction towards the viewer, and the size of a pixel. */
export interface GripView {
  readonly direction: Vec3
  readonly pixel: number
}

/**
 * Pixels a grip AutoCAD draws beside another stands off it: the base's
 * height arrow under the base's centre (`-0.1` at a view unit of 0.01, g01),
 * a pointed top's radius arrow out from the apex and down (`0.15`).
 */
const BASE_ARROW_PX = 10
const APEX_ARROW_PX = 15

/** Below this, an axis looks along the view: AutoCAD leaves its height arrows out (in plan, g01). */
const EDGE_ON = 1e-6

function frameOf(primitive: SolidPrimitive) {
  const x = primitive.xAxis
  const n = primitive.normal
  return { x, y: cross3(n, x), n, p: primitive.position }
}

/**
 * The primitive's grips in the order AutoCAD's GetGripPoints gives them
 * (solid/g01's MPGRIPDATA): the move square first, then the base's, the
 * height's — left out where the view looks along the axis —, and the top's.
 */
export function solidGrips(
  primitive: SolidPrimitive,
  view: GripView
): SolidGrip[] {
  const { x, y, n, p } = frameOf(primitive)
  const at = (u: number, v: number, w: number) =>
    add3(p, add3(add3(scale3(x, u), scale3(y, v)), scale3(n, w)))
  const out: SolidGrip[] = [{ role: { kind: "move" }, at: p }]
  const shows = Math.abs(dot3(n, view.direction)) < 1 - EDGE_ON
  const heights = (height: number, top: Vec3) =>
    shows
      ? [
          { role: { kind: "height", end: "top" } as const, at: top, along: n },
          {
            role: { kind: "height", end: "base" } as const,
            at: sub3(p, scale3(n, BASE_ARROW_PX * view.pixel)),
            along: scale3(n, -1),
          },
        ]
      : []
  switch (primitive.kind) {
    case "box":
    case "wedge": {
      const l = primitive.length / 2
      const w = primitive.width / 2
      for (const [cx, cy] of [
        [-1, -1],
        [1, -1],
        [1, 1],
        [-1, 1],
      ] as const) {
        out.push({
          role: { kind: "corner", x: cx, y: cy },
          at: at(cx * l, cy * w, 0),
        })
      }
      for (const [axis, sign] of [
        ["x", -1],
        ["x", 1],
        ["y", -1],
        ["y", 1],
      ] as const) {
        const dir = scale3(axis === "x" ? x : y, sign)
        out.push({
          role: { kind: "side", axis, sign },
          at: add3(p, scale3(dir, axis === "x" ? l : w)),
          along: dir,
        })
      }
      // A wedge's top is the edge over its tall end.
      const top = at(primitive.kind === "wedge" ? -l : 0, 0, primitive.height)
      out.push(...heights(primitive.height, top))
      return out
    }
    case "pyramid": {
      const { sides, radius, topRadius, height } = primitive
      const half = Math.PI / sides
      const across = Math.cos(half)
      for (let k = 0; k < 2 * sides; k++) {
        const angle = (k - 1) * half
        const r = k % 2 === 0 ? radius : radius * across
        const dir = add3(scale3(x, Math.cos(angle)), scale3(y, Math.sin(angle)))
        out.push({
          role: { kind: "polygon", index: k },
          at: add3(p, scale3(dir, r)),
          along: dir,
          ...(k % 2 === 0 ? { square: true } : {}),
        })
      }
      out.push(topGrip(p, x, n, height, topRadius * across, view))
      out.push(...heights(height, at(0, 0, height)))
      return out
    }
    case "cylinder":
    case "cone": {
      const rx = primitive.radius
      const ry = primitive.radiusY ?? rx
      for (const [axis, sign] of [
        ["x", -1],
        ["x", 1],
        ["y", -1],
        ["y", 1],
      ] as const) {
        const dir = scale3(axis === "x" ? x : y, sign)
        out.push({
          role: { kind: "quadrant", axis, sign },
          at: add3(p, scale3(dir, axis === "x" ? rx : ry)),
          along: dir,
        })
      }
      out.push(...heights(primitive.height, at(0, 0, primitive.height)))
      if (primitive.kind === "cone") {
        const topX = (primitive.topRadius / Math.max(rx, ry)) * rx
        out.push(topGrip(p, x, n, primitive.height, topX, view))
      }
      return out
    }
    case "sphere": {
      const r = primitive.radius
      for (const dir of [x, scale3(x, -1), y, scale3(y, -1)]) {
        const sign = dot3(dir, add3(x, y)) > 0 ? 1 : -1
        out.push({
          role: {
            kind: "quadrant",
            axis: Math.abs(dot3(dir, x)) > 0.5 ? "x" : "y",
            sign,
          },
          at: add3(p, scale3(dir, r)),
          along: dir,
        })
      }
      return out
    }
    case "torus": {
      // At the tube opposite its X, |R| out whichever side the ring is
      // (g01: a lemon's at 306 for -4 round 310).
      const centre = sub3(p, scale3(x, Math.abs(primitive.radius)))
      const r = primitive.tubeRadius
      const ways = [scale3(x, -1), x, scale3(n, -1), n]
      ways.forEach((dir, index) =>
        out.push({
          role: { kind: "tube", index: index as 0 | 1 | 2 | 3 },
          at: add3(centre, scale3(dir, r)),
          along: dir,
        })
      )
      out.push({ role: { kind: "ring" }, at: centre, along: scale3(x, -1) })
      return out
    }
  }
}

/**
 * A pyramid's or a cone's top radius arrow: on the top opposite the X, or,
 * on a point, stood off the apex outwards and down so the height's arrow
 * shows (g01).
 */
function topGrip(
  p: Vec3,
  x: Vec3,
  n: Vec3,
  height: number,
  reach: number,
  view: GripView
): SolidGrip {
  const out = scale3(x, -1)
  const off = reach > 0 ? 0 : APEX_ARROW_PX * view.pixel
  return {
    role: { kind: "top" },
    at: add3(add3(p, scale3(n, height - off)), scale3(out, reach + off)),
    along: out,
  }
}

/**
 * How far a drag by `offset` takes an arrow along `dir`. A grip in the base's
 * plane is read in it (`offset · dir`: a box's or a cylinder's, g01's
 * `5 -2,7,4`); any other along the line of sight, the point of its axis the
 * cursor covers on the screen, since the cursor's point lies on the work plane
 * (g01: a box's height dragged 2,0,0 in SW Isometric rises 1; a pyramid's
 * corner, a cone's top, a sphere's and a torus' radius alike).
 */
function travel(offset: Vec3, dir: Vec3, view: Vec3, sighted: boolean): number {
  if (!sighted) return dot3(offset, dir)
  const flat = (v: Vec3) => sub3(v, scale3(view, dot3(v, view)))
  const axis = flat(dir)
  const size = dot3(axis, axis)
  if (size < EDGE_ON) return dot3(offset, dir)
  return dot3(flat(offset), axis) / size
}

/** Which grips read the drag in the base's plane rather than along the line of sight (g01). */
function readsInPlane(primitive: SolidPrimitive, role: SolidGripRole): boolean {
  return (
    role.kind === "corner" ||
    role.kind === "side" ||
    (role.kind === "quadrant" && primitive.kind !== "sphere")
  )
}

/**
 * The primitive its grip dragged by `offset` (target − grip) makes, or null
 * where AutoCAD leaves it: a size of 0 or less, a corner past the opposite
 * one, a lemon's tube no wider than its ring (g01). WHY a height dragged past
 * the opposite face is refused: AutoCAD's answer there is no rule (g01: down
 * 6 leaves the box upright 1 high, down 7 turns it over 2 high).
 */
export function solidGripDragged(
  primitive: SolidPrimitive,
  grip: SolidGrip,
  offset: Vec3,
  view: GripView
): SolidPrimitive | null {
  const role = grip.role
  // Taken and put down where it was: no edit, a point's top arrow standing
  // off the apex included.
  if (offset.x === 0 && offset.y === 0 && offset.z === 0) return primitive
  if (role.kind === "move") {
    return { ...primitive, position: add3(primitive.position, offset) }
  }
  const { x, y, n } = frameOf(primitive)
  if (role.kind === "corner") {
    if (primitive.kind !== "box" && primitive.kind !== "wedge") return null
    const dx = dot3(offset, x) * role.x
    const dy = dot3(offset, y) * role.y
    const length = primitive.length + dx
    const width = primitive.width + dy
    if (!(length > 0 && width > 0)) return null
    return {
      ...primitive,
      length,
      width,
      position: add3(
        primitive.position,
        add3(scale3(x, (role.x * dx) / 2), scale3(y, (role.y * dy) / 2))
      ),
    }
  }
  const along = grip.along!
  let by = travel(offset, along, view.direction, !readsInPlane(primitive, role))
  if (role.kind === "top" && "height" in primitive) {
    // From where the arrow stands: a point's, off the apex, counts its
    // stand-off (g01: a cone dragged 2 out from it gets a top of 2.15).
    const top = add3(primitive.position, scale3(n, primitive.height))
    by += dot3(sub3(grip.at, top), along) - solidGripReading(primitive, role)!
  }
  return solidGripSized(primitive, grip, by, false)
}

/**
 * What the arrow's box reads: how far it has gone and the size it sets
 * (g01: a box's height dragged shows `2.6481` and `7.6481`), null on a square.
 */
export function solidGripReading(
  primitive: SolidPrimitive,
  role: SolidGripRole
): number | null {
  switch (role.kind) {
    case "move":
    case "corner":
      return null
    case "side":
      if (primitive.kind !== "box" && primitive.kind !== "wedge") return null
      return role.axis === "x" ? primitive.length : primitive.width
    case "height":
      return "height" in primitive ? primitive.height : null
    case "polygon":
      if (primitive.kind !== "pyramid") return null
      return role.index % 2 === 0
        ? primitive.radius
        : primitive.radius * Math.cos(Math.PI / primitive.sides)
    case "top":
      if (primitive.kind === "pyramid") {
        return primitive.topRadius * Math.cos(Math.PI / primitive.sides)
      }
      if (primitive.kind !== "cone") return null
      return (
        (primitive.topRadius /
          Math.max(primitive.radius, primitive.radiusY ?? primitive.radius)) *
        primitive.radius
      )
    case "quadrant":
      if (primitive.kind === "sphere") return primitive.radius
      if (primitive.kind !== "cylinder" && primitive.kind !== "cone")
        return null
      return role.axis === "x"
        ? primitive.radius
        : (primitive.radiusY ?? primitive.radius)
    case "ring":
      return primitive.kind === "torus" ? Math.abs(primitive.radius) : null
    case "tube":
      return primitive.kind === "torus" ? primitive.tubeRadius : null
  }
}

/**
 * The primitive with the arrow's size moved `by` (a drag, or the first box
 * typed), or set to it when `total` (the second box, Tab's); null where
 * AutoCAD leaves it (g01).
 */
export function solidGripSized(
  primitive: SolidPrimitive,
  grip: SolidGrip,
  by: number,
  total: boolean
): SolidPrimitive | null {
  const role = grip.role
  const was = solidGripReading(primitive, role)
  if (was === null) return null
  const size = total ? by : was + by
  const delta = size - was
  const { x, y, n } = frameOf(primitive)
  const shift = (v: Vec3, k: number) => add3(primitive.position, scale3(v, k))
  switch (role.kind) {
    case "side": {
      if (primitive.kind !== "box" && primitive.kind !== "wedge") return null
      if (!(size > 0)) return null
      const axis = role.axis === "x" ? x : y
      return {
        ...primitive,
        ...(role.axis === "x" ? { length: size } : { width: size }),
        position: shift(axis, (role.sign * delta) / 2),
      }
    }
    case "height": {
      if (!("height" in primitive) || !(size > 0)) return null
      return role.end === "top"
        ? { ...primitive, height: size }
        : { ...primitive, height: size, position: shift(n, -delta) }
    }
    case "polygon": {
      if (primitive.kind !== "pyramid" || !(size > 0)) return null
      const radius =
        role.index % 2 === 0 ? size : size / Math.cos(Math.PI / primitive.sides)
      return { ...primitive, radius }
    }
    case "top": {
      if (!(size >= 0)) return null
      if (primitive.kind === "pyramid") {
        return {
          ...primitive,
          topRadius: size / Math.cos(Math.PI / primitive.sides),
        }
      }
      if (primitive.kind !== "cone") return null
      const rx = primitive.radius
      const ry = primitive.radiusY ?? rx
      return { ...primitive, topRadius: (size / rx) * Math.max(rx, ry) }
    }
    case "quadrant": {
      if (!(size > 0)) return null
      if (primitive.kind === "sphere") return { ...primitive, radius: size }
      if (primitive.kind !== "cylinder" && primitive.kind !== "cone")
        return null
      if (primitive.radiusY === undefined) {
        // A round base is one radius: a cone's top keeps its own.
        return { ...primitive, radius: size }
      }
      return role.axis === "x"
        ? { ...primitive, radius: size }
        : { ...primitive, radiusY: size }
    }
    case "ring": {
      if (primitive.kind !== "torus" || !(size > 0)) return null
      const radius = Math.sign(primitive.radius) * size
      if (radius < 0 && !(primitive.tubeRadius > size)) return null
      return { ...primitive, radius }
    }
    case "tube": {
      if (primitive.kind !== "torus" || !(size > 0)) return null
      if (primitive.radius < 0 && !(size > -primitive.radius)) return null
      return { ...primitive, tubeRadius: size }
    }
    default:
      return null
  }
}

/** A primitive's Geometry rows the palette retypes (solid/g01). */
export type SolidProperty =
  | "solidLength"
  | "solidWidth"
  | "solidHeight"
  | "baseRadius"
  | "topRadius"
  | "sides"
  | "radius"
  | "diameter"
  | "majorRadius"
  | "minorRadius"
  | "baseMajorRadius"
  | "baseMinorRadius"
  | "topMajorRadius"
  | "topMinorRadius"
  | "torusRadius"
  | "tubeRadius"

/** Most sides PYRAMID makes, and fewest (`Requires an integer between 3 and 32.`). */
const MIN_SIDES = 3
const MAX_SIDES = 32

/**
 * The primitive with one Geometry row retyped, as AutoCAD's palette takes it
 * (solid/g01), or null for a value it refuses and leaves: a size of 0 or
 * less (a cone's or a pyramid's top may be 0, a point), sides past 3 to 32,
 * a lemon's tube no wider than its ring. A negative height turns the solid
 * over its base (Height -3 makes `Normal: 0,0,-1` and 3). A pyramid's radii
 * are its Type's, its sides kept on the circle of its corners.
 */
export function primitiveRetyped(
  primitive: SolidPrimitive,
  property: SolidProperty,
  value: number
): SolidPrimitive | null {
  if (!Number.isFinite(value)) return null
  if (property === "solidHeight") {
    if (!("height" in primitive) || value === 0) return null
    return value > 0
      ? { ...primitive, height: value }
      : {
          ...primitive,
          height: -value,
          normal: scale3(primitive.normal, -1),
        }
  }
  switch (primitive.kind) {
    case "box":
    case "wedge":
      if (!(value > 0)) return null
      if (property === "solidLength") return { ...primitive, length: value }
      if (property === "solidWidth") return { ...primitive, width: value }
      return null
    case "pyramid": {
      const across = Math.cos(Math.PI / primitive.sides)
      const corner = (r: number) => (primitive.inscribed ? r : r / across)
      if (property === "baseRadius") {
        return value > 0 ? { ...primitive, radius: corner(value) } : null
      }
      if (property === "topRadius") {
        return value >= 0 ? { ...primitive, topRadius: corner(value) } : null
      }
      if (property === "sides") {
        const sides = value
        if (!Number.isInteger(sides) || sides < MIN_SIDES || sides > MAX_SIDES)
          return null
        return { ...primitive, sides }
      }
      return null
    }
    case "cylinder":
    case "cone": {
      const rx = primitive.radius
      const ry = primitive.radiusY
      if (ry === undefined) {
        if (property === "radius" || property === "baseRadius") {
          return value > 0 ? { ...primitive, radius: value } : null
        }
        if (property === "topRadius" && primitive.kind === "cone") {
          return value >= 0 ? { ...primitive, topRadius: value } : null
        }
        return null
      }
      const major = Math.max(rx, ry)
      const minor = Math.min(rx, ry)
      // The larger axis is the major, along X or across.
      const set = (axis: "major" | "minor", r: number) =>
        (axis === "major") === rx >= ry
          ? { ...primitive, radius: r }
          : { ...primitive, radiusY: r }
      switch (property) {
        case "majorRadius":
        case "baseMajorRadius":
          return value > 0 ? set("major", value) : null
        case "minorRadius":
        case "baseMinorRadius":
          return value > 0 ? set("minor", value) : null
        case "topMajorRadius":
          return primitive.kind === "cone" && value >= 0
            ? { ...primitive, topRadius: value }
            : null
        case "topMinorRadius":
          return primitive.kind === "cone" && value >= 0
            ? { ...primitive, topRadius: (value * major) / minor }
            : null
        default:
          return null
      }
    }
    case "sphere":
      if (!(value > 0)) return null
      if (property === "radius") return { ...primitive, radius: value }
      if (property === "diameter") return { ...primitive, radius: value / 2 }
      return null
    case "torus":
      if (property === "torusRadius") {
        if (value === 0) return null
        if (value < 0 && !(primitive.tubeRadius > -value)) return null
        return { ...primitive, radius: value }
      }
      if (property === "tubeRadius") {
        if (!(value > 0)) return null
        if (primitive.radius < 0 && !(value > -primitive.radius)) return null
        return { ...primitive, tubeRadius: value }
      }
      return null
  }
}
