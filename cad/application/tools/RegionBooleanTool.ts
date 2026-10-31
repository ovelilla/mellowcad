import { Entity, RegionEntity } from "../../domain/entities"
import {
  BooleanOutcome,
  combineRegions,
  subtractRegions,
} from "../../domain/regionModeling"
import { ReplaceEntitiesCommand } from "../commands/entityCommands"
import { SelectionActionTool } from "./SelectionActionTool"
import { QuestionInput, ToolContext } from "./Tool"

function regionsOf(entities: readonly Entity[]): RegionEntity[] {
  return entities.filter((e): e is RegionEntity => e.type === "region")
}

/** The outcome as one undo step: each result kept in its region's place, the rest erased. */
function apply(outcome: BooleanOutcome, ctx: ToolContext): void {
  for (let i = 0; i < outcome.nullResults; i++) {
    ctx.report(ctx.text.message("nullRegion"))
  }
  if (outcome.changed.length === 0 && outcome.erased.length === 0) return
  ctx.execute(
    new ReplaceEntitiesCommand(
      [...outcome.erased, ...outcome.changed.map((region) => region.id)],
      outcome.changed
    )
  )
}

/**
 * AutoCAD's UNION and INTERSECT of regions — one class, a mode per command.
 * `Select objects:` counts whatever it finds; what is no region is passed
 * over, and with fewer than two in any one plane it says so
 * (region/b07). Regions in different planes are combined plane by plane
 * (b08). An intersection that leaves nothing erases them all (b05).
 */
export class RegionBooleanTool extends SelectionActionTool {
  readonly id: "union" | "intersect"

  constructor(mode: "union" | "intersect") {
    super()
    this.id = mode
  }

  protected selectionInput(): QuestionInput {
    return "wholeObjects"
  }

  protected run(entities: readonly Entity[], ctx: ToolContext): void {
    const outcome = combineRegions(this.id, regionsOf(entities))
    if (outcome === null) {
      ctx.report(ctx.text.message("booleanNeedsTwo"))
      return
    }
    apply(outcome, ctx)
  }
}

/**
 * AutoCAD's SUBTRACT of regions: `Select solids, surfaces, and regions to
 * subtract from ..`, a set; then `… to subtract ..`, another; Enter on an
 * empty one ends it doing nothing (region/b07). The first set's regions of a
 * plane are joined and the second's of that plane taken out of them
 * (b02, b06, b10).
 */
export class SubtractTool extends SelectionActionTool {
  readonly id = "subtract"
  private from: readonly Entity[] | null = null

  protected selectionInput(): QuestionInput {
    return "wholeObjects"
  }

  onActivate(ctx: ToolContext): void {
    this.from = null
    ctx.report(ctx.text.message("subtractFrom"))
    super.onActivate(ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    this.from = null
    super.onDeactivate(ctx)
  }

  protected run(entities: readonly Entity[], ctx: ToolContext): boolean {
    if (this.from === null) {
      this.from = entities
      ctx.selection.clear()
      ctx.report(ctx.text.message("subtractWhat"))
      this.begin(ctx)
      return true
    }
    apply(subtractRegions(regionsOf(this.from), regionsOf(entities)), ctx)
    return false
  }
}
