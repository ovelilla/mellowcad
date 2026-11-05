import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/** TEXT justified MC in a title box: two lines, each its own object, then an empty line. */
export const sessions = {
  text: {
    figure: {
      ...COMMAND_FIGURE,
      script: demo({ width: 320, height: 200 })
        .command("_RECTANG")
        .type("0,0")
        .enter()
        .type("120,40")
        .enter()
        .command("_TEXT")
        .option("Justify")
        .option("MC")
        .type("60,25")
        .enter()
        .type("8")
        .enter()
        .enter()
        .type("A-101")
        .enter()
        .type("1:50")
        .enter()
        .enter(),
    },
    from: "TEXT",
  },
} satisfies CommandSessions
