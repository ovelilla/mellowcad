"use client"

import { useEffect, useState, useSyncExternalStore } from "react"

import { CadEditor, type CadEditorProps } from "@mellowcad/editor"
import {
  createLocalStorageDrawingStore,
  type CadEngine,
} from "@mellowcad/engine"

import {
  handedFileId,
  takeHandedFile,
  withoutOpenParam,
} from "@/lib/handed-file"
import {
  drawingStorageKey,
  keyedDrawingStore,
  openedDrawing,
  withDrawing,
  type PublishedDrawings,
} from "@/lib/opened-drawing"
import { reportUrl, type ReportFields } from "@/lib/report"

/** Room round what the editor frames as a drawing opens, in the canvas's pixels. */
const VIEW_PADDING = 24

const noSubscription = () => () => {}

/**
 * `/draw`'s editor. Where its query names a drawing the site publishes
 * (`?drawing=gasket`, an exercise's), the editor opens that one in a store of
 * its own: the drawing kept for the editor is neither read nor written, and
 * `/draw` alone brings it back. The file is fetched while that store holds
 * nothing, so a reload or a return finds the reader's work as they left it.
 * Where it names a file another page handed over (`?open=<id>`, the DXF
 * page's), the editor opens that file as OPEN would, into its own drawing.
 * The page is static: the query is read in the browser, and so is the
 * browser that Send Feedback's forms name beside the page's `report`.
 */
export function DrawEditor({
  drawings,
  report,
  languages,
  ...props
}: Omit<CadEditorProps, "store" | "onEngine" | "feedback"> & {
  readonly drawings: PublishedDrawings
  readonly report: ReportFields
}) {
  const [engine, setEngine] = useState<CadEngine | null>(null)
  const search = useSyncExternalStore(
    noSubscription,
    () => window.location.search,
    () => ""
  )
  const browser = useSyncExternalStore(
    noSubscription,
    () => navigator.userAgent,
    () => undefined
  )
  const opened = openedDrawing(search, drawings)

  useEffect(() => {
    const drawing = openedDrawing(search, drawings)
    if (!engine || !drawing || engine.getState().entityCount > 0) return
    const controller = new AbortController()
    fetch(drawing.url, { signal: controller.signal })
      .then((response) =>
        response.ok
          ? response.text()
          : Promise.reject(new Error(response.statusText))
      )
      .then((text) => {
        engine.loadDrawing(text)
        engine.zoomToBounds(drawing.view, VIEW_PADDING)
      })
      .catch(() => {
        // Offline, or gone: the editor stays on an empty drawing of its own.
      })
    return () => controller.abort()
  }, [engine, search, drawings])

  useEffect(() => {
    const id = handedFileId(search)
    if (!engine || !id) return
    // Taken once: a reload, or a language link, must not ask again.
    window.history.replaceState(
      window.history.state,
      "",
      withoutOpenParam(window.location.href)
    )
    takeHandedFile(id)
      .then((file) => file && engine.openFile(file))
      .catch(() => {
        // Storage blocked or emptied: the editor stays on its drawing.
      })
  }, [engine, search])

  return (
    <CadEditor
      {...props}
      languages={
        opened
          ? languages?.map((link) => ({
              ...link,
              href: withDrawing(link.href, opened.name),
            }))
          : languages
      }
      feedback={reportUrl({ ...report, browser })}
      // Called once, as the engine is built in the browser.
      store={() => {
        const drawing = openedDrawing(window.location.search, drawings)
        return drawing
          ? keyedDrawingStore(
              drawingStorageKey(drawing.name),
              () => window.localStorage
            )
          : createLocalStorageDrawingStore()
      }}
      onEngine={setEngine}
    />
  )
}
