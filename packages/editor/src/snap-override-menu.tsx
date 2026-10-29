"use client"

import * as React from "react"
import { Menu } from "@base-ui/react/menu"
import { CheckIcon } from "lucide-react"

import { CadEngine, SnapType } from "@mellowcad/engine"
import type { EditorState } from "@mellowcad/react"
import { usePortalContainer } from "./ui/portal-container"
import { useEditorText } from "./editor-text"

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

/** The popup of a menu at the cursor: this one, the shortcut menu's. */
export const MENU_AT_CURSOR =
  "min-w-44 origin-(--transform-origin) overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md transition-[transform,opacity] outline-none data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0"

/**
 * The object snaps as AutoCAD's Shift+right-click menu groups them (desktop
 * d06), for the ones that exist here: Temporary track point, Mid Between 2
 * Points, Point Filters, 3D Osnap, Geometric Center, Node and Osnap Settings
 * are left out until they are built.
 */
const GROUPS: readonly (readonly Choice[])[] = [
  [
    SnapType.Endpoint,
    SnapType.Midpoint,
    SnapType.Intersection,
    SnapType.ApparentIntersection,
    SnapType.Extension,
  ],
  [SnapType.Center, SnapType.Quadrant, SnapType.Tangent],
  [
    SnapType.Perpendicular,
    SnapType.Parallel,
    SnapType.Insertion,
    SnapType.Nearest,
    "none",
  ],
]

/** The rule between a menu's groups: this one's, the shortcut menu's. */
export const SEPARATOR = "-mx-1 my-1 h-px bg-border"

const ITEM =
  "relative flex cursor-default items-center rounded-sm py-1.5 ps-2 pe-8 text-ui outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground"

/**
 * The override menu's entries: FROM and the object snaps. The shortcut menu's
 * Osnap Overrides submenu lists the same ones.
 */
export function SnapOverrideItems({
  engine,
  state,
}: {
  engine: CadEngine
  state: EditorState
}): React.ReactElement {
  const t = useEditorText("SnapOverride")
  return (
    <>
      <Menu.Item onClick={() => engine.startFrom()} className={ITEM}>
        {t("from")}
      </Menu.Item>
      {GROUPS.map((group) => (
        <React.Fragment key={group[0]}>
          <Menu.Separator className={SEPARATOR} />
          {group.map((value) => (
            <Menu.Item
              key={value}
              onClick={() => engine.setSnapOverride(value)}
              className={ITEM}
            >
              {value === "none" ? t("none") : state.names.snaps[value]}
              {state.snapOverride === value && (
                <span className="pointer-events-none absolute inset-e-2 flex size-4 items-center justify-center">
                  <CheckIcon className="size-4" />
                </span>
              )}
            </Menu.Item>
          ))}
        </React.Fragment>
      ))}
    </>
  )
}

export function SnapOverrideMenu({
  engine,
  state,
}: {
  engine: CadEngine
  state: EditorState
}): React.ReactElement {
  const portal = usePortalContainer()
  const at = state.snapOverrideMenu

  // A zero-size virtual anchor at the cursor: Base UI positions the popup
  // against it (and flips it to stay on screen near the viewport edges). The
  // state speaks the canvas's pixels; the popup is placed in the viewport's.
  const anchor = React.useMemo(
    () =>
      at
        ? {
            getBoundingClientRect: () => {
              const { x, y } = engine.clientFromScreen(at)
              return new DOMRect(x, y, 0, 0)
            },
          }
        : null,
    [engine, at]
  )

  return (
    <Menu.Root
      open={!!at}
      onOpenChange={(open) => {
        if (!open) engine.closeSnapOverrideMenu()
      }}
    >
      <Menu.Portal container={portal}>
        <Menu.Backdrop />
        <Menu.Positioner
          anchor={anchor}
          positionMethod="fixed"
          side="inline-end"
          align="start"
          sideOffset={2}
          className="z-50"
        >
          <Menu.Popup className={MENU_AT_CURSOR}>
            <SnapOverrideItems engine={engine} state={state} />
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}
