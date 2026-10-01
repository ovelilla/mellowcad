import { Vec2 } from "../../geometry/Vec2"
import { Ucs, WORLD_UCS, ucsZAxis } from "../../domain/ucs"
import type { PromptId } from "../../locales/types"
import { entitiesViewBounds } from "../Viewport"
import {
  CommandOption,
  CommandOptionOutcome,
  PointerInput,
  Tool,
  ToolContext,
} from "./Tool"
import { findNamed, listNamedUcs } from "./UcsTool"

type PlanState =
  | { readonly phase: "option" }
  | { readonly phase: "name" }
  | { readonly phase: "list" }

/** Screen margin left round the extents, as ZOOM Extents leaves it. */
const PADDING_PX = 40

/**
 * AutoCAD's PLAN: `[Current ucs/Ucs/World] <Current>`. It looks down the
 * chosen UCS's Z axis with its X axis pointing right and fits the drawing's
 * extents; the current UCS stays as it was. ZOOM Previous steps back through
 * it; U does not, as it does not undo ZOOM here either. It works in the WCS,
 * where the UCSs it names are.
 */
export class PlanTool implements Tool {
  readonly id = "plan"
  readonly inWorld = true

  private state: PlanState = { phase: "option" }
  private lastScreen: Vec2 | null = null

  onActivate(ctx: ToolContext): void {
    this.state = { phase: "option" }
    ctx.setCursor("crosshair")
    ctx.dynamicInput.open({ fields: [], commit: () => {} })
    this.place(ctx)
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
    if (this.state.phase !== "option") return false
    this.plan(ctx.ucs, ctx)
    ctx.endCommand()
    return true
  }

  wantsSnap(): boolean {
    return false
  }

  commandOptions(): readonly CommandOption[] {
    if (this.state.phase !== "option") return []
    return [{ id: "Current ucs" }, { id: "Ucs" }, { id: "World" }]
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    if (this.state.phase !== "option") return "unhandled"
    switch (id) {
      case "Current ucs":
        this.plan(ctx.ucs, ctx)
        return "end"
      case "World":
        this.plan(WORLD_UCS, ctx)
        return "end"
      case "Ucs":
        this.ask("name", ctx)
        return "continue"
      default:
        return "unhandled"
    }
  }

  private ask(phase: "name" | "list", ctx: ToolContext): void {
    this.state = { phase }
    const prompt: PromptId = phase === "name" ? "planUcsName" : "ucsListNames"
    ctx.dynamicInput.open({
      fields: [{ id: "name", prompt, kind: "text" }],
      commit: () => {},
      commitRaw: (commitCtx) => {
        this.answer(commitCtx.dynamicInput.getText("name").trim(), commitCtx)
        return true
      },
    })
    this.place(ctx)
  }

  private answer(typed: string, ctx: ToolContext): void {
    if (this.state.phase === "list") {
      listNamedUcs(typed === "" ? "*" : typed, ctx)
      return this.ask("name", ctx)
    }
    if (typed === "?") return this.ask("list", ctx)
    const entry = findNamed(ctx.document.getSettings().namedUcs, typed)
    if (!entry) {
      if (typed !== "") {
        ctx.report(ctx.text.message("ucsUndefined", { name: typed }), "error")
      }
      return this.ask("name", ctx)
    }
    this.plan(entry.ucs, ctx)
    ctx.endCommand()
  }

  /** A plan view of `ucs`: down its Z axis, its X axis to the right, the extents in view. */
  private plan(ucs: Ucs, ctx: ToolContext): void {
    const { viewport } = ctx
    viewport.pushHistory()
    viewport.setView(ucsZAxis(ucs), ucs.xAxis)
    const bounds = entitiesViewBounds(
      ctx.document.getEntities(),
      viewport,
      ctx.blocks
    )
    if (bounds) viewport.zoomToViewBounds(bounds.min, bounds.max, PADDING_PX)
  }

  private place(ctx: ToolContext): void {
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }
}
