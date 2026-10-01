"use client"

import { useTranslations } from "next-intl"

import type { EngineLocale } from "@/cad"
import { useCadEngine } from "@/hooks/useCadEngine"
import { cn } from "@/lib/utils"
import { EDITOR_SHEET_ID, SHEET_TRANSITION } from "@/lib/view-transition"
import { CommandBar } from "./command-bar"
import { CommandLine } from "./command-line"
import { ToolRail } from "./tool-rail"
import { DrawingAids } from "./drawing-aids"
import { CoordinateReadout } from "./coordinate-readout"
import { DynamicInput } from "./dynamic-input"
import { PropertiesPanel } from "./properties-panel"
import { ViewCube } from "./view-cube"
import { LayersControl } from "./layers-control"
import { StylesControl } from "./styles-control"
import { BlocksControl } from "./blocks-control"
import { SnapOverrideMenu } from "./snap-override-menu"
import { SelectionCyclingList } from "./selection-cycling-list"

/**
 * The editor's docked workspace: a grid of named areas round the canvas, which
 * takes what is left. The engine resizes its drawing with the canvas, so ZOOM
 * Extents frames what is visible; nothing but the ViewCube, the dynamic input
 * and the menus at the cursor sits on the drawing.
 */
export function CadWorkspace({
  engineLocale,
}: {
  /** The page language's catalog for the engine; English when absent. */
  engineLocale?: EngineLocale
}) {
  const { canvasRef, engine, state } = useCadEngine({ locale: engineLocale })
  const t = useTranslations("Editor.Workspace")
  const input = useTranslations("Editor.DynamicInput")
  const ready = engine && state

  // Every zone has its size before the engine mounts, so the canvas's box at
  // the first paint is already the final one: the landing's sheet grows into
  // it, and the first view is centred in it. The grid follows the page's
  // direction: in a right-to-left page the tools are on the right and the
  // palettes on the left.
  //
  // The editor is the page's main content: a landmark, so every control on
  // it sits in one (axe's region rule).
  return (
    <main className="grid h-svh w-full grid-cols-[auto_minmax(0,1fr)_auto] grid-rows-[auto_minmax(0,1fr)_auto_auto] overflow-hidden bg-card [grid-template-areas:'top_top_top'_'tools_canvas_panel'_'command_command_command'_'status_status_status']">
      <div className="flex h-10 min-w-0 items-center gap-1 border-b px-1 [grid-area:top]">
        {ready && (
          <>
            <LayersControl engine={engine} state={state} />
            <StylesControl engine={engine} state={state} />
            <BlocksControl engine={engine} state={state} />
            <CommandBar engine={engine} state={state} />
          </>
        )}
      </div>

      <div className="flex min-h-0 w-19 flex-col border-e p-1 [grid-area:tools]">
        {ready && <ToolRail engine={engine} state={state} />}
      </div>

      {/* Whatever is placed in the canvas's pixels — the dynamic input and its
          option chips — is positioned in this cell, which is exactly the
          canvas's box; the menus at the cursor convert to the viewport
          (`engine.clientFromScreen`). */}
      <div
        id={EDITOR_SHEET_ID}
        className="relative min-h-0 min-w-0 bg-[#0b0f14] [grid-area:canvas]"
        style={{ viewTransitionName: SHEET_TRANSITION }}
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

            {/* The ViewCube keeps AutoCAD's corner of the drawing
                (NAVVCUBELOCATION 0). WHY inset-e: no AutoCAD reads right to
                left, and in a page that does it mirrors to the corner beside
                the palettes; the cube itself never mirrors. */}
            <div className="pointer-events-none absolute inset-e-4 top-4 z-10">
              <ViewCube engine={engine} state={state} />
            </div>
          </>
        )}
      </div>

      <div className="flex min-h-0 w-70 flex-col border-s [grid-area:panel]">
        {ready && <PropertiesPanel engine={engine} state={state} />}
      </div>

      {/* Above the canvas in the stacking order: the command line's
          suggestions open upwards over the drawing. */}
      <div
        className={cn(
          "relative z-10 [grid-area:command]",
          (!ready || state.commandLine.visible || state.commandLine.buffer) &&
            "h-20 border-t"
        )}
      >
        {ready && <CommandLine engine={engine} state={state} />}
      </div>

      <div className="flex h-10 min-w-0 items-center justify-between gap-2 border-t px-1 [grid-area:status]">
        {ready && (
          <>
            <CoordinateReadout state={state} />
            <DrawingAids engine={engine} state={state} />
          </>
        )}
      </div>

      {ready && (
        <>
          <SnapOverrideMenu engine={engine} state={state} />
          <SelectionCyclingList engine={engine} state={state} />
        </>
      )}
    </main>
  )
}
