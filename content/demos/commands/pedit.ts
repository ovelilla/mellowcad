import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/** PEDIT on a line: turned into a polyline, the lines it meets joined to it, then a width for all. */
export const sessions = {
  pedit: {
    figure: {
      ...COMMAND_FIGURE,
      script: demo({ width: 320, height: 200 })
        .command("_LINE")
        .type("0,60")
        .enter()
        .type("0,-60")
        .enter()
        .type("100,0")
        .enter()
        .type("0,60")
        .enter()
        .enter()
        .command("_PEDIT")
        .click(0, 30)
        .enter()
        .option("Join")
        .click(50, 0)
        .click(100, 30)
        .enter()
        .option("Width")
        .type("2")
        .enter()
        .enter(),
    },
    from: "PEDIT",
  },
} satisfies CommandSessions
