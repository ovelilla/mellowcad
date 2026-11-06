import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/**
 * A plate 4 metres long whose hole is HIDDEN and its axes CENTER: at
 * LTSCALE 1 their dashes are too fine to see; at 20 they show.
 */
const plate = () =>
  demo({ width: 320, height: 200 })
    .command("_RECTANG")
    .type("0,0")
    .enter()
    .type("4000,2400")
    .enter()
    .command("_LINETYPE")
    .option("Set")
    .type("HIDDEN")
    .enter()
    .enter()
    .command("_CIRCLE")
    .type("2000,1200")
    .enter()
    .type("700")
    .enter()
    .command("_LINETYPE")
    .option("Set")
    .type("CENTER")
    .enter()
    .enter()
    .command("_LINE")
    .type("-300,1200")
    .enter()
    .type("4600,0")
    .enter()
    .enter()
    .command("_LINE")
    .type("2000,-300")
    .enter()
    .type("0,3000")
    .enter()
    .enter()

/** LTSCALE 20; before it, the same plate at the default 1. */
export const sessions = {
  ltscale: {
    figure: {
      ...COMMAND_FIGURE,
      script: plate().command("_LTSCALE").type("20").enter(),
    },
    from: "LTSCALE",
  },
  ltscaleBefore: {
    figure: { ...COMMAND_FIGURE, script: plate() },
  },
} satisfies CommandSessions
