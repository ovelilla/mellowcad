import { SnapType, demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/** ID with a Center snap on a plate's hole: the centre's coordinates. */
export const sessions = {
  id: {
    figure: {
      ...COMMAND_FIGURE,
      script: demo({ width: 320, height: 200 })
        .command("_RECTANG")
        .type("0,0")
        .enter()
        .type("100,60")
        .enter()
        .command("_CIRCLE")
        .type("70,35")
        .enter()
        .type("12")
        .enter()
        .command("_ID")
        .osnap(SnapType.Center)
        .click(82, 35),
    },
    from: "ID",
  },
} satisfies CommandSessions
