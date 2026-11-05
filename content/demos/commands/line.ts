import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/** LINE: a triangle, its first point typed, the next ones from the last, then Close. */
export const sessions = {
  line: {
    figure: {
      ...COMMAND_FIGURE,
      script: demo({ width: 320, height: 200 })
        .command("_LINE")
        .type("0,0")
        .enter()
        .type("80,0")
        .enter()
        .type("-40,50")
        .enter()
        .option("Close"),
    },
    from: "LINE",
  },
} satisfies CommandSessions
