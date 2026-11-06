import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

const FRAME = { min: { x: -6, y: -6 }, max: { x: 126, y: 70 } }

/** A chain of three dimensions along a plate's top edge, each placed at its own height. */
const staggered = () =>
  demo({ width: 320, height: 200, dimScale: 2 })
    .command("_RECTANG")
    .type("0,0")
    .enter()
    .type("120,40")
    .enter()
    .command("_DIMLINEAR")
    .click(0, 40)
    .click(30, 40)
    .click(15, 50)
    .command("_DIMLINEAR")
    .click(30, 40)
    .click(80, 40)
    .click(55, 59)
    .command("_DIMLINEAR")
    .click(80, 40)
    .click(120, 40)
    .click(100, 46)

/** DIMSPACE at 0 lines the chain up on its first dimension; before it, as drawn. */
export const sessions = {
  dimspace: {
    figure: {
      ...COMMAND_FIGURE,
      frame: FRAME,
      script: staggered()
        .command("_DIMSPACE")
        .click(10, 50)
        .click(45, 59)
        .click(110, 46)
        .enter()
        .type("0")
        .enter(),
    },
    from: "DIMSPACE",
  },
  dimspaceBefore: {
    figure: { ...COMMAND_FIGURE, frame: FRAME, script: staggered() },
  },
} satisfies CommandSessions
