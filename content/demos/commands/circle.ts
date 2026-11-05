import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/** CIRCLE three ways: centre and radius, two ends of a diameter, centre and Diameter. */
export const sessions = {
  circle: {
    figure: {
      ...COMMAND_FIGURE,
      script: demo({ width: 320, height: 200 })
        .command("_CIRCLE")
        .type("0,0")
        .enter()
        .type("20")
        .enter()
        .command("_CIRCLE")
        .option("2P")
        .type("35,0")
        .enter()
        .type("30,0")
        .enter()
        .command("_CIRCLE")
        .type("100,0")
        .enter()
        .option("Diameter")
        .type("24")
        .enter(),
    },
    from: "CIRCLE",
  },
} satisfies CommandSessions
