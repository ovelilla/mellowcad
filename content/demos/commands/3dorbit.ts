import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/**
 * 3DORBIT dragged across and down off a box's plan, then Enter: the box
 * seen from above its front corner. Live: the view is the figure.
 */
export const sessions = {
  "3dorbit": {
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
        .command("_ZOOM")
        .option("Extents")
        .command("_ZOOM")
        .type("0.6x")
        .enter()
        .command("_3DORBIT")
        .down(30, 20)
        .moveTo(0, 5)
        .moveTo(-30, -10)
        .up(-30, -10)
        .enter()
        .moveTo(300, 190),
      live: true,
    },
    from: "3DORBIT",
  },
} satisfies CommandSessions
