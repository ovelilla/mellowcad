import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/** SPLINE by fit points, then by control vertices on the same five points, 40 below. */
export const sessions = {
  spline: {
    figure: {
      ...COMMAND_FIGURE,
      script: demo({ width: 320, height: 200 })
        .command("_SPLINE")
        .type("0,40")
        .enter()
        .type("25,30")
        .enter()
        .type("25,-25")
        .enter()
        .type("25,30")
        .enter()
        .type("25,-25")
        .enter()
        .enter()
        .command("_SPLINE")
        .option("Method")
        .option("CV")
        .type("0,0")
        .enter()
        .type("25,30")
        .enter()
        .type("25,-25")
        .enter()
        .type("25,30")
        .enter()
        .type("25,-25")
        .enter()
        .enter(),
    },
    from: "SPLINE",
  },
} satisfies CommandSessions
