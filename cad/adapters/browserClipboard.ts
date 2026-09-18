import { Clipboard } from "../application/ports"

/**
 * Browser implementation of the {@link Clipboard} port, over the async
 * Clipboard API. Returns `null` outside the browser (SSR), like the other
 * adapters.
 *
 * Reading is the fragile half: not every browser exposes `readText` to a page,
 * and the ones that do may ask the user first and reject when refused. That is
 * why this stays a thin wrapper and the runtime — not the adapter — owns the
 * fallback to what the session last copied.
 */
export function createBrowserClipboard(
  navigatorRef: Navigator | null = typeof navigator === "undefined"
    ? null
    : navigator
): Clipboard | null {
  const api = navigatorRef?.clipboard
  if (!api) return null

  return {
    write: (text: string) => api.writeText(text),
    read: () =>
      typeof api.readText === "function"
        ? api.readText()
        : Promise.resolve(null),
  }
}
