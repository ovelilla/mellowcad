import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/** PAN dragged to the right and down, then Enter: the plate off to one side of the view. Live: the view is the figure. */
export const sessions = {
  pan: {
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
        .type("50,30")
        .enter()
        .type("18")
        .enter()
        .command("_PAN")
        .down(50, 30)
        .moveTo(55, 27)
        .up(55, 27)
        .enter()
        .moveTo(300, 190),
      live: true,
    },
    from: "PAN",
  },
} satisfies CommandSessions
