import { Vec2 } from "../geometry/Vec2"
import { DEFAULT_LAYER_ID, LayerId } from "./layers"
import {
  DEFAULT_TEXT_HEIGHT,
  DEFAULT_TEXT_STYLE_ID,
  TextStyleId,
} from "./textStyles"
import { EntityId, TextJustify, TextEntity } from "./entityTypes"
import { nextEntityId } from "./entityFactories"
import {
  TEXT_FONT_ADVANCES,
  TEXT_FONT_AVERAGE_ADVANCE,
  TEXT_FONT_CAP_HEIGHT,
  TEXT_FONT_UNITS_PER_EM,
} from "./textFontMetrics"

/** The optional settings of a text object; enough of them to want a bag. */
export interface TextOptions {
  readonly height?: number
  readonly rotation?: number
  readonly justify?: TextJustify
  readonly styleId?: TextStyleId
  readonly layerId?: LayerId
  readonly id?: EntityId
}

export function createText(
  position: Vec2,
  value: string,
  options: TextOptions = {}
): TextEntity {
  return {
    id: options.id ?? nextEntityId(),
    type: "text",
    layerId: options.layerId ?? DEFAULT_LAYER_ID,
    position: { x: position.x, y: position.y },
    value,
    height: options.height ?? DEFAULT_TEXT_HEIGHT,
    rotation: options.rotation ?? 0,
    justify: options.justify ?? "left",
    styleId: options.styleId ?? DEFAULT_TEXT_STYLE_ID,
  }
}

/**
 * Arial's capital height as a fraction of its em. A CAD text height is the
 * height of the capitals, so this is what turns one into a font size.
 */
export const TEXT_FONT_CAP_RATIO = TEXT_FONT_CAP_HEIGHT / TEXT_FONT_UNITS_PER_EM

/** Spacing between successive lines of TEXT — AutoCAD's single line spacing. */
export const TEXT_LINE_SPACING_FACTOR = 1.66

/**
 * Width of a string set in the drawing font at a capital height of `height`,
 * from Arial's advance widths: the presenters draw with Arial (or a face with
 * its metrics) and no kerning, so this is exactly what is painted. A glyph the
 * font lacks is drawn by a fallback face and measured as an average one.
 */
export function measureTextWidth(value: string, height: number): number {
  let units = 0
  for (const char of value) {
    units +=
      TEXT_FONT_ADVANCES[char.codePointAt(0) ?? 0] ?? TEXT_FONT_AVERAGE_ADVANCE
  }
  return (units / TEXT_FONT_CAP_HEIGHT) * height
}

/** Width of the whole string in drawing units. */
export function textWidth(text: TextEntity): number {
  return measureTextWidth(text.value, text.height)
}

/**
 * The four corners of a text object's box, in world coordinates and in order
 * around the outline. The box hangs off `position` according to the
 * justification, then rotates with the text.
 */
export function textCorners(text: TextEntity): Vec2[] {
  const w = textWidth(text)
  const h = text.height
  const [x0, x1] = horizontalExtent(text.justify, w)
  const [y0, y1] = verticalExtent(text.justify, h)
  const cos = Math.cos(text.rotation)
  const sin = Math.sin(text.rotation)
  return [
    [x0, y0],
    [x1, y0],
    [x1, y1],
    [x0, y1],
  ].map(([x, y]) => ({
    x: text.position.x + x * cos - y * sin,
    y: text.position.y + x * sin + y * cos,
  }))
}

/** Local X extent of the box, relative to the justification point. */
export function horizontalExtent(
  justify: TextJustify,
  w: number
): [number, number] {
  switch (justify) {
    case "left":
    case "tl":
    case "ml":
    case "bl":
      return [0, w]
    case "right":
    case "tr":
    case "mr":
    case "br":
      return [-w, 0]
    default:
      return [-w / 2, w / 2]
  }
}

/**
 * Local Y extent of the box, relative to the justification point. Baseline
 * justifications carry the text above the point; the Top ones below it; the
 * Middle ones straddle it.
 */
export function verticalExtent(
  justify: TextJustify,
  h: number
): [number, number] {
  switch (justify) {
    case "tl":
    case "tc":
    case "tr":
      return [-h, 0]
    case "middle":
    case "ml":
    case "mc":
    case "mr":
      return [-h / 2, h / 2]
    default:
      return [0, h]
  }
}
