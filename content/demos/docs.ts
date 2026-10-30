import { demo } from "@mellowcad/engine"

/**
 * The docs' getting-started sessions: each is drawn and its history written
 * by the engine, in the page's language, as a beginner would type it.
 */

/**
 * A rectangle with LINE: the first point typed as coordinates, the next ones
 * from the last point (dynamic input reads them so, DYNPICOORDS), and Close.
 */
export const firstLine = demo({ width: 320, height: 200 })
  .command("_LINE")
  .type("0,0")
  .enter()
  .type("100,0")
  .enter()
  .type("0,60")
  .enter()
  .type("-100,0")
  .enter()
  .option("Close")

/** CIRCLE's prompt offers Diameter: its letter and Enter choose it. */
export const circleDiameter = demo({ width: 320, height: 200 })
  .command("_CIRCLE")
  .type("50,30")
  .enter()
  .option("Diameter")
  .type("40")
  .enter()

/** The cursor near a corner: the Endpoint marker and its tooltip. */
export const endpointSnap = demo({
  width: 320,
  height: 200,
  snap: true,
  view: { min: { x: -30, y: -25 }, max: { x: 170, y: 100 } },
})
  .command("_RECTANG")
  .type("0,0")
  .enter()
  .type("100,60")
  .enter()
  .command("_LINE")
  .moveTo(98, 59)

/** OFFSET on that rectangle: a distance, the object, the side. */
export const offsetRectangle = demo({ width: 320, height: 200 })
  .command("_RECTANG")
  .type("0,0")
  .enter()
  .type("100,60")
  .enter()
  .command("_OFFSET")
  .type("8")
  .enter()
  .click(50, 0)
  .click(50, 20)
  .escape()
