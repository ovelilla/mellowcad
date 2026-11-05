import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/** MTEXT in a notes box: Height first, then the opposite corner, and one paragraph wrapped to the width. */
export const sessions = {
  mtext: {
    figure: {
      ...COMMAND_FIGURE,
      script: demo({ width: 320, height: 200 })
        .command("_RECTANG")
        .type("0,0")
        .enter()
        .type("64,40")
        .enter()
        .command("_MTEXT")
        .type("6,34")
        .enter()
        .option("Height")
        .type("5")
        .enter()
        .type("52,-28")
        .enter()
        .type("ISO 2768-mK ISO 1302 Ra 3.2 Ø12 H7")
        .enter(),
    },
    from: "MTEXT",
  },
} satisfies CommandSessions
