import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/**
 * EATTEDIT: two desks, a block with the attributes NUM and PART; the second's
 * PART changed in the box, its field labelled by the tag.
 */
export const sessions = {
  eattedit: {
    figure: {
      ...COMMAND_FIGURE,
      script: demo({
        width: 320,
        height: 200,
        view: { min: { x: -20, y: -30 }, max: { x: 140, y: 20 } },
        viewPadding: 20,
      })
        .command("_RECTANG")
        .type("-15,-8")
        .enter()
        .type("30,16")
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
        .type("0,2")
        .enter()
        .type("5")
        .enter()
        .type("0")
        .enter()
        .command("_ATTDEF")
        .enter()
        .type("PART")
        .enter()
        .enter()
        .type("A-100")
        .enter()
        .option("Justify")
        .option("MC")
        .type("0,-4.5")
        .enter()
        .type("2.5")
        .enter()
        .type("0")
        .enter()
        .command("_BLOCK")
        .type("DESK")
        .enter()
        .type("0,0")
        .enter()
        .click(-18, 12)
        .click(18, -16)
        .enter()
        .enter()
        // A window gives the attributes in reverse: PART is asked first.
        .command("_-INSERT")
        .type("DESK")
        .enter()
        .type("50,0")
        .enter()
        .enter()
        .enter()
        .enter()
        .type("A-100")
        .enter()
        .type("2")
        .enter()
        .command("_EATTEDIT")
        .click(65, 0)
        .type("B-200")
        .enter(),
    },
    from: "EATTEDIT",
  },
} satisfies CommandSessions
