"use client"

import * as React from "react"
import { Menu } from "@base-ui/react/menu"
import { CheckIcon } from "lucide-react"
import { useTranslations } from "next-intl"

import { CadEngine } from "@mellowcad/engine"
import type { EditorState } from "@/hooks/useCadEngine"

import { cn } from "@/lib/utils"

/**
 * AutoCAD's Selection list box: with selection cycling set to show the list
 * (SELECTIONCYCLING 2), clicking where objects overlap asks which one was
 * meant instead of taking the topmost. Hovering a row highlights that object on
 * the canvas; choosing one replays the click against it.
 *
 * Controlled Base UI `Menu` anchored to a virtual element at the click, exactly
 * like the object-snap override menu — the canvas is engine-owned, so there is
 * no DOM trigger.
 */
export function SelectionCyclingList({
  engine,
  state,
}: {
  engine: CadEngine
  state: EditorState
}) {
  const t = useTranslations("Editor.SelectionCycling")
  const { candidates, currentId, listAt } = state.selectionCycling

  const anchor = React.useMemo(
    () =>
      listAt
        ? {
            getBoundingClientRect: () => {
              const { x, y } = engine.clientFromScreen(listAt)
              return new DOMRect(x, y, 0, 0)
            },
          }
        : null,
    [engine, listAt]
  )

  return (
    <Menu.Root
      open={!!listAt}
      onOpenChange={(open) => {
        if (!open) engine.closeCyclingList()
      }}
    >
      <Menu.Portal>
        <Menu.Backdrop />
        <Menu.Positioner
          anchor={anchor}
          positionMethod="fixed"
          side="inline-end"
          align="start"
          sideOffset={2}
          className="z-50"
        >
          <Menu.Popup className="min-w-44 origin-(--transform-origin) overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md transition-[transform,opacity] outline-none data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
            <div className="px-2 py-1.5 text-title text-muted-foreground">
              {t("title")}
            </div>
            {candidates.map((candidate) => (
              <Menu.Item
                key={candidate.id}
                onMouseEnter={() =>
                  engine.previewCyclingCandidate(candidate.id)
                }
                onClick={() => engine.chooseCyclingCandidate(candidate.id)}
                className={cn(
                  "relative flex cursor-default items-center rounded-sm py-1.5 ps-2 pe-8 text-ui outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground"
                )}
              >
                {candidate.label}
                {candidate.id === currentId && (
                  <span className="pointer-events-none absolute inset-e-2 flex size-4 items-center justify-center">
                    <CheckIcon className="size-4" />
                  </span>
                )}
              </Menu.Item>
            ))}
            {/* AutoCAD's last row: the click selects nothing (desktop erase/d12-2). */}
            <Menu.Item
              onClick={() => engine.closeCyclingList()}
              className="relative flex cursor-default items-center rounded-sm py-1.5 ps-2 pe-8 text-ui outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground"
            >
              {t("none")}
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}
