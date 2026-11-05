import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/** ARRAYRECT: a square and its circle, COUnt and Spacing, then eXit. */
export const sessions = {
  arrayrect: {
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
        .command("_ARRAYRECT")
        .click(5, 0)
        .click(8, 5)
        .enter()
        .option("COUnt")
        .type("5")
        .enter()
        .type("3")
        .enter()
        .option("Spacing")
        .type("16")
        .enter()
        .type("14")
        .enter()
        .option("eXit"),
    },
    from: "ARRAYRECT",
  },
} satisfies CommandSessions
