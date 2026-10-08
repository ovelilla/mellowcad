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

/**
 * What the object snap menu sends for each snap, as AutoCAD's own menu macros
 * do (`_endp`), and whether the override then asks `of` or `to`: the
 * history reads `Specify first point: _endp of`, `_tan to`. WHY: only
 * `_endp of` is confirmed; the rest follow it and are unverified.
 */
export const OSNAP_MENU_ANSWERS: Readonly<
  Record<SnapType | "none", { readonly macro: string; readonly to: boolean | null }>
> = {
  [SnapType.Endpoint]: { macro: "_endp", to: false },
  [SnapType.Midpoint]: { macro: "_mid", to: false },
  [SnapType.Center]: { macro: "_cen", to: false },
  [SnapType.Quadrant]: { macro: "_qua", to: false },
  [SnapType.Intersection]: { macro: "_int", to: false },
  [SnapType.Extension]: { macro: "_ext", to: false },
  [SnapType.Insertion]: { macro: "_ins", to: false },
  [SnapType.Perpendicular]: { macro: "_per", to: true },
  [SnapType.Tangent]: { macro: "_tan", to: true },
  [SnapType.Nearest]: { macro: "_nea", to: true },
  [SnapType.ApparentIntersection]: { macro: "_appint", to: false },
  [SnapType.Parallel]: { macro: "_par", to: true },
  none: { macro: "_non", to: null },
}

/** The keyword ids of {@link OSNAP_MODES}. */
export const OSNAP_MODE_IDS: readonly string[] = Object.keys(OSNAP_MODES)

/** -OSNAP's other way of saying None: "or enter none or off". */
export const OSNAP_OFF = "OFF"
