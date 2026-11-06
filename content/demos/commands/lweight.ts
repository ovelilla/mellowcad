import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/** LWEIGHT: 0.70 mm current for a plate's outline, then 0.1, rounded to 0.09 mm, for its hole. Live: a still draws no lineweight. */
export const sessions = {
  lweight: {
    figure: {
      ...COMMAND_FIGURE,
      script: demo({
        width: 320,
        height: 200,
        view: { min: { x: 0, y: 0 }, max: { x: 100, y: 60 } },
        viewPadding: 24,
      })
        .command("_LWEIGHT")
        .type("0.7")
        .enter()
        .command("_RECTANG")
        .type("0,0")
        .enter()
        .type("100,60")
        .enter()
        .command("_LWEIGHT")
        .type("0.1")
        .enter()
        .command("_CIRCLE")
        .type("50,30")
        .enter()
        .type("18")
        .enter()
        .moveTo(300, 190),
      live: true,
    },
    from: "LWEIGHT",
  },
} satisfies CommandSessions
