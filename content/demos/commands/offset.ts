import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/** OFFSET at a distance: a rectangle inward and a circle outward, then Enter. */
export const sessions = {
  offset: {
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
        .type("14")
        .enter()
        .command("_OFFSET")
        .type("6")
        .enter()
        .click(50, 0)
        .click(50, 10)
        .click(64, 30)
        .click(80, 30)
        .enter(),
    },
    from: "OFFSET",
  },
} satisfies CommandSessions
