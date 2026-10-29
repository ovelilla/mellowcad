import { createElement } from "react"
import { renderToString } from "react-dom/server"

/**
 * What a hook returns from one render, through React's server renderer: its
 * handlers can then be called with hand-made events, with no jsdom. Effects
 * never run there, so what one does is tested as the function it calls.
 */
export function renderHook<T>(hook: () => T): T {
  let result: { value: T } | null = null
  function Probe() {
    result = { value: hook() }
    return null
  }
  renderToString(createElement(Probe))
  if (!result) throw new Error("the hook did not render")
  return (result as { value: T }).value
}
