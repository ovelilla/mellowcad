import { EntityId } from "../../domain/entities"
import { ToolContext } from "./Tool"

/**
 * The objects a pick or a window adds to the set at `Select objects:` (or
 * takes from it, with Shift), said on that prompt's line as AutoCAD says it:
 * `1 found`, `1 found, 2 total`, `Specify opposite corner: 3 found`,
 * `1 found, 1 removed, 1 total`. A pick on an object already in the set is
 * counted as found: AutoCAD's note of the duplicate is unverified.
 */
export function pickObjects(
  ids: readonly EntityId[],
  subtract: boolean,
  box: boolean,
  ctx: ToolContext
): void {
  const before = ctx.selection.size
  for (const id of ids) {
    if (subtract) ctx.selection.remove(id)
    else ctx.selection.add(id)
  }
  const total = before > 0 || subtract ? ctx.selection.size : null
  ctx.answer(
    ctx.text.message("objectsFound", {
      found: ids.length,
      removed: subtract ? before - ctx.selection.size : 0,
      total: total ?? 0,
      hasTotal: total === null ? "no" : "yes",
      box: box ? "yes" : "no",
    })
  )
}

/**
 * Objects selected before the command, counted after its echo as AutoCAD
 * counts them: `Command: M MOVE 3 found`.
 */
export function countPreselection(ctx: ToolContext): void {
  ctx.answer(
    ctx.text.message("objectsFound", {
      found: ctx.selection.size,
      removed: 0,
      total: 0,
      hasTotal: "no",
      box: "no",
    })
  )
}
