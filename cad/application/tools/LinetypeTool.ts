import { Vec2 } from "../../geometry/Vec2"
import { LINETYPE_BYLAYER, LINETYPES, LinetypeId } from "../../domain/linetypes"
import { UpdateSettingsCommand } from "../commands/settingsCommands"
import {
  CommandOption,
  CommandOptionOutcome,
  PointerInput,
  Tool,
  ToolContext,
} from "./Tool"

const BY_LAYER = "BYLAYER"

/**
 * AutoCAD's -LINETYPE, which LINETYPE runs too (its Linetype Manager does not
 * exist here): `Enter an option [?/Create/Load/Set]:`, asked again after each
 * answer until Enter. Set (`Specify linetype name or [?] <ByLayer>:`) sets
 * CELTYPE, the linetype new objects take, saved in the drawing and undone
 * with U: a linetype's name, or `bylayer`; `?` lists the loaded linetypes.
 * Every linetype this build ships is loaded, so `?` at the first prompt — the
 * linetypes of a LIN file — lists the same ones. A name that is not one of
 * them returns to the Command prompt, as AutoCAD does when the LIN file has
 * no definition (its message is not documented, so none is written).
 *
 * Not done: Create and Load (there is no LIN file to read or write), ByBlock.
 */
export class LinetypeTool implements Tool {
  readonly id = "linetype"

  private phase: "option" | "name" = "option"
  private lastScreen: Vec2 | null = null

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    this.askOption(ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    this.phase = "option"
    ctx.dynamicInput.close()
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen
    ctx.dynamicInput.setPosition(input.screen)
  }

  wantsSnap(): boolean {
    return false
  }

  commandOptions(): readonly CommandOption[] {
    return this.phase === "option" ? [{ id: "Set" }] : []
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    if (this.phase !== "option" || id !== "Set") return "unhandled"
    this.askName(ctx)
    return "continue"
  }

  /** `?` has no capital to type, so the option is a value box that still takes Set. */
  private askOption(ctx: ToolContext): void {
    this.phase = "option"
    ctx.dynamicInput.open({
      fields: [{ id: "option", prompt: "linetypeOption", kind: "number" }],
      commit: () => {},
      commitRaw: (commitCtx) => {
        const typed = commitCtx.dynamicInput.getText("option").trim()
        if (typed === "") {
          commitCtx.endCommand()
          return true
        }
        if (typed !== "?") return false
        this.list(commitCtx)
        this.askOption(commitCtx)
        return true
      },
    })
    this.place(ctx)
  }

  private askName(ctx: ToolContext): void {
    this.phase = "name"
    ctx.dynamicInput.open({
      fields: [{ id: "name", prompt: "linetypeName", kind: "text" }],
      commit: () => {},
      commitRaw: (commitCtx) => {
        this.answerName(
          commitCtx.dynamicInput.getText("name").trim(),
          commitCtx
        )
        return true
      },
    })
    const current = ctx.document.getSettings().currentLinetype
    ctx.dynamicInput.setLiveText(
      "name",
      current === LINETYPE_BYLAYER ? ctx.text.keywordList([BY_LAYER]) : current
    )
    this.place(ctx)
  }

  private answerName(typed: string, ctx: ToolContext): void {
    if (typed === "?") {
      this.list(ctx)
      return this.askName(ctx)
    }
    if (typed === "") return this.askOption(ctx)
    const linetype: LinetypeId | null =
      ctx.text.resolveKeyword(typed, [BY_LAYER]) === BY_LAYER
        ? LINETYPE_BYLAYER
        : (LINETYPES.find(
            (entry) => entry.id.toLowerCase() === typed.toLowerCase()
          )?.id ?? null)
    if (linetype === null) return ctx.endCommand()
    if (linetype !== ctx.document.getSettings().currentLinetype) {
      ctx.execute(new UpdateSettingsCommand({ currentLinetype: linetype }))
    }
    this.askOption(ctx)
  }

  private list(ctx: ToolContext): void {
    ctx.report(LINETYPES.map((entry) => entry.id).join("\n"))
  }

  private place(ctx: ToolContext): void {
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }
}
