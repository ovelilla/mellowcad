import { Link as LinkIcon } from "lucide-react"
import type { MDXComponents } from "mdx/types"
import Link from "next/link"
import { Children, type ComponentProps, isValidElement, type ReactNode } from "react"

import { localePath } from "@/i18n/navigation"
import type { AppLocale } from "@/i18n/routing"
import { DOCS_PATH } from "@/lib/docs/packages"
import { isSession } from "@/lib/docs/sessions"

import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockHeader,
  CodeBlockLine,
  CodeBlockTitle,
} from "./code-block"
import { CodeBlockCopyButton } from "./code-block-copy-button"
import { DocsSession } from "./docs-session"

type Parent = { children?: ReactNode; className?: string }

/** The text a highlighted block shows, what its copy button copies. */
function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node)
  if (Array.isArray(node)) return node.map(textOf).join("")
  if (isValidElement<Parent>(node)) return textOf(node.props.children)
  return ""
}

/**
 * Shiki's lines (`span.line`, inside its `code`) as the Code Block's, each
 * marked by the notation its transformers read (`// [!code highlight]`,
 * `// [!code ++]`, `// [!code --]`). The newlines between them go: each line
 * is a block of its own.
 */
function codeLines(code: ReactNode): ReactNode {
  const lines = isValidElement<Parent>(code) ? code.props.children : code
  return Children.map(lines, (line) => {
    if (!isValidElement<Parent>(line)) return null
    const classes = line.props.className?.split(" ") ?? []
    const variant = classes.includes("add")
      ? "added"
      : classes.includes("remove")
        ? "removed"
        : classes.includes("highlighted")
          ? "highlighted"
          : "default"
    return <CodeBlockLine variant={variant}>{line.props.children}</CodeBlockLine>
  })
}

function heading(Tag: "h2" | "h3" | "h4", className: string) {
  return function Heading({ id, children }: ComponentProps<"h2">) {
    return (
      <Tag id={id} className={`group ${className}`}>
        {children}
        {id && (
          <a
            href={`#${id}`}
            aria-hidden="true"
            tabIndex={-1}
            className="ms-2 inline-block align-middle text-fg-subtle opacity-0 transition-opacity group-hover:opacity-100"
          >
            <LinkIcon className="size-4" />
          </a>
        )}
      </Tag>
    )
  }
}

/**
 * The docs' typography, in the landing's tokens. A link to another page of
 * the docs stays in the reader's language (`/es/docs/react`); the pages
 * themselves write it in English, as their Markdown keeps it.
 */
export function docsMdxComponents(
  locale: AppLocale,
  labels: { copy: string; copied: string }
): MDXComponents {
  return {
    h2: heading("h2", "mt-14 mb-4 text-h3 first:mt-0"),
    h3: heading("h3", "mt-10 mb-3 text-lg font-semibold"),
    h4: heading("h4", "mt-8 mb-2 font-semibold"),
    p: (props) => <p className="my-4 text-fg-muted" {...props} />,
    a: ({ href = "", children }: ComponentProps<"a">) => {
      if (href === DOCS_PATH || href.startsWith(`${DOCS_PATH}/`)) {
        return (
          <Link href={localePath(locale, href)} className="underline-link">
            {children}
          </Link>
        )
      }
      return (
        <a href={href} className="underline-link">
          {children}
        </a>
      )
    },
    strong: (props) => <strong className="font-semibold text-fg" {...props} />,
    ul: (props) => (
      <ul className="my-4 flex list-disc flex-col gap-2 ps-6 text-fg-muted marker:text-fg-subtle" {...props} />
    ),
    ol: (props) => (
      <ol className="my-4 flex list-decimal flex-col gap-2 ps-6 text-fg-muted marker:text-fg-subtle" {...props} />
    ),
    blockquote: (props) => (
      <blockquote className="my-4 border-s-2 border-border ps-4 text-fg-muted" {...props} />
    ),
    hr: () => <hr className="my-10 border-border" />,
    code: (props) => (
      // WHY ltr: code is a left-to-right run inside Arabic prose, isolated
      // as the catalogs isolate one (`i18n.md`). In a cell it breaks only
      // where it must: `anywhere` lets the table shrink its column to one
      // letter and split every name, and the table scrolls on its own.
      <code dir="ltr" className="rounded-sm bg-bg-raised px-1 py-0.5 font-mono text-[0.875em] wrap-anywhere text-fg [td_&]:wrap-break-word" {...props} />
    ),
    pre: ({
      title,
      children,
      className,
      style,
      "data-line-numbers": lineNumbers,
      "data-line-numbers-start": startLine,
      "data-wrap": wrap,
    }: ComponentProps<"pre"> & {
      "data-line-numbers"?: boolean
      "data-line-numbers-start"?: number
      "data-wrap"?: boolean
    }) => {
      const copy = (
        <CodeBlockActions>
          <CodeBlockCopyButton value={textOf(children)} labels={labels} />
        </CodeBlockActions>
      )
      return (
        <CodeBlock>
          {title ? (
            <CodeBlockHeader>
              <CodeBlockTitle>{title}</CodeBlockTitle>
              {copy}
            </CodeBlockHeader>
          ) : (
            copy
          )}
          <CodeBlockContent
            className={className}
            style={style}
            lineNumbers={lineNumbers}
            startLine={startLine}
            wrap={wrap}
          >
            {codeLines(children)}
          </CodeBlockContent>
        </CodeBlock>
      )
    },
    Session: ({ name }: { name: string }) => {
      if (!isSession(name)) throw new Error(`<Session name="${name}" /> names no session`)
      return <DocsSession id={name} locale={locale} />
    },
    table: (props) => (
      <div className="my-6 overflow-x-auto rounded-lg border border-border">
        <table className="w-full border-collapse text-start text-sm" {...props} />
      </div>
    ),
    th: (props) => (
      <th className="border-b border-border bg-bg-raised px-3 py-2 text-start font-medium text-fg" {...props} />
    ),
    td: (props) => (
      <td className="border-b border-border px-3 py-2 align-top text-fg-muted [tr:last-child_&]:border-b-0" {...props} />
    ),
  }
}
