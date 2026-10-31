import { Vec2, V } from "../../geometry/Vec2"
import {
  bulgeThroughPoint,
  capParallelLines,
  filletLines,
  infiniteLineIntersection,
  normalizeAngle,
  polarPoint,
} from "../../geometry/primitives"
import {
  createArc,
  createLine,
  carryOverrides,
  Entity,
  EntityId,
  LineEntity,
  PolylineEntity,
  coplanar,
  readsInPlan,
} from "../../domain/entities"
import {
  ReplaceEntitiesCommand,
  UpdateEntityCommand,
} from "../commands/entityCommands"
import type { CursorBadge } from "../SceneBuilder"
import { DynamicInputSession } from "../input/DynamicInput"
import { formatLength } from "../../domain/units"
import type { PromptId } from "../../locales/types"
import type { MessageId } from "../EngineText"
import type { MessageValues } from "../../i18n/types"
import { ScenePrimitive } from "../../scene/types"
import { LineCorner, LinePick, lineCorner } from "./lineCorner"
import {
  ArcCorner,
  CornerCut,
  PolylineCorner,
  SegmentsRefusal,
  cutBetweenSegments,
  cutPolylineCorners,
  type PolylineCornersResult,
  reportSkipped,
} from "./polylineCorners"
import {
  CORNER_OBJECT_MODES,
  CornerJoin,
  CornerObject,
  FilletObject,
  FoundObject,
  JoinCut,
  SegmentPick,
  cornerEntity,
  cornerJoin,
  cornerObjectRefusal,
  cornerPiece,
  cornerPairRefusal,
  foundPairRefusal,
  type PairRefusal,
  cornerPlane,
  roundPlane,
  curveOf,
  foundFilletObject,
  isArcSegment,
  isCornerEntity,
  isCurve,
  isRound,
  isSegment,
  joinAtCut,
  joinRefusal,
  pickFilletObject,
  refusesLockedPick,
  typedCornerPick,
  typeRefusal,
  type TypeRefusal,
  cornerPickOf,
} from "./cornerObjects"
import {
  type CornerOutcome,
  ENDS,
  NONE,
  cornerCommand,
  cornerGhost,
  cornerRollover,
  ghostHidden,
  made,
  polylineGhost,
  refused,
  updated,
} from "./cornerGhost"
import { filletCurveObjects } from "./curveObjectFillets"
import { ModeFind, ObjectSelector } from "./objectSelection"
import { setCommandSettings } from "./commandSettings"
import { type RoundObject, filletRound } from "./roundFillets"
import {
  curveCrossing,
  filletSides,
  keptEnd,
  keptSide,
  solveCornerFillet,
} from "./curveFillets"
import {
  CommandOption,
  CommandOptionOutcome,
  KeyInput,
  PointerInput,
  Tool,
  ToolContext,
  ToolQuestion,
  type QuestionInput,
} from "./Tool"

/**
 * AutoCAD's FILLET: round the corner between two lines with an arc of a given
 * radius, trimming (or extending) both lines to the points of tangency.
 *
 * ```
 *        [R] Radius ──► radius ──► back to the prompt it was asked from
 *  first ──click line──► second ──click line──► fillet ──► end, or first (Multiple)
 *    └──[P] Polyline──► polyline ──click polyline──► every corner ──► end, or first
 * ```
 *
 * The arc is placed in the corner nearest to where you clicked each line, and
 * the lines are trimmed/extended to meet it. Two segments of one polyline are
 * objects too, rounded within it, and a line with a polyline's segment, or
 * segments of two polylines, are joined into one polyline — an arc segment
 * rounded against its circle where the two cross, as AutoCAD 2023's console
 * does (`Cannot fillet between these two entities.` where they do not). An
 * ARC or a CIRCLE is an object too, rounded against a line or another of
 * them by {@link filletRound} (a circle never trimmed), and so is an ELLIPSE
 * or a SPLINE, by {@link filletCurveObjects}. Shift on the second pick applies a
 * corner instead, as a radius of 0 does. The radius is FILLETRAD, saved in the
 * drawing, set inside the command's run so U takes it back (rectang/p316, p317).
 * Multiple keeps asking for the next pair until Enter, and Undo takes back the
 * last fillet made in the command. Each fillet is one command — a
 * {@link ReplaceEntitiesCommand} for two lines, an {@link UpdateEntityCommand}
 * for a polyline — which the runtime folds into the command's undo step.
 */

type FilletState =
  /** Awaiting the first object (hover-highlighted). */
  | { readonly phase: "first"; readonly hover: FilletObject | null }
  /** First object chosen; awaiting the second (a live preview tracks the cursor). */
  | {
      readonly phase: "second"
      readonly first: FilletObject
      /** Where the first line was clicked — picks which corner to round. */
      readonly pick1: LinePick
      readonly cursor: LinePick
      /** Shift is held: the second pick applies a corner. */
      readonly corner: boolean
      /** What a click at {@link cursor} would do, which the ghost draws. */
      readonly preview: Outcome | null
      /** The first a polyline a mode found whole: no corner will be made. */
      readonly whole: boolean
      /** {@link pick1} only stands for a pick a mode did not give. */
      readonly stands: boolean
    }
  /** Polyline: awaiting the 2D polyline whose every corner is rounded. */
  | {
      readonly phase: "polyline"
      readonly hover: PolylineEntity | null
      /** The hovered polyline with its corners rounded, if any is. */
      readonly cut: PolylineEntity | null
    }

/** Why a second object makes no corner, said as {@link FilletTool} says it. */
type FilletRefusal =
  | {
      readonly by: "refuse"
      readonly message: MessageId
      readonly invalid: boolean | "sameLine"
      readonly values?: MessageValues
    }
  | { readonly by: "pair"; readonly pair: PairRefusal }
  | { readonly by: "type"; readonly type: TypeRefusal }
  /** `Lines are non-coplanar.`, and the first prompt again. */
  | { readonly by: "nonCoplanar" }

type Outcome = CornerOutcome<FilletRefusal>

function refusal(
  message: MessageId,
  invalid: boolean | "sameLine" = true,
  values?: MessageValues
): Outcome {
  return refused({ by: "refuse", message, invalid, values })
}

export class FilletTool implements Tool {
  readonly id = "fillet"
  readonly shortcut = "f"

  private state: FilletState = { phase: "first", hover: null }
  /** FILLETRAD as the command found it or set it. */
  private radius = 0
  /** True while the radius sub-prompt's input is open (object picks paused). */
  private askingRadius = false
  private multiple = false
  /**
   * What Undo takes back, newest last: everything since the history stood at
   * `depth`, a transparent 'LTSCALE with it (probe corners/p156) — a fillet,
   * or a radius given in the command, with the radius it replaced.
   */
  private steps: { readonly depth: number; readonly radius?: number }[] = []
  private lastScreen: Vec2 | null = null
  /**
   * The selection modes typed at the object prompts. The second prompt and
   * Polyline's take the newest object found; the first takes two found or
   * more as both objects, the older of the two newest first — the newer
   * first where they are parallel lines, capped from it —, and fillets
   * them (AutoCAD 2023's console). Finding none asks the prompt again.
   */
  private readonly modes = new ObjectSelector({
    done: () => {},
    modes: CORNER_OBJECT_MODES,
    // What it takes, else what it refuses in words (probe corners/p378).
    accept: (ids, ctx) => {
      const taken = ids.filter((id) => this.takesFound(ctx.document.get(id)))
      return taken.length > 0
        ? taken
        : ids.filter((id) => typeRefusal("fillet", ctx.document.get(id), false))
    },
    one: {
      take: (entity, ctx, find) => this.takeFound(entity, find, ctx),
      newest: true,
      pair: (older, newer, ctx, find) => {
        const asFirst = this.state.phase === "first"
        const [first, second] =
          asFirst && parallelLines(older, newer)
            ? [newer, older]
            : [older, newer]
        if (!asFirst || this.takeFound(first, find, ctx)) {
          this.takeFound(second, find, ctx)
        }
      },
      silent: true,
      locked: "objectOnLockedLayer",
    },
  })

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    ctx.selection.clear()
    this.reset()
    this.radius = ctx.document.getSettings().filletRadius
    // TRIMMODE is always 1 here: the lines are trimmed to the arc.
    ctx.report(
      ctx.text.message("filletSettings", {
        radius: formatLength(this.radius, ctx.document.getSettings()),
      })
    )
    this.openKeywordPrompt(ctx)
  }

  /** WHY no Trim listed: TRIMMODE is always 1 here (see {@link ownOptions}). */
  question(): PromptId | ToolQuestion {
    if (this.askingRadius) {
      return { id: "specifyFilletRadius", enter: this.radius }
    }
    if (this.modes.inMode()) return this.modes.question()
    switch (this.state.phase) {
      case "first":
        return "selectFirstObjectOr"
      case "second":
        return "selectSecondObjectOrApplyCornerOr"
      case "polyline":
        return "select2dPolylineOr"
    }
  }

  takes(): QuestionInput | null {
    if (this.askingRadius) return null
    if (this.modes.inMode()) return this.modes.takes()
    return cornerObjectRefusal(
      this.state.phase === "first" ? "fillet" : "filletRadius"
    )
  }

  onDeactivate(ctx: ToolContext): void {
    this.reset()
    ctx.dynamicInput.close()
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen
    if (this.modes.inMode()) {
      this.modes.onPointerMove(input, ctx)
      return
    }
    ctx.dynamicInput.setPosition(input.screen)
    if (this.askingRadius) {
      ctx.requestRender()
      return
    }

    switch (this.state.phase) {
      case "first":
        this.state = {
          phase: "first",
          hover: pickFilletObject(ctx, input, null),
        }
        break
      case "second": {
        const cursor = { world: input.world, screen: input.screen }
        this.state = {
          ...this.state,
          cursor,
          corner: input.shiftKey,
          preview: this.secondAt(cursor, input.shiftKey, ctx, PREVIEW_ID),
        }
        break
      }
      case "polyline":
        this.state = this.polylineHover(this.pickPolyline(input.world, ctx))
        break
    }
    ctx.requestRender()
  }

  /** Polyline's prompt over `hover`, its corners rounded as a click would. */
  private polylineHover(hover: PolylineEntity | null): FilletState {
    return {
      phase: "polyline",
      hover,
      cut: hover && this.cutPolyline(hover).polyline,
    }
  }

  /** The ghost again, at a radius changed since the cursor last moved. */
  private refreshPreview(ctx: ToolContext): void {
    if (this.state.phase === "second") {
      const { cursor, corner } = this.state
      this.state = {
        ...this.state,
        preview: this.secondAt(cursor, corner, ctx, PREVIEW_ID),
      }
    } else if (this.state.phase === "polyline") {
      this.state = this.polylineHover(this.state.hover)
    }
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0 || this.askingRadius) return
    if (this.modes.inMode()) {
      this.modes.onPointerDown(input, ctx)
      return
    }
    this.pickAt(cornerPickOf(input, ctx), input.shiftKey, ctx)
  }

  /** A point typed at an object prompt picks there (see {@link typedCornerPick}). */
  answerTyped(text: string, ctx: ToolContext): boolean {
    if (this.askingRadius || this.modes.inMode()) return false
    const pick = typedCornerPick(text, ctx)
    if (pick) this.pickAt(pick, false, ctx)
    return pick !== null
  }

  /**
   * A pick at an object prompt, clicked, typed or snapped; nothing but a
   * locked object there is said and asked again (see
   * {@link refusesLockedPick}).
   */
  private pickAt(pick: LinePick, shift: boolean, ctx: ToolContext): void {
    if (refusesLockedPick(ctx, pick)) return
    switch (this.state.phase) {
      case "first": {
        if (this.refusesType(ctx.pick(pick.world), ctx)) return
        const hit = pickFilletObject(ctx, pick, null)
        if (hit) {
          this.takeFirst(
            { object: hit, pick, whole: false, stands: false },
            ctx
          )
        }
        return
      }
      case "second":
        this.apply(this.secondAt(pick, shift, ctx), ctx)
        return
      case "polyline": {
        const hit = ctx.pick(pick.world)
        if (hit) this.takePolyline(hit, ctx)
        return
      }
    }
  }

  /**
   * Enter in a mode's prompt is the mode's; at Polyline's it ends, in
   * Multiple asks the first prompt again (probes corners/p134, p135); at the
   * second prompt it asks that again, Multiple or not (p129, p130); at the
   * first it ends (p131, p132).
   */
  onEnter(ctx: ToolContext): boolean {
    if (this.askingRadius) return false
    if (this.modes.inMode()) return this.modes.onEnter(ctx)
    if (this.state.phase === "second") return true
    if (this.state.phase !== "polyline" || !this.multiple) return false
    this.state = { phase: "first", hover: null }
    ctx.requestRender()
    return true
  }

  onKeyDown(input: KeyInput, ctx: ToolContext): void {
    if (input.key === "Escape") ctx.dynamicInput.close()
  }

  commandOptions(): readonly CommandOption[] {
    if (this.askingRadius) return []
    if (this.modes.inMode()) return this.modes.commandOptions()
    return [...this.ownOptions(), ...this.modes.commandOptions()]
  }

  private ownOptions(): readonly CommandOption[] {
    switch (this.state.phase) {
      case "first":
        // Multiple still listed once on (probe corners/p126). WHY Trim
        // hidden: TRIMMODE is always 1 here, so its prompt is not built, but
        // Spanish `R` is Recortar there, never RAdio (p165, p168).
        return [
          { id: "Undo" },
          { id: "Polyline" },
          { id: "Radius" },
          { id: "Multiple" },
          { id: "Trim", hidden: true },
        ]
      case "second":
      case "polyline":
        return [{ id: "Radius" }]
    }
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    if (this.askingRadius || id === "Trim") return "unhandled"
    if (!this.modes.inMode() && this.ownOptions().some((o) => o.id === id)) {
      this.invokeOwn(id, ctx)
      return "continue"
    }
    return this.modes.invokeOption(id, ctx) ? "continue" : "unhandled"
  }

  private invokeOwn(id: string, ctx: ToolContext): void {
    switch (id) {
      case "Radius":
        this.openRadiusPrompt(ctx)
        return
      case "Undo":
        this.undoStep(ctx)
        return
      case "Polyline":
        this.state = { phase: "polyline", hover: null, cut: null }
        ctx.requestRender()
        return
      case "Multiple":
        this.multiple = true
    }
  }

  /**
   * WHY at the object prompts: a typed or chosen object snap picks there
   * (probes corners/p257–p264, p269, p309), its Perpendicular from LASTPOINT
   * (p262); Radius's prompt and a mode's points are points already.
   */
  takesSnapOverride(): boolean {
    return !this.askingRadius && !this.modes.inMode()
  }

  snapsFromLastPoint(): boolean {
    return this.takesSnapOverride()
  }

  wantsSnap(): boolean {
    // Lines are picked by proximity, not precise points, so running snaps would
    // only clutter the hover — the same choice as TRIM/EXTEND. A mode's
    // corners and points snap.
    return !this.askingRadius && this.modes.wantsSnap()
  }

  /**
   * The first prompt's rollover, the segment a pick on a polyline takes
   * (desktop corners/d01-1, d04-2, d04-3); the second's ghost (see
   * {@link cornerGhost}); Polyline's (see {@link polylineGhost}).
   */
  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    if (this.modes.inMode()) {
      return [
        ...(this.state.phase === "second"
          ? cornerGhost(ctx, this.state.first, this.state.whole, null)
          : []),
        ...this.modes.buildOverlay(ctx),
      ]
    }
    switch (this.state.phase) {
      case "first":
        return this.state.hover ? cornerRollover(ctx, this.state.hover) : []
      case "polyline":
        return this.state.hover
          ? polylineGhost(ctx, this.state.hover, this.state.cut)
          : []
      case "second":
        return cornerGhost(
          ctx,
          this.state.first,
          this.state.whole,
          this.state.preview
        )
    }
  }

  hiddenEntityIds(): readonly EntityId[] {
    if (this.modes.inMode()) return []
    if (this.state.phase === "second") return ghostHidden(this.state.preview)
    return this.state.phase === "polyline" && this.state.cut
      ? [this.state.cut.id]
      : []
  }

  /** The circle-and-slash over a second object the pair refuses (desktop corners/d06-1). */
  cursorBadge(): CursorBadge | null {
    if (this.modes.inMode() || this.askingRadius) return null
    return this.state.phase === "second" &&
      this.state.preview?.kind === "refused"
      ? "refused"
      : null
  }

  private reset(): void {
    this.state = { phase: "first", hover: null }
    this.askingRadius = false
    this.multiple = false
    this.steps = []
    this.modes.start()
  }

  /** Whether a mode's find counts: Polyline's takes a polyline. */
  private takesFound(entity: Entity | undefined): boolean {
    return (
      this.state.phase === "polyline" ||
      isCornerEntity(entity) ||
      entity?.type === "ellipse" ||
      entity?.type === "spline"
    )
  }

  /**
   * An object a mode found, taken at the prompt asked as its pick would be;
   * false when it takes nothing there. At the second prompt it is refused
   * as a pick there is (see {@link foundPairRefusal}).
   */
  private takeFound(entity: Entity, find: ModeFind, ctx: ToolContext): boolean {
    if (this.state.phase === "polyline") {
      this.takePolyline(entity, ctx)
      return true
    }
    if (this.refusesType(entity, ctx)) return false
    const first = this.state.phase === "second" ? this.state.first : null
    const refusal = first && foundPairRefusal(ctx, entity, find, first)
    if (refusal) {
      this.refusePair(refusal, ctx)
      return false
    }
    const found = foundFilletObject(ctx, entity, find, first)
    if (!found) return false
    if (this.state.phase === "first") this.takeFirst(found, ctx)
    else this.placeSecond(found.object, found.pick, false, found.whole, ctx)
    return true
  }

  /**
   * An object of a type FILLET makes no corner of, said in the console's
   * words (see {@link typeRefusal}).
   */
  private refusesType(entity: Entity | null, ctx: ToolContext): boolean {
    const refusal = typeRefusal("fillet", entity, this.state.phase === "second")
    if (refusal) this.sayType(refusal, ctx)
    return refusal !== null
  }

  private sayType(refusal: TypeRefusal, ctx: ToolContext): void {
    if (refusal.ends) this.refuse(refusal.message, ctx, false)
    else ctx.report(ctx.text.message(refusal.message), "error")
  }

  /**
   * The first object again: said, and the command ends, in Multiple too; a
   * segment of its polyline two or more away as any corner not made.
   */
  private refusePair(refusal: PairRefusal, ctx: ToolContext): void {
    if (refusal === "apart") {
      this.refuse("segmentsNotConsecutive", ctx)
      return
    }
    ctx.report(ctx.text.message("cannotFilletItself"), "error")
    ctx.dynamicInput.close()
    ctx.endCommand()
  }

  /**
   * Polyline's object: anything else says so and asks again, a mode's
   * newest find too (acc/j1–j7, k7, k8).
   */
  private takePolyline(entity: Entity, ctx: ToolContext): void {
    if (entity.type === "polyline") {
      this.commitPolyline(entity, ctx)
    } else {
      ctx.report(ctx.text.message("notA2dPolyline"), "error")
    }
  }

  private takeFirst(found: FoundObject, ctx: ToolContext): void {
    this.state = {
      phase: "second",
      first: found.object,
      pick1: found.pick,
      cursor: found.pick,
      corner: false,
      preview: null,
      whole: found.whole,
      stands: found.stands,
    }
    ctx.requestRender()
  }

  /** The second object a mode found, filleted with the first. */
  private placeSecond(
    second: FilletObject,
    pick2: LinePick,
    corner: boolean,
    whole: boolean,
    ctx: ToolContext
  ): void {
    this.apply(this.outcome(second, pick2, corner, whole, ctx), ctx)
  }

  /**
   * What a pick at the second prompt does (`corner`: with Shift): an object
   * of a type FILLET refuses, the first again, or the corner with what it
   * takes. The click and the ghost both ask it, the ghost's arc `arcId`.
   */
  private secondAt(
    pick: LinePick,
    corner: boolean,
    ctx: ToolContext,
    arcId?: EntityId
  ): Outcome {
    if (this.state.phase !== "second") return NONE
    const type = typeRefusal("fillet", ctx.pick(pick.world), true)
    if (type) return refused({ by: "type", type })
    const pair = cornerPairRefusal(ctx, pick, this.state.first)
    if (pair) return refused({ by: "pair", pair })
    const second = pickFilletObject(ctx, pick, this.state.first)
    return second ? this.outcome(second, pick, corner, false, ctx, arcId) : NONE
  }

  /**
   * The second object, picked at `pick2` (`corner`: with Shift), filleted
   * with the first. A polyline a mode found whole makes nothing, as AutoCAD
   * 2023's console makes nothing of it, and says nothing.
   */
  private outcome(
    second: FilletObject,
    pick2: LinePick,
    corner: boolean,
    whole: boolean,
    ctx: ToolContext,
    arcId?: EntityId
  ): Outcome {
    if (this.state.phase !== "second") return NONE
    const { first, pick1, stands } = this.state
    if (whole || this.state.whole) return ENDS
    const radius = corner ? 0 : this.radius
    if (isCurve(first) || isCurve(second)) {
      return curveOutcome(first, pick1, second, pick2, radius, ctx, arcId)
    }
    if (isRound(first) || isRound(second)) {
      return this.roundOutcome(first, pick1, second, pick2, radius, ctx, arcId)
    }
    const plane = cornerPlane(first, pick1, second, pick2, ctx.viewport)
    const join = cornerJoin(plane.first, plane.pick1, plane.second, plane.pick2)
    if (join) return joinOutcome(join, radius, plane.back)
    if (isSegment(plane.first) && isSegment(plane.second)) {
      const cut = filletSegments(plane.first, plane.second, radius)
      if (typeof cut !== "string") return updated(plane.back(cut))
      return cut === "noCorner"
        ? refusal("cannotFilletBetween", "sameLine")
        : refusal(REFUSALS[cut])
    }
    if (isSegment(first) || isSegment(second)) return NONE
    const capFrom = stands ? originPick(ctx) : pick1
    const lines = lineCorner(first, pick1, second, pick2, ctx.viewport)
    if (!lines) return refused({ by: "nonCoplanar" })
    const filleted = this.fillet(lines, first, second, radius, ctx, arcId)
    if (filleted === "tooLarge") return refusal("filletRadiusTooLarge")
    return filleted
      ? made([first.id, second.id], filleted)
      : this.capOutcome(first, capFrom, second, pick2, ctx, arcId)
  }

  /** Does what `outcome` says: the corner made, the refusal said. */
  private apply(outcome: Outcome, ctx: ToolContext): void {
    switch (outcome.kind) {
      case "made":
        this.done(cornerCommand(outcome), ctx)
        return
      case "none":
        if (outcome.ends) this.done(null, ctx)
        return
      case "refused":
        this.sayRefusal(outcome.refusal, ctx)
    }
  }

  private sayRefusal(refusal: FilletRefusal, ctx: ToolContext): void {
    switch (refusal.by) {
      case "refuse":
        this.refuse(refusal.message, ctx, refusal.invalid, refusal.values)
        return
      case "pair":
        this.refusePair(refusal.pair, ctx)
        return
      case "type":
        this.sayType(refusal.type, ctx)
        return
      case "nonCoplanar":
        ctx.report(ctx.text.message("linesNonCoplanar"), "error")
        this.state = { phase: "first", hover: null }
        ctx.requestRender()
    }
  }

  /**
   * The two lines trimmed or extended to the arc of `radius`, and the arc
   * (none at radius 0), back in the frame; `null` when the lines are
   * parallel, `tooLarge` when a line would be trimmed away. A preview gives
   * the arc a fixed `arcId`, so it burns no entity ids.
   */
  private fillet(
    corner: LineCorner,
    line1: LineEntity,
    line2: LineEntity,
    radius: number,
    ctx: ToolContext,
    arcId?: EntityId
  ): Entity[] | "tooLarge" | null {
    const result = filletLines(
      corner.line1.start,
      corner.line1.end,
      corner.line2.start,
      corner.line2.end,
      corner.pick1,
      corner.pick2,
      radius
    )
    if (!result) return null
    const trimmed1 = trimLine(
      corner.line1,
      result.corner,
      result.direction1,
      result.tangent1
    )
    const trimmed2 = trimLine(
      corner.line2,
      result.corner,
      result.direction2,
      result.tangent2
    )
    if (!trimmed1 || !trimmed2) return "tooLarge"
    const built: Entity[] = [trimmed1, trimmed2]
    if (result.radius > 0) {
      // AutoCAD places the arc on the lines' shared layer, or the current layer
      // when they differ.
      const arcLayer =
        line1.layerId === line2.layerId
          ? line1.layerId
          : ctx.document.getCurrentLayerId()
      built.push(
        cornerPiece(
          corner.line1,
          corner.line2,
          createArc(
            result.center,
            result.radius,
            result.startAngle,
            result.endAngle,
            arcLayer,
            arcId
          )
        )
      )
    }
    return built.map((entity) => corner.back(entity))
  }

  /**
   * Two parallel lines capped with a half circle, whatever the radius;
   * collinear, `Collinear lines connot be filleted.`, Autodesk's typo and
   * all, and no `*Invalid*` (acc/e6, h3). WHY nothing is made where the
   * second line would turn back: the console then adds a zero-length arc at
   * the origin and changes nothing else, silently (acc/e4, h5).
   */
  private capOutcome(
    line1: LineEntity,
    capFrom: LinePick,
    line2: LineEntity,
    pick2: LinePick,
    ctx: ToolContext,
    arcId?: EntityId
  ): Outcome {
    const corner = lineCorner(line1, capFrom, line2, pick2, ctx.viewport)
    const capped = corner && this.cap(corner, line1, line2, ctx, arcId)
    if (capped === "collinear") return refusal("collinearCannotFillet", false)
    if (capped === "turnsBack") return ENDS
    return capped ? made([line2.id], capped) : NONE
  }

  /**
   * The cap AutoCAD's FILLET joins two parallel lines with (see
   * {@link capParallelLines}): the second line with its end moved, and the
   * half circle, on the lines' layer or the current one and wearing the
   * second's lineweight and thickness (probes corners/p360, p361), back in
   * the frame.
   */
  private cap(
    corner: LineCorner,
    line1: LineEntity,
    line2: LineEntity,
    ctx: ToolContext,
    arcId?: EntityId
  ): Entity[] | "collinear" | "turnsBack" | null {
    const { line1: a, line2: b } = corner
    const cap = capParallelLines(a.start, a.end, b.start, b.end, corner.pick1)
    if (!cap || typeof cap === "string") return cap
    const moved = carryOverrides(
      b,
      createLine(
        cap.moved === "start" ? cap.across : b.start,
        cap.moved === "end" ? cap.across : b.end,
        b.layerId,
        b.id
      )
    )
    const arcLayer =
      line1.layerId === line2.layerId
        ? line1.layerId
        : ctx.document.getCurrentLayerId()
    const arc = cornerPiece(
      b,
      b,
      createArc(
        cap.center,
        cap.radius,
        cap.startAngle,
        cap.endAngle,
        arcLayer,
        arcId
      )
    )
    return [moved, arc].map((entity) => corner.back(entity))
  }

  /**
   * An ARC or a CIRCLE with a line or another of them; with a polyline's
   * segment, `Cannot fillet between these two entities.` (acc/d1–d3); out
   * of each other's plane, `Two entities are non coplanar.` (acc/w1–w6 of
   * 2026-10-14: at another height, or one upright); in a tilted plane they
   * share, rounded in it (see {@link roundPlane}).
   */
  private roundOutcome(
    first: CornerObject | RoundObject,
    pick1: LinePick,
    second: CornerObject | RoundObject,
    pick2: LinePick,
    radius: number,
    ctx: ToolContext,
    arcId?: EntityId
  ): Outcome {
    if (isSegment(first) || isSegment(second)) {
      return refusal("cannotFilletBetween", false)
    }
    const plane = roundPlane(first, pick1, second, pick2, ctx.viewport)
    if (!plane) return refusal("twoEntitiesNonCoplanar", false)
    const filleted = filletRound(
      plane.first,
      plane.pick1,
      plane.second,
      plane.pick2,
      radius,
      ctx.document.getCurrentLayerId(),
      arcId
    )
    if (filleted === "noValidFillet") {
      return refusal("noValidFillet", false, {
        radius: formatLength(radius, ctx.document.getSettings()),
      })
    }
    if (filleted === "nothing") return ENDS
    return made(
      filleted.replaced,
      filleted.built.map((entity) =>
        filleted.replaced.includes(entity.id)
          ? plane.back(entity)
          : plane.made(entity)
      )
    )
  }

  /**
   * A corner that cannot be made: said, and Multiple asks for the first
   * object again; otherwise the input is `*Invalid*` (unless the console says
   * only why, as for every join) and the command ends. Two segments of one
   * polyline an arc cannot round write it on the reason's own line, as the
   * console does: `Cannot fillet between these two entities.*Invalid*`.
   */
  private refuse(
    message: MessageId,
    ctx: ToolContext,
    invalid: boolean | "sameLine" = true,
    values?: MessageValues
  ): void {
    const said = ctx.text.message(message, values)
    if (this.multiple) {
      ctx.report(said, "error")
      this.state = { phase: "first", hover: null }
      ctx.requestRender()
      return
    }
    const invalidText = ctx.text.message("invalid")
    if (invalid === "sameLine") {
      ctx.report(said + invalidText, "error")
    } else {
      ctx.report(said, "error")
      if (invalid) ctx.report(invalidText, "error")
    }
    ctx.dynamicInput.close()
    ctx.endCommand()
  }

  /**
   * Polyline: rounds every corner where two line segments meet, and replaces
   * an arc segment between two lines that converge towards it — at radius 0
   * removes it, the lines meeting at their crossing.
   */
  private commitPolyline(poly: PolylineEntity, ctx: ToolContext): void {
    const result = this.cutPolyline(poly)
    ctx.report(ctx.text.message("linesFilleted", { count: result.cut }))
    reportSkipped(result, ctx)
    if (result.polyline) {
      this.done(new UpdateEntityCommand(result.polyline), ctx)
    } else if (this.multiple) {
      this.state = { phase: "first", hover: null }
      ctx.requestRender()
    } else {
      ctx.dynamicInput.close()
      ctx.endCommand()
    }
  }

  /** Polyline's cut of `poly` at the radius, which its ghost draws too. */
  private cutPolyline(poly: PolylineEntity): PolylineCornersResult {
    return cutPolylineCorners(poly, {
      lines: (corner) => filletCorner(corner, this.radius),
      acrossArcs: true,
      arcs: (corner) => filletArcCorner(corner, this.radius),
    })
  }

  /**
   * Executes a fillet — none where two circles meet at radius 0, which the
   * console leaves as they are —; the command ends, or Multiple asks for the
   * next.
   */
  private done(
    command: ReplaceEntitiesCommand | UpdateEntityCommand | null,
    ctx: ToolContext
  ): void {
    if (command) this.steps.push({ depth: ctx.historyDepth() })
    if (this.multiple) {
      this.state = { phase: "first", hover: null }
      if (command) ctx.execute(command)
      ctx.requestRender()
      return
    }
    if (command) ctx.execute(command)
    ctx.dynamicInput.close()
    ctx.endCommand()
  }

  /**
   * Undo takes back the last fillet or radius of this command and what
   * followed it; back at its start AutoCAD says so (probes corners/p148,
   * p150, p156).
   */
  private undoStep(ctx: ToolContext): void {
    const step = this.steps.pop()
    // WHY said first: the console writes `Regenerating model.` after it,
    // when what goes back had queued one (p156).
    if (this.steps.length === 0) {
      ctx.report(ctx.text.message("commandCompletelyUndone"))
    }
    if (step) ctx.undoTo(step.depth)
    // Set back by hand where UNDO Control None kept nothing to take back.
    if (step?.radius !== undefined) this.writeRadius(step.radius, ctx)
    ctx.requestRender()
  }

  private pickPolyline(world: Vec2, ctx: ToolContext): PolylineEntity | null {
    const hit = ctx.pick(world)
    return hit?.type === "polyline" ? hit : null
  }

  /** A prompt answered by a pick or a keyword, its keywords on the tooltip. */
  private openKeywordPrompt(ctx: ToolContext): void {
    const session: DynamicInputSession = { fields: [], commit: () => {} }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  private openRadiusPrompt(ctx: ToolContext): void {
    this.askingRadius = true
    const session: DynamicInputSession = {
      fields: [{ id: "radius", prompt: "filletRadius", kind: "distance" }],
      commit: (values, commitCtx) => this.setRadius(values.radius, commitCtx),
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setDefault("radius", this.radius)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }

  /**
   * The radius, then the prompt Radius was chosen at, asked again; a
   * negative one is refused and the radius asked again (probe corners/p116).
   */
  private setRadius(value: number, ctx: ToolContext): void {
    if (value < 0) {
      ctx.report(ctx.text.message("valueMustBePositive"), "error")
      return
    }
    this.askingRadius = false
    if (Number.isFinite(value)) {
      this.steps.push({ radius: this.radius, depth: ctx.historyDepth() })
      this.writeRadius(value, ctx)
    }
    this.refreshPreview(ctx)
    this.openKeywordPrompt(ctx)
    ctx.requestRender()
  }

  private writeRadius(value: number, ctx: ToolContext): void {
    this.radius = value
    setCommandSettings({ filletRadius: value }, ctx)
  }
}

/**
 * An ELLIPSE or a SPLINE with the other object (see
 * {@link filletCurveObjects}), in AutoCAD 2027's console's words: with a
 * polyline's segment `Cannot fillet between these two entities.` at any
 * radius (probes corners/p367, p385, p464–p466); out of its plane — a spline
 * in none — `The entities are non-coplanar.` (p479); each ending the command,
 * or in Multiple asking the first prompt again (p475). WHY a tilted plane
 * is asked again without a word: AutoCAD rounds them in it, not built.
 */
function curveOutcome(
  first: FilletObject,
  pick1: LinePick,
  second: FilletObject,
  pick2: LinePick,
  radius: number,
  ctx: ToolContext,
  arcId?: EntityId
): Outcome {
  if (isSegment(first) || isSegment(second)) {
    return refusal("cannotFilletBetweenThese", false)
  }
  if (!coplanar(first, second)) return refusal("entitiesNonCoplanar", false)
  if (!readsInPlan(first) || !readsInPlan(second)) return NONE
  const settings = ctx.document.getSettings()
  const filleted = filletCurveObjects(
    first,
    pick1.world,
    second,
    pick2.world,
    radius,
    {
      layerId: ctx.document.getCurrentLayerId(),
      lineweight: settings.currentLineweight,
    },
    arcId
  )
  switch (filleted) {
    case "unable":
      return refusal("unableToFilletCurves", false)
    case "noValid":
      return refusal("noValidCurveFillet", false, {
        radius: formatLength(radius, settings),
      })
    case "nothing":
      return ENDS
    default:
      return made(filleted.replaced, filleted.built)
  }
}

/**
 * A line and a polyline's segment, or segments of two polylines, joined
 * into one polyline through the arc; parallel, `Cannot fillet between these
 * two entities.`
 */
function joinOutcome(
  join: CornerJoin,
  radius: number,
  back: (entity: Entity) => Entity
): Outcome {
  const refusedJoin = joinRefusal(join)
  if (refusedJoin) return refusal(refusedJoin, false)
  const cut = filletJoin(join, radius)
  if (!cut) return refusal("cannotFilletBetween", false)
  return made(
    [cornerEntity(join.other).id, join.segment.poly.id],
    [back(joinAtCut(join, cut))]
  )
}

/**
 * Whether two objects are parallel lines, which the console caps from the
 * newer when a mode finds both at once (acc/d3, e1, g1, h1).
 */
function parallelLines(a: Entity, b: Entity): boolean {
  return (
    a.type === "line" &&
    b.type === "line" &&
    !infiniteLineIntersection(a.start, a.end, b.start, b.end)
  )
}

/**
 * The origin as a pick: where the console reads a capped line's end from
 * when a mode but a fence found it (acc/g1, g5, g6, g8, h2).
 */
function originPick(ctx: ToolContext): LinePick {
  const origin = { x: 0, y: 0 }
  return { world: origin, screen: ctx.viewport.worldToScreen(origin) }
}

/** The preview arc's id, reused every frame so a preview burns no entity ids. */
const PREVIEW_ID = "fillet-preview"

/**
 * Rebuilds `line` trimmed/extended to end at `tangent`: the endpoint on the
 * picked side (farther from the corner along `dir`) is kept, the other becomes
 * the tangent point. Preserves the line's id and layer. `null` when the
 * tangent point is not short of the kept end: the line would vanish.
 */
function trimLine(
  line: LineEntity,
  corner: Vec2,
  dir: Vec2,
  tangent: Vec2
): LineEntity | null {
  const keepsEnd =
    V.dot(V.sub(line.end, corner), dir) >= V.dot(V.sub(line.start, corner), dir)
  const keepEnd = keepsEnd ? line.end : line.start
  if (V.dot(V.sub(keepEnd, tangent), dir) <= 0) return null
  // WHY only the moved end changes: AutoCAD 2023's console keeps each line's
  // direction, trimmed or extended, radius 0 or not (CHAMFER too).
  const [start, end] = keepsEnd ? [tangent, line.end] : [line.start, tangent]
  return carryOverrides(line, createLine(start, end, line.layerId, line.id))
}

const REFUSALS: Readonly<
  Record<Exclude<SegmentsRefusal, "noCorner">, MessageId>
> = {
  parallel: "linesParallel",
  diverge: "linesDiverge",
  tooLarge: "filletRadiusTooLarge",
}

/**
 * The arc between the two objects of a join; `null` when parallel, or for an
 * arc segment when the two do not cross or the arc does not fit on what each
 * keeps (`Cannot fillet between these two entities.`, the console's).
 */
function filletJoin(join: CornerJoin, radius: number): JoinCut | null {
  if (isArcSegment(join.segment) || isArcSegment(join.other)) {
    return filletArcJoin(join, radius)
  }
  const { otherA, otherB, otherPick, a, b, segmentPick } = join
  const result = filletLines(
    otherA,
    otherB,
    a,
    b,
    otherPick,
    segmentPick,
    radius
  )
  if (!result) return null
  const sweep = normalizeAngle(result.endAngle - result.startAngle)
  const mid = polarPoint(
    result.center,
    result.radius,
    result.startAngle + sweep / 2
  )
  return {
    corner: result.corner,
    otherSide: result.direction1,
    segmentSide: result.direction2,
    onOther: result.tangent1,
    onSegment: result.tangent2,
    bulge:
      result.radius > 0
        ? bulgeThroughPoint(result.tangent2, result.tangent1, mid)
        : 0,
  }
}

/**
 * A join where either object is an arc segment, rounded where the two cross
 * nearest the picks — a line, or the other's circle, extended to it —, each
 * kept on its picked side; at radius 0 they meet there.
 */
function filletArcJoin(join: CornerJoin, radius: number): JoinCut | null {
  const segment = curveOf(join.segment)
  const other = curveOf(join.other)
  const corner = curveCrossing(
    segment,
    other,
    V.lerp(join.segmentPick, join.otherPick, 0.5)
  )
  if (!corner) return null
  const keeps = {
    segment: keptEnd(segment, corner, join.segmentPick),
    other: keptEnd(other, corner, join.otherPick),
  }
  const cut = filletSides(
    keptSide(segment, corner, keeps.segment, true),
    keptSide(other, corner, keeps.other, false),
    corner,
    radius
  )
  if (!cut) return null
  const toward = (end: Vec2) => V.normalize(V.sub(end, corner))
  return {
    corner,
    otherSide: toward(keeps.other === "a" ? other.a : other.b),
    segmentSide: toward(keeps.segment === "a" ? segment.a : segment.b),
    onOther: cut.exit,
    onSegment: cut.entry,
    bulge: cut.bulge,
    keeps,
  }
}

/** Two segments of one polyline rounded within it, or why they cannot be. */
function filletSegments(
  first: SegmentPick,
  second: SegmentPick,
  radius: number
): PolylineEntity | SegmentsRefusal {
  return cutBetweenSegments(first.poly, first.index, second.index, {
    lines: (corner) => filletCorner(corner, radius),
    arcs: ({ incoming, corner, outgoing }) =>
      filletSides(
        keptSide(incoming, corner, "a", true),
        keptSide(outgoing, corner, "b", false),
        corner,
        radius
      ),
  })
}

/** A polyline corner rounded at `radius`; at 0 the lines meet at the corner. */
function filletCorner(
  { from, corner, to }: PolylineCorner,
  radius: number
): CornerCut | null {
  const result = filletLines(from, corner, corner, to, from, to, radius)
  if (!result) return null
  if (result.radius <= 0) return { entry: corner, exit: corner, bulge: 0 }
  const sweep = normalizeAngle(result.endAngle - result.startAngle)
  const mid = polarPoint(
    result.center,
    result.radius,
    result.startAngle + sweep / 2
  )
  return {
    entry: result.tangent1,
    exit: result.tangent2,
    bulge: bulgeThroughPoint(result.tangent1, result.tangent2, mid),
  }
}

/**
 * A polyline vertex an arc segment meets, rounded at `radius` by the circle
 * tangent to both sides (FILLETPOLYARC 1); `null` when none fits there.
 */
function filletArcCorner(
  { incoming, corner, outgoing }: ArcCorner,
  radius: number
): CornerCut | null {
  return solveCornerFillet(
    keptSide(incoming, corner, "a", true),
    keptSide(outgoing, corner, "b", false),
    corner,
    radius
  )
}
