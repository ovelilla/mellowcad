import { Entity, RegionEntity, Solid3dEntity } from "../../domain/entities"
import {
  BooleanOutcome,
  combineRegions,
  subtractRegions,
} from "../../domain/regionModeling"
import {
  SolidOutcome,
  combineSolids,
  subtractSolids,
} from "../../domain/solidModeling"
import { ReplaceEntitiesCommand } from "../commands/entityCommands"
import { SelectionActionTool } from "./SelectionActionTool"
import { QuestionInput, ToolContext } from "./Tool"

function regionsOf(entities: readonly Entity[]): RegionEntity[] {
  return entities.filter((e): e is RegionEntity => e.type === "region")
}

function solidsOf(entities: readonly Entity[]): Solid3dEntity[] {
  return entities.filter((e): e is Solid3dEntity => e.type === "solid3d")
}

/**
 * The outcomes as one undo step (union/s06: U takes it back whole): each
 * result kept in its first object's place, the rest erased. Regions and
 * solids are combined apart, each with its own (union/s01, s09).
 */
function apply(
  regions: BooleanOutcome | null,
  solids: SolidOutcome | null,
  ctx: ToolContext
): void {
  for (let i = 0; i < (regions?.nullResults ?? 0); i++) {
    ctx.report(ctx.text.message("nullRegion"))
  }
  if (solids?.nullResult) ctx.report(ctx.text.message("nullSolid"))
  // WHY: AutoCAD's own words when ACIS fails one (22133); here also for a
  // pair of surfaces this kernel has no intersection for (docs/coverage).
  if (solids?.failed)
    ctx.report(ctx.text.message("booleanFailed", { count: 1 }))
  const changed = [...(regions?.changed ?? []), ...(solids?.changed ?? [])]
  const erased = [...(regions?.erased ?? []), ...(solids?.erased ?? [])]
  if (changed.length === 0 && erased.length === 0) return
  ctx.execute(
    new ReplaceEntitiesCommand(
      [...erased, ...changed.map((entity) => entity.id)],
      changed
    )
  )
}

/**
 * AutoCAD's UNION and INTERSECT of solids and regions — one class, a mode
 * per command. `Select objects:` counts whatever it finds; what is neither is
 * passed over. The solids become one (union/s04), the regions plane by plane
 * (region/b08); with fewer than two solids and two regions in any one plane
 * it says so (region/b07, union/s05, s10). A result of nothing erases them
 * (region/b05, union/s02).
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
    const regions = combineRegions(this.id, regionsOf(entities))
    const solids = combineSolids(this.id, solidsOf(entities))
    if (regions === null && solids === null) {
      ctx.report(ctx.text.message("booleanNeedsTwo"))
      return
    }
    apply(regions, solids, ctx)
  }
}

/**
 * AutoCAD's SUBTRACT of solids and regions: `Select solids, surfaces, and
 * regions to subtract from ..`, a set; then `… to subtract ..`, another;
 * Enter on an empty one ends it doing nothing (region/b07). The first set's
 * solids are joined and the second's taken out of them (union/s03); its
 * regions of a plane likewise with the second's of that plane (b02, b06,
 * b10); a region left nothing to take from stays (s03).
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
    apply(
      subtractRegions(regionsOf(this.from), regionsOf(entities)),
      subtractSolids(solidsOf(this.from), solidsOf(entities)),
      ctx
    )
    return false
  }
}
