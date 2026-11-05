import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/**
 * DIMBASELINE after a DIMLINEAR: two more origins, each dimension measured
 * from the same first origin, one line above the last; Enter twice ends it.
 */
export const sessions = {
  dimbaseline: {
    figure: {
      ...COMMAND_FIGURE,
      frame: { min: { x: -4, y: -4 }, max: { x: 104, y: 82 } },
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
        .click(15, 60)
        .command("_DIMBASELINE")
        .click(70, 35)
        .click(100, 20)
        .enter()
        .enter(),
    },
    from: "DIMBASELINE",
  },
} satisfies CommandSessions
