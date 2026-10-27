import { DocumentReader } from "../../domain/Document"
import { DimensionEntity, EntityId, readsInPlan } from "../../domain/entities"

/**
 * The dimension DIMBASELINE and DIMCONTINUE chain off when you start them
 * without picking a base — the twin of {@link lastDrawnPoint} for annotation.
 *
 * AutoCAD uses "the dimension object that was last created in the current
 * session" and falls back to its Select prompt when there is none: one the
 * drawing held as it was opened is not (`made`, probe dimensions/p400).
 *
 * Radial dimensions are skipped rather than treated as a terminator: they have
 * no second extension line origin to chain from (probe dimensions/p223),
 * exactly as `lastDrawnPoint` skips a circle instead of giving up at it. An
 * angular one ends the search: AutoCAD chains it (p224), which is not built
 * here (see `isChainable`), so the Select prompt asks rather than chaining an
 * older dimension. So does one lying in a plane at an angle to the UCS's: a
 * chain is drawn in the UCS's plane.
 */
export function lastDimension(
  document: DocumentReader,
  made: (id: EntityId) => boolean = () => true
): DimensionEntity | null {
  const entities = document.getEntities()
  for (let i = entities.length - 1; i >= 0; i--) {
    const entity = entities[i]
    if (entity.type !== "dimension" || !made(entity.id)) continue
    if (entity.kind === "radius" || entity.kind === "diameter") continue
    return entity.kind !== "angular" && readsInPlan(entity) ? entity : null
  }
  return null
}
