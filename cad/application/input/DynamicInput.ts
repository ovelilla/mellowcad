import { Observable } from "../../shared/Observable"
import { Vec2 } from "../../geometry/Vec2"
import type { Vec3 } from "../../geometry/Vec3"
import { parseAngleDegrees, parseNumber } from "../../domain/units"
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
  /**
   * What the field asks when the drawing, not the catalog, words it: an
   * attribute's own prompt at INSERT. Shown as is, in place of `prompt`.
   */
  readonly label?: string
  readonly kind: DynamicFieldKind
  /**
   * The command line hands it what was typed with its spaces, where it trims
   * every other answer: TEXT's `Enter text:` keeps leading spaces (text/p155).
   */
  readonly verbatim?: boolean
  /**
   * A space ends the answer, as at a prompt AutoCAD asks with AllowSpaces off
   * (ATTDEF's tag, probe blocks/p313): what follows it answers the next
   * question, typed in the box or at the command line.
   */
  readonly endsAtSpace?: boolean
  /**
   * Space types a space at the command line too, where everywhere else it is
   * Enter: UCS's Save and Restore names (desktop ucs/d05, `AB CD` saved whole
   * though the trace says AllowSpaces false). The box's own text field takes
   * one anyway.
   */
  readonly takesSpaces?: boolean
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
  /**
   * Where a number typed in a lone coordinate field is measured from —
   * AutoCAD's direct distance, which the runtime gives as a pick there:
   * LASTPOINT, or a point (a window's opposite corner from its first, which
   * AutoCAD makes LASTPOINT while it asks); `"typed"` where {@link commitRaw}
   * reads the number itself (ARRAYRECT's unit cell). Omitted: from the
   * tool's anchor, else LASTPOINT, where the tool wants a snapped point.
   */
  readonly directDistance?: Vec3 | "lastPoint" | "typed"
  /**
   * The command line answers the prompt's point, not the box's first field:
   * a number typed there is direct distance from the tool's anchor, as at a
   * lone coordinate box. RECTANG's other corner, whose box holds the sides'
   * length and width (desktop rectang/d05) while the command line takes the
   * corner (rectang/p08, d03).
   */
  readonly commandLinePoint?: boolean
}

interface FieldState {
  /** Text the user has typed. Empty means "use the live value". */
  text: string
  /** Live value tracked from cursor movement, shown as a placeholder. */
  live: number | null
  /**
   * Whether `live` is the prompt's `<Default>` (a form's value) rather than a
   * reading of the cursor: only a default is what Enter accepts untyped.
   */
  isDefault: boolean
  /**
   * A live reading that is not a number (the angle field's `+Z` on the Z
   * guide): shown as the placeholder, and the field left out of the values.
   */
  liveText: string | null
}

/** A session with what was typed in it, kept while another command asks. */
export interface DynamicInputState {
  readonly session: DynamicInputSession | null
  readonly fieldStates: ReadonlyMap<string, Readonly<FieldState>>
  readonly activeFieldId: string | null
  readonly screenPos: Vec2 | null
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

  getLiveText(fieldId: string): string | null {
    return this.fieldStates.get(fieldId)?.liveText ?? null
  }

  /** Opens a new session, resetting all field buffers. */
  open(session: DynamicInputSession): void {
    this.session = session
    this.fieldStates = new Map(
      session.fields.map((f) => [
        f.id,
        { text: "", live: null, isDefault: false, liveText: null },
      ])
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

  /** The session as it stands, for {@link restore} once a transparent command is done. */
  save(): DynamicInputState {
    return {
      session: this.session,
      fieldStates: new Map(
        [...this.fieldStates].map(([id, state]) => [id, { ...state }])
      ),
      activeFieldId: this.activeFieldId,
      screenPos: this.screenPos,
    }
  }

  restore(state: DynamicInputState): void {
    this.session = state.session
    this.fieldStates = new Map(
      [...state.fieldStates].map(([id, field]) => [id, { ...field }])
    )
    this.activeFieldId = state.activeFieldId
    this.screenPos = state.screenPos
    this.emit()
  }

  /** Positions the floating input near the cursor (screen/CSS pixels). */
  setPosition(screen: Vec2): void {
    this.screenPos = screen
    this.emit()
  }

  /** A reading of the cursor: shown, and used for a field left untyped beside a typed one. */
  setLive(fieldId: string, value: number | null): void {
    this.setLiveValue(fieldId, value, false)
  }

  /**
   * The prompt's `<Default>`, shown like a reading: Enter with nothing typed
   * commits it (a form's values), where it would never commit a reading.
   */
  setDefault(fieldId: string, value: number): void {
    this.setLiveValue(fieldId, value, true)
  }

  private setLiveValue(
    fieldId: string,
    value: number | null,
    isDefault: boolean
  ): void {
    const fieldState = this.fieldStates.get(fieldId)
    if (!fieldState) return
    fieldState.live = value
    fieldState.isDefault = isDefault
    fieldState.liveText = null
    this.emit()
  }

  setLiveText(fieldId: string, text: string): void {
    const fieldState = this.fieldStates.get(fieldId)
    if (!fieldState) return
    fieldState.live = null
    fieldState.isDefault = false
    fieldState.liveText = text
    this.emit()
  }

  /**
   * What is typed, as the history writes it after the prompt it answers. A
   * length and an angle both typed read as the box would take them in one,
   * `100<45` — WHY: what AutoCAD writes for them is unverified.
   */
  typedAnswer(): string {
    const typed = (this.session?.fields ?? []).filter(
      (field) => this.getText(field.id).trim() !== ""
    )
    const polar =
      typed.length === 2 &&
      typed[0].kind !== "angle" &&
      typed[1].kind === "angle"
    return typed
      .map((field) => this.getText(field.id).trim())
      .join(polar ? "<" : ", ")
  }

  /** Whether anything is typed in any field: otherwise Enter is the prompt's. */
  hasTypedText(): boolean {
    for (const fieldState of this.fieldStates.values()) {
      if (fieldState.text.trim() !== "") return true
    }
    return false
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
   * caller can reject an incomplete commit. A field showing a live text with
   * nothing typed is left out: the tool reads it from the cursor. With nothing
   * typed at all only defaults resolve: Enter there is the prompt's, as at the
   * Command prompt, never a reading of where the cursor happens to be.
   */
  resolveValues(): Record<string, number> | null {
    if (!this.session) return null
    const anyTyped = this.hasTypedText()
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
      // Nor is a number typed for a point: the runtime reads it as a direct
      // distance, or the session's `commitRaw` as its own (ZOOM's factor).
      if (field.kind === "coordinate") return null
      const typed = fieldState.text.trim() !== ""
      if (!anyTyped && !fieldState.isDefault) return null
      if (!typed && fieldState.liveText !== null) continue
      const value = !typed
        ? fieldState.live
        : field.kind === "angle"
          ? parseAngleDegrees(fieldState.text)
          : parseNumber(fieldState.text)
      if (value === null || !Number.isFinite(value)) return null
      out[field.id] = value
    }
    return out
  }
}
