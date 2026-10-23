/**
 * Linetypes give geometry a dash pattern ("Continuous", "Dashed", "Center", …)
 * exactly the way {@link Layer} colours give it a colour. A layer carries a
 * default linetype (an entity's "ByLayer" appearance) and an entity may
 * override it with its own ("ByObject").
 *
 * A pattern is a list of dash/gap lengths in *world units* (positive = dash,
 * the next = gap, alternating), matching AutoCAD's linetype definition. The
 * global `ltScale` (AutoCAD's LTSCALE) multiplies every length so the same
 * pattern reads well at any drawing size. `Continuous` has an empty pattern
 * (solid).
 */

export type LinetypeId = string

export interface LinetypeDef {
  /** The name a drawing stores, and the key of its display name. */
  readonly id: LinetypeId
  /** Dash/gap run lengths in world units; empty means a solid line. */
  readonly pattern: readonly number[]
}

/** The always-present solid linetype, matching AutoCAD's `Continuous`. */
export const DEFAULT_LINETYPE_ID: LinetypeId = "Continuous"

/**
 * The sentinel an entity's linetype picker uses for "inherit the layer's
 * linetype" — AutoCAD's ByLayer. An entity stores no `linetype` field in that
 * case; this value only ever travels through the UI/engine API.
 */
export const LINETYPE_BYLAYER = "ByLayer"

/**
 * The built-in linetypes, in the order shown by the pickers. Each is
 * acadiso.lin's, the file a metric drawing (MEASUREMENT 1) loads from: probe
 * line/p202 reads them back with `tblsearch`. A dash of 0 is a dot. WHY all
 * six loaded in every drawing, where AutoCAD's new one holds Continuous alone
 * (properties/p221) and loads the rest from the file: there is no Load option
 * or Linetype Manager here to load one.
 */
export const LINETYPES: readonly LinetypeDef[] = [
  { id: "Continuous", pattern: [] },
  // *DASHED,Dashed __ __ __ __ __ __ __ __ __ __ __ __ __ _
  // A, 12.7, -6.35
  { id: "Dashed", pattern: [12.7, 6.35] },
  // *HIDDEN,Hidden __ __ __ __ __ __ __ __ __ __ __ __ __ __
  // A, 6.35, -3.175
  { id: "Hidden", pattern: [6.35, 3.175] },
  // *CENTER,Center ____ _ ____ _ ____ _ ____ _ ____ _ ____
  // A, 31.75, -6.35, 6.35, -6.35
  { id: "Center", pattern: [31.75, 6.35, 6.35, 6.35] },
  // *PHANTOM,Phantom ______  __  __  ______  __  __  ______
  // A, 31.75, -6.35, 6.35, -6.35, 6.35, -6.35
  { id: "Phantom", pattern: [31.75, 6.35, 6.35, 6.35, 6.35, 6.35] },
  // *DASHDOT,Dash dot __ . __ . __ . __ . __ . __ . __ . __
  // A, 12.7, -6.35, 0, -6.35
  { id: "DashDot", pattern: [12.7, 6.35, 0, 6.35] },
]

const BY_ID = new Map<LinetypeId, LinetypeDef>(LINETYPES.map((l) => [l.id, l]))

/** The dash/gap pattern for a linetype id (world units); `[]` when unknown/solid. */
export function linetypePattern(id: LinetypeId): readonly number[] {
  return BY_ID.get(id)?.pattern ?? []
}

/**
 * How a pattern lies along a straight run of `length`, as AutoCAD lays a
 * line's: centred, so it begins and ends on a dash of the same length. With
 * `m` whole periods in the length each end dash is `(length − m·period +
 * first dash) / 2` (probe line/p207, five lines measured on the plot), which
 * may be longer than the pattern's first dash. A run shorter than one period
 * is drawn solid: `null`. Lengths are in the pattern's units.
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
