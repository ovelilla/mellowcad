import { Vec2 } from "../../geometry/Vec2"
import {
  Entity,
  EntityId,
  arcEndPoint,
  arcStartPoint,
  arcSweepAngle,
  carryOverrides,
  createPolyline,
  polylineSegmentGeometries,
} from "../../domain/entities"
import { ReplaceEntitiesCommand } from "../commands/entityCommands"
import { SelectionActionTool } from "./SelectionActionTool"
import { ToolContext } from "./Tool"

/** World tolerance within which two endpoints count as the same point. */
const JOIN_EPS = 1e-6

/**
 * AutoCAD's JOIN for lines, arcs and polylines: contiguous objects (sharing
 * endpoints) are merged into a single polyline. Objects are chained end-to-end;
 * a chain that closes back on itself becomes a closed polyline. Objects that do
 * not connect to any other selected object are left untouched. **Arc** segments
 * are preserved as polyline arc bulges, so joining lines and arcs yields a
 * curved polyline. Circles are ignored (a closed loop has no free endpoint).
 */
export class JoinTool extends SelectionActionTool {
  readonly id = "join"
  readonly shortcut = "j"

  protected run(entities: readonly Entity[], ctx: ToolContext): void {
    // Break every joinable source into its segments (arcs carry a bulge), tagged
    // with the source id so a merged chain knows which originals it consumed.
    const segments: JoinSegment[] = []
    const sourceOf = new Map<EntityId, Entity>()
    for (const entity of entities) {
      if (entity.type === "line") {
        segments.push({
          a: entity.start,
          b: entity.end,
          bulge: 0,
          source: entity.id,
        })
        sourceOf.set(entity.id, entity)
      } else if (entity.type === "arc") {
        segments.push({
          a: arcStartPoint(entity),
          b: arcEndPoint(entity),
          bulge: Math.tan(arcSweepAngle(entity) / 4), // CCW start→end
          source: entity.id,
        })
        sourceOf.set(entity.id, entity)
      } else if (entity.type === "polyline") {
        for (const seg of polylineSegmentGeometries(entity)) {
          segments.push({
            a: seg.a,
            b: seg.b,
            bulge: seg.kind === "arc" ? seg.bulge : 0,
            source: entity.id,
          })
        }
        sourceOf.set(entity.id, entity)
      }
    }
    if (segments.length === 0) return

    const removedIds: EntityId[] = []
    const added: Entity[] = []
    for (const chain of chainSegments(segments)) {
      // Only chains that actually merge two or more distinct objects change the
      // drawing; a component from a single object stays as it was.
      if (chain.sources.size < 2) continue
      // A lens (two objects sharing both endpoints) would close to just two
      // vertices, which the polyline model can't represent as a closed loop —
      // leave those unmerged for now.
      if (chain.closed && chain.vertices.length < 3) continue
      for (const id of chain.sources) removedIds.push(id)
      // The result is the source object grown, so it keeps that one's properties.
      const source = sourceOf.get(chain.firstSource)!
      added.push(
        carryOverrides(
          source,
          createPolyline(
            chain.vertices,
            chain.closed,
            source.layerId,
            chain.bulges
          )
        )
      )
    }
    if (added.length === 0) return

    ctx.execute(new ReplaceEntitiesCommand(removedIds, added))
    ctx.selection.set(added.map((polyline) => polyline.id))
  }
}

interface JoinSegment {
  readonly a: Vec2
  readonly b: Vec2
  /** AutoCAD bulge of the segment from `a` to `b` (0 = straight). */
  readonly bulge: number
  readonly source: EntityId
}

interface JoinChain {
  readonly vertices: Vec2[]
  /** Bulge per segment, aligned to `vertices` (reversed segments negate it). */
  readonly bulges: number[]
  readonly sources: Set<EntityId>
  /** The first source contributed, whose layer the merged polyline inherits. */
  readonly firstSource: EntityId
  readonly closed: boolean
}

function samePoint(p: Vec2, q: Vec2): boolean {
  return Math.abs(p.x - q.x) < JOIN_EPS && Math.abs(p.y - q.y) < JOIN_EPS
}

/**
 * Greedily chains segments that share endpoints into connected components. Each
 * component is grown from an unused segment in both directions, so a segment
 * given in any order still lands in the right chain. A segment appended in
 * reverse negates its bulge (the arc is traversed the other way). A component
 * whose ends coincide is reported as closed (with the duplicate vertex dropped).
 */
function chainSegments(segments: readonly JoinSegment[]): JoinChain[] {
  const used = new Array(segments.length).fill(false)
  const chains: JoinChain[] = []

  for (let i = 0; i < segments.length; i++) {
    if (used[i]) continue
    used[i] = true
    const seed = segments[i]
    const vertices: Vec2[] = [seed.a, seed.b]
    const bulges: number[] = [seed.bulge] // bulge for vertices[k] → vertices[k+1]
    const sources = new Set<EntityId>([seed.source])

    // Extend forward from the tail, then backward from the head.
    let grew = true
    while (grew) {
      grew = false
      const tail = vertices[vertices.length - 1]
      for (let j = 0; j < segments.length; j++) {
        if (used[j]) continue
        const s = segments[j]
        if (samePoint(s.a, tail)) {
          vertices.push(s.b)
          bulges.push(s.bulge)
        } else if (samePoint(s.b, tail)) {
          vertices.push(s.a)
          bulges.push(-s.bulge) // traversed b → a
        } else continue
        used[j] = true
        sources.add(s.source)
        grew = true
        break
      }
    }
    grew = true
    while (grew) {
      grew = false
      const head = vertices[0]
      for (let j = 0; j < segments.length; j++) {
        if (used[j]) continue
        const s = segments[j]
        if (samePoint(s.b, head)) {
          vertices.unshift(s.a)
          bulges.unshift(s.bulge) // s.a → head is a → b
        } else if (samePoint(s.a, head)) {
          vertices.unshift(s.b)
          bulges.unshift(-s.bulge) // s.b → head is b → a
        } else continue
        used[j] = true
        sources.add(s.source)
        grew = true
        break
      }
    }

    let closed = false
    if (
      vertices.length > 2 &&
      samePoint(vertices[0], vertices[vertices.length - 1])
    ) {
      vertices.pop() // drop the duplicated closing vertex; its bulge stays as
      // the closing segment's bulge (bulges already holds it as the last entry)
      closed = true
    }

    chains.push({ vertices, bulges, sources, firstSource: seed.source, closed })
  }

  return chains
}
