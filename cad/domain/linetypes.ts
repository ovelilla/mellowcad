/**
 * Linetypes give geometry a dash pattern exactly the way {@link Layer} colours
 * give it a colour. A layer carries a default linetype (an entity's "ByLayer"
 * appearance) and an entity may override it with its own ("ByObject").
 *
 * A drawing holds its own linetypes, a table as AutoCAD's LTYPE table: each
 * named, with its description and its pattern as AutoCAD defines one, a list
 * of lengths in drawing units (a dash positive, a gap negative, a dot 0),
 * and the text or shapes a complex linetype draws in it. LTSCALE and an
 * object's own linetype scale multiply every length. `Continuous` has an
 * empty pattern (solid).
 */

/** A linetype's name: what an object, a layer and CELTYPE store. */
export type LinetypeId = string

interface ElementPlacement {
  /** The dash or gap of the pattern at whose end the element stands. */
  readonly index: number
  /** S: its size in drawing units, as the pattern's lengths are scaled. */
  readonly scale: number
  /** R, A or U, in radians: relative to the line, absolute, or upright. */
  readonly rotation: number
  readonly rotationMode: "relative" | "absolute" | "upright"
  /** X and Y: along the line and across it, in drawing units. */
  readonly offset: { readonly x: number; readonly y: number }
}

/** Text a complex linetype draws (`GAS_LINE`'s `GAS`), in a text style of the drawing. */
export interface LinetypeText extends ElementPlacement {
  readonly kind: "text"
  readonly text: string
  /** The text style's name. */
  readonly style: string
}

/** A shape a complex linetype draws, by its number in a shape file (`ltypeshp.shx`). */
export interface LinetypeShape extends ElementPlacement {
  readonly kind: "shape"
  readonly shape: number
  readonly shapeFile: string
}

export type LinetypeElement = LinetypeText | LinetypeShape

export interface Linetype {
  /** The identity, case-blind (`dashed` is `DASHED`). */
  readonly name: LinetypeId
  /** At most {@link MAX_LINETYPE_DESCRIPTION} characters. */
  readonly description: string
  /** AutoCAD's lengths: a dash > 0, a gap < 0, a dot 0. Empty is solid. */
  readonly pattern: readonly number[]
  readonly elements?: readonly LinetypeElement[]
}

/**
 * AutoCAD keeps a description's first 47 characters ("Linetype descriptions
 * cannot exceed 47 characters"): `Batting SSS…` loads cut there (ltype/p06).
 */
export const MAX_LINETYPE_DESCRIPTION = 47

/** The always-present solid linetype, matching AutoCAD's `Continuous`. */
export const DEFAULT_LINETYPE_ID: LinetypeId = "Continuous"

/**
 * The sentinel an entity's linetype picker uses for "inherit the layer's
 * linetype" — AutoCAD's ByLayer. An entity stores no `linetype` field in that
 * case; this value only ever travels through the UI/engine API.
 */
export const LINETYPE_BYLAYER = "ByLayer"

/** A drawing's linetypes by name, as the scene and the queries look one up. */
export type LinetypeLookup = (name: LinetypeId) => Linetype | undefined

/** Whether two names are one linetype: AutoCAD's table names are case-blind. */
export function sameLinetypeName(a: string, b: string): boolean {
  return a.toUpperCase() === b.toUpperCase()
}

/** The linetype named `name` in `linetypes`, any case. */
export function linetypeNamed(
  linetypes: readonly Linetype[],
  name: string
): Linetype | undefined {
  return linetypes.find((linetype) => sameLinetypeName(linetype.name, name))
}

/** Continuous, the one linetype a new AutoCAD drawing holds (properties/p221). */
export const CONTINUOUS: Linetype = {
  name: DEFAULT_LINETYPE_ID,
  description: "Solid line",
  pattern: [],
}

/**
 * The linetypes every drawing holds: Continuous and five of acadiso.lin, the
 * file a metric drawing (MEASUREMENT 1) loads from (probe line/p202 reads them
 * back with `tblsearch`), in the order the pickers showed them before the
 * table was the drawing's. WHY all six, where AutoCAD's new drawing holds
 * Continuous alone (properties/p221) and loads the rest when asked: the
 * ribbon's, the layer palette's and the Properties palette's drop-downs have
 * no Other… here (the Linetype Manager, where AutoCAD loads one from a
 * picker, does not exist), so a linetype must be in the drawing to be picked
 * there; -LINETYPE's Load and Set load the others.
 */
export const LINETYPES: readonly Linetype[] = [
  CONTINUOUS,
  // *DASHED,Dashed __ __ __ __ __ __ __ __ __ __ __ __ __ _
  // A, 12.7, -6.35
  {
    name: "DASHED",
    description: "Dashed __ __ __ __ __ __ __ __ __ __ __ __ __ _",
    pattern: [12.7, -6.35],
  },
  // *HIDDEN,Hidden __ __ __ __ __ __ __ __ __ __ __ __ __ __
  // A, 6.35, -3.175
  {
    name: "HIDDEN",
    description: "Hidden __ __ __ __ __ __ __ __ __ __ __ __ __ _",
    pattern: [6.35, -3.175],
  },
  // *CENTER,Center ____ _ ____ _ ____ _ ____ _ ____ _ ____
  // A, 31.75, -6.35, 6.35, -6.35
  {
    name: "CENTER",
    description: "Center ____ _ ____ _ ____ _ ____ _ ____ _ ____",
    pattern: [31.75, -6.35, 6.35, -6.35],
  },
  // *PHANTOM,Phantom ______  __  __  ______  __  __  ______
  // A, 31.75, -6.35, 6.35, -6.35, 6.35, -6.35
  {
    name: "PHANTOM",
    description: "Phantom ______  __  __  ______  __  __  ______",
    pattern: [31.75, -6.35, 6.35, -6.35, 6.35, -6.35],
  },
  // *DASHDOT,Dash dot __ . __ . __ . __ . __ . __ . __ . __
  // A, 12.7, -6.35, 0, -6.35
  {
    name: "DASHDOT",
    description: "Dash dot __ . __ . __ . __ . __ . __ . __ . __",
    pattern: [12.7, -6.35, 0, -6.35],
  },
]

/**
 * A pattern as a stroke lays it: runs alternating dash and gap, a dash first,
 * every run positive (a dot a dash of 0). AutoCAD's own may run two dashes or
 * two gaps together where a complex linetype's text or shape stands
 * (`GAS_LINE`'s `-5.08, -6.35`): they are one run here, and one ending on a
 * dash (`FENCELINE1`'s `25.4`) ends on a gap of 0, so the next period's first
 * dash still starts it. A pattern with no gap is solid, `[]`. One starting on
 * a gap, which AutoCAD's A alignment does not allow, starts on a dash of 0.
 */
export function linetypeDashes(pattern: readonly number[]): number[] {
  const runs: number[] = []
  for (const length of pattern) {
    if (!Number.isFinite(length)) return []
    const gap = length < 0
    if (runs.length === 0 && gap) runs.push(0)
    // Even runs are dashes, so an odd count ends on one.
    const afterDash = runs.length % 2 === 1
    if (runs.length > 0 && gap !== afterDash) {
      runs[runs.length - 1] += Math.abs(length)
    } else {
      runs.push(Math.abs(length))
    }
  }
  if (runs.length % 2 === 1) runs.push(0)
  const gaps = runs.reduce((sum, run, i) => (i % 2 === 1 ? sum + run : sum), 0)
  return gaps > 0 ? runs : []
}

/** Every length of `linetype` times `factor`: its definition in other units. */
export function scaledLinetype(linetype: Linetype, factor: number): Linetype {
  return {
    ...linetype,
    pattern: linetype.pattern.map((length) => length * factor),
    ...(linetype.elements && {
      elements: linetype.elements.map((element) => ({
        ...element,
        scale: element.scale * factor,
        offset: { x: element.offset.x * factor, y: element.offset.y * factor },
      })),
    }),
  }
}

/**
 * How a pattern lies along a straight run of `length`, as AutoCAD lays a
 * line's: centred, so it begins and ends on a dash of the same length. With
 * `m` whole periods in the length each end dash is `(length − m·period +
 * first dash) / 2` (probe line/p207, five lines measured on the plot), which
 * may be longer than the pattern's first dash. A run shorter than one period
 * is drawn solid: `null`. Lengths are in the pattern's units; `pattern` is
 * runs as {@link linetypeDashes} gives them.
 *
 * `offset` is how far into the pattern the run starts (a canvas's
 * `lineDashOffset`); `lead` is how much solid comes before the pattern starts
 * and after it ends, when an end dash outgrows the first dash.
 */
export function centredPattern(
  pattern: readonly number[],
  length: number
): { readonly offset: number; readonly lead: number } | null {
  const period = pattern.reduce((sum, run) => sum + run, 0)
  if (pattern.length === 0 || !(period > 0)) return null
  // The tolerance keeps a length of exactly m periods from reading m − 1.
  const periods = Math.floor(length / period + 1e-9)
  if (periods < 1) return null
  const first = pattern[0]
  const end = (length - periods * period + first) / 2
  return end <= first
    ? { offset: first - end, lead: 0 }
    : { offset: 0, lead: end - first }
}

/**
 * How a pattern lies round a closed curve of `length`, as AutoCAD lays a
 * circle's: from its start, a dash first, stretched to `periods` whole
 * periods, `max(2, round(length / period))` of them (probes circle/p230–p232,
 * measured on the plot). A curve shorter than one period is drawn solid:
 * `null`. `runs` is the pattern stretched, in the pattern's units.
 */
export function loopPattern(
  pattern: readonly number[],
  length: number
): { readonly runs: readonly number[]; readonly periods: number } | null {
  const period = pattern.reduce((sum, run) => sum + run, 0)
  if (pattern.length === 0 || !(period > 0)) return null
  const ratio = length / period
  // The tolerance keeps a length of exactly one period from reading solid.
  if (ratio < 1 - 1e-9) return null
  const periods = Math.max(2, Math.round(ratio))
  const stretch = length / (periods * period)
  return { runs: pattern.map((run) => run * stretch), periods }
}
