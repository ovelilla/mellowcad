"use client"

import { Menu } from "@base-ui/react/menu"
import { CheckIcon } from "lucide-react"

import { VIEW_MENU, type CadEngine } from "@mellowcad/engine"
import type { EditorState } from "@/hooks/useCadEngine"
import { cn } from "@/lib/utils"
import { usePortalContainer } from "@/components/ui/portal-container"
import { useEditorText } from "./editor-text"

/**
 * The viewport controls at the drawing's top left (VPCONTROL 1), of which
 * only the view control exists: `[Top]`, naming the view the engine says the
 * camera shows, opens the preset views and runs the one chosen as AutoCAD's
 * `'_-view _swiso`.
 */
export function ViewportControls({
  engine,
  state,
}: {
  engine: CadEngine
  state: EditorState
}) {
  const portal = usePortalContainer()
  const t = useEditorText("Viewport")
  const names = state.names.views
  const current = state.view.preset
  const name = names[current ?? "custom"]
  // WHY: while a command runs AutoCAD's label does not answer, and the click
  // is the command's point (desktop view/d06, VIEW-D66).
  const running = state.commandLine.command !== null

  return (
    <Menu.Root>
      {/* The brackets are AutoCAD's label, drawn by CSS: they are notation,
          not words. */}
      <Menu.Trigger
        aria-label={t("view", { name })}
        className={cn(
          "pointer-events-auto rounded-sm px-1 py-0.5 text-muted-foreground outline-none select-none before:content-['['] after:content-[']'] hover:bg-card/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-popup-open:bg-card/60 data-popup-open:text-foreground",
          running && "pointer-events-none"
        )}
      >
        {name}
      </Menu.Trigger>
      <Menu.Portal container={portal}>
        <Menu.Positioner
          side="bottom"
          align="start"
          sideOffset={4}
          className="z-50"
        >
          <Menu.Popup className="min-w-44 origin-(--transform-origin) overflow-hidden rounded-md border bg-card/90 p-1 text-popover-foreground shadow-md backdrop-blur transition-[transform,opacity] outline-none data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
            {VIEW_MENU.map((preset) => (
              <Menu.Item
                key={preset}
                onClick={() => engine.applyViewPreset(preset)}
                className="relative flex cursor-default items-center rounded-sm py-1.5 ps-2 pe-8 text-ui outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground"
              >
                {names[preset]}
                {current === preset && (
                  <span className="pointer-events-none absolute inset-e-2 flex size-4 items-center justify-center text-primary">
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
