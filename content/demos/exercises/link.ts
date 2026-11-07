import type { Exercise } from "./exercise"

/**
 * A link: two bosses joined by lines tangent to both, drawn with the
 * Tangent object snap, the arcs between them trimmed away, then its centre
 * distance and radii.
 */
export const link: Exercise = {
  layers: ["outline", "centre", "dimensions"],
  frame: { min: { x: -30, y: -40 }, max: { x: 112, y: 40 } },
  steps: [
    {
      id: "bosses",
      draw: (script, layers) =>
        script
          .layer(layers.outline)
          .command("_CIRCLE")
          .type("0,0")
          .enter()
          .type("20")
          .enter()
          .command("_CIRCLE")
          .type("0,0")
          .enter()
          .type("10")
          .enter()
          .command("_CIRCLE")
          .type("90,0")
          .enter()
          .type("12")
          .enter()
          .command("_CIRCLE")
          .type("90,0")
          .enter()
          .type("6")
          .enter(),
    },
    {
      id: "tangents",
      draw: (script) =>
        script
          .command("_LINE")
          .type("_TAN")
          .enter()
          .click(2, 19.9)
          .type("_TAN")
          .enter()
          .click(91, 11.95)
          .enter()
          .command("_LINE")
          .type("_TAN")
          .enter()
          .click(2, -19.9)
          .type("_TAN")
          .enter()
          .click(91, -11.95)
          .enter(),
    },
    {
      id: "trim",
      draw: (script) =>
        script.command("_TRIM").click(20, 0).click(78, 0).enter(),
    },
    {
      id: "centreLines",
      draw: (script, layers) =>
        script
          .layer(layers.centre)
          .command("_LINE")
          .type("-26,0")
          .enter()
          .type("134,0")
          .enter()
          .enter()
          .command("_LINE")
          .type("0,-26")
          .enter()
          .type("0,52")
          .enter()
          .enter()
          .command("_LINE")
          .type("90,-18")
          .enter()
          .type("0,36")
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
          .type("90,0")
          .enter()
          .click(45, -32)
          .command("_DIMRADIUS")
          .click(-14.14, 14.14)
          .click(-26, 26)
          .command("_DIMRADIUS")
          .click(98.49, 8.49)
          .click(108, 22)
          .command("_DIMDIAMETER")
          .click(-7.07, -7.07)
          .click(-24, -30)
          .command("_DIMDIAMETER")
          .click(94.24, -4.24)
          .click(108, -26),
    },
  ],
}
