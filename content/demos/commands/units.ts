import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/** UNITS, then a corner's coordinates: ID writes them at the precision UNITS sets. */
export const sessions = {
  units: {
    figure: {
      ...COMMAND_FIGURE,
      script: demo({ width: 320, height: 200 })
        .command("_RECTANG")
        .type("0,0")
        .enter()
        .type("100,60")
        .enter()
        .command("_UNITS")
        .command("_ID")
        .type("100,60")
        .enter(),
    },
    from: "UNITS",
  },
} satisfies CommandSessions
