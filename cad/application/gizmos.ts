import { Vec2, V } from "../geometry/Vec2"
import { Vec3, add3, cross3, normalize3, scale3 } from "../geometry/Vec3"
import { closestPointOnSegment } from "../geometry/primitives"
import { ScenePrimitive } from "../scene/types"
import { THEME } from "../scene/theme"
import { Viewport } from "./Viewport"

/**
 * AutoCAD's 3D gizmos, drawn on the screen at a fixed size wherever their
 * centre is (desktop 3dmove/d01, 3drotate/d01): 3DMOVE's three arrows with
 * the squares between them, 3DROTATE's three rings, X red, Y green and Z
 * blue, the one under the cursor yellow.
 */

/** A gizmo's axes, unit and square, in the WCS: the WCS's by default (its menu's Align Gizmo With ▸ World). */
export interface GizmoAxes {
  readonly x: Vec3
  readonly y: Vec3
  readonly z: Vec3
}

export const WORLD_GIZMO: GizmoAxes = {
  x: { x: 1, y: 0, z: 0 },
  y: { x: 0, y: 1, z: 0 },
  z: { x: 0, y: 0, z: 1 },
}

export type GizmoAxis = "x" | "y" | "z"
/** A move gizmo's constraint: an axis, or the plane of two (its menu's Set Constraint ▸ XY, YZ, ZX). */
export type MoveConstraint = GizmoAxis | "xy" | "yz" | "zx"

/** An arrow's length in pixels seen square on: d01-1's X arrow, 87 px from (-1.3,-2.2,1.6), is 96 foreshortened. */
const ARM_PX = 96
/** Where the squares between the arrows reach along them. */
const SQUARE = 0.4
/** The cone at an arrow's tip. */
const CONE_PX = 14
const CONE_HALF_PX = 4.5
/** A ring's radius on the screen, in pixels, seen square on (3drotate/d01-1). */
const RING_PX = 64
const RING_SAMPLES = 72
/** How near the cursor takes an arrow or a ring, in pixels. */
const HIT_PX = 6

const COLORS: Record<GizmoAxis, string> = {
  x: THEME.gizmoX,
  y: THEME.gizmoY,
  z: THEME.gizmoZ,
}

/** One world unit along `d` from `at`, as far on the screen as a pixel is on the view plane. */
function worldPerPixel(viewport: Viewport): number {
  return 1 / viewport.scale
}

function armEnd(viewport: Viewport, center: Vec3, axis: Vec3): Vec3 {
  return add3(center, scale3(axis, ARM_PX * worldPerPixel(viewport)))
}

/** The move gizmo, `hot` its axis or square under the cursor or taken. */
export function moveGizmo(
  viewport: Viewport,
  center: Vec3,
  axes: GizmoAxes,
  hot: MoveConstraint | null
): ScenePrimitive[] {
  const out: ScenePrimitive[] = []
  const c = viewport.worldToScreen(center)
  const unit = ARM_PX * worldPerPixel(viewport)
  const at = (a: GizmoAxis, k: number) =>
    viewport.worldToScreen(add3(center, scale3(axes[a], unit * k)))
  for (const [a, b] of [
    ["x", "y"],
    ["y", "z"],
    ["z", "x"],
  ] as const) {
    const plane = `${a}${b}` as MoveConstraint
    const corner = viewport.worldToScreen(
      add3(
        add3(center, scale3(axes[a], unit * SQUARE)),
        scale3(axes[b], unit * SQUARE)
      )
    )
    const lit = hot === plane
    if (lit) {
      out.push({
        kind: "path",
        points: [c, at(a, SQUARE), corner, at(b, SQUARE)],
        closed: true,
        fill: THEME.gizmoHotFill,
      })
    }
    // Each square's two sides in the colours of the arrows they leave.
    out.push(
      {
        kind: "segment",
        a: at(a, SQUARE),
        b: corner,
        stroke: { color: lit ? THEME.gizmoHot : COLORS[b], width: 1 },
      },
      {
        kind: "segment",
        a: at(b, SQUARE),
        b: corner,
        stroke: { color: lit ? THEME.gizmoHot : COLORS[a], width: 1 },
      }
    )
  }
  for (const a of ["x", "y", "z"] as const) {
    const tip = at(a, 1)
    const lit =
      hot === a || (hot !== null && hot.length === 2 && hot.includes(a))
    const color = lit ? THEME.gizmoHot : COLORS[a]
    const along = V.sub(tip, c)
    const length = V.length(along)
    if (!(length > 2)) continue
    const unitDir = V.scale(along, 1 / length)
    const cone = Math.min(CONE_PX, length / 3)
    const base = V.sub(tip, V.scale(unitDir, cone))
    const side = V.scale({ x: -unitDir.y, y: unitDir.x }, CONE_HALF_PX)
    out.push(
      {
        kind: "segment",
        a: c,
        b: base,
        stroke: { color, width: 3 },
      },
      {
        kind: "path",
        points: [tip, V.add(base, side), V.sub(base, side)],
        closed: true,
        fill: color,
        stroke: { color, width: 1 },
      }
    )
  }
  out.push(baseBox(c))
  return out
}

/** The small box at a gizmo's centre, its base grip. */
function baseBox(c: Vec2): ScenePrimitive {
  return {
    kind: "path",
    points: [
      { x: c.x - 4, y: c.y },
      { x: c.x, y: c.y - 3 },
      { x: c.x + 4, y: c.y },
      { x: c.x, y: c.y + 3 },
    ],
    closed: true,
    fill: THEME.gizmoBase,
    stroke: { color: THEME.gizmoBaseEdge, width: 1 },
  }
}

/** The move gizmo's axis or square under `screen`: an arrow before a square. */
export function moveGizmoHit(
  viewport: Viewport,
  center: Vec3,
  axes: GizmoAxes,
  screen: Vec2
): MoveConstraint | null {
  const c = viewport.worldToScreen(center)
  let best: { axis: GizmoAxis; distance: number } | null = null
  for (const a of ["x", "y", "z"] as const) {
    const tip = viewport.worldToScreen(armEnd(viewport, center, axes[a]))
    if (V.length(V.sub(tip, c)) <= 2) continue
    const { distance } = closestPointOnSegment(c, tip, screen)
    if (distance <= HIT_PX && (!best || distance < best.distance)) {
      best = { axis: a, distance }
    }
  }
  if (best) return best.axis
  const unit = ARM_PX * worldPerPixel(viewport)
  for (const [a, b] of [
    ["x", "y"],
    ["y", "z"],
    ["z", "x"],
  ] as const) {
    const quad = [
      center,
      add3(center, scale3(axes[a], unit * SQUARE)),
      add3(
        add3(center, scale3(axes[a], unit * SQUARE)),
        scale3(axes[b], unit * SQUARE)
      ),
      add3(center, scale3(axes[b], unit * SQUARE)),
    ].map((p) => viewport.worldToScreen(p))
    if (insideQuad(quad, screen)) return `${a}${b}` as MoveConstraint
  }
  return null
}

function insideQuad(quad: readonly Vec2[], p: Vec2): boolean {
  let inside = false
  for (let i = 0, j = quad.length - 1; i < quad.length; j = i++) {
    const a = quad[i]
    const b = quad[j]
    if (
      a.y > p.y !== b.y > p.y &&
      p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x
    ) {
      inside = !inside
    }
  }
  return inside
}

/** The points of the ring about `axis`, on the screen. */
function ring(
  viewport: Viewport,
  center: Vec3,
  axes: GizmoAxes,
  axis: GizmoAxis
): { screen: Vec2; world: Vec3 }[] {
  const [u, v] =
    axis === "x"
      ? [axes.y, axes.z]
      : axis === "y"
        ? [axes.z, axes.x]
        : [axes.x, axes.y]
  const r = RING_PX * worldPerPixel(viewport)
  const out: { screen: Vec2; world: Vec3 }[] = []
  for (let i = 0; i <= RING_SAMPLES; i++) {
    const t = (2 * Math.PI * i) / RING_SAMPLES
    const world = add3(
      center,
      add3(scale3(u, r * Math.cos(t)), scale3(v, r * Math.sin(t)))
    )
    out.push({ screen: viewport.worldToScreen(world), world })
  }
  return out
}

/**
 * The rotate gizmo: a ring about each axis, its half towards the viewer
 * drawn broad (3drotate/d01-2), `hot` the ring under the cursor or taken,
 * with its axis drawn through the centre.
 */
export function rotateGizmo(
  viewport: Viewport,
  center: Vec3,
  axes: GizmoAxes,
  hot: GizmoAxis | null
): ScenePrimitive[] {
  const out: ScenePrimitive[] = []
  const toViewer = viewport.direction
  for (const a of ["x", "y", "z"] as const) {
    const color = hot === a ? THEME.gizmoHot : COLORS[a]
    const points = ring(viewport, center, axes, a)
    out.push({
      kind: "path",
      points: points.map((p) => p.screen),
      stroke: { color, width: 1 },
    })
    // The near half, broad.
    let run: Vec2[] = []
    const flush = () => {
      if (run.length > 1) {
        out.push({ kind: "path", points: run, stroke: { color, width: 3 } })
      }
      run = []
    }
    for (const p of points) {
      const off = add3(p.world, scale3(center, -1))
      if (off.x * toViewer.x + off.y * toViewer.y + off.z * toViewer.z > 0) {
        run.push(p.screen)
      } else flush()
    }
    flush()
  }
  if (hot) out.push(...axisLine(viewport, center, axes[hot], COLORS[hot]))
  out.push(baseBox(viewport.worldToScreen(center)))
  return out
}

/** The rotate gizmo's ring under `screen`, the nearest. */
export function rotateGizmoHit(
  viewport: Viewport,
  center: Vec3,
  axes: GizmoAxes,
  screen: Vec2
): GizmoAxis | null {
  let best: { axis: GizmoAxis; distance: number } | null = null
  for (const a of ["x", "y", "z"] as const) {
    const points = ring(viewport, center, axes, a)
    for (let i = 1; i < points.length; i++) {
      const { distance } = closestPointOnSegment(
        points[i - 1].screen,
        points[i].screen,
        screen
      )
      if (distance <= HIT_PX && (!best || distance < best.distance)) {
        best = { axis: a, distance }
      }
    }
  }
  return best?.axis ?? null
}

/**
 * An axis through the gizmo's centre, as far as the view reaches, in its
 * colour: what the gizmo shows of the axis under the cursor or taken
 * (3dmove/d01-2, 3drotate/d01-2).
 */
export function axisLine(
  viewport: Viewport,
  center: Vec3,
  axis: Vec3,
  color: string
): ScenePrimitive[] {
  const c = viewport.worldToScreen(center)
  const d = V.sub(viewport.worldToScreen(add3(center, axis)), c)
  const length = V.length(d)
  if (!(length > 1e-9)) return []
  const far = V.scale(d, 1e5 / length)
  return [
    {
      kind: "segment",
      a: V.sub(c, far),
      b: V.add(c, far),
      stroke: { color, width: 1 },
    },
  ]
}

/** The colour of an axis of the gizmos. */
export function gizmoAxisColor(axis: GizmoAxis): string {
  return COLORS[axis]
}

/** The axes a constraint keeps the move in: one, or the two of its plane. */
export function constraintDirections(
  axes: GizmoAxes,
  constraint: MoveConstraint
): Vec3[] {
  return constraint.split("").map((a) => axes[a as GizmoAxis])
}

/** The normal of a move constrained to a plane, for reading the cursor on it. */
export function constraintNormal(
  axes: GizmoAxes,
  constraint: MoveConstraint
): Vec3 | null {
  if (constraint.length !== 2) return null
  const [a, b] = constraintDirections(axes, constraint)
  return normalize3(cross3(a, b))
}
