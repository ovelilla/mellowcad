import { Vec2, V } from "../../geometry/Vec2"
import {
  ArrayParameters,
  Entity,
  anonymousBlockName,
  createBlockDefinition,
  createInsert,
} from "../../domain/entities"
import {
  ArrayItem,
  arrayItemCopy,
  arrayItems,
  arraySourceItem,
  placeArrayItem,
} from "../../domain/arrays"
import { ScenePrimitive } from "../../scene/types"
import {
  AddEntitiesCommand,
  UpdateEntitiesCommand,
} from "../commands/entityCommands"
import { MAX_PREVIEW_ITEMS } from "./arrayCounts"
import { drawn } from "./ghostLook"
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

const STILL: Vec2 = { x: 0, y: 0 }

/** `item` with the whole array moved by `offset` after it. */
function shifted(item: ArrayItem, offset: Vec2): ArrayItem {
  if (offset.x === 0 && offset.y === 0) return item
  return {
    move: {
      ...item.move,
      x: item.move.x + offset.x,
      y: item.move.y + offset.y,
    },
    pivot: V.add(item.pivot, offset),
    turn: item.turn,
  }
}

/** Where the source goes, item 1: where it stands but a stretched ring's (ARRAYS-D73), moved by `offset`. */
function sourceItem(array: ArrayParameters, offset: Vec2): ArrayItem | null {
  const first = arraySourceItem(array)
  if (offset.x === 0 && offset.y === 0) return first
  return shifted(first ?? { move: STILL, pivot: STILL, turn: 0 }, offset)
}

/**
 * The preview of an array command: its items as the drawing will draw them,
 * the source item 1 (desktop arrays/d01-1, ARRAYS-D5), no more than
 * `MAX_PREVIEW_ITEMS`; `offset` how far its main prompt's move grips moved it
 * (ARRAYS-D77). What `makeArray` makes of the same arguments.
 */
export function arrayPreview(
  ctx: ToolContext,
  originals: readonly Entity[],
  array: ArrayParameters,
  offset: Vec2 = STILL
): ScenePrimitive[] {
  const first = sourceItem(array, offset)
  const items = arrayItems(array, MAX_PREVIEW_ITEMS).map((item) =>
    shifted(item, offset)
  )
  return [
    ...originals.flatMap((entity) =>
      drawn(ctx, first ? placeArrayItem(entity, first) : entity, "plain")
    ),
    ...items.flatMap((item) =>
      originals.flatMap((entity) =>
        drawn(ctx, placeArrayItem(entity, item), "plain")
      )
    ),
  ]
}

/**
 * What an array command leaves at its end, as one step. Associative: one
 * array object — a reference, made as anything drawn from scratch is (probe
 * arrays/p403: on CLAYER and CECOLOR), to an anonymous block holding the
 * source where it stands, with `base` the block's base point and the
 * reference's position, so the parameters stay in the drawing's coordinates
 * of the moment (ARRAYS-D8), the reference `offset` from it once a move grip
 * moved the preview (ARRAYS-D77). The source is consumed into it and U brings it
 * back with its ids (p01–p03, p409). Not associative: the items' loose
 * copies, the source left as item 1 (p04–p06), moved where a grip moved it.
 */
export function makeArray(
  ctx: ToolContext,
  originals: readonly Entity[],
  array: ArrayParameters,
  base: Vec2,
  mode: ArrayAssociativity,
  offset: Vec2 = STILL
): void {
  if (!mode.associative) {
    const first = sourceItem(array, offset)
    if (first && originals.length > 0) {
      ctx.execute(
        new UpdateEntitiesCommand(
          originals.map((entity) => placeArrayItem(entity, first))
        )
      )
    }
    const copies = arrayItems(array).flatMap((item) =>
      originals.map((entity) => arrayItemCopy(entity, shifted(item, offset)))
    )
    if (copies.length > 0) ctx.execute(new AddEntitiesCommand(copies))
    return
  }
  if (originals.length === 0) return
  const name = anonymousBlockName(ctx.document.getBlocks())
  const block = createBlockDefinition(name, base, originals)
  const reference = withCurrentProperties(
    createInsert(name, V.add(base, offset), {
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
