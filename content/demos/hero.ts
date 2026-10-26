import { demo } from "@/cad"

/**
 * The hero: a flange, front view and section A–A, drawn the way someone
 * sitting at AutoCAD would — typed coordinates, OFFSET for the bore, a polar
 * array for the bolt holes, centre lines on their own layer, ANSI31 in the
 * section and two dimensions.
 */
export const hero = demo({
  width: 720,
  height: 480,
  dimScale: 1.6,
  layers: [
    { name: "CENTER", color: "#94a3b8", linetype: "Center" },
    { name: "HATCH", color: "#94a3b8" },
    { name: "DIMS", color: "#94a3b8" },
  ],
})
  .command("_CIRCLE")
  .type("0,0")
  .enter()
  .type("50")
  .enter()
  .command("_OFFSET")
  .type("30")
  .enter()
  .click(50, 0)
  .click(0, 0)
  .escape()
  .command("_CIRCLE")
  .type("36,0")
  .enter()
  .type("6")
  .enter()
  .command("_ARRAYPOLAR")
  .click(42, 0)
  .enter()
  .type("0,0")
  .enter()
  .enter()
  .command("_RECTANG")
  .type("80,20")
  .enter()
  .type("@14,30")
  .enter()
  .command("_RECTANG")
  .type("80,-50")
  .enter()
  .type("@14,30")
  .enter()
  .layer("CENTER")
  .command("_LINE")
  .type("-58,0")
  .enter()
  .type("@160,0")
  .enter()
  .escape()
  .command("_LINE")
  .type("0,-58")
  .enter()
  .type("@0,116")
  .enter()
  .escape()
  .command("_CIRCLE")
  .type("0,0")
  .enter()
  .type("36")
  .enter()
  .layer("HATCH")
  .command("_HATCH")
  .option("Properties")
  .type("ANSI31")
  .enter()
  .type("0.8")
  .enter()
  .enter()
  .click(87, 35)
  .click(87, -35)
  .enter()
  .layer("DIMS")
  .command("_DIMDIAMETER")
  .click(35.36, 35.36)
  .click(-50, 66)
  .command("_DIMLINEAR")
  .click(80, 50)
  .click(94, 50)
  .click(87, 60)
  .moveTo(130, -70)
