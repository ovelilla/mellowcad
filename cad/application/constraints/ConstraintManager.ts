import { Observable } from "../../shared/Observable"
import { Vec2 } from "../../geometry/Vec2"
import { Ray } from "../../geometry/primitives"
import { Viewport } from "../Viewport"
import { OrthoConstraint } from "./OrthoConstraint"
import { PolarConstraint } from "./PolarConstraint"
import { Constraint, ConstraintContext, ConstraintType } from "./types"
import { PointAlongZ } from "./zGuide"

/**
 * Owns the set of drawing constraints and applies the enabled ones as a
 * pipeline. Mirrors the snapping design: constraints are pluggable objects and
 * each type can be toggled independently, so new aids (angle lock, ...) can be
 * added without touching tools or the engine.
 */
export class ConstraintManager extends Observable {
  private readonly ortho = new OrthoConstraint()
  private readonly polar: PolarConstraint
  private readonly constraints: Constraint[]
  private readonly enabled = new Set<ConstraintType>()

  constructor(viewport: Viewport) {
    super()
    // Polar tracking needs the viewport to size its aperture in pixels.
    this.polar = new PolarConstraint(viewport)
    this.constraints = [this.ortho, this.polar]
    // All constraints start disabled — drawing is free by default.
  }

  isEnabled(type: ConstraintType): boolean {
    return this.enabled.has(type)
  }

  setEnabled(type: ConstraintType, enabled: boolean): void {
    // Ortho and Polar are mutually exclusive in AutoCAD: turning one on turns
    // the other off. So enabling also counts as a change when it displaces the
    // sibling aid, even if the requested type was already on.
    const sibling =
      type === ConstraintType.Ortho
        ? ConstraintType.Polar
        : type === ConstraintType.Polar
          ? ConstraintType.Ortho
          : null
    const changed = enabled ? !this.enabled.has(type) : this.enabled.has(type)
    const displaces = enabled && sibling !== null && this.enabled.has(sibling)
    if (!changed && !displaces) return
    if (enabled) {
      this.enabled.add(type)
      if (sibling !== null) this.enabled.delete(sibling)
    } else {
      this.enabled.delete(type)
    }
    this.emit()
  }

  /** Polar tracking's current angle increment, in degrees. */
  getPolarAngleStep(): number {
    return this.polar.angleStep
  }

  /** Sets the polar tracking angle increment (degrees); ignores invalid steps. */
  setPolarAngleStep(step: number): void {
    if (!(step > 0) || step === this.polar.angleStep) return
    this.polar.angleStep = step
    this.emit()
  }

  toggle(type: ConstraintType): void {
    this.setEnabled(type, !this.enabled.has(type))
  }

  /** True when at least one constraint is active. */
  hasActive(): boolean {
    return this.enabled.size > 0
  }

  /**
   * Runs the candidate point through every enabled constraint, in registration
   * order, feeding each constraint the previous one's output.
   *
   * `orthoOverride` is Shift held while specifying a point, which toggles
   * Ortho for as long as it is held: "To turn Ortho off temporarily, hold down
   * the Shift key", and with Ortho off it is on. Polar yields to it either way.
   */
  apply(context: ConstraintContext, orthoOverride = false): Vec2 | PointAlongZ {
    if (orthoOverride) {
      return this.isEnabled(ConstraintType.Ortho)
        ? context.point
        : this.ortho.apply(context)
    }
    if (this.enabled.size === 0) return context.point
    let point: Vec2 | PointAlongZ = context.point
    for (const constraint of this.constraints) {
      if (!this.enabled.has(constraint.type)) continue
      point = constraint.apply({ ...context, point })
    }
    return point
  }

  /**
   * The line the first enabled constraint imposes from the anchor, if any.
   * Object snap tracking uses it to intersect alignment guides with the
   * current Ortho/Polar direction. `orthoOverride` mirrors {@link apply}.
   */
  activeRay(context: ConstraintContext, orthoOverride = false): Ray | null {
    if (orthoOverride) {
      return this.isEnabled(ConstraintType.Ortho)
        ? null
        : (this.ortho.ray?.(context) ?? null)
    }
    if (this.enabled.size === 0) return null
    for (const constraint of this.constraints) {
      if (!this.enabled.has(constraint.type)) continue
      const ray = constraint.ray?.(context)
      if (ray) return ray
    }
    return null
  }

  /**
   * The point of the UCS's Z through the anchor when that is the line the
   * active constraint locks to, else `null`. `orthoOverride` mirrors {@link apply}.
   */
  activeAlongZ(
    context: ConstraintContext,
    orthoOverride = false
  ): PointAlongZ | null {
    if (orthoOverride) {
      return this.isEnabled(ConstraintType.Ortho)
        ? null
        : this.ortho.alongZ(context)
    }
    for (const constraint of this.constraints) {
      if (!this.enabled.has(constraint.type)) continue
      const point = constraint.alongZ?.(context)
      if (point) return point
    }
    return null
  }

  /**
   * The polar ray currently engaged, for drawing the on-screen polar tracking
   * vector. `null` when polar is disabled or the cursor is between angles.
   */
  polarGuideRay(context: ConstraintContext): Ray | null {
    if (!this.enabled.has(ConstraintType.Polar)) return null
    return this.polar.ray(context)
  }

  /** The point of the polar `+Z` / `-Z` path the cursor is locked to, if it is. */
  polarAlongZ(context: ConstraintContext): PointAlongZ | null {
    if (!this.enabled.has(ConstraintType.Polar)) return null
    return this.polar.alongZ(context)
  }
}
