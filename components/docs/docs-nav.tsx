import type { Node } from "fumadocs-core/page-tree"
import Link from "next/link"

function NavLink({
  url,
  name,
  active,
  strong,
  hrefLang,
}: {
  url: string
  name: React.ReactNode
  active: string
  strong?: boolean
  hrefLang?: string
}) {
  const className = `block rounded-md px-3 py-1.5 transition-colors hover:bg-bg-raised hover:text-fg aria-[current=page]:bg-bg-raised aria-[current=page]:text-fg ${strong ? "font-medium text-fg" : "text-fg-muted"}`
  // A page in another language is a full page load (`i18n.md`), named in it.
  if (hrefLang) {
    return (
      <a href={url} hrefLang={hrefLang} lang={hrefLang} className={className}>
        {name}
      </a>
    )
  }
  return (
    <Link
      href={url}
      prefetch={false}
      aria-current={url === active ? "page" : undefined}
      className={className}
    >
      {name}
    </Link>
  )
}

function NavNode({
  node,
  active,
  hrefLang,
}: {
  node: Node
  active: string
  hrefLang?: string
}) {
  if (node.type === "separator") {
    return <li className="mt-4 px-3 label-mono first:mt-0">{node.name}</li>
  }
  if (node.type === "page") {
    return (
      <li>
        <NavLink url={node.url} name={node.name} active={active} hrefLang={hrefLang} />
      </li>
    )
  }
  return (
    <li className="flex flex-col gap-0.5">
      {node.index ? (
        <NavLink url={node.index.url} name={node.name} active={active} strong />
      ) : (
        <span className="px-3 py-1.5 font-medium text-fg">{node.name}</span>
      )}
      <ul className="ms-3 flex flex-col gap-0.5 border-s border-border ps-2">
        {node.children.map((child, index) => (
          <NavNode key={child.$id ?? index} node={child} active={active} />
        ))}
      </ul>
    </li>
  )
}

/**
 * The docs' sections and pages, the page being read marked as current. A
 * section in another language (`hrefLang`) says so under its title (`note`).
 */
export function DocsNav({
  sections,
  active,
  label,
}: {
  sections: { title: string; nodes: Node[]; note?: string; hrefLang?: string }[]
  active: string
  label: string
}) {
  return (
    <nav aria-label={label} className="flex flex-col gap-8 text-sm">
      {sections.map(({ title, nodes, note, hrefLang }) => (
        <div key={title}>
          <p className="mb-2 px-3 label-mono">{title}</p>
          {note && <p className="-mt-1 mb-2 px-3 text-xs text-fg-subtle">{note}</p>}
          <ul
            className={`flex flex-col ${nodes.every((node) => node.type === "page") ? "gap-0.5" : "gap-3"}`}
          >
            {nodes.map((node, index) => (
              <NavNode key={node.$id ?? index} node={node} active={active} hrefLang={hrefLang} />
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}
