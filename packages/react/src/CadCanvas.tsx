"use client"

import {
  type CanvasHTMLAttributes,
  type ReactElement,
  type RefObject,
  useEffect,
  useRef,
} from "react"
import {
  CadEngine,
  type DrawingStore,
  type EngineLocale,
} from "@mellowcad/engine"

/**
 * The engine's options, read once, when it is built — like the engine's own,
 * they are not reactive — and the canvas's own attributes, which are.
 */
export interface CadCanvasProps extends Omit<
  CanvasHTMLAttributes<HTMLCanvasElement>,
  "children"
> {
  /** Makes the engine's store when it is built; see `CadEngineOptions.store`. */
  readonly store?: () => DrawingStore | null
  /**
   * What the engine may take keys from; see `CadEngineOptions.scope`. An
   * element by its ref, since it exists only once mounted.
   */
  readonly scope?: RefObject<HTMLElement | null> | "document"
  /** The engine's language; English when absent. */
  readonly locale?: EngineLocale
  /**
   * Whether the palette panel starts open, asked when the engine is built:
   * by then the page knows what it laid out before the engine existed.
   */
  readonly paletteOpen?: () => boolean
  /** Handed the engine once it is built, and `null` once it is disposed. */
  readonly onEngine?: (engine: CadEngine | null) => void
}

/**
 * The drawing's `<canvas>` and the {@link CadEngine} that owns it: built once
 * the canvas is mounted, disposed when it unmounts. The engine does all the
 * drawing and interaction; the host renders its chrome from
 * `useEditorState(engine)` and calls the engine's methods.
 */
export function CadCanvas(props: CadCanvasProps): ReactElement {
  const { store, scope, locale, paletteOpen, onEngine, ...canvas } = props
  const ref = useRef<HTMLCanvasElement | null>(null)
  const options = useRef<EngineMount>({
    store,
    scope,
    locale,
    paletteOpen,
    onEngine,
  })

  useEffect(
    () => (ref.current ? mountEngine(ref.current, options.current) : undefined),
    []
  )

  return <canvas {...canvas} ref={ref} />
}

type EngineMount = Pick<
  CadCanvasProps,
  "store" | "scope" | "locale" | "paletteOpen" | "onEngine"
>

/** Builds the engine on `canvas` and hands it out; the returned cleanup disposes it. */
export function mountEngine(
  canvas: HTMLCanvasElement,
  { store, scope, locale, paletteOpen, onEngine }: EngineMount
): () => void {
  const engine = new CadEngine(canvas, {
    ...(store && { store: store() }),
    ...(scope === "document"
      ? { scope }
      : scope?.current && { scope: scope.current }),
    ...(locale && { locale }),
    ...(paletteOpen && { paletteOpen: paletteOpen() }),
  })
  onEngine?.(engine)
  return () => {
    engine.dispose()
    onEngine?.(null)
  }
}
