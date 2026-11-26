"use client"

import { useEffect, useRef, type ReactElement } from "react"
import { Menu } from "@base-ui/react/menu"
import { ChevronDown, ChevronUp, SquareTerminal, X } from "lucide-react"

import { cn } from "./utils"
import { Button } from "./ui/button"
import { TooltipProvider } from "./ui/tooltip"
import { usePortalContainer } from "./ui/portal-container"
import { DirectionProvider } from "./ui/direction"
import type { CommandLineUi } from "@mellowcad/engine"
import { useCommandLineInput } from "@mellowcad/react"

import { IconAction } from "./toolbar-primitives"
import { drawingFocus } from "./drawing-focus"
import { useEditorText } from "./editor-text"
import type { PieceProps } from "./piece"

/**
 * The expanded history, over the drawing above the line: from 4 px before
 * Recent Commands to the line's end, as AutoCAD's (desktop 2026-11-26,
 * cl-f2: 251 to 1726 over a line from 193, its icon at 255).
 */
const ABOVE =
  "absolute inset-s-6 inset-e-0 bottom-full border border-b-0 bg-card/90 px-2 py-0.5 font-mono whitespace-pre-wrap backdrop-blur"

/**
 * AutoCAD's command window as it starts: one line floating over the foot of
 * the drawing, 27 high and as wide as it.
 * Left to right: close, Recent Commands, the prompt with its field (`Type a
 * command` at `Command:`), the history's arrow. Above it, over the drawing,
 * the running command's temporary prompt lines (CLIPROMPTLINES, 3), each a
 * label of its own, and the whole history expanded with F2 or the arrow. The
 * engine owns the prompt, the history and the suggestions, so typing on the
 * drawing and typing in this field feed the same buffer.
 */
export function CommandLine({
  engine,
  state,
}: PieceProps): ReactElement | null {
  const { visible, historyOpen, prompt, buffer, suggestions, command, lang } =
    state.commandLine
  const t = useEditorText("CommandLine")
  const input = useCommandLineInput(engine)

  // Hidden is only *idle* hidden: as soon as something is typed the prompt
  // comes back, so a keystroke never disappears into nowhere. It hides again
  // once the command runs or the text is cleared.
  if (!visible && buffer === "") return null

  // WHY dir="ltr": the command line speaks the command language, left to
  // right in every locale (its prompts, typed coordinates and keywords).
  // The measures are AutoCAD's (UI Automation, research/ui/2026-11-24/
  // autocad-mouse/uia2-cli-Button_2.txt): close 20 × 20 and Recent Commands
  // 28 × 18 at the start, 4 px under the top; the history's arrow 15 × 25 at
  // the end. Customize, between them, is Missing.
  return (
    <TooltipProvider>
      <div
        dir="ltr"
        className="pointer-events-auto relative flex h-6.75 w-full items-center gap-1 border-t bg-card/90 ps-1 font-mono backdrop-blur"
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

        <IconAction
          icon={X}
          label={t("close")}
          shortcut="Ctrl+9"
          side="top"
          className="size-5"
          // The button goes with the line: the focus would fall to the page.
          onClick={() => {
            engine.closeCommandLine()
            engine.focusSurface()
          }}
        />
        <RecentCommands
          names={state.commandLine.recentCommands}
          lang={lang}
          label={t("recentCommands")}
          onRun={(name) => engine.runRecentCommand(name)}
          finalFocus={drawingFocus(engine)}
        />

        {/* AutoCAD writes no `Command:` before its field: at rest the field
            hints `Type a command`, and a command's prompt leaves it empty
            (desktop regions/d01-2, d02-1). */}
        {/* A prompt longer than a narrow drawing leaves (palettes docked at
            both sides) gives way before the field: its start is cut, as the
            keywords at its end are what one answers. */}
        {command !== null && (
          <span
            lang={lang}
            title={prompt}
            className="ms-1 min-w-0 truncate whitespace-nowrap text-muted-foreground [direction:rtl]"
          >
            <bdi dir="ltr">{prompt}</bdi>
          </span>
        )}
        <input
          {...input}
          lang={lang}
          aria-label={t("label")}
          className="ms-1 h-full min-w-24 flex-1 bg-transparent text-foreground uppercase outline-none placeholder:text-faint-foreground placeholder:normal-case"
          placeholder={command === null ? t("typeCommand") : undefined}
        />
        {/* The arrow at the command window's right end ("Press F2. Click the
            arrow at the right end of the command window"). */}
        <IconAction
          icon={ChevronUp}
          label={t("history")}
          shortcut="F2"
          side="top"
          active={historyOpen}
          // Under the line's border, a pixel over its foot, as AutoCAD's.
          className="me-px h-6.25 w-3.75 self-start rounded-sm [&_svg]:size-3"
          onClick={() => engine.toggleCommandHistory()}
        />
      </div>
    </TooltipProvider>
  )
}

/**
 * Recent Commands: the commands run this session, newest first, by their
 * names in capitals; a pick runs one again (the help's "To Work With
 * Entering Commands"). No tooltip: a trigger that opens a popup takes none.
 */
function RecentCommands({
  names,
  lang,
  label,
  onRun,
  finalFocus,
}: {
  names: readonly string[]
  lang: string
  label: string
  onRun: (name: string) => void
  finalFocus: () => false
}) {
  const portal = usePortalContainer()
  // WHY its own direction: the line is a left-to-right island, and its list,
  // portalled out of it, would open towards the drawing's other side.
  return (
    <DirectionProvider direction="ltr">
      <Menu.Root>
        <Menu.Trigger
          disabled={names.length === 0}
          render={
            <Button
              variant="ghost"
              aria-label={label}
              className="h-4.5 w-7 gap-0 rounded-sm p-0 text-muted-foreground"
            >
              <SquareTerminal className="text-foreground" />
              <ChevronDown className="size-2.5!" />
            </Button>
          }
        />
        <Menu.Portal container={portal}>
          <Menu.Positioner
            side="top"
            align="start"
            sideOffset={4}
            className="z-50"
          >
            <Menu.Popup
              finalFocus={finalFocus}
              className="max-h-[min(24rem,var(--available-height))] min-w-44 origin-(--transform-origin) overflow-y-auto rounded-md border bg-card/90 p-1 text-popover-foreground shadow-md backdrop-blur transition-[transform,opacity] outline-none data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0"
            >
              {names.map((name) => (
                <Menu.Item
                  key={name}
                  lang={lang}
                  onClick={() => onRun(name)}
                  className="relative flex cursor-default items-center rounded-sm py-1.5 ps-2 pe-8 font-mono text-ui outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground"
                >
                  {name}
                </Menu.Item>
              ))}
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
    </DirectionProvider>
  )
}

/** One line of the scrollback, as AutoCAD writes it. */
function Line({
  line,
  idlePrompt,
  className,
}: {
  line: CommandLineUi["lines"][number]
  idlePrompt: string
  className?: string
}) {
  return (
    <div
      className={cn(
        line.kind === "error"
          ? "text-destructive"
          : line.kind === "command" || line.kind === "prompt"
            ? "text-foreground"
            : "text-muted-foreground",
        className
      )}
    >
      {line.kind === "command" ? `${idlePrompt} ${line.text}` : line.text}
    </div>
  )
}

/**
 * The temporary prompt history: the last lines of the running command, each
 * on a translucent label of its own over the drawing, 20 high, as AutoCAD's
 * list draws them (uia2-cli-Button_2.txt: ListBoxItem 133 × 20), from
 * Recent Commands' start (desktop 2026-11-26, en1920-a: labels at 257, its icon at
 * 255, the line at 193). Once the
 * command ends they fade, so a report (ID, DIST) can still be read; the time
 * is ours, as AutoCAD documents none.
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
        "pointer-events-none absolute inset-s-7 inset-e-0 bottom-full mb-px flex flex-col items-start font-mono whitespace-pre",
        command === null && "animate-prompt-fade"
      )}
    >
      {recent.map((line, index) => (
        <Line
          key={index}
          line={line}
          idlePrompt={idlePrompt}
          className="flex h-5 max-w-full items-center overflow-hidden bg-card/80 px-1.5 backdrop-blur"
        />
      ))}
    </div>
  )
}

/**
 * The whole history, expanded up to some 300 high, as AutoCAD's F2 opens it
 * (desktop 2026-11-26, cl-f2: 299 at 1920 × 1080), and scrolled to its end.
 */
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
      // Eighteen lines of 16 px and the padding.
      className={cn(ABOVE, "max-h-73 overflow-y-auto")}
    >
      {lines.map((line, index) => (
        <Line key={index} line={line} idlePrompt={idlePrompt} />
      ))}
    </div>
  )
}
