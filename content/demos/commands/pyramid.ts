import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/**
 * PYRAMID of six sides (Sides first), its base's centre, a radius and a height,
 * then seen from the south-east. Live and Hidden as BOX's session (`./box`).
 */
export const sessions = {
  pyramid: {
    figure: {
      ...COMMAND_FIGURE,
      script: demo({ width: 320, height: 200 })
        .command("_VSCURRENT")
        .option("Hidden")
        .command("_PYRAMID")
        .option("Sides")
        .type("6")
        .enter()
        .type("0,0")
        .enter()
        .type("25")
        .enter()
        .type("40")
        .enter()
        .command("_-VIEW")
        .option("SEiso")
        .command("_ZOOM")
        .type("0.8x")
        .enter()
        .moveTo(300, 190),
      live: true,
    },
    from: "PYRAMID",
  },
} satisfies CommandSessions
