"use client"

import {
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
} from "react"
import type {
  CadEngine,
  DynamicInputFieldUi,
  DynamicInputUi,
} from "@mellowcad/engine"

import { useEngineSelector } from "./useEditorState"

type FieldElement = HTMLInputElement | HTMLTextAreaElement

/** What a field's `<input>` (or a `paragraphs` field's `<textarea>`) is spread with. */
interface DynamicInputFieldProps {
  /** Only on the active field: the one the box keeps focused. */
  readonly ref?: (element: FieldElement | null) => void
  readonly value: string
  readonly onFocus: (event: FocusEvent<FieldElement>) => void
  readonly onChange: (event: ChangeEvent<FieldElement>) => void
  readonly onKeyDown: (event: KeyboardEvent<FieldElement>) => void
  readonly autoComplete: "off"
  readonly spellCheck: false
}

/** Marks the box, which holds every field: focus in it is never taken back. */
const BOX = "data-dynamic-input"

/**
 * AutoCAD's dynamic input box, wired to the engine: the box it shows (`null`
 * when none), what its element is spread with, and each field's props. A
 * field's keys are the engine's (`dynamicInputKey`; the Mac's Command is
 * Ctrl there), the browser's action is prevented for each key it takes, and
 * after a Tab focus follows the field now active. After every render the
 * active field takes focus back where `engine.mayTakeFocus` allows, so a
 * value can be typed right after a point is placed.
 */
export function useDynamicInput(engine: CadEngine): {
  readonly dynamicInput: DynamicInputUi | null
  readonly box: { readonly "data-dynamic-input": "" }
  field(field: DynamicInputFieldUi): DynamicInputFieldProps
} {
  const dynamicInput = useEngineSelector(engine, (state) => state.dynamicInput)
  const active = useRef<FieldElement | null>(null)
  /** Set while focus is taken back after a render rather than by the user. */
  const refocusing = useRef(false)
  const holdActive = useCallback((element: FieldElement | null) => {
    active.current = element
  }, [])

  // After every render, not just on opening: the engine re-renders often while
  // drawing and the canvas takes focus on each press, so a one-shot focus
  // would be lost.
  useEffect(() => {
    const field = dynamicInput?.fields.find((f) => f.active)
    if (field && active.current)
      takeFocus(engine, active.current, field, refocusing)
  })

  const field = (field: DynamicInputFieldUi): DynamicInputFieldProps => {
    const paragraphs = field.kind === "paragraphs"
    return {
      ...(field.active && { ref: holdActive }),
      value: field.value,
      onFocus: (event) => {
        engine.setActiveDynamicField(field.id)
        const element = event.currentTarget
        if (paragraphs) {
          // An edit opens with the caret after the text, as a refocus after a
          // click on the drawing must leave it where it was.
          if (element.dataset.opened) return
          element.dataset.opened = "true"
          element.setSelectionRange(element.value.length, element.value.length)
        } else if (!refocusing.current) {
          // Selected, so a keystroke replaces the value and one Backspace
          // clears (unlocks) it, as in AutoCAD. A refocus after a render
          // places the caret itself.
          element.select()
        }
      },
      onChange: (event) =>
        engine.setDynamicInputText(event.target.value, field.id),
      onKeyDown: (event) => {
        const modifiers = {
          shiftKey: event.shiftKey,
          ctrlKey: event.ctrlKey || event.metaKey,
          altKey: event.altKey,
        }
        if (!engine.dynamicInputKey(field.id, event.key, modifiers)) return
        event.preventDefault()
        if (event.key === "Tab" && !paragraphs)
          followTab(engine, event.currentTarget, field.id)
      },
      autoComplete: "off",
      spellCheck: false,
    }
  }

  return { dynamicInput, box: { [BOX]: "" }, field }
}

/**
 * The active field takes focus back from the canvas or the body, never from
 * another of the box's fields (multi-field sessions: radius, angle…), and only
 * where the engine says the keyboard is its to take.
 */
export function takeFocus(
  engine: CadEngine,
  element: FieldElement,
  field: DynamicInputFieldUi,
  refocusing: { current: boolean }
): void {
  const from = element.ownerDocument.activeElement as HTMLElement | null
  if (element === from) return
  if (from?.closest(`[${BOX}]`)) return
  if (!engine.mayTakeFocus(from)) return
  refocusing.current = true
  element.focus()
  refocusing.current = false
  // Multi-line text is edited in place: reselecting it all on every refocus
  // would let the next keystroke wipe the paragraphs. A value typed on the
  // drawing before the box had focus goes on where it stopped.
  if (field.kind === "paragraphs") return
  if (field.kind !== "text" && element.value !== "") {
    element.setSelectionRange(element.value.length, element.value.length)
  } else {
    element.select()
  }
}

/**
 * A Tab to another field (Length and Angle): focus follows it here, since the
 * refocus never moves focus from one field to another.
 */
function followTab(engine: CadEngine, from: FieldElement, fieldId: string) {
  const fields = engine.getState().dynamicInput?.fields ?? []
  const next = fields.findIndex((f) => f.active)
  if (next === -1 || fields[next].id === fieldId) return
  const inputs = from.closest(`[${BOX}]`)?.querySelectorAll("input")
  inputs?.[next]?.focus()
  inputs?.[next]?.select()
}
