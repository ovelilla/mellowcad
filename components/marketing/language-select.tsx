import { ChevronDown, Globe } from "lucide-react"

/**
 * The language control in its final form, inert until a second language
 * exists. When it does, its options become real links to the equivalent URL
 * (next-intl's `getPathname`), so crawlers find every version — never a script
 * toggle.
 */
export function LanguageSelect({
  label,
  current,
  upcoming,
  soon,
}: {
  label: string
  current: string
  upcoming: string
  soon: string
}) {
  return (
    <div className="tip">
      <span
        role="button"
        tabIndex={0}
        aria-disabled="true"
        aria-haspopup="listbox"
        aria-label={`${label}: ${current}`}
        aria-describedby="language-soon"
        className="inline-flex h-8 items-center gap-2 rounded-md border border-border px-2.5 text-sm text-fg-muted"
      >
        <Globe className="size-3.5" aria-hidden="true" />
        {current}
        <ChevronDown className="size-3.5 text-fg-subtle" aria-hidden="true" />
      </span>
      <span role="tooltip" id="language-soon">
        {upcoming} · {soon}
      </span>
    </div>
  )
}
