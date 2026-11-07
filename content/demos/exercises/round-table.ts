import type { Exercise } from "./exercise"

/**
 * A round table with six chairs, in centimetres: one chair drawn at the top
 * and the others placed by a polar array round the table's centre.
 */
export const roundTable: Exercise = {
  layers: ["outline", "dimensions"],
  options: { dimScale: 3 },
  frame: { min: { x: -132, y: -132 }, max: { x: 132, y: 150 } },
  steps: [
    {
      id: "table",
      draw: (script, layers) =>
        script
          .layer(layers.outline)
          .command("_CIRCLE")
          .type("0,0")
          .enter()
          .option("Diameter")
          .type("120")
          .enter(),
    },
    {
      id: "chair",
      draw: (script) =>
        script
          .command("_RECTANG")
          .option("Fillet")
          .type("4")
          .enter()
          .type("-22,68")
          .enter()
          .type("44,40")
          .enter()
          .command("_RECTANG")
          .option("Fillet")
          .type("0")
          .enter()
          .type("-22,108")
          .enter()
          .type("44,8")
          .enter(),
    },
    {
      id: "array",
      draw: (script) =>
        script
          .command("_ARRAYPOLAR")
          .click(0, 68)
          .click(0, 116)
          .enter()
          .type("0,0")
          .enter()
          .option("Items")
          .type("6")
          .enter()
          .option("eXit"),
    },
    {
      id: "dimensions",
      draw: (script, layers) =>
        script
          .layer(layers.dimensions)
          .command("_DIMDIAMETER")
          .click(42.43, -42.43)
          .click(20, -20)
          .command("_DIMLINEAR")
          .type("-22,116")
          .enter()
          .type("44,0")
          .enter()
          .click(0, 136)
          .command("_DIMLINEAR")
          .type("-22,68")
          .enter()
          .type("0,48")
          .enter()
          .click(-40, 92),
    },
  ],
}
