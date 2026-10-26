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
 * Adding a pattern is adding data here: transcribe its `.pat` definition
 * through `family`, which turns the angle to radians (this layer's
 * convention).
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
   * Dash runs in pattern units: positive draws, negative skips, `0` is a dot.
   * Empty means a continuous line.
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
 * HPNAME's initial value: a metric drawing (MEASUREMENT 1) starts on ANGLE
 * (probe hatch/p00).
 */
export const DEFAULT_HATCH_PATTERN_ID: HatchPatternId = "ANGLE"

/** HPSCALE's initial value. */
export const DEFAULT_HATCH_SCALE = 1

/** HPANG's initial value (radians). */
export const DEFAULT_HATCH_ANGLE = 0

/** One `.pat` descriptor line as it is written, its angle in degrees. */
function family(
  angle: number,
  x: number,
  y: number,
  deltaX: number,
  deltaY: number,
  ...dashes: number[]
): HatchPatternLine {
  return {
    angle: (angle * Math.PI) / 180,
    origin: { x, y },
    deltaX,
    deltaY,
    dashes,
  }
}

function pattern(
  id: HatchPatternId,
  ...lines: HatchPatternLine[]
): HatchPatternDef {
  return { id, lines }
}

/**
 * The patterns of acadiso.pat, the file a metric drawing reads (AutoCAD 2027,
 * `R26.0/enu/Support`), each `.pat` line quoted beside its data; generated
 * from them line for line they draw what EXPLODE leaves of AutoCAD's hatch
 * (probes hatch/p300–p307). The file's other ~60 patterns are not shipped.
 * In the file's order, which `?` lists them in (p221).
 */
export const HATCH_PATTERNS: readonly HatchPatternDef[] = [
  // *SOLID, Solid fill
  // 45, 0,0, 0,.125
  // A fill: its descriptor line is never drawn.
  pattern("SOLID"),
  // *ANGLE,Angle steel
  pattern(
    "ANGLE",
    // 0, 0, 0, 0, 6.985, 5.08, -1.905
    family(0, 0, 0, 0, 6.985, 5.08, -1.905),
    // 90, 0, 0, 0, 6.985, 5.08, -1.905
    family(90, 0, 0, 0, 6.985, 5.08, -1.905)
  ),
  // *ANSI31,ANSI Iron, Brick, Stone masonry
  pattern(
    "ANSI31",
    // 45, 0, 0, 0, 3.175
    family(45, 0, 0, 0, 3.175)
  ),
  // *ANSI32,ANSI Steel
  pattern(
    "ANSI32",
    // 45, 0, 0, 0, 9.525
    family(45, 0, 0, 0, 9.525),
    // 45, 4.49013, 0, 0, 9.525
    family(45, 4.49013, 0, 0, 9.525)
  ),
  // *ANSI33,ANSI Bronze, Brass, Copper
  pattern(
    "ANSI33",
    // 45, 0, 0, 0, 6.35
    family(45, 0, 0, 0, 6.35),
    // 45, 4.49013, 0, 0, 6.35, 3.175, -1.5875
    family(45, 4.49013, 0, 0, 6.35, 3.175, -1.5875)
  ),
  // *ANSI34,ANSI Plastic, Rubber
  pattern(
    "ANSI34",
    // 45, 0, 0, 0, 19.05
    family(45, 0, 0, 0, 19.05),
    // 45, 4.49013, 0, 0, 19.05
    family(45, 4.49013, 0, 0, 19.05),
    // 45, 8.98026, 0, 0, 19.05
    family(45, 8.98026, 0, 0, 19.05),
    // 45, 13.4704, 0, 0, 19.05
    family(45, 13.4704, 0, 0, 19.05)
  ),
  // *ANSI35,ANSI Fire brick, Refractory material
  pattern(
    "ANSI35",
    // 45, 0, 0, 0, 6.35
    family(45, 0, 0, 0, 6.35),
    // 45, 4.49013, 0, 0, 6.35, 7.9375, -1.5875, 0, -1.5875
    family(45, 4.49013, 0, 0, 6.35, 7.9375, -1.5875, 0, -1.5875)
  ),
  // *ANSI36,ANSI Marble, Slate, Glass
  pattern(
    "ANSI36",
    // 45, 0, 0, 5.55625, 3.175, 7.9375, -1.5875, 0, -1.5875
    family(45, 0, 0, 5.55625, 3.175, 7.9375, -1.5875, 0, -1.5875)
  ),
  // *ANSI37,ANSI Lead, Zinc, Magnesium, Sound/Heat/Elec Insulation
  pattern(
    "ANSI37",
    // 45, 0, 0, 0, 3.175
    family(45, 0, 0, 0, 3.175),
    // 135, 0, 0, 0, 3.175
    family(135, 0, 0, 0, 3.175)
  ),
  // *ANSI38,ANSI Aluminum
  pattern(
    "ANSI38",
    // 45, 0, 0, 0, 3.175
    family(45, 0, 0, 0, 3.175),
    // 135, 0, 0, 6.35, 3.175, 7.9375, -4.7625
    family(135, 0, 0, 6.35, 3.175, 7.9375, -4.7625)
  ),
  // *AR-CONC, random dot and stone pattern
  pattern(
    "AR-CONC",
    // 50, 0, 0, 104.896, -149.807, 19.05, -209.55
    family(50, 0, 0, 104.896, -149.807, 19.05, -209.55),
    // 355, 0, 0, -51.76101082,187.25814969, 15.24, -167.64058417
    family(355, 0, 0, -51.76101082, 187.25814969, 15.24, -167.64058417),
    // 100.4514447,15.182007,-1.3282535,145.5569059,-176.270089,16.1900088,-178.0902446
    family(
      100.4514447,
      15.182007,
      -1.3282535,
      145.5569059,
      -176.270089,
      16.1900088,
      -178.0902446
    ),
    // 46.1842, 0, 50.8, 157.343, -224.71, 28.575, -314.325
    family(46.1842, 0, 50.8, 157.343, -224.71, 28.575, -314.325),
    // 96.63555761,22.5899,47.2965,218.33577212,-264.40480444,24.28502314,-267.13560816
    family(
      96.63555761,
      22.5899,
      47.2965,
      218.33577212,
      -264.40480444,
      24.28502314,
      -267.13560816
    ),
    // 351.18415117,0,50.8,196.67912063,280.88740361,22.85996707,-251.45973192
    family(
      351.18415117,
      0,
      50.8,
      196.67912063,
      280.88740361,
      22.85996707,
      -251.45973192
    ),
    // 21, 25.4, 38.1, 104.89565868, -149.80652586, 19.05, -209.55
    family(21, 25.4, 38.1, 104.89565868, -149.80652586, 19.05, -209.55),
    // 326, 25.4, 38.1, -51.7604, 187.258, 15.24, -167.64
    family(326, 25.4, 38.1, -51.7604, 187.258, 15.24, -167.64),
    // 71.451445,38.0345326,29.5779001,145.5567546,-176.2700748,16.1900088,-178.0899376
    family(
      71.451445,
      38.0345326,
      29.5779001,
      145.5567546,
      -176.2700748,
      16.1900088,
      -178.0899376
    ),
    // 37.5, 0, 0, 53.9242, 65.2018, 0,        -165.608, 0, -170.18, 0, -168.275
    family(37.5, 0, 0, 53.9242, 65.2018, 0, -165.608, 0, -170.18, 0, -168.275),
    // 7.5, 0, 0, 79.3242, 90.6018, 0, -97.028, 0, -161.798, 0, -64.135
    family(7.5, 0, 0, 79.3242, 90.6018, 0, -97.028, 0, -161.798, 0, -64.135),
    // -32.5, -56.642, 0, 117.434, 68.0212, 0, -63.5, 0, -198.12, 0, -262.89
    family(
      -32.5,
      -56.642,
      0,
      117.434,
      68.0212,
      0,
      -63.5,
      0,
      -198.12,
      0,
      -262.89
    ),
    // -42.5, -82.042, 0, 92.0344, 118.821, 0, -82.55, 0, -131.572, 0, -186.69
    family(
      -42.5,
      -82.042,
      0,
      92.0344,
      118.821,
      0,
      -82.55,
      0,
      -131.572,
      0,
      -186.69
    )
  ),
  // *AR-SAND, random dot pattern
  pattern(
    "AR-SAND",
    // 37.5, 0, 0, 28.5242, 39.8018, 0,        -38.608, 0, -43.18, 0, -41.275
    family(37.5, 0, 0, 28.5242, 39.8018, 0, -38.608, 0, -43.18, 0, -41.275),
    // 7.5, 0, 0, 53.9242, 65.2018, 0, -20.828, 0, -34.798, 0, -13.335
    family(7.5, 0, 0, 53.9242, 65.2018, 0, -20.828, 0, -34.798, 0, -13.335),
    // -32.5, -31.242, 0, 66.6344, 42.6212, 0, -12.7, 0, -45.72, 0, -59.69
    family(-32.5, -31.242, 0, 66.6344, 42.6212, 0, -12.7, 0, -45.72, 0, -59.69),
    // -42.5, -31.242, 0, 41.2344, 68.0212, 0, -6.35, 0, -29.972, 0, -34.29
    family(-42.5, -31.242, 0, 41.2344, 68.0212, 0, -6.35, 0, -29.972, 0, -34.29)
  ),
  // *BRICK,Brick or masonry-type surface
  pattern(
    "BRICK",
    // 0, 0, 0, 0, 6.35
    family(0, 0, 0, 0, 6.35),
    // 90, 0, 0, 0, 12.7, 6.35, -6.35
    family(90, 0, 0, 0, 12.7, 6.35, -6.35),
    // 90, 6.35, 0, 0, 12.7, -6.35, 6.35
    family(90, 6.35, 0, 0, 12.7, -6.35, 6.35)
  ),
  // *CROSS,A series of crosses
  pattern(
    "CROSS",
    // 0, 0, 0, 6.35, 6.35, 3.175, -9.525
    family(0, 0, 0, 6.35, 6.35, 3.175, -9.525),
    // 90, 1.5875, -1.5875, 6.35, 6.35, 3.175, -9.525
    family(90, 1.5875, -1.5875, 6.35, 6.35, 3.175, -9.525)
  ),
  // *DASH,Dashed lines
  pattern(
    "DASH",
    // 0, 0, 0, 3.175, 3.175, 3.175, -3.175
    family(0, 0, 0, 3.175, 3.175, 3.175, -3.175)
  ),
  // *DOTS,A series of dots
  pattern(
    "DOTS",
    // 0, 0, 0, 0.79375, 1.5875, 0, -1.5875
    family(0, 0, 0, 0.79375, 1.5875, 0, -1.5875)
  ),
  // *EARTH,Earth or ground (subterranean)
  pattern(
    "EARTH",
    // 0, 0, 0, 6.35, 6.35, 6.35, -6.35
    family(0, 0, 0, 6.35, 6.35, 6.35, -6.35),
    // 0, 0, 2.38125, 6.35, 6.35, 6.35, -6.35
    family(0, 0, 2.38125, 6.35, 6.35, 6.35, -6.35),
    // 0, 0, 4.7625, 6.35, 6.35, 6.35, -6.35
    family(0, 0, 4.7625, 6.35, 6.35, 6.35, -6.35),
    // 90, 0.79375, 5.55625, 6.35, 6.35, 6.35, -6.35
    family(90, 0.79375, 5.55625, 6.35, 6.35, 6.35, -6.35),
    // 90, 3.175, 5.55625, 6.35, 6.35, 6.35, -6.35
    family(90, 3.175, 5.55625, 6.35, 6.35, 6.35, -6.35),
    // 90, 5.55625, 5.55625, 6.35, 6.35, 6.35, -6.35
    family(90, 5.55625, 5.55625, 6.35, 6.35, 6.35, -6.35)
  ),
  // *HONEY,Honeycomb pattern
  pattern(
    "HONEY",
    // 0, 0, 0, 4.7625, 2.749630645, 3.175, -6.35
    family(0, 0, 0, 4.7625, 2.749630645, 3.175, -6.35),
    // 120, 0, 0, 4.7625, 2.749630645, 3.175, -6.35
    family(120, 0, 0, 4.7625, 2.749630645, 3.175, -6.35),
    // 60, 0, 0, 4.7625, 2.749630645, -6.35, 3.175
    family(60, 0, 0, 4.7625, 2.749630645, -6.35, 3.175)
  ),
  // *LINE,Parallel horizontal lines
  pattern(
    "LINE",
    // 0, 0, 0, 0, 3.175
    family(0, 0, 0, 0, 3.175)
  ),
  // *NET,Horizontal / vertical grid
  pattern(
    "NET",
    // 0, 0, 0, 0, 3.175
    family(0, 0, 0, 0, 3.175),
    // 90, 0, 0, 0, 3.175
    family(90, 0, 0, 0, 3.175)
  ),
  // *NET3,Network pattern 0-60-120
  pattern(
    "NET3",
    // 0, 0, 0, 0, 3.175
    family(0, 0, 0, 0, 3.175),
    // 60, 0, 0, 0, 3.175
    family(60, 0, 0, 0, 3.175),
    // 120, 0, 0, 0, 3.175
    family(120, 0, 0, 0, 3.175)
  ),
  // *SQUARE,Small aligned squares
  pattern(
    "SQUARE",
    // 0, 0, 0, 0, 3.175, 3.175, -3.175
    family(0, 0, 0, 0, 3.175, 3.175, -3.175),
    // 90, 0, 0, 0, 3.175, 3.175, -3.175
    family(90, 0, 0, 0, 3.175, 3.175, -3.175)
  ),
  // *STEEL,Steel material
  pattern(
    "STEEL",
    // 45, 0, 0, 0, 3.175
    family(45, 0, 0, 0, 3.175),
    // 45, 0, 1.5875, 0, 3.175
    family(45, 0, 1.5875, 0, 3.175)
  ),
  // *ZIGZAG,Staircase effect
  pattern(
    "ZIGZAG",
    // 0, 0, 0, 3.175, 3.175, 3.175, -3.175
    family(0, 0, 0, 3.175, 3.175, 3.175, -3.175),
    // 90, 3.175, 0, 3.175, 3.175, 3.175, -3.175
    family(90, 3.175, 0, 3.175, 3.175, 3.175, -3.175)
  ),
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
