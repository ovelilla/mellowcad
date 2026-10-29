"use client"

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react"
import {
  CadEngine,
  type DrawingStore,
  type EngineLocale,
  type EngineState,
} from "@mellowcad/engine"

/**
 * What changes on every pointer move. The editor's chrome never reads it, so
 * {@link useCadEngine} leaves it out of the state it re-renders with; the two
 * components that show it read it with {@link useEngineSelector}.
 */
const POINTER_KEYS = ["cursorUcs", "dynamicInput"] as const

/** The engine's state as the editor's chrome renders it. */
export type EditorState = Omit<EngineState, (typeof POINTER_KEYS)[number]>

export interface UseCadEngineOptions {
  /** Passed to the engine as is; see `CadEngineOptions.store`. */
  readonly store?: DrawingStore | null
  /** The element to embed the engine in; see `CadEngineOptions.scope`. */
  readonly scopeRef?: React.RefObject<HTMLElement | null>
  /** The engine's language; English when absent. */
  readonly locale?: EngineLocale
  /**
   * Whether the palette panel starts open, asked when the engine is built:
   * by then the page knows what it laid out before the engine existed.
   */
  readonly paletteOpen?: () => boolean
}

/**
 * Bridges the imperative {@link CadEngine} to React. The engine owns the canvas
 * and all drawing/interaction; this hook only:
 *  1. instantiates the engine once the canvas is mounted, and
 *  2. exposes the engine's reactive state snapshot via `useSyncExternalStore`,
 *     without what a pointer move changes ({@link EditorState}): moving the
 *     cursor would otherwise re-render the whole editor on every event.
 *
 * React components render the UI chrome (toolbar, status bar) from `state` and
 * issue commands by calling methods on `engine`. The options are read once, when
 * the engine is built — like the engine's own, they are not reactive.
 */
export function useCadEngine(options: UseCadEngineOptions = {}): {
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  engine: CadEngine | null
  state: EditorState | null
} {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [engine, setEngine] = useState<CadEngine | null>(null)
  const initialOptions = useRef(options)

  useEffect(() => {
    if (!canvasRef.current) return
    const { store, scopeRef, locale, paletteOpen } = initialOptions.current
    const instance = new CadEngine(canvasRef.current, {
      ...(store !== undefined && { store }),
      ...(scopeRef?.current && { scope: scopeRef.current }),
      ...(locale && { locale }),
      ...(paletteOpen && { paletteOpen: paletteOpen() }),
    })
    setEngine(instance)
    return () => instance.dispose()
  }, [])

  const subscribe = useCallback(
    (onChange: () => void) => (engine ? engine.subscribe(onChange) : () => {}),
    [engine]
  )
  // The engine shares what did not change between its snapshots, so one that
  // differs only in the pointer keys keeps the last.
  const editorState = useRef<EditorState | null>(null)
  const getSnapshot = useCallback(() => {
    const next = engine?.getState() ?? null
    const last = editorState.current
    if (next && last && sameOutsidePointer(last, next)) return last
    editorState.current = next
    return next
  }, [engine])
  const getServerSnapshot = useCallback(() => null, [])

  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  return { canvasRef, engine, state }
}

/**
 * A part of the engine's state, re-rendering only when it changes — by
 * identity, which the engine keeps for whatever a change did not touch. For
 * what {@link EditorState} leaves out.
 */
export function useEngineSelector<T>(
  engine: CadEngine,
  select: (state: EngineState) => T
): T {
  const subscribe = useCallback(
    (onChange: () => void) => engine.subscribe(onChange),
    [engine]
  )
  const read = () => select(engine.getState())
  return useSyncExternalStore(subscribe, read, read)
}

function sameOutsidePointer(last: EditorState, next: EngineState): boolean {
  for (const key of Object.keys(next) as (keyof EngineState)[]) {
    if ((POINTER_KEYS as readonly string[]).includes(key)) continue
    if (next[key] !== last[key as keyof EditorState]) return false
  }
  return true
}
