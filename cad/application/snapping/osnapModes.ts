import { SnapType } from "./types"

/**
 * The object snap modes as they are typed — at -OSNAP's list and, one at a
 * time, at any point prompt (END, MID…) — by keyword id, in the order AutoCAD's
 * OSNAP lists them. The capitals are what is typed ("Specify one or more
 * object snap modes by entering the uppercase characters of the name").
 * Geometric Center and Node are not here: neither snap exists yet.
 */
export const OSNAP_MODES: Readonly<Record<string, SnapType | "none">> = {
  ENDpoint: SnapType.Endpoint,
  MIDpoint: SnapType.Midpoint,
  CENter: SnapType.Center,
  QUAdrant: SnapType.Quadrant,
  INTersection: SnapType.Intersection,
  EXTension: SnapType.Extension,
  INSertion: SnapType.Insertion,
  PERpendicular: SnapType.Perpendicular,
  TANgent: SnapType.Tangent,
  NEArest: SnapType.Nearest,
  APParent: SnapType.ApparentIntersection,
  PARallel: SnapType.Parallel,
  NONe: "none",
}

/** The keyword ids of {@link OSNAP_MODES}. */
export const OSNAP_MODE_IDS: readonly string[] = Object.keys(OSNAP_MODES)

/** -OSNAP's other way of saying None: "or enter none or off". */
export const OSNAP_OFF = "OFF"
