import { Entity, EntityId } from "../../domain/entities"
import { listReport, newestFirst } from "./listReport"
import { AddedBy } from "./objectSelection"
import { SelectionActionTool } from "./SelectionActionTool"
import { QuestionInput, ToolContext } from "./Tool"

/**
 * AutoCAD's LIST: `Select objects:`, then each object's report at the
 * command prompt (`listReport`), as AutoCAD 2027's console writes them
 * (probes inquiry/p400–p446). A preselection lists at once and is dropped
 * (p440); Enter on nothing ends without a word (p421).
 *
 * The order is the set's as AutoCAD builds it: picks as picked, what one mode
 * finds at once (ALL, a window, Previous) newest first (p420, p435), and a
 * preselection newest first (p421).
 *
 * WHY every line at once, no `Press ENTER to continue:` every screenful: the
 * pause pages AutoCAD's text window, whose height is the desktop's; the
 * history here scrolls (QAFLAGS 2's listing, which the probes read).
 */
export class ListTool extends SelectionActionTool {
  readonly id = "list"

  /** The set's objects in the order they joined it. */
  private order: EntityId[] = []

  onActivate(ctx: ToolContext): void {
    this.order = []
    super.onActivate(ctx)
  }

  // Objects on a locked layer are listed (p426); its refusal lists the modes
  // of a set of whole objects, ending at SIngle (p421).
  protected takesLocked(): boolean {
    return true
  }

  protected selectionInput(): QuestionInput {
    return "wholeObjects"
  }

  protected selectionAdded(ids: readonly EntityId[], added: AddedBy): void {
    this.order.push(...(added.by === "pick" ? ids : [...ids].reverse()))
  }

  protected run(entities: readonly Entity[], ctx: ToolContext): void {
    const ids = new Set(entities.map((entity) => entity.id))
    const joined = [...new Set(this.order)].filter((id) => ids.has(id))
    const preselected = newestFirst(
      [...ids].filter((id) => !joined.includes(id)),
      ctx
    )
    const ordered = [...preselected, ...joined]
    ctx.selection.clear()
    for (const id of ordered) {
      const entity = entities.find((candidate) => candidate.id === id)
      if (entity) ctx.report(listReport(entity, ctx).join("\n"))
    }
  }
}
