import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/**
 * UCSICON Noorigin, the UCS moved to a stepped block's top, then ORigin: the
 * icon leaves the corner for the new origin. Live, as the icon is drawn only
 * in the editor's frame.
 */
export const sessions = {
  ucsicon: {
    figure: {
      ...COMMAND_FIGURE,
      script: demo({ width: 320, height: 200, ucsIcon: true })
        .command("_VSCURRENT")
        .option("Hidden")
        .command("_BOX")
        .type("0,0")
        .enter()
        .type("60,40")
        .enter()
        .type("15")
        .enter()
        .command("_BOX")
        .type("0,0,15")
        .enter()
        .type("25,40")
        .enter()
        .type("20")
        .enter()
        .command("_UNION")
        .type("ALL")
        .enter()
        .enter()
        .command("_-VIEW")
        .option("SEiso")
        .command("_ZOOM")
        .type("0.8x")
        .enter()
        .command("_UCSICON")
        .option("Noorigin")
        .command("_UCS")
        .type("25,0,15")
        .enter()
        .enter()
        .command("_UCSICON")
        .option("ORigin")
        .moveTo(300, 190),
      live: true,
    },
    from: "UCSICON",
  },
} satisfies CommandSessions
