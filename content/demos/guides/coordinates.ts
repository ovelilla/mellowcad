import { demo } from "@mellowcad/engine"

/**
 * The coordinates guide (`/docs/coordinates`): one triangle typed three
 * ways — from the origin, from the last point, as lengths and angles — then
 * a line held to an angle and polar tracking's guide.
 */
const start = () => demo({ width: 320, height: 200 })

/** Absolute: each point from the origin, `#` after the first under dynamic input. */
export const absolute = start()
  .command("_LINE")
  .type("20,10")
  .enter()
  .type("#120,10")
  .enter()
  .type("#70,80")
  .enter()
  .option("Close")

/** Relative: each point from the last one, as dynamic input reads a typed point. */
export const relative = start()
  .command("_LINE")
  .type("20,10")
  .enter()
  .type("100,0")
  .enter()
  .type("-50,70")
  .enter()
  .option("Close")

/** Polar: a length and an angle from the last point, the angle from the X axis anticlockwise. */
export const polar = start()
  .command("_LINE")
  .type("0,0")
  .enter()
  .type("100<0")
  .enter()
  .type("60<120")
  .enter()
  .type("40<210")
  .enter()
  .enter()

/** A line held to 30° by `<30`, then given its length. */
export const angleOverride = start()
  .command("_LINE")
  .type("0,0")
  .enter()
  .type("<30")
  .enter()
  .moveTo(40, 30)
  .type("100")
  .enter()
  .enter()

/** Polar tracking at 30° (F10): the guide and its tooltip, the length still to type. Live. */
export const polarTracking = demo({
  width: 320,
  height: 200,
  polarAngle: 30,
  view: { min: { x: -20, y: -20 }, max: { x: 140, y: 80 } },
})
  .press("F10")
  .command("_LINE")
  .type("0,0")
  .enter()
  .moveTo(51.96, 30)
