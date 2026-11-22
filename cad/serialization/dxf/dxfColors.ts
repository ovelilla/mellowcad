import {
  EntityColor,
  aciRgb,
  colorIndex,
  indexColor,
  nearestIndexColor,
  normalizeTrueColor,
} from "../../domain/colors"

/**
 * An index colour (DXF 62) as the model holds it, its number: AutoCAD keeps it
 * an index colour (colors/c02). 0 (ByBlock) and 256 (ByLayer) are no colour of
 * their own.
 */
export function aciColor(index: number): EntityColor | null {
  return indexColor(index)
}

/** A true colour (DXF 420, 0x00RRGGBB) as the model holds colours. */
export function trueColor(value: number): EntityColor | null {
  if (!Number.isInteger(value) || value < 0) return null
  return `#${(value & 0xffffff).toString(16).padStart(6, "0")}`
}

/**
 * An index colour's RGB, for what DXF gives by index but the model keeps as an
 * RGB (a gradient's colours, 63).
 */
export function aciRgbColor(index: number): EntityColor | null {
  return aciRgb(index)
}

/**
 * A colour as DXF writes it: an index colour its number (62) alone, a true
 * colour the nearest index (62) and itself (420), even when its RGB is an
 * index colour's (AutoCAD's DXFOUT writes 255,0,0 as 62 1 and 420 16711680,
 * colors/c02).
 */
export function dxfColorCodes(
  color: EntityColor
): { index: number; rgb?: number } | null {
  const index = colorIndex(color)
  if (index !== null) return { index }
  const hex = normalizeTrueColor(color)
  if (!hex) return null
  const rgb = Number.parseInt(hex.slice(1), 16)
  return { index: nearestIndexColor(rgb).index, rgb }
}

/**
 * The index colour a true colour is written beside (62 next to 420): the
 * index whose RGB it is (`exact`, the lowest one, so white is 7, not 255),
 * else the nearest.
 */
export function aciIndex(rgb: number): { index: number; exact: boolean } {
  return nearestIndexColor(rgb)
}
