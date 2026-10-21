import { Vec2, vec2 } from "../../geometry/Vec2"
import { Vec3, vec3, zOf } from "../../geometry/Vec3"
import {
  Ucs,
  WORLD_UCS,
  ucsDirectionToWorld,
  ucsPointToWorld,
} from "../../domain/ucs"
import { parseAngleDegrees, parseDecimalNumber } from "../../domain/units"

/**
 * Parsing of AutoCAD-style coordinate entry — the "classic total precision"
 * method where a point is *typed* instead of picked. These formats are
 * supported, mirroring AutoCAD's command line / dynamic input:
 *
 * ```
 *   x,y          cartesian   (X and Y)
 *   x,y,z        cartesian with a Z
 *   dist<ang     polar       (distance and angle in degrees, CCW from +X)
 *   dist<ang,z   cylindrical (polar in the XY plane, then a Z)
 *   dist<ang<b   spherical   (b is the angle up from the XY plane)
 * ```
 *
 * each optionally prefixed to override the reference the point is measured
 * from:
 *
 * ```
 *   @ …   relative to the last point
 *   # …   absolute (from the UCS origin)
 *   * …   in the WCS rather than the UCS (`*x,y`, `@*x,y`)
 * ```
 *
 * A point typed without a Z takes the Z of the plane it is read on: an
 * absolute one the current elevation (ELEV and DIST say so; one conceptual page
 * says the last Z is kept instead), a relative one the last point's, and a `*`
 * one the WCS's XY plane, whatever the UCS and ELEVATION (probes line/p152,
 * p153, p163).
 *
 * When no prefix is given the interpretation depends on the caller: with
 * dynamic input on (our case) the default for the second point onward is
 * *relative*, exactly like AutoCAD's `DYNPICOORDS`. The first point of a
 * command has no "last point", so it is always absolute.
 *
 * ## The decimal-separator decision
 *
 * The comma is the X/Y separator here (`50,100`), so inside a coordinate
 * expression the decimal separator is the dot (`50.5,100`). This is a
 * deliberate, unavoidable trade-off: the same comma cannot simultaneously mean
 * "decimal point" (European `1,5`) and "separate X from Y". AutoCAD resolves it
 * the same way — comma always separates coordinates.
 */

export interface CoordinateContext {
  /**
   * The last placed point, used as the base for relative (`@`) input and for
   * the dynamic-input relative default. `null` when there is no previous point
   * (the first point of a command), which forces absolute interpretation.
   */
  readonly lastPoint: Vec2 | Vec3 | null
  /**
   * Whether a bare `x,y` / `dist<ang` (no `@`/`#` prefix) is relative to the
   * last point. Dynamic input sets this `true` for the second point onward.
   */
  readonly relativeByDefault: boolean
  /** The UCS the numbers are read in; `*` reads them in the WCS instead. */
  readonly ucs: Ucs
  /** ELEVATION: how far above the UCS's XY plane an absolute point without a Z lies. */
  readonly elevation: number
}

/**
 * Whether `text` uses coordinate syntax — an X/Y separator (`,`), a polar
 * separator (`<`), or an explicit relative/absolute prefix (`@`/`#`) — rather
 * than a single value like a distance. Lets a field decide, per keystroke,
 * between direct-distance entry and full coordinate entry.
 */
export function isCoordinateExpression(text: string): boolean {
  const t = text.trim()
  if (t === "") return false
  return (
    t.startsWith("@") ||
    t.startsWith("#") ||
    t.startsWith("*") ||
    t.includes(",") ||
    t.includes("<")
  )
}

/**
 * Whether `text` is a coordinate a 2D point prompt takes from the command
 * line: no Z (cartesian, cylindrical or spherical) and no `*`, which AutoCAD's
 * console refuses there (`2D point or option keyword required.`, probes
 * pline/p18–p20, p137). Text that is no coordinate is not one.
 */
export function isPlanarCoordinate(text: string): boolean {
  if (!isCoordinateExpression(text)) return false
  const body = text.trim().replace(/^[@#]\s*/, "")
  if (body.startsWith("*")) return false
  if (body === "") return true
  const offset = body.includes("<") ? parsePolar(body) : parseCartesian(body)
  return offset?.z === null
}

/**
 * Parses a coordinate expression into a world point, or `null` when the text is
 * empty, malformed or still incomplete (e.g. `"50,"` while the user is typing).
 * A `null` result lets callers keep following the cursor until the value is
 * valid, matching AutoCAD's live preview.
 */
export function parseCoordinate(
  text: string,
  ctx: CoordinateContext
): Vec3 | null {
  let body = text.trim()
  if (body === "") return null

  // A leading @ forces relative, # forces absolute; otherwise use the default.
  let relative = ctx.relativeByDefault
  if (body.startsWith("@")) {
    relative = true
    body = body.slice(1).trim()
    // A bare `@` is the last point itself, AutoCAD's `@0,0`.
    if (body === "" && ctx.lastPoint) {
      return vec3(ctx.lastPoint.x, ctx.lastPoint.y, zOf(ctx.lastPoint))
    }
  } else if (body.startsWith("#")) {
    relative = false
    body = body.slice(1).trim()
  }
  if (body === "") return null
  let ucs = ctx.ucs
  const inWcs = body.startsWith("*")
  if (inWcs) {
    // WHY absolute unless `@` came first: `*x,y` is a WCS point, `@*x,y`
    // the relative form (AutoCAD 2023's console, acc/bz7: BREAK's second
    // point `*50,0` in a turned UCS).
    if (!text.trim().startsWith("@")) relative = false
    ucs = ctx.ucs.wcs ?? WORLD_UCS
    body = body.slice(1).trim()
  }
  if (body === "") return null

  const offset = body.includes("<") ? parsePolar(body) : parseCartesian(body)
  if (!offset) return null

  // Relative to the last point when requested and available; the first point of
  // a command (no last point) is always absolute.
  if (relative && ctx.lastPoint) {
    const step = ucsDirectionToWorld(ucs, { ...offset.xy, z: offset.z ?? 0 })
    return vec3(
      ctx.lastPoint.x + step.x,
      ctx.lastPoint.y + step.y,
      zOf(ctx.lastPoint) + step.z
    )
  }
  return ucsPointToWorld(ucs, {
    ...offset.xy,
    z: offset.z ?? (inWcs ? 0 : ctx.elevation),
  })
}

/** The numbers typed, in the UCS they are read in; `z` is null when omitted. */
interface TypedOffset {
  readonly xy: Vec2
  readonly z: number | null
}

function parseCartesian(body: string): TypedOffset | null {
  const parts = body.split(",")
  if (parts.length !== 2 && parts.length !== 3) return null
  const x = parseDecimalNumber(parts[0])
  const y = parseDecimalNumber(parts[1])
  const z = parts.length === 3 ? parseDecimalNumber(parts[2]) : null
  if (x === null || y === null) return null
  if (parts.length === 3 && z === null) return null
  return { xy: vec2(x, y), z }
}

function parsePolar(body: string): TypedOffset | null {
  const [polar, ...rest] = body.split(",")
  const parts = polar.split("<")
  const cylindrical = rest.length === 1 && parts.length === 2
  const spherical = rest.length === 0 && parts.length === 3
  if (
    !cylindrical &&
    !spherical &&
    !(rest.length === 0 && parts.length === 2)
  ) {
    return null
  }
  const distance = parseDecimalNumber(parts[0])
  const angle = parseAngleDegrees(parts[1])
  if (distance === null || angle === null) return null
  const rad = (angle * Math.PI) / 180
  if (spherical) {
    const rise = parseAngleDegrees(parts[2])
    if (rise === null) return null
    const up = (rise * Math.PI) / 180
    const inPlane = Math.cos(up) * distance
    return {
      xy: vec2(Math.cos(rad) * inPlane, Math.sin(rad) * inPlane),
      z: Math.sin(up) * distance,
    }
  }
  const z = cylindrical ? parseDecimalNumber(rest[0]) : null
  if (cylindrical && z === null) return null
  return {
    xy: vec2(Math.cos(rad) * distance, Math.sin(rad) * distance),
    z,
  }
}
