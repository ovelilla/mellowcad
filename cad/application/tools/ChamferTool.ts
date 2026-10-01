import { Vec2, V } from "../../geometry/Vec2"
import { chamferLines } from "../../geometry/primitives"
import {
  createLine,
  carryOverrides,
  carryPlane,
  createPolyline,
  polylineBulge,
  polylineSegmentGeometries,
  polylineSegments,
  Entity,
  EntityId,
  LineEntity,
  PolylineEntity,
  PolylineSegmentGeometry,
} from "../../domain/entities"
import {
  ReplaceEntitiesCommand,
  UpdateEntityCommand,
} from "../commands/entityCommands"
import { DynamicInputSession } from "../input/DynamicInput"
import { ScenePrimitive, StrokeStyle } from "../../scene/types"
import { THEME } from "../../scene/theme"
import { entityScenePrimitive } from "../SceneBuilder"
import { LineCorner, LinePick, lineCorner } from "./lineCorner"
import {
  CommandOption,
  CommandOptionOutcome,
  KeyInput,
  PointerInput,
  Tool,
  ToolContext,
} from "./Tool"

/**
 * AutoCAD's CHAMFER: bevel the corner between two lines, cutting each of them
 * at a set distance from their intersection and joining the cuts with a
 * straight segment. The sibling of FILLET — same flow, straight cut instead of
 * an arc.
 *
 * ```
 *   ┌── [D] Distance ──► type first + second distance ──┐
 *   ▼                                                   │
 *  first ──click line──► second ──click line──► chamfer + Select
 *    └── click polyline ──► chamfer every corner + Select
 * ```
 *
 * The distances are measured from the corner along each line's *picked* side,
 * so where you click decides which of the four corners is cut. They persist for
 * the tool's session, like AutoCAD's, and both being 0 simply joins the lines
 * at their intersection. Clicking a **polyline** bevels every eligible straight
 * corner at once (AutoCAD's Polyline option).
 *
 * The whole edit is one command, so a single undo reverts the chamfer.
 */

type ChamferState =
  /** Awaiting the first object: a line, or a polyline (hover-highlighted). */
  | { readonly phase: "first"; readonly hover: Entity | null }
  /** First line chosen; awaiting the second (a live preview tracks the cursor). */
  | {
      readonly phase: "second"
      readonly line1: LineEntity
      /** Where the first line was clicked — picks which corner to cut. */
      readonly pick1: LinePick
      readonly hover: LineEntity | null
      readonly cursor: LinePick
    }

export class ChamferTool implements Tool {
  readonly id = "chamfer"

  private state: ChamferState = { phase: "first", hover: null }
  /** Cut distances along the first/second line, kept across the session. */
  private distance1 = 0
  private distance2 = 0
  /** True while the distance sub-prompt is open (object picks paused). */
  private awaitingDistances = false
  private lastScreen: Vec2 | null = null

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    ctx.selection.clear()
    this.state = { phase: "first", hover: null }
    this.awaitingDistances = false
    this.openSelectPrompt(ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    this.state = { phase: "first", hover: null }
    this.awaitingDistances = false
    ctx.dynamicInput.close()
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen
    ctx.dynamicInput.setPosition(input.screen)
    if (this.awaitingDistances) {
      ctx.requestRender()
      return
    }

    if (this.state.phase === "first") {
      this.state = { phase: "first", hover: this.pickFirst(input, ctx) }
    } else {
      this.state = {
        ...this.state,
        hover: this.pickLine(input, ctx, this.state.line1.id),
        cursor: { world: input.world, screen: input.screen },
      }
    }
    ctx.requestRender()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0 || this.awaitingDistances) return

    if (this.state.phase === "first") {
      const hit = this.pickFirst(input, ctx)
      if (!hit) return
      if (hit.type === "polyline") {
        this.commitPolylineChamfer(hit, ctx)
        return
      }
      if (hit.type !== "line") return
      const pick = { world: input.world, screen: input.screen }
      this.state = {
        phase: "second",
        line1: hit,
        pick1: pick,
        hover: null,
        cursor: pick,
      }
      ctx.requestRender()
      return
    }

    const line2 = this.pickLine(input, ctx, this.state.line1.id)
    if (!line2) return
    this.commitChamfer(
      this.state.line1,
      this.state.pick1,
      line2,
      { world: input.world, screen: input.screen },
      ctx
    )
  }

  onKeyDown(input: KeyInput, ctx: ToolContext): void {
    if (input.key === "Escape") ctx.dynamicInput.close()
  }

  commandOptions(): readonly CommandOption[] {
    return this.awaitingDistances ? [] : [{ id: "Distance" }]
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    if (id === "Distance" && !this.awaitingDistances) {
      this.openDistancePrompt(ctx)
      return "continue"
    }
    return "unhandled"
  }

  wantsSnap(): boolean {
    // Lines are picked by proximity, not precise points — as in FILLET/TRIM.
    return false
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    const { viewport } = ctx
    const draw = (entity: Entity, stroke: StrokeStyle) =>
      entityScenePrimitive(viewport, entity, stroke)

    if (this.state.phase === "first") {
      const h = this.state.hover
      return h ? draw(h, hoverStroke) : []
    }

    const { line1, pick1, hover, cursor } = this.state
    const prims = draw(line1, selectedStroke)
    if (!hover) return prims

    const corner = lineCorner(line1, pick1, hover, cursor, viewport)
    const chamfered =
      corner && this.chamfer(corner, line1, hover, ctx, PREVIEW_ID)
    if (!chamfered) return [...prims, ...draw(hover, hoverStroke)]
    for (const entity of chamfered) {
      prims.push(
        ...draw(
          entity,
          entity.id === PREVIEW_ID
            ? { color: THEME.rubberBand, width: 1 }
            : hoverStroke
        )
      )
    }
    return prims
  }

  /**
   * The two lines cut back to the bevel, and the bevel (none when both
   * distances are 0), back in the frame; `null` when the lines are parallel
   * or a cut line would vanish. A preview gives the bevel a fixed `bevelId`.
   */
  private chamfer(
    corner: LineCorner,
    line1: LineEntity,
    line2: LineEntity,
    ctx: ToolContext,
    bevelId?: EntityId
  ): Entity[] | null {
    const result = chamferLines(
      corner.line1.start,
      corner.line1.end,
      corner.line2.start,
      corner.line2.end,
      corner.pick1,
      corner.pick2,
      this.distance1,
      this.distance2
    )
    if (!result) return null
    const trimmed1 = trimLine(
      corner.line1,
      result.corner,
      result.direction1,
      result.point1
    )
    const trimmed2 = trimLine(
      corner.line2,
      result.corner,
      result.direction2,
      result.point2
    )
    if (!trimmed1 || !trimmed2) return null
    const built: Entity[] = [trimmed1, trimmed2]
    if (!V.equals(result.point1, result.point2)) {
      // AutoCAD puts the bevel on the lines' shared layer, or the current layer
      // when they differ.
      const layer =
        line1.layerId === line2.layerId
          ? line1.layerId
          : ctx.document.getCurrentLayerId()
      built.push(
        carryPlane(
          corner.line1,
          createLine(result.point1, result.point2, layer, bevelId)
        )
      )
    }
    return built.map((entity) => corner.back(entity))
  }

  private commitChamfer(
    line1: LineEntity,
    pick1: LinePick,
    line2: LineEntity,
    pick2: LinePick,
    ctx: ToolContext
  ): void {
    const corner = lineCorner(line1, pick1, line2, pick2, ctx.viewport)
    if (!corner) {
      ctx.report(ctx.text.message("linesNonCoplanar"), "error")
      this.state = { phase: "first", hover: null }
      ctx.requestRender()
      return
    }
    const chamfered = this.chamfer(corner, line1, line2, ctx)
    if (!chamfered) return // parallel or collinear — keep prompting
    ctx.execute(new ReplaceEntitiesCommand([line1.id, line2.id], chamfered))
    ctx.dynamicInput.close()
    ctx.endCommand()
  }

  /**
   * AutoCAD's CHAMFER Polyline: bevels every eligible corner of `poly` with the
   * current distances in one step, then ends the command.
   */
  private commitPolylineChamfer(poly: PolylineEntity, ctx: ToolContext): void {
    ctx.dynamicInput.close()
    if (this.distance1 > 0 || this.distance2 > 0) {
      const chamfered = chamferPolyline(poly, this.distance1, this.distance2)
      if (chamfered) ctx.execute(new UpdateEntityCommand(chamfered))
    }
    ctx.endCommand()
  }

  /** The visible line nearest the cursor, excluding `excludeId`, or `null`. */
  private pickLine(
    input: PointerInput,
    ctx: ToolContext,
    excludeId: string | null
  ): LineEntity | null {
    const hit = ctx.pick(input.world)
    if (!hit || hit.type !== "line" || hit.id === excludeId) return null
    return hit
  }

  /** The first-pick target under the cursor: a line, or a polyline. */
  private pickFirst(input: PointerInput, ctx: ToolContext): Entity | null {
    const hit = ctx.pick(input.world)
    if (!hit) return null
    if (hit.type === "line" || hit.type === "polyline") return hit
    return null
  }

  /** Opens the keyword-only object-selection prompt (shows the [D] chip). */
  private openSelectPrompt(ctx: ToolContext): void {
    const session: DynamicInputSession = { fields: [], commit: () => {} }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  /** Both distances in one form; Tab cycles them, Enter accepts (AutoCAD asks
   * for them in sequence, which the two fields make simultaneous). */
  private openDistancePrompt(ctx: ToolContext): void {
    this.awaitingDistances = true
    const session: DynamicInputSession = {
      fields: [
        { id: "dist1", prompt: "firstDistance", kind: "distance" },
        { id: "dist2", prompt: "secondDistance", kind: "distance" },
      ],
      commit: (values, commitCtx) =>
        this.setDistances(values.dist1, values.dist2, commitCtx),
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setLive("dist1", this.distance1)
    ctx.dynamicInput.setLive("dist2", this.distance2)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }

  private setDistances(first: number, second: number, ctx: ToolContext): void {
    if (Number.isFinite(first) && first >= 0) this.distance1 = first
    if (Number.isFinite(second) && second >= 0) this.distance2 = second
    this.awaitingDistances = false
    this.openSelectPrompt(ctx)
    ctx.requestRender()
  }
}

const hoverStroke: StrokeStyle = { color: THEME.entityHover, width: 2 }
const selectedStroke: StrokeStyle = { color: THEME.selected, width: 2 }
/** The preview bevel's id, reused every frame so a preview burns no entity ids. */
const PREVIEW_ID = "chamfer-preview"

/**
 * Rebuilds `line` trimmed/extended to end at `cut`: the endpoint on the picked
 * side (farther from the corner along `dir`) is kept, the other becomes the cut
 * point. Preserves the line's id and layer. `null` when the result would be
 * zero-length.
 */
function trimLine(
  line: LineEntity,
  corner: Vec2,
  dir: Vec2,
  cut: Vec2
): LineEntity | null {
  const keepEnd =
    V.dot(V.sub(line.end, corner), dir) >= V.dot(V.sub(line.start, corner), dir)
      ? line.end
      : line.start
  if (V.equals(keepEnd, cut)) return null
  return carryOverrides(line, createLine(keepEnd, cut, line.layerId, line.id))
}

/** A resolved corner bevel: the two cut points that replace the vertex. */
interface CornerChamfer {
  readonly entry: Vec2 // cut point toward the previous vertex
  readonly exit: Vec2 // cut point toward the next vertex
  readonly entryDist: number
  readonly exitDist: number
}

/**
 * Bevels every eligible corner of `poly`, returning a new polyline (same id)
 * where each cut vertex became two. Only straight-to-straight corners are
 * chamfered — a corner touching an arc segment has no single intersection to
 * measure the distances from — and corners are skipped when a cut would overrun
 * an adjacent segment (so neighbouring bevels never collide). Returns `null`
 * when nothing changes.
 */
function chamferPolyline(
  poly: PolylineEntity,
  distance1: number,
  distance2: number
): PolylineEntity | null {
  const v = poly.vertices
  const n = v.length
  if (n < 3) return null
  const geoms = polylineSegmentGeometries(poly)
  const segLen = polylineSegments(poly).map(([a, b]) => V.distance(a, b))

  const isCorner = (i: number) => (poly.closed ? true : i > 0 && i < n - 1)
  const chamfers: (CornerChamfer | null)[] = v.map((_, i) =>
    isCorner(i)
      ? cornerChamfer(poly, i, distance1, distance2, segLen, geoms)
      : null
  )

  // Drop neighbouring bevels that would overrun their shared segment.
  for (let j = 0; j < segLen.length; j++) {
    const a = chamfers[j]
    const b = chamfers[(j + 1) % n]
    if (a && b && a.exitDist + b.entryDist > segLen[j] + 1e-9) {
      chamfers[j] = null
      chamfers[(j + 1) % n] = null
    }
  }

  if (chamfers.every((c) => c === null)) return null

  const pts: Vec2[] = []
  const bulges: number[] = []
  for (let i = 0; i < n; i++) {
    const c = chamfers[i]
    const hasOut = poly.closed || i < n - 1
    // Any segment next to a bevel is straight (arc corners are never bevelled),
    // so the original bulges carry over untouched.
    const outBulge = polylineBulge(poly, i)
    if (c) {
      pts.push(c.entry)
      bulges.push(0) // the bevel itself
      pts.push(c.exit)
      if (hasOut) bulges.push(outBulge)
    } else {
      pts.push(v[i])
      if (hasOut) bulges.push(outBulge)
    }
  }
  return carryOverrides(
    poly,
    createPolyline(pts, poly.closed, poly.layerId, bulges, poly.id)
  )
}

/** The bevel for corner `i`, or `null` when it isn't eligible. */
function cornerChamfer(
  poly: PolylineEntity,
  i: number,
  distance1: number,
  distance2: number,
  segLen: readonly number[],
  geoms: readonly PolylineSegmentGeometry[]
): CornerChamfer | null {
  const n = poly.vertices.length
  const incoming = (i - 1 + n) % n
  const outgoing = i
  if (geoms[incoming].kind !== "line" || geoms[outgoing].kind !== "line") {
    return null
  }

  const corner = poly.vertices[i]
  const prev = poly.vertices[(i - 1 + n) % n]
  const next = poly.vertices[(i + 1) % n]
  const result = chamferLines(
    prev,
    corner,
    corner,
    next,
    prev,
    next,
    distance1,
    distance2
  )
  if (!result) return null

  const entryDist = V.distance(result.point1, corner)
  const exitDist = V.distance(result.point2, corner)
  if (entryDist < 1e-9 && exitDist < 1e-9) return null
  if (entryDist > segLen[incoming] + 1e-9) return null
  if (exitDist > segLen[outgoing] + 1e-9) return null

  return { entry: result.point1, exit: result.point2, entryDist, exitDist }
}
