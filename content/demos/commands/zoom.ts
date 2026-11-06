import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/** ZOOM Window round a plate's corner hole, then Extents. Live: a still would frame the drawing anyway. */
export const sessions = {
  zoom: {
    figure: {
      ...COMMAND_FIGURE,
      script: demo({ width: 320, height: 200 })
        .command("_RECTANG")
        .type("0,0")
        .enter()
        .type("100,60")
        .enter()
        .command("_CIRCLE")
        .type("12,12")
        .enter()
        .type("5")
        .enter()
        .command("_ZOOM")
        .option("Extents")
        .command("_ZOOM")
        .type("0,0")
        .enter()
        .type("24,24")
        .enter()
        .moveTo(300, 190),
      live: true,
    },
    from: "ZOOM",
  },
} satisfies CommandSessions
