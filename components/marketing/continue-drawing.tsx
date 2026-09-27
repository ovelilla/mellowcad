"use client"

import { useSyncExternalStore } from "react"

import { readSavedDrawingSummary } from "@/cad"
import { formatPlural, type PluralMessage } from "@/lib/plural"

/**
 * The autosave changes behind the page's back: in the editor in another tab
 * (`storage`), or before the page comes back out of the back/forward cache
 * after handing a sketch to the editor (`pageshow`).
 */
function subscribe(onChange: () => void): () => void {
  window.addEventListener("storage", onChange)
  window.addEventListener("pageshow", onChange)
  return () => {
    window.removeEventListener("storage", onChange)
    window.removeEventListener("pageshow", onChange)
  }
}

/** Objects in this device's autosave, or 0 when there is none to continue. */
function savedObjects(): number {
  return readSavedDrawingSummary()?.objects ?? 0
}

/**
 * The primary call to action. Someone with a drawing autosaved on this device
 * is offered to continue it, with its size; everyone else starts drawing. Both
 * labels share one grid cell, so the button is sized for the longer one from
 * the first paint and swapping them moves nothing.
 */
export function ContinueDrawing({
  href,
  start,
  resume,
}: {
  href: string
  start: string
  resume: PluralMessage
}) {
  const objects = useSyncExternalStore(subscribe, savedObjects, () => 0)
  // The widest label the button may ever need, reserved but never shown.
  const widest = formatPlural(resume, 999)
  return (
    <a
      href={href}
      className="inline-grid h-12 items-center rounded-md bg-accent px-6 font-medium text-accent-ink transition-[filter] duration-150 hover:brightness-110"
    >
      <span className="col-start-1 row-start-1 text-center">
        {objects > 0 ? formatPlural(resume, objects) : start}
        <span aria-hidden="true"> →</span>
      </span>
      <span
        aria-hidden="true"
        className="invisible col-start-1 row-start-1 text-center"
      >
        {widest} →
      </span>
    </a>
  )
}
