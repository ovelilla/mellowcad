/**
 * Writes the site's icons from the mark in `lib/brand.ts`:
 *
 *   app/icon.svg           the favicon, following the OS light/dark scheme
 *   app/apple-icon.png     180 px, opaque (iOS fills transparency with black)
 *   app/favicon.ico        16/32/48 px fallback for browsers without SVG icons
 *   public/icons/*.png     192 and 512 px for the manifest, plus a maskable one
 *
 * Run after changing the mark:  node scripts/icons/generate.ts
 * (Node runs the TypeScript directly; the outputs are committed.)
 */

import { writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import sharp from "sharp"

import {
  BRAND,
  MARK_MARKER,
  MARK_PATH,
  MARK_STROKE,
  MARK_VIEWBOX,
} from "../../lib/brand.ts"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..")

function mark(ink: string, precision: string): string {
  const m = MARK_MARKER
  return (
    `<path d="${MARK_PATH}" fill="none" stroke="${ink}" stroke-width="${MARK_STROKE}" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<rect x="${m.x}" y="${m.y}" width="${m.size}" height="${m.size}" fill="none" stroke="${precision}" stroke-width="${m.stroke}"/>`
  )
}

/** Square tile: the sheet colour, the mark filling `share` of the side. */
function tile(size: number, share: number, radius = 0): string {
  const inner = size * share
  const offset = (size - inner) / 2
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">` +
    `<rect width="${size}" height="${size}" rx="${radius}" fill="${BRAND.sheet}"/>` +
    `<svg x="${offset}" y="${offset}" width="${inner}" height="${inner}" viewBox="${MARK_VIEWBOX}">${mark(BRAND.ink, BRAND.precision)}</svg>` +
    `</svg>`
  )
}

const favicon =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${MARK_VIEWBOX}">` +
  `<style>.i{stroke:${BRAND.inkOnLight}}.p{stroke:${BRAND.precisionOnLight}}` +
  `@media (prefers-color-scheme:dark){.i{stroke:${BRAND.ink}}.p{stroke:${BRAND.precision}}}</style>` +
  `<path class="i" d="${MARK_PATH}" fill="none" stroke-width="${MARK_STROKE}" stroke-linecap="round" stroke-linejoin="round"/>` +
  `<rect class="p" x="${MARK_MARKER.x}" y="${MARK_MARKER.y}" width="${MARK_MARKER.size}" height="${MARK_MARKER.size}" fill="none" stroke-width="${MARK_MARKER.stroke}"/>` +
  `</svg>\n`

async function png(svg: string, size: number): Promise<Buffer> {
  return sharp(Buffer.from(svg), { density: 72 * 4 })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toBuffer()
}

/** An ICO holding PNG images (supported since Windows Vista). */
function ico(images: { size: number; data: Buffer }[]): Buffer {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(images.length, 4)
  let offset = 6 + 16 * images.length
  const entries = images.map(({ size, data }) => {
    const entry = Buffer.alloc(16)
    entry.writeUInt8(size >= 256 ? 0 : size, 0)
    entry.writeUInt8(size >= 256 ? 0 : size, 1)
    entry.writeUInt16LE(1, 4)
    entry.writeUInt16LE(32, 6)
    entry.writeUInt32LE(data.length, 8)
    entry.writeUInt32LE(offset, 12)
    offset += data.length
    return entry
  })
  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)])
}

writeFileSync(resolve(ROOT, "app/icon.svg"), favicon)
writeFileSync(
  resolve(ROOT, "app/apple-icon.png"),
  await png(tile(180, 0.62), 180)
)
writeFileSync(
  resolve(ROOT, "app/favicon.ico"),
  ico(
    await Promise.all(
      [16, 32, 48].map(async (size) => ({
        size,
        data: await png(tile(size, 0.8, size / 6), size),
      }))
    )
  )
)
writeFileSync(
  resolve(ROOT, "public/icons/icon-192.png"),
  await png(tile(192, 0.62), 192)
)
writeFileSync(
  resolve(ROOT, "public/icons/icon-512.png"),
  await png(tile(512, 0.62), 512)
)
// Maskable: the platform may crop to a circle of 80%, so the mark stays well
// inside it.
writeFileSync(
  resolve(ROOT, "public/icons/icon-maskable-512.png"),
  await png(tile(512, 0.48), 512)
)
console.log("icons written")
