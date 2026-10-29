"use client"

import { useState, type ReactElement } from "react"
import { Menu } from "@base-ui/react/menu"
import {
  ChevronDown,
  Hand,
  Maximize,
  Rotate3d,
  Search,
  ZoomIn,
  ZoomOut,
  type LucideIcon,
} from "lucide-react"

import { ZOOM_MENU, type CadEngine, type ZoomOption } from "@mellowcad/engine"
import type { EditorState } from "@mellowcad/react"
import { cn } from "./utils"
import { Button } from "./ui/button"
import { TooltipProvider } from "./ui/tooltip"
import { usePortalContainer } from "./ui/portal-container"

import { ZoomPreviousIcon } from "./icons"
import { IconAction } from "./toolbar-primitives"
import { useEditorText } from "./editor-text"

/** The Zoom members' icons; `mirrored` for one of time. */
const ZOOM_ICONS: Record<ZoomOption, { icon: LucideIcon; mirrored?: boolean }> =
  {
    extents: { icon: Maximize },
    window: { icon: Search },
    previous: { icon: ZoomPreviousIcon, mirrored: true },
    in: { icon: ZoomIn },
    out: { icon: ZoomOut },
  }

/**
 * AutoCAD's navigation bar (NAVBARDISPLAY 1), linked to the ViewCube: a
 * vertical strip under it with Pan, the Zoom split button and Orbit. The
 * SteeringWheels and ShowMotion do not exist here. Its menus open towards the
 * middle of the drawing, the bar's inline start.
 */
export function NavigationBar({
  engine,
  state,
}: {
  engine: CadEngine
  state: EditorState
}): ReactElement {
  const t = useEditorText("NavigationBar")
  const tool = (id: string) => state.tools.find((entry) => entry.id === id)
  const pan = tool("pan")
  const orbit = tool("orbit")

  return (
    <TooltipProvider>
      <div
        role="toolbar"
        aria-orientation="vertical"
        aria-label={t("label")}
        className="pointer-events-auto flex flex-col items-center gap-0.5 rounded-md border bg-card/90 p-0.5 shadow-md backdrop-blur"
      >
        <IconAction
          icon={Hand}
          label={pan?.label ?? "pan"}
          shortcut={pan?.shortcut?.toUpperCase()}
          side="inline-start"
          active={state.activeToolId === "pan"}
          onClick={() => engine.navigate("PAN")}
        />
        <ZoomSplitButton engine={engine} state={state} />
        <IconAction
          icon={Rotate3d}
          label={orbit?.label ?? "orbit"}
          shortcut={orbit?.shortcut?.toUpperCase()}
          side="inline-start"
          active={state.activeToolId === "orbit"}
          onClick={() => engine.navigate("3DORBIT")}
        />
      </div>
    </TooltipProvider>
  )
}

/**
 * A split button, as the bar's Zoom is: the larger part runs the member it
 * shows — the last one used, Extents at first — and the arrow under it lists
 * them all with their names.
 */
function ZoomSplitButton({
  engine,
  state,
}: {
  engine: CadEngine
  state: EditorState
}) {
  const portal = usePortalContainer()
  const t = useEditorText("NavigationBar")
  const [face, setFace] = useState<ZoomOption>(ZOOM_MENU[0])
  const shown = ZOOM_ICONS[face]
  const windowAlias = state.tools
    .find((entry) => entry.id === "zoom")
    ?.shortcut?.toUpperCase()
  const windowActive = state.activeToolId === "zoom"
  const use = (option: ZoomOption) => {
    setFace(option)
    engine.zoom(option)
  }

  return (
    <div className="flex flex-col items-center">
      <IconAction
        icon={shown.icon}
        mirrored={shown.mirrored}
        label={t(face)}
        shortcut={face === "window" ? windowAlias : undefined}
        side="inline-start"
        active={face === "window" && windowActive}
        onClick={() => use(face)}
      />
      <Menu.Root>
        <Menu.Trigger
          render={
            <Button
              variant="ghost"
              aria-label={t("zoom")}
              // Half of the 28 px button above it, as the status bar's
              // arrows are of their modes, laid under it.
              className="h-3.5 w-7 rounded-sm p-0 text-muted-foreground"
            >
              <ChevronDown className="size-3!" />
            </Button>
          }
        />
        <Menu.Portal container={portal}>
          <Menu.Positioner
            side="inline-start"
            align="start"
            sideOffset={8}
            className="z-50"
          >
            <Menu.Popup className="min-w-44 origin-(--transform-origin) overflow-hidden rounded-md border bg-card/90 p-1 text-popover-foreground shadow-md backdrop-blur transition-[transform,opacity] outline-none data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
              {ZOOM_MENU.map((option) => {
                const { icon: Icon, mirrored } = ZOOM_ICONS[option]
                return (
                  <Menu.Item
                    key={option}
                    onClick={() => use(option)}
                    className={cn(
                      "flex cursor-default items-center gap-2 rounded-sm py-1.5 ps-2 pe-2 text-ui outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground",
                      option === "window" &&
                        windowActive &&
                        "bg-active/15 text-active-foreground"
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-4 shrink-0",
                        mirrored && "rtl:-scale-x-100"
                      )}
                    />
                    <span className="flex-1">{t(option)}</span>
                    {option === "window" && windowAlias && (
                      <kbd
                        dir="ltr"
                        className="ms-4 font-mono text-muted-foreground"
                      >
                        {windowAlias}
                      </kbd>
                    )}
                  </Menu.Item>
                )
              })}
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
    </div>
  )
}
