import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/** LIST of a plate's hole: a circle's report, centre, radius, circumference and area. */
export const sessions = {
  list: {
    figure: {
      ...COMMAND_FIGURE,
      script: demo({ width: 320, height: 200 })
        .command("_RECTANG")
        .type("0,0")
        .enter()
        .type("100,60")
        .enter()
        .command("_CIRCLE")
        .type("50,30")
        .enter()
        .type("18")
        .enter()
        .command("_LIST")
        .click(68, 30)
        .enter(),
    },
    from: "LIST",
  },
} satisfies CommandSessions
