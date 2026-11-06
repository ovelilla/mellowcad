import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/**
 * ATTEDIT: three door tags, a block with the attribute NUM, the last inserted
 * as 2 and edited to 3 in the box.
 */
export const sessions = {
  attedit: {
    figure: {
      ...COMMAND_FIGURE,
      script: demo({
        width: 320,
        height: 200,
        view: { min: { x: -20, y: -30 }, max: { x: 140, y: 20 } },
        viewPadding: 20,
      })
        .command("_LINE")
        .type("-20,-20")
        .enter()
        .type("160,0")
        .enter()
        .enter()
        .command("_CIRCLE")
        .type("0,0")
        .enter()
        .type("10")
        .enter()
        .command("_ATTDEF")
        .enter()
        .type("NUM")
        .enter()
        .enter()
        .type("1")
        .enter()
        .option("Justify")
        .option("MC")
        .type("0,0")
        .enter()
        .type("5")
        .enter()
        .type("0")
        .enter()
        .command("_BLOCK")
        .type("TAG")
        .enter()
        .type("0,0")
        .enter()
        .click(-13, 13)
        .click(13, -13)
        .enter()
        .enter()
        .command("_-INSERT")
        .type("TAG")
        .enter()
        .type("60,0")
        .enter()
        .enter()
        .enter()
        .enter()
        .type("2")
        .enter()
        .command("_-INSERT")
        .type("TAG")
        .enter()
        .type("120,0")
        .enter()
        .enter()
        .enter()
        .enter()
        .type("2")
        .enter()
        .command("_ATTEDIT")
        .click(130, 0)
        .type("3")
        .enter(),
    },
    from: "ATTEDIT",
  },
} satisfies CommandSessions
