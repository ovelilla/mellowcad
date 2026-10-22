import { Vec2 } from "../../geometry/Vec2"
import {
  ArrayParameters,
  Entity,
  anonymousBlockName,
  createBlockDefinition,
  createInsert,
} from "../../domain/entities"
import { arrayItemCopy, arrayItems } from "../../domain/arrays"
import { AddEntitiesCommand } from "../commands/entityCommands"
import { CreateBlockCommand } from "../commands/blockCommands"
import { withCurrentProperties } from "./currentProperties"
import type { ToolContext } from "./Tool"

/**
 * ARRAYASSOCIATIVITY, shared by ARRAYRECT, ARRAYPOLAR and ARRAYPATH of one
 * runtime: what their ASsociative keyword answers, and offers as its default
 * the next time (probe arrays/p364). WHY for the session and never in the
 * drawing: AutoCAD keeps it in the registry — a drawing saved while it was 1
 * opens with it 0 after `_AS _N` (p422) —; here it lasts as long as the
 * runtime, as TRIMEXTENDMODE does.
 */
export interface ArrayAssociativity {
  associative: boolean
}

/** `Type = Rectangular  Associative = Yes`, as the array is to be made (probes arrays/p01, p04). */
export function reportArrayType(
  ctx: ToolContext,
  type: ArrayParameters["kind"],
  mode: ArrayAssociativity
): void {
  ctx.report(
    ctx.text.message(mode.associative ? "arrayTypeAssociative" : "arrayType", {
      type,
    })
  )
}

/**
 * What an array command leaves at its end, as one step. Associative: one
 * array object — a reference, made as anything drawn from scratch is (probe
 * arrays/p403: on CLAYER and CECOLOR), to an anonymous block holding the
 * source where it stands, with `base` the block's base point and the
 * reference's position, so the parameters stay in the drawing's coordinates
 * of the moment (ARRAYS-D8). The source is consumed into it and U brings it
 * back with its ids (p01–p03, p409). Not associative: the items' loose
 * copies, the source left as item 1 (p04–p06).
 */
export function makeArray(
  ctx: ToolContext,
  originals: readonly Entity[],
  array: ArrayParameters,
  base: Vec2,
  mode: ArrayAssociativity
): void {
  if (!mode.associative) {
    const copies = arrayItems(array).flatMap((item) =>
      originals.map((entity) => arrayItemCopy(entity, item))
    )
    if (copies.length > 0) ctx.execute(new AddEntitiesCommand(copies))
    return
  }
  if (originals.length === 0) return
  const name = anonymousBlockName(ctx.document.getBlocks())
  const block = createBlockDefinition(name, base, originals)
  const reference = withCurrentProperties(
    createInsert(name, base, {
      layerId: ctx.document.getCurrentLayerId(),
      array,
    }),
    ctx
  )
  ctx.execute(
    new CreateBlockCommand(
      block,
      originals.map((entity) => entity.id),
      reference
    )
  )
}
