"use client"

import type { ReactElement, ReactNode } from "react"
import { Menu } from "@base-ui/react/menu"
import {
  CheckIcon,
  ChevronRight,
  FilePlus,
  FolderOpen,
  Globe,
  LibraryBig,
  Loader2,
  Menu as MenuIcon,
  MessageSquare,
  PencilRuler,
  Redo2,
  Ruler,
  Save,
  SaveAll,
  Terminal,
  Undo2,
  type LucideIcon,
} from "lucide-react"

import { type CadEngine, type PaletteTab } from "@mellowcad/engine"
import type { EditorState } from "@mellowcad/react"
import { cn } from "./utils"
import { Button } from "./ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip"
import { usePortalContainer } from "./ui/portal-container"

import { IconAction, Panel } from "./toolbar-primitives"
import { useEditorText } from "./editor-text"
import type { PieceProps } from "./piece"

const MENU_POPUP =
  "min-w-48 origin-(--transform-origin) overflow-hidden rounded-md border bg-card/90 p-1 text-popover-foreground shadow-md backdrop-blur transition-[transform,opacity] outline-none data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0"
const MENU_ITEM =
  "relative flex cursor-default items-center gap-2 rounded-sm py-1.5 ps-2 pe-8 text-ui outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-popup-open:bg-accent [&_svg]:size-4 [&_svg]:shrink-0"
/**
 * The page in one language, for the application menu. A plain link: a switch
 * is a full page load, since the language changes `lang`, `dir` and the
 * engine's catalog.
 */
export interface LanguageLink {
  readonly locale: string
  readonly href: string
  /** The language named in itself. */
  readonly name: string
  readonly current: boolean
}

/** The title bar's props: a piece's, and what the host gives `CadEditor` for it. */
export interface TitleBarProps extends PieceProps {
  /** The application menu's glyph, the host's product mark. */
  readonly mark?: ReactNode
  /** The application menu's languages; none, no Language submenu. */
  readonly languages?: readonly LanguageLink[]
  /** The page the application menu's Send Feedback opens; none, no Send Feedback. */
  readonly feedback?: string
}

/**
 * AutoCAD's title bar: the application button and the Quick Access Toolbar at
 * AutoCAD's sizes, then the save state where AutoCAD's title names the
 * drawing. Until the ribbon's View tab is built, its palette toggles follow
 * them here. Every part has a fixed width, so the row never grows.
 */
export function TitleBar({
  engine,
  state,
  mark,
  languages = [],
  feedback,
}: TitleBarProps): ReactElement {
  const t = useEditorText("TitleBar")
  const keys = useEditorText("Keys")
  const styles = useEditorText("Styles")
  const blocks = useEditorText("Blocks")
  // The bar's buttons run acad.cuix's `^C^C` macros: the running command
  // cancelled, the macro echoed (`_qnew`).
  const run = (button: "new" | "open" | "save" | "saveAs") =>
    engine.runFileButton("quickAccess", button)

  return (
    <TooltipProvider>
      {/* The Quick Access Toolbar's defaults in their order (New, Open, Save,
          Save As, …, Undo, Redo); Plot and the Web & Mobile pair do not exist
          here. */}
      <ApplicationMenu
        engine={engine}
        mark={mark}
        links={languages}
        feedback={feedback}
      />
      {/* WHY ms-1: AutoCAD's first Quick Access button starts 56 px from
          the edge, 8 after the application button. One button against the
          next, on a 24 px pitch. */}
      <Panel className="ms-1 shrink-0 items-center gap-0">
        <IconAction
          icon={FilePlus}
          label={t("new")}
          side="bottom"
          size="quick"
          onClick={() => run("new")}
        />
        <IconAction
          icon={FolderOpen}
          label={t("open")}
          shortcut={keys("open")}
          side="bottom"
          size="quick"
          onClick={() => run("open")}
        />
        <IconAction
          icon={Save}
          label={t("save")}
          shortcut={keys("save")}
          side="bottom"
          size="quick"
          onClick={() => run("save")}
        />
        <IconAction
          icon={SaveAll}
          label={t("saveAs")}
          side="bottom"
          size="quick"
          onClick={() => run("saveAs")}
        />
        <IconAction
          icon={Undo2}
          mirrored
          label={t("undo")}
          shortcut={keys("undo")}
          side="bottom"
          size="quick"
          disabled={!state.canUndo}
          onClick={() => engine.undo()}
        />
        <IconAction
          icon={Redo2}
          mirrored
          label={t("redo")}
          shortcut={keys("redo")}
          side="bottom"
          size="quick"
          disabled={!state.canRedo}
          onClick={() => engine.redo()}
        />
      </Panel>

      <SaveStatus state={state} />

      {/* View's Palettes panel, which RIBBONCLOSE and Clean Screen close
          with the ribbon, until block 4 of the plan's §6 builds the View
          tab. The application menu and the Quick Access Toolbar stay. */}
      {state.ribbon.open && (
        <>
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
 * Utilities' Units, the page's language, which AutoCAD has no menu for, and
 * Send Feedback, which it has elsewhere.
 */
function ApplicationMenu({
  engine,
  mark,
  links,
  feedback,
}: {
  engine: CadEngine
  mark: ReactNode
  links: readonly LanguageLink[]
  feedback: string | undefined
}) {
  const portal = usePortalContainer()
  const t = useEditorText("TitleBar")
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
                <Button
                  size="application"
                  variant="ghost"
                  aria-label={t("menu")}
                >
                  {mark ?? <MenuIcon />}
                </Button>
              }
            />
          }
        />
        <TooltipContent side="bottom">{t("menu")}</TooltipContent>
      </Tooltip>
      <Menu.Portal container={portal}>
        <Menu.Positioner
          side="bottom"
          align="start"
          sideOffset={6}
          className="z-50"
        >
          <Menu.Popup className={MENU_POPUP}>
            {item(FilePlus, t("new"), () =>
              engine.runFileButton("applicationMenu", "new")
            )}
            {item(FolderOpen, t("open"), () =>
              engine.runFileButton("applicationMenu", "open")
            )}
            {item(Save, t("save"), () =>
              engine.runFileButton("applicationMenu", "save")
            )}
            {item(SaveAll, t("saveAs"), () =>
              engine.runFileButton("applicationMenu", "saveAs")
            )}
            <Menu.Separator className="-mx-1 my-1 h-px bg-border" />
            {/* Drawing Utilities > Units, as the help files it. */}
            {item(Ruler, t("units"), () => engine.openDrawingUnitsFromMenu())}
            {links.length > 0 && (
              <>
                <Menu.Separator className="-mx-1 my-1 h-px bg-border" />
                <Menu.SubmenuRoot>
                  <Menu.SubmenuTrigger className={MENU_ITEM}>
                    <Globe />
                    {t("language")}
                    <ChevronRight className="absolute inset-e-2 rtl:-scale-x-100" />
                  </Menu.SubmenuTrigger>
                  <Menu.Portal container={portal}>
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
            {/* WHY here: AutoCAD's Send Feedback is a button of the Start
                tab's Connect panel and an item of the Help menu (acad.cuix
                ID_SendFeedback), and the editor has neither; it moves to
                the Start tab when the chrome has one
                (docs/next-autocad-ui.md). AutoCAD opens its form on
                Autodesk's site: here the host's page, in a tab of its own,
                as F1's help, so the drawing stays open. */}
            {feedback && (
              <>
                <Menu.Separator className="-mx-1 my-1 h-px bg-border" />
                <Menu.LinkItem
                  href={feedback}
                  target="_blank"
                  rel="noopener"
                  closeOnClick
                  className={MENU_ITEM}
                >
                  <MessageSquare />
                  {t("feedback")}
                </Menu.LinkItem>
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
function SaveStatus({ state }: { state: EditorState }) {
  const t = useEditorText("TitleBar")
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
  state: EditorState
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
      // follows it on a fraction of a pixel. Button's own inset and gap leave
      // the label the room pt-BR's «Camadas» needs.
      className="w-24 justify-start"
      onClick={() => {
        engine.togglePalette(tab)
        engine.focusSurface()
      }}
    >
      <Icon data-icon="inline-start" className="shrink-0" />
      <span className="truncate">{label}</span>
    </Button>
  )
}
