import type { AttributeDisplay, TextJustify } from "./entityTypes"
import { COLOR_BYLAYER, EntityColor } from "./colors"
import { LINETYPE_BYLAYER, LinetypeId } from "./linetypes"
import { LINEWEIGHT_BYLAYER, Lineweight } from "./lineweights"
import { NamedUcs, OrthographicUcs, Ucs, WORLD_UCS } from "./ucs"
import { DEFAULT_TEXT_HEIGHT } from "./textStyles"
import { Vec2 } from "../geometry/Vec2"
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
  /** AUPREC: the decimal places angles are written with, apart from lengths'. */
  readonly anglePrecision: number
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
  /** The orthographic UCS the current one was set as (`*TOP*`), until it changes. */
  readonly ucsOrthographic: OrthographicUcs | null
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
  /** FILLMODE: whether wide polylines are drawn filled or as their outline. */
  readonly fillMode: boolean
  /** PLINEWID: the width PLINE starts with, the last one it was left at. */
  readonly polylineWidth: number
  /** FILLETRAD: the radius FILLET rounds with. */
  readonly filletRadius: number
  /** CHAMFERA: CHAMFER's first distance. */
  readonly chamferDistance1: number
  /** CHAMFERB: CHAMFER's second distance. */
  readonly chamferDistance2: number
  /** TEXTSIZE: the height TEXT, MTEXT and ATTDEF offer, the last one given. */
  readonly textSize: number
  /** TEXT's justification, the last one chosen, which AutoCAD saves too (rectang/p311). */
  readonly textJustify: TextJustify
  /**
   * TEXT's last rotation, the next one's `<default>`, in radians from the UCS
   * X axis. Per drawing and never saved (rectang/p311), but U takes it back
   * (text/p127), so it lives here and the file leaves it out.
   */
  readonly textRotation: number
  /** ORTHOMODE (F8). */
  readonly orthoMode: boolean
  /** SNAPMODE (F9). */
  readonly snapMode: boolean
  /** SNAPUNIT: the snap lattice's X and Y spacing. */
  readonly snapUnit: Vec2
  /** GRIDMODE (F7). */
  readonly gridMode: boolean
}

/** The drafting aids AutoCAD saves in the drawing. */
export type DraftingModes = Pick<
  DocumentSettings,
  "orthoMode" | "snapMode" | "snapUnit" | "gridMode"
>

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
  // template's choice, not a command's behaviour — every length's `<…>` and
  // report follows the drawing's precision as AutoCAD's follows LUPREC (not
  // LTSCALE's factor, `%.4f` always: properties/p234), and UNITS sets 4 for
  // AutoCAD's look.
  precision: 2,
  // AutoCAD's AUPREC starts at 0 in acadiso.dwt as in acad.dwt: `<90>`.
  anglePrecision: 0,
  ltScale: 1,
  // WHY on, where AutoCAD's LWDISPLAY starts at 0 (probe line/p204): with no
  // layouts or plotting here, the screen is the only place a lineweight shows.
  lwDisplay: true,
  attributeDisplay: "normal",
  ucs: WORLD_UCS,
  ucsName: null,
  ucsOrthographic: null,
  namedUcs: [],
  ucsIcon: { visible: true, atOrigin: true },
  elevation: 0,
  thickness: 0,
  viewCube: { visible: true, home: null },
  currentColor: COLOR_BYLAYER,
  currentLinetype: LINETYPE_BYLAYER,
  currentLineweight: LINEWEIGHT_BYLAYER,
  fillMode: true,
  polylineWidth: 0,
  // acadiso.dwt's FILLETRAD, CHAMFERA, CHAMFERB, TEXTSIZE, SNAPUNIT and
  // GRIDMODE (rectang/p302, p303, p304).
  filletRadius: 0,
  chamferDistance1: 0,
  chamferDistance2: 0,
  textSize: DEFAULT_TEXT_HEIGHT,
  textJustify: "left",
  textRotation: 0,
  orthoMode: false,
  snapMode: false,
  snapUnit: { x: 10, y: 10 },
  gridMode: true,
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

/**
 * A formatted number without its trailing zeros: `6.00` as `6`, `4.50` as
 * `4.5`, `-0.00` as `0` — as MTEXT writes its heights and the arrays their
 * defaults (text/p202, arrays/p116).
 */
export function withoutTrailingZeros(value: string): string {
  if (!value.includes(".")) return value
  const trimmed = value.replace(/\.?0+$/, "")
  return trimmed === "-0" ? "0" : trimmed
}

export function formatAngle(
  degrees: number,
  settings: DocumentSettings
): string {
  return degrees.toFixed(settings.anglePrecision)
}

/**
 * The Drawing Units dialog's Sample Output ("an example of the current
 * settings for units and angles"): a point typed as X,Y,Z and one as
 * distance<angle,Z, written as the drawing writes them.
 */
export function unitsSampleOutput(
  settings: Pick<DocumentSettings, "precision" | "anglePrecision">
): readonly [string, string] {
  const length = (value: number) => value.toFixed(settings.precision)
  return [
    `${length(1.5)},${length(2.0039)},${length(0)}`,
    `${length(3)}<${(45).toFixed(settings.anglePrecision)},${length(0)}`,
  ]
}

/**
 * Parses a numeric measurement typed by the user. Accepts an optional leading
 * sign and either a dot or comma as the decimal separator, and the forms
 * {@link parseDecimalNumber} reads. Returns `null` when the text is empty or
 * not a finite number.
 */
export function parseNumber(text: string): number | null {
  return parseDecimalNumber(text.trim().replace(",", "."))
}

const DECIMAL = /^[+-]?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i
const FRACTION = /^([+-]?)(?:(\d+)-)?(\d+)\/(\d+)$/

/**
 * A number as AutoCAD reads one in decimal units: a decimal (`.5`, `5.`,
 * `+5`), with an exponent (`1e1`), a fraction (`1/2`) or a whole number and a
 * fraction (`1-1/2`), probes line/p150, p165. WHY not `Number()`: it also
 * takes `0x10`, `0b1` and `0o7`, which AutoCAD refuses (p165).
 */
export function parseDecimalNumber(text: string): number | null {
  const t = text.trim()
  const fraction = FRACTION.exec(t)
  if (fraction) {
    const [, sign, whole, numerator, denominator] = fraction
    const value = Number(whole ?? 0) + Number(numerator) / Number(denominator)
    if (!Number.isFinite(value)) return null
    return sign === "-" ? -value : value
  }
  if (!DECIMAL.test(t)) return null
  const value = Number(t)
  return Number.isFinite(value) ? value : null
}

const UNSIGNED = /^(\d+(\.\d*)?|\.\d+)$/
const DEGREES_MINUTES = /^([+-]?)(\d+(?:\.\d*)?|\.\d+)d(?:(.+)')?$/i
const BEARING = /^([NS])(.+)([EW])$/i

/**
 * An angle typed with AUNITS 0, in degrees: a number (`30`, `1e1`), degrees
 * and minutes (`30d`, `30d30'`), radians (`0.5r`), grads (`50g`) or a
 * surveyor's bearing (`N45dE`), the forms AutoCAD 2027 reads (probe
 * line/p151). A bearing is a direction, counted from +X as any other angle.
 */
export function parseAngleDegrees(text: string): number | null {
  const t = text.trim()
  const bearing = BEARING.exec(t)
  if (bearing) {
    const angle = degreesAndMinutes(bearing[2]) ?? decimal(bearing[2])
    if (angle === null || angle < 0) return null
    const north = bearing[1].toUpperCase() === "N"
    const east = bearing[3].toUpperCase() === "E"
    return north
      ? east
        ? 90 - angle
        : 90 + angle
      : east
        ? 270 + angle
        : 270 - angle
  }
  const unit = t.slice(-1).toLowerCase()
  if (unit === "r" || unit === "g") {
    const value = decimal(t.slice(0, -1))
    if (value === null) return null
    return unit === "r" ? (value * 180) / Math.PI : value * 0.9
  }
  return degreesAndMinutes(t) ?? decimal(t)
}

function degreesAndMinutes(text: string): number | null {
  const match = DEGREES_MINUTES.exec(text)
  if (!match) return null
  const [, sign, degrees, minutes] = match
  if (minutes !== undefined && !UNSIGNED.test(minutes)) return null
  const value =
    Number(degrees) + (minutes === undefined ? 0 : Number(minutes) / 60)
  return sign === "-" ? -value : value
}

function decimal(text: string): number | null {
  return DECIMAL.test(text.trim()) ? parseDecimalNumber(text) : null
}
