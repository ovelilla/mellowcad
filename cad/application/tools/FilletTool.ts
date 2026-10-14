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
import type { MessageValues } from "../../i18n/types"
import { ScenePrimitive, StrokeStyle } from "../../scene/types"
import { THEME } from "../../scene/theme"
import { entityScenePrimitive } from "../SceneBuilder"
import { LineCorner, LinePick, lineCorner } from "./lineCorner"
import {
  ArcCorner,
  CornerCut,
  PolylineCorner,
  SegmentsRefusal,
  cutBetweenSegments,
  cutPolylineCorners,
  reportSkipped,
} from "./polylineCorners"
import {
  CORNER_OBJECT_MODES,
  CornerJoin,
  FilletObject,
  FoundObject,
  JoinCut,
  SegmentPick,
  cornerEntity,
  cornerJoin,
  cornerObjectRefusal,
  cornerPairRefusal,
  cornerPlane,
  curveOf,
  foundFilletObject,
  isArcSegment,
  isCornerEntity,
  isRound,
  isSegment,
  joinAtCut,
  joinRefusal,
  pickFilletObject,
  typedCornerPick,
} from "./cornerObjects"
import { ModeFind, ObjectSelector } from "./objectSelection"
import { filletRound } from "./roundFillets"
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
 * them by {@link filletRound} (a circle never trimmed). Shift on the second pick applies a
 * corner instead, as a radius of 0 does. The radius is kept for the session.
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
      readonly hover: FilletObject | null
      readonly cursor: LinePick
      /** Shift is held: the second pick applies a corner. */
      readonly corner: boolean
      /** The first a polyline a mode found whole: no corner will be made. */
      readonly whole: boolean
      /** {@link pick1} only stands for a pick a mode did not give. */
      readonly stands: boolean
    }
  /** Polyline: awaiting the 2D polyline whose every corner is rounded. */
  | { readonly phase: "polyline"; readonly hover: PolylineEntity | null }

export class FilletTool implements Tool {
  readonly id = "fillet"
  readonly shortcut = "f"

  private state: FilletState = { phase: "first", hover: null }
  /** FILLETRAD, kept for the session (Not-saved). */
  private radius = 0
  /** True while the radius sub-prompt's input is open (object picks paused). */
  private askingRadius = false
  private multiple = false
  /**
   * What Undo takes back, newest last: a fillet, or a radius given in the
   * command (the radius it replaced).
   */
  private steps: ({ readonly radius: number } | "fillet")[] = []
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
    accept: (ids, ctx) =>
      ids.filter((id) => this.takesFound(ctx.document.get(id))),
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
    },
  })

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    ctx.selection.clear()
    this.reset()
    // TRIMMODE is always 1 here: the lines are trimmed to the arc.
    ctx.report(
      ctx.text.message("filletSettings", {
        radius: formatLength(this.radius, ctx.document.getSettings()),
      })
    )
    this.openKeywordPrompt(ctx)
  }

  /** WHY no Trim: TRIMMODE is always 1 here, so it is not offered. */
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
      case "second":
        this.state = {
          ...this.state,
          hover: pickFilletObject(ctx, input, this.state.first),
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
    if (input.button !== 0 || this.askingRadius) return
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

  /** A point typed at an object prompt picks there (see {@link typedCornerPick}). */
  answerTyped(text: string, ctx: ToolContext): boolean {
    if (this.askingRadius || this.modes.inMode()) return false
    const pick = typedCornerPick(text, ctx)
    if (pick) this.pickAt(pick, false, ctx)
    return pick !== null
  }

  private pickAt(pick: LinePick, shift: boolean, ctx: ToolContext): void {
    switch (this.state.phase) {
      case "first": {
        const hit = pickFilletObject(ctx, pick, null)
        if (hit) {
          this.takeFirst(
            { object: hit, pick, whole: false, stands: false },
            ctx
          )
        }
        return
      }
      case "second": {
        const refusal = cornerPairRefusal(ctx, pick, this.state.first)
        if (refusal === "itself") {
          this.refuseItself(ctx)
        } else if (refusal === "apart") {
          this.refuse("segmentsNotConsecutive", ctx)
        } else {
          const second = pickFilletObject(ctx, pick, this.state.first)
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
        // WHY Multiple still listed once on: AutoCAD 2023 console lists it.
        return [
          { id: "Undo" },
          { id: "Polyline" },
          { id: "Radius" },
          { id: "Multiple" },
        ]
      case "second":
      case "polyline":
        return [{ id: "Radius" }]
    }
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    if (this.askingRadius) return "unhandled"
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
        this.state = { phase: "polyline", hover: null }
        ctx.requestRender()
        return
      case "Multiple":
        this.multiple = true
    }
  }

  wantsSnap(): boolean {
    // Lines are picked by proximity, not precise points, so running snaps would
    // only clutter the hover — the same choice as TRIM/EXTEND. A mode's
    // corners and points snap.
    return !this.askingRadius && this.modes.wantsSnap()
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
    const radius = this.state.corner ? 0 : this.radius
    if (isRound(first) || (hover && isRound(hover))) {
      const filleted =
        hover &&
        !isSegment(first) &&
        !isSegment(hover) &&
        filletRound(
          first,
          pick1.world,
          hover,
          cursor.world,
          radius,
          ctx.document.getCurrentLayerId(),
          PREVIEW_ID
        )
      if (!filleted || typeof filleted === "string") {
        return [
          ...draw(cornerEntity(first), selectedStroke),
          ...(hover ? draw(cornerEntity(hover), hoverStroke) : []),
        ]
      }
      return filleted.built.flatMap((entity) =>
        draw(
          entity,
          entity.id === PREVIEW_ID
            ? { color: THEME.rubberBand, width: 1 }
            : hoverStroke
        )
      )
    }
    const plane =
      hover && cornerPlane(first, pick1, hover, cursor, ctx.viewport)
    const join =
      plane && cornerJoin(plane.first, plane.pick1, plane.second, plane.pick2)
    if (plane && join) {
      const cut = !joinRefusal(join) && filletJoin(join, radius)
      return cut
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
        filletSegments(plane.first, plane.second, radius)
      return plane && cut && typeof cut !== "string"
        ? draw(plane.back(cut), hoverStroke)
        : draw(first.poly, selectedStroke)
    }
    const line1 = first
    const prims = draw(line1, selectedStroke)
    if (!hover || isSegment(hover)) return prims

    const corner = lineCorner(line1, pick1, hover, cursor, viewport)
    const filleted =
      corner &&
      (this.fillet(corner, line1, hover, radius, ctx, PREVIEW_ID) ??
        this.previewCap(line1, hover, cursor, ctx))
    if (!filleted || typeof filleted === "string") {
      return [...prims, ...draw(hover, hoverStroke)]
    }
    for (const entity of filleted) {
      prims.push(
        ...draw(
          entity,
          entity.type === "arc"
            ? { color: THEME.rubberBand, width: 1 }
            : hoverStroke
        )
      )
    }
    return prims
  }

  /** The cap two parallel lines would get, the first drawn as it stays. */
  private previewCap(
    line1: LineEntity,
    line2: LineEntity,
    cursor: LinePick,
    ctx: ToolContext
  ): Entity[] | "collinear" | "turnsBack" | null {
    if (this.state.phase !== "second") return null
    const { pick1, stands } = this.state
    const from = stands ? originPick(ctx) : pick1
    const corner = lineCorner(line1, from, line2, cursor, ctx.viewport)
    return corner && this.cap(corner, line1, line2, ctx, PREVIEW_ID)
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
    return this.state.phase === "polyline" || isCornerEntity(entity)
  }

  /**
   * An object a mode found, taken at the prompt asked as its pick would be;
   * false when it takes nothing there. The first object again (not another
   * segment of its polyline) ends the command, in Multiple too, saying so
   * (AutoCAD 2023's console; a pick on it does not highlight).
   */
  private takeFound(entity: Entity, find: ModeFind, ctx: ToolContext): boolean {
    if (this.state.phase === "polyline") {
      this.takePolyline(entity, ctx)
      return true
    }
    const first = this.state.phase === "second" ? this.state.first : null
    if (first && !isSegment(first) && first.id === entity.id) {
      this.refuseItself(ctx)
      return false
    }
    const found = foundFilletObject(ctx, entity, find, first)
    if (!found) return false
    if (this.state.phase === "first") this.takeFirst(found, ctx)
    else this.placeSecond(found.object, found.pick, false, found.whole, ctx)
    return true
  }

  /** The first object picked again: said, and the command ends, in Multiple too. */
  private refuseItself(ctx: ToolContext): void {
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
      hover: null,
      cursor: found.pick,
      corner: false,
      whole: found.whole,
      stands: found.stands,
    }
    ctx.requestRender()
  }

  /**
   * The second object, picked at `pick2` (`corner`: with Shift), filleted
   * with the first. A polyline a mode found whole makes nothing, as AutoCAD
   * 2023's console makes nothing of it, and says nothing.
   */
  private placeSecond(
    second: FilletObject,
    pick2: LinePick,
    corner: boolean,
    whole: boolean,
    ctx: ToolContext
  ): void {
    if (this.state.phase !== "second") return
    const { first, pick1, stands } = this.state
    if (whole || this.state.whole) {
      this.done(null, ctx)
      return
    }
    const radius = corner ? 0 : this.radius
    if (isRound(first) || isRound(second)) {
      this.commitRound(first, pick1.world, second, pick2.world, radius, ctx)
      return
    }
    const plane = cornerPlane(first, pick1, second, pick2, ctx.viewport)
    const join = cornerJoin(plane.first, plane.pick1, plane.second, plane.pick2)
    if (join) {
      this.commitJoin(join, radius, plane.back, ctx)
    } else if (isSegment(plane.first) && isSegment(plane.second)) {
      const cut = filletSegments(plane.first, plane.second, radius)
      if (typeof cut !== "string") {
        this.done(new UpdateEntityCommand(plane.back(cut)), ctx)
      } else if (cut === "noCorner") {
        this.refuse("cannotFilletBetween", ctx, "sameLine")
      } else {
        this.refuse(REFUSALS[cut], ctx)
      }
    } else if (!isSegment(first) && !isSegment(second)) {
      const capFrom = stands ? originPick(ctx) : pick1
      this.commitFillet(first, pick1, second, pick2, capFrom, radius, ctx)
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
        carryPlane(
          corner.line1,
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

  private commitFillet(
    line1: LineEntity,
    pick1: LinePick,
    line2: LineEntity,
    pick2: LinePick,
    capFrom: LinePick,
    radius: number,
    ctx: ToolContext
  ): void {
    const corner = lineCorner(line1, pick1, line2, pick2, ctx.viewport)
    if (!corner) {
      ctx.report(ctx.text.message("linesNonCoplanar"), "error")
      this.state = { phase: "first", hover: null }
      ctx.requestRender()
      return
    }
    const filleted = this.fillet(corner, line1, line2, radius, ctx)
    if (!filleted) {
      this.commitCap(line1, capFrom, line2, pick2, ctx)
      return
    }
    if (filleted === "tooLarge") {
      this.refuse("filletRadiusTooLarge", ctx)
      return
    }
    this.done(new ReplaceEntitiesCommand([line1.id, line2.id], filleted), ctx)
  }

  /**
   * Two parallel lines capped with a half circle, whatever the radius;
   * collinear, `Collinear lines connot be filleted.`, Autodesk's typo and
   * all, and no `*Invalid*` (acc/e6, h3). WHY nothing is made where the
   * second line would turn back: the console then adds a zero-length arc at
   * the origin and changes nothing else, silently (acc/e4, h5).
   */
  private commitCap(
    line1: LineEntity,
    capFrom: LinePick,
    line2: LineEntity,
    pick2: LinePick,
    ctx: ToolContext
  ): void {
    const corner = lineCorner(line1, capFrom, line2, pick2, ctx.viewport)
    const capped = corner && this.cap(corner, line1, line2, ctx)
    if (capped === "collinear") {
      this.refuse("collinearCannotFillet", ctx, false)
    } else if (capped === "turnsBack") {
      this.done(null, ctx)
    } else if (capped) {
      this.done(new ReplaceEntitiesCommand([line2.id], capped), ctx)
    }
  }

  /**
   * The cap AutoCAD's FILLET joins two parallel lines with (see
   * {@link capParallelLines}): the second line with its end moved, and the
   * half circle, on the lines' layer or the current one and with the
   * second's thickness (acc/g4), back in the frame.
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
    const arc = carryPlane(
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
   * segment, `Cannot fillet between these two entities.` (acc/d1–d3).
   */
  private commitRound(
    first: FilletObject,
    pick1: Vec2,
    second: FilletObject,
    pick2: Vec2,
    radius: number,
    ctx: ToolContext
  ): void {
    if (isSegment(first) || isSegment(second)) {
      this.refuse("cannotFilletBetween", ctx, false)
      return
    }
    const filleted = filletRound(
      first,
      pick1,
      second,
      pick2,
      radius,
      ctx.document.getCurrentLayerId()
    )
    if (filleted === "noValidFillet") {
      this.refuse("noValidFillet", ctx, false, {
        radius: formatLength(radius, ctx.document.getSettings()),
      })
    } else if (filleted === "nothing") {
      this.done(null, ctx)
    } else {
      this.done(
        new ReplaceEntitiesCommand(filleted.replaced, filleted.built),
        ctx
      )
    }
  }

  /**
   * A line and a polyline's segment, or segments of two polylines, joined
   * into one polyline through the arc; parallel, `Cannot fillet between these
   * two entities.`
   */
  private commitJoin(
    join: CornerJoin,
    radius: number,
    back: (entity: Entity) => Entity,
    ctx: ToolContext
  ): void {
    const refusal = joinRefusal(join)
    if (refusal) {
      this.refuse(refusal, ctx, false)
      return
    }
    const cut = filletJoin(join, radius)
    if (!cut) {
      this.refuse("cannotFilletBetween", ctx, false)
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
    const result = cutPolylineCorners(poly, {
      lines: (corner) => filletCorner(corner, this.radius),
      acrossArcs: true,
      arcs: (corner) => filletArcCorner(corner, this.radius),
    })
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

  /**
   * Executes a fillet — none where two circles meet at radius 0, which the
   * console leaves as they are —; the command ends, or Multiple asks for the
   * next.
   */
  private done(
    command: ReplaceEntitiesCommand | UpdateEntityCommand | null,
    ctx: ToolContext
  ): void {
    if (command) this.steps.push("fillet")
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
   * Undo takes back the last fillet or radius of this command, and only
   * those; back at its start AutoCAD says so.
   */
  private undoStep(ctx: ToolContext): void {
    const step = this.steps.pop()
    if (step === "fillet") ctx.undo()
    else if (step) this.radius = step.radius
    if (this.steps.length === 0) {
      ctx.report(ctx.text.message("commandCompletelyUndone"))
    }
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

  /** The radius, then the prompt Radius was chosen at, asked again. */
  private setRadius(value: number, ctx: ToolContext): void {
    if (Number.isFinite(value) && value >= 0) {
      this.steps.push({ radius: this.radius })
      this.radius = value
    }
    this.askingRadius = false
    this.openKeywordPrompt(ctx)
    ctx.requestRender()
  }
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

const hoverStroke: StrokeStyle = { color: THEME.entityHover, width: 2 }
const selectedStroke: StrokeStyle = { color: THEME.selected, width: 2 }
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
