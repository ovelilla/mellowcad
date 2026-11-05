import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/** TRIM in Quick mode: a line cut back to the two lines that cross it. */
export const sessions = {
  trim: {
    figure: {
      ...COMMAND_FIGURE,
      script: demo({ width: 320, height: 200 })
        .command("_LINE")
        .type("0,0")
        .enter()
        .type("100,0")
        .enter()
        .enter()
        .command("_LINE")
        .type("30,-30")
        .enter()
        .type("0,60")
        .enter()
        .enter()
        .command("_LINE")
        .type("70,-30")
        .enter()
        .type("0,60")
        .enter()
        .enter()
        .command("_TRIM")
        .click(10, 0)
        .click(90, 0)
        .enter(),
    },
    from: "TRIM",
  },
} satisfies CommandSessions
