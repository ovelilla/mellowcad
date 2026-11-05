import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/** DIMALIGNED on a triangle's slanted side: its line parallel to the side. */
export const sessions = {
  dimaligned: {
    figure: {
      ...COMMAND_FIGURE,
      frame: { min: { x: -16, y: -4 }, max: { x: 84, y: 76 } },
      script: demo({ width: 320, height: 200, dimScale: 2 })
        .command("_LINE")
        .type("0,0")
        .enter()
        .type("80,0")
        .enter()
        .type("0,60")
        .enter()
        .option("Close")
        .command("_DIMALIGNED")
        .click(0, 0)
        .click(80, 60)
        .click(32.8, 39.6),
    },
    from: "DIMALIGNED",
  },
} satisfies CommandSessions
