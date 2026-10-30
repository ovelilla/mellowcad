import type { TOCItemType } from "fumadocs-core/toc"

/** "On this page": the page's sections and their subsections. */
export function DocsToc({ items, title }: { items: TOCItemType[]; title: string }) {
  const shown = items.filter((item) => item.depth <= 3)
  if (shown.length === 0) return null
  return (
    <nav aria-label={title} className="text-sm">
      <p className="mb-3 label-mono">{title}</p>
      <ul className="flex flex-col gap-2 border-s border-border">
        {shown.map((item) => (
          <li key={item.url}>
            <a
              href={item.url}
              className={`-ms-px block border-s border-transparent text-fg-muted transition-colors hover:border-fg-subtle hover:text-fg ${item.depth > 2 ? "ps-6" : "ps-3"}`}
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
