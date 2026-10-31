import { Vec3 } from "../geometry/Vec3"
import { type EngineText, type PromptSegment, promptString } from "./EngineText"
import type { CommandPrompt } from "./runtimeCommands"

/** A coordinate a point filter takes, in the UCS. */
export type FilterAxis = "x" | "y" | "z"

/**
 * The point filters AutoCAD's Point Filters menu lists, in its order, with a
 * separator before `.XY` (acad.cuix's `ID_MnPointFi`).
 */
export const POINT_FILTERS = [".X", ".Y", ".Z", ".XY", ".XZ", ".YZ"] as const

/** A point filter as the Point Filters menu types it. */
export type PointFilterName = (typeof POINT_FILTERS)[number]

/**
 * A point being built by AutoCAD's point filters (`.X`, `.XY`…): what each
 * point given has taken so far, and which axes the next one gives.
 */
export interface PointFilter {
  /** The axes the prompt takes: X, Y and Z, or X and Y at a 2D point's. */
  readonly axes: readonly FilterAxis[]
  readonly taken: Readonly<Partial<Record<FilterAxis, number>>>
  /** A filter's axes until its `of` is answered; null while `(need …)` asks the rest. */
  readonly of: readonly FilterAxis[] | null
  /** The Z a 2D prompt's point keeps, the last point's given. */
  readonly z: number | null
}

/**
 * The axes a point filter typed at a point prompt names — a dot and X, Y and
 * Z, each once, in any order and case (`.yx` is `.XY`, `.XYZ` the whole
 * point: probes filters/f13–f16) —, or null; a lone dot is no filter (f44).
 */
export function filterAxesNamed(text: string): FilterAxis[] | null {
  const match = /^\.([xyz]{1,3})$/i.exec(text.trim())
  if (match === null) return null
  const axes = [...match[1].toLowerCase()] as FilterAxis[]
  return new Set(axes).size === axes.length ? axes : null
}

/** A filter typed at a prompt taking `axes`, or at `(need …)`, replacing the last one typed (f57–f59). */
export function withFilter(
  filter: PointFilter | null,
  axes: readonly FilterAxis[],
  of: readonly FilterAxis[]
): PointFilter {
  return { axes, taken: {}, z: null, ...filter, of }
}

/** The axes `(need …)` asks for, in X, Y, Z order. */
export function missingAxes(filter: PointFilter): FilterAxis[] {
  return filter.axes.filter((axis) => filter.taken[axis] === undefined)
}

/**
 * `point` given to the filter: at `of` its filter's axes, a coordinate taken
 * twice the last one's (f57), at `(need …)` the axes still missing.
 */
export function takePoint(filter: PointFilter, point: Vec3): PointFilter {
  const taken = { ...filter.taken }
  for (const axis of filter.of ?? missingAxes(filter)) taken[axis] = point[axis]
  return { ...filter, taken, of: null, z: point.z }
}

/** A number at a `(need …)` asking one axis, which is that coordinate (f02, f28, f49). */
export function takeValue(filter: PointFilter, value: number): PointFilter {
  const [axis] = missingAxes(filter)
  return { ...filter, taken: { ...filter.taken, [axis]: value }, of: null }
}

/** The point the filter has built once it lacks no coordinate, else null. */
export function filteredPoint(filter: PointFilter): Vec3 | null {
  if (filter.of !== null || missingAxes(filter).length > 0) return null
  const { x, y, z } = filter.taken
  return { x: x!, y: y!, z: z ?? filter.z ?? 0 }
}

/**
 * `prompt`, the question the filter was typed at, as the filter asks it:
 * `of`, with no colon (table 26329), or `(need YZ):` (26266), under the
 * command's name. The tooltip writes the question before it, `Specify next
 * point or of`, its keywords still on offer (desktop filters/d01, d02); the
 * history writes `of`'s answer on the line the filter was typed on (`echo`),
 * as the Point Filters menu's `.XY ` does: `Specify first point: .XY of
 * 1,2` (d04).
 */
export function filterPrompt(
  prompt: CommandPrompt,
  filter: PointFilter,
  echo: PromptSegment[] | null,
  text: EngineText,
  transparent: boolean
): CommandPrompt {
  const of = filter.of !== null
  const asked = of
    ? text.prompt("pointFilterOf")
    : promptString(
        text.composePrompt(
          text.prompt("pointFilterNeed", {
            axes: missingAxes(filter).join("").toUpperCase(),
          }),
          []
        )
      )
  const question = transparent ? text.transparentPrompt(asked) : asked
  const line = (head: string) => [{ text: head, keywords: false }]
  return {
    command: prompt.command,
    segments: line(
      prompt.command === null
        ? question
        : text.commandQuestion(prompt.command, question)
    ),
    echo: of ? echo : line(question),
    answerForm: "spaced",
    dynamic: prompt.dynamic === null ? asked : `${prompt.dynamic} ${asked}`,
  }
}
