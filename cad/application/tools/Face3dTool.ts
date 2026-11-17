import { Vec2 } from "../../geometry/Vec2"
import { Vec3 } from "../../geometry/Vec3"
import { createFace3d } from "../../domain/entities"
import type { PromptId } from "../../locales/types"
import type { ScenePrimitive } from "../../scene/types"
import { AddEntityCommand } from "../commands/entityCommands"
import {
  isCoordinateExpression,
  parseCoordinate,
} from "../input/coordinateInput"
import { currentColor, withCurrentProperties } from "./currentProperties"
import type {
  CommandOption,
  CommandOptionOutcome,
  PointerInput,
  Tool,
  ToolContext,
  ToolQuestion,
} from "./Tool"

type FacePhase = "first" | "second" | "third" | "fourth"

const PHASES: readonly FacePhase[] = ["first", "second", "third", "fourth"]

/**
 * AutoCAD's 3DFACE (face3d/f00–f06, tables 20611–20615): `Specify first
 * point or [Invisible]:`, `Specify second point or [Invisible]:`, `Specify
 * third point or [Invisible] <exit>:`, `Specify fourth point or [Invisible]
 * <create three-sided face>:`. The fourth point makes a face, Enter there a
 * triangle (its fourth corner its third); either way the command goes on at
 * the third point, the next face starting from the last one's third and
 * fourth corners, each its own object. Enter at the first or third point
 * ends it, and the second refuses it (`Point or option keyword required.`,
 * f05). Invisible, before a point, hides the edge that starts there (DXF
 * 70's bit; typed twice it stays hidden, f06); the next face's first edge,
 * the last one's third, keeps its hiding, and a triangle's fourth edge hides
 * with its third (f06: 13). Each point keeps its own Z, and a rubber band
 * runs from the last one (the trace's base point). Each face wears the
 * current properties.
 */
export class Face3dTool implements Tool {
  readonly id = "face3d"

  /** The corners given so far of the face being made. */
  private points: Vec3[] = []
  /** Whether the edge from each of those corners is hidden. */
  private hidden: boolean[] = []
  /** Invisible typed before the next point. */
  private hideNext = false
  private cursor: Vec3 | null = null
  private lastScreen: Vec2 | null = null

  onActivate(ctx: ToolContext): void {
    this.reset()
    ctx.setCursor("crosshair")
    this.openInput(ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    this.reset()
    ctx.dynamicInput.close()
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen
    this.cursor = input.point
    ctx.dynamicInput.setPosition(input.screen)
    ctx.requestRender()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button === 0) this.take(input.point, ctx)
  }

  onEnter(ctx: ToolContext): boolean {
    return this.enter(ctx)
  }

  wantsSnap(): boolean {
    return true
  }

  getConstraintAnchor(): Vec3 | null {
    return this.points[this.points.length - 1] ?? null
  }

  question(): ToolQuestion | PromptId {
    switch (this.phase()) {
      case "first":
        return "face3dFirstPoint"
      case "second":
        return "face3dSecondPoint"
      case "third":
        return { id: "face3dThirdPoint", enter: "exitFace3d" }
      case "fourth":
        return { id: "face3dFourthPoint", enter: "createThreeSidedFace" }
    }
  }

  commandOptions(): readonly CommandOption[] {
    return [{ id: "Invisible" }]
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    if (id !== "Invisible") return "unhandled"
    this.hideNext = true
    this.openInput(ctx)
    return "continue"
  }

  /** The edges given so far and the rubber band to the cursor, in the current colour. */
  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
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

  private phase(): FacePhase {
    return PHASES[Math.min(this.points.length, 3)]
  }

  private reset(): void {
    this.points = []
    this.hidden = []
    this.hideNext = false
    this.cursor = null
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

  /** Enter: the end at the first and third points, a triangle at the fourth. */
  private enter(ctx: ToolContext): boolean {
    switch (this.phase()) {
      case "first":
      case "third":
        return false
      case "second":
        ctx.report(ctx.text.message("pointOrKeywordRequired"), "error")
        return true
      case "fourth": {
        // Its fourth edge hides with its third, or with an Invisible typed
        // before this Enter (f06: 13; f14: 8, the next face clear).
        const third = this.points[2]
        this.make(
          [...this.points, third],
          [...this.hidden, this.hideNext || this.hidden[2]],
          ctx
        )
        return true
      }
    }
  }

  private take(point: Vec3, ctx: ToolContext): void {
    this.points = [...this.points, point]
    this.hidden = [...this.hidden, this.hideNext]
    this.hideNext = false
    if (this.points.length === 4) {
      this.make(this.points, this.hidden, ctx)
      return
    }
    this.openInput(ctx)
  }

  /** One face made, and the next one begun from its third and fourth corners. */
  private make(points: Vec3[], hidden: boolean[], ctx: ToolContext): void {
    const flags = hidden.reduce((bits, h, i) => (h ? bits | (1 << i) : bits), 0)
    const [a, b, c, d] = points
    // Updated before the commit, which rebuilds the state (cad-tools.md).
    this.points = [c, d]
    this.hideNext = false
    // The shared edge keeps its hiding; the one from the fourth corner does
    // not pass on (f08: a hidden fourth edge, then a face of 70 0).
    this.hidden = [hidden[2], false]
    const made = createFace3d(
      [a, b, c, d],
      flags,
      ctx.document.getCurrentLayerId()
    )
    ctx.execute(new AddEntityCommand(withCurrentProperties(made, ctx)))
    this.openInput(ctx)
  }
}
