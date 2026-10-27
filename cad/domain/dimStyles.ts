/**
 * Dimension styles name a reusable set of dimension settings, exactly as
 * AutoCAD's DIMSTYLE table does: dimension objects reference a style by id and
 * take their sizes from it.
 *
 * The table is deliberately minimal — the handful of variables that decide what
 * a linear dimension looks like — but it is persisted from the start so richer
 * settings (arrowhead blocks, tolerances, alternate units) can be added without
 * changing the shape of the drawing file, the way {@link TextStyle} did.
 *
 * Every default below is AutoCAD's own *metric* initial value (the acadiso /
 * ISO-25 template), which is the one that matches this app's millimetre units.
 */

export type DimStyleId = string

export interface DimStyle {
  readonly id: DimStyleId
  readonly name: string
  /** Height of the measurement text, in drawing units (DIMTXT). */
  readonly textHeight: number
  /** Length of an arrowhead (DIMASZ). */
  readonly arrowSize: number
  /** Gap between the measured point and where its extension line starts (DIMEXO). */
  readonly extensionOffset: number
  /** How far an extension line runs past the dimension line (DIMEXE). */
  readonly extensionBeyond: number
  /** Gap between the dimension line and its text (DIMGAP). */
  readonly textGap: number
  /**
   * Distance each dimension line of a baseline chain is offset from the
   * previous one (DIMDLI), so DIMBASELINE never draws one over another.
   */
  readonly baselineSpacing: number
  /**
   * Size of the centre mark a radial dimension draws (DIMCEN) — "the distance
   * from the center of the circle or arc to the end of the center mark". Drawn
   * only when the dimension line is placed outside the circle or arc, and not
   * at all when 0. AutoCAD's negative branch (centrelines instead of a mark) is
   * not modelled.
   */
  readonly centerMark: number
  /** Decimal places shown in the measurement (DIMDEC). */
  readonly decimals: number
  /**
   * Decimal places shown in an *angular* measurement (DIMADEC), independent of
   * {@link DimStyle.decimals}. AutoCAD's initial value is 0 — a fresh angular
   * dimension reads whole degrees — and a negative value means "display the
   * number of decimal places specified by DIMDEC".
   */
  readonly angleDecimals: number
  /**
   * The character written for the decimal point in the drawn measurement
   * (DIMDSEP). ISO-25's is a comma, so a fresh dimension reads `12,5`; the
   * command line's `Dimension text =` still writes a point (p02).
   */
  readonly decimalSeparator: string
  /**
   * Whether a length drops its trailing zeros (DIMZIN's 8): ISO-25 sets it, so
   * 100 reads `100` and 12.5 `12,5`. Angles keep theirs, DIMAZIN being 0
   * (p366: `22,50°` at DIMADEC 2).
   */
  readonly suppressTrailingZeros: boolean
  /**
   * Overall scale factor applied to every *size* above (DIMSCALE) — never to the
   * measurement, which always reports the true distance.
   *
   * This is how a drawing made at 1:1 in model space gets annotation that reads
   * at its plotted size: a 50 m building plotted at 1:100 wants a scale of 100,
   * so 2.5 mm of text becomes 250 drawing units tall. AutoCAD's alternative,
   * annotative dimensions scaled by the viewport, needs layouts and viewports
   * that this app does not have — which is also why the `0` DIMSCALE branch is
   * not modelled: without paper space AutoCAD defines it as exactly 1.
   */
  readonly scale: number
}

/** The always-present style AutoCAD's metric templates ship with. */
export const DEFAULT_DIM_STYLE_ID: DimStyleId = "ISO-25"

export const DEFAULT_DIM_STYLE: DimStyle = {
  id: DEFAULT_DIM_STYLE_ID,
  name: "ISO-25",
  textHeight: 2.5,
  arrowSize: 2.5,
  extensionOffset: 0.625,
  extensionBeyond: 1.25,
  textGap: 0.625,
  baselineSpacing: 3.75,
  centerMark: 2.5,
  decimals: 2,
  angleDecimals: 0,
  decimalSeparator: ",",
  suppressTrailingZeros: true,
  scale: 1,
}

export function createDefaultDimStyle(): DimStyle {
  return { ...DEFAULT_DIM_STYLE }
}

/**
 * How many decimals an angular measurement shows: DIMADEC, falling back to
 * DIMDEC when it is negative, which is AutoCAD's own −1 branch.
 */
export function angleDecimalsOf(style: DimStyle): number {
  return style.angleDecimals < 0 ? style.decimals : style.angleDecimals
}

/**
 * The style with DIMSCALE folded into its sizes, so everything downstream reads
 * plain drawing units. `decimals` is untouched, and so is the measurement:
 * DIMSCALE "does not affect measured lengths, coordinates, or angles".
 */
export function scaledDimStyle(style: DimStyle): DimStyle {
  const factor = style.scale
  if (!(factor > 0) || factor === 1) return style
  return {
    ...style,
    textHeight: style.textHeight * factor,
    arrowSize: style.arrowSize * factor,
    extensionOffset: style.extensionOffset * factor,
    extensionBeyond: style.extensionBeyond * factor,
    textGap: style.textGap * factor,
    baselineSpacing: style.baselineSpacing * factor,
    centerMark: style.centerMark * factor,
    scale: 1,
  }
}

/**
 * Clamps a typed DIMSCALE into a usable range. Zero is AutoCAD's "derive it from
 * the viewport", which it defines as exactly 1 when there is no paper space —
 * and there is none here — so 0 (and anything unusable) folds to 1 rather than
 * collapsing the annotation.
 */
export function clampDimScale(scale: number): number {
  if (!Number.isFinite(scale) || scale <= 0) return 1
  return Math.max(0.01, Math.min(1000, scale))
}

/**
 * A DIMDSEP: one character that is not a digit, or ISO-25's comma.
 * AutoCAD's dialog offers a period, a comma and a space.
 */
export function clampDecimalSeparator(value: unknown): string {
  return typeof value === "string" &&
    [...value].length === 1 &&
    !/\d/.test(value)
    ? value
    : DEFAULT_DIM_STYLE.decimalSeparator
}

/**
 * Folds a style's numbers into usable ranges before it is stored: every plotted
 * size is a non-negative distance, DIMDEC counts 0–8 places and DIMADEC 0–8 or
 * the −1 that defers to DIMDEC, DIMDSEP is one character. Anything unusable
 * keeps the ISO-25 value rather than collapsing the annotation.
 */
export function clampDimStyle(style: DimStyle): DimStyle {
  const size = (value: number, fallback: number) =>
    Number.isFinite(value) && value >= 0 ? value : fallback
  const places = (value: number, fallback: number, min: number) =>
    Number.isFinite(value)
      ? Math.max(min, Math.min(8, Math.round(value)))
      : fallback
  return {
    ...style,
    textHeight: size(style.textHeight, DEFAULT_DIM_STYLE.textHeight),
    arrowSize: size(style.arrowSize, DEFAULT_DIM_STYLE.arrowSize),
    extensionOffset: size(
      style.extensionOffset,
      DEFAULT_DIM_STYLE.extensionOffset
    ),
    extensionBeyond: size(
      style.extensionBeyond,
      DEFAULT_DIM_STYLE.extensionBeyond
    ),
    textGap: size(style.textGap, DEFAULT_DIM_STYLE.textGap),
    baselineSpacing: size(
      style.baselineSpacing,
      DEFAULT_DIM_STYLE.baselineSpacing
    ),
    centerMark: size(style.centerMark, DEFAULT_DIM_STYLE.centerMark),
    decimals: places(style.decimals, DEFAULT_DIM_STYLE.decimals, 0),
    angleDecimals: places(
      style.angleDecimals,
      DEFAULT_DIM_STYLE.angleDecimals,
      -1
    ),
    decimalSeparator: clampDecimalSeparator(style.decimalSeparator),
    suppressTrailingZeros:
      typeof style.suppressTrailingZeros === "boolean"
        ? style.suppressTrailingZeros
        : DEFAULT_DIM_STYLE.suppressTrailingZeros,
    scale: clampDimScale(style.scale),
  }
}

/** Creates a style, filling anything unspecified from the ISO-25 defaults. */
export function createDimStyle(
  name: string,
  overrides: Partial<Omit<DimStyle, "id" | "name">> = {},
  id: DimStyleId = name
): DimStyle {
  return { ...DEFAULT_DIM_STYLE, ...overrides, id, name }
}
