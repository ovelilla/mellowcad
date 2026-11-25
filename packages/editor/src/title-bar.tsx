"use client"

import type { ReactElement, ReactNode } from "react"
import { Menu } from "@base-ui/react/menu"
import {
  CheckIcon,
  ChevronDown,
  ChevronRight,
  CircleQuestionMark,
  FilePlus,
  FolderOpen,
  Globe,
  Loader2,
  Menu as MenuIcon,
  MessageSquare,
  Redo2,
  Ruler,
  Save,
  SaveAll,
  Undo2,
  type LucideIcon,
} from "lucide-react"

import { type CadEngine } from "@mellowcad/engine"
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
import { drawingFocus } from "./drawing-focus"

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
  /**
   * Whether the host shows Help (`CadEditor`'s `help`), which the Help button
   * asks for as F1 does; neither it nor `feedback`, no Help ▾.
   */
  readonly help?: boolean
  /** The page the Help list's Send Feedback opens; none, no Send Feedback. */
  readonly feedback?: string
}

/**
 * AutoCAD's title bar: the application button and the Quick Access Toolbar at
 * AutoCAD's sizes, the auto-save's state, the drawing's name centred, and
 * InfoCenter's Help ▾ at the end. Every part has a fixed width, so the row
 * never grows.
 */
export function TitleBar({
  engine,
  state,
  mark,
  languages = [],
  help = false,
  feedback,
}: TitleBarProps): ReactElement {
  const t = useEditorText("TitleBar")
  const keys = useEditorText("Keys")
  // The bar's buttons run acad.cuix's `^C^C` macros: the running command
  // cancelled, the macro echoed (`_qnew`).
  const run = (button: "new" | "open" | "save" | "saveAs") =>
    engine.runFileButton("quickAccess", button)

  return (
    <TooltipProvider>
      {/* The Quick Access Toolbar's defaults in their order (New, Open, Save,
          Save As, …, Undo, Redo); Plot and the Web & Mobile pair do not exist
          here. */}
      <ApplicationMenu engine={engine} mark={mark} links={languages} />
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

      {/* The title, centred on the bar as AutoCAD's is on its window: the
          drawing's name alone, no path, nothing marking a change (desktop,
          2026-11-25). WHY no product name before it: the program's name in
          AutoCAD's title is Autodesk's mark, and the editor names no host. */}
      {/* WHY dir="auto": a file's name reads in its own direction, `plan
          (2).dxf` whole on a right-to-left page. */}
      <span
        dir="auto"
        className="pointer-events-none absolute inset-x-0 mx-auto w-fit max-w-1/3 truncate"
      >
        {state.drawingName}
      </span>

      {/* InfoCenter's Help ▾, at the bar's end: its search, sign-in, App
          Store, Stay Connected and Support Assistant, and the window's own
          buttons after it, do not exist here. */}
      {(help || feedback) && (
        <HelpMenu engine={engine} help={help} feedback={feedback} />
      )}
    </TooltipProvider>
  )
}

/**
 * The application menu (AutoCAD's "A" button): the file commands, Drawing
 * Utilities' Units and the page's language, which AutoCAD has no menu for.
 */
function ApplicationMenu({
  engine,
  mark,
  links,
}: {
  engine: CadEngine
  mark: ReactNode
  links: readonly LanguageLink[]
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
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}

/** A function key is literal in every language (.claude/rules/ui.md, Text). */
const HELP_KEY = "F1"

/**
 * InfoCenter's Help ▾ (docs/plans/autocad-ui.md, F7): a split button of 36,
 * the button 24 and its arrow 12 (AutoCAD's 13 shares a pixel with the
 * button: UI Automation, 2026-11-24). The button asks for Help as F1 does
 * (acad.cuix `ID_Help`, `'_help`); the list is acad.cuix's Help menu
 * (`ID_MnHelp`) with what exists here: Help, then Send Feedback (`ID_SendFeedback`),
 * Download Offline Help, Online Resources, Privacy Settings and About left
 * out. WHY the Help menu's: InfoCenter's list opened neither through UI
 * Automation nor on a click (2026-11-24 and 2026-11-25), and its button runs
 * that menu's first item. Send Feedback opens the host's page in a tab of
 * its own, as F1's help, where AutoCAD's opens its form on Autodesk's site.
 */
function HelpMenu({
  engine,
  help,
  feedback,
}: {
  engine: CadEngine
  help: boolean
  feedback: string | undefined
}) {
  const portal = usePortalContainer()
  const t = useEditorText("TitleBar")
  return (
    <Menu.Root>
      {/* WHY me-1: the bar's last control, 4 px from its end, as the title
          bar's buttons keep from the window's edge. */}
      <div className="ms-auto me-1 flex shrink-0">
        {help && (
          <IconAction
            icon={CircleQuestionMark}
            label={t("help")}
            shortcut={HELP_KEY}
            side="bottom"
            size="quick"
            className="rounded-e-none"
            onClick={() => {
              engine.help()
              engine.focusSurface()
            }}
          />
        )}
        <Menu.Trigger
          render={
            <Button
              size="quick"
              variant="ghost"
              aria-label={t("help")}
              className={cn(help ? "w-3 rounded-s-none" : "w-9")}
            />
          }
        >
          {!help && <CircleQuestionMark />}
          <ChevronDown className="size-2.5" />
        </Menu.Trigger>
      </div>
      <Menu.Portal container={portal}>
        <Menu.Positioner
          side="bottom"
          align="end"
          sideOffset={1}
          className="z-50"
        >
          <Menu.Popup className={MENU_POPUP} finalFocus={drawingFocus(engine)}>
            {help && (
              <Menu.Item onClick={() => engine.help()} className={MENU_ITEM}>
                <CircleQuestionMark />
                {t("help")}
                <kbd
                  dir="ltr"
                  className="ms-auto -me-6 font-mono text-muted-foreground"
                >
                  {HELP_KEY}
                </kbd>
              </Menu.Item>
            )}
            {help && feedback && (
              <Menu.Separator className="-mx-1 my-1 h-px bg-border" />
            )}
            {feedback && (
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
            )}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}

/**
 * The auto-save's state, after the Quick Access Toolbar (AutoCAD has none):
 * the drawing is kept on this device as it changes, apart from the files
 * QSAVE writes.
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
