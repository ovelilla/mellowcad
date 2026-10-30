import { cva, type VariantProps } from "class-variance-authority"
import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

// shadcn's Code Block (Base UI, October 2026) in the landing's tokens. Shiki
// colours the code at build time, so these parts render on the server and
// only the copy button (`code-block-copy-button.tsx`) is an island.

const codeBlockVariants = cva(
  "group/code-block relative my-6 flex w-full min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-bg-sunken text-sm has-[>[data-slot=code-block-content]:focus-visible]:outline-2 has-[>[data-slot=code-block-content]:focus-visible]:outline-offset-2 has-[>[data-slot=code-block-content]:focus-visible]:outline-accent data-[size=sm]:text-xs"
)

function CodeBlock({
  className,
  size = "default",
  ...props
}: ComponentProps<"div"> & VariantProps<typeof codeBlockVariants> & { size?: "default" | "sm" }) {
  return (
    <div
      data-slot="code-block"
      data-size={size}
      dir="ltr"
      className={cn(codeBlockVariants(), className)}
      {...props}
    />
  )
}

function CodeBlockHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="code-block-header"
      className={cn(
        "flex min-h-10 min-w-0 shrink-0 items-center gap-2 border-b border-border px-4 text-fg-subtle group-data-[size=sm]/code-block:px-3 *:has-[>[data-slot=code-block-title]]:min-w-0",
        className
      )}
      {...props}
    />
  )
}

function CodeBlockTitle({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="code-block-title"
      className={cn("data-mono min-w-0 truncate text-xs text-fg-subtle", className)}
      {...props}
    />
  )
}

function CodeBlockActions({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="code-block-actions"
      className={cn(
        "ms-auto -me-2 flex shrink-0 items-center gap-1 [[data-slot=code-block]>&]:absolute [[data-slot=code-block]>&]:end-2 [[data-slot=code-block]>&]:top-2 [[data-slot=code-block]>&]:z-10 [[data-slot=code-block]>&]:m-0 [[data-slot=code-block]>&]:opacity-0 [[data-slot=code-block]>&]:transition-opacity [[data-slot=code-block]>&]:group-focus-within/code-block:opacity-100 [[data-slot=code-block]>&]:group-hover/code-block:opacity-100 [[data-slot=code-block]>&]:pointer-coarse:opacity-100 [[data-slot=code-block]>&]:*:[button]:bg-bg-raised [[data-slot=code-block]>&]:*:[button]:ring-1 [[data-slot=code-block]>&]:*:[button]:ring-border",
        className
      )}
      {...props}
    />
  )
}

function CodeBlockContent({
  className,
  children,
  style,
  wrap = false,
  lineNumbers = false,
  startLine = 1,
  ...props
}: ComponentProps<"pre"> & {
  wrap?: boolean
  lineNumbers?: boolean
  startLine?: number
}) {
  return (
    <pre
      data-slot="code-block-content"
      data-wrap={wrap || undefined}
      data-numbered={lineNumbers || undefined}
      dir="ltr"
      tabIndex={0}
      style={{ counterReset: `line ${startLine - 1}`, ...style }}
      className={cn(
        "min-h-0 min-w-0 overflow-auto p-4 text-start font-mono text-[0.8125rem] leading-relaxed outline-none group-data-[size=sm]/code-block:p-3 data-wrap:wrap-anywhere data-wrap:whitespace-pre-wrap",
        className
      )}
      {...props}
    >
      <code
        data-slot="code-block-code"
        className="grid min-h-lh min-w-max grid-cols-[minmax(0,1fr)] content-start in-data-numbered:grid-cols-[auto_minmax(0,1fr)] in-data-wrap:min-w-0"
      >
        {lineNumbers && typeof children === "string"
          ? children
              .replace(/\n$/, "")
              .split("\n")
              .map((line, index) => <CodeBlockLine key={index}>{line}</CodeBlockLine>)
          : children}
      </code>
    </pre>
  )
}

const codeBlockLineVariants = cva(
  "relative -mx-4 block min-h-lh px-4 group-data-[size=sm]/code-block:-mx-3 group-data-[size=sm]/code-block:px-3 before:min-w-6 before:text-end before:text-fg-subtle after:absolute after:start-1 after:top-0 after:text-fg-subtle after:select-none in-data-numbered:col-span-2 in-data-numbered:grid in-data-numbered:grid-cols-subgrid in-data-numbered:gap-x-3 in-data-numbered:[counter-increment:line] in-data-numbered:before:content-[counter(line)] in-data-numbered:before:select-none in-data-numbered:supports-[content:counter(line)_/_'']:before:content-[counter(line)_/_'']",
  {
    variants: {
      variant: {
        default: "",
        added: "bg-code-added after:text-code-added-sign after:content-['+']",
        removed: "bg-code-removed after:text-code-removed-sign after:content-['−']",
        highlighted: "bg-code-highlight",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function CodeBlockLine({
  className,
  variant = "default",
  children,
  ...props
}: ComponentProps<"span"> & VariantProps<typeof codeBlockLineVariants>) {
  // An empty line holds a newline so copying a selection keeps blank lines.
  const empty =
    children === undefined ||
    children === null ||
    children === "" ||
    (Array.isArray(children) && children.length === 0)

  return (
    <span
      data-slot="code-block-line"
      data-variant={variant}
      className={cn(codeBlockLineVariants({ variant }), className)}
      {...props}
    >
      <span data-slot="code-block-line-content" className="min-w-0">
        {empty ? "\n" : children}
      </span>
    </span>
  )
}

function CodeBlockFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="code-block-footer"
      className={cn(
        "flex min-w-0 shrink-0 items-center gap-2 px-4 pb-4 text-fg-subtle group-data-[size=sm]/code-block:px-3 group-data-[size=sm]/code-block:pb-3",
        className
      )}
      {...props}
    />
  )
}

export {
  CodeBlock,
  CodeBlockHeader,
  CodeBlockTitle,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockLine,
  CodeBlockFooter,
}
