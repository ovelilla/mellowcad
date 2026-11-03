import { Entity, withElevation, withNormal } from "../../domain/entities"
import { extractRegions } from "../../domain/regionModeling"
import { createRegion } from "../../domain/regions"
import { ReplaceEntitiesCommand } from "../commands/entityCommands"
import type { MessageId } from "../EngineText"
import { withCurrentProperties } from "./currentProperties"
import { SelectionActionTool } from "./SelectionActionTool"
import { QuestionInput, ToolContext } from "./Tool"

/**
 * AutoCAD's REGION: each closed loop the selected objects make becomes a
 * region of the current layer and properties (region/p07, p10), and the
 * objects that went into one are erased (DELOBJ's initial 3). It reports what
 * it found as AutoCAD 2027's console does, line by line: the objects it
 * cannot use, that the open objects lie on one line (regions/p150), the loops
 * found or that the open objects lie in no one plane, the loops crossing
 * themselves, the regions made (p01–p15). One undo step.
 */
export class RegionTool extends SelectionActionTool {
  readonly id = "region"

  // WHY: REGION asks for its set though MOVE took the grips in the same run (regions/p129).
  protected takesPreselection(): boolean {
    return false
  }

  protected selectionInput(): QuestionInput {
    return "wholeObjects"
  }

  protected noneFound(): MessageId {
    return "regionNoneFound"
  }

  protected run(entities: readonly Entity[], ctx: ToolContext): void {
    const found = extractRegions(entities)
    const say = (id: MessageId, count: number) =>
      ctx.report(ctx.text.message(id, { count }))
    if (found.rejectedObjects > 0) {
      say("regionObjectsRejected", found.rejectedObjects)
    }
    if (found.openColinear) {
      ctx.report(ctx.text.message("regionOpenEdgesColinear"))
    }
    if (found.openNotCoplanar) {
      ctx.report(ctx.text.message("regionOpenNotCoplanar"))
    } else {
      say("regionLoopsExtracted", found.loopsExtracted)
    }
    if (found.selfIntersecting > 0) {
      say("regionLoopsRejected", found.selfIntersecting)
      say("regionSelfIntersections", found.selfIntersecting)
    }
    say("regionsCreated", found.regionsCreated)
    if (found.regions.length === 0) return
    const layerId = ctx.document.getCurrentLayerId()
    const made = found.regions.map((region) =>
      withCurrentProperties(
        withElevation(
          withNormal(createRegion([region.face], layerId), region.normal),
          region.elevation
        ),
        ctx
      )
    )
    ctx.execute(new ReplaceEntitiesCommand(found.consumed, made))
  }
}
