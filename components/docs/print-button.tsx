"use client"

import { Printer } from "lucide-react"

/**
 * Prints the page, which the browser's dialog also saves as a PDF: an
 * exercise printed to work from (the docs' print styles leave its article
 * alone, dark on white).
 */
export function PrintButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3.5 text-sm text-fg-muted transition-colors duration-150 hover:text-fg"
    >
      <Printer className="size-4" aria-hidden="true" />
      {label}
    </button>
  )
}
