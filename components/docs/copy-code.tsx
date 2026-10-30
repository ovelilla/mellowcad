"use client"

import { Check, Copy } from "lucide-react"
import { useState } from "react"

/** Copies the code block it sits in: the text it shows, highlighting gone. */
export function CopyCode({
  labels,
}: {
  labels: { copy: string; copied: string }
}) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      aria-label={copied ? labels.copied : labels.copy}
      title={copied ? labels.copied : labels.copy}
      onClick={async (event) => {
        const code = event.currentTarget.closest("figure")?.querySelector("pre")
        if (!code) return
        await navigator.clipboard.writeText(code.innerText)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
      className="grid size-8 shrink-0 place-items-center rounded-md text-fg-subtle transition-colors hover:text-fg"
    >
      {copied ? (
        <Check className="size-4" aria-hidden="true" />
      ) : (
        <Copy className="size-4" aria-hidden="true" />
      )}
    </button>
  )
}
