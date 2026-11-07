import type { DemoScript } from "@mellowcad/engine"

import type { Exercise, LayerNames } from "./exercise"

/** The plate's outline and its four holes, in plan. */
function profile(script: DemoScript, layers: LayerNames): DemoScript {
  return script
    .layer(layers.outline)
    .command("_RECTANG")
    .option("Fillet")
    .type("8")
    .enter()
    .type("0,0")
    .enter()
    .type("100,60")
    .enter()
    .command("_CIRCLE")
    .type("15,15")
    .enter()
    .option("Diameter")
    .type("10")
    .enter()
    .command("_COPY")
    .click(20, 15)
    .enter()
    .type("15,15")
    .enter()
    .type("70,0")
    .enter()
    .type("70,30")
    .enter()
    .type("0,30")
    .enter()
    .enter()
}

/**
 * A mounting plate as a solid: its outline and holes made regions, the holes
 * subtracted from the plate while it is flat, then the view turned and the
 * region extruded, holes and all.
 */
export const mountingPlate: Exercise = {
  layers: ["outline", "dimensions"],
  frame: { min: { x: -24, y: -22 }, max: { x: 124, y: 76 } },
  drawing: (script, layers) =>
    profile(script, layers)
      .layer(layers.dimensions)
      .command("_DIMDIAMETER")
      .click(88.54, 48.54)
      .click(104, 70)
      .command("_DIMRADIUS")
      .click(2.34, 2.34)
      .click(-10, -10)
      .command("_DIMLINEAR")
      .type("0,8")
      .enter()
      .type("100,0")
      .enter()
      .click(50, -14)
      .command("_DIMLINEAR")
      .type("92,0")
      .enter()
      .type("0,60")
      .enter()
      .click(114, 30)
      .command("_DIMLINEAR")
      .type("15,45")
      .enter()
      .type("70,0")
      .enter()
      .click(50, 68)
      .command("_DIMLINEAR")
      .type("15,15")
      .enter()
      .type("0,30")
      .enter()
      .click(-12, 30),
  steps: [
    { id: "profile", draw: profile },
    {
      id: "region",
      draw: (script) =>
        script
          .command("_REGION")
          .click(50, 0)
          .click(20, 15)
          .click(90, 15)
          .click(90, 45)
          .click(20, 45)
          .enter(),
    },
    {
      id: "subtract",
      draw: (script) =>
        script
          .command("_SUBTRACT")
          .click(50, 0)
          .enter()
          .click(20, 15)
          .click(90, 15)
          .click(90, 45)
          .click(20, 45)
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
          .option("Hidden")
          .moveTo(400, 300),
    },
    {
      id: "extrude",
      live: true,
      draw: (script) =>
        script
          .command("_EXTRUDE")
          .click(50, 0)
          .enter()
          .type("10")
          .enter()
          .command("_ZOOM")
          .option("Extents")
          .command("_ZOOM")
          .type("0.8x")
          .enter()
          .moveTo(400, 300),
    },
  ],
}
