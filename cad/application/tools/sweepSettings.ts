/**
 * What EXTRUDE and REVOLVE keep between runs: DELOBJ (3 at first: the
 * profiles a solid was made of are erased; 0 keeps them; a negative value
 * asks, extrude/x07), the last answer to that question (`<Yes>` at first,
 * then what was answered) and EXTRUDE's last taper (degrees, x01, x03,
 * sweeps/p129), only the default its prompt offers: a run tapers only when
 * Taper angle is answered (p335, p336). SOLIDEDIT's extrusion offers and
 * sets the same taper (solid-edits/p372, p373). EXTRUDE's height is the
 * primitives' (`SolidDefaults.height`). DELOBJ and the taper are the
 * program's, kept across OPEN, never saved (p149). REVOLVE keeps no angle:
 * its `<360>` and `<0.0>` never change (sweeps/p223, revolve/r02).
 */
export interface SweepSettings {
  delobj: number
  erase: boolean
  taper: number
}

export function sweepSettings(): SweepSettings {
  return { delobj: 3, erase: true, taper: 0 }
}
