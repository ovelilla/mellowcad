import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/**
 * TORUS by its centre, the ring's radius and the tube's, then seen from the
 * south-east. Live as BOX's session (`./box`), but Conceptual: Hidden draws
 * its outline alone, a flat ring.
 */
export const sessions = {
  torus: {
    figure: {
      ...COMMAND_FIGURE,
      script: demo({ width: 320, height: 200 })
        .command("_VSCURRENT")
        .option("Conceptual")
        .command("_TORUS")
        .type("0,0,0")
        .enter()
        .type("30")
        .enter()
        .type("8")
        .enter()
        .command("_-VIEW")
        .option("SEiso")
        .command("_ZOOM")
        .type("0.8x")
        .enter()
        .moveTo(300, 190),
      live: true,
    },
    from: "TORUS",
  },
} satisfies CommandSessions
