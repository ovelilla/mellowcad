import { Vec2 } from "../../geometry/Vec2"
import {
  Vec3,
  add3,
  cross3,
  dot3,
  length3,
  normalize3,
  scale3,
  sub3,
} from "../../geometry/Vec3"
import {
  Entity,
  Similarity3,
  entityWorldBox,
  transformEntity,
} from "../../domain/entities"
import { WORLD_UCS, Ucs } from "../../domain/ucs"
import { parseAngleDegrees } from "../../domain/units"
import { ScenePrimitive } from "../../scene/types"
import { UpdateEntitiesCommand } from "../commands/entityCommands"
import { GizmoAxes, GizmoAxis, rotateGizmo, rotateGizmoHit } from "../gizmos"
import {
  isCoordinateExpression,
  parseCoordinate,
} from "../input/coordinateInput"
import { RotateTool } from "./RotateTool"
import { selectedInDrawingOrder } from "./drawingOrder"
import { SubobjectRef } from "../../domain/solidSubobjects"
import {
  PartGhosts,
  partsOf,
  reshapedOwners,
  sayUnreshaped,
} from "./subobjectSet"
import { transformDrag } from "./transformDrag"
import {
  CommandOption,
  CommandOptionOutcome,
  PointerInput,
  QuestionInput,
  ToolContext,
  ToolQuestion,
} from "./Tool"
import type { PromptId } from "../../locales/types"

/**
 * What turns, read once as the axis is picked: nothing is committed until
 * the turn, so the set stays what it was through the drag.
 */
interface TurnedSet {
  readonly originals: readonly Entity[]
  readonly refs: readonly SubobjectRef[]
  readonly owners: readonly Entity[]
}

/** 3DROTATE's own prompts, once the base point is given off the plan. */
type Turning =
  | {
      readonly phase: "axis"
      readonly base: Vec3
      readonly hover: GizmoAxis | null
    }
  | {
      readonly phase: "start"
      readonly base: Vec3
      readonly axis: GizmoAxis
      readonly set: TurnedSet
    }
  | {
      readonly phase: "end"
      readonly base: Vec3
      readonly axis: GizmoAxis
      readonly set: TurnedSet
      readonly start: Vec3
      readonly current: Vec3
    }

/**
 * AutoCAD's 3DROTATE. In plan it asks as ROTATE asks (3drotate/p06); in a
 * view that is not a plan, after `Current positive angle in UCS:` and the
 * objects, the 3D Rotate gizmo — a ring about each axis — follows the cursor
 * at `Specify base point:`, Enter leaving it where it is (desktop
 * 3drotate/d01; the console's Enter goes on, p03); `Pick a rotation axis:`
 * takes only a click on a ring, which turns yellow under the cursor with its
 * axis drawn through the centre (d01-2; the console refuses anything typed,
 * `Invalid 2D point.`, p01–p05); `Specify angle start point or type an
 * angle:` turns the set by an angle typed, right-handed about the axis (d01:
 * 30 about X), or takes a point and asks `Specify angle end point:`, the turn
 * from the one to the other about the axis. As 3DMOVE, `Regenerating
 * model.` as it ends in a 3D view in 2D Wireframe.
 */
export class Rotate3dTool extends RotateTool {
  readonly id: string = "rotate3d"
  readonly shortcut: string = "3r"

  private turning: Turning | null = null
  private cursor: Vec3 | null = null
  /** Where the pointer was as the base point was first asked. */
  private restingAt: Vec2 | null = null
  private regenerates = false
  private lastPointerScreen: Vec2 | null = null
  private readonly turnGhosts = new PartGhosts()

  onActivate(ctx: ToolContext): void {
    this.turning = null
    this.cursor = null
    this.restingAt = null
    this.turnGhosts.reset()
    this.regenerates =
      !ctx.viewport.isPlan &&
      ctx.document.getSettings().visualStyle === "2dWireframe"
    super.onActivate(ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    this.turning = null
    super.onDeactivate(ctx)
    if (this.regenerates) ctx.regenerate("once")
    this.regenerates = false
  }

  /**
   * Off the plan the base point opens 3DROTATE's own prompts: a click, a
   * point typed or Enter, which keeps the gizmo where the cursor left it, or
   * at the set's centre before it moved.
   */
  protected tookPivot(base: Vec3 | null, ctx: ToolContext): boolean {
    if (ctx.viewport.isPlan) return false
    const at = base ?? this.cursor ?? this.center(ctx)
    if (!at) return false
    ctx.setLastPoint(at)
    this.turning = { phase: "axis", base: at, hover: null }
    ctx.dynamicInput.open({ fields: [], commit: () => {} })
    if (this.lastPointerScreen)
      ctx.dynamicInput.setPosition(this.lastPointerScreen)
    ctx.requestRender()
    return true
  }

  /**
   * The cursor the gizmo follows at `Specify base point:`: none till the
   * pointer leaves where it rested as the prompt opened (the runtime replays
   * it then), so Enter keeps the gizmo at the set's centre.
   */
  private followBasePrompt(input: PointerInput): void {
    if (this.turning || this.question() !== "specifyBasePoint") {
      this.restingAt = null
      this.cursor = null
      return
    }
    if (!this.restingAt) {
      this.restingAt = input.screen
      return
    }
    if (
      this.cursor ||
      input.screen.x !== this.restingAt.x ||
      input.screen.y !== this.restingAt.y
    ) {
      this.cursor = input.point
    }
  }

  /**
   * An angle's point: a snap's, else where the line of sight meets the
   * ring's plane, through the base across the axis, as the cursor on the
   * work plane turns nothing about an axis lying in it. Edge-on, the work
   * plane's.
   */
  private onRing(
    turning: { readonly base: Vec3; readonly axis: GizmoAxis },
    input: PointerInput,
    ctx: ToolContext
  ): Vec3 {
    if (input.snap !== null) return input.point
    const normal = this.axes(ctx)[turning.axis]
    const w = ctx.viewport.direction
    const facing = dot3(w, normal)
    if (Math.abs(facing) < 1e-9) return input.point
    const through = ctx.viewport.screenToFacing(input.screen)
    const t = dot3(sub3(turning.base, through), normal) / facing
    return add3(through, scale3(w, t))
  }

  private axes(ctx: ToolContext): GizmoAxes {
    const wcs: Ucs = ctx.ucs.wcs ?? WORLD_UCS
    const z = normalize3(cross3(wcs.xAxis, wcs.yAxis)) ?? { x: 0, y: 0, z: 1 }
    return { x: wcs.xAxis, y: wcs.yAxis, z }
  }

  private center(ctx: ToolContext): Vec3 | null {
    const originals = selectedInDrawingOrder(ctx)
    const { owners } = partsOf(ctx, true, originals)
    let min: Vec3 | null = null
    let max: Vec3 | null = null
    for (const entity of [...originals, ...owners]) {
      const box = entityWorldBox(entity, ctx.blocks)
      if (!box) continue
      min = min
        ? {
            x: Math.min(min.x, box.min.x),
            y: Math.min(min.y, box.min.y),
            z: Math.min(min.z, box.min.z),
          }
        : box.min
      max = max
        ? {
            x: Math.max(max.x, box.max.x),
            y: Math.max(max.y, box.max.y),
            z: Math.max(max.z, box.max.z),
          }
        : box.max
    }
    return min && max ? scale3(add3(min, max), 0.5) : null
  }

  question(): PromptId | ToolQuestion {
    switch (this.turning?.phase) {
      case "axis":
        return "pickRotationAxis"
      case "start":
        return "specifyAngleStartPointOrAngle"
      case "end":
        return "specifyAngleEndPoint"
      default:
        return super.question()
    }
  }

  takes(): QuestionInput | null {
    if (this.turning?.phase === "axis") return { refusal: "invalidPoint2d" }
    return this.turning ? null : super.takes()
  }

  commandOptions(): readonly CommandOption[] {
    return this.turning ? [] : super.commandOptions()
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    return this.turning ? "unhandled" : super.invokeOption(id, ctx)
  }

  wantsSnap(): boolean {
    if (this.turning?.phase === "axis") return false
    return this.turning ? true : super.wantsSnap()
  }

  /**
   * The angle's points are read on the ring's plane, which Ortho, bending
   * the cursor on the work plane, knows nothing of.
   */
  getConstraintAnchor(): Vec2 | null {
    return this.turning ? null : super.getConstraintAnchor()
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastPointerScreen = input.screen
    this.followBasePrompt(input)
    const turning = this.turning
    if (turning?.phase === "axis") {
      const hover = rotateGizmoHit(
        ctx.viewport,
        turning.base,
        this.axes(ctx),
        input.screen
      )
      if (hover !== turning.hover) this.turning = { ...turning, hover }
      ctx.dynamicInput.setPosition(input.screen)
      ctx.requestRender()
      return
    }
    if (turning?.phase === "end") {
      this.turning = { ...turning, current: this.onRing(turning, input, ctx) }
      ctx.dynamicInput.setPosition(input.screen)
      ctx.requestRender()
      return
    }
    if (turning) {
      ctx.dynamicInput.setPosition(input.screen)
      ctx.requestRender()
      return
    }
    super.onPointerMove(input, ctx)
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return
    const turning = this.turning
    switch (turning?.phase) {
      case "axis": {
        const axis = rotateGizmoHit(
          ctx.viewport,
          turning.base,
          this.axes(ctx),
          input.screen
        )
        if (!axis) {
          ctx.report(ctx.text.message("invalidPoint2d"))
          return
        }
        const originals = selectedInDrawingOrder(ctx)
        const { refs, owners } = partsOf(ctx, true, originals)
        this.turning = {
          phase: "start",
          base: turning.base,
          axis,
          set: { originals, refs, owners },
        }
        this.turnGhosts.reset()
        this.openAngleBox(ctx)
        return
      }
      case "start":
        this.startAt(turning, this.onRing(turning, input, ctx), ctx)
        return
      case "end":
        this.turn(
          this.angleBetween(turning, this.onRing(turning, input, ctx), ctx),
          ctx
        )
        return
      default:
        super.onPointerDown(input, ctx)
    }
  }

  private openAngleBox(ctx: ToolContext): void {
    ctx.dynamicInput.open({
      fields: [{ id: "angle", prompt: "angle", kind: "angle" }],
      commit: (values, commitCtx) => {
        if (values.angle !== undefined) {
          this.turn((values.angle * Math.PI) / 180, commitCtx)
        }
      },
      commitRaw: (commitCtx) => this.commitTurnAngle(commitCtx),
    })
    if (this.lastPointerScreen)
      ctx.dynamicInput.setPosition(this.lastPointerScreen)
    ctx.requestRender()
  }

  /**
   * An angle typed at the start point's prompt: the turn, in degrees (d01:
   * 30); a point typed there is the start point.
   */
  private commitTurnAngle(ctx: ToolContext): boolean {
    const turning = this.turning
    if (turning?.phase !== "start") return false
    const text = ctx.dynamicInput.getText("angle").trim()
    if (isCoordinateExpression(text) && text.includes(",")) {
      const point = this.typedPoint(text, ctx)
      if (!point) return false
      this.startAt(turning, point, ctx)
      return true
    }
    const degrees = parseAngleDegrees(text)
    if (degrees === null) return false
    this.turn((degrees * Math.PI) / 180, ctx)
    return true
  }

  private typedPoint(text: string, ctx: ToolContext): Vec3 | null {
    return parseCoordinate(text, {
      lastPoint: ctx.lastPoint,
      relativeByDefault: false,
      ucs: ctx.ucs,
      elevation: ctx.elevation,
    })
  }

  /** The angle's start point: `Specify angle end point:` follows. */
  private startAt(
    turning: Extract<Turning, { phase: "start" }>,
    start: Vec3,
    ctx: ToolContext
  ): void {
    this.turning = {
      phase: "end",
      base: turning.base,
      axis: turning.axis,
      set: turning.set,
      start,
      current: start,
    }
    // A point answered, though the box was the angle's: `@` at the end
    // point's prompt counts from it.
    ctx.setLastPoint(start)
    ctx.dynamicInput.open({
      fields: [{ id: "end", kind: "coordinate" }],
      commit: () => {},
      commitRaw: (commitCtx) => {
        const now = this.turning
        if (now?.phase !== "end") return false
        const point = this.typedPoint(
          commitCtx.dynamicInput.getText("end").trim(),
          commitCtx
        )
        if (!point) return false
        this.turn(this.angleBetween(now, point, commitCtx), commitCtx)
        return true
      },
    })
    ctx.requestRender()
  }

  onEnter(ctx: ToolContext): boolean {
    // `Pick a rotation axis:` takes no Enter (AllowNone false, p03).
    if (this.turning?.phase === "axis") {
      ctx.report(ctx.text.message("invalidPoint2d"))
      return true
    }
    if (this.turning) return true
    return super.onEnter(ctx)
  }

  /** The turn about the axis from the start point to `to`, right-handed. */
  private angleBetween(
    turning: Extract<Turning, { phase: "end" }>,
    to: Vec3,
    ctx: ToolContext
  ): number {
    const axis = this.axes(ctx)[turning.axis]
    const flat = (p: Vec3) => {
      const d = sub3(p, turning.base)
      return sub3(d, scale3(axis, dot3(d, axis)))
    }
    const a = flat(turning.start)
    const b = flat(to)
    if (length3(a) < 1e-12 || length3(b) < 1e-12) return 0
    return Math.atan2(dot3(cross3(a, b), axis), dot3(a, b))
  }

  /** The set turned `radians` about the axis taken, and 3DROTATE ends. */
  private turn(radians: number, ctx: ToolContext): void {
    const turning = this.turning
    if (!turning || turning.phase === "axis") return
    const map = rotationAbout(
      turning.base,
      this.axes(ctx)[turning.axis],
      radians
    )
    const { originals, refs } = turning.set
    if (Math.abs(radians) > 1e-12) {
      const { changed, failed } = reshapedOwners(ctx, refs, (p) =>
        apply(map, p)
      )
      sayUnreshaped(failed, ctx)
      ctx.execute(
        new UpdateEntitiesCommand([
          ...originals.map((entity) => transformEntity(entity, map)),
          ...changed,
        ])
      )
    }
    ctx.dynamicInput.close()
    ctx.endCommand()
  }

  fadedEntityIds(ctx: ToolContext): readonly string[] {
    if (this.turning?.phase !== "end") return super.fadedEntityIds(ctx)
    const { originals, owners } = this.turning.set
    return [...originals, ...owners].map((entity) => entity.id)
  }

  selectionGlows(): boolean {
    return this.turning ? false : super.selectionGlows()
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    const turning = this.turning
    const axes = this.axes(ctx)
    if (!turning) {
      const own = super.buildOverlay(ctx)
      if (ctx.viewport.isPlan || this.question() !== "specifyBasePoint") {
        return own
      }
      // The gizmo follows the cursor while the base point is asked, at the
      // set's centre till it moves (d01).
      const at = this.cursor ?? this.center(ctx)
      return at ? [...own, ...rotateGizmo(ctx.viewport, at, axes, null)] : own
    }
    if (turning.phase === "axis") {
      return rotateGizmo(ctx.viewport, turning.base, axes, turning.hover)
    }
    const gizmo = rotateGizmo(ctx.viewport, turning.base, axes, turning.axis)
    if (turning.phase !== "end") return gizmo
    const map = rotationAbout(
      turning.base,
      axes[turning.axis],
      this.angleBetween(turning, turning.current, ctx)
    )
    const { originals, refs, owners } = turning.set
    const ghosts = this.turnGhosts.of(ctx, refs, (p) => apply(map, p))
    return [
      ...gizmo,
      ...transformDrag(
        ctx,
        [...originals, ...owners],
        (entity) => ghosts.get(entity.id) ?? transformEntity(entity, map),
        turning.base,
        turning.current
      ),
    ]
  }
}

/** The turn `radians` about the line through `point` along the unit `axis`, right-handed. */
function rotationAbout(point: Vec3, axis: Vec3, radians: number): Similarity3 {
  const c = Math.cos(radians)
  const s = Math.sin(radians)
  const turn = (v: Vec3): Vec3 =>
    add3(
      add3(scale3(v, c), scale3(cross3(axis, v), s)),
      scale3(axis, dot3(axis, v) * (1 - c))
    )
  const rotation = {
    x: turn({ x: 1, y: 0, z: 0 }),
    y: turn({ x: 0, y: 1, z: 0 }),
    z: turn({ x: 0, y: 0, z: 1 }),
  }
  return { rotation, scale: 1, translation: sub3(point, turn(point)) }
}

function apply(map: Similarity3, p: Vec3): Vec3 {
  const { x, y, z } = map.rotation
  return add3(
    add3(add3(scale3(x, p.x), scale3(y, p.y)), scale3(z, p.z)),
    map.translation
  )
}
