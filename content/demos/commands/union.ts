import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/**
 * UNION of two boxes that overlap, seen from the south-east with hidden lines
 * removed. Live, as a still frames the plan, where solids read as rectangles;
 * a live frame takes no padding, so ZOOM leaves the margin, and the cursor ends
 * off the frame. A click is on the work plane: each lands on its box's edge.
 */
export const sessions = {
  union: {
    figure: {
      ...COMMAND_FIGURE,
      live: true,
      script: demo({ width: 320, height: 200 })
        .command("_BOX")
        .type("0,0,0")
        .enter()
        .type("60,40")
        .enter()
        .type("20")
        .enter()
        .command("_BOX")
        .type("40,20,0")
        .enter()
        .type("40,40")
        .enter()
        .type("35")
        .enter()
        .command("_-VIEW")
        .option("SEiso")
        .command("_VSCURRENT")
        .option("Hidden")
        .command("_ZOOM")
        .type("0.85x")
        .enter()
        .command("_UNION")
        .click(30, 0)
        .click(80, 40)
        .enter()
        .moveTo(-500, -500),
    },
    from: "UNION",
  },
} satisfies CommandSessions
