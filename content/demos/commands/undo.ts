import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

const FRAME = { min: { x: -6, y: -6 }, max: { x: 106, y: 66 } }

/** A plate, a hole, a second hole and a line across it: four commands, four undo steps. */
const drawn = () =>
  demo({ width: 320, height: 200 })
    .command("_RECTANG")
    .type("0,0")
    .enter()
    .type("100,60")
    .enter()
    .command("_CIRCLE")
    .type("25,30")
    .enter()
    .type("10")
    .enter()
    .command("_CIRCLE")
    .type("75,30")
    .enter()
    .type("10")
    .enter()
    .command("_LINE")
    .type("0,0")
    .enter()
    .type("100,60")
    .enter()
    .enter()

/** UNDO 2 takes back the line and the second hole; before it, the drawing as it was. */
export const sessions = {
  undo: {
    figure: {
      ...COMMAND_FIGURE,
      frame: FRAME,
      script: drawn().command("_UNDO").type("2").enter(),
    },
    from: "UNDO",
  },
  undoBefore: {
    figure: { ...COMMAND_FIGURE, frame: FRAME, script: drawn() },
  },
} satisfies CommandSessions
