import { Vec2 } from "../../geometry/Vec2"
import { Vec3 } from "../../geometry/Vec3"
import {
  carryPlane,
  createWipeout,
  type Entity,
  type PolylineEntity,
} from "../../domain/entities"
import type { WipeoutEntity } from "../../domain/entities"
import type { PromptId } from "../../locales/types"
import type { ScenePrimitive } from "../../scene/types"
import {
  AddEntityCommand,
  ReplaceEntitiesCommand,
} from "../commands/entityCommands"
import { UpdateSettingsCommand } from "../commands/settingsCommands"
import {
  isCoordinateExpression,
  parseCoordinate,
} from "../input/coordinateInput"
import { currentColor, withCurrentProperties } from "./currentProperties"
import { lockedObjectAt } from "./lockedPick"
import { ONE_OBJECT_MODES, ObjectSelector } from "./objectSelection"
import { rollover } from "./ghostLook"
import type {
  CommandOption,
  CommandOptionOutcome,
  PointerInput,
  QuestionInput,
  Tool,
  ToolContext,
  ToolQuestion,
} from "./Tool"

type WipeoutState =
  | { readonly phase: "points" }
  | { readonly phase: "polyline"; readonly hover: Entity | null }
  | { readonly phase: "erase"; readonly polyline: PolylineEntity }
  | { readonly phase: "frames" }

const FRAME_MODES = ["OFF", "ON", "Display"] as const

const FRAME_DEFAULTS: Readonly<Record<0 | 1 | 2, PromptId>> = {
  0: "wipeoutFramesOff",
  1: "wipeoutFramesOn",
  2: "wipeoutFramesDisplay",
}

/**
 * AutoCAD's WIPEOUT (wipeout/w00–w13, in the ten languages of its consoles):
 * `Specify first point or [Frames/Polyline] <Polyline>:`, then `Specify next
 * point:`, `… or [Undo]:` and from the third `… or [Close/Undo]:`, where Enter
 * or Close makes the wipeout through the points given, closing back to the
 * first, in the plane of the first one's Z: the later prompts take 2D points
 * (`2D point or option keyword required.`, which Enter at the second gets too,
 * w13). Undo takes back the last point. The wipeout wears the current
 * properties.
 *
 * Polyline (Enter at the first prompt) asks `Select a closed polyline:`;
 * anything but a polyline is passed over in silence and asked again (w00,
 * w06), a polyline that is open or has an arc ends the command with `The
 * polyline must be closed and made up of only line segments.` (w06), and a
 * closed one of lines asks `Erase polyline? [Yes/No] <No>:` and makes the
 * wipeout through its vertices, at its elevation, on the current layer in
 * its colour and linetype, the current lineweight (w11, w13).
 *
 * Frames asks `Enter mode [ON/OFF/Display but not plot] <ON>:`, the current
 * WIPEOUTFRAME offered as each console words it, and sets it for every
 * wipeout of the drawing, saying `Regenerating model.` twice; the mode it
 * already has changes nothing (w02, w12).
 */
export class WipeoutTool implements Tool {
  readonly id = "wipeout"

  private state: WipeoutState = { phase: "points" }
  /** The vertices given so far. */
  private points: Vec3[] = []
  private cursor: Vec3 | null = null
  private lastScreen: Vec2 | null = null
  private frame: 0 | 1 | 2 = 1

  /**
   * The modes typed at `Select a closed polyline:`, which its refusal lists
   * with Group, Previous and AUto (w00).
   */
  private readonly modes = new ObjectSelector({
    takes: () => "pathCurve",
    done: () => {},
    question: () => "selectClosedPolyline",
    modes: [...ONE_OBJECT_MODES, "Previous", "AUto"],
    accept: (ids, ctx) =>
      ids.filter((id) => ctx.document.get(id)?.type === "polyline"),
    one: {
      take: (entity, ctx) => this.takePolyline(entity, ctx),
      newest: true,
      silent: true,
      pick: (point, ctx) => this.pickPolyline(point, ctx),
    },
  })

  onActivate(ctx: ToolContext): void {
    this.state = { phase: "points" }
    this.points = []
    this.cursor = null
    this.frame = ctx.document.getSettings().wipeoutFrame
    ctx.setCursor("crosshair")
    ctx.selection.clear()
    this.openInput(ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    this.state = { phase: "points" }
    this.points = []
    this.modes.start()
    ctx.dynamicInput.close()
  }

  question(): ToolQuestion | PromptId {
    switch (this.state.phase) {
      case "polyline":
        return this.modes.question()
      case "erase":
        return "erasePolyline"
      case "frames":
        return { id: "wipeoutFrameMode", enter: FRAME_DEFAULTS[this.frame] }
      case "points":
        switch (this.points.length) {
          case 0:
            return "wipeoutFirstPoint"
          case 1:
            return "wipeoutSecondPoint"
          case 2:
            return "wipeoutNextPointOr"
          default:
            return "wipeoutNextPointOrClose"
        }
    }
  }

  takes(): QuestionInput | null {
    switch (this.state.phase) {
      case "polyline":
        return this.modes.takes()
      case "erase":
      case "frames":
        return "keyword"
      case "points":
        // The first point keeps its Z, the plane's (w05: 0,0,5).
        // and every later one says `2D point or option keyword required.`,
        // the second's too, which lists no keyword (w05, w13).
        return this.points.length === 0
          ? "point"
          : { refusal: "point2dOrKeywordRequired", point2d: true }
    }
  }

  takesSnapOverride(): boolean {
    return this.state.phase === "polyline" && !this.modes.inMode()
  }

  commandOptions(): readonly CommandOption[] {
    switch (this.state.phase) {
      case "polyline":
        return this.modes.commandOptions()
      case "erase":
        return [{ id: "Yes" }, { id: "No" }]
      case "frames":
        return [{ id: "ON" }, { id: "OFF" }, { id: "Display" }]
      case "points":
        switch (this.points.length) {
          case 0:
            return [{ id: "Frames" }, { id: "Polyline" }]
          case 1:
            return []
          case 2:
            return [{ id: "Undo" }]
          default:
            return [{ id: "Close" }, { id: "Undo" }]
        }
    }
  }

  defaultOption(): string | null {
    switch (this.state.phase) {
      case "points":
        return this.points.length === 0 ? "Polyline" : null
      case "erase":
        return "No"
      case "frames":
        return FRAME_MODES[this.frame]
      case "polyline":
        return null
    }
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    const state = this.state
    switch (state.phase) {
      case "polyline":
        return this.modes.invokeOption(id, ctx) ? "continue" : "unhandled"
      case "erase":
        if (id !== "Yes" && id !== "No") return "unhandled"
        this.fromPolyline(state.polyline, id === "Yes", ctx)
        return "end"
      case "frames": {
        const mode = FRAME_MODES.indexOf(id as (typeof FRAME_MODES)[number])
        if (mode < 0) return "unhandled"
        if (mode !== this.frame) {
          ctx.execute(
            new UpdateSettingsCommand({ wipeoutFrame: mode as 0 | 1 | 2 })
          )
          // Said twice, as every console does (w02, w12).
          ctx.regenerate()
          ctx.regenerate()
        }
        return "end"
      }
      case "points":
        break
    }
    switch (id) {
      case "Frames":
        if (this.points.length > 0) return "unhandled"
        this.state = { phase: "frames" }
        ctx.dynamicInput.open({ fields: [], commit: () => {} })
        return "continue"
      case "Polyline":
        if (this.points.length > 0) return "unhandled"
        this.state = { phase: "polyline", hover: null }
        this.modes.start()
        ctx.dynamicInput.open({ fields: [], commit: () => {} })
        return "continue"
      case "Undo":
        if (this.points.length < 2) return "unhandled"
        this.points = this.points.slice(0, -1)
        this.openInput(ctx)
        ctx.requestRender()
        return "continue"
      case "Close":
        if (this.points.length < 3) return "unhandled"
        this.make(ctx)
        return "end"
      default:
        return "unhandled"
    }
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen
    if (this.state.phase === "polyline") {
      if (this.modes.inMode()) {
        this.modes.onPointerMove(input, ctx)
      } else {
        const hit = ctx.pick(input.world)
        const hover = hit?.type === "polyline" ? hit : null
        if (hover?.id !== this.state.hover?.id) {
          this.state = { phase: "polyline", hover }
        }
      }
      ctx.requestRender()
      return
    }
    this.cursor = input.point
    ctx.dynamicInput.setPosition(input.screen)
    ctx.requestRender()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return
    if (this.state.phase === "polyline") {
      if (this.modes.inMode()) {
        this.modes.onPointerDown(input, ctx)
        return
      }
      this.pickPolyline(input.snap ? input.point : input.world, ctx)
      return
    }
    if (this.state.phase === "points") this.take(input.point, ctx)
  }

  onPointerUp(input: PointerInput, ctx: ToolContext): void {
    if (this.state.phase === "polyline") this.modes.onPointerUp(input, ctx)
  }

  answerTyped(text: string, ctx: ToolContext): boolean {
    return this.state.phase === "polyline" && this.modes.answerTyped(text, ctx)
  }

  onEnter(ctx: ToolContext): boolean {
    return this.enter(ctx)
  }

  wantsSnap(): boolean {
    if (this.state.phase === "polyline") return this.modes.wantsSnap()
    return this.state.phase === "points"
  }

  getConstraintAnchor(): Vec3 | null {
    if (this.state.phase !== "points") return null
    return this.points[this.points.length - 1] ?? null
  }

  /** The edges given so far and the rubber band to the cursor, in the current colour. */
  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    const state = this.state
    if (state.phase === "polyline") {
      if (this.modes.inMode()) return this.modes.buildOverlay(ctx)
      return state.hover ? rollover(ctx, state.hover) : []
    }
    if (state.phase !== "points") return []
    const last = this.points[this.points.length - 1]
    if (!last) return []
    const { viewport } = ctx
    const stroke = { color: currentColor(ctx), width: 1 }
    const out: ScenePrimitive[] = []
    for (let i = 1; i < this.points.length; i++) {
      out.push({
        kind: "segment",
        a: viewport.worldToScreen(this.points[i - 1]),
        b: viewport.worldToScreen(this.points[i]),
        stroke,
      })
    }
    if (this.cursor) {
      out.push({
        kind: "segment",
        a: viewport.worldToScreen(last),
        b: viewport.worldToScreen(this.cursor),
        stroke,
      })
    }
    return out
  }

  private openInput(ctx: ToolContext): void {
    ctx.dynamicInput.open({
      fields: [{ id: "point", prompt: this.prompt(), kind: "coordinate" }],
      commit: () => {},
      commitRaw: (commitCtx) => {
        if (!commitCtx.dynamicInput.hasTypedText()) return this.enter(commitCtx)
        const text = commitCtx.dynamicInput.getText("point").trim()
        if (!isCoordinateExpression(text)) return false
        const point = parseCoordinate(text, {
          lastPoint: commitCtx.lastPoint,
          relativeByDefault: false,
          ucs: commitCtx.ucs,
          elevation: commitCtx.elevation,
        })
        if (!point) return false
        this.take(point, commitCtx)
        return true
      },
    })
    if (this.lastScreen) ctx.dynamicInput.setPosition(this.lastScreen)
  }

  private prompt(): PromptId {
    const question = this.question()
    return typeof question === "string" ? question : question.id
  }

  /**
   * Enter: Polyline at the first prompt; refused at the second; at the third
   * the point under the cursor, as the console's Enter there takes its
   * cursor's (w05: its trace's `None`, then a vertex at the console's fixed
   * pixel; unverified on the desktop); from the fourth, the wipeout.
   */
  private enter(ctx: ToolContext): boolean {
    const state = this.state
    if (state.phase === "polyline") {
      // Asked again (w02).
      if (this.modes.inMode()) this.modes.onEnter(ctx)
      return true
    }
    if (state.phase === "erase") {
      this.fromPolyline(state.polyline, false, ctx)
      ctx.endCommand()
      return true
    }
    if (state.phase === "frames") return false
    switch (this.points.length) {
      case 0:
        this.invokeOption("Polyline", ctx)
        return true
      case 1:
        ctx.report(ctx.text.message("point2dOrKeywordRequired"), "error")
        return true
      case 2:
        if (this.cursor) this.take(this.cursor, ctx)
        return true
      default:
        this.make(ctx)
        ctx.endCommand()
        return true
    }
  }

  private take(point: Vec3, ctx: ToolContext): void {
    // Later points lie in the first one's plane (w05: 100,0,7 refused).
    const first = this.points[0]
    const at = first ? { x: point.x, y: point.y, z: first.z } : point
    this.points = [...this.points, at]
    this.openInput(ctx)
    ctx.requestRender()
  }

  private make(ctx: ToolContext): void {
    const points = this.points
    // Updated before the commit, which rebuilds the state (cad-tools.md).
    this.points = []
    const made = createWipeout(points, ctx.document.getCurrentLayerId())
    ctx.execute(new AddEntityCommand(withCurrentProperties(made, ctx)))
  }

  /** A pick at `Select a closed polyline:`; on nothing, a window, as AUto makes it. */
  private pickPolyline(world: Vec2 | Vec3, ctx: ToolContext): void {
    const at = { x: world.x, y: world.y }
    const under = ctx.pick(at)
    if (lockedObjectAt(ctx.viewport.worldToScreen(world), ctx, under)) return
    if (!under) {
      this.modes.startWindow(at, ctx)
      return
    }
    this.takePolyline(under, ctx)
  }

  private takePolyline(entity: Entity, ctx: ToolContext): void {
    if (entity.type !== "polyline") return
    // A fitted one is curves too (unprobed, read as its arcs are).
    const straight =
      !entity.fit && !(entity.bulges ?? []).some((bulge) => bulge !== 0)
    // WHY two vertices refused so: unprobed, and no wipeout has fewer
    // than three.
    if (!entity.closed || !straight || entity.vertices.length < 3) {
      ctx.report(ctx.text.message("wipeoutPolylineNotClosed"), "error")
      this.state = { phase: "points" }
      ctx.endCommand()
      return
    }
    this.state = { phase: "erase", polyline: entity }
    ctx.dynamicInput.open({ fields: [], commit: () => {} })
    ctx.requestRender()
  }

  /** The wipeout through a closed polyline's vertices, and the polyline erased if asked. */
  private fromPolyline(
    polyline: PolylineEntity,
    erase: boolean,
    ctx: ToolContext
  ): void {
    this.state = { phase: "points" }
    const current = withCurrentProperties(
      carryPlane(
        polyline,
        createWipeout(polyline.vertices, ctx.document.getCurrentLayerId())
      ),
      ctx
    ) as WipeoutEntity
    // Its colour and linetype are the polyline's, its layer and lineweight
    // the current ones (w11, w13).
    const { color: _color, linetype: _linetype, ...rest } = current
    void _color
    void _linetype
    const made: WipeoutEntity = {
      ...rest,
      ...(polyline.color !== undefined ? { color: polyline.color } : {}),
      ...(polyline.linetype !== undefined
        ? { linetype: polyline.linetype }
        : {}),
    }
    ctx.execute(
      erase
        ? new ReplaceEntitiesCommand([polyline.id], [made])
        : new AddEntityCommand(made)
    )
  }
}
