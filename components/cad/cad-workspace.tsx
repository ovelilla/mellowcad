"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { useTranslations } from "next-intl"

import {
  createLocalStorageDrawingStore,
  type EngineLocale,
} from "@mellowcad/engine"
import { useCadEngine } from "@/hooks/useCadEngine"
import { cn } from "@/lib/utils"
import {
  applyPaletteLayout,
  paletteLayoutAtLoad,
  PALETTE_WIDTH,
  rememberPalette,
} from "@/lib/palette-layout"
import { CommandLine } from "./command-line"
import { ToolRail } from "./tool-rail"
import { StatusBar } from "./status-bar"
import { UnitsDialog } from "./units-dialog"
import { LockedObjectsDialog } from "./locked-objects-dialog"
import { UnsavedTextDialog } from "./unsaved-text-dialog"
import { DynamicInput } from "./dynamic-input"
import { RolloverTooltip } from "./rollover-tooltip"
import { PalettePanel, PaletteResizeHandle } from "./palette-panel"
import { ViewCube } from "./view-cube"
import { NavigationBar } from "./navigation-bar"
import { ViewportControls } from "./viewport-controls"
import { type LanguageLink, TopBar } from "./top-bar"
import { ShortcutMenu } from "./shortcut-menu"
import { SnapOverrideMenu } from "./snap-override-menu"
import { SelectionCyclingList } from "./selection-cycling-list"

/**
 * The localStorage keys this device's layout is kept under, each part's own;
 * a part with no key is not remembered. A key is the host's promise to its
 * users: renaming it orphans what they saved.
 */
export interface LayoutStorage {
  /** The palette panel's width and fold, also read by the `<head>` script. */
  readonly palette?: string
  /** The status bar's Customization. */
  readonly statusBar?: string
}

/**
 * What names the canvas cell for a host's view transition into the editor:
 * the element's id (for `<link rel="expect">`) and its `view-transition-name`.
 */
export interface SheetTransition {
  readonly id: string
  readonly name: string
}

/**
 * The editor's docked workspace: a grid of named areas round the canvas, which
 * takes what is left. The engine resizes its drawing with the canvas, so ZOOM
 * Extents frames what is visible; nothing but the viewport controls, the
 * ViewCube with the navigation bar, the dynamic input and the menus at the
 * cursor sits on the drawing.
 */
export function CadWorkspace({
  engineLocale,
  mark,
  languages,
  layoutStorage = {},
  sheet,
}: {
  /** The page language's catalog for the engine; English when absent. */
  engineLocale?: EngineLocale
  /** The host's product mark, the application menu's glyph. */
  mark?: React.ReactNode
  /** The page in each language the host offers, for the application menu. */
  languages?: readonly LanguageLink[]
  /** Where this device's layout is kept; nothing is, without it. */
  layoutStorage?: LayoutStorage
  /** The canvas cell's name for a page that transitions into it. */
  sheet?: SheetTransition
}) {
  const paletteKey = layoutStorage.palette
  // The editor is the page: it keeps this device's drawing and takes every
  // key, which the engine leaves to whoever asks.
  const { canvasRef, engine, state } = useCadEngine({
    store: createLocalStorageDrawingStore,
    scope: "document",
    locale: engineLocale,
    paletteOpen: () => paletteLayoutAtLoad(paletteKey).open,
  })
  const t = useTranslations("Editor.Workspace")
  const input = useTranslations("Editor.DynamicInput")
  const ready = engine && state
  const paletteOpen = state?.palette.open ?? null
  // Clean Screen hides the tool palette and the palette panel (a palette
  // opened meanwhile shows the panel again); it is never on at the first
  // paint, as AutoCAD does not save it.
  const clean = state?.cleanScreen
  // The width the head script laid out. Nothing renders it before the engine
  // exists, so the server's default never meets the client's.
  const [paletteWidth, setPaletteWidth] = useState(() =>
    typeof window === "undefined"
      ? PALETTE_WIDTH.initial
      : paletteLayoutAtLoad(paletteKey).width
  )

  // React's development remount clears what the head script wrote on <html>.
  useLayoutEffect(
    () => applyPaletteLayout(paletteLayoutAtLoad(paletteKey)),
    [paletteKey]
  )

  // From then on the engine's open state and the dragged width drive the
  // same CSS, before the frame is painted.
  useLayoutEffect(() => {
    if (paletteOpen === null) return
    applyPaletteLayout({ open: paletteOpen, width: paletteWidth })
  }, [paletteOpen, paletteWidth])

  // The fold is remembered once it changes, so until the user folds or
  // opens the panel the window's width decides.
  const firstOpen = useRef<boolean | null>(null)
  useEffect(() => {
    if (paletteOpen === null) return
    if (firstOpen.current === null) firstOpen.current = paletteOpen
    else rememberPalette(paletteKey, { open: paletteOpen })
  }, [paletteOpen, paletteKey])

  // Every zone has its size before the engine mounts, so the canvas's box at
  // the first paint is already the final one: the landing's sheet grows into
  // it, and the first view is centred in it. The grid follows the page's
  // direction: in a right-to-left page the tools are on the right and the
  // palettes on the left.
  //
  // The sizes are one system (.claude/rules/ui.md, "Size"): every control is
  // 28 px; a bar of them, 36 — the control and 4 px either side —, the command
  // line among them; the tool palette, two columns of 28, 2 px apart. Each
  // zone sizes its content (`box-content`) and its border lies outside it, or
  // the border eats a pixel and every control lands on a half pixel, which
  // blurs its icon.
  //
  // The editor is the page's main content: a landmark, so every control on
  // it sits in one (axe's region rule).
  return (
    <main className="grid h-svh w-full grid-cols-[auto_minmax(0,1fr)_auto] grid-rows-[auto_minmax(0,1fr)_auto_auto] overflow-hidden bg-card [grid-template-areas:'top_top_top'_'tools_canvas_panel'_'command_command_command'_'status_status_status']">
      <div className="box-content flex h-9 min-w-0 items-center gap-1 border-b px-1 [grid-area:top]">
        {ready && (
          <TopBar
            engine={engine}
            state={state}
            mark={mark}
            languages={languages}
          />
        )}
      </div>

      <div
        className={cn(
          "box-content flex min-h-0 w-14.5 flex-col border-e p-1 [grid-area:tools]",
          clean?.active && "hidden"
        )}
      >
        {ready && <ToolRail engine={engine} state={state} />}
      </div>

      {/* Whatever is placed in the canvas's pixels — the dynamic input and its
          option chips, the rollover tooltip — is positioned in this cell, which is exactly the
          canvas's box; the menus at the cursor convert to the viewport
          (`engine.clientFromScreen`). */}
      <div
        id={sheet?.id}
        className="relative min-h-0 min-w-0 bg-[#0b0f14] [grid-area:canvas]"
        style={sheet && { viewTransitionName: sheet.name }}
      >
        {/* The drawing is geometry: it never mirrors, whatever the page. */}
        <canvas
          ref={canvasRef}
          dir="ltr"
          className="absolute inset-0 h-full w-full touch-none outline-none"
          aria-label={t("canvas")}
        />

        {ready && (
          <>
            <DynamicInput
              engine={engine}
              state={state}
              lockedLabel={input("locked")}
            />
            <RolloverTooltip state={state} />

            {/* WHY inset-s and inset-e: no AutoCAD reads right to left, and
                in a page that does the viewport controls and the ViewCube
                swap corners with the shell; the cube itself never mirrors. */}
            <div className="absolute inset-s-1 top-1 z-10">
              <ViewportControls engine={engine} state={state} />
            </div>

            {/* The ViewCube keeps AutoCAD's corner of the drawing
                (NAVVCUBELOCATION 0), the navigation bar linked under it. */}
            <div className="pointer-events-none absolute inset-e-4 top-4 z-10 flex flex-col items-center gap-2">
              <ViewCube engine={engine} state={state} />
              <NavigationBar engine={engine} state={state} />
            </div>
          </>
        )}
      </div>

      {/* Its width is CSS, read off <html> (lib/palette-layout.ts): the
          head script's answer before the engine exists, the engine's open
          state and the dragged width after — the same box either way. */}
      <div
        className={cn(
          "box-content flex min-h-0 w-9 border-s [grid-area:panel] palette-open:w-(--palette-width)",
          clean?.active && !clean.palette && "hidden"
        )}
      >
        {ready && (
          <>
            {state.palette.open && (
              <PaletteResizeHandle
                width={paletteWidth}
                onResize={setPaletteWidth}
                onCommit={(width) => rememberPalette(paletteKey, { width })}
              />
            )}
            <PalettePanel engine={engine} state={state} />
          </>
        )}
      </div>

      {/* One prompt line. Above the canvas in the stacking order: its
          history and suggestions open upwards over the drawing. */}
      <div
        className={cn(
          "relative z-10 [grid-area:command]",
          (!ready || state.commandLine.visible || state.commandLine.buffer) &&
            "box-content h-9 border-t"
        )}
      >
        {ready && <CommandLine engine={engine} state={state} />}
      </div>

      <div className="box-content flex h-9 min-w-0 items-center gap-2 border-t px-1 [grid-area:status]">
        {ready && (
          <StatusBar
            engine={engine}
            state={state}
            storageKey={layoutStorage.statusBar}
          />
        )}
      </div>

      {ready && (
        <>
          <ShortcutMenu engine={engine} state={state} />
          <SnapOverrideMenu engine={engine} state={state} />
          <SelectionCyclingList engine={engine} state={state} />
          <UnitsDialog engine={engine} state={state} />
          <LockedObjectsDialog engine={engine} state={state} />
          <UnsavedTextDialog engine={engine} state={state} />
        </>
      )}
    </main>
  )
}
