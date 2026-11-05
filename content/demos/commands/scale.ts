import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/**
 * SCALE by Reference, on a copy: a plate's 40 long edge picked and made 60,
 * the copy growing from the base point at its corner.
 */
export const sessions = {
  scale: {
    figure: {
      ...COMMAND_FIGURE,
      script: demo({ width: 320, height: 200 })
        .command("_RECTANG")
        .type("0,0")
        .enter()
        .type("40,24")
        .enter()
        .command("_CIRCLE")
        .type("20,12")
        .enter()
        .type("6")
        .enter()
        .command("_SCALE")
        .click(20, 0)
        .click(26, 12)
        .enter()
        .type("0,0")
        .enter()
        .option("Copy")
        .option("Reference")
        .click(0, 0)
        .click(40, 0)
        .type("60")
        .enter(),
    },
    from: "SCALE",
  },
} satisfies CommandSessions
