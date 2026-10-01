"use client"

import { Menu } from "@base-ui/react/menu"
import {
  CheckIcon,
  ChevronDown,
  FolderOpen,
  Hand,
  Loader2,
  Maximize,
  Rotate3d,
  RotateCcw,
  Save,
  Search,
  Terminal,
  Undo2,
  ZoomIn,
  ZoomOut,
} from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { TooltipProvider } from "@/components/ui/tooltip"
import { CadEngine, EngineState, VIEW_MENU, type ViewPreset } from "@/cad"

import { LanguageMenu } from "./language-menu"
import { IconAction, Panel } from "./toolbar-primitives"

/**
 * The top command bar: file actions, view navigation and the language. Horizontal and
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
          <ViewMenu
            engine={engine}
            current={state.view.preset}
            names={state.names.views}
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
            icon={Rotate3d}
            label={t("orbit")}
            shortcut={alias("orbit")}
            side="bottom"
            active={state.activeToolId === "orbit"}
            onClick={() => engine.setActiveTool("orbit")}
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
            mirrored
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
          <LanguageMenu />
        </Panel>
      </div>
    </TooltipProvider>
  )
}

/**
 * The viewport control's view menu (AutoCAD's `[Top]` label): it names the
 * view the engine says the camera shows and runs the preset chosen.
 */
function ViewMenu({
  engine,
  current,
  names,
}: {
  engine: CadEngine
  current: ViewPreset | null
  /** The views as the engine names them. */
  names: EngineState["names"]["views"]
}) {
  return (
    <Menu.Root>
      <Menu.Trigger
        render={
          <Button size="sm" variant="ghost">
            {names[current ?? "custom"]}
            <ChevronDown className="text-muted-foreground" />
          </Button>
        }
      />
      <Menu.Portal>
        <Menu.Positioner
          side="bottom"
          align="start"
          sideOffset={6}
          className="z-50"
        >
          <Menu.Popup className="min-w-44 origin-(--transform-origin) overflow-hidden rounded-md border bg-card/90 p-1 text-popover-foreground shadow-md backdrop-blur transition-[transform,opacity] outline-none data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
            {VIEW_MENU.map((preset) => (
              <Menu.Item
                key={preset}
                onClick={() => engine.applyViewPreset(preset)}
                className="relative flex cursor-default items-center rounded-sm py-1.5 ps-2 pe-8 text-sm outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground"
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
