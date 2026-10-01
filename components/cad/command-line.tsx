"use client"

import { useTranslations } from "next-intl"
import { useEffect, useRef } from "react"
import { CadEngine, EngineState } from "@/cad"

/** How many scrollback lines stay visible above the prompt. */
const VISIBLE_LINES = 3

/**
 * AutoCAD's command line. Like the dynamic input box this component is "dumb":
 * the engine owns the prompt text, the scrollback and the autocomplete, so
 * typing on the canvas and typing in this box feed exactly the same buffer.
 */
export function CommandLine({
  engine,
  state,
}: {
  engine: CadEngine
  state: EngineState
}) {
  const { visible, prompt, idlePrompt, buffer, lines, suggestions, lang } =
    state.commandLine
  const t = useTranslations("Editor.CommandLine")
  const logRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const log = logRef.current
    if (log) log.scrollTop = log.scrollHeight
  }, [lines])

  // Hidden is only *idle* hidden: as soon as something is typed the prompt
  // comes back, so a keystroke never disappears into nowhere. It hides again
  // once the command runs or the text is cleared.
  if (!visible && buffer === "") return null

  const visibleLines = lines.slice(-VISIBLE_LINES)

  // WHY dir="ltr": the command line speaks the command language, left to
  // right in every locale (its prompts, typed coordinates and keywords).
  return (
    <div
      dir="ltr"
      className="pointer-events-auto relative flex h-full w-full flex-col"
    >
      {/* Autocomplete sits above the prompt so it never covers the drawing
          below the cursor, matching AutoCAD's suggestion list. */}
      {suggestions.length > 0 && (
        <div className="absolute inset-s-1 bottom-full mb-1 w-[min(46rem,calc(100%-0.5rem))] overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-md">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.name}
              type="button"
              // Keep focus where it is: running a command must not steal it
              // from the canvas (the engine refocuses the surface itself).
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => engine.runCommand(suggestion.name)}
              className="flex w-full items-center gap-2 px-2 py-1 text-start font-mono text-xs hover:bg-accent hover:text-accent-foreground"
            >
              <span lang={lang} className="font-semibold">
                {suggestion.name}
              </span>
              <span className="truncate text-muted-foreground">
                {suggestion.description}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Docked, the history keeps its lines even while empty, as AutoCAD's
          docked command window does: the drawing above never resizes as
          commands run. */}
      <div
        ref={logRef}
        lang={lang}
        // AutoCAD lays its reports out in spaces and lines (ID, DIST, UCS ?).
        className="flex min-h-0 flex-1 flex-col overflow-y-auto border-b px-2 py-1 font-mono text-[11px] leading-tight whitespace-pre-wrap"
      >
        {/* Lines sit on the prompt; an auto margin, not justify-end, which
            would push a long report out of reach above the scroll. */}
        <div className="mt-auto">
          {visibleLines.map((line, index) => (
            <div
              key={`${index}-${line.text}`}
              className={
                line.kind === "error"
                  ? "text-destructive"
                  : line.kind === "command"
                    ? "text-foreground"
                    : "text-muted-foreground"
              }
            >
              {line.kind === "command"
                ? `${idlePrompt} ${line.text}`
                : line.text}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 px-2 py-1.5 font-mono text-xs">
        <span
          lang={lang}
          className="shrink-0 whitespace-nowrap text-muted-foreground"
        >
          {prompt}
        </span>
        <input
          value={buffer}
          onChange={(e) => engine.setCommandLineText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || (e.key === " " && buffer.trim() !== "")) {
              // Space runs the command too, as it does in AutoCAD.
              e.preventDefault()
              engine.submitCommandLine()
            } else if (e.key === "Tab" && buffer !== "") {
              e.preventDefault()
              engine.completeCommandLine()
            } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
              e.preventDefault()
              engine.recallCommand(e.key === "ArrowUp" ? -1 : 1)
            } else if (e.key === "Escape") {
              e.preventDefault()
              if (buffer !== "") engine.setCommandLineText("")
              else engine.focusSurface()
            }
          }}
          spellCheck={false}
          lang={lang}
          autoComplete="off"
          aria-label={t("label")}
          className="min-w-0 flex-1 bg-transparent text-foreground uppercase outline-none placeholder:text-muted-foreground/60 placeholder:normal-case"
          placeholder={t("placeholder")}
        />
      </div>
    </div>
  )
}
