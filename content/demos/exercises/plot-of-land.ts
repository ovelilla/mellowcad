import type { Exercise } from "./exercise"

/**
 * A plot of land in metres, its boundary a closed polyline drawn side by
 * side from each one's length and bearing (polar coordinates), measured with
 * AREA and dimensioned along each side.
 */
export const plotOfLand: Exercise = {
  layers: ["outline", "dimensions"],
  options: { dimScale: 0.5 },
  frame: { min: { x: -12, y: -8 }, max: { x: 56, y: 52 } },
  steps: [
    {
      id: "boundary",
      draw: (script, layers) =>
        script
          .layer(layers.outline)
          .command("_PLINE")
          .type("0,0")
          .enter()
          .type("40<0")
          .enter()
          .type("30<80")
          .enter()
          .type("35<155")
          .enter()
          .type("25<230")
          .enter()
          .option("Close"),
    },
    {
      id: "area",
      draw: (script) => script.command("_AREA").option("Object").click(20, 0),
    },
    {
      id: "dimensions",
      draw: (script, layers) =>
        script
          .layer(layers.dimensions)
          .command("_DIMALIGNED")
          .enter()
          .click(20, 0)
          .click(20, -5)
          .command("_DIMALIGNED")
          .enter()
          .click(42.6, 14.77)
          .click(47.5, 13.9)
          .command("_DIMALIGNED")
          .enter()
          .click(29.35, 36.94)
          .click(31.5, 41.5)
          .command("_DIMALIGNED")
          .enter()
          .click(5.45, 34.76)
          .click(1.6, 38)
          .command("_DIMALIGNED")
          .enter()
          .click(-1.29, 12.6)
          .click(-6.3, 12.1)
          .command("_DIMANGULAR")
          .click(30, 0)
          .click(41.74, 9.85)
          .click(35, 5),
    },
  ],
}
