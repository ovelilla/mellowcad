import type { DemoScript } from "@mellowcad/engine"

import type { Exercise, LayerNames } from "./exercise"

/**
 * Half the pulley's section, beside its axis: X is the distance from the
 * axis, Y runs along it.
 */
function profile(script: DemoScript, layers: LayerNames): DemoScript {
  return script
    .layer(layers.outline)
    .command("_PLINE")
    .type("10,0")
    .enter()
    .type("10,0")
    .enter()
    .type("0,10")
    .enter()
    .type("25,0")
    .enter()
    .type("0,-7")
    .enter()
    .type("10,0")
    .enter()
    .type("0,24")
    .enter()
    .type("-10,0")
    .enter()
    .type("0,-7")
    .enter()
    .type("-25,0")
    .enter()
    .type("0,10")
    .enter()
    .type("-10,0")
    .enter()
    .option("Close")
}

/**
 * A pulley turned from its half section: the profile as one closed
 * polyline, then REVOLVE round the Y axis, a whole turn.
 */
export const pulley: Exercise = {
  layers: ["outline", "centre", "dimensions"],
  frame: { min: { x: -16, y: -18 }, max: { x: 72, y: 48 } },
  drawing: (script, layers) =>
    profile(script, layers)
      .layer(layers.centre)
      .command("_LINE")
      .type("0,-6")
      .enter()
      .type("0,42")
      .enter()
      .enter()
      .layer(layers.dimensions)
      .command("_DIMLINEAR")
      .type("0,0")
      .enter()
      .type("10,0")
      .enter()
      .click(5, -6)
      .command("_DIMBASELINE")
      .type("#20,0")
      .enter()
      .type("#45,3")
      .enter()
      .type("#55,3")
      .enter()
      .enter()
      .enter()
      .command("_DIMLINEAR")
      .type("55,3")
      .enter()
      .type("0,24")
      .enter()
      .click(64, 15)
      .command("_DIMLINEAR")
      .type("20,10")
      .enter()
      .type("0,10")
      .enter()
      .click(30, 15)
      .command("_DIMLINEAR")
      .type("10,0")
      .enter()
      .type("0,30")
      .enter()
      .click(-8, 15),
  steps: [
    { id: "profile", draw: profile },
    {
      id: "view",
      live: true,
      draw: (script) =>
        script
          .command("_-VIEW")
          .option("SEiso")
          .command("_VSCURRENT")
          .option("Conceptual")
          .moveTo(400, 300),
    },
    {
      id: "revolve",
      live: true,
      draw: (script) =>
        script
          .command("_REVOLVE")
          .click(15, 0)
          .enter()
          .option("Y")
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
