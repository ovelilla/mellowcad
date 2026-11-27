import {
  Vec3,
  WORLD_X,
  WORLD_Z,
  add3,
  cross3,
  dot3,
  length3,
  normalize3,
  scale3,
  sub3,
} from "../geometry/Vec3"
import { faceNormal } from "../geometry/brepQueries"
import { Brep } from "../geometry/solids"
import { MODEL_TOLERANCE } from "../geometry/planarCurves"

/**
 * The axes AutoCAD lays on a solid's face at a point of it, as UCS Face and
 * the dynamic UCS do (AutoCAD 2027's console, probes ucs/p500–p553): Z the
 * outward normal there; X along the face's straight edge nearest the point,
 * or level (Z × normal) where that edge is upright or the face has no
 * straight edge, the WCS's X on a level face with none (a cylinder's cap,
 * p509, p540). Y completes them.
 */
export interface FaceAxes {
  readonly origin: Vec3
  readonly xAxis: Vec3
  readonly yAxis: Vec3
  readonly normal: Vec3
}

/** Below this a direction's component counts as none: 1e-9 of a unit vector. */
const LEVEL = 1e-9

export function faceAxesAt(
  brep: Brep,
  faceIndex: number,
  point: Vec3,
  /** X kept from where the cursor came onto the face (desktop ucs/d10), if it still lies in it. */
  keptX?: Vec3
): FaceAxes | null {
  const face = brep.faces[faceIndex]
  if (!face) return null
  const normal = normalize3(faceNormal(brep, face, point))
  if (!normal) return null
  const kept = keptX && Math.abs(dot3(keptX, normal)) < 1e-6 ? keptX : null
  const xAxis = kept ?? faceXAxis(brep, faceIndex, point, normal)
  return { origin: point, xAxis, yAxis: cross3(normal, xAxis), normal }
}

/**
 * The X axis a face's point gives: its nearest straight edge's direction
 * (p524–p531, p542, p551) — an upright one making it level instead (p533,
 * p535, p543) —, signed downwards first, then towards the WCS's +X, then its
 * −Y (p524, p528, p547, p548, p552: the WCS's, whatever the UCS).
 */
function faceXAxis(
  brep: Brep,
  faceIndex: number,
  point: Vec3,
  normal: Vec3
): Vec3 {
  // A level face's normal off Z by rounding alone (a cap made in a turned
  // UCS) is level too: its X the WCS's, not the noise's.
  const across = cross3(WORLD_Z, normal)
  const level =
    length3(across) > 1e-9 ? (normalize3(across) ?? WORLD_X) : WORLD_X
  const edge = nearestStraightEdge(brep, faceIndex, point)
  if (!edge) return level
  if (Math.abs(Math.abs(dot3(edge, WORLD_Z)) - 1) < 1e-9) return level
  return signed(edge)
}

function signed(d: Vec3): Vec3 {
  const flip =
    d.z < -LEVEL
      ? false
      : d.z > LEVEL
        ? true
        : d.x > LEVEL
          ? false
          : d.x < -LEVEL
            ? true
            : d.y > 0
  return flip ? scale3(d, -1) : d
}

/** The unit direction of the face's straight edge nearest `point`, if it has one. */
function nearestStraightEdge(
  brep: Brep,
  faceIndex: number,
  point: Vec3
): Vec3 | null {
  let best: { d: Vec3; distance: number } | null = null
  for (const loop of brep.faces[faceIndex].loops) {
    for (const { edge: e } of loop) {
      const edge = brep.edges[e]
      if (edge.curve.kind !== "line") continue
      const a = brep.vertices[edge.start]
      const b = brep.vertices[edge.end]
      const d = normalize3(sub3(b, a))
      if (!d) continue
      const t = Math.max(
        0,
        Math.min(length3(sub3(b, a)), dot3(sub3(point, a), d))
      )
      const distance = length3(sub3(point, add3(a, scale3(d, t))))
      // A tie keeps the edge met first (p549, p550: both picks are 3 off two
      // edges; AutoCAD's own order there is unverified).
      if (!best || distance < best.distance - MODEL_TOLERANCE) {
        best = { d, distance }
      }
    }
  }
  return best?.d ?? null
}

/** The axes turned 180° about X (Xflip: Y and Z reversed) or Y (Yflip: X and Z). */
export function flippedFaceAxes(axes: FaceAxes, about: "x" | "y"): FaceAxes {
  return about === "x"
    ? {
        ...axes,
        yAxis: scale3(axes.yAxis, -1),
        normal: scale3(axes.normal, -1),
      }
    : {
        ...axes,
        xAxis: scale3(axes.xAxis, -1),
        normal: scale3(axes.normal, -1),
      }
}
