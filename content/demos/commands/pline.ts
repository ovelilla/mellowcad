import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/** PLINE: a line, a tangent arc, a line again and a tapered head of Width. */
export const sessions = {
  pline: {
    figure: {
      ...COMMAND_FIGURE,
      script: demo({ width: 320, height: 200 })
        .command("_PLINE")
        .type("0,0")
        .enter()
        .type("70,0")
        .enter()
        .option("Arc")
        .type("0,40")
        .enter()
        .option("Line")
        .type("-40,0")
        .enter()
        .option("Width")
        .type("10")
        .enter()
        .type("0")
        .enter()
        .type("-16,0")
        .enter()
        .enter(),
    },
    from: "PLINE",
  },
} satisfies CommandSessions
