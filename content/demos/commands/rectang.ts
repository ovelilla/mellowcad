import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/** RECTANG from two corners: one with Fillet, the next with Chamfer. */
export const sessions = {
  rectang: {
    figure: {
      ...COMMAND_FIGURE,
      script: demo({ width: 320, height: 200 })
        .command("_RECTANG")
        .option("Fillet")
        .type("8")
        .enter()
        .type("0,0")
        .enter()
        .type("80,50")
        .enter()
        .command("_RECTANG")
        .option("Chamfer")
        .type("8")
        .enter()
        .enter()
        .type("100,0")
        .enter()
        .type("80,50")
        .enter(),
    },
    from: "RECTANG",
  },
} satisfies CommandSessions
