import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/** A line to frame them, then three rays from one start point. */
export const sessions = {
  ray: {
    figure: {
      ...COMMAND_FIGURE,
      // A ray has no extents to frame: the view is set.
      frame: { min: { x: -10, y: -10 }, max: { x: 150, y: 90 } },
      script: demo({ width: 320, height: 200 })
        .command("_LINE")
        .type("0,0")
        .enter()
        .type("@140,0")
        .enter()
        .enter()
        .command("_RAY")
        .type("20,20")
        .enter()
        .type("@40,10")
        .enter()
        .type("@30,30")
        .enter()
        .type("@0,40")
        .enter()
        .enter(),
    },
    from: "RAY",
  },
} satisfies CommandSessions
