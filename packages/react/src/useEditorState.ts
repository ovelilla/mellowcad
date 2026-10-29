"use client"

import { useCallback, useRef, useSyncExternalStore } from "react"
import type { CadEngine, EngineState } from "@mellowcad/engine"

/**
 * What changes on every pointer move. The editor's chrome never reads it, so
 * {@link useEditorState} leaves it out of the state it re-renders with; the
 * two components that show it read it with {@link useEngineSelector}.
 */
const POINTER_KEYS = ["cursorUcs", "coordinates", "dynamicInput"] as const

/** The engine's state as the editor's chrome renders it. */
export type EditorState = Omit<EngineState, (typeof POINTER_KEYS)[number]>

/**
 * The engine's state snapshot, through `useSyncExternalStore`, without what a
 * pointer move changes ({@link EditorState}): moving the cursor would
 * otherwise re-render the whole editor on every event. `null` until the
 * engine exists (`CadCanvas`'s `onEngine`) and on the server.
 *
 * React components render the UI chrome (toolbar, status bar) from it and
 * issue commands by calling methods on the engine.
 */
export function useEditorState(engine: CadEngine | null): EditorState | null {
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

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
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
