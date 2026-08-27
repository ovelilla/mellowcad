"use client"

import {
  FolderOpen,
  Hand,
  Loader2,
  Maximize,
  RotateCcw,
  Save,
  Search,
  Terminal,
  Undo2,
  ZoomIn,
  ZoomOut,
} from "lucide-react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { CadEngine, EngineState } from "@/cad"

import { IconAction, Panel } from "./toolbar-primitives"

/**
 * The top command bar: file actions and view navigation. Horizontal and
 * compact so it stays a single short row regardless of viewport width.
 */
export function CommandBar({
  engine,
  state,
}: {
  engine: CadEngine
  state: EngineState
}) {
  const saving = state.saveState === "saving"

  return (
    <TooltipProvider>
      <div className="flex flex-col items-center gap-1">
        <Panel>
          <IconAction
            icon={saving ? Loader2 : Save}
            label={saving ? "Auto-saving…" : "Save drawing"}
            shortcut="Ctrl+S"
            onClick={() => engine.saveDrawingToFile()}
            side="bottom"
            className={saving ? "[&_svg]:animate-spin" : undefined}
          />
          <IconAction
            icon={FolderOpen}
            label="Open drawing"
            shortcut="Ctrl+O"
            onClick={() => void engine.openDrawingFromFile()}
            side="bottom"
          />
          <IconAction
            icon={Search}
            label="Zoom window"
            shortcut="Z"
            side="bottom"
            active={state.activeToolId === "zoom"}
            onClick={() => engine.setActiveTool("zoom")}
          />
          <IconAction
            icon={Hand}
            label="Pan"
            shortcut="P"
            side="bottom"
            active={state.activeToolId === "pan"}
            onClick={() => engine.setActiveTool("pan")}
          />
          <IconAction
            icon={ZoomIn}
            label="Zoom in"
            onClick={() => engine.zoomIn()}
            side="bottom"
          />
          <IconAction
            icon={ZoomOut}
            label="Zoom out"
            onClick={() => engine.zoomOut()}
            side="bottom"
          />
          <IconAction
            icon={Undo2}
            label="Zoom previous"
            onClick={() => engine.zoomPrevious()}
            side="bottom"
          />
          <IconAction
            icon={Maximize}
            label="Zoom to fit"
            onClick={() => engine.zoomToFit()}
            side="bottom"
          />
          <IconAction
            icon={RotateCcw}
            label="Reset view"
            onClick={() => engine.resetView()}
            side="bottom"
          />
          {/* Palette visibility, not a drafting mode — AutoCAD keeps this on
              the View ribbon (Palettes panel), never on the status bar. */}
          <IconAction
            icon={Terminal}
            label="Command line"
            shortcut="F2"
            side="bottom"
            active={state.commandLine.visible}
            onClick={() => engine.toggleCommandLine()}
          />
        </Panel>
      </div>
    </TooltipProvider>
  )
}
