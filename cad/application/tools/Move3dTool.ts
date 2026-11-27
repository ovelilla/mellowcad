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
  copyEntity,
  entityWorldBox,
  translateEntity,
  withCopiedAssociations,
} from "../../domain/entities"
import { WORLD_UCS, Ucs } from "../../domain/ucs"
import { parseDecimalNumber } from "../../domain/units"
import { ScenePrimitive } from "../../scene/types"
import { AddEntitiesCommand } from "../commands/entityCommands"
import { Viewport } from "../Viewport"
import {
  GizmoAxes,
  MoveConstraint,
  axisLine,
  constraintDirections,
  constraintNormal,
  gizmoAxisColor,
  moveGizmo,
  moveGizmoHit,
} from "../gizmos"
import {
  isCoordinateExpression,
  parseCoordinate,
} from "../input/coordinateInput"
import { MoveTool } from "./MoveTool"
import { selectedInDrawingOrder } from "./drawingOrder"
import { partsOf } from "./subobjectSet"
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

/** The gizmo taken: its constraint, where it moves from and to, and Copy's run. */
interface Dragging {
  readonly constraint: MoveConstraint
  readonly base: Vec3
  readonly current: Vec3
  readonly copying: boolean
  /** Where the history stood before each copy, for Undo (`ctx.undoTo`). */
  readonly copies: readonly number[]
  /** The gizmo's centre as the arrow was taken. */
  readonly center: Vec3
  /** Base point's own `Specify base point:`, a new base asked. */
  readonly askingBase: boolean
}

/**
 * AutoCAD's 3DMOVE: MOVE's prompts (3dmove/p01–p14), and in a view that is
 * not a plan the 3D Move gizmo at the set's centre while the base point is
 * asked (desktop 3dmove/d01): an arrow or the square between two taken
 * answers the base point there, unechoed, says `** MOVE **` and asks
 * `Specify move point or [Base point/Copy/Undo/eXit]:`, the set dragged
 * along that axis or in that plane, a number typed running that far along
 * it towards the cursor (d01: `3` moved the box 3 along X). In 2D Wireframe
 * AutoCAD shows the command in 3D Wireframe and says `Regenerating model.`
 * as it ends (p01, p13; none in plan or a 3D style, p05, p11, p12).
 */
export class Move3dTool extends MoveTool {
  readonly id: string = "move3d"
  readonly shortcut: string = "3m"

  private hover: MoveConstraint | null = null
  private dragging: Dragging | null = null
  /** The set's centre, worked out once per run: the set does not change at the base point. */
  private centerCache: { value: Vec3 | null } | null = null
  private regenerates = false
  private lastPointerScreen: Vec2 | null = null

  onActivate(ctx: ToolContext): void {
    this.hover = null
    this.dragging = null
    this.centerCache = null
    this.regenerates =
      !ctx.viewport.isPlan &&
      ctx.document.getSettings().visualStyle === "2dWireframe"
    super.onActivate(ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    this.hover = null
    this.dragging = null
    this.centerCache = null
    super.onDeactivate(ctx)
    if (this.regenerates) ctx.regenerate("once")
    this.regenerates = false
  }

  /** Whether the gizmo shows: at the base point, off the plan (the help's "In a 3D view"). */
  private gizmoShown(ctx: ToolContext): boolean {
    return (
      !ctx.viewport.isPlan &&
      this.dragging === null &&
      this.placementPhase() === "basePoint"
    )
  }

  /** The gizmo's axes: the WCS's (its menu's Align Gizmo With ▸ World, d01-6), read in the frame. */
  private axes(ctx: ToolContext): GizmoAxes {
    const wcs: Ucs = ctx.ucs.wcs ?? WORLD_UCS
    const z = normalize3(cross3(wcs.xAxis, wcs.yAxis)) ?? { x: 0, y: 0, z: 1 }
    return { x: wcs.xAxis, y: wcs.yAxis, z }
  }

  /** The centre of the set's box, where the gizmo stands (GTLOCATION 1). */
  private center(ctx: ToolContext): Vec3 | null {
    if (this.dragging) return this.dragging.center
    if (this.placementPhase() !== "basePoint") return null
    this.centerCache ??= { value: this.centerOf(ctx) }
    return this.centerCache.value
  }

  private centerOf(ctx: ToolContext): Vec3 | null {
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

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastPointerScreen = input.screen
    const dragging = this.dragging
    if (dragging) {
      if (!dragging.askingBase) {
        const current = constrained(
          ctx.viewport,
          dragging.base,
          this.axes(ctx),
          dragging.constraint,
          input
        )
        this.dragging = { ...dragging, current }
        ctx.dynamicInput.setLive(
          "distance",
          length3(sub3(current, dragging.base))
        )
        ctx.dynamicInput.setPosition(input.screen)
        ctx.requestRender()
        return
      }
    } else if (this.gizmoShown(ctx)) {
      const center = this.center(ctx)
      this.hover = center
        ? moveGizmoHit(ctx.viewport, center, this.axes(ctx), input.screen)
        : null
    }
    super.onPointerMove(input, ctx)
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return
    const dragging = this.dragging
    if (dragging?.askingBase) {
      this.newBase(input.point, ctx)
      return
    }
    if (dragging) {
      const to = constrained(
        ctx.viewport,
        dragging.base,
        this.axes(ctx),
        dragging.constraint,
        input
      )
      this.moveTo(to, ctx)
      return
    }
    if (this.gizmoShown(ctx)) {
      const center = this.center(ctx)
      const hit =
        center &&
        moveGizmoHit(ctx.viewport, center, this.axes(ctx), input.screen)
      if (center && hit) {
        // The point on the axis or the square under the cursor answers the
        // base point, unechoed (d01's trace: 6.238,5,5 on X).
        const base = constrained(
          ctx.viewport,
          center,
          this.axes(ctx),
          hit,
          input
        )
        this.hover = null
        this.dragging = {
          constraint: hit,
          base,
          current: base,
          copying: false,
          copies: [],
          center,
          askingBase: false,
        }
        ctx.report(ctx.text.message("moveGripMode"))
        this.openMoveInput(ctx)
        return
      }
    }
    super.onPointerDown(input, ctx)
  }

  /** Base point's answer: the drag goes on from there. */
  private newBase(base: Vec3, ctx: ToolContext): void {
    const dragging = this.dragging
    if (!dragging) return
    this.dragging = { ...dragging, base, current: base, askingBase: false }
    this.openMoveInput(ctx)
  }

  private openNewBaseInput(ctx: ToolContext): void {
    ctx.dynamicInput.open({
      fields: [{ id: "base", prompt: "basePoint", kind: "coordinate" }],
      commit: () => {},
      commitRaw: (commitCtx) => {
        const text = commitCtx.dynamicInput.getText("base").trim()
        if (!isCoordinateExpression(text)) return false
        const point = parseCoordinate(text, {
          lastPoint: commitCtx.lastPoint,
          relativeByDefault: false,
          ucs: commitCtx.ucs,
          elevation: commitCtx.elevation,
        })
        if (!point) return false
        this.newBase(point, commitCtx)
        return true
      },
    })
    if (this.lastPointerScreen) {
      ctx.dynamicInput.setPosition(this.lastPointerScreen)
    }
  }

  private openMoveInput(ctx: ToolContext): void {
    ctx.dynamicInput.open({
      fields: [{ id: "distance", prompt: "distance", kind: "distance" }],
      commit: (values, commitCtx) => {
        const distance = values.distance
        if (distance !== undefined) this.moveAlong(distance, commitCtx)
      },
      commitRaw: (commitCtx) => this.commitTyped(commitCtx),
    })
    if (this.lastPointerScreen)
      ctx.dynamicInput.setPosition(this.lastPointerScreen)
    ctx.requestRender()
  }

  /**
   * A number typed runs that far along the axis towards the cursor (d01:
   * `3`), a coordinate is the point; Enter ends.
   */
  private commitTyped(ctx: ToolContext): boolean {
    const dragging = this.dragging
    if (!dragging || dragging.askingBase) return false
    const text = ctx.dynamicInput.getText("distance").trim()
    if (text === "") {
      ctx.dynamicInput.close()
      ctx.endCommand()
      return true
    }
    const distance = parseDecimalNumber(text)
    if (distance !== null) {
      this.moveAlong(distance, ctx)
      return true
    }
    if (!isCoordinateExpression(text)) return false
    const point = parseCoordinate(text, {
      lastPoint: dragging.base,
      relativeByDefault: false,
      ucs: ctx.ucs,
      elevation: ctx.elevation,
    })
    if (!point) return false
    this.moveTo(point, ctx)
    return true
  }

  /** `distance` along the constraint, the way the cursor went from the base (d01: `3`). */
  private moveAlong(distance: number, ctx: ToolContext): void {
    const dragging = this.dragging
    if (!dragging) return
    const along = sub3(dragging.current, dragging.base)
    const unit =
      normalize3(along) ??
      constraintDirections(this.axes(ctx), dragging.constraint)[0]
    this.moveTo(add3(dragging.base, scale3(unit, distance)), ctx)
  }

  /** The set moved, or copied under Copy, to `to`. */
  private moveTo(to: Vec3, ctx: ToolContext): void {
    const dragging = this.dragging
    if (!dragging) return
    const delta = sub3(to, dragging.base)
    const originals = selectedInDrawingOrder(ctx)
    ctx.setLastPoint(to)
    if (dragging.copying) {
      const { owners } = partsOf(ctx, true, originals)
      const set = [...originals, ...owners]
      const mark = ctx.historyDepth()
      ctx.execute(
        new AddEntitiesCommand(
          withCopiedAssociations(
            set,
            set.map((entity) => copyEntity(entity, delta))
          )
        )
      )
      this.dragging = { ...dragging, copies: [...dragging.copies, mark] }
      ctx.dynamicInput.clearTexts()
      ctx.requestRender()
      return
    }
    this.place(originals, delta, ctx)
    ctx.dynamicInput.close()
    ctx.endCommand()
  }

  question(): PromptId | ToolQuestion {
    const dragging = this.dragging
    if (dragging) {
      return dragging.askingBase ? "specifyBasePoint" : "specifyMovePointOr"
    }
    return super.question()
  }

  takes(): QuestionInput | null {
    return this.dragging ? null : super.takes()
  }

  defaultOption(): string | null {
    return this.dragging ? null : super.defaultOption()
  }

  commandOptions(): readonly CommandOption[] {
    if (this.dragging) {
      if (this.dragging.askingBase) return []
      return [
        { id: "Base point" },
        { id: "Copy" },
        { id: "Undo" },
        { id: "eXit" },
      ]
    }
    return super.commandOptions()
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    const dragging = this.dragging
    if (!dragging) return super.invokeOption(id, ctx)
    switch (id) {
      case "Base point":
        this.dragging = { ...dragging, askingBase: true }
        this.openNewBaseInput(ctx)
        return "continue"
      case "Copy":
        this.dragging = { ...dragging, copying: true }
        return "continue"
      case "Undo": {
        const mark = dragging.copies.at(-1)
        if (mark === undefined) return "continue"
        ctx.undoTo(mark)
        this.dragging = { ...dragging, copies: dragging.copies.slice(0, -1) }
        return "continue"
      }
      case "eXit":
        return "end"
      default:
        return "unhandled"
    }
  }

  onEnter(ctx: ToolContext): boolean {
    if (this.dragging) {
      ctx.dynamicInput.close()
      ctx.endCommand()
      return true
    }
    return super.onEnter(ctx)
  }

  getConstraintAnchor(): Vec3 | null {
    if (this.dragging)
      return this.dragging.askingBase ? null : this.dragging.base
    return super.getConstraintAnchor()
  }

  fadedEntityIds(ctx: ToolContext): readonly string[] {
    if (!this.dragging || this.dragging.copying) {
      return super.fadedEntityIds(ctx)
    }
    const originals = selectedInDrawingOrder(ctx)
    const { owners } = partsOf(ctx, true, originals)
    return [...originals, ...owners].map((entity) => entity.id)
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    const dragging = this.dragging
    const axes = this.axes(ctx)
    if (dragging && !dragging.askingBase) {
      const delta = sub3(dragging.current, dragging.base)
      const originals = selectedInDrawingOrder(ctx)
      const { refs, owners } = partsOf(ctx, true, originals)
      const ghosts = dragging.copying
        ? new Map<string, Entity>(
            owners.map((solid) => [solid.id, translateEntity(solid, delta)])
          )
        : this.subobjectGhosts(refs, delta, ctx)
      const center = this.center(ctx)
      const out = transformDrag(
        ctx,
        [...originals, ...owners],
        (entity) => ghosts.get(entity.id) ?? translateEntity(entity, delta),
        dragging.base,
        dragging.current
      )
      // The axis taken drawn through the base, the gizmo carried with the set (d01-3).
      for (const direction of constraintDirections(axes, dragging.constraint)) {
        if (dragging.constraint.length === 1) {
          out.push(
            ...axisLine(
              ctx.viewport,
              dragging.base,
              direction,
              gizmoAxisColor(dragging.constraint as "x" | "y" | "z")
            )
          )
        }
      }
      if (center) {
        out.push(
          ...moveGizmo(
            ctx.viewport,
            add3(center, delta),
            axes,
            dragging.constraint
          )
        )
      }
      return out
    }
    const own = super.buildOverlay(ctx)
    if (!this.gizmoShown(ctx)) return own
    const center = this.center(ctx)
    if (!center) return own
    const hover = this.hover
    return [
      ...own,
      ...(hover && hover.length === 1
        ? axisLine(
            ctx.viewport,
            center,
            axes[hover as "x" | "y" | "z"],
            gizmoAxisColor(hover as "x" | "y" | "z")
          )
        : []),
      ...moveGizmo(ctx.viewport, center, axes, hover),
    ]
  }
}

/**
 * The cursor's point held to the gizmo's constraint from `base`: on the
 * axis, the point nearest the line of sight; in a plane, where the line of
 * sight meets it (About Moving 3D Objects).
 */
function constrained(
  viewport: Viewport,
  base: Vec3,
  axes: GizmoAxes,
  constraint: MoveConstraint,
  input: PointerInput
): Vec3 {
  const snapped = input.snap !== null
  const through = snapped ? input.point : viewport.screenToFacing(input.screen)
  const w = viewport.direction
  const normal = constraintNormal(axes, constraint)
  if (normal && snapped) {
    return sub3(
      input.point,
      scale3(normal, dot3(sub3(input.point, base), normal))
    )
  }
  if (normal) {
    const facing = dot3(w, normal)
    if (Math.abs(facing) < 1e-9) return base
    const t = dot3(sub3(base, through), normal) / facing
    return add3(through, scale3(w, t))
  }
  const d = constraintDirections(axes, constraint)[0]
  // WHY a snap's point is carried onto the axis square: AutoCAD's gizmo
  // keeps the constraint whatever snaps (unverified how it projects).
  if (snapped) return add3(base, scale3(d, dot3(sub3(input.point, base), d)))
  // The nearest points of two lines: base + s·d and through + t·w.
  const r = sub3(base, through)
  const a = dot3(d, d)
  const b = dot3(d, w)
  const c = dot3(w, w)
  const e = dot3(d, r)
  const f = dot3(w, r)
  const den = a * c - b * b
  if (Math.abs(den) < 1e-12) return base
  const s = (b * f - c * e) / den
  return add3(base, scale3(d, s))
}
