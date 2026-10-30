"use client"

import { Dialog } from "@base-ui/react/dialog"
import { Menu, X } from "lucide-react"
import { useState } from "react"

/**
 * The docs' navigation on a narrow screen, a sheet from the start edge. It
 * closes as a link in it is followed: the next page renders under it.
 */
export function DocsMobileNav({
  labels,
  children,
}: {
  labels: { menu: string; close: string }
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger className="inline-flex h-9 items-center gap-2 rounded-md px-2 text-sm text-fg-muted hover:text-fg lg:hidden">
        <Menu className="size-5" aria-hidden="true" />
        <span>{labels.menu}</span>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-bg-sunken/70 backdrop-blur-sm" />
        <Dialog.Popup
          onClick={(event) => {
            if ((event.target as Element).closest("a")) setOpen(false)
          }}
          className="fixed inset-y-0 inset-s-0 z-50 w-[min(20rem,85vw)] overflow-y-auto border-e border-border bg-bg-raised p-4 pt-14"
        >
          <Dialog.Title className="sr-only">{labels.menu}</Dialog.Title>
          <Dialog.Close
            aria-label={labels.close}
            className="absolute inset-e-2 top-2 grid size-9 place-items-center rounded-md text-fg-muted hover:text-fg"
          >
            <X className="size-5" aria-hidden="true" />
          </Dialog.Close>
          {children}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
