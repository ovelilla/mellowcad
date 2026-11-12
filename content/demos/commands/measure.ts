import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/**
 * A polyline 190 long measured every 15 from the end picked near: twelve
 * points, the last 10 short of the far end. PDMODE 34 makes them visible.
 */
export const sessions = {
  measure: {
    figure: {
      ...COMMAND_FIGURE,
      script: demo({ width: 320, height: 200 })
        .command("_PDMODE")
        .type("34")
        .enter()
        .command("_PDSIZE")
        .type("5")
        .enter()
        .command("_PLINE")
        .type("0,0")
        .enter()
        .type("80,0")
        .enter()
        .type("0,50")
        .enter()
        .type("60,0")
        .enter()
        .enter()
        .command("_MEASURE")
        .click(5, 0)
        .type("15")
        .enter(),
    },
    from: "MEASURE",
  },
} satisfies CommandSessions
