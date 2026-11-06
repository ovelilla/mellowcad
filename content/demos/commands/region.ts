import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/**
 * REGION of four lines closed end to end and a circle inside them, taken by a
 * window: two loops, two regions, the circle's no hole in the other's.
 */
export const sessions = {
  region: {
    figure: {
      ...COMMAND_FIGURE,
      script: demo({ width: 320, height: 200 })
        .command("_LINE")
        .type("0,0")
        .enter()
        .type("100,0")
        .enter()
        .type("0,60")
        .enter()
        .type("-100,0")
        .enter()
        .option("Close")
        .command("_CIRCLE")
        .type("50,30")
        .enter()
        .type("18")
        .enter()
        .command("_REGION")
        .click(-10, -10)
        .click(110, 70)
        .enter(),
    },
    from: "REGION",
  },
} satisfies CommandSessions
