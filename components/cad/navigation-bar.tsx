"use client"

import { useState } from "react"
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
import { useTranslations } from "next-intl"

import type { CadEngine, EngineState } from "@/cad"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { TooltipProvider } from "@/components/ui/tooltip"

import { ZoomPreviousIcon } from "./icons"
import { IconAction } from "./toolbar-primitives"

type ZoomId = "extents" | "window" | "previous" | "in" | "out"

interface ZoomMember {
  readonly id: ZoomId
  readonly icon: LucideIcon
  readonly mirrored?: boolean
  readonly run: (engine: CadEngine) => void
}

/**
 * The Zoom drop-down's members that exist here, in the ribbon's order
 * (Extents, Window, Previous, …, In, Out); Realtime, All, Dynamic, Scale,
 * Center and Object are not offered. Except Window, which is the ZOOM
 * command, they act on the view at once, so they work in the middle of a
 * command as AutoCAD's transparent zooms do.
 */
const ZOOM: readonly ZoomMember[] = [
  { id: "extents", icon: Maximize, run: (engine) => engine.zoomToFit() },
  { id: "window", icon: Search, run: (engine) => engine.setActiveTool("zoom") },
  {
    id: "previous",
    icon: ZoomPreviousIcon,
    mirrored: true,
    run: (engine) => engine.zoomPrevious(),
  },
  { id: "in", icon: ZoomIn, run: (engine) => engine.zoomIn() },
  { id: "out", icon: ZoomOut, run: (engine) => engine.zoomOut() },
]

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
  state: EngineState
}) {
  const t = useTranslations("Editor.NavigationBar")
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
          onClick={() => engine.setActiveTool("pan")}
        />
        <ZoomSplitButton engine={engine} state={state} />
        <IconAction
          icon={Rotate3d}
          label={orbit?.label ?? "orbit"}
          shortcut={orbit?.shortcut?.toUpperCase()}
          side="inline-start"
          active={state.activeToolId === "orbit"}
          onClick={() => engine.setActiveTool("orbit")}
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
  state: EngineState
}) {
  const t = useTranslations("Editor.NavigationBar")
  const [face, setFace] = useState<ZoomId>("extents")
  const shown = ZOOM.find((member) => member.id === face) ?? ZOOM[0]
  const windowAlias = state.tools
    .find((entry) => entry.id === "zoom")
    ?.shortcut?.toUpperCase()
  const windowActive = state.activeToolId === "zoom"
  const use = (member: ZoomMember) => {
    setFace(member.id)
    member.run(engine)
  }

  return (
    <div className="flex flex-col items-center">
      <IconAction
        icon={shown.icon}
        mirrored={shown.mirrored}
        label={t(shown.id)}
        shortcut={shown.id === "window" ? windowAlias : undefined}
        side="inline-start"
        active={shown.id === "window" && windowActive}
        onClick={() => use(shown)}
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
        <Menu.Portal>
          <Menu.Positioner
            side="inline-start"
            align="start"
            sideOffset={8}
            className="z-50"
          >
            <Menu.Popup className="min-w-44 origin-(--transform-origin) overflow-hidden rounded-md border bg-card/90 p-1 text-popover-foreground shadow-md backdrop-blur transition-[transform,opacity] outline-none data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
              {ZOOM.map((member) => {
                const Icon = member.icon
                return (
                  <Menu.Item
                    key={member.id}
                    onClick={() => use(member)}
                    className={cn(
                      "flex cursor-default items-center gap-2 rounded-sm py-1.5 ps-2 pe-2 text-ui outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground",
                      member.id === "window" &&
                        windowActive &&
                        "bg-active/15 text-active-foreground"
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-4 shrink-0",
                        member.mirrored && "rtl:-scale-x-100"
                      )}
                    />
                    <span className="flex-1">{t(member.id)}</span>
                    {member.id === "window" && windowAlias && (
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
