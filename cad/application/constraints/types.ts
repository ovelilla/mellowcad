import { Vec2 } from "../../geometry/Vec2"
import { Vec3 } from "../../geometry/Vec3"
import { Ray } from "../../geometry/primitives"
import { Ucs } from "../../domain/ucs"
import { Viewport } from "../Viewport"
import { PointAlongZ } from "./zGuide"

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
 * - `point`    the current candidate point flowing through the pipeline (the
 *              cursor, rounded onto the snap lattice when SNAP is on). Each
 *              constraint receives the previous constraint's output here. An
 *              object snap never reaches a constraint: it wins outright.
 */
export interface ConstraintContext {
  /** Its Z, when it has one, is where the `+Z` / `-Z` guide starts. */
  readonly anchor: Vec2 | Vec3 | null
  /** The cursor on the work plane, which `view` draws where the pointer is. */
  readonly world: Vec3
  readonly point: Vec2
  /** Horizontal, vertical and the polar angles are the UCS's. */
  readonly ucs: Ucs
  /** The camera, in the same frame: off the plan the guides are measured on the screen. */
  readonly view: Viewport
}

/** A single, composable point constraint. */
export interface Constraint {
  readonly type: ConstraintType
  /** A point on the UCS's Z through the anchor comes back {@link PointAlongZ}, with its height. */
  apply(context: ConstraintContext): Vec2 | PointAlongZ

  /**
   * The infinite line this constraint imposes from the anchor, if any. Object
   * snap tracking intersects guides with it to align to existing geometry.
   * Returns `null` when the constraint imposes no single line (or has no
   * anchor).
   */
  ray?(context: ConstraintContext): Ray | null

  /**
   * The point of the UCS's Z through the anchor when that is the line the
   * constraint locks to (off the plan only), else `null`; {@link ray} is then
   * `null`.
   */
  alongZ?(context: ConstraintContext): PointAlongZ | null
}
