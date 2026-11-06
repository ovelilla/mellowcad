import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/**
 * -VIEW's SW Isometric off a stepped block's plan, answered at the first
 * prompt as AutoCAD's menus answer it. Live, as a still would frame the plan.
 */
export const sessions = {
  view: {
    figure: {
      ...COMMAND_FIGURE,
      script: demo({ width: 320, height: 200 })
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
        .command("_ZOOM")
        .type("0.8x")
        .enter()
        .moveTo(300, 190),
      live: true,
    },
    from: "-VIEW",
  },
} satisfies CommandSessions
