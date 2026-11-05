import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/**
 * SUBTRACT: a cylinder taken out of a box, a hole through it, seen from the
 * south-east with hidden lines removed (live: see union.ts). The cylinder
 * stands taller than the box, as Hidden picks the face in front: the second
 * click, on the work plane, sights the part above the box. The plate is thin
 * enough for the hole's far rim to show.
 */
export const sessions = {
  subtract: {
    figure: {
      ...COMMAND_FIGURE,
      live: true,
      script: demo({ width: 320, height: 200 })
        .command("_BOX")
        .type("0,0,0")
        .enter()
        .type("80,50")
        .enter()
        .type("12")
        .enter()
        .command("_CYLINDER")
        .type("40,25,0")
        .enter()
        .type("15")
        .enter()
        .type("20")
        .enter()
        .command("_-VIEW")
        .option("SEiso")
        .command("_VSCURRENT")
        .option("Hidden")
        .command("_ZOOM")
        .type("0.85x")
        .enter()
        .command("_SUBTRACT")
        .click(10, 0)
        .enter()
        .click(35, 30)
        .enter()
        .moveTo(-500, -500),
    },
    from: "SUBTRACT",
  },
} satisfies CommandSessions
