import { DocumentReader } from "../../domain/Document"
import { DimensionEntity } from "../../domain/entities"

/**
 * The dimension DIMBASELINE and DIMCONTINUE chain off when you start them
 * without picking a base — the twin of {@link lastDrawnPoint} for annotation.
 *
 * AutoCAD uses "the dimension object that was last created in the current
 * session" and falls back to its Select prompt when there is none. There is no
 * per-session creation log here, so this is the last dimension in the drawing,
 * which is the same object in every case that matters and survives a reload
 * (where AutoCAD would ask). Same trade-off `lastDrawnPoint` already makes.
 *
 * Radial dimensions are skipped rather than treated as a terminator: they have
 * no second extension line origin to chain from, exactly as `lastDrawnPoint`
 * skips a circle instead of giving up at it. Angular ones are skipped for the
 * same reason — see `isChainable` for the gap that leaves.
 */
export function lastDimension(
  document: DocumentReader
): DimensionEntity | null {
  const entities = document.getEntities()
  for (let i = entities.length - 1; i >= 0; i--) {
    const entity = entities[i]
    if (
      entity.type === "dimension" &&
      (entity.kind === "linear" || entity.kind === "aligned")
    ) {
      return entity
    }
  }
  return null
}
