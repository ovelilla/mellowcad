import type { Exercise } from "./exercise"

/**
 * A straight flight of stairs in plan, in centimetres: ten treads of 28 from
 * one line and a rectangular array, the arrow that says which way is up, and
 * its dimensions at the scale an architectural template sets.
 */
export const stairs: Exercise = {
  layers: ["outline", "dimensions"],
  options: { dimScale: 4 },
  frame: { min: { x: -34, y: -44 }, max: { x: 318, y: 124 } },
  steps: [
    {
      id: "outline",
      draw: (script, layers) =>
        script
          .layer(layers.outline)
          .command("_RECTANG")
          .type("0,0")
          .enter()
          .type("280,100")
          .enter(),
    },
    {
      id: "tread",
      draw: (script) =>
        script
          .command("_LINE")
          .type("28,0")
          .enter()
          .type("0,100")
          .enter()
          .enter(),
    },
    {
      id: "array",
      draw: (script) =>
        script
          .command("_ARRAYRECT")
          .click(28, 50)
          .enter()
          .option("COUnt")
          .type("9")
          .enter()
          .type("1")
          .enter()
          .option("Spacing")
          .type("28")
          .enter()
          .type("1")
          .enter()
          .option("eXit"),
    },
    {
      id: "arrow",
      draw: (script) =>
        script
          .command("_PLINE")
          .type("14,50")
          .enter()
          .type("226,0")
          .enter()
          .option("Width")
          .type("10")
          .enter()
          .type("0")
          .enter()
          .type("24,0")
          .enter()
          .enter(),
    },
    {
      id: "dimensions",
      draw: (script, layers) =>
        script
          .layer(layers.dimensions)
          .command("_DIMLINEAR")
          .type("0,0")
          .enter()
          .type("280,0")
          .enter()
          .click(140, -28)
          .command("_DIMLINEAR")
          .type("280,0")
          .enter()
          .type("0,100")
          .enter()
          .click(300, 50)
          .command("_DIMLINEAR")
          .type("0,100")
          .enter()
          .type("28,0")
          .enter()
          .click(14, 116),
    },
  ],
}
