import { Vec2 } from "../../geometry/Vec2"
import {
  CommandOption,
  CommandOptionOutcome,
  PointerInput,
  Tool,
  ToolContext,
  ToolQuestion,
} from "./Tool"

type SnapState =
  | { readonly phase: "spacing" }
  | { readonly phase: "horizontal" }
  | { readonly phase: "vertical"; readonly horizontal: number }

/**
 * AutoCAD's SNAP: `Specify snap spacing or [ON/OFF/Aspect] <10.0000>:`. A
 * spacing, typed or two points apart, sets SNAPUNIT's X and Y and turns snap
 * mode on; Enter turns it on at the spacing it has; ON and OFF turn it on and
 * off; Aspect asks `Specify horizontal spacing` and `Specify vertical spacing`
 * and turns it on. With the two spacings apart the default is Aspect, `<A>`
 * (es `<asP>`), which Enter opens. A spacing not above zero says
 * `Value must be positive and nonzero.` and the prompt stays (probes line/p38,
 * p158, p212, p213). F9 toggles the same mode.
 *
 * WHY no Legacy, Style or Type: they are not built, so the prompt lists what
 * is, as TRIM leaves out Project; the unlisted Rotate is not offered either.
 */
export class SnapTool implements Tool {
  readonly id = "snap"

  private state: SnapState = { phase: "spacing" }
  private lastScreen: Vec2 | null = null
  /** SNAPUNIT as the command found it, which the prompts offer. */
  private spacing: Vec2 = { x: 10, y: 10 }

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    this.spacing = ctx.snapMode.spacing()
    this.state = { phase: "spacing" }
    this.ask(ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    this.state = { phase: "spacing" }
    ctx.dynamicInput.close()
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen
    ctx.dynamicInput.setPosition(input.screen)
  }

  wantsSnap(): boolean {
    return false
  }

  /** WHY `<A>`, not the keyword: AutoCAD's default names it short (table 25931). */
  question(): ToolQuestion {
    switch (this.state.phase) {
      case "spacing":
        return this.aspect()
          ? { id: "snapSpacingOr", enter: "snapAspect" }
          : { id: "snapSpacingOr", enter: this.spacing.x }
      case "horizontal":
        return { id: "snapHorizontalSpacing", enter: this.spacing.x }
      case "vertical":
        return { id: "snapVerticalSpacing", enter: this.spacing.y }
    }
  }

  commandOptions(): readonly CommandOption[] {
    return this.state.phase === "spacing"
      ? [{ id: "ON" }, { id: "OFF" }, { id: "Aspect" }]
      : []
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    if (this.state.phase !== "spacing") return "unhandled"
    switch (id) {
      case "ON":
      case "OFF":
        ctx.snapMode.set(id === "ON")
        return "end"
      case "Aspect":
        this.state = { phase: "horizontal" }
        this.ask(ctx)
        return "continue"
      default:
        return "unhandled"
    }
  }

  private aspect(): boolean {
    return this.spacing.x !== this.spacing.y
  }

  private ask(ctx: ToolContext): void {
    const phase = this.state.phase
    const prompt =
      phase === "spacing"
        ? "snapSpacingOr"
        : phase === "horizontal"
          ? "snapHorizontalSpacing"
          : "snapVerticalSpacing"
    ctx.dynamicInput.open({
      fields: [{ id: "spacing", prompt, kind: "distance" }],
      commit: (values, commitCtx) => this.answer(values.spacing, commitCtx),
      commitRaw: (commitCtx) => {
        if (commitCtx.dynamicInput.hasTypedText()) return false
        if (this.state.phase !== "spacing" || !this.aspect()) return false
        this.invokeOption("Aspect", commitCtx)
        return true
      },
    })
    if (phase !== "spacing" || !this.aspect()) {
      ctx.dynamicInput.setDefault(
        "spacing",
        phase === "vertical" ? this.spacing.y : this.spacing.x
      )
    }
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }

  private answer(value: number, ctx: ToolContext): void {
    if (!Number.isFinite(value)) return
    if (value <= 0) {
      ctx.report(ctx.text.message("positiveNonzero"), "error")
      return
    }
    const state = this.state
    if (state.phase === "horizontal") {
      this.state = { phase: "vertical", horizontal: value }
      this.ask(ctx)
      return
    }
    const x = state.phase === "vertical" ? state.horizontal : value
    ctx.snapMode.set(true, { x, y: value })
    ctx.endCommand()
  }
}
