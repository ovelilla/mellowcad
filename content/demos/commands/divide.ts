import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/**
 * PDMODE 3 first, so the points show as crosses; then a line divided into 5
 * and a circle into 6, which starts at its 0° point.
 */
export const sessions = {
  divide: {
    figure: {
      ...COMMAND_FIGURE,
      script: demo({ width: 320, height: 200 })
        .command("_PDMODE")
        .type("3")
        .enter()
        .command("_PDSIZE")
        .type("5")
        .enter()
        .command("_LINE")
        .type("0,0")
        .enter()
        .type("100,0")
        .enter()
        .enter()
        .command("_CIRCLE")
        .type("160,0")
        .enter()
        .type("35")
        .enter()
        .command("_DIVIDE")
        .click(30, 0)
        .type("5")
        .enter()
        .command("_DIVIDE")
        .click(160, 35)
        .type("6")
        .enter(),
    },
    from: "DIVIDE",
  },
} satisfies CommandSessions
