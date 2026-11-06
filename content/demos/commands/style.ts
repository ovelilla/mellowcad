import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/**
 * STYLE over a nameplate, then TEXT: Style's `?` lists what the style holds,
 * and the plate's name is written in it. The palette STYLE opens is the
 * editor's, which a still does not draw.
 */
export const sessions = {
  style: {
    figure: {
      ...COMMAND_FIGURE,
      script: demo({ width: 320, height: 200 })
        .command("_RECTANG")
        .type("0,0")
        .enter()
        .type("100,20")
        .enter()
        .command("_STYLE")
        .command("_TEXT")
        .option("Style")
        .option("?")
        .option("Justify")
        .option("MC")
        .type("50,10")
        .enter()
        .type("6")
        .enter()
        .type("0")
        .enter()
        .type("PLATE")
        .enter()
        .enter(),
    },
    from: "STYLE",
  },
} satisfies CommandSessions
