import type { PromptId } from "../../locales/types"
import { VisualStyle } from "../../domain/units"
import { UpdateSettingsCommand } from "../commands/settingsCommands"
import {
  CommandOption,
  CommandOptionOutcome,
  Tool,
  ToolContext,
  ToolQuestion,
} from "./Tool"

/** Each style built, by the keyword that sets it and the name `<…>` offers it by. */
const STYLES: readonly {
  readonly option: string
  readonly style: VisualStyle
  readonly name: PromptId
}[] = [
  { option: "2dwireframe", style: "2dWireframe", name: "vscurrent2dWireframe" },
  { option: "Hidden", style: "hidden", name: "vscurrentHidden" },
]

/**
 * AutoCAD's VSCURRENT (SHADEMODE runs it): `Enter an option [2dwireframe/
 * Wireframe/Hidden/Realistic/Conceptual/Shaded/shaded with Edges/shades of
 * Gray/SKetchy/X-ray/Other] <2dwireframe>:`, the current style's name as the
 * default (tables 23335, 23337), Enter keeping it. The style is the view's,
 * saved in the drawing as its viewport's (visualstyle/v03, v04); a run is a
 * step U undoes (`VSCURRENT`, es `ESTVISACTUAL`, v02). Back to 2D Wireframe
 * it says `Regenerating model.`, its U does not (v02). Not transparent
 * (`** That command may not be invoked transparently **`, v02). Only the
 * styles built are offered: the rest, and Other's named style, are
 * refused as any answer (docs/coverage/view.md).
 */
export class VsCurrentTool implements Tool {
  readonly id = "vscurrent"

  private current: VisualStyle = "2dWireframe"

  onActivate(ctx: ToolContext): void {
    this.current = ctx.document.getSettings().visualStyle
    ctx.selection.clear()
    ctx.dynamicInput.open({ fields: [], commit: () => {} })
  }

  onDeactivate(ctx: ToolContext): void {
    ctx.dynamicInput.close()
  }

  // WHY not `enterAnOption`: pt-BR words this one `Insira uma opção` (23314).
  question(): ToolQuestion {
    const name = STYLES.find((s) => s.style === this.current)!.name
    return { id: "vscurrentOption", enter: name }
  }

  commandOptions(): readonly CommandOption[] {
    return STYLES.map(({ option }) => ({ id: option }))
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    const chosen = STYLES.find((s) => s.option === id)
    if (!chosen) return "unhandled"
    const was = this.current
    ctx.execute(new UpdateSettingsCommand({ visualStyle: chosen.style }))
    if (chosen.style === "2dWireframe" && was !== "2dWireframe") {
      ctx.regenerate("once")
    }
    return "end"
  }

  wantsSnap(): boolean {
    return false
  }
}
