import { Vec2, V } from "../../geometry/Vec2"
import {
  arcEndPoint,
  arcMidpoint,
  arcStartPoint,
  dimensionGeometry,
  entityBounds,
  PolylineSegmentGeometry,
  polylineSegmentGeometries,
} from "../../domain/entities"
import { normalizeAngle, polarPoint } from "../../geometry/primitives"
import { ScenePrimitive } from "../../scene/types"
import { THEME } from "../../scene/theme"
import { ToolContext } from "./Tool"
import { Grip } from "./selectToolState"

/** Half-size (screen pixels) of the small square grips drawn on a selection. */
export const GRIP_HALF_PX = 4

/** Screen-pixel radius within which a click grabs an endpoint grip. */
export const GRIP_PICK_PX = 6

/** Every grip of the current selection (per object type). */
export function selectedGrips(ctx: ToolContext): Grip[] {
  const grips: Grip[] = []
  for (const id of ctx.selection.toArray()) {
    const entity = ctx.document.get(id)
    if (!entity) continue
    switch (entity.type) {
      case "line":
        grips.push({
          entityId: id,
          role: { kind: "lineEnd", end: "start" },
          world: entity.start,
        })
        grips.push({
          entityId: id,
          role: { kind: "lineEnd", end: "end" },
          world: entity.end,
        })
        grips.push({
          entityId: id,
          role: { kind: "move" },
          world: V.midpoint(entity.start, entity.end),
        })
        break
      case "circle":
        grips.push({
          entityId: id,
          role: { kind: "move" },
          world: entity.center,
        })
        for (const angle of [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2]) {
          grips.push({
            entityId: id,
            role: { kind: "radius" },
            world: polarPoint(entity.center, entity.radius, angle),
          })
        }
        break
      case "arc":
        grips.push({
          entityId: id,
          role: { kind: "move" },
          world: entity.center,
        })
        grips.push({
          entityId: id,
          role: { kind: "arcEnd", end: "start" },
          world: arcStartPoint(entity),
        })
        grips.push({
          entityId: id,
          role: { kind: "arcEnd", end: "end" },
          world: arcEndPoint(entity),
        })
        grips.push({
          entityId: id,
          role: { kind: "radius" },
          world: arcMidpoint(entity),
        })
        break
      case "ellipse":
        // Only the centre for now: AutoCAD also grips the four axis endpoints,
        // which resize the object rather than move it.
        grips.push({
          entityId: id,
          role: { kind: "move" },
          world: entity.center,
        })
        break
      case "polyline":
        entity.vertices.forEach((vertex, index) => {
          grips.push({
            entityId: id,
            role: { kind: "vertex", index },
            world: vertex,
          })
        })
        // A midpoint grip per segment: on a straight segment it inserts a new
        // vertex, on an arc segment it edits the curvature (AutoCAD's
        // multifunction midpoint grip).
        polylineSegmentGeometries(entity).forEach((seg, segmentIndex) => {
          grips.push({
            entityId: id,
            role:
              seg.kind === "arc"
                ? { kind: "bulge", segmentIndex }
                : { kind: "addVertex", segmentIndex },
            world: segmentGripPoint(seg),
          })
        })
        break
      case "text":
        // One grip on the justification point, as AutoCAD gives text.
        grips.push({
          entityId: id,
          role: { kind: "move" },
          world: entity.position,
        })
        break
      case "dimension": {
        // AutoCAD's draggable definition points: the two measured origins,
        // plus the dimension line, grabbed halfway along it. An angular
        // dimension adds the vertex it turns about.
        const g = dimensionGeometry(entity)
        grips.push({
          entityId: id,
          role: { kind: "dimPoint", point: "first" },
          world: entity.first,
        })
        grips.push({
          entityId: id,
          role: { kind: "dimPoint", point: "second" },
          world: entity.second,
        })
        if (entity.vertex) {
          grips.push({
            entityId: id,
            role: { kind: "dimPoint", point: "vertex" },
            world: entity.vertex,
          })
        }
        grips.push({
          entityId: id,
          role: { kind: "dimPoint", point: "line" },
          world: g.lineMidpoint,
        })
        break
      }
      case "hatch": {
        // AutoCAD gives a hatch one grip in the middle of its area, which
        // moves the whole fill; the boundary is edited on the objects it was
        // traced from.
        const b = entityBounds(entity, ctx.blocks)
        grips.push({
          entityId: id,
          role: { kind: "move" },
          world: V.midpoint(b.min, b.max),
        })
        break
      }
      case "insert":
        // A block reference gets one grip, on its insertion point, exactly as
        // AutoCAD does: what is inside the block is edited in the definition.
        grips.push({
          entityId: id,
          role: { kind: "move" },
          world: entity.position,
        })
        break
    }
  }
  return grips
}

/** The selected-object grip under `screen`, if any (nearest wins). */
export function hitGrip(screen: Vec2, ctx: ToolContext): Grip | null {
  let best: Grip | null = null
  let bestDist = GRIP_PICK_PX
  for (const grip of selectedGrips(ctx)) {
    const at = ctx.viewport.worldToScreen(grip.world)
    const dist = Math.hypot(at.x - screen.x, at.y - screen.y)
    if (dist <= bestDist) {
      bestDist = dist
      best = grip
    }
  }
  return best
}

/** Whether two grip references point at the same handle (entity + position). */
export function sameGrip(a: Grip | null, b: Grip | null): boolean {
  if (a === null || b === null) return a === b
  return a.entityId === b.entityId && V.equals(a.world, b.world)
}

/** The midpoint of a polyline segment: the chord midpoint of a straight one, or
 * the arc midpoint of a curved one — where its segment grip sits. */
function segmentGripPoint(seg: PolylineSegmentGeometry): Vec2 {
  if (seg.kind === "line") return V.midpoint(seg.a, seg.b)
  let sweep = normalizeAngle(seg.endAngle - seg.startAngle)
  if (sweep < 1e-9) sweep = Math.PI * 2
  return polarPoint(seg.center, seg.radius, seg.startAngle + sweep / 2)
}

/** The scene primitives for one grip: a filled square in cold/hot colour. */
export function gripPrimitives(at: Vec2, hot: boolean): ScenePrimitive[] {
  const color = hot ? THEME.gripHot : THEME.grip
  return [
    {
      kind: "rect",
      min: { x: at.x - GRIP_HALF_PX, y: at.y - GRIP_HALF_PX },
      width: GRIP_HALF_PX * 2,
      height: GRIP_HALF_PX * 2,
      fill: color,
      stroke: { color: "#ffffff", width: 1 },
    },
  ]
}

/** Appends a small square grip marker centred at a screen point. */
export function pushGrip(out: ScenePrimitive[], at: Vec2, hot: boolean): void {
  out.push(...gripPrimitives(at, hot))
}

/** Appends a small round grip marker (segment midpoint) at a screen point. */
export function pushSegmentGrip(
  out: ScenePrimitive[],
  at: Vec2,
  hot: boolean
): void {
  out.push({
    kind: "circle",
    center: at,
    radius: GRIP_HALF_PX,
    fill: hot ? THEME.gripHot : THEME.grip,
    stroke: { color: "#ffffff", width: 1 },
  })
}
