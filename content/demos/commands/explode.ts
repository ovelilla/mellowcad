import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/** EXPLODE: a rectangle, one polyline, into four lines; one of them erased. */
export const sessions = {
  explode: {
    figure: {
      ...COMMAND_FIGURE,
      script: demo({ width: 320, height: 200 })
        .command("_RECTANG")
        .type("0,0")
        .enter()
        .type("100,60")
        .enter()
        .command("_EXPLODE")
        .click(50, 0)
        .enter()
        .command("_ERASE")
        .click(100, 30)
        .enter(),
    },
    from: "EXPLODE",
  },
} satisfies CommandSessions
