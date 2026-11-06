import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/** JOIN: three lines into one polyline, which one OFFSET then follows whole. */
export const sessions = {
  join: {
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
        .command("_JOIN")
        .click(0, 30)
        .click(50, 0)
        .click(100, 30)
        .enter()
        .command("_OFFSET")
        .type("8")
        .enter()
        .click(50, 0)
        .click(50, 20)
        .enter(),
    },
    from: "JOIN",
  },
} satisfies CommandSessions
