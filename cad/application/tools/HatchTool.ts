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
  readsInPlan,
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
import { ucsAngleToWorld } from "../../domain/ucs"
import { AddEntityCommand } from "../commands/entityCommands"
import { DynamicInputSession } from "../input/DynamicInput"
import { parseCoordinate } from "../input/coordinateInput"
import { entityScenePrimitive } from "../SceneBuilder"
import { ScenePrimitive } from "../../scene/types"
import { THEME } from "../../scene/theme"
import { ObjectSelector } from "./objectSelection"
import type { PromptId } from "../../locales/types"
import {
  CommandOption,
  CommandOptionOutcome,
  PointerInput,
  QuestionInput,
  Tool,
  ToolContext,
  ToolQuestion,
} from "./Tool"
import { withCurrentProperties } from "./currentProperties"

/** Reused so preview frames don't burn entity ids. */
const PREVIEW_ID: EntityId = "__hatch_preview__"

/**
 * AutoCAD's HATCH, at the command line as -HATCH asks it (WHY: the Hatch
 * Creation tab and the Hatch and Gradient dialog, where HATCH sets its
 * properties, do not exist here; -HATCH is the command line's own): `Current
 * hatch pattern:  ANSI31`, then `Specify internal point or [Properties/Select
 * objects]:` until Enter makes the hatch. Its two boundary routes are the two
 * the prompt offers, in the same order:
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
 * variables, which AutoCAD keeps per drawing without saving them: fields on
 * the tool, back to their defaults at NEW and OPEN (rectang/p303).
 *
 * Several boundaries make **one** hatch (HPSEPARATE's initial value is 0) and
 * the fill is **not associative** (a documented deviation from HPASSOC 1 — see
 * {@link HatchEntity}).
 */
export class HatchTool implements Tool {
  readonly id = "hatch"

  private state: HatchState = { phase: "point" }
  private readonly selector = new ObjectSelector({
    takes: () => "wholeObjects",
    done: (ctx) => this.enterPoint(ctx),
  })
  private lastScreen: Vec2 | null = null
  private preview: HatchEntity | null = null
  /** Boundaries traced from internal points, those of each point together. */
  private picked: HatchLoop[][] = []
  /** The plane the traced boundaries lie in, fixed by the first one found. */
  private pickedPlane: number | null = null
  /** The plane before each internal point, for its Undo. */
  private planesBefore: (number | null)[] = []

  // HPNAME / HPSCALE / HPANG: the next hatch starts from the settings of the
  // last one in the drawing, which AutoCAD does not save (rectang/p303).
  private patternId: HatchPatternId = DEFAULT_HATCH_PATTERN_ID
  private patternScale = DEFAULT_HATCH_SCALE
  private patternAngle = DEFAULT_HATCH_ANGLE

  onNewDrawing(): void {
    this.patternId = DEFAULT_HATCH_PATTERN_ID
    this.patternScale = DEFAULT_HATCH_SCALE
    this.patternAngle = DEFAULT_HATCH_ANGLE
  }

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("default")
    // "Each time you click Select Objects, HATCH clears the previous selection
    // set" — the boundary set starts empty every time.
    ctx.selection.clear()
    this.picked = []
    this.pickedPlane = null
    this.planesBefore = []
    this.enterPoint(ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    this.state = { phase: "point" }
    this.preview = null
    this.picked = []
    this.pickedPlane = null
    this.planesBefore = []
    ctx.dynamicInput.close()
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen
    if (this.state.phase === "select") this.selector.onPointerMove(input, ctx)
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
    this.selector.onPointerDown(input, ctx)
    this.refreshPreview(ctx)
    ctx.requestRender()
  }

  answerTyped(text: string, ctx: ToolContext): boolean {
    return this.state.phase === "select" && this.selector.answerTyped(text, ctx)
  }

  onPointerUp(input: PointerInput, ctx: ToolContext): void {
    if (this.state.phase !== "select") return
    this.selector.onPointerUp(input, ctx)
    this.refreshPreview(ctx)
    ctx.requestRender()
  }

  /**
   * Enter at Select objects closes the set and goes back to the internal
   * point, an empty set too.
   */
  onEnter(ctx: ToolContext): boolean {
    if (this.state.phase !== "select") return false
    if (!this.selector.onEnter(ctx)) this.enterPoint(ctx)
    ctx.requestRender()
    return true
  }

  question(): PromptId | ToolQuestion {
    switch (this.state.phase) {
      case "point":
        return "specifyInternalPointOr"
      case "select":
        return this.selector.question()
      case "pattern":
        // SOLID is offered as the keyword that names it (`<Solid>`).
        return isSolidHatchPattern(this.patternId)
          ? "enterPatternNameOr"
          : { id: "enterPatternNameOr", enter: { name: this.patternId } }
      case "scale":
        return { id: "patternScale", enter: this.patternScale }
      case "angle":
        return {
          id: "patternAngle",
          enter: { angle: (this.patternAngle * 180) / Math.PI },
        }
    }
  }

  defaultOption(): string | null {
    return this.state.phase === "pattern" && isSolidHatchPattern(this.patternId)
      ? "Solid"
      : null
  }

  /** As AutoCAD 2023's console refuses -HATCH's answers. */
  takes(): QuestionInput | null {
    switch (this.state.phase) {
      case "point":
        return "point2d"
      case "select":
        return this.selector.takes()
      case "scale":
        return { refusal: "requiresDistanceOrNumberX" }
      case "angle":
        return {
          refusal: "requiresAngle",
          values: { points: "two", keyword: "no" },
        }
      case "pattern":
        return null
    }
  }

  commandOptions(): readonly CommandOption[] {
    switch (this.state.phase) {
      case "point":
        // -HATCH declares Undo here and lists it nowhere (table 25032).
        return [
          { id: "Properties" },
          { id: "Select objects" },
          { id: "Undo", hidden: true },
        ]
      case "pattern":
        return [{ id: "?" }, { id: "Solid" }]
      case "select":
        return this.selector.commandOptions()
      default:
        return []
    }
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    if (this.state.phase === "pattern") {
      if (id === "?") this.listPatterns(ctx)
      else if (id === "Solid") this.setPattern(SOLID, ctx)
      else return "unhandled"
      return "continue"
    }
    if (this.state.phase === "select") {
      if (!this.selector.invokeOption(id, ctx)) return "unhandled"
      this.refreshPreview(ctx)
      return "continue"
    }
    if (this.state.phase !== "point") return "unhandled"
    switch (id) {
      case "Properties":
        this.enterPattern(ctx)
        return "continue"
      case "Select objects":
        this.enterSelect(ctx)
        return "continue"
      case "Undo":
        this.undoInternalPoint(ctx)
        return "continue"
      default:
        return "unhandled"
    }
  }

  /** Picking objects, never a point but at a selection mode's prompt. */
  wantsSnap(): boolean {
    return this.state.phase === "select" && this.selector.wantsSnap()
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
    if (this.state.phase === "select") {
      out.push(...this.selector.buildOverlay(ctx))
    }
    return out
  }

  /**
   * The boundaries of what Select objects took. It finds every object, one
   * that closes no area too (`1 found` for an open line, -hatch in
   * erase/p222), and what cannot bound the hatch is left out here; what
   * AutoCAD says of it was not probed, so nothing is said.
   */
  private selectedLoops(ctx: ToolContext): HatchLoop[] {
    let plane = this.pickedPlane
    const loops: HatchLoop[] = []
    for (const id of ctx.selection.toArray()) {
      const entity = ctx.document.get(id)
      const loop = entity ? hatchLoopFromEntity(entity) : null
      if (!entity || !loop || !this.canBound(entity, plane)) continue
      plane ??= entityElevation(entity)
      loops.push(loop)
    }
    return loops
  }

  /**
   * Whether `entity` closes an area on its own in `plane`: "enclosed areas can
   * be hatched only if they are in a plane parallel to the XY plane of the
   * current UCS", so an object at an angle to it is left out, and once the
   * hatch has a plane an object at another height is too.
   */
  private canBound(entity: Entity, plane: number | null): boolean {
    return (
      readsInPlan(entity) &&
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
      if (entity && this.canBound(entity, null)) return entityElevation(entity)
    }
    return null
  }

  /**
   * Traces the area around an internal point and adds it to the boundary set,
   * or says that no boundary was found there.
   */
  private addInternalPoint(point: Vec2, ctx: ToolContext): void {
    // What -HATCH says while it gathers the boundary set and traces.
    for (const id of ANALYSIS_MESSAGES) ctx.report(ctx.text.message(id))
    const candidates = this.boundarySet(ctx).filter(
      (e) => isLevel(e) && readsInPlan(e) && BOUNDARY_TYPES.has(e.type)
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
      this.picked.push(loops)
      this.planesBefore.push(this.pickedPlane)
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
    return [...this.selectedLoops(ctx), ...this.picked.flat()]
  }

  /**
   * Undo, as AutoCAD 2023's console takes it at -HATCH's internal point
   * (acc/h1–h23 of 2026-10-14): the boundaries of the last internal point
   * go, silently; what Select objects took stays, and with no internal point
   * left it says `No boundary to Undo.`
   */
  private undoInternalPoint(ctx: ToolContext): void {
    if (this.picked.pop()) {
      this.pickedPlane = this.planesBefore.pop() ?? null
    } else {
      ctx.report(ctx.text.message("noBoundaryToUndo"), "error")
    }
    this.enterPoint(ctx)
    ctx.requestRender()
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
    ctx.execute(new AddEntityCommand(withCurrentProperties(hatch, ctx)))
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

  /** The main prompt, after the pattern it will use. */
  private enterPoint(ctx: ToolContext): void {
    this.state = { phase: "point" }
    this.refreshPreview(ctx)
    ctx.report(
      ctx.text.message("currentHatchPattern", { name: this.patternId })
    )
    ctx.dynamicInput.open({
      fields: [{ id: "point", kind: "coordinate" }],
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
          lastPoint: commitCtx.lastPoint,
          relativeByDefault: false,
          ucs: commitCtx.ucs,
          elevation: commitCtx.elevation,
        })
        // What reads as no point is refused, as AutoCAD's prompt refuses it.
        if (!point) return false
        this.addInternalPoint(point, commitCtx)
        return true
      },
    })
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  private enterSelect(ctx: ToolContext): void {
    this.state = { phase: "select" }
    this.selector.start()
    this.refreshPreview(ctx)
    // No field: the canvas keeps focus, so Enter reaches `onEnter` to close
    // the boundary set.
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
        // The keywords are read here: the box holds a name, not a keyword.
        const keyword = commitCtx.text.resolveKeyword(typed, ["?", "Solid"])
        if (keyword === "?") {
          this.listPatterns(commitCtx)
          return true
        }
        const resolved =
          keyword === "Solid"
            ? SOLID
            : typed.length === 0
              ? this.patternId
              : resolveHatchPatternId(typed)
        if (!resolved) {
          commitCtx.report(
            commitCtx.text.message("hatchPatternUnknown"),
            "error"
          )
          this.enterPattern(commitCtx)
          return true
        }
        this.setPattern(resolved, commitCtx)
        return true
      },
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }

  private listPatterns(ctx: ToolContext): void {
    ctx.report(
      HATCH_PATTERNS.map((p) => ctx.text.hatchPatternListing(p.id)).join("\n")
    )
    this.enterPattern(ctx)
  }

  private setPattern(id: HatchPatternId, ctx: ToolContext): void {
    this.patternId = id
    // A solid fill has no spacing or direction to ask about.
    if (isSolidHatchPattern(id)) this.enterPoint(ctx)
    else this.enterScale(ctx)
  }

  private enterScale(ctx: ToolContext): void {
    this.state = { phase: "scale" }
    const session: DynamicInputSession = {
      fields: [{ id: "scale", prompt: "patternScale", kind: "number" }],
      commit: (values, commitCtx) => {
        if (!(values.scale > 0)) {
          commitCtx.report(commitCtx.text.message("positiveNonzero"), "error")
          return
        }
        this.patternScale = values.scale
        this.enterAngle(commitCtx)
      },
      commitRaw: (commitCtx) => {
        // Enter with nothing typed keeps the current scale, the `<default>`.
        if (commitCtx.dynamicInput.hasTypedText()) return false
        this.enterAngle(commitCtx)
        return true
      },
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }

  private enterAngle(ctx: ToolContext): void {
    this.state = { phase: "angle" }
    const session: DynamicInputSession = {
      fields: [{ id: "angle", prompt: "patternAngle", kind: "angle" }],
      commit: (values, commitCtx) => {
        this.patternAngle = (values.angle * Math.PI) / 180
        this.enterPoint(commitCtx)
      },
      commitRaw: (commitCtx) => {
        // Enter with nothing typed keeps the current angle, the `<default>`.
        if (commitCtx.dynamicInput.hasTypedText()) return false
        this.enterPoint(commitCtx)
        return true
      },
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }
}

const SOLID: HatchPatternId = "SOLID"

/** -HATCH's report of a pick, in order, before the trace's outcome. */
const ANALYSIS_MESSAGES = [
  "selectingEverything",
  "selectingEverythingVisible",
  "analyzingSelectedData",
  "analyzingInternalIslands",
] as const

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
  /** `Select objects:`, by {@link ObjectSelector}. */
  | { readonly phase: "select" }
  | { readonly phase: "pattern" }
  | { readonly phase: "scale" }
  | { readonly phase: "angle" }
