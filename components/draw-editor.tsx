"use client"

import { useEffect, useRef, useState, useSyncExternalStore } from "react"

import { CadEditor, type CadEditorProps } from "@mellowcad/editor"
import {
  createLocalStorageDrawingStore,
  type CadEngine,
} from "@mellowcad/engine"

import { runScript } from "@/lib/command-script"
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
import { runDrawing, scriptOfHash, withRun } from "@/lib/script-link"
import { SITE_NAME } from "@/lib/site"

/** Room round what the editor frames as a drawing opens, in the canvas's pixels. */
const VIEW_PADDING = 24

const noSubscription = () => () => {}

function onHashChange(change: () => void): () => void {
  window.addEventListener("hashchange", change)
  return () => window.removeEventListener("hashchange", change)
}

/**
 * `/draw`'s editor. Where its query names a drawing the site publishes
 * (`?drawing=gasket`, an exercise's), the editor opens that one in a store of
 * its own: the drawing kept for the editor is neither read nor written, and
 * `/draw` alone brings it back. The file is fetched while that store holds
 * nothing, so a reload or a return finds the reader's work as they left it.
 * Where it names a file another page handed over (`?open=<id>`, the DXF
 * page's), the editor opens that file as OPEN would, into its own drawing.
 * Where its fragment carries a script (`#run=…`, an MCP answer's link), the
 * editor types it at the command line in a drawing of its own, kept apart
 * as an exercise's is; that one wins over a `?drawing=`.
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
  const hash = useSyncExternalStore(
    onHashChange,
    () => window.location.hash,
    () => ""
  )
  const run = scriptOfHash(hash)
  const opened = run === null ? openedDrawing(search, drawings) : null
  /** The script the engine was built for, null for none; unset before. */
  const builtFor = useRef<string | null | undefined>(undefined)
  /** The script still to type, once the engine is up. */
  const toType = useRef<string | null>(null)

  useEffect(() => {
    const script = toType.current
    if (!engine || script === null) return
    toType.current = null
    runScript(engine, script)
    engine.zoomToFit(VIEW_PADDING)
  }, [engine])

  // The tab names the drawing once it has a file's name (DWGTITLED), as
  // AutoCAD's window caption does (`… - [plan.dxf]`), the name first since a
  // tab cuts its end. WHY not a new drawing's: `Drawing1.dwg` names nothing,
  // and the page's own title is what a search engine that renders it reads.
  useEffect(() => {
    if (!engine) return
    const pageTitle = document.title
    const show = () => {
      const { drawingName, drawingTitled } = engine.getState()
      const title = drawingTitled ? `${drawingName} · ${SITE_NAME}` : pageTitle
      // The engine speaks on every pointer move: the <title> is rewritten
      // only when it changes.
      if (document.title !== title) document.title = title
    }
    show()
    const unsubscribe = engine.subscribe(show)
    return () => {
      unsubscribe()
      document.title = pageTitle
    }
  }, [engine])

  useEffect(() => {
    // WHY: a fragment changed in place (another link pasted, Back) loads no
    // page, and the drawing's store is chosen as the engine is built.
    if (!engine || builtFor.current === undefined) return
    if (scriptOfHash(window.location.hash) !== builtFor.current) {
      window.location.reload()
    }
  }, [engine, hash])

  useEffect(() => {
    const drawing = openedDrawing(search, drawings)
    if (
      !engine ||
      !drawing ||
      builtFor.current !== null ||
      engine.getState().entityCount > 0
    ) {
      return
    }
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
    // A script's drawing is the link's: a file handed too waits for `/draw`.
    if (!engine || !id || builtFor.current !== null) return
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
        run !== null
          ? languages?.map((link) => ({
              ...link,
              href: withRun(link.href, run),
            }))
          : opened
            ? languages?.map((link) => ({
                ...link,
                href: withDrawing(link.href, opened.name),
              }))
            : languages
      }
      feedback={reportUrl({ ...report, browser })}
      // Called once, as the engine is built in the browser.
      store={() => {
        const script = scriptOfHash(window.location.hash)
        builtFor.current = script
        if (script !== null) {
          const drawing = runDrawing(script, () => window.localStorage)
          toType.current = drawing.pending ? script : null
          return drawing.store
        }
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
