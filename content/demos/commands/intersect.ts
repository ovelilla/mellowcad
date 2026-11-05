import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/**
 * INTERSECT of a box and a sphere that bulges out of each face: what the two
 * share is a ball with six flat faces (live: see union.ts). The second click,
 * on the work plane, sights the sphere's bulge in front of the box.
 */
export const sessions = {
  intersect: {
    figure: {
      ...COMMAND_FIGURE,
      live: true,
      script: demo({ width: 320, height: 200 })
        .command("_BOX")
        .type("0,0,0")
        .enter()
        .type("60,60")
        .enter()
        .type("60")
        .enter()
        .command("_SPHERE")
        .type("30,30,30")
        .enter()
        .type("40")
        .enter()
        .command("_-VIEW")
        .option("SEiso")
        .command("_VSCURRENT")
        .option("Hidden")
        .command("_ZOOM")
        .type("0.85x")
        .enter()
        .command("_INTERSECT")
        .click(30, 0)
        .click(-8, 30)
        .enter()
        .moveTo(-500, -500),
    },
    from: "INTERSECT",
  },
} satisfies CommandSessions
