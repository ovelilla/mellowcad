import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/** A spline through five fit points, closed by SPLINEDIT: a smooth loop through them all. */
export const sessions = {
  splinedit: {
    figure: {
      ...COMMAND_FIGURE,
      script: demo({ width: 320, height: 200 })
        .command("_SPLINE")
        .type("0,0")
        .enter()
        .type("30,30")
        .enter()
        .type("30,-20")
        .enter()
        .type("30,30")
        .enter()
        .type("30,-20")
        .enter()
        .enter()
        .command("_SPLINEDIT")
        .click(60, 10)
        .option("Close")
        .enter(),
    },
    from: "SPLINEDIT",
  },
} satisfies CommandSessions
