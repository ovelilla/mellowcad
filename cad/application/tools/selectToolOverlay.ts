import { V } from "../../geometry/Vec2"
import {
  Entity,
  EntityId,
  insertPolylineVertex,
  replacePolylineVertex,
  setPolylineBulge,
  translateEntity,
} from "../../domain/entities"
import { polarPoint } from "../../geometry/primitives"
import { ScenePrimitive, StrokeStyle } from "../../scene/types"
import { THEME } from "../../scene/theme"
import { arcScenePrimitive, entityScenePrimitive } from "../SceneBuilder"
import { buildSelectionBoxOverlay } from "./boxSelection"
import { PointerInput, ToolContext } from "./Tool"
import { SelectToolState } from "./selectToolState"
import {
  gripPrimitives,
  pushGrip,
  pushSegmentGrip,
  sameGrip,
  selectedGrips,
} from "./selectToolGrips"
import { movedDimension, mtextWidthGrip, withRadius } from "./selectToolEdits"

type Phase<P extends SelectToolState["phase"]> = Extract<
  SelectToolState,
  { phase: P }
>

/** The in-progress selection rectangle (window or crossing). */
export function buildSelectionBox(
  state: Phase<"boxing">,
  ctx: ToolContext
): ScenePrimitive[] {
  return buildSelectionBoxOverlay(
    ctx.viewport,
    state.startWorld,
    state.currentWorld
  )
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
  if (state.phase === "idle" && state.hoverEntityId) {
    const entity = ctx.document.get(state.hoverEntityId)
    if (entity) pushRolloverHighlight(out, entity, ctx)
  }
  const hover = state.phase === "idle" ? (state.hoverGrip ?? null) : null
  for (const grip of selectedGrips(ctx)) {
    const at = ctx.viewport.worldToScreen(grip.world)
    const hot = sameGrip(grip, hover)
    // Segment-midpoint grips (add-vertex / curvature) read as small circles so
    // they're distinguishable from the square vertex/endpoint grips.
    if (grip.role.kind === "addVertex" || grip.role.kind === "bulge") {
      pushSegmentGrip(out, at, hot)
    } else {
      pushGrip(out, at, hot)
    }
  }
  return out
}

/**
 * The unselected entity under the cursor, if any, whose preview should be
 * highlighted. Objects already in the selection are skipped: they already
 * read as selected (and show grips), so previewing them would be redundant —
 * exactly like AutoCAD, whose selection preview only previews what a click
 * would *add* to the selection.
 */
export function pickRolloverEntity(
  input: PointerInput,
  ctx: ToolContext
): EntityId | null {
  const hit = ctx.pick(input.world)
  if (!hit) return null
  return ctx.selection.has(hit.id) ? null : hit.id
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

/** The rubber-band preview and hot grip while lengthening a line. */
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

/** The rubber-band preview and hot grip while moving the selection. */
export function buildMoveEdit(
  state: Phase<"moveLine">,
  ctx: ToolContext
): ScenePrimitive[] {
  const { viewport } = ctx
  const delta = V.sub(state.current, state.origMid)
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

/** The reshaped polyline preview and hot grip while stretching a vertex. */
export function buildVertexEdit(
  state: Phase<"moveVertex">,
  ctx: ToolContext
): ScenePrimitive[] {
  const { viewport } = ctx
  const poly = ctx.document.get(state.entityId)
  if (poly?.type !== "polyline") return []
  const preview = replacePolylineVertex(poly, state.index, state.current)
  const stroke: StrokeStyle = { color: THEME.preview, width: 1, dash: [6, 4] }
  return [
    ...entityScenePrimitive(viewport, preview, stroke),
    ...gripPrimitives(viewport.worldToScreen(state.current), true),
  ]
}

/** The reshaped polyline preview and hot grip while inserting a vertex. */
export function buildInsertEdit(
  state: Phase<"insertVertex">,
  ctx: ToolContext
): ScenePrimitive[] {
  const { viewport } = ctx
  const poly = ctx.document.get(state.entityId)
  if (poly?.type !== "polyline") return []
  const preview = insertPolylineVertex(poly, state.segmentIndex, state.current)
  const stroke: StrokeStyle = { color: THEME.preview, width: 1, dash: [6, 4] }
  return [
    ...entityScenePrimitive(viewport, preview, stroke),
    ...gripPrimitives(viewport.worldToScreen(state.current), true),
  ]
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
  return [
    ...entityScenePrimitive(viewport, preview, stroke),
    ...gripPrimitives(viewport.worldToScreen(state.current), true),
  ]
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
    ...gripPrimitives(viewport.worldToScreen(mtextWidthGrip(preview)), true),
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
