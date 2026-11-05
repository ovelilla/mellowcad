import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/** ARRAY: a square and its circle, Rectangular (the default), then eXit. */
export const sessions = {
  array: {
    figure: {
      ...COMMAND_FIGURE,
      script: demo({
        width: 320,
        height: 200,
        view: { min: { x: -5, y: -5 }, max: { x: 45, y: 25 } },
      })
        .command("_RECTANG")
        .type("0,0")
        .enter()
        .type("10,10")
        .enter()
        .command("_CIRCLE")
        .type("5,5")
        .enter()
        .type("3")
        .enter()
        .command("_ARRAY")
        .click(5, 0)
        .click(8, 5)
        .enter()
        .enter()
        .option("eXit"),
    },
    from: "ARRAY",
  },
} satisfies CommandSessions
