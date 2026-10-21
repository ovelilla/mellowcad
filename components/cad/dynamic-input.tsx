"use client"

import { useEffect, useRef } from "react"
import { Lock } from "lucide-react"
import { CadEngine } from "@/cad"
import { useEngineSelector, type EditorState } from "@/hooks/useCadEngine"

/**
 * Floating dynamic-input box, AutoCAD-style. This component is intentionally
 * "dumb": it renders whatever fields the engine's current input session exposes
 * and forwards every interaction back to the engine. All meaning (units,
 * parsing, what a value does) lives in the engine/tool system, so the same UI
 * works for distances today and radii, angles or coordinates later.
 */
export function DynamicInput({
  engine,
  state,
  lockedLabel,
}: {
  engine: CadEngine
  state: EditorState
  /** `Editor.DynamicInput.locked`: what the padlock says to a screen reader. */
  lockedLabel: string
}) {
  const di = useEngineSelector(engine, (s) => s.dynamicInput)
  const activeFieldId = di?.fields.find((f) => f.active)?.id ?? null
  const inputRef = useRef<HTMLInputElement>(null)
  const areaRef = useRef<HTMLTextAreaElement>(null)
  /** Set while focus is taken back after a render rather than by the user. */
  const refocusing = useRef(false)

  // Keep the active field focused so the user can type immediately after
  // placing a point. This runs after every render (not just on open) because
  // the engine re-renders frequently while drawing, and the canvas reclaims
  // focus on pointer interactions; a one-shot focus would be lost. We only
  // steal focus back from the canvas/body, never from another dynamic field,
  // so multi-field sessions (radius, angle, ...) still work — and only where
  // the engine says the keyboard is its to take, which an engine embedded in
  // a page limits to its own canvas.
  useEffect(() => {
    if (!activeFieldId) return
    const el = inputRef.current ?? areaRef.current
    if (!el || el === document.activeElement) return
    const ae = document.activeElement as HTMLElement | null
    if (ae?.closest("[data-dynamic-input]")) return
    if (!engine.mayTakeFocus(ae)) return
    refocusing.current = true
    el.focus()
    refocusing.current = false
    // Multi-line text is edited in place: reselecting it all on every refocus
    // would let the next keystroke wipe the paragraphs. A value typed on the
    // drawing before the box had focus goes on where it stopped.
    if (el instanceof HTMLTextAreaElement) return
    const field = di?.fields.find((f) => f.active)
    if (field && field.kind !== "text" && el.value !== "") {
      el.setSelectionRange(el.value.length, el.value.length)
    } else {
      el.select()
    }
  })

  if (!di) return null

  return (
    <div
      data-dynamic-input=""
      dir="ltr"
      lang={state.commandLine.lang}
      className="pointer-events-none absolute z-[5] flex flex-wrap gap-1"
      style={{ left: di.screen.x + 16, top: di.screen.y + 20 + di.clearance }}
    >
      {/* The dynamic prompt: the question alone, its keywords in the chips. */}
      {di.prompt !== null && (
        <div className="flex basis-full">
          <span className="rounded-md border border-border/60 bg-card/95 px-2 py-1 text-muted-foreground shadow-lg backdrop-blur">
            {di.prompt}
          </span>
        </div>
      )}
      {di.fields.map((field) => {
        // A field with typed text is hard-locked: it drives the geometry and
        // the cursor can no longer change it (clear the text to unlock). Show
        // AutoCAD's padlock so that state is visible and the unlock is
        // discoverable. A free-text field locks nothing — it *is* content.
        const content = field.kind === "text" || field.kind === "paragraphs"
        const locked = !content && field.value.trim().length > 0
        return (
          <label
            key={field.id}
            className={`flex gap-1 rounded-md border px-2 py-1 shadow-lg backdrop-blur ${
              field.kind === "paragraphs" ? "items-start" : "items-center"
            } ${
              locked
                ? "border-amber-400/80 bg-[color-mix(in_oklab,var(--card),black_10%)]/95"
                : "border-sky-400/60 bg-card/95"
            }`}
          >
            <span className="text-muted-foreground">{field.label}</span>
            {field.kind === "paragraphs" ? (
              <textarea
                ref={field.active ? areaRef : undefined}
                value={field.value}
                rows={paragraphRows(field.value)}
                autoComplete="off"
                spellCheck={false}
                onFocus={(e) => {
                  engine.setActiveDynamicField(field.id)
                  // An edit opens with the caret after the text, as a refocus
                  // after a click on the drawing must leave it where it was.
                  const area = e.currentTarget
                  if (area.dataset.opened) return
                  area.dataset.opened = "true"
                  area.setSelectionRange(area.value.length, area.value.length)
                }}
                onChange={(e) =>
                  engine.setDynamicInputText(e.target.value, field.id)
                }
                onKeyDown={(e) => {
                  // Enter breaks a paragraph, as in AutoCAD's editor; Ctrl+Enter
                  // closes it and keeps the text.
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault()
                    engine.commitDynamicInput()
                  } else if (e.key === "Escape") {
                    e.preventDefault()
                    engine.cancelDynamicInput()
                  }
                }}
                className="field-sizing-content max-h-48 w-72 resize-none bg-transparent font-mono text-foreground outline-none"
              />
            ) : (
              <input
                ref={field.active ? inputRef : undefined}
                value={field.value}
                placeholder={field.placeholder}
                inputMode={field.kind === "text" ? "text" : "decimal"}
                autoComplete="off"
                spellCheck={false}
                onFocus={(e) => {
                  engine.setActiveDynamicField(field.id)
                  // Select the contents so a keystroke replaces the value and a
                  // single Backspace clears (unlocks) it, like AutoCAD. A
                  // refocus after a render places the caret itself.
                  if (!refocusing.current) e.currentTarget.select()
                }}
                onChange={(e) =>
                  engine.setDynamicInputText(e.target.value, field.id)
                }
                onKeyDown={(e) => {
                  const value = field.kind !== "text"
                  if (
                    !e.ctrlKey &&
                    !e.metaKey &&
                    !e.altKey &&
                    engine.dynamicOptionKey(e.key)
                  ) {
                    // The Down arrow's option list takes its own keys first.
                    e.preventDefault()
                  } else if (e.key === "Enter" || (e.key === " " && value)) {
                    // Space is Enter in a value box, as at AutoCAD's prompt.
                    e.preventDefault()
                    engine.commitDynamicInput()
                  } else if (
                    value &&
                    field.value === "" &&
                    (e.ctrlKey || e.metaKey) &&
                    !e.shiftKey &&
                    e.key.toLowerCase() === "z"
                  ) {
                    // Ctrl+Z with nothing typed is the drawing's `_u`, typed
                    // at the prompt, rather than the box's own.
                    e.preventDefault()
                    engine.runUndoMacro()
                  } else if (e.key === "Escape") {
                    e.preventDefault()
                    engine.cancelDynamicInput()
                  } else if (
                    e.key === "Tab" &&
                    !e.shiftKey &&
                    field.value === "" &&
                    engine.cycleSnap()
                  ) {
                    // While an object snap is shown and nothing is typed, Tab
                    // cycles the snaps under the cursor, as in AutoCAD.
                    e.preventDefault()
                  } else if (
                    e.key === "Tab" &&
                    !e.shiftKey &&
                    field.kind === "coordinate" &&
                    field.value.trim() !== "" &&
                    !/[,<]/.test(field.value)
                  ) {
                    // The first point's X, then Tab, then its Y: "Tab can
                    // replace the comma".
                    e.preventDefault()
                    engine.setDynamicInputText(`${field.value},`, field.id)
                  } else if (e.key === "Tab" && di.fields.length > 1) {
                    // Cycle between fields (e.g. Length <-> Angle), AutoCAD-style.
                    // Move DOM focus directly so the focus effect's "already on a
                    // dynamic field" guard doesn't fight the switch.
                    e.preventDefault()
                    const idx = di.fields.findIndex((f) => f.id === field.id)
                    const step = e.shiftKey ? -1 : 1
                    const nextIdx =
                      (idx + step + di.fields.length) % di.fields.length
                    const next = di.fields[nextIdx]
                    engine.setActiveDynamicField(next.id)
                    const container = e.currentTarget.closest(
                      "[data-dynamic-input]"
                    )
                    const inputs = container?.querySelectorAll("input")
                    const nextInput = inputs?.[nextIdx] as
                      HTMLInputElement | undefined
                    nextInput?.focus()
                    nextInput?.select()
                  }
                }}
                className={`bg-transparent font-mono text-foreground outline-none placeholder:text-faint-foreground ${
                  field.kind === "text" ? "w-48" : "w-16"
                }`}
              />
            )}
            {field.unitSuffix && (
              <span className="font-mono text-muted-foreground">
                {field.unitSuffix}
              </span>
            )}
            {locked && (
              <Lock
                className="ms-0.5 size-3 shrink-0 text-amber-400"
                strokeWidth={2.5}
                aria-label={lockedLabel}
              />
            )}
          </label>
        )
      })}

      {/* Command-option hints (AutoCAD's [Close/Undo] prompt). Keyboard-driven
          like AutoCAD's dynamic prompt — the box stays pointer-events-none so
          it never traps the cursor: type the letters, or open the list with
          the Down arrow and mark one with the dot, as AutoCAD's list does. */}
      {state.commandOptions.length > 0 && (
        <div className="flex basis-full flex-wrap gap-1">
          {state.commandOptions.map((option) => (
            <span
              key={option.id}
              data-marked={
                state.commandOptionList?.marked === option.id || undefined
              }
              className={`flex items-center gap-1 rounded-md border px-1.5 py-0.5 shadow-lg backdrop-blur ${
                state.commandOptionList?.marked === option.id
                  ? "border-active/60 bg-accent text-foreground"
                  : state.commandOptionList
                    ? "border-border/60 bg-card/95 text-foreground"
                    : "border-border/60 bg-card/95 text-muted-foreground"
              }`}
            >
              <kbd className="rounded bg-muted px-1 font-mono text-title text-foreground">
                {option.abbreviation}
              </kbd>
              {option.label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

/** Where `field-sizing` is not supported: roughly the rows the text wraps to. */
function paragraphRows(value: string): number {
  const rows = value
    .split("\n")
    .reduce((sum, line) => sum + Math.max(1, Math.ceil(line.length / 42)), 0)
  return Math.min(Math.max(rows, 2), 10)
}
