import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/** LINETYPE's Set: HIDDEN current for a plate's hole, CENTER for its axes, then back to ByLayer. */
export const sessions = {
  linetype: {
    figure: {
      ...COMMAND_FIGURE,
      script: demo({ width: 320, height: 200 })
        .command("_RECTANG")
        .type("0,0")
        .enter()
        .type("100,60")
        .enter()
        .command("_LINETYPE")
        .option("Set")
        .type("HIDDEN")
        .enter()
        .enter()
        .command("_CIRCLE")
        .type("50,30")
        .enter()
        .type("18")
        .enter()
        .command("_LINETYPE")
        .option("Set")
        .type("CENTER")
        .enter()
        .enter()
        .command("_LINE")
        .type("-10,30")
        .enter()
        .type("120,0")
        .enter()
        .enter()
        .command("_LINE")
        .type("50,-10")
        .enter()
        .type("0,80")
        .enter()
        .enter()
        .command("_LINETYPE")
        .option("Set")
        .option("BYLayer")
        .enter(),
    },
    from: "LINETYPE",
  },
} satisfies CommandSessions
