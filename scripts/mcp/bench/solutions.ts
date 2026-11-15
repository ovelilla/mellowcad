import type { DrawingSession } from "../session.ts"

/**
 * One way to do each task at the command line, which `test/mcp.test.ts` runs:
 * a task no script can pass would measure the bench, not the agents.
 */
type Step = { readonly layer: string } | { readonly script: string }

export const SOLUTIONS: Readonly<Record<string, readonly Step[]>> = {
  plate: [
    {
      script: [
        "RECTANG 0,0 120,80",
        "CIRCLE 15,15 5",
        "CIRCLE 105,15 5",
        "CIRCLE 105,65 5",
        "CIRCLE 15,65 5",
        "CIRCLE 60,40 20",
      ].join("\n"),
    },
  ],
  bracket: [
    { script: "PLINE 0,0 100,0 100,20 20,20 20,80 0,80 C" },
    { script: "FILLET R 10 60,20 20,50" },
    { script: "CHAMFER D 5 5 50,0 0,40" },
  ],
  room: [
    { layer: "WALLS" },
    {
      script: [
        "RECTANG 0,0 5000,4000",
        "RECTANG 200,200 4800,3800",
        "LINE 1000,0 1000,200",
        "",
        "LINE 1900,0 1900,200",
        "",
        "TRIM 1450,0 1450,200",
        "",
      ].join("\n"),
    },
    { layer: "DOOR" },
    { script: "LINE 1000,200 1000,1100\n\nARC C 1000,200 1900,200 1000,1100" },
  ],
  flange: [
    {
      script: [
        "CIRCLE 0,0 100",
        "CIRCLE 0,0 30",
        ...[0, 60, 120, 180, 240, 300].map((angle) => `CIRCLE 75<${angle} 9`),
      ].join("\n"),
    },
    { layer: "CENTER" },
    { script: "CIRCLE 0,0 75" },
  ],
  belt: [
    {
      script: [
        "CIRCLE 0,0 30",
        "CIRCLE 100,0 20",
        "LINE TAN 3,29.85 TAN 102,19.9",
        "",
        "LINE TAN 3,-29.85 TAN 102,-19.9",
        "",
        "TRIM 30,0 80,0",
        "",
      ].join("\n"),
    },
  ],
  edit: [
    { script: "ERASE 75,50 75,150 190,100\n" },
    { script: "MOVE 258,150\n\n0,0 -20,0" },
    { script: "ERASE 158,50\n" },
    { layer: "HOLES" },
    { script: "CIRCLE 150,50 15" },
    { script: "ERASE 12,212\n" },
    { layer: "NOTES" },
    { script: "TEXT 10,210 8 0\nREV B\n" },
  ],
  dimensioned: [
    {
      script: [
        "RECTANG 0,0 150,90",
        "DIMLINEAR 0,0 150,0 75,-20",
        "DIMLINEAR 0,0 0,90 -20,45",
        "TEXT 10,100 6 0",
        "BASE PLATE",
        "",
      ].join("\n"),
    },
  ],
  grid: [
    {
      script: [0, 1, 2, 3]
        .flatMap((column) =>
          [0, 1, 2].map(
            (row) =>
              `RECTANG ${column * 30},${row * 30} ${column * 30 + 20},${row * 30 + 20}`
          )
        )
        .join("\n"),
    },
    { script: "-HATCH P SOLID 10,10 100,10 10,70 100,70\n" },
  ],
  apartment: [
    { layer: "WALLS" },
    {
      script: [
        "RECTANG 0,0 8000,6000",
        "RECTANG 200,200 7800,5800",
        "LINE 4000,200 4000,5800",
        "",
        "LINE 4100,200 4100,5800",
        "",
        "LINE 4000,1000 4100,1000",
        "",
        "LINE 4000,1800 4100,1800",
        "",
        "LINE 1500,0 1500,200",
        "",
        "LINE 2400,0 2400,200",
        "",
        "TRIM 4050,200 4050,5800 4000,1400 4100,1400 1950,0 1950,200",
        "",
      ].join("\n"),
    },
    { layer: "WINDOWS" },
    {
      script:
        "LINE 5000,5800 5000,6000\n\nLINE 6500,5800 6500,6000\n\nLINE 5000,5900 6500,5900\n",
    },
  ],
  gasket: [
    {
      script: [
        "RECTANG 0,0 200,120",
        "FILLET R 15 P 100,0",
        "PLINE 60,45 140,45 A 140,75 L 60,75 A 60,45",
        "",
        "POLYGON 6 100,22 I 12",
        "CIRCLE 30,60 5",
        "CIRCLE 170,60 5",
      ].join("\n"),
    },
  ],
  link: [
    {
      script: [
        "CIRCLE 0,0 25",
        "CIRCLE 90,40 12",
        "LINE TAN -7,24 TAN 86.6,51.5",
        "",
        "LINE TAN 13,-21.3 TAN 96.3,29.8",
        "",
        "TRIM 22.84,10.15 79.03,35.13",
        "",
        "CIRCLE 0,0 15",
        "CIRCLE 90,40 6",
      ].join("\n"),
    },
  ],
  sort: [
    { script: "ERASE 23,20 104,20 102,60 64,100 143,100\n" },
    { layer: "BIG" },
    { script: "CHPROP 148,20 149,60 110,100\n\nLA\nBIG\n" },
    { script: "MOVE W 195,-5 265,155\n\n0,0 15,-10" },
    { script: "MIRROR W 295,-5 345,75\n\n360,0 360,10 N" },
    { script: "ERASE 5,145\n" },
  ],
  section: [
    {
      script: [
        "RECTANG 0,0 100,100",
        "CIRCLE 50,50 20",
        "-HATCH P ANSI31 1 0 10,10",
        "",
        "DIMRADIUS 70,50 80,60",
        "DIMALIGNED 0,0 100,100 30,70",
      ].join("\n"),
    },
  ],
  union: [
    {
      script: [
        "CIRCLE 0,0 40",
        "CIRCLE 50,0 40",
        "CIRCLE 25,40 40",
        "REGION ALL",
        "",
        "UNION ALL",
        "",
        "EXPLODE ALL",
        "",
      ].join("\n"),
    },
  ],
  seating: [
    {
      script: [
        "CIRCLE 200,200 50",
        "RECTANG -20,-20 20,20",
        "LINE -20,25 20,25",
        "",
        "-BLOCK",
        "CHAIR",
        "0,0",
        "W -30,-30 30,30",
        "",
        // -BLOCK leaves the objects as a reference where they were drawn.
        "ERASE 20,0",
        "",
        ...[
          ["200,280", 0],
          ["280,200", 270],
          ["200,120", 180],
          ["120,200", 90],
        ].flatMap(([at, turn]) => ["-INSERT", "CHAIR", `${at} 1 1 ${turn}`]),
      ].join("\n"),
    },
  ],
}

export function solve(session: DrawingSession, task: string): void {
  for (const step of SOLUTIONS[task] ?? []) {
    if ("layer" in step) session.layer({ name: step.layer })
    else session.run(step.script)
  }
}
