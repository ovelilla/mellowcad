import { Vec2 } from "../geometry/Vec2"

/**
 * Hatch patterns, modelled exactly as AutoCAD's `.pat` files define them
 * (acad.pat / acadiso.pat). A pattern is a header plus one or more *descriptor
 * lines*:
 *
 * ```
 * *pattern-name, description
 * angle, x-origin,y-origin, delta-x,delta-y, dash-1,dash-2, …
 * ```
 *
 * Each descriptor line is the first member of an **infinite family of parallel
 * lines**: `delta-y` is the spacing measured perpendicular to them, `delta-x`
 * the displacement between members *along* the line (which only matters to a
 * dashed pattern, where it slides the dash phase). A dash run is pen-down when
 * positive and pen-up when negative, cycling from the line's own origin.
 *
 * SOLID is not a line family at all — AutoCAD lists it beside the predefined
 * patterns as a separate fill type — so it carries no descriptor lines and is
 * recognised by {@link isSolidHatchPattern}.
 *
 * Adding a pattern is adding data here: transcribe its `.pat` definition, with
 * the angle converted to radians (this layer's convention).
 */

export type HatchPatternId = string

/** One descriptor line of a pattern: an infinite family of parallel lines. */
export interface HatchPatternLine {
  /** Direction of the family, radians CCW from +X (`.pat` states degrees). */
  readonly angle: number
  /** Base point of the first member, in pattern units. */
  readonly origin: Vec2
  /** Displacement between members *along* the line; only dashes see it. */
  readonly deltaX: number
  /** Spacing between members, measured perpendicular to them. Never zero. */
  readonly deltaY: number
  /**
   * Dash runs in pattern units: positive draws, negative skips. Empty means a
   * continuous line. A `0` (AutoCAD's dot) is not modelled — no pattern shipped
   * here uses one, and a zero-length run needs a round cap to be visible.
   */
  readonly dashes: readonly number[]
}

export interface HatchPatternDef {
  /** The `.pat` name, which a drawing stores; its display name and its `?`
   * description are the engine catalog's. */
  readonly id: HatchPatternId
  readonly lines: readonly HatchPatternLine[]
}

/** The solid fill, which is a fill rather than a line family. */
export const SOLID_HATCH_PATTERN_ID: HatchPatternId = "SOLID"

/**
 * HPNAME's initial value. AutoCAD ships `ANSI31` (imperial) or `ANGLE`
 * (metric), and these units are millimetres — but ANGLE is not one of the
 * patterns shipped here, and ANSI31 is the one whose `.pat` definition Autodesk
 * documents literally, so it is the default until more patterns land.
 */
export const DEFAULT_HATCH_PATTERN_ID: HatchPatternId = "ANSI31"

/** HPSCALE's initial value. */
export const DEFAULT_HATCH_SCALE = 1

/** HPANG's initial value (radians). */
export const DEFAULT_HATCH_ANGLE = 0

export const HATCH_PATTERNS: readonly HatchPatternDef[] = [
  {
    id: SOLID_HATCH_PATTERN_ID,
    lines: [],
  },
  {
    // *ANSI31, ANSI Iron, Brick, Stone masonry
    // 45, 0,0, 0,.125
    id: "ANSI31",
    lines: [
      {
        angle: Math.PI / 4,
        origin: { x: 0, y: 0 },
        deltaX: 0,
        deltaY: 0.125,
        dashes: [],
      },
    ],
  },
]

const BY_ID = new Map<HatchPatternId, HatchPatternDef>(
  HATCH_PATTERNS.map((pattern) => [pattern.id, pattern])
)

export function hatchPattern(id: HatchPatternId): HatchPatternDef | undefined {
  return BY_ID.get(id)
}

/**
 * The descriptor lines of a pattern. An unknown name yields none, so a drawing
 * referring to a pattern this build does not ship still opens — it just draws
 * its boundary and no fill.
 */
export function hatchPatternLines(
  id: HatchPatternId
): readonly HatchPatternLine[] {
  return BY_ID.get(id)?.lines ?? []
}

export function isSolidHatchPattern(id: HatchPatternId): boolean {
  return id === SOLID_HATCH_PATTERN_ID
}

/**
 * Matches a typed pattern name against the registry, case-insensitively as
 * AutoCAD does, returning its canonical id or `null`.
 */
export function resolveHatchPatternId(name: string): HatchPatternId | null {
  const wanted = name.trim().toUpperCase()
  for (const pattern of HATCH_PATTERNS) {
    if (pattern.id.toUpperCase() === wanted) return pattern.id
  }
  return null
}
