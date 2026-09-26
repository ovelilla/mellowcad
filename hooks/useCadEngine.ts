"use client"

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react"
import { CadEngine, type DrawingStore, type EngineState } from "@/cad"

export interface UseCadEngineOptions {
  /** Passed to the engine as is; see `CadEngineOptions.store`. */
  readonly store?: DrawingStore | null
  /** The element to embed the engine in; see `CadEngineOptions.scope`. */
  readonly scopeRef?: React.RefObject<HTMLElement | null>
}

/**
 * Bridges the imperative {@link CadEngine} to React. The engine owns the canvas
 * and all drawing/interaction; this hook only:
 *  1. instantiates the engine once the canvas is mounted, and
 *  2. exposes the engine's reactive state snapshot via `useSyncExternalStore`.
 *
 * React components render the UI chrome (toolbar, status bar) from `state` and
 * issue commands by calling methods on `engine`. The options are read once, when
 * the engine is built — like the engine's own, they are not reactive.
 */
export function useCadEngine(options: UseCadEngineOptions = {}): {
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  engine: CadEngine | null
  state: EngineState | null
} {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [engine, setEngine] = useState<CadEngine | null>(null)
  const initialOptions = useRef(options)

  useEffect(() => {
    if (!canvasRef.current) return
    const { store, scopeRef } = initialOptions.current
    const instance = new CadEngine(canvasRef.current, {
      ...(store !== undefined && { store }),
      ...(scopeRef?.current && { scope: scopeRef.current }),
    })
    setEngine(instance)
    return () => instance.dispose()
  }, [])

  const subscribe = useCallback(
    (onChange: () => void) => (engine ? engine.subscribe(onChange) : () => {}),
    [engine]
  )
  const getSnapshot = useCallback(() => engine?.getState() ?? null, [engine])
  const getServerSnapshot = useCallback(() => null, [])

  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  return { canvasRef, engine, state }
}
