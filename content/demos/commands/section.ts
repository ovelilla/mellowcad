import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/**
 * SECTION of a drilled block by its ZX plane through the hole, the region
 * moved out in front to be seen: a profile with the hole's gap. Live, from the
 * south-east (see slice.ts).
 */
export const sessions = {
  section: {
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
        .command("_SECTION")
        .click(0, 0)
        .enter()
        .option("ZX")
        .type("0,20,0")
        .enter()
        .command("_MOVE")
        .click(10, 20)
        .enter()
        .type("0,-50")
        .enter()
        .enter()
        .command("_-VIEW")
        .option("SEiso")
        .command("_VSCURRENT")
        .option("Hidden")
        .command("_ZOOM")
        .type("0.85x")
        .enter()
        .moveTo(-500, -500),
      live: true,
    },
    from: "SECTION",
  },
} satisfies CommandSessions
