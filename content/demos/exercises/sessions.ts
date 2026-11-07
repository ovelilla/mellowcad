import type { FigureSpec } from "../../figures"

import { EXERCISES, type ExerciseSlug } from "."
import {
  EXERCISE_FIGURE,
  FIGURE_LAYERS,
  STEP_FIGURE,
  drawingScript,
  exerciseScript,
  stepStart,
} from "./exercise"

/** A session of an exercise's page, and from which action on its history is the step's. */
export interface ExerciseSession {
  readonly figure: FigureSpec
  readonly fromAction?: number
}

/** The session of an exercise's drawing, of its finished solid (`model`), or of one step. */
export function exerciseSessionName(
  slug: ExerciseSlug,
  part?: string
): `exercises/${string}` {
  return part ? `exercises/${slug}/${part}` : `exercises/${slug}`
}

/**
 * Every exercise's sessions: its drawing, dimensioned (a 3D one's profile);
 * a 3D one's solid as the editor shows it last; and each step, the drawing
 * as far as that step, with that step's history alone.
 */
export const EXERCISE_SESSIONS = Object.fromEntries(
  (
    Object.entries(EXERCISES) as [
      ExerciseSlug,
      (typeof EXERCISES)[ExerciseSlug],
    ][]
  ).flatMap(
    ([slug, { exercise }]): [`exercises/${string}`, ExerciseSession][] => [
      [
        exerciseSessionName(slug),
        {
          figure: {
            ...EXERCISE_FIGURE,
            frame: exercise.frame,
            script: drawingScript(exercise),
          },
        },
      ],
      ...(exercise.drawing
        ? [
            [
              exerciseSessionName(slug, "model"),
              {
                figure: {
                  ...EXERCISE_FIGURE,
                  live: true,
                  script: exerciseScript(
                    exercise,
                    FIGURE_LAYERS,
                    exercise.steps.length,
                    EXERCISE_FIGURE
                  ),
                },
              },
            ] as [`exercises/${string}`, ExerciseSession],
          ]
        : []),
      ...exercise.steps.map(
        (step, index): [`exercises/${string}`, ExerciseSession] => [
          exerciseSessionName(slug, step.id),
          {
            figure: {
              ...STEP_FIGURE,
              ...(step.live ? { live: true } : { frame: exercise.frame }),
              script: exerciseScript(exercise, FIGURE_LAYERS, index + 1),
            },
            fromAction: stepStart(exercise, index),
          },
        ]
      ),
    ]
  )
) as Record<`exercises/${string}`, ExerciseSession>
