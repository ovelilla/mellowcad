import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/** EXTEND in Quick mode: two lines grown to the boundary across their path. */
export const sessions = {
  extend: {
    figure: {
      ...COMMAND_FIGURE,
      script: demo({ width: 320, height: 200 })
        .command("_LINE")
        .type("100,-10")
        .enter()
        .type("0,70")
        .enter()
        .enter()
        .command("_LINE")
        .type("0,0")
        .enter()
        .type("60,0")
        .enter()
        .enter()
        .command("_LINE")
        .type("0,40")
        .enter()
        .type("40,0")
        .enter()
        .enter()
        .command("_EXTEND")
        .click(55, 0)
        .click(35, 40)
        .enter(),
    },
    from: "EXTEND",
  },
} satisfies CommandSessions
