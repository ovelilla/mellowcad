import { Vec3, normalize3, scale3 } from "../geometry/Vec3"
import { edgeTrace } from "../geometry/brepCurves"
import { surfaceFrame, surfacePoint } from "../geometry/faceDomains"
import { faceRegion } from "../geometry/faceRegions"
import { centroidOf, regionMoments } from "../geometry/massProperties"
import { planarFace } from "../geometry/solids"
import { cross3 } from "../geometry/Vec3"
import { Entity, EntityId, Solid3dEntity } from "./entityTypes"
import { solidEdgeEntity } from "./solids"

/**
 * A face, an edge or a vertex of a solid, by its index in the B-rep: what a
 * Ctrl+click selects (AutoCAD's subobjects). An index outlives a transform,
 * which keeps the B-rep's order, so the frame a tool reads in never changes it.
 */
export interface SolidSubobject {
  readonly kind: "face" | "edge" | "vertex"
  readonly index: number
}

/** A subobject of the solid of `id`. */
export interface SubobjectRef extends SolidSubobject {
  readonly id: EntityId
}

export function sameSubobject(a: SubobjectRef, b: SubobjectRef): boolean {
  return a.id === b.id && a.kind === b.kind && a.index === b.index
}

/**
 * The edges a subobject shows by, as the objects they draw as: a face's
 * round its loops, an edge itself, none for a vertex (desktop: a face glows
 * by its edges, Ctrl held over it or selected).
 */
export function subobjectEdgeEntities(
  solid: Solid3dEntity,
  sub: SolidSubobject
): Entity[] {
  const indices =
    sub.kind === "face"
      ? [
          ...new Set(
            (solid.brep.faces[sub.index]?.loops ?? []).flatMap((loop) =>
              loop.map((c) => c.edge)
            )
          ),
        ]
      : sub.kind === "edge"
        ? [sub.index]
        : []
  return indices.flatMap((i) => {
    const entity = solidEdgeEntity(solid, i)
    return entity ? [entity] : []
  })
}

/**
 * Where a selected subobject's grip stands and how it lies: a face's at its
 * centre, a disc in its tangent plane (`normal`); an edge's at its middle, a
 * bar along it (`along`); a vertex's on it (desktop: red when selected, a
 * face's flattened as its plane is seen).
 */
export interface SubobjectGrip {
  readonly point: Vec3
  readonly normal?: Vec3
  readonly along?: Vec3
}

export function subobjectGrip(
  solid: Solid3dEntity,
  sub: SolidSubobject
): SubobjectGrip | null {
  const { brep } = solid
  switch (sub.kind) {
    case "vertex": {
      const p = brep.vertices[sub.index]
      return p ? { point: p } : null
    }
    case "edge": {
      const edge = brep.edges[sub.index]
      if (!edge || edge.curve.kind === "point") return null
      const trace = edgeTrace(brep, edge)
      const t = (trace.t0 + trace.t1) / 2
      const along = normalize3(trace.derivative(t))
      return { point: trace.point(t), ...(along ? { along } : {}) }
    }
    case "face": {
      const face = brep.faces[sub.index]
      if (!face) return null
      if (face.surface.kind === "plane") {
        const flat = planarFace(brep, face)
        const m = regionMoments([flat.face], flat.axes, flat.elevation, {
          x: 0,
          y: 0,
        })
        return {
          point: m.measure > 0 ? centroidOf(m) : brep.vertices[0],
          normal: face.surface.normal,
        }
      }
      // A curved face's at the middle of its parameters.
      const region = faceRegion(brep, face)
      if (!region) return null
      const u = (region.domain.u[0] + region.domain.u[1]) / 2
      const v = (region.domain.v[0] + region.domain.v[1]) / 2
      const { du, dv } = surfaceFrame(region.surface, u, v)
      const n = normalize3(cross3(du, dv))
      return {
        point: surfacePoint(region.surface, u, v),
        ...(n ? { normal: scale3(n, region.sense) } : {}),
      }
    }
  }
}
