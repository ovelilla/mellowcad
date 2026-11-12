import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/**
 * PTYPE's dialog is the host's, which a script cannot press: after it, the
 * two variables its OK writes are typed, then points drawn with that style.
 */
export const sessions = {
  ptype: {
    figure: {
      ...COMMAND_FIGURE,
      script: demo({ width: 320, height: 200 })
        .command("_RECTANG")
        .type("0,0")
        .enter()
        .type("100,60")
        .enter()
        .command("_PTYPE")
        .command("_PDMODE")
        .type("35")
        .enter()
        .command("_PDSIZE")
        .type("8")
        .enter()
        .command("_POINT")
        .type("25,30")
        .enter()
        .command("_POINT")
        .type("50,30")
        .enter()
        .command("_POINT")
        .type("75,30")
        .enter(),
    },
    from: "PTYPE",
  },
} satisfies CommandSessions
