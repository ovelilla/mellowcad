/**
 * Writes `cad/domain/textFontMetrics.ts`: the advance widths and ink bounds of
 * the drawing's text font, which the engine measures and places text with (it
 * has no DOM to ask).
 *
 * The font is Arial, AutoCAD's Standard text style. Its numbers are read from
 * Arimo, which is metric-compatible with Arial and under the SIL OFL 1.1, so
 * that nothing the package ships is measured from Arial:
 *
 *   https://github.com/google/fonts/raw/main/ofl/arimo/Arimo%5Bwght%5D.ttf
 *
 * Arimo has Arial's advances and line metrics (hhea 1854, −434, 67) but not its
 * outlines: its H is 1409 units tall, and the scale AutoCAD sets Arial by is
 * written as AutoCAD's (`AUTOCAD_CAP_HEIGHT`), not read.
 *
 * Run:  node scripts/fonts/metrics.ts path/to/Arimo[wght].ttf
 * (Node runs the TypeScript directly; the output is committed.)
 */

import { readFileSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..")
const OUTPUT = resolve(ROOT, "cad/domain/textFontMetrics.ts")

/** Latin, Greek, and the punctuation, currency and maths blocks. */
const RANGES: readonly (readonly [number, number])[] = [
  [0x20, 0x7e],
  [0xa0, 0x24f],
  [0x370, 0x3ff],
  [0x2000, 0x22ff],
]

const [path] = process.argv.slice(2)
if (!path) throw new Error("Usage: node scripts/fonts/metrics.ts <Arimo.ttf>")

interface Font {
  readonly bytes: Buffer
  readonly view: DataView
}

function load(file: string): Font {
  const bytes = readFileSync(file)
  return {
    bytes,
    view: new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength),
  }
}

function tableOf({ bytes, view }: Font, tag: string): number {
  const count = view.getUint16(4)
  for (let i = 0; i < count; i++) {
    const record = 12 + i * 16
    if (bytes.toString("latin1", record, record + 4) === tag) {
      return view.getUint32(record + 8)
    }
  }
  throw new Error(`No ${tag} table`)
}

const arimo = load(path)
const view = arimo.view
const table = (tag: string): number => tableOf(arimo, tag)

const unitsPerEm = view.getUint16(table("head") + 18)
const averageAdvance = view.getInt16(table("OS/2") + 2)
const metricCount = view.getUint16(table("hhea") + 34)
const hmtx = table("hmtx")

function advance(glyph: number): number {
  return view.getUint16(hmtx + Math.min(glyph, metricCount - 1) * 4)
}

function glyphMap(font: Font): (codePoint: number) => number {
  const { view } = font
  const cmap = tableOf(font, "cmap")
  const count = view.getUint16(cmap + 2)
  let format4 = -1
  let format12 = -1
  for (let i = 0; i < count; i++) {
    const record = cmap + 4 + i * 8
    const platform = view.getUint16(record)
    const encoding = view.getUint16(record + 2)
    const offset = cmap + view.getUint32(record + 4)
    if (platform === 3 && encoding === 10) format12 = offset
    if (platform === 3 && encoding === 1) format4 = offset
  }
  if (format12 >= 0 && view.getUint16(format12) === 12) {
    const groups = view.getUint32(format12 + 12)
    return (codePoint) => {
      for (let i = 0; i < groups; i++) {
        const group = format12 + 16 + i * 12
        const start = view.getUint32(group)
        const end = view.getUint32(group + 4)
        if (codePoint >= start && codePoint <= end) {
          return view.getUint32(group + 8) + codePoint - start
        }
      }
      return 0
    }
  }
  if (format4 < 0) throw new Error("No Unicode cmap")
  const segments = view.getUint16(format4 + 6) / 2
  const ends = format4 + 14
  const starts = ends + segments * 2 + 2
  const deltas = starts + segments * 2
  const rangeOffsets = deltas + segments * 2
  return (codePoint) => {
    for (let i = 0; i < segments; i++) {
      if (codePoint > view.getUint16(ends + i * 2)) continue
      const start = view.getUint16(starts + i * 2)
      if (codePoint < start) return 0
      const delta = view.getInt16(deltas + i * 2)
      const rangeOffset = view.getUint16(rangeOffsets + i * 2)
      if (rangeOffset === 0) return (codePoint + delta) & 0xffff
      const at = rangeOffsets + i * 2 + rangeOffset + (codePoint - start) * 2
      const glyph = view.getUint16(at)
      return glyph === 0 ? 0 : (glyph + delta) & 0xffff
    }
    return 0
  }
}

const hhea = table("hhea")
const ascent = view.getInt16(hhea + 4)
/**
 * hhea's, not OS/2's usWinDescent: Arimo's is 797 where Arial's is 434, the
 * descent AutoCAD sets a Bottom justification by (text/p302).
 */
const descent = -view.getInt16(hhea + 6)
/**
 * The single line spacing, in font units: hhea's ascender − descender + line
 * gap (1854 + 434 + 67). OS/2's win metrics leave the gap out and its typo
 * metrics are other numbers; hhea's is the one TEXT steps by (text/p122:
 * 2355/1466 of the height).
 */
const lineHeight = ascent + descent + view.getInt16(hhea + 8)

/**
 * The ink height of Arial's H, by which AutoCAD scales the font: TEXT's H at
 * height 10 advances 10.0887 = 1479/1466 (text/p301), not OS/2's sCapHeight
 * 1467. Arimo's own H, 1409, would set every text 4 % wider than AutoCAD's.
 */
const AUTOCAD_CAP_HEIGHT = 1466

/** A glyph's ink box (glyf's xMin, xMax, yMin, yMax), or null when it has no outline. */
function inkBounds(
  glyph: number
): readonly [number, number, number, number] | null {
  const longOffsets = view.getInt16(table("head") + 50) === 1
  const loca = table("loca")
  const offsetOf = (index: number): number =>
    longOffsets
      ? view.getUint32(loca + index * 4)
      : view.getUint16(loca + index * 2) * 2
  const offset = offsetOf(glyph)
  if (offsetOf(glyph + 1) === offset) return null
  const header = table("glyf") + offset
  return [
    view.getInt16(header + 2),
    view.getInt16(header + 6),
    view.getInt16(header + 4),
    view.getInt16(header + 8),
  ]
}

const glyphOf = glyphMap(arimo)
const entries: string[] = []
const inkEntries: string[] = []
for (const [first, last] of RANGES) {
  for (let codePoint = first; codePoint <= last; codePoint++) {
    const glyph = glyphOf(codePoint)
    if (glyph === 0) continue
    entries.push(`${codePoint}:${advance(glyph)}`)
    const ink = inkBounds(glyph)
    if (ink) inkEntries.push(`${codePoint}:[${ink.join(",")}]`)
  }
}

function wrap(items: readonly string[]): string {
  const lines: string[] = []
  let line = " "
  for (const item of items) {
    if (line.length + item.length + 2 > 80) {
      lines.push(line)
      line = " "
    }
    line += ` ${item},`
  }
  lines.push(line)
  return lines.join("\n")
}

writeFileSync(
  OUTPUT,
  `// Generated by scripts/fonts/metrics.ts from Arimo (SIL OFL 1.1), whose
// advance widths and line metrics are Arial's. Do not edit by hand.

export const TEXT_FONT_UNITS_PER_EM = ${unitsPerEm}
/** The ink height of Arial's H, by which AutoCAD scales the font (text/p301). */
export const TEXT_FONT_CAP_HEIGHT = ${AUTOCAD_CAP_HEIGHT}
export const TEXT_FONT_AVERAGE_ADVANCE = ${averageAdvance}
/** hhea's ascender. */
export const TEXT_FONT_ASCENT = ${ascent}
/** hhea's ascender − descender + line gap. */
export const TEXT_FONT_LINE_HEIGHT = ${lineHeight}
/** hhea's descender, as a distance below the baseline. */
export const TEXT_FONT_DESCENT = ${descent}

/** Advance width by code point, in font units. */
export const TEXT_FONT_ADVANCES: Readonly<Record<number, number>> = {
${wrap(entries)}
}

/**
 * Ink box by code point, [xMin, xMax, yMin, yMax] in font units from its
 * origin on the baseline; a glyph with no outline has none.
 */
export const TEXT_FONT_INK: Readonly<
  Record<number, readonly [number, number, number, number]>
> = {
${wrap(inkEntries)}
}
`
)
console.log(
  `${entries.length} glyphs, ${inkEntries.length} with ink, ${unitsPerEm} units/em, ascent ${ascent}, line ${lineHeight}, descent ${descent}`
)
