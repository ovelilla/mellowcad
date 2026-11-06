import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/**
 * CYLINDER by its base's centre, a radius and a height, then seen from the
 * south-east. Live and Hidden as BOX's session (`./box`).
 */
export const sessions = {
  cylinder: {
    figure: {
      ...COMMAND_FIGURE,
      script: demo({ width: 320, height: 200 })
        .command("_VSCURRENT")
        .option("Hidden")
        .command("_CYLINDER")
        .type("0,0")
        .enter()
        .type("20")
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
    from: "CYLINDER",
  },
} satisfies CommandSessions
