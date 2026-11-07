import type { Exercise } from "./exercise"

/**
 * A stepped block in isometric, drawn with LINE and polar coordinates along
 * the isometric axes (30°, 90° and 150°): the faces the eye sees, edge by
 * edge, then its sizes aligned with them.
 */
export const isometricBlock: Exercise = {
  layers: ["outline", "dimensions"],
  frame: { min: { x: -48, y: -14 }, max: { x: 66, y: 98 } },
  steps: [
    {
      id: "front",
      draw: (script, layers) =>
        script
          .layer(layers.outline)
          .command("_LINE")
          .type("0,0")
          .enter()
          .type("60<30")
          .enter()
          .type("20<90")
          .enter()
          .type("60<210")
          .enter()
          .option("Close"),
    },
    {
      id: "side",
      draw: (script) =>
        script
          .command("_LINE")
          .type("0,0")
          .enter()
          .type("40<150")
          .enter()
          .type("40<90")
          .enter()
          .type("20<330")
          .enter()
          .type("20<270")
          .enter()
          .type("20<330")
          .enter()
          .enter(),
    },
    {
      id: "top",
      draw: (script) =>
        script
          .command("_LINE")
          .type("_END")
          .enter()
          .click(51.96, 50)
          .type("20<150")
          .enter()
          .type("20<90")
          .enter()
          .type("20<150")
          .enter()
          .type("60<210")
          .enter()
          .enter()
          .command("_LINE")
          .type("_END")
          .enter()
          .click(34.64, 60)
          .type("60<210")
          .enter()
          .enter()
          .command("_LINE")
          .type("_END")
          .enter()
          .click(34.64, 80)
          .type("60<210")
          .enter()
          .enter(),
    },
    {
      id: "dimensions",
      draw: (script, layers) =>
        script
          .layer(layers.dimensions)
          .command("_DIMALIGNED")
          .type("0,0")
          .enter()
          .type("60<30")
          .enter()
          .click(30, 8)
          .command("_DIMALIGNED")
          .type("0,0")
          .enter()
          .type("40<150")
          .enter()
          .click(-24, 2)
          .command("_DIMALIGNED")
          .type("-34.64,20")
          .enter()
          .type("40<90")
          .enter()
          .click(-42, 40)
          .command("_DIMALIGNED")
          .type("51.96,30")
          .enter()
          .type("20<90")
          .enter()
          .click(60, 40),
    },
  ],
}
