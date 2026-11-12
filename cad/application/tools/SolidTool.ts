import { Vec2 } from "../../geometry/Vec2"
import { Vec3, withZOf } from "../../geometry/Vec3"
import { createSolid2d } from "../../domain/entities"
import type { PromptId } from "../../locales/types"
import { AddEntityCommand } from "../commands/entityCommands"
import {
  isCoordinateExpression,
  parseCoordinate,
} from "../input/coordinateInput"
import {
  withCurrentProperties,
  withCurrentThickness,
} from "./currentProperties"
import {
  PointerInput,
  QuestionInput,
  Tool,
  ToolContext,
  ToolQuestion,
} from "./Tool"

type SolidState =
  | { readonly phase: "first" }
  | { readonly phase: "second"; readonly first: Vec3 }
  | { readonly phase: "third"; readonly first: Vec3; readonly second: Vec3 }
  | {
      readonly phase: "fourth"
      readonly first: Vec3
      readonly second: Vec3
      readonly third: Vec3
    }

/**
 * AutoCAD's SOLID (solid2d/p01–p03, tables 20607–20610): `Specify first
 * point:`, `Specify second point:`, `Specify third point:`, `Specify fourth
 * point or <exit>:`. The fourth makes a quadrilateral, Enter there a triangle
 * (its fourth corner its third); either way the command goes on at `Specify
 * third point:`, the next solid starting from the last one's third and fourth
 * corners, each its own object. Enter at the first point or at the third ends
 * it; the second refuses Enter (`Invalid 2D point.`). The first point's Z puts
 * the solids in its plane; the others are 2D points. No rubber band: none of
 * the prompts has a base point (p01's trace). Each solid wears the current
 * properties and THICKNESS (p07).
 */
export class SolidTool implements Tool {
  readonly id = "solid"

  private state: SolidState = { phase: "first" }
  private lastScreen: Vec2 | null = null

  onActivate(ctx: ToolContext): void {
    this.state = { phase: "first" }
    ctx.setCursor("crosshair")
    this.openInput(ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    this.state = { phase: "first" }
    ctx.dynamicInput.close()
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen
    ctx.dynamicInput.setPosition(input.screen)
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

  question(): ToolQuestion | PromptId {
    switch (this.state.phase) {
      case "first":
        return "solidFirstPoint"
      case "second":
        return "solidSecondPoint"
      case "third":
        return "solidThirdPoint"
      case "fourth":
        return { id: "solidFourthPointOr", enter: "exitSolid" }
    }
  }

  /** The points after the first are 2D: a Z is refused (solid2d/p03). */
  takes(): QuestionInput | null {
    return this.state.phase === "first" ? null : "point2d"
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
    switch (this.state.phase) {
      case "first":
      case "third":
        return false
      case "second":
        ctx.report(ctx.text.message("invalidPoint2d"), "error")
        return true
      case "fourth": {
        const { first, second, third } = this.state
        this.make(first, second, third, third, ctx)
        return true
      }
    }
  }

  private take(point: Vec3, ctx: ToolContext): void {
    const state = this.state
    switch (state.phase) {
      case "first":
        this.state = { phase: "second", first: point }
        break
      case "second":
        this.state = {
          phase: "third",
          first: state.first,
          second: withZOf(point, state.first),
        }
        break
      case "third":
        this.state = {
          phase: "fourth",
          first: state.first,
          second: state.second,
          third: withZOf(point, state.first),
        }
        break
      case "fourth":
        this.make(
          state.first,
          state.second,
          state.third,
          withZOf(point, state.first),
          ctx
        )
        return
    }
    this.openInput(ctx)
  }

  /** One solid made, and the next one begun from its third and fourth corners. */
  private make(
    first: Vec3,
    second: Vec3,
    third: Vec3,
    fourth: Vec3,
    ctx: ToolContext
  ): void {
    // Updated before the commit, which rebuilds the state (cad-tools.md).
    this.state = { phase: "third", first: third, second: fourth }
    const made = createSolid2d(
      [first, second, third, fourth],
      ctx.document.getCurrentLayerId()
    )
    ctx.execute(
      new AddEntityCommand(
        withCurrentProperties(withCurrentThickness(made, ctx), ctx)
      )
    )
    this.openInput(ctx)
  }
}
