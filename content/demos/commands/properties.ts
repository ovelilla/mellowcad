import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/** PROPERTIES with a circle selected: its grips, as the palette lists its Geometry. Live, for the grips. */
export const sessions = {
  properties: {
    figure: {
      ...COMMAND_FIGURE,
      script: demo({
        width: 320,
        height: 200,
        view: { min: { x: -10, y: -10 }, max: { x: 110, y: 70 } },
        viewPadding: 20,
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
        .click(68, 30)
        .command("_PROPERTIES")
        .moveTo(300, 190),
      live: true,
    },
    from: "PROPERTIES",
  },
} satisfies CommandSessions
