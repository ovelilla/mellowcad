import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/**
 * CHAMFEREDGE of a box's top front edges, 6 by 6, both on the top face.
 * Live and Hidden as BOX's session (`./box`).
 */
export const sessions = {
  chamferedge: {
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
        .command("_CHAMFEREDGE")
        .option("Distance")
        .type("6")
        .enter()
        .type("6")
        .enter()
        .click(5, 25)
        .click(35, 45)
        .enter()
        .enter()
        .command("_ZOOM")
        .type("0.8x")
        .enter()
        .moveTo(300, 190),
      live: true,
    },
    from: "CHAMFEREDGE",
  },
} satisfies CommandSessions
