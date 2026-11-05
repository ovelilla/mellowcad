import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/**
 * REVOLVE of a flanged profile a whole turn round the Y axis: a spool, seen
 * from the south-east. Live and Hidden as EXTRUDE's session (`./extrude`).
 */
export const sessions = {
  revolve: {
    figure: {
      ...COMMAND_FIGURE,
      script: demo({ width: 320, height: 200 })
        .command("_VSCURRENT")
        .option("Hidden")
        .command("_PLINE")
        .type("5,0")
        .enter()
        .type("25,0")
        .enter()
        .type("0,6")
        .enter()
        .type("-15,0")
        .enter()
        .type("0,28")
        .enter()
        .type("15,0")
        .enter()
        .type("0,6")
        .enter()
        .type("-25,0")
        .enter()
        .option("Close")
        .command("_REVOLVE")
        .click(17, 0)
        .enter()
        .option("Y")
        .enter()
        .command("_-VIEW")
        .option("SEiso")
        .command("_ZOOM")
        .type("0.8x")
        .enter()
        .moveTo(300, 190),
      live: true,
    },
    from: "REVOLVE",
  },
} satisfies CommandSessions
