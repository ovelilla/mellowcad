import fc from "fast-check"
import { describe, expect, it } from "vitest"
import { V, vec2 } from "./Vec2"
import { coordinate, point } from "../../test/arbitraries"
import { p } from "../../test/builders"

describe("Vec2", () => {
  describe("construction", () => {
    it("builds a vector from its components", () => {
      expect(vec2(3, -4)).toEqual({ x: 3, y: -4 })
    })

    it("has an origin constant", () => {
      expect(V.zero()).toEqual({ x: 0, y: 0 })
    })
  })

  describe("arithmetic", () => {
    it("adds and subtracts componentwise", () => {
      expect(V.add(p(1, 2), p(10, 20))).toEqual({ x: 11, y: 22 })
      expect(V.sub(p(1, 2), p(10, 20))).toEqual({ x: -9, y: -18 })
    })

    it("is commutative under addition", () => {
      fc.assert(
        fc.property(point, point, (a, b) => {
          expect(V.add(a, b)).toBeCloseToPoint(V.add(b, a), 12)
        })
      )
    })

    it("subtraction undoes addition", () => {
      fc.assert(
        fc.property(point, point, (a, b) => {
          expect(V.sub(V.add(a, b), b)).toBeCloseToPoint(a, 9)
        })
      )
    })

    it("scales linearly", () => {
      fc.assert(
        fc.property(point, coordinate, (a, s) => {
          expect(V.length(V.scale(a, s))).toBeCloseTo(
            V.length(a) * Math.abs(s),
            6
          )
        })
      )
    })
  })

  describe("interpolation", () => {
    it("returns the endpoints at t = 0 and t = 1", () => {
      fc.assert(
        fc.property(point, point, (a, b) => {
          expect(V.lerp(a, b, 0)).toBeCloseToPoint(a, 12)
          expect(V.lerp(a, b, 1)).toBeCloseToPoint(b, 9)
        })
      )
    })

    it("agrees with midpoint at t = 0.5", () => {
      fc.assert(
        fc.property(point, point, (a, b) => {
          expect(V.lerp(a, b, 0.5)).toBeCloseToPoint(V.midpoint(a, b), 9)
        })
      )
    })
  })

  describe("products", () => {
    it("computes the dot product", () => {
      expect(V.dot(p(3, 4), p(2, 1))).toBe(10)
    })

    it("computes the 2D cross product magnitude", () => {
      expect(V.cross(p(1, 0), p(0, 1))).toBe(1)
      expect(V.cross(p(0, 1), p(1, 0))).toBe(-1)
    })

    it("is antisymmetric under cross product", () => {
      fc.assert(
        fc.property(point, point, (a, b) => {
          expect(V.cross(a, b)).toBeCloseTo(-V.cross(b, a), 9)
        })
      )
    })

    it("reports a zero cross product for parallel vectors", () => {
      fc.assert(
        fc.property(point, coordinate, (a, s) => {
          expect(V.cross(a, V.scale(a, s))).toBeCloseTo(0, 6)
        })
      )
    })
  })

  describe("length and distance", () => {
    it("measures a 3-4-5 triangle", () => {
      expect(V.length(p(3, 4))).toBe(5)
      expect(V.lengthSq(p(3, 4))).toBe(25)
      expect(V.distance(p(1, 1), p(4, 5))).toBe(5)
      expect(V.distanceSq(p(1, 1), p(4, 5))).toBe(25)
    })

    it("keeps lengthSq and distanceSq consistent with their square roots", () => {
      fc.assert(
        fc.property(point, point, (a, b) => {
          expect(Math.sqrt(V.lengthSq(a))).toBeCloseTo(V.length(a), 6)
          expect(V.distance(a, b)).toBeCloseTo(V.length(V.sub(a, b)), 6)
        })
      )
    })

    it("satisfies the triangle inequality", () => {
      fc.assert(
        fc.property(point, point, point, (a, b, c) => {
          const direct = V.distance(a, c)
          const viaB = V.distance(a, b) + V.distance(b, c)
          // A tolerance proportional to the magnitudes involved, so the
          // assertion is about geometry rather than about float noise.
          expect(direct).toBeLessThanOrEqual(viaB + viaB * 1e-12 + 1e-9)
        })
      )
    })
  })

  describe("normalize", () => {
    it("produces a unit vector", () => {
      fc.assert(
        fc.property(point, (a) => {
          fc.pre(V.length(a) > 1e-6)
          expect(V.length(V.normalize(a))).toBeCloseTo(1, 9)
        })
      )
    })

    it("preserves direction", () => {
      fc.assert(
        fc.property(point, (a) => {
          fc.pre(V.length(a) > 1e-6)
          const unit = V.normalize(a)
          expect(V.scale(unit, V.length(a))).toBeCloseToPoint(a, 6)
        })
      )
    })

    it("returns the zero vector for the zero vector rather than NaN", () => {
      // Callers rely on this: a degenerate direction must stay finite so the
      // caller can detect it, instead of poisoning the whole computation.
      expect(V.normalize(V.zero())).toEqual({ x: 0, y: 0 })
    })
  })

  describe("perpendicular", () => {
    it("rotates 90° counter-clockwise", () => {
      expect(V.perpendicular(p(1, 0))).toBeCloseToPoint(p(0, 1))
      expect(V.perpendicular(p(0, 1))).toBeCloseToPoint(p(-1, 0))
    })

    it("is orthogonal and length-preserving", () => {
      fc.assert(
        fc.property(point, (a) => {
          const perpendicular = V.perpendicular(a)
          expect(V.dot(a, perpendicular)).toBe(0)
          expect(V.length(perpendicular)).toBe(V.length(a))
        })
      )
    })

    it("returns the negated vector after four turns", () => {
      fc.assert(
        fc.property(point, (a) => {
          const turned = V.perpendicular(V.perpendicular(a))
          expect(turned).toBeCloseToPoint(V.scale(a, -1), 12)
        })
      )
    })
  })

  describe("equals", () => {
    it("compares within an epsilon", () => {
      expect(V.equals(p(1, 1), p(1 + 1e-12, 1))).toBe(true)
      expect(V.equals(p(1, 1), p(1.001, 1))).toBe(false)
      expect(V.equals(p(1, 1), p(1.001, 1), 0.01)).toBe(true)
    })

    it("is reflexive", () => {
      fc.assert(
        fc.property(point, (a) => {
          expect(V.equals(a, a)).toBe(true)
        })
      )
    })
  })
})
