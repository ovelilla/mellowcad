import { Vec2, V } from "../../geometry/Vec2"
import { Vec3, withZ } from "../../geometry/Vec3"
import {
  arcEndPoint,
  arcMidpoint,
  arcStartPoint,
  dimensionGeometry,
  Entity,
  ellipseEndPoint,
  ellipsePointAt,
  ellipseStartPoint,
  entityBounds,
  isFullEllipse,
  entityPointToWorld,
  lineEndZ,
  lineStartZ,
  planeAxes,
  PolylineSegmentGeometry,
  polylineSegmentGeometries,
} from "../../domain/entities"
import { normalizeAngle, polarPoint } from "../../geometry/primitives"
import { ScenePrimitive } from "../../scene/types"
import { THEME } from "../../scene/theme"
import { ToolContext } from "./Tool"
import { Grip, GripShape } from "./selectToolState"
import { mtextWidthGrip } from "./selectToolEdits"

/** Half-size (screen pixels) of the small square grips drawn on a selection. */
export const GRIP_HALF_PX = 4

/** Screen-pixel radius within which a click grabs an endpoint grip. */
export const GRIP_PICK_PX = 6

/** Every grip of the current selection (per object type). */
export function selectedGrips(ctx: ToolContext): Grip[] {
  // A line's grips carry their Z already (`Vec3`): its ends are read by their
  // own heights, which in plan a vertical line cannot tell apart.
  const grips: (Omit<Grip, "world"> & { readonly world: Vec2 | Vec3 })[] = []
  for (const id of ctx.selection.toArray()) {
    const entity = ctx.document.get(id)
    if (!entity) continue
    switch (entity.type) {
      case "line": {
        const start = withZ(entity.start, lineStartZ(entity))
        const end = withZ(entity.end, lineEndZ(entity))
        grips.push({
          entityId: id,
          role: { kind: "lineEnd", end: "start" },
          world: start,
        })
        grips.push({
          entityId: id,
          role: { kind: "lineEnd", end: "end" },
          world: end,
        })
        grips.push({
          entityId: id,
          role: { kind: "move" },
          world: withZ(V.midpoint(start, end), (start.z + end.z) / 2),
        })
        break
      }
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
          role: { kind: "arcMiddle" },
          world: arcMidpoint(entity),
        })
        break
      case "ellipse": {
        // The centre and the four quadrants, kept off an arc's sweep, and an
        // arc's two ends; no hover menu on any (desktop ellipse/d07).
        grips.push({
          entityId: id,
          role: { kind: "move" },
          world: entity.center,
        })
        for (const quadrant of [0, 1, 2, 3] as const) {
          grips.push({
            entityId: id,
            role: { kind: "ellipseAxis", quadrant },
            world: ellipsePointAt(entity, (quadrant * Math.PI) / 2),
          })
        }
        if (!isFullEllipse(entity)) {
          grips.push({
            entityId: id,
            role: { kind: "ellipseEnd", end: "start" },
            world: ellipseStartPoint(entity),
          })
          grips.push({
            entityId: id,
            role: { kind: "ellipseEnd", end: "end" },
            world: ellipseEndPoint(entity),
          })
        }
        break
      }
      case "spline":
        // Its fit points, or its control vertices, as it was made. AutoCAD's
        // triangular grip that switches between the two is not built.
        entity.points.forEach((point, index) => {
          grips.push({
            entityId: id,
            role: { kind: "vertex", index },
            world: point,
            shape: vertexGripShape(entity),
          })
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
        // A midpoint grip per segment, whose default is Stretch: a straight
        // segment moves, an arc bends through the point (desktop pline/d09).
        // The hover menus' Add Vertex, Convert to Arc / Line are not built.
        polylineSegmentGeometries(entity).forEach((seg, segmentIndex) => {
          grips.push({
            entityId: id,
            role:
              seg.kind === "arc"
                ? { kind: "bulge", segmentIndex }
                : { kind: "stretchSegment", segmentIndex },
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
      case "mtext":
        grips.push({
          entityId: id,
          role: { kind: "move" },
          world: entity.position,
        })
        grips.push({
          entityId: id,
          role: { kind: "mtextWidth" },
          world: mtextWidthGrip(entity),
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
      case "attdef":
        break
      default: {
        const unhandled: never = entity
        void unhandled
      }
    }
  }
  const lifted: Grip[] = []
  for (const grip of grips) {
    const entity = ctx.document.get(grip.entityId)
    if (!entity) continue
    // WHY: edit grips read the work plane, not the object's; such objects only move whole.
    if (planeAxes(entity) && grip.role.kind !== "move") continue
    lifted.push({
      ...grip,
      world:
        entity.type === "line" && "z" in grip.world
          ? grip.world
          : entityPointToWorld(entity, grip.world),
    })
  }
  return lifted
}

/** A vertex grip's shape: round at a CV spline's (desktop spline/d09-1), square at a fit spline's (d08-1) and a polyline's. */
export function vertexGripShape(entity: Entity): GripShape {
  return entity.type === "spline" && entity.method === "cv" ? "round" : "square"
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
  return (
    a.entityId === b.entityId &&
    V.equals(a.world, b.world) &&
    a.world.z === b.world.z
  )
}

/** The midpoint of a polyline segment: the chord midpoint of a straight one, or
 * the arc midpoint of a curved one — where its segment grip sits. */
function segmentGripPoint(seg: PolylineSegmentGeometry): Vec2 {
  if (seg.kind === "line") return V.midpoint(seg.a, seg.b)
  let sweep = normalizeAngle(seg.endAngle - seg.startAngle)
  if (sweep < 1e-9) sweep = Math.PI * 2
  return polarPoint(seg.center, seg.radius, seg.startAngle + sweep / 2)
}

/**
 * The scene primitives for one grip: a filled square in cold/hot colour, or
 * a disc as wide where AutoCAD draws one round (a CV spline's vertices,
 * desktop spline/d09-1).
 */
export function gripPrimitives(
  at: Vec2,
  hot: boolean,
  shape: GripShape = "square"
): ScenePrimitive[] {
  const color = hot ? THEME.gripHot : THEME.grip
  if (shape === "round") {
    return [
      {
        kind: "circle",
        center: at,
        radius: GRIP_HALF_PX,
        fill: color,
        stroke: { color: "#ffffff", width: 1 },
      },
    ]
  }
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

/** Appends a small grip marker centred at a screen point. */
export function pushGrip(
  out: ScenePrimitive[],
  at: Vec2,
  hot: boolean,
  shape?: GripShape
): void {
  out.push(...gripPrimitives(at, hot, shape))
}

/**
 * Appends a segment's midpoint grip at a screen point: a thin rectangle lying
 * along `along` (a screen direction), as AutoCAD draws a polyline's (desktop
 * pline/d07).
 */
export function pushSegmentGrip(
  out: ScenePrimitive[],
  at: Vec2,
  along: Vec2,
  hot: boolean
): void {
  const length = V.length(along)
  const u = length > 0 ? V.scale(along, 1 / length) : { x: 1, y: 0 }
  const long = V.scale(u, GRIP_HALF_PX * 2)
  const across = V.scale(V.perpendicular(u), GRIP_HALF_PX * 0.625)
  out.push({
    kind: "path",
    points: [
      V.add(V.add(at, long), across),
      V.add(V.sub(at, long), across),
      V.sub(V.sub(at, long), across),
      V.sub(V.add(at, long), across),
    ],
    closed: true,
    fill: hot ? THEME.gripHot : THEME.grip,
    stroke: { color: "#ffffff", width: 1 },
  })
}
