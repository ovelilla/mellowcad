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

export interface ShadedTriangle {
  readonly points: readonly [Vec3, Vec3, Vec3]
  readonly fill: string
}

/** A solid to shade and the colour it is drawn in, `#rrggbb` (index 7 white). */
export interface ShadedSolid {
  readonly brep: Brep
  readonly color: string
}

/**
 * The default lighting's direction in the view (DEFAULTLIGHTING 1: it
 * follows the viewpoint), as right, up and towards the viewer: fitted to
 * visualstyle/p03, where a white box seen from SW Isometric shows its top
 * at 130, its left face at 122 and its right one at 85.
 */
const LIGHT = { right: -0.323, up: 0.267, toward: 0.908 }

/**
 * A white face's grey for `cos` of its angle to the light, `BASE + SLOPE ·
 * cos` (p03: 70 + 81 cos of 255), and the blue the cool side takes on, up to
 * {@link COOL} where it turns from the light (85, 85, 101 on the box's shaded
 * face). A coloured face here is its colour so scaled: AutoCAD's tints a
 * blue one towards teal on its shaded side (p03), which no Gooch pair of
 * warm and cool fitted to the grey reproduces.
 */
const BASE = 0.274
const SLOPE = 0.318
const COOL = 39

/** The least share of its colour a face turned from the light keeps. */
const DARKEST = 0.06

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
export function goochFill(color: string, normal: Vec3, light: Vec3): string {
  const c = dot3(normal, light)
  const share = Math.max(BASE + SLOPE * c, DARKEST)
  const cool = COOL * (1 - (1 + c) / 2)
  const channel = (offset: number, tint: number) => {
    const value = parseInt(color.slice(offset, offset + 2), 16)
    return Math.max(0, Math.min(255, Math.round(value * share + tint)))
  }
  const hex = (n: number) => n.toString(16).padStart(2, "0")
  return `#${hex(channel(1, 0))}${hex(channel(3, 0))}${hex(channel(5, cool))}`
}

/** The last solids and view {@link shadedTriangles} answered, and its answer. */
let last: {
  readonly solids: readonly ShadedSolid[]
  readonly toViewer: Vec3
  readonly up: Vec3
  readonly triangles: readonly ShadedTriangle[]
} | null = null

const same = (a: Vec3, b: Vec3) => a.x === b.x && a.y === b.y && a.z === b.z

/**
 * The triangles of the solids that face the viewer, far first (by their
 * middles' depth: a painter's order, which a long face beside a short one
 * can get wrong, the more so the larger the cells; the edges drawn on top
 * are exact).
 */
export function shadedTriangles(
  solids: readonly ShadedSolid[],
  toViewer: Vec3,
  up: Vec3
): readonly ShadedTriangle[] {
  if (
    last &&
    same(last.toViewer, toViewer) &&
    same(last.up, up) &&
    last.solids.length === solids.length &&
    last.solids.every(
      (s, i) => s.brep === solids[i].brep && s.color === solids[i].color
    )
  ) {
    return last.triangles
  }
  const light = lightDirection(toViewer, up)
  const found: { triangle: ShadedTriangle; depth: number }[] = []
  for (const { brep, color } of solids) {
    for (const t of brepMesh(brep)) {
      if (dot3(t.normal, toViewer) <= 0) continue
      found.push({
        triangle: {
          points: [t.a, t.b, t.c],
          fill: goochFill(color, t.normal, light),
        },
        depth:
          (dot3(t.a, toViewer) + dot3(t.b, toViewer) + dot3(t.c, toViewer)) / 3,
      })
    }
  }
  found.sort((p, q) => p.depth - q.depth)
  const triangles = found.map((f) => f.triangle)
  last = { solids, toViewer, up, triangles }
  return triangles
}
