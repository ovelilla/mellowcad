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
  TEXT_FONT_DESCENT,
  TEXT_FONT_INK,
  TEXT_FONT_LINE_HEIGHT,
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
 * Arial's capital height as a fraction of its em: the ink height of its H,
 * which AutoCAD scales the font by (text/p301). A CAD text height is the
 * height of the capitals, so this is what turns one into a font size.
 */
export const TEXT_FONT_CAP_RATIO = TEXT_FONT_CAP_HEIGHT / TEXT_FONT_UNITS_PER_EM

/**
 * MTEXT's single line spacing as a multiple of the text height. The help rounds
 * it to 1.66; ObjectARX states the rule it comes from, "line spacing is really
 * 5/3 of the font size".
 */
export const MTEXT_LINE_SPACING_FACTOR = 5 / 3

/**
 * TEXT's line below, as a multiple of the height: the font's own line (Arial's
 * hhea, 2355 units) over the H AutoCAD scales it by (1466), 1.60641 — not
 * MTEXT's 5/3, which only txt.shx gives TEXT (text/p122, desktop text/d01-4).
 */
export const TEXT_LINE_SPACING_FACTOR =
  TEXT_FONT_LINE_HEIGHT / TEXT_FONT_CAP_HEIGHT

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

/** A box in a text's own frame: X along its baseline, Y across it. */
export interface TextBox {
  readonly x0: number
  readonly x1: number
  readonly y0: number
  readonly y1: number
}

/**
 * The ink box of a string set at a capital height of `height`, from the left
 * end of its baseline: what AutoCAD's `(textbox)` returns (text/p301: H from
 * 1.11869 to 8.96317, g down to −2.93997 at 10). A glyph the font lacks
 * counts as its whole advance by the capital height; a string with no ink
 * at all (spaces, nothing) as its advance width by the height.
 */
export function measureTextInk(value: string, height: number): TextBox {
  let pen = 0
  let x0 = Infinity
  let x1 = -Infinity
  let y0 = Infinity
  let y1 = -Infinity
  for (const char of value) {
    const code = char.codePointAt(0) ?? 0
    const advance = TEXT_FONT_ADVANCES[code]
    const ink =
      TEXT_FONT_INK[code] ??
      (advance === undefined
        ? ([0, TEXT_FONT_AVERAGE_ADVANCE, 0, TEXT_FONT_CAP_HEIGHT] as const)
        : null)
    if (ink) {
      x0 = Math.min(x0, pen + ink[0])
      x1 = Math.max(x1, pen + ink[1])
      y0 = Math.min(y0, ink[2])
      y1 = Math.max(y1, ink[3])
    }
    pen += advance ?? TEXT_FONT_AVERAGE_ADVANCE
  }
  const scale = height / TEXT_FONT_CAP_HEIGHT
  if (x0 > x1) return { x0: 0, x1: pen * scale, y0: 0, y1: height }
  return { x0: x0 * scale, x1: x1 * scale, y0: y0 * scale, y1: y1 * scale }
}

/**
 * Where a justification puts the left end of the baseline (AutoCAD's DXF 10),
 * from the justification point, in the text's frame (text/p302, Agh at 10):
 * - along it, by the span from the advance's start, or the ink's when a glyph
 *   overhangs it (A's −0.0205), to the advance's end: Right −24.857, Center
 *   −12.418, not half the advance's 12.428 (p327: HHH −15.133, ggg −11.654);
 * - Top: the baseline the height below (−10); ML, MC, MR: half of it (−5);
 * - BL, BC, BR: Arial's descent above the point, 434/1466 of the height
 *   (+2.96044);
 * - Middle: the ink's vertical middle on the point (−3.530; HHH −5, ggg
 *   −2.234, p327).
 */
export function textStartOffset(
  justify: TextJustify,
  value: string,
  height: number
): Vec2 {
  const ink = measureTextInk(value, height)
  const left = Math.min(0, ink.x0)
  const right = Math.max(measureTextWidth(value, height), ink.x1)
  const x =
    textAlong(justify) === "left"
      ? 0
      : textAlong(justify) === "right"
        ? -right
        : -(left + right) / 2
  switch (justify) {
    case "tl":
    case "tc":
    case "tr":
      return { x, y: -height }
    case "ml":
    case "mc":
    case "mr":
      return { x, y: -height / 2 }
    case "bl":
    case "bc":
    case "br":
      return { x, y: (TEXT_FONT_DESCENT / TEXT_FONT_CAP_HEIGHT) * height }
    case "middle":
      return { x, y: -(ink.y0 + ink.y1) / 2 }
    default:
      return { x, y: 0 }
  }
}

/** Which end of its baseline, or its middle, a justification holds. */
export function textAlong(justify: TextJustify): "left" | "center" | "right" {
  switch (justify) {
    case "left":
    case "tl":
    case "ml":
    case "bl":
      return "left"
    case "right":
    case "tr":
    case "mr":
    case "br":
      return "right"
    default:
      return "center"
  }
}

/**
 * A text's box from its justification point, in its frame: its ink box where
 * the justification sets the glyphs, AutoCAD's extents of a TEXT, which
 * picking, bounds, windows, TRIM's edges and MIRROR read.
 */
export function textBox(
  justify: TextJustify,
  value: string,
  height: number
): TextBox {
  const start = textStartOffset(justify, value, height)
  const ink = measureTextInk(value, height)
  return {
    x0: start.x + ink.x0,
    x1: start.x + ink.x1,
    y0: start.y + ink.y0,
    y1: start.y + ink.y1,
  }
}

/** A point of a text's frame, from its justification point, in the world. */
function textToWorld(text: TextEntity, x: number, y: number): Vec2 {
  const cos = Math.cos(text.rotation)
  const sin = Math.sin(text.rotation)
  return {
    x: text.position.x + x * cos - y * sin,
    y: text.position.y + x * sin + y * cos,
  }
}

/**
 * The left end of a text's baseline in the world: AutoCAD's insertion point
 * (DXF 10), where the glyphs are drawn from and a justified text's second grip.
 */
export function textInsertionPoint(text: TextEntity): Vec2 {
  const start = textStartOffset(text.justify, text.value, text.height)
  return textToWorld(text, start.x, start.y)
}

/**
 * The point of a text's baseline a renderer aligns it at, {@link textAlong}
 * its justification: the left end (DXF 10), or its advance's middle or right
 * end from there. Drawn with Arial's widths, the glyphs stand where AutoCAD's
 * do; a face that differs stays centred or right-aligned on it.
 */
export function textBaselinePoint(text: TextEntity): Vec2 {
  const start = textStartOffset(text.justify, text.value, text.height)
  const along = textAlong(text.justify)
  const share = along === "left" ? 0 : along === "right" ? 1 : 0.5
  return textToWorld(text, start.x + share * textWidth(text), start.y)
}

/**
 * The four corners of a text object's box ({@link textBox}), in world
 * coordinates and in order around the outline.
 */
export function textCorners(text: TextEntity): Vec2[] {
  const { x0, x1, y0, y1 } = textBox(text.justify, text.value, text.height)
  return [
    textToWorld(text, x0, y0),
    textToWorld(text, x1, y0),
    textToWorld(text, x1, y1),
    textToWorld(text, x0, y1),
  ]
}

/**
 * Local X extent of a TEXT's advance width or of an MTEXT frame, relative to
 * the justification point.
 */
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
 * Local Y extent of an MTEXT frame, relative to its attachment point: the
 * Bottom attachments carry it above the point, the Top ones below it, the
 * Middle ones straddle it. A TEXT's is {@link textBox}.
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
