"use client"

import * as React from "react"
import { Menu } from "@base-ui/react/menu"
import { CheckIcon } from "lucide-react"

import { CadEngine, EngineState, SnapType } from "@/cad"

import { cn } from "@/lib/utils"

/**
 * The object-snap override menu — AutoCAD's Shift+right-click behaviour. It pops
 * at the cursor during a point prompt and forces a single object snap (or
 * "None") for the *next* point, letting the user break snap collisions
 * deliberately instead of relying on the running-snap priority.
 *
 * Built on Base UI's `Menu` in controlled mode: the engine owns the open state
 * and position (there is no DOM trigger — the canvas belongs to the engine), so
 * `open` is driven from `state.snapOverrideMenu` and the popup is anchored to a
 * virtual element at the cursor. Base UI provides keyboard navigation, ARIA menu
 * semantics, on-screen collision avoidance, and a modal backdrop that absorbs
 * the dismiss click so it never falls through to the canvas as a placed point.
 */

type Choice = SnapType | "none"

/** The osnaps offered as overrides, in AutoCAD's menu order, plus "None". */
const CHOICES: ReadonlyArray<{ value: Choice; label: string }> = [
  { value: SnapType.Endpoint, label: "Endpoint" },
  { value: SnapType.Midpoint, label: "Midpoint" },
  { value: SnapType.Center, label: "Center" },
  { value: SnapType.Quadrant, label: "Quadrant" },
  { value: SnapType.Intersection, label: "Intersection" },
  { value: SnapType.ApparentIntersection, label: "Apparent Intersection" },
  { value: SnapType.Perpendicular, label: "Perpendicular" },
  { value: SnapType.Tangent, label: "Tangent" },
  { value: SnapType.Extension, label: "Extension" },
  { value: SnapType.Insertion, label: "Insertion" },
  { value: SnapType.Parallel, label: "Parallel" },
  { value: SnapType.Nearest, label: "Nearest" },
  { value: "none", label: "None" },
]

export function SnapOverrideMenu({
  engine,
  state,
}: {
  engine: CadEngine
  state: EngineState
}) {
  const at = state.snapOverrideMenu

  // A zero-size virtual anchor at the cursor: Base UI positions the popup
  // against it (and flips it to stay on screen near the viewport edges).
  const anchor = React.useMemo(
    () =>
      at
        ? { getBoundingClientRect: () => new DOMRect(at.x, at.y, 0, 0) }
        : null,
    [at]
  )

  return (
    <Menu.Root
      open={!!at}
      onOpenChange={(open) => {
        if (!open) engine.closeSnapOverrideMenu()
      }}
    >
      <Menu.Portal>
        <Menu.Backdrop />
        <Menu.Positioner
          anchor={anchor}
          positionMethod="fixed"
          side="right"
          align="start"
          sideOffset={2}
          className="z-50"
        >
          <Menu.Popup className="min-w-44 origin-(--transform-origin) overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md transition-[transform,opacity] outline-none data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
            <div className="px-2 py-1.5 text-xs text-muted-foreground">
              Point
            </div>
            <Menu.Item
              onClick={() => engine.startFrom()}
              className="relative flex cursor-default items-center rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground"
            >
              From
            </Menu.Item>
            <div className="px-2 py-1.5 text-xs text-muted-foreground">
              Object snap
            </div>
            {CHOICES.map(({ value, label }) => (
              <Menu.Item
                key={value}
                onClick={() => engine.setSnapOverride(value)}
                className={cn(
                  "relative flex cursor-default items-center rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground",
                  state.snapOverride === value && "font-medium"
                )}
              >
                {label}
                {state.snapOverride === value && (
                  <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center">
                    <CheckIcon className="size-4" />
                  </span>
                )}
              </Menu.Item>
            ))}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}
