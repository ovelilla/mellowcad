import { V, Vec2 } from "../../geometry/Vec2"
import { Vec3 } from "../../geometry/Vec3"
import {
  Entity,
  EntityId,
  InsertEntity,
  entityPointToWorld,
  insertFlatGeometry,
  planeAxes,
  PolylineEntity,
  polylineSegmentGeometries,
  setPolylineBulge,
  translateEntity,
} from "../../domain/entities"
import { polarPoint } from "../../geometry/primitives"
import { ScenePrimitive, StrokeStyle } from "../../scene/types"
import { drawnColor, THEME } from "../../scene/theme"
import { arcScenePrimitive, entityScenePrimitive } from "../SceneBuilder"
import {
  buildLassoOverlay,
  buildSelectionBoxOverlay,
  buildSelectionPreview,
} from "./boxSelection"
import { PointerInput, ToolContext } from "./Tool"
import { SelectToolState } from "./selectToolState"
import { arrayPlacement, placeArrayPoint } from "../../domain/arrayEdits"
import { drawn } from "./ghostLook"
import {
  gripPrimitives,
  pushGrip,
  pushSegmentGrip,
  vertexGripShape,
  sameGrip,
  selectedGrips,
} from "./selectToolGrips"
import {
  arcStretchedThrough,
  arrayGripped,
  ellipseGripped,
  movedDimension,
  mtextWidthGrip,
  withRadius,
  withSegmentStretched,
  withVertexAt,
} from "./selectToolEdits"

type Phase<P extends SelectToolState["phase"]> = Extract<
  SelectToolState,
  { phase: P }
>

/**
 * The window or crossing under way, or the lasso, and what it would take
 * (SELECTIONPREVIEW 3, desktop erase/d02-1, d03-1).
 */
export function buildSelectionBox(
  state: Phase<"boxing" | "lasso">,
  ctx: ToolContext
): ScenePrimitive[] {
  return [
    ...(state.phase === "lasso"
      ? buildLassoOverlay(ctx.viewport, state.lasso)
      : buildSelectionBoxOverlay(
          ctx.viewport,
          state.startWorld,
          state.currentWorld
        )),
    ...buildSelectionPreview(ctx.viewport, ctx.document, state.preview),
  ]
}

/**
 * Grips shown on every selected line: cold by default, with the hovered grip
 * drawn hot to signal that the magnetic cursor has grabbed onto it. The
 * unselected entity under the cursor is preview-highlighted underneath
 * (AutoCAD's selection preview / rollover highlight).
 */
export function buildGrips(
  state: SelectToolState,
  ctx: ToolContext
): ScenePrimitive[] {
  const out: ScenePrimitive[] = []
  // A locked object glows not, its padlock saying why (desktop
  // properties/d01-1).
  if (state.phase === "idle" && state.hoverEntityId) {
    const entity = ctx.document.get(state.hoverEntityId)
    if (entity && ctx.document.isEntityEditable(entity)) {
      pushRolloverHighlight(out, entity, ctx)
    }
  }
  const hover = state.phase === "idle" ? (state.hoverGrip ?? null) : null
  const editable = ctx.selection
    .toArray()
    .map((id) => ctx.document.get(id))
    .filter(
      (entity): entity is Entity =>
        entity !== undefined && ctx.document.isEntityEditable(entity)
    )
  for (const entity of editable) {
    // A CV spline shows its control frame along with the vertex grips,
    // dashed as SPLINE draws it (desktop spline/d09-1, SPLINE-D61).
    if (entity.type === "spline" && entity.method === "cv") {
      out.push({
        kind: "path",
        points: entity.points.map((p) => ctx.viewport.worldToScreen(p)),
        closed: entity.closed,
        stroke: { color: THEME.crosshair, width: 1, dash: [2, 3] },
      })
    }
  }
  for (const entity of editable) {
    if (entity.type === "insert") out.push(...arrayRing(entity, ctx))
  }
  for (const grip of selectedGrips(ctx)) {
    const at = ctx.viewport.worldToScreen(grip.world)
    const hot = sameGrip(grip, hover)
    const entity = ctx.document.get(grip.entityId)
    if (
      entity?.type === "polyline" &&
      (grip.role.kind === "stretchSegment" || grip.role.kind === "bulge")
    ) {
      const along = segmentOnScreen(entity, grip.role.segmentIndex, ctx)
      pushSegmentGrip(out, at, along, hot)
    } else {
      pushGrip(
        out,
        at,
        hot,
        grip.shape,
        arrowOnScreen(grip.world, grip.along, ctx)
      )
    }
  }
  return out
}

/** Where an arrow grip points on the screen, from its heading in the drawing. */
export function arrowOnScreen(
  world: Vec3,
  along: Vec2 | undefined,
  ctx: ToolContext
): Vec2 | undefined {
  if (!along) return undefined
  return V.sub(
    ctx.viewport.worldToScreen({ ...V.add(world, along), z: world.z }),
    ctx.viewport.worldToScreen(world)
  )
}

/**
 * A polar array's ring, through its base point about its centre, drawn grey
 * while the array is selected (desktop arrays/d11-2, d05-1); none on an array
 * not level, which keeps only its move grips.
 */
function arrayRing(insert: InsertEntity, ctx: ToolContext): ScenePrimitive[] {
  const ring = insert.array
  if (ring?.kind !== "polar" || planeAxes(insert)) return []
  const place = arrayPlacement(insert, ctx.blocks(insert.blockId))
  const center = ctx.viewport.worldToScreen(
    entityPointToWorld(insert, placeArrayPoint(place, ring.center))
  )
  const through = ctx.viewport.worldToScreen(
    entityPointToWorld(insert, placeArrayPoint(place, ring.basePoint))
  )
  const radius = V.distance(center, through)
  return radius > 0
    ? [
        {
          kind: "circle",
          center,
          radius,
          stroke: { color: THEME.arrayRing, width: 1 },
        },
      ]
    : []
}

/** The dashed line from where a grip was taken to the cursor, on the screen (desktop arrays/d14a-1). */
export function gripRubberBand(from: Vec2, to: Vec2): ScenePrimitive {
  return {
    kind: "segment",
    a: from,
    b: to,
    stroke: { color: THEME.crosshair, width: 1, dash: [2, 3] },
  }
}

/**
 * An array's grip dragged: the array as the drag makes it, drawn as the
 * drawing draws it, a dashed line from where the grip was taken to the
 * cursor and the grip hot there (desktop arrays/d14a-1). A drag the grip
 * refuses shows no array.
 */
export function buildArrayGripEdit(
  state: Phase<"arrayGrip">,
  ctx: ToolContext
): ScenePrimitive[] {
  const { viewport } = ctx
  const insert = ctx.document.get(state.entityId)
  if (insert?.type !== "insert") return []
  const edited = arrayGripped(insert, state.role, state.current, ctx.blocks)
  const at = viewport.worldToScreen(state.origin)
  const out: ScenePrimitive[] = []
  if (edited) {
    out.push(
      ...arrayRing(edited, ctx),
      ...insertFlatGeometry(edited, ctx.blocks).flatMap((entity) =>
        drawn(ctx, entity, "plain")
      )
    )
  }
  out.push(
    gripRubberBand(
      at,
      viewport.worldToScreen({ ...state.current, z: state.origin.z })
    )
  )
  out.push(
    ...gripPrimitives(
      at,
      true,
      state.shape,
      arrowOnScreen(state.origin, state.along, ctx)
    )
  )
  return out
}

/**
 * What the cursor is over at `Command:`: the unselected entity whose preview
 * should be highlighted, if any, and whether the object under it is on a
 * locked layer (its padlock). Objects already in the selection are skipped:
 * they already read as selected (and show grips), so previewing them would
 * be redundant — exactly like AutoCAD, whose selection preview only previews
 * what a click would *add* to the selection.
 */
export function pickRolloverEntity(
  input: PointerInput,
  ctx: ToolContext
): { readonly id: EntityId | null; readonly locked: boolean } {
  const hit = ctx.pick(input.world)
  if (!hit) return { id: null, locked: false }
  return {
    id: ctx.selection.has(hit.id) ? null : hit.id,
    locked: !ctx.document.isEntityEditable(hit),
  }
}

/**
 * Draws AutoCAD's selection preview: the entity under the cursor is redrawn
 * with a thicker, lighter outline so the user sees exactly what a click would
 * pick before committing to the selection.
 */
function pushRolloverHighlight(
  out: ScenePrimitive[],
  entity: Entity,
  ctx: ToolContext
): void {
  out.push(
    ...entityScenePrimitive(
      ctx.viewport,
      entity,
      { color: THEME.entityHover, width: 2 },
      { blocks: ctx.blocks }
    )
  )
}

/** The rubber-band preview and hot grip while stretching a line's end. */
export function buildGripEdit(
  state: Phase<"grip">,
  ctx: ToolContext
): ScenePrimitive[] {
  const { viewport } = ctx
  const fixed = viewport.worldToScreen(state.fixed)
  const moving = viewport.worldToScreen(state.moving)
  return [
    {
      kind: "segment",
      a: fixed,
      b: moving,
      stroke: { color: THEME.preview, width: 1, dash: [6, 4] },
    },
    // Cold grip stays on the fixed end; the dragged end is hot.
    ...gripPrimitives(fixed, false),
    ...gripPrimitives(moving, true),
  ]
}

/**
 * The preview while a move grip or the selection drags: the selection as
 * itself, solid in each object's colour, with no grip and no rubber band
 * (desktop move/d08-1, MOVE-D8); a grip's object dashed, its grips and the hot
 * one.
 */
export function buildMoveEdit(
  state: Phase<"moveLine">,
  ctx: ToolContext
): ScenePrimitive[] {
  const { viewport } = ctx
  const delta = V.sub(state.current, state.origMid)
  if (state.dragsSelection) {
    return state.originals.flatMap((entity) =>
      entityScenePrimitive(
        viewport,
        translateEntity(entity, delta),
        {
          color: drawnColor(ctx.document.resolveEntityColor(entity)),
          width: 1,
        },
        { blocks: ctx.blocks }
      )
    )
  }
  const out: ScenePrimitive[] = []
  const stroke: StrokeStyle = { color: THEME.preview, width: 1, dash: [6, 4] }
  for (const entity of state.originals) {
    const moved = translateEntity(entity, delta)
    out.push(
      ...entityScenePrimitive(viewport, moved, stroke, {
        blocks: ctx.blocks,
      })
    )
    if (moved.type === "line") {
      out.push(...gripPrimitives(viewport.worldToScreen(moved.start), false))
      out.push(...gripPrimitives(viewport.worldToScreen(moved.end), false))
    }
  }
  // The grabbed base point (grip midpoint) is the hot grip.
  out.push(...gripPrimitives(viewport.worldToScreen(state.current), true))
  return out
}

/** The rubber-band circle/arc and hot handle while resizing a radius. */
export function buildRadiusEdit(
  state: Phase<"resizeRadius">,
  ctx: ToolContext
): ScenePrimitive[] {
  const { viewport } = ctx
  const entity = ctx.document.get(state.entityId)
  if (!entity) return []
  const stroke: StrokeStyle = { color: THEME.preview, width: 1, dash: [6, 4] }
  const preview = withRadius(entity, state.radius)
  const out: ScenePrimitive[] = []
  if (preview) out.push(...entityScenePrimitive(viewport, preview, stroke))
  // A thin radial guide from the centre to the hot handle.
  out.push({
    kind: "segment",
    a: viewport.worldToScreen(state.center),
    b: viewport.worldToScreen(state.handle),
    stroke: { color: THEME.preview, width: 1, dash: [2, 3] },
  })
  out.push(...gripPrimitives(viewport.worldToScreen(state.handle), true))
  return out
}

/** The rubber-band arc and hot endpoint while swinging an arc endpoint. */
export function buildArcAngleEdit(
  state: Phase<"arcAngle">,
  ctx: ToolContext
): ScenePrimitive[] {
  const { viewport } = ctx
  const arc = ctx.document.get(state.entityId)
  if (arc?.type !== "arc") return []
  const startAngle = state.end === "start" ? state.angle : arc.startAngle
  const endAngle = state.end === "end" ? state.angle : arc.endAngle
  const stroke: StrokeStyle = { color: THEME.preview, width: 1, dash: [6, 4] }
  const endpoint = polarPoint(state.center, state.radius, state.angle)
  return [
    arcScenePrimitive(
      viewport,
      state.center,
      state.radius,
      startAngle,
      endAngle,
      stroke
    ),
    ...gripPrimitives(viewport.worldToScreen(endpoint), true),
  ]
}

/**
 * The arc bent through the cursor while its middle grip stretches it, solid
 * in the object's own colour, the hot grip left where it was taken (desktop
 * arc/d08).
 */
export function buildArcStretch(
  state: Phase<"arcStretch">,
  ctx: ToolContext
): ScenePrimitive[] {
  const { viewport } = ctx
  const arc = ctx.document.get(state.entityId)
  if (arc?.type !== "arc") return []
  const preview = arcStretchedThrough(arc, state.current)
  const color = drawnColor(ctx.document.resolveEntityColor(arc))
  return [
    ...(preview
      ? entityScenePrimitive(viewport, preview, { color, width: 1 })
      : []),
    ...gripPrimitives(viewport.worldToScreen(state.origin), true),
  ]
}

/**
 * An ellipse reshaped by its quadrant or end grip: the ghost solid in the
 * object's own colour, an amber dashed line from the centre to the cursor,
 * the hot grip left where it was taken (desktop ellipse/d07-3, d07-7).
 */
export function buildEllipseGripEdit(
  state: Phase<"ellipseGrip">,
  ctx: ToolContext
): ScenePrimitive[] {
  const { viewport } = ctx
  const ellipse = ctx.document.get(state.entityId)
  if (ellipse?.type !== "ellipse") return []
  const preview = ellipseGripped(ellipse, state.role, state.current)
  const color = drawnColor(ctx.document.resolveEntityColor(ellipse))
  return [
    ...(preview
      ? entityScenePrimitive(viewport, preview, { color, width: 1 })
      : []),
    {
      kind: "segment",
      a: viewport.worldToScreen(state.center),
      b: viewport.worldToScreen(state.current),
      stroke: { color: THEME.dashedRubberBand, width: 1, dash: [2, 3] },
    },
    ...gripPrimitives(viewport.worldToScreen(state.origin), true),
  ]
}

/** The reshaped polyline or spline preview and hot grip while stretching a vertex. */
export function buildVertexEdit(
  state: Phase<"moveVertex">,
  ctx: ToolContext
): ScenePrimitive[] {
  const { viewport } = ctx
  const entity = ctx.document.get(state.entityId)
  const preview = entity && withVertexAt(entity, state.index, state.current)
  if (!preview) return []
  const stroke: StrokeStyle = { color: THEME.preview, width: 1, dash: [6, 4] }
  return [
    ...entityScenePrimitive(viewport, preview, stroke),
    ...gripPrimitives(
      viewport.worldToScreen(state.current),
      true,
      vertexGripShape(entity)
    ),
  ]
}

/** The stretched polyline preview and hot grip while a segment moves. */
export function buildSegmentStretch(
  state: Phase<"stretchSegment">,
  ctx: ToolContext
): ScenePrimitive[] {
  const { viewport } = ctx
  const poly = ctx.document.get(state.entityId)
  if (poly?.type !== "polyline") return []
  const preview = withSegmentStretched(
    poly,
    state.segmentIndex,
    V.sub(state.current, state.origin)
  )
  const stroke: StrokeStyle = { color: THEME.preview, width: 1, dash: [6, 4] }
  const out = entityScenePrimitive(viewport, preview, stroke)
  pushSegmentGrip(
    out,
    viewport.worldToScreen(state.current),
    segmentOnScreen(poly, state.segmentIndex, ctx),
    true
  )
  return out
}

/**
 * The screen direction a polyline segment's midpoint grip lies along: its
 * chord, which an arc's tangent at its midpoint runs parallel to.
 */
function segmentOnScreen(
  poly: PolylineEntity,
  segmentIndex: number,
  ctx: ToolContext
): Vec2 {
  const { a, b } = polylineSegmentGeometries(poly)[segmentIndex]
  return V.sub(
    ctx.viewport.worldToScreen(entityPointToWorld(poly, b)),
    ctx.viewport.worldToScreen(entityPointToWorld(poly, a))
  )
}

/** The re-curved polyline preview and hot grip while editing a bulge. */
export function buildBulgeEdit(
  state: Phase<"bulgeEdit">,
  ctx: ToolContext
): ScenePrimitive[] {
  const { viewport } = ctx
  const poly = ctx.document.get(state.entityId)
  if (poly?.type !== "polyline") return []
  const preview = setPolylineBulge(poly, state.segmentIndex, state.bulge)
  const stroke: StrokeStyle = { color: THEME.preview, width: 1, dash: [6, 4] }
  const out = entityScenePrimitive(viewport, preview, stroke)
  pushSegmentGrip(
    out,
    viewport.worldToScreen(state.current),
    segmentOnScreen(poly, state.segmentIndex, ctx),
    true
  )
  return out
}

/** The rewrapped text and its hot width grip while the width is dragged. */
export function buildMTextWidthEdit(
  state: Phase<"mtextWidth">,
  ctx: ToolContext
): ScenePrimitive[] {
  const { viewport } = ctx
  const mtext = ctx.document.get(state.entityId)
  if (mtext?.type !== "mtext") return []
  const preview = { ...mtext, width: state.width }
  const stroke: StrokeStyle = { color: THEME.preview, width: 1, dash: [6, 4] }
  return [
    ...entityScenePrimitive(viewport, preview, stroke),
    ...gripPrimitives(
      viewport.worldToScreen(mtextWidthGrip(preview, state.side)),
      true
    ),
  ]
}

/** The dashed dimension preview and hot grip while a definition point moves. */
export function buildDimPointEdit(
  state: Phase<"moveDimPoint">,
  ctx: ToolContext
): ScenePrimitive[] {
  const { viewport } = ctx
  const dim = ctx.document.get(state.entityId)
  if (dim?.type !== "dimension") return []
  const stroke: StrokeStyle = { color: THEME.preview, width: 1, dash: [6, 4] }
  return [
    ...entityScenePrimitive(
      viewport,
      movedDimension(dim, state, state.current),
      stroke
    ),
    ...gripPrimitives(viewport.worldToScreen(state.current), true),
  ]
}
