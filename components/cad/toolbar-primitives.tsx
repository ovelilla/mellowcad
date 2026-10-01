"use client"

import { type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

/** A logical side follows the page's direction; a physical one never moves. */
export type Side =
  "top" | "bottom" | "inline-start" | "inline-end" | "left" | "right"

/** An icon button with a tooltip — the atom every toolbar region is built from. */
export function IconAction({
  icon: Icon,
  label,
  shortcut,
  onClick,
  active = false,
  disabled = false,
  mirrored = false,
  side = "inline-end",
  className,
}: {
  icon: LucideIcon
  label: string
  shortcut?: string
  onClick: () => void
  active?: boolean
  disabled?: boolean
  /**
   * An icon of linear direction or of time (undo, redo, zoom previous), which
   * reverses in a right-to-left page; a rotation or a CAD glyph never does.
   */
  mirrored?: boolean
  side?: Side
  className?: string
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            size="icon-sm"
            variant={active ? "active" : "ghost"}
            disabled={disabled}
            onClick={onClick}
            aria-label={label}
            aria-pressed={active}
            className={className}
          >
            <Icon className={cn(mirrored && "rtl:-scale-x-100")} />
          </Button>
        }
      />
      <TooltipContent side={side}>
        <span className="flex items-center gap-2">
          {label}
          {shortcut && (
            <kbd
              dir="ltr"
              className="rounded border border-border/60 bg-muted px-1 font-mono text-[10px] text-muted-foreground"
            >
              {shortcut}
            </kbd>
          )}
        </span>
      </TooltipContent>
    </Tooltip>
  )
}

/** A floating rounded container shared by every toolbar region. */
export function Panel({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "pointer-events-auto flex gap-1 rounded-lg bg-card/90 p-1 backdrop-blur",
        className
      )}
    >
      {children}
    </div>
  )
}
