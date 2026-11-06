import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/**
 * VIEW's stepped block seen from the south-west with its UCS turned 30°
 * about Z, then PLAN Current ucs: the plan of that UCS, its X to the right.
 * Live, as a still would frame the world's plan.
 */
export const sessions = {
  plan: {
    figure: {
      ...COMMAND_FIGURE,
      script: demo({ width: 320, height: 200, ucsIcon: true })
        .command("_VSCURRENT")
        .option("Hidden")
        .command("_BOX")
        .type("0,0")
        .enter()
        .type("60,40")
        .enter()
        .type("15")
        .enter()
        .command("_BOX")
        .type("0,0,15")
        .enter()
        .type("25,40")
        .enter()
        .type("20")
        .enter()
        .command("_UNION")
        .type("ALL")
        .enter()
        .enter()
        .command("_-VIEW")
        .option("SWiso")
        .command("_UCS")
        .option("Z")
        .type("30")
        .enter()
        .command("_PLAN")
        .enter()
        .command("_ZOOM")
        .type("0.8x")
        .enter()
        .moveTo(300, 190),
      live: true,
    },
    from: "PLAN",
  },
} satisfies CommandSessions
