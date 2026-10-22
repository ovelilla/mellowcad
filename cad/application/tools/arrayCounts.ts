import { ToolContext } from "./Tool"

/**
 * The largest count the arrays' prompts take: AutoCAD asks every one of them
 * as a 16-bit integer (probe arrays/p279: `Requires an integer between 1 and
 * 32767, or option keyword.`; ARRAYRECT's and ARRAYPATH's counts are the same
 * integer prompt, p111, p331).
 */
export const MAX_ARRAY_COUNT = 32767

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

/** Whether a count being typed is one the prompt would take, for the preview. */
export function takesCount(value: number): boolean {
  return Number.isInteger(value) && value > 0 && value <= MAX_ARRAY_COUNT
}
