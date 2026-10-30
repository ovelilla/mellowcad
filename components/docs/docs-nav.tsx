import type { Node, Root } from "fumadocs-core/page-tree"
import Link from "next/link"

function NavLink({
  url,
  name,
  active,
  strong,
}: {
  url: string
  name: React.ReactNode
  active: string
  strong?: boolean
}) {
  return (
    <Link
      href={url}
      aria-current={url === active ? "page" : undefined}
      className={`block rounded-md px-3 py-1.5 transition-colors hover:bg-bg-raised hover:text-fg aria-[current=page]:bg-bg-raised aria-[current=page]:text-fg ${strong ? "font-medium text-fg" : "text-fg-muted"}`}
    >
      {name}
    </Link>
  )
}

function NavNode({ node, active }: { node: Node; active: string }) {
  if (node.type === "separator") {
    return <li className="mt-4 px-3 label-mono first:mt-0">{node.name}</li>
  }
  if (node.type === "page") {
    return (
      <li>
        <NavLink url={node.url} name={node.name} active={active} />
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

/** The docs' sections and pages, the page being read marked as current. */
export function DocsNav({
  tree,
  active,
  title,
  label,
}: {
  tree: Root
  active: string
  title: string
  label: string
}) {
  return (
    <nav aria-label={label} className="text-sm">
      <p className="mb-2 px-3 label-mono">{title}</p>
      <ul className="flex flex-col gap-3">
        {tree.children.map((node, index) => (
          <NavNode key={node.$id ?? index} node={node} active={active} />
        ))}
      </ul>
    </nav>
  )
}
