import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/** DIMSTYLE, then dimensions drawn in ISO-25, the current style: a comma, text above the line. */
export const sessions = {
  dimstyle: {
    figure: {
      ...COMMAND_FIGURE,
      frame: { min: { x: -6, y: -6 }, max: { x: 100, y: 70 } },
      script: demo({ width: 320, height: 200, dimScale: 2 })
        .command("_DIMSTYLE")
        .command("_RECTANG")
        .type("0,0")
        .enter()
        .type("82.5,50")
        .enter()
        .command("_CIRCLE")
        .type("41.25,25")
        .enter()
        .type("10")
        .enter()
        .command("_DIMLINEAR")
        .click(0, 50)
        .click(82.5, 50)
        .click(41, 62)
        .command("_DIMLINEAR")
        .click(82.5, 0)
        .click(82.5, 50)
        .click(94, 25)
        .command("_DIMDIAMETER")
        .click(48.32, 32.07)
        .click(60, 44),
    },
    from: "DIMSTYLE",
  },
} satisfies CommandSessions
