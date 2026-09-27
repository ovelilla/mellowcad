/**
 * Colour is the first of the three "ByLayer" appearance properties, next to
 * linetype and lineweight: a layer carries the colour its entities inherit and
 * an entity may override it with its own ("ByObject").
 *
 * A colour is stored as a CSS hex string. The standard palette below mirrors
 * AutoCAD's first seven index colours, which is what its colour picker offers
 * as quick choices; any other hex value is still valid, so a custom colour
 * needs no special case.
 */

export type EntityColor = string

/**
 * The sentinel an entity's colour picker uses for "inherit the layer's colour"
 * — AutoCAD's ByLayer. An entity stores no `color` field in that case; this
 * value only ever travels through the UI/engine API.
 */
export const COLOR_BYLAYER = "ByLayer"

export interface ColorDef {
  readonly value: EntityColor
  /** What names it: the key of its display name in the engine's catalog. */
  readonly id: string
}

/** AutoCAD's index colours 1-7, the quick choices of its colour picker. */
export const STANDARD_COLORS: readonly ColorDef[] = [
  { value: "#ff0000", id: "red" },
  { value: "#ffff00", id: "yellow" },
  { value: "#00ff00", id: "green" },
  { value: "#00ffff", id: "cyan" },
  { value: "#0000ff", id: "blue" },
  { value: "#ff00ff", id: "magenta" },
  { value: "#ffffff", id: "white" },
]

/**
 * Validates a hex colour and returns it in canonical `#rrggbb` lowercase form
 * (expanding the `#rgb` shorthand), or null when it is not a hex colour.
 */
export function normalizeColor(value: string): EntityColor | null {
  const text = value.trim().toLowerCase()
  if (/^#[0-9a-f]{6}$/.test(text)) return text
  if (/^#[0-9a-f]{3}$/.test(text)) {
    return `#${text[1]}${text[1]}${text[2]}${text[2]}${text[3]}${text[3]}`
  }
  return null
}
