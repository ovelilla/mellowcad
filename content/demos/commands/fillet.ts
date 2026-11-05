import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/**
 * FILLET on four lines: a radius, then Multiple, two corners rounded and
 * two left sharp.
 */
export const sessions = {
  fillet: {
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
        .command("_FILLET")
        .option("Radius")
        .type("15")
        .enter()
        .option("Multiple")
        .click(60, 0)
        .click(100, 20)
        .click(100, 40)
        .click(60, 60)
        .enter(),
    },
    from: "FILLET",
  },
} satisfies CommandSessions
