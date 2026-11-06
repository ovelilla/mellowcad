import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/**
 * A 3D polyline climbing 15 at each corner of a rectangle on the ground, seen
 * from the south-east. Live: a still frames the plan, where it reads as a 2D
 * polyline.
 */
export const sessions = {
  "3dpoly": {
    figure: {
      ...COMMAND_FIGURE,
      script: demo({ width: 320, height: 200 })
        .command("_RECTANG")
        .type("0,0")
        .enter()
        .type("60,40")
        .enter()
        .command("_3DPOLY")
        .type("0,0,0")
        .enter()
        .type("60,0,15")
        .enter()
        .type("0,40,15")
        .enter()
        .type("-60,0,15")
        .enter()
        .type("0,-40,15")
        .enter()
        .enter()
        .command("_-VIEW")
        .option("SEiso")
        .command("_ZOOM")
        .type("0.8x")
        .enter()
        .moveTo(300, 190),
      live: true,
    },
    from: "3DPOLY",
  },
} satisfies CommandSessions
