import type { Vec2 } from "@mellowcad/engine"
import { DrawingSession } from "../session.ts"
import {
  arcClear,
  arcCovered,
  clear,
  covered,
  hasCircle,
  near,
} from "./shapes.ts"
import type { Shapes } from "./shapes.ts"

/** One thing a finished drawing must hold, and whether it does. */
export type Check = readonly [name: string, pass: boolean]

export interface Task {
  readonly id: string
  /** What the agent is asked, with every number a check reads. */
  readonly prompt: string
  /** The second tier, made once the first proved too easy to tell conditions apart. */
  readonly hard?: true
  /** A DXF the task starts from; the agent is told where it is. */
  readonly seed?: () => Promise<Uint8Array>
  readonly checks: (shapes: Shapes) => Check[]
}

const T = 0.05
const p = (x: number, y: number): Vec2 => ({ x, y })

function rectangle(
  shapes: Shapes,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  layer?: string
): boolean {
  const corners = [p(x0, y0), p(x1, y0), p(x1, y1), p(x0, y1)]
  return corners.every((corner, i) =>
    covered(shapes, corner, corners[(i + 1) % 4], T, layer)
  )
}

const plate: Task = {
  id: "plate",
  prompt:
    "Draw a rectangular plate 120 wide and 80 high with its lower-left corner at 0,0. " +
    "Add four holes of diameter 10, one near each corner, each centred 15 in from its two nearest edges, " +
    "and one hole of diameter 40 at the centre of the plate.",
  checks: (s) => [
    ["outline", rectangle(s, 0, 0, 120, 80)],
    ...[p(15, 15), p(105, 15), p(105, 65), p(15, 65)].map((c, i): Check => [
      `corner hole ${i + 1}`,
      hasCircle(s, c, 5, T),
    ]),
    ["centre hole", hasCircle(s, p(60, 40), 20, T)],
    ["five circles, no more", s.circles.length === 5],
  ],
}

const bracket: Task = {
  id: "bracket",
  prompt:
    "Draw the closed outline of an L-shaped bracket through the corners (0,0), (100,0), (100,20), (20,20), (20,80), (0,80). " +
    "Then round the inner corner at (20,20) with a fillet of radius 10, " +
    "and cut the outer corner at (0,0) with a chamfer of 5 along each edge.",
  checks: (s) => [
    ["bottom edge", covered(s, p(5, 0), p(100, 0), T)],
    ["right end", covered(s, p(100, 0), p(100, 20), T)],
    ["step edge", covered(s, p(100, 20), p(30, 20), T)],
    ["upright edge", covered(s, p(20, 30), p(20, 80), T)],
    ["top end", covered(s, p(20, 80), p(0, 80), T)],
    ["left edge", covered(s, p(0, 80), p(0, 5), T)],
    ["fillet arc", arcCovered(s, p(30, 30), 10, 180, 270, T)],
    [
      "inner corner removed",
      clear(s, p(30, 20), p(20, 20), T) && clear(s, p(20, 20), p(20, 30), T),
    ],
    ["chamfer", covered(s, p(5, 0), p(0, 5), T)],
    [
      "outer corner removed",
      clear(s, p(0, 0), p(5, 0), T) && clear(s, p(0, 0), p(0, 5), T),
    ],
  ],
}

const room: Task = {
  id: "room",
  prompt:
    "Draw a room, in millimetres. The outer face of its walls is the rectangle from 0,0 to 5000,4000; " +
    "the walls are 200 thick, so their inner face is the rectangle from 200,200 to 4800,3800. Both go on a layer named WALLS. " +
    "Cut a door opening 900 wide in the bottom wall, from x=1000 to x=1900: both faces of the wall must be open there, " +
    "and each side of the opening closed by a short jamb line across the wall (from y=0 to y=200), also on WALLS. " +
    "On a layer named DOOR draw the door leaf, a line from the hinge at (1000,200) straight up to (1000,1100), " +
    "and its swing, a quarter-circle arc of radius 900 centred on the hinge, from the leaf's free end (1000,1100) to the other jamb at (1900,200).",
  checks: (s) => [
    [
      "outer face, three whole sides",
      covered(s, p(5000, 0), p(5000, 4000), T, "WALLS") &&
        covered(s, p(5000, 4000), p(0, 4000), T, "WALLS") &&
        covered(s, p(0, 4000), p(0, 0), T, "WALLS"),
    ],
    [
      "inner face, three whole sides",
      covered(s, p(4800, 200), p(4800, 3800), T, "WALLS") &&
        covered(s, p(4800, 3800), p(200, 3800), T, "WALLS") &&
        covered(s, p(200, 3800), p(200, 200), T, "WALLS"),
    ],
    [
      "bottom wall beside the opening",
      covered(s, p(0, 0), p(1000, 0), T, "WALLS") &&
        covered(s, p(1900, 0), p(5000, 0), T, "WALLS") &&
        covered(s, p(200, 200), p(1000, 200), T, "WALLS") &&
        covered(s, p(1900, 200), p(4800, 200), T, "WALLS"),
    ],
    [
      "opening is open",
      clear(s, p(1000, 0), p(1900, 0), T) &&
        clear(s, p(1000, 200), p(1900, 200), T),
    ],
    [
      "jambs",
      covered(s, p(1000, 0), p(1000, 200), T, "WALLS") &&
        covered(s, p(1900, 0), p(1900, 200), T, "WALLS"),
    ],
    ["door leaf", covered(s, p(1000, 200), p(1000, 1100), T, "DOOR")],
    ["door swing", arcCovered(s, p(1000, 200), 900, 0, 90, T, "DOOR")],
  ],
}

const flange: Task = {
  id: "flange",
  prompt:
    "Draw a flange centred at 0,0: an outer circle of diameter 200 and a bore of diameter 60. " +
    "Add 6 bolt holes of diameter 18, equally spaced on a bolt circle of diameter 150, the first of them on the positive X axis. " +
    "Draw the bolt circle itself (diameter 150) on a layer named CENTER; everything else stays on layer 0.",
  checks: (s) => [
    ["outer circle", hasCircle(s, p(0, 0), 100, T, "0")],
    ["bore", hasCircle(s, p(0, 0), 30, T, "0")],
    ["bolt circle on CENTER", hasCircle(s, p(0, 0), 75, T, "CENTER")],
    ...[0, 60, 120, 180, 240, 300].map((angle): Check => {
      const radians = (angle * Math.PI) / 180
      const centre = p(75 * Math.cos(radians), 75 * Math.sin(radians))
      return [`bolt hole at ${angle}°`, hasCircle(s, centre, 9, T)]
    }),
    [
      "six bolt holes, no more",
      s.circles.filter((c) => Math.abs(c.radius - 9) <= T).length === 6,
    ],
  ],
}

const belt: Task = (() => {
  const tilt = Math.asin((30 - 20) / 100)
  const up = 90 - (tilt * 180) / Math.PI
  const down = 360 - up
  const on = (centre: Vec2, radius: number, angle: number): Vec2 => {
    const radians = (angle * Math.PI) / 180
    return p(
      centre.x + radius * Math.cos(radians),
      centre.y + radius * Math.sin(radians)
    )
  }
  const big = p(0, 0)
  const small = p(100, 0)
  return {
    id: "belt",
    prompt:
      "Two pulleys: a circle of radius 30 centred at (0,0) and a circle of radius 20 centred at (100,0). " +
      "Draw the open belt that runs around both: the two outer tangent lines between the circles, " +
      "and of each circle only the arc the belt wraps (the side facing away from the other pulley). " +
      "The result must be one closed outline of two lines and two arcs, with no full circle left and nothing drawn inside it.",
    checks: (s) => [
      ["upper tangent", covered(s, on(big, 30, up), on(small, 20, up), T)],
      ["lower tangent", covered(s, on(big, 30, down), on(small, 20, down), T)],
      ["big pulley's wrap", arcCovered(s, big, 30, up, down, T)],
      ["big pulley's inside removed", arcClear(s, big, 30, down, up, T)],
      ["small pulley's wrap", arcCovered(s, small, 20, down, up, T)],
      ["small pulley's inside removed", arcClear(s, small, 20, up, down, T)],
    ],
  }
})()

const edit: Task = {
  id: "edit",
  prompt:
    "The DXF is a plate with six holes. Make these four changes to it: " +
    "(1) erase everything on the layer TEMP; " +
    "(2) move the hole nearest the plate's top-right corner 20 to the left; " +
    "(3) the hole centred at (150,50) must become a hole of diameter 30, same centre; " +
    '(4) the text "REV A" must read "REV B", same place and height. Change nothing else.',
  seed: async () => {
    const session = new DrawingSession()
    session.layer({ name: "PLATE" })
    session.run("RECTANG\n0,0\n300,200")
    session.layer({ name: "HOLES", color: "#ff0000" })
    for (const [x, y] of [
      [50, 50],
      [150, 50],
      [250, 50],
      [50, 150],
      [150, 150],
      [250, 150],
    ]) {
      session.run(`CIRCLE\n${x},${y}\n8`)
    }
    session.layer({ name: "TEMP", color: "#ffff00" })
    session.run(
      "LINE\n0,0\n300,200\n\nLINE\n0,200\n300,0\n\nCIRCLE\n150,100\n40"
    )
    session.layer({ name: "NOTES", color: "#00ff00" })
    session.run("TEXT\n10,210\n8\n0\nREV A\n")
    const dxf = await session.dxf()
    session.dispose()
    return dxf
  },
  checks: (s) => [
    ["TEMP is empty", !s.layers.includes("TEMP")],
    [
      "top-right hole moved",
      hasCircle(s, p(230, 150), 8, T) && !hasCircle(s, p(250, 150), 8, T),
    ],
    [
      "hole enlarged",
      hasCircle(s, p(150, 50), 15, T) && !hasCircle(s, p(150, 50), 8, T),
    ],
    [
      "text reads REV B",
      s.texts.some(
        (t) =>
          t.value.trim() === "REV B" &&
          near(t.position, p(10, 210), 1) &&
          Math.abs(t.height - 8) <= T
      ) && !s.texts.some((t) => t.value.includes("REV A")),
    ],
    [
      "the rest untouched",
      rectangle(s, 0, 0, 300, 200) &&
        [p(50, 50), p(250, 50), p(50, 150), p(150, 150)].every((c) =>
          hasCircle(s, c, 8, T)
        ) &&
        s.circles.length === 6,
    ],
  ],
}

const dimensioned: Task = {
  id: "dimensioned",
  prompt:
    "Draw a rectangle from 0,0 to 150,90. Dimension its bottom edge with a horizontal linear dimension whose dimension line is at y = -20, " +
    "and its left edge with a vertical linear dimension whose dimension line is at x = -20. " +
    'Add the single-line text "BASE PLATE", 6 high, with its start point (left end of the baseline) at (10,100).',
  checks: (s) => {
    const measures = (a: Vec2, b: Vec2, at: (line: Vec2) => boolean) =>
      s.dimensions.some(
        (d) =>
          ((near(d.first, a, T) && near(d.second, b, T)) ||
            (near(d.first, b, T) && near(d.second, a, T))) &&
          at(d.linePoint)
      )
    return [
      ["rectangle", rectangle(s, 0, 0, 150, 90)],
      [
        "horizontal dimension",
        measures(p(0, 0), p(150, 0), (line) => Math.abs(line.y + 20) <= T),
      ],
      [
        "vertical dimension",
        measures(p(0, 0), p(0, 90), (line) => Math.abs(line.x + 20) <= T),
      ],
      [
        "text",
        s.texts.some(
          (t) =>
            t.value.trim() === "BASE PLATE" &&
            near(t.position, p(10, 100), T) &&
            Math.abs(t.height - 6) <= T
        ),
      ],
    ]
  },
}

const grid: Task = {
  id: "grid",
  prompt:
    "Draw a grid of 12 squares in 4 columns and 3 rows. Each square is 20 by 20, with a gap of 10 between neighbours, " +
    "and the lower-left square has its lower-left corner at 0,0. " +
    "Fill the four squares at the corners of the grid with a SOLID hatch, and no other square.",
  checks: (s) => {
    const squares = [0, 1, 2, 3].flatMap((column) =>
      [0, 1, 2].map((row) => p(column * 30, row * 30))
    )
    const filled = (corner: Vec2) =>
      s.hatches.some(
        (hatch) =>
          hatch.pattern === "SOLID" &&
          near(hatch.min, corner, T) &&
          near(hatch.max, p(corner.x + 20, corner.y + 20), T)
      )
    return [
      [
        "twelve squares",
        squares.every((c) => rectangle(s, c.x, c.y, c.x + 20, c.y + 20)),
      ],
      [
        "corner squares filled",
        [p(0, 0), p(90, 0), p(0, 60), p(90, 60)].every(filled),
      ],
      ["four hatches, no more", s.hatches.length === 4],
    ]
  },
}

function allCovered(
  s: Shapes,
  stretches: readonly (readonly [Vec2, Vec2])[],
  layer?: string
): boolean {
  return stretches.every(([a, b]) => covered(s, a, b, T, layer))
}

function allClear(
  s: Shapes,
  stretches: readonly (readonly [Vec2, Vec2])[]
): boolean {
  return stretches.every(([a, b]) => clear(s, a, b, T))
}

const apartment: Task = {
  id: "apartment",
  hard: true,
  prompt:
    "Draw the plan of a two-room apartment, in millimetres, with clean wall junctions.\n" +
    "- Outer walls, 200 thick, on layer WALLS: outer face the rectangle 0,0 to 8000,6000, inner face the rectangle 200,200 to 7800,5800.\n" +
    "- A partition wall 100 thick, on WALLS, with its faces at x=4000 and x=4100, running from the inner face of the bottom wall (y=200) to the inner face of the top wall (y=5800). " +
    "Where it meets them the junction must be clean: the inner-face lines at y=200 and y=5800 must be open between x=4000 and x=4100.\n" +
    "- A door opening in the partition from y=1000 to y=1800: both of its faces open there, and a jamb line across it (x=4000 to x=4100) at y=1000 and at y=1800, on WALLS.\n" +
    "- An entrance opening in the bottom outer wall from x=1500 to x=2400: both faces of that wall open there, and a jamb line across the wall (y=0 to y=200) at x=1500 and at x=2400, on WALLS.\n" +
    "- A window in the top outer wall from x=5000 to x=6500, on a layer named WINDOWS: a line across the wall (y=5800 to y=6000) at x=5000 and at x=6500, and the glass, a line along y=5900 between them. The wall's own faces stay whole there.",
  checks: (s) => [
    [
      "outer face",
      allCovered(
        s,
        [
          [p(0, 0), p(1500, 0)],
          [p(2400, 0), p(8000, 0)],
          [p(8000, 0), p(8000, 6000)],
          [p(8000, 6000), p(0, 6000)],
          [p(0, 6000), p(0, 0)],
        ],
        "WALLS"
      ),
    ],
    [
      "inner face",
      allCovered(
        s,
        [
          [p(200, 200), p(1500, 200)],
          [p(2400, 200), p(4000, 200)],
          [p(4100, 200), p(7800, 200)],
          [p(7800, 200), p(7800, 5800)],
          [p(7800, 5800), p(4100, 5800)],
          [p(4000, 5800), p(200, 5800)],
          [p(200, 5800), p(200, 200)],
        ],
        "WALLS"
      ),
    ],
    [
      "partition faces",
      allCovered(
        s,
        [
          [p(4000, 200), p(4000, 1000)],
          [p(4000, 1800), p(4000, 5800)],
          [p(4100, 200), p(4100, 1000)],
          [p(4100, 1800), p(4100, 5800)],
        ],
        "WALLS"
      ),
    ],
    [
      "clean junctions",
      allClear(s, [
        [p(4000, 200), p(4100, 200)],
        [p(4000, 5800), p(4100, 5800)],
      ]),
    ],
    [
      "partition door",
      allClear(s, [
        [p(4000, 1000), p(4000, 1800)],
        [p(4100, 1000), p(4100, 1800)],
      ]) &&
        allCovered(
          s,
          [
            [p(4000, 1000), p(4100, 1000)],
            [p(4000, 1800), p(4100, 1800)],
          ],
          "WALLS"
        ),
    ],
    [
      "entrance",
      allClear(s, [
        [p(1500, 0), p(2400, 0)],
        [p(1500, 200), p(2400, 200)],
      ]) &&
        allCovered(
          s,
          [
            [p(1500, 0), p(1500, 200)],
            [p(2400, 0), p(2400, 200)],
          ],
          "WALLS"
        ),
    ],
    [
      "window",
      allCovered(
        s,
        [
          [p(5000, 5800), p(5000, 6000)],
          [p(6500, 5800), p(6500, 6000)],
          [p(5000, 5900), p(6500, 5900)],
        ],
        "WINDOWS"
      ),
    ],
  ],
}

const gasket: Task = {
  id: "gasket",
  hard: true,
  prompt:
    "Draw a gasket. Its outline is a 200 by 120 rectangle with its lower-left corner at 0,0 and all four corners rounded with a radius of 15. " +
    "Inside it: a horizontal slot made of two semicircles of radius 15 centred at (60,60) and (140,60), joined by straight lines along y=45 and y=75, with nothing drawn inside the slot; " +
    "a regular hexagon centred at (100,22), inscribed in a circle of radius 12, with one vertex at (112,22); " +
    "and two holes of diameter 10 centred at (30,60) and (170,60).",
  checks: (s) => {
    const hexagon = [0, 60, 120, 180, 240, 300].map((angle) => {
      const radians = (angle * Math.PI) / 180
      return p(100 + 12 * Math.cos(radians), 22 + 12 * Math.sin(radians))
    })
    return [
      [
        "straight edges",
        allCovered(s, [
          [p(15, 0), p(185, 0)],
          [p(200, 15), p(200, 105)],
          [p(185, 120), p(15, 120)],
          [p(0, 105), p(0, 15)],
        ]),
      ],
      [
        "rounded corners",
        arcCovered(s, p(15, 15), 15, 180, 270, T) &&
          arcCovered(s, p(185, 15), 15, 270, 360, T) &&
          arcCovered(s, p(185, 105), 15, 0, 90, T) &&
          arcCovered(s, p(15, 105), 15, 90, 180, T),
      ],
      [
        "sharp corners removed",
        allClear(s, [
          [p(0, 0), p(15, 0)],
          [p(0, 0), p(0, 15)],
          [p(200, 0), p(185, 0)],
          [p(200, 0), p(200, 15)],
          [p(200, 120), p(185, 120)],
          [p(200, 120), p(200, 105)],
          [p(0, 120), p(15, 120)],
          [p(0, 120), p(0, 105)],
        ]),
      ],
      [
        "slot outline",
        arcCovered(s, p(60, 60), 15, 90, 270, T) &&
          arcCovered(s, p(140, 60), 15, 270, 90, T) &&
          allCovered(s, [
            [p(60, 45), p(140, 45)],
            [p(60, 75), p(140, 75)],
          ]),
      ],
      [
        "slot is empty inside",
        arcClear(s, p(60, 60), 15, 270, 90, T) &&
          arcClear(s, p(140, 60), 15, 90, 270, T),
      ],
      [
        "hexagon",
        hexagon.every((vertex, i) =>
          covered(s, vertex, hexagon[(i + 1) % 6], T)
        ),
      ],
      [
        "two holes, no other circle",
        hasCircle(s, p(30, 60), 5, T) &&
          hasCircle(s, p(170, 60), 5, T) &&
          s.circles.length === 2,
      ],
    ]
  },
}

const link: Task = (() => {
  const big = p(0, 0)
  const small = p(90, 40)
  const axis = (Math.atan2(40, 90) * 180) / Math.PI
  const tilt = (Math.asin((25 - 12) / Math.hypot(90, 40)) * 180) / Math.PI
  const up = axis + 90 - tilt
  const down = axis - 90 + tilt
  const on = (centre: Vec2, radius: number, angle: number): Vec2 => {
    const radians = (angle * Math.PI) / 180
    return p(
      centre.x + radius * Math.cos(radians),
      centre.y + radius * Math.sin(radians)
    )
  }
  return {
    id: "link",
    hard: true,
    prompt:
      "Draw a link plate. It has two round ends: one of radius 25 centred at (0,0) and one of radius 12 centred at (90,40). " +
      "Its outline is one closed shape: the two straight lines tangent to both of those circles on the outside (the outer tangents), " +
      "and of each circle only the arc on the outside of the plate (the side facing away from the other end). No full circle of radius 25 or 12 may remain. " +
      "Each end has a hole through it, a full circle concentric with it: radius 15 at (0,0) and radius 6 at (90,40).",
    checks: (s) => [
      ["one tangent", covered(s, on(big, 25, up), on(small, 12, up), T)],
      ["other tangent", covered(s, on(big, 25, down), on(small, 12, down), T)],
      ["big end's arc", arcCovered(s, big, 25, up, down, T)],
      ["big end's inside removed", arcClear(s, big, 25, down, up, T)],
      ["small end's arc", arcCovered(s, small, 12, down, up, T)],
      ["small end's inside removed", arcClear(s, small, 12, up, down, T)],
      [
        "two holes, no other circle",
        hasCircle(s, big, 15, T) &&
          hasCircle(s, small, 6, T) &&
          s.circles.length === 2,
      ],
    ],
  }
})()

const SORTED_RADII = [3, 6, 4, 8, 5, 7, 2, 9, 6, 4, 10, 3]
const sortedCentre = (index: number): Vec2 =>
  p(20 + 40 * (index % 4), 20 + 40 * Math.floor(index / 4))

const sort: Task = {
  id: "sort",
  hard: true,
  prompt:
    "The DXF holds objects on the layers A, B, C and D. Make these changes and no others:\n" +
    "(1) erase every circle on layer A whose radius is less than 5;\n" +
    "(2) put every circle left on layer A whose radius is 8 or more on a new layer named BIG;\n" +
    "(3) move everything on layer B 15 to the right and 10 down;\n" +
    "(4) mirror everything on layer C about the vertical line x=360, keeping the originals;\n" +
    "(5) erase the text on layer D.",
  seed: async () => {
    const session = new DrawingSession()
    session.layer({ name: "A" })
    session.run(
      SORTED_RADII.map((radius, i) => {
        const centre = sortedCentre(i)
        return `CIRCLE ${centre.x},${centre.y} ${radius}`
      }).join("\n")
    )
    session.layer({ name: "B", color: "#ff0000" })
    session.run(
      "RECTANG 200,0 240,30\nRECTANG 200,50 260,70\nRECTANG 200,90 230,120\nLINE 200,130 260,150\n\nLINE 200,150 260,130\n"
    )
    session.layer({ name: "C", color: "#00ff00" })
    session.run("PLINE 300,0 340,0 300,30 C\nCIRCLE 320,60 10")
    session.layer({ name: "D", color: "#ffff00" })
    session.run("TEXT 0,140 10 0\nDRAFT\n")
    const dxf = await session.dxf()
    session.dispose()
    return dxf
  },
  checks: (s) => {
    const circles = SORTED_RADII.map((radius, i) => ({
      radius,
      centre: sortedCentre(i),
    }))
    return [
      [
        "small circles erased",
        circles
          .filter((c) => c.radius < 5)
          .every((c) => !hasCircle(s, c.centre, c.radius, T)),
      ],
      [
        "big circles on BIG",
        circles
          .filter((c) => c.radius >= 8)
          .every((c) => hasCircle(s, c.centre, c.radius, T, "BIG")),
      ],
      [
        "the other circles still on A",
        circles
          .filter((c) => c.radius >= 5 && c.radius < 8)
          .every((c) => hasCircle(s, c.centre, c.radius, T, "A")),
      ],
      [
        "layer B moved",
        rectangle(s, 215, -10, 255, 20, "B") &&
          rectangle(s, 215, 40, 275, 60, "B") &&
          rectangle(s, 215, 80, 245, 110, "B") &&
          allCovered(
            s,
            [
              [p(215, 120), p(275, 140)],
              [p(215, 140), p(275, 120)],
            ],
            "B"
          ) &&
          allClear(s, [
            [p(200, 0), p(200, 30)],
            [p(200, 50), p(200, 70)],
            [p(200, 90), p(200, 120)],
            [p(200, 130), p(260, 150)],
          ]),
      ],
      [
        "layer C mirrored, originals kept",
        allCovered(
          s,
          [
            [p(300, 0), p(340, 0)],
            [p(340, 0), p(300, 30)],
            [p(300, 30), p(300, 0)],
            [p(420, 0), p(380, 0)],
            [p(380, 0), p(420, 30)],
            [p(420, 30), p(420, 0)],
          ],
          "C"
        ) &&
          hasCircle(s, p(320, 60), 10, T, "C") &&
          hasCircle(s, p(400, 60), 10, T, "C"),
      ],
      ["text erased", s.texts.length === 0],
      ["nine circles in all", s.circles.length === 9],
    ]
  },
}

const section: Task = {
  id: "section",
  hard: true,
  prompt:
    "Draw a square plate from 0,0 to 100,100 with a round hole of radius 20 at its centre (50,50). " +
    "Hatch the plate with the ANSI31 pattern so that the hatch covers the plate but not the hole. " +
    "Add a radius dimension on the hole, and an aligned dimension that measures the plate's diagonal from (0,0) to (100,100).",
  checks: (s) => [
    ["plate", rectangle(s, 0, 0, 100, 100)],
    ["hole", hasCircle(s, p(50, 50), 20, T)],
    [
      "hatch bounded by the plate",
      s.hatches.some(
        (h) =>
          h.pattern === "ANSI31" &&
          near(h.min, p(0, 0), T) &&
          near(h.max, p(100, 100), T)
      ),
    ],
    [
      "hatch leaves the hole",
      s.hatches.some(
        (h) =>
          h.pattern === "ANSI31" &&
          near(h.min, p(30, 30), T) &&
          near(h.max, p(70, 70), T)
      ),
    ],
    [
      "radius dimension",
      s.dimensions.some(
        (d) =>
          d.kind === "radius" &&
          near(d.first, p(50, 50), T) &&
          Math.abs(Math.hypot(d.second.x - 50, d.second.y - 50) - 20) <= T
      ),
    ],
    [
      "aligned dimension of the diagonal",
      // WHY by what it measures: ezdxf writes its aligned dimension as a
      // rotated one turned to the diagonal, which reads the same on paper.
      s.dimensions.some(
        (d) =>
          (d.kind === "aligned" || d.kind === "linear") &&
          Math.abs(d.measurement - Math.hypot(100, 100)) <= T &&
          ((near(d.first, p(0, 0), T) && near(d.second, p(100, 100), T)) ||
            (near(d.first, p(100, 100), T) && near(d.second, p(0, 0), T)))
      ),
    ],
  ],
}

const seating: Task = {
  id: "seating",
  hard: true,
  prompt:
    "Draw a round table, a circle of radius 50 centred at (200,200), with four chairs around it. " +
    "The chair is a block named CHAIR: a 40 by 40 square centred on the block's base point, plus its backrest, " +
    "a line 40 long, parallel to one side of the square and 5 outside it. " +
    "Insert the block four times, at (200,280), (280,200), (200,120) and (120,200), each turned so that its backrest is on the side away from the table: " +
    "the backrests end up as the lines (180,305)-(220,305), (305,180)-(305,220), (180,95)-(220,95) and (95,180)-(95,220). " +
    "The drawing must hold the table and four references to the one block, and no loose chair geometry.",
  checks: (s) => [
    ["table", hasCircle(s, p(200, 200), 50, T)],
    [
      "four seats",
      rectangle(s, 180, 260, 220, 300) &&
        rectangle(s, 260, 180, 300, 220) &&
        rectangle(s, 180, 100, 220, 140) &&
        rectangle(s, 100, 180, 140, 220),
    ],
    [
      "backrests away from the table",
      allCovered(s, [
        [p(180, 305), p(220, 305)],
        [p(305, 180), p(305, 220)],
        [p(180, 95), p(220, 95)],
        [p(95, 180), p(95, 220)],
      ]),
    ],
    [
      "four references to CHAIR",
      s.references.filter((name) => name === "CHAIR").length === 4,
    ],
    ["no loose chair geometry", s.segments.length === 20],
  ],
}

const union: Task = (() => {
  const radius = 40
  const centres = [p(0, 0), p(50, 0), p(25, 40)]
  const degrees = (radians: number) => (radians * 180) / Math.PI
  /** The arc of disc `i` that no other disc covers, as [start, end] ccw. */
  const outside = (i: number): [number, number] => {
    const covered = centres
      .filter((_, j) => j !== i)
      .map((other) => {
        const dx = other.x - centres[i].x
        const dy = other.y - centres[i].y
        const towards = degrees(Math.atan2(dy, dx))
        const half = degrees(Math.acos(Math.hypot(dx, dy) / (2 * radius)))
        return [towards - half, towards + half]
      })
    // The two covered arcs overlap on every disc of this figure; put them
    // on one turn before taking their union.
    if (covered[1][0] - covered[0][0] > 180)
      covered[1] = shift(covered[1], -360)
    if (covered[0][0] - covered[1][0] > 180) covered[1] = shift(covered[1], 360)
    return [
      Math.max(covered[0][1], covered[1][1]),
      Math.min(covered[0][0], covered[1][0]) + 360,
    ]
  }
  const shift = (interval: number[], by: number) => [
    interval[0] + by,
    interval[1] + by,
  ]
  return {
    id: "union",
    hard: true,
    prompt:
      "Three discs of radius 40 are centred at (0,0), (50,0) and (25,40); they overlap. " +
      "Draw the outline of their union: only the outer boundary of the three discs taken together, as arcs, " +
      "with no arc or part of an arc left inside the shape and no full circle.",
    checks: (s) => [
      ...centres.flatMap((centre, i): Check[] => {
        const [start, end] = outside(i)
        return [
          [
            `disc ${i + 1}: outer arc`,
            arcCovered(s, centre, radius, start, end, T),
          ],
          [
            `disc ${i + 1}: inside removed`,
            arcClear(s, centre, radius, end, start, T),
          ],
        ]
      }),
      ["no full circle", s.circles.length === 0],
    ],
  }
})()

export const TASKS: readonly Task[] = [
  plate,
  bracket,
  room,
  flange,
  belt,
  edit,
  dimensioned,
  grid,
  apartment,
  gasket,
  link,
  sort,
  section,
  seating,
  union,
]
