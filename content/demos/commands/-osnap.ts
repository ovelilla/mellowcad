import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/**
 * -OSNAP sets Midpoint and Center as the running snaps and turns object
 * snapping on; LINE then goes from an edge's midpoint to the circle's centre,
 * and the cursor rests on the top edge, its Midpoint marker showing. Live:
 * the marker and its tooltip are the figure.
 */
export const sessions = {
  "-osnap": {
    figure: {
      ...COMMAND_FIGURE,
      script: demo({
        width: 320,
        height: 200,
        view: { min: { x: 0, y: 0 }, max: { x: 100, y: 60 } },
        viewPadding: 24,
      })
        .command("_RECTANG")
        .type("0,0")
        .enter()
        .type("100,60")
        .enter()
        .command("_CIRCLE")
        .type("70,30")
        .enter()
        .type("15")
        .enter()
        .command("_-OSNAP")
        .type("_MID,_CEN")
        .enter()
        .command("_LINE")
        .click(1, 28)
        .click(84, 33)
        .moveTo(47, 59),
      live: true,
    },
    from: "-OSNAP",
  },
} satisfies CommandSessions
