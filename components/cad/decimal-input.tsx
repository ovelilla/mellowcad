"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/** The typed text as a number: a point or a comma for decimals, as typed. */
function parseDecimal(text: string): number | null {
  const value = Number(text.trim().replace(",", "."))
  return text.trim() === "" || !Number.isFinite(value) ? null : value
}

/** Decimals of `value`, so a step never shows float noise (0.30000000000000004). */
function decimals(value: number): number {
  const text = String(value)
  return text.includes(".") ? text.length - text.indexOf(".") - 1 : 0
}

/**
 * A technical number in a palette: a text field, never `type="number"` — Chrome
 * writes a number field in the browser's language (`3,75` on a Spanish one)
 * whatever the page's `lang`, and a CAD value is written with a point in every
 * language. It is an LTR island (`-12.5` would read `12.5-` in a right-to-left
 * paragraph), and the arrow keys step it as a number field's do.
 */
export function DecimalInput({
  value,
  step = 1,
  min,
  live = false,
  valid = Number.isFinite,
  onCommit,
  className,
  ...props
}: Omit<
  React.ComponentProps<"input">,
  "value" | "onChange" | "type" | "min" | "step" | "dir"
> & {
  value: number
  step?: number
  /** The lowest value the arrows step to. */
  min?: number
  /**
   * Commit every valid keystroke, as the drafting settings do; otherwise on
   * Enter or on leaving the field, with Escape putting the value back.
   */
  live?: boolean
  valid?: (value: number) => boolean
  onCommit: (value: number) => void
}) {
  const [draft, setDraft] = React.useState<string | null>(null)

  const commit = (text: string | null) => {
    const parsed = text === null ? null : parseDecimal(text)
    if (parsed !== null && valid(parsed) && parsed !== value) onCommit(parsed)
  }

  const change = (text: string) => {
    setDraft(text)
    if (live) commit(text)
  }

  const stepBy = (direction: 1 | -1) => {
    const current = parseDecimal(draft ?? String(value)) ?? value
    const places = Math.max(decimals(step), decimals(current))
    let next = Number((current + direction * step).toFixed(places))
    if (min !== undefined) next = Math.max(min, next)
    change(String(next))
  }

  return (
    <input
      {...props}
      type="text"
      inputMode="decimal"
      dir="ltr"
      autoComplete="off"
      spellCheck={false}
      value={draft ?? String(value)}
      onChange={(event) => change(event.target.value)}
      onBlur={(event) => {
        if (!live) commit(draft)
        setDraft(null)
        props.onBlur?.(event)
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowUp" || event.key === "ArrowDown") {
          event.preventDefault()
          stepBy(event.key === "ArrowUp" ? 1 : -1)
        } else if (!live && event.key === "Enter") {
          event.preventDefault()
          event.currentTarget.blur()
        } else if (!live && event.key === "Escape") {
          event.preventDefault()
          setDraft(null)
        }
        props.onKeyDown?.(event)
      }}
      className={cn("text-end", className)}
    />
  )
}
