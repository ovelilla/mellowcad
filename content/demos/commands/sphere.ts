import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/**
 * SPHERE by its centre and a radius, then seen from the south-east. Live as
 * BOX's session (`./box`), but Conceptual: Hidden draws its outline alone, a
 * flat circle.
 */
export const sessions = {
  sphere: {
    figure: {
      ...COMMAND_FIGURE,
      script: demo({ width: 320, height: 200 })
        .command("_VSCURRENT")
        .option("Conceptual")
        .command("_SPHERE")
        .type("0,0,0")
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
    from: "SPHERE",
  },
} satisfies CommandSessions
