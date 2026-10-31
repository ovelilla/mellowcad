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
  arrayAxis,
  arraySourceSize,
  pathArrayItems,
  pathArrayMaximum,
  pathDivideStep,
  placeArrayItem,
  pointAlongPath,
  polarArrayItems,
  rectangularArrayItems,
} from "./arrays"
import { WORLD_UCS, createUcs } from "./ucs"
import type { BlockLookup, Entity, InsertEntity } from "./entityTypes"
import { createBlockDefinition, createInsert } from "./entityFactories"
import {
  anonymousBlockName,
  insertFlatGeometry,
  insertGeometry,
  isAnonymousBlock,
} from "./blocks"
import {
  copyEntity,
  mirrorEntity,
  rotateEntity,
  scaleEntity,
  translateEntity,
} from "./entityTransforms"

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
      levels: 1,
      levelSpacing: 1,
      axis: arrayAxis(WORLD_UCS),
    }
    const items = rectangularArrayItems(grid)
    expect(items.map((item) => item.move)).toEqual([
      { x: 0, y: 5, z: 1 },
      { x: 10, y: 0, z: 0 },
      { x: 10, y: 5, z: 1 },
    ])
    expect(rectangularArrayItems(grid, 2)).toHaveLength(2)
    // The columns along a UCS turned 90°, the rows square to them (probe
    // arrays/p414: the axis is the UCS's X when the array was made).
    const turned = rectangularArrayItems({
      ...grid,
      axis: arrayAxis(createUcs(p(0, 0), p(0, 1))!),
    })
    expect(turned[1].move).toBeCloseToPoint(p(0, 10))
    expect(turned[0].move).toBeCloseToPoint(p(-5, 0))
  })

  // probe arrays/p438: 2 × 2 × 2 at 6, 6 and 5, rows rising 3 — EXPLODE's
  // circles at Z 0, 5, 3, 8 in each column.
  it("stacks the levels innermost, each on top of its row's elevation", () => {
    const grid = {
      columns: 2,
      rows: 2,
      colSpacing: 6,
      rowSpacing: 6,
      rowElevation: 3,
      levels: 2,
      levelSpacing: 5,
      axis: arrayAxis(WORLD_UCS),
    }
    expect(rectangularArrayItems(grid).map((item) => item.move)).toEqual([
      { x: 0, y: 0, z: 5 },
      { x: 0, y: 6, z: 3 },
      { x: 0, y: 6, z: 8 },
      { x: 6, y: 0, z: 0 },
      { x: 6, y: 0, z: 5 },
      { x: 6, y: 6, z: 3 },
      { x: 6, y: 6, z: 8 },
    ])
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
    expect(arraySourceSize(null, WORLD_UCS)).toEqual({ width: 0, height: 0 })
  })
})

describe("an array reference", () => {
  const bar = lineOf(p(10, 0), p(14, 0), { id: "B", layerId: "L1" })
  const block = createBlockDefinition("*U1", p(12, 0), [bar])
  const lookup: BlockLookup = (id) => (id === block.id ? block : undefined)
  const rect = createInsert(block.id, p(12, 0), {
    array: {
      kind: "rectangular",
      columns: 3,
      rows: 2,
      colSpacing: 6,
      rowSpacing: 5,
      rowElevation: 0,
      levels: 1,
      levelSpacing: 1,
      axis: { x: 1, y: 0 },
    },
  })
  const ends = (entities: readonly Entity[]) =>
    entities.flatMap((e) => (e.type === "line" ? [e.start, e.end] : []))

  // probes arrays/p400, p402: the source as item 1, the others column by
  // column, as EXPLODE gives them.
  it("shows and explodes every item, the source first", () => {
    const shown = insertFlatGeometry(rect, lookup)
    expect(ends(shown)).toBeCloseToPoints([
      p(10, 0),
      p(14, 0),
      p(10, 5),
      p(14, 5),
      p(16, 0),
      p(20, 0),
      p(16, 5),
      p(20, 5),
      p(22, 0),
      p(26, 0),
      p(22, 5),
      p(26, 5),
    ])
    const exploded = insertGeometry(rect, block, { inheritLayer: false })
    expect(ends(exploded)).toBeCloseToPoints(ends(shown))
    expect(exploded.every((e) => e.layerId === "L1")).toBe(true)
  })

  // ARRAYS-D8: the parameters are the block's, so no transform knows of them.
  it("carries its items with every transform of the reference", () => {
    const transforms: ((entity: Entity) => Entity)[] = [
      (e) => translateEntity(e, p(100, -50)),
      (e) => rotateEntity(e, p(3, 4), deg(30)),
      (e) => scaleEntity(e, p(-2, 7), 2.5),
      (e) => mirrorEntity(e, p(0, 0), p(1, 1)),
      (e) => copyEntity(e, p(5, 5)),
    ]
    for (const transform of transforms) {
      const moved = transform(rect)
      expect(moved.type === "insert" && moved.array).toEqual(rect.array)
      expect(
        ends(insertFlatGeometry(moved as InsertEntity, lookup))
      ).toBeCloseToPoints(ends(insertFlatGeometry(rect, lookup).map(transform)))
    }
  })

  it("derives a polar and a path array's items from their parameters", () => {
    const ring = createInsert(block.id, p(12, 0), {
      array: {
        kind: "polar",
        center: p(0, 0),
        basePoint: p(12, 0),
        items: 4,
        fill: 360,
        clockwise: false,
        rotate: true,
      },
    })
    expect(
      ends(insertFlatGeometry(ring, lookup)).slice(2, 4)
    ).toBeCloseToPoints([p(0, 10), p(0, 14)])
    const path = arrayPathOf(lineOf(p(10, 0), p(10, 30)))!
    const along = createInsert(block.id, p(12, 0), {
      array: {
        kind: "path",
        path,
        pathId: "P",
        method: "divide",
        items: 3,
        spacing: 1,
        align: false,
      },
    })
    expect(ends(insertFlatGeometry(along, lookup)).slice(4)).toBeCloseToPoints([
      p(10, 30),
      p(14, 30),
    ])
  })

  it("names its anonymous block the lowest free *U<n>", () => {
    expect(anonymousBlockName([])).toBe("*U1")
    expect(
      anonymousBlockName([{ name: "*U1" }, { name: "*u3" }, { name: "U2" }])
    ).toBe("*U2")
    expect(isAnonymousBlock("*U2")).toBe(true)
    expect(isAnonymousBlock("BOLT")).toBe(false)
  })
})
