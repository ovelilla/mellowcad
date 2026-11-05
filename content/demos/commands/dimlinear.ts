import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/**
 * DIMLINEAR both ways: the top edge by its two origins, the right one by
 * Enter and a pick on it; each direction follows where the line is placed.
 */
export const sessions = {
  dimlinear: {
    figure: {
      ...COMMAND_FIGURE,
      frame: { min: { x: -4, y: -4 }, max: { x: 124, y: 80 } },
      script: demo({ width: 320, height: 200, dimScale: 2 })
        .command("_RECTANG")
        .type("0,0")
        .enter()
        .type("100,60")
        .enter()
        .command("_DIMLINEAR")
        .click(0, 60)
        .click(100, 60)
        .click(50, 72)
        .command("_DIMLINEAR")
        .enter()
        .click(100, 30)
        .click(114, 30),
    },
    from: "DIMLINEAR",
  },
} satisfies CommandSessions
