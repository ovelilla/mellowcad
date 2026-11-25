"use client"

import type { ReactElement, ReactNode } from "react"
import { Dialog } from "@base-ui/react/dialog"

/** A style dialog's surface, centred over the page as the other dialogs'. */
export const DIALOG_POPUP =
  "fixed inset-0 z-50 m-auto h-fit max-w-[calc(100vw-1rem)] rounded-lg [&_label]:whitespace-nowrap [&_legend]:whitespace-nowrap [&_span]:whitespace-nowrap border bg-card p-3 text-popover-foreground shadow-lg outline-none"

/** A typed field of a style dialog, 28 px high. */
export const FIELD =
  "h-7 rounded-md border border-input bg-background px-2 font-mono outline-none focus-visible:border-ring disabled:text-faint-foreground"

/** List's two filters, in AutoCAD's order (acadres 9038–9039, AcDimRes 5610–5611). */
export type StyleFilter = "all" | "inUse"

/**
 * Whether Styles in use lists a style: one an object uses, and the current
 * one, which the next object takes (the desktop's for an unused current
 * style is **unverified**).
 */
export function inUse(
  style: { readonly id: string; readonly entityCount: number },
  current: string
): boolean {
  return style.entityCount > 0 || style.id === current
}

export function DialogBackdrop(): ReactElement {
  return <Dialog.Backdrop className="fixed inset-0 z-50 bg-background/60" />
}

/** One of a dialog's framed groups, its title on the frame as Windows draws it. */
export function Group({
  title,
  children,
  className,
}: {
  title: string
  children: ReactNode
  className?: string
}): ReactElement {
  return (
    <fieldset
      className={`grid grid-cols-[auto_auto] items-center justify-start gap-x-3 gap-y-1.5 rounded-md border px-3 pt-1 pb-2.5 ${className ?? ""}`}
    >
      <legend className="px-1 text-title text-muted-foreground">{title}</legend>
      {children}
    </fieldset>
  )
}
