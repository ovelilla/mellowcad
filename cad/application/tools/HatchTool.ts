import { V, Vec2 } from "../../geometry/Vec2"
import { normalizeAngle } from "../../geometry/primitives"
import { textIslandBox, traceBoundaryLoops } from "../../domain/boundary"
import {
  Bounds,
  Entity,
  EntityId,
  HatchEntity,
  HatchLoop,
  PolylineEntity,
  closestOnEntity,
  createHatch,
  createPolyline,
  entityBounds,
  entityElevation,
  hatchGeometry,
  hatchLoopFromEntity,
  isLevel,
  pointInsideHatch,
  readsInPlan,
  withElevation,
} from "../../domain/entities"
import {
  DEFAULT_HATCH_PATTERN_ID,
  HATCH_PATTERNS,
  HatchPatternId,
  SOLID_HATCH_PATTERN_ID,
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
import { currentColor, withCurrentProperties } from "./currentProperties"
import { setCommandSettings } from "./commandSettings"
import { askValueOrWord } from "./valueWordPrompt"

/** Reused so preview frames don't burn entity ids. */
const PREVIEW_ID: EntityId = "__hatch_preview__"
const QUICK_PREVIEW_ID: EntityId = "__hatch_quick_preview__"
const OUTLINE_ID: EntityId = "__hatch_outline__"

/**
 * AutoCAD's HATCH and -HATCH, both asking at the command line as -HATCH asks
 * (WHY for HATCH: the Hatch Creation tab and the Hatch and Gradient dialog,
 * where HATCH sets its properties, do not exist here; -HATCH is the command
 * line's own, HATCH-D31): `Current hatch pattern:  ANGLE`, then `Specify
 * internal point or [Properties/Select objects]:` until Enter makes the hatch.
 * Its two boundary routes are the two the prompt offers, in the same order:
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
 * variables, kept per drawing and not saved (`DocumentSettings`), set inside
 * the run so that U takes them back with it (probes hatch/p242, p243).
 *
 * The two names differ where the ribbon's HATCH differs from -HATCH: HATCH
 * draws the hatch at each pick and keeps it at Escape, -HATCH only highlights
 * the boundaries and drops them (desktop d01, d02; HATCH-D45, D46).
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
    leavesPrevious: true,
    done: (ctx) => this.enterPoint(ctx),
  })
  private lastScreen: Vec2 | null = null
  /** The hatch the boundaries gathered make, rebuilt as they change. */
  private preview: HatchEntity | null = null
  /** The internal points' boundaries, highlighted as AutoCAD highlights them. */
  private outlines: PolylineEntity[] = []
  /** Boundaries traced from internal points, those of each point together. */
  private picked: HatchLoop[][] = []
  /**
   * Whether this run has gathered its boundary set: once, at its first
   * internal point, found or not, and never again, Undo or not (probes
   * hatch/p104, p119).
   */
  private gathered = false
  /** Started as -HATCH, whose Escape drops what was gathered (desktop d02). */
  private dash = false
  /** The run has made its hatch, or said why not: its end makes nothing. */
  private ended = false
  /**
   * HPQUICKPREVIEW's hatch of the area under the cursor (desktop d01-1,
   * d02-1), with the face it fills, reused while the cursor stays in it.
   */
  private hover: { face: HatchEntity; hatch: HatchEntity } | null = null
  /** Where on the screen the last trace under the cursor found no area. */
  private missedAt: Vec2 | null = null

  // HPNAME / HPSCALE / HPANG as the drawing holds them, for the questions,
  // which are asked with no context.
  private patternName = DEFAULT_HATCH_PATTERN_ID
  private patternScale = 1
  private patternAngle = 0

  /** Started by the name -HATCH (`runtimeCommands`), after `onActivate`. */
  dashForm(): void {
    this.dash = true
  }

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("default")
    // "Each time you click Select Objects, HATCH clears the previous selection
    // set" — the boundary set starts empty every time, a set selected before
    // the command ignored and dropped (probes hatch/p229–p232).
    ctx.selection.clear()
    this.picked = []
    this.gathered = false
    this.dash = false
    this.ended = false
    this.forgetHover()
    this.readSettings(ctx)
    this.enterPoint(ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    // WHY: the ribbon's HATCH has made the hatch at each pick, so Escape
    // leaves it made, where -HATCH's drops it (desktop d01-3, d02). With no
    // ribbon here, HATCH makes it as it ends (HATCH-D45).
    if (!this.dash && !this.ended) this.make(ctx)
    this.state = { phase: "point" }
    this.preview = null
    this.outlines = []
    this.picked = []
    this.gathered = false
    this.forgetHover()
    ctx.dynamicInput.close()
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen
    if (this.state.phase === "select") this.selector.onPointerMove(input, ctx)
    if (this.state.phase === "point") this.hoverAt(input, ctx)
    ctx.dynamicInput.setPosition(input.screen)
    ctx.requestRender()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return
    if (this.state.phase === "point") {
      // The raw world point where no override snapped it: the running snaps
      // stay off at an area's prompt (desktop hatch/d09).
      this.addInternalPoint(input.snap ? input.point : input.world, ctx)
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

  cycleLasso(ctx: ToolContext): boolean {
    return this.selector.cycleLasso(ctx)
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
        return isSolidHatchPattern(this.patternId())
          ? "enterPatternNameOr"
          : { id: "enterPatternNameOr", enter: { name: this.patternName } }
      case "scale":
        // `<%.4f>` whatever LUPREC (table 25481, probe hatch/p259).
        return {
          id: "patternScale",
          enter: { name: this.patternScale.toFixed(4) },
        }
      case "angle":
        return {
          id: "patternAngle",
          enter: { angle: (this.patternAngle * 180) / Math.PI },
        }
    }
  }

  defaultOption(): string | null {
    return this.state.phase === "pattern" &&
      isSolidHatchPattern(this.patternId())
      ? "Solid"
      : null
  }

  /** As AutoCAD 2027's console refuses -HATCH's answers (probes hatch/p208, p210, p234). */
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
        // What a command refused there leaves (`'LINE`, p234).
        return { refusal: "hatchPatternUnknown" }
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

  invokeOption(
    id: string,
    ctx: ToolContext,
    typed?: string
  ): CommandOptionOutcome {
    if (this.state.phase === "pattern") {
      if (id === "?") this.listPatterns(ctx)
      // `_S` is HPNAME `_SOLID` (probe hatch/p207).
      else if (id === "Solid") this.setPattern(asTyped(typed, SOLID), ctx)
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

  /**
   * A typed object snap moves the internal point, `_END` then `100.5,10` onto
   * the line's end at 99.5,10 (probe hatch/p120), where the running ones
   * leave a click alone (desktop d09).
   */
  takesSnapOverride(): boolean {
    return this.state.phase === "point"
  }

  /**
   * The area under the cursor, in the object's colour (HPQUICKPREVIEW,
   * desktop d01-1, d02-1); what was gathered: HATCH's hatch as it will be made
   * (d01-2), and the internal points' boundaries highlighted, all -HATCH shows
   * (d02-2). Select objects' boundaries glow as the selection.
   */
  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    const out: ScenePrimitive[] = []
    const stroke = { color: currentColor(ctx), width: 1 }
    if (this.hover) {
      out.push(...entityScenePrimitive(ctx.viewport, this.hover.hatch, stroke))
    }
    if (this.preview && !this.dash) {
      out.push(...entityScenePrimitive(ctx.viewport, this.preview, stroke))
    }
    for (const outline of this.outlines) {
      out.push(
        ...entityScenePrimitive(ctx.viewport, outline, {
          color: THEME.selected,
          width: 2,
        })
      )
    }
    if (this.state.phase === "select") {
      out.push(...this.selector.buildOverlay(ctx))
    }
    return out
  }

  /** The registry's pattern HPNAME names, its `_` aside. */
  private patternId(): HatchPatternId {
    return (
      resolveHatchPatternId(withoutUnderscore(this.patternName)) ??
      DEFAULT_HATCH_PATTERN_ID
    )
  }

  private readSettings(ctx: ToolContext): void {
    const settings = ctx.document.getSettings()
    this.patternName = settings.hatchPatternName
    this.patternScale = settings.hatchPatternScale
    this.patternAngle = settings.hatchPatternAngle
  }

  /**
   * Quick preview under the cursor, traced only as it leaves the face it
   * found, or a few pixels past a point that found none: a trace is the
   * expensive part, never run per frame.
   */
  private hoverAt(input: PointerInput, ctx: ToolContext): void {
    const point = input.world
    if (this.hover && pointInsideHatch(this.hover.face, point)) return
    if (
      !this.hover &&
      this.missedAt !== null &&
      V.distance(this.missedAt, input.screen) < QUICK_PREVIEW_MISS_PX
    ) {
      return
    }
    this.hover = null
    this.missedAt = input.screen
    if (this.inPickedArea(point)) return
    const candidates = this.candidates(ctx)
    if (candidates.some((e) => onObject(e, point))) return
    const loops = traceBoundaryLoops(point, candidates)
    if (!loops) return
    this.missedAt = null
    this.hover = {
      face: createHatch(loops),
      hatch: withCurrentProperties(
        this.build(loops, ctx, QUICK_PREVIEW_ID),
        ctx
      ),
    }
  }

  private forgetHover(): void {
    this.hover = null
    this.missedAt = null
  }

  private inPickedArea(point: Vec2): boolean {
    return this.picked.some((loops) =>
      pointInsideHatch(createHatch(loops), point)
    )
  }

  /**
   * The boundaries of what Select objects took, in the plane of the first
   * that bounds an area (HATCH-D40). It finds every object, one that closes no
   * area too (`1 found` for an open line, -hatch in erase/p222), and what
   * cannot bound the hatch is left out here, silently beside a boundary
   * (p222), else said at Enter (`Unable to hatch the boundary.`, p223). A TEXT
   * or MTEXT inside a boundary taken is its island box, as at an internal
   * point (p228).
   */
  private selectedLoops(ctx: ToolContext): HatchLoop[] {
    let plane: number | null = null
    const loops: HatchLoop[] = []
    const texts: Vec2[][] = []
    for (const id of ctx.selection.toArray()) {
      const entity = ctx.document.get(id)
      const box = entity && readsInPlan(entity) ? textIslandBox(entity) : null
      if (box) texts.push(box)
      const loop = entity ? hatchLoopFromEntity(entity) : null
      if (!entity || !loop || !this.canBound(entity, plane)) continue
      plane ??= entityElevation(entity)
      loops.push(loop)
    }
    const areas = loops.map((loop) => createHatch([loop]))
    for (const box of texts) {
      if (areas.some((a) => box.every((c) => pointInsideHatch(a, c)))) {
        loops.push({ vertices: box })
      }
    }
    return loops
  }

  /**
   * Whether `entity` closes an area on its own in `plane`: "enclosed areas can
   * be hatched only if they are in a plane parallel to the XY plane of the
   * current UCS", so an object at an angle to it is left out, and once the
   * set has a plane an object at another height is too.
   */
  private canBound(entity: Entity, plane: number | null): boolean {
    return (
      readsInPlan(entity) &&
      hatchLoopFromEntity(entity) !== null &&
      (plane === null || samePlane(entityElevation(entity), plane))
    )
  }

  /**
   * Traces the area around an internal point and adds it to the boundary set,
   * or says why not, in the console's order (probes hatch/p104, p119, p143,
   * p144, p157): the boundary set gathered at the run's first point; a point
   * in an area already picked, or on an object, refused; `Analyzing internal
   * islands...` only for an area found. Every object parallel to the UCS is
   * traced, whatever its height, as if flattened (p153–p155, HATCH-D4).
   */
  private addInternalPoint(point: Vec2, ctx: ToolContext): void {
    if (!this.gathered) {
      for (const id of GATHERING_MESSAGES) ctx.report(ctx.text.message(id))
      this.gathered = true
    }
    const candidates = this.candidates(ctx)
    if (this.inPickedArea(point)) {
      ctx.report(ctx.text.message("areaAlreadySpecified"), "error")
    } else if (candidates.some((e) => onObject(e, point))) {
      ctx.report(ctx.text.message("pointOnObject"), "error")
    } else {
      const loops = traceBoundaryLoops(point, candidates)
      if (loops) {
        ctx.report(ctx.text.message("analyzingInternalIslands"))
        this.picked.push(loops)
      } else {
        ctx.report(ctx.text.message("hatchNoBoundary"), "error")
      }
    }
    this.forgetHover()
    this.enterPoint(ctx)
    ctx.requestRender()
  }

  /** What an internal point traces: the boundary set's objects that can bound. */
  private candidates(ctx: ToolContext): Entity[] {
    return this.boundarySet(ctx).filter(
      (e) => isLevel(e) && readsInPlan(e) && BOUNDARY_TYPES.has(e.type)
    )
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
   * Undo, as 2027's console takes it at -HATCH's internal point (probes
   * hatch/p103, p104, p106, p107, p162, p164): the boundaries of the last
   * internal point go, silently; what Select objects took stays, and with no
   * internal point left it says `No boundary to Undo.`
   */
  private undoInternalPoint(ctx: ToolContext): void {
    if (!this.picked.pop()) {
      ctx.report(ctx.text.message("noBoundaryToUndo"), "error")
    }
    this.forgetHover()
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
    // origin, so a pattern lines up with the UCS it was drawn in. The hatch
    // lies at ELEVATION whatever its boundaries' height, by either route
    // (probes hatch/p167, p168, p245, p250, p251, p261).
    return withElevation(
      createHatch(loops, {
        patternId: this.patternId(),
        patternScale: this.patternScale,
        patternAngle: ucsAngleToWorld(ctx.ucs, this.patternAngle),
        origin: ctx.ucs.origin,
        layerId: ctx.document.getCurrentLayerId(),
        id,
      }),
      ctx.ucs.origin.z + ctx.elevation
    )
  }

  /**
   * Adds the hatch of the boundaries gathered, if any; one too dense is
   * refused in AutoCAD's words ("the program may reject the hatch and display
   * a message indicating that the hatch scale is too small or its dash length
   * too short"). Either way the run has ended.
   */
  private make(ctx: ToolContext): void {
    this.ended = true
    const loops = this.allLoops(ctx)
    if (loops.length === 0) return
    const hatch = this.build(loops, ctx)
    if (hatchGeometry(hatch).truncated) {
      ctx.report(ctx.text.message("hatchTooDense"), "error")
      return
    }
    ctx.execute(new AddEntityCommand(withCurrentProperties(hatch, ctx)))
  }

  /**
   * Enter at the internal point: the hatch, or `Unable to hatch the
   * boundary.` where Select objects found objects and none bounds an area; an
   * empty run ends silently (probes hatch/p204, p223, p226, p227).
   */
  private finish(ctx: ToolContext): void {
    if (this.allLoops(ctx).length === 0 && !ctx.selection.isEmpty()) {
      ctx.report(ctx.text.message("unableToHatchBoundary"), "error")
    }
    this.make(ctx)
    // The boundary objects were only the answer to a prompt: HATCH leaves
    // nothing selected, so the palette does not go on describing them.
    ctx.selection.clear()
    ctx.endCommand()
  }

  /**
   * Rebuilds the hatch and outlines of what was gathered. Done on every change
   * rather than every frame: clipping the pattern is the expensive part of a
   * hatch and nothing about it depends on the camera.
   */
  private refreshPreview(ctx: ToolContext): void {
    const loops = this.allLoops(ctx)
    this.preview =
      loops.length > 0
        ? withCurrentProperties(this.build(loops, ctx, PREVIEW_ID), ctx)
        : null
    const boxes =
      this.picked.length === 0
        ? []
        : this.candidates(ctx).flatMap((e) => {
            const box = textIslandBox(e)
            return box ? [box] : []
          })
    this.outlines = this.picked
      .flat()
      .filter((loop) => !isTextBox(loop, boxes))
      .map((loop) =>
        createPolyline(loop.vertices, true, undefined, loop.bulges, OUTLINE_ID)
      )
  }

  /** The main prompt, after the pattern it will use. */
  private enterPoint(ctx: ToolContext): void {
    this.state = { phase: "point" }
    this.refreshPreview(ctx)
    ctx.report(
      ctx.text.message("currentHatchPattern", { name: this.patternName })
    )
    ctx.dynamicInput.open({
      fields: [{ id: "point", kind: "coordinate" }],
      // A bare number is direct distance from LASTPOINT towards the cursor
      // (probes hatch/p102, p117), though the prompt snaps nothing.
      directDistance: "lastPoint",
      commit: () => {},
      commitRaw: (commitCtx) => {
        const typed = commitCtx.dynamicInput.getText("point").trim()
        // Enter with nothing typed accepts the boundaries gathered so far.
        if (typed.length === 0) {
          this.finish(commitCtx)
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
    this.forgetHover()
    this.selector.start()
    this.refreshPreview(ctx)
    // No field: the canvas keeps focus, so Enter reaches `onEnter` to close
    // the boundary set.
    ctx.dynamicInput.open({ fields: [], commit: () => {} })
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  /**
   * The pattern name: a value's box, not a text's, so `?` and Solid are read
   * as keywords and a transparent command typed there runs (`'ZOOM`, probes
   * hatch/p234, p238).
   */
  private enterPattern(ctx: ToolContext): void {
    this.state = { phase: "pattern" }
    this.forgetHover()
    askValueOrWord(
      ctx,
      {
        field: "pattern",
        prompt: "patternName",
        shown: this.patternName,
        at: this.lastScreen,
      },
      (typed, answerCtx) => this.answerPattern(typed, answerCtx)
    )
  }

  /**
   * A name in any case, `_` before it or not: HPNAME keeps the `_` and the
   * registry's spelling (`_ANSI31`, `ANSI31` for `ansi31`; probes hatch/p217,
   * p248), the object the registry's id. Enter keeps the current one.
   */
  private answerPattern(typed: string, ctx: ToolContext): void {
    if (typed.length === 0) {
      this.setPattern(this.patternName, ctx)
      return
    }
    const name = hatchPatternNameFor(typed)
    if (name === null) {
      ctx.report(ctx.text.message("hatchPatternUnknown"), "error")
      this.enterPattern(ctx)
      return
    }
    this.setPattern(name, ctx)
  }

  /** `?`: the listing, then back at the internal point (probes hatch/p212, p221). */
  private listPatterns(ctx: ToolContext): void {
    ctx.report(
      HATCH_PATTERNS.map((p) => ctx.text.hatchPatternListing(p.id)).join("\n")
    )
    this.enterPoint(ctx)
  }

  private setPattern(name: string, ctx: ToolContext): void {
    this.patternName = name
    setCommandSettings({ hatchPatternName: name }, ctx)
    // A solid fill has no spacing or direction to ask about.
    if (isSolidHatchPattern(this.patternId())) this.enterPoint(ctx)
    else this.enterScale(ctx)
  }

  /**
   * A distance: two points are measured by the runtime (` Specify second
   * point:`, probe hatch/p209); zero and below refused in the console's words
   * (p208).
   */
  private enterScale(ctx: ToolContext): void {
    this.state = { phase: "scale" }
    const session: DynamicInputSession = {
      fields: [{ id: "scale", prompt: "patternScale", kind: "distance" }],
      commit: (values, commitCtx) => {
        if (!(values.scale > 0)) {
          commitCtx.report(commitCtx.text.message("positiveNonzero"), "error")
          return
        }
        this.patternScale = values.scale
        setCommandSettings({ hatchPatternScale: values.scale }, commitCtx)
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

  /** HPANG kept in [0, 360°): `-30` is 330 (probes hatch/p210, p262). */
  private enterAngle(ctx: ToolContext): void {
    this.state = { phase: "angle" }
    const session: DynamicInputSession = {
      fields: [{ id: "angle", prompt: "patternAngle", kind: "angle" }],
      commit: (values, commitCtx) => {
        this.patternAngle = normalizeAngle((values.angle * Math.PI) / 180)
        setCommandSettings({ hatchPatternAngle: this.patternAngle }, commitCtx)
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

const SOLID: HatchPatternId = SOLID_HATCH_PATTERN_ID

/**
 * How far, in pixels, the cursor moves from where a trace found no area
 * before the quick preview traces again: there is no face to stay inside.
 */
const QUICK_PREVIEW_MISS_PX = 8

/** What -HATCH says as it gathers the boundary set, once per run. */
const GATHERING_MESSAGES = [
  "selectingEverything",
  "selectingEverythingVisible",
  "analyzingSelectedData",
] as const

/**
 * HPNAME for a pattern typed in any case, `_` before it or not, or null for
 * no pattern of this build; HATCH's and SETVAR's.
 */
export function hatchPatternNameFor(typed: string): string | null {
  const id = resolveHatchPatternId(withoutUnderscore(typed))
  return id === null ? null : asTyped(typed, id)
}

function withoutUnderscore(name: string): string {
  return name.startsWith("_") ? name.slice(1) : name
}

/** HPNAME for pattern `id` answered as `typed`: its `_` kept (p207, p248). */
function asTyped(typed: string | undefined, id: HatchPatternId): string {
  return typed?.startsWith("_") ? `_${id}` : id
}

/** Whether `loop` is the island box of a text (one of `boxes`), no boundary drawn. */
function isTextBox(loop: HatchLoop, boxes: readonly Vec2[][]): boolean {
  return boxes.some(
    (box) =>
      box.length === loop.vertices.length &&
      box.every((corner, i) => V.distance(corner, loop.vertices[i]) < 1e-9)
  )
}

/**
 * Whether `point` lies on `entity`, which no internal point may: within the
 * trace's own tolerance, a typed point's (the desktop's pickbox for a click is
 * **unverified**, HATCH-D2).
 */
function onObject(entity: Entity, point: Vec2): boolean {
  return (
    entity.type !== "text" &&
    entity.type !== "mtext" &&
    closestOnEntity(entity, point).distance <= ON_OBJECT_TOLERANCE
  )
}

const ON_OBJECT_TOLERANCE = 1e-6

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

/** What a trace builds a boundary from, or keeps clear (`traceBoundaryLoops`). */
const BOUNDARY_TYPES = new Set<Entity["type"]>([
  "line",
  "circle",
  "arc",
  "polyline",
  "text",
  "mtext",
])

type HatchState =
  | { readonly phase: "point" }
  /** `Select objects:`, by {@link ObjectSelector}. */
  | { readonly phase: "select" }
  | { readonly phase: "pattern" }
  | { readonly phase: "scale" }
  | { readonly phase: "angle" }
