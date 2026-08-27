import { Vec2, vec2 } from "../../geometry/Vec2"

/**
 * Parsing of AutoCAD-style coordinate entry — the "classic total precision"
 * method where a point is *typed* instead of picked. Four formats are
 * supported, mirroring AutoCAD's command line / dynamic input:
 *
 * ```
 *   x,y        cartesian   (X and Y)
 *   dist<ang   polar       (distance and angle in degrees, CCW from +X)
 * ```
 *
 * each optionally prefixed to override the reference the point is measured
 * from:
 *
 * ```
 *   @ …   relative to the last point
 *   # …   absolute (from the drawing origin)
 * ```
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
  readonly lastPoint: Vec2 | null
  /**
   * Whether a bare `x,y` / `dist<ang` (no `@`/`#` prefix) is relative to the
   * last point. Dynamic input sets this `true` for the second point onward.
   */
  readonly relativeByDefault: boolean
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
    t.startsWith("@") || t.startsWith("#") || t.includes(",") || t.includes("<")
  )
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
): Vec2 | null {
  let body = text.trim()
  if (body === "") return null

  // A leading @ forces relative, # forces absolute; otherwise use the default.
  let relative = ctx.relativeByDefault
  if (body.startsWith("@")) {
    relative = true
    body = body.slice(1).trim()
  } else if (body.startsWith("#")) {
    relative = false
    body = body.slice(1).trim()
  }
  if (body === "") return null

  // Relative to the last point when requested and available; the first point of
  // a command (no last point) is always absolute.
  const base = relative ? (ctx.lastPoint ?? ORIGIN) : ORIGIN

  if (body.includes("<")) return parsePolar(body, base)
  if (body.includes(",")) return parseCartesian(body, base)
  return null
}

const ORIGIN: Vec2 = { x: 0, y: 0 }

function parseCartesian(body: string, base: Vec2): Vec2 | null {
  const parts = body.split(",")
  if (parts.length !== 2) return null
  const x = parseDecimal(parts[0])
  const y = parseDecimal(parts[1])
  if (x === null || y === null) return null
  return vec2(base.x + x, base.y + y)
}

function parsePolar(body: string, base: Vec2): Vec2 | null {
  const parts = body.split("<")
  if (parts.length !== 2) return null
  const distance = parseDecimal(parts[0])
  const angle = parseDecimal(parts[1])
  if (distance === null || angle === null) return null
  const rad = (angle * Math.PI) / 180
  return vec2(
    base.x + Math.cos(rad) * distance,
    base.y + Math.sin(rad) * distance
  )
}

/**
 * Parses one component of a coordinate. The dot is the sole decimal separator
 * here (see the module note); a comma is never a decimal point in this context.
 * Returns `null` for anything that is not a finite decimal number.
 */
function parseDecimal(text: string): number | null {
  const t = text.trim()
  if (!/^[+-]?(\d+(\.\d*)?|\.\d+)$/.test(t)) return null
  const value = Number(t)
  return Number.isFinite(value) ? value : null
}
