"use client"

import { useState, type ReactElement } from "react"
import { Dialog } from "@base-ui/react/dialog"

import type { CadEngine } from "@mellowcad/engine"
import type { EditorState } from "@mellowcad/react"
import { Button } from "./ui/button"
import { usePortalContainer } from "./ui/portal-container"
import { useEditorText } from "./editor-text"
import { cn } from "./utils"

/** The dialog's twenty figures, by row (none, +32 circle, +64 square, +96 both) and column. */
const MODES: readonly number[] = [0, 32, 64, 96].flatMap((ring) =>
  [0, 1, 2, 3, 4].map((figure) => ring + figure)
)

/**
 * AutoCAD's Point Style dialog (PTYPE, desktop point/d01): the twenty point
 * display images, Point Size with `%` or `Units` after it, Set Size Relative
 * to Screen or in Absolute Units. It opens on PDMODE and PDSIZE (0 reads 5 %),
 * and OK writes both inside PTYPE's step; a size that is no number, or below
 * 0, is `Invalid input.` and the dialog stays. WHY no Help button: no host
 * page answers it yet.
 */
export function PointStyleDialog({
  engine,
  state,
}: {
  engine: CadEngine
  state: EditorState
}): ReactElement {
  const portal = usePortalContainer()
  const close = () => engine.setPointStyleDialog(false)
  return (
    <Dialog.Root
      open={state.pointStyleDialog}
      onOpenChange={(open) => {
        if (!open) close()
      }}
      onOpenChangeComplete={(open) => {
        if (!open) engine.focusSurface()
      }}
    >
      <Dialog.Portal container={portal}>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-background/60" />
        {/* aria-modal: the engine leaves a modal dialog's keys to it. */}
        <Dialog.Popup
          aria-modal="true"
          finalFocus={false}
          className="fixed inset-0 z-50 m-auto h-fit w-72 rounded-lg border bg-card p-3 text-popover-foreground shadow-lg outline-none"
        >
          {state.pointStyleDialog && (
            <PointStyleForm
              engine={engine}
              mode={state.pointMode}
              size={state.pointSize}
              onDone={close}
            />
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function PointStyleForm({
  engine,
  mode: initialMode,
  size: initialSize,
  onDone,
}: {
  engine: CadEngine
  mode: number
  size: number
  onDone: () => void
}) {
  const t = useEditorText("PointStyle")
  const [mode, setMode] = useState(initialMode)
  const [relative, setRelative] = useState(initialSize <= 0)
  // PDSIZE 0 is 5 % of the view, as the dialog shows it (desktop point/d01).
  const [text, setText] = useState(
    initialSize === 0 ? "5.0000" : String(Math.abs(initialSize))
  )
  const [invalid, setInvalid] = useState(false)

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        // A plain decimal, never what Number() also takes (`0x10`, `1e3`).
        const typed = text.trim().replace(",", ".")
        const value = /^\+?(\d+\.?\d*|\.\d+)$/.test(typed) ? Number(typed) : NaN
        if (!Number.isFinite(value)) {
          setInvalid(true)
          return
        }
        engine.applyPointStyle(mode, relative ? -value : value)
        onDone()
      }}
    >
      <Dialog.Title className="mb-3 text-title">{t("title")}</Dialog.Title>
      <div
        role="radiogroup"
        aria-label={t("figures")}
        dir="ltr"
        className="grid grid-cols-5 gap-1"
      >
        {MODES.map((each) => (
          <Button
            key={each}
            type="button"
            role="radio"
            aria-checked={mode === each}
            aria-label={`PDMODE ${each}`}
            variant={mode === each ? "active" : "outline"}
            className="w-full p-0"
            onClick={() => setMode(each)}
          >
            <PointFigure mode={each} />
          </Button>
        ))}
      </div>
      <label className="mt-3 flex h-7 items-center gap-2">
        <span className="text-muted-foreground">{t("pointSize")}</span>
        <input
          type="text"
          inputMode="decimal"
          dir="ltr"
          autoComplete="off"
          spellCheck={false}
          value={text}
          aria-invalid={invalid}
          onChange={(event) => {
            setText(event.target.value)
            setInvalid(false)
          }}
          className={cn(
            "h-7 w-28 rounded-md border bg-background px-2 text-end font-mono",
            invalid && "border-destructive"
          )}
        />
        <span className="text-muted-foreground">
          {relative ? t("percent") : t("units")}
        </span>
      </label>
      {invalid && (
        <p role="alert" className="text-destructive">
          {t("invalid")}
        </p>
      )}
      <fieldset className="mt-2">
        {[true, false].map((value) => (
          <label key={String(value)} className="flex h-7 items-center gap-2">
            <input
              type="radio"
              name="point-size"
              checked={relative === value}
              onChange={() => setRelative(value)}
            />
            {t(value ? "relative" : "absolute")}
          </label>
        ))}
      </fieldset>
      <div className="mt-4 flex justify-end gap-2">
        <Button type="submit" variant="outline">
          {t("ok")}
        </Button>
        <Dialog.Close
          render={
            <Button type="button" variant="outline">
              {t("cancel")}
            </Button>
          }
        />
      </div>
    </form>
  )
}

/** One of the dialog's images: the figure (a dot, nothing, +, ×, a tick up) and its circle and square. */
function PointFigure({ mode }: { mode: number }) {
  const figure = mode & 7
  return (
    <svg
      viewBox="-10 -10 20 20"
      aria-hidden="true"
      className="size-4 stroke-current"
      fill="none"
      strokeWidth={1}
    >
      {figure === 0 && (
        <circle r={0.9} className="fill-current" stroke="none" />
      )}
      {figure === 2 && <path d="M-9 0H9M0 -9V9" />}
      {figure === 3 && <path d="M-7 -7L7 7M-7 7L7 -7" />}
      {figure === 4 && <path d="M0 0V-6" />}
      {mode & 32 ? <circle r={5} /> : null}
      {mode & 64 ? <rect x={-5} y={-5} width={10} height={10} /> : null}
    </svg>
  )
}
