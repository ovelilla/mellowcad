import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/**
 * WEDGE by two corners and a height, as BOX's session (`./box`): the slope
 * runs down from the first corner's end.
 */
export const sessions = {
  wedge: {
    figure: {
      ...COMMAND_FIGURE,
      script: demo({ width: 320, height: 200 })
        .command("_VSCURRENT")
        .option("Hidden")
        .command("_WEDGE")
        .type("0,0")
        .enter()
        .type("60,40")
        .enter()
        .type("25")
        .enter()
        .command("_-VIEW")
        .option("SEiso")
        .command("_ZOOM")
        .type("0.8x")
        .enter()
        .moveTo(300, 190),
      live: true,
    },
    from: "WEDGE",
  },
} satisfies CommandSessions
