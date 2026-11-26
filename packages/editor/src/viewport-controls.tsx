"use client"

import type { ReactElement, ReactNode } from "react"
import { Menu } from "@base-ui/react/menu"
import { CheckIcon } from "lucide-react"

import { VIEW_MENU, type VisualStyle } from "@mellowcad/engine"
import { cn } from "./utils"
import { usePortalContainer } from "./ui/portal-container"
import { drawingFocus } from "./drawing-focus"
import { useEditorText } from "./editor-text"
import type { PieceProps } from "./piece"

/**
 * The visual styles the label lists, in the order of AutoCAD's menu (desktop
 * vp-style: 2D Wireframe, Conceptual, Hidden, Realistic…); the others are
 * not built.
 */
const STYLE_MENU: readonly VisualStyle[] = [
  "2dWireframe",
  "conceptual",
  "hidden",
]

const LABEL =
  "pointer-events-auto rounded-sm px-1 py-0.5 text-muted-foreground outline-none select-none before:content-['['] after:content-[']'] hover:bg-card/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-popup-open:bg-card/60 data-popup-open:text-foreground"
const ITEM =
  "relative flex cursor-default items-center rounded-sm py-1.5 ps-2 pe-8 text-ui outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground"
const CHECK = (
  <span className="pointer-events-none absolute inset-e-2 flex size-4 items-center justify-center text-primary">
    <CheckIcon className="size-4" />
  </span>
)

/**
 * The viewport controls at the drawing's top left (VPCONTROL 1): the view
 * control, `[Top]`, naming the view the engine says the camera shows and
 * running the preset chosen as AutoCAD's `'_-view _swiso`; then the visual
 * style control, `[2D Wireframe]`, whose list runs VSCURRENT as the ribbon's
 * gallery does. `[–]` (viewport configurations) is Missing.
 */
export function ViewportControls({ engine, state }: PieceProps): ReactElement {
  const t = useEditorText("Viewport")
  const views = state.names.views
  const current = state.view.preset
  const view = views[current ?? "custom"]
  const style = state.names.viewportVisualStyles[state.visualStyle]
  // WHY: while a command runs AutoCAD's labels do not answer, and the click
  // is the command's point (desktop view/d06, VIEW-D66).
  const running = state.commandLine.command !== null
  const label = cn(LABEL, running && "pointer-events-none")

  return (
    <div className="flex">
      <ControlMenu
        trigger={view}
        label={t("view", { name: view })}
        className={label}
        finalFocus={drawingFocus(engine)}
      >
        {VIEW_MENU.map((preset) => (
          <Menu.Item
            key={preset}
            onClick={() => engine.applyViewPreset(preset)}
            className={ITEM}
          >
            {views[preset]}
            {current === preset && CHECK}
          </Menu.Item>
        ))}
      </ControlMenu>
      <ControlMenu
        trigger={style}
        label={t("visualStyle", { name: style })}
        className={label}
        finalFocus={drawingFocus(engine)}
      >
        {STYLE_MENU.map((entry) => (
          <Menu.Item
            key={entry}
            onClick={() => engine.setVisualStyle(entry)}
            className={ITEM}
          >
            {state.names.visualStyles[entry]}
            {state.visualStyle === entry && CHECK}
          </Menu.Item>
        ))}
      </ControlMenu>
    </div>
  )
}

/**
 * One of the controls: its label, AutoCAD's brackets drawn by CSS (they are
 * notation, not words), and the menu it opens below.
 */
function ControlMenu({
  trigger,
  label,
  className,
  finalFocus,
  children,
}: {
  trigger: string
  label: string
  className: string
  finalFocus: () => false
  children: ReactNode
}) {
  const portal = usePortalContainer()
  return (
    <Menu.Root>
      <Menu.Trigger aria-label={label} className={className}>
        {trigger}
      </Menu.Trigger>
      <Menu.Portal container={portal}>
        <Menu.Positioner
          side="bottom"
          align="start"
          sideOffset={4}
          className="z-50"
        >
          <Menu.Popup
            finalFocus={finalFocus}
            className="min-w-44 origin-(--transform-origin) overflow-hidden rounded-md border bg-card/90 p-1 text-popover-foreground shadow-md backdrop-blur transition-[transform,opacity] outline-none data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0"
          >
            {children}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}
