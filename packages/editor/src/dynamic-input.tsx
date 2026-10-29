"use client"

import type { ReactElement } from "react"
import { Lock } from "lucide-react"
import { CadEngine } from "@mellowcad/engine"
import { useDynamicInput, type EditorState } from "@mellowcad/react"

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
}): ReactElement | null {
  const { dynamicInput: di, box, field: fieldProps } = useDynamicInput(engine)

  if (!di) return null

  return (
    <div
      {...box}
      dir="ltr"
      lang={state.commandLine.lang}
      className="pointer-events-none absolute z-[5] flex flex-wrap gap-1"
      style={{ left: di.screen.x + 16, top: di.screen.y + 20 + di.clearance }}
    >
      {/* The dynamic prompt: the question alone, its keywords in the chips;
          a lead line above it (DIST's `Distance = …`) on a line of its own. */}
      {di.prompt !== null && (
        <div className="flex basis-full">
          <span className="rounded-md border border-border/60 bg-card/95 px-2 py-1 whitespace-pre-line text-muted-foreground shadow-lg backdrop-blur">
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
        // A word (SETVAR's name) is typed, like text, and drives nothing.
        const typedAsText = field.kind === "text" || field.kind === "word"
        const locked =
          !content && field.kind !== "word" && field.value.trim().length > 0
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
                {...fieldProps(field)}
                rows={paragraphRows(field.value)}
                className="field-sizing-content max-h-48 w-72 resize-none bg-transparent font-mono text-foreground outline-none"
              />
            ) : (
              <input
                {...fieldProps(field)}
                placeholder={field.placeholder}
                inputMode={typedAsText ? "text" : "decimal"}
                className={`bg-transparent font-mono text-foreground outline-none placeholder:text-faint-foreground ${
                  typedAsText ? "w-48" : "w-16"
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
