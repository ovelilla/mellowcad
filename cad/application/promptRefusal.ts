import type { EngineText } from "./EngineText"
import { type DynamicInputSession, isContentField } from "./input/DynamicInput"
import type { PromptId } from "../locales/types"
import type { QuestionInput, Tool } from "./tools/Tool"

/** What the running command's question is, as {@link promptRefusal} reads it. */
export interface AskedQuestion {
  readonly tool: Tool
  readonly prompt: PromptId | null
  readonly session: DynamicInputSession | null
  /** The keywords the prompt lists, in the command language. */
  readonly keywords: readonly string[]
  /** Whether the question measures from a point already given. */
  readonly hasBase: boolean
}

/**
 * The lines AutoCAD answers with when what is typed at a prompt is neither
 * one of its keywords nor what it asks: never a command, which only the
 * Command prompt runs, but each input function's own refusal, after which the
 * prompt asks again. Null for a question that takes text as it comes.
 */
export function promptRefusal(
  asked: AskedQuestion,
  text: EngineText
): string[] | null {
  const input = questionInput(asked)
  if (input === null) return null
  const keyword = asked.keywords.length > 0
  if (typeof input === "object") {
    const ids =
      typeof input.refusal === "string" ? [input.refusal] : input.refusal
    return ids.map((id) => text.message(id, input.values))
  }
  switch (input) {
    case "point":
      return [text.message(keyword ? "pointOrKeywordRequired" : "invalidPoint")]
    case "point2d":
      return [
        text.message(keyword ? "point2dOrKeywordRequired" : "invalidPoint2d"),
      ]
    case "distance":
    case "angle":
      return [
        text.message(
          input === "distance" ? "requiresDistance" : "requiresAngle",
          {
            points: asked.hasBase ? "second" : "two",
            keyword: keyword ? "yes" : "no",
          }
        ),
      ]
    case "number":
    case "integer":
      return [
        text.message(
          input === "number" ? "requiresNumber" : "requiresInteger",
          {
            keyword: keyword ? "yes" : "no",
          }
        ),
      ]
    case "keyword":
      return [text.message("invalidOptionKeyword")]
    case "objects":
    case "wholeObjects":
    case "crossingObjects":
    case "oneObject":
    case "singleSet":
    case "pathCurve":
      return [
        text.message("invalidSelection"),
        text.message("expectsPointOr", {
          keywords: text.message("selectionModes", { set: input }),
        }),
      ]
    case "objectOrLast":
      return [
        text.message("invalidSelection"),
        text.message("expectsPointOr", {
          keywords: [text.message("lastKeyword"), ...asked.keywords].join("/"),
        }),
      ]
    case "singleObject":
      return [
        text.message("invalidSelection"),
        text.message("expectsSingleObject"),
      ]
    case "object":
      // WHY every keyword: AutoCAD 2023 leaves the prompt's last one out of
      // this list (`[Exit/Undo]` expects `Exit`), an off-by-one, not a rule.
      return keyword
        ? [
            text.message("invalidSelection"),
            text.message("expectsPointOr", {
              keywords: asked.keywords.join("/"),
            }),
          ]
        : [text.message("invalidSelection")]
  }
}

/** The input function behind the running command's question, as {@link promptRefusal} reads it. */
export function questionInput(
  asked: Pick<AskedQuestion, "tool" | "prompt" | "session">
): QuestionInput | null {
  const declared = asked.tool.takes?.() ?? null
  if (declared !== null) return declared
  if (asked.prompt === "selectObjects" || asked.prompt === "removeObjects") {
    return "objects"
  }
  const fields = asked.session?.fields ?? []
  if (fields.some((field) => isContentField(field.kind))) return null
  const kinds = new Set(fields.map((field) => field.kind))
  const length = kinds.has("distance") || kinds.has("length")
  if (kinds.has("coordinate") || (length && kinds.has("angle"))) return "point"
  if (length) return "distance"
  if (kinds.has("angle")) return "angle"
  if (kinds.has("number")) return "number"
  return (asked.tool.wantsSnap?.() ?? true) ? "point" : "keyword"
}
