import {
  Entity,
  EntityId,
  RegionEntity,
  Solid3dEntity,
} from "../../domain/entities"
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
import type { AddedBy, ModeFind } from "./objectSelection"
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
 * A set of the three booleans, kept in AutoCAD's order: its first object is
 * the one a result keeps (its id, layer and colour).
 */
abstract class BooleanSetTool extends SelectionActionTool {
  private order: EntityId[] = []

  // WHY: AutoCAD drops the set selected before them and asks, though MOVE
  // takes the same set in the same run (regions/p331–p335).
  protected takesPreselection(): boolean {
    return false
  }

  protected selectionInput(): QuestionInput {
    return "wholeObjects"
  }

  // WHY newest first: a window keeps the newest of three regions
  // (regions/p315), ALL the newest of two solids (union/s07, regions/p323), as
  // `ssget` lists them; picks as picked (p314, p322). A fence is unprobed and
  // kept as found, as JOIN keeps it; Previous is unprobed and taken as ALL.
  protected selectionAdded(
    ids: readonly EntityId[],
    added: AddedBy,
    find: ModeFind
  ): void {
    void added
    const newestFirst = find.by !== "fence"
    this.order = [
      ...this.order.filter((id) => !ids.includes(id)),
      ...(newestFirst ? [...ids].reverse() : ids),
    ]
  }

  /** The set's objects in its order. */
  protected ordered(entities: readonly Entity[]): Entity[] {
    const rank = new Map(this.order.map((id, index) => [id, index]))
    const at = (entity: Entity) => rank.get(entity.id) ?? rank.size
    return [...entities].sort((a, b) => at(a) - at(b))
  }

  /** Starts the order afresh, for a new set. */
  protected restartOrder(): void {
    this.order = []
  }

  onActivate(ctx: ToolContext): void {
    this.order = []
    super.onActivate(ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    this.order = []
    super.onDeactivate(ctx)
  }
}

/**
 * AutoCAD's UNION and INTERSECT of solids and regions — one class, a mode
 * per command. `Select objects:` counts whatever it finds; what is neither is
 * passed over. The solids become one (union/s04), the regions plane by plane
 * (region/b08), each into the first of the set's order; with fewer than two
 * solids and two regions in any one plane it says so (region/b07, union/s05,
 * s10). A result of nothing erases them (region/b05, union/s02).
 */
export class RegionBooleanTool extends BooleanSetTool {
  readonly id: "union" | "intersect"

  constructor(mode: "union" | "intersect") {
    super()
    this.id = mode
  }

  protected run(entities: readonly Entity[], ctx: ToolContext): void {
    const set = this.ordered(entities)
    const regions = combineRegions(this.id, regionsOf(set))
    const solids = combineSolids(this.id, solidsOf(set))
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
 * Enter on an empty one ends it doing nothing (region/b07, regions/p312).
 * A set holding no solid or region, once the first set's objects are left
 * out of the second, says so and ends (regions/p304–p306, p325, p336).
 *
 * The first subset is the first set's solids, or with none the plane of its
 * first region (REGIONS-D41): with nothing of the second set to take from it,
 * it says so and changes nothing (p317, p320, p341, p342). Otherwise the
 * first set's solids are joined and the second's taken out of them
 * (union/s03); its regions of each plane likewise with the second's of that
 * plane, joined whether or not something is taken (b02, b10, p338); a region
 * of the second set in no plane of the first stays (s03).
 */
export class SubtractTool extends BooleanSetTool {
  readonly id = "subtract"
  private from: readonly Entity[] | null = null

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
      const from = this.ordered(entities)
      if (regionsOf(from).length + solidsOf(from).length === 0) {
        ctx.report(ctx.text.message("noSolidsOrRegionsSelected"))
        return false
      }
      this.from = from
      this.restartOrder()
      ctx.selection.clear()
      ctx.report(ctx.text.message("subtractWhat"))
      this.begin(ctx)
      return true
    }
    const bases = new Set(this.from.map((entity) => entity.id))
    const set = this.ordered(entities).filter((e) => !bases.has(e.id))
    const regions = regionsOf(set)
    const solids = solidsOf(set)
    if (regions.length + solids.length === 0) {
      ctx.report(ctx.text.message("noSolidsOrRegionsSelected"))
      return false
    }
    const fromSolids = solidsOf(this.from)
    const regionOutcome = subtractRegions(regionsOf(this.from), regions)
    const takes =
      fromSolids.length > 0 ? solids.length > 0 : regionOutcome.firstTakes
    if (!takes) {
      ctx.report(ctx.text.message("subtractNeedsTwo"))
      return false
    }
    apply(regionOutcome, subtractSolids(fromSolids, solids), ctx)
    return false
  }
}
