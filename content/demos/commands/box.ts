import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/**
 * BOX by two corners and a height, then seen from the south-east. Live and
 * Hidden as EXTRUDE's session (`./extrude`).
 */
export const sessions = {
  box: {
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
        .command("_ZOOM")
        .type("0.8x")
        .enter()
        .moveTo(300, 190),
      live: true,
    },
    from: "BOX",
  },
} satisfies CommandSessions
