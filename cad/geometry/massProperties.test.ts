import fc from "fast-check"
import { describe, expect, it } from "vitest"

import { solidEntity } from "../../test/arbitraries"
import { solidMapped } from "../domain/solids"
import { Vec3, add3, cross3, dot3, scale3, sub3 } from "./Vec3"
import { arbitraryAxis, axesToWorld } from "./ocs"
import {
  Moments,
  brepMoments,
  jacobiEigen,
  momentsAbout,
  momentsSum,
  planarMoments,
  regionInertia,
  regionMoments,
  solidInertia,
} from "./massProperties"
import {
  Brep,
  boxBrep,
  brepBox,
  brepVolume,
  pyramidBrep,
  roundBrep,
  sphereBrep,
  torusBrep,
  wedgeBrep,
} from "./solids"
import { RegionFace } from "./planarRegions"

const X: Vec3 = { x: 1, y: 0, z: 0 }
const Y: Vec3 = { x: 0, y: 1, z: 0 }
const Z: Vec3 = { x: 0, y: 0, z: 1 }
const at = (x: number, y: number, z: number): Vec3 => ({ x, y, z })

/** MPDUMP's `massProperties`, as AutoCAD 2027's ACIS gives them. */
interface Dumped {
  readonly volume: number
  readonly centroid: readonly number[]
  readonly moments: readonly number[]
  readonly products: readonly number[]
  readonly principal: readonly number[]
  readonly radii: readonly number[]
}

/** `corner` turned about `center` round Z by each quarter, as a square pyramid's corners lie. */
function square(center: Vec3, corner: Vec3): Vec3[] {
  const d = sub3(corner, center)
  return [0, 1, 2, 3].map((k) => {
    const c = [1, 0, -1, 0][k]
    const s = [0, 1, 0, -1][k]
    return add3(center, at(d.x * c - d.y * s, d.x * s + d.y * c, d.z))
  })
}

/**
 * The probes' primitives and their MPDUMP (solid/m01–m03): each made as the
 * console made it, its numbers as ACIS printed them to the last digit.
 */
const DUMPED: readonly [string, Brep, Dumped][] = [
  [
    "box",
    boxBrep(at(0, 0, 0), scale3(X, 10), scale3(Y, 20), scale3(Z, 5)),
    {
      volume: 1000,
      centroid: [5, 10, 2.5],
      moments: [141666.66666666666, 41666.66666666666, 166666.66666666663],
      products: [-50000, -25000, -12500],
      principal: [35416.66666666666, 10416.666666666657, 41666.66666666663],
      radii: [11.902380714238083, 6.454972243679028, 12.909944487358056],
    },
  ],
  [
    "wedge",
    wedgeBrep(at(20, 0, 0), scale3(X, 10), scale3(Y, 20), scale3(Z, 5)),
    {
      volume: 500.0000000000002,
      centroid: [23.33333333333333, 9.999999999999998, 1.666666666666667],
      moments: [68750.00000000001, 277083.33333333343, 341666.6666666668],
      products: [-116666.6666666667, -8333.333333333338, -18750.000000000007],
      principal: [17150.850251574986, 3472.222222222248, 19654.70530398065],
      radii: [11.726039399558573, 23.54074481970922, 26.140645235596867],
    },
  ],
  [
    "pyramid",
    pyramidBrep(
      square(at(50, 0, 0), at(52.318876780717936, 6.680030724169409, 0)),
      at(50, 0, 8),
      null
    ),
    {
      volume: 266.6666666666669,
      centroid: [50, -8.526512829121194e-16, 2],
      moments: [3040.000000000002, 669706.6666666672, 669333.333333334],
      products: [
        1.8189894035458565e-11, -4.547473508864641e-13, -26666.666666666693,
      ],
      principal: [1973.3333333333348, 1973.333333333255, 2666.666666666628],
      radii: [3.3763886032268258, 50.113870335467006, 50.0999001995014],
    },
  ],
  [
    "frustum pyramid",
    pyramidBrep(
      square(at(70, 0, 0), at(74.4202542969786, 2.3369535618069657, 0)),
      at(70, 0, 8),
      square(at(70, 0, 8), at(71.76810171879144, 0.9347814247227859, 8))
    ),
    {
      volume: 208.00000000000014,
      centroid: [70, -5.465713352000767e-16, 2.923076923076923],
      moments: [3246.4000000000046, 1022446.4000000007, 1020299.7333333341],
      products: [
        1.1368683772161603e-11, 9.094947017729282e-13, -42560.00000000003,
      ],
      principal: [1469.1692307691937, 1469.1692307692722, 1099.7333333333954],
      radii: [3.9506571994659723, 70.11139488205674, 70.037755385843],
    },
  ],
  [
    "cylinder",
    roundBrep(at(0, 0, 0), Z, X, 5, 5, 10, 1),
    {
      volume: 785.3981633974485,
      centroid: [0, 0, 5],
      moments: [31088.677301149073, 31088.677301148793, 9817.477042467963],
      products: [0, 0, 0],
      principal: [11453.72321621286, 11453.72321621258, 9817.477042467963],
      radii: [6.291528696058966, 6.291528696058937, 3.535533905932712],
    },
  ],
  [
    "elliptical cylinder",
    roundBrep(at(25, 0, 0), Z, X, 5, 3, 10, 1),
    {
      volume: 471.23889803846896,
      centroid: [24.999999999999996, 0, 5],
      moments: [16768.250788535534, 313177.51765473234, 298529.84190736996],
      products: [-4.547473508864641e-12, 0, -58904.86225480862],
      principal: [4987.278337573809, 6872.233929727634, 4005.530633326969],
      radii: [5.965176722724429, 25.779513830430027, 25.169425897306432],
    },
  ],
  [
    "cone",
    roundBrep(at(50, 0, 0), Z, X, 5, 5, 10, 0),
    {
      volume: 261.7993877991494,
      centroid: [50, 1.6957319283304823e-15, 2.5],
      moments: [3599.7415822382604, 658098.2110801116, 656461.9649063669],
      products: [
        -2.269956222492889e-11, -4.075812437708492e-12, -32724.923474893672,
      ],
      principal: [1963.4954084935769, 1963.4954084934463, 1963.4954084934404],
      radii: [3.7080992435478093, 50.137311455641495, 50.07494383421712],
    },
  ],
  [
    "frustum",
    roundBrep(at(70, 0, 0), Z, X, 5, 5, 10, 0.4),
    {
      volume: 408.40704496666797,
      centroid: [70.00000000017972, 0, 3.6538461538461107],
      moments: [9892.351684054474, 2011086.8719642991, 2004433.5023394478],
      products: [5.4569682106375694e-12, 0, -104457.95573236131],
      principal: [4439.8759727760735, 4439.875906071626, 3238.9819924987387],
      radii: [4.9215642749665, 70.17279953639058, 70.0566254480921],
    },
  ],
  [
    "elliptical cone",
    roundBrep(at(95, 0, 0), Z, X, 5, 3, 10, 0),
    {
      volume: 157.0796326794897,
      centroid: [95, -3.59670093786462e-16, 2.5000000000000004],
      moments: [1782.8538309121843, 1419803.5298817374, 1418444.7910590598],
      products: [
        5.3366145527253e-12, 2.9889584555051127e-13, -37306.4127613788,
      ],
      principal: [801.1061266653796, 1178.097245096229, 801.1061266653646],
      radii: [3.3689761055845806, 95.07234087788099, 95.02683831423626],
    },
  ],
  [
    "frustum widening down",
    roundBrep(at(110, 0, 0), scale3(Z, -1), X, 3, 3, 10, 2),
    {
      volume: 659.7344572538567,
      centroid: [110, -2.7571538572009656e-15, -6.071428571428573],
      moments: [33161.08125496691, 8015948.014026634, 7990675.471924831],
      products: [
        1.8189894035458565e-10, -1.0913936421275139e-11, 440608.3696659687,
      ],
      principal: [8841.788124053455, 8841.78812405467, 7888.539153165184],
      radii: [7.089731004367195, 110.22823724306893, 110.05433722873963],
    },
  ],
  [
    "sphere",
    sphereBrep(at(0, 0, 0), Z, X, 5),
    {
      volume: 523.5987755982989,
      centroid: [0, 0, 0],
      moments: [5235.987755982995, 5235.987755982995, 5235.987755982995],
      products: [0, 0, 0],
      principal: [5235.9877559829965, 5235.987755982991, 5235.9877559829965],
      radii: [3.1622776601683813, 3.1622776601683813, 3.1622776601683813],
    },
  ],
  [
    "doughnut",
    torusBrep(at(30, 0, 0), Z, X, 10, 3),
    {
      volume: 1776.5287921960844,
      centroid: [30, 0, 0],
      moments: [98819.4140659072, 1697695.3270423831, 1788520.3615434081],
      products: [0, 0, 0],
      principal: [98819.4140659072, 98819.41406590724, 189644.44856693223],
      radii: [7.458216945088149, 30.91318488929926, 31.729323976410214],
    },
  ],
  [
    "apple",
    torusBrep(at(60, 0, 0), Z, X, 2, 4),
    {
      volume: 682.2902295628734,
      centroid: [60, 0, 0],
      moments: [7717.34595954497, 2463962.172385889, 2466430.146195691],
      products: [0, 0, 0],
      principal: [7717.34595954497, 7717.345959545113, 10185.319769347087],
      radii: [3.363174555843394, 60.094183937325184, 60.12427241722211],
    },
  ],
  [
    "lemon",
    torusBrep(at(90, 0, 0), Z, X, -4, 5),
    {
      volume: 10.366559081478991,
      centroid: [90, 0, 0],
      moments: [15.88785385324269, 83985.01641383307, 83973.10988114415],
      products: [0, 0, 0],
      principal: [15.88785385324269, 15.88785385324445, 3.9813211643195245],
      radii: [1.2379847774614907, 90.00851407677624, 90.00213360948061],
    },
  ],
  [
    "vortex",
    torusBrep(at(120, 0, 0), Z, X, 4, 4),
    {
      volume: 1263.3093633394378,
      centroid: [120, 0, 0],
      moments: [22739.56854010988, 18214394.40062801, 18227027.494261406],
      products: [0, 0, 0],
      principal: [22739.56854010988, 22739.56854010746, 35372.66217350215],
      radii: [4.242640687119285, 120.074976577137, 120.11661000877439],
    },
  ],
  [
    "sphere off the origin",
    sphereBrep(at(150, 7, -3), Z, X, 2.5),
    {
      volume: 65.44984694978736,
      centroid: [150, 7, -3],
      moments: [3959.7157404621353, 1473374.229610138, 1475992.2234881294],
      products: [-68722.33929727672, 1374.4467859455347, 29452.431127404314],
      principal: [163.62461737446853, 163.62461737450212, 163.62461737426923],
      radii: [7.7781745930520225, 150.03832843643653, 150.17156854744508],
    },
  ],
]

/** Close to `expected` relative to `scale`: ACIS integrates to about 1e-8 (the frustum's principal moments). */
function near(actual: number, expected: number, scale: number) {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(1e-7 * scale)
}

const xyz = (v: Vec3) => [v.x, v.y, v.z]

describe("a primitive's mass properties against AutoCAD's", () => {
  it.each(DUMPED)("%s (solid/m01–m03's MPDUMP)", (_, brep, dumped) => {
    const m = brepMoments(brep)
    const inertia = solidInertia(m)
    const top = Math.max(...dumped.moments)
    near(m.measure, dumped.volume, dumped.volume)
    xyz(inertia.centroid).forEach((v, k) => near(v, dumped.centroid[k], 100))
    xyz(inertia.moments).forEach((v, k) => near(v, dumped.moments[k], top))
    ;[inertia.products.xy, inertia.products.yz, inertia.products.zx].forEach(
      (v, k) => near(v, dumped.products[k], top)
    )
    xyz(inertia.radii).forEach((v, k) => near(v, dumped.radii[k], 100))
    // In Jacobi's order, which leaves a degenerate pair's anywhere: sorted.
    const sorted = (values: readonly number[]) =>
      [...values].sort((a, b) => a - b)
    sorted(inertia.principal.map((p) => p.moment)).forEach((v, k) =>
      near(v, sorted(dumped.principal)[k], Math.max(...dumped.principal))
    )
  })

  it("orders and turns the principal axes as AutoCAD's Jacobi does (m01's wedge)", () => {
    const [i, j, k] = solidInertia(brepMoments(DUMPED[1][1])).principal
    expect(i.moment).toBeCloseTo(17150.850251574986, 6)
    expect(j.moment).toBeCloseTo(3472.222222222248, 6)
    expect(k.moment).toBeCloseTo(19654.70530398065, 6)
    expect(xyz(i.direction).map((v) => v.toFixed(4))).toEqual([
      "0.9571",
      "0.0000",
      "-0.2898",
    ])
    expect(xyz(j.direction).map((v) => v.toFixed(4))).toEqual([
      "0.0000",
      "1.0000",
      "0.0000",
    ])
    expect(xyz(k.direction).map((v) => v.toFixed(4))).toEqual([
      "0.2898",
      "0.0000",
      "0.9571",
    ])
  })

  it("gives a box's exact extents, a turned pyramid's at its corners (m01: 43.3200 -- 56.6800)", () => {
    const box = brepBox(DUMPED[2][1])!
    expect(box.min.x.toFixed(4)).toBe("43.3200")
    expect(box.max.y.toFixed(4)).toBe("6.6800")
    const lemon = brepBox(DUMPED[13][1])!
    expect([lemon.min.x, lemon.max.x, lemon.min.z, lemon.max.z]).toEqual([
      89, 91, -3, 3,
    ])
    const cone = brepBox(DUMPED[9][1])!
    expect(xyz(cone.min).map((v) => v.toFixed(4))).toEqual([
      "104.0000",
      "-6.0000",
      "-10.0000",
    ])
  })
})

/** A frame turned any way, anywhere. */
const placement = fc
  .tuple(
    fc.double({ min: -Math.PI, max: Math.PI, noNaN: true }),
    fc.double({ min: -Math.PI / 2, max: Math.PI / 2, noNaN: true }),
    fc.double({ min: -Math.PI, max: Math.PI, noNaN: true }),
    fc.tuple(
      fc.double({ min: -1e4, max: 1e4, noNaN: true }),
      fc.double({ min: -1e4, max: 1e4, noNaN: true }),
      fc.double({ min: -1e4, max: 1e4, noNaN: true })
    )
  )
  .map(([azimuth, tilt, turn, [x, y, z]]) => {
    const axes = arbitraryAxis(
      at(
        Math.cos(tilt) * Math.cos(azimuth),
        Math.cos(tilt) * Math.sin(azimuth),
        Math.sin(tilt)
      )
    )!
    const u = add3(
      scale3(axes.x, Math.cos(turn)),
      scale3(axes.y, Math.sin(turn))
    )
    return { x: u, y: cross3(axes.z, u), z: axes.z, origin: at(x, y, z) }
  })

const size = fc.double({ min: 0.05, max: 100, noNaN: true })

const sortedPrincipal = (m: Moments) =>
  solidInertia(m)
    .principal.map((p) => p.moment)
    .sort((a, b) => a - b)

function expectMoments(actual: readonly number[], expected: readonly number[]) {
  const scale = Math.max(...expected.map(Math.abs))
  actual.forEach((v, k) =>
    expect(Math.abs(v - expected[k])).toBeLessThanOrEqual(1e-8 * scale)
  )
}

describe("a solid's mass properties against closed forms, placed anywhere", () => {
  it("a box: lwh, its middle, m(w² + h²)/12 about its axes", () => {
    fc.assert(
      fc.property(placement, size, size, size, (f, l, w, h) => {
        const brep = boxBrep(
          f.origin,
          scale3(f.x, l),
          scale3(f.y, w),
          scale3(f.z, h)
        )
        const m = brepMoments(brep)
        const v = l * w * h
        expect(m.measure).toBeCloseTo(v, 9 - Math.ceil(Math.log10(v + 1)))
        const middle = add3(f.origin, axesToWorld(f, at(l / 2, w / 2, h / 2)))
        const c = solidInertia(m).centroid
        expect(
          Math.hypot(c.x - middle.x, c.y - middle.y, c.z - middle.z)
        ).toBeLessThan(1e-9 * (1e4 + l + w + h))
        expectMoments(
          sortedPrincipal(m),
          [
            (v * (w * w + h * h)) / 12,
            (v * (l * l + h * h)) / 12,
            (v * (l * l + w * w)) / 12,
          ].sort((a, b) => a - b)
        )
      })
    )
  })

  it("a wedge: lwh/2, a third along from its tall end and up", () => {
    fc.assert(
      fc.property(placement, size, size, size, (f, l, w, h) => {
        const m = brepMoments(
          wedgeBrep(f.origin, scale3(f.x, l), scale3(f.y, w), scale3(f.z, h))
        )
        expect(Math.abs(m.measure - (l * w * h) / 2)).toBeLessThan(
          1e-9 * l * w * h
        )
        const c = sub3(solidInertia(m).centroid, f.origin)
        expect(dot3(c, f.x)).toBeCloseTo(l / 3, 6)
        expect(dot3(c, f.y)).toBeCloseTo(w / 2, 6)
        expect(dot3(c, f.z)).toBeCloseTo(h / 3, 6)
      })
    )
  })

  it("a cylinder, elliptical or not: πabh, m(b²/4 + h²/12) and m(a² + b²)/4", () => {
    fc.assert(
      fc.property(placement, size, size, size, (f, a, b, h) => {
        const brep = roundBrep(f.origin, f.z, f.x, a, b, h, 1)
        const m = brepMoments(brep)
        const v = Math.PI * a * b * h
        expect(Math.abs(m.measure - v)).toBeLessThan(1e-9 * v)
        expectMoments(
          sortedPrincipal(m),
          [
            v * ((b * b) / 4 + (h * h) / 12),
            v * ((a * a) / 4 + (h * h) / 12),
            (v * (a * a + b * b)) / 4,
          ].sort((x, y) => x - y)
        )
      })
    )
  })

  it("a cone: πr²h/3, its centroid h/4 up, 3mr²/10 and 3m(r²/20 + h²/80)", () => {
    fc.assert(
      fc.property(placement, size, size, (f, r, h) => {
        const m = brepMoments(roundBrep(f.origin, f.z, f.x, r, r, h, 0))
        const v = (Math.PI * r * r * h) / 3
        expect(Math.abs(m.measure - v)).toBeLessThan(1e-9 * v)
        expect(dot3(sub3(solidInertia(m).centroid, f.origin), f.z)).toBeCloseTo(
          h / 4,
          6
        )
        const across = 3 * v * ((r * r) / 20 + (h * h) / 80)
        expectMoments(
          sortedPrincipal(m),
          [across, across, (3 * v * r * r) / 10].sort((x, y) => x - y)
        )
      })
    )
  })

  it("a frustum: πh(r₁² + r₁r₂ + r₂²)/3", () => {
    fc.assert(
      fc.property(placement, size, size, size, (f, r, top, h) => {
        fc.pre(Math.abs(top - r) > 1e-3)
        const m = brepMoments(roundBrep(f.origin, f.z, f.x, r, r, h, top / r))
        const v = (Math.PI * h * (r * r + r * top + top * top)) / 3
        expect(Math.abs(m.measure - v)).toBeLessThan(1e-9 * v)
      })
    )
  })

  it("a sphere: 4πr³/3 and 2mr²/5", () => {
    fc.assert(
      fc.property(placement, size, (f, r) => {
        const m = brepMoments(sphereBrep(f.origin, f.z, f.x, r))
        const v = (4 * Math.PI * r ** 3) / 3
        expect(Math.abs(m.measure - v)).toBeLessThan(1e-9 * v)
        expectMoments(
          sortedPrincipal(m),
          [1, 1, 1].map(() => (2 * v * r * r) / 5)
        )
      })
    )
  })

  it("a doughnut: 2π²Rr², m(R² + 3r²/4) round its axis, m(R²/2 + 5r²/8) across", () => {
    fc.assert(
      fc.property(placement, size, size, (f, r, extra) => {
        const R = r + extra
        const m = brepMoments(torusBrep(f.origin, f.z, f.x, R, r))
        const v = 2 * Math.PI ** 2 * R * r * r
        expect(Math.abs(m.measure - v)).toBeLessThan(1e-9 * v)
        const across = v * ((R * R) / 2 + (5 * r * r) / 8)
        expectMoments(
          sortedPrincipal(m),
          [across, across, v * (R * R + (3 * r * r) / 4)].sort((x, y) => x - y)
        )
      })
    )
  })

  it("any primitive keeps its volume and principal moments through a rigid motion, its centroid carried", () => {
    fc.assert(
      fc.property(solidEntity, placement, (solid, f) => {
        const moved = solidMapped(solid, {
          rotation: { x: f.x, y: f.y, z: f.z },
          scale: 1,
          translation: f.origin,
        })
        const before = brepMoments(solid.brep)
        const after = brepMoments(moved.brep)
        // The B-rep's own volume, already checked against each closed form.
        expect(Math.abs(before.measure - brepVolume(solid.brep))).toBeLessThan(
          1e-8 * before.measure
        )
        expect(Math.abs(after.measure - before.measure)).toBeLessThan(
          1e-9 * before.measure
        )
        expectMoments(sortedPrincipal(after), sortedPrincipal(before))
        const carried = add3(
          axesToWorld(f, solidInertia(before).centroid),
          f.origin
        )
        const c = solidInertia(after).centroid
        expect(
          Math.hypot(c.x - carried.x, c.y - carried.y, c.z - carried.z)
        ).toBeLessThan(1e-7 * 1e5)
      })
    )
  })

  it("sums bodies about any point as one body (m05's overlapping boxes: counted twice)", () => {
    const a = brepMoments(
      boxBrep(at(0, 0, 0), scale3(X, 10), scale3(Y, 10), scale3(Z, 10))
    )
    const b = brepMoments(
      boxBrep(at(5, 5, 5), scale3(X, 10), scale3(Y, 10), scale3(Z, 10))
    )
    const both = solidInertia(momentsSum([a, b])!)
    expect(both.moments.x).toBeCloseTo(283333.3333, 3)
    expect(both.products.xy).toBeCloseTo(-125000, 6)
    expect(both.principal.map((p) => p.moment.toFixed(4))).toEqual([
      "70833.3333",
      "33333.3333",
      "70833.3333",
    ])
    expect(
      both.principal.map((p) => xyz(p.direction).map((v) => v.toFixed(4)))
    ).toEqual([
      ["0.7071", "-0.7071", "0.0000"],
      ["0.5774", "0.5774", "0.5774"],
      ["-0.4082", "-0.4082", "0.8165"],
    ])
    const shifted = momentsAbout(momentsSum([a, b])!, at(-3, 7, 11))
    expect(solidInertia(shifted).moments.x).toBeCloseTo(283333.3333, 3)
  })
})

describe("Jacobi's eigenvectors", () => {
  it("keep AutoCAD's order and signs in a tilted UCS (solid/m04)", () => {
    // m04's box and cylinder about their centroid in the UCS Z 30, X 40, O 3,4,5.
    const m = 1603.1858
    const c = [13.7587, -1.1348, 0.0211]
    const I = [229630.3646, 502533.3524, 532546.4361]
    const P = [110368.2065, 103551.2917, -75702.9616]
    const [x, y, z] = c
    const { values, vectors } = jacobiEigen([
      [I[0] - m * (y * y + z * z), P[0] + m * x * y, P[2] + m * z * x],
      [P[0] + m * x * y, I[1] - m * (x * x + z * z), P[1] + m * y * z],
      [P[2] + m * z * x, P[1] + m * y * z, I[2] - m * (x * x + y * y)],
    ])
    expect(values.map((v) => Math.round(v / 100))).toEqual([2964, 397, 3175])
    expect(
      [0, 1, 2].map((k) => vectors.map((row) => row[k].toFixed(4)))
    ).toEqual([
      ["0.8552", "0.4030", "-0.3259"],
      ["-0.5180", "0.6435", "-0.5636"],
      ["-0.0174", "0.6508", "0.7590"],
    ])
  })

  it("leave equal moments on the axes, not turned by rounding", () => {
    const { vectors } = jacobiEigen([
      [5, 1e-14, 0],
      [1e-14, 5, 0],
      [0, 0, 3],
    ])
    expect(vectors).toEqual([
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ])
  })
})

/** A square `side` wide from `corner`, counter-clockwise, and a hole round `hole`. */
function squareWithHole(
  corner: number,
  side: number,
  hole: number
): RegionFace {
  const a = { x: corner, y: corner }
  const b = { x: corner + side, y: corner }
  const c = { x: corner + side, y: corner + side }
  const d = { x: corner, y: corner + side }
  const middle = { x: corner + side / 2, y: corner + side / 2 }
  return {
    loops: [
      [
        { kind: "line", start: a, end: b },
        { kind: "line", start: b, end: c },
        { kind: "line", start: c, end: d },
        { kind: "line", start: d, end: a },
      ],
      [
        {
          kind: "arc",
          center: middle,
          radius: hole,
          startAngle: 0,
          sweep: -2 * Math.PI,
        },
      ],
    ],
  }
}

const WORLD = { x: X, y: Y, z: Z }

describe("a region's mass properties", () => {
  it("a square less a circle (region/b02)", () => {
    const m = regionMoments([squareWithHole(0, 20, 5)], WORLD, 0, {
      x: 0,
      y: 0,
    })
    const inertia = regionInertia(m)
    expect(m.measure.toFixed(4)).toBe("321.4602")
    expect(inertia.moments.x.toFixed(4)).toBe("44988.4778")
    expect(inertia.moments.y.toFixed(4)).toBe("44988.4778")
    expect(inertia.product.toFixed(4)).toBe("-32146.0184")
    expect(inertia.radii.x.toFixed(4)).toBe("11.8301")
    expect(inertia.principal.map((p) => p.moment.toFixed(4))).toEqual([
      "12842.4595",
      "12842.4595",
    ])
  })

  it("an ellipse's arcs and a full one: πab, πab³/4 and πa³b/4 about its middle", () => {
    fc.assert(
      fc.property(
        size,
        fc.double({ min: 0.05, max: 1, noNaN: true }),
        fc.double({ min: -Math.PI, max: Math.PI, noNaN: true }),
        (a, ratio, start) => {
          const b = a * ratio
          const half = (from: number) => ({
            kind: "ellipse" as const,
            center: { x: 0, y: 0 },
            majorAxis: { x: a, y: 0 },
            ratio,
            startParam: from,
            sweep: Math.PI,
          })
          const m = planarMoments(
            [{ loops: [[half(start), half(start + Math.PI)]] }],
            { x: 0, y: 0 }
          )
          expect(m.area).toBeCloseTo(Math.PI * a * b, 9)
          expect(m.vv / ((Math.PI * a * b ** 3) / 4)).toBeCloseTo(1, 10)
          expect(m.uu / ((Math.PI * a ** 3 * b) / 4)).toBeCloseTo(1, 10)
          expect(Math.abs(m.uv)).toBeLessThan(1e-9 * a ** 4)
        }
      )
    )
  })

  it("a spline's edge, a rational quarter circle, as the arc it is", () => {
    const w = Math.SQRT1_2
    const quarter = {
      kind: "spline" as const,
      curve: {
        degree: 2,
        knots: [0, 0, 0, 1, 1, 1],
        controlPoints: [at(1, 0, 0), at(1, 1, 0), at(0, 1, 0)],
        weights: [1, w, 1],
      },
      from: 0,
      to: 1,
    }
    const loop = [
      { kind: "line" as const, start: { x: 0, y: 0 }, end: { x: 1, y: 0 } },
      quarter,
      { kind: "line" as const, start: { x: 0, y: 1 }, end: { x: 0, y: 0 } },
    ]
    const m = planarMoments([{ loops: [loop] }], { x: 0, y: 0 })
    expect(m.area).toBeCloseTo(Math.PI / 4, 12)
    expect(m.u).toBeCloseTo(1 / 3, 12)
    expect(m.uu).toBeCloseTo(Math.PI / 16, 12)
    expect(m.uv).toBeCloseTo(1 / 8, 12)
  })

  it("keeps a region's centroidal moments far from the origin", () => {
    fc.assert(
      fc.property(
        fc.double({ min: -1e4, max: 1e4, noNaN: true }),
        size,
        size,
        (corner, side, hole) => {
          fc.pre(hole < side / 2.5)
          const m = regionMoments(
            [squareWithHole(corner, side, hole)],
            WORLD,
            0,
            { x: corner, y: corner }
          )
          const area = side * side - Math.PI * hole * hole
          expect(Math.abs(m.measure - area)).toBeLessThan(1e-9 * side * side)
          const expected = side ** 4 / 12 - (Math.PI * hole ** 4) / 4
          for (const p of regionInertia(m).principal) {
            expect(p.moment / expected).toBeCloseTo(1, 8)
          }
        }
      )
    )
  })
})
