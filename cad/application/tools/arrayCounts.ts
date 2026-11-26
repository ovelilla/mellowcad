import { MAX_ARRAY_COUNT } from "../../domain/arrays"
import { QuestionInput, ToolContext } from "./Tool"

export { MAX_ARRAY_COUNT }

/**
 * WHY the preview draws no more items than this, where AutoCAD's jig draws
 * them all: a grid of 32767 × 32767 cells redrawn on every pointer move would
 * hang the page. The commit still makes every item.
 */
export const MAX_PREVIEW_ITEMS = 1000

/**
 * Refuses a count typed at an array's prompt in the console's words, and says
 * whether it did: 0 or less (p212), a fraction (p113), over 32767 (p279).
 */
export function refusesCount(value: number, ctx: ToolContext): boolean {
  if (value <= 0) {
    ctx.report(ctx.text.message("positiveNonzero"), "error")
  } else if (!Number.isInteger(value)) {
    ctx.report(ctx.text.message("requiresPositiveInteger"), "error")
  } else if (value > MAX_ARRAY_COUNT) {
    ctx.report(
      ctx.text.message("requiresIntegerBetweenOrKeyword", {
        min: 1,
        max: MAX_ARRAY_COUNT,
      }),
      "error"
    )
  } else {
    return false
  }
  return true
}

/**
 * Refuses a text a contextual tab's field took that is no number, in the
 * words its prompt refuses it with (`input`, that prompt's `takes()`): the
 * console's for a count, a distance or an angle typed as `FOO`.
 */
export function refuseText(
  input: QuestionInput | null,
  ctx: ToolContext
): void {
  if (input === null || typeof input !== "object") return
  const ids =
    typeof input.refusal === "string" ? [input.refusal] : input.refusal
  for (const id of ids) ctx.report(ctx.text.message(id, input.values), "error")
}

/** Whether a count being typed is one the prompt would take, for the preview. */
export function takesCount(value: number): boolean {
  return Number.isInteger(value) && value > 0 && value <= MAX_ARRAY_COUNT
}
