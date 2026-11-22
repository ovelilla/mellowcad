import {
  COLOR_BYLAYER,
  STANDARD_COLORS,
  colorChannels,
  colorIndex,
} from "../domain/colors"
import type { EngineNames } from "./EngineText"

/**
 * Where a colour is named, each place AutoCAD words it its own way (desktop
 * colors/d01–d04): `palette`, the Properties palette and the rollover
 * tooltip, `Color 30`; `bar`, the ribbon's Object Color list, `30`; `layer`,
 * the Layer Properties Manager, its named ones in lower case (`red`, d04-1).
 * A true colour is `255,127,0` in all three.
 */
export type ColorLabelPlace = "palette" | "bar" | "layer"

/**
 * A colour (or ByLayer) as a host's picker or list shows it, in the
 * interface language: ByLayer, a standard colour by name, any other index
 * colour by number, a true colour by its red, green and blue.
 */
export function colorLabel(
  color: string,
  names: EngineNames,
  place: ColorLabelPlace
): string {
  if (color === COLOR_BYLAYER) return names.byLayer
  const index = colorIndex(color)
  const standard = index === null ? undefined : STANDARD_COLORS[index - 1]?.id
  if (standard) {
    const name = names.colors[standard]
    return place === "layer" ? name.toLowerCase() : name
  }
  if (index !== null) {
    // WHY the manager's as the bar's: unverified, the manager was not seen
    // with one (docs/coverage/properties.md).
    return place === "palette" ? names.colorNumbers[color] : color
  }
  return colorChannels(color).join(",")
}
