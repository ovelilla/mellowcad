import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/** BLOCK: a chair drawn, then named, given its base point and selected. */
export const sessions = {
  block: {
    figure: {
      ...COMMAND_FIGURE,
      script: demo({ width: 320, height: 200 })
        .command("_RECTANG")
        .type("0,0")
        .enter()
        .type("40,40")
        .enter()
        .command("_LINE")
        .type("0,8")
        .enter()
        .type("40,0")
        .enter()
        .enter()
        .command("_BLOCK")
        .type("B1")
        .enter()
        .type("20,40")
        .enter()
        .click(0, 20)
        .click(20, 8)
        .enter(),
    },
    from: "BLOCK",
  },
} satisfies CommandSessions
