import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/** COPYCLIP of a plate's hole, then PASTECLIP: the copy laid by its lower-left corner at the point given. */
export const sessions = {
  copyclip: {
    figure: {
      ...COMMAND_FIGURE,
      script: demo({ width: 320, height: 200 })
        .command("_RECTANG")
        .type("0,0")
        .enter()
        .type("100,60")
        .enter()
        .command("_CIRCLE")
        .type("25,30")
        .enter()
        .type("10")
        .enter()
        .command("_COPYCLIP")
        .click(35, 30)
        .enter()
        .command("_PASTECLIP")
        .moveTo(75, 30)
        .type("65,20")
        .enter(),
    },
    from: "COPYCLIP",
  },
} satisfies CommandSessions
