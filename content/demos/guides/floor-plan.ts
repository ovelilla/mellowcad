import { demo, type DemoScript } from "@mellowcad/engine"

/**
 * The floor-plan guide (`/docs/floor-plan`): a two-room house, 8 by 6 metres
 * drawn in centimetres, step by step — walls by OFFSET, an inner wall,
 * openings cut with TRIM, doors with their swing, windows and dimensions —
 * each step a session drawn as far as it goes.
 */

export const FLOOR_PLAN_LAYERS = [
  { name: "Walls", lineweight: 0.5 },
  { name: "Doors", color: "#ffff00" },
  { name: "Windows", color: "#00ff00" },
  { name: "Dimensions", color: "#00ffff" },
] as const

const start = () =>
  demo({
    width: 640,
    height: 400,
    dimScale: 12,
    layers: [...FLOOR_PLAN_LAYERS],
  })

function walls(script: DemoScript): DemoScript {
  return script
    .layer("Walls")
    .command("_RECTANG")
    .type("0,0")
    .enter()
    .type("800,600")
    .enter()
    .command("_OFFSET")
    .type("20")
    .enter()
    .click(400, 0)
    .click(400, 300)
    .enter()
}

function innerWall(script: DemoScript): DemoScript {
  return script
    .command("_LINE")
    .type("500,20")
    .enter()
    .type("0,560")
    .enter()
    .enter()
    .command("_OFFSET")
    .type("10")
    .enter()
    .click(500, 300)
    .click(600, 300)
    .enter()
}

function openings(script: DemoScript): DemoScript {
  return script
    .command("_LINE")
    .type("100,0")
    .enter()
    .type("0,20")
    .enter()
    .enter()
    .command("_LINE")
    .type("190,0")
    .enter()
    .type("0,20")
    .enter()
    .enter()
    .command("_LINE")
    .type("500,200")
    .enter()
    .type("10,0")
    .enter()
    .enter()
    .command("_LINE")
    .type("500,280")
    .enter()
    .type("10,0")
    .enter()
    .enter()
    .command("_LINE")
    .type("200,580")
    .enter()
    .type("0,20")
    .enter()
    .enter()
    .command("_LINE")
    .type("320,580")
    .enter()
    .type("0,20")
    .enter()
    .enter()
    .command("_LINE")
    .type("780,250")
    .enter()
    .type("20,0")
    .enter()
    .enter()
    .command("_LINE")
    .type("780,370")
    .enter()
    .type("20,0")
    .enter()
    .enter()
    .command("_TRIM")
    .click(145, 0)
    .click(145, 20)
    .click(500, 240)
    .click(510, 240)
    .click(260, 580)
    .click(260, 600)
    .click(780, 310)
    .click(800, 310)
    .enter()
}

function doors(script: DemoScript): DemoScript {
  return script
    .layer("Doors")
    .command("_LINE")
    .type("100,20")
    .enter()
    .type("0,90")
    .enter()
    .enter()
    .command("_ARC")
    .option("Center")
    .type("100,20")
    .enter()
    .type("_END")
    .enter()
    .click(190, 20)
    .type("_END")
    .enter()
    .click(100, 110)
    .command("_LINE")
    .type("510,200")
    .enter()
    .type("80,0")
    .enter()
    .enter()
    .command("_ARC")
    .option("Center")
    .type("510,200")
    .enter()
    .type("_END")
    .enter()
    .click(590, 200)
    .type("_END")
    .enter()
    .click(510, 280)
}

function windows(script: DemoScript): DemoScript {
  return script
    .layer("Windows")
    .command("_RECTANG")
    .type("200,580")
    .enter()
    .type("120,20")
    .enter()
    .command("_LINE")
    .type("200,590")
    .enter()
    .type("120,0")
    .enter()
    .enter()
    .command("_RECTANG")
    .type("780,250")
    .enter()
    .type("20,120")
    .enter()
    .command("_LINE")
    .type("790,250")
    .enter()
    .type("0,120")
    .enter()
    .enter()
}

function dimensions(script: DemoScript): DemoScript {
  return script
    .layer("Dimensions")
    .command("_DIMLINEAR")
    .type("0,0")
    .enter()
    .type("800,0")
    .enter()
    .click(400, -90)
    .command("_DIMLINEAR")
    .type("0,0")
    .enter()
    .type("0,600")
    .enter()
    .click(-90, 300)
    .command("_DIMLINEAR")
    .type("20,20")
    .enter()
    .type("480,0")
    .enter()
    .click(260, 60)
    .command("_DIMCONTINUE")
    .type("#510,20")
    .enter()
    .type("#780,20")
    .enter()
    .enter()
    .enter()
}

/** Each step of the guide, the steps before it drawn first. */
export const FLOOR_PLAN_STEPS = [
  walls,
  innerWall,
  openings,
  doors,
  windows,
  dimensions,
]

export function floorPlan(count = FLOOR_PLAN_STEPS.length): DemoScript {
  return FLOOR_PLAN_STEPS.slice(0, count).reduce(
    (script, step) => step(script),
    start()
  )
}
