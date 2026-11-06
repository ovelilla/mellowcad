import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/**
 * ARC three ways: three points, start-centre-end and centre-start-end. The
 * later points carry their @: ARC's history writes a relative point without
 * the @ dynamic input reads it with.
 */
export const sessions = {
  arc: {
    figure: {
      ...COMMAND_FIGURE,
      script: demo({ width: 320, height: 200 })
        .command("_ARC")
        .type("0,0")
        .enter()
        .type("@20,20")
        .enter()
        .type("@20,-20")
        .enter()
        .command("_ARC")
        .type("100,0")
        .enter()
        .option("Center")
        .type("@-20,0")
        .enter()
        .type("@-20,0")
        .enter()
        .command("_ARC")
        .option("Center")
        .type("140,0")
        .enter()
        .type("@20,0")
        .enter()
        .type("@0,20")
        .enter(),
    },
    from: "ARC",
  },
} satisfies CommandSessions
