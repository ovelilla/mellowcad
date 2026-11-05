import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/**
 * SLICE of a cylinder through its axis by two points, the side picked kept: the
 * one whose cut face looks at the south-east view (live: see union.ts).
 */
export const sessions = {
  slice: {
    figure: {
      ...COMMAND_FIGURE,
      live: true,
      script: demo({ width: 320, height: 200 })
        .command("_CYLINDER")
        .type("0,0,0")
        .enter()
        .type("25")
        .enter()
        .type("40")
        .enter()
        .command("_-VIEW")
        .option("SEiso")
        .command("_VSCURRENT")
        .option("Hidden")
        .command("_ZOOM")
        .type("0.85x")
        .enter()
        .command("_SLICE")
        .click(25, 0)
        .enter()
        .type("0,-30")
        .enter()
        .type("0,60")
        .enter()
        .click(-20, 0)
        .moveTo(-500, -500),
    },
    from: "SLICE",
  },
} satisfies CommandSessions
