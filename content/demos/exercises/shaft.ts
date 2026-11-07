import type { Exercise } from "./exercise"

/**
 * A stepped shaft in side view: its upper half as one polyline, chamfered at
 * both ends, mirrored about the axis, the lines of its shoulders and
 * chamfers, the axis and its lengths dimensioned in a chain.
 */
export const shaft: Exercise = {
  layers: ["outline", "centre", "dimensions"],
  frame: { min: { x: -14, y: -40 }, max: { x: 164, y: 34 } },
  steps: [
    {
      id: "half",
      draw: (script, layers) =>
        script
          .layer(layers.outline)
          .command("_PLINE")
          .type("0,0")
          .enter()
          .type("0,15")
          .enter()
          .type("40,0")
          .enter()
          .type("0,5")
          .enter()
          .type("60,0")
          .enter()
          .type("0,-5")
          .enter()
          .type("50,0")
          .enter()
          .type("0,-15")
          .enter()
          .enter(),
    },
    {
      id: "chamfers",
      draw: (script) =>
        script
          .command("_CHAMFER")
          .option("Distance")
          .type("2")
          .enter()
          .enter()
          .option("Multiple")
          .click(0, 8)
          .click(20, 15)
          .click(130, 15)
          .click(150, 8)
          .enter(),
    },
    {
      id: "mirror",
      draw: (script) =>
        script
          .command("_MIRROR")
          .click(20, 15)
          .enter()
          .type("0,0")
          .enter()
          .type("150,0")
          .enter()
          .enter(),
    },
    {
      id: "edges",
      draw: (script) =>
        script
          .command("_LINE")
          .type("2,-15")
          .enter()
          .type("0,30")
          .enter()
          .enter()
          .command("_LINE")
          .type("40,-15")
          .enter()
          .type("0,30")
          .enter()
          .enter()
          .command("_LINE")
          .type("100,-15")
          .enter()
          .type("0,30")
          .enter()
          .enter()
          .command("_LINE")
          .type("148,-15")
          .enter()
          .type("0,30")
          .enter()
          .enter(),
    },
    {
      id: "axis",
      draw: (script, layers) =>
        script
          .layer(layers.centre)
          .command("_LINE")
          .type("-8,0")
          .enter()
          .type("166,0")
          .enter()
          .enter(),
    },
    {
      id: "dimensions",
      draw: (script, layers) =>
        script
          .layer(layers.dimensions)
          .command("_DIMLINEAR")
          .type("0,-13")
          .enter()
          .type("40,-7")
          .enter()
          .click(20, -28)
          .command("_DIMCONTINUE")
          .type("#100,-20")
          .enter()
          .type("#150,-15")
          .enter()
          .enter()
          .enter()
          .command("_DIMLINEAR")
          .type("0,-13")
          .enter()
          .type("150,-2")
          .enter()
          .click(75, -36),
    },
  ],
}
