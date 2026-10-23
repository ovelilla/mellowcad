import type { Vec2 } from "../../geometry/Vec2"
import type { PromptId } from "../../locales/types"
import type { ToolContext } from "./Tool"

/** The box of a prompt asking a value that is also given by a word. */
export interface ValueWordPrompt {
  readonly field: string
  readonly prompt: PromptId
  /** What the box shows with nothing typed: the current value. */
  readonly shown: string
  readonly at: Vec2 | null
}

/**
 * Opens the box of an AutoCAD integer or real prompt that takes words too
 * (-COLOR's colour, -LWEIGHT's lineweight): a `"number"` field, never a
 * `"text"` one, so the runtime reads its keywords and runs a transparent
 * command typed there as at any value prompt (`'ZOOM`, properties/p134).
 * `answer` gets what is typed, number or word, and the empty text of Enter;
 * the tool's words are its hidden options, which reach `invokeOption`.
 */
export function askValueOrWord(
  ctx: ToolContext,
  ask: ValueWordPrompt,
  answer: (typed: string, ctx: ToolContext) => void
): void {
  const take = (commitCtx: ToolContext) => {
    answer(commitCtx.dynamicInput.getText(ask.field).trim(), commitCtx)
    return true
  }
  ctx.dynamicInput.open({
    fields: [{ id: ask.field, prompt: ask.prompt, kind: "number" }],
    commit: (_values, commitCtx) => void take(commitCtx),
    commitRaw: take,
  })
  ctx.dynamicInput.setLiveText(ask.field, ask.shown)
  ctx.dynamicInput.setPosition(ask.at ?? { x: 0, y: 0 })
  ctx.requestRender()
}
