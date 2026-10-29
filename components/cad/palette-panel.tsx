"use client"

import { useRef } from "react"
import { Tabs } from "@base-ui/react/tabs"
import {
  ChevronsLeft,
  ChevronsRight,
  Layers,
  LibraryBig,
  PencilRuler,
  SlidersHorizontal,
  type LucideIcon,
} from "lucide-react"

import {
  PALETTE_TABS,
  type CadEngine,
  type PaletteTab,
} from "@mellowcad/engine"
import type { EditorState } from "@mellowcad/react"
import { cn } from "@/lib/utils"
import { useDirection } from "@/components/ui/direction"
import { TooltipProvider } from "@/components/ui/tooltip"
import { PALETTE_WIDTH, clampPaletteWidth } from "@/lib/palette-layout"

import { BlocksControl } from "./blocks-control"
import { LayersControl } from "./layers-control"
import { PropertiesPanel } from "./properties-panel"
import { StylesControl } from "./styles-control"
import { IconAction } from "./toolbar-primitives"
import { useEditorText } from "./editor-text"

const TAB_ICONS: Record<PaletteTab, LucideIcon> = {
  properties: SlidersHorizontal,
  layers: Layers,
  blocks: LibraryBig,
  styles: PencilRuler,
}

/** The catalog section that names each palette (its `title`). */
const TAB_SECTIONS = {
  properties: "Properties",
  layers: "Layers",
  blocks: "Blocks",
  styles: "Styles",
} as const

/**
 * The palette panel (the `panel` zone): Properties, Layers, Blocks and Styles
 * as tabs of one docked palette, modeless like AutoCAD's — a click on the
 * drawing never closes it, so one can draw with the layer manager open or
 * insert one block after another. Open, it shows the tab's palette; folded,
 * a strip of the tabs' icons, each of which opens the panel on its palette.
 */
export function PalettePanel({
  engine,
  state,
}: {
  engine: CadEngine
  state: EditorState
}) {
  const t = useEditorText("Palette")
  const titles = useEditorText()
  const { open, tab } = state.palette
  const title = (id: PaletteTab) => titles(`${TAB_SECTIONS[id]}.title`)

  if (!open) {
    return (
      <TooltipProvider>
        <div
          role="toolbar"
          aria-orientation="vertical"
          aria-label={t("label")}
          className="pointer-events-auto flex min-w-0 flex-1 flex-col items-center gap-1 py-1"
        >
          <IconAction
            icon={ChevronsLeft}
            mirrored
            label={t("unfold")}
            side="inline-start"
            onClick={() => {
              engine.setPaletteOpen(true)
              engine.focusSurface()
            }}
          />
          {PALETTE_TABS.map((id) => (
            <IconAction
              key={id}
              icon={TAB_ICONS[id]}
              label={title(id)}
              side="inline-start"
              onClick={() => {
                engine.showPalette(id)
                engine.focusSurface()
              }}
            />
          ))}
        </div>
      </TooltipProvider>
    )
  }

  return (
    <TooltipProvider>
      <Tabs.Root
        value={tab}
        onValueChange={(value) => engine.showPalette(value as PaletteTab)}
        aria-label={t("label")}
        className="pointer-events-auto flex min-h-0 min-w-0 flex-1 flex-col"
      >
        <div className="box-content flex h-9 shrink-0 items-center border-b ps-1">
          <Tabs.List className="flex min-w-0 flex-1 items-center overflow-hidden">
            {PALETTE_TABS.map((id) => (
              <Tabs.Tab
                key={id}
                value={id}
                // A click hands the keys back to the drawing; the arrow keys
                // keep moving along the tabs.
                onClick={(event) => {
                  if (event.detail > 0) engine.focusSurface()
                }}
                className={cn(
                  "h-7 shrink-0 rounded-sm px-1.5 whitespace-nowrap text-muted-foreground outline-none select-none",
                  "hover:bg-accent/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
                  "data-active:bg-active/15 data-active:text-active-foreground"
                )}
              >
                {title(id)}
              </Tabs.Tab>
            ))}
          </Tabs.List>
          <IconAction
            icon={ChevronsRight}
            mirrored
            label={t("fold")}
            side="bottom"
            onClick={() => {
              engine.setPaletteOpen(false)
              engine.focusSurface()
            }}
          />
        </div>

        {PALETTE_TABS.map((id) => (
          <Tabs.Panel
            key={id}
            value={id}
            className="flex min-h-0 flex-1 flex-col outline-none"
          >
            {id === "properties" && (
              <PropertiesPanel engine={engine} state={state} />
            )}
            {id === "layers" && <LayersControl engine={engine} state={state} />}
            {id === "blocks" && <BlocksControl engine={engine} state={state} />}
            {id === "styles" && <StylesControl engine={engine} state={state} />}
          </Tabs.Panel>
        ))}
      </Tabs.Root>
    </TooltipProvider>
  )
}

/**
 * The open panel's inner edge, dragged (or stepped with the arrow keys) to
 * change its width. The width is the panel's own visual state; the workspace
 * keeps it and remembers it.
 */
export function PaletteResizeHandle({
  width,
  onResize,
  onCommit,
}: {
  width: number
  onResize: (width: number) => void
  onCommit: (width: number) => void
}) {
  const t = useEditorText("Palette")
  // The panel is at the inline end, so the edge grows it moving towards the
  // inline start: left in a left-to-right page, right in a right-to-left one.
  const towardsStart = useDirection() === "rtl" ? 1 : -1
  const drag = useRef<{ x: number; width: number; last: number } | null>(null)

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={t("resize")}
      aria-valuemin={PALETTE_WIDTH.min}
      aria-valuemax={PALETTE_WIDTH.max}
      aria-valuenow={width}
      tabIndex={0}
      onPointerDown={(event) => {
        if (event.button !== 0) return
        event.currentTarget.setPointerCapture(event.pointerId)
        drag.current = { x: event.clientX, width, last: width }
      }}
      onPointerMove={(event) => {
        const start = drag.current
        if (!start) return
        const next = clampPaletteWidth(
          start.width + (event.clientX - start.x) * towardsStart
        )
        if (next === start.last) return
        start.last = next
        onResize(next)
      }}
      onPointerUp={() => {
        const start = drag.current
        drag.current = null
        if (start && start.last !== start.width) onCommit(start.last)
      }}
      onPointerCancel={() => {
        drag.current = null
      }}
      onKeyDown={(event) => {
        const step = event.shiftKey ? 48 : 16
        const delta =
          event.key === "ArrowLeft"
            ? -step
            : event.key === "ArrowRight"
              ? step
              : 0
        if (delta === 0) return
        event.preventDefault()
        // The arrows move the edge where they point, as a drag would.
        const next = clampPaletteWidth(width + delta * towardsStart)
        onResize(next)
        onCommit(next)
      }}
      className="pointer-events-auto w-1 shrink-0 cursor-col-resize outline-none hover:bg-active/40 focus-visible:bg-active/60"
    />
  )
}
