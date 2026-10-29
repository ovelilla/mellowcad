import { Vec2 } from "../../geometry/Vec2"
import { Vec3 } from "../../geometry/Vec3"
import { DocumentReader } from "../../domain/Document"
import { Entity, EntityId } from "../../domain/entities"
import { ScenePrimitive } from "../../scene/types"
import {
  isCoordinateExpression,
  parseCoordinate,
} from "../input/coordinateInput"
import type { PromptId } from "../../locales/types"
import type { MessageId } from "../EngineText"
import {
  Lasso,
  buildFenceOverlay,
  buildLassoOverlay,
  buildSelectionBoxOverlay,
  buildSelectionPolygonOverlay,
  buildSelectionPreview,
  crossesPolygonEdges,
  extendLasso,
  isCrossingBox,
  lassoSelect,
  nextLassoMode,
  objectsInPolygon,
  objectsInWindow,
  objectsOnFence,
  startLasso,
} from "./boxSelection"
import { CommandOption, PointerInput, QuestionInput, ToolContext } from "./Tool"
import { typedPick } from "./typedPick"
import { lockedObjectAt } from "./lockedPick"

/** Screen-pixel movement past which a press-drag becomes a lasso. */
const DRAG_THRESHOLD_PX = 4

/**
 * The selection modes `Select objects:` takes — typed, never listed in its
 * prompt, SUbobject and Object only where its refusal lists them (a set with
 * sub-objects). Group and Multiple are not offered.
 */
const MODES = [
  "Window",
  "Last",
  "Crossing",
  "BOX",
  "ALL",
  "Fence",
  "WPolygon",
  "CPolygon",
  "Add",
  "Remove",
  "Previous",
  "Undo",
  "AUto",
  "SIngle",
  "SUbobject",
  "Object",
] as const

export type SelectionMode = (typeof MODES)[number]

/** The modes a set of whole objects takes (MIRROR's, JOIN's, STRETCH's). */
const WHOLE_OBJECT_MODES = MODES.filter(
  (mode) => mode !== "SUbobject" && mode !== "Object"
)

/** The modes SUbobject takes, as its refusal lists them: not Last nor ALL. */
const SUBOBJECT_MODES = MODES.filter(
  (mode) => mode !== "Last" && mode !== "ALL"
)

/**
 * The modes a single object's pick takes (BREAK's `Select object:`, UCS
 * OBject's): those its refusal lists that are built — not Group.
 */
export const ONE_OBJECT_MODES: readonly SelectionMode[] = [
  "Window",
  "Last",
  "Crossing",
  "BOX",
  "ALL",
  "Fence",
  "WPolygon",
  "CPolygon",
]

/**
 * How a window takes objects: wholly inside it, inside or crossing it, or by
 * the direction it is drawn in (BOX, and the window a click on nothing starts).
 */
type WindowRule = "window" | "crossing" | "box"

type Step =
  | { readonly kind: "objects"; readonly hover: Entity | null }
  /** A press at `Select objects:`: a pick, or the drag of a lasso. */
  | {
      readonly kind: "pressed"
      readonly start: Vec2
      readonly startScreen: Vec2
      readonly current: Vec2
      /** Shift held: what the gesture finds is removed from the set. */
      readonly subtract: boolean
    }
  | {
      readonly kind: "lasso"
      readonly lasso: Lasso
      readonly subtract: boolean
      /** What it would take now, previewed. */
      readonly preview: readonly EntityId[]
    }
  | { readonly kind: "firstCorner"; readonly rule: WindowRule }
  | {
      readonly kind: "oppositeCorner"
      readonly rule: WindowRule
      readonly start: Vec2
      readonly current: Vec2
      /** Started by a click on nothing, which no object snap or mode set. */
      readonly implied: boolean
      readonly subtract: boolean
      /** What it would take now, previewed. */
      readonly preview: readonly EntityId[]
    }
  | {
      readonly kind: "fence"
      readonly points: readonly Vec2[]
      readonly current: Vec2 | null
    }
  | {
      readonly kind: "polygon"
      readonly crossing: boolean
      readonly points: readonly Vec2[]
      readonly current: Vec2 | null
    }

/**
 * How a mode found what a single object's pick takes, which the command may
 * read where a pick would have been: across a fence (its points), by a
 * crossing window or polygon (its outline), or wholly inside a window or a
 * polygon, or by Last, which leave no trace on the object. `last` is the
 * point the mode ended on — a window's opposite corner, a fence's or a
 * polygon's last vertex —, where ARRAYPATH's run starts nearest (probes
 * arrays/p340, p376–p378).
 */
export type ModeFind = (
  | { readonly by: "fence"; readonly points: readonly Vec2[] }
  | { readonly by: "crossing"; readonly outline: readonly Vec2[] }
  | { readonly by: "enclosing" }
) & { readonly last?: Vec2 }

const ENCLOSING: ModeFind = { by: "enclosing" }

/**
 * How objects joined the set, as STRETCH tells them apart (transforms/p262–
 * p269): inside a crossing frame — a crossing window, CPolygon, a crossing
 * lasso — with its outline; by a pick or a mode with no crossing frame
 * (Window, WPolygon, Fence); or by name, with no geometry (Last, ALL,
 * Previous).
 */
export type AddedBy =
  | { readonly by: "frame"; readonly frame: readonly Vec2[] }
  | { readonly by: "pick" }
  | { readonly by: "name" }

const PICKED: AddedBy = { by: "pick" }
const NAMED: AddedBy = { by: "name" }

/** What of a find can join the set, and how many of the rest each filter took. */
interface Sifted {
  readonly kept: readonly EntityId[]
  readonly locked: number
  readonly refused: number
}

/** What one selection changed in the set, which `Undo` takes back. */
interface Operation {
  readonly added: readonly EntityId[]
  readonly removed: readonly EntityId[]
}

export interface ObjectSelectorOptions {
  /**
   * Runs once the set is closed — Enter with objects in it, SIngle's first
   * find, a fence or polygon ended short — for the command to go on.
   */
  readonly done: (ctx: ToolContext) => void
  /**
   * What `Select objects:` takes, which its refusal lists the modes of: a
   * selection set with sub-objects (`"objects"`) by default.
   */
  readonly takes?: () => QuestionInput
  /** How the command asks for the set, when not `Select objects`. */
  readonly question?: () => PromptId
  /**
   * The objects of those found the command can take, silently: the rest are
   * not counted (a find it empties says `0 found`, and starts the total) nor
   * highlighted (DIMSPACE's dimensions, erase/p244; ARRAYPATH's path curve).
   */
  readonly accept?: (
    ids: readonly EntityId[],
    ctx: ToolContext
  ) => readonly EntityId[]
  /**
   * What the command refuses of what a selection adds, said under its count
   * after the locked layer's line (`1 was not able to be exploded.`, the
   * message taking `count`) and kept out of the set: EXPLODE's
   * (erase/p213–p219). Nothing is said at `Remove objects:` (p215, p248).
   */
  readonly refuse?: {
    readonly rejects: (entity: Entity, ctx: ToolContext) => boolean
    readonly message: MessageId
  }
  /** Said when Enter closes an empty set: EXPLODE's `None found.` (p205). */
  readonly noneFound?: MessageId
  /**
   * Said for each object on a locked layer a selection finds, in place of
   * `n was on a locked layer.`, and by a pick on one, which then starts no
   * window and the prompt is asked again: MATCHPROP's `Destination object on a
   * locked layer. Cannot be updated.` (desktop properties/d07; a window's
   * answer unverified).
   */
  readonly locked?: MessageId
  /**
   * Called as objects join the set, a duplicate not among them, with how they
   * were found: STRETCH's frames, JOIN's order.
   */
  readonly onAdded?: (
    ids: readonly EntityId[],
    added: AddedBy,
    ctx: ToolContext,
    find: ModeFind
  ) => void
  /** The modes the prompt takes; by default those {@link takes} lists. */
  readonly modes?: readonly SelectionMode[]
  /**
   * The set closed is not kept as the Previous one: HATCH's boundary set
   * (probe hatch/p256).
   */
  readonly leavesPrevious?: true
  /**
   * A single object's pick rather than a set: what a mode finds is not added
   * to the selection nor counted, the command takes one of it — the oldest or
   * the newest in the drawing, as its pick in AutoCAD 2023's console does —
   * and finding none says `No object found`. The pick itself stays the
   * command's, which hands the selector only the modes ({@link inMode}).
   */
  readonly one?: {
    readonly take: (entity: Entity, ctx: ToolContext, find: ModeFind) => void
    readonly newest: boolean
    /**
     * Two found or more are taken together, the older of the two newest
     * first: FILLET's first object (AutoCAD 2023's console fillets them).
     */
    readonly pair?: (
      first: Entity,
      second: Entity,
      ctx: ToolContext,
      find: ModeFind
    ) => void
    /** Finding none says nothing: the prompt is asked again (FILLET's). */
    readonly silent?: boolean
    /**
     * After `No object found`, the command's next step in place of the prompt
     * again: UCS OBject ends (probe ucs/p317).
     */
    readonly notFound?: (ctx: ToolContext) => void
    /**
     * Taking none, the command's own answer in place of every other: UCS
     * Face's, whose modes find no face here (there are no solids).
     */
    readonly none?: (ctx: ToolContext, find: ModeFind) => void
    /**
     * Said once for each object on a locked layer the mode found, whatever
     * else it found, before what is taken (FILLET's and BREAK's `The object
     * is on a locked layer.`, probes corners/p274, pieces/p102, p178, p395;
     * ARRAYPATH's counted `1 was on a locked layer.`, arrays/p340, given
     * `count` 1); locked objects are never taken. Without it nothing is
     * said, nor where every one found is locked.
     */
    readonly locked?: MessageId
    /**
     * Where every one found is locked, their lines are all that is said and
     * the prompt is asked again: ARRAYPATH's (arrays/p339), where BREAK's
     * goes on to `No object found`.
     */
    readonly lockedAsksAgain?: boolean
    /**
     * Objects on a locked layer are taken like any other, in silence: UCS
     * OBject's, which edits nothing (probes ucs/p339, p340).
     */
    readonly takesLocked?: boolean
    /**
     * What Previous and ALL found, before one of it is taken: the command's
     * lines about it, and whether it said them, the count of what was left
     * out then said by them alone (ARRAYPATH's arrayed objects, arrays/p354,
     * p356).
     */
    readonly named?: (found: readonly EntityId[], ctx: ToolContext) => boolean
    /**
     * A point typed at the prompt, read as {@link typedPick} reads it (`@`,
     * a number), which AutoCAD's console takes as a pick there: the
     * command's own, which says what a pick on nothing does (where the
     * prompt takes AUto, {@link startWindow}).
     */
    readonly pick?: (point: Vec3, ctx: ToolContext) => void
  }
}

/**
 * AutoCAD's `Select objects:` — what every command that takes a selection set
 * asks it with, shared so each one takes the same answers: a pick, a window
 * clicked from a point on nothing, a lasso dragged, and the modes typed there
 * (Window, Crossing, BOX, Last, ALL, Fence, WPolygon, CPolygon, Previous,
 * Remove and Add, Undo, AUto, SIngle, SUbobject and Object). Each says what it
 * found on the line AutoCAD says it, in its words (`1 found (1 duplicate), 2
 * total`).
 */
export class ObjectSelector {
  private step: Step = { kind: "objects", hover: null }
  /** Remove's `Remove objects:` until Add. */
  private removing = false
  /** SIngle: the first selection that finds anything closes the set. */
  private single = false
  /**
   * After a preselection the command refused whole: the first selection that
   * adds to the set closes it (EXPLODE, erase/p241, p242).
   */
  private closesOnAdd = false
  /** SUbobject until Object: what is picked is a sub-object. */
  private subobject = false
  private operations: Operation[] = []
  /**
   * Whether a selection has found anything since the prompt opened: from the
   * second on, AutoCAD adds the total, even once Undo has emptied the set.
   */
  private counted = false

  constructor(private readonly options: ObjectSelectorOptions) {}

  /** Opens `Select objects:` anew, as a command asks for its set. */
  start(): void {
    this.step = { kind: "objects", hover: null }
    this.removing = false
    this.single = false
    this.closesOnAdd = false
    this.subobject = false
    this.operations = []
    this.counted = false
  }

  /**
   * Objects selected before the command, counted after its echo as AutoCAD
   * counts them (`Command: M MOVE 3 found`) and sifted as a selection is (the
   * locked layer's line, the command's {@link ObjectSelectorOptions.refuse}):
   * what is left stays selected and is kept as the Previous set. False when
   * nothing was selected or nothing is left, the command then asking `Select
   * objects:` — after a refusal closing at the first selection that adds to
   * the set (erase/p241, p242).
   */
  preselect(ctx: ToolContext): boolean {
    const all = ctx.selection.toArray()
    if (all.length === 0) return false
    const ids = this.options.accept?.(all, ctx) ?? all
    const sifted = this.sift(ids, ctx)
    ctx.selection.set(sifted.kept)
    ctx.answer(
      ctx.text.message("objectsFound", {
        found: ids.length,
        duplicate: 0,
        removed: 0,
        total: 0,
        hasTotal: "no",
        box: "no",
      })
    )
    this.sayRefused(sifted, ctx)
    this.counted = true
    if (sifted.kept.length === 0) {
      this.closesOnAdd = true
      return false
    }
    ctx.rememberSelection(sifted.kept)
    return true
  }

  question(): PromptId {
    switch (this.step.kind) {
      case "objects":
      case "pressed":
      case "lasso":
        return this.objectsQuestion()
      case "firstCorner":
        return "specifyFirstCorner"
      case "oppositeCorner":
        return "specifyOppositeCorner"
      case "fence":
        return this.step.points.length === 0
          ? "specifyFirstFencePoint"
          : "specifyNextFencePointOr"
      case "polygon":
        return this.step.points.length === 0
          ? "firstPolygonPoint"
          : "specifyEndpointOfLineOr"
    }
  }

  /**
   * What the question takes: the set at `Select objects:` (what its refusal
   * lists differs per command, and in SUbobject), a point at the modes' own
   * prompts.
   */
  takes(): QuestionInput {
    switch (this.step.kind) {
      case "firstCorner":
      case "oppositeCorner":
        return { refusal: "invalidWindowSpecification" }
      case "fence":
      case "polygon":
        return { refusal: "invalidResponse" }
      default:
        return this.subobject ? "subobjects" : this.set()
    }
  }

  commandOptions(): readonly CommandOption[] {
    switch (this.step.kind) {
      case "objects":
      case "pressed":
      case "lasso": {
        const offered = this.offered()
        // WHY: AutoCAD 2027 takes MIRROR's `S` and does nothing, `SI` being
        // SIngle (erase/p153, p158, p154). Only MIRROR was probed; every set
        // of whole objects, which lists no SUbobject, takes it so.
        const shortDoesNothing = !offered.includes("SUbobject")
        return offered.map((id) => ({
          id,
          hidden: true,
          prompt: "selectObjects",
          ...(shortDoesNothing && id === "SIngle"
            ? { shortDoesNothing: true }
            : {}),
        }))
      }
      case "fence":
      case "polygon":
        return this.step.points.length > 0 ? [{ id: "Undo" }] : []
      default:
        return []
    }
  }

  invokeOption(id: string, ctx: ToolContext): boolean {
    const step = this.step
    if (step.kind === "fence" || step.kind === "polygon") {
      if (id !== "Undo" || step.points.length === 0) return false
      this.step = { ...step, points: step.points.slice(0, -1) }
      this.openPointInput(ctx)
      ctx.requestRender()
      return true
    }
    if (step.kind !== "objects") return false
    if (!this.offered().some((mode) => mode === id)) return false
    switch (id) {
      case "Window":
      case "Crossing":
      case "BOX":
        this.step = {
          kind: "firstCorner",
          rule:
            id === "Window" ? "window" : id === "Crossing" ? "crossing" : "box",
        }
        this.openPointInput(ctx)
        return true
      case "Fence":
        this.step = { kind: "fence", points: [], current: null }
        this.openPointInput(ctx)
        return true
      case "WPolygon":
      case "CPolygon":
        this.step = {
          kind: "polygon",
          crossing: id === "CPolygon",
          points: [],
          current: null,
        }
        this.openPointInput(ctx)
        return true
      case "Last": {
        const last = lastObject(ctx)
        this.select(last ? [last.id] : [], false, NAMED, ctx)
        return true
      }
      case "ALL":
        this.selectNamed(allObjects(ctx.document), ctx)
        return true
      case "Previous": {
        const previous = ctx
          .previousSelection()
          .filter((id) => ctx.document.get(id) !== undefined)
        if (previous.length === 0) {
          ctx.report(ctx.text.message("noPreviousSelection"))
        } else {
          this.selectNamed(previous, ctx)
        }
        return true
      }
      case "Remove":
      case "Add":
        this.removing = id === "Remove"
        return true
      case "Undo":
        this.undo(ctx)
        return true
      case "AUto":
        // WHY nothing to set: a pick on an object takes it and one on nothing
        // starts a window — AUto's behaviour is this prompt's own.
        return true
      case "SIngle":
        this.single = true
        return true
      case "SUbobject":
      case "Object":
        this.subobject = id === "SUbobject"
        return true
      default:
        return false
    }
  }

  /**
   * A point typed at `Select objects:` (`typedPick`, a number too), as
   * AutoCAD 2023's console takes it: the object there is picked (`1 found`),
   * and on nothing a window starts there, asking `Specify opposite corner:`.
   * A single object's pick hands it to the command's {@link one}`.pick`
   * (none without one), which says what a pick on nothing does.
   */
  answerTyped(text: string, ctx: ToolContext): boolean {
    const one = this.options.one
    if (this.step.kind !== "objects" || (one && !one.pick)) return false
    const point = typedPick(text, ctx)
    if (!point) return false
    const at = { x: point.x, y: point.y }
    if (one?.pick) {
      one.pick(point, ctx)
      ctx.requestRender()
      return true
    }
    const under = ctx.pick(at)
    if (under) {
      this.select(
        this.found(ctx, () => [under.id]),
        false,
        PICKED,
        ctx
      )
    } else if (
      !this.saysLockedPick(ctx.viewport.worldToScreen(point), false, ctx)
    ) {
      this.startWindow(at, ctx)
    }
    ctx.requestRender()
    return true
  }

  /**
   * The window a pick on nothing starts there, finished by its opposite
   * corner: `Select objects:`' own, and a single object's pick that takes
   * AUto (ARRAYPATH's path curve, acc/bk20, bk23, bk48).
   */
  startWindow(at: Vec2, ctx: ToolContext): void {
    this.step = {
      kind: "oppositeCorner",
      rule: "box",
      start: at,
      current: at,
      implied: true,
      subtract: false,
      preview: [],
    }
    this.openPointInput(ctx)
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return
    const step = this.step
    if (step.kind === "objects") {
      this.step = {
        kind: "pressed",
        start: input.world,
        startScreen: input.screen,
        current: input.world,
        subtract: input.shiftKey,
      }
      return
    }
    this.place(this.pointOf(input), ctx, input.shiftKey)
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    const step = this.step
    switch (step.kind) {
      case "objects": {
        const hover = this.rolloverAt(input.world, ctx)
        if (hover?.id !== step.hover?.id) {
          this.step = { kind: "objects", hover }
          ctx.requestRender()
        }
        return
      }
      case "pressed": {
        const moved = Math.hypot(
          input.screen.x - step.startScreen.x,
          input.screen.y - step.startScreen.y
        )
        if (moved < DRAG_THRESHOLD_PX) {
          this.step = { ...step, current: input.world }
          break
        }
        const lasso = startLasso(ctx.viewport, step.start, input.world)
        this.step = {
          kind: "lasso",
          lasso,
          subtract: step.subtract,
          preview: this.lassoPreview(lasso, ctx),
        }
        // WHY in place of the prompt's line: AutoCAD writes no `Select
        // objects:` before it, the press having answered nothing (desktop
        // erase/d09-cl5).
        this.sayLasso(lasso, ctx, "gesture")
        break
      }
      case "lasso": {
        const lasso = extendLasso(ctx.viewport, step.lasso, input.world)
        const grew = lasso.path.length !== step.lasso.path.length
        this.step = {
          ...step,
          lasso,
          preview: grew ? this.lassoPreview(lasso, ctx) : step.preview,
        }
        break
      }
      case "oppositeCorner": {
        const current = this.pointOf(input)
        this.step = {
          ...step,
          current,
          preview: this.windowPreview(step.start, current, step.rule, ctx),
        }
        break
      }
      case "fence":
      case "polygon":
        this.step = { ...step, current: this.pointOf(input) }
        break
      case "firstCorner":
        break
    }
    ctx.dynamicInput.setPosition(input.screen)
    ctx.requestRender()
  }

  onPointerUp(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return
    const step = this.step
    if (step.kind === "pressed") {
      const under = ctx.pick(input.world)
      if (under) {
        this.step = { kind: "objects", hover: null }
        this.select(
          this.found(ctx, () => [under.id]),
          step.subtract,
          PICKED,
          ctx
        )
        this.step = {
          kind: "objects",
          hover: this.rolloverAt(input.world, ctx),
        }
      } else if (this.saysLockedPick(input.screen, step.subtract, ctx)) {
        this.step = { kind: "objects", hover: null }
      } else {
        // A pick on nothing starts a window, finished by the next one.
        this.step = {
          kind: "oppositeCorner",
          rule: "box",
          start: step.start,
          current: input.world,
          implied: true,
          subtract: step.subtract,
          preview: [],
        }
        this.openPointInput(ctx)
      }
      ctx.requestRender()
      return
    }
    if (step.kind === "lasso") {
      const { lasso } = step
      this.step = { kind: "objects", hover: null }
      const { mode, path } = lasso
      this.select(
        this.found(ctx, (include) =>
          lassoSelect(ctx.document, lasso, ctx.viewport, include)
        ),
        step.subtract,
        mode === "crossing" ? { by: "frame", frame: path } : PICKED,
        ctx,
        mode === "fence"
          ? { by: "fence", points: path }
          : mode === "crossing"
            ? { by: "crossing", outline: path }
            : ENCLOSING,
        true
      )
      ctx.requestRender()
    }
  }

  /**
   * Space with the button held: the lasso under way takes its next mode and
   * says it (desktop erase/d04). False with none under way.
   */
  cycleLasso(ctx: ToolContext): boolean {
    const step = this.step
    if (step.kind !== "lasso") return false
    const lasso = { ...step.lasso, mode: nextLassoMode(step.lasso.mode) }
    this.step = { ...step, lasso, preview: this.lassoPreview(lasso, ctx) }
    this.sayLasso(lasso, ctx, "info")
    ctx.requestRender()
    return true
  }

  /**
   * Enter: closes the set at `Select objects:` (false when it is empty, which
   * ends the command), selects across a fence or in a polygon; a window's
   * corners take no Enter.
   */
  onEnter(ctx: ToolContext): boolean {
    const step = this.step
    switch (step.kind) {
      case "objects":
        return this.close(ctx)
      case "pressed":
      case "lasso":
        return true
      case "firstCorner":
      case "oppositeCorner":
        this.refuseWindow(step, ctx)
        return true
      case "fence": {
        // WHY a short fence or polygon closes the set: AutoCAD's Enter there
        // ends Select objects itself (and an empty set the command).
        if (step.points.length < 2) return this.close(ctx)
        this.backToObjects(ctx)
        this.select(
          this.found(ctx, (include) =>
            objectsOnFence(ctx.document, step.points, ctx.viewport, include)
          ),
          false,
          PICKED,
          ctx,
          { by: "fence", points: step.points, last: step.points.at(-1) }
        )
        return true
      }
      case "polygon": {
        if (step.points.length < 3) return this.close(ctx)
        const first = step.points[0]
        const last = step.points[step.points.length - 1]
        if (crossesPolygonEdges(step.points, last, first)) {
          ctx.report(ctx.text.message("polygonSegmentsIntersect"))
          this.openPointInput(ctx)
          return true
        }
        this.backToObjects(ctx)
        this.select(
          this.found(ctx, (include) =>
            objectsInPolygon(
              ctx.document,
              step.points,
              ctx.viewport,
              step.crossing,
              include
            )
          ),
          false,
          step.crossing ? { by: "frame", frame: step.points } : PICKED,
          ctx,
          step.crossing
            ? { by: "crossing", outline: step.points, last }
            : { by: "enclosing", last }
        )
        return true
      }
    }
  }

  /**
   * What a pick, a window or a lasso under way would take: the object the
   * rollover highlights, or what the window or lasso holds.
   */
  previewed(): readonly EntityId[] {
    const step = this.step
    if (step.kind === "objects") return step.hover ? [step.hover.id] : []
    return step.kind === "lasso" || step.kind === "oppositeCorner"
      ? step.preview
      : []
  }

  /** Whether a mode's own prompt is asking: a window's corner, a fence's point. */
  inMode(): boolean {
    const kind = this.step.kind
    return kind !== "objects" && kind !== "pressed" && kind !== "lasso"
  }

  /** Whether the question is a point: a mode's corner or vertex. */
  wantsSnap(): boolean {
    const step = this.step
    return (
      step.kind === "firstCorner" ||
      (step.kind === "oppositeCorner" && !step.implied) ||
      step.kind === "fence" ||
      step.kind === "polygon"
    )
  }

  /**
   * The rollover, the window or lasso under way and the mode's preview;
   * `glow` false leaves out what {@link previewed} names (ERASE fades it).
   */
  buildOverlay(ctx: ToolContext, glow = true): ScenePrimitive[] {
    const step = this.step
    const preview = glow
      ? buildSelectionPreview(ctx.viewport, ctx.document, this.previewed())
      : []
    switch (step.kind) {
      case "objects":
        return preview
      case "lasso":
        return [...buildLassoOverlay(ctx.viewport, step.lasso), ...preview]
      case "oppositeCorner":
        return [
          ...buildSelectionBoxOverlay(
            ctx.viewport,
            step.start,
            step.current,
            step.rule === "box" ? undefined : step.rule === "crossing"
          ),
          ...preview,
        ]
      case "fence": {
        const points = step.current ? [...step.points, step.current] : []
        return points.length > 1 ? buildFenceOverlay(ctx.viewport, points) : []
      }
      case "polygon": {
        const points = step.current ? [...step.points, step.current] : []
        return points.length > 1
          ? buildSelectionPolygonOverlay(ctx.viewport, points, step.crossing)
          : []
      }
      default:
        return []
    }
  }

  /** A point given to a mode's prompt, picked or typed. */
  private place(point: Vec2, ctx: ToolContext, shift = false): void {
    const step = this.step
    switch (step.kind) {
      case "firstCorner":
        this.step = {
          kind: "oppositeCorner",
          rule: step.rule,
          start: point,
          current: point,
          implied: false,
          subtract: false,
          preview: [],
        }
        this.openPointInput(ctx)
        return
      case "oppositeCorner":
        this.backToObjects(ctx)
        this.selectWindow(
          step.start,
          point,
          step.rule,
          step.subtract || shift,
          ctx,
          step.implied
        )
        return
      case "fence":
      case "polygon": {
        // WHY a fence too: AutoCAD 2023's console refuses its point on the
        // one before in the polygon's words (acc/fn1, fn4).
        const last = step.points.at(-1)
        if (last && last.x === point.x && last.y === point.y) {
          ctx.report(ctx.text.message("polygonSegmentZeroLength"))
          return
        }
        if (step.kind === "fence") {
          this.step = { ...step, points: [...step.points, point] }
          this.openPointInput(ctx)
          return
        }
        // WHY only the point's own edge: AutoCAD 2023's console checks the
        // closing one at Enter (acc/sq1–sq5).
        if (last && crossesPolygonEdges(step.points, last, point)) {
          ctx.report(ctx.text.message("polygonSegmentsIntersect"))
          return
        }
        this.step = { ...step, points: [...step.points, point] }
        this.openPointInput(ctx)
        return
      }
      default:
        return
    }
  }

  private selectWindow(
    start: Vec2,
    end: Vec2,
    rule: WindowRule,
    subtract: boolean,
    ctx: ToolContext,
    implied = false
  ): void {
    const crossing =
      rule === "box"
        ? isCrossingBox(ctx.viewport, start, end)
        : rule === "crossing"
    const found = this.found(ctx, (include) =>
      objectsInWindow(ctx.document, start, end, ctx.viewport, crossing, include)
    )
    const frame = [
      start,
      { x: end.x, y: start.y },
      end,
      { x: start.x, y: end.y },
    ]
    // WHY from the screen: the box is upright there, which a turned view's
    // world is not.
    const a = ctx.viewport.worldToScreen(start)
    const b = ctx.viewport.worldToScreen(end)
    const outline = [a, { x: b.x, y: a.y }, b, { x: a.x, y: b.y }].map((p) =>
      ctx.viewport.screenToWorld(p)
    )
    this.select(
      found,
      subtract,
      crossing ? { by: "frame", frame } : PICKED,
      ctx,
      crossing
        ? { by: "crossing", outline, last: end }
        : { by: "enclosing", last: end },
      implied
    )
  }

  /** What a window from `start` to `end` would take, as it is drawn. */
  private windowPreview(
    start: Vec2,
    end: Vec2,
    rule: WindowRule,
    ctx: ToolContext
  ): readonly EntityId[] {
    const crossing =
      rule === "box"
        ? isCrossingBox(ctx.viewport, start, end)
        : rule === "crossing"
    return this.preview(
      this.found(ctx, (include) =>
        objectsInWindow(
          ctx.document,
          start,
          end,
          ctx.viewport,
          crossing,
          include
        )
      ),
      ctx
    )
  }

  private lassoPreview(lasso: Lasso, ctx: ToolContext): readonly EntityId[] {
    return this.preview(
      this.found(ctx, (include) =>
        lassoSelect(ctx.document, lasso, ctx.viewport, include)
      ),
      ctx
    )
  }

  /**
   * Of what a window or lasso finds, what the command would take that is not
   * yet in the set: what the hover would glow on.
   */
  private preview(
    found: readonly EntityId[],
    ctx: ToolContext
  ): readonly EntityId[] {
    const ids = this.options.accept?.(found, ctx) ?? found
    return ids.filter((id) => {
      const entity = ctx.document.get(id)
      return (
        entity !== undefined &&
        (this.options.one?.takesLocked === true ||
          !ctx.document.getLayer(entity.layerId)?.locked) &&
        !ctx.selection.has(id)
      )
    })
  }

  /**
   * The lasso's line, `Window Lasso  Press Spacebar to cycle options`, as it
   * starts and at each Space (desktop erase/d04-cl3).
   */
  private sayLasso(
    lasso: Lasso,
    ctx: ToolContext,
    kind: "gesture" | "info"
  ): void {
    ctx.report(ctx.text.message("lassoMode", { mode: lasso.mode }), kind)
  }

  /**
   * What a mode finds among the objects on layers that are on — the locked
   * ones too, which {@link select} counts and then leaves out, as AutoCAD
   * says it did.
   */
  private found(
    ctx: ToolContext,
    find: (include: (entity: Entity) => boolean) => EntityId[]
  ): EntityId[] {
    // WHY nothing in SUbobject: it takes the faces, edges and vertices of 3D
    // solids, surfaces and meshes, which no object here has; AutoCAD 2023's
    // console finds `0 found` on a line too.
    if (this.subobject) return []
    return find((entity) => ctx.document.isEntityVisible(entity))
  }

  /**
   * Adds the objects found to the set — or takes them from it, removing or
   * with Shift — and says so: `2 found (1 duplicate), 3 total`, then how many
   * were on a locked layer and what the command refuses, which stay out of
   * the set (said only when adding, erase/p243, p247). The total follows
   * what was found, refused or not (`1 found, 0 total`, p241).
   */
  private select(
    found: readonly EntityId[],
    subtract: boolean,
    how: AddedBy,
    ctx: ToolContext,
    find: ModeFind = ENCLOSING,
    implied = false,
    said = false
  ): void {
    const ids = this.options.accept?.(found, ctx) ?? found
    if (this.options.one) {
      this.takeOne(
        ids,
        said ? 0 : found.length - ids.length,
        this.options.one,
        find,
        implied || said,
        ctx
      )
      return
    }
    const removing = this.removing || subtract
    const sifted = removing ? null : this.sift(ids, ctx)
    const usable = sifted?.kept ?? ids
    const added: EntityId[] = []
    const removed: EntityId[] = []
    let duplicate = 0
    for (const id of usable) {
      if (removing) {
        if (!ctx.selection.has(id)) continue
        ctx.selection.remove(id)
        removed.push(id)
      } else if (ctx.selection.has(id)) {
        duplicate++
      } else {
        ctx.selection.add(id)
        added.push(id)
      }
    }
    const hasTotal = this.counted && found.length > 0
    if (ids.length > 0) this.operations.push({ added, removed })
    if (found.length > 0) this.counted = true
    ctx.answer(
      ctx.text.message("objectsFound", {
        found: ids.length,
        duplicate,
        removed: removed.length,
        total: ctx.selection.size,
        hasTotal: hasTotal ? "yes" : "no",
        box: "no",
      })
    )
    if (sifted) this.sayRefused(sifted, ctx)
    if (added.length > 0) this.options.onAdded?.(added, how, ctx, find)
    if (
      (this.single && ids.length > 0) ||
      (this.closesOnAdd && added.length > 0)
    )
      this.close(ctx)
  }

  /** What Previous or ALL found, after what a single object's pick says of it. */
  private selectNamed(found: readonly EntityId[], ctx: ToolContext): void {
    const said = this.options.one?.named?.(found, ctx) ?? false
    this.select(found, false, NAMED, ctx, ENCLOSING, false, said)
  }

  /**
   * What of `ids` can join the set: not what is on a locked layer, nor what
   * the command refuses — in that order, as each is said.
   */
  private sift(ids: readonly EntityId[], ctx: ToolContext): Sifted {
    const refuse = this.options.refuse
    const kept: EntityId[] = []
    let locked = 0
    let refused = 0
    for (const id of ids) {
      const entity = ctx.document.get(id)
      if (!entity) continue
      if (ctx.document.getLayer(entity.layerId)?.locked) locked++
      else if (refuse?.rejects(entity, ctx)) refused++
      else kept.push(id)
    }
    return { kept, locked, refused }
  }

  /**
   * Whether a pick at `screen` that took nothing is on an object of a locked
   * layer the command words ({@link ObjectSelectorOptions.locked}), said.
   */
  private saysLockedPick(
    screen: Vec2,
    subtract: boolean,
    ctx: ToolContext
  ): boolean {
    const message = this.options.locked
    if (!message || subtract || this.removing || this.subobject) return false
    if (!lockedObjectAt(screen, ctx)) return false
    ctx.report(ctx.text.message(message), "error")
    return true
  }

  /** The lines under a count: the locked layer's, then the command's. */
  private sayRefused(sifted: Sifted, ctx: ToolContext): void {
    const locked = this.options.locked
    for (let i = 0; locked && i < sifted.locked; i++) {
      ctx.report(ctx.text.message(locked), "error")
    }
    if (sifted.locked > 0 && !locked) {
      ctx.report(ctx.text.message("onLockedLayer", { count: sifted.locked }))
    }
    const refuse = this.options.refuse
    if (refuse && sifted.refused > 0) {
      ctx.report(ctx.text.message(refuse.message, { count: sifted.refused }))
    }
  }

  /**
   * One of `ids` for a single object's pick, or two for a {@link pair}, never
   * one on a locked layer, each of which says the command's {@link locked}
   * first. With none, how many the command left out (`1 was filtered out`,
   * ARRAYPATH's source at its path curve in AutoCAD 2023's console) or that
   * nothing was found (pieces/p101, p104), unless the command says nothing —
   * nor does a window a pick on nothing started (acc/bk20, bk48).
   */
  private takeOne(
    ids: readonly EntityId[],
    filtered: number,
    one: NonNullable<ObjectSelectorOptions["one"]>,
    find: ModeFind,
    implied: boolean,
    ctx: ToolContext
  ): void {
    const found = new Set(ids)
    const all = ctx.document
      .getEntities()
      .filter((entity) => found.has(entity.id))
    const inOrder = one.takesLocked
      ? all
      : all.filter((entity) => !ctx.document.getLayer(entity.layerId)?.locked)
    if (one.locked) {
      for (let i = inOrder.length; i < all.length; i++) {
        ctx.report(ctx.text.message(one.locked, { count: 1 }), "error")
      }
    }
    if (
      inOrder.length === 0 &&
      all.length > 0 &&
      (!one.locked || one.lockedAsksAgain)
    ) {
      ctx.requestRender()
      return
    }
    const taken = one.newest ? inOrder.at(-1) : inOrder[0]
    if (one.pair && inOrder.length > 1) {
      one.pair(
        inOrder[inOrder.length - 2],
        inOrder[inOrder.length - 1],
        ctx,
        find
      )
    } else if (taken) one.take(taken, ctx, find)
    else if (one.none) one.none(ctx, find)
    else if (one.silent) ctx.requestRender()
    else if (filtered > 0) {
      ctx.report(ctx.text.message("filteredOut", { count: filtered }))
    } else if (implied) ctx.requestRender()
    else {
      ctx.report(ctx.text.message("noObjectFound"))
      one.notFound?.(ctx)
    }
  }

  /**
   * Undo: the last selection is taken back, or there is none left; at
   * `Remove objects:` it asks `Select objects:` again (erase/p145, p156).
   */
  private undo(ctx: ToolContext): void {
    this.removing = false
    const last = this.operations.pop()
    if (!last) {
      ctx.report(ctx.text.message("allSelectionsUndone"))
      return
    }
    for (const id of last.added) ctx.selection.remove(id)
    for (const id of last.removed) ctx.selection.add(id)
    ctx.requestRender()
  }

  /**
   * Closes the set for the command, which then keeps it as the Previous one;
   * false when it is empty, which the command may say ({@link
   * ObjectSelectorOptions.noneFound}).
   */
  private close(ctx: ToolContext): boolean {
    this.backToObjects(ctx)
    if (ctx.selection.isEmpty()) {
      if (this.options.noneFound) {
        ctx.report(ctx.text.message(this.options.noneFound))
      }
      return false
    }
    if (!this.options.leavesPrevious) {
      ctx.rememberSelection(ctx.selection.toArray())
    }
    this.options.done(ctx)
    return true
  }

  private objectsQuestion(): PromptId {
    return this.removing
      ? "removeObjects"
      : (this.options.question?.() ?? "selectObjects")
  }

  /**
   * A wrong window: AutoCAD asks for its first corner again — or, for the
   * window a point on nothing started, for its opposite corner after the
   * prompt it started at, on one line: `Select objects: Specify opposite
   * corner:` (AutoCAD 2023's console, acc/sw1, sw5, sw10, sw11).
   */
  private refuseWindow(
    step: Extract<Step, { kind: "firstCorner" | "oppositeCorner" }>,
    ctx: ToolContext
  ): void {
    ctx.report(ctx.text.message("invalidWindowSpecification"))
    if (step.kind !== "oppositeCorner" || !step.implied) {
      this.step = { kind: "firstCorner", rule: step.rule }
    } else {
      ctx.report(ctx.text.prompt(this.objectsQuestion()), "prompt")
    }
    this.openPointInput(ctx)
  }

  private backToObjects(ctx: ToolContext): void {
    if (this.step.kind !== "objects") {
      // A single object's pick asks on in its keyword-only box.
      if (this.options.one)
        ctx.dynamicInput.open({ fields: [], commit: () => {} })
      else ctx.dynamicInput.close()
    }
    this.step = { kind: "objects", hover: null }
  }

  /**
   * The point box of a mode's prompt, so a typed coordinate answers it. A
   * number there is a direct distance, as AutoCAD 2023's console takes it
   * at W, C and BOX and after a point typed on nothing — the first corner
   * from LASTPOINT, the opposite one from the first (acc/wn13–wn17, as
   * ZOOM's wn1–wn6 show where) — and at a fence's or a polygon's points,
   * the first from LASTPOINT, the next from the point before (fn1–fn3).
   */
  private openPointInput(ctx: ToolContext): void {
    const step = this.step
    const from =
      step.kind === "oppositeCorner"
        ? step.start
        : step.kind === "fence" || step.kind === "polygon"
          ? step.points.at(-1)
          : undefined
    ctx.dynamicInput.open({
      fields: [{ id: "point", prompt: this.question(), kind: "coordinate" }],
      commit: () => {},
      commitRaw: (commitCtx) => this.commitTyped(commitCtx),
      directDistance: from ? { ...from, z: ctx.elevation } : "lastPoint",
    })
  }

  /**
   * A typed point. A corner that is not one asks for the window again, in
   * AutoCAD's words; a fence's or polygon's point is refused as the prompt's
   * input (`Invalid response.`). `@` is from the point before, the first
   * from LASTPOINT (erase/p149, p159, p160).
   */
  private commitTyped(ctx: ToolContext): boolean {
    const text = ctx.dynamicInput.getText("point").trim()
    if (text === "") return false
    const step = this.step
    const before =
      step.kind === "oppositeCorner"
        ? step.start
        : step.kind === "fence" || step.kind === "polygon"
          ? step.points.at(-1)
          : undefined
    const point = isCoordinateExpression(text)
      ? parseCoordinate(text, {
          lastPoint: before ? { ...before, z: ctx.elevation } : ctx.lastPoint,
          relativeByDefault: false,
          ucs: ctx.ucs,
          elevation: ctx.elevation,
        })
      : null
    if (point) {
      this.place({ x: point.x, y: point.y }, ctx)
      return true
    }
    if (step.kind === "firstCorner" || step.kind === "oppositeCorner") {
      this.refuseWindow(step, ctx)
      return true
    }
    return false
  }

  /** The point a mode's prompt takes: snapped, but not a click's window. */
  private pointOf(input: PointerInput): Vec2 {
    return this.wantsSnap()
      ? { x: input.point.x, y: input.point.y }
      : input.world
  }

  /** What the prompt takes, as {@link ObjectSelectorOptions.takes}. */
  private set(): QuestionInput {
    return this.options.takes?.() ?? "objects"
  }

  /** The modes typed at `Select objects:`, as its refusal lists them. */
  private offered(): readonly SelectionMode[] {
    if (this.options.modes) return this.options.modes
    if (this.subobject) return SUBOBJECT_MODES
    return this.set() === "objects" ? MODES : WHOLE_OBJECT_MODES
  }

  /** The object a pick takes, if the command can take it. */
  private pickAt(world: Vec2, ctx: ToolContext): Entity | null {
    if (this.subobject) return null
    const hit = ctx.pick(world)
    if (!hit) return null
    const accepted = this.options.accept?.([hit.id], ctx) ?? [hit.id]
    return accepted.length > 0 ? hit : null
  }

  /**
   * The object a click would add to the set — AutoCAD's selection preview.
   * Already-selected objects are skipped: they are drawn highlighted anyway.
   */
  private rolloverAt(world: Vec2, ctx: ToolContext): Entity | null {
    const hit = this.pickAt(world, ctx)
    return hit && !ctx.selection.has(hit.id) ? hit : null
  }
}

/**
 * What the ALL mode takes, and Ctrl+A's `_.SELECT _ALL`: every object, those
 * on Off and on locked layers too (clipboard/p126).
 */
export function allObjects(document: DocumentReader): EntityId[] {
  return document.getEntities().map((entity) => entity.id)
}

/** What the Last mode takes: the last object drawn that is visible. */
export function lastObject(ctx: ToolContext): Entity | undefined {
  return ctx.document
    .getEntities()
    .findLast((entity) => ctx.document.isEntityVisible(entity))
}
