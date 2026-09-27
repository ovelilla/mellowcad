"use client"

import { LoaderCircle, PencilRuler } from "lucide-react"
import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from "react"

import type { EngineLocale } from "@/cad"
import { loadEngineLocale } from "@/i18n/engine"
import type { AppLocale } from "@/i18n/routing"
import { HERO_SKETCH_PATH } from "@/lib/site"
import { SHEET_TRANSITION } from "@/lib/view-transition"

import type { LiveCanvasLabels, LiveCanvasProps } from "./live-canvas"

interface LiveModule {
  readonly LiveCanvas: ComponentType<LiveCanvasProps>
  readonly seedSketch: (text: string) => void
}

// Both are asked for on intent — a hover or focus on the button — and kept,
// so the click finds them loaded and a retry after a failure starts afresh.
let liveModule: Promise<LiveModule> | null = null
let heroSketch: Promise<string> | null = null

function loadLiveModule(): Promise<LiveModule> {
  liveModule ??= import("./live-canvas").catch((error: unknown) => {
    liveModule = null
    throw error
  })
  return liveModule
}

function loadHeroSketch(): Promise<string> {
  heroSketch ??= fetch(HERO_SKETCH_PATH)
    .then((response) => {
      if (!response.ok) throw new Error(`${response.status}`)
      return response.text()
    })
    .catch((error: unknown) => {
      heroSketch = null
      throw error
    })
  return heroSketch
}

function warm(locale: AppLocale): void {
  loadLiveModule().catch(() => {})
  loadHeroSketch().catch(() => {})
  loadEngineLocale(locale).catch(() => {})
}

type Phase = "still" | "loading" | "live" | "failed"

/**
 * The hero's drawing sheet. It shows the still figure the server plotted and,
 * on a computer, offers to make it live: the engine is imported only then,
 * with the hero's drawing, and laid exactly over the still one — which stays
 * in place, hidden, holding the sheet's size. It also names the sheet for the
 * view transition into the editor.
 */
export function LiveSheet({
  id,
  editor,
  locale,
  drawing,
  transcript,
  controls,
  view,
  labels,
}: {
  id: string
  editor: LiveCanvasProps["editor"]
  /** The page's language, for the engine's catalog. */
  locale: AppLocale
  /** The still figure: the plotted drawing and its overlays. */
  drawing: ReactNode
  /** The still command line, typed in step with the plot. */
  transcript: ReactNode
  controls: ReactNode
  view: LiveCanvasProps["view"]
  labels: {
    readonly tryIt: string
    readonly loading: string
    readonly failed: string
    readonly retry: string
    readonly live: LiveCanvasLabels
  }
}) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const tryRef = useRef<HTMLButtonElement>(null)
  const returnFocus = useRef(false)
  const [phase, setPhase] = useState<Phase>("still")
  const [live, setLive] = useState<LiveModule | null>(null)
  const [engineLocale, setEngineLocale] = useState<EngineLocale>()
  const isLive = phase === "live" && live !== null

  const open = async () => {
    if (phase === "loading") return
    setPhase("loading")
    try {
      const [module, text, catalog] = await Promise.all([
        loadLiveModule(),
        loadHeroSketch(),
        loadEngineLocale(locale),
      ])
      module.seedSketch(text)
      setEngineLocale(catalog)
      setLive(module)
      setPhase("live")
    } catch {
      setPhase("failed")
    }
  }

  // Closing hands focus back to the button that opened the sketch.
  const close = () => {
    returnFocus.current = true
    setPhase("still")
  }

  useEffect(() => {
    if (phase !== "still" || !returnFocus.current) return
    returnFocus.current = false
    tryRef.current?.focus()
  }, [phase])

  useEffect(() => {
    const sheet = sheetRef.current
    if (!sheet) return
    // Named only for the transition, and only when it is on screen: the spec
    // makes a named element a stacking context at all times, and a sheet
    // scrolled out of view would fly into the editor from off-screen.
    const name = (transition: ViewTransition | null) => {
      if (!transition) return
      const { top, bottom } = sheet.getBoundingClientRect()
      if (bottom <= 0 || top >= window.innerHeight) return
      sheet.style.viewTransitionName = SHEET_TRANSITION
      const unname = () => sheet.style.removeProperty("view-transition-name")
      transition.finished.then(unname, unname)
    }
    const onSwap = (event: PageSwapEvent) => {
      const url = event.activation?.entry.url
      if (url && new URL(url).pathname === editor) {
        name(event.viewTransition)
      }
    }
    // Back from the editor, when the page comes out of the back/forward cache
    // with this listener still attached.
    const onReveal = (event: PageRevealEvent) => name(event.viewTransition)
    window.addEventListener("pageswap", onSwap)
    window.addEventListener("pagereveal", onReveal)
    return () => {
      window.removeEventListener("pageswap", onSwap)
      window.removeEventListener("pagereveal", onReveal)
    }
  }, [editor])

  return (
    <div
      id={id}
      ref={sheetRef}
      className="relative overflow-hidden rounded-lg border border-border bg-bg shadow-[0_24px_64px_-32px_rgb(0_0_0/0.8)]"
    >
      <div
        className={`typing plot ${isLive ? "invisible" : ""}`}
        inert={isLive}
      >
        {drawing}
        <div className="flex items-end gap-3 border-t border-border bg-bg-sunken px-3 py-2">
          {transcript}
          {controls}
          {/* Desktop only: the editor is built for a keyboard and a mouse. */}
          <button
            ref={tryRef}
            type="button"
            onPointerEnter={() => warm(locale)}
            onFocus={() => warm(locale)}
            onClick={open}
            aria-busy={phase === "loading"}
            className="hidden h-7 shrink-0 items-center gap-1.5 rounded border border-border px-2.5 text-sm text-fg transition-colors duration-150 hover:border-fg-subtle aria-busy:cursor-progress pointer-fine:lg:inline-flex"
          >
            {phase === "loading" ? (
              <LoaderCircle
                className="size-3.5 motion-safe:animate-spin"
                aria-hidden="true"
              />
            ) : (
              <PencilRuler className="size-3.5" aria-hidden="true" />
            )}
            {phase === "failed" ? labels.retry : labels.tryIt}
          </button>
        </div>
      </div>
      {isLive && (
        <live.LiveCanvas
          labels={labels.live}
          engineLocale={engineLocale}
          editor={editor}
          view={view}
          onClose={close}
        />
      )}
      {/* Announced, since the button's own text only changes to "Try again". */}
      <p role="status" className="sr-only">
        {phase === "loading"
          ? labels.loading
          : phase === "failed"
            ? labels.failed
            : ""}
      </p>
    </div>
  )
}
