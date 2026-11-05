import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/** MOVE: a circle picked, a base point at its centre, the second 50 to the right. */
export const sessions = {
  move: {
    figure: {
      ...COMMAND_FIGURE,
      script: demo({ width: 320, height: 200 })
        .command("_RECTANG")
        .type("0,0")
        .enter()
        .type("100,50")
        .enter()
        .command("_CIRCLE")
        .type("25,25")
        .enter()
        .type("12")
        .enter()
        .command("_MOVE")
        .click(37, 25)
        .enter()
        .type("25,25")
        .enter()
        .type("50,0")
        .enter(),
    },
    from: "MOVE",
  },
} satisfies CommandSessions
