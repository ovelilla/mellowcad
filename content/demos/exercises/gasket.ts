import type { Exercise } from "./exercise"

/**
 * A gasket, 120 × 80 with rounded corners: a bore, four bolt holes copied
 * from one, its centre lines and its dimensions. Typed coordinates
 * throughout: a point after a command's first is measured from the last.
 */
export const gasket: Exercise = {
  layers: ["outline", "centre", "dimensions"],
  frame: { min: { x: -22, y: -24 }, max: { x: 146, y: 102 } },
  steps: [
    {
      id: "outline",
      draw: (script, layers) =>
        script
          .layer(layers.outline)
          .command("_RECTANG")
          .option("Fillet")
          .type("10")
          .enter()
          .type("0,0")
          .enter()
          .type("120,80")
          .enter(),
    },
    {
      id: "bore",
      draw: (script) =>
        script
          .command("_CIRCLE")
          .type("60,40")
          .enter()
          .option("Diameter")
          .type("40")
          .enter(),
    },
    {
      id: "holes",
      draw: (script) =>
        script
          .command("_CIRCLE")
          .type("12,12")
          .enter()
          .option("Diameter")
          .type("10")
          .enter()
          .command("_COPY")
          .click(17, 12)
          .enter()
          .type("12,12")
          .enter()
          .type("96,0")
          .enter()
          .type("96,56")
          .enter()
          .type("0,56")
          .enter()
          .enter(),
    },
    {
      id: "centreLines",
      draw: (script, layers) =>
        script
          .layer(layers.centre)
          .command("_LINE")
          .type("60,14")
          .enter()
          .type("0,52")
          .enter()
          .enter()
          .command("_LINE")
          .type("34,40")
          .enter()
          .type("52,0")
          .enter()
          .enter(),
    },
    {
      id: "dimensions",
      draw: (script, layers) =>
        script
          .layer(layers.dimensions)
          .command("_DIMLINEAR")
          .type("0,10")
          .enter()
          .type("120,0")
          .enter()
          .click(60, -14)
          .command("_DIMLINEAR")
          .type("110,0")
          .enter()
          .type("0,80")
          .enter()
          .click(134, 40)
          .command("_DIMLINEAR")
          .type("12,68")
          .enter()
          .type("96,0")
          .enter()
          .click(60, 92)
          .command("_DIMLINEAR")
          .type("12,12")
          .enter()
          .type("0,56")
          .enter()
          .click(-12, 40)
          .command("_DIMDIAMETER")
          .click(74.14, 54.14)
          .click(88, 66)
          .command("_DIMDIAMETER")
          .click(108 + 3.54, 12 + 3.54)
          .click(126, 22),
    },
  ],
}
