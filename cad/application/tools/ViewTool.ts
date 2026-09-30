import { Vec2 } from "../../geometry/Vec2"
import { VIEW_PRESETS, ViewPreset, lookFrom } from "./viewPresets"
import {
  CommandOption,
  CommandOptionOutcome,
  PointerInput,
  Tool,
  ToolContext,
} from "./Tool"

type ViewState =
  { readonly phase: "option" } | { readonly phase: "orthographic" }

const ORTHOGRAPHIC: readonly ViewPreset[] = [
  "Top",
  "Bottom",
  "Front",
  "BAck",
  "Left",
  "Right",
]
const ISOMETRIC: readonly ViewPreset[] = ["SWiso", "SEiso", "NEiso", "NWiso"]

/**
 * AutoCAD's -VIEW, which VIEW runs too (its View Manager is not built), with
 * the preset views only: Orthographic and its six views, plus the preset names
 * AutoCAD's own menus type at the first prompt (`_-VIEW _SWISO`), which it
 * answers without listing them. A preset fits the drawing's extents; named
 * views (`?`, Delete, Restore, Save, sEttings, Window) wait for saved views.
 */
export class ViewTool implements Tool {
  readonly id = "view"

  private state: ViewState = { phase: "option" }
  private lastScreen: Vec2 | null = null

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    this.ask({ phase: "option" }, ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    this.state = { phase: "option" }
    ctx.dynamicInput.close()
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen
    ctx.dynamicInput.setPosition(input.screen)
  }

  onEnter(ctx: ToolContext): boolean {
    if (this.state.phase === "option") return false
    if (lookFrom(VIEW_PRESETS.Top, ctx)) ctx.endCommand()
    return true
  }

  wantsSnap(): boolean {
    return false
  }

  commandOptions(): readonly CommandOption[] {
    if (this.state.phase === "orthographic") {
      return ORTHOGRAPHIC.map((id) => ({ id }))
    }
    return [
      { id: "Orthographic" },
      ...[...ORTHOGRAPHIC, ...ISOMETRIC].map((id) => ({
        id,
        hidden: true as const,
      })),
    ]
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    if (this.state.phase === "option" && id === "Orthographic") {
      this.ask({ phase: "orthographic" }, ctx)
      return "continue"
    }
    if (!(id in VIEW_PRESETS)) return "unhandled"
    return lookFrom(VIEW_PRESETS[id as ViewPreset], ctx) ? "end" : "continue"
  }

  private ask(state: ViewState, ctx: ToolContext): void {
    this.state = state
    ctx.dynamicInput.open({ fields: [], commit: () => {} })
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }
}
