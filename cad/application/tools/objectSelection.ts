import { Vec2 } from "../../geometry/Vec2"
import { Entity, EntityId } from "../../domain/entities"
import { ScenePrimitive } from "../../scene/types"
import { THEME } from "../../scene/theme"
import { entityScenePrimitive } from "../SceneBuilder"
import {
  isCoordinateExpression,
  parseCoordinate,
} from "../input/coordinateInput"
import type { PromptId } from "../../locales/types"
import {
  buildFenceOverlay,
  buildSelectionBoxOverlay,
  buildSelectionPolygonOverlay,
  crossesPolygonEdges,
  isCrossingBox,
  objectsInPolygon,
  objectsInWindow,
  objectsOnFence,
} from "./boxSelection"
import { CommandOption, PointerInput, QuestionInput, ToolContext } from "./Tool"

/** Screen-pixel movement past which a press-drag becomes a box selection. */
const DRAG_THRESHOLD_PX = 4

/**
 * The selection modes `Select objects:` takes — typed, never listed in its
 * prompt. Group, Multiple, SUbobject and Object are not offered.
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
] as const

export type SelectionMode = (typeof MODES)[number]

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
  /** A press at `Select objects:`: a pick, or the drag of a window. */
  | {
      readonly kind: "pressed"
      readonly start: Vec2
      readonly startScreen: Vec2
      readonly current: Vec2
      /** Shift held: what the gesture finds is removed from the set. */
      readonly subtract: boolean
    }
  | {
      readonly kind: "dragging"
      readonly start: Vec2
      readonly current: Vec2
      readonly subtract: boolean
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
  /** How the command asks for the set, when not `Select objects`. */
  readonly question?: () => PromptId
  /**
   * The objects of those found the command can take; the rest are neither
   * counted nor highlighted (DIMSPACE's parallel dimensions, HATCH's areas).
   */
  readonly accept?: (
    ids: readonly EntityId[],
    ctx: ToolContext
  ) => readonly EntityId[]
  /**
   * Called as objects join the set, with the outline of the window or
   * polygon that took them, or null (a pick, a fence, Last…): STRETCH's
   * frames.
   */
  readonly onAdded?: (
    ids: readonly EntityId[],
    frame: readonly Vec2[] | null,
    ctx: ToolContext
  ) => void
  /** The modes the prompt takes; all of them by default. */
  readonly modes?: readonly SelectionMode[]
  /**
   * A single object's pick rather than a set: what a mode finds is not added
   * to the selection nor counted, the command takes one of it — the oldest or
   * the newest in the drawing, as its pick in AutoCAD 2023's console does —
   * and finding none says `No object found`. The pick itself stays the
   * command's, which hands the selector only the modes ({@link inMode}).
   */
  readonly one?: {
    readonly take: (entity: Entity, ctx: ToolContext) => void
    readonly newest: boolean
  }
}

/**
 * AutoCAD's `Select objects:` — what every command that takes a selection set
 * asks it with, shared so each one takes the same answers: a pick, a window
 * dragged or clicked from a point on nothing, and the modes typed there
 * (Window, Crossing, BOX, Last, ALL, Fence, WPolygon, CPolygon, Previous,
 * Remove and Add, Undo, AUto, SIngle). Each says what it found on the line
 * AutoCAD says it, in its words (`1 found (1 duplicate), 2 total`).
 */
export class ObjectSelector {
  private step: Step = { kind: "objects", hover: null }
  /** Remove's `Remove objects:` until Add. */
  private removing = false
  /** SIngle: the first selection that finds anything closes the set. */
  private single = false
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
    this.operations = []
    this.counted = false
  }

  question(): PromptId {
    switch (this.step.kind) {
      case "objects":
      case "pressed":
      case "dragging":
        return this.removing
          ? "removeObjects"
          : (this.options.question?.() ?? "selectObjects")
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
   * What the question takes: `set` at `Select objects:` (what its refusal
   * lists differs per command), a point at the modes' own prompts.
   */
  takes(set: QuestionInput): QuestionInput {
    switch (this.step.kind) {
      case "firstCorner":
      case "oppositeCorner":
        return { refusal: "invalidWindowSpecification" }
      case "fence":
      case "polygon":
        return { refusal: "invalidResponse" }
      default:
        return set
    }
  }

  commandOptions(): readonly CommandOption[] {
    switch (this.step.kind) {
      case "objects":
      case "pressed":
      case "dragging":
        return (this.options.modes ?? MODES).map((id) => ({
          id,
          hidden: true,
          prompt: "selectObjects",
        }))
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
    if (!(this.options.modes ?? MODES).some((mode) => mode === id)) return false
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
        const last = ctx.document
          .getEntities()
          .findLast((entity) => ctx.document.isEntityVisible(entity))
        this.select(last ? [last.id] : [], false, null, false, ctx)
        return true
      }
      case "ALL":
        this.select(
          ctx.document.getEntities().map((entity) => entity.id),
          false,
          null,
          false,
          ctx
        )
        return true
      case "Previous": {
        const previous = ctx
          .previousSelection()
          .filter((id) => ctx.document.get(id) !== undefined)
        if (previous.length === 0) {
          ctx.report(ctx.text.message("noPreviousSelection"))
        } else {
          this.select(previous, false, null, false, ctx)
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
      default:
        return false
    }
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
        this.step =
          moved >= DRAG_THRESHOLD_PX
            ? {
                kind: "dragging",
                start: step.start,
                current: input.world,
                subtract: step.subtract,
              }
            : { ...step, current: input.world }
        break
      }
      case "dragging":
        this.step = { ...step, current: input.world }
        break
      case "oppositeCorner":
        this.step = { ...step, current: this.pointOf(input) }
        break
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
      const hit = this.pickAt(input.world, ctx)
      if (under && !hit) {
        // An object the command cannot take: it never highlighted, and being
        // under the pick it starts no window either.
        this.step = { kind: "objects", hover: null }
      } else if (hit) {
        this.step = { kind: "objects", hover: null }
        this.select([hit.id], step.subtract, null, false, ctx)
        this.step = {
          kind: "objects",
          hover: this.rolloverAt(input.world, ctx),
        }
      } else {
        // A pick on nothing starts a window, finished by the next one.
        this.step = {
          kind: "oppositeCorner",
          rule: "box",
          start: step.start,
          current: input.world,
          implied: true,
          subtract: step.subtract,
        }
        this.openPointInput(ctx)
      }
      ctx.requestRender()
      return
    }
    if (step.kind === "dragging") {
      this.step = { kind: "objects", hover: null }
      this.selectWindow(
        step.start,
        step.current,
        "box",
        step.subtract,
        true,
        ctx
      )
      ctx.requestRender()
    }
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
      case "dragging":
        return true
      case "firstCorner":
      case "oppositeCorner":
        this.refuseWindow(step.rule, ctx)
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
          null,
          false,
          ctx
        )
        return true
      }
      case "polygon": {
        if (step.points.length < 3) return this.close(ctx)
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
          step.crossing ? step.points : null,
          false,
          ctx
        )
        return true
      }
    }
  }

  /** Whether a mode's own prompt is asking: a window's corner, a fence's point. */
  inMode(): boolean {
    const kind = this.step.kind
    return kind !== "objects" && kind !== "pressed" && kind !== "dragging"
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

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    const step = this.step
    switch (step.kind) {
      case "objects":
        return step.hover
          ? entityScenePrimitive(
              ctx.viewport,
              step.hover,
              { color: THEME.entityHover, width: 2 },
              {
                blocks: ctx.blocks,
                dimStyle:
                  step.hover.type === "dimension"
                    ? ctx.document.getDimStyle(step.hover.styleId)
                    : undefined,
              }
            )
          : []
      case "dragging":
        return buildSelectionBoxOverlay(ctx.viewport, step.start, step.current)
      case "oppositeCorner":
        return buildSelectionBoxOverlay(
          ctx.viewport,
          step.start,
          step.current,
          step.rule === "box" ? undefined : step.rule === "crossing"
        )
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
          false,
          ctx
        )
        return
      case "fence":
        this.step = { ...step, points: [...step.points, point] }
        this.openPointInput(ctx)
        return
      case "polygon": {
        const last = step.points.at(-1)
        if (last && last.x === point.x && last.y === point.y) {
          ctx.report(ctx.text.message("polygonSegmentZeroLength"))
          return
        }
        const first = step.points[0]
        if (
          last &&
          (crossesPolygonEdges(step.points, last, point) ||
            (step.points.length > 1 &&
              crossesPolygonEdges(step.points, point, first)))
        ) {
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
    dragged: boolean,
    ctx: ToolContext
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
    this.select(found, subtract, frame, dragged, ctx)
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
    return find((entity) => ctx.document.isEntityVisible(entity))
  }

  /**
   * Adds the objects found to the set — or takes them from it, removing or
   * with Shift — and says so: `2 found (1 duplicate), 3 total`, then how many
   * were on a locked layer. `dragged` puts the window's own prompt first, on
   * the line its press answered.
   */
  private select(
    found: readonly EntityId[],
    subtract: boolean,
    frame: readonly Vec2[] | null,
    dragged: boolean,
    ctx: ToolContext
  ): void {
    const ids = this.options.accept?.(found, ctx) ?? found
    if (this.options.one) {
      this.takeOne(ids, found.length - ids.length, this.options.one, ctx)
      return
    }
    const locked = new Set(
      ids.filter((id) => {
        const entity = ctx.document.get(id)
        return entity && ctx.document.getLayer(entity.layerId)?.locked
      })
    )
    const usable = ids.filter((id) => !locked.has(id))
    const removing = this.removing || subtract
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
    const hasTotal = this.counted
    if (ids.length > 0) {
      this.operations.push({ added, removed })
      this.counted = true
    }
    ctx.answer(
      ctx.text.message("objectsFound", {
        found: ids.length,
        duplicate,
        removed: removed.length,
        total: ctx.selection.size,
        hasTotal: hasTotal ? "yes" : "no",
        box: dragged ? "yes" : "no",
      })
    )
    if (locked.size > 0) {
      ctx.report(ctx.text.message("onLockedLayer", { count: locked.size }))
    }
    if (!removing && usable.length > 0)
      this.options.onAdded?.(usable, frame, ctx)
    if (this.single && ids.length > 0) this.close(ctx)
  }

  /**
   * One of `ids` for a single object's pick; with none, how many the command
   * left out (`1 was filtered out`, ARRAYPATH's source at its path curve in
   * AutoCAD 2023's console) or that nothing was found.
   */
  private takeOne(
    ids: readonly EntityId[],
    filtered: number,
    one: NonNullable<ObjectSelectorOptions["one"]>,
    ctx: ToolContext
  ): void {
    const found = new Set(ids)
    const inOrder = ctx.document
      .getEntities()
      .filter((entity) => found.has(entity.id))
    const taken = one.newest ? inOrder.at(-1) : inOrder[0]
    if (taken) one.take(taken, ctx)
    else if (filtered > 0) {
      ctx.report(ctx.text.message("filteredOut", { count: filtered }))
    } else ctx.report(ctx.text.message("noObjectFound"))
  }

  /** Undo: the last selection is taken back, or there is none left. */
  private undo(ctx: ToolContext): void {
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
   * false when it is empty.
   */
  private close(ctx: ToolContext): boolean {
    this.backToObjects(ctx)
    if (ctx.selection.isEmpty()) return false
    ctx.rememberSelection(ctx.selection.toArray())
    this.options.done(ctx)
    return true
  }

  /** A wrong window: AutoCAD asks for its first corner again. */
  private refuseWindow(rule: WindowRule, ctx: ToolContext): void {
    ctx.report(ctx.text.message("invalidWindowSpecification"))
    this.step = { kind: "firstCorner", rule }
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

  /** The point box of a mode's prompt, so a typed coordinate answers it. */
  private openPointInput(ctx: ToolContext): void {
    ctx.dynamicInput.open({
      fields: [{ id: "point", prompt: this.question(), kind: "coordinate" }],
      commit: () => {},
      commitRaw: (commitCtx) => this.commitTyped(commitCtx),
    })
  }

  /**
   * A typed point. A corner that is not one asks for the window again, in
   * AutoCAD's words; a fence's or polygon's point is refused as the prompt's
   * input (`Invalid response.`).
   */
  private commitTyped(ctx: ToolContext): boolean {
    const text = ctx.dynamicInput.getText("point").trim()
    if (text === "") return false
    const step = this.step
    const last =
      step.kind === "oppositeCorner"
        ? step.start
        : step.kind === "fence" || step.kind === "polygon"
          ? (step.points.at(-1) ?? null)
          : null
    const point = isCoordinateExpression(text)
      ? parseCoordinate(text, {
          lastPoint: last ? { ...last, z: ctx.elevation } : null,
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
      this.refuseWindow(step.rule, ctx)
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

  /** The object a pick takes, if the command can take it. */
  private pickAt(world: Vec2, ctx: ToolContext): Entity | null {
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
 * Objects selected before the command, counted after its echo as AutoCAD
 * counts them (`Command: M MOVE 3 found`), and kept as the Previous set.
 */
export function countPreselection(ctx: ToolContext): void {
  ctx.rememberSelection(ctx.selection.toArray())
  ctx.answer(
    ctx.text.message("objectsFound", {
      found: ctx.selection.size,
      duplicate: 0,
      removed: 0,
      total: 0,
      hasTotal: "no",
      box: "no",
    })
  )
}
