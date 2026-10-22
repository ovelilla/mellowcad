import { describe, expect, it } from "vitest"
import {
  arcOf,
  circleOf,
  deg,
  lineOf,
  p,
  polylineOf,
  textOf,
} from "../../test/builders"
import {
  type PathLayout,
  arrayItemCopy,
  arrayPathOf,
  arraySourceSize,
  pathArrayItems,
  pathArrayMaximum,
  pathDivideStep,
  placeArrayItem,
  pointAlongPath,
  polarArrayItems,
  rectangularArrayItems,
} from "./arrays"
import { WORLD_UCS } from "./ucs"

describe("arrayPathOf", () => {
  it("takes lines, arcs, circles and polylines, and nothing of no length", () => {
    expect(arrayPathOf(lineOf(p(0, 0), p(3, 4)))?.length).toBeCloseTo(5)
    expect(arrayPathOf(arcOf(p(0, 0), 2, 0, deg(90)))?.length).toBeCloseTo(
      Math.PI
    )
    expect(arrayPathOf(circleOf(p(0, 0), 1))).toMatchObject({ closed: true })
    expect(arrayPathOf(lineOf(p(1, 1), p(1, 1)))).toBeNull()
    expect(arrayPathOf(textOf(p(0, 0), "A"))).toBeNull()
  })

  it("runs an open path from the end nearer the point given, a closed one from its start", () => {
    const line = lineOf(p(0, 0), p(10, 0))
    expect(pointAlongPath(arrayPathOf(line)!, 2).point).toBeCloseToPoint(
      p(2, 0)
    )
    const back = arrayPathOf(line, p(9, 1))!
    expect(pointAlongPath(back, 2).point).toBeCloseToPoint(p(8, 0))
    expect(pointAlongPath(back, 2).direction).toBeCloseTo(Math.PI)

    const square = polylineOf([p(0, 0), p(10, 0), p(10, 10), p(0, 10)], {
      closed: true,
    })
    const round = arrayPathOf(square, p(0, 9))!
    expect(round.length).toBeCloseTo(40)
    expect(pointAlongPath(round, 35).point).toBeCloseToPoint(p(0, 5))
  })

  it("follows a polyline's arc segments, either way", () => {
    // A half circle of radius 5 bulging below, then a line up.
    const bowl = polylineOf([p(0, 0), p(10, 0), p(10, 10)], {
      bulges: [1, 0],
    })
    const path = arrayPathOf(bowl)!
    expect(path.length).toBeCloseTo(5 * Math.PI + 10)
    expect(pointAlongPath(path, (5 * Math.PI) / 2).point).toBeCloseToPoint(
      p(5, -5)
    )
    const back = arrayPathOf(bowl, p(10, 10))!
    const bottom = pointAlongPath(back, 10 + (5 * Math.PI) / 2)
    expect(bottom.point).toBeCloseToPoint(p(5, -5))
    expect(bottom.direction).toBeCloseTo(Math.PI)
  })

  it("keeps a point asked off the path on its ends", () => {
    const path = arrayPathOf(lineOf(p(0, 0), p(10, 0)))!
    expect(pointAlongPath(path, -1).point).toBeCloseToPoint(p(0, 0))
    expect(pointAlongPath(path, 11).point).toBeCloseToPoint(p(10, 0))
  })
})

describe("the path's spacing", () => {
  const open = arrayPathOf(lineOf(p(0, 0), p(100, 0)))!
  const closed = arrayPathOf(circleOf(p(0, 0), 50))!

  it("fits one more item than steps on an open path, the steps on a closed one", () => {
    expect(pathArrayMaximum(open, 6)).toBe(17)
    expect(pathArrayMaximum(closed, 6)).toBe(52)
    expect(pathArrayMaximum(open, 0)).toBe(1)
  })

  it("divides an open path between its ends, a closed one all round", () => {
    expect(pathDivideStep(open, 5)).toBeCloseTo(25)
    expect(pathDivideStep(closed, 4)).toBeCloseTo(25 * Math.PI)
    expect(pathDivideStep(open, 1)).toBeCloseTo(100)
  })

  it("leaves out the source, item 1, and turns the rest only when aligned", () => {
    const arc = arrayPathOf(arcOf(p(0, 0), 50, 0, deg(180)))!
    const layout: PathLayout = {
      method: "measure",
      items: 3,
      spacing: 15,
      align: true,
    }
    const [second] = pathArrayItems(arc, layout)
    expect(second.turn).toBeCloseTo(0.3)
    expect(second.move).toBeCloseToPoint(p(-2.2332, 14.776), 3)
    expect(pathArrayItems(arc, { ...layout, align: false })[0].turn).toBe(0)
    expect(
      pathArrayItems(arc, { ...layout, method: "divide" }, 1)
    ).toHaveLength(1)
  })
})

describe("placing an item", () => {
  it("moves, then turns about the pivot, the preview keeping the id and the copy minting one", () => {
    const line = lineOf(p(70, 0), p(80, 0), { id: "L" })
    const item = {
      move: p(-2.2332, 14.776),
      pivot: p(47.7668, 14.776),
      turn: 0.3,
    }
    const placed = placeArrayItem(line, item)
    expect(placed.id).toBe("L")
    expect(placed.type === "line" && placed.start).toBeCloseToPoint(
      p(66.8736, 20.6864),
      3
    )
    const copy = arrayItemCopy(line, item)
    expect(copy.id).not.toBe("L")
    expect(copy.type === "line" && copy.end).toBeCloseToPoint(
      p(76.4269, 23.6416),
      3
    )
  })
})

describe("the rectangular and polar layouts", () => {
  it("steps the grid along the UCS's axes, the source's cell left out", () => {
    const grid = {
      columns: 2,
      rows: 2,
      colSpacing: 10,
      rowSpacing: 5,
      rowElevation: 1,
    }
    const items = rectangularArrayItems(grid, WORLD_UCS)
    expect(items.map((item) => item.move)).toEqual([
      { x: 0, y: 5, z: 1 },
      { x: 10, y: 0, z: 0 },
      { x: 10, y: 5, z: 1 },
    ])
    expect(rectangularArrayItems(grid, WORLD_UCS, 2)).toHaveLength(2)
  })

  it("turns each item about the centre, or carries the base point round", () => {
    const ring = {
      center: p(0, 0),
      basePoint: p(10, 0),
      items: 4,
      fill: 360,
      clockwise: false,
      rotate: true,
    }
    expect(polarArrayItems(ring).map((item) => item.turn)).toEqual([
      Math.PI / 2,
      Math.PI,
      (3 * Math.PI) / 2,
    ])
    const carried = polarArrayItems({ ...ring, rotate: false, clockwise: true })
    expect(carried[0].turn).toBe(0)
    expect(carried[0].move).toBeCloseToPoint(p(-10, -10))
    expect(polarArrayItems(ring, 1)).toHaveLength(1)
  })

  it("measures a set of nothing as nothing", () => {
    expect(arraySourceSize([], WORLD_UCS)).toEqual({ width: 0, height: 0 })
  })
})
