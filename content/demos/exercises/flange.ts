import type { Exercise } from "./exercise"

/**
 * A round flange: its bore with a keyway trimmed into it, eight bolt holes
 * in a polar array on their pitch circle, centre lines and diameters.
 */
export const flange: Exercise = {
  layers: ["outline", "centre", "dimensions"],
  options: { dimScale: 1.5 },
  frame: { min: { x: -90, y: -86 }, max: { x: 100, y: 100 } },
  steps: [
    {
      id: "circles",
      draw: (script, layers) =>
        script
          .layer(layers.outline)
          .command("_CIRCLE")
          .type("0,0")
          .enter()
          .option("Diameter")
          .type("140")
          .enter()
          .command("_CIRCLE")
          .type("0,0")
          .enter()
          .option("Diameter")
          .type("60")
          .enter(),
    },
    {
      id: "keyway",
      draw: (script) =>
        script
          .command("_RECTANG")
          .type("-8,20")
          .enter()
          .type("16,16")
          .enter()
          .command("_TRIM")
          .click(0, 30)
          .click(0, 20)
          .enter(),
    },
    {
      id: "holes",
      draw: (script, layers) =>
        script
          .command("_CIRCLE")
          .type("55<22.5")
          .enter()
          .option("Diameter")
          .type("14")
          .enter()
          .command("_ARRAYPOLAR")
          .click(57.81, 21.05)
          .enter()
          .type("0,0")
          .enter()
          .option("ASsociative")
          .option("No")
          .option("Items")
          .type("8")
          .enter()
          .option("eXit")
          .layer(layers.centre)
          .command("_CIRCLE")
          .type("0,0")
          .enter()
          .option("Diameter")
          .type("110")
          .enter(),
    },
    {
      id: "centreLines",
      draw: (script) =>
        script
          .command("_LINE")
          .type("-78,0")
          .enter()
          .type("156,0")
          .enter()
          .enter()
          .command("_LINE")
          .type("0,-78")
          .enter()
          .type("0,156")
          .enter()
          .enter(),
    },
    {
      id: "dimensions",
      draw: (script, layers) =>
        script
          .layer(layers.dimensions)
          .command("_DIMDIAMETER")
          .click(-28.19, -10.26)
          .click(-12, -4.37)
          .command("_DIMDIAMETER")
          .click(55.76, -26)
          .click(78, -48)
          .command("_DIMDIAMETER")
          .click(-38.89, -38.89)
          .click(-62, -62)
          .command("_DIMDIAMETER")
          .click(-35, 60.62)
          .click(-48, 86)
          .command("_DIMLINEAR")
          .type("-8,36")
          .enter()
          .type("16,0")
          .enter()
          .click(0, 46),
    },
  ],
}
