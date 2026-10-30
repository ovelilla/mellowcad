import { Link as LinkIcon } from "lucide-react"
import type { MDXComponents } from "mdx/types"
import Link from "next/link"
import type { ComponentProps, ReactNode } from "react"

import { localePath } from "@/i18n/navigation"
import type { AppLocale } from "@/i18n/routing"
import { DOCS_PATH } from "@/lib/docs/packages"

import { CopyCode } from "./copy-code"

function heading(Tag: "h2" | "h3" | "h4", className: string) {
  return function Heading({ id, children }: ComponentProps<"h2">) {
    return (
      <Tag id={id} className={`group scroll-mt-24 ${className}`}>
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
      <code
        className="rounded-sm bg-bg-raised px-1 py-0.5 font-mono text-[0.875em] text-fg [pre_&]:bg-transparent [pre_&]:p-0 [pre_&]:text-[0.8125rem]"
        {...props}
      />
    ),
    pre: ({
      title,
      children,
      className,
      style,
    }: ComponentProps<"pre"> & { children?: ReactNode }) => (
      <figure dir="ltr" className="code-block my-6 overflow-hidden rounded-lg border border-border bg-bg-sunken">
        <div className="flex min-h-10 items-center justify-between gap-4 border-b border-border px-4">
          <figcaption className="data-mono truncate text-xs text-fg-subtle">{title}</figcaption>
          <CopyCode labels={labels} />
        </div>
        <pre
          className={`${className ?? ""} overflow-x-auto p-4 leading-relaxed`}
          style={style}
          tabIndex={0}
        >
          {children}
        </pre>
      </figure>
    ),
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
