import type { FigureSpec } from "../../figures"

import {
  absolute,
  angleOverride,
  polar,
  polarTracking,
  relative,
} from "./coordinates"
import { FLOOR_PLAN_STEPS, floorPlan } from "./floor-plan"
import { extrudeProfile } from "./solids"

const SESSION = { width: 320, height: 200, padding: 20 } as const

/** A floor plan's step: the plan as far as that step, framed as the whole one, and the step's history. */
const PLAN = {
  width: 640,
  height: 400,
  padding: 12,
  frame: { min: { x: -150, y: -150 }, max: { x: 860, y: 660 } },
} as const

const PLAN_STEPS = [
  "floorPlanWalls",
  "floorPlanInnerWall",
  "floorPlanOpenings",
  "floorPlanDoors",
  "floorPlanWindows",
  "floorPlanDimensions",
] as const

/**
 * The how-to guides' sessions (`/docs/floor-plan`, `/docs/coordinates`,
 * `/docs/2d-to-3d`); the 3D guide's other figures are its commands' own.
 */
export const GUIDE_SESSIONS: Record<
  string,
  {
    readonly figure: FigureSpec
    readonly from?: string
    readonly fromAction?: number
  }
> = {
  ...Object.fromEntries(
    FLOOR_PLAN_STEPS.map((_, index) => [
      PLAN_STEPS[index],
      {
        figure: { ...PLAN, script: floorPlan(index + 1) },
        fromAction: floorPlan(index).actions.length,
      },
    ])
  ),
  coordinatesAbsolute: {
    figure: { ...SESSION, script: absolute },
    from: "LINE",
  },
  coordinatesRelative: {
    figure: { ...SESSION, script: relative },
    from: "LINE",
  },
  coordinatesPolar: { figure: { ...SESSION, script: polar }, from: "LINE" },
  coordinatesAngle: {
    figure: { ...SESSION, script: angleOverride },
    from: "LINE",
  },
  coordinatesTracking: {
    figure: { ...SESSION, live: true, script: polarTracking },
    from: "LINE",
  },
  solidExtrude: {
    figure: { ...SESSION, live: true, script: extrudeProfile },
    from: "PLINE",
  },
}
