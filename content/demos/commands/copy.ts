import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/** COPY: a circle placed three times from one base point, then Enter. */
export const sessions = {
  copy: {
    figure: {
      ...COMMAND_FIGURE,
      script: demo({ width: 320, height: 200 })
        .command("_CIRCLE")
        .type("0,0")
        .enter()
        .type("10")
        .enter()
        .command("_COPY")
        .click(10, 0)
        .enter()
        .type("0,0")
        .enter()
        .type("30,0")
        .enter()
        .type("60,0")
        .enter()
        .type("90,0")
        .enter()
        .enter(),
    },
    from: "COPY",
  },
} satisfies CommandSessions
