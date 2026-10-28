import { Vec2 } from "../../geometry/Vec2"
import { ucsFromAxes } from "../../domain/ucs"
import { UpdateSettingsCommand } from "../commands/settingsCommands"
import { VIEW_PRESETS, ViewPreset, lookFrom } from "./viewPresets"
import { ORTHOGRAPHIC_OPTIONS, ucsChange } from "./UcsTool"
import type { PromptId } from "../../locales/types"
import {
  CommandOption,
  CommandOptionOutcome,
  PointerInput,
  Tool,
  ToolContext,
  ToolQuestion,
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
 * An orthographic view also aligns the UCS's XY plane with the screen, as
 * UCSORTHO's initial 1 does, from the WCS (UCSBASE's initial value), and
 * names it as UCS orthoGraphic does (`*FRONT*`, view/p304–p309). It works in
 * the WCS, the presets' reference.
 */
export class ViewTool implements Tool {
  readonly id = "view"
  readonly inWorld = true
  readonly changesView = true

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
    if (this.show("Top", ctx)) ctx.endCommand()
    return true
  }

  wantsSnap(): boolean {
    return false
  }

  /**
   * Two prompts of their own, as their keywords are spelled apart: the first
   * one's hidden `RIght`, Orthographic's `Right`, which writes its default
   * against the list (`[…/Right]<Top>:`).
   */
  question(): PromptId | ToolQuestion {
    return this.state.phase === "option"
      ? "viewOption"
      : { id: "viewOrthographic", tight: true }
  }

  defaultOption(): string | null {
    return this.state.phase === "orthographic" ? "Top" : null
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
    return this.show(id as ViewPreset, ctx) ? "end" : "continue"
  }

  private show(preset: ViewPreset, ctx: ToolContext): boolean {
    // Every view here regenerates, the one already shown too (view/p350),
    // which a transparent -VIEW cannot (p324, p334).
    if (ctx.runsTransparently()) {
      ctx.report(ctx.text.message("requiresRegen"))
      return true
    }
    if (!lookFrom(VIEW_PRESETS[preset], ctx)) return false
    ctx.regenerate()
    if (!ORTHOGRAPHIC.includes(preset)) return true
    const ucs = ucsFromAxes(
      { x: 0, y: 0, z: 0 },
      ctx.viewport.right,
      ctx.viewport.up
    )
    // An orthographic view puts ELEVATION back to 0, as UCS World does; an
    // iso view keeps it (probes ucs/p400, p403).
    const patch =
      ucs &&
      ucsChange(
        ctx.document.getSettings(),
        ucs,
        null,
        ORTHOGRAPHIC_OPTIONS[preset],
        { resetsElevation: true }
      )
    if (patch) ctx.execute(new UpdateSettingsCommand(patch))
    return true
  }

  private ask(state: ViewState, ctx: ToolContext): void {
    this.state = state
    ctx.dynamicInput.open({ fields: [], commit: () => {} })
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }
}
