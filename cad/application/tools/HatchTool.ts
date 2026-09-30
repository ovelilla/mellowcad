import { Vec2 } from "../../geometry/Vec2"
import { traceBoundaryLoops } from "../../domain/boundary"
import {
  Bounds,
  Entity,
  EntityId,
  HatchEntity,
  HatchLoop,
  closestOnEntity,
  createHatch,
  entityBounds,
  entityElevation,
  hatchGeometry,
  hatchLoopFromEntity,
  isLevel,
  withElevation,
} from "../../domain/entities"
import {
  DEFAULT_HATCH_ANGLE,
  DEFAULT_HATCH_PATTERN_ID,
  DEFAULT_HATCH_SCALE,
  HATCH_PATTERNS,
  HatchPatternId,
  isSolidHatchPattern,
  resolveHatchPatternId,
} from "../../domain/hatchPatterns"
import { parseNumber } from "../../domain/units"
import { ucsAngleToWorld } from "../../domain/ucs"
import { AddEntityCommand } from "../commands/entityCommands"
import { DynamicInputSession } from "../input/DynamicInput"
import { parseCoordinate } from "../input/coordinateInput"
import { entityScenePrimitive } from "../SceneBuilder"
import { ScenePrimitive } from "../../scene/types"
import { THEME } from "../../scene/theme"
import { boxSelect, buildSelectionBoxOverlay } from "./boxSelection"
import {
  CommandOption,
  CommandOptionOutcome,
  PointerInput,
  Tool,
  ToolContext,
} from "./Tool"

/** Screen-pixel movement past which a press-drag becomes a box selection. */
const DRAG_THRESHOLD_PX = 4

/** Reused so preview frames don't burn entity ids. */
const PREVIEW_ID: EntityId = "__hatch_preview__"

/**
 * AutoCAD's HATCH. Its two boundary routes are the two the prompt offers, in
 * the same order:
 *
 * - **Pick internal point** (the default): "Determines a boundary from existing
 *   objects that form an enclosed area around the specified point" — so an area
 *   drawn as loose crossing lines can be filled. The trace lives in
 *   {@link traceBoundaryLoops}; picking the boundary set is this tool's job.
 * - **Select objects**: "Determines a boundary from selected objects that form
 *   an enclosed area", i.e. objects that close on their own.
 *
 * The other option is **Properties**, which sets the pattern name and then, for
 * a real pattern, its scale and angle — the HPNAME / HPSCALE / HPANG system
 * variables. All three are "Not-saved" in AutoCAD, i.e. they last for the
 * session, which is exactly what an instance field on a tool the runtime owns
 * gives us.
 *
 * Several boundaries make **one** hatch (HPSEPARATE's initial value is 0) and
 * the fill is **not associative** (a documented deviation from HPASSOC 1 — see
 * {@link HatchEntity}).
 */
export class HatchTool implements Tool {
  readonly id = "hatch"

  private state: HatchState = { phase: "point" }
  private lastScreen: Vec2 | null = null
  private preview: HatchEntity | null = null
  /** Boundaries traced from internal points, one prompt at a time. */
  private picked: HatchLoop[] = []
  /** The plane the traced boundaries lie in, fixed by the first one found. */
  private pickedPlane: number | null = null
  /** Which boundary prompt Properties returns to. */
  private route: "point" | "select" = "point"

  // HPNAME / HPSCALE / HPANG: session defaults, so the next hatch starts from
  // the settings of the last one.
  private patternId: HatchPatternId = DEFAULT_HATCH_PATTERN_ID
  private patternScale = DEFAULT_HATCH_SCALE
  private patternAngle = DEFAULT_HATCH_ANGLE

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("default")
    // "Each time you click Select Objects, HATCH clears the previous selection
    // set" — the boundary set starts empty every time.
    ctx.selection.clear()
    this.picked = []
    this.pickedPlane = null
    this.enterPoint(ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    this.state = { phase: "point" }
    this.preview = null
    this.picked = []
    this.pickedPlane = null
    ctx.dynamicInput.close()
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen
    switch (this.state.phase) {
      case "select": {
        const hover = this.rolloverAt(input.world, ctx)
        if (hover?.id !== this.state.hover?.id) {
          this.state = { phase: "select", hover }
        }
        break
      }
      case "pressed": {
        const moved = Math.hypot(
          input.screen.x - this.state.startScreen.x,
          input.screen.y - this.state.startScreen.y
        )
        this.state =
          moved >= DRAG_THRESHOLD_PX
            ? {
                phase: "boxing",
                startWorld: this.state.startWorld,
                currentWorld: input.world,
                subtract: this.state.subtract,
              }
            : { ...this.state, currentWorld: input.world }
        break
      }
      case "boxing":
        this.state = { ...this.state, currentWorld: input.world }
        break
    }
    ctx.dynamicInput.setPosition(input.screen)
    ctx.requestRender()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return
    if (this.state.phase === "point") {
      // The raw world point, not the snapped one: this asks which *area* the
      // fill goes in, and a point pulled onto an endpoint is on the boundary.
      this.addInternalPoint(input.world, ctx)
      return
    }
    if (this.state.phase !== "select") return
    this.state = {
      phase: "pressed",
      startWorld: input.world,
      startScreen: input.screen,
      currentWorld: input.world,
      subtract: input.shiftKey,
    }
    ctx.requestRender()
  }

  onPointerUp(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return
    if (this.state.phase === "pressed") {
      const hit = ctx.pick(input.world)
      if (hit && this.canBound(hit, this.plane(ctx))) {
        this.applyPick([hit.id], this.state.subtract, ctx)
      }
    } else if (this.state.phase === "boxing") {
      let plane = this.plane(ctx)
      const ids = boxSelect(
        ctx.document,
        this.state.startWorld,
        this.state.currentWorld,
        ctx.viewport
      ).filter((id) => {
        const entity = ctx.document.get(id)
        if (entity === undefined || !this.canBound(entity, plane)) return false
        plane ??= entityElevation(entity)
        return true
      })
      this.applyPick(ids, this.state.subtract, ctx)
    } else {
      return
    }
    this.enterSelect(ctx)
    ctx.requestRender()
  }

  onEnter(ctx: ToolContext): boolean {
    if (this.state.phase !== "select") return false
    if (this.allLoops(ctx).length === 0) return false
    this.commit(ctx)
    return true
  }

  commandOptions(): readonly CommandOption[] {
    if (this.state.phase === "point") {
      return [{ id: "Properties" }, { id: "Select objects" }]
    }
    return this.state.phase === "select" ? [{ id: "Properties" }] : []
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    if (this.state.phase !== "point" && this.state.phase !== "select") {
      return "unhandled"
    }
    switch (id) {
      case "Properties":
        this.enterPattern(ctx)
        return "continue"
      case "Select objects":
        if (this.state.phase !== "point") return "unhandled"
        this.route = "select"
        this.enterSelect(ctx)
        return "continue"
      default:
        return "unhandled"
    }
  }

  wantsSnap(): boolean {
    return false // picking objects, never acquiring a point
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    const out: ScenePrimitive[] = []
    if (this.preview) {
      out.push(
        ...entityScenePrimitive(ctx.viewport, this.preview, {
          color: THEME.preview,
          width: 1,
        })
      )
    }
    if (this.state.phase === "boxing") {
      out.push(
        ...buildSelectionBoxOverlay(
          ctx.viewport,
          this.state.startWorld,
          this.state.currentWorld
        )
      )
    } else if (this.state.phase === "select" && this.state.hover) {
      out.push(
        ...entityScenePrimitive(ctx.viewport, this.state.hover, {
          color: THEME.entityHover,
          width: 2,
        })
      )
    }
    return out
  }

  /**
   * The object a click would add to the boundary set. Objects that cannot close
   * an area never light up, which answers "what can I hatch?" without inventing
   * a message AutoCAD does not print here.
   */
  private rolloverAt(world: Vec2, ctx: ToolContext): Entity | null {
    const hit = ctx.pick(world)
    if (!hit || ctx.selection.has(hit.id)) return null
    return this.canBound(hit, this.plane(ctx)) ? hit : null
  }

  /**
   * Whether `entity` closes an area on its own in `plane`: "enclosed areas can
   * be hatched only if they are in a plane parallel to the XY plane of the
   * current UCS", so once the hatch has a plane an object at another height is
   * not taken, and never highlights.
   */
  private canBound(entity: Entity, plane: number | null): boolean {
    return (
      hatchLoopFromEntity(entity) !== null &&
      (plane === null || samePlane(entityElevation(entity), plane))
    )
  }

  /**
   * The height of the hatch being built: that of the first boundary found, by
   * either route.
   */
  private plane(ctx: ToolContext): number | null {
    if (this.pickedPlane !== null) return this.pickedPlane
    for (const id of ctx.selection.toArray()) {
      const entity = ctx.document.get(id)
      if (entity && hatchLoopFromEntity(entity)) return entityElevation(entity)
    }
    return null
  }

  private applyPick(
    ids: readonly EntityId[],
    subtract: boolean,
    ctx: ToolContext
  ): void {
    for (const id of ids) {
      if (subtract) ctx.selection.remove(id)
      else ctx.selection.add(id)
    }
  }

  /**
   * Traces the area around an internal point and adds it to the boundary set.
   * Reported rather than ignored: unlike an object that simply never highlights,
   * a point that looks enclosed but is not needs an answer.
   */
  private addInternalPoint(point: Vec2, ctx: ToolContext): void {
    const candidates = this.boundarySet(ctx).filter(
      (e) => isLevel(e) && BOUNDARY_TYPES.has(e.type)
    )
    const plane = this.plane(ctx) ?? nearestPlane(point, candidates)
    const loops =
      plane === null
        ? null
        : traceBoundaryLoops(
            point,
            candidates.filter((e) => samePlane(entityElevation(e), plane))
          )
    if (!loops) {
      // What AutoCAD answers when an internal point is not enclosed by anything.
      ctx.report(ctx.text.message("hatchNoBoundary"), "error")
    } else {
      this.picked.push(...loops)
      this.pickedPlane = plane
    }
    this.enterPoint(ctx)
    ctx.requestRender()
  }

  /**
   * The geometry a trace is allowed to see: what is visible on screen. That is
   * AutoCAD's own rule — "all objects being used to define the boundary of a
   * hatch object must be visible in the current drawing view", the Everything
   * boundary set being "everything visible in the current viewport" — and it is
   * what keeps the quadratic part of the trace to the area being worked on.
   */
  private boundarySet(ctx: ToolContext): Entity[] {
    const entities = ctx.document
      .getEntities()
      .filter((entity) => ctx.document.isEntityVisible(entity))
    const view = this.visibleBounds(ctx)
    if (!view) return entities
    return entities.filter((entity) =>
      overlaps(entityBounds(entity, ctx.blocks), view)
    )
  }

  private visibleBounds(ctx: ToolContext): Bounds | null {
    const { viewport } = ctx
    if (viewport.width <= 0 || viewport.height <= 0) return null
    const corners = [
      { x: 0, y: 0 },
      { x: viewport.width, y: 0 },
      { x: 0, y: viewport.height },
      { x: viewport.width, y: viewport.height },
    ].map((corner) => viewport.screenToWorld(corner))
    return {
      min: {
        x: Math.min(...corners.map((c) => c.x)),
        y: Math.min(...corners.map((c) => c.y)),
      },
      max: {
        x: Math.max(...corners.map((c) => c.x)),
        y: Math.max(...corners.map((c) => c.y)),
      },
    }
  }

  /** Every boundary the command has gathered, by either route. */
  private allLoops(ctx: ToolContext): HatchLoop[] {
    const loops: HatchLoop[] = []
    for (const id of ctx.selection.toArray()) {
      const entity = ctx.document.get(id)
      const loop = entity ? hatchLoopFromEntity(entity) : null
      if (loop) loops.push(loop)
    }
    return [...loops, ...this.picked]
  }

  /** The hatch the current boundary set and settings would produce. */
  private build(
    loops: readonly HatchLoop[],
    ctx: ToolContext,
    id?: EntityId
  ): HatchEntity {
    // HPANG is measured from the UCS X axis and HPORIGIN (0,0) is the UCS
    // origin, so a pattern lines up with the UCS it was drawn in.
    return withElevation(
      createHatch(loops, {
        patternId: this.patternId,
        patternScale: this.patternScale,
        patternAngle: ucsAngleToWorld(ctx.ucs, this.patternAngle),
        origin: ctx.ucs.origin,
        layerId: ctx.document.getCurrentLayerId(),
        id,
      }),
      this.plane(ctx) ?? 0
    )
  }

  private commit(ctx: ToolContext): void {
    const hatch = this.build(this.allLoops(ctx), ctx)
    if (hatchGeometry(hatch).truncated) {
      // What AutoCAD says when a pattern generates more line work than it will
      // draw ("the program may reject the hatch and display a message
      // indicating that the hatch scale is too small or its dash length too
      // short").
      ctx.report(ctx.text.message("hatchTooDense"), "error")
      ctx.endCommand()
      return
    }
    ctx.execute(new AddEntityCommand(hatch))
    // The boundary objects were only the answer to a prompt: HATCH leaves
    // nothing selected, so the palette does not go on describing them.
    ctx.selection.clear()
    ctx.endCommand()
  }

  /**
   * Rebuilds the live preview. Done on every change rather than every frame:
   * clipping the pattern is the expensive part of a hatch and nothing about it
   * depends on the camera.
   */
  private refreshPreview(ctx: ToolContext): void {
    const loops = this.allLoops(ctx)
    this.preview = loops.length > 0 ? this.build(loops, ctx, PREVIEW_ID) : null
  }

  /** Back to whichever boundary prompt Properties was invoked from. */
  private enterRoute(ctx: ToolContext): void {
    if (this.route === "select") this.enterSelect(ctx)
    else this.enterPoint(ctx)
  }

  private enterPoint(ctx: ToolContext): void {
    this.state = { phase: "point" }
    this.route = "point"
    this.refreshPreview(ctx)
    ctx.dynamicInput.open({
      fields: [{ id: "point", prompt: "internalPoint", kind: "coordinate" }],
      commit: () => {},
      commitRaw: (commitCtx) => {
        const typed = commitCtx.dynamicInput.getText("point").trim()
        // Enter with nothing typed accepts the boundaries gathered so far.
        if (typed.length === 0) {
          if (this.allLoops(commitCtx).length > 0) this.commit(commitCtx)
          else commitCtx.endCommand()
          return true
        }
        const point = parseCoordinate(typed, {
          lastPoint: null,
          relativeByDefault: false,
          ucs: commitCtx.ucs,
          elevation: commitCtx.elevation,
        })
        if (point) this.addInternalPoint(point, commitCtx)
        return true
      },
    })
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  private enterSelect(ctx: ToolContext): void {
    this.state = {
      phase: "select",
      hover: this.state.phase === "select" ? this.state.hover : null,
    }
    this.route = "select"
    this.refreshPreview(ctx)
    // A keyword-only prompt: no field means the canvas keeps focus, so Enter
    // reaches `onEnter` to close the boundary set.
    ctx.dynamicInput.open({ fields: [], commit: () => {} })
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  private enterPattern(ctx: ToolContext): void {
    this.state = { phase: "pattern" }
    const session: DynamicInputSession = {
      fields: [{ id: "pattern", prompt: "patternName", kind: "text" }],
      commit: () => {},
      commitRaw: (commitCtx) => {
        const typed = commitCtx.dynamicInput.getText("pattern").trim()
        if (typed === "?") {
          commitCtx.report(
            HATCH_PATTERNS.map((p) =>
              commitCtx.text.hatchPatternListing(p.id)
            ).join("\n")
          )
          this.enterPattern(commitCtx)
          return true
        }
        const resolved =
          typed.length === 0 ? this.patternId : resolveHatchPatternId(typed)
        if (!resolved) {
          commitCtx.report(
            commitCtx.text.message("hatchPatternUnknown", { name: typed }),
            "error"
          )
          this.enterPattern(commitCtx)
          return true
        }
        this.patternId = resolved
        // A solid fill has no spacing or direction to ask about.
        if (isSolidHatchPattern(resolved)) this.enterRoute(commitCtx)
        else this.enterScale(commitCtx)
        return true
      },
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setText("pattern", this.patternId)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }

  private enterScale(ctx: ToolContext): void {
    this.state = { phase: "scale" }
    const session: DynamicInputSession = {
      fields: [{ id: "scale", prompt: "patternScale", kind: "number" }],
      commit: (values, commitCtx) => {
        if (values.scale > 0) this.patternScale = values.scale
        this.enterAngle(commitCtx)
      },
      commitRaw: (commitCtx) => {
        // Enter with nothing typed keeps the current scale, the `<default>`.
        const typed = parseNumber(commitCtx.dynamicInput.getText("scale"))
        if (typed !== null && typed > 0) this.patternScale = typed
        this.enterAngle(commitCtx)
        return true
      },
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setLive("scale", this.patternScale)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }

  private enterAngle(ctx: ToolContext): void {
    this.state = { phase: "angle" }
    const session: DynamicInputSession = {
      fields: [{ id: "angle", prompt: "patternAngle", kind: "angle" }],
      commit: (values, commitCtx) => {
        this.patternAngle = (values.angle * Math.PI) / 180
        this.enterRoute(commitCtx)
      },
      commitRaw: (commitCtx) => {
        const typed = parseNumber(commitCtx.dynamicInput.getText("angle"))
        if (typed !== null) this.patternAngle = (typed * Math.PI) / 180
        this.enterRoute(commitCtx)
        return true
      },
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setLive("angle", (this.patternAngle * 180) / Math.PI)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }
}

/** Overlap test in world coordinates, for the visible boundary set. */
function overlaps(a: Bounds, b: Bounds): boolean {
  return (
    a.min.x <= b.max.x &&
    b.min.x <= a.max.x &&
    a.min.y <= b.max.y &&
    b.min.y <= a.max.y
  )
}

function samePlane(a: number, b: number): boolean {
  return Math.abs(a - b) <= 1e-9
}

/** What a trace builds a boundary from (`traceBoundaryLoops` ignores the rest). */
const BOUNDARY_TYPES = new Set<Entity["type"]>([
  "line",
  "circle",
  "arc",
  "polyline",
])

/**
 * The height of the object nearest `point`: -HATCH's default ray casting "runs
 * a line from the point you specify to the nearest object and then traces the
 * boundary", so the first object found fixes the plane the boundary lies in.
 */
function nearestPlane(
  point: Vec2,
  candidates: readonly Entity[]
): number | null {
  let best: Entity | null = null
  let bestDistance = Infinity
  for (const entity of candidates) {
    const distance = closestOnEntity(entity, point).distance
    if (distance < bestDistance) {
      bestDistance = distance
      best = entity
    }
  }
  return best ? entityElevation(best) : null
}

type HatchState =
  | { readonly phase: "point" }
  | { readonly phase: "select"; readonly hover: Entity | null }
  | {
      readonly phase: "pressed"
      readonly startWorld: Vec2
      readonly startScreen: Vec2
      readonly currentWorld: Vec2
      readonly subtract: boolean
    }
  | {
      readonly phase: "boxing"
      readonly startWorld: Vec2
      readonly currentWorld: Vec2
      readonly subtract: boolean
    }
  | { readonly phase: "pattern" }
  | { readonly phase: "scale" }
  | { readonly phase: "angle" }
