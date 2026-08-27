/**
 * Lineweights are the plotted thickness of geometry, in millimetres — the third
 * "ByLayer" appearance property next to colour and linetype. A layer carries a
 * default lineweight (an entity's ByLayer thickness) and an entity may override
 * it with its own (ByObject).
 *
 * On screen a lineweight is drawn at a width proportional to its millimetre
 * value and *independent of zoom*, which is how AutoCAD displays lineweights in
 * model space: they describe the plotted result, not a drawing size. The
 * document-wide LWDISPLAY flag turns that thick rendering off so everything is
 * drawn hairline while drafting.
 */

/** A lineweight in millimetres. */
export type Lineweight = number

/** AutoCAD's standard lineweight values, in millimetres. */
export const LINEWEIGHTS: readonly Lineweight[] = [
  0, 0.05, 0.09, 0.13, 0.15, 0.18, 0.2, 0.25, 0.3, 0.35, 0.4, 0.5, 0.53, 0.6,
  0.7, 0.8, 0.9, 1, 1.06, 1.2, 1.4, 1.58, 2, 2.11,
]

/** The lineweight new layers start with (AutoCAD's LWDEFAULT). */
export const DEFAULT_LINEWEIGHT: Lineweight = 0.25

/**
 * The sentinel an entity's lineweight picker uses for "inherit the layer's
 * lineweight" — AutoCAD's ByLayer. An entity stores no `lineweight` field in
 * that case; this value only ever travels through the UI/engine API.
 */
export const LINEWEIGHT_BYLAYER = "ByLayer"

const MAX_LINEWEIGHT = LINEWEIGHTS[LINEWEIGHTS.length - 1]

/** A lineweight's display text, e.g. `"0.25 mm"`. */
export function lineweightLabel(lineweight: Lineweight): string {
  return `${lineweight.toFixed(2)} mm`
}

/** Clamps an arbitrary number into the valid lineweight range. */
export function clampLineweight(value: number): Lineweight {
  if (!Number.isFinite(value)) return DEFAULT_LINEWEIGHT
  return Math.max(0, Math.min(MAX_LINEWEIGHT, value))
}

/** CSS pixels per millimetre at the nominal 96 dpi of a CSS reference device. */
const PIXELS_PER_MM = 96 / 25.4

/**
 * The screen width in pixels used to draw a lineweight. Zoom is deliberately
 * ignored (AutoCAD's model-space behaviour) and `minimum` keeps the thinnest
 * weights — including 0.00 mm, which means "as thin as possible" — visible.
 */
export function lineweightPixels(
  lineweight: Lineweight,
  minimum: number
): number {
  return Math.max(minimum, lineweight * PIXELS_PER_MM)
}
