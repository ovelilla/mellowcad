import { bearingBlock } from "./bearing-block"
import { gasket } from "./gasket"
import { flange } from "./flange"
import { isometricBlock } from "./isometric-block"
import { lBracket } from "./l-bracket"
import { link } from "./link"
import { mountingPlate } from "./mounting-plate"
import { plotOfLand } from "./plot-of-land"
import { pulley } from "./pulley"
import { roundTable } from "./round-table"
import { shaft } from "./shaft"
import { stairs } from "./stairs"
import type { Exercise } from "./exercise"

export const LEVELS = ["beginner", "intermediate", "advanced"] as const
export type Level = (typeof LEVELS)[number]

export const DISCIPLINES = ["mechanical", "architecture", "civil"] as const
export type Discipline = (typeof DISCIPLINES)[number]

/** How it is drawn: in plan, in isometric with 2D lines, or as 3D solids. */
export const SPACES = ["2d", "isometric", "3d"] as const
export type Space = (typeof SPACES)[number]

export interface ExerciseEntry {
  readonly exercise: Exercise
  readonly level: Level
  readonly discipline: Discipline
  readonly space: Space
}

/**
 * The practice library, by slug (`/docs/exercises/gasket`), in the order the
 * index lists it: by level, 2D before 3D. Each has its notes in
 * `content/exercises/`, its words in every language.
 */
export const EXERCISES = {
  gasket: {
    exercise: gasket,
    level: "beginner",
    discipline: "mechanical",
    space: "2d",
  },
  "l-bracket": {
    exercise: lBracket,
    level: "beginner",
    discipline: "mechanical",
    space: "2d",
  },
  stairs: {
    exercise: stairs,
    level: "beginner",
    discipline: "architecture",
    space: "2d",
  },
  "mounting-plate": {
    exercise: mountingPlate,
    level: "beginner",
    discipline: "mechanical",
    space: "3d",
  },
  flange: {
    exercise: flange,
    level: "intermediate",
    discipline: "mechanical",
    space: "2d",
  },
  "round-table": {
    exercise: roundTable,
    level: "intermediate",
    discipline: "architecture",
    space: "2d",
  },
  "plot-of-land": {
    exercise: plotOfLand,
    level: "intermediate",
    discipline: "civil",
    space: "2d",
  },
  shaft: {
    exercise: shaft,
    level: "intermediate",
    discipline: "mechanical",
    space: "2d",
  },
  "isometric-block": {
    exercise: isometricBlock,
    level: "intermediate",
    discipline: "mechanical",
    space: "isometric",
  },
  pulley: {
    exercise: pulley,
    level: "intermediate",
    discipline: "mechanical",
    space: "3d",
  },
  link: {
    exercise: link,
    level: "advanced",
    discipline: "mechanical",
    space: "2d",
  },
  "bearing-block": {
    exercise: bearingBlock,
    level: "advanced",
    discipline: "mechanical",
    space: "3d",
  },
} satisfies Record<string, ExerciseEntry>

export type ExerciseSlug = keyof typeof EXERCISES

export function isExerciseSlug(slug: string): slug is ExerciseSlug {
  return Object.hasOwn(EXERCISES, slug)
}
