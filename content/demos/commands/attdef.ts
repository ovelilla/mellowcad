import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/** ATTDEF: a door tag's attribute NUM, its prompt the tag (Enter), default 1, centred in the circle. */
export const sessions = {
  attdef: {
    figure: {
      ...COMMAND_FIGURE,
      script: demo({ width: 320, height: 200 })
        .command("_LINE")
        .type("-20,-20")
        .enter()
        .type("60,0")
        .enter()
        .enter()
        .command("_CIRCLE")
        .type("0,0")
        .enter()
        .type("10")
        .enter()
        .command("_ATTDEF")
        .enter()
        .type("NUM")
        .enter()
        .enter()
        .type("1")
        .enter()
        .option("Justify")
        .option("MC")
        .type("0,0")
        .enter()
        .type("5")
        .enter()
        .type("0")
        .enter(),
    },
    from: "ATTDEF",
  },
} satisfies CommandSessions
