import { Vec2 } from "../../geometry/Vec2"
import { SnapType } from "../snapping/types"
import { OSNAP_MODES, OSNAP_MODE_IDS, OSNAP_OFF } from "../snapping/osnapModes"
import { PointerInput, Tool, ToolContext } from "./Tool"

/**
 * AutoCAD's -OSNAP: `Current osnap modes: End,Cen,Int,Ext`, then `Enter list
 * of object snap modes:` — "names of object snap modes separated with commas,
 * or enter none or off", each typed by its capitals (END, MID, CEN…). The
 * list replaces the running set; Enter alone keeps it. A list that names a
 * mode it does not know asks again, as COLOR does with a colour it does not
 * know.
 */
export class OsnapTool implements Tool {
  readonly id = "osnap"

  private lastScreen: Vec2 | null = null

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    ctx.report(
      ctx.text.message("currentOsnapModes", {
        modes: this.modeList(ctx, ctx.runningSnaps.enabled()),
      })
    )
    this.ask(ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    ctx.dynamicInput.close()
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen
    ctx.dynamicInput.setPosition(input.screen)
  }

  wantsSnap(): boolean {
    return false
  }

  private ask(ctx: ToolContext): void {
    ctx.dynamicInput.open({
      fields: [{ id: "modes", prompt: "osnapModes", kind: "text" }],
      commit: () => {},
      commitRaw: (commitCtx) => this.answer(commitCtx),
    })
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }

  private answer(ctx: ToolContext): boolean {
    const typed = ctx.dynamicInput.getText("modes").trim()
    if (typed === "") {
      ctx.endCommand()
      return true
    }
    const types = new Set<SnapType>()
    for (const entry of typed.split(",")) {
      const id = ctx.text.resolveKeyword(entry, [...OSNAP_MODE_IDS, OSNAP_OFF])
      if (id === null) {
        this.ask(ctx)
        return true
      }
      const mode = id === OSNAP_OFF ? "none" : OSNAP_MODES[id]
      if (mode !== "none") types.add(mode)
    }
    ctx.runningSnaps.set([...types])
    ctx.endCommand()
    return true
  }

  /** The modes as AutoCAD lists them: `End,Cen,Int,Ext`, or `None`. */
  private modeList(ctx: ToolContext, enabled: readonly SnapType[]): string {
    const ids = OSNAP_MODE_IDS.filter((id) => {
      const mode = OSNAP_MODES[id]
      return mode !== "none" && enabled.includes(mode)
    })
    const words =
      ids.length > 0
        ? ids.map((id) => ctx.text.abbreviation(id))
        : [ctx.text.keyword("NONe")]
    return words.map(capitalized).join(",")
  }
}

function capitalized(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
}
