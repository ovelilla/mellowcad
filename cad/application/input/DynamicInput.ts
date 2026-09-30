import { Observable } from "../../shared/Observable"
import { Vec2 } from "../../geometry/Vec2"
import { parseNumber } from "../../domain/units"
import { isCoordinateExpression } from "./coordinateInput"
import type { ToolContext } from "../tools/Tool"
import type { PromptId } from "../../locales/types"

/**
 * Dynamic input is AutoCAD's floating "type a value near the cursor" mechanism.
 * It is deliberately part of the engine's tool system rather than a React
 * widget: a tool opens a *session* describing one or more typed fields (a
 * distance today; radius, angle, coordinates or offsets tomorrow) and provides
 * a `commit` callback. React merely renders whatever fields the session
 * exposes and forwards keystrokes back through the engine.
 *
 * This keeps the semantics (what a value means, how it is applied) with the
 * tool, and makes the whole feature reusable for any future measurement input.
 */

export type DynamicFieldKind =
  | "distance"
  | "length"
  | "angle"
  | "number"
  /** A whole point typed as an AutoCAD coordinate (e.g. `@30,0`, `100<45`). */
  | "coordinate"
  /**
   * Free text — the content of an annotation. Never resolves to a number, so a
   * session using one is committed through {@link DynamicInputSession.commitRaw}.
   */
  | "text"
  /** Free text over several lines (MTEXT): Enter breaks a line, Ctrl+Enter commits. */
  | "paragraphs"

/** Whether a field holds content rather than a value or a keyword. */
export function isContentField(kind: DynamicFieldKind): boolean {
  return kind === "text" || kind === "paragraphs"
}
/** Static description of one input field, provided by the tool. */
export interface DynamicField {
  readonly id: string
  /**
   * What the field asks, by its id in the command catalog. A coordinate box
   * that asks nothing of its own leaves it out.
   */
  readonly prompt?: PromptId
  readonly kind: DynamicFieldKind
}

/**
 * A tool-owned input session. `commit` receives the resolved numeric values
 * (keyed by field id) and the tool context, and performs the actual edit
 * (through a command, like any other document change).
 */
export interface DynamicInputSession {
  readonly fields: DynamicField[]
  commit(values: Record<string, number>, ctx: ToolContext): void
  /**
   * Optional fallback used when the typed text cannot resolve to plain numbers
   * — e.g. a coordinate expression like `@30,0` that produces a whole point
   * from a single field. Returns whether it handled and committed the input.
   * When omitted, only the numeric {@link commit} path is available.
   */
  commitRaw?(ctx: ToolContext): boolean
}

interface FieldState {
  /** Text the user has typed. Empty means "use the live value". */
  text: string
  /** Live value tracked from cursor movement, shown as a placeholder. */
  live: number | null
}

/**
 * Holds the state of the current dynamic-input session. Pure state + behaviour;
 * it has no knowledge of the DOM. The runtime formats this into a UI snapshot
 * (applying document units/precision) for React to render.
 */
export class DynamicInputController extends Observable {
  private session: DynamicInputSession | null = null
  private fieldStates = new Map<string, FieldState>()
  private activeFieldId: string | null = null
  private screenPos: Vec2 | null = null

  isOpen(): boolean {
    return this.session !== null
  }

  getSession(): DynamicInputSession | null {
    return this.session
  }

  getScreen(): Vec2 | null {
    return this.screenPos
  }

  getActiveFieldId(): string | null {
    return this.activeFieldId
  }

  getText(fieldId: string): string {
    return this.fieldStates.get(fieldId)?.text ?? ""
  }

  getLive(fieldId: string): number | null {
    return this.fieldStates.get(fieldId)?.live ?? null
  }

  /** Opens a new session, resetting all field buffers. */
  open(session: DynamicInputSession): void {
    this.session = session
    this.fieldStates = new Map(
      session.fields.map((f) => [f.id, { text: "", live: null }])
    )
    this.activeFieldId = session.fields[0]?.id ?? null
    this.emit()
  }

  close(): void {
    if (!this.session) return
    this.session = null
    this.fieldStates.clear()
    this.activeFieldId = null
    this.screenPos = null
    this.emit()
  }

  /** Positions the floating input near the cursor (screen/CSS pixels). */
  setPosition(screen: Vec2): void {
    this.screenPos = screen
    this.emit()
  }

  setLive(fieldId: string, value: number | null): void {
    const fieldState = this.fieldStates.get(fieldId)
    if (!fieldState) return
    fieldState.live = value
    this.emit()
  }

  setText(fieldId: string, text: string): void {
    const fieldState = this.fieldStates.get(fieldId)
    if (!fieldState) return
    fieldState.text = text
    this.emit()
  }

  setActiveField(fieldId: string): void {
    if (!this.fieldStates.has(fieldId) || this.activeFieldId === fieldId) return
    this.activeFieldId = fieldId
    this.emit()
  }

  /** Clears typed text (keeps the session open for the next value). */
  clearTexts(): void {
    for (const fieldState of this.fieldStates.values()) fieldState.text = ""
    this.emit()
  }

  /**
   * Resolves every field to a number: typed text wins, otherwise the live
   * value is used. Returns `null` if any field cannot be resolved, so the
   * caller can reject an incomplete commit.
   */
  resolveValues(): Record<string, number> | null {
    if (!this.session) return null
    const out: Record<string, number> = {}
    for (const field of this.session.fields) {
      const fieldState = this.fieldStates.get(field.id)
      if (!fieldState) return null
      // A free-text field holds content, not a value: even "5" must reach the
      // session's `commitRaw` verbatim rather than being read as a number.
      if (isContentField(field.kind)) return null
      // A coordinate expression (e.g. `@30,0` or `50,100`) is not a plain
      // number — the comma separates X and Y. Fail the numeric resolution so
      // the session's `commitRaw` handler interprets the whole point instead.
      if (isCoordinateExpression(fieldState.text)) return null
      const value =
        fieldState.text.trim() !== ""
          ? parseNumber(fieldState.text)
          : fieldState.live
      if (value === null || !Number.isFinite(value)) return null
      out[field.id] = value
    }
    return out
  }
}
