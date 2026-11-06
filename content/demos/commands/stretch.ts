import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/**
 * STRETCH: a crossing window over a rectangle's right side and a circle, 40 to
 * the right — the corners caught move, the circle by its centre.
 */
export const sessions = {
  stretch: {
    figure: {
      ...COMMAND_FIGURE,
      script: demo({ width: 320, height: 200 })
        .command("_RECTANG")
        .type("0,0")
        .enter()
        .type("100,50")
        .enter()
        .command("_CIRCLE")
        .type("80,25")
        .enter()
        .type("10")
        .enter()
        .command("_STRETCH")
        .click(120, 60)
        .click(65, -10)
        .enter()
        .type("100,25")
        .enter()
        .type("40,0")
        .enter(),
    },
    from: "STRETCH",
  },
} satisfies CommandSessions
