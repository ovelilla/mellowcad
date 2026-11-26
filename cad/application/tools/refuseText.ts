import { QuestionInput, ToolContext } from "./Tool"

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
