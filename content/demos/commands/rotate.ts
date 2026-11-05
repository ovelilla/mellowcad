import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/** ROTATE with Copy: a rectangle turned 30° about its corner, the original kept. */
export const sessions = {
  rotate: {
    figure: {
      ...COMMAND_FIGURE,
      script: demo({ width: 320, height: 200 })
        .command("_RECTANG")
        .type("0,0")
        .enter()
        .type("80,30")
        .enter()
        .command("_ROTATE")
        .click(40, 0)
        .enter()
        .type("0,0")
        .enter()
        .option("Copy")
        .type("30")
        .enter(),
    },
    from: "ROTATE",
  },
} satisfies CommandSessions
