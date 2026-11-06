import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/** MATCHPROP: an axis on its layer, red and Center, painted onto a line drawn across it on layer 0. */
export const sessions = {
  matchprop: {
    figure: {
      ...COMMAND_FIGURE,
      script: demo({
        width: 320,
        height: 200,
        layers: [{ name: "AXES", color: "#ff0000", linetype: "Center" }],
      })
        .command("_RECTANG")
        .type("0,0")
        .enter()
        .type("100,60")
        .enter()
        .command("_CIRCLE")
        .type("50,30")
        .enter()
        .type("18")
        .enter()
        .layer("AXES")
        .command("_LINE")
        .type("50,-10")
        .enter()
        .type("0,80")
        .enter()
        .enter()
        .layer("0")
        .command("_LINE")
        .type("-10,30")
        .enter()
        .type("120,0")
        .enter()
        .enter()
        .command("_MATCHPROP")
        .click(50, 65)
        .click(105, 30)
        .enter(),
    },
    from: "MATCHPROP",
  },
} satisfies CommandSessions
