import fc from "fast-check"
import { describe, expect, it } from "vitest"
import {
  isCoordinateExpression,
  isPlanarCoordinate,
  parseCoordinate,
} from "./coordinateInput"
import { Ucs, WORLD_UCS, createUcs } from "../../domain/ucs"
import { coordinate, point } from "../../../test/arbitraries"
import { deg, p } from "../../../test/builders"

/**
 * Typed coordinate entry is the "total precision" path: whatever the mouse is
 * doing, this decides where the point lands. It is also the one place where a
 * locale habit (comma as decimal separator) collides with syntax, so the
 * trade-off is pinned explicitly.
 */

const ABSOLUTE = {
  lastPoint: null,
  relativeByDefault: false,
  ucs: WORLD_UCS,
  elevation: 0,
}
const FROM_100_100 = {
  lastPoint: p(100, 100),
  relativeByDefault: true,
  ucs: WORLD_UCS,
  elevation: 0,
}
/** Origin at (10, 20), X axis pointing along world +Y. */
const TURNED = createUcs({ x: 10, y: 20, z: 0 }, p(0, 1)) as Ucs

describe("isCoordinateExpression", () => {
  it("recognises the coordinate syntaxes", () => {
    expect(isCoordinateExpression("50,100")).toBe(true)
    expect(isCoordinateExpression("100<45")).toBe(true)
    expect(isCoordinateExpression("@30,0")).toBe(true)
    expect(isCoordinateExpression("#0,0")).toBe(true)
    expect(isCoordinateExpression("*0,0")).toBe(true)
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

describe("isPlanarCoordinate", () => {
  it("takes what a 2D point prompt takes at the command line", () => {
    // probes pline/p18–p20, p137
    for (const text of ["5,5", "@10,0", "#20,0", "10<30", "@10<90", "@"]) {
      expect(isPlanarCoordinate(text)).toBe(true)
    }
    for (const text of [
      "20,20,7",
      "@0,10,5",
      "#20,0,5",
      "*20,0",
      "@*5,0",
      "10<30,5",
      "10<30<45",
      "10",
      "FOO",
    ]) {
      expect(isPlanarCoordinate(text)).toBe(false)
    }
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

    it("reads the numbers AutoCAD reads in decimal units", () => {
      // probe line/p150
      expect(parseCoordinate("1e1,0", ABSOLUTE)).toBeCloseToPoint(p(10, 0))
      expect(parseCoordinate("1/2,0", ABSOLUTE)).toBeCloseToPoint(p(0.5, 0))
      expect(parseCoordinate("1-1/2,0", ABSOLUTE)).toBeCloseToPoint(p(1.5, 0))
      expect(parseCoordinate("5.,0", ABSOLUTE)).toBeCloseToPoint(p(5, 0))
      expect(parseCoordinate("+5,-0.5", ABSOLUTE)).toBeCloseToPoint(p(5, -0.5))
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

    it("reads the angle forms AutoCAD reads with AUNITS 0", () => {
      // probe line/p151
      const at = (degrees: number) =>
        p(10 * Math.cos(deg(degrees)), 10 * Math.sin(deg(degrees)))
      for (const [typed, degrees] of [
        ["10<30d", 30],
        ["10<30d30'", 30.5],
        ["10<0.5r", 0.5 / deg(1)],
        ["10<50g", 45],
        ["10<N45dE", 45],
        ["10<1e1", 10],
      ] as const) {
        expect(parseCoordinate(typed, ABSOLUTE)).toBeCloseToPoint(
          at(degrees),
          9
        )
      }
    })

    it("reads cylindrical and spherical points", () => {
      // probe line/p151
      const cylindrical = parseCoordinate("10<30,5", ABSOLUTE)
      expect(cylindrical).toBeCloseToPoint(p(8.66025, 5), 5)
      expect(cylindrical?.z).toBe(5)
      const spherical = parseCoordinate("10<30<45", ABSOLUTE)
      expect(spherical).toBeCloseToPoint(p(6.12372, 3.53553), 5)
      expect(spherical?.z).toBeCloseTo(7.07107, 5)
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

    it("a bare @ is the last point itself, as @0,0", () => {
      expect(parseCoordinate("@", FROM_100_100)).toBeCloseToPoint(p(100, 100))
      expect(parseCoordinate("@", ABSOLUTE)).toBeNull()
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
          ucs: WORLD_UCS,
          elevation: 0,
        })
      ).toBeCloseToPoint(p(30, 0))
    })

    it("is absolute when there is no last point, whatever the default", () => {
      // The first point of a command has nothing to be relative to.
      expect(
        parseCoordinate("@30,0", {
          lastPoint: null,
          relativeByDefault: true,
          ucs: WORLD_UCS,
          elevation: 0,
        })
      ).toBeCloseToPoint(p(30, 0))
    })
  })

  describe("in a UCS", () => {
    const inUcs = {
      lastPoint: null,
      relativeByDefault: false,
      ucs: TURNED,
      elevation: 0,
    }
    const fromLast = {
      lastPoint: p(100, 100),
      relativeByDefault: true,
      ucs: TURNED,
      elevation: 0,
    }

    it("reads an absolute point from the UCS origin along its axes", () => {
      expect(parseCoordinate("5,0", inUcs)).toBeCloseToPoint(p(10, 25))
      expect(parseCoordinate("0,5", inUcs)).toBeCloseToPoint(p(5, 20))
      expect(parseCoordinate("5<90", inUcs)).toBeCloseToPoint(p(5, 20), 9)
    })

    it("turns a relative offset by the UCS, but not its base", () => {
      expect(parseCoordinate("@5,0", fromLast)).toBeCloseToPoint(p(100, 105))
      expect(parseCoordinate("@5<0", fromLast)).toBeCloseToPoint(p(100, 105))
    })

    it("# is the UCS origin", () => {
      expect(parseCoordinate("#0,0", fromLast)).toBeCloseToPoint(p(10, 20))
    })

    it("* reads the numbers in the WCS", () => {
      expect(parseCoordinate("*5,0", inUcs)).toBeCloseToPoint(p(5, 0))
      expect(parseCoordinate("#*5,0", fromLast)).toBeCloseToPoint(p(5, 0))
      expect(parseCoordinate("@*5,0", fromLast)).toBeCloseToPoint(p(105, 100))
      // Absolute where the relative default holds: AutoCAD's `*x,y`.
      expect(parseCoordinate("*5,0", fromLast)).toBeCloseToPoint(p(5, 0))
      expect(parseCoordinate("*", inUcs)).toBeNull()
    })
  })

  describe("with a Z", () => {
    const RAISED = createUcs({ x: 0, y: 0, z: 3 }, p(1, 0)) as Ucs
    const at = (x: number, y: number, z: number) => ({ x, y, z })
    const onPlane = {
      lastPoint: null,
      relativeByDefault: false,
      ucs: RAISED,
      elevation: 0,
    }
    const fromRaised = {
      lastPoint: at(100, 100, 10),
      relativeByDefault: true,
      ucs: RAISED,
      elevation: 0,
    }

    it("reads x,y,z from the UCS's XY plane", () => {
      expect(parseCoordinate("1,2,5", onPlane)).toMatchObject(at(1, 2, 8))
      expect(parseCoordinate("*1,2,5", onPlane)).toMatchObject(at(1, 2, 5))
    })

    it("puts an absolute point typed without a Z on the UCS's XY plane", () => {
      expect(parseCoordinate("1,2", onPlane)).toMatchObject(at(1, 2, 3))
      expect(parseCoordinate("#1,2", fromRaised)).toMatchObject(at(1, 2, 3))
    })

    it("puts a * point typed without a Z on the WCS's XY plane, whatever ELEVATION", () => {
      // probes line/p152, p163
      const elevated = { ...onPlane, elevation: 4 }
      expect(parseCoordinate("*1,2", onPlane)).toMatchObject(at(1, 2, 0))
      expect(parseCoordinate("*1,2", elevated)).toMatchObject(at(1, 2, 0))
      expect(parseCoordinate("*5<0", elevated)).toMatchObject(at(5, 0, 0))
      expect(parseCoordinate("*1,2,5", elevated)).toMatchObject(at(1, 2, 5))
      expect(
        parseCoordinate("@*5,0", { ...fromRaised, elevation: 4 })
      ).toMatchObject(at(105, 100, 10))
    })

    it("puts an absolute point typed without a Z at the elevation", () => {
      const elevated = { ...onPlane, elevation: 4 }
      expect(parseCoordinate("1,2", elevated)).toMatchObject(at(1, 2, 7))
      expect(parseCoordinate("5<0", elevated)).toMatchObject(at(5, 0, 7))
      expect(parseCoordinate("1,2,5", elevated)).toMatchObject(at(1, 2, 8))
      expect(
        parseCoordinate("@5,0", { ...fromRaised, elevation: 4 })
      ).toMatchObject(at(105, 100, 10))
    })

    it("keeps the last point's Z for a relative point typed without one", () => {
      expect(parseCoordinate("@5,0", fromRaised)).toMatchObject(
        at(105, 100, 10)
      )
      expect(parseCoordinate("@0,0,-4", fromRaised)).toMatchObject(
        at(100, 100, 6)
      )
      const polar = parseCoordinate("@5<90", fromRaised)
      expect(polar).toBeCloseToPoint(p(100, 105), 9)
      expect(polar?.z).toBe(10)
    })

    it("reads cylindrical coordinates: polar in the plane, then a Z", () => {
      const point = parseCoordinate("10<90,4", onPlane)
      expect(point).toBeCloseToPoint(p(0, 10), 9)
      expect(point?.z).toBe(7)
    })

    it("reads spherical coordinates: an angle in the plane, one up from it", () => {
      const point = parseCoordinate("@10<0<30", fromRaised)
      expect(point).toBeCloseToPoint(p(100 + 10 * Math.cos(deg(30)), 100), 9)
      expect(point?.z).toBeCloseTo(15, 9)
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
      expect(parseCoordinate("1,2,", ABSOLUTE)).toBeNull()
      expect(parseCoordinate("10<30,", ABSOLUTE)).toBeNull()
      expect(parseCoordinate("10<30<", ABSOLUTE)).toBeNull()
    })

    it("rejects text that is not a coordinate", () => {
      expect(parseCoordinate("", ABSOLUTE)).toBeNull()
      expect(parseCoordinate("100", ABSOLUTE)).toBeNull()
      expect(parseCoordinate("abc,def", ABSOLUTE)).toBeNull()
      expect(parseCoordinate("1,2,3,4", ABSOLUTE)).toBeNull()
      expect(parseCoordinate("10<30<45,5", ABSOLUTE)).toBeNull()
      expect(parseCoordinate("Infinity,0", ABSOLUTE)).toBeNull()
      // probe line/p150: feet and inches in decimal units, hex, a dangling comma
      expect(parseCoordinate(`1'6",0`, ABSOLUTE)).toBeNull()
      expect(parseCoordinate("0x10,0", ABSOLUTE)).toBeNull()
      expect(parseCoordinate("5,5,", ABSOLUTE)).toBeNull()
      expect(parseCoordinate("10<30x", ABSOLUTE)).toBeNull()
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
              ucs: WORLD_UCS,
              elevation: 0,
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
