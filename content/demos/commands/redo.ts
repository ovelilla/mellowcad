import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/** A hole drawn in a plate, taken back with U and put back with REDO. */
export const sessions = {
  redo: {
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
        .command("_U")
        .command("_REDO"),
    },
    from: "U",
  },
} satisfies CommandSessions
