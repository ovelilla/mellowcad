import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/**
 * UCS moved to a box's top by its origin alone, then a circle drawn on it:
 * the circle lies on the top, not on the ground. Live, as a still would frame
 * the plan and the icon is the editor's.
 */
export const sessions = {
  ucs: {
    figure: {
      ...COMMAND_FIGURE,
      script: demo({ width: 320, height: 200 })
        .command("_VSCURRENT")
        .option("Hidden")
        .command("_BOX")
        .type("0,0")
        .enter()
        .type("60,40")
        .enter()
        .type("25")
        .enter()
        .command("_-VIEW")
        .option("SEiso")
        .command("_UCS")
        .type("0,0,25")
        .enter()
        .enter()
        .command("_CIRCLE")
        .type("30,20")
        .enter()
        .type("12")
        .enter()
        .command("_ZOOM")
        .type("0.8x")
        .enter()
        .moveTo(300, 190),
      live: true,
    },
    from: "UCS",
  },
} satisfies CommandSessions
