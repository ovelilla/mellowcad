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
import { useTranslations } from "next-intl"

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
  const t = useTranslations("Editor.CommandBar")
  const keys = useTranslations("Editor.Keys")
  const saving = state.saveState === "saving"
  // The navigation tools' aliases are the engine's: they are command names.
  const alias = (id: string) =>
    state.tools.find((tool) => tool.id === id)?.shortcut?.toUpperCase()

  return (
    <TooltipProvider>
      <div className="flex flex-col items-center gap-1">
        <Panel>
          <IconAction
            icon={saving ? Loader2 : Save}
            label={saving ? t("saving") : t("save")}
            shortcut={keys("save")}
            onClick={() => engine.saveDrawingToFile()}
            side="bottom"
            className={saving ? "[&_svg]:animate-spin" : undefined}
          />
          <IconAction
            icon={FolderOpen}
            label={t("open")}
            shortcut={keys("open")}
            onClick={() => void engine.openDrawingFromFile()}
            side="bottom"
          />
          <IconAction
            icon={Search}
            label={t("zoomWindow")}
            shortcut={alias("zoom")}
            side="bottom"
            active={state.activeToolId === "zoom"}
            onClick={() => engine.setActiveTool("zoom")}
          />
          <IconAction
            icon={Hand}
            label={t("pan")}
            shortcut={alias("pan")}
            side="bottom"
            active={state.activeToolId === "pan"}
            onClick={() => engine.setActiveTool("pan")}
          />
          <IconAction
            icon={ZoomIn}
            label={t("zoomIn")}
            onClick={() => engine.zoomIn()}
            side="bottom"
          />
          <IconAction
            icon={ZoomOut}
            label={t("zoomOut")}
            onClick={() => engine.zoomOut()}
            side="bottom"
          />
          <IconAction
            icon={Undo2}
            label={t("zoomPrevious")}
            onClick={() => engine.zoomPrevious()}
            side="bottom"
          />
          <IconAction
            icon={Maximize}
            label={t("zoomToFit")}
            onClick={() => engine.zoomToFit()}
            side="bottom"
          />
          <IconAction
            icon={RotateCcw}
            label={t("resetView")}
            onClick={() => engine.resetView()}
            side="bottom"
          />
          {/* Palette visibility, not a drafting mode — AutoCAD keeps this on
              the View ribbon (Palettes panel), never on the status bar. */}
          <IconAction
            icon={Terminal}
            label={t("commandLine")}
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
