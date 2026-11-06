import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/**
 * CHAMFER on four lines: Distance 10 for both, then Multiple, two corners
 * cut and two left sharp.
 */
export const sessions = {
  chamfer: {
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
        .command("_CHAMFER")
        .option("Distance")
        .type("10")
        .enter()
        .enter()
        .option("Multiple")
        .click(60, 0)
        .click(100, 20)
        .click(40, 60)
        .click(0, 40)
        .enter(),
    },
    from: "CHAMFER",
  },
} satisfies CommandSessions
