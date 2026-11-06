import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/**
 * MASSPROP of a box 60 by 40 by 25 at the origin, seen from the south-east as
 * UNION's session (`./union`): the click is on the work plane, on the box's
 * bottom edge. Enter at Write analysis declines the file.
 */
export const sessions = {
  massprop: {
    figure: {
      ...COMMAND_FIGURE,
      live: true,
      script: demo({ width: 320, height: 200 })
        .command("_VSCURRENT")
        .option("Hidden")
        .command("_BOX")
        .type("0,0")
        .enter()
        .type("60,40")
        .enter()
        .type("25")
        .enter()
        .command("_-VIEW")
        .option("SEiso")
        .command("_ZOOM")
        .type("0.8x")
        .enter()
        .command("_MASSPROP")
        .click(30, 0)
        .enter()
        .enter()
        .moveTo(300, 190),
    },
    from: "MASSPROP",
  },
} satisfies CommandSessions
