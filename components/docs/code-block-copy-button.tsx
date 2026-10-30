"use client"

import { Check, Copy } from "lucide-react"
import { useEffect, useState } from "react"

/**
 * Copies a code block's text, and says so: the button's name changes, and a
 * polite live region announces it to a screen reader, which a changed label
 * alone does not.
 */
export function CodeBlockCopyButton({
  value,
  labels,
}: {
  value: string
  labels: { copy: string; copied: string }
}) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timeout = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timeout)
  }, [copied])

  return (
    <>
      <button
        type="button"
        data-slot="code-block-copy-button"
        data-copied={copied || undefined}
        aria-label={copied ? labels.copied : labels.copy}
        title={copied ? labels.copied : labels.copy}
        onClick={() => {
          navigator.clipboard
            .writeText(value)
            .then(() => setCopied(true))
            .catch(() => {})
        }}
        className="grid size-7 shrink-0 place-items-center rounded-md text-fg-subtle transition-colors hover:text-fg"
      >
        {copied ? (
          <Check className="size-3.5" aria-hidden="true" />
        ) : (
          <Copy className="size-3.5" aria-hidden="true" />
        )}
      </button>
      <span aria-live="polite" className="sr-only">
        {copied ? labels.copied : ""}
      </span>
    </>
  )
}
