import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/**
 * BREAK twice: a line picked, then its First point and second, and a circle
 * whose pick is the first point, the gap counter-clockwise to the second.
 */
export const sessions = {
  break: {
    figure: {
      ...COMMAND_FIGURE,
      script: demo({ width: 320, height: 200 })
        .command("_LINE")
        .type("0,0")
        .enter()
        .type("100,0")
        .enter()
        .enter()
        .command("_CIRCLE")
        .type("150,0")
        .enter()
        .type("25")
        .enter()
        .command("_BREAK")
        .click(10, 0)
        .option("First point")
        .type("40,0")
        .enter()
        .type("60,0")
        .enter()
        .command("_BREAK")
        .click(175, 0)
        .click(150, 25),
    },
    from: "BREAK",
  },
} satisfies CommandSessions
