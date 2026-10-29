"use client"

import { type PointerEvent, useCallback, useRef } from "react"
import type { CadEngine, ViewCubeTarget } from "@mellowcad/engine"

/**
 * A press on the ViewCube and its drag, handed to the engine in the page's
 * pixels; the engine tells a click from a drag (`viewCubePress`). `surface`
 * is the ref of the element holding the cube's parts, which takes the moves
 * and the release: a press captures the pointer there, so a drag that leaves
 * the cube still reaches it. Destructure what it returns: React Compiler's
 * lint takes an object with a member passed as `ref` for a ref, and fails
 * every read of it during render.
 */
export function useViewCubeDrag(engine: CadEngine): {
  readonly surface: (element: Element | null) => void
  press(target: ViewCubeTarget): (event: PointerEvent<Element>) => void
  readonly move: (event: PointerEvent<Element>) => void
  readonly release: (event: PointerEvent<Element>) => void
  readonly cancel: () => void
} {
  const held = useRef<Element | null>(null)
  const surface = useCallback((element: Element | null) => {
    held.current = element
  }, [])

  const press =
    (target: ViewCubeTarget) =>
    (event: PointerEvent<Element>): void => {
      if (event.button !== 0) return
      // The press is the cube's, not the drawing's under it.
      event.stopPropagation()
      held.current?.setPointerCapture(event.pointerId)
      engine.viewCubePress(target, { x: event.clientX, y: event.clientY })
    }
  const move = useCallback(
    (event: PointerEvent<Element>) =>
      engine.viewCubeMove({ x: event.clientX, y: event.clientY }),
    [engine]
  )
  const release = useCallback(
    (event: PointerEvent<Element>) =>
      engine.viewCubeRelease({ x: event.clientX, y: event.clientY }),
    [engine]
  )
  const cancel = useCallback(() => engine.viewCubeRelease(null), [engine])

  return { surface, press, move, release, cancel }
}
