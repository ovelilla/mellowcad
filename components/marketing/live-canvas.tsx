"use client"

import { ArrowUpRight, X } from "lucide-react"
import { useEffect, useId, useRef, useState } from "react"

import {
  DEFAULT_DOCUMENT_SETTINGS,
  createLocalStorageDrawingStore,
  createMemoryDrawingStore,
  formatLength,
  isBlankDrawing,
  readSavedDrawingSummary,
  type Bounds,
  type EngineState,
} from "@/cad"
import { DynamicInput } from "@/components/cad/dynamic-input"
import { useCadEngine } from "@/hooks/useCadEngine"
import { formatPlural, type PluralMessage } from "@/lib/plural"

import { UcsIcon } from "./ucs-icon"

/**
 * The sketch's own autosave. It lasts as long as the page, so a sketch closed
 * and opened again is as it was left — and it is never this device's store,
 * which holds the drawing the user keeps in the editor.
 */
const sketch = createMemoryDrawingStore()

/** Gives the sketch the hero's drawing, the first time it opens. */
export function seedSketch(text: string): void {
  if (sketch.read() === null) sketch.write(text)
}

/** How long a download gets to start before the page navigates away. */
const DOWNLOAD_GRACE_MS = 600
const HISTORY_LINES = 3
const SUGGESTIONS = 5

export interface LiveCanvasLabels {
  readonly canvasLabel: string
  readonly hint: string
  readonly wheelHint: string
  readonly commandLog: string
  /** The idle prompt a command is echoed after, as the engine words it. */
  readonly commandPrompt: string
  readonly openEditor: string
  readonly close: string
  readonly closeLabel: string
  readonly dialogTitle: string
  /** `#` is replaced by the count. */
  readonly saved: PluralMessage
  readonly dialogBody: string
  readonly download: string
  readonly replace: string
  readonly cancel: string
}

export interface LiveCanvasProps {
  readonly labels: LiveCanvasLabels
  /** The editor in the page's language. */
  readonly editor: string
  /** What the still figure frames, so the drawing does not move as it wakes. */
  readonly view: {
    readonly frame: Bounds
    readonly padding: number
    readonly width: number
  }
  readonly onClose: () => void
}

/**
 * The hero's sheet, live: the real engine on the flange, with the editor's
 * own dynamic-input box and a command line docked like the still one. It is
 * embedded (`scope`), so it has the keyboard and the wheel only while in use.
 * Loaded on demand — none of this is in the page's first load.
 */
export function LiveCanvas({ labels, editor, view, onClose }: LiveCanvasProps) {
  const scopeRef = useRef<HTMLDivElement>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const { canvasRef, engine, state } = useCadEngine({
    store: sketch,
    scopeRef,
  })
  const [savedObjects, setSavedObjects] = useState(0)
  const descriptionId = useId()
  const titleId = useId()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!engine || !canvas) return
    const scale = canvas.getBoundingClientRect().width / view.width
    engine.zoomToBounds(view.frame, view.padding * scale)
    // SELECTIONCYCLING 1, the badge alone: the Selection list box does not
    // fit on the sheet. The full editor has it.
    engine.setSelectionCyclingList(false)
    engine.focusSurface()
  }, [engine, canvasRef, view])

  // Nor does the Shift+right-click menu. Never leave it open unseen, where it
  // would silently take the next Escape.
  const menuOpen = state?.snapOverrideMenu != null
  useEffect(() => {
    if (menuOpen) engine?.closeSnapOverrideMenu()
  }, [engine, menuOpen])

  const go = () => window.location.assign(editor)

  const download = () => {
    engine?.saveDrawingToFile()
    window.setTimeout(go, DOWNLOAD_GRACE_MS)
  }

  const replace = () => {
    if (!engine) return
    const text = engine.serializeDrawing()
    const device = createLocalStorageDrawingStore()
    device?.write(text)
    // The store fails quietly when storage is full or blocked; then the
    // sketch leaves as a file rather than being lost on the way.
    if (device?.read() !== text) download()
    else go()
  }

  const openEditor = () => {
    const saved = readSavedDrawingSummary()
    if (saved && !isBlankDrawing(saved)) {
      setSavedObjects(saved.objects)
      dialogRef.current?.showModal()
    } else {
      replace()
    }
  }

  const close = () => {
    // Autosave waits for a pause; keep the very last change for next time.
    if (engine) sketch.write(engine.serializeDrawing())
    onClose()
  }

  const savedText = formatPlural(labels.saved, savedObjects)

  return (
    <>
      <div
        ref={scopeRef}
        className="live-sketch absolute inset-0 flex flex-col bg-bg"
      >
        <div className="relative min-h-0 flex-1">
          <canvas
            ref={canvasRef}
            role="application"
            aria-label={labels.canvasLabel}
            aria-describedby={descriptionId}
            className="absolute inset-0 h-full w-full touch-none outline-none"
          />
          <UcsIcon />
          {state && <Readout state={state} />}
          {engine && state && (
            <>
              <DynamicInput engine={engine} state={state} />
              <Suggestions
                state={state}
                onRun={(name) => engine.runCommand(name)}
              />
            </>
          )}
          {/* Always in view: the way out, and the way on to the editor. */}
          <div className="absolute top-2 right-2 z-10 flex items-center gap-1 rounded-md border border-border bg-bg-raised/90 p-0.5 text-sm backdrop-blur-sm">
            <button
              type="button"
              onClick={openEditor}
              className="inline-flex h-7 items-center gap-1 rounded px-2 text-fg-muted transition-colors duration-150 hover:text-fg"
            >
              {labels.openEditor}
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={close}
              aria-label={labels.closeLabel}
              className="inline-flex h-7 items-center gap-1 rounded px-2 text-fg-muted transition-colors duration-150 hover:text-fg"
            >
              <X className="size-3.5" aria-hidden="true" />
              {labels.close}
            </button>
          </div>
        </div>
        <div className="border-t border-border bg-bg-sunken px-3 py-2">
          <div
            role="log"
            aria-label={labels.commandLog}
            className="flex h-[6em] min-w-0 flex-col justify-end overflow-hidden font-mono text-[0.8125rem]"
          >
            {state && <CommandLog state={state} labels={labels} />}
          </div>
        </div>
        <p id={descriptionId} className="sr-only">
          {labels.hint} {labels.wheelHint}
        </p>
      </div>
      {/* Outside the scope, so its buttons keep their keys to themselves. */}
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        className="sheet-dialog m-auto w-[min(36rem,calc(100vw-2rem))] rounded-lg border border-border bg-bg-raised p-6 text-fg shadow-[0_24px_64px_-24px_rgb(0_0_0/0.9)]"
      >
        <h2 id={titleId} className="text-h3">
          {labels.dialogTitle}
        </h2>
        <p className="mt-3 text-fg-muted">{savedText}</p>
        <p className="mt-2 text-fg-muted">{labels.dialogBody}</p>
        {/* First in order, so it is the one the dialog focuses: the choice
            that loses nothing. */}
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={download}
            className="inline-flex h-10 items-center rounded-md bg-accent px-4 font-medium text-accent-ink transition-[filter] duration-150 hover:brightness-110"
          >
            {labels.download}
          </button>
          <button
            type="button"
            onClick={replace}
            className="inline-flex h-10 items-center rounded-md border border-border px-4 font-medium text-fg transition-colors duration-150 hover:bg-bg"
          >
            {labels.replace}
          </button>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="inline-flex h-10 items-center rounded-md px-4 text-fg-muted transition-colors duration-150 hover:text-fg"
          >
            {labels.cancel}
          </button>
        </div>
      </dialog>
    </>
  )
}

/** The cursor, as the status bar reads it; the last position while it is off. */
function Readout({ state }: { state: EngineState }) {
  const [cursor, setCursor] = useState(state.cursorWorld)
  if (state.cursorWorld && state.cursorWorld !== cursor) {
    setCursor(state.cursorWorld)
  }
  if (!cursor) return null
  const settings = {
    ...DEFAULT_DOCUMENT_SETTINGS,
    unit: state.documentUnit,
    precision: state.documentPrecision,
  }
  return (
    <p
      aria-hidden="true"
      className="pointer-events-none absolute right-3 bottom-3 data-mono text-xs text-fg-subtle"
    >
      X {formatLength(cursor.x, settings)}
      <span className="ml-3">Y {formatLength(cursor.y, settings)}</span>
    </p>
  )
}

/**
 * The prompt's autocomplete, above the command line as in the editor. A press
 * keeps focus where it is: running the command refocuses the canvas itself.
 */
function Suggestions({
  state,
  onRun,
}: {
  state: EngineState
  onRun: (name: string) => void
}) {
  const suggestions = state.commandLine.suggestions.slice(0, SUGGESTIONS)
  if (suggestions.length === 0) return null
  return (
    <ul className="absolute bottom-2 left-2 z-10 w-72 overflow-hidden rounded-md border border-border bg-bg-raised font-mono text-xs shadow-lg">
      {suggestions.map((suggestion) => (
        <li key={suggestion.name}>
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onRun(suggestion.name)}
            className="flex w-full gap-3 px-3 py-1.5 text-left hover:bg-bg"
          >
            <span className="font-medium text-fg">{suggestion.name}</span>
            <span className="truncate text-fg-subtle">
              {suggestion.description}
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}

/** The engine's command line: its last lines, then the prompt and the buffer. */
function CommandLog({
  state,
  labels,
}: {
  state: EngineState
  labels: LiveCanvasLabels
}) {
  const { visible, prompt, buffer, lines } = state.commandLine
  // F2 hides the prompt until something is typed, as in the editor.
  if (!visible && buffer === "") return null
  return (
    <>
      {lines.length === 0 ? (
        <>
          <div aria-hidden="true" className="cl-line text-fg-subtle">
            {labels.hint}
          </div>
          <div aria-hidden="true" className="cl-line text-fg-subtle">
            {labels.wheelHint}
          </div>
        </>
      ) : (
        lines.slice(-HISTORY_LINES).map((line, index) => (
          <div key={`${lines.length}-${index}`} className="cl-line">
            {line.kind === "command" ? (
              <>
                <span className="text-fg-subtle">{labels.commandPrompt} </span>
                <span className="text-fg">{line.text}</span>
              </>
            ) : (
              <span
                className={
                  line.kind === "error" ? "text-accent" : "text-fg-muted"
                }
              >
                {line.text}
              </span>
            )}
          </div>
        ))
      )}
      <div className="cl-line">
        <span className="text-fg-subtle">{prompt} </span>
        <span className="text-fg uppercase">{buffer}</span>
        <span className="caret live-caret" />
      </div>
    </>
  )
}
