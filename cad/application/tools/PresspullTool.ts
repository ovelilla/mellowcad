import { Vec2 } from "../../geometry/Vec2"
import { Vec3, add3, length3, scale3, sub3 } from "../../geometry/Vec3"
import { facesAlong } from "../../geometry/hiddenLines"
import { bulgeToArc } from "../../geometry/primitives"
import { PlanarCurve } from "../../geometry/planarCurves"
import { loopArea, loopReversed } from "../../geometry/planarRegions"
import { PlanarProfile, extrusionBrep } from "../../geometry/sweeps"
import {
  Entity,
  EntityId,
  HatchLoop,
  Solid3dEntity,
  readsInPlan,
} from "../../domain/entities"
import { pressPulledSolid } from "../../domain/solidModeling"
import { subobjectEdgeEntities } from "../../domain/solidSubobjects"
import { traceBoundaryLoops } from "../../domain/boundary"
import { createSweptSolid, sweepProfile } from "../../domain/sweptSolids"
import {
  AddEntitiesCommand,
  UpdateEntitiesCommand,
} from "../commands/entityCommands"
import { isCoordinateExpression } from "../input/coordinateInput"
import type { PromptId } from "../../locales/types"
import { ScenePrimitive } from "../../scene/types"
import { entityScenePrimitive, selectionGlow } from "../SceneBuilder"
import { THEME } from "../../scene/theme"
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

/** A face of a solid a click took, and the way along it the height runs. */
interface FacePick {
  readonly kind: "face"
  readonly id: EntityId
  readonly face: number
  /** Ctrl+click: the face offset, its neighbours carried on. */
  readonly offset: boolean
  readonly normal: Vec3
}

type Pick =
  { readonly kind: "profile"; readonly profile: PlanarProfile } | FacePick

type PresspullState =
  | {
      readonly phase: "pick"
      readonly multiple: boolean
      /** The face Ctrl holds the cursor over. */
      readonly hover?: { readonly id: EntityId; readonly face: number } | null
    }
  | {
      readonly phase: "height"
      readonly cursor: Vec3
      readonly screen: Vec2
    }

const PREVIEW_ID = "presspull-preview"

/**
 * AutoCAD's PRESSPULL, as 2027's tables word it: `Select object or bounded
 * area:` until Enter, then the height, the command asking again (its help:
 * "The command repeats"). A click on a closed object or inside an area the
 * objects in plan bound extrudes it into a solid along its normal (the UCS's
 * Z for an area), of the current layer, its objects kept; on a planar face of
 * a solid it extrudes the face, its neighbours left as they were, and with
 * Ctrl held offsets it, its neighbours carried on to meet it (its help;
 * desktop: `Specify offset distance or [Multiple]:`, then `1 face(s)
 * offset`; the plain click's `1 extrusion(s) created`). Multiple, at either
 * prompt, takes several clicks before one height. A point typed where it
 * asks for a click says `Click a face, curve, or inside a bounded area`
 * (presspull/p01: the console, which cannot click, says it for every point).
 *
 * WHY no open object: it extrudes into a surface, which has no object here.
 */
export class PresspullTool implements Tool {
  readonly id = "presspull"

  private state: PresspullState = { phase: "pick", multiple: false }
  private picks: Pick[] = []
  private base: Vec3 = { x: 0, y: 0, z: 0 }
  private lastScreen: Vec2 | null = null

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    ctx.selection.clear()
    this.picks = []
    this.state = { phase: "pick", multiple: false }
    this.openPick(ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    this.picks = []
    this.state = { phase: "pick", multiple: false }
    ctx.dynamicInput.close()
  }

  question(): PromptId | ToolQuestion {
    if (this.state.phase === "pick") return "presspullSelect"
    return this.offsets() ? "presspullOffsetOr" : "presspullHeightOr"
  }

  /** Whether the height asked is a face's offset: the first click's Ctrl. */
  private offsets(): boolean {
    const first = this.picks[0]
    return first?.kind === "face" && first.offset
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
    if (this.state.phase === "pick" && this.picks.length > 0) {
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
      this.state = {
        phase: "height",
        cursor: input.point,
        screen: input.screen,
      }
    } else {
      // Ctrl held lights the face it would take (To Work with Pressing or
      // Pulling 3D Solid Faces: "Edge highlighting indicates which faces").
      const face = input.ctrlKey ? this.faceAt(input.screen, ctx) : null
      this.state = {
        ...this.state,
        hover: face && { id: face.solid.id, face: face.face },
      }
    }
    ctx.dynamicInput.setPosition(input.screen)
    ctx.requestRender()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return
    if (this.state.phase === "height") {
      this.takeHeight(this.heightAt(input.point, input.screen, ctx), ctx)
      return
    }
    const pick = this.pickAt(input, ctx)
    if (!pick) {
      ctx.report(ctx.text.message("presspullClick"), "error")
      return
    }
    this.picks.push(pick.pick)
    this.base = pick.base
    if (this.state.multiple) {
      ctx.requestRender()
      return
    }
    this.askHeight(ctx)
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    const out: ScenePrimitive[] = []
    const state = this.state
    if (state.phase === "pick") {
      const solid = state.hover && this.solidOf(state.hover.id, ctx)
      if (state.hover && solid) {
        for (const edge of subobjectEdgeEntities(solid, {
          kind: "face",
          index: state.hover.face,
        })) {
          out.push(
            ...entityScenePrimitive(ctx.viewport, edge, {
              color: THEME.entityHover,
              width: 2,
            })
          )
        }
      }
    }
    // The faces taken glow as selected (desktop: the face, or with Ctrl the
    // whole solid).
    for (const pick of this.picks) {
      if (pick.kind !== "face") continue
      const solid = this.solidOf(pick.id, ctx)
      if (!solid) continue
      const shown = pick.offset
        ? [solid]
        : subobjectEdgeEntities(solid, { kind: "face", index: pick.face })
      for (const entity of shown) {
        out.push(
          ...selectionGlow(ctx.viewport, entity, {
            color: THEME.entity,
            width: 1,
          })
        )
      }
    }
    if (state.phase !== "height") return out
    const height = this.heightAt(state.cursor, state.screen, ctx)
    if (height === 0) return out
    const stroke = { color: currentColor(ctx), width: 1 }
    out.push(
      ...this.made(height, ctx, false).flatMap((entity) =>
        entityScenePrimitive(ctx.viewport, entity, stroke)
      )
    )
    return out
  }

  /**
   * The height a point gives: for a face's, how far along its outward normal
   * the cursor stands where the normal is drawn (a pull, or a press when
   * negative), as BOX's height arrows read it (solid/g01); seen along that
   * normal, or for an object, its distance from the click.
   */
  private heightAt(point: Vec3, screen: Vec2, ctx: ToolContext): number {
    const first = this.picks[0]
    if (first?.kind === "face") {
      const { viewport } = ctx
      const s0 = viewport.worldToScreen(this.base)
      const s1 = viewport.worldToScreen(add3(this.base, first.normal))
      const dx = s1.x - s0.x
      const dy = s1.y - s0.y
      const run = dx * dx + dy * dy
      if (run > 1e-6) {
        return ((screen.x - s0.x) * dx + (screen.y - s0.y) * dy) / run
      }
    }
    return length3(sub3(point, this.base))
  }

  private solidOf(id: EntityId, ctx: ToolContext): Solid3dEntity | null {
    const entity = ctx.document.get(id)
    return entity?.type === "solid3d" ? entity : null
  }

  /**
   * What a click takes, and the point its height is measured from: with Ctrl
   * the face under it, offset; else the closed object under it, the planar
   * face nearest the viewer under it, or the area the objects in plan bound.
   */
  private pickAt(
    input: PointerInput,
    ctx: ToolContext
  ): { pick: Pick; base: Vec3 } | null {
    const faceAt = () => {
      const found = this.faceAt(input.screen, ctx)
      if (!found) return null
      const s = found.solid.brep.faces[found.face].surface
      if (s.kind !== "plane") return null
      return {
        pick: {
          kind: "face" as const,
          id: found.solid.id,
          face: found.face,
          offset: input.ctrlKey,
          normal: s.normal,
        },
        base: found.at,
      }
    }
    if (input.ctrlKey) {
      const face = faceAt()
      if (face) return face
    }
    const hit = ctx.pick(input.point)
    if (hit) {
      const profile = sweepProfile(hit)
      if (profile && profile !== "open" && profile !== "crosses") {
        return { pick: { kind: "profile", profile }, base: input.point }
      }
    }
    const face = faceAt()
    if (face) return face
    const profile = this.areaAt(input.world, ctx)
    return profile
      ? { pick: { kind: "profile", profile }, base: input.point }
      : null
  }

  /** The face of a solid nearest the viewer under `screen`, and where the line of sight crosses it. */
  private faceAt(
    screen: Vec2,
    ctx: ToolContext
  ): { solid: Solid3dEntity; face: number; at: Vec3 } | null {
    const { viewport, document } = ctx
    const sight = viewport.screenToFacing(screen)
    const toViewer = viewport.direction
    let best: { solid: Solid3dEntity; face: number; depth: number } | null =
      null
    for (const entity of document.getEntities()) {
      if (entity.type !== "solid3d") continue
      if (!document.isEntityVisible(entity)) continue
      if (!document.isEntityEditable(entity)) continue
      const [front] = facesAlong(entity.brep, sight, toViewer)
      if (front && (!best || front.depth > best.depth)) {
        best = { solid: entity, face: front.face, depth: front.depth }
      }
    }
    if (!best) return null
    const w = scale3(toViewer, 1 / length3(toViewer))
    return {
      solid: best.solid,
      face: best.face,
      at: add3(sight, scale3(w, best.depth)),
    }
  }

  /**
   * The area the objects in plan bound round `world`, its outline
   * counter-clockwise, its islands clockwise.
   */
  private areaAt(world: Vec2, ctx: ToolContext): PlanarProfile | null {
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
    this.state = {
      phase: "height",
      cursor: this.base,
      screen: ctx.viewport.worldToScreen(this.base),
    }
    ctx.dynamicInput.open({
      fields: [
        {
          id: "value",
          prompt: this.offsets() ? "presspullOffsetOr" : "presspullHeightOr",
          kind: "distance",
        },
      ],
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
    const offset = this.offsets()
    const added = this.made(height, ctx, true)
    const changed = this.changed(height, ctx)
    const faces = this.picks.filter((p) => p.kind === "face").length
    this.picks = []
    this.state = { phase: "pick", multiple: false }
    if (added.length > 0) ctx.execute(new AddEntitiesCommand(added))
    if (changed.length > 0) {
      ctx.execute(new UpdateEntitiesCommand(changed))
      ctx.report(
        ctx.text.message(offset ? "presspullOffset" : "presspullExtruded", {
          count: faces,
        })
      )
    }
    // It asks again until Enter (its help: "The command repeats").
    this.openPick(ctx)
  }

  /** The solids the objects and areas taken make. */
  private made(height: number, ctx: ToolContext, real: boolean): Entity[] {
    return this.picks.flatMap((pick, i) => {
      if (pick.kind !== "profile") return []
      const { profile } = pick
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

  /**
   * The solids whose faces were taken, pressed or pulled: each solid's faces
   * together, the way its first was taken. One the kernel cannot make is
   * left as it was.
   */
  private changed(height: number, ctx: ToolContext): Entity[] {
    const bySolid = new Map<EntityId, FacePick[]>()
    for (const pick of this.picks) {
      if (pick.kind !== "face") continue
      bySolid.set(pick.id, [...(bySolid.get(pick.id) ?? []), pick])
    }
    const out: Entity[] = []
    for (const [id, picks] of bySolid) {
      const solid = this.solidOf(id, ctx)
      if (!solid) continue
      const faces = [...new Set(picks.map((p) => p.face))]
      const edited = pressPulledSolid(solid, faces, height, picks[0].offset)
      if (edited) out.push(edited)
    }
    return out
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
