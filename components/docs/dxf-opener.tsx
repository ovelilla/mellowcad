"use client"

import { FolderOpen } from "lucide-react"
import { useEffect, useRef, useState, useSyncExternalStore } from "react"

import { readSavedDrawingSummary } from "@mellowcad/engine"
import { handFile, openingHref } from "@/lib/handed-file"

export interface DxfOpenerLabels {
  readonly choose: string
  readonly drop: string
  /** That the file stays on the device. */
  readonly local: string
  /** That it replaces the drawing the editor holds, said only when it holds one. */
  readonly replaces: string
  readonly opening: string
  readonly dwg: string
  /** The handover failed: open the editor and press Ctrl+O. */
  readonly failed: string
  readonly editor: string
}

type State = "idle" | "over" | "opening" | "dwg" | "failed"

/**
 * The autosave changes behind the page's back: in the editor in another tab
 * (`storage`), or before the page comes back out of the back/forward cache
 * after handing a file over (`pageshow`).
 */
function subscribe(onChange: () => void): () => void {
  window.addEventListener("storage", onChange)
  window.addEventListener("pageshow", onChange)
  return () => {
    window.removeEventListener("storage", onChange)
    window.removeEventListener("pageshow", onChange)
  }
}

/** Whether the editor holds a drawing of the reader's, as the landing's call to continue it counts. */
function holdsDrawing(): boolean {
  return (readSavedDrawingSummary()?.objects ?? 0) > 0
}

/**
 * The DXF page's own way in: a file chosen or dropped here opens in the
 * editor, handed over through this browser's storage (`lib/handed-file.ts`)
 * and never uploaded. It replaces the editor's drawing, as OPEN does there.
 * A DWG is answered here: the editor would only say it is no DXF.
 */
export function DxfOpener({
  editor,
  labels,
}: {
  /** The editor in the page's language. */
  editor: string
  labels: DxfOpenerLabels
}) {
  const input = useRef<HTMLInputElement>(null)
  const [state, setState] = useState<State>("idle")
  const replaces = useSyncExternalStore(subscribe, holdsDrawing, () => false)

  // Back from the editor, out of the back/forward cache, the page is ready again.
  useEffect(() => {
    const reset = (event: PageTransitionEvent) => {
      if (event.persisted) setState("idle")
    }
    window.addEventListener("pageshow", reset)
    return () => window.removeEventListener("pageshow", reset)
  }, [])

  const open = async (file: File | undefined) => {
    if (!file || state === "opening") return
    if (/\.dwg$/i.test(file.name)) {
      setState("dwg")
      return
    }
    setState("opening")
    try {
      const href = openingHref(editor, await handFile(file))
      // WHY no transition into the editor: it opens the file as it arrives,
      // and while one lasts the canvas is drawn over the command line, where
      // the report of what was left out goes. There is no sheet to grow here.
      window.addEventListener(
        "pageswap",
        (event: PageSwapEvent) => event.viewTransition?.skipTransition(),
        { once: true }
      )
      window.location.assign(href)
    } catch {
      setState("failed")
    }
  }

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault()
        if (state !== "opening") setState("over")
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null))
          setState((now) => (now === "over" ? "idle" : now))
      }}
      onDrop={(event) => {
        event.preventDefault()
        void open(event.dataTransfer.files[0])
      }}
      className={`my-8 flex flex-col gap-4 rounded-lg border border-dashed bg-bg-raised p-6 transition-colors duration-150 print:hidden ${state === "over" ? "border-fg-subtle bg-bg" : "border-border"}`}
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <button
          type="button"
          disabled={state === "opening"}
          onClick={() => input.current?.click()}
          className="inline-flex h-11 items-center gap-2 rounded-md bg-accent px-5 font-medium text-accent-ink transition-[filter] duration-150 hover:brightness-110 disabled:opacity-70"
        >
          <FolderOpen className="size-4" aria-hidden="true" />
          {state === "opening" ? labels.opening : labels.choose}
        </button>
        <span className="text-fg-muted">{labels.drop}</span>
        <input
          ref={input}
          type="file"
          accept=".dxf"
          hidden
          onChange={(event) => {
            void open(event.target.files?.[0])
            event.target.value = ""
          }}
        />
      </div>
      {/* One line that a refusal rewrites, so it is announced as it changes. */}
      <p
        aria-live="polite"
        className={`text-sm ${state === "dwg" || state === "failed" ? "text-fg" : "text-fg-muted"}`}
      >
        {state === "dwg" ? (
          labels.dwg
        ) : state === "failed" ? (
          <>
            {labels.failed}{" "}
            <a href={editor} className="underline-link">
              {labels.editor}
            </a>
          </>
        ) : (
          labels.local
        )}
      </p>
      {replaces && (
        <p className="text-sm text-fg-muted">{labels.replaces}</p>
      )}
    </div>
  )
}
