import { Vec2, V } from "../../geometry/Vec2"
import { Vec3, withZ } from "../../geometry/Vec3"
import {
  arcEndPoint,
  arcMidpoint,
  arcStartPoint,
  attributeDefinitionText,
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
  textInsertionPoint,
} from "../../domain/entities"
import { normalizeAngle, polarPoint } from "../../geometry/primitives"
import { ScenePrimitive } from "../../scene/types"
import { THEME } from "../../scene/theme"
import { ToolContext } from "./Tool"
import { DimensionPoint, Grip, GripShape } from "./selectToolState"
import {
  diameterFarRim,
  gripSegments,
  mtextWidthGrip,
  mtextWidthSides,
} from "./selectToolEdits"
import { arrayGrips } from "./arrayGrips"
import { arrayPlacement } from "../../domain/arrayEdits"

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
    // A locked object is selected with no grips (desktop properties/d02-1).
    if (!entity || !ctx.document.isEntityEditable(entity)) continue
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
        // Its fit points, or its control vertices, as it was made, each at its
        // own Z. AutoCAD's triangular grip that switches between the two is
        // not built.
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
      case "polyline3d":
        // Its vertices' grips alone, at their own Z: no midpoint grips
        // (desktop 3dpoly/d01).
        entity.vertices.forEach((vertex, index) => {
          grips.push({
            entityId: id,
            role: { kind: "vertex", index },
            world: vertex,
          })
        })
        break
      case "text":
      case "attdef": {
        // The justification point's grip and, for a justified text, the
        // insertion point's (DXF 10) too; either moves the text (desktop
        // text/d02-1). An attribute definition has TEXT's (desktop d03-5).
        const text =
          entity.type === "text" ? entity : attributeDefinitionText(entity)
        grips.push({
          entityId: id,
          role: { kind: "move" },
          world: text.position,
        })
        if (text.justify !== "left") {
          grips.push({
            entityId: id,
            role: { kind: "move" },
            world: textInsertionPoint(text),
          })
        }
        break
      }
      case "mtext":
        grips.push({
          entityId: id,
          role: { kind: "move" },
          world: entity.position,
        })
        for (const side of mtextWidthSides(entity)) {
          grips.push({
            entityId: id,
            role: { kind: "mtextWidth", side },
            world: mtextWidthGrip(entity, side),
          })
        }
        break
      case "dimension": {
        // AutoCAD's grips per kind (desktop d01-1): a linear or aligned one's
        // two origins, its dimension line's two ends and its text; a radius's
        // centre, rim point and text; a diameter's two rim points and text; an
        // angular one's vertex, two endpoints, a point on its arc and text.
        const g = dimensionGeometry(
          entity,
          ctx.document.getDimStyle(entity.styleId)
        )
        const dimGrip = (point: DimensionPoint, world: Vec2) =>
          grips.push({ entityId: id, role: { kind: "dimPoint", point }, world })
        switch (entity.kind) {
          case "linear":
          case "aligned":
            dimGrip("first", entity.first)
            dimGrip("second", entity.second)
            dimGrip("line", g.lineStart)
            dimGrip("line", g.lineEnd)
            break
          case "radius":
            dimGrip("first", entity.first)
            dimGrip("second", entity.second)
            break
          case "diameter":
            dimGrip("rim", entity.second)
            dimGrip("rim", diameterFarRim(entity))
            break
          case "angular":
            if (entity.vertex) dimGrip("vertex", entity.vertex)
            dimGrip("first", entity.first)
            dimGrip("second", entity.second)
            dimGrip("line", g.lineMidpoint)
            break
        }
        dimGrip("text", g.textPoint)
        break
      }
      case "hatch": {
        // A non-associative hatch's grips (desktop hatch/d03-1): a round one
        // at its extents' centre that moves it (d03-5, d04), and its loops'
        // as a polyline's — a square per vertex, a segment's midpoint that
        // stretches a straight edge or bends an arc — numbered loop after
        // loop. The hover menus' Origin Point, Hatch Angle, Hatch Scale,
        // Add / Remove Vertex and Convert to Arc are not built.
        const b = entityBounds(entity, ctx.blocks)
        grips.push({
          entityId: id,
          role: { kind: "move" },
          world: V.midpoint(b.min, b.max),
          shape: "round",
        })
        entity.loops
          .flatMap((loop) => loop.vertices)
          .forEach((vertex, index) => {
            grips.push({
              entityId: id,
              role: { kind: "vertex", index },
              world: vertex,
            })
          })
        gripSegments(entity).forEach((seg, segmentIndex) => {
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
      }
      case "insert":
        // A block reference gets one grip, on its insertion point, exactly as
        // AutoCAD does: what is inside the block is edited in the definition.
        // An array gets its own instead (desktop arrays/d11).
        if (!entity.array) {
          grips.push({
            entityId: id,
            role: { kind: "move" },
            world: entity.position,
          })
          break
        }
        for (const grip of arrayGrips(
          entity.array,
          arrayPlacement(entity, ctx.blocks(entity.blockId))
        )) {
          grips.push({
            entityId: id,
            role:
              grip.role === "move"
                ? { kind: "move" }
                : { kind: "array", grip: grip.role },
            world: grip.at,
            ...(grip.along ? { shape: "arrow", along: grip.along } : {}),
          })
        }
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
    // WHY: edit grips read the work plane, not the object's; such objects only
    // move whole. A spline's points hold their Z, so its grips go anywhere.
    if (
      planeAxes(entity) &&
      entity.type !== "spline" &&
      grip.role.kind !== "move"
    )
      continue
    lifted.push({
      ...grip,
      world:
        (entity.type === "line" || entity.type === "polyline3d") &&
        "z" in grip.world
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
 * The scene primitives for one grip: a filled square in cold/hot colour, a
 * disc as wide where AutoCAD draws one round (a CV spline's vertices,
 * desktop spline/d09-1), or a triangle pointing `along` (a screen direction)
 * at an array's arrows (desktop arrays/d11).
 */
export function gripPrimitives(
  at: Vec2,
  hot: boolean,
  shape: GripShape = "square",
  along?: Vec2
): ScenePrimitive[] {
  const color = hot ? THEME.gripHot : THEME.grip
  if (shape === "arrow") {
    const length = along ? V.length(along) : 0
    const u = along && length > 0 ? V.scale(along, 1 / length) : { x: 1, y: 0 }
    const across = V.scale(V.perpendicular(u), GRIP_HALF_PX)
    const back = V.sub(at, V.scale(u, GRIP_HALF_PX))
    return [
      {
        kind: "path",
        points: [
          V.add(at, V.scale(u, GRIP_HALF_PX + 1)),
          V.add(back, across),
          V.sub(back, across),
        ],
        closed: true,
        fill: color,
        stroke: { color: "#ffffff", width: 1 },
      },
    ]
  }
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
  shape?: GripShape,
  along?: Vec2
): void {
  out.push(...gripPrimitives(at, hot, shape, along))
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
