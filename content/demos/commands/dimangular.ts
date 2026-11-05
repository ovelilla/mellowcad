import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/**
 * DIMANGULAR on two lines meeting at 30 degrees: each line picked, then the
 * arc placed in the sector to measure.
 */
export const sessions = {
  dimangular: {
    figure: {
      ...COMMAND_FIGURE,
      frame: { min: { x: -4, y: -6 }, max: { x: 104, y: 56 } },
      script: demo({ width: 320, height: 200, dimScale: 2 })
        .command("_LINE")
        .type("0,0")
        .enter()
        .type("100,0")
        .enter()
        .enter()
        .command("_LINE")
        .type("0,0")
        .enter()
        .type("90<30")
        .enter()
        .enter()
        .command("_DIMANGULAR")
        .click(80, 0)
        .click(51.96, 30)
        .click(67.61, 18.12),
    },
    from: "DIMANGULAR",
  },
} satisfies CommandSessions
