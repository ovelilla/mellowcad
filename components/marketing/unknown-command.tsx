"use client"

import { useSyncExternalStore } from "react"

const MAX_COMMAND_LENGTH = 24

/** `/pricing/` → `PRICING`: the last path segment, as a command name would be typed. */
function commandFromPath(pathname: string): string | null {
  const segment = pathname.split("/").filter(Boolean).pop() ?? ""
  let decoded = segment
  try {
    decoded = decodeURIComponent(segment)
  } catch {
    // A malformed escape is still a segment worth echoing as typed.
  }
  const command = decoded
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, "")
    .slice(0, MAX_COMMAND_LENGTH)
  return command === "" ? null : command
}

const subscribe = () => () => {}

/**
 * The 404 is prerendered once for every unknown URL, so the requested path is
 * only known in the browser. Until then the server's generic name stands in.
 */
export function UnknownCommand({
  fallback,
  template,
}: {
  fallback: string
  /** The error line with `{command}` still in it. */
  template: string
}) {
  const command = useSyncExternalStore(
    subscribe,
    () => commandFromPath(window.location.pathname) ?? fallback,
    () => fallback
  )
  return (
    <>
      <span className="text-fg">{command}</span>
      <span className="block text-fg-muted">
        {template.replace("{command}", command)}
      </span>
    </>
  )
}
