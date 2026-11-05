import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/**
 * DIMRADIUS on a plate's rounded corner, placed outside, and on its hole,
 * placed inside: each a pick on the curve, then where the text goes.
 */
export const sessions = {
  dimradius: {
    figure: {
      ...COMMAND_FIGURE,
      frame: { min: { x: -4, y: -4 }, max: { x: 124, y: 80 } },
      script: demo({ width: 320, height: 200, dimScale: 2 })
        .command("_RECTANG")
        .option("Fillet")
        .type("10")
        .enter()
        .type("0,0")
        .enter()
        .type("100,60")
        .enter()
        .command("_CIRCLE")
        .type("45,30")
        .enter()
        .type("18")
        .enter()
        .command("_DIMRADIUS")
        .click(97.07, 57.07)
        .click(112, 72)
        .command("_DIMRADIUS")
        .click(32.27, 17.27)
        .click(40, 25),
    },
    from: "DIMRADIUS",
  },
} satisfies CommandSessions
