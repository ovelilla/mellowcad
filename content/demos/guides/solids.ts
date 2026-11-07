import { demo } from "@mellowcad/engine"

/**
 * The guide from 2D to 3D (`/docs/2d-to-3d`): a profile extruded and seen
 * from the south-east as the editor shows it. PRESSPULL, REVOLVE and SUBTRACT
 * are their command pages' sessions.
 */

/** An L profile as one closed polyline, extruded 30, then the view turned. */
export const extrudeProfile = demo({ width: 320, height: 200 })
  .command("_PLINE")
  .type("0,0")
  .enter()
  .type("80,0")
  .enter()
  .type("0,15")
  .enter()
  .type("-60,0")
  .enter()
  .type("0,45")
  .enter()
  .type("-20,0")
  .enter()
  .option("Close")
  .command("_EXTRUDE")
  .click(40, 0)
  .enter()
  .type("30")
  .enter()
  .command("_-VIEW")
  .option("SEiso")
  .command("_VSCURRENT")
  .option("Hidden")
  .command("_ZOOM")
  .option("Extents")
  .command("_ZOOM")
  .type("0.8x")
  .enter()
  .moveTo(400, 300)
