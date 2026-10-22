import { Vec2, V } from "../../geometry/Vec2"
import { capParallelLines, chamferLines } from "../../geometry/primitives"
import {
  createLine,
  carryOverrides,
  Entity,
  EntityId,
  LineEntity,
  PolylineEntity,
} from "../../domain/entities"
import {
  ReplaceEntitiesCommand,
  UpdateEntityCommand,
} from "../commands/entityCommands"
import { DynamicInputSession } from "../input/DynamicInput"
import { formatLength } from "../../domain/units"
import type { PromptId } from "../../locales/types"
import type { MessageId } from "../EngineText"
import { ScenePrimitive } from "../../scene/types"
import type { CursorBadge } from "../SceneBuilder"
import { LineCorner, LinePick, lineCorner } from "./lineCorner"
import {
  CornerCut,
  PolylineCorner,
  cutBetweenSegments,
  SegmentsRefusal,
  cutPolylineCorners,
  type PolylineCornersResult,
  reportSkipped,
} from "./polylineCorners"
import {
  CORNER_OBJECT_MODES,
  CornerJoin,
  CornerObject,
  CurveObject,
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
  cutFits,
  foundFilletObject,
  isArcSegment,
  isCornerEntity,
  isCurve,
  isRound,
  isSegment,
  joinAtCut,
  joinRefusal,
  pickChamferObject,
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
import { ModeFind, ObjectSelector } from "./objectSelection"
import { setCommandSettings } from "./commandSettings"
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
 * AutoCAD's CHAMFER: bevel the corner between two lines, cutting each of them
 * at a set distance from their intersection and joining the cuts with a
 * straight segment. The sibling of FILLET — same flow, straight cut instead of
 * an arc.
 *
 * ```
 *        [D] Distance ──► first distance ──► second distance ──► back
 *  first ──click line──► second ──click line──► chamfer ──► end, or first (Multiple)
 *    └──[P] Polyline──► polyline ──click polyline──► every corner ──► end, or first
 * ```
 *
 * The distances are measured from the corner along each line's *picked* side,
 * so where you click decides which of the four corners is cut. Two segments
 * of one polyline are objects too, bevelled within it — an arc segment as its
 * chord, what is left of it keeping its radius, as AutoCAD 2023's console
 * cuts it —, and a line with a polyline's straight segment, or straight
 * segments of two polylines, are joined into one polyline; an arc segment
 * there is `Cannot chamfer polyline arc segments.` The distances are CHAMFERA
 * and CHAMFERB, saved in the drawing and set inside the command's run so U
 * takes them back (rectang/p316, p317); both 0 simply join the lines
 * at their intersection — as Shift on the second pick does (apply corner).
 * Multiple keeps asking until Enter, and Undo takes back the last chamfer made
 * in the command; each is one command, folded into the command's undo step.
 */

/** CHAMFER's objects: a line, a polyline's segment, or a curve to refuse. */
type ChamferObject = CornerObject | CurveObject

type ChamferState =
  /** Awaiting the first object (hover-highlighted). */
  | { readonly phase: "first"; readonly hover: ChamferObject | null }
  /** First object chosen; awaiting the second (a live preview tracks the cursor). */
  | {
      readonly phase: "second"
      readonly first: ChamferObject
      /** Where the first line was clicked — picks which corner to cut. */
      readonly pick1: LinePick
      readonly cursor: LinePick
      /** Shift is held: the second pick applies a corner. */
      readonly corner: boolean
      /** What a click at {@link cursor} would do, which the ghost draws. */
      readonly preview: Outcome | null
      /** The first a polyline a mode found whole: no corner will be made. */
      readonly whole: boolean
    }
  /** Polyline: awaiting the 2D polyline whose every corner is bevelled. */
  | {
      readonly phase: "polyline"
      readonly hover: PolylineEntity | null
      /** The hovered polyline with its corners bevelled, if any is. */
      readonly cut: PolylineEntity | null
    }

/** Why a second object makes no corner, said as {@link ChamferTool} says it. */
type ChamferRefusal =
  | {
      readonly by: "refuse"
      readonly message: MessageId
      readonly invalid: boolean
    }
  | { readonly by: "pair"; readonly pair: PairRefusal }
  /** A type CHAMFER refuses, an ARC or a CIRCLE among them. */
  | { readonly by: "type"; readonly entity: Entity }
  /** `Lines are non-coplanar.`, and the first prompt again. */
  | { readonly by: "nonCoplanar" }

type Outcome = CornerOutcome<ChamferRefusal>

function refusal(message: MessageId, invalid = true): Outcome {
  return refused({ by: "refuse", message, invalid })
}

export class ChamferTool implements Tool {
  readonly id = "chamfer"

  private state: ChamferState = { phase: "first", hover: null }
  /** CHAMFERA and CHAMFERB as the command found them or is setting them. */
  private distance1 = 0
  private distance2 = 0
  /** Which distance Distance is asking (object picks paused), or null. */
  private askingDistance: "first" | "second" | null = null
  /** The second distance's `<default>` while it is asked. */
  private secondDefault = 0
  private multiple = false
  /**
   * What Undo takes back, newest last: everything since the history stood at
   * `depth`, a transparent 'LTSCALE with it (as probe corners/p156) — a
   * chamfer, or distances given in the command, with the ones they replaced.
   */
  private steps: { readonly depth: number; readonly distances?: Distances }[] =
    []
  /** The distances when Distance was chosen, until both are given. */
  private replaced: Distances = { distance1: 0, distance2: 0 }
  private lastScreen: Vec2 | null = null
  /**
   * The selection modes typed at the object prompts, each taking the newest
   * object found — the first too, where FILLET's takes two (AutoCAD 2023's
   * console). Finding none asks the prompt again.
   */
  private readonly modes = new ObjectSelector({
    done: () => {},
    modes: CORNER_OBJECT_MODES,
    // What it takes, else what it refuses in words (as FILLET's, p378).
    accept: (ids, ctx) => {
      const taken = ids.filter((id) => this.takesFound(ctx.document.get(id)))
      return taken.length > 0
        ? taken
        : ids.filter((id) =>
            typeRefusal("chamfer", ctx.document.get(id), false)
          )
    },
    one: {
      take: (entity, ctx, find) => this.takeFound(entity, find, ctx),
      newest: true,
      silent: true,
      locked: "objectOnLockedLayer",
    },
  })

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    ctx.selection.clear()
    this.reset()
    // TRIMMODE is always 1 and CHAMMODE 0 (Distance) here.
    const settings = ctx.document.getSettings()
    this.distance1 = settings.chamferDistance1
    this.distance2 = settings.chamferDistance2
    ctx.report(
      ctx.text.message("chamferSettings", {
        dist1: formatLength(this.distance1, settings),
        dist2: formatLength(this.distance2, settings),
      })
    )
    this.openKeywordPrompt(ctx)
  }

  /**
   * WHY no Angle, Trim or mEthod: CHAMMODE is always Distance and TRIMMODE 1
   * here, so they are not offered.
   */
  question(): PromptId | ToolQuestion {
    if (this.askingDistance === "first") {
      return { id: "specifyFirstChamferDistance", enter: this.distance1 }
    }
    if (this.askingDistance === "second") {
      return { id: "specifySecondChamferDistance", enter: this.secondDefault }
    }
    if (this.modes.inMode()) return this.modes.question()
    switch (this.state.phase) {
      case "first":
        return "selectFirstLineOr"
      case "second":
        return "selectSecondLineOrApplyCornerOr"
      case "polyline":
        return "selectPolylineToChamferOr"
    }
  }

  takes(): QuestionInput | null {
    if (this.askingDistance) return null
    if (this.modes.inMode()) return this.modes.takes()
    return cornerObjectRefusal(
      this.state.phase === "first" ? "chamfer" : "chamferDistance"
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
    if (this.askingDistance) {
      ctx.requestRender()
      return
    }

    switch (this.state.phase) {
      case "first":
        this.state = {
          phase: "first",
          hover: pickChamferObject(ctx, input, null),
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

  /** Polyline's prompt over `hover`, its corners bevelled as a click would. */
  private polylineHover(hover: PolylineEntity | null): ChamferState {
    return {
      phase: "polyline",
      hover,
      cut: hover && this.cutPolyline(hover).polyline,
    }
  }

  /** The ghost again, at distances changed since the cursor last moved. */
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
    if (input.button !== 0 || this.askingDistance) return
    if (this.modes.inMode()) {
      this.modes.onPointerDown(input, ctx)
      return
    }
    this.pickAt(cornerPickOf(input, ctx), input.shiftKey, ctx)
  }

  /** A point typed at an object prompt picks there, as at FILLET's. */
  answerTyped(text: string, ctx: ToolContext): boolean {
    if (this.askingDistance || this.modes.inMode()) return false
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
        if (this.refusesRound(ctx.pick(pick.world), ctx)) return
        const hit = pickChamferObject(ctx, pick, null)
        if (hit) this.takeFirst(hit, pick, false, ctx)
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
    if (this.askingDistance) return false
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
    if (this.askingDistance) return []
    if (this.modes.inMode()) return this.modes.commandOptions()
    return [...this.ownOptions(), ...this.modes.commandOptions()]
  }

  private ownOptions(): readonly CommandOption[] {
    switch (this.state.phase) {
      case "first":
        // Multiple still listed once on (probe corners/p127).
        return [
          { id: "Undo" },
          { id: "Polyline" },
          { id: "Distance" },
          { id: "Multiple" },
        ]
      case "second":
      case "polyline":
        return [{ id: "Distance" }]
    }
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    if (this.askingDistance) return "unhandled"
    if (!this.modes.inMode() && this.ownOptions().some((o) => o.id === id)) {
      this.invokeOwn(id, ctx)
      return "continue"
    }
    return this.modes.invokeOption(id, ctx) ? "continue" : "unhandled"
  }

  private invokeOwn(id: string, ctx: ToolContext): void {
    switch (id) {
      case "Distance":
        this.replaced = { distance1: this.distance1, distance2: this.distance2 }
        this.askDistance("first", ctx)
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

  /** As FILLET's (probes corners/p267, p268). */
  takesSnapOverride(): boolean {
    return !this.askingDistance && !this.modes.inMode()
  }

  snapsFromLastPoint(): boolean {
    return this.takesSnapOverride()
  }

  wantsSnap(): boolean {
    // Lines are picked by proximity, not precise points — as in FILLET/TRIM.
    // A mode's corners and points snap.
    return !this.askingDistance && this.modes.wantsSnap()
  }

  /**
   * As FILLET's: the first prompt's rollover, the segment a pick takes
   * (desktop corners/d04-2), the second's ghost (d03-1, d03-2), Polyline's.
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

  /** As FILLET's (desktop corners/d06-1). */
  cursorBadge(): CursorBadge | null {
    if (this.modes.inMode() || this.askingDistance) return null
    return this.state.phase === "second" &&
      this.state.preview?.kind === "refused"
      ? "refused"
      : null
  }

  private reset(): void {
    this.state = { phase: "first", hover: null }
    this.askingDistance = null
    this.multiple = false
    this.steps = []
    this.modes.start()
  }

  /**
   * Whether a mode's find counts: Polyline's takes a polyline, the others a
   * line, a polyline or — to refuse it — an arc or a circle.
   */
  private takesFound(entity: Entity | undefined): boolean {
    return this.state.phase === "polyline" || isCornerEntity(entity)
  }

  /**
   * An object a mode found, taken at the prompt asked as its pick would be.
   * At the second prompt it is refused as a pick there is (see
   * {@link foundPairRefusal}).
   */
  private takeFound(entity: Entity, find: ModeFind, ctx: ToolContext): void {
    if (this.state.phase === "polyline") {
      this.takePolyline(entity, ctx)
      return
    }
    if (this.refusesRound(entity, ctx)) return
    const first = this.state.phase === "second" ? this.state.first : null
    const refusal = first && foundPairRefusal(ctx, entity, find, first)
    if (refusal) {
      this.refusePair(refusal, ctx)
      return
    }
    const found = foundFilletObject(
      ctx,
      entity,
      find,
      first && isCurve(first) ? null : first
    )
    if (!found || isRound(found.object) || isCurve(found.object)) return
    if (this.state.phase === "first") {
      this.takeFirst(found.object, found.pick, found.whole, ctx)
    } else {
      this.placeSecond(found.object, found.pick, false, found.whole, ctx)
    }
  }

  private takeFirst(
    first: ChamferObject,
    pick: LinePick,
    whole: boolean,
    ctx: ToolContext
  ): void {
    this.state = {
      phase: "second",
      first,
      pick1: pick,
      cursor: pick,
      corner: false,
      preview: null,
      whole,
    }
    ctx.requestRender()
  }

  /** The second object a mode found, chamfered with the first. */
  private placeSecond(
    second: ChamferObject,
    pick2: LinePick,
    corner: boolean,
    whole: boolean,
    ctx: ToolContext
  ): void {
    this.apply(this.outcome(second, pick2, corner, whole, ctx), ctx)
  }

  /**
   * What a pick at the second prompt does (`corner`: with Shift), as
   * FILLET's: the click and the ghost both ask it, the ghost's bevel
   * `bevelId`.
   */
  private secondAt(
    pick: LinePick,
    corner: boolean,
    ctx: ToolContext,
    bevelId?: EntityId
  ): Outcome {
    if (this.state.phase !== "second") return NONE
    const hit = ctx.pick(pick.world)
    if (hit && this.roundRefusal(hit))
      return refused({ by: "type", entity: hit })
    const pair = cornerPairRefusal(ctx, pick, this.state.first)
    if (pair) return refused({ by: "pair", pair })
    const second = pickChamferObject(ctx, pick, this.state.first)
    return second
      ? this.outcome(second, pick, corner, false, ctx, bevelId)
      : NONE
  }

  /**
   * The second object, picked at `pick2` (`corner`: with Shift), chamfered
   * with the first. A polyline a mode found whole makes nothing, as AutoCAD
   * 2023's console makes nothing of it in FILLET, and says nothing.
   */
  private outcome(
    second: ChamferObject,
    pick2: LinePick,
    corner: boolean,
    whole: boolean,
    ctx: ToolContext,
    bevelId?: EntityId
  ): Outcome {
    if (this.state.phase !== "second") return NONE
    const { first, pick1 } = this.state
    if (whole || this.state.whole) return ENDS
    // An ellipse, an elliptical arc or a spline with a line: AutoCAD 2027's
    // words, and the end (probes corners/p319, p327, p370, p380).
    if (isCurve(first) || isCurve(second)) {
      return refusal("cannotChamferBetween", false)
    }
    const plane = cornerPlane(first, pick1, second, pick2, ctx.viewport)
    const join = cornerJoin(plane.first, plane.pick1, plane.second, plane.pick2)
    if (join) return this.joinOutcome(join, corner, plane.back)
    if (isSegment(plane.first) && isSegment(plane.second)) {
      const cut = this.chamferSegments(plane.first, plane.second, corner)
      return typeof cut !== "string"
        ? updated(plane.back(cut))
        : refusal(REFUSALS[cut])
    }
    if (isSegment(first) || isSegment(second)) return NONE
    return this.linesOutcome(first, pick1, second, pick2, corner, ctx, bevelId)
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

  private sayRefusal(refusal: ChamferRefusal, ctx: ToolContext): void {
    switch (refusal.by) {
      case "refuse":
        this.refuse(refusal.message, ctx, refusal.invalid)
        return
      case "pair":
        this.refusePair(refusal.pair, ctx)
        return
      case "type":
        this.refusesRound(refusal.entity, ctx)
        return
      case "nonCoplanar":
        ctx.report(ctx.text.message("linesNonCoplanar"), "error")
        this.state = { phase: "first", hover: null }
        ctx.requestRender()
    }
  }

  /**
   * The two lines cut back to the bevel, and the bevel (none when both
   * distances are 0, or for a `sharp` corner), back in the frame; `null` when the lines are parallel
   * or a cut line would vanish. A preview gives the bevel a fixed `bevelId`.
   */
  private chamfer(
    corner: LineCorner,
    line1: LineEntity,
    line2: LineEntity,
    sharp: boolean,
    ctx: ToolContext,
    bevelId?: EntityId
  ): Entity[] | "tooLarge" | null {
    const result = chamferLines(
      corner.line1.start,
      corner.line1.end,
      corner.line2.start,
      corner.line2.end,
      corner.pick1,
      corner.pick2,
      sharp ? 0 : this.distance1,
      sharp ? 0 : this.distance2
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
    if (!trimmed1 || !trimmed2) return "tooLarge"
    const built: Entity[] = [trimmed1, trimmed2]
    if (!V.equals(result.point1, result.point2)) {
      // AutoCAD puts the bevel on the lines' shared layer, or the current layer
      // when they differ.
      const layer =
        line1.layerId === line2.layerId
          ? line1.layerId
          : ctx.document.getCurrentLayerId()
      built.push(
        cornerPiece(
          corner.line1,
          corner.line2,
          createLine(result.point1, result.point2, layer, bevelId)
        )
      )
    }
    return built.map((entity) => corner.back(entity))
  }

  private linesOutcome(
    line1: LineEntity,
    pick1: LinePick,
    line2: LineEntity,
    pick2: LinePick,
    sharp: boolean,
    ctx: ToolContext,
    bevelId?: EntityId
  ): Outcome {
    const corner = lineCorner(line1, pick1, line2, pick2, ctx.viewport)
    if (!corner) return refused({ by: "nonCoplanar" })
    const chamfered = this.chamfer(corner, line1, line2, sharp, ctx, bevelId)
    if (!chamfered) {
      // WHY collinear apart: AutoCAD 2023's console says it with no *Invalid*,
      // as FILLET does; parallel lines are `Lines are parallel`, *Invalid*.
      const { line1: a, line2: b } = corner
      return capParallelLines(a.start, a.end, b.start, b.end, a.start) ===
        "collinear"
        ? refusal("collinearCannotChamfer", false)
        : refusal("linesParallel")
    }
    if (chamfered === "tooLarge") return refusal("chamferDistanceTooLarge")
    return made([line1.id, line2.id], chamfered)
  }

  /**
   * A line and a polyline's segment, or segments of two polylines, joined
   * into one polyline by the bevel; refused, as the console does, when they
   * are parallel or a distance runs past the end of its line or segment.
   */
  private joinOutcome(
    join: CornerJoin,
    sharp: boolean,
    back: (entity: Entity) => Entity
  ): Outcome {
    const refusedJoin = this.joinRefusal(join)
    if (refusedJoin) return refusal(refusedJoin, false)
    const cut = this.chamferJoin(join, sharp)
    if (!cut) return refusal("linesParallel", false)
    if (!cutFits(join, cut)) return refusal("chamferDistanceTooLarge", false)
    return made(
      [cornerEntity(join.other).id, join.segment.poly.id],
      [back(joinAtCut(join, cut))]
    )
  }

  /** Why two objects cannot be joined: an arc segment, or FILLET's reasons. */
  private joinRefusal(join: CornerJoin): MessageId | null {
    return isArcSegment(join.segment) || isArcSegment(join.other)
      ? "cannotChamferArcSegments"
      : joinRefusal(join)
  }

  /**
   * The bevel between the two objects of a join, the first distance on the
   * one picked first (none when `sharp`); `null` when parallel.
   */
  private chamferJoin(
    { otherA, otherB, otherPick, a, b, segmentPick, otherFirst }: CornerJoin,
    sharp: boolean
  ): JoinCut | null {
    const first = sharp ? 0 : this.distance1
    const second = sharp ? 0 : this.distance2
    const result = otherFirst
      ? chamferLines(
          otherA,
          otherB,
          a,
          b,
          otherPick,
          segmentPick,
          first,
          second
        )
      : chamferLines(
          a,
          b,
          otherA,
          otherB,
          segmentPick,
          otherPick,
          first,
          second
        )
    if (!result) return null
    const { corner, direction1, direction2, point1, point2 } = result
    return otherFirst
      ? {
          corner,
          otherSide: direction1,
          segmentSide: direction2,
          onOther: point1,
          onSegment: point2,
          bulge: 0,
        }
      : {
          corner,
          otherSide: direction2,
          segmentSide: direction1,
          onOther: point2,
          onSegment: point1,
          bulge: 0,
        }
  }

  /**
   * A corner that cannot be made: said, and Multiple asks for the first
   * object again; otherwise the input is `*Invalid*` (unless the console says
   * only why, as for every join) and the command ends.
   */
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

  /** The first line picked again: said, and the command ends, in Multiple too. */
  /** As FILLET's, in CHAMFER's words. */
  private refusePair(refusal: PairRefusal, ctx: ToolContext): void {
    if (refusal === "apart") {
      this.refuse("segmentsNotConsecutive", ctx)
      return
    }
    ctx.report(ctx.text.message("cannotChamferItself"), "error")
    ctx.dynamicInput.close()
    ctx.endCommand()
  }

  private refuse(message: MessageId, ctx: ToolContext, invalid = true): void {
    ctx.report(ctx.text.message(message), "error")
    if (this.multiple) {
      this.state = { phase: "first", hover: null }
      ctx.requestRender()
      return
    }
    if (invalid) ctx.report(ctx.text.message("invalid"), "error")
    ctx.dynamicInput.close()
    ctx.endCommand()
  }

  /**
   * Polyline: bevels every vertex, the first distance along the segment
   * coming into it — an arc segment as its chord (`1 line was chamfered`
   * at a line–arc vertex, the console's).
   */
  private commitPolyline(poly: PolylineEntity, ctx: ToolContext): void {
    const result = this.cutPolyline(poly)
    ctx.report(ctx.text.message("linesChamfered", { count: result.cut }))
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

  /** Polyline's cut of `poly` at the distances, which its ghost draws too. */
  private cutPolyline(poly: PolylineEntity): PolylineCornersResult {
    return cutPolylineCorners(poly, {
      lines: (corner) => this.bevel(corner, false),
      chords: true,
    })
  }

  /**
   * Executes a chamfer — none of a polyline a mode found whole —; the
   * command ends, or Multiple asks for the next.
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
   * Undo takes back the last chamfer or distances of this command and what
   * followed it; back at its start AutoCAD says so (probes corners/p149,
   * p154, as p156).
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
    if (step?.distances) this.writeDistances(step.distances, ctx)
    ctx.requestRender()
  }

  /**
   * Two segments of one polyline bevelled within it, the first distance along
   * the one picked first, an arc segment as its chord; or why they cannot be.
   */
  private chamferSegments(
    first: SegmentPick,
    second: SegmentPick,
    sharp: boolean
  ): PolylineEntity | SegmentsRefusal {
    return cutBetweenSegments(first.poly, first.index, second.index, {
      lines: (corner) => this.bevel(corner, sharp),
      chords: true,
    })
  }

  /** A polyline corner bevelled at the two distances (none when `sharp`). */
  private bevel(
    { from, corner, to }: PolylineCorner,
    sharp: boolean
  ): CornerCut | null {
    const cut = chamferLines(
      from,
      corner,
      corner,
      to,
      from,
      to,
      sharp ? 0 : this.distance1,
      sharp ? 0 : this.distance2
    )
    return cut && { entry: cut.point1, exit: cut.point2, bulge: 0 }
  }

  /**
   * An ARC or a CIRCLE picked as a line: said, and the same prompt asked
   * again (probes corners/p196–p198); an object of a type CHAMFER makes no
   * corner of, said in the console's words (see {@link typeRefusal}).
   */
  private refusesRound(hit: Entity | null, ctx: ToolContext): boolean {
    const refusal = hit && this.roundRefusal(hit)
    if (!refusal) return false
    if (refusal.ends) this.refuse(refusal.message, ctx, false)
    else ctx.report(ctx.text.message(refusal.message), "error")
    return true
  }

  private roundRefusal(hit: Entity): TypeRefusal | null {
    if (hit.type === "arc" || hit.type === "circle") {
      return { message: "chamferRequiresLines", ends: false }
    }
    return typeRefusal("chamfer", hit, this.state.phase === "second")
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

  /**
   * Distance asks the first distance, then the second, whose `<default>` is
   * the first one when it was typed, CHAMFERB when Enter kept it (probes
   * corners/p110, p111, p137).
   */
  private askDistance(which: "first" | "second", ctx: ToolContext): void {
    this.askingDistance = which
    const session: DynamicInputSession = {
      fields: [
        {
          id: "distance",
          prompt: which === "first" ? "firstDistance" : "secondDistance",
          kind: "distance",
        },
      ],
      commit: (values, commitCtx) =>
        this.setDistance(which, values.distance, commitCtx),
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setDefault(
      "distance",
      which === "first" ? this.distance1 : this.secondDefault
    )
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }

  /**
   * Then the prompt Distance was chosen at, asked again; a negative distance
   * is refused and the same distance asked again (probe corners/p119).
   */
  private setDistance(
    which: "first" | "second",
    value: number,
    ctx: ToolContext
  ): void {
    if (value < 0) {
      ctx.report(ctx.text.message("valueMustBePositive"), "error")
      return
    }
    const valid = Number.isFinite(value)
    if (which === "first") {
      this.secondDefault =
        valid && ctx.dynamicInput.hasTypedText() ? value : this.distance2
      if (valid) this.distance1 = value
      this.askDistance("second", ctx)
      return
    }
    this.askingDistance = null
    this.steps.push({ distances: this.replaced, depth: ctx.historyDepth() })
    this.writeDistances(
      {
        distance1: this.distance1,
        distance2: valid ? value : this.distance2,
      },
      ctx
    )
    this.refreshPreview(ctx)
    this.openKeywordPrompt(ctx)
    ctx.requestRender()
  }

  private writeDistances(distances: Distances, ctx: ToolContext): void {
    this.distance1 = distances.distance1
    this.distance2 = distances.distance2
    setCommandSettings(
      {
        chamferDistance1: distances.distance1,
        chamferDistance2: distances.distance2,
      },
      ctx
    )
  }
}

interface Distances {
  readonly distance1: number
  readonly distance2: number
}

const REFUSALS: Readonly<Record<SegmentsRefusal, MessageId>> = {
  parallel: "linesParallel",
  diverge: "linesDiverge",
  tooLarge: "chamferDistanceTooLarge",
  // Chords cross wherever they are not parallel, so it never comes up.
  noCorner: "linesParallel",
}

/** The preview bevel's id, reused every frame so a preview burns no entity ids. */
const PREVIEW_ID = "chamfer-preview"

/**
 * Rebuilds `line` trimmed/extended to end at `cut`: the endpoint on the picked
 * side (farther from the corner along `dir`) is kept, the other becomes the cut
 * point. Preserves the line's id and layer. `null` when the cut point is not
 * short of the kept end: the line would vanish.
 */
function trimLine(
  line: LineEntity,
  corner: Vec2,
  dir: Vec2,
  cut: Vec2
): LineEntity | null {
  const keepsEnd =
    V.dot(V.sub(line.end, corner), dir) >= V.dot(V.sub(line.start, corner), dir)
  const keepEnd = keepsEnd ? line.end : line.start
  if (V.dot(V.sub(keepEnd, cut), dir) <= 0) return null
  // WHY only the moved end changes: AutoCAD 2023's console keeps each line's
  // direction, trimmed or extended, distances 0 or not (FILLET too).
  const [start, end] = keepsEnd ? [cut, line.end] : [line.start, cut]
  return carryOverrides(line, createLine(start, end, line.layerId, line.id))
}
