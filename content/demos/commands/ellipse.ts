import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/** ELLIPSE by an axis and a half-axis, by its Center, and an elliptical Arc. */
export const sessions = {
  ellipse: {
    figure: {
      ...COMMAND_FIGURE,
      script: demo({ width: 320, height: 200 })
        .command("_ELLIPSE")
        .type("0,0")
        .enter()
        .type("80,0")
        .enter()
        .type("20")
        .enter()
        .command("_ELLIPSE")
        .option("Center")
        .type("120,0")
        .enter()
        .type("0,30")
        .enter()
        .type("15")
        .enter()
        .command("_ELLIPSE")
        .option("Arc")
        .type("240,0")
        .enter()
        .type("-80,0")
        .enter()
        .type("20")
        .enter()
        .type("0")
        .enter()
        .type("180")
        .enter(),
    },
    from: "ELLIPSE",
  },
} satisfies CommandSessions
