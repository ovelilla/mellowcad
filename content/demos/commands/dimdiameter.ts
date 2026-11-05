import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/**
 * DIMDIAMETER on a large circle, placed inside, and on a small one, placed
 * outside: the same pick-then-place as DIMRADIUS, the diameter reported.
 */
export const sessions = {
  dimdiameter: {
    figure: {
      ...COMMAND_FIGURE,
      frame: { min: { x: -34, y: -34 }, max: { x: 94, y: 46 } },
      script: demo({ width: 320, height: 200, dimScale: 2 })
        .command("_CIRCLE")
        .type("0,0")
        .enter()
        .type("30")
        .enter()
        .command("_CIRCLE")
        .type("60,0")
        .enter()
        .type("8")
        .enter()
        .command("_DIMDIAMETER")
        .click(-21.21, -21.21)
        .click(-8, -8)
        .command("_DIMDIAMETER")
        .click(65.66, 5.66)
        .click(78, 22),
    },
    from: "DIMDIAMETER",
  },
} satisfies CommandSessions
