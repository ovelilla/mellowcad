"use client"

import { Dialog } from "@base-ui/react/dialog"
import { experimental_useSearch as useSearch } from "fumadocs-core/search/client"
import type { SearchResultItem } from "fumadocs-core/search/client"
import { FileText, Hash, Search, X } from "lucide-react"
import Link from "next/link"
import { useCallback, useEffect, useState } from "react"

import { localePath, unlocalizedPath } from "@/i18n/navigation"
import type { AppLocale } from "@/i18n/routing"
import { SEARCH_INDEX_PATH } from "@/lib/site"

export interface DocsSearchLabels {
  search: string
  title: string
  placeholder: string
  empty: string
  failed: string
  searching: string
  close: string
}

/** A record's Markdown as the plain text a result line shows. */
function plain(markdown: string): string {
  return markdown
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[`*_]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

function results(items: SearchResultItem[]) {
  return items.flatMap((item) => (item.type === "table" ? item.rows : [item]))
}

/**
 * WHY imported when the dialog opens: Fumadocs' static client and its search
 * engine are some 25 KB of Brotli more than a fetch, on every docs page.
 */
const loadStaticClient = () =>
  import("fumadocs-core/search/client/orama-static").then(
    ({ staticClient }) => staticClient
  )

/**
 * Searched in the browser, in the page's language's index
 * (`app/[locale]/search-index.json`), fetched once when the dialog first
 * opens: nothing is downloaded by whoever never searches, and no query
 * reaches a function. Ctrl+K or ⌘K opens it from anywhere on a docs page.
 * `empty` holds `{query}`, filled here.
 */
export function DocsSearch({
  locale,
  labels,
}: {
  locale: AppLocale
  labels: DocsSearchLabels
}) {
  const [open, setOpen] = useState(false)
  const from = localePath(locale, SEARCH_INDEX_PATH)
  // A stable identity is the contract: `useSearch` searches again when it changes.
  const run = useCallback(
    async (query: string) => (await loadStaticClient())({ from }).search(query),
    [from]
  )
  const { search, onSearchChange, isLoading, data, error } = useSearch(run)

  // Fumadocs keeps the index it loaded per URL, so the first query finds it
  // already there; an empty search only loads it.
  useEffect(() => {
    if (open) run("").catch(() => {})
  }, [open, run])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen((value) => !value)
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  const found = data ? results(data.items) : []

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-bg-raised px-3 text-sm text-fg-muted transition-colors hover:text-fg">
        <Search className="size-4" aria-hidden="true" />
        <span>{labels.search}</span>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-bg-sunken/70 backdrop-blur-sm" />
        <Dialog.Popup className="fixed inset-x-4 top-[12svh] z-50 mx-auto flex max-h-[70svh] max-w-xl flex-col overflow-hidden rounded-lg border border-border bg-bg-raised shadow-2xl">
          <Dialog.Title className="sr-only">{labels.title}</Dialog.Title>
          <div className="flex items-center gap-3 border-b border-border px-4">
            <Search className="size-4 shrink-0 text-fg-subtle" aria-hidden="true" />
            <input
              type="text"
              enterKeyHint="search"
              autoFocus
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={labels.placeholder}
              aria-label={labels.placeholder}
              className="h-12 min-w-0 flex-1 bg-transparent text-fg outline-none placeholder:text-fg-subtle"
            />
            <Dialog.Close
              aria-label={labels.close}
              className="grid size-8 place-items-center rounded-md text-fg-muted hover:text-fg"
            >
              <X className="size-4" aria-hidden="true" />
            </Dialog.Close>
          </div>
          <div className="overflow-y-auto p-2" aria-live="polite">
            {error ? (
              <p className="px-3 py-6 text-center text-sm text-fg-muted">{labels.failed}</p>
            ) : isLoading && found.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-fg-muted">{labels.searching}</p>
            ) : data && found.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-fg-muted">
                {labels.empty.replace("{query}", data.query)}
              </p>
            ) : (
              <ul className="flex flex-col">
                {found.map((result) => {
                  // A result in English only, from another language's search,
                  // is a full page load (`i18n.md`).
                  const path = result.url.split("#")[0]
                  const Anchor = localePath(locale, unlocalizedPath(path)) === path ? Link : "a"
                  return (
                  <li key={result.id}>
                    <Anchor
                      href={result.url}
                      onClick={() => setOpen(false)}
                      className={`flex items-start gap-3 rounded-md px-3 py-2 text-sm hover:bg-bg focus-visible:bg-bg ${result.type === "page" ? "text-fg" : "ps-9 text-fg-muted"}`}
                    >
                      {result.type === "page" ? (
                        <FileText className="mt-0.5 size-4 shrink-0 text-fg-subtle" aria-hidden="true" />
                      ) : result.type === "heading" ? (
                        <Hash className="mt-0.5 size-4 shrink-0 text-fg-subtle" aria-hidden="true" />
                      ) : null}
                      <span className="line-clamp-2">{plain(result.content)}</span>
                    </Anchor>
                  </li>
                  )
                })}
              </ul>
            )}
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
