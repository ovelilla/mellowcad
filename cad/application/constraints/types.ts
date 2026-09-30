import { Vec2 } from "../../geometry/Vec2"
import { Ray } from "../../geometry/primitives"
import { Ucs } from "../../domain/ucs"

/**
 * Drawing constraints ("aids") that restrict where a point can land, such as
 * AutoCAD's Ortho or Polar tracking. They are deliberately kept separate from
 * object snaps: snaps *attract* the cursor to existing geometry, while
 * constraints *restrict* the cursor relative to a base point. The two compose
 * in a pipeline (snap first, then constraints) so, for example, an Ortho line
 * can still lock onto the X of a snapped endpoint.
 */
export enum ConstraintType {
  Ortho = "ortho",
  Polar = "polar",
}

/**
 * Everything a constraint needs to compute a restricted point.
 *
 * - `anchor`   the reference point the constraint restricts against (e.g. the
 *              first point of the line being drawn). `null` when the active
 *              operation has no base point yet, in which case constraints are
 *              a no-op.
 * - `world`    the raw, unsnapped world cursor. Constraints use this to read
 *              the *direction* of the mouse movement.
 * - `snapPoint` the active snap point, if any.
 * - `point`    the current candidate point flowing through the pipeline (the
 *              snap point when snapped, otherwise the raw world cursor). Each
 *              constraint receives the previous constraint's output here.
 */
export interface ConstraintContext {
  readonly anchor: Vec2 | null
  readonly world: Vec2
  readonly snapPoint: Vec2 | null
  readonly point: Vec2
  /** Horizontal, vertical and the polar angles are the UCS's. */
  readonly ucs: Ucs
}

/** A single, composable point constraint. */
export interface Constraint {
  readonly type: ConstraintType
  apply(context: ConstraintContext): Vec2

  /**
   * The infinite line this constraint imposes from the anchor, if any. Object
   * snap tracking intersects guides with it to align to existing geometry.
   * Returns `null` when the constraint imposes no single line (or has no
   * anchor).
   */
  ray?(context: ConstraintContext): Ray | null
}
