import { Vec2 } from "../../geometry/Vec2"
import { Vec3, length3, scale3, sub3 } from "../../geometry/Vec3"
import { bulgeToArc } from "../../geometry/primitives"
import { PlanarCurve } from "../../geometry/planarCurves"
import { loopArea, loopReversed } from "../../geometry/planarRegions"
import { PlanarProfile, extrusionBrep } from "../../geometry/sweeps"
import { Entity, HatchLoop, readsInPlan } from "../../domain/entities"
import { traceBoundaryLoops } from "../../domain/boundary"
import { createSweptSolid, sweepProfile } from "../../domain/sweptSolids"
import { AddEntitiesCommand } from "../commands/entityCommands"
import { isCoordinateExpression } from "../input/coordinateInput"
import type { PromptId } from "../../locales/types"
import { ScenePrimitive } from "../../scene/types"
import { entityScenePrimitive } from "../SceneBuilder"
import {
  CommandOption,
  CommandOptionOutcome,
  PointerInput,
  QuestionInput,
  Tool,
  ToolContext,
  ToolQuestion,
} from "./Tool"
import { currentColor, withCurrentProperties } from "./currentProperties"

const WORLD = {
  x: { x: 1, y: 0, z: 0 },
  y: { x: 0, y: 1, z: 0 },
  z: { x: 0, y: 0, z: 1 },
}

type PresspullState =
  | { readonly phase: "pick"; readonly multiple: boolean }
  | { readonly phase: "height"; readonly cursor: Vec3 }

const PREVIEW_ID = "presspull-preview"

/**
 * AutoCAD's PRESSPULL on a closed object or an area bounded by objects (its
 * help's table: either extrudes into a 3D solid), as 2027's tables word it:
 * `Select object or bounded area:` until Enter, a click inside the area or on
 * the object, then `Specify extrusion height or [Multiple]:`, the solid along
 * the profile's normal (the UCS's Z for a bounded area), of the current
 * layer, its objects kept. Multiple, at either prompt, takes several before
 * one height. A point typed where it asks for a click says `Click a face,
 * curve, or inside a bounded area` (presspull/p01: the console, which cannot
 * click, says it for every point).
 *
 * WHY no faces: pressing or pulling a solid's face is phase 4's
 * (docs/next-solids.md); an open object, a surface's, has no object here.
 */
export class PresspullTool implements Tool {
  readonly id = "presspull"

  private state: PresspullState = { phase: "pick", multiple: false }
  private profiles: PlanarProfile[] = []
  private base: Vec3 = { x: 0, y: 0, z: 0 }
  private lastScreen: Vec2 | null = null

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    ctx.selection.clear()
    this.profiles = []
    this.state = { phase: "pick", multiple: false }
    this.openPick(ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    this.profiles = []
    this.state = { phase: "pick", multiple: false }
    ctx.dynamicInput.close()
  }

  question(): PromptId | ToolQuestion {
    return this.state.phase === "pick" ? "presspullSelect" : "presspullHeightOr"
  }

  takes(): QuestionInput | null {
    return this.state.phase === "pick"
      ? { refusal: "point2dOrKeywordRequired" }
      : {
          refusal: "requiresDistance",
          values: { points: "second", keyword: "yes" },
        }
  }

  /** Multiple, hidden where the selection asks (presspull/p01's `_M`). */
  commandOptions(): readonly CommandOption[] {
    return this.state.phase === "pick"
      ? [{ id: "Multiple", hidden: true }]
      : [{ id: "Multiple" }]
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    if (id !== "Multiple") return "unhandled"
    this.state = { phase: "pick", multiple: true }
    this.openPick(ctx)
    return "continue"
  }

  /** Enter ends the command, or Multiple's picks for their height. */
  onEnter(ctx: ToolContext): boolean {
    if (this.state.phase === "pick" && this.profiles.length > 0) {
      this.askHeight(ctx)
      return true
    }
    return false
  }

  wantsSnap(): boolean {
    return this.state.phase === "height"
  }

  getConstraintAnchor(): Vec3 | null {
    return this.state.phase === "height" ? this.base : null
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen
    if (this.state.phase === "height") {
      this.state = { phase: "height", cursor: input.point }
    }
    ctx.dynamicInput.setPosition(input.screen)
    ctx.requestRender()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return
    if (this.state.phase === "height") {
      this.takeHeight(length3(sub3(input.point, this.base)), ctx)
      return
    }
    const profile = this.profileAt(input.point, input.world, ctx)
    if (!profile) {
      ctx.report(ctx.text.message("presspullClick"), "error")
      return
    }
    this.profiles.push(profile)
    this.base = input.point
    if (this.state.multiple) {
      ctx.requestRender()
      return
    }
    this.askHeight(ctx)
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    if (this.state.phase !== "height") return []
    const height = length3(sub3(this.state.cursor, this.base))
    if (!(height > 0)) return []
    const stroke = { color: currentColor(ctx), width: 1 }
    return this.solids(height, ctx, false).flatMap((solid) =>
      entityScenePrimitive(ctx.viewport, solid, stroke)
    )
  }

  /**
   * What a click takes: the closed object under it, or the area the objects
   * in plan bound round it, its outline counter-clockwise, its islands
   * clockwise.
   */
  private profileAt(
    point: Vec3,
    world: Vec2,
    ctx: ToolContext
  ): PlanarProfile | null {
    const hit = ctx.pick(point)
    if (hit) {
      const profile = sweepProfile(hit)
      if (profile && profile !== "open" && profile !== "crosses") {
        return profile
      }
    }
    const level = ctx.document.getEntities().filter(readsInPlan)
    const loops = traceBoundaryLoops(world, level)
    if (!loops || loops.length === 0) return null
    const curves = loops.map((loop, i) => {
      const ring = loopCurves(loop)
      const outer = i === 0
      return loopArea(ring) > 0 === outer ? ring : loopReversed(ring)
    })
    return {
      axes: WORLD,
      elevation: ctx.elevation,
      faces: [{ loops: curves }],
    }
  }

  private askHeight(ctx: ToolContext): void {
    this.state = { phase: "height", cursor: this.base }
    ctx.dynamicInput.open({
      fields: [{ id: "value", prompt: "presspullHeightOr", kind: "distance" }],
      commit: (values, commitCtx) => {
        if (Number.isFinite(values.value)) {
          this.takeHeight(values.value, commitCtx)
        }
      },
    })
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }

  private takeHeight(height: number, ctx: ToolContext): void {
    if (height === 0) {
      ctx.report(ctx.text.message("extrudeValueNonzero"), "error")
      return
    }
    const made = this.solids(height, ctx, true)
    this.profiles = []
    this.state = { phase: "pick", multiple: false }
    if (made.length > 0) ctx.execute(new AddEntitiesCommand(made))
    // It asks again until Enter (its help: "The command repeats").
    this.openPick(ctx)
  }

  private solids(height: number, ctx: ToolContext, real: boolean): Entity[] {
    return this.profiles.flatMap((profile, i) => {
      const brep = extrusionBrep(profile, scale3(profile.axes.z, height))
      if (!brep) return []
      const solid = createSweptSolid(
        brep,
        { kind: "extrusion", height, taper: 0 },
        ctx.document.getCurrentLayerId(),
        real ? undefined : `${PREVIEW_ID}-${i}`
      )
      return [real ? withCurrentProperties(solid, ctx) : solid]
    })
  }

  /** A typed point is no click (p01). */
  private openPick(ctx: ToolContext): void {
    ctx.dynamicInput.open({
      fields: [{ id: "point", prompt: "presspullSelect", kind: "coordinate" }],
      commit: () => {},
      commitRaw: (commitCtx) => {
        if (!commitCtx.dynamicInput.hasTypedText()) return false
        const text = commitCtx.dynamicInput.getText("point").trim()
        if (!isCoordinateExpression(text)) return false
        commitCtx.report(commitCtx.text.message("presspullClick"), "error")
        return true
      },
      directDistance: "typed",
    })
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }
}

/** A traced loop's segments and arcs, as the kernel's curves. */
function loopCurves(loop: HatchLoop): PlanarCurve[] {
  const { vertices } = loop
  return vertices.map((start, i): PlanarCurve => {
    const end = vertices[(i + 1) % vertices.length]
    const bulge = loop.bulges?.[i] ?? 0
    if (bulge === 0) return { kind: "line", start, end }
    const arc = bulgeToArc(start, end, bulge)
    return {
      kind: "arc",
      center: arc.center,
      radius: arc.radius,
      startAngle: Math.atan2(start.y - arc.center.y, start.x - arc.center.x),
      sweep: 4 * Math.atan(bulge),
    }
  })
}
