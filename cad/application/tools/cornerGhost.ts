import { Entity, EntityId, PolylineEntity } from "../../domain/entities"
import {
  ReplaceEntitiesCommand,
  UpdateEntityCommand,
} from "../commands/entityCommands"
import { ScenePrimitive } from "../../scene/types"
import { cornerEntity, isSegment, pickedEntity } from "./cornerObjects"
import type { FilletObject, CurveObject } from "./cornerObjects"
import { drawn, rollover } from "./ghostLook"
import { ToolContext } from "./Tool"

/**
 * What a second object picked does with the first, worked out once for the
 * click and for the ghost the cursor shows over it: the corner `made` (what
 * it takes out, what it puts in, in the tool's frame), refused in words
 * (`refusal`, the command's), or `none`, nothing made and nothing said —
 * `ends` where the command ends then, else the prompt stays.
 */
export type CornerOutcome<R> =
  | {
      readonly kind: "made"
      readonly replaced: readonly EntityId[]
      readonly built: readonly Entity[]
      /** A polyline cut within itself: updated in place. */
      readonly update: boolean
    }
  | { readonly kind: "refused"; readonly refusal: R }
  | { readonly kind: "none"; readonly ends: boolean }

export function made<R>(
  replaced: readonly EntityId[],
  built: readonly Entity[]
): CornerOutcome<R> {
  return { kind: "made", replaced, built, update: false }
}

export function updated<R>(polyline: Entity): CornerOutcome<R> {
  return {
    kind: "made",
    replaced: [polyline.id],
    built: [polyline],
    update: true,
  }
}

export function refused<R>(refusal: R): CornerOutcome<R> {
  return { kind: "refused", refusal }
}

export const NONE = { kind: "none", ends: false } as const
export const ENDS = { kind: "none", ends: true } as const

/** The command a corner made executes. */
export function cornerCommand(
  outcome: Extract<CornerOutcome<unknown>, { kind: "made" }>
): ReplaceEntitiesCommand | UpdateEntityCommand {
  return outcome.update
    ? new UpdateEntityCommand(outcome.built[0])
    : new ReplaceEntitiesCommand(outcome.replaced, outcome.built)
}

/** The objects the ghost draws as the corner would leave them. */
export function ghostHidden(
  outcome: CornerOutcome<unknown> | null
): readonly EntityId[] {
  return outcome?.kind === "made" ? outcome.replaced : []
}

/**
 * FILLET's and CHAMFER's ghost at the second prompt: what the click makes —
 * the lines trimmed, the arc, the cap or the bevel, a joined polyline — in
 * the selection's glow, over each object it replaces drawn dimmed, so what
 * shows of that is the piece the corner removes (desktop corners/d01-2,
 * d01-3, d02-1, d03-1, d03-2, d06-2). The first object stays in the glow
 * where the corner leaves it as it is, but a circle, never trimmed, which
 * stays as drawn. Where no corner is made, the first object alone in the
 * glow (d01-4, d06-1). `whole`: a polyline a mode found whole.
 */
export function cornerGhost(
  ctx: ToolContext,
  first: FilletObject | CurveObject,
  whole: boolean,
  outcome: CornerOutcome<unknown> | null
): ScenePrimitive[] {
  const firstEntity = whole ? cornerEntity(first) : pickedEntity(first)
  if (outcome?.kind !== "made") return drawn(ctx, firstEntity, "glow")
  const replaced = outcome.replaced.flatMap((id) => {
    const original = ctx.document.get(id)
    return original ? drawn(ctx, original, "faded") : []
  })
  const circle = !isSegment(first) && first.type === "circle"
  const kept =
    outcome.replaced.includes(cornerEntity(first).id) || circle
      ? []
      : drawn(ctx, firstEntity, "glow")
  return [
    ...replaced,
    ...kept,
    ...outcome.built.flatMap((entity) => drawn(ctx, entity, "glow")),
  ]
}

/**
 * Polyline's ghost: every corner as the cut would make it, in the glow, over
 * the polyline dimmed, its old corners showing (desktop corners/d05-1); a
 * polyline with no corner to cut, in the glow.
 */
export function polylineGhost(
  ctx: ToolContext,
  polyline: PolylineEntity,
  cut: PolylineEntity | null
): ScenePrimitive[] {
  return cut
    ? [...drawn(ctx, polyline, "faded"), ...drawn(ctx, cut, "glow")]
    : drawn(ctx, polyline, "glow")
}

/** The first prompt's rollover: what a pick there takes (desktop corners/d01-1, d04-2, d04-3). */
export function cornerRollover(
  ctx: ToolContext,
  object: FilletObject | CurveObject
): ScenePrimitive[] {
  return rollover(ctx, pickedEntity(object))
}
