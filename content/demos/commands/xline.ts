import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/**
 * Two lines at an angle; XLINE through a point twice, a horizontal one, and
 * the bisector of the lines' angle: each runs across the whole view.
 */
export const sessions = {
  xline: {
    figure: {
      ...COMMAND_FIGURE,
      // An xline has no extents to frame: the view is set.
      frame: { min: { x: -10, y: -10 }, max: { x: 130, y: 90 } },
      script: demo({ width: 320, height: 200 })
        .command("_LINE")
        .type("0,0")
        .enter()
        .type("@120,0")
        .enter()
        .enter()
        .command("_LINE")
        .type("0,0")
        .enter()
        .type("@80<50")
        .enter()
        .enter()
        .command("_XLINE")
        .type("60,60")
        .enter()
        .type("@10,10")
        .enter()
        .type("@10,-20")
        .enter()
        .enter()
        .command("_XLINE")
        .option("Hor")
        .type("0,75")
        .enter()
        .enter()
        .command("_XLINE")
        .option("Bisect")
        .type("0,0")
        .enter()
        .type("120,0")
        .enter()
        .type("#51.42,61.28")
        .enter()
        .enter(),
    },
    from: "XLINE",
  },
} satisfies CommandSessions
