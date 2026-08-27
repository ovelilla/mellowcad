import { expect } from "vitest"
import type { Vec2 } from "../cad/geometry/Vec2"

/**
 * Geometry-aware assertions. Comparing CAD results with `toEqual` is a trap:
 * every trigonometric round-trip leaves a few ULPs behind, so exact equality
 * either fails randomly or forces tests to hard-code noisy literals. These
 * matchers compare with an explicit tolerance and, crucially, report *which*
 * point (and which coordinate) drifted — the information you actually need when
 * a solver regresses.
 */

/**
 * Digits compared by default. Tight enough to catch a real geometric error in a
 * drawing measured in millimetres, loose enough to survive the handful of
 * `atan2`/`sqrt` round-trips a fillet or an offset performs.
 */
const DEFAULT_PRECISION = 6

function toleranceFor(precision: number): number {
  return 10 ** -precision / 2
}

function isVec2(value: unknown): value is Vec2 {
  return (
    typeof value === "object" &&
    value !== null &&
    Number.isFinite((value as Vec2).x) &&
    Number.isFinite((value as Vec2).y)
  )
}

function show(point: Vec2): string {
  return `(${point.x}, ${point.y})`
}

function pointsMatch(a: Vec2, b: Vec2, tolerance: number): boolean {
  return Math.abs(a.x - b.x) <= tolerance && Math.abs(a.y - b.y) <= tolerance
}

/** Signed difference between two angles, wrapped into (-π, π]. */
function angleDelta(a: number, b: number): number {
  const raw = (a - b) % (2 * Math.PI)
  if (raw > Math.PI) return raw - 2 * Math.PI
  if (raw <= -Math.PI) return raw + 2 * Math.PI
  return raw
}

expect.extend({
  toBeCloseToPoint(
    received: unknown,
    expected: Vec2,
    precision: number = DEFAULT_PRECISION
  ) {
    if (!isVec2(received)) {
      return {
        pass: false,
        message: () =>
          `expected a finite Vec2 but received ${this.utils.printReceived(received)}`,
      }
    }

    const tolerance = toleranceFor(precision)
    const pass = pointsMatch(received, expected, tolerance)
    const dx = Math.abs(received.x - expected.x)
    const dy = Math.abs(received.y - expected.y)

    return {
      pass,
      actual: received,
      expected,
      message: () =>
        pass
          ? `expected ${show(received)} not to be within ${tolerance} of ${show(expected)}`
          : `expected ${show(received)} to be within ${tolerance} of ${show(expected)}\n` +
            `  Δx = ${dx}\n  Δy = ${dy}`,
    }
  },

  toBeCloseToPoints(
    received: unknown,
    expected: readonly Vec2[],
    precision: number = DEFAULT_PRECISION
  ) {
    if (!Array.isArray(received) || !received.every(isVec2)) {
      return {
        pass: false,
        message: () =>
          `expected an array of finite Vec2 but received ${this.utils.printReceived(received)}`,
      }
    }

    const points = received as Vec2[]
    if (points.length !== expected.length) {
      return {
        pass: false,
        actual: points,
        expected,
        message: () =>
          `expected ${expected.length} point(s) but received ${points.length}:\n` +
          `  received: [${points.map(show).join(", ")}]\n` +
          `  expected: [${expected.map(show).join(", ")}]`,
      }
    }

    const tolerance = toleranceFor(precision)
    const firstBadIndex = points.findIndex(
      (point, index) => !pointsMatch(point, expected[index], tolerance)
    )

    return {
      pass: firstBadIndex === -1,
      actual: points,
      expected,
      message: () =>
        firstBadIndex === -1
          ? `expected point lists not to match within ${tolerance}`
          : `point [${firstBadIndex}] differs by more than ${tolerance}\n` +
            `  received: ${show(points[firstBadIndex])}\n` +
            `  expected: ${show(expected[firstBadIndex])}\n` +
            `  full received: [${points.map(show).join(", ")}]`,
    }
  },

  /** Compares radians modulo a full turn, so 0 and 2π are the same angle. */
  toBeCloseToAngle(
    received: unknown,
    expected: number,
    precision: number = DEFAULT_PRECISION
  ) {
    if (typeof received !== "number" || !Number.isFinite(received)) {
      return {
        pass: false,
        message: () =>
          `expected a finite angle in radians but received ${this.utils.printReceived(received)}`,
      }
    }

    const tolerance = toleranceFor(precision)
    const delta = angleDelta(received, expected)

    return {
      pass: Math.abs(delta) <= tolerance,
      actual: received,
      expected,
      message: () =>
        Math.abs(delta) <= tolerance
          ? `expected ${received} rad not to equal ${expected} rad (mod 2π)`
          : `expected ${received} rad to equal ${expected} rad (mod 2π)\n` +
            `  Δ = ${delta} rad (${(delta * 180) / Math.PI}°)`,
    }
  },
})

interface CadMatchers<R = unknown> {
  /** Asserts a `Vec2` equals `expected` within `10^-precision / 2` per axis. */
  toBeCloseToPoint(expected: Vec2, precision?: number): R
  /** Asserts an ordered list of `Vec2` matches, reporting the first mismatch. */
  toBeCloseToPoints(expected: readonly Vec2[], precision?: number): R
  /** Asserts two angles in radians are equal modulo a full turn. */
  toBeCloseToAngle(expected: number, precision?: number): R
}

declare module "vitest" {
  // The type parameter must mirror Vitest's own declaration to merge.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type
  interface Matchers<T = any> extends CadMatchers<T> {}
}
