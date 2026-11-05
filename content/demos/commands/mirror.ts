import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/** MIRROR: an outline reflected about a vertical line, the source kept. */
export const sessions = {
  mirror: {
    figure: {
      ...COMMAND_FIGURE,
      script: demo({ width: 320, height: 200 })
        .command("_PLINE")
        .type("0,0")
        .enter()
        .type("40,0")
        .enter()
        .type("0,15")
        .enter()
        .type("-25,25")
        .enter()
        .type("-15,0")
        .enter()
        .option("Close")
        .command("_MIRROR")
        .click(20, 0)
        .enter()
        .type("50,-10")
        .enter()
        .type("0,60")
        .enter()
        .enter(),
    },
    from: "MIRROR",
  },
} satisfies CommandSessions
