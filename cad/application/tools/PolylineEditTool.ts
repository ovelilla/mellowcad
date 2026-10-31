import { Vec2, V } from "../../geometry/Vec2"
import { Vec3, cross3, normalize3, sub3 } from "../../geometry/Vec3"
import { arbitraryAxis, axesToWorld, worldToAxes } from "../../geometry/ocs"
import { infiniteLineIntersection } from "../../geometry/primitives"
import { nextEntityId } from "../../domain/entityIds"
import {
  Entity,
  EntityId,
  type PolylineEntity,
  type Polyline3dEntity,
  arcEndPoint,
  arcStartPoint,
  arcSweepAngle,
  carryOverrides,
  createLine,
  createPolyline,
  entityElevation,
  isLevel,
  lineEndZ,
  lineStartZ,
  planeAxes,
  polyline3dFrame,
  polyline3dSplined,
  polylineBulge,
  polylineDecurved,
  polylineFitted,
  polylineSplined,
  withFitParts,
  polylineSegments,
  polylineWidth,
  replacePolyline3dVertex,
  replacePolylineVertex,
  withElevation,
  withNormal,
  withPolylineWidths,
} from "../../domain/entities"
import {
  polylineBrokenAt,
  polylineClosedByPedit,
  polylineReversed,
  polylineSegmentWidened,
  polylineStraightened,
  polylineVertexInserted,
} from "../../domain/polylines"
import {
  polyline3dBrokenAt,
  polyline3dReversed,
  polyline3dStraightened,
  polyline3dVertexInserted,
} from "../../domain/polylines3d"
import { splinePolyline } from "../../domain/splineEditing"
import type { ScenePrimitive } from "../../scene/types"
import { THEME } from "../../scene/theme"
import {
  ReplaceEntitiesCommand,
  UpdateEntitiesCommand,
} from "../commands/entityCommands"
import {
  isCoordinateExpression,
  parseCoordinate,
} from "../input/coordinateInput"
import type { PromptId } from "../../locales/types"
import { glow, rollover } from "./ghostLook"
import { joinToPolyline } from "./JoinTool"
import {
  type AddedBy,
  type ModeFind,
  ONE_OBJECT_MODES,
  ObjectSelector,
} from "./objectSelection"
import { gripRubberBand } from "./selectToolOverlay"
import { integerIn } from "./SplineEditTool"
import {
  CommandOption,
  CommandOptionOutcome,
  PointerInput,
  QuestionInput,
  Tool,
  ToolContext,
  ToolQuestion,
} from "./Tool"

type EditedPolyline = PolylineEntity | Polyline3dEntity

/** Multiple's Join: the ends moved to where they meet, a segment added between them, or either. */
type JoinType = "extend" | "add" | "both"

type Step =
  | { readonly kind: "select"; readonly hover: Entity | null }
  /** `Do you want to turn it into one? <Y>`, of a line, an arc or a spline picked. */
  | { readonly kind: "convert"; readonly entity: Entity }
  | { readonly kind: "precision"; readonly entity: Entity }
  /** Multiple's `Select objects:`. */
  | { readonly kind: "set" }
  | { readonly kind: "convertSet"; readonly set: readonly Entity[] }
  | { readonly kind: "setPrecision"; readonly set: readonly Entity[] }
  | { readonly kind: "main" }
  | { readonly kind: "join" }
  | { readonly kind: "fuzz" }
  | { readonly kind: "joinType" }
  | { readonly kind: "width" }
  | { readonly kind: "ltype" }
  | { readonly kind: "vertex" }
  | { readonly kind: "insert" }
  | { readonly kind: "move" }
  /** Edit vertex's Width: the starting width, then the ending one (`start` given). */
  | { readonly kind: "vertexWidth"; readonly start: number | null }
  | { readonly kind: "tangent" }
  /** Break's or Straighten's `[Next/Previous/Go/eXit]`, from the vertex it began at. */
  | {
      readonly kind: "walk"
      readonly purpose: "break" | "straighten"
      readonly from: number
    }

/** AutoCAD's default and range at `Specify a precision <10>:` (pedit/p07). */
const DEFAULT_PRECISION = 10
const MAX_PRECISION = 99

/** World tolerance within which two ends touch. */
const TOUCH = 1e-6

/** The X Edit vertex marks its vertex with, half its size in pixels. */
const MARK_SIZE = 6

/**
 * PEDIT, as AutoCAD 2027's console asks it (probes pedit/p01–p199, en and
 * es): `Select polyline or [Multiple]:`, a line, an arc or a spline turned
 * into a polyline on the spot, then `Enter an option [Close/Join/Width/Edit
 * vertex/Fit/Spline/Decurve/Ltype gen/Reverse/Undo]:` (a 3D polyline's
 * `[Close/Join/Edit vertex/Spline curve/Decurve/Reverse/Undo]`), each option
 * done at once and one step of its Undo; Edit vertex is a prompt of its own
 * with its X on a vertex of the frame, taken back whole (p35). Fit, Spline
 * and Decurve fit it as `polylineFits.ts` does (p50–p62, p147–p199). Escape
 * keeps what was done, and U after the command takes back all of it (p36,
 * p47).
 */
export class PolylineEditTool implements Tool {
  readonly id = "pedit"

  private step: Step = { kind: "select", hover: null }
  /** The polylines edited: one, or Multiple's. */
  private ids: EntityId[] = []
  private multiple = false
  /** The undo history before each step of the main prompt, for its Undo. */
  private steps: number[] = []
  private stepStart = 0
  /** Edit vertex's vertex, and the way its Enter steps (pedit/p21). */
  private current = 0
  private forward = true
  /** The way Break's and Straighten's Enter steps. */
  private walkForward = true
  private cursor: Vec3 | null = null
  /** Multiple's join type, for the session (**unverified** where AutoCAD keeps it). */
  private joinType: JoinType = "extend"
  /** Multiple's set in the order it reads it (pedit/p12, p14, p93: newest first). */
  private order: EntityId[] = []
  /** The polyline a double-click starts the run on. */
  private pending: EntityId | null = null
  /**
   * Edit vertex's tangents of a polyline not fitted, one per vertex: AutoCAD
   * keeps them on its vertices for a Fit later in the run (p59, p188, p192)
   * and drops them as PEDIT ends on one left unfitted (p28). A fitted one
   * keeps its own (`fit.tangents`).
   */
  private loose = new Map<EntityId, (number | null)[]>()
  /** The loose tangents as each step of the main prompt found them, for its Undo. */
  private looseAt: Map<EntityId, (number | null)[]>[] = []

  /** `Select polyline or [Multiple]:`, a single object's pick (p01, p03). */
  private readonly modes = new ObjectSelector({
    takes: () => "oneObject",
    done: () => {},
    question: () => "selectPolylineOr",
    modes: ONE_OBJECT_MODES,
    one: {
      take: (entity, ctx) => this.take(entity, ctx),
      newest: true,
      pick: (point, ctx) => this.pickPolyline(point, ctx),
    },
  })

  /** Multiple's `Select objects:` (p12). */
  private readonly setSelector = new ObjectSelector({
    takes: () => "wholeObjects",
    done: (ctx) => this.setClosed(ctx),
    onAdded: (ids, added, _ctx, find) => this.added(ids, added, find),
  })

  /** Join's `Select objects:`, JOIN's set (p17). */
  private readonly joiner = new ObjectSelector({
    takes: () => "wholeObjects",
    accept: (ids) => ids.filter((id) => !this.ids.includes(id)),
    done: (ctx) => this.join(ctx),
  })

  /** Starts the run on `id`, as the double-click's `^C^C_pedit` with it selected does. */
  startOn(id: EntityId): void {
    this.pending = id
  }

  onActivate(ctx: ToolContext): void {
    this.reset()
    ctx.setCursor("crosshair")
    const pending = this.pending
    this.pending = null
    const [only, ...more] = pending ? [pending] : ctx.selection.toArray()
    const preselected = only !== undefined && ctx.document.get(only)
    ctx.selection.clear()
    // A polyline selected before the command is the one it edits (p37); a
    // set of more is not taken (p38).
    if (preselected && more.length === 0 && editable(preselected)) {
      this.begin([preselected.id], false, ctx)
    }
  }

  onDeactivate(ctx: ToolContext): void {
    this.reset()
    ctx.dynamicInput.close()
  }

  private reset(): void {
    this.step = { kind: "select", hover: null }
    this.ids = []
    this.multiple = false
    this.steps = []
    this.loose = new Map()
    this.looseAt = []
    this.cursor = null
    this.modes.start()
  }

  private polylines(ctx: ToolContext): EditedPolyline[] {
    return this.ids.flatMap((id) => {
      const entity = ctx.document.get(id)
      return entity && editable(entity) ? [entity] : []
    })
  }

  private polyline(ctx: ToolContext): EditedPolyline | null {
    return this.polylines(ctx)[0] ?? null
  }

  /** Whether the main prompt is a 3D polyline's: its own, or Multiple's with one in the set (p39). */
  private in3d(ctx: ToolContext): boolean {
    return this.polylines(ctx).some((poly) => poly.type === "polyline3d")
  }

  question(): PromptId | ToolQuestion | null {
    const step = this.step
    switch (step.kind) {
      case "select":
        return this.modes.question()
      case "convert":
        return { id: "turnIntoPolyline", enter: "undoYes", open: true }
      case "precision":
        return { id: "specifyPrecision", enter: { count: DEFAULT_PRECISION } }
      case "set":
        return this.setSelector.question()
      case "convertSet":
        return { id: "convertToPolylines", enter: "undoYes", open: true }
      case "setPrecision":
        return {
          id: "specifyPrecisionForSplineConversion",
          enter: { count: DEFAULT_PRECISION },
        }
      case "main":
        return this.main3d ? "peditOption3d" : "peditOption"
      case "join":
        return this.joiner.question()
      case "fuzz":
        return { id: "enterFuzzDistanceOr", enter: 0 }
      case "joinType":
        return { id: "enterJoinType", enter: JOIN_TYPE_PHRASE[this.joinType] }
      case "width":
        return "specifyNewWidthForAllSegments"
      case "ltype":
        return {
          id: "linetypeGenerationOption",
          enter: this.ltypeShown ? "undoOn" : "undoOff",
        }
      case "vertex":
        return {
          id: "peditVertexOption",
          enter: this.forward ? "peditNextShort" : "previousShort",
        }
      case "insert":
        return "specifyLocationForNewVertex"
      case "move":
        return "specifyNewLocationForMarkedVertex"
      case "vertexWidth":
        return step.start === null
          ? {
              id: "startingWidthForNextSegment",
              enter: this.widthShown[0],
            }
          : { id: "endingWidthForNextSegment", enter: step.start }
      case "tangent":
        return "directionOfVertexTangent"
      case "walk":
        return {
          id: "peditWalkOption",
          enter: this.walkForward ? "peditNextShort" : "previousShort",
        }
    }
  }

  /** Refused as AutoCAD 2027's console refuses them (p03, p07, p12, p22, p28, p75). */
  takes(): QuestionInput | null {
    switch (this.step.kind) {
      case "select":
        return this.modes.inMode()
          ? this.modes.takes()
          : { refusal: ["invalidSelection", "expectsPolylineOr"] }
      case "set":
        return this.setSelector.takes()
      case "join":
        return this.joiner.takes()
      case "convert":
      case "convertSet":
        return { refusal: "yesOrNoPlease" }
      case "precision":
      case "setPrecision":
        return {
          refusal: "requiresIntegerBetween",
          values: { min: 0, max: MAX_PRECISION },
        }
      case "width":
        return {
          refusal: "requiresDistance",
          values: { points: "two", keyword: "no" },
        }
      case "fuzz":
        return {
          refusal: "requiresDistance",
          values: { points: "two", keyword: "yes" },
        }
      case "vertexWidth":
        return {
          refusal: "requiresDistance",
          values: { points: "second", keyword: "no" },
        }
      case "tangent":
        return {
          refusal: "requiresAngle",
          values: { points: "second", keyword: "no" },
        }
      case "insert":
      case "move":
        return this.main3d ? "point" : "point2d"
      default:
        return "keyword"
    }
  }

  commandOptions(): readonly CommandOption[] {
    const step = this.step
    switch (step.kind) {
      case "select":
        return this.modes.inMode()
          ? this.modes.commandOptions()
          : [...this.modes.commandOptions(), { id: "Multiple" }]
      case "set":
        return this.setSelector.commandOptions()
      case "join":
        return this.joiner.commandOptions()
      case "convert":
      case "convertSet":
        return [
          { id: "Yes", hidden: true },
          { id: "No", hidden: true },
        ]
      case "main":
        return this.mainOptions()
      case "fuzz":
        return [{ id: "Jointype" }]
      case "joinType":
        return [{ id: "Extend" }, { id: "Add" }, { id: "Both" }]
      case "ltype":
        return [{ id: "ON" }, { id: "OFF" }]
      case "vertex":
        return [
          { id: "Next" },
          { id: "Previous" },
          { id: "Break" },
          { id: "Insert" },
          { id: "Move" },
          { id: "Regen" },
          { id: "Straighten" },
          ...(this.main3d ? [] : [{ id: "Tangent" }, { id: "Width" }]),
          { id: "eXit" },
        ]
      case "walk":
        return [
          { id: "Next" },
          { id: "Previous" },
          { id: "Go" },
          { id: "eXit" },
        ]
      default:
        return []
    }
  }

  /**
   * The main prompt's keywords, Close or Open as the polyline stands (both
   * answer either way, p02) and Multiple's both; a 3D polyline's and a set
   * holding one fewer (p09, p39, p55, p196, p197), Defit Decurve's hidden
   * twin (p198).
   */
  private mainOptions(): CommandOption[] {
    const close: CommandOption[] = this.multiple
      ? [{ id: "Close" }, { id: "Open" }]
      : this.closedShown
        ? [{ id: "Open" }, { id: "Close", hidden: true }]
        : [{ id: "Close" }, { id: "Open", hidden: true }]
    const hidden: CommandOption[] = [
      { id: "Defit", hidden: true },
      { id: "eXit", hidden: true },
      { id: "X", hidden: true },
    ]
    if (this.main3d) {
      return [
        ...close,
        ...(this.multiple ? [] : [{ id: "Join" }, { id: "Edit vertex" }]),
        { id: "Spline curve" },
        { id: "Decurve" },
        { id: "Reverse" },
        { id: "Undo" },
        ...hidden,
      ]
    }
    return [
      ...close,
      { id: "Join" },
      { id: "Width" },
      ...(this.multiple ? [] : [{ id: "Edit vertex" }]),
      { id: "Fit" },
      { id: "Spline" },
      { id: "Decurve" },
      { id: "Ltype gen" },
      { id: "Reverse" },
      { id: "Undo" },
      ...hidden,
    ]
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    const step = this.step
    switch (step.kind) {
      case "select":
        if (id === "Multiple" && !this.modes.inMode()) {
          this.order = []
          ctx.selection.clear()
          this.setSelector.start()
          this.ask({ kind: "set" }, ctx)
          return "continue"
        }
        return this.modes.invokeOption(id, ctx) ? "continue" : "unhandled"
      case "set":
        return this.setSelector.invokeOption(id, ctx) ? "continue" : "unhandled"
      case "join":
        return this.joiner.invokeOption(id, ctx) ? "continue" : "unhandled"
      case "convert":
      case "convertSet":
        if (id === "Yes") this.answerYes(ctx)
        else if (id === "No") this.answerNo(ctx)
        else return "unhandled"
        return "continue"
      case "main":
        return this.mainOption(id, ctx)
      case "fuzz":
        if (id !== "Jointype") return "unhandled"
        this.ask({ kind: "joinType" }, ctx)
        return "continue"
      case "joinType": {
        const type = JOIN_TYPES[id]
        if (!type) return "unhandled"
        this.joinType = type
        this.askFuzz(ctx)
        return "continue"
      }
      case "ltype":
        if (id !== "ON" && id !== "OFF") return "unhandled"
        this.mainStep(ctx, () =>
          this.editAll(ctx, (poly) =>
            poly.type !== "polyline"
              ? null
              : withLinetypeGeneration(poly, id === "ON")
          )
        )
        return "continue"
      case "vertex":
        return this.vertexOption(id, ctx)
      case "walk":
        if (id === "Next" || id === "Previous") {
          this.walkForward = id === "Next"
          this.stepVertex(this.walkForward, ctx)
          this.ask(step, ctx)
        } else if (id === "Go") {
          this.go(step, ctx)
        } else if (id === "eXit") {
          this.current = step.from
          this.ask({ kind: "vertex" }, ctx)
        } else return "unhandled"
        return "continue"
      default:
        return "unhandled"
    }
  }

  private mainOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    switch (id) {
      case "Close":
      case "Open":
        this.mainStep(ctx, () =>
          this.editAll(ctx, (poly) =>
            poly.type === "polyline"
              ? polylineClosedByPedit(poly, id === "Close")
              : poly.closed === (id === "Close")
                ? null
                : { ...poly, closed: id === "Close" }
          )
        )
        break
      case "Join":
        this.stepStart = ctx.historyDepth()
        this.looseStart = copied(this.loose)
        if (this.multiple) {
          this.askFuzz(ctx)
          break
        }
        // Can't join to a closed polyline, and the prompt again (p18).
        if (this.polyline(ctx)?.closed) {
          ctx.report(ctx.text.message("cannotJoinClosedPolyline"))
          this.ask({ kind: "main" }, ctx)
          break
        }
        ctx.selection.clear()
        this.joiner.start()
        this.ask({ kind: "join" }, ctx)
        break
      case "Width":
        if (this.main3d) return "unhandled"
        this.ask({ kind: "width" }, ctx)
        break
      case "Edit vertex":
        if (this.multiple) return "unhandled"
        this.stepStart = ctx.historyDepth()
        this.looseStart = copied(this.loose)
        this.current = 0
        this.forward = true
        this.ask({ kind: "vertex" }, ctx)
        break
      case "Ltype gen":
        if (this.main3d) return "unhandled"
        this.ask({ kind: "ltype" }, ctx)
        break
      case "Reverse":
        // Said in no words (p33).
        this.mainStep(ctx, () => {
          for (const [id, tangents] of this.loose) {
            this.loose.set(id, turnedRound(tangents))
          }
          this.editAll(ctx, (poly) =>
            poly.type === "polyline"
              ? polylineReversed(poly)
              : polyline3dReversed(poly)
          )
        })
        break
      case "Fit":
        if (this.main3d) return "unhandled"
        this.mainStep(ctx, () =>
          this.editAll(ctx, (poly) =>
            poly.type === "polyline"
              ? polylineFitted(poly, this.tangentsOf(poly))
              : null
          )
        )
        break
      case "Spline":
      case "Spline curve": {
        if ((id === "Spline") === this.main3d) return "unhandled"
        // SPLINETYPE and SPLINESEGS as they now stand (p52–p54).
        const settings = ctx.document.getSettings()
        const kind = settings.splineType === 5 ? "quadratic" : "cubic"
        const segments = settings.splineSegments
        this.mainStep(ctx, () =>
          this.editAll(ctx, (poly) =>
            poly.type === "polyline"
              ? polylineSplined(poly, kind, segments, this.tangentsOf(poly))
              : // A 3D polyline's runs are straight, |SPLINESEGS| a span (p198).
                polyline3dSplined(poly, kind, Math.abs(segments))
          )
        )
        break
      }
      case "Decurve":
      case "Defit":
        this.mainStep(ctx, () =>
          this.editAll(ctx, (poly) => {
            if (poly.type === "polyline3d") return polyline3dFrame(poly)
            // Its tangents stay for a Fit later in the run (p188).
            const tangents = this.tangentsOf(poly)
            if (tangents) this.loose.set(poly.id, [...tangents])
            return poly.fit || poly.bulges ? polylineDecurved(poly) : null
          })
        )
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

  private vertexOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    switch (id) {
      case "Next":
      case "Previous":
        this.forward = id === "Next"
        this.stepVertex(this.forward, ctx)
        this.ask({ kind: "vertex" }, ctx)
        break
      case "Break":
      case "Straighten":
        this.walkForward = true
        this.ask(
          {
            kind: "walk",
            purpose: id === "Break" ? "break" : "straighten",
            from: this.current,
          },
          ctx
        )
        break
      case "Insert":
        this.ask({ kind: "insert" }, ctx)
        break
      case "Move":
        this.ask({ kind: "move" }, ctx)
        break
      case "Regen":
        this.ask({ kind: "vertex" }, ctx)
        break
      case "Tangent":
        if (this.main3d) return "unhandled"
        this.ask({ kind: "tangent" }, ctx)
        break
      case "Width":
        if (this.main3d) return "unhandled"
        this.ask({ kind: "vertexWidth", start: null }, ctx)
        break
      case "eXit":
        this.backToMain(ctx)
        break
      default:
        return "unhandled"
    }
    return "continue"
  }

  /** Next and Previous stay put at either end, a closed polyline's too (p29, p63–p65). */
  private stepVertex(next: boolean, ctx: ToolContext): void {
    const count = this.polyline(ctx)?.vertices.length ?? 0
    this.current = Math.max(
      0,
      Math.min(count - 1, this.current + (next ? 1 : -1))
    )
  }

  /**
   * Break's and Straighten's Go, between the vertex they began at and the X:
   * the X then on the lower of the two, or on the first vertex left (p66, p67,
   * p73, p101); a break that would cut nothing off `*Invalid*` (p68, p69,
   * p100). Back at the vertex prompt either way.
   */
  private go(step: Step & { kind: "walk" }, ctx: ToolContext): void {
    const poly = this.polyline(ctx)
    if (!poly) return
    const from = step.from
    const to = this.current
    const lo = Math.min(from, to)
    const hi = Math.max(from, to)
    if (step.purpose === "straighten") {
      this.spliceLoose(poly.id, (t) =>
        hi - lo < 2 ? t : t.filter((_, i) => i <= lo || i >= hi)
      )
      this.edit(ctx, poly, (p) =>
        p.type === "polyline"
          ? polylineStraightened(p, from, to)
          : polyline3dStraightened(p, from, to)
      )
      this.current = lo
    } else {
      const pieces =
        poly.type === "polyline"
          ? polylineBrokenAt(poly, from, to)
          : polyline3dBrokenAt(poly, from, to)
      if (!pieces) {
        ctx.report(ctx.text.message("invalid"))
        this.current = from
      } else {
        // The piece from its start keeps the polyline; the other is new (p66, p101).
        const kept = pieces.first ?? pieces.second
        const other = pieces.first ? pieces.second : null
        this.spliceLoose(poly.id, (t) =>
          pieces.first ? t.slice(0, lo + 1) : t.slice(hi)
        )
        const made: EditedPolyline[] = [
          { ...kept!, id: poly.id },
          ...(other ? [{ ...other, id: nextEntityId() }] : []),
        ]
        ctx.execute(new ReplaceEntitiesCommand([poly.id], made))
        this.current = pieces.first ? lo : 0
      }
    }
    this.ask({ kind: "vertex" }, ctx)
  }

  /** A step of the main prompt done at once, which its Undo takes back. */
  private mainStep(ctx: ToolContext, run: () => void): void {
    this.stepStart = ctx.historyDepth()
    this.looseStart = copied(this.loose)
    run()
    this.backToMain(ctx)
  }

  private backToMain(ctx: ToolContext): void {
    if (ctx.historyDepth() > this.stepStart) {
      this.steps.push(this.stepStart)
      this.looseAt.push(this.looseStart)
    }
    // A fitted polyline holds its tangents itself.
    for (const poly of this.polylines(ctx)) {
      if (poly.type === "polyline" && poly.fit) this.loose.delete(poly.id)
    }
    this.stepStart = ctx.historyDepth()
    this.looseStart = copied(this.loose)
    this.ask({ kind: "main" }, ctx)
  }

  /** The loose tangents as the step under way found them. */
  private looseStart = new Map<EntityId, (number | null)[]>()

  /** A polyline's tangents: its fit's, else those Edit vertex gave it in this run. */
  private tangentsOf(
    poly: PolylineEntity
  ): readonly (number | null)[] | undefined {
    return poly.fit?.tangents ?? this.loose.get(poly.id)
  }

  /**
   * The main prompt's Undo: its last step back, a whole Edit vertex at once
   * (p35); `Command has been completely undone.` once none is left, even as
   * it takes back the last (p34, p46, p81).
   */
  private undoStep(ctx: ToolContext): void {
    const mark = this.steps.pop()
    const loose = this.looseAt.pop()
    if (loose) this.loose = loose
    if (mark !== undefined) ctx.undoTo(mark)
    if (this.steps.length === 0) {
      ctx.report(ctx.text.message("commandCompletelyUndone"))
    }
    this.stepStart = ctx.historyDepth()
    this.ask({ kind: "main" }, ctx)
  }

  /** One edit of every polyline edited, one command; `change` returns null for one it leaves. */
  private editAll(
    ctx: ToolContext,
    change: (poly: EditedPolyline) => EditedPolyline | null
  ): void {
    const changed = this.polylines(ctx).flatMap((poly) => {
      const after = change(poly)
      return after && after !== poly ? [after] : []
    })
    if (changed.length > 0) ctx.execute(new UpdateEntitiesCommand(changed))
  }

  private edit(
    ctx: ToolContext,
    poly: EditedPolyline,
    change: (poly: EditedPolyline) => EditedPolyline | null
  ): void {
    const after = change(poly)
    if (after && after !== poly) ctx.execute(new UpdateEntitiesCommand([after]))
  }

  private ask(step: Step, ctx: ToolContext): void {
    this.step = step
    this.refresh(ctx)
    switch (step.kind) {
      case "precision":
      case "setPrecision":
        ctx.dynamicInput.open({
          fields: [{ id: "value", kind: "number" }],
          commit: (values, commitCtx) =>
            this.answerPrecision(values.value, commitCtx),
          commitRaw: (commitCtx) => {
            if (commitCtx.dynamicInput.hasTypedText()) return false
            this.answerPrecision(null, commitCtx)
            return true
          },
        })
        break
      case "width":
      case "fuzz":
      case "vertexWidth": {
        ctx.dynamicInput.open({
          fields: [{ id: "width", prompt: "length", kind: "distance" }],
          commit: (values, commitCtx) =>
            this.answerDistance(values.width, commitCtx),
          // Enter where no default is shown: back at the main prompt
          // (**unverified**: the console's AllowNone, p20).
          commitRaw: () => false,
        })
        const shown = this.question()
        if (typeof shown === "object" && typeof shown?.enter === "number") {
          ctx.dynamicInput.setDefault("width", shown.enter)
        }
        break
      }
      case "tangent":
        ctx.dynamicInput.open({
          fields: [{ id: "angle", prompt: "angle", kind: "angle" }],
          commit: (values, commitCtx) =>
            this.answerTangent(values.angle, commitCtx),
          commitRaw: () => false,
        })
        break
      case "insert":
      case "move":
        ctx.dynamicInput.open({
          fields: [{ id: "point", kind: "coordinate" }],
          commit: () => {},
          commitRaw: (commitCtx) => this.answerPointText(commitCtx),
        })
        break
      case "select":
      case "set":
      case "join":
        break
      default:
        ctx.dynamicInput.open({ fields: [], commit: () => {} })
    }
    ctx.requestRender()
  }

  private begin(ids: EntityId[], multiple: boolean, ctx: ToolContext): void {
    this.ids = ids
    this.multiple = multiple
    this.steps = []
    this.stepStart = ctx.historyDepth()
    this.ask({ kind: "main" }, ctx)
  }

  /**
   * What `Select polyline` found: a polyline; a line, an arc or a spline
   * asked about (p04, p07); anything else said and asked again (p96).
   */
  private take(entity: Entity, ctx: ToolContext): void {
    if (editable(entity)) {
      this.begin([entity.id], false, ctx)
      return
    }
    ctx.report(ctx.text.message("objectNotPolyline"))
    if (convertible(entity)) {
      this.ask({ kind: "convert", entity }, ctx)
    } else {
      this.modes.start()
      this.ask({ kind: "select", hover: null }, ctx)
    }
  }

  /** A pick on nothing asks again in silence (p03). */
  private pickPolyline(world: Vec2 | Vec3, ctx: ToolContext): void {
    const hit = ctx.pick({ x: world.x, y: world.y })
    if (hit) this.take(hit, ctx)
  }

  private answerYes(ctx: ToolContext): void {
    const step = this.step
    if (step.kind === "convert") {
      if (step.entity.type === "spline") {
        this.ask({ kind: "precision", entity: step.entity }, ctx)
      } else this.convertOne(step.entity, DEFAULT_PRECISION, ctx)
    } else if (step.kind === "convertSet") {
      if (step.set.some((entity) => entity.type === "spline")) {
        this.ask({ kind: "setPrecision", set: step.set }, ctx)
      } else this.convertSet(step.set, DEFAULT_PRECISION, ctx)
    }
  }

  /** No: `Select polyline or [Multiple]:` again (p05, p41). */
  private answerNo(ctx: ToolContext): void {
    this.modes.start()
    this.ask({ kind: "select", hover: null }, ctx)
  }

  /** The object turned into a polyline, a new one in its place (p04, p11), then the main prompt. */
  private convertOne(
    entity: Entity,
    precision: number,
    ctx: ToolContext
  ): void {
    const polyline = asPolyline(entity, precision)
    ctx.execute(new ReplaceEntitiesCommand([entity.id], [polyline]))
    this.begin([polyline.id], false, ctx)
  }

  private answerPrecision(value: number | null, ctx: ToolContext): void {
    const step = this.step
    if (step.kind !== "precision" && step.kind !== "setPrecision") return
    const typed = ctx.dynamicInput.getText("value").trim()
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
    const precision = value ?? DEFAULT_PRECISION
    if (step.kind === "precision") this.convertOne(step.entity, precision, ctx)
    else this.convertSet(step.set, precision, ctx)
  }

  private added(
    ids: readonly EntityId[],
    added: AddedBy,
    find: ModeFind
  ): void {
    // Newest first but a fence's (pedit/p12, p14, p93; a fence and picks'
    // order unprobed).
    const newestFirst = added.by !== "pick" && find.by !== "fence"
    this.order = [
      ...this.order.filter((id) => !ids.includes(id)),
      ...(newestFirst ? [...ids].reverse() : ids),
    ]
  }

  /**
   * Multiple's set closed: its lines, arcs and splines asked about first
   * (p12), its polylines then edited together; with none, the first prompt
   * again (**unverified**).
   */
  private setClosed(ctx: ToolContext): void {
    const set = ctx.selection
      .toArray()
      .sort((a, b) => this.order.indexOf(a) - this.order.indexOf(b))
      .flatMap((id) => ctx.document.get(id) ?? [])
    ctx.selection.clear()
    if (set.some(convertible)) {
      this.ask({ kind: "convertSet", set }, ctx)
      return
    }
    this.convertSet(set, DEFAULT_PRECISION, ctx)
  }

  /** Multiple's lines, arcs and splines turned into polylines in one command (p12, p114). */
  private convertSet(
    set: readonly Entity[],
    precision: number,
    ctx: ToolContext
  ): void {
    const made = new Map<EntityId, EditedPolyline>()
    for (const entity of set) {
      if (convertible(entity))
        made.set(entity.id, asPolyline(entity, precision))
    }
    if (made.size > 0) {
      ctx.execute(
        new ReplaceEntitiesCommand([...made.keys()], [...made.values()])
      )
    }
    const ids = set.flatMap((entity) => {
      const polyline = made.get(entity.id)
      if (polyline) return [polyline.id]
      return editable(entity) ? [entity.id] : []
    })
    if (ids.length === 0) {
      this.answerNo(ctx)
      return
    }
    this.begin(ids, true, ctx)
  }

  /** Join's set closed: JOIN's chain onto the polyline, then the main prompt (p17, p76). */
  private join(ctx: ToolContext): void {
    const poly = this.polyline(ctx)
    const set = ctx.selection
      .toArray()
      .flatMap((id) => ctx.document.get(id) ?? [])
    ctx.selection.clear()
    let count = 0
    // WHY nothing joins a 3D polyline: AutoCAD 2027's console adds no
    // segment to one, touching 3D polylines and lines alike (p43, p77, p103,
    // p104).
    if (poly?.type === "polyline") {
      const chain = joinToPolyline(poly, set)
      if (chain) {
        // Grown, it is decurved (p168, p183), its loose tangents gone with
        // the vertices they stood on (**unverified**).
        this.loose.delete(poly.id)
        ctx.execute(new ReplaceEntitiesCommand(chain.members, [chain.polyline]))
        count = chain.segments
      }
    }
    ctx.report(ctx.text.message("segmentsAddedToPolyline", { count }))
    this.backToMain(ctx)
  }

  /** `Join Type = Extend` and the fuzz distance asked (p12). */
  private askFuzz(ctx: ToolContext): void {
    ctx.report(ctx.text.message("joinTypeIs", { type: this.joinType }))
    this.ask({ kind: "fuzz" }, ctx)
  }

  /**
   * Multiple's Join within the fuzz distance: from each polyline of the set
   * in turn, the others joined onto its ends as {@link fuzzJoined} joins
   * them, scanning again after each (p12–p16, p83–p146).
   */
  private joinWithin(fuzz: number, ctx: ToolContext): void {
    const left = this.polylines(ctx).filter(
      (poly): poly is PolylineEntity => poly.type === "polyline" && !poly.closed
    )
    const made: PolylineEntity[] = []
    const removed: EntityId[] = []
    let segments = 0
    while (left.length > 0) {
      let chain = left.shift()!
      const before = polylineSegments(chain).length
      let joined = false
      for (let i = 0; i < left.length && !chain.closed; i++) {
        const grown = fuzzJoined(chain, left[i], fuzz, this.joinType)
        if (!grown) continue
        removed.push(left[i].id)
        left.splice(i, 1)
        chain = grown
        joined = true
        i = -1
      }
      if (!joined) continue
      segments += polylineSegments(chain).length - before
      made.push(chain)
      removed.push(chain.id)
    }
    if (made.length > 0) ctx.execute(new ReplaceEntitiesCommand(removed, made))
    ctx.report(
      made.length > 1
        ? ctx.text.message("segmentsAddedToPolylines", {
            count: segments,
            polylines: made.length,
          })
        : ctx.text.message("segmentsAddedToPolyline", { count: segments })
    )
    this.backToMain(ctx)
  }

  /**
   * Tangent's direction, in degrees from the X axis: a Fit refitted with it
   * at once (p150), a Spline's kept for a Fit later — it moves none of its
   * curve (p192) —, an unfitted one's kept for the run (p59, p28).
   */
  private answerTangent(degrees: number, ctx: ToolContext): void {
    const poly = this.polyline(ctx)
    if (poly?.type === "polyline" && Number.isFinite(degrees)) {
      const tangents = [
        ...(this.tangentsOf(poly) ?? poly.vertices.map(() => null)),
      ]
      tangents[this.current] = (degrees * Math.PI) / 180
      if (poly.fit?.kind === "curve") {
        ctx.execute(new UpdateEntitiesCommand([polylineFitted(poly, tangents)]))
      } else if (poly.fit) {
        ctx.execute(
          new UpdateEntitiesCommand([withFitParts(poly, null, tangents)])
        )
      } else this.loose.set(poly.id, tangents)
    }
    this.ask({ kind: "vertex" }, ctx)
  }

  /** The loose tangents of the polyline Edit vertex works on, spliced as its vertices are. */
  private spliceLoose(
    id: EntityId,
    change: (tangents: (number | null)[]) => (number | null)[]
  ): void {
    const tangents = this.loose.get(id)
    if (tangents) this.loose.set(id, change([...tangents]))
  }

  /** A width, a fuzz distance or a vertex's width given, never negative (p22, p75). */
  private answerDistance(value: number, ctx: ToolContext): void {
    const step = this.step
    if (!Number.isFinite(value)) return
    if (value < 0) {
      ctx.report(ctx.text.message("valueMustBePositive"), "error")
      this.ask(step, ctx)
      return
    }
    switch (step.kind) {
      case "width":
        this.mainStep(ctx, () =>
          this.editAll(ctx, (poly) =>
            poly.type !== "polyline"
              ? null
              : withPolylineWidths(
                  poly,
                  polylineSegments(poly).map(() => [value, value] as const)
                )
          )
        )
        return
      case "fuzz":
        this.joinWithin(value, ctx)
        return
      case "vertexWidth": {
        if (step.start === null) {
          this.ask({ kind: "vertexWidth", start: value }, ctx)
          return
        }
        const poly = this.polyline(ctx)
        if (poly?.type === "polyline") {
          const at = this.current
          this.edit(ctx, poly, (p) =>
            p.type === "polyline"
              ? polylineSegmentWidened(p, at, [step.start!, value])
              : null
          )
        }
        this.ask({ kind: "vertex" }, ctx)
        return
      }
    }
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

  /**
   * Insert's and Move's point, or Enter, which does nothing (p74): the new
   * vertex after the X, which moves onto it (p23, p80), or the X's vertex
   * moved, its bulges kept.
   */
  private answerPoint(point: Vec3 | null, ctx: ToolContext): void {
    const step = this.step
    const poly = this.polyline(ctx)
    if (poly && point) {
      const at = this.current
      if (step.kind === "insert") {
        this.spliceLoose(poly.id, (t) => {
          t.splice(at + 1, 0, null)
          return t
        })
        this.edit(ctx, poly, (p) =>
          p.type === "polyline"
            ? polylineVertexInserted(p, at, onPlane(p, point))
            : polyline3dVertexInserted(p, at, point)
        )
        this.current = at + 1
      } else if (step.kind === "move") {
        this.edit(ctx, poly, (p) =>
          p.type === "polyline"
            ? replacePolylineVertex(p, at, onPlane(p, point))
            : replacePolyline3dVertex(p, at, point)
        )
      }
    }
    this.ask({ kind: "vertex" }, ctx)
  }

  onEnter(ctx: ToolContext): boolean {
    const step = this.step
    switch (step.kind) {
      case "select":
        // Enter asks again (p03, p38): only Escape ends here.
        if (this.modes.inMode()) return this.modes.onEnter(ctx)
        this.ask(step, ctx)
        return true
      case "set":
        return this.setSelector.onEnter(ctx)
      case "join":
        return this.joiner.onEnter(ctx)
      case "convert":
      case "convertSet":
        this.answerYes(ctx)
        return true
      case "main":
        ctx.endCommand()
        return true
      case "fuzz":
        this.joinWithin(0, ctx)
        return true
      case "joinType":
        this.askFuzz(ctx)
        return true
      case "ltype":
      case "width":
        this.backToMain(ctx)
        return true
      case "vertex":
        this.stepVertex(this.forward, ctx)
        this.ask(step, ctx)
        return true
      case "walk":
        this.stepVertex(this.walkForward, ctx)
        this.ask(step, ctx)
        return true
      case "tangent":
        this.ask({ kind: "vertex" }, ctx)
        return true
      case "insert":
      case "move":
        this.answerPoint(null, ctx)
        return true
      default:
        return false
    }
  }

  answerTyped(text: string, ctx: ToolContext): boolean {
    const kind = this.step.kind
    if (kind === "select") return this.modes.answerTyped(text, ctx)
    if (kind === "set") return this.setSelector.answerTyped(text, ctx)
    if (kind === "join") return this.joiner.answerTyped(text, ctx)
    return false
  }

  wantsSnap(): boolean {
    switch (this.step.kind) {
      case "select":
        return this.modes.wantsSnap()
      case "set":
        return this.setSelector.wantsSnap()
      case "join":
        return this.joiner.wantsSnap()
      case "insert":
      case "move":
      case "width":
      case "fuzz":
      case "vertexWidth":
      case "tangent":
        return true
      default:
        return false
    }
  }

  cycleLasso(ctx: ToolContext): boolean {
    const kind = this.step.kind
    if (kind === "select") return this.modes.cycleLasso(ctx)
    if (kind === "set") return this.setSelector.cycleLasso(ctx)
    if (kind === "join") return this.joiner.cycleLasso(ctx)
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
    if (step.kind === "set") return this.setSelector.onPointerMove(input, ctx)
    if (step.kind === "join") return this.joiner.onPointerMove(input, ctx)
    this.cursor = input.point
    ctx.requestRender()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return
    const step = this.step
    if (step.kind === "select") {
      if (this.modes.inMode()) this.modes.onPointerDown(input, ctx)
      else this.pickPolyline(input.snap ? input.point : input.world, ctx)
      return
    }
    if (step.kind === "set" || step.kind === "join") {
      ;(step.kind === "set" ? this.setSelector : this.joiner).onPointerDown(
        input,
        ctx
      )
      ctx.requestRender()
      return
    }
    if (step.kind === "insert" || step.kind === "move") {
      this.answerPoint(input.point, ctx)
    }
  }

  onPointerUp(input: PointerInput, ctx: ToolContext): void {
    const kind = this.step.kind
    if (kind === "select") this.modes.onPointerUp(input, ctx)
    if (kind === "set") this.setSelector.onPointerUp(input, ctx)
    if (kind === "join") this.joiner.onPointerUp(input, ctx)
  }

  /** Where Insert's, Move's, a vertex width's and Tangent's rubber band starts: the X (p23, p22, p28 traces). */
  getConstraintAnchor(ctx: ToolContext): Vec3 | null {
    switch (this.step.kind) {
      case "insert":
      case "move":
      case "vertexWidth":
      case "tangent": {
        const poly = this.polyline(ctx)
        return poly ? vertexInWorld(poly, this.current) : null
      }
      default:
        return null
    }
  }

  /**
   * The polylines in the selection's glow, Edit vertex's X on its vertex,
   * and Insert's and Move's dashed line from it to the cursor (the look of
   * the console's X on the desktop **unverified**).
   */
  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    const step = this.step
    switch (step.kind) {
      case "select":
        if (this.modes.inMode()) return this.modes.buildOverlay(ctx)
        return step.hover ? rollover(ctx, step.hover) : []
      case "set":
        return this.setSelector.buildOverlay(ctx)
      case "join":
        return this.joiner.buildOverlay(ctx)
      case "convert":
        return glow(ctx, step.entity)
    }
    const polylines = this.polylines(ctx)
    const out = polylines.flatMap((poly) => glow(ctx, poly))
    const onVertex =
      step.kind === "vertex" ||
      step.kind === "walk" ||
      step.kind === "insert" ||
      step.kind === "move" ||
      step.kind === "vertexWidth" ||
      step.kind === "tangent"
    const poly = polylines[0]
    if (!onVertex || !poly) return out
    const at = ctx.viewport.worldToScreen(vertexInWorld(poly, this.current))
    const mark = { color: THEME.gripHot, width: 1.5 }
    out.push(
      {
        kind: "segment",
        a: { x: at.x - MARK_SIZE, y: at.y - MARK_SIZE },
        b: { x: at.x + MARK_SIZE, y: at.y + MARK_SIZE },
        stroke: mark,
      },
      {
        kind: "segment",
        a: { x: at.x - MARK_SIZE, y: at.y + MARK_SIZE },
        b: { x: at.x + MARK_SIZE, y: at.y - MARK_SIZE },
        stroke: mark,
      }
    )
    if ((step.kind === "insert" || step.kind === "move") && this.cursor) {
      out.push(gripRubberBand(at, ctx.viewport.worldToScreen(this.cursor)))
    }
    return out
  }

  /** What the prompts show of the polylines as they now stand. */
  private main3d = false
  private closedShown = false
  private ltypeShown = false
  private widthShown: readonly [number, number] = [0, 0]

  private refresh(ctx: ToolContext): void {
    const poly = this.polyline(ctx)
    this.main3d = this.in3d(ctx)
    this.closedShown = poly?.closed ?? false
    this.ltypeShown =
      poly?.type === "polyline" && poly.linetypeGeneration === true
    if (poly?.type === "polyline") {
      const count = polylineSegments(poly).length
      // An open polyline's last vertex starts no segment: the last one's end, as PLINE leaves it (p79).
      this.widthShown =
        this.current < count
          ? polylineWidth(poly, this.current)
          : [polylineWidth(poly, count - 1)[1], 0]
    }
  }
}

const JOIN_TYPES: Readonly<Record<string, JoinType>> = {
  Extend: "extend",
  Add: "add",
  Both: "both",
}

const JOIN_TYPE_PHRASE: Readonly<Record<JoinType, PromptId>> = {
  extend: "joinTypeExtend",
  add: "joinTypeAdd",
  both: "joinTypeBoth",
}

function editable(entity: Entity): entity is EditedPolyline {
  return entity.type === "polyline" || entity.type === "polyline3d"
}

/** What PEDIT turns into a polyline (p04, p06, p07, p97, p99). */
function convertible(entity: Entity): boolean {
  return (
    entity.type === "line" || entity.type === "arc" || entity.type === "spline"
  )
}

/**
 * A line, an arc or a spline as PEDIT turns it into a polyline, a new object
 * in its properties: an arc from its start counter-clockwise (p06), a level
 * line at its height (p98), a rising one in the upright plane holding it,
 * its normal Z × the line (p97), a spline as convert to Polyline leaves it,
 * a 3D polyline where it lies in no plane (p07, p99).
 */
function asPolyline(entity: Entity, precision: number): EditedPolyline {
  if (entity.type === "spline") return splinePolyline(entity, precision)
  if (entity.type === "arc") {
    return carryOverrides(
      entity,
      createPolyline(
        [arcStartPoint(entity), arcEndPoint(entity)],
        false,
        entity.layerId,
        [Math.tan(arcSweepAngle(entity) / 4)]
      )
    )
  }
  if (entity.type !== "line") throw new Error("not convertible")
  const level = carryOverrides(
    entity,
    createPolyline([entity.start, entity.end], false, entity.layerId)
  )
  if (isLevel(entity)) return level
  const start: Vec3 = { ...entity.start, z: lineStartZ(entity) }
  const end: Vec3 = { ...entity.end, z: lineEndZ(entity) }
  const normal = normalize3(cross3({ x: 0, y: 0, z: 1 }, sub3(end, start)))
  const axes = normal && arbitraryAxis(normal)
  if (!normal || !axes) return level
  const a = worldToAxes(axes, start)
  const b = worldToAxes(axes, end)
  return withNormal(
    withElevation(
      { ...level, vertices: [a, b].map((p) => ({ x: p.x, y: p.y })) },
      a.z
    ),
    normal
  )
}

function withLinetypeGeneration(
  poly: PolylineEntity,
  on: boolean
): PolylineEntity | null {
  if ((poly.linetypeGeneration === true) === on) return null
  if (on) return { ...poly, linetypeGeneration: true }
  const copy: Record<string, unknown> = { ...poly }
  delete copy.linetypeGeneration
  return copy as unknown as PolylineEntity
}

/** A vertex where it lies in the world: a polyline's in its plane. */
function vertexInWorld(poly: EditedPolyline, index: number): Vec3 {
  const v = poly.vertices[Math.min(index, poly.vertices.length - 1)]
  if (poly.type === "polyline3d") return v as Vec3
  const z = entityElevation(poly)
  const axes = planeAxes(poly)
  return axes ? axesToWorld(axes, { ...v, z }) : { x: v.x, y: v.y, z }
}

/** A point given for a polyline, in its plane's coordinates. */
function onPlane(poly: PolylineEntity, point: Vec3): Vec2 {
  const axes = planeAxes(poly)
  const p = axes ? worldToAxes(axes, point) : point
  return { x: p.x, y: p.y }
}

/**
 * `other` joined onto an end of `chain` by Multiple's rules (pedit/p12–p16,
 * p83–p146): touching, as JOIN joins them; with Extend, the straight end
 * segments' lines met where both ends move no farther than `fuzz`, trimmed
 * back or grown (p16, p86–p88, p92, p106, p107); with Add, the nearest two
 * ends joined by a straight segment where their gap is less than `fuzz`
 * times the distance between the other two ends (p83, p105, p116–p127,
 * p134–p146) — a measure no help states, read off the console; Both, Extend
 * where it can, else Add (p15, p85, p91). Null when it joins none.
 */
export function fuzzJoined(
  chain: PolylineEntity,
  other: PolylineEntity,
  fuzz: number,
  type: JoinType
): PolylineEntity | null {
  const touching = joinToPolyline(chain, [other])
  if (touching) return touching.polyline
  if (type !== "add") {
    const met = extendedToMeet(chain, other, fuzz)
    if (met) return joinToPolyline(met[0], [met[1]])?.polyline ?? null
  }
  if (type === "extend") return null
  const ends = (poly: PolylineEntity) => [
    poly.vertices[0],
    poly.vertices[poly.vertices.length - 1],
  ]
  let best: { gap: number; a: Vec2; b: Vec2; span: number } | null = null
  const [a0, a1] = ends(chain)
  const [b0, b1] = ends(other)
  for (const [a, farA] of [
    [a0, a1],
    [a1, a0],
  ]) {
    for (const [b, farB] of [
      [b0, b1],
      [b1, b0],
    ]) {
      const gap = V.distance(a, b)
      if (!best || gap < best.gap) {
        best = { gap, a, b, span: V.distance(farA, farB) }
      }
    }
  }
  if (!best || !(best.gap < fuzz * best.span)) return null
  const bridge = carryOverrides(
    chain,
    createLine(best.a, best.b, chain.layerId)
  )
  return joinToPolyline(chain, [bridge, other])?.polyline ?? null
}

/**
 * The two polylines with an end of each moved to where their straight end
 * segments' lines meet, both within `fuzz` of it, the pair moving least;
 * null where none does (parallel ones never, p13).
 */
function extendedToMeet(
  chain: PolylineEntity,
  other: PolylineEntity,
  fuzz: number
): [PolylineEntity, PolylineEntity] | null {
  const endsOf = (poly: PolylineEntity) => {
    const n = poly.vertices.length
    const segments = polylineSegments(poly).length
    return [
      { index: 0, from: 1, straight: polylineBulge(poly, 0) === 0 },
      {
        index: n - 1,
        from: n - 2,
        straight: polylineBulge(poly, segments - 1) === 0,
      },
    ]
  }
  let best: { move: number; a: number; b: number; at: Vec2 } | null = null
  for (const a of endsOf(chain)) {
    for (const b of endsOf(other)) {
      if (!a.straight || !b.straight) continue
      const hit = infiniteLineIntersection(
        chain.vertices[a.from],
        chain.vertices[a.index],
        other.vertices[b.from],
        other.vertices[b.index]
      )
      if (!hit) continue
      const at = hit.point
      const move = Math.max(
        V.distance(at, chain.vertices[a.index]),
        V.distance(at, other.vertices[b.index])
      )
      if (move <= fuzz + TOUCH && (!best || move < best.move)) {
        best = { move, a: a.index, b: b.index, at }
      }
    }
  }
  if (!best) return null
  return [
    replacePolylineVertex(chain, best.a, best.at),
    replacePolylineVertex(other, best.b, best.at),
  ]
}

/** Tangents turned round with their polyline: the other way, each a half turn on (**unverified**). */
function turnedRound(tangents: readonly (number | null)[]): (number | null)[] {
  return tangents.map((t) => (t === null ? null : t + Math.PI)).reverse()
}

function copied(
  loose: ReadonlyMap<EntityId, readonly (number | null)[]>
): Map<EntityId, (number | null)[]> {
  return new Map([...loose].map(([id, tangents]) => [id, [...tangents]]))
}
