"use client"

import { Check, Copy } from "lucide-react"
import { useEffect, useState } from "react"

/**
 * The text of the code block `button` is in, as its page shows it: a block
 * of lines is a line per element, numbers and signs being CSS (`code-block.tsx`).
 */
function blockText(button: HTMLElement): string {
  const code = button
    .closest('[data-slot="code-block"]')
    ?.querySelector('[data-slot="code-block-code"]')
  if (!code) return ""
  const lines = code.querySelectorAll('[data-slot="code-block-line"]')
  if (lines.length === 0) return code.textContent ?? ""
  return Array.from(lines, (line) => (line.textContent ?? "").replace(/\n$/, "")).join("\n")
}

/**
 * Copies a code block's text, and says so: the button's name changes, and a
 * polite live region announces it to a screen reader, which a changed label
 * alone does not. The text is read from the page when pressed. WHY not a
 * prop: an island's props are written into the RSC payload, a second copy of
 * every block's code on every page.
 */
export function CodeBlockCopyButton({
  labels,
}: {
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
        onClick={(event) => {
          navigator.clipboard
            .writeText(blockText(event.currentTarget))
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
