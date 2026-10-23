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
  measureTextInk,
  measureTextWidth,
  MTEXT_LINE_SPACING_FACTOR,
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
  /**
   * Where the line is anchored, in the object's own frame: its baseline's
   * left end, middle or right end by its advance, as {@link MTextLayout.align}.
   */
  readonly x: number
  /** The left end of its baseline: an exploded line's insertion point. */
  readonly start: number
  /** The line's baseline, in the object's own frame. */
  readonly y: number
}

/**
 * An MTEXT as drawn, in its own frame: origin on the attachment point, X along
 * the rotation. The box is the defined width, widened to the widest line's
 * ink, by the lines' height (AutoCAD's ActualHeight).
 */
export interface MTextLayout {
  readonly lines: readonly MTextLine[]
  readonly align: "left" | "center" | "right"
  readonly x0: number
  readonly x1: number
  readonly y0: number
  readonly y1: number
}

/** The distance between baselines, AutoCAD's LineSpaceDistance. */
export function mtextLinePitch(mtext: MTextEntity): number {
  return mtext.lineSpacingFactor * MTEXT_LINE_SPACING_FACTOR * mtext.height
}

/**
 * A line's ink along its baseline, from its left end: AutoCAD sets a line by
 * it (text/p303). A positive bearing of the first glyph is left out (HHH
 * starts 1.11869 in at 10), a negative one is not counted ('j' stays at the
 * edge and its hook sticks out: "jumps over the" at x 0, ActualWidth 91.044).
 */
function lineInk(
  value: string,
  height: number
): { left: number; right: number } {
  const ink = measureTextInk(value, height)
  return { left: Math.max(ink.x0, 0), right: ink.x1 }
}

/**
 * AutoCAD's layout, by ink rather than advances (text/p303, p327, p332):
 * - a word wraps when the line's ink would pass the width ({@link wrapParagraph});
 * - each line's ink touches the box's edge, or is centred in it;
 * - the first baseline is max(height, the first line's ink top) below the top;
 * - At least: each next baseline one pitch lower, plus that line's ink above
 *   the height (OOO 16.844, "brown fox" 16.837 at 10, against 16.667);
 *   the box ends at the last line's ink bottom (ggg 2.940 below its baseline);
 * - Exactly: the pitch alone, and the box ends half the gap between lines
 *   below the last baseline (30 for two lines at 10, p303 l, p327). Ink above
 *   the height and below the baseline is not probed under it: read as the
 *   fixed spacing it promises.
 */
export function mtextLayout(mtext: MTextEntity): MTextLayout {
  const h = mtext.height
  const rows = mtextPlainText(mtext.contents)
    .split("\n")
    .flatMap((paragraph) => wrapParagraph(paragraph, mtext.width, h))
    .map((value) => {
      const ink = measureTextInk(value, h)
      return { value, ink, along: lineInk(value, h) }
    })
  const widest = Math.max(
    ...rows.map((row) => row.along.right - row.along.left)
  )
  const pitch = mtextLinePitch(mtext)
  const exactly = mtext.lineSpacingStyle === "exactly"
  // Baselines measured down from the top of the box.
  const depths: number[] = []
  rows.forEach((row, i) => {
    const above = exactly ? h : Math.max(h, row.ink.y1)
    depths.push(i === 0 ? above : depths[i - 1] + pitch + (above - h))
  })
  const last = rows[rows.length - 1].ink
  const below = exactly ? Math.max((pitch - h) / 2, 0) : Math.max(-last.y0, 0)
  const [x0, x1] = horizontalExtent(
    mtext.attachment,
    Math.max(mtext.width, widest)
  )
  const [y0, y1] = verticalExtent(
    mtext.attachment,
    depths[depths.length - 1] + below
  )
  const align = mtextAlign(mtext.attachment)
  const share = { left: 0, center: 0.5, right: 1 }[align]
  return {
    lines: rows.map((row, i) => {
      const { left, right } = row.along
      const start =
        align === "left"
          ? x0 - left
          : align === "right"
            ? x1 - right
            : (x0 + x1 - left - right) / 2
      return {
        value: row.value,
        x: start + share * measureTextWidth(row.value, h),
        start,
        y: y1 - depths[i],
      }
    }),
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
 * Greedy word wrap at spaces, by the line's ink: "HHH HHH" at 10, ink 62.169
 * and advance 64.413, stays one line at widths 63 and 64.3 and breaks at 62
 * (text/p332). A word wider than the box is never broken — it "will extend
 * beyond the given width", as AutoCAD's does.
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
    const ink = lineInk(candidate, height)
    if (row.length > 0 && ink.right - ink.left > width + 1e-9) {
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
 * The single-line text objects EXPLODE turns an MTEXT into: one Left text per
 * line, at its baseline's left end as the layout sets it, whatever the
 * attachment (text/p303; pieces/p255, p256). Blank lines leave nothing.
 */
export function mtextLineTexts(mtext: MTextEntity): TextEntity[] {
  return mtextLayout(mtext)
    .lines.filter((line) => line.value.trim().length > 0)
    .map((line) =>
      createText(mtextToWorld(mtext, line.start, line.y), line.value, {
        height: mtext.height,
        rotation: mtext.rotation,
        justify: "left",
        styleId: mtext.styleId,
        layerId: mtext.layerId,
      })
    )
}
