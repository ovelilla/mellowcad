import { Vec2 } from "../../geometry/Vec2"
import { Vec3, vec3 } from "../../geometry/Vec3"
import { Entity, entitiesBounds, readsInPlan } from "../../domain/entities"
import {
  ArrayPath,
  PathLayout,
  arrayPathOf,
  arraySourceSize,
  pathArrayMaximum,
  pathDivideStep,
  pointAlongPath,
} from "../../domain/arrays"
import { parseNumber } from "../../domain/units"
import type { EntityId } from "../../domain/entities"
import { ScenePrimitive } from "../../scene/types"
import { isCoordinateExpression } from "../input/coordinateInput"
import { ONE_OBJECT_MODES, ObjectSelector } from "./objectSelection"
import { lockedObjectAt } from "./lockedPick"
import { rollover } from "./ghostLook"
import {
  ArrayAssociativity,
  arrayPreview,
  makeArray,
  reportArrayType,
} from "./arrayObject"
import { MAX_ARRAY_COUNT, refusesCount, takesCount } from "./arrayCounts"
import { ArrayAtPrompt, ArrayPromptGrips } from "./arrayPromptGrips"
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

/**
 * AutoCAD's ARRAYPATH, as its 2027 console asks it: `Select objects:` (or
 * ARRAY's set, {@link takeSet}), `Type = Path  Associative = Yes`, `Select
 * path curve:` — a line, an arc, a circle or a polyline —, then `Select grip
 * to edit array or [ASsociative/Method/Items/Align items/eXit] <eXit>:` over
 * a live preview. ASsociative asks as ARRAYRECT's does. Method asks `Enter
 * path method [Divide/Measure] <Measure>:`: Measure steps the items a
 * distance apart, Divide spreads them evenly over the path. Items
 * asks, by Divide, `Enter number of items along path`; by Measure, `Specify
 * the distance between items along path`, then says `Maximum items = 11` and
 * asks `Specify number of items or [Fill entire path]`. Align items asks
 * `Align arrayed items to path? [Yes/No] <Yes>:`. At first the items are one
 * and a half times the selection's size apart and fill the path. The source
 * stays where it is as item 1, the rest stepped from it along the path from
 * the end nearer the pick (`domain/arrays.ts`); the path is left in place.
 * eXit or Enter makes the array (`makeArray`), one undo step, the reference
 * at the path's start (probe arrays/p406); so does Escape once the path is
 * picked (desktop arrays/d08c), before it nothing. The main prompt picks the
 * preview's grips (`ArrayPromptGrips`). Base point, Tangent direction, Rows,
 * Levels and Z direction are not offered.
 */

type Step =
  | "main"
  | "associative"
  | "method"
  | "count"
  | "spacing"
  | "measureCount"
  | "align"

type ArrayPathState =
  /** No pre-selection: `Select objects:` builds the set. */
  | { readonly phase: "selecting" }
  /** Objects chosen; awaiting the path curve. `hover` is the rollover candidate. */
  | { readonly phase: "pickPath"; readonly hover: Entity | null }
  /** Path chosen; editing the layout with a live preview. */
  | {
      readonly phase: "edit"
      readonly originals: readonly Entity[]
      readonly path: ArrayPath
      /** The object the path was, which the array keeps (ARRAYS-D9). */
      readonly pathId: EntityId
      /** What the prompts edit: kept together, as AutoCAD keeps the count across methods. */
      readonly layout: PathLayout
      readonly step: Step
    }

export class ArrayPathTool implements Tool {
  readonly id = "arraypath"

  private state: ArrayPathState = { phase: "selecting" }
  private readonly selector = new ObjectSelector({
    takes: () => "wholeObjects",
    done: (ctx) => this.confirmSelection(ctx),
  })
  /**
   * The selection modes typed at `Select path curve:` — Previous and AUto
   * too, as its refusal lists them. AutoCAD 2027's console takes the newest
   * curve found, its run from the end nearer the mode's last point, and
   * leaves out the objects being arrayed (probes arrays/p339–p341, p353–p356,
   * p376–p378).
   */
  private readonly pathModes = new ObjectSelector({
    takes: () => "pathCurve",
    done: () => {},
    question: () => "selectPathCurve",
    modes: [...ONE_OBJECT_MODES, "Previous", "AUto"],
    accept: (ids, ctx) =>
      ids.filter((id) => {
        const entity = ctx.document.get(id)
        return entity !== undefined && !ctx.selection.has(id) && isPath(entity)
      }),
    one: {
      take: (entity, ctx, find) =>
        this.enterEdit(entity, find.last ?? null, ctx),
      newest: true,
      locked: "onLockedLayer",
      lockedAsksAgain: true,
      named: (found, ctx) => this.sayArrayed(found, ctx),
      // WHY LASTPOINT put back: a point typed on an object there leaves it
      // as it was (probe arrays/p357).
      pick: (point, ctx) => {
        ctx.setLastPoint(this.lastPointAtPath)
        this.pickCurve(point, ctx)
      },
    },
  })
  private lastScreen: Vec2 | null = null
  /** LASTPOINT as `Select path curve:` found it. */
  private lastPointAtPath: Vec3 = vec3(0, 0, 0)
  private readonly grips = new ArrayPromptGrips({
    take: (array) => {
      if (this.state.phase !== "edit" || array.kind !== "path") return
      const { method, items, spacing, align } = array
      this.setLayout({ method, items, spacing, align })
    },
    main: (ctx) => this.ask("main", ctx),
  })

  constructor(
    private readonly mode: ArrayAssociativity = { associative: true }
  ) {}

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    this.selector.start()
    if (!this.selector.preselect(ctx)) {
      this.state = { phase: "selecting" }
    } else {
      this.enterPickPath(ctx)
    }
  }

  /** Goes on from the set ARRAY selected, as from its own `Select objects:`. */
  takeSet(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    this.selector.start()
    this.enterPickPath(ctx)
  }

  /** WHY the commit point: Escape keeps the array, as ARRAYRECT's (d08c). */
  onDeactivate(ctx: ToolContext): void {
    this.create(ctx)
    this.state = { phase: "selecting" }
    this.selector.start()
    ctx.dynamicInput.close()
  }

  question(): PromptId | ToolQuestion | null {
    const state = this.state
    switch (state.phase) {
      case "pickPath":
        return this.pathModes.question()
      case "edit":
        break
      case "selecting":
        return this.selector.question()
    }
    const { layout } = state
    switch (state.step) {
      case "main":
        return this.grips.isHot() ? null : "selectGripToEditArrayOr"
      case "associative":
        return "createAssociativeArray"
      case "method":
        return "enterPathMethod"
      case "count":
        return {
          id: "enterNumberOfItemsAlongPath",
          enter: { count: layout.items },
        }
      case "spacing":
        return {
          id: "specifyDistanceBetweenItemsAlongPath",
          enter: layout.spacing,
          trimmed: true,
        }
      case "measureCount":
        return {
          id: "specifyNumberOfItemsOr",
          enter: {
            count: Math.min(layout.items, maxItems(state.path, layout.spacing)),
          },
        }
      case "align":
        return "alignArrayedItemsToPath"
    }
  }

  /** As AutoCAD 2027's console refuses them (probes arrays/p327–p336, p373). */
  takes(): QuestionInput | null {
    const state = this.state
    if (state.phase === "pickPath") return this.pathModes.takes()
    if (state.phase !== "edit") return this.selector.takes()
    switch (state.step) {
      case "main":
        return this.grips.isHot() ? null : "point"
      case "count":
      case "measureCount":
        return { refusal: "requiresPositiveInteger" }
      case "spacing":
        return {
          refusal: "requiresDistance",
          values: { points: "two", keyword: "yes" },
        }
      case "associative":
      case "method":
      case "align":
        return "keyword"
    }
  }

  /**
   * WHY at `Select path curve:`: a typed object snap picks there, its point
   * where the run starts nearest, LASTPOINT kept (probes arrays/p342–p344);
   * a mode's points are points already.
   */
  takesSnapOverride(): boolean {
    return this.state.phase === "pickPath" && !this.pathModes.inMode()
  }

  commandOptions(): readonly CommandOption[] {
    if (this.state.phase === "selecting") return this.selector.commandOptions()
    if (this.state.phase === "pickPath") return this.pathModes.commandOptions()
    switch (this.state.step) {
      case "main":
        if (this.grips.isHot()) return []
        return [
          { id: "ASsociative" },
          { id: "Method" },
          { id: "Items" },
          { id: "Align items" },
          { id: "eXit" },
        ]
      case "method":
        return [{ id: "Divide" }, { id: "Measure" }]
      case "measureCount":
        return [{ id: "Fill entire path" }]
      case "associative":
      case "align":
        return [{ id: "Yes" }, { id: "No" }]
      default:
        return []
    }
  }

  defaultOption(): string | null {
    if (this.state.phase !== "edit") return null
    const { layout } = this.state
    switch (this.state.step) {
      case "main":
        return this.grips.isHot() ? null : "eXit"
      case "associative":
        return this.mode.associative ? "Yes" : "No"
      case "method":
        return layout.method === "divide" ? "Divide" : "Measure"
      case "align":
        return layout.align ? "Yes" : "No"
      default:
        return null
    }
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    if (this.state.phase === "selecting") {
      return this.selector.invokeOption(id, ctx) ? "continue" : "unhandled"
    }
    if (this.state.phase === "pickPath") {
      return this.pathModes.invokeOption(id, ctx) ? "continue" : "unhandled"
    }
    const state = this.state
    const { layout, path } = state
    switch (state.step) {
      case "main":
        if (id === "eXit") {
          this.create(ctx)
          return "end"
        }
        if (id === "ASsociative") this.ask("associative", ctx)
        else if (id === "Method") this.ask("method", ctx)
        else if (id === "Items") {
          this.ask(layout.method === "divide" ? "count" : "spacing", ctx)
        } else if (id === "Align items") this.ask("align", ctx)
        else return "unhandled"
        return "continue"
      case "method": {
        if (id !== "Divide" && id !== "Measure") return "unhandled"
        const method = id === "Divide" ? "divide" : "measure"
        // Measure goes on from the spacing Divide had (probe arrays/p334).
        const spacing =
          method === "measure" && layout.method === "divide"
            ? pathDivideStep(path, layout.items)
            : layout.spacing
        this.state = { ...state, layout: { ...layout, method, spacing } }
        this.ask("main", ctx)
        return "continue"
      }
      case "measureCount":
        if (id !== "Fill entire path") return "unhandled"
        this.state = {
          ...state,
          layout: { ...layout, items: maxItems(path, layout.spacing) },
        }
        this.ask("main", ctx)
        return "continue"
      case "align":
        if (id !== "Yes" && id !== "No") return "unhandled"
        this.state = { ...state, layout: { ...layout, align: id === "Yes" } }
        this.ask("main", ctx)
        return "continue"
      case "associative":
        if (id !== "Yes" && id !== "No") return "unhandled"
        this.mode.associative = id === "Yes"
        this.ask("main", ctx)
        return "continue"
      default:
        return "unhandled"
    }
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen

    switch (this.state.phase) {
      case "selecting":
        this.selector.onPointerMove(input, ctx)
        break
      case "pickPath": {
        if (this.pathModes.inMode()) {
          this.pathModes.onPointerMove(input, ctx)
          break
        }
        const hit = ctx.pick(input.world)
        const hover = hit && isPath(hit) ? hit : null
        if (hover?.id !== this.state.hover?.id) {
          this.state = { phase: "pickPath", hover }
        }
        break
      }
      case "edit": {
        const at = this.atPrompt()
        if (at) this.grips.onPointerMove(input, at, ctx)
        ctx.dynamicInput.setPosition(input.screen)
        break
      }
    }

    ctx.requestRender()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return

    switch (this.state.phase) {
      case "selecting":
        this.selector.onPointerDown(input, ctx)
        return
      case "pickPath": {
        if (this.pathModes.inMode()) {
          this.pathModes.onPointerDown(input, ctx)
          return
        }
        if (input.snap) ctx.setLastPoint(this.lastPointAtPath)
        this.pickCurve(input.snap ? input.point : input.world, ctx)
        return
      }
      case "edit": {
        const at = this.atPrompt()
        if (at) this.grips.onPointerDown(input, at, ctx)
        return
      }
    }
  }

  /**
   * The pick at `Select path curve:`, clicked, typed or snapped (probes
   * arrays/p338, p342–p348): a curve on a locked layer says `1 was on a
   * locked layer.` and the prompt is asked again, an arrayed object is
   * refused in its words, another that is no path is filtered out, and on
   * nothing a window starts, as the AUto its refusal lists makes it. The
   * point picked is where the run starts nearest.
   */
  private pickCurve(world: Vec2 | Vec3, ctx: ToolContext): void {
    const at = { x: world.x, y: world.y }
    const under = ctx.pick(at)
    if (lockedObjectAt(ctx.viewport.worldToScreen(world), ctx, under)) {
      ctx.report(ctx.text.message("onLockedLayer", { count: 1 }), "error")
      return
    }
    if (!under) {
      this.pathModes.startWindow(at, ctx)
      return
    }
    if (ctx.selection.has(under.id)) {
      ctx.report(ctx.text.message("pathCurveIsArrayed"))
      ctx.report(ctx.text.message("filteredOut", { count: 1 }))
      return
    }
    if (!isPath(under)) {
      ctx.report(ctx.text.message("filteredOut", { count: 1 }))
      return
    }
    this.enterEdit(under, at, ctx)
  }

  /**
   * What Previous and ALL say when they find an arrayed object: its line,
   * then all they found counted as filtered out — ALL still taking the curve
   * (probes arrays/p354, p356). Last says the count alone (p353).
   */
  private sayArrayed(found: readonly EntityId[], ctx: ToolContext): boolean {
    if (!found.some((id) => ctx.selection.has(id))) return false
    ctx.report(ctx.text.message("pathCurveIsArrayed"))
    ctx.report(ctx.text.message("filteredOut", { count: found.length }))
    return true
  }

  answerTyped(text: string, ctx: ToolContext): boolean {
    switch (this.state.phase) {
      case "selecting":
        return this.selector.answerTyped(text, ctx)
      case "pickPath":
        return this.pathModes.answerTyped(text, ctx)
      default:
        // WHY taken and asked again: a point or a number there picks no
        // grip, and the console says nothing (probes arrays/p328, p329).
        return (
          this.state.step === "main" &&
          !this.grips.isHot() &&
          (isCoordinateExpression(text) || parseNumber(text) !== null)
        )
    }
  }

  onPointerUp(input: PointerInput, ctx: ToolContext): void {
    if (this.state.phase === "selecting") this.selector.onPointerUp(input, ctx)
    if (this.state.phase === "pickPath") this.pathModes.onPointerUp(input, ctx)
    const at = this.atPrompt()
    if (at) this.grips.onPointerUp(input, at, ctx)
  }

  cycleLasso(ctx: ToolContext): boolean {
    return this.selector.cycleLasso(ctx)
  }

  onEnter(ctx: ToolContext): boolean {
    const state = this.state
    if (state.phase === "selecting") return this.selector.onEnter(ctx)
    if (state.phase === "pickPath") {
      // WHY consumed: Enter at `Select path curve:` asks it again (probe
      // arrays/p349).
      if (this.pathModes.inMode()) this.pathModes.onEnter(ctx)
      return true
    }
    switch (state.step) {
      case "main":
        if (this.grips.onEnter(ctx)) return true
        // <eXit>: the array is made and the command ends.
        this.create(ctx)
        ctx.endCommand()
        return true
      case "associative":
      case "method":
      case "align":
        this.ask("main", ctx) // the current answer stays
        return true
      default:
        return false
    }
  }

  /** `Maximum items = N` before the count is asked again (probes arrays/p367, p373). */
  onAskAgain(ctx: ToolContext): void {
    if (this.state.phase === "edit" && this.state.step === "measureCount") {
      this.sayMaximum(ctx)
    }
  }

  /** The source is item 1 of the preview (ARRAYS-D5). */
  hiddenEntityIds(): readonly EntityId[] {
    return this.state.phase === "edit"
      ? this.state.originals.map((entity) => entity.id)
      : []
  }

  wantsSnap(): boolean {
    if (this.state.phase === "pickPath") return this.pathModes.wantsSnap()
    if (this.state.phase === "edit") return this.grips.isHot()
    return this.selector.wantsSnap()
  }

  getConstraintAnchor(): Vec2 | Vec3 | null {
    return this.atPrompt() ? this.grips.anchor() : null
  }

  /**
   * The path pick's rollover is the shared one (desktop arrays/d03-1); the
   * edit's preview draws the items as the drawing will, the path left as it
   * is (d03-2).
   */
  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    const state = this.state

    if (state.phase === "selecting") return this.selector.buildOverlay(ctx)

    if (state.phase === "pickPath") {
      if (this.pathModes.inMode()) return this.pathModes.buildOverlay(ctx)
      return state.hover ? rollover(ctx, state.hover) : []
    }

    const at = this.atPrompt()
    if (at) {
      const { array, offset } = this.grips.shown(at)
      return [
        ...arrayPreview(ctx, state.originals, array, offset),
        ...this.grips.overlay(at, ctx),
      ]
    }
    const layout = this.previewLayout(ctx, state.layout, state.step)
    return arrayPreview(
      ctx,
      state.originals,
      { kind: "path", path: state.path, pathId: state.pathId, ...layout },
      this.grips.moved()
    )
  }

  /** The array at the main prompt, whose grips it picks; null at any other. */
  private atPrompt(): ArrayAtPrompt | null {
    const state = this.state
    if (state.phase !== "edit" || state.step !== "main") return null
    const { path, pathId, layout } = state
    return {
      array: { kind: "path", path, pathId, ...layout },
      base: pointAlongPath(path, 0).point,
    }
  }

  /** Goes on from the set `Select objects:` closed to the path curve. */
  private confirmSelection(ctx: ToolContext): void {
    this.enterPickPath(ctx)
    ctx.requestRender()
  }

  private enterPickPath(ctx: ToolContext): void {
    this.state = { phase: "pickPath", hover: null }
    this.pathModes.start()
    this.lastPointAtPath = ctx.lastPoint
    reportArrayType(ctx, "path", this.mode)
    ctx.dynamicInput.open({ fields: [], commit: () => {} })
  }

  /** The path picked, its run from the end nearer `near` (null: its own start). */
  private enterEdit(
    pathEntity: Entity,
    near: Vec2 | null,
    ctx: ToolContext
  ): void {
    const path = arrayPathOf(pathEntity, near)
    if (!path) return
    const originals = ctx.selection
      .toArray()
      .map((id) => ctx.document.get(id))
      .filter((entity): entity is Entity => entity !== undefined)
    if (originals.length === 0) return

    // One and a half times the larger side of the set's extents along the
    // UCS's axes, 1 for a set of no size (probes arrays/p06, p310).
    const { width, height } = arraySourceSize(
      entitiesBounds(originals, ctx.blocks),
      ctx.ucs
    )
    const size = Math.max(width, height)
    const spacing = size > 1e-6 ? size * 1.5 : 1
    this.grips.start()
    this.state = {
      phase: "edit",
      originals,
      path,
      pathId: pathEntity.id,
      layout: {
        method: "measure",
        items: maxItems(path, spacing),
        spacing,
        align: true,
      },
      step: "main",
    }
    this.ask("main", ctx)
  }

  private ask(step: Step, ctx: ToolContext): void {
    const state = this.state
    if (state.phase !== "edit") return
    this.state = { ...state, step }
    if (
      step === "main" ||
      step === "associative" ||
      step === "method" ||
      step === "align"
    ) {
      // Keywords only, the focus left on the drawing.
      ctx.dynamicInput.open({ fields: [], commit: () => {} })
      ctx.requestRender()
      return
    }
    if (step === "measureCount") this.sayMaximum(ctx)
    const distance = step === "spacing"
    ctx.dynamicInput.open({
      fields: [
        {
          id: "value",
          prompt: distance ? "spacing" : "items",
          kind: distance ? "distance" : "number",
        },
      ],
      commit: (values, commitCtx) => this.answer(values.value, commitCtx),
      commitRaw: (commitCtx) => {
        // Enter with nothing typed keeps the value the prompt offers.
        if (commitCtx.dynamicInput.hasTypedText()) return false
        this.answer(null, commitCtx)
        return true
      },
    })
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }

  private sayMaximum(ctx: ToolContext): void {
    if (this.state.phase !== "edit") return
    ctx.report(
      ctx.text.message("maximumItems", {
        count: maxItems(this.state.path, this.state.layout.spacing),
      })
    )
  }

  /** The value typed for the step asked (null: Enter, the offered one). */
  private answer(value: number | null, ctx: ToolContext): void {
    const state = this.state
    if (state.phase !== "edit") return
    const { step, layout, path } = state
    if (value !== null && step !== "spacing" && refusesCount(value, ctx)) {
      this.onAskAgain(ctx)
      return
    }
    if (value !== null && step === "spacing" && value <= 0) {
      ctx.report(ctx.text.message("positiveNonzero"), "error")
      return
    }
    switch (step) {
      case "count":
        if (value !== null) this.setLayout({ ...layout, items: value })
        this.ask("main", ctx)
        return
      case "spacing":
        if (value !== null) this.setLayout({ ...layout, spacing: value })
        this.ask("measureCount", ctx)
        return
      case "measureCount": {
        // A count over the maximum is taken as the maximum (probe arrays/p373).
        const items = Math.min(
          value ?? layout.items,
          maxItems(path, layout.spacing)
        )
        this.setLayout({ ...layout, items })
        this.ask("main", ctx)
        return
      }
    }
  }

  private setLayout(layout: PathLayout): void {
    if (this.state.phase === "edit") this.state = { ...this.state, layout }
  }

  /** The layout the preview shows: the value being typed already applied. */
  private previewLayout(
    ctx: ToolContext,
    layout: PathLayout,
    step: Step
  ): PathLayout {
    if (step !== "count" && step !== "spacing" && step !== "measureCount") {
      return layout
    }
    const typed = parseNumber(ctx.dynamicInput.getText("value").trim())
    if (typed === null || !Number.isFinite(typed) || typed <= 0) return layout
    if (step === "spacing") return { ...layout, spacing: typed }
    if (!takesCount(typed)) return layout
    return { ...layout, items: typed }
  }

  private create(ctx: ToolContext): void {
    const state = this.state
    if (state.phase !== "edit") return
    // Left first: the command's end deactivates the tool, which commits too.
    this.state = { phase: "selecting" }
    const { path, pathId, layout } = state
    makeArray(
      ctx,
      state.originals,
      { kind: "path", path, pathId, ...layout },
      pointAlongPath(path, 0).point,
      this.mode,
      this.grips.moved()
    )
    ctx.dynamicInput.close()
  }
}

/** `Maximum items`, no more than the arrays' counts take. */
function maxItems(path: ArrayPath, spacing: number): number {
  return Math.min(MAX_ARRAY_COUNT, pathArrayMaximum(path, spacing))
}

/** A curve in the UCS's XY plane, where the array is laid out. */
function isPath(entity: Entity): boolean {
  return readsInPlan(entity) && arrayPathOf(entity) !== null
}
