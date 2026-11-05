import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/** ARRAYPATH: a post along an arc, Method Divide and Items, then eXit. */
export const sessions = {
  arraypath: {
    figure: {
      ...COMMAND_FIGURE,
      script: demo({ width: 320, height: 200 })
        .command("_ARC")
        .type("0,0")
        .enter()
        .type("@50,25")
        .enter()
        .type("@50,-25")
        .enter()
        .command("_RECTANG")
        .type("-3,-3")
        .enter()
        .type("6,6")
        .enter()
        .command("_ARRAYPATH")
        .click(0, -3)
        .enter()
        .click(10, 10.5)
        .option("Method")
        .option("Divide")
        .option("Items")
        .type("7")
        .enter()
        .option("eXit"),
    },
    from: "ARRAYPATH",
  },
} satisfies CommandSessions
