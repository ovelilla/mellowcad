import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/** CHPROP on a line across a plate's hole: red and Center, an axis, on the layer it was on. */
export const sessions = {
  chprop: {
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
        .command("_LINE")
        .type("-10,30")
        .enter()
        .type("120,0")
        .enter()
        .enter()
        .command("_CHPROP")
        .click(105, 30)
        .enter()
        .option("Color")
        .type("1")
        .enter()
        .option("LType")
        .type("Center")
        .enter()
        .enter(),
    },
    from: "CHPROP",
  },
} satisfies CommandSessions
