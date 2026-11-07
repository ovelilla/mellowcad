import {
  demo,
  type Bounds,
  type DemoLayer,
  type DemoOptions,
  type DemoScript,
} from "@mellowcad/engine"

/**
 * The exercises of the practice library (`/docs/exercises`), one file each:
 * the solution as the steps a person would take at AutoCAD, as a portable
 * script — global names with `_`, keywords by id — so the engine draws each
 * step and writes its history in every command language. The same steps make
 * the drawing an exercise opens with in the editor (`startingDrawing`).
 */

/** The layers an exercise may draw on, as a drawing template sets them up. */
export const LAYER_ROLES = [
  "outline",
  "centre",
  "hidden",
  "dimensions",
] as const

export type LayerRole = (typeof LAYER_ROLES)[number]

/** Each layer's name in the drawing: the page language's, for the drawing it opens with. */
export type LayerNames = Readonly<Record<LayerRole, string>>

/**
 * The names the figures draw with. A figure shows no layer's name, and its
 * history types none (a layer is made current from the Layer control), so
 * only the drawing a reader opens needs them in their language.
 */
export const FIGURE_LAYERS: LayerNames = {
  outline: "Outline",
  centre: "Centre lines",
  hidden: "Hidden lines",
  dimensions: "Dimensions",
}

/** How each layer looks: the colours and linetypes of a common drafting template. */
const LAYER_STYLES: Record<LayerRole, Omit<DemoLayer, "name">> = {
  outline: { lineweight: 0.5 },
  centre: { color: "#ff0000", linetype: "Center", lineweight: 0.25 },
  hidden: { color: "#ffff00", linetype: "Hidden", lineweight: 0.25 },
  dimensions: { color: "#00ffff", lineweight: 0.25 },
}

export interface ExerciseStep {
  /** The step's id: its anchor, and its `###` in the exercise's notes. */
  readonly id: string
  /** What the step does, after the steps before it. */
  readonly draw: (script: DemoScript, layers: LayerNames) => DemoScript
  /**
   * Its figure is the editor's last frame, as a solid's must be once the
   * view leaves the plan: a still frames the plan.
   */
  readonly live?: boolean
}

export interface Exercise {
  /** The layers it draws on, in the Layer control's order. */
  readonly layers: readonly LayerRole[]
  readonly steps: readonly ExerciseStep[]
  /** What the finished drawing frames: a dimension's text runs past its points. */
  readonly frame: Bounds
  /** The session's other settings, as the template sets them. */
  readonly options?: Pick<DemoOptions, "dimScale" | "polarAngle">
  /**
   * A 3D exercise's drawing: the profile it starts from, dimensioned, which
   * its steps turn into a solid. A 2D exercise's drawing is its last step.
   */
  readonly drawing?: (script: DemoScript, layers: LayerNames) => DemoScript
}

/** The size of an exercise's drawing at the top of its page, and of each step's. */
export const EXERCISE_FIGURE = { width: 640, height: 400, padding: 16 } as const
export const STEP_FIGURE = { width: 320, height: 200, padding: 12 } as const

/** The session up to its step `count` (all of them by default), on its template's layers. */
export function exerciseScript(
  exercise: Exercise,
  layers: LayerNames = FIGURE_LAYERS,
  count = exercise.steps.length,
  size: { width: number; height: number } = STEP_FIGURE
): DemoScript {
  const start = demo({
    width: size.width,
    height: size.height,
    ...exercise.options,
    layers: exercise.layers.map((role) => ({
      name: layers[role],
      ...LAYER_STYLES[role],
    })),
  })
  return exercise.steps
    .slice(0, count)
    .reduce((script, step) => step.draw(script, layers), start)
}

/** Where a step's actions begin in its session, for its history. */
export function stepStart(exercise: Exercise, index: number): number {
  return exerciseScript(exercise, FIGURE_LAYERS, index).actions.length
}

/** The space left between the finished drawing and where the reader starts theirs. */
const REFERENCE_GAP = 40

/**
 * How far the finished drawing is moved, left of the origin, in the drawing
 * an exercise opens with: the reader draws theirs from 0,0, as the solution
 * does, beside it.
 */
export function referenceShift(exercise: Exercise): number {
  return -(exercise.frame.max.x - exercise.frame.min.x + REFERENCE_GAP)
}

/**
 * The exercise's drawing, dimensioned: its last step, or a 3D exercise's
 * profile, in plan.
 */
export function drawingScript(
  exercise: Exercise,
  layers: LayerNames = FIGURE_LAYERS,
  size: { width: number; height: number } = EXERCISE_FIGURE
): DemoScript {
  if (!exercise.drawing)
    return exerciseScript(exercise, layers, exercise.steps.length, size)
  return exercise.drawing(exerciseScript(exercise, layers, 0, size), layers)
}

/**
 * The drawing an exercise opens with in the editor: the finished drawing,
 * moved left of the origin to be read and measured, its layers ready and the
 * outline's current, as a template leaves them.
 */
export function startingDrawing(
  exercise: Exercise,
  layers: LayerNames
): DemoScript {
  const { min, max } = exercise.frame
  const [width, height] = [max.x - min.x, max.y - min.y]
  // A crossing, right to left, well past the frame: it takes everything,
  // a dimension whose text runs past the frame too.
  return drawingScript(exercise, layers)
    .command("_MOVE")
    .click(max.x + width, max.y + height)
    .click(min.x - width, min.y - height)
    .enter()
    .type(`${referenceShift(exercise)},0`)
    .enter()
    .enter()
    .layer(layers.outline)
}

/**
 * What the editor frames as the exercise opens: the finished drawing and,
 * right of it, the room the reader's own takes.
 */
export function startingView(exercise: Exercise): Bounds {
  const { min, max } = exercise.frame
  return { min: { x: min.x + referenceShift(exercise), y: min.y }, max }
}

/**
 * The commands its solution runs, by global name, in the order it first runs
 * each: what the exercise practises, read from its script.
 */
export function exerciseCommands(exercise: Exercise): string[] {
  const names = exerciseScript(exercise)
    .actions.filter((action) => action.kind === "command")
    .map((action) => action.text.replace(/^_/, "").toUpperCase())
  return [...new Set(names)]
}
