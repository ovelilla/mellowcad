import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/** ERASE: a rectangle with its two diagonals, one diagonal picked and erased. */
export const sessions = {
  erase: {
    figure: {
      ...COMMAND_FIGURE,
      script: demo({ width: 320, height: 200 })
        .command("_RECTANG")
        .type("0,0")
        .enter()
        .type("100,60")
        .enter()
        .command("_LINE")
        .type("0,0")
        .enter()
        .type("100,60")
        .enter()
        .enter()
        .command("_LINE")
        .type("0,60")
        .enter()
        .type("100,-60")
        .enter()
        .enter()
        .command("_ERASE")
        .click(25, 15)
        .enter(),
    },
    from: "ERASE",
  },
} satisfies CommandSessions
