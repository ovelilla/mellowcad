import { Vec2, V } from "../geometry/Vec2"
import type { ImageEntity } from "./entityTypes"
import { measureTextWidth } from "./text"

/**
 * Its frame's corners in the order AutoCAD lists them and EXPLODE leaves its
 * lines: the insertion corner, then up its height, across its width and
 * back down (image/i01, i06a).
 */
export function imageCorners(
  image: ImageEntity
): readonly [Vec2, Vec2, Vec2, Vec2] {
  const across = V.scale(image.u, image.width)
  const up = V.scale(image.v, image.height)
  const p = image.position
  return [p, V.add(p, up), V.add(V.add(p, up), across), V.add(p, across)]
}

/** Its frame's edges, closing back to the insertion corner. */
export function imageEdges(
  image: ImageEntity
): readonly (readonly [Vec2, Vec2])[] {
  const ring = imageCorners(image)
  return ring.map((p, i) => [p, ring[(i + 1) % ring.length]] as const)
}

/** The middle of its frame, where CEN finds it (image/i04). */
export function imageCentre(image: ImageEntity): Vec2 {
  const [a, , c] = imageCorners(image)
  return V.midpoint(a, c)
}

/**
 * The image under the affine map `at`: its corner mapped, its pixel's sides
 * as the map carries them, so MIRROR leaves them turning clockwise.
 */
export function mapImage(
  image: ImageEntity,
  at: (point: Vec2) => Vec2
): ImageEntity {
  const position = at(image.position)
  const side = (vector: Vec2, count: number) =>
    V.scale(
      V.sub(at(V.add(image.position, V.scale(vector, count))), position),
      1 / count
    )
  return {
    ...image,
    position: { x: position.x, y: position.y },
    u: side(image.u, image.width),
    v: side(image.v, image.height),
  }
}

/**
 * How far below the frame's middle the path's baseline runs, in its height:
 * measured on the plots of AutoCAD 2027 (image/i01, v1–v6, r2: 0.627 to
 * 0.654 by the ink, which Arimo's outlines read a little apart from Arial's).
 */
const LABEL_DROP = 0.64

/** The path an image shows in place of its pixels, where it stands and how big. */
export interface ImageLabel {
  readonly text: string
  /** The capitals' height: the frame's width shared among its characters. */
  readonly height: number
  /** The middle of its baseline. */
  readonly at: Vec2
  /** Unit vectors along its baseline and up its letters: the pixel's sides. */
  readonly along: Vec2
  readonly up: Vec2
}

/**
 * The path AutoCAD writes across an image it cannot find: its capitals as
 * tall as the frame's width over the number of its characters, whatever the
 * frame's height, centred along the width and with its baseline
 * {@link LABEL_DROP} heights below the middle, along `u` and up `v`, never
 * stretched (image/i01, v1–v6, r1, r2), so a mirrored image shows it
 * mirrored (i06e's plot). Null for no path or no frame.
 */
export function imageLabel(image: ImageEntity): ImageLabel | null {
  const text = image.image.path
  const characters = [...text].length
  const pixel = V.length(image.u)
  const rise = V.length(image.v)
  if (characters === 0 || pixel === 0 || rise === 0) return null
  const height = (image.width * pixel) / characters
  const along = V.scale(image.u, 1 / pixel)
  const up = V.scale(image.v, 1 / rise)
  return {
    text,
    height,
    at: V.sub(imageCentre(image), V.scale(up, LABEL_DROP * height)),
    along,
    up,
  }
}

/** Its label's box, from its baseline to its capitals' height, as a closed ring. */
export function imageLabelBox(image: ImageEntity): readonly Vec2[] | null {
  const label = imageLabel(image)
  if (!label) return null
  const half = V.scale(
    label.along,
    measureTextWidth(label.text, label.height) / 2
  )
  const top = V.scale(label.up, label.height)
  const left = V.sub(label.at, half)
  const right = V.add(label.at, half)
  return [left, right, V.add(right, top), V.add(left, top)]
}

/**
 * The image whose corner `index` (as {@link imageCorners} counts) is dragged
 * to `point`: the corner across stays, and the image scales about it, never
 * stretched, by the larger of the ratios the point gives along its width and
 * its height, or stays as it was where neither grows from that corner
 * (image/s1–s10: BR to −3,4 keeps TL and scales by 39.33/42.33).
 */
export function imageCornerDragged(
  image: ImageEntity,
  index: number,
  point: Vec2
): ImageEntity {
  const corners = imageCorners(image)
  const fixed = corners[(index + 2) % 4]
  const from = V.sub(corners[index], fixed)
  const to = V.sub(point, fixed)
  const det = image.u.x * image.v.y - image.u.y * image.v.x
  if (det === 0) return image
  // `to` and `from` in pixel steps along u and v.
  const along = (w: Vec2) => (w.x * image.v.y - w.y * image.v.x) / det
  const up = (w: Vec2) => (image.u.x * w.y - image.u.y * w.x) / det
  const ratios = [along(to) / along(from), up(to) / up(from)].filter(
    Number.isFinite
  )
  const factor = Math.max(...ratios)
  if (!(factor > 0) || factor === 1) return image
  return {
    ...image,
    position: V.add(fixed, V.scale(V.sub(image.position, fixed), factor)),
    u: V.scale(image.u, factor),
    v: V.scale(image.v, factor),
  }
}

/**
 * STRETCH of an image: only one of its corners caught counts, the last in
 * {@link imageCorners}' order (bottom right before top right before top
 * left), dragged as its grip is; none caught leaves it (image/s3, s4, s6, s8,
 * s9: a window over all four still drags only the bottom right one).
 */
export function imageStretched(
  image: ImageEntity,
  caught: (point: Vec2) => boolean,
  delta: Vec2
): ImageEntity {
  const corners = imageCorners(image)
  for (let i = corners.length - 1; i >= 0; i--) {
    if (caught(corners[i])) {
      return imageCornerDragged(image, i, V.add(corners[i], delta))
    }
  }
  return image
}

/** One pixel's width as LIST reads its scale: in the image's own pixel size, or as it is. */
export function imageScale(image: ImageEntity): number {
  const pixel = image.image.pixelSize
  return V.length(image.u) / (pixel && pixel > 0 ? pixel : 1)
}

/** Whether `point` lies in its label's box, where a pick takes it (image/i04). */
export function pointOnImageLabel(image: ImageEntity, point: Vec2): boolean {
  const ring = imageLabelBox(image)
  if (!ring) return false
  let inside = false
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i]
    const b = ring[(i + 1) % ring.length]
    if (a.y > point.y !== b.y > point.y) {
      const x = a.x + ((point.y - a.y) / (b.y - a.y)) * (b.x - a.x)
      if (x > point.x) inside = !inside
    }
  }
  return inside
}

/**
 * What a window crosses or a pick finds of it: its frame's edges, shown or
 * not, and its label's box; never the empty frame inside (image/i02, i04:
 * a crossing window inside it and clear of the path takes nothing).
 *
 * WHY the label's box, where AutoCAD finds the letters' strokes (a pick
 * between two letters takes nothing, i04): the engine measures text, it
 * draws no outlines, and a TEXT object is picked by its box too.
 */
export function imagePickEdges(
  image: ImageEntity
): readonly (readonly [Vec2, Vec2])[] {
  const ring = imageLabelBox(image) ?? []
  return [
    ...imageEdges(image),
    ...ring.map((p, i) => [p, ring[(i + 1) % ring.length]] as const),
  ]
}
