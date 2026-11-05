import { Vec2 } from "../../geometry/Vec2"
import { Vec3 } from "../../geometry/Vec3"
import { Entity, EntityId } from "../../domain/entities"
import type { SplineEntity } from "../../domain/entityTypes"
import { splineOnItsPlane } from "../../domain/elevation"
import { splineInPlaneOf, splineInWorld } from "../../domain/splineEdits"
import {
  MAX_SPLINE_ORDER,
  isLevelSpline,
  splineWithoutFitData,
} from "../../domain/splines"
import {
  controlVertexAdded,
  controlVertexDeleted,
  controlVertexWeighed,
  fitPointAdded,
  fittedPolylineSpline,
  fitPointDeleted,
  splineClosedAs,
  splineElevated,
  splinePointNear,
  splinePolyline,
  splinePurged,
  splineReversed,
  splineTangentsAt,
  splineWithFitData,
} from "../../domain/splineEditing"
import { formatLength } from "../../domain/units"
import { WORLD_UCS, ucsZAxis } from "../../domain/ucs"
import type { ScenePrimitive } from "../../scene/types"
import { THEME } from "../../scene/theme"
import {
  ReplaceEntitiesCommand,
  UpdateEntityCommand,
} from "../commands/entityCommands"
import {
  isCoordinateExpression,
  parseCoordinate,
} from "../input/coordinateInput"
import type { PromptId } from "../../locales/types"
import { drawn, glow, rollover } from "./ghostLook"
import { joinToSpline } from "./JoinTool"
import { lockedObjectAt } from "./lockedPick"
import { ONE_OBJECT_MODES, ObjectSelector } from "./objectSelection"
import { newestFirst } from "./listReport"
import { gripPrimitives, vertexGripShape } from "./selectToolGrips"
import {
  CommandOption,
  CommandOptionOutcome,
  PointerInput,
  QuestionInput,
  Tool,
  ToolContext,
  ToolQuestion,
} from "./Tool"

/** Which points a stepping prompt walks: the fit points, or the control vertices. */
type Walked = "fit" | "cv"

type Step =
  | { readonly kind: "select"; readonly hover: Entity | null }
  | { readonly kind: "main" }
  | { readonly kind: "join" }
  | { readonly kind: "fit" }
  /** `Specify existing fit point on spline <exit>:` — Add's, Delete's, or Select point's. */
  | {
      readonly kind: "existing"
      readonly purpose: "add" | "delete" | "select"
    }
  /** At an open spline's first fit point: `Specify new point or [After/Before] <exit>:`. */
  | { readonly kind: "addWhere" }
  | {
      readonly kind: "addPoint"
      /** Where the next point goes among the fit points. */
      readonly at: number
      /** The undo history before each point added, for its Undo. */
      readonly marks: readonly number[]
    }
  | { readonly kind: "tangentStart" }
  | { readonly kind: "tangentEnd"; readonly start: Vec3 | null | undefined }
  | { readonly kind: "vertex" }
  | { readonly kind: "vertexAdd" }
  | { readonly kind: "vertexDelete" }
  | { readonly kind: "order" }
  | { readonly kind: "move"; readonly walked: Walked }
  | { readonly kind: "weight" }
  | { readonly kind: "precision" }

/** AutoCAD's first default and range at `Specify a precision <10>:` (k73, k95). */
const DEFAULT_PRECISION = 10
const MAX_PRECISION = 99

/**
 * convert to Polyline's precision: one value for the program's session, which
 * SPLINEDIT's and PEDIT's precision prompts both offer and set (PEDIT-D40,
 * splinedit/p148, p150–p152), kept through NEW and OPEN and saved in no
 * drawing (p159, p163). Whether U restores it is unprobed.
 */
export interface SplineConversion {
  precision: number
}

export function splineConversion(): SplineConversion {
  return { precision: DEFAULT_PRECISION }
}

/** eXit, declared `EXit` at every prompt, so `_E` is it at Fit data (splinedit/p139). */
const EXIT: CommandOption = { id: "eXit", global: "EXit" }

/**
 * SPLINEDIT, as AutoCAD 2027's console asks it (probes spline-knots/k11,
 * k57–k146): `Select spline:`, then `Enter an option [Close/Join/Fit
 * data/Edit vertex/convert to Polyline/Reverse/Undo/eXit] <eXit>:` (Open and
 * no Join on a closed one), each option done on the spot. Fit data and Edit
 * vertex are prompts of their own, each a step SPLINEDIT's Undo takes back
 * whole (k88, k116); U after the command takes back all of it (k89).
 */
export class SplineEditTool implements Tool {
  readonly id = "splinedit"

  private step: Step = { kind: "select", hover: null }
  private splineId: EntityId | null = null
  /** The undo history before each step of the main prompt, for its Undo. */
  private steps: number[] = []
  /** The history as the step under way began. */
  private stepStart = 0
  /** The point Move and Weight are on, and the way Enter steps from it. */
  private current = 0
  private forward = true
  private cursor: Vec3 | null = null
  /** The step Select point returns to. */
  private selectingFor: (Step & { kind: "move" | "weight" }) | null = null
  /** What the prompts show of the spline as it now stands ({@link refresh}). */
  private closed = false
  private counts: Record<Walked, number> = { fit: 0, cv: 0 }
  /** The degree Edit vertex reads: a fit spline's curve's, cubic. */
  private order = 3
  private weightShown = ""
  private methodShown: Walked = "fit"
  /** The spline a double-click starts the run on. */
  private pending: EntityId | null = null

  constructor(
    private readonly conversion: SplineConversion = splineConversion()
  ) {}

  /**
   * The selection modes typed at `Select spline:`, Previous and AUto too, as
   * its prompt lists them (k11 trace).
   */
  private readonly modes = new ObjectSelector({
    takes: () => "oneObject",
    done: () => {},
    question: () => "selectSpline",
    modes: [...ONE_OBJECT_MODES, "Previous", "AUto"],
    one: {
      take: (entity, ctx) => this.take(entity, ctx),
      newest: true,
      // A mode's locked find said as the pick's is (pedit/p328), as
      // ARRAYPATH's `Select path curve:` says it (**unverified** for the modes).
      locked: "onLockedLayer",
      lockedAsksAgain: true,
      pick: (point, ctx) => this.pickSpline(point, ctx),
    },
  })

  /** `Select any open curves to join to source:`, JOIN's own (k72, k117). */
  private readonly joiner = new ObjectSelector({
    takes: () => "wholeObjects",
    question: () => "selectOpenCurvesToJoinToSource",
    accept: (ids) => ids.filter((id) => id !== this.splineId),
    done: (ctx) => this.join(ctx),
  })

  /** Starts the run on `id`, as the double-click's `^C^C^R_splinedit` with it selected does. */
  startOn(id: EntityId): void {
    this.pending = id
  }

  onActivate(ctx: ToolContext): void {
    this.reset()
    ctx.setCursor("crosshair")
    const pending = this.pending
    this.pending = null
    const set = (
      pending ? [pending] : newestFirst(ctx.selection.toArray(), ctx)
    )
      .map((id) => ctx.document.get(id))
      .filter((entity): entity is Entity => entity !== undefined)
    ctx.selection.clear()
    // The newest spline selected before the command is the one it edits
    // (k121, splinedit/p145, p158: PEDIT-D42); a set of none is said of its
    // newest object and asked again (p146).
    const spline = set.find((entity) => entity.type === "spline")
    if (spline) this.begin(spline, ctx)
    else if (set.length > 0) this.take(set[0], ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    this.reset()
    ctx.dynamicInput.close()
  }

  private reset(): void {
    this.step = { kind: "select", hover: null }
    this.splineId = null
    this.steps = []
    this.cursor = null
    this.modes.start()
  }

  private spline(ctx: ToolContext): SplineEntity | null {
    const entity = this.splineId ? ctx.document.get(this.splineId) : undefined
    return entity?.type === "spline" ? entity : null
  }

  /** The spline in the frame's coordinates, as its points are picked and drawn. */
  private shown(ctx: ToolContext): SplineEntity | null {
    const spline = this.spline(ctx)
    return spline && splineInWorld(spline)
  }

  /** Whether the prompt under way is about the fit points or the control vertices. */
  private walkedNow(): Walked {
    const step = this.step
    switch (step.kind) {
      case "move":
        return step.walked
      case "existing":
        if (step.purpose !== "select" || !this.selectingFor) return "fit"
        return this.selectingFor.kind === "move"
          ? this.selectingFor.walked
          : "cv"
      case "weight":
      case "vertex":
      case "vertexAdd":
      case "vertexDelete":
      case "order":
        return "cv"
      case "main":
        return this.methodShown
      default:
        return "fit"
    }
  }

  /** What Edit vertex edits: a fit spline on its curve's vertices (k75, k127). */
  private static vertices(spline: SplineEntity): SplineEntity {
    return spline.method === "fit" ? splineWithoutFitData(spline) : spline
  }

  /** The points the stepping prompts walk. */
  private walkedPoints(ctx: ToolContext, walked: Walked): readonly Vec3[] {
    const spline = this.shown(ctx)
    if (!spline) return []
    return walked === "fit"
      ? spline.points
      : SplineEditTool.vertices(spline).points
  }

  question(): PromptId | ToolQuestion | null {
    const step = this.step
    switch (step.kind) {
      case "select":
        return this.modes.question()
      case "join":
        return this.joiner.question()
      case "main":
        return this.closed ? "splineditOptionClosed" : "splineditOption"
      case "fit":
        return "enterFitDataOption"
      case "existing":
        return { id: "specifyExistingFitPoint", enter: "exitLower" }
      case "addWhere":
        return { id: "specifyNewPointOr", enter: "exitLower" }
      case "addPoint":
        return { id: "specifyNewFitPointToAdd", enter: "exitLower" }
      case "tangentStart":
        return "specifyStartTangentOr"
      case "tangentEnd":
        return "specifyEndTangentOr"
      case "vertex":
        return "enterVertexEditingOption"
      case "vertexAdd":
        return { id: "specifyPointOnSpline", enter: "exitLower" }
      case "vertexDelete":
        return "specifyControlVertexToDelete"
      case "order":
        return { id: "enterNewOrder", enter: { count: this.order + 1 } }
      case "move":
        return {
          id: "specifyNewLocationOr",
          enter: this.steppingForward(step.walked)
            ? "nextShort"
            : "previousShort",
        }
      case "weight":
        return {
          id: "enterNewWeightOr",
          enter: this.steppingForward("cv") ? "nextShort" : "previousShort",
          values: { weight: this.weightShown },
        }
      case "precision":
        return {
          id: "specifyPrecision",
          enter: { count: this.conversion.precision },
        }
    }
  }

  /** Refused as AutoCAD 2027's console refuses them (k86, k87, k95, k128). */
  takes(): QuestionInput | null {
    switch (this.step.kind) {
      case "select":
        return this.modes.takes()
      case "join":
        return this.joiner.takes()
      case "main":
      case "fit":
      case "vertex":
        return "keyword"
      case "order":
        return {
          refusal: "requiresIntegerBetween",
          values: { min: this.order + 1, max: MAX_SPLINE_ORDER },
        }
      case "precision":
        return {
          refusal: "requiresIntegerBetween",
          values: { min: 0, max: MAX_PRECISION },
        }
      case "weight":
        return { refusal: "requiresNumber", values: { keyword: "yes" } }
      case "move":
      case "addWhere":
      case "addPoint":
      case "tangentStart":
      case "tangentEnd":
        return { refusal: "pointOrKeywordRequired" }
      default:
        return "point"
    }
  }

  /**
   * WHY none at the point steps but Select point's and Add's existing point,
   * which the runtime sets: the tool sets it where AutoCAD does (Move's and
   * Add's point, Tangents' end fit point), since their Enter and keywords
   * move the base the runtime would follow; vertex Add and Delete and fit
   * Delete keep it (pedit/p321–p338).
   */
  setsLastPoint(): boolean | null {
    const step = this.step
    switch (step.kind) {
      case "existing":
        return step.purpose === "delete" ? false : null
      case "move":
      case "addWhere":
      case "addPoint":
      case "tangentStart":
      case "tangentEnd":
      case "vertexAdd":
      case "vertexDelete":
        return false
      default:
        return null
    }
  }

  defaultOption(): string | null {
    const kind = this.step.kind
    return kind === "main" || kind === "fit" || kind === "vertex"
      ? "eXit"
      : null
  }

  commandOptions(): readonly CommandOption[] {
    const step = this.step
    switch (step.kind) {
      case "select":
        return this.modes.commandOptions()
      case "join":
        return this.joiner.commandOptions()
      case "main":
        return [
          { id: this.closed ? "Open" : "Close" },
          ...(this.closed ? [] : [{ id: "Join" }]),
          { id: "Fit data" },
          { id: "Edit vertex" },
          { id: "convert to Polyline" },
          { id: "Reverse" },
          { id: "Undo" },
          EXIT,
          { id: "Data", hidden: true },
          { id: "R", hidden: true },
          { id: "X", hidden: true },
          { id: "Toggle", hidden: true },
        ]
      case "fit":
        // WHY no Kink nor toLerance, and no Tangents on a closed one: they
        // are not built (docs/coverage/modify.md's SPLINEDIT).
        return [
          { id: "Add" },
          { id: this.closed ? "Open" : "Close" },
          { id: "Delete" },
          { id: "Move" },
          { id: "Purge" },
          ...(this.closed ? [] : [{ id: "Tangents" }]),
          EXIT,
          { id: "X", hidden: true },
        ]
      case "vertex":
        return [
          { id: "Add" },
          { id: "Delete" },
          { id: "Elevate order" },
          { id: "Move" },
          { id: "Weight" },
          EXIT,
          { id: "Order", hidden: true },
          { id: "X", hidden: true },
        ]
      case "move":
      case "weight":
        return [
          { id: "Next" },
          { id: "Previous" },
          { id: "Select point" },
          EXIT,
          { id: "Point", hidden: true },
          { id: "X", hidden: true },
        ]
      case "addWhere":
        return [{ id: "After" }, { id: "Before" }, { id: "Undo", hidden: true }]
      case "addPoint":
        return [{ id: "Undo", hidden: true }]
      case "tangentStart":
      case "tangentEnd":
        return [{ id: "System default" }, { id: "Default", hidden: true }]
      default:
        return []
    }
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    const step = this.step
    switch (step.kind) {
      case "select":
        return this.modes.invokeOption(id, ctx) ? "continue" : "unhandled"
      case "join":
        return this.joiner.invokeOption(id, ctx) ? "continue" : "unhandled"
      case "main":
        return this.mainOption(id, ctx)
      case "fit":
        return this.fitOption(id, ctx)
      case "vertex":
        return this.vertexOption(id, ctx)
      case "move":
      case "weight": {
        const walked = step.kind === "move" ? step.walked : "cv"
        if (id === "Next" || id === "Previous") {
          this.stepTo(id === "Next", walked, ctx)
        } else if (id === "Select point" || id === "Point") {
          this.selectingFor = step
          this.ask({ kind: "existing", purpose: "select" }, ctx)
        } else if (id === "eXit" || id === "X") {
          this.ask(walked === "fit" ? { kind: "fit" } : { kind: "vertex" }, ctx)
        } else return "unhandled"
        return "continue"
      }
      case "addWhere":
        if (id === "After" || id === "Before") {
          this.ask(
            { kind: "addPoint", at: id === "After" ? 1 : 0, marks: [] },
            ctx
          )
          return "continue"
        }
        if (id !== "Undo") return "unhandled"
        // Nothing added yet, it says so and asks for a point to add, as
        // After does (splinedit/p113).
        ctx.report(ctx.text.message("allAdditionsUndone"))
        this.ask({ kind: "addPoint", at: 1, marks: [] }, ctx)
        return "continue"
      case "addPoint":
        if (id !== "Undo") return "unhandled"
        this.undoAdded(ctx)
        return "continue"
      case "tangentStart":
      case "tangentEnd":
        if (id !== "System default" && id !== "Default") return "unhandled"
        if (step.kind === "tangentStart") {
          this.ask({ kind: "tangentEnd", start: null }, ctx)
        } else this.setTangents(null, null, ctx)
        return "continue"
      default:
        return "unhandled"
    }
  }

  private mainOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    switch (id) {
      case "Close":
      case "Open":
      case "Toggle":
        this.mainStep(ctx, () =>
          this.edit(ctx, (spline) => splineClosedAs(spline, !spline.closed))
        )
        break
      case "Join":
        if (this.closed) return "unhandled"
        this.stepStart = ctx.historyDepth()
        ctx.selection.clear()
        this.joiner.start()
        this.ask({ kind: "join" }, ctx)
        break
      case "Fit data":
      case "Data":
        this.stepStart = ctx.historyDepth()
        // A CV spline gets its fit data as Fit data opens (k76, k114).
        this.edit(ctx, splineWithFitData)
        this.ask({ kind: "fit" }, ctx)
        break
      case "Edit vertex":
        this.stepStart = ctx.historyDepth()
        this.ask({ kind: "vertex" }, ctx)
        break
      case "convert to Polyline":
        this.ask({ kind: "precision" }, ctx)
        break
      case "Reverse":
      case "R":
        this.mainStep(ctx, () => this.edit(ctx, splineReversed))
        ctx.report(ctx.text.message("splineReversed"))
        break
      case "Undo":
        this.undoStep(ctx)
        break
      case "eXit":
      case "X":
        ctx.endCommand()
        return "end"
      default:
        return "unhandled"
    }
    return "continue"
  }

  private fitOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    switch (id) {
      case "Add":
        this.ask({ kind: "existing", purpose: "add" }, ctx)
        break
      case "Close":
      case "Open":
        this.edit(ctx, (spline) => splineClosedAs(spline, !spline.closed))
        this.ask({ kind: "fit" }, ctx)
        break
      case "Delete":
        this.ask({ kind: "existing", purpose: "delete" }, ctx)
        break
      case "Move":
        this.startWalk({ kind: "move", walked: "fit" }, ctx)
        break
      case "Purge":
        // Purge ends Fit data, back at the first prompt (k65).
        this.edit(ctx, splinePurged)
        this.backToMain(ctx)
        break
      case "Tangents":
        if (this.closed) return "unhandled"
        this.ask({ kind: "tangentStart" }, ctx)
        break
      case "eXit":
      case "X":
        this.backToMain(ctx)
        break
      default:
        return "unhandled"
    }
    return "continue"
  }

  private vertexOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    switch (id) {
      case "Add":
        this.ask({ kind: "vertexAdd" }, ctx)
        break
      case "Delete":
        this.ask({ kind: "vertexDelete" }, ctx)
        break
      case "Elevate order":
      case "Order":
        this.ask({ kind: "order" }, ctx)
        break
      case "Move":
        this.startWalk({ kind: "move", walked: "cv" }, ctx)
        break
      case "Weight":
        if (!this.vertexSpline(ctx)?.weights) {
          ctx.report(ctx.text.message("splineMadeRational"))
        }
        this.startWalk({ kind: "weight" }, ctx)
        break
      case "eXit":
      case "X":
        this.backToMain(ctx)
        break
      default:
        return "unhandled"
    }
    return "continue"
  }

  private vertexSpline(ctx: ToolContext): SplineEntity | null {
    const spline = this.shown(ctx)
    return spline && SplineEditTool.vertices(spline)
  }

  /** A step of the main prompt done at once, which its Undo takes back. */
  private mainStep(ctx: ToolContext, run: () => void): void {
    this.stepStart = ctx.historyDepth()
    run()
    this.backToMain(ctx)
  }

  private backToMain(ctx: ToolContext): void {
    if (ctx.historyDepth() > this.stepStart) this.steps.push(this.stepStart)
    this.stepStart = ctx.historyDepth()
    this.ask({ kind: "main" }, ctx)
  }

  /** The main prompt's Undo: its last step back, or AutoCAD's line when none is left (k88, k98). */
  private undoStep(ctx: ToolContext): void {
    const mark = this.steps.pop()
    if (mark === undefined) {
      ctx.report(ctx.text.message("commandCompletelyUndoneShort"))
    } else {
      ctx.undoTo(mark)
    }
    this.stepStart = ctx.historyDepth()
    this.ask({ kind: "main" }, ctx)
  }

  /**
   * One edit of the spline, in the frame's coordinates, put back in its
   * plane; `change` returns null for an edit that changes nothing.
   */
  private edit(
    ctx: ToolContext,
    change: (spline: SplineEntity) => SplineEntity | null
  ): void {
    const edited = this.edited(ctx, change)
    if (edited) ctx.execute(new UpdateEntityCommand(edited))
  }

  /** The spline as `change` leaves it, stored as the drawing keeps it; null for no change. */
  private edited(
    ctx: ToolContext,
    change: (spline: SplineEntity) => SplineEntity | null
  ): SplineEntity | null {
    const source = this.spline(ctx)
    if (!source) return null
    const before = splineInWorld(source)
    const after = change(before)
    if (!after || after === before) return null
    return splineOnItsPlane(splineInPlaneOf(after, source))
  }

  private ask(step: Step, ctx: ToolContext): void {
    this.step = step
    this.refresh(ctx)
    switch (step.kind) {
      case "main":
      case "fit":
      case "vertex":
      case "join":
        ctx.dynamicInput.open({ fields: [], commit: () => {} })
        break
      case "order":
      case "precision":
      case "weight":
        ctx.dynamicInput.open({
          fields: [{ id: "value", kind: "number" }],
          commit: (values, commitCtx) =>
            this.answerNumber(values.value, commitCtx),
          commitRaw: (commitCtx) => this.answerRaw(commitCtx),
        })
        break
      default:
        ctx.dynamicInput.open({
          fields: [{ id: "point", kind: "coordinate" }],
          commit: () => {},
          commitRaw: (commitCtx) => this.answerPointText(commitCtx),
        })
    }
    ctx.requestRender()
  }

  private begin(spline: Entity, ctx: ToolContext): void {
    this.splineId = spline.id
    this.steps = []
    this.stepStart = ctx.historyDepth()
    this.ask({ kind: "main" }, ctx)
  }

  /**
   * A spline found at `Select spline:`, or a spline-fit polyline, turned into
   * the spline of its curve in silence as it is found (k94); anything else is
   * said and asked again (k93; a Fit polyline's words **unverified**).
   */
  private take(entity: Entity, ctx: ToolContext): void {
    const converted =
      (entity.type === "polyline" || entity.type === "polyline3d") &&
      fittedPolylineSpline(entity)
    if (converted) {
      ctx.execute(new ReplaceEntitiesCommand([entity.id], [converted]))
      this.begin(converted, ctx)
      return
    }
    if (entity.type !== "spline") {
      ctx.report(ctx.text.message("objectNotSpline"))
      this.modes.start()
      return
    }
    this.begin(entity, ctx)
  }

  /**
   * A pick at `Select spline:`: on nothing a window, as AUto makes it (k96);
   * on a locked spline `1 was on a locked layer.` and the prompt again
   * (pedit/p328).
   */
  private pickSpline(world: Vec2 | Vec3, ctx: ToolContext): void {
    const at = { x: world.x, y: world.y }
    const hit = ctx.pick(at)
    if (lockedObjectAt(ctx.viewport.worldToScreen(world), ctx, hit)) {
      ctx.report(ctx.text.message("onLockedLayer", { count: 1 }), "error")
      return
    }
    if (!hit) this.modes.startWindow(at, ctx)
    else this.take(hit, ctx)
  }

  private startWalk(
    step: Step & { kind: "move" | "weight" },
    ctx: ToolContext
  ): void {
    this.current = 0
    this.forward = true
    this.ask(step, ctx)
  }

  /**
   * The stops a walk makes: each point, and on a closed fit spline its
   * closing point last, the first again (splinedit/p112: PEDIT-D41); a closed
   * CV spline's ends at its last vertex (p161).
   */
  private stops(walked: Walked): number {
    return this.counts[walked] + (walked === "fit" && this.closed ? 1 : 0)
  }

  /** The point the walk's stop is on. */
  private pointIndex(walked: Walked): number {
    return this.current % Math.max(1, this.counts[walked])
  }

  /**
   * Which way Enter steps: the way it last went, but back from the last
   * point and on from the first, where it stays put (k80, k97, k107–k109).
   */
  private steppingForward(walked: Walked): boolean {
    const count = this.stops(walked)
    if (this.current >= count - 1) return false
    if (this.current <= 0) return true
    return this.forward
  }

  private stepTo(next: boolean, walked: Walked, ctx: ToolContext): void {
    this.refresh(ctx)
    const count = this.stops(walked)
    this.forward = next
    this.current = Math.max(
      0,
      Math.min(count - 1, this.current + (next ? 1 : -1))
    )
    this.ask(this.step, ctx)
  }

  onEnter(ctx: ToolContext): boolean {
    const step = this.step
    switch (step.kind) {
      case "select":
        return this.modes.inMode() && this.modes.onEnter(ctx)
      case "join":
        return this.joiner.onEnter(ctx)
      case "main":
        ctx.endCommand()
        return true
      case "fit":
      case "vertex":
        this.backToMain(ctx)
        return true
      default:
        this.answerPoint(null, ctx)
        return true
    }
  }

  answerTyped(text: string, ctx: ToolContext): boolean {
    if (this.step.kind === "select") return this.modes.answerTyped(text, ctx)
    if (this.step.kind === "join") return this.joiner.answerTyped(text, ctx)
    return false
  }

  private answerPointText(ctx: ToolContext): boolean {
    const text = ctx.dynamicInput.getText("point").trim()
    if (text === "") {
      this.answerPoint(null, ctx)
      return true
    }
    if (!isCoordinateExpression(text)) return false
    const point = parseCoordinate(text, {
      lastPoint: ctx.lastPoint,
      relativeByDefault: false,
      ucs: ctx.ucs,
      elevation: ctx.elevation,
    })
    if (!point) return false
    this.answerPoint(point, ctx)
    return true
  }

  private answerRaw(ctx: ToolContext): boolean {
    if (ctx.dynamicInput.hasTypedText()) return false
    this.answerNumber(null, ctx)
    return true
  }

  /** A point given, or Enter (`null`), at a point prompt. */
  private answerPoint(point: Vec3 | null, ctx: ToolContext): void {
    const step = this.step
    const spline = this.shown(ctx)
    if (!spline) return
    switch (step.kind) {
      case "existing": {
        if (!point) {
          if (step.purpose === "select" && this.selectingFor) {
            this.ask(this.selectingFor, ctx)
          } else this.ask({ kind: "fit" }, ctx)
          return
        }
        const walked = this.walkedNow()
        const index = splinePointNear(
          this.walkedPoints(ctx, walked),
          point,
          ctx.pickTolerance()
        )
        if (index === null) {
          // Select point's miss on Edit vertex's names the vertex, under the
          // fit point's prompt (splinedit/p110, p160).
          ctx.report(
            ctx.text.message(
              walked === "cv" ? "notAControlVertex" : "notAFitPoint"
            )
          )
          this.ask(step, ctx)
          return
        }
        if (step.purpose === "select") {
          this.current = index
          this.ask(this.selectingFor ?? { kind: "fit" }, ctx)
        } else if (step.purpose === "delete") {
          this.deleteFitPoint(index, ctx)
        } else if (!spline.closed && index === 0) {
          this.ask({ kind: "addWhere" }, ctx)
        } else {
          this.ask({ kind: "addPoint", at: index + 1, marks: [] }, ctx)
        }
        this.cursor = point
        return
      }
      case "addWhere":
        if (!point) this.ask({ kind: "existing", purpose: "add" }, ctx)
        else {
          ctx.setLastPoint(point)
          this.addFitPoint({ kind: "addPoint", at: 0, marks: [] }, point, ctx)
        }
        return
      case "addPoint":
        // Enter leaves the existing point LASTPOINT (pedit/p338).
        if (!point) this.ask({ kind: "existing", purpose: "add" }, ctx)
        else {
          ctx.setLastPoint(point)
          this.addFitPoint(step, point, ctx)
        }
        return
      case "tangentStart":
        this.ask({ kind: "tangentEnd", start: point ?? undefined }, ctx)
        return
      case "tangentEnd":
        this.setTangents(step.start, point ?? undefined, ctx)
        return
      case "vertexAdd":
        if (!point) {
          this.ask({ kind: "vertex" }, ctx)
          return
        }
        this.edit(ctx, (s) =>
          controlVertexAdded(SplineEditTool.vertices(s), this.onPlane(s, point))
        )
        this.ask(step, ctx)
        return
      case "vertexDelete": {
        if (!point) {
          this.ask({ kind: "vertex" }, ctx)
          return
        }
        const vertices = SplineEditTool.vertices(spline)
        const index = splinePointNear(
          vertices.points,
          point,
          ctx.pickTolerance()
        )
        if (index === null) {
          ctx.report(ctx.text.message("notAControlVertex"))
          this.ask(step, ctx)
          return
        }
        this.edit(ctx, (s) =>
          controlVertexDeleted(SplineEditTool.vertices(s), index)
        )
        if (vertices.points.length - 1 <= deleteFloor(spline)) {
          ctx.report(ctx.text.message("cannotDeleteBeyond"))
          this.ask({ kind: "vertex" }, ctx)
        } else this.ask(step, ctx)
        return
      }
      case "move": {
        if (!point) {
          this.stepTo(this.steppingForward(step.walked), step.walked, ctx)
          return
        }
        // The point moved to, `@` read from it next (pedit/p321, p325, p335).
        ctx.setLastPoint(point)
        this.edit(ctx, this.movedTo(step.walked, point))
        this.ask(step, ctx)
        return
      }
    }
  }

  /** Move's edit: the current point at `point`, which the answer and the ghost share. */
  private movedTo(
    walked: Walked,
    point: Vec3
  ): (spline: SplineEntity) => SplineEntity {
    const index = this.pointIndex(walked)
    return (s) => {
      const target = walked === "fit" ? s : SplineEditTool.vertices(s)
      // A Z typed at Edit vertex's Move is kept, the spline leaving its
      // plane (splinedit/p120); Fit data's is unprobed.
      const to = walked === "fit" ? this.onPlane(s, point) : point
      return {
        ...target,
        points: target.points.map((p, i) => (i === index ? to : p)),
      }
    }
  }

  /** A point given for the spline, in its plane where it lies in one. */
  private onPlane(spline: SplineEntity, point: Vec3): Vec3 {
    return isLevelSpline(spline)
      ? { x: point.x, y: point.y, z: spline.points[0]?.z ?? 0 }
      : point
  }

  private addFitPoint(
    step: Step & { kind: "addPoint" },
    point: Vec3,
    ctx: ToolContext
  ): void {
    const mark = ctx.historyDepth()
    this.edit(ctx, (s) => fitPointAdded(s, step.at, this.onPlane(s, point)))
    this.ask(
      { kind: "addPoint", at: step.at + 1, marks: [...step.marks, mark] },
      ctx
    )
  }

  /** Add's Undo: the last point added taken back (k106). */
  private undoAdded(ctx: ToolContext): void {
    const step = this.step
    if (step.kind !== "addPoint" || step.marks.length === 0) return
    ctx.undoTo(step.marks[step.marks.length - 1])
    this.ask(
      { kind: "addPoint", at: step.at - 1, marks: step.marks.slice(0, -1) },
      ctx
    )
  }

  /**
   * Delete takes fit points until two are left, three on a closed spline,
   * then says so and goes back to Fit data (k62, k103; splinedit/p107, p154,
   * p156).
   */
  private deleteFitPoint(index: number, ctx: ToolContext): void {
    const shown = this.shown(ctx)
    if (!shown) return
    this.edit(ctx, (s) => fitPointDeleted(s, index))
    if (shown.points.length - 1 <= deleteFloor(shown)) {
      ctx.report(ctx.text.message("cannotDeleteBeyond"))
      this.ask({ kind: "fit" }, ctx)
    } else this.ask({ kind: "existing", purpose: "delete" }, ctx)
  }

  private setTangents(
    start: Vec3 | null | undefined,
    end: Vec3 | null | undefined,
    ctx: ToolContext
  ): void {
    this.edit(ctx, (s) => splineTangentsAt(s, start, end))
    // The end tangent's base point, whatever was given (pedit/p323, p330,
    // p334 and their traces' BasePoint).
    const last = this.walkedPoints(ctx, "fit").at(-1)
    if (last) ctx.setLastPoint(last)
    this.ask({ kind: "fit" }, ctx)
  }

  /** A number given, or Enter (`null`), at the order, precision or weight. */
  private answerNumber(value: number | null, ctx: ToolContext): void {
    const step = this.step
    const typed = ctx.dynamicInput.getText("value").trim()
    switch (step.kind) {
      case "order": {
        if (value === null) {
          this.ask({ kind: "vertex" }, ctx)
          return
        }
        const order = this.order + 1
        if (!integerIn(typed, value, order, MAX_SPLINE_ORDER)) {
          ctx.report(
            ctx.text.message("requiresIntegerBetween", {
              min: order,
              max: MAX_SPLINE_ORDER,
            }),
            "error"
          )
          this.ask(step, ctx)
          return
        }
        this.edit(ctx, (s) =>
          value === order
            ? null
            : splineElevated(SplineEditTool.vertices(s), value - 1)
        )
        this.ask({ kind: "vertex" }, ctx)
        return
      }
      case "precision": {
        if (value !== null && !integerIn(typed, value, 0, MAX_PRECISION)) {
          ctx.report(
            ctx.text.message("requiresIntegerBetween", {
              min: 0,
              max: MAX_PRECISION,
            }),
            "error"
          )
          this.ask(step, ctx)
          return
        }
        if (value !== null) this.conversion.precision = value
        this.convert(this.conversion.precision, ctx)
        return
      }
      case "weight": {
        if (value === null) {
          this.stepTo(this.steppingForward("cv"), "cv", ctx)
          return
        }
        if (!(value > 0)) {
          ctx.report(ctx.text.message("positiveNonzero"), "error")
          this.ask(step, ctx)
          return
        }
        const index = this.current
        this.edit(ctx, (s) =>
          controlVertexWeighed(SplineEditTool.vertices(s), index, value)
        )
        this.ask(step, ctx)
        return
      }
    }
  }

  /** convert to Polyline: the spline replaced and the command ended (k73, k90–k92). */
  private convert(precision: number, ctx: ToolContext): void {
    const spline = this.spline(ctx)
    if (!spline) return
    ctx.execute(
      new ReplaceEntitiesCommand(
        [spline.id],
        [splinePolyline(spline, precision, worldZOf(ctx))]
      )
    )
    ctx.endCommand()
  }

  /** Join's set closed: JOIN's joining onto the spline, then the main prompt (k72, k117). */
  private join(ctx: ToolContext): void {
    const spline = this.spline(ctx)
    const set = ctx.selection
      .toArray()
      .map((id) => ctx.document.get(id))
      .filter((entity): entity is Entity => entity !== undefined)
    ctx.selection.clear()
    if (spline && set.length > 0) {
      const joined = joinToSpline(spline, set)
      if (joined.made.length > 0) {
        ctx.execute(new ReplaceEntitiesCommand(joined.removed, joined.made))
      }
      for (const { message, values } of joined.reports) {
        ctx.report(ctx.text.message(message, values))
      }
    }
    this.backToMain(ctx)
  }

  wantsSnap(): boolean {
    switch (this.step.kind) {
      case "select":
        return this.modes.wantsSnap()
      case "join":
        return this.joiner.wantsSnap()
      case "main":
      case "fit":
      case "vertex":
      case "order":
      case "precision":
      case "weight":
        return false
      default:
        return true
    }
  }

  /**
   * WHY at `Select spline:`: an object snap typed there picks at the point it
   * finds, LASTPOINT (pedit/p327).
   */
  takesSnapOverride(): boolean {
    return this.step.kind === "select" && !this.modes.inMode()
  }

  cycleLasso(ctx: ToolContext): boolean {
    if (this.step.kind === "select") return this.modes.cycleLasso(ctx)
    if (this.step.kind === "join") return this.joiner.cycleLasso(ctx)
    return false
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    const step = this.step
    if (step.kind === "select") {
      if (this.modes.inMode()) {
        this.modes.onPointerMove(input, ctx)
        return
      }
      const hover = ctx.pick(input.world)
      if (hover?.id !== step.hover?.id) {
        this.step = { kind: "select", hover: hover ?? null }
        ctx.requestRender()
      }
      return
    }
    if (step.kind === "join") {
      this.joiner.onPointerMove(input, ctx)
      return
    }
    this.cursor = input.point
    ctx.requestRender()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return
    const step = this.step
    if (step.kind === "select") {
      if (this.modes.inMode()) {
        this.modes.onPointerDown(input, ctx)
        return
      }
      // A click that picks is LASTPOINT, as a typed pick is (pedit/p320),
      // the cursor's point on the work plane (VSD-04, SED-06) or the
      // override's (p327).
      const at = input.snap ? input.point : input.world
      if (ctx.pick(at)) ctx.setLastPoint(input.point)
      this.pickSpline(at, ctx)
      return
    }
    if (step.kind === "join") {
      this.joiner.onPointerDown(input, ctx)
      ctx.requestRender()
      return
    }
    if (this.wantsSnap()) this.answerPoint(input.point, ctx)
  }

  onPointerUp(input: PointerInput, ctx: ToolContext): void {
    if (this.step.kind === "select") this.modes.onPointerUp(input, ctx)
    if (this.step.kind === "join") this.joiner.onPointerUp(input, ctx)
  }

  /** Where Move's and Add's rubber band starts: the point they are on. */
  getConstraintAnchor(ctx: ToolContext): Vec3 | null {
    return this.anchor(ctx)
  }

  private anchor(ctx: ToolContext): Vec3 | null {
    const step = this.step
    if (step.kind === "move") {
      return (
        this.walkedPoints(ctx, step.walked)[this.pointIndex(step.walked)] ??
        null
      )
    }
    if (step.kind === "addPoint" || step.kind === "addWhere") {
      const points = this.walkedPoints(ctx, "fit")
      const at = step.kind === "addWhere" ? 0 : step.at
      return points[Math.max(0, at - 1)] ?? null
    }
    if (step.kind === "tangentStart")
      return this.walkedPoints(ctx, "fit")[0] ?? null
    if (step.kind === "tangentEnd")
      return this.walkedPoints(ctx, "fit").at(-1) ?? null
    return null
  }

  /**
   * The spline in the selection's glow, with the grips of the points its
   * prompt is about, the one Move or Weight is on hot; Edit vertex's control
   * frame dashed (desktop splinedit/d01-5); an amber dashed line from the
   * point a prompt starts from to the cursor (its prompts' rubber band, k64
   * trace), and at Move the spline as the cursor would leave it (desktop
   * splinedit/d01-4, d01-6, d02-2, d02-3).
   */
  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    const step = this.step
    if (step.kind === "select") {
      if (this.modes.inMode()) return this.modes.buildOverlay(ctx)
      return step.hover ? rollover(ctx, step.hover) : []
    }
    if (step.kind === "join") return this.joiner.buildOverlay(ctx)
    const spline = this.spline(ctx)
    const shown = this.shown(ctx)
    if (!spline || !shown) return []
    const out = [...glow(ctx, spline)]
    const walked = this.walkedNow()
    const target = walked === "fit" ? shown : SplineEditTool.vertices(shown)
    const shape = vertexGripShape(target)
    if (walked === "cv" && step.kind !== "main") {
      out.push({
        kind: "path",
        points: target.points.map((point) => ctx.viewport.worldToScreen(point)),
        closed: target.closed,
        stroke: { color: THEME.splineEditFrame, width: 1, dash: [2, 3] },
      })
    }
    if (step.kind === "move" && this.cursor) {
      const ghost = this.edited(ctx, this.movedTo(step.walked, this.cursor))
      if (ghost) out.push(...drawn(ctx, ghost, "plain"))
    }
    target.points.forEach((point, i) => {
      const hot =
        (step.kind === "move" || step.kind === "weight") &&
        i === this.pointIndex(walked)
      out.push(...gripPrimitives(ctx.viewport.worldToScreen(point), hot, shape))
    })
    const from = this.anchor(ctx)
    if (from && this.cursor) {
      out.push({
        kind: "segment",
        a: ctx.viewport.worldToScreen(from),
        b: ctx.viewport.worldToScreen(this.cursor),
        stroke: { color: THEME.dashedRubberBand, width: 1, dash: [2, 3] },
      })
    }
    return out
  }

  /** What the prompts show of the spline as it now stands. */
  private refresh(ctx: ToolContext): void {
    const shown = this.shown(ctx)
    if (!shown) return
    const vertices = SplineEditTool.vertices(shown)
    this.counts = { fit: shown.points.length, cv: vertices.points.length }
    this.order = vertices.degree
    this.closed = shown.closed
    this.methodShown = shown.method
    const weight = vertices.weights?.[this.current] ?? 1
    this.weightShown = formatLength(weight, ctx.document.getSettings())
  }
}

/** The WCS's Z in the tool's frame, which convert to Polyline's 2D or 3D polyline is read against. */
export function worldZOf(ctx: ToolContext): Vec3 {
  return ucsZAxis(ctx.ucs.wcs ?? WORLD_UCS)
}

/** The fewest points Delete leaves: two, three on a closed spline (splinedit/p107, p108). */
function deleteFloor(spline: SplineEntity): number {
  return spline.closed ? 3 : 2
}

/** Whether `typed` is an integer from `min` to `max`, as AutoCAD's integer prompts take one. */
export function integerIn(
  typed: string,
  value: number,
  min: number,
  max: number
): boolean {
  return (
    /^[+-]?\d+$/.test(typed) &&
    Number.isInteger(value) &&
    value >= min &&
    value <= max
  )
}
