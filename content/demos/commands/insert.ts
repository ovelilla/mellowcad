import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/**
 * -INSERT, INSERT's command line: a chair defined as a block, then placed
 * round a table — turned after its point, then by Rotate before it.
 */
export const sessions = {
  insert: {
    figure: {
      ...COMMAND_FIGURE,
      script: demo({ width: 320, height: 200 })
        .command("_RECTANG")
        .type("-20,45")
        .enter()
        .type("80,60")
        .enter()
        .command("_RECTANG")
        .type("0,0")
        .enter()
        .type("40,40")
        .enter()
        .command("_LINE")
        .type("0,8")
        .enter()
        .type("40,0")
        .enter()
        .enter()
        .command("_BLOCK")
        .type("B1")
        .enter()
        .type("20,40")
        .enter()
        .click(0, 20)
        .click(20, 8)
        .enter()
        .command("_-INSERT")
        .enter()
        .type("20,110")
        .enter()
        .enter()
        .enter()
        .type("180")
        .enter()
        .command("_-INSERT")
        .enter()
        .option("Rotate")
        .type("90")
        .enter()
        .type("65,75")
        .enter()
        .enter()
        .enter(),
    },
    from: "-INSERT",
  },
} satisfies CommandSessions
