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
}

export const DEFAULT_DOCUMENT_SETTINGS: DocumentSettings = {
  unit: LengthUnit.Millimeter,
  precision: 2,
  ltScale: 1,
  lwDisplay: true,
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
