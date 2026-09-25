"use client"

import { useSyncExternalStore } from "react"

import { readSavedDrawingSummary } from "@/cad"

const subscribe = () => () => {}

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
  continueOne,
  continueOther,
}: {
  href: string
  start: string
  /** `#` is replaced by the count. */
  continueOne: string
  continueOther: string
}) {
  const objects = useSyncExternalStore(subscribe, savedObjects, () => 0)
  const plural = new Intl.PluralRules("en").select(objects)
  const count = new Intl.NumberFormat("en").format(objects)
  const resume = (plural === "one" ? continueOne : continueOther).replace(
    "#",
    count
  )
  // The widest label the button may ever need, reserved but never shown.
  const widest = continueOther.replace("#", "999")
  return (
    <a
      href={href}
      className="inline-grid h-12 items-center rounded-md bg-accent px-6 font-medium text-accent-ink transition-[filter] duration-150 hover:brightness-110"
    >
      <span className="col-start-1 row-start-1 text-center">
        {objects > 0 ? resume : start}
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
