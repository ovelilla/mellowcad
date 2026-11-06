import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/** COLOR: red current for a plate's hole, a true colour for its bore, then ByLayer again. */
export const sessions = {
  color: {
    figure: {
      ...COMMAND_FIGURE,
      script: demo({ width: 320, height: 200 })
        .command("_RECTANG")
        .type("0,0")
        .enter()
        .type("100,60")
        .enter()
        .command("_COLOR")
        .option("RED")
        .command("_CIRCLE")
        .type("50,30")
        .enter()
        .type("18")
        .enter()
        .command("_COLOR")
        .option("Truecolor")
        .type("0,128,255")
        .enter()
        .command("_CIRCLE")
        .type("50,30")
        .enter()
        .type("8")
        .enter()
        .command("_COLOR")
        .option("BYLAYER"),
    },
    from: "COLOR",
  },
} satisfies CommandSessions
