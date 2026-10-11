import type { AttributeDisplay } from "./entityTypes"
import { COLOR_BYLAYER, EntityColor } from "./colors"
import { LINETYPE_BYLAYER, LinetypeId } from "./linetypes"
import { LINEWEIGHT_BYLAYER, Lineweight } from "./lineweights"
import { NamedUcs, Ucs, WORLD_UCS } from "./ucs"
import { Vec3 } from "../geometry/Vec3"

/**
 * Document-level unit configuration. One *world unit* equals one *document
 * unit*, so geometry is stored unit-agnostically and the unit is used for
 * display and for interpreting typed input (dynamic input, dimensions, ...).
 * The decimal precision controls how measurements are formatted.
 */
export enum LengthUnit {
  Millimeter = "mm",
  Centimeter = "cm",
  Meter = "m",
}

export interface DocumentSettings {
  readonly unit: LengthUnit
  readonly precision: number
  /** Global linetype scale (AutoCAD's LTSCALE): multiplies every dash pattern. */
  readonly ltScale: number
  /** Whether lineweights are drawn at their real thickness (AutoCAD's LWDISPLAY). */
  readonly lwDisplay: boolean
  /** ATTMODE, which AutoCAD saves in the drawing. */
  readonly attributeDisplay: AttributeDisplay
  /** The current UCS (UCSORG, UCSXDIR), saved in the drawing. */
  readonly ucs: Ucs
  /** UCSNAME: the saved UCS the current one was restored from, until it changes. */
  readonly ucsName: string | null
  /** The UCS table: every UCS saved by name. */
  readonly namedUcs: readonly NamedUcs[]
  /** UCSICON: bit 1 shows the icon, bit 2 puts it at the origin when in view. */
  readonly ucsIcon: UcsIconSetting
  /** ELEVATION: the Z above the UCS's XY plane of a point given without one. */
  readonly elevation: number
  /** THICKNESS: the extrusion LINE, CIRCLE, ARC, PLINE and POLYGON give what they draw. */
  readonly thickness: number
  /** NAVVCUBEDISPLAY and the ViewCube's Home view, both saved in the drawing. */
  readonly viewCube: ViewCubeSetting
  /** CECOLOR: the colour new objects take, a hex value or ByLayer. */
  readonly currentColor: EntityColor | typeof COLOR_BYLAYER
  /** CELTYPE: the linetype new objects take, a linetype's name or ByLayer. */
  readonly currentLinetype: LinetypeId | typeof LINETYPE_BYLAYER
  /** CELWEIGHT: the lineweight new objects take, in millimetres, or ByLayer. */
  readonly currentLineweight: Lineweight | typeof LINEWEIGHT_BYLAYER
}

export interface UcsIconSetting {
  readonly visible: boolean
  readonly atOrigin: boolean
}

export interface ViewCubeSetting {
  /** NAVVCUBEDISPLAY 3 (shown) or 0; its 1 and 2 are per visual style, which there are none of. */
  readonly visible: boolean
  /** The Home view, in the WCS, or `null` for the default "Top/Left/Front" one. */
  readonly home: SavedView | null
}

/** A view's orientation in the WCS: where it looks from and what it draws up. */
export interface SavedView {
  /** Unit vector from the target towards the viewer. */
  readonly direction: Vec3
  /** Unit vector square to it, drawn pointing up. */
  readonly up: Vec3
}

export const DEFAULT_DOCUMENT_SETTINGS: DocumentSettings = {
  unit: LengthUnit.Millimeter,
  // WHY 2, not acadiso.dwt's LUPREC 4: a starting drawing's precision is the
  // template's choice, not a command's behaviour — every prompt's `<…>` and
  // report follows the drawing's precision as AutoCAD's follows LUPREC, and
  // UNITS sets 4 for AutoCAD's look.
  precision: 2,
  ltScale: 1,
  lwDisplay: true,
  attributeDisplay: "normal",
  ucs: WORLD_UCS,
  ucsName: null,
  namedUcs: [],
  ucsIcon: { visible: true, atOrigin: true },
  elevation: 0,
  thickness: 0,
  viewCube: { visible: true, home: null },
  currentColor: COLOR_BYLAYER,
  currentLinetype: LINETYPE_BYLAYER,
  currentLineweight: LINEWEIGHT_BYLAYER,
}

export const LENGTH_UNITS: LengthUnit[] = [
  LengthUnit.Millimeter,
  LengthUnit.Centimeter,
  LengthUnit.Meter,
]

export function unitSuffix(unit: LengthUnit): string {
  return unit
}

export function formatLength(
  value: number,
  settings: DocumentSettings
): string {
  return value.toFixed(settings.precision)
}

export function formatAngle(
  degrees: number,
  settings: DocumentSettings
): string {
  return degrees.toFixed(settings.precision)
}

/**
 * The Drawing Units dialog's Sample Output ("an example of the current
 * settings for units and angles"): a point typed as X,Y,Z and one as
 * distance<angle,Z, written as the drawing writes them.
 */
export function unitsSampleOutput(
  settings: Pick<DocumentSettings, "precision">
): readonly [string, string] {
  const length = (value: number) => value.toFixed(settings.precision)
  return [
    `${length(1.5)},${length(2.0039)},${length(0)}`,
    `${length(3)}<${(45).toFixed(settings.precision)},${length(0)}`,
  ]
}

/**
 * Parses a numeric measurement typed by the user. Accepts an optional leading
 * sign and either a dot or comma as the decimal separator. Returns `null` when
 * the text is empty or not a finite number.
 */
export function parseNumber(text: string): number | null {
  const trimmed = text.trim().replace(",", ".")
  if (trimmed === "") return null
  const value = Number(trimmed)
  return Number.isFinite(value) ? value : null
}
