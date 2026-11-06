import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/**
 * PURGE's Blocks: TAG placed on a wall and BOX, whose one reference was
 * erased; all names, not verified, and only BOX goes.
 */
export const sessions = {
  purge: {
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
        .type("100,0")
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
        .command("_RECTANG")
        .type("40,-10")
        .enter()
        .type("20,20")
        .enter()
        .command("_BLOCK")
        .type("BOX")
        .enter()
        .type("40,-10")
        .enter()
        .click(50, -10)
        .enter()
        .command("_ERASE")
        .click(50, -10)
        .enter()
        .command("_PURGE")
        .option("Blocks")
        .enter()
        .option("No"),
    },
    from: "PURGE",
  },
} satisfies CommandSessions
