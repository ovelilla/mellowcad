"use client"

import { useTranslations } from "next-intl"
import { useEffect, useRef } from "react"
import { ChevronUp } from "lucide-react"

import { cn } from "@/lib/utils"
import { TooltipProvider } from "@/components/ui/tooltip"
import { CadEngine, type CommandLineUi } from "@mellowcad/engine"
import type { EditorState } from "@/hooks/useCadEngine"

import { IconAction } from "./toolbar-primitives"

/** What floats above the prompt, over the drawing. */
const ABOVE =
  "absolute inset-x-0 bottom-full border border-b-0 bg-card/90 px-2 py-0.5 font-mono whitespace-pre-wrap backdrop-blur"

/**
 * AutoCAD's command line as it starts: one prompt line, with the temporary
 * prompt history of the running command above it (CLIPROMPTLINES, 3), and the
 * whole history expanded upwards over the drawing with F2 or the arrow at its
 * end. Like the dynamic input box this component is "dumb": the engine owns
 * the prompt text, the scrollback and the autocomplete, so typing on the
 * canvas and typing in this box feed exactly the same buffer.
 */
export function CommandLine({
  engine,
  state,
}: {
  engine: CadEngine
  state: EditorState
}) {
  const {
    visible,
    historyOpen,
    prompt,
    buffer,
    takesSpaces,
    suggestions,
    lang,
  } = state.commandLine
  const t = useTranslations("Editor.CommandLine")

  // Hidden is only *idle* hidden: as soon as something is typed the prompt
  // comes back, so a keystroke never disappears into nowhere. It hides again
  // once the command runs or the text is cleared.
  if (!visible && buffer === "") return null

  // WHY dir="ltr": the command line speaks the command language, left to
  // right in every locale (its prompts, typed coordinates and keywords).
  return (
    <TooltipProvider>
      <div
        dir="ltr"
        className="pointer-events-auto relative flex h-full w-full items-center gap-2 ps-2 pe-1 font-mono"
      >
        {/* Autocomplete sits above the prompt so it never covers the drawing
            below the cursor, matching AutoCAD's suggestion list. */}
        {suggestions.length > 0 ? (
          <div className="absolute inset-s-1 bottom-full z-10 mb-1 w-[min(46rem,calc(100%-0.5rem))] overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-md">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.name}
                type="button"
                // Keep focus where it is: running a command must not steal it
                // from the canvas (the engine refocuses the surface itself).
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => engine.runCommand(suggestion.name)}
                className="flex h-7 w-full items-center gap-2 px-2 text-start hover:bg-accent hover:text-accent-foreground"
              >
                <span lang={lang} className="text-title">
                  {suggestion.name}
                </span>
                <span className="truncate text-muted-foreground">
                  {suggestion.description}
                </span>
              </button>
            ))}
          </div>
        ) : historyOpen ? (
          <History commandLine={state.commandLine} label={t("history")} />
        ) : (
          <TemporaryLines commandLine={state.commandLine} />
        )}

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
            // A name that holds spaces (UCS's Save, desktop ucs/d05) takes
            // one after what is typed: the input types it.
            const typesSpace =
              e.key === " " && takesSpaces && buffer.trim() !== ""
            if ((e.key === "Enter" || e.key === " ") && !typesSpace) {
              // Space is Enter too, as it is in AutoCAD: it runs the command,
              // answers the prompt, or with nothing typed repeats or ends.
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
              else if (historyOpen) engine.setCommandHistoryOpen(false)
              else engine.focusSurface()
            }
          }}
          spellCheck={false}
          lang={lang}
          autoComplete="off"
          aria-label={t("label")}
          className="h-full min-w-0 flex-1 bg-transparent text-foreground uppercase outline-none placeholder:text-faint-foreground placeholder:normal-case"
          placeholder={t("placeholder")}
        />
        {/* The arrow at the command window's right end ("Press F2. Click the
            arrow at the right end of the command window"). */}
        <IconAction
          icon={ChevronUp}
          label={t("history")}
          shortcut="F2"
          side="top"
          active={historyOpen}
          onClick={() => engine.toggleCommandHistory()}
        />
      </div>
    </TooltipProvider>
  )
}

/** One line of the scrollback, as AutoCAD writes it. */
function Line({
  line,
  idlePrompt,
}: {
  line: CommandLineUi["lines"][number]
  idlePrompt: string
}) {
  return (
    <div
      className={
        line.kind === "error"
          ? "text-destructive"
          : line.kind === "command" || line.kind === "prompt"
            ? "text-foreground"
            : "text-muted-foreground"
      }
    >
      {line.kind === "command" ? `${idlePrompt} ${line.text}` : line.text}
    </div>
  )
}

/**
 * The temporary prompt history: the last lines of the running command. Once
 * it ends they fade, so a report (ID, DIST) can still be read; the time is
 * ours, as AutoCAD documents none.
 */
function TemporaryLines({ commandLine }: { commandLine: CommandLineUi }) {
  const { recent, command, idlePrompt, lang } = commandLine
  const last = recent.at(-1)
  if (!last) return null
  return (
    <div
      // A new line starts the fade again.
      key={`${recent.length}:${last.kind}:${last.text}`}
      lang={lang}
      aria-hidden
      className={cn(
        ABOVE,
        "pointer-events-none",
        command === null && "animate-prompt-fade"
      )}
    >
      {recent.map((line, index) => (
        <Line key={index} line={line} idlePrompt={idlePrompt} />
      ))}
    </div>
  )
}

/** The whole history, expanded up to 12 lines and scrolled to its end. */
function History({
  commandLine,
  label,
}: {
  commandLine: CommandLineUi
  label: string
}) {
  const { lines, idlePrompt, lang } = commandLine
  const logRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const log = logRef.current
    if (log) log.scrollTop = log.scrollHeight
  }, [lines])

  return (
    <div
      ref={logRef}
      role="log"
      aria-label={label}
      lang={lang}
      // Twelve lines of 16 px.
      className={cn(ABOVE, "max-h-49 overflow-y-auto")}
    >
      {lines.map((line, index) => (
        <Line key={index} line={line} idlePrompt={idlePrompt} />
      ))}
    </div>
  )
}
