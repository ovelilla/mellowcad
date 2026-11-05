import { Vec3, add3, cross3, dot3, normalize3, scale3 } from "../geometry/Vec3"
import { Brep } from "../geometry/solids"
import { brepMesh } from "../geometry/faceMesh"

/**
 * The Conceptual visual style's faces: each solid's triangles that face the
 * viewer, coloured by AutoCAD's Gooch shading (VSFACESTYLE 2, visualstyle/
 * v06) and painted back to front. The mesh is the B-rep's, made once
 * (`brepMesh`); what is kept here depends on the line of sight alone, so a
 * pan or a zoom only projects it again.
 */

/** A cell of a face, its two triangles painted as one: they share a colour and a depth. */
export interface ShadedCell {
  readonly points: readonly Vec3[]
  readonly fill: string
  /** Its solid's layer is locked: already shaded so (`goochFill`'s `locked`). */
  readonly locked?: boolean
}

/** A solid to shade and the colour it is drawn in, `#rrggbb` (index 7 white). */
export interface ShadedSolid {
  readonly brep: Brep
  readonly color: string
  readonly locked?: boolean
}

/**
 * The default lighting's direction in the view (DEFAULTLIGHTING 1: it
 * follows the viewpoint), as right, up and towards the viewer: fitted to a
 * white sphere's pixels on AutoCAD 2027's screen in Conceptual (desktop
 * solid-inquiry/d02, 3593 of them, RMS 0.4), which a box's three faces in SW
 * Isometric confirm (d03, within 1.1).
 */
const LIGHT = { right: -0.5709, up: 0.4876, toward: 0.6605 }

/**
 * Gooch's shading as the screen draws it, per channel (red and green alike,
 * blue apart): `base + slope · c`, `c` the face's cosine to the light, each
 * of the two linear in the object's channel `k` (over 255) by its `Share`.
 * Fitted to the d02 sphere (white) and d06's red box (k 0 in green and blue,
 * within 0.5); red below 1 is unprobed, taken as green's. The plot shades
 * otherwise (visualstyle/p03: a white box's 130, 122 and 85 grey), and the
 * screen is what the user sees.
 */
const RAMP = {
  redGreen: { base: 56.88, baseShare: 81.81, slope: 58.02, slopeShare: 58.25 },
  blue: { base: 121.32, baseShare: 76.02, slope: -57.66, slopeShare: 77.04 },
}

/**
 * A locked layer's solid (LAYLOCKFADECTL 50): its faces lighter and yellower,
 * not faded into the background as its 2D Wireframe lines are. No mix of the
 * shaded colour with another fits; the object's channels kept by `share`,
 * shaded, then raised by `tint`, land within 0.5 of the locked white box's
 * three faces (desktop solid-inquiry/d06: 220,220,160, 199,200,162 and
 * 114,119,171). A coloured locked solid is unprobed.
 */
const LOCKED = { share: [0.8187, 0.7332, 0.6053], tint: [13.5, 24.4, 1.21] }

/** The light's direction for a view looking along `-toViewer` with `up` drawn up. */
export function lightDirection(toViewer: Vec3, up: Vec3): Vec3 {
  const right = cross3(up, toViewer)
  return (
    normalize3(
      add3(
        add3(scale3(right, LIGHT.right), scale3(up, LIGHT.up)),
        scale3(toViewer, LIGHT.toward)
      )
    ) ?? toViewer
  )
}

/** A face's colour under the light: Gooch's cool blue where it turns away. */
export function goochFill(
  color: string,
  normal: Vec3,
  light: Vec3,
  locked = false
): string {
  const c = dot3(normal, light)
  const channel = (i: number) => {
    const ramp = i === 2 ? RAMP.blue : RAMP.redGreen
    let k = parseInt(color.slice(1 + 2 * i, 3 + 2 * i), 16) / 255
    if (locked) k *= LOCKED.share[i]
    const value =
      ramp.base +
      ramp.baseShare * k +
      (ramp.slope + ramp.slopeShare * k) * c +
      (locked ? LOCKED.tint[i] : 0)
    return Math.max(0, Math.min(255, Math.round(value)))
  }
  const hex = (n: number) => n.toString(16).padStart(2, "0")
  return `#${hex(channel(0))}${hex(channel(1))}${hex(channel(2))}`
}

/** The last solids and view {@link shadedCells} answered, and its answer. */
let last: {
  readonly solids: readonly ShadedSolid[]
  readonly toViewer: Vec3
  readonly up: Vec3
  readonly cells: readonly ShadedCell[]
} | null = null

const same = (a: Vec3, b: Vec3) => a.x === b.x && a.y === b.y && a.z === b.z

/**
 * The triangles of the solids that face the viewer, far first (by their
 * middles' depth: a painter's order, which a long face beside a short one
 * can get wrong, the more so the larger the cells; the edges drawn on top
 * are exact).
 */
export function shadedCells(
  solids: readonly ShadedSolid[],
  toViewer: Vec3,
  up: Vec3
): readonly ShadedCell[] {
  if (
    last &&
    same(last.toViewer, toViewer) &&
    same(last.up, up) &&
    last.solids.length === solids.length &&
    last.solids.every(
      (s, i) =>
        s.brep === solids[i].brep &&
        s.color === solids[i].color &&
        s.locked === solids[i].locked
    )
  ) {
    return last.cells
  }
  const light = lightDirection(toViewer, up)
  const found: { cell: ShadedCell; depth: number }[] = []
  for (const { brep, color, locked } of solids) {
    const mesh = brepMesh(brep)
    for (let i = 0; i < mesh.length; i++) {
      const t = mesh[i]
      if (dot3(t.normal, toViewer) <= 0) continue
      // A cell's second triangle shares its first's corner and diagonal.
      const next = mesh[i + 1]
      let points: Vec3[] = [t.a, t.b, t.c]
      if (next && next.normal === t.normal && next.a === t.a) {
        if (next.b === t.c) points = [t.a, t.b, t.c, next.c]
        else if (next.c === t.b) points = [t.a, next.b, t.b, t.c]
        if (points.length === 4) i++
      }
      const depth =
        points.reduce((sum, p) => sum + dot3(p, toViewer), 0) / points.length
      found.push({
        cell: {
          points,
          fill: goochFill(color, t.normal, light, locked),
          ...(locked ? { locked } : {}),
        },
        depth,
      })
    }
  }
  found.sort((p, q) => p.depth - q.depth)
  const cells = found.map((f) => f.cell)
  last = { solids, toViewer, up, cells }
  return cells
}
