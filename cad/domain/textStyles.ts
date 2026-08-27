/**
 * Text styles name a reusable set of text settings, exactly as AutoCAD's STYLE
 * table does: text objects reference a style by id and inherit its defaults.
 *
 * The table is deliberately minimal for now — a name and a fixed height — but
 * it is persisted from the start so richer settings (font, width factor,
 * oblique angle) can be added without changing the shape of the drawing file.
 */

export type TextStyleId = string

export interface TextStyle {
  readonly id: TextStyleId
  readonly name: string
  /**
   * Fixed capital-letter height in drawing units. **Zero means "not fixed"**
   * (AutoCAD's convention): the TEXT command then prompts for a height each
   * time, instead of forcing the style's own.
   */
  readonly height: number
}

/** The always-present style AutoCAD ships in every drawing. */
export const DEFAULT_TEXT_STYLE_ID: TextStyleId = "Standard"

/**
 * Height used when nothing else supplies one — AutoCAD's TEXTSIZE, whose value
 * in the ISO (metric) templates this app's millimetre units match.
 */
export const DEFAULT_TEXT_HEIGHT = 2.5

export function createDefaultTextStyle(): TextStyle {
  return { id: DEFAULT_TEXT_STYLE_ID, name: "Standard", height: 0 }
}

/**
 * Creates a style. `height` 0 leaves the height free (prompted per object); the
 * id defaults to the name, since AutoCAD style names are themselves unique.
 */
export function createTextStyle(
  name: string,
  height = 0,
  id: TextStyleId = name
): TextStyle {
  return { id, name, height }
}
