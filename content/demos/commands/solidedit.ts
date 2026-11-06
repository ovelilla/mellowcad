import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/**
 * SOLIDEDIT Face Extrude of a box's top, picked in plan by a point typed on
 * it, 15 up with a taper of 15: a frustum on the box, then seen from the
 * south-east. Live and Hidden as BOX's session (`./box`).
 */
export const sessions = {
  solidedit: {
    figure: {
      ...COMMAND_FIGURE,
      script: demo({ width: 320, height: 200 })
        .command("_VSCURRENT")
        .option("Hidden")
        .command("_BOX")
        .type("0,0")
        .enter()
        .type("60,40")
        .enter()
        .type("20")
        .enter()
        .command("_SOLIDEDIT")
        .option("Face")
        .option("Extrude")
        .type("30,20,20")
        .enter()
        .enter()
        .type("15")
        .enter()
        .type("15")
        .enter()
        .option("eXit")
        .option("eXit")
        .command("_-VIEW")
        .option("SEiso")
        .command("_ZOOM")
        .type("0.8x")
        .enter()
        .moveTo(300, 190),
      live: true,
    },
    from: "SOLIDEDIT",
  },
} satisfies CommandSessions
