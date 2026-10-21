import { V, Vec2 } from "../../geometry/Vec2"
import { Vec3 } from "../../geometry/Vec3"
import { Entity, entitiesBounds } from "../../domain/entities"
import { RemoveEntitiesCommand } from "../commands/entityCommands"
import { parseCoordinate } from "../input/coordinateInput"
import { SelectionActionTool } from "./SelectionActionTool"
import type { PromptId } from "../../locales/types"
import { CommandOption, PointerInput, QuestionInput, ToolContext } from "./Tool"

/**
 * COPYCLIP copies, CUTCLIP copies and erases, COPYBASE copies relative to a
 * point you pick — three spellings of one gesture, so one class.
 */
export type ClipboardCopyMode = "copy" | "cut" | "base"

/**
 * AutoCAD's clipboard copies. Each is a "Select objects" prompt that ends in a
 * fragment on the clipboard, which is exactly {@link SelectionActionTool}, so
 * a pre-selection copies straight away and Ctrl+C on an empty selection asks
 * what to copy.
 *
 * The base point is the difference between them, and it is what a later paste
 * lands on the cursor:
 *
 * - COPYCLIP and CUTCLIP use the **lower-left corner of the extents of the
 *   objects** ("the cursor location is based on the lower-left corner of the
 *   extents of the objects you selected");
 * - COPYBASE asks for one first — "Select the base point. Select the objects to
 *   copy and press Enter" — which is why it is the precise way to move geometry
 *   between drawings.
 */
export class CopyClipTool extends SelectionActionTool {
  private base: Vec3 | null = null
  private awaitingBase = false
  /** Whether it copied a set selected before it, which it then keeps. */
  private keeps = false
  private preselected = false

  constructor(
    private readonly mode: ClipboardCopyMode,
    readonly id: string
  ) {
    super()
  }

  onActivate(ctx: ToolContext): void {
    this.base = null
    this.keeps = false
    this.preselected = !ctx.selection.isEmpty()
    this.awaitingBase = this.mode === "base"
    if (!this.awaitingBase) {
      super.onActivate(ctx)
      return
    }
    ctx.setCursor("crosshair")
    ctx.dynamicInput.open({
      fields: [
        { id: "base", prompt: "clipboardBasePoint", kind: "coordinate" },
      ],
      commit: () => {},
      commitRaw: (commitCtx) => {
        const point = parseCoordinate(
          commitCtx.dynamicInput.getText("base").trim(),
          {
            lastPoint: commitCtx.lastPoint,
            relativeByDefault: false,
            ucs: commitCtx.ucs,
            elevation: commitCtx.elevation,
          }
        )
        if (point) this.setBase(point, commitCtx)
        return true
      },
    })
  }

  onDeactivate(ctx: ToolContext): void {
    super.onDeactivate(ctx)
    this.base = null
    this.awaitingBase = false
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (!this.awaitingBase) {
      super.onPointerDown(input, ctx)
      return
    }
    if (input.button === 0) this.setBase(input.point, ctx)
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    if (this.awaitingBase) {
      ctx.dynamicInput.setPosition(input.screen)
      return
    }
    super.onPointerMove(input, ctx)
  }

  /** COPYBASE asks its base point before the objects. */
  question(): PromptId {
    return this.awaitingBase ? "clipboardBasePoint" : super.question()
  }

  takes(): QuestionInput | null {
    return this.awaitingBase ? null : super.takes()
  }

  // WHY COPYCLIP's whole and CUTCLIP's with sub-objects: their refusals list
  // so (erase/p259). COPYBASE's was not probed: it keeps the default.
  protected selectionInput(): QuestionInput {
    return this.mode === "copy" ? "wholeObjects" : super.selectionInput()
  }

  commandOptions(): readonly CommandOption[] {
    return this.awaitingBase ? [] : super.commandOptions()
  }

  // WHY COPYCLIP's preselection alone: `(ssget "_I")` still holds it after
  // the copy (erase/p250), and is nil after a set picked at its prompt
  // (p263) and after other commands. COPYBASE's was not probed.
  keepsSelection(): boolean {
    return this.keeps
  }

  wantsSnap(): boolean {
    return this.awaitingBase || super.wantsSnap()
  }

  protected run(entities: readonly Entity[], ctx: ToolContext): void {
    ctx.copyToClipboard(entities, this.base ?? lowerLeft(entities, ctx))
    this.keeps = this.mode === "copy" && this.preselected
    if (this.mode !== "cut") return
    ctx.execute(new RemoveEntitiesCommand(entities.map((entity) => entity.id)))
    ctx.selection.clear()
  }

  private setBase(point: Vec3, ctx: ToolContext): void {
    this.base = point
    this.awaitingBase = false
    ctx.dynamicInput.close()
    ctx.setCursor("default")
    this.begin(ctx)
  }
}

function lowerLeft(entities: readonly Entity[], ctx: ToolContext): Vec2 {
  return entitiesBounds(entities, ctx.blocks)?.min ?? V.zero()
}
