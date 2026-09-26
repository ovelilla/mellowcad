"use client"

import { useCadEngine } from "@/hooks/useCadEngine"
import { SHEET_TRANSITION } from "@/lib/view-transition"
import { AboutPanel } from "./about-panel"
import { CommandBar } from "./command-bar"
import { CommandLine } from "./command-line"
import { ToolRail } from "./tool-rail"
import { DrawingAids } from "./drawing-aids"
import { CoordinateReadout } from "./coordinate-readout"
import { DynamicInput } from "./dynamic-input"
import { PropertiesPanel } from "./properties-panel"
import { LayersControl } from "./layers-control"
import { StylesControl } from "./styles-control"
import { BlocksControl } from "./blocks-control"
import { SnapOverrideMenu } from "./snap-override-menu"
import { SelectionCyclingList } from "./selection-cycling-list"

/**
 * Top-level CAD workspace. It mounts the engine's canvas and overlays the React
 * UI chrome (toolbar, status bar). The canvas fills the container; the engine
 * handles all pointer/keyboard interaction and drawing on it directly.
 */
export function CadWorkspace() {
  const { canvasRef, engine, state } = useCadEngine()

  return (
    <div
      className="relative h-svh w-full overflow-hidden bg-[#0b0f14]"
      style={{ viewTransitionName: SHEET_TRANSITION }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full touch-none outline-none"
        aria-label="CAD drawing canvas"
      />

      {engine && state && (
        <>
          <div className="pointer-events-none absolute top-4 left-1/2 z-10 -translate-x-1/2">
            <CommandBar engine={engine} state={state} />
          </div>

          <div className="pointer-events-none absolute top-4 left-4 z-10">
            <ToolRail engine={engine} state={state} />
          </div>

          <div className="pointer-events-none absolute top-4 left-20 z-10">
            <LayersControl engine={engine} state={state} />
          </div>

          <div className="pointer-events-none absolute top-4 left-72 z-10">
            <StylesControl engine={engine} state={state} />
          </div>

          <div className="pointer-events-none absolute top-4 left-[26rem] z-10">
            <BlocksControl engine={engine} state={state} />
          </div>

          <div className="pointer-events-none absolute bottom-4 left-4 z-10">
            <CoordinateReadout state={state} />
          </div>

          <div className="pointer-events-none absolute bottom-16 left-1/2 z-10 -translate-x-1/2">
            <CommandLine engine={engine} state={state} />
          </div>

          <div className="pointer-events-none absolute bottom-4 left-1/2 z-10 -translate-x-1/2">
            <DrawingAids engine={engine} state={state} />
          </div>

          <DynamicInput engine={engine} state={state} />

          <div className="pointer-events-none absolute top-4 right-4 z-10">
            <PropertiesPanel engine={engine} state={state} />
          </div>

          <div className="pointer-events-none absolute right-4 bottom-4 z-10">
            <AboutPanel />
          </div>

          <SnapOverrideMenu engine={engine} state={state} />
          <SelectionCyclingList engine={engine} state={state} />
        </>
      )}
    </div>
  )
}
