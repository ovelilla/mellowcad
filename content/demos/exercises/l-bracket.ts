import type { Exercise } from "./exercise"

/**
 * An L-shaped bracket drawn with relative coordinates, its inside corner
 * filleted and two holes, dimensioned from one baseline each way.
 */
export const lBracket: Exercise = {
  layers: ["outline", "dimensions"],
  frame: { min: { x: -30, y: -30 }, max: { x: 112, y: 94 } },
  steps: [
    {
      id: "outline",
      draw: (script, layers) =>
        script
          .layer(layers.outline)
          .command("_LINE")
          .type("0,0")
          .enter()
          .type("100,0")
          .enter()
          .type("0,20")
          .enter()
          .type("-70,0")
          .enter()
          .type("0,60")
          .enter()
          .type("-30,0")
          .enter()
          .option("Close"),
    },
    {
      id: "fillet",
      draw: (script) =>
        script
          .command("_FILLET")
          .option("Radius")
          .type("10")
          .enter()
          .click(60, 20)
          .click(30, 50),
    },
    {
      id: "holes",
      draw: (script) =>
        script
          .command("_CIRCLE")
          .type("80,10")
          .enter()
          .option("Diameter")
          .type("8")
          .enter()
          .command("_CIRCLE")
          .type("15,65")
          .enter()
          .option("Diameter")
          .type("10")
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
          .type("80,10")
          .enter()
          .click(40, -12)
          .command("_DIMBASELINE")
          .type("#100,0")
          .enter()
          .enter()
          .enter()
          .command("_DIMLINEAR")
          .type("0,0")
          .enter()
          .type("15,65")
          .enter()
          .click(-12, 30)
          .command("_DIMBASELINE")
          .type("#0,80")
          .enter()
          .enter()
          .enter()
          .command("_DIMRADIUS")
          .click(30 + 10 - 7.07, 20 + 10 - 7.07)
          .click(46, 36)
          .command("_DIMDIAMETER")
          .click(80 + 2.83, 10 + 2.83)
          .click(94, 30)
          .command("_DIMDIAMETER")
          .click(15 + 3.54, 65 + 3.54)
          .click(44, 88),
    },
  ],
}
