/** How far past the frame a clipped segment still runs, so its cap is off-screen. */
const CLIP_MARGIN_PX = 8

interface Point {
  readonly x: number
  readonly y: number
}

/**
 * Liang–Barsky: the part of segment `a`–`b` inside the frame (grown by a
 * margin), or null when none of it is. The start point is kept exactly when it
 * is already inside, so a dash pattern still starts where the scene said.
 *
 * WHY every presenter clips: the scene draws an alignment path as a line
 * millions of pixels long. An SVG would dash along its whole length, and so
 * does a canvas unless the line is exactly horizontal or vertical — Chrome's
 * Skia culls only those, so a guide a hair off the axis costs ~10 ms a frame.
 */
export function clipSegment(
  a: Point,
  b: Point,
  frame: { readonly width: number; readonly height: number }
): [Point, Point] | null {
  const dx = b.x - a.x
  const dy = b.y - a.y
  let t0 = 0
  let t1 = 1
  const edges: [number, number][] = [
    [-dx, a.x + CLIP_MARGIN_PX],
    [dx, frame.width + CLIP_MARGIN_PX - a.x],
    [-dy, a.y + CLIP_MARGIN_PX],
    [dy, frame.height + CLIP_MARGIN_PX - a.y],
  ]
  for (const [p, q] of edges) {
    if (p === 0) {
      if (q < 0) return null
      continue
    }
    const r = q / p
    if (p < 0) {
      if (r > t1) return null
      if (r > t0) t0 = r
    } else {
      if (r < t0) return null
      if (r < t1) t1 = r
    }
  }
  return [
    t0 === 0 ? a : { x: a.x + t0 * dx, y: a.y + t0 * dy },
    t1 === 1 ? b : { x: a.x + t1 * dx, y: a.y + t1 * dy },
  ]
}
