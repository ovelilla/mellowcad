import type { DocumentSettings, UcsIconSetting } from "../../domain/units"
import { UpdateSettingsCommand } from "../commands/settingsCommands"
import type { PromptId } from "../../locales/types"
import { CommandOption, CommandOptionOutcome, Tool, ToolContext } from "./Tool"
import { SystemVariableTool } from "./SystemVariableTool"

const CHANGE_BY_KEYWORD: Readonly<Record<string, Partial<UcsIconSetting>>> = {
  ON: { visible: true },
  OFF: { visible: false },
  Noorigin: { atOrigin: false },
  ORigin: { atOrigin: true },
}

/**
 * AutoCAD's UCSICON: `[ON/OFF/All/Noorigin/ORigin/Selectable/Properties]`.
 * The UCSICON variable it sets is saved in the drawing. There is one viewport
 * and the icon has no grips or dialog, so All, Selectable and Properties are
 * not offered.
 */
export class UcsIconTool implements Tool {
  readonly id = "ucsicon"

  private shown = true

  onActivate(ctx: ToolContext): void {
    this.shown = ctx.document.getSettings().ucsIcon.visible
    ctx.selection.clear()
    ctx.dynamicInput.open({ fields: [], commit: () => {} })
  }

  onDeactivate(ctx: ToolContext): void {
    ctx.dynamicInput.close()
  }

  question(): PromptId {
    return "enterAnOption"
  }

  commandOptions(): readonly CommandOption[] {
    return Object.keys(CHANGE_BY_KEYWORD).map((id) => ({ id }))
  }

  defaultOption(): string {
    return this.shown ? "ON" : "OFF"
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    const change = CHANGE_BY_KEYWORD[id]
    if (!change) return "unhandled"
    const current = ctx.document.getSettings().ucsIcon
    const next = { ...current, ...change }
    if (
      next.visible !== current.visible ||
      next.atOrigin !== current.atOrigin
    ) {
      ctx.execute(new UpdateSettingsCommand({ ucsIcon: next }))
    }
    return "end"
  }

  wantsSnap(): boolean {
    return false
  }
}

/**
 * The UCSICON system variable, typed with an apostrophe ('UCSICON) or bare in a
 * language whose command has another name: `Enter new value for UCSICON
 * <3>:`, 1 for the icon shown and 2 for it at the origin, "Requires an
 * integer between 0 and 3." for anything else, as AutoCAD 2027's console asks
 * (probes ucs/p353–p356).
 */
export class UcsIconVariableTool extends SystemVariableTool {
  readonly id = "ucsiconvariable"
  protected readonly variable = "UCSICON"
  protected readonly max = 3

  protected read({ ucsIcon }: DocumentSettings): number {
    return (ucsIcon.visible ? 1 : 0) + (ucsIcon.atOrigin ? 2 : 0)
  }

  protected settingsFor(value: number): Partial<DocumentSettings> {
    return {
      ucsIcon: { visible: (value & 1) !== 0, atOrigin: (value & 2) !== 0 },
    }
  }
}
