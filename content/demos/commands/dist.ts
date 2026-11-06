import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/** DIST across a rectangle's diagonal, corner to corner: the distance, its angle and its deltas. */
export const sessions = {
  dist: {
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
        .command("_DIST")
        .type("0,0")
        .enter()
        .type("100,60")
        .enter(),
    },
    from: "DIST",
  },
} satisfies CommandSessions
