import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/**
 * VSCURRENT Conceptual on a drilled block seen from the south-east: shaded
 * faces under Hidden's edges. Live, as the style is the editor's.
 */
export const sessions = {
  vscurrent: {
    figure: {
      ...COMMAND_FIGURE,
      script: demo({ width: 320, height: 200 })
        .command("_BOX")
        .type("0,0")
        .enter()
        .type("60,40")
        .enter()
        .type("20")
        .enter()
        .command("_CYLINDER")
        .type("30,20")
        .enter()
        .type("10")
        .enter()
        .type("20")
        .enter()
        .command("_SUBTRACT")
        .click(0, 0)
        .enter()
        .click(40, 20)
        .enter()
        .command("_-VIEW")
        .option("SEiso")
        .command("_ZOOM")
        .type("0.8x")
        .enter()
        .command("_VSCURRENT")
        .option("Conceptual")
        .moveTo(300, 190),
      live: true,
    },
    from: "VSCURRENT",
  },
} satisfies CommandSessions
