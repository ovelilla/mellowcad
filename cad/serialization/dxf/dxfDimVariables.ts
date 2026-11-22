import type { DimStyle, DimStyleOverrides } from "../../domain/dimStyles"

type DimVariable = keyof DimStyleOverrides

/**
 * Each dimension variable the model's styles hold, by its DXF group: the
 * DIMSTYLE table's, and the 1070 that names it in a dimension's DSTYLE xdata
 * (colors/s01: DIMSCALE 40, DIMASZ 41, DIMEXO 42, DIMDLI 43, DIMEXE 44,
 * DIMZIN 78, DIMTXT 140, DIMCEN 141, DIMGAP 147, DIMTOFL 172, DIMADEC 179,
 * DIMDEC 271, DIMDSEP 278), in the order AutoCAD writes them, by group.
 */
export const DIM_VARIABLE_GROUPS: readonly (readonly [number, DimVariable])[] =
  [
    [40, "scale"],
    [41, "arrowSize"],
    [42, "extensionOffset"],
    [43, "baselineSpacing"],
    [44, "extensionBeyond"],
    [78, "suppressTrailingZeros"],
    [140, "textHeight"],
    [141, "centerMark"],
    [147, "textGap"],
    [172, "forceLineInside"],
    [179, "angleDecimals"],
    [271, "decimals"],
    [278, "decimalSeparator"],
  ]

/** Whether a group holds a real (1040 in xdata), else an integer (1070). */
export function isRealDimGroup(group: number): boolean {
  return (group >= 40 && group < 50) || (group >= 140 && group < 150)
}

/** A variable's value as its group holds it: DIMZIN's bit 8, DIMDSEP's character code. */
export function dimVariableValue(
  variable: DimVariable,
  value: number
): DimStyle[DimVariable] {
  switch (variable) {
    case "suppressTrailingZeros":
      return (value & 8) !== 0
    case "forceLineInside":
      return value !== 0
    case "decimalSeparator":
      return String.fromCharCode(value)
    case "decimals":
    case "angleDecimals":
      return Math.round(value)
    default:
      return value
  }
}

/** A variable as its group writes it, the inverse of `dimVariableValue`. */
export function dimVariableNumber(
  variable: DimVariable,
  value: DimStyle[DimVariable]
): number {
  if (typeof value === "boolean") {
    return variable === "suppressTrailingZeros" ? (value ? 8 : 0) : +value
  }
  return typeof value === "string" ? value.charCodeAt(0) : value
}
