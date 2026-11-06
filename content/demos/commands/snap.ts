import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/**
 * SNAP 10 with the grid on, then LINE picked off the lattice: every point
 * lands on it. Live: a still shows neither the grid nor the cursor held to it.
 */
export const sessions = {
  snap: {
    figure: {
      ...COMMAND_FIGURE,
      script: demo({
        width: 320,
        height: 200,
        view: { min: { x: 0, y: 0 }, max: { x: 100, y: 60 } },
        viewPadding: 24,
      })
        .command("GRIDMODE")
        .type("1")
        .enter()
        .command("_SNAP")
        .type("10")
        .enter()
        .command("_LINE")
        .click(3, 2)
        .click(38, 4)
        .click(41, 33)
        .moveTo(77, 48),
      live: true,
    },
    from: "SNAP",
  },
} satisfies CommandSessions
