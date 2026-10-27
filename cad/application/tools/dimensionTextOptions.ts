import { Vec2 } from "../../geometry/Vec2"
import { normalizeDegrees } from "../../geometry/primitives"
import { DynamicInputSession } from "../input/DynamicInput"
import { ToolContext } from "./Tool"

/**
 * The Text and Angle keywords every dimension command offers, in one place so
 * each of them asks with the same words. AutoCAD's third keyword, **Mtext**,
 * has no counterpart here: it edits the text in the multiline editor, and a
 * dimension's text here is a single line, so Text covers the same need.
 */

/**
 * Text: "Customizes the dimension text at the Command prompt. The generated
 * dimension measurement is displayed within angle brackets." Enter with nothing
 * typed clears the override and takes the generated measurement back, a second
 * Text's too (probe dimensions/p164), so the box starts empty.
 */
export function openDimensionTextInput(
  ctx: ToolContext,
  at: Vec2 | null,
  apply: (text: string | undefined, ctx: ToolContext) => void
): void {
  const session: DynamicInputSession = {
    fields: [{ id: "value", prompt: "dimensionText", kind: "text" }],
    commit: () => {},
    commitRaw: (commitCtx) => {
      const typed = commitCtx.dynamicInput.getText("value")
      apply(typed.trim().length === 0 ? undefined : typed, commitCtx)
      return true
    },
  }
  ctx.dynamicInput.open(session)
  ctx.dynamicInput.setPosition(at ?? { x: 0, y: 0 })
}

/**
 * Angle: "Changes the angle of the dimension text." 0 is no angle, the text
 * left in its own direction (a vertical dimension's stays vertical, probe
 * dimensions/p163), and so is Enter before any angle is set (p132); after one,
 * Enter keeps it (p143).
 */
export function openDimensionTextAngleInput(
  ctx: ToolContext,
  at: Vec2 | null,
  current: number | undefined,
  apply: (radians: number | undefined, ctx: ToolContext) => void
): void {
  const session: DynamicInputSession = {
    fields: [
      { id: "angle", prompt: "specifyAngleOfDimensionText", kind: "angle" },
    ],
    commit: (values, commitCtx) =>
      apply(
        normalizeDegrees(values.angle) === 0
          ? undefined
          : (values.angle * Math.PI) / 180,
        commitCtx
      ),
  }
  ctx.dynamicInput.open(session)
  ctx.dynamicInput.setDefault(
    "angle",
    normalizeDegrees(((current ?? 0) * 180) / Math.PI)
  )
  ctx.dynamicInput.setPosition(at ?? { x: 0, y: 0 })
}
