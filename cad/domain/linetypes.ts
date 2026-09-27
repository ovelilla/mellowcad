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

/** The built-in linetypes, in the order shown by the pickers. */
export const LINETYPES: readonly LinetypeDef[] = [
  { id: "Continuous", pattern: [] },
  { id: "Dashed", pattern: [8, 5] },
  { id: "Hidden", pattern: [5, 3] },
  { id: "Center", pattern: [20, 4, 4, 4] },
  { id: "Phantom", pattern: [20, 4, 6, 4, 6, 4] },
  { id: "DashDot", pattern: [12, 5, 1, 5] },
]

const BY_ID = new Map<LinetypeId, LinetypeDef>(LINETYPES.map((l) => [l.id, l]))

/** The dash/gap pattern for a linetype id (world units); `[]` when unknown/solid. */
export function linetypePattern(id: LinetypeId): readonly number[] {
  return BY_ID.get(id)?.pattern ?? []
}
