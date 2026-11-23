import { Vec2 } from "../../geometry/Vec2"
import { Vec3 } from "../../geometry/Vec3"
import { arbitraryAxis, axesToWorld } from "../../geometry/ocs"
import { bsplinePoint } from "../../geometry/nurbs"
import { evenOddTrapezoids } from "../../geometry/trapezoids"
import {
  BlockLookup,
  Bounds,
  EllipseEntity,
  Entity,
  HatchEntity,
  LeaderEntity,
  LineEntity,
  RayEntity,
  SplineEntity,
  XlineEntity,
  carryOverrides,
  createLine,
  createPolyline,
  createPolyline3d,
  createSolid2d,
  ellipsePointAt,
  hatchGeometry,
  leaderGeometry,
  leaderLook,
  mleaderExploded,
  mleaderGeometry,
  mtextLineTexts,
  nextEntityId,
  solidFaceRegions,
  solidHasCurvedFaces,
  splineCurve,
  tableExploded,
  tableGeometry,
} from "../../domain/entities"
import { regionEdgeEntities } from "../../domain/regions"
import { DimStyle } from "../../domain/dimStyles"
import { DEFAULT_LAYER_ID } from "../../domain/layers"
import { CONTINUOUS } from "../../domain/linetypes"

/**
 * A name as AutoCAD 2027's R12 DXF writes it (probes dxf/x027, x028):
 * uppercase, every character but a letter, a digit, `$`, `-` and `_` an
 * underscore (the help says spaces), and at most 26 characters (the help
 * says 32: AutoCAD cut a 44-character layer name to 26).
 */
export function r12Name(name: string): string {
  return [...name.toUpperCase().replace(/[^\p{L}\p{N}$_-]/gu, "_")]
    .slice(0, R12_NAME_LENGTH)
    .join("")
}

const R12_NAME_LENGTH = 26

/**
 * One table's names in R12, each told apart: a name another took first
 * ends in a number counted per stem, as AutoCAD numbers them (x028:
 * `ABCDEFGHIJKLMNOPQRSTUVWXY0`, `…Y1`, `…Y2` after `…YZ`).
 */
export class R12Names {
  private readonly taken = new Set<string>()
  private readonly byName = new Map<string, string>()
  private readonly counts = new Map<string, number>()

  /** The R12 name of `name`, given it the first time it is asked for. */
  of(name: string): string {
    const key = name.toUpperCase()
    const known = this.byName.get(key)
    if (known !== undefined) return known
    let out = r12Name(name)
    if (this.taken.has(out)) {
      const stem = out.slice(0, R12_NAME_LENGTH - 1)
      let n = this.counts.get(stem) ?? 0
      do {
        const digits = String(n++)
        out = stem.slice(0, R12_NAME_LENGTH - digits.length) + digits
      } while (this.taken.has(out))
      this.counts.set(stem, n)
    }
    this.taken.add(out)
    this.byName.set(key, out)
    return out
  }
}

/** What R12 makes of an object it has no type for. */
export type R12Conversion =
  /** Nothing: AutoCAD's R12 leaves out images and wipeouts (r12.sh's images, wipeouts). */
  | { readonly kind: "dropped" }
  /** Objects of R12's own in its place. */
  | { readonly kind: "replaced"; readonly entities: readonly Entity[] }
  /**
   * A reference to an anonymous block of what it draws: `*X` for a
   * pattern's lines, `*U` for the rest. A hatch's reference carries its
   * layer and properties, its lines ByBlock; any other's is plain on layer
   * 0 and its pieces keep the object's (x027).
   */
  | {
      readonly kind: "block"
      readonly prefix: "*U" | "*X"
      readonly pieces: readonly Entity[]
      readonly dressed?: Entity
    }

/** What a conversion reads from the drawing. */
export interface R12Source {
  readonly blocks: BlockLookup
  dimStyle(id: string): DimStyle
  /** Where an XLINE or a RAY is cut: the drawing's extents. */
  readonly extents: Bounds | null
}

/**
 * How AutoCAD 2027's DXFOUT R12 writes each object R12 has no type for
 * (probe dxf/r12.sh: each fixture of AutoCAD's saved by it as R12; x027),
 * or `null` for one R12 has.
 */
export function r12Conversion(
  entity: Entity,
  source: R12Source
): R12Conversion | null {
  switch (entity.type) {
    case "image":
    case "wipeout":
      return { kind: "dropped" }
    case "xline":
    case "ray":
      return { kind: "replaced", entities: [clippedLine(entity, source)] }
    case "ellipse":
      return { kind: "replaced", entities: [ellipsePolyline(entity)] }
    case "spline":
      return { kind: "replaced", entities: [splinePolyline(entity)] }
    case "mtext":
      return block(mtextLineTexts(entity).map((t) => carryOverrides(entity, t)))
    case "leader":
      return block(leaderPieces(entity, source))
    case "mleader":
      return block(
        flat(
          mleaderExploded(entity, mleaderGeometry(entity), nextEntityId),
          source
        )
      )
    case "table":
      return block(
        flat(
          tableExploded(
            entity,
            tableGeometry(entity, source.blocks),
            nextEntityId
          ),
          source
        )
      )
    case "region":
      return block(flat(regionEdgeEntities(entity), source))
    case "solid3d":
      // WHY a curved face is not written: what AutoCAD's R12 makes of one
      // is unverified (r12.sh's box: the 4 edges of each face, 24 lines).
      if (solidHasCurvedFaces(entity)) return null
      return block(
        flat(
          solidFaceRegions(entity).flatMap((face) => regionEdgeEntities(face)),
          source
        )
      )
    case "hatch":
      return hatchConversion(entity)
    default:
      return null
  }
}

function block(pieces: readonly Entity[]): R12Conversion {
  return { kind: "block", prefix: "*U", pieces }
}

/**
 * Pieces as R12 holds them inside a block of its own: what R12 has no type
 * for broken up in place, never another block in it (r12.sh's mleaders:
 * the text of a multileader a TEXT in its `*U`).
 */
export function flat(pieces: readonly Entity[], source: R12Source): Entity[] {
  return pieces.flatMap((piece): Entity[] => {
    const conversion = r12Conversion(piece, source)
    if (conversion === null) return [piece]
    switch (conversion.kind) {
      case "dropped":
        return []
      case "replaced":
        return [...conversion.entities]
      case "block":
        return [...conversion.pieces]
    }
  })
}

/** The properties of `source` (no plane) on a 3D polyline or a line made of it. */
function dressed<T extends Entity>(source: Entity, target: T): T {
  return {
    ...target,
    layerId: source.layerId,
    ...(source.color !== undefined ? { color: source.color } : {}),
    ...(source.linetype !== undefined ? { linetype: source.linetype } : {}),
    ...(source.lineweight !== undefined
      ? { lineweight: source.lineweight }
      : {}),
    ...(source.linetypeScale !== undefined
      ? { linetypeScale: source.linetypeScale }
      : {}),
  }
}

/** A point of an object's plane in the WCS. */
function toWorld(entity: Entity, p: Vec2 | Vec3, z = 0): Vec3 {
  const ocs = { x: p.x, y: p.y, z: "z" in p ? p.z : z }
  const n = entity.normal
  const axes = n ? arbitraryAxis(n) : null
  return axes && !(n!.x === 0 && n!.y === 0 && n!.z > 0)
    ? axesToWorld(axes, ocs)
    : ocs
}

/**
 * An ellipse as a 3D polyline of 128 equal steps of its parameter, end to
 * end, as AutoCAD's R12 writes a whole one and an arc alike (f002: 129
 * vertices each).
 */
function ellipsePolyline(e: EllipseEntity) {
  const start = e.startParam ?? 0
  const end = e.endParam ?? 2 * Math.PI
  const sweep = end > start ? end - start : end - start + 2 * Math.PI
  const points: Vec3[] = []
  for (let i = 0; i <= ELLIPSE_STEPS; i++) {
    const t = start + (sweep * i) / ELLIPSE_STEPS
    points.push(toWorld(e, ellipsePointAt(e, t), e.elevation ?? 0))
  }
  return dressed(e, createPolyline3d(points, false, e.layerId))
}

const ELLIPSE_STEPS = 128

/**
 * A spline as a 3D polyline of 32 points per control point, at equal steps
 * of its knots from end to end, as AutoCAD's R12 writes one (f002: 128 for 4
 * control points, 192 for 6; x027: 160 for 5 at SPLINESEGS 4, so not it).
 */
function splinePolyline(e: SplineEntity) {
  const curve = splineCurve(e)
  const n = curve.controlPoints.length
  const from = curve.knots[curve.degree]
  const to = curve.knots[n]
  const count = SPLINE_POINTS_PER_CONTROL_POINT * n
  const points: Vec3[] = []
  for (let i = 0; i < count; i++) {
    const u = from + ((to - from) * i) / (count - 1)
    points.push(toWorld(e, bsplinePoint(curve, u)))
  }
  return dressed(e, createPolyline3d(points, false, e.layerId))
}

const SPLINE_POINTS_PER_CONTROL_POINT = 32

/**
 * An XLINE or a RAY as the line of it the drawing's extents hold, as
 * AutoCAD's R12 cuts one (r12.sh's xlines: a ray down from 100,0 to the
 * extents' bottom at −50); a direction along which it does not move leaves
 * that extent's bounds alone, and one that misses them is a line of no
 * length at its base point, as AutoCAD's ray from 50,20 was.
 */
function clippedLine(
  e: XlineEntity | RayEntity,
  source: R12Source
): LineEntity {
  const z = e.elevation ?? 0
  const base = { x: e.base.x, y: e.base.y, z }
  const d = { x: e.direction.x, y: e.direction.y, z: e.directionZ ?? 0 }
  let from = e.type === "ray" ? 0 : -Infinity
  let to = Infinity
  const box = source.extents
  if (box) {
    const slab = (p: number, v: number, min: number, max: number) => {
      if (Math.abs(v) < 1e-12) return
      const a = (min - p) / v
      const b = (max - p) / v
      from = Math.max(from, Math.min(a, b))
      to = Math.min(to, Math.max(a, b))
    }
    slab(base.x, d.x, box.min.x, box.max.x)
    slab(base.y, d.y, box.min.y, box.max.y)
  }
  if (!Number.isFinite(from) || !Number.isFinite(to) || from > to) {
    from = to = 0
  }
  const at = (t: number) => ({
    x: base.x + d.x * t,
    y: base.y + d.y * t,
    z: base.z + d.z * t,
  })
  return dressed(e, createLine(at(from), at(to), e.layerId))
}

/**
 * A leader as EXPLODE breaks it up (leader/p10, p16), which is what AutoCAD's
 * R12 writes in its block (r12.sh's leaders: a SOLID and a POLYLINE, a
 * spline's a 3D polyline); its text is an object of its own.
 */
function leaderPieces(e: LeaderEntity, source: R12Source): Entity[] {
  const g = leaderGeometry(e, leaderLook(e, source.dimStyle(e.styleId)))
  const pieces: Entity[] = []
  if (g.arrow) {
    const [tip, left, right] = g.arrow
    pieces.push(
      carryOverrides(e, createSolid2d([right, tip, left, left], e.layerId))
    )
  }
  if (g.curve) {
    const { id: _id, ...curve } = g.curve
    void _id
    const z = e.elevation ?? 0
    pieces.push({
      ...carryOverrides(e, { ...curve, id: nextEntityId() }),
      points: curve.points.map((p) => ({ ...p, z })),
    } as Entity)
  }
  if (g.path.length >= 2) {
    pieces.push(carryOverrides(e, createPolyline(g.path, false, e.layerId)))
  }
  return flat(pieces, source)
}

/**
 * A hatch as AutoCAD's R12 writes one (f002, r12.sh's hatchpat, x027): a
 * pattern a `*X` block of its lines, a solid fill a `*U` block of SOLIDs
 * and its outline's lines, all on layer 0, the lines ByBlock, the reference
 * on its layer with its colour and Continuous. A gradient's colour bands
 * are not written yet (`null`: counted as left out).
 */
function hatchConversion(e: HatchEntity): R12Conversion | null {
  if (e.gradient) return null
  const g = hatchGeometry(e)
  const z = e.elevation ?? 0
  const piece = <T extends Entity>(entity: T): T => ({
    ...entity,
    layerId: DEFAULT_LAYER_ID,
    color: "ByBlock",
  })
  const line = (a: Vec2, b: Vec2) =>
    piece(createLine(toWorld(e, a, z), toWorld(e, b, z)))
  const reference = {
    ...e,
    linetype: CONTINUOUS.name,
  }
  if (!g.solid) {
    return {
      kind: "block",
      prefix: "*X",
      pieces: g.lines.map(([a, b]) => line(a, b)),
      dressed: reference,
    }
  }
  // A fill's pieces are no ByBlock, but Continuous (f002's *U15).
  const filled = <T extends Entity>(entity: T): T => ({
    ...entity,
    layerId: DEFAULT_LAYER_ID,
    linetype: CONTINUOUS.name,
  })
  const solids = evenOddTrapezoids(g.rings).map(([a, b, c, d]) => {
    return {
      ...filled(createSolid2d([a, b, c, d])),
      ...(z !== 0 ? { elevation: z } : {}),
      ...(e.normal ? { normal: e.normal } : {}),
    }
  })
  const outline = g.rings.flatMap((ring) =>
    ring.map((a, i) =>
      filled(
        createLine(toWorld(e, a, z), toWorld(e, ring[(i + 1) % ring.length], z))
      )
    )
  )
  return {
    kind: "block",
    prefix: "*U",
    pieces: [...solids, ...outline],
    dressed: reference,
  }
}
