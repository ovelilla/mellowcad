import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/**
 * EXTRUDE of a closed L-shaped polyline, then seen from the south-east. Live:
 * a still frames the plan, where a solid is only its outline; Hidden is set
 * before the command, so the history opens on it.
 */
export const sessions = {
  extrude: {
    figure: {
      ...COMMAND_FIGURE,
      script: demo({ width: 320, height: 200 })
        .command("_VSCURRENT")
        .option("Hidden")
        .command("_PLINE")
        .type("0,0")
        .enter()
        .type("60,0")
        .enter()
        .type("0,15")
        .enter()
        .type("-45,0")
        .enter()
        .type("0,25")
        .enter()
        .type("-15,0")
        .enter()
        .option("Close")
        .command("_EXTRUDE")
        .click(30, 0)
        .enter()
        .type("20")
        .enter()
        .command("_-VIEW")
        .option("SEiso")
        .command("_ZOOM")
        .type("0.8x")
        .enter()
        .moveTo(300, 190),
      live: true,
    },
    from: "EXTRUDE",
  },
} satisfies CommandSessions
