/**
 * What EXTRUDE and REVOLVE keep between runs: DELOBJ (3 at first: the
 * profiles a solid was made of are erased; 0 keeps them; a negative value
 * asks, extrude/x07), the last answer to that question (`<Yes>` at first,
 * then what was answered), EXTRUDE's last height and taper (degrees, x01,
 * x03) and REVOLVE's last angle. DELOBJ is the program's, the rest per
 * drawing and not saved (**unverified**: no OPEN probe).
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
