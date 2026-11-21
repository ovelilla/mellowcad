import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/**
 * A seat drawn and made a block, then laid by MINSERT in three rows of five:
 * one object, its row distance typed, then its column distance.
 */
export const sessions = {
  minsert: {
    figure: {
      ...COMMAND_FIGURE,
      script: demo({ width: 320, height: 200 })
        .command("_RECTANG")
        .type("0,0")
        .enter()
        .type("@20,16")
        .enter()
        .command("_LINE")
        .type("0,20")
        .enter()
        .type("@20,0")
        .enter()
        .enter()
        .command("_BLOCK")
        .type("SEAT")
        .enter()
        .type("10,0")
        .enter()
        .click(0, 8)
        .click(10, 20)
        .enter()
        .command("_MINSERT")
        .enter()
        .type("10,0")
        .enter()
        .enter()
        .enter()
        .enter()
        .type("3")
        .enter()
        .type("5")
        .enter()
        .type("35")
        .enter()
        .type("30")
        .enter(),
    },
    from: "MINSERT",
  },
} satisfies CommandSessions
