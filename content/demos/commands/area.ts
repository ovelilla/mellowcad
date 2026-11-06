import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/** AREA of a plate less its hole: Add area, the rectangle, then Subtract area, the circle. */
export const sessions = {
  area: {
    figure: {
      ...COMMAND_FIGURE,
      script: demo({ width: 320, height: 200 })
        .command("_RECTANG")
        .type("0,0")
        .enter()
        .type("100,60")
        .enter()
        .command("_CIRCLE")
        .type("50,30")
        .enter()
        .type("18")
        .enter()
        .command("_AREA")
        .option("Add")
        .option("Object")
        .click(50, 0)
        .enter()
        .option("Subtract")
        .option("Object")
        .click(68, 30)
        .enter()
        .enter(),
    },
    from: "AREA",
  },
} satisfies CommandSessions
