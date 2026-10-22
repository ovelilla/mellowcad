import { Vec2 } from "../geometry/Vec2"
import { DEFAULT_LAYER_ID, LayerId } from "./layers"
import {
  DEFAULT_TEXT_HEIGHT,
  DEFAULT_TEXT_STYLE_ID,
  TextStyleId,
} from "./textStyles"
import {
  EntityId,
  LineSpacingStyle,
  MTextAttachment,
  MTextEntity,
  TextEntity,
} from "./entityTypes"
import { nextEntityId } from "./entityFactories"
import {
  createText,
  horizontalExtent,
  measureTextWidth,
  TEXT_LINE_SPACING_FACTOR,
  verticalExtent,
} from "./text"

export const MIN_LINE_SPACING_FACTOR = 0.25
export const MAX_LINE_SPACING_FACTOR = 4

export interface MTextOptions {
  readonly height?: number
  readonly width?: number
  readonly rotation?: number
  readonly attachment?: MTextAttachment
  readonly lineSpacingStyle?: LineSpacingStyle
  readonly lineSpacingFactor?: number
  readonly styleId?: TextStyleId
  readonly layerId?: LayerId
  readonly id?: EntityId
}

export function createMText(
  position: Vec2,
  contents: string,
  options: MTextOptions = {}
): MTextEntity {
  return {
    id: options.id ?? nextEntityId(),
    type: "mtext",
    layerId: options.layerId ?? DEFAULT_LAYER_ID,
    position: { x: position.x, y: position.y },
    contents,
    height: options.height ?? DEFAULT_TEXT_HEIGHT,
    width: Math.max(options.width ?? 0, 0),
    rotation: options.rotation ?? 0,
    attachment: options.attachment ?? "tl",
    lineSpacingStyle: options.lineSpacingStyle ?? "atLeast",
    lineSpacingFactor: clampLineSpacingFactor(options.lineSpacingFactor ?? 1),
    styleId: options.styleId ?? DEFAULT_TEXT_STYLE_ID,
  }
}

export function clampLineSpacingFactor(factor: number): number {
  if (!Number.isFinite(factor)) return 1
  return Math.min(
    Math.max(factor, MIN_LINE_SPACING_FACTOR),
    MAX_LINE_SPACING_FACTOR
  )
}

/**
 * Codes that take a value up to a `;`: alignment, colour, font, height,
 * oblique angle, tracking, width factor and paragraph settings.
 */
const VALUE_CODES = new Set(["A", "C", "c", "F", "f", "H", "Q", "T", "W", "p"])
const SWITCH_CODES = new Set(["L", "l", "O", "o", "K", "k"])

/**
 * The text an MTEXT contents string reads as, paragraphs split by `\n`.
 * Formatting that is not drawn yet is dropped from the reading without being
 * lost from the object: grouping braces and switches vanish, a stack reads as
 * `a/b`, and a code this does not know keeps its letter.
 */
export function mtextPlainText(contents: string): string {
  let out = ""
  let i = 0
  while (i < contents.length) {
    const char = contents[i]
    if (char === "{" || char === "}") {
      i += 1
      continue
    }
    if (char !== "\\" || i + 1 >= contents.length) {
      out += char
      i += 1
      continue
    }
    const code = contents[i + 1]
    if (code === "P" || code === "N") {
      out += "\n"
      i += 2
    } else if (code === "~") {
      out += "\u00a0"
      i += 2
    } else if (SWITCH_CODES.has(code)) {
      i += 2
    } else if (code === "S") {
      const end = valueEnd(contents, i + 2)
      out += contents.slice(i + 2, end).replace(/[\^#]/g, "/")
      i = end + 1
    } else if (VALUE_CODES.has(code)) {
      i = valueEnd(contents, i + 2) + 1
    } else if (
      code === "U" &&
      /^\+[0-9a-fA-F]{4}/.test(contents.slice(i + 2))
    ) {
      out += String.fromCharCode(parseInt(contents.slice(i + 3, i + 7), 16))
      i += 7
    } else {
      out += code
      i += 2
    }
  }
  return out
}

function valueEnd(contents: string, from: number): number {
  const end = contents.indexOf(";", from)
  return end < 0 ? contents.length : end
}

/** The contents string for typed text: the inverse of {@link mtextPlainText}. */
export function mtextContents(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/[{}]/g, (brace) => `\\${brace}`)
    .replace(/\r\n?|\n/g, "\\P")
}

export interface MTextLine {
  readonly value: string
  /** Where the line is anchored, in the object's own frame. */
  readonly x: number
  /** The line's baseline, in the object's own frame. */
  readonly y: number
}

/**
 * An MTEXT as drawn, in its own frame: origin on the attachment point, X along
 * the rotation. The box is the lines' extent, which the width only widens.
 */
export interface MTextLayout {
  readonly lines: readonly MTextLine[]
  readonly align: "left" | "center" | "right"
  readonly x0: number
  readonly x1: number
  readonly y0: number
  readonly y1: number
}

/** The distance between baselines. */
export function mtextLinePitch(mtext: MTextEntity): number {
  return mtext.lineSpacingFactor * TEXT_LINE_SPACING_FACTOR * mtext.height
}

export function mtextLayout(mtext: MTextEntity): MTextLayout {
  const rows = mtextPlainText(mtext.contents)
    .split("\n")
    .flatMap((paragraph) => wrapParagraph(paragraph, mtext.width, mtext.height))
  const widest = Math.max(
    ...rows.map((row) => measureTextWidth(row, mtext.height))
  )
  const pitch = mtextLinePitch(mtext)
  const [x0, x1] = horizontalExtent(
    mtext.attachment,
    Math.max(mtext.width, widest)
  )
  const [y0, y1] = verticalExtent(
    mtext.attachment,
    mtext.height + (rows.length - 1) * pitch
  )
  const align = mtextAlign(mtext.attachment)
  const x = align === "left" ? x0 : align === "right" ? x1 : (x0 + x1) / 2
  return {
    lines: rows.map((value, i) => ({
      value,
      x,
      y: y1 - mtext.height - i * pitch,
    })),
    align,
    x0,
    x1,
    y0,
    y1,
  }
}

export function mtextAlign(
  attachment: MTextAttachment
): "left" | "center" | "right" {
  switch (attachment[1]) {
    case "l":
      return "left"
    case "r":
      return "right"
    default:
      return "center"
  }
}

/**
 * Greedy word wrap at spaces. A word wider than the box is never broken — it
 * "will extend beyond the given width", as AutoCAD's does.
 */
function wrapParagraph(
  paragraph: string,
  width: number,
  height: number
): string[] {
  if (!(width > 0)) return [paragraph]
  const words = paragraph.split(" ")
  const rows: string[] = []
  let row = words[0]
  for (const word of words.slice(1)) {
    const candidate = `${row} ${word}`
    if (row.length > 0 && measureTextWidth(candidate, height) > width + 1e-9) {
      rows.push(row)
      row = word
    } else {
      row = candidate
    }
  }
  rows.push(row)
  return rows
}

/** A point of the object's own frame, in world coordinates. */
export function mtextToWorld(mtext: MTextEntity, x: number, y: number): Vec2 {
  const cos = Math.cos(mtext.rotation)
  const sin = Math.sin(mtext.rotation)
  return {
    x: mtext.position.x + x * cos - y * sin,
    y: mtext.position.y + x * sin + y * cos,
  }
}

/** A world point in the object's own frame. */
export function mtextFromWorld(mtext: MTextEntity, point: Vec2): Vec2 {
  const cos = Math.cos(-mtext.rotation)
  const sin = Math.sin(-mtext.rotation)
  const dx = point.x - mtext.position.x
  const dy = point.y - mtext.position.y
  return { x: dx * cos - dy * sin, y: dx * sin + dy * cos }
}

/** The box's four corners in world coordinates, in order around it. */
export function mtextCorners(
  mtext: MTextEntity,
  layout: MTextLayout = mtextLayout(mtext)
): Vec2[] {
  const { x0, x1, y0, y1 } = layout
  return [
    mtextToWorld(mtext, x0, y0),
    mtextToWorld(mtext, x1, y0),
    mtextToWorld(mtext, x1, y1),
    mtextToWorld(mtext, x0, y1),
  ]
}

/**
 * The single-line text objects EXPLODE turns an MTEXT into: one per line as
 * drawn, each Left at its baseline's drawn left end whatever the attachment
 * (pieces/p255, p256). Blank lines leave nothing.
 */
export function mtextLineTexts(mtext: MTextEntity): TextEntity[] {
  const layout = mtextLayout(mtext)
  const share = { left: 0, center: 0.5, right: 1 }[layout.align]
  return layout.lines
    .filter((line) => line.value.trim().length > 0)
    .map((line) => {
      const left = line.x - share * measureTextWidth(line.value, mtext.height)
      return createText(mtextToWorld(mtext, left, line.y), line.value, {
        height: mtext.height,
        rotation: mtext.rotation,
        justify: "left",
        styleId: mtext.styleId,
        layerId: mtext.layerId,
      })
    })
}
