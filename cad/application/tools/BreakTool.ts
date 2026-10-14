import { Vec2, V } from "../../geometry/Vec2"
import {
  arcSweepAngle,
  ArcEntity,
  carryPiece,
  CircleEntity,
  createArc,
  createLine,
  Entity,
  EntityId,
  LineEntity,
  readsInPlan,
} from "../../domain/entities"
import { normalizeAngle } from "../../geometry/primitives"
import { ScenePrimitive } from "../../scene/types"
import { THEME } from "../../scene/theme"
import { arcScenePrimitive, entityScenePrimitive } from "../SceneBuilder"
import {
  RemoveEntitiesCommand,
  ReplaceEntitiesCommand,
  UpdateEntityCommand,
} from "../commands/entityCommands"
import {
  isCoordinateExpression,
  parseCoordinate,
} from "../input/coordinateInput"
import type { PromptId } from "../../locales/types"
import { ONE_OBJECT_MODES, ObjectSelector } from "./objectSelection"
import {
  CommandOption,
  CommandOptionOutcome,
  PointerInput,
  QuestionInput,
  Tool,
  ToolContext,
} from "./Tool"

/**
 * BREAK and BREAKATPOINT. Two points on an object remove the piece between
 * them; the same point twice (BREAKATPOINT, or `@` at BREAK's second point)
 * splits it in place with no gap.
 *
 * As in AutoCAD, BREAK asks `Select object:` and the pick that selects it *is*
 * the first break point: `Specify second break point or [First point]:`, whose
 * keyword asks `Specify first break point:` and then `Specify second break
 * point:`; BREAKATPOINT asks `Specify break point:`. Points off the object are
 * pulled onto its nearest point, and a circle is broken counter-clockwise from
 * the first point to the second, leaving an arc.
 *
 * Polylines are not broken yet (EXPLODE them first).
 */
export type BreakMode = "gap" | "atPoint"

type BreakState =
  | { readonly phase: "select"; readonly hover: Entity | null }
  /** Re-picking the first break point after the `First point` keyword. */
  | { readonly phase: "first"; readonly target: Entity }
  | {
      readonly phase: "second"
      readonly target: Entity
      readonly first: Vec2
      readonly cursor: Vec2
      /** Whether the first point was given after `First point`, which asks no keyword. */
      readonly respecified: boolean
    }

/** Geometry a break leaves behind or takes away. */
type BreakGeom =
  | { readonly kind: "line"; readonly start: Vec2; readonly end: Vec2 }
  | {
      readonly kind: "arc"
      readonly center: Vec2
      readonly radius: number
      readonly startAngle: number
      readonly endAngle: number
    }

interface BreakResult {
  /** The surviving pieces — empty when the whole object is consumed. */
  readonly kept: readonly BreakGeom[]
  /** The piece taken away, for the preview; null for a gapless split. */
  readonly removed: BreakGeom | null
}

const PARAM_EPS = 1e-6
const ANGLE_EPS = 1e-6

export class BreakTool implements Tool {
  constructor(
    private readonly mode: BreakMode,
    readonly id: string
  ) {}

  private state: BreakState = { phase: "select", hover: null }
  /**
   * The selection modes typed at `Select object:`. What one finds has no pick
   * point, so the first break point is asked for; AutoCAD 2023's console takes
   * the oldest object found.
   */
  private readonly modes = new ObjectSelector({
    takes: () => "oneObject",
    done: () => {},
    question: () => "selectObject",
    modes: ONE_OBJECT_MODES,
    accept: (ids, ctx) =>
      ids.filter((id) => {
        const entity = ctx.document.get(id)
        return entity !== undefined && breakable(entity)
      }),
    one: {
      take: (entity, ctx) => this.askFirst(entity, ctx),
      newest: false,
      pick: (point, ctx) => this.pickObject(point, ctx),
    },
  })

  onActivate(ctx: ToolContext): void {
    this.state = { phase: "select", hover: null }
    this.modes.start()
    ctx.setCursor("crosshair")
    ctx.selection.clear()
  }

  onDeactivate(ctx: ToolContext): void {
    this.state = { phase: "select", hover: null }
    this.modes.start()
    ctx.dynamicInput.close()
  }

  question(): PromptId {
    switch (this.state.phase) {
      case "select":
        return this.modes.question()
      case "first":
        return this.mode === "atPoint"
          ? "specifyBreakPoint"
          : "specifyFirstBreakPoint"
      case "second":
        return this.state.respecified
          ? "specifySecondBreakPoint"
          : "specifySecondBreakPointOr"
    }
  }

  /**
   * `Select object:` is a set of one object, and the second break point keeps
   * its keyword's refusal even where the prompt lists none (AutoCAD 2023's
   * console).
   */
  takes(): QuestionInput {
    switch (this.state.phase) {
      case "select":
        return this.modes.takes()
      case "first":
        return "point"
      case "second":
        return { refusal: "pointOrKeywordRequired" }
    }
  }

  /**
   * The second break point is LASTPOINT, although its refusal is its own
   * (AutoCAD 2023's console, acc/bk31, bk35).
   */
  setsLastPoint(): boolean | null {
    return this.state.phase === "second" ? true : null
  }

  /** Object picking is by proximity; the break points themselves snap. */
  wantsSnap(): boolean {
    return this.state.phase !== "select" || this.modes.wantsSnap()
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    if (this.state.phase === "select" && this.modes.inMode()) {
      this.modes.onPointerMove(input, ctx)
      return
    }
    if (this.state.phase === "select") {
      const hover = this.pick(input.world, ctx)
      if (hover?.id !== this.state.hover?.id) {
        this.state = { phase: "select", hover: hover ?? null }
        ctx.requestRender()
      }
      return
    }
    if (this.state.phase === "second") {
      this.state = { ...this.state, cursor: input.point }
      ctx.requestRender()
    }
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return
    switch (this.state.phase) {
      case "select": {
        if (this.modes.inMode()) {
          this.modes.onPointerDown(input, ctx)
          return
        }
        this.pickObject(input.world, ctx)
        return
      }
      case "first":
        this.placeFirst(input.point, ctx)
        return
      case "second":
        this.commit(this.state.target, this.state.first, input.point, ctx)
    }
  }

  onPointerUp(input: PointerInput, ctx: ToolContext): void {
    if (this.state.phase === "select") this.modes.onPointerUp(input, ctx)
  }

  /** Enter in a mode's prompt is the mode's; at `Select object:` it ends. */
  onEnter(ctx: ToolContext): boolean {
    return (
      this.state.phase === "select" &&
      this.modes.inMode() &&
      this.modes.onEnter(ctx)
    )
  }

  answerTyped(text: string, ctx: ToolContext): boolean {
    return this.state.phase === "select" && this.modes.answerTyped(text, ctx)
  }

  commandOptions(): readonly CommandOption[] {
    if (this.state.phase === "select") return this.modes.commandOptions()
    if (this.state.phase !== "second" || this.state.respecified) return []
    return [{ id: "First point" }]
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    if (this.state.phase === "select") {
      return this.modes.invokeOption(id, ctx) ? "continue" : "unhandled"
    }
    if (
      id !== "First point" ||
      this.state.phase !== "second" ||
      this.state.respecified
    ) {
      return "unhandled"
    }
    this.askFirst(this.state.target, ctx)
    return "continue"
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    if (this.state.phase === "select") {
      if (this.modes.inMode()) return this.modes.buildOverlay(ctx)
      return this.state.hover ? this.highlight(this.state.hover, ctx) : []
    }

    const out: ScenePrimitive[] = this.highlight(this.state.target, ctx)
    if (this.state.phase === "second") {
      const result = computeBreak(
        this.state.target,
        this.state.first,
        this.state.cursor
      )
      if (result?.removed) {
        out.push(
          geomPrimitive(result.removed, ctx, {
            color: THEME.gripHot,
            width: 1.5,
            dash: [6, 4],
          })
        )
      }
    }
    return out
  }

  private highlight(entity: Entity, ctx: ToolContext): ScenePrimitive[] {
    return entityScenePrimitive(ctx.viewport, entity, {
      color: THEME.selected,
      width: 2,
    })
  }

  /** A breakable object in the UCS's XY plane, never one at an angle to it. */
  private pick(world: Vec2, ctx: ToolContext): Entity | null {
    const hit = ctx.pick(world)
    return hit && breakable(hit) ? hit : null
  }

  /**
   * The pick at `Select object:`, clicked or typed — AutoCAD 2023's console
   * takes a typed point as a pick there (acc/bk1–bk11, bk31–bk38): on nothing
   * `No object found` and the prompt again; BREAK's pick is its first break
   * point, BREAKATPOINT asks for its break point separately.
   */
  private pickObject(world: Vec2, ctx: ToolContext): void {
    const hit = this.pick(world, ctx)
    if (!hit) ctx.report(ctx.text.message("noObjectFound"))
    else if (this.mode === "atPoint") this.askFirst(hit, ctx)
    else this.askSecond(hit, { x: world.x, y: world.y }, false, ctx)
  }

  private askFirst(target: Entity, ctx: ToolContext): void {
    this.state = { phase: "first", target }
    this.openPointInput(ctx)
  }

  private askSecond(
    target: Entity,
    first: Vec2,
    respecified: boolean,
    ctx: ToolContext
  ): void {
    this.state = { phase: "second", target, first, cursor: first, respecified }
    this.openPointInput(ctx)
  }

  private placeFirst(point: Vec2, ctx: ToolContext): void {
    if (this.state.phase !== "first") return
    if (this.mode === "atPoint") {
      this.commit(this.state.target, point, point, ctx)
    } else {
      this.askSecond(this.state.target, point, true, ctx)
    }
  }

  /** A break point, picked or typed (`@` at the second: the first point again). */
  private openPointInput(ctx: ToolContext): void {
    ctx.dynamicInput.open({
      fields: [{ id: "point", kind: "coordinate" }],
      commit: () => {},
      commitRaw: (commitCtx) => this.commitTypedPoint(commitCtx),
    })
    ctx.requestRender()
  }

  private commitTypedPoint(ctx: ToolContext): boolean {
    const text = ctx.dynamicInput.getText("point").trim()
    if (!isCoordinateExpression(text)) return false
    const last = this.state.phase === "second" ? this.state.first : null
    const point = parseCoordinate(text, {
      lastPoint: last ?? ctx.lastPoint,
      relativeByDefault: last !== null,
      ucs: ctx.ucs,
      elevation: ctx.elevation,
    })
    if (!point) return false
    if (this.state.phase === "first") this.placeFirst(point, ctx)
    else if (this.state.phase === "second") {
      this.commit(this.state.target, this.state.first, point, ctx)
    }
    return true
  }

  private commit(
    target: Entity,
    first: Vec2,
    second: Vec2,
    ctx: ToolContext
  ): void {
    const result = computeBreak(target, first, second)
    if (!result) {
      ctx.endCommand()
      return
    }
    // The piece from the object's start, listed first, is the object kept
    // (its handle; a circle's one arc too), the other a new one, which Last
    // then finds — AutoCAD 2023's console (acc/hd9–hd13, hd16–hd18).
    const pieces = result.kept.map((geom, i) =>
      toEntity(target, geom, i === 0 ? target.id : undefined)
    )
    if (pieces.length === 0) {
      ctx.execute(new RemoveEntitiesCommand([target.id]))
    } else if (pieces.length === 1) {
      ctx.execute(new UpdateEntityCommand(pieces[0]))
    } else {
      ctx.execute(new ReplaceEntitiesCommand([target.id], pieces))
    }
    ctx.endCommand()
  }
}

function breakable(entity: Entity): boolean {
  return entity.type !== "polyline" && readsInPlan(entity)
}

function toEntity(source: Entity, geom: BreakGeom, id?: EntityId): Entity {
  const entity =
    geom.kind === "line"
      ? createLine(geom.start, geom.end, source.layerId, id)
      : createArc(
          geom.center,
          geom.radius,
          geom.startAngle,
          geom.endAngle,
          source.layerId,
          id
        )
  return carryPiece(source, entity)
}

function geomPrimitive(
  geom: BreakGeom,
  ctx: ToolContext,
  stroke: { color: string; width: number; dash?: number[] }
): ScenePrimitive {
  if (geom.kind === "line") {
    return {
      kind: "segment",
      a: ctx.viewport.worldToScreen(geom.start),
      b: ctx.viewport.worldToScreen(geom.end),
      stroke,
    }
  }
  return arcScenePrimitive(
    ctx.viewport,
    geom.center,
    geom.radius,
    geom.startAngle,
    geom.endAngle,
    stroke
  )
}

/** The pieces a break at `first`/`second` leaves, or null when it does nothing. */
function computeBreak(
  entity: Entity,
  first: Vec2,
  second: Vec2
): BreakResult | null {
  switch (entity.type) {
    case "line":
      return breakLine(entity, first, second)
    case "arc":
      return breakArc(entity, first, second)
    case "circle":
      return breakCircle(entity, first, second)
    case "ellipse":
    case "spline":
    case "polyline":
    case "text":
    case "mtext":
    case "attdef":
    case "dimension":
    case "hatch":
    case "insert":
      return null
  }
}

function breakLine(
  line: LineEntity,
  first: Vec2,
  second: Vec2
): BreakResult | null {
  const t1 = paramOnLine(line, first)
  const t2 = paramOnLine(line, second)
  const ta = Math.min(t1, t2)
  const tb = Math.max(t1, t2)
  const at = (t: number) =>
    V.add(line.start, V.scale(V.sub(line.end, line.start), t))

  if (tb - ta < PARAM_EPS) {
    // A gapless split: only meaningful away from the ends.
    if (ta < PARAM_EPS || ta > 1 - PARAM_EPS) return null
    return {
      kept: [
        { kind: "line", start: line.start, end: at(ta) },
        { kind: "line", start: at(ta), end: line.end },
      ],
      removed: null,
    }
  }

  const kept: BreakGeom[] = []
  if (ta > PARAM_EPS) {
    kept.push({ kind: "line", start: line.start, end: at(ta) })
  }
  if (tb < 1 - PARAM_EPS) {
    kept.push({ kind: "line", start: at(tb), end: line.end })
  }
  return { kept, removed: { kind: "line", start: at(ta), end: at(tb) } }
}

function breakArc(
  arc: ArcEntity,
  first: Vec2,
  second: Vec2
): BreakResult | null {
  const sweep = arcSweepAngle(arc)
  const o1 = offsetAlongSweep(arc, first, sweep)
  const o2 = offsetAlongSweep(arc, second, sweep)
  const oa = Math.min(o1, o2)
  const ob = Math.max(o1, o2)
  const at = (offset: number) => normalizeAngle(arc.startAngle + offset)

  if (ob - oa < ANGLE_EPS) {
    if (oa < ANGLE_EPS || oa > sweep - ANGLE_EPS) return null
    return {
      kept: [
        arcGeom(arc, arc.startAngle, at(oa)),
        arcGeom(arc, at(oa), arc.endAngle),
      ],
      removed: null,
    }
  }

  const kept: BreakGeom[] = []
  if (oa > ANGLE_EPS) kept.push(arcGeom(arc, arc.startAngle, at(oa)))
  if (ob < sweep - ANGLE_EPS) kept.push(arcGeom(arc, at(ob), arc.endAngle))
  return { kept, removed: arcGeom(arc, at(oa), at(ob)) }
}

/**
 * Breaking a circle removes the arc running counter-clockwise from the first
 * point to the second, so what survives is the complementary arc — AutoCAD's
 * rule, and the reason picking order matters on a circle.
 */
function breakCircle(
  circle: CircleEntity,
  first: Vec2,
  second: Vec2
): BreakResult | null {
  const a1 = angleAt(circle.center, first)
  const a2 = angleAt(circle.center, second)
  const removedSweep = normalizeAngle(a2 - a1)
  if (removedSweep < ANGLE_EPS) return null

  return {
    kept: [
      {
        kind: "arc",
        center: circle.center,
        radius: circle.radius,
        startAngle: a2,
        endAngle: a1,
      },
    ],
    removed: {
      kind: "arc",
      center: circle.center,
      radius: circle.radius,
      startAngle: a1,
      endAngle: a2,
    },
  }
}

function arcGeom(
  arc: ArcEntity,
  startAngle: number,
  endAngle: number
): BreakGeom {
  return {
    kind: "arc",
    center: arc.center,
    radius: arc.radius,
    startAngle,
    endAngle,
  }
}

function paramOnLine(line: LineEntity, p: Vec2): number {
  const dir = V.sub(line.end, line.start)
  const lenSq = V.lengthSq(dir)
  if (lenSq === 0) return 0
  const t = V.dot(V.sub(p, line.start), dir) / lenSq
  return Math.max(0, Math.min(1, t))
}

/**
 * How far along the arc's sweep a point lies, in radians from its start angle.
 * A point in the gap outside the sweep falls back to whichever end it is
 * nearer, which is how AutoCAD pulls an off-object pick onto the object.
 */
function offsetAlongSweep(arc: ArcEntity, p: Vec2, sweep: number): number {
  const offset = normalizeAngle(angleAt(arc.center, p) - arc.startAngle)
  if (offset <= sweep) return offset
  return offset - sweep < Math.PI * 2 - offset ? sweep : 0
}

function angleAt(center: Vec2, p: Vec2): number {
  return Math.atan2(p.y - center.y, p.x - center.x)
}
