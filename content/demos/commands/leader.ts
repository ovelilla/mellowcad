import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/**
 * A hole and its note: LEADER from the circle's rim, two points, then two
 * lines of text; the last segment rises, so a hook joins it to the text.
 */
export const sessions = {
  leader: {
    figure: {
      ...COMMAND_FIGURE,
      script: demo({ width: 320, height: 200 })
        .command("_CIRCLE")
        .type("0,0")
        .enter()
        .type("10")
        .enter()
        .command("_LEADER")
        .type("7.07,7.07")
        .enter()
        .type("14,12")
        .enter()
        .enter()
        .type("2 HOLES")
        .enter()
        .type("Ø20 THRU")
        .enter()
        .enter(),
    },
    from: "LEADER",
  },
} satisfies CommandSessions
