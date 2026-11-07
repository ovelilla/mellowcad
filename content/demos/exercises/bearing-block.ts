import type { DemoScript } from "@mellowcad/engine"

import type { Exercise, LayerNames } from "./exercise"

/** The base and the boss in plan: a rounded rectangle and three circles. */
function plan(script: DemoScript, layers: LayerNames): DemoScript {
  return script
    .layer(layers.outline)
    .command("_RECTANG")
    .option("Fillet")
    .type("10")
    .enter()
    .type("0,0")
    .enter()
    .type("100,60")
    .enter()
    .command("_CIRCLE")
    .type("50,30")
    .enter()
    .option("Diameter")
    .type("40")
    .enter()
}

/**
 * A bearing block: a base and a boss extruded to their heights and united
 * into one solid, then its bore and two bolt holes, cylinders subtracted
 * from it in one go.
 */
export const bearingBlock: Exercise = {
  layers: ["outline", "dimensions"],
  frame: { min: { x: -24, y: -22 }, max: { x: 124, y: 82 } },
  drawing: (script, layers) =>
    plan(script, layers)
      .command("_CIRCLE")
      .type("50,30")
      .enter()
      .option("Diameter")
      .type("20")
      .enter()
      .command("_CIRCLE")
      .type("12,30")
      .enter()
      .option("Diameter")
      .type("10")
      .enter()
      .command("_CIRCLE")
      .type("88,30")
      .enter()
      .option("Diameter")
      .type("10")
      .enter()
      .layer(layers.dimensions)
      .command("_DIMDIAMETER")
      .click(42.93, 37.07)
      .click(47, 33)
      .command("_DIMDIAMETER")
      .click(64.14, 44.14)
      .click(80, 72)
      .command("_DIMDIAMETER")
      .click(91.54, 33.54)
      .click(108, 52)
      .command("_DIMRADIUS")
      .click(2.93, 2.93)
      .click(-10, -10)
      .command("_DIMLINEAR")
      .type("0,10")
      .enter()
      .type("100,0")
      .enter()
      .click(50, -14)
      .command("_DIMLINEAR")
      .type("90,0")
      .enter()
      .type("0,60")
      .enter()
      .click(114, 30)
      .command("_DIMLINEAR")
      .type("12,30")
      .enter()
      .type("76,0")
      .enter()
      .click(30, 70),
  steps: [
    {
      id: "plan",
      draw: plan,
    },
    {
      id: "extrude",
      draw: (script) =>
        script
          .command("_EXTRUDE")
          .click(50, 0)
          .enter()
          .type("12")
          .enter()
          .command("_EXTRUDE")
          .click(70, 30)
          .enter()
          .type("40")
          .enter(),
    },
    {
      id: "union",
      draw: (script) =>
        script.command("_UNION").click(50, 0).click(70, 30).enter(),
    },
    {
      id: "holes",
      draw: (script) =>
        script
          .command("_CYLINDER")
          .type("50,30")
          .enter()
          .option("Diameter")
          .type("20")
          .enter()
          .type("40")
          .enter()
          .command("_CYLINDER")
          .type("12,30")
          .enter()
          .option("Diameter")
          .type("10")
          .enter()
          .type("12")
          .enter()
          .command("_COPY")
          .click(17, 30)
          .enter()
          .type("12,30")
          .enter()
          .type("76,0")
          .enter()
          .enter(),
    },
    {
      id: "subtract",
      draw: (script) =>
        script
          .command("_SUBTRACT")
          .click(50, 0)
          .enter()
          .click(60, 30)
          .click(17, 30)
          .click(93, 30)
          .enter(),
    },
    {
      id: "view",
      live: true,
      draw: (script) =>
        script
          .command("_-VIEW")
          .option("SEiso")
          .command("_VSCURRENT")
          .option("Conceptual")
          .command("_ZOOM")
          .option("Extents")
          .command("_ZOOM")
          .type("0.8x")
          .enter()
          .moveTo(400, 300),
    },
  ],
}
