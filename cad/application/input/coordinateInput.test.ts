import fc from "fast-check"
import { describe, expect, it } from "vitest"
import { isCoordinateExpression, parseCoordinate } from "./coordinateInput"
import { coordinate, point } from "../../../test/arbitraries"
import { deg, p } from "../../../test/builders"

/**
 * Typed coordinate entry is the "total precision" path: whatever the mouse is
 * doing, this decides where the point lands. It is also the one place where a
 * locale habit (comma as decimal separator) collides with syntax, so the
 * trade-off is pinned explicitly.
 */

const ABSOLUTE = { lastPoint: null, relativeByDefault: false }
const FROM_100_100 = { lastPoint: p(100, 100), relativeByDefault: true }

describe("isCoordinateExpression", () => {
  it("recognises the coordinate syntaxes", () => {
    expect(isCoordinateExpression("50,100")).toBe(true)
    expect(isCoordinateExpression("100<45")).toBe(true)
    expect(isCoordinateExpression("@30,0")).toBe(true)
    expect(isCoordinateExpression("#0,0")).toBe(true)
  })

  it("leaves a plain number to direct-distance entry", () => {
    expect(isCoordinateExpression("100")).toBe(false)
    expect(isCoordinateExpression("100.5")).toBe(false)
    expect(isCoordinateExpression("")).toBe(false)
    expect(isCoordinateExpression("   ")).toBe(false)
  })

  it("switches over as soon as the separator is typed", () => {
    // The field must flip to coordinate mode mid-keystroke, before the value is
    // even complete, or the numeric parser would claim "50," as 50.
    expect(isCoordinateExpression("50")).toBe(false)
    expect(isCoordinateExpression("50,")).toBe(true)
  })
})

describe("parseCoordinate", () => {
  describe("cartesian", () => {
    it("reads an absolute point", () => {
      expect(parseCoordinate("50,100", ABSOLUTE)).toBeCloseToPoint(p(50, 100))
    })

    it("reads negatives and decimals", () => {
      expect(parseCoordinate("-12.5,+3.25", ABSOLUTE)).toBeCloseToPoint(
        p(-12.5, 3.25)
      )
      expect(parseCoordinate(".5,-.25", ABSOLUTE)).toBeCloseToPoint(
        p(0.5, -0.25)
      )
    })

    it("tolerates surrounding whitespace", () => {
      expect(parseCoordinate("  50 , 100  ", ABSOLUTE)).toBeCloseToPoint(
        p(50, 100)
      )
    })
  })

  describe("polar", () => {
    it("measures the angle counter-clockwise from +X", () => {
      expect(parseCoordinate("100<0", ABSOLUTE)).toBeCloseToPoint(p(100, 0))
      expect(parseCoordinate("100<90", ABSOLUTE)).toBeCloseToPoint(p(0, 100), 6)
      expect(parseCoordinate("100<180", ABSOLUTE)).toBeCloseToPoint(
        p(-100, 0),
        6
      )
    })

    it("accepts a negative angle", () => {
      expect(parseCoordinate("100<-90", ABSOLUTE)).toBeCloseToPoint(
        p(0, -100),
        6
      )
    })
  })

  describe("reference frame", () => {
    it("@ measures from the last point", () => {
      expect(parseCoordinate("@30,0", FROM_100_100)).toBeCloseToPoint(
        p(130, 100)
      )
      expect(parseCoordinate("@100<90", FROM_100_100)).toBeCloseToPoint(
        p(100, 200),
        6
      )
    })

    it("# forces the drawing origin even when relative is the default", () => {
      expect(parseCoordinate("#30,0", FROM_100_100)).toBeCloseToPoint(p(30, 0))
    })

    it("a bare value follows the caller's default", () => {
      expect(parseCoordinate("30,0", FROM_100_100)).toBeCloseToPoint(
        p(130, 100)
      )
      expect(
        parseCoordinate("30,0", {
          lastPoint: p(100, 100),
          relativeByDefault: false,
        })
      ).toBeCloseToPoint(p(30, 0))
    })

    it("is absolute when there is no last point, whatever the default", () => {
      // The first point of a command has nothing to be relative to.
      expect(
        parseCoordinate("@30,0", { lastPoint: null, relativeByDefault: true })
      ).toBeCloseToPoint(p(30, 0))
    })
  })

  describe("incomplete and invalid input", () => {
    it("returns null while the value is still being typed", () => {
      // A null keeps the preview following the cursor instead of jumping.
      expect(parseCoordinate("50,", ABSOLUTE)).toBeNull()
      expect(parseCoordinate(",100", ABSOLUTE)).toBeNull()
      expect(parseCoordinate("100<", ABSOLUTE)).toBeNull()
      expect(parseCoordinate("@", ABSOLUTE)).toBeNull()
      expect(parseCoordinate("#", ABSOLUTE)).toBeNull()
    })

    it("rejects text that is not a coordinate", () => {
      expect(parseCoordinate("", ABSOLUTE)).toBeNull()
      expect(parseCoordinate("100", ABSOLUTE)).toBeNull()
      expect(parseCoordinate("abc,def", ABSOLUTE)).toBeNull()
      expect(parseCoordinate("1,2,3", ABSOLUTE)).toBeNull()
      expect(parseCoordinate("1e5,0", ABSOLUTE)).toBeNull()
      expect(parseCoordinate("Infinity,0", ABSOLUTE)).toBeNull()
    })

    it("treats the comma strictly as the X/Y separator", () => {
      // The documented trade-off: inside a coordinate the decimal separator is
      // the dot, so the European "1,5" is the point (1, 5), never 1.5.
      expect(parseCoordinate("1,5", ABSOLUTE)).toBeCloseToPoint(p(1, 5))
    })

    it("never throws, whatever it is given", () => {
      fc.assert(
        fc.property(fc.string(), (text) => {
          expect(() => parseCoordinate(text, FROM_100_100)).not.toThrow()
        })
      )
    })
  })

  describe("round trips", () => {
    it("cartesian input reproduces any point", () => {
      fc.assert(
        fc.property(point, (target) => {
          expect(
            parseCoordinate(`${target.x},${target.y}`, ABSOLUTE)
          ).toBeCloseToPoint(target, 9)
        })
      )
    })

    it("relative input lands the offset on the last point", () => {
      fc.assert(
        fc.property(point, coordinate, coordinate, (last, dx, dy) => {
          expect(
            parseCoordinate(`@${dx},${dy}`, {
              lastPoint: last,
              relativeByDefault: false,
            })
          ).toBeCloseToPoint(p(last.x + dx, last.y + dy), 8)
        })
      )
    })

    it("polar input matches the cartesian equivalent", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10_000 }).map((n) => n / 10),
          fc.integer({ min: -360, max: 360 }),
          (distance, degrees) => {
            expect(
              parseCoordinate(`${distance}<${degrees}`, ABSOLUTE)
            ).toBeCloseToPoint(
              p(
                distance * Math.cos(deg(degrees)),
                distance * Math.sin(deg(degrees))
              ),
              6
            )
          }
        )
      )
    })
  })
})
