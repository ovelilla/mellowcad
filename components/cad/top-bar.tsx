"use client"

import { Menu } from "@base-ui/react/menu"
import {
  CheckIcon,
  ChevronRight,
  FilePlus,
  FolderOpen,
  Globe,
  Layers,
  LibraryBig,
  Loader2,
  Paintbrush,
  PencilRuler,
  Redo2,
  Ruler,
  Save,
  SaveAll,
  Terminal,
  Undo2,
  type LucideIcon,
} from "lucide-react"
import { useLocale, useTranslations } from "next-intl"

import {
  COLOR_BYLAYER,
  LINETYPE_BYLAYER,
  LINEWEIGHT_BYLAYER,
  type CadEngine,
  type EngineState,
  type PaletteTab,
} from "@/cad"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useLanguageLinks } from "@/components/language-links"
import { LogoMark } from "@/components/marketing/logo"

import { ColorSelect } from "./color-select"
import { LayerSwatch } from "./layers-control"
import { LinetypeSelect } from "./linetype-select"
import { LineweightSelect } from "./lineweight-select"
import { IconAction, Panel } from "./toolbar-primitives"

const MENU_POPUP =
  "min-w-48 origin-(--transform-origin) overflow-hidden rounded-md border bg-card/90 p-1 text-popover-foreground shadow-md backdrop-blur transition-[transform,opacity] outline-none data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0"
const MENU_ITEM =
  "relative flex cursor-default items-center gap-2 rounded-sm py-1.5 ps-2 pe-8 text-ui outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-popup-open:bg-accent [&_svg]:size-4 [&_svg]:shrink-0"
/** A drop-down of the bar: bordered, with no surface of its own. */
const BAR_SELECT = "border-input bg-transparent shadow-none dark:bg-transparent"

/**
 * The top bar, AutoCAD's application frame and the Home tab's Layers and
 * Properties panels in one row: the application menu and the Quick Access
 * Toolbar, the save state, the current layer, the object properties, and last
 * the palette toggles. Every part has a fixed width or truncates, so the row
 * never grows with a layer's name or the selection.
 */
export function TopBar({
  engine,
  state,
}: {
  engine: CadEngine
  state: EngineState
}) {
  const t = useTranslations("Editor.TopBar")
  const keys = useTranslations("Editor.Keys")
  const layers = useTranslations("Editor.Layers")
  const styles = useTranslations("Editor.Styles")
  const blocks = useTranslations("Editor.Blocks")
  // The bar's buttons run the commands, as AutoCAD's macros do (`_qsave`), so
  // they are echoed at the prompt like a typed command.
  const run = (command: string) => engine.runCommand(command)

  return (
    <TooltipProvider>
      {/* The Quick Access Toolbar's defaults in their order (New, Open, Save,
          Save As, …, Undo, Redo); Plot and the Web & Mobile pair do not exist
          here. */}
      <Panel className="shrink-0 items-center">
        <ApplicationMenu engine={engine} />
        <IconAction
          icon={FilePlus}
          label={t("new")}
          side="bottom"
          onClick={() => run("_QNEW")}
        />
        <IconAction
          icon={FolderOpen}
          label={t("open")}
          shortcut={keys("open")}
          side="bottom"
          onClick={() => run("_OPEN")}
        />
        <IconAction
          icon={Save}
          label={t("save")}
          shortcut={keys("save")}
          side="bottom"
          onClick={() => run("_QSAVE")}
        />
        <IconAction
          icon={SaveAll}
          label={t("saveAs")}
          side="bottom"
          onClick={() => run("_SAVEAS")}
        />
        <IconAction
          icon={Undo2}
          mirrored
          label={t("undo")}
          shortcut={keys("undo")}
          side="bottom"
          disabled={!state.canUndo}
          onClick={() => engine.undo()}
        />
        <IconAction
          icon={Redo2}
          mirrored
          label={t("redo")}
          shortcut={keys("redo")}
          side="bottom"
          disabled={!state.canRedo}
          onClick={() => engine.redo()}
        />
      </Panel>

      <SaveStatus state={state} />

      {/* Clean Screen keeps the application menu and the Quick Access
          Toolbar, and hides the ribbon: the Layers and Properties panels and
          View's palette toggles. */}
      {!state.cleanScreen.active && (
        <>
          <Separator orientation="vertical" className="mx-0.5 h-6!" />

          <Panel className="shrink-0 items-center">
            <PaletteToggle
              engine={engine}
              state={state}
              tab="layers"
              icon={Layers}
              label={layers("title")}
            />
            <LayerControl engine={engine} state={state} />
          </Panel>

          <Separator orientation="vertical" className="mx-0.5 h-6!" />

          <PropertyControls engine={engine} state={state} />

          <Panel className="ms-auto shrink-0 items-center">
            <PaletteToggle
              engine={engine}
              state={state}
              tab="styles"
              icon={PencilRuler}
              label={styles("title")}
            />
            <PaletteToggle
              engine={engine}
              state={state}
              tab="blocks"
              icon={LibraryBig}
              label={blocks("title")}
            />
            {/* Palette visibility, not a drafting mode — AutoCAD keeps this on
            the View ribbon (Palettes panel), never on the status bar. */}
            <IconAction
              icon={Terminal}
              label={t("commandLine")}
              shortcut={keys("commandLine")}
              side="bottom"
              active={state.commandLine.visible}
              onClick={() => engine.toggleCommandLine()}
            />
          </Panel>
        </>
      )}
    </TooltipProvider>
  )
}

/**
 * The application menu (AutoCAD's "A" button): the file commands, Drawing
 * Utilities' Units, and the page's language, which AutoCAD has no menu for.
 */
function ApplicationMenu({ engine }: { engine: CadEngine }) {
  const t = useTranslations("Editor.TopBar")
  const links = useLanguageLinks(useLocale())
  const item = (icon: LucideIcon, label: string, onClick: () => void) => {
    const Icon = icon
    return (
      <Menu.Item onClick={onClick} className={MENU_ITEM}>
        <Icon />
        {label}
      </Menu.Item>
    )
  }

  return (
    <Menu.Root>
      <Tooltip>
        <TooltipTrigger
          render={
            <Menu.Trigger
              render={
                <Button size="icon" variant="ghost" aria-label={t("menu")}>
                  <LogoMark mono className="size-5" />
                </Button>
              }
            />
          }
        />
        <TooltipContent side="bottom">{t("menu")}</TooltipContent>
      </Tooltip>
      <Menu.Portal>
        <Menu.Positioner
          side="bottom"
          align="start"
          sideOffset={6}
          className="z-50"
        >
          <Menu.Popup className={MENU_POPUP}>
            {item(FilePlus, t("new"), () => engine.runCommand("_NEW"))}
            {item(FolderOpen, t("open"), () => engine.runCommand("_OPEN"))}
            {item(Save, t("save"), () => engine.runCommand("_QSAVE"))}
            {item(SaveAll, t("saveAs"), () => engine.runCommand("_SAVEAS"))}
            <Menu.Separator className="-mx-1 my-1 h-px bg-border" />
            {/* Drawing Utilities > Units, as the help files it. */}
            {item(Ruler, t("units"), () => engine.runCommand("_UNITS"))}
            {links.length > 0 && (
              <>
                <Menu.Separator className="-mx-1 my-1 h-px bg-border" />
                <Menu.SubmenuRoot>
                  <Menu.SubmenuTrigger className={MENU_ITEM}>
                    <Globe />
                    {t("language")}
                    <ChevronRight className="absolute inset-e-2 rtl:-scale-x-100" />
                  </Menu.SubmenuTrigger>
                  <Menu.Portal>
                    <Menu.Positioner
                      side="inline-end"
                      align="start"
                      sideOffset={6}
                      className="z-50"
                    >
                      <Menu.Popup className={cn(MENU_POPUP, "min-w-40")}>
                        {links.map((link) => (
                          <Menu.LinkItem
                            key={link.locale}
                            href={link.href}
                            hrefLang={link.locale}
                            lang={link.locale}
                            aria-current={link.current ? "true" : undefined}
                            className={MENU_ITEM}
                          >
                            {link.name}
                            {link.current && (
                              <CheckIcon className="absolute inset-e-2 text-primary" />
                            )}
                          </Menu.LinkItem>
                        ))}
                      </Menu.Popup>
                    </Menu.Positioner>
                  </Menu.Portal>
                </Menu.SubmenuRoot>
              </>
            )}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}

/**
 * The auto-save's state, where AutoCAD's title shows the drawing's name: the
 * drawing is kept on this device as it changes, apart from the files QSAVE
 * writes.
 */
function SaveStatus({ state }: { state: EngineState }) {
  const t = useTranslations("Editor.TopBar")
  const saving = state.saveState === "saving"
  const shown = saving || state.lastSavedAt !== null
  // A slot of a whole width, there before the first save: the groups after it
  // neither jump when it appears nor land on a fraction of a pixel, which
  // would blur their icons. The live region exists before it speaks.
  return (
    <span
      role="status"
      title={shown && !saving ? t("savedHint") : undefined}
      className="ms-1 flex w-24 min-w-0 shrink items-center gap-1 text-muted-foreground"
    >
      {saving && <Loader2 className="size-3.5 shrink-0 animate-spin" />}
      {shown && (
        <span className="truncate">{saving ? t("saving") : t("saved")}</span>
      )}
    </span>
  )
}

/**
 * The Layers panel's drop-down: the selection's layer, or the current one
 * with nothing selected. Choosing moves the selection there, or makes the
 * layer current — two steps either way.
 */
function LayerControl({
  engine,
  state,
}: {
  engine: CadEngine
  state: EngineState
}) {
  const t = useTranslations("Editor.TopBar")
  const properties = useTranslations("Editor.Properties")
  const selected = state.selectionCount > 0
  const value = selected ? state.selectionLayerId : state.currentLayerId
  const items = Object.fromEntries(
    state.layers.map((layer) => [layer.id, layer.name])
  )
  const colorOf = (id: string) =>
    state.layers.find((layer) => layer.id === id)?.color

  return (
    <Select
      items={items}
      value={value}
      onValueChange={(id) => {
        if (id == null) return
        engine.applyLayerControl(id)
        engine.focusSurface()
      }}
    >
      <SelectTrigger aria-label={t("layer")} className={cn(BAR_SELECT, "w-40")}>
        <SelectValue placeholder={properties("varies")}>
          {(id: string | null) =>
            id === null ? null : (
              <>
                <LayerSwatch color={colorOf(id) ?? ""} />
                <span className="truncate">{items[id]}</span>
              </>
            )
          }
        </SelectValue>
      </SelectTrigger>
      <SelectContent align="start" alignItemWithTrigger={false}>
        {state.layers.map((layer) => (
          <SelectItem key={layer.id} value={layer.id}>
            <LayerSwatch color={layer.color} />
            <span className="truncate">{layer.name}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/**
 * The Properties panel: Match Properties, then the object colour, lineweight
 * and linetype. WHY only with a selection: there is no current colour,
 * linetype or lineweight yet (CECOLOR, CELTYPE, CELWEIGHT), so with nothing
 * selected they read ByLayer, which is what new objects get.
 */
function PropertyControls({
  engine,
  state,
}: {
  engine: CadEngine
  state: EngineState
}) {
  const t = useTranslations("Editor.TopBar")
  const selected = state.selectionCount > 0
  const matchprop = state.tools.find((entry) => entry.id === "matchprop")
  const done = () => engine.focusSurface()

  return (
    <Panel className="shrink-0 items-center">
      <IconAction
        icon={Paintbrush}
        label={matchprop?.label ?? "matchprop"}
        shortcut={matchprop?.shortcut?.toUpperCase()}
        side="bottom"
        active={state.activeToolId === "matchprop"}
        onClick={() => engine.setActiveTool("matchprop")}
      />
      <ColorSelect
        below
        disabled={!selected}
        value={selected ? state.selectionColor : COLOR_BYLAYER}
        names={state.names}
        onValueChange={(value) => {
          engine.setSelectionColor(value)
          done()
        }}
        ariaLabel={t("color")}
        className="w-36"
        triggerClassName={BAR_SELECT}
      />
      <LineweightSelect
        below
        includeByLayer
        disabled={!selected}
        value={selected ? state.selectionLineweight : LINEWEIGHT_BYLAYER}
        names={state.names}
        onValueChange={(value) => {
          engine.setSelectionLineweight(value)
          done()
        }}
        ariaLabel={t("lineweight")}
        className={cn(BAR_SELECT, "w-28")}
      />
      <LinetypeSelect
        below
        includeByLayer
        disabled={!selected}
        value={selected ? state.selectionLinetype : LINETYPE_BYLAYER}
        names={state.names}
        onValueChange={(value) => {
          engine.setSelectionLinetype(value)
          done()
        }}
        ariaLabel={t("linetype")}
        className={cn(BAR_SELECT, "w-32")}
      />
    </Panel>
  )
}

/**
 * A palette's trigger: opens the palette panel on it, or folds the panel when
 * it is the palette showing — the same panel the commands open (LAYER,
 * DIMSTYLE, BLOCKSPALETTE).
 */
function PaletteToggle({
  engine,
  state,
  tab,
  icon: Icon,
  label,
}: {
  engine: CadEngine
  state: EngineState
  tab: PaletteTab
  icon: LucideIcon
  label: string
}) {
  const active = state.palette.open && state.palette.tab === tab
  return (
    <Button
      variant={active ? "active" : "ghost"}
      aria-pressed={active}
      // A whole width, as every part of the bar: a text one would leave what
      // follows it on a fraction of a pixel.
      className="w-24 justify-start gap-2"
      onClick={() => {
        engine.togglePalette(tab)
        engine.focusSurface()
      }}
    >
      <Icon className="shrink-0" />
      <span className="truncate">{label}</span>
    </Button>
  )
}
