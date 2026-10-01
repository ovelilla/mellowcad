"use client"

import { useEffect, useRef } from "react"
import { Lock } from "lucide-react"
import { CadEngine, EngineState } from "@/cad"

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
  state: EngineState
  /** `Editor.DynamicInput.locked`: what the padlock says to a screen reader. */
  lockedLabel: string
}) {
  const di = state.dynamicInput
  const activeFieldId = di?.fields.find((f) => f.active)?.id ?? null
  const inputRef = useRef<HTMLInputElement>(null)
  const areaRef = useRef<HTMLTextAreaElement>(null)

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
    el.focus()
    // Multi-line text is edited in place: reselecting it all on every refocus
    // would let the next keystroke wipe the paragraphs.
    if (!(el instanceof HTMLTextAreaElement)) el.select()
  })

  if (!di) return null

  return (
    <div
      data-dynamic-input=""
      dir="ltr"
      lang={state.commandLine.lang}
      className="pointer-events-none absolute z-[5] flex flex-wrap gap-1"
      style={{ left: di.screen.x + 16, top: di.screen.y + 20 }}
    >
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
            className={`flex gap-1 rounded-md border px-2 py-1 font-mono text-[11px] shadow-lg backdrop-blur ${
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
                className="field-sizing-content max-h-48 w-72 resize-none bg-transparent text-foreground outline-none"
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
                  // single Backspace clears (unlocks) it, like AutoCAD.
                  e.currentTarget.select()
                }}
                onChange={(e) =>
                  engine.setDynamicInputText(e.target.value, field.id)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    engine.commitDynamicInput()
                  } else if (e.key === "Escape") {
                    e.preventDefault()
                    engine.cancelDynamicInput()
                  } else if (
                    e.key.length === 1 &&
                    field.kind !== "text" &&
                    field.value === "" &&
                    state.commandOptions.some(
                      (o) => o.key === e.key.toUpperCase()
                    )
                  ) {
                    // A command-option keyword (AutoCAD's [Close/Undo] prompt)
                    // whose key runs it at once. Only in an empty field, so a
                    // keyword can still be typed out and confirmed with Enter
                    // (`_C`, a word, an abbreviation of several letters). A
                    // free-text field is exempt: there a letter *is* content.
                    e.preventDefault()
                    engine.invokeToolOption(e.key)
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
                className={`bg-transparent text-foreground outline-none placeholder:text-muted-foreground/50 ${
                  field.kind === "text" ? "w-48" : "w-16"
                }`}
              />
            )}
            {field.unitSuffix && (
              <span className="text-muted-foreground">{field.unitSuffix}</span>
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
          it never traps the cursor; press the highlighted key to invoke. */}
      {state.commandOptions.length > 0 && (
        <div className="flex basis-full flex-wrap gap-1">
          {state.commandOptions.map((option) => (
            <span
              key={option.id}
              className="flex items-center gap-1 rounded-md border border-border/60 bg-card/95 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground shadow-lg backdrop-blur"
            >
              <kbd className="rounded bg-muted px-1 font-semibold text-foreground">
                {option.key ?? option.abbreviation}
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
