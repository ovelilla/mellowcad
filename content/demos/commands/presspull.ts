import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/**
 * PRESSPULL of the area between a rectangle and a circle, pressed down: a
 * plate with a hole. Pressed rather than pulled because Hidden does not yet
 * hide the kept rectangle and circle behind the solid (view.md's VSCURRENT);
 * live and Hidden as EXTRUDE's session (`./extrude`).
 */
export const sessions = {
  presspull: {
    figure: {
      ...COMMAND_FIGURE,
      script: demo({ width: 320, height: 200 })
        .command("_VSCURRENT")
        .option("Hidden")
        .command("_RECTANG")
        .type("0,0")
        .enter()
        .type("60,40")
        .enter()
        .command("_CIRCLE")
        .type("40,20")
        .enter()
        .type("10")
        .enter()
        .command("_PRESSPULL")
        .click(12, 20)
        .type("-8")
        .enter()
        .enter()
        .command("_-VIEW")
        .option("SEiso")
        .command("_ZOOM")
        .type("0.8x")
        .enter()
        .moveTo(300, 190),
      live: true,
    },
    from: "PRESSPULL",
  },
} satisfies CommandSessions
