import { Tool, ToolContext } from "./Tool"

/**
 * AutoCAD's REGEN and REGENALL: they redraw and say `Regenerating model.`,
 * asking nothing; U names the step and takes nothing back, saying no more
 * (probe primitives/p502). Here every object is drawn from the drawing as it
 * is, so there is no display list to rebuild (ISOLINES, `systemVariables.ts`),
 * and with one viewport the two do the same.
 */
export class RegenTool implements Tool {
  constructor(readonly id: "regen" | "regenall") {}

  onActivate(ctx: ToolContext): void {
    ctx.regenerate("once")
    ctx.requestRender()
    ctx.endCommand()
  }

  wantsSnap(): boolean {
    return false
  }
}
