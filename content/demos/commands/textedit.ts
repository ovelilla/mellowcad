import { demo } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/** TEXTEDIT: a nameplate's misspelt text picked and retyped, then Escape. */
export const sessions = {
  textedit: {
    figure: {
      ...COMMAND_FIGURE,
      script: demo({ width: 320, height: 200 })
        .command("_RECTANG")
        .type("0,0")
        .enter()
        .type("100,20")
        .enter()
        .command("_TEXT")
        .option("Justify")
        .option("MC")
        .type("50,10")
        .enter()
        .type("6")
        .enter()
        .type("0")
        .enter()
        .type("PALTE")
        .enter()
        .enter()
        .command("_TEXTEDIT")
        .click(50, 10)
        .type("PLATE")
        .enter()
        .escape(),
    },
    from: "TEXTEDIT",
  },
} satisfies CommandSessions
