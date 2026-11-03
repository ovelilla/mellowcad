/**
 * What EXTRUDE and REVOLVE keep between runs: DELOBJ (3 at first: the
 * profiles a solid was made of are erased; 0 keeps them; a negative value
 * asks, extrude/x07), the last answer to that question (`<Yes>` at first,
 * then what was answered), EXTRUDE's last height, its sign kept, and taper
 * (degrees, x01, x03, sweeps/p129), only the defaults their prompts offer: a
 * run tapers only when Taper angle is answered (p335, p336); and REVOLVE's
 * last angle. DELOBJ, the height and the taper are the program's, kept
 * across OPEN, never saved (p149).
 */
export interface SweepSettings {
  delobj: number
  erase: boolean
  height: number | null
  taper: number
  angle: number
}

export function sweepSettings(): SweepSettings {
  return { delobj: 3, erase: true, height: null, taper: 0, angle: 360 }
}
