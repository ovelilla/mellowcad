import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/** ARRAYPOLAR: a hole on a flange's circle, its centre, Items 8, then eXit. */
export const sessions = {
  arraypolar: {
    figure: {
      ...COMMAND_FIGURE,
      script: demo({ width: 320, height: 200 })
        .command("_CIRCLE")
        .type("0,0")
        .enter()
        .type("40")
        .enter()
        .command("_CIRCLE")
        .type("0,0")
        .enter()
        .type("15")
        .enter()
        .command("_CIRCLE")
        .type("0,28")
        .enter()
        .type("5")
        .enter()
        .command("_ARRAYPOLAR")
        .click(5, 28)
        .enter()
        .type("0,0")
        .enter()
        .option("Items")
        .type("8")
        .enter()
        .option("eXit"),
    },
    from: "ARRAYPOLAR",
  },
} satisfies CommandSessions
