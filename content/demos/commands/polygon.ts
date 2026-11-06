import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/**
 * POLYGON three ways: a hexagon inscribed in a circle, one circumscribed about
 * a circle of the same radius, and a pentagon by its Edge.
 */
export const sessions = {
  polygon: {
    figure: {
      ...COMMAND_FIGURE,
      script: demo({ width: 320, height: 200 })
        .command("_CIRCLE")
        .type("0,0")
        .enter()
        .type("30")
        .enter()
        .command("_CIRCLE")
        .type("80,0")
        .enter()
        .type("30")
        .enter()
        .command("_POLYGON")
        .type("6")
        .enter()
        .type("0,0")
        .enter()
        .option("Inscribed")
        .type("30")
        .enter()
        .command("_POLYGON")
        .enter()
        .type("80,0")
        .enter()
        .option("Circumscribed")
        .type("30")
        .enter()
        .command("_POLYGON")
        .type("5")
        .enter()
        .option("Edge")
        .type("135,-30")
        .enter()
        .type("35,0")
        .enter(),
    },
    from: "POLYGON",
  },
} satisfies CommandSessions
