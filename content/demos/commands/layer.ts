import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/** LAYER, then each layer made current before drawing on it: its colour and linetype ByLayer. */
export const sessions = {
  layer: {
    figure: {
      ...COMMAND_FIGURE,
      script: demo({
        width: 320,
        height: 200,
        layers: [
          { name: "WALLS" },
          { name: "DOORS", color: "#ffff00" },
          { name: "AXES", color: "#ff0000", linetype: "CENTER" },
        ],
      })
        .command("_LAYER")
        .layer("WALLS")
        .command("_RECTANG")
        .type("0,0")
        .enter()
        .type("100,60")
        .enter()
        .layer("DOORS")
        .command("_LINE")
        .type("15,0")
        .enter()
        .type("0,20")
        .enter()
        .enter()
        .command("_ARC")
        .option("Center")
        .type("15,0")
        .enter()
        .type("20,0")
        .enter()
        .type("0,20")
        .enter()
        .layer("AXES")
        .command("_LINE")
        .type("60,-10")
        .enter()
        .type("0,80")
        .enter()
        .enter(),
    },
    from: "LAYER",
  },
} satisfies CommandSessions
