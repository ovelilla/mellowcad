import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/**
 * FILLETEDGE of a box's two upright front edges, radius 8, each picked by a
 * point typed on it. Live and Hidden as BOX's session (`./box`).
 */
export const sessions = {
  filletedge: {
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
        .command("_FILLETEDGE")
        .option("Radius")
        .type("8")
        .enter()
        .click(50, 10)
        .click(50, 50)
        .enter()
        .enter()
        .command("_ZOOM")
        .type("0.8x")
        .enter()
        .moveTo(300, 190),
      live: true,
    },
    from: "FILLETEDGE",
  },
} satisfies CommandSessions
