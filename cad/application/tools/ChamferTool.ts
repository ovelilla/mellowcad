import { Vec2, V } from "../../geometry/Vec2"
import { capParallelLines, chamferLines } from "../../geometry/primitives"
import {
  createLine,
  carryOverrides,
  carryPlane,
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
import { ScenePrimitive, StrokeStyle } from "../../scene/types"
import { THEME } from "../../scene/theme"
import { entityScenePrimitive } from "../SceneBuilder"
import { LineCorner, LinePick, lineCorner } from "./lineCorner"
import {
  CornerCut,
  PolylineCorner,
  cutBetweenSegments,
  SegmentsRefusal,
  cutPolylineCorners,
  reportSkipped,
} from "./polylineCorners"
import {
  CORNER_OBJECT_MODES,
  CornerJoin,
  CornerObject,
  JoinCut,
  SegmentPick,
  cornerEntity,
  cornerJoin,
  cornerObjectRefusal,
  cornerPairRefusal,
  cornerPlane,
  cutFits,
  foundFilletObject,
  isArcSegment,
  isCornerEntity,
  isRound,
  isSegment,
  joinAtCut,
  joinRefusal,
  pickCornerObject,
  typedCornerPick,
} from "./cornerObjects"
import { ModeFind, ObjectSelector } from "./objectSelection"
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
 * there is `Cannot chamfer polyline arc segments.` The distances persist for the tool's session, like AutoCAD's, and both being 0 simply joins the lines
 * at their intersection — as Shift on the second pick does (apply corner).
 * Multiple keeps asking until Enter, and Undo takes back the last chamfer made
 * in the command; each is one command, folded into the command's undo step.
 */

type ChamferState =
  /** Awaiting the first object (hover-highlighted). */
  | { readonly phase: "first"; readonly hover: CornerObject | null }
  /** First object chosen; awaiting the second (a live preview tracks the cursor). */
  | {
      readonly phase: "second"
      readonly first: CornerObject
      /** Where the first line was clicked — picks which corner to cut. */
      readonly pick1: LinePick
      readonly hover: CornerObject | null
      readonly cursor: LinePick
      /** Shift is held: the second pick applies a corner. */
      readonly corner: boolean
      /** The first a polyline a mode found whole: no corner will be made. */
      readonly whole: boolean
    }
  /** Polyline: awaiting the 2D polyline whose every corner is bevelled. */
  | { readonly phase: "polyline"; readonly hover: PolylineEntity | null }

export class ChamferTool implements Tool {
  readonly id = "chamfer"

  private state: ChamferState = { phase: "first", hover: null }
  /** CHAMFERA and CHAMFERB, kept for the session. */
  private distance1 = 0
  private distance2 = 0
  /** Which distance Distance is asking (object picks paused), or null. */
  private askingDistance: "first" | "second" | null = null
  private multiple = false
  /**
   * What Undo takes back, newest last: a chamfer, or distances given in the
   * command (the ones they replaced).
   */
  private steps: (Distances | "chamfer")[] = []
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
    accept: (ids, ctx) =>
      ids.filter((id) => this.takesFound(ctx.document.get(id))),
    one: {
      take: (entity, ctx, find) => this.takeFound(entity, find, ctx),
      newest: true,
      silent: true,
    },
  })

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    ctx.selection.clear()
    this.reset()
    // TRIMMODE is always 1 and CHAMMODE 0 (Distance) here.
    const settings = ctx.document.getSettings()
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
      return { id: "specifySecondChamferDistance", enter: this.distance1 }
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
          hover: pickCornerObject(ctx, input, null),
        }
        break
      case "second":
        this.state = {
          ...this.state,
          hover: pickCornerObject(ctx, input, this.state.first),
          cursor: { world: input.world, screen: input.screen },
          corner: input.shiftKey,
        }
        break
      case "polyline":
        this.state = {
          phase: "polyline",
          hover: this.pickPolyline(input.world, ctx),
        }
        break
    }
    ctx.requestRender()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0 || this.askingDistance) return
    if (this.modes.inMode()) {
      this.modes.onPointerDown(input, ctx)
      return
    }
    this.pickAt(
      { world: input.world, screen: input.screen },
      input.shiftKey,
      ctx
    )
  }

  /** A point typed at an object prompt picks there, as at FILLET's. */
  answerTyped(text: string, ctx: ToolContext): boolean {
    if (this.askingDistance || this.modes.inMode()) return false
    const pick = typedCornerPick(text, ctx)
    if (pick) this.pickAt(pick, false, ctx)
    return pick !== null
  }

  private pickAt(pick: LinePick, shift: boolean, ctx: ToolContext): void {
    switch (this.state.phase) {
      case "first": {
        if (this.refusesRound(ctx.pick(pick.world), ctx)) return
        const hit = pickCornerObject(ctx, pick, null)
        if (hit) this.takeFirst(hit, pick, false, ctx)
        return
      }
      case "second": {
        if (this.refusesRound(ctx.pick(pick.world), ctx)) return
        const refusal = cornerPairRefusal(ctx, pick, this.state.first)
        if (refusal === "itself") {
          this.refuseItself(ctx)
        } else if (refusal === "apart") {
          this.refuse("segmentsNotConsecutive", ctx)
        } else {
          const second = pickCornerObject(ctx, pick, this.state.first)
          if (second) this.placeSecond(second, pick, shift, false, ctx)
        }
        return
      }
      case "polyline": {
        const hit = ctx.pick(pick.world)
        if (hit) this.takePolyline(hit, ctx)
        return
      }
    }
  }

  /**
   * Enter in a mode's prompt is the mode's; at Polyline's in Multiple it asks
   * the first prompt again (acc/k6, l3); at the second prompt it asks that
   * again, Multiple or not, as AutoCAD 2023's console does; at the first it
   * ends.
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
        // WHY Multiple still listed once on: AutoCAD 2023 console lists it.
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
        this.state = { phase: "polyline", hover: null }
        ctx.requestRender()
        return
      case "Multiple":
        this.multiple = true
    }
  }

  wantsSnap(): boolean {
    // Lines are picked by proximity, not precise points — as in FILLET/TRIM.
    // A mode's corners and points snap.
    return !this.askingDistance && this.modes.wantsSnap()
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    const { viewport } = ctx
    const draw = (entity: Entity, stroke: StrokeStyle) =>
      entityScenePrimitive(viewport, entity, stroke)

    if (this.modes.inMode()) {
      return [
        ...(this.state.phase === "second"
          ? draw(cornerEntity(this.state.first), selectedStroke)
          : []),
        ...this.modes.buildOverlay(ctx),
      ]
    }

    if (this.state.phase === "first") {
      const h = this.state.hover
      return h ? draw(cornerEntity(h), hoverStroke) : []
    }
    if (this.state.phase === "polyline") {
      const h = this.state.hover
      return h ? draw(h, selectedStroke) : []
    }

    const { first, pick1, hover, cursor } = this.state
    const plane =
      hover && cornerPlane(first, pick1, hover, cursor, ctx.viewport)
    const join =
      plane && cornerJoin(plane.first, plane.pick1, plane.second, plane.pick2)
    if (plane && join) {
      const cut =
        !this.joinRefusal(join) && this.chamferJoin(join, this.state.corner)
      return cut && cutFits(join, cut)
        ? draw(plane.back(joinAtCut(join, cut)), hoverStroke)
        : [
            ...draw(cornerEntity(first), selectedStroke),
            ...draw(cornerEntity(hover), hoverStroke),
          ]
    }
    if (isSegment(first)) {
      const cut =
        plane &&
        isSegment(plane.first) &&
        isSegment(plane.second) &&
        this.chamferSegments(plane.first, plane.second, this.state.corner)
      return plane && cut && typeof cut !== "string"
        ? draw(plane.back(cut), hoverStroke)
        : draw(first.poly, selectedStroke)
    }
    const line1 = first
    const prims = draw(line1, selectedStroke)
    if (!hover || isSegment(hover)) return prims

    const corner = lineCorner(line1, pick1, hover, cursor, viewport)
    const chamfered =
      corner &&
      this.chamfer(corner, line1, hover, this.state.corner, ctx, PREVIEW_ID)
    if (!chamfered || chamfered === "tooLarge") {
      return [...prims, ...draw(hover, hoverStroke)]
    }
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
   * The first line again ends the command, in Multiple too, saying so
   * (AutoCAD 2023's console; a pick on it does not highlight).
   */
  private takeFound(entity: Entity, find: ModeFind, ctx: ToolContext): void {
    if (this.state.phase === "polyline") {
      this.takePolyline(entity, ctx)
      return
    }
    if (this.refusesRound(entity, ctx)) return
    const first = this.state.phase === "second" ? this.state.first : null
    if (first && !isSegment(first) && first.id === entity.id) {
      this.refuseItself(ctx)
      return
    }
    const found = foundFilletObject(ctx, entity, find, first)
    if (!found || isRound(found.object)) return
    if (this.state.phase === "first") {
      this.takeFirst(found.object, found.pick, found.whole, ctx)
    } else {
      this.placeSecond(found.object, found.pick, false, found.whole, ctx)
    }
  }

  private takeFirst(
    first: CornerObject,
    pick: LinePick,
    whole: boolean,
    ctx: ToolContext
  ): void {
    this.state = {
      phase: "second",
      first,
      pick1: pick,
      hover: null,
      cursor: pick,
      corner: false,
      whole,
    }
    ctx.requestRender()
  }

  /**
   * The second object, picked at `pick2` (`corner`: with Shift), chamfered
   * with the first. A polyline a mode found whole makes nothing, as AutoCAD
   * 2023's console makes nothing of it in FILLET, and says nothing.
   */
  private placeSecond(
    second: CornerObject,
    pick2: LinePick,
    corner: boolean,
    whole: boolean,
    ctx: ToolContext
  ): void {
    if (this.state.phase !== "second") return
    const { first, pick1 } = this.state
    if (whole || this.state.whole) {
      this.done(null, ctx)
      return
    }
    const plane = cornerPlane(first, pick1, second, pick2, ctx.viewport)
    const join = cornerJoin(plane.first, plane.pick1, plane.second, plane.pick2)
    if (join) {
      this.commitJoin(join, corner, plane.back, ctx)
    } else if (isSegment(plane.first) && isSegment(plane.second)) {
      const cut = this.chamferSegments(plane.first, plane.second, corner)
      if (typeof cut !== "string") {
        this.done(new UpdateEntityCommand(plane.back(cut)), ctx)
      } else {
        this.refuse(REFUSALS[cut], ctx)
      }
    } else if (!isSegment(first) && !isSegment(second)) {
      this.commitChamfer(first, pick1, second, pick2, corner, ctx)
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
    sharp: boolean,
    ctx: ToolContext
  ): void {
    const corner = lineCorner(line1, pick1, line2, pick2, ctx.viewport)
    if (!corner) {
      ctx.report(ctx.text.message("linesNonCoplanar"), "error")
      this.state = { phase: "first", hover: null }
      ctx.requestRender()
      return
    }
    const chamfered = this.chamfer(corner, line1, line2, sharp, ctx)
    if (!chamfered) {
      // WHY collinear apart: AutoCAD 2023's console says it with no *Invalid*,
      // as FILLET does; parallel lines are `Lines are parallel`, *Invalid*.
      const { line1: a, line2: b } = corner
      if (
        capParallelLines(a.start, a.end, b.start, b.end, a.start) ===
        "collinear"
      ) {
        this.refuse("collinearCannotChamfer", ctx, false)
      } else {
        this.refuse("linesParallel", ctx)
      }
      return
    }
    if (chamfered === "tooLarge") {
      this.refuse("chamferDistanceTooLarge", ctx)
      return
    }
    this.done(new ReplaceEntitiesCommand([line1.id, line2.id], chamfered), ctx)
  }

  /**
   * A line and a polyline's segment, or segments of two polylines, joined
   * into one polyline by the bevel; refused, as the console does, when they
   * are parallel or a distance runs past the end of its line or segment.
   */
  private commitJoin(
    join: CornerJoin,
    sharp: boolean,
    back: (entity: Entity) => Entity,
    ctx: ToolContext
  ): void {
    const refusal = this.joinRefusal(join)
    if (refusal) {
      this.refuse(refusal, ctx, false)
      return
    }
    const cut = this.chamferJoin(join, sharp)
    if (!cut) {
      this.refuse("linesParallel", ctx, false)
      return
    }
    if (!cutFits(join, cut)) {
      this.refuse("chamferDistanceTooLarge", ctx, false)
      return
    }
    this.done(
      new ReplaceEntitiesCommand(
        [cornerEntity(join.other).id, join.segment.poly.id],
        [back(joinAtCut(join, cut))]
      ),
      ctx
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
  private refuseItself(ctx: ToolContext): void {
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
    const result = cutPolylineCorners(poly, {
      lines: (corner) => this.bevel(corner, false),
      chords: true,
    })
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

  /**
   * Executes a chamfer — none of a polyline a mode found whole —; the
   * command ends, or Multiple asks for the next.
   */
  private done(
    command: ReplaceEntitiesCommand | UpdateEntityCommand | null,
    ctx: ToolContext
  ): void {
    if (command) this.steps.push("chamfer")
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
   * Undo takes back the last chamfer or distances of this command, and only
   * those; back at its start AutoCAD says so.
   */
  private undoStep(ctx: ToolContext): void {
    const step = this.steps.pop()
    if (step === "chamfer") ctx.undo()
    else if (step)
      ({ distance1: this.distance1, distance2: this.distance2 } = step)
    if (this.steps.length === 0) {
      ctx.report(ctx.text.message("commandCompletelyUndone"))
    }
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
   * again (acc/e1–e4).
   */
  private refusesRound(hit: Entity | null, ctx: ToolContext): boolean {
    if (hit?.type !== "arc" && hit?.type !== "circle") return false
    ctx.report(ctx.text.message("chamferRequiresLines"), "error")
    return true
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
   * the first one just given, as AutoCAD's is.
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
    ctx.dynamicInput.setDefault("distance", this.distance1)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }

  /** Then the prompt Distance was chosen at, asked again. */
  private setDistance(
    which: "first" | "second",
    value: number,
    ctx: ToolContext
  ): void {
    const valid = Number.isFinite(value) && value >= 0
    if (which === "first") {
      if (valid) this.distance1 = value
      this.askDistance("second", ctx)
      return
    }
    if (valid) this.distance2 = value
    this.steps.push(this.replaced)
    this.askingDistance = null
    this.openKeywordPrompt(ctx)
    ctx.requestRender()
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

const hoverStroke: StrokeStyle = { color: THEME.entityHover, width: 2 }
const selectedStroke: StrokeStyle = { color: THEME.selected, width: 2 }
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
