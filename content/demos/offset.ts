import { demo } from "@/cad"

/**
 * The transcript card: an OFFSET session start to finish. The outline is drawn
 * first so the offset has something to work on; the card shows the history
 * from the OFFSET command onwards.
 */
export const offsetSession = demo({ width: 360, height: 220 })
  .command("PLINE")
  .type("0,0")
  .enter()
  .type("@80,0")
  .enter()
  .option("A")
  .type("@0,40")
  .enter()
  .option("L")
  .type("@-80,0")
  .enter()
  .option("C")
  .command("OFFSET")
  .type("6")
  .enter()
  .click(40, 0)
  .click(40, 20)
  .escape()
