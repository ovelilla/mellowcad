"use client"

import { useEffect, useRef, type ReactNode } from "react"

import { SHEET_TRANSITION } from "@/lib/view-transition"

/**
 * The hero's drawing sheet, named for the view transition into the editor:
 * the server plots the figure and types the transcript; this island only
 * gives the sheet its name for the trip.
 */
export function TransitionSheet({
  id,
  editor,
  children,
}: {
  id: string
  editor: string
  children: ReactNode
}) {
  const sheetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sheet = sheetRef.current
    if (!sheet) return
    // Named only for the transition, and only when it is on screen: the spec
    // makes a named element a stacking context at all times, and a sheet
    // scrolled out of view would fly into the editor from off-screen.
    const name = (transition: ViewTransition | null) => {
      if (!transition) return
      const { top, bottom } = sheet.getBoundingClientRect()
      if (bottom <= 0 || top >= window.innerHeight) return
      sheet.style.viewTransitionName = SHEET_TRANSITION
      const unname = () => sheet.style.removeProperty("view-transition-name")
      transition.finished.then(unname, unname)
    }
    const onSwap = (event: PageSwapEvent) => {
      const url = event.activation?.entry.url
      if (url && new URL(url).pathname === editor) {
        name(event.viewTransition)
      }
    }
    // Back from the editor, when the page comes out of the back/forward cache
    // with this listener still attached.
    const onReveal = (event: PageRevealEvent) => name(event.viewTransition)
    window.addEventListener("pageswap", onSwap)
    window.addEventListener("pagereveal", onReveal)
    return () => {
      window.removeEventListener("pageswap", onSwap)
      window.removeEventListener("pagereveal", onReveal)
    }
  }, [editor])

  return (
    <div
      id={id}
      ref={sheetRef}
      className="relative overflow-hidden rounded-lg border border-border bg-bg shadow-[0_24px_64px_-32px_rgb(0_0_0/0.8)]"
    >
      {children}
    </div>
  )
}
