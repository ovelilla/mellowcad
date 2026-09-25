"use client"

import { Send } from "lucide-react"
import { useState } from "react"

/**
 * On a phone the editor is the wrong tool, so the useful thing is to get the
 * link onto a computer: the system share sheet where there is one, the
 * clipboard where there is not.
 */
export function SendToDesktop({
  url,
  label,
  copiedLabel,
  shareTitle,
  shareText,
}: {
  url: string
  label: string
  copiedLabel: string
  shareTitle: string
  shareText: string
}) {
  const [copied, setCopied] = useState(false)

  const send = async () => {
    const data = { title: shareTitle, text: shareText, url }
    if (typeof navigator.share === "function" && navigator.canShare?.(data)) {
      try {
        await navigator.share(data)
        return
      } catch (error) {
        // Dismissing the sheet is an answer, not a failure.
        if (error instanceof DOMException && error.name === "AbortError") return
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
    } catch {
      // Nothing more to try; the link is on the page for a long press.
    }
  }

  return (
    <button
      type="button"
      onClick={send}
      className="inline-flex h-11 items-center gap-2 rounded-md border border-border px-4 font-medium text-fg transition-colors duration-150 hover:border-fg-subtle"
    >
      <Send className="size-4" aria-hidden="true" />
      <span aria-live="polite">{copied ? copiedLabel : label}</span>
    </button>
  )
}
