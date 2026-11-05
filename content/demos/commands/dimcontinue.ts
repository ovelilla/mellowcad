import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/**
 * DIMCONTINUE after a DIMLINEAR: two more origins, each dimension starting
 * where the last one ended, on one line; Enter twice ends it.
 */
export const sessions = {
  dimcontinue: {
    figure: {
      ...COMMAND_FIGURE,
      frame: { min: { x: -4, y: -4 }, max: { x: 104, y: 70 } },
      script: demo({ width: 320, height: 200, dimScale: 2 })
        .command("_PLINE")
        .type("0,0")
        .enter()
        .type("100,0")
        .enter()
        .type("0,20")
        .enter()
        .type("-30,0")
        .enter()
        .type("0,15")
        .enter()
        .type("-40,0")
        .enter()
        .type("0,15")
        .enter()
        .type("-30,0")
        .enter()
        .option("Close")
        .command("_DIMLINEAR")
        .click(0, 50)
        .click(30, 50)
        .click(15, 62)
        .command("_DIMCONTINUE")
        .click(70, 35)
        .click(100, 20)
        .enter()
        .enter(),
    },
    from: "DIMCONTINUE",
  },
} satisfies CommandSessions
