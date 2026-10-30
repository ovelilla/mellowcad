"use client"

import type { TOCItemType } from "fumadocs-core/toc"
import {
  Children,
  cloneElement,
  isValidElement,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react"

// Below the sticky bar (h-16) with a little air: a heading under this line
// has been scrolled to.
const READ_LINE = 96

/** A title with a break opportunity after each `/`: an import path wraps there. */
function breakAtSlashes(node: ReactNode): ReactNode {
  if (typeof node === "string") {
    return node.split(/(?<=\/)/).flatMap((part, index) =>
      index === 0 ? [part] : [<wbr key={index} />, part]
    )
  }
  if (isValidElement<{ children?: ReactNode }>(node) && node.props.children) {
    return cloneElement(node, undefined, Children.map(node.props.children, breakAtSlashes))
  }
  return node
}

/**
 * "On this page": the page's sections and their subsections. The section
 * being read is the last whose heading has passed under the bar — at the
 * bottom of the page, the last one — and the list keeps it in view.
 * WHY not fumadocs' anchors: they mark the headings in view, so a section
 * longer than the screen (an API report's) lost its mark, and a short one
 * marked the next.
 */
export function DocsToc({
  items,
  title,
}: {
  items: TOCItemType[]
  title: string
}) {
  const shown = items.filter((item) => item.depth <= 3)
  const list = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<string | undefined>(undefined)

  useEffect(() => {
    const headings = shown
      .map((item) => document.getElementById(decodeURIComponent(item.url.slice(1))))
      .filter((heading) => heading !== null)
    let frame = 0
    const update = () => {
      frame = 0
      const atEnd =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
      const passed = headings.filter(
        (heading) => heading.getBoundingClientRect().top <= READ_LINE
      )
      const current = atEnd ? headings.at(-1) : passed.at(-1)
      setActive(current ? `#${current.id}` : undefined)
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule)
    return () => {
      window.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
      cancelAnimationFrame(frame)
    }
    // The headings are the page's: they change only with the items.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items])

  useEffect(() => {
    const container = list.current
    const link = container?.querySelector<HTMLElement>('[aria-current="location"]')
    if (!container || !link) return
    const top = link.offsetTop - container.offsetTop
    if (top < container.scrollTop || top + link.offsetHeight > container.scrollTop + container.clientHeight) {
      container.scrollTop = top - container.clientHeight / 2
    }
  }, [active])

  if (shown.length === 0) return null
  return (
    <nav aria-label={title} className="flex max-h-full flex-col text-sm">
      <p className="mb-3 label-mono">{title}</p>
      <div
        ref={list}
        className="relative min-h-0 overflow-x-hidden overflow-y-auto overscroll-contain"
      >
        <ul className="flex flex-col gap-2 border-s border-border">
          {shown.map((item) => (
            <li key={item.url}>
              <a
                href={item.url}
                aria-current={item.url === active ? "location" : undefined}
                className={`-ms-px block border-s border-transparent [overflow-wrap:break-word] text-fg-muted transition-colors hover:text-fg aria-[current=location]:border-fg aria-[current=location]:text-fg ${item.depth > 2 ? "ps-6" : "ps-3"}`}
              >
                {breakAtSlashes(item.title)}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
