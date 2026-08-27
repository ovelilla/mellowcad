"use client"

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react"
import { CadEngine, type EngineState } from "@/cad"

/**
 * Bridges the imperative {@link CadEngine} to React. The engine owns the canvas
 * and all drawing/interaction; this hook only:
 *  1. instantiates the engine once the canvas is mounted, and
 *  2. exposes the engine's reactive state snapshot via `useSyncExternalStore`.
 *
 * React components render the UI chrome (toolbar, status bar) from `state` and
 * issue commands by calling methods on `engine`.
 */
export function useCadEngine(): {
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  engine: CadEngine | null
  state: EngineState | null
} {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [engine, setEngine] = useState<CadEngine | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    const instance = new CadEngine(canvasRef.current)
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
