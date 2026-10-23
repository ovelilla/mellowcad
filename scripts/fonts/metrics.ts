/**
 * Writes `cad/domain/textFontMetrics.ts`: the advance widths of the drawing's
 * text font, which the engine measures text with (it has no DOM to ask).
 *
 * The font is Arial, AutoCAD's Standard text style. Its widths are read from
 * Arimo, which is metric-compatible with Arial and under the SIL OFL 1.1:
 *
 *   https://github.com/google/fonts/raw/main/ofl/arimo/Arimo%5Bwght%5D.ttf
 *
 * Arial's own vertical numbers (the line height, the H's ink) are read from
 * arial.ttf, which cannot ship but can be measured where it is installed
 * (`/mnt/c/Windows/Fonts/arial.ttf` under WSL): Arimo's capitals differ.
 *
 * Run:  node scripts/fonts/metrics.ts path/to/Arimo[wght].ttf path/to/arial.ttf
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

const [path, arialPath] = process.argv.slice(2)
if (!path || !arialPath) {
  throw new Error(
    "Usage: node scripts/fonts/metrics.ts <Arimo.ttf> <arial.ttf>"
  )
}

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

/**
 * Arial's OS/2 sCapHeight. Arimo shares Arial's advances but not its capitals
 * (1409), and a CAD height is the capitals', so this is what turns it into an em.
 */
const ARIAL_CAP_HEIGHT = 1467

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

/**
 * Arial's single line spacing, in font units: hhea's ascender − descender +
 * line gap (1854 + 434 + 67). OS/2's win metrics leave the gap out (2288) and
 * its typo metrics are other numbers (2229); hhea's is the one TEXT steps by
 * (text/p122: 2355/1466 of the height).
 */
function lineHeight(font: Font): number {
  const hhea = tableOf(font, "hhea")
  const { view } = font
  return (
    view.getInt16(hhea + 4) - view.getInt16(hhea + 6) + view.getInt16(hhea + 8)
  )
}

/** The ink height of a glyph (glyf's yMax − yMin), AutoCAD's scale for Arial. */
function inkHeight(font: Font, codePoint: number): number {
  const { view } = font
  const glyph = glyphMap(font)(codePoint)
  const longOffsets = view.getInt16(tableOf(font, "head") + 50) === 1
  const loca = tableOf(font, "loca")
  const offset = longOffsets
    ? view.getUint32(loca + glyph * 4)
    : view.getUint16(loca + glyph * 2) * 2
  const header = tableOf(font, "glyf") + offset
  return view.getInt16(header + 8) - view.getInt16(header + 4)
}

const arial = load(arialPath)
const arialLineHeight = lineHeight(arial)
const arialHHeight = inkHeight(arial, 0x48)

const glyphOf = glyphMap(arimo)
const entries: string[] = []
for (const [first, last] of RANGES) {
  for (let codePoint = first; codePoint <= last; codePoint++) {
    const glyph = glyphOf(codePoint)
    if (glyph !== 0) entries.push(`${codePoint}:${advance(glyph)}`)
  }
}

const lines: string[] = []
let line = " "
for (const entry of entries) {
  if (line.length + entry.length + 2 > 80) {
    lines.push(line)
    line = " "
  }
  line += ` ${entry},`
}
lines.push(line)

writeFileSync(
  OUTPUT,
  `// Generated by scripts/fonts/metrics.ts from Arimo (SIL OFL 1.1), whose
// advance widths are Arial's, and from Arial's line height and H. Do not edit
// by hand.

export const TEXT_FONT_UNITS_PER_EM = ${unitsPerEm}
export const TEXT_FONT_CAP_HEIGHT = ${ARIAL_CAP_HEIGHT}
export const TEXT_FONT_AVERAGE_ADVANCE = ${averageAdvance}
/** Arial's hhea ascender − descender + line gap. */
export const TEXT_FONT_LINE_HEIGHT = ${arialLineHeight}
/** The ink height of Arial's H, by which AutoCAD scales the font. */
export const TEXT_FONT_H_HEIGHT = ${arialHHeight}

/** Advance width by code point, in font units. */
export const TEXT_FONT_ADVANCES: Readonly<Record<number, number>> = {
${lines.join("\n")}
}
`
)
console.log(
  `${entries.length} glyphs, ${unitsPerEm} units/em, cap height ${ARIAL_CAP_HEIGHT}, line ${arialLineHeight}, H ${arialHHeight}`
)
