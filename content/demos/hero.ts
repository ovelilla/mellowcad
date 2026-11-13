import { demo, type DemoScript } from "@mellowcad/engine"

/**
 * The hero, drafted: a flange, front view and section A–A, drawn the way
 * someone sitting at AutoCAD would — typed coordinates, OFFSET for the bore,
 * a polar array for the bolt holes, centre lines on their own layer, ANSI31 in
 * the section and two dimensions.
 */
export const heroDrawing = demo({
  width: 720,
  height: 480,
  dimScale: 1.6,
  layers: [
    { name: "CENTER", color: "#94a3b8", linetype: "CENTER" },
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

/** Where the hero's solid is built: south-west of the drawing, below it once the view turns. */
const SOLID_AT = { x: -90, y: -150 }

/**
 * The flange as a solid, centred at `at`: a cylinder less its bore and six
 * bolt holes, the holes a polar array that is not associative, so SUBTRACT
 * takes them as solids — in Hidden, the view turned to SW Isometric.
 */
function modelled(script: DemoScript, at: { x: number; y: number }) {
  const p = (x: number, y: number, z?: number) =>
    `${at.x + x},${at.y + y}${z === undefined ? "" : `,${z}`}`
  return (
    script
      .command("_CYLINDER")
      .type(p(0, 0, 0))
      .enter()
      .type("50")
      .enter()
      .type("14")
      .enter()
      .command("_CYLINDER")
      .type(p(0, 0, 0))
      .enter()
      .type("20")
      .enter()
      .type("14")
      .enter()
      .command("_CYLINDER")
      .type(p(36, 0, 0))
      .enter()
      .type("6")
      .enter()
      .type("14")
      .enter()
      .command("_ARRAYPOLAR")
      .click(at.x + 42, at.y)
      .enter()
      .type(p(0, 0))
      .enter()
      .option("ASsociative")
      .option("No")
      .enter()
      .command("_SUBTRACT")
      .click(at.x + 50, at.y)
      .enter()
      // A window round the bore and the holes, short of the cylinder's rim.
      .click(at.x - 43, at.y - 43)
      .click(at.x + 43, at.y + 43)
      .enter()
      .command("_VSCURRENT")
      .option("Hidden")
      .command("_-VIEW")
      .option("SWiso")
      .moveTo(-1e6, -1e6)
  )
}

/**
 * The hero, then modelled: the same flange as a solid beside the drawing. On
 * the screen the solid stands clear of the drawing: Hidden does not yet hide
 * a line behind a solid (`docs/coverage/view.md`), and an overlap would show
 * it.
 */
export const hero = modelled(heroDrawing.layer("0"), SOLID_AT)

/** The flange's solid alone, for the share card beside the drawing. */
export const heroSolid = modelled(demo({ width: 400, height: 260 }), {
  x: 0,
  y: 0,
})
