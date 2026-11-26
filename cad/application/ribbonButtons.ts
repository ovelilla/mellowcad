/**
 * A ribbon button that runs a command of its own rather than a tool, by the
 * host's id for it (`CadEngine.runRibbonButton`): each is acad.cuix's macro
 * or, for a toggle with none, what the desktop's does.
 */
export type RibbonButton =
  | "textStyle"
  | "dimensionStyle"
  | "manageTextStyles"
  | "manageDimensionStyles"
  | "properties"
  | "dimensionUpdate"
  | "ucsIcon"
  | "viewCube"
  | "extrude"
  | "revolve"
  | UcsButton

/** The UCS's buttons, each `^C^C_ucs` and the option it answers. */
export type UcsButton =
  | "ucsWorld"
  | "ucsPrevious"
  | "ucsOrigin"
  | "ucsZAxis"
  | "ucs3Point"
  | "ucsX"
  | "ucsY"
  | "ucsZ"
  | "ucsView"
  | "ucsObject"
  | "ucsFace"

/**
 * What each UCS button answers UCS's first prompt: acad.cuix's ID_UcsWorld
 * `^C^C_ucs _w`, ID_UcsPrevio `_p`, ID_UcsOrigin `_o`, ID_UcsZAxVec `_zaxis`,
 * ID_Ucs3point `_3`, ID_UcsXAxRot `^C^C^R_ucs _x` (and Y, Z), ID_UcsView `_v`,
 * ID_UcsObject `^C^C^R_ucs _ob`, ID_UcsFace `^C^C^R_ucs _fa`.
 */
export const UCS_ANSWERS: Readonly<Record<UcsButton, string>> = {
  ucsWorld: "_w",
  ucsPrevious: "_p",
  ucsOrigin: "_o",
  ucsZAxis: "_zaxis",
  ucs3Point: "_3",
  ucsX: "_x",
  ucsY: "_y",
  ucsZ: "_z",
  ucsView: "_v",
  ucsObject: "_ob",
  ucsFace: "_fa",
}
