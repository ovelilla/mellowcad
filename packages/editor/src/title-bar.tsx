"use client"

import { useState, type ReactElement, type ReactNode } from "react"
import { Menu } from "@base-ui/react/menu"
import {
  CheckIcon,
  ChevronDown,
  ChevronRight,
  CircleQuestionMark,
  File,
  FilePlus,
  Files,
  FolderOpen,
  Globe,
  Loader2,
  Menu as MenuIcon,
  MessageSquare,
  Redo2,
  Save,
  SaveAll,
  SlidersHorizontal,
  Undo2,
} from "lucide-react"

import { type CadEngine } from "@mellowcad/engine"
import type { EditorState } from "@mellowcad/react"
import { cn } from "./utils"
import { Button } from "./ui/button"
import { TooltipProvider } from "./ui/tooltip"
import { usePortalContainer } from "./ui/portal-container"
import { drawingFocus } from "./drawing-focus"
import { LARGE_MENU_ICONS } from "./large-icons"

import { IconAction, Panel } from "./toolbar-primitives"
import { toolIcon } from "./tool-icons"
import { paletteShows } from "./palettes"
import { useLayoutStorage } from "./layout-storage-context"
import { keepControlKeys } from "./control-keys"
import {
  QUICK_ACCESS_ITEMS,
  readQuickAccess,
  rememberQuickAccess,
  toggleQuickAccess,
  type QuickAccessItem,
} from "./quick-access-layout"
import { useEditorText } from "./editor-text"
import type { PieceProps } from "./piece"

const MENU_POPUP =
  "min-w-48 origin-(--transform-origin) overflow-hidden rounded-md border bg-card/90 p-1 text-popover-foreground shadow-md backdrop-blur transition-[transform,opacity] outline-none data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0"
const MENU_ITEM =
  "relative flex cursor-default items-center gap-2 rounded-sm py-1.5 ps-2 pe-8 text-ui outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-popup-open:bg-accent [&_svg]:size-4 [&_svg]:shrink-0"
/** An entry of the application menu's left column: AutoCAD's row of 46, its 32 px glyph. */
const MENU_ENTRY =
  "flex min-h-11.5 cursor-default items-center gap-2 rounded-sm ps-1.5 pe-1 text-ui outline-hidden select-none data-highlighted:bg-accent"
/** An item of an entry's page: its glyph, its name and AutoCAD's description. */
const MENU_PAGE_ITEM =
  "flex cursor-default items-start gap-2.5 rounded-sm px-2 py-2.5 text-ui outline-hidden select-none data-highlighted:bg-accent"
/** A drawing of Open Documents: AutoCAD's row of 26. */
const MENU_DOCUMENT =
  "flex h-6.5 cursor-default items-center gap-1.5 rounded-sm px-2 text-ui outline-hidden select-none data-highlighted:bg-accent"
/** A row of Undo's or Redo's list: AutoCAD's 21 on a pitch of 23. */
const MENU_STEP =
  "flex h-5.25 cursor-default items-center rounded-sm px-1.5 text-ui outline-hidden select-none"
/** The right column's foot, where AutoCAD has Options and Exit. */
const MENU_FOOT =
  "mt-auto flex h-7 cursor-default items-center gap-1.5 self-end rounded-sm border px-2 text-ui outline-hidden select-none data-highlighted:bg-accent data-popup-open:bg-accent"
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
  // Only rendered once the engine exists, in the browser: the choice is read
  // here, and the bar's height never depends on it.
  const storageKey = useLayoutStorage().quickAccess
  const [shown, setShown] = useState(() => readQuickAccess(storageKey))
  // The bar's buttons run acad.cuix's `^C^C` macros: the running command
  // cancelled, the macro echoed (`_qnew`).
  const run = (button: "new" | "open" | "save" | "saveAs") =>
    engine.runFileButton("quickAccess", button)

  return (
    <TooltipProvider>
      {/* WHY contents: the bar's zone lays its parts out; this only keeps a
      focused control's keys from the engine (`keepControlKeys`). */}
      <div
        className="contents"
        onKeyDownCapture={(event) => keepControlKeys(event, engine)}
      >
        {/* The Quick Access Toolbar in its order (New, Open, Save, Save As, …,
          Undo, Redo, and what Customize ▾ added after them); Plot and Share
          do not exist here. */}
        <ApplicationMenu
          engine={engine}
          state={state}
          mark={mark}
          links={languages}
        />
        {/* WHY ms-1: AutoCAD's first Quick Access button starts 56 px from
          the edge, 8 after the application button. One button against the
          next, on a 24 px pitch. */}
        <Panel className="ms-1 shrink-0 items-center gap-0">
          {shown.map((item) => {
            switch (item) {
              case "new":
                return (
                  <IconAction
                    key={item}
                    icon={FilePlus}
                    label={t("new")}
                    side="bottom"
                    size="quick"
                    onClick={() => run("new")}
                  />
                )
              case "open":
                return (
                  <IconAction
                    key={item}
                    icon={FolderOpen}
                    label={t("open")}
                    shortcut={keys("open")}
                    side="bottom"
                    size="quick"
                    onClick={() => run("open")}
                  />
                )
              case "save":
                return (
                  <IconAction
                    key={item}
                    icon={Save}
                    label={t("save")}
                    shortcut={keys("save")}
                    side="bottom"
                    size="quick"
                    onClick={() => run("save")}
                  />
                )
              case "saveAs":
                return (
                  <IconAction
                    key={item}
                    icon={SaveAll}
                    label={t("saveAs")}
                    side="bottom"
                    size="quick"
                    onClick={() => run("saveAs")}
                  />
                )
              case "undo":
              case "redo":
                return (
                  <StepList
                    key={item}
                    engine={engine}
                    kind={item}
                    steps={item === "undo" ? state.undoSteps : state.redoSteps}
                    enabled={item === "undo" ? state.canUndo : state.canRedo}
                  />
                )
              // acad.cuix's AcQATMatchProp, `'_matchprop`, as the ribbon's
              // Match Properties starts it.
              case "matchProp":
                return (
                  <IconAction
                    key={item}
                    icon={toolIcon("matchprop")}
                    label={t("quickAccess.matchProp")}
                    side="bottom"
                    size="quick"
                    onClick={() => {
                      engine.setActiveTool("matchprop")
                      engine.focusSurface()
                    }}
                  />
                )
              // AcQATProperties, a toggle lit while the palette shows, as
              // View's Properties.
              case "properties":
                return (
                  <IconAction
                    key={item}
                    icon={SlidersHorizontal}
                    label={t("quickAccess.properties")}
                    active={paletteShows(state, "properties")}
                    side="bottom"
                    size="quick"
                    onClick={() => {
                      engine.togglePalette("properties")
                      engine.focusSurface()
                    }}
                  />
                )
            }
          })}
          <CustomizeQuickAccess
            engine={engine}
            shown={shown}
            onChange={(next) => {
              setShown(next)
              rememberQuickAccess(storageKey, next)
            }}
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
      </div>
    </TooltipProvider>
  )
}

/** An entry's page: its items, each a command of AutoCAD's with its description. */
type Page = "new" | "open" | "saveAs" | "utilities"

/**
 * The application menu (docs/plans/autocad-ui.md, §2.2, F6): AutoCAD's two
 * columns with what exists here. On the left the entries in AutoCAD's order —
 * New, Open, Save, Save As | Drawing Utilities —, each a row of 46 with its 32
 * px glyph, running its command (acad.cuix's application menu, AcWindows:
 * `_NEW`, `_OPEN`, `_QSave`, `_SAVEAS`); an entry with a page shows it on the
 * right while the pointer or the focus is on it, as AutoCAD's does. The
 * right column shows Open Documents otherwise, where AutoCAD starts on
 * Recent Documents, which a page cannot keep (it cannot reopen a file), and
 * at its foot, in Options' place, the page's language, which AutoCAD has no
 * menu for: it is installed in one. Import, Export, Publish, Print, Close,
 * the search, Options and Exit do not exist here (`docs/coverage/workspace.md`).
 */
function ApplicationMenu({
  engine,
  state,
  mark,
  links,
}: {
  engine: CadEngine
  state: EditorState
  mark: ReactNode
  links: readonly LanguageLink[]
}) {
  const portal = usePortalContainer()
  const t = useEditorText("TitleBar")
  const [page, setPage] = useState<Page | null>(null)
  const file = (button: "new" | "open" | "save" | "saveAs") => () =>
    engine.runFileButton("applicationMenu", button)
  const entry = (
    icon: string,
    label: string,
    run: (() => void) | null,
    shows: Page | null
  ) => (
    <Menu.Item
      // Drawing Utilities runs nothing (AcWindows has no command for it):
      // a click shows its page and leaves the menu open.
      closeOnClick={run !== null}
      onClick={run ?? undefined}
      onMouseEnter={() => setPage(shows)}
      onFocus={() => setPage(shows)}
      onKeyDown={(event) => {
        if (shows !== null && event.key === forward(event.currentTarget)) {
          event.preventDefault()
          event.currentTarget
            .closest("[role=menu]")
            ?.querySelector<HTMLElement>("[data-page-item]")
            ?.focus()
        }
      }}
      data-entry={shows ?? undefined}
      className={cn(
        MENU_ENTRY,
        shows !== null && shows === page && "bg-accent"
      )}
    >
      <MenuGlyph icon={icon} />
      {/* AutoCAD wraps a name in its box (`Drawing / Utilities`); a word
          wider than the box widens the column rather than being cut. */}
      <span className="w-17.5 min-w-min">{label}</span>
      {shows !== null && (
        <ChevronRight
          aria-hidden
          className="ms-auto size-3 shrink-0 rtl:-scale-x-100"
        />
      )}
    </Menu.Item>
  )
  const item = (icon: string, name: string, hint: string, run: () => void) => (
    <Menu.Item
      onClick={run}
      onKeyDown={(event) => {
        if (event.key === back(event.currentTarget)) {
          event.preventDefault()
          event.currentTarget
            .closest("[role=menu]")
            ?.querySelector<HTMLElement>(`[data-entry="${page}"]`)
            ?.focus()
        }
      }}
      data-page-item=""
      className={MENU_PAGE_ITEM}
    >
      <MenuGlyph icon={icon} />
      <span className="flex min-w-0 flex-col">
        <span className="text-title">{name}</span>
        {hint && <span className="text-muted-foreground">{hint}</span>}
      </span>
    </Menu.Item>
  )
  const heading = (text: string) => (
    <Menu.GroupLabel className="mx-2 mb-1 border-b py-2 text-title text-muted-foreground">
      {text}
    </Menu.GroupLabel>
  )

  return (
    <Menu.Root onOpenChange={(open) => open && setPage(null)}>
      {/* WHY no tooltip: it would stop the menu opening (ui.md, Base UI). */}
      <Menu.Trigger
        render={
          <Button size="application" variant="ghost" aria-label={t("menu")}>
            {mark ?? <MenuIcon />}
          </Button>
        }
      />
      <Menu.Portal container={portal}>
        <Menu.Positioner side="bottom" align="start" className="z-50">
          <Menu.Popup
            className={cn(MENU_POPUP, "flex p-0")}
            finalFocus={drawingFocus(engine)}
          >
            <div className="flex min-w-35 shrink-0 flex-col p-1">
              {entry("fileNew", t("new"), file("new"), "new")}
              {entry("folderOpen", t("open"), file("open"), "open")}
              {entry("save", t("save"), file("save"), null)}
              {entry("saveAs", t("saveAs"), file("saveAs"), "saveAs")}
              <Menu.Separator className="mx-2 my-0.5 h-px bg-border" />
              {entry("utilities", t("utilities"), null, "utilities")}
            </div>
            <div className="flex w-70 flex-col border-s bg-background/40 p-1">
              {page === "new" && (
                <Menu.Group>
                  {heading(t("newHint"))}
                  {item(
                    "fileNew",
                    t("newDrawing"),
                    t("newDrawingHint"),
                    file("new")
                  )}
                </Menu.Group>
              )}
              {page === "open" && (
                <Menu.Group>
                  {heading(t("openHint"))}
                  {item(
                    "file",
                    t("openDrawing"),
                    t("openDrawingHint"),
                    file("open")
                  )}
                </Menu.Group>
              )}
              {page === "saveAs" && (
                <Menu.Group>
                  {heading(t("saveAsHint"))}
                  {item(
                    "save",
                    t("saveAsDrawing"),
                    t("saveAsDrawingHint"),
                    file("saveAs")
                  )}
                  {item(
                    "fileOther",
                    t("saveAsOther"),
                    t("saveAsOtherHint"),
                    file("saveAs")
                  )}
                </Menu.Group>
              )}
              {page === "utilities" && (
                <Menu.Group>
                  {heading(t("utilitiesHint"))}
                  {/* Units as the desktop's item runs it, `^C^C_UNITS`. */}
                  {item("units", t("units"), t("unitsHint"), () =>
                    engine.openDrawingUnitsFromMenu()
                  )}
                </Menu.Group>
              )}
              {page === null && (
                <Menu.Group>
                  <div className="flex items-center gap-2 px-2 py-2 text-title text-muted-foreground">
                    <Files aria-hidden className="size-4" />
                    {t("openDocuments")}
                  </div>
                  {/* The one drawing open: choosing it, as choosing the
                      current one in AutoCAD's list, closes the menu. */}
                  <Menu.Item className={MENU_DOCUMENT}>
                    <File aria-hidden className="size-4 shrink-0" />
                    <span dir="auto" className="truncate">
                      {state.drawingName}
                    </span>
                  </Menu.Item>
                </Menu.Group>
              )}
              {links.length > 0 && (
                <Menu.SubmenuRoot>
                  <Menu.SubmenuTrigger className={MENU_FOOT}>
                    <Globe aria-hidden className="size-4" />
                    {t("language")}
                    <ChevronRight
                      aria-hidden
                      className="size-3 rtl:-scale-x-100"
                    />
                  </Menu.SubmenuTrigger>
                  <Menu.Portal container={portal}>
                    <Menu.Positioner
                      side="inline-end"
                      align="end"
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
              )}
            </div>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}

/**
 * The arrow that goes into an entry's page, AutoCAD's Right, and the one that
 * comes back: the page lies on the inline end, so a right-to-left page swaps
 * them.
 */
function forward(element: Element): string {
  return getComputedStyle(element).direction === "rtl"
    ? "ArrowLeft"
    : "ArrowRight"
}

function back(element: Element): string {
  return forward(element) === "ArrowLeft" ? "ArrowRight" : "ArrowLeft"
}

/** A 32 px glyph of the application menu's. */
function MenuGlyph({ icon }: { icon: string }) {
  const Icon = LARGE_MENU_ICONS[icon]
  return <Icon className="size-8 shrink-0" />
}

/**
 * Undo ▾ or Redo ▾ of the Quick Access Toolbar (docs/plans/autocad-ui.md,
 * §2.2, F5): a split button of 36, the button 24 and its arrow 12 (AutoCAD's
 * 13 shares a pixel), the button running `_.undo` or `_.mredo` answered 1
 * and the arrow listing the steps, the next one first, each a row of 21 on a
 * pitch of 23 named as AutoCAD's list names them (`EngineState.undoSteps`),
 * the list 600 high at most, then scrolled. The pointer or the focus on a row
 * takes it and every row above it, which the caption under the list counts
 * (acadres 4853/4855, `Undo 3 commands`); choosing it runs the macro answered
 * with that count, as AutoCAD's row does (desktop, 2026-11-25).
 */
function StepList({
  engine,
  kind,
  steps,
  enabled,
}: {
  engine: CadEngine
  kind: "undo" | "redo"
  steps: readonly string[]
  enabled: boolean
}) {
  const portal = usePortalContainer()
  const t = useEditorText("TitleBar")
  const keys = useEditorText("Keys")
  const [taken, setTaken] = useState(0)
  const run = (count: number) =>
    kind === "undo" ? engine.undoSteps(count) : engine.redoSteps(count)
  return (
    <Menu.Root onOpenChange={(open) => open && setTaken(0)}>
      <div className="flex shrink-0">
        <IconAction
          icon={kind === "undo" ? Undo2 : Redo2}
          mirrored
          label={t(kind)}
          shortcut={keys(kind)}
          side="bottom"
          size="quick"
          className="rounded-e-none"
          disabled={!enabled}
          onClick={() => {
            run(1)
            engine.focusSurface()
          }}
        />
        <Menu.Trigger
          disabled={steps.length === 0}
          render={
            <Button
              size="quick"
              variant="ghost"
              aria-label={t(kind)}
              className="w-3 rounded-s-none"
            />
          }
        >
          <ChevronDown className="size-2.5" />
        </Menu.Trigger>
      </div>
      <Menu.Portal container={portal}>
        <Menu.Positioner
          side="bottom"
          align="start"
          sideOffset={1}
          className="z-50"
        >
          <Menu.Popup
            className={cn(MENU_POPUP, "min-w-37.5 p-0")}
            finalFocus={drawingFocus(engine)}
          >
            <div className="flex max-h-150 flex-col gap-0.5 overflow-y-auto p-0.5">
              {steps.map((step, i) => (
                <Menu.Item
                  // Steps repeat their names: a row is its place in the list.
                  key={i}
                  onClick={() => run(i + 1)}
                  onMouseEnter={() => setTaken(i)}
                  onFocus={() => setTaken(i)}
                  className={cn(MENU_STEP, i <= taken && "bg-accent")}
                >
                  <span className="whitespace-nowrap">{step}</span>
                </Menu.Item>
              ))}
            </div>
            <div className="flex h-7 items-center border-t px-2 text-muted-foreground">
              {t(kind === "undo" ? "undoCount" : "redoCount", {
                count: taken + 1,
              })}
            </div>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}

/** A row of Customize ▾'s list: AutoCAD's 21, its check in a column before the name. */
const MENU_CHECK_ROW =
  "relative flex h-5.25 cursor-default items-center rounded-sm ps-5.5 pe-3 text-ui whitespace-nowrap outline-hidden select-none data-highlighted:bg-accent"

/**
 * The Quick Access Toolbar's Customize ▾ (docs/plans/autocad-ui.md, §2.2, F4):
 * an arrow after the last button, its list under it (`pop-qat-custom.png`):
 * the caption `Customize Quick Access Toolbar`, then the commands that exist
 * here, each a row of 21 checked while the toolbar shows it, a pick adding it
 * at the toolbar's end or taking it away (AdWindows' `system:String_102`,
 * AcWindows' `AcQAT…` items' words). Plot, Batch Plot, Layer, Plot Preview,
 * Render, Sheet Set Manager, Workspace, More Commands..., Show Menu Bar and
 * Show Below the Ribbon are not drawn: none exists here.
 */
function CustomizeQuickAccess({
  engine,
  shown,
  onChange,
}: {
  engine: CadEngine
  shown: readonly QuickAccessItem[]
  onChange: (shown: readonly QuickAccessItem[]) => void
}) {
  const portal = usePortalContainer()
  const t = useEditorText("TitleBar.quickAccess")
  return (
    <Menu.Root>
      {/* AutoCAD's 16 × 22, one more than Undo's arrow, and no tooltip
      (desktop 2026-11-26: ID_ToolBarCustomize_CustomizeButton 16 × 22, and
      nothing over it after 1.8 s at rest, qat-tip). */}
      <Menu.Trigger
        render={
          <Button
            size="quick"
            variant="ghost"
            aria-label={t("caption")}
            className="w-4"
          />
        }
      >
        <ChevronDown className="size-2.5" />
      </Menu.Trigger>
      <Menu.Portal container={portal}>
        <Menu.Positioner
          side="bottom"
          align="start"
          sideOffset={1}
          className="z-50"
        >
          <Menu.Popup
            className={cn(MENU_POPUP, "min-w-47 p-0.5")}
            finalFocus={drawingFocus(engine)}
          >
            <Menu.Group>
              <Menu.GroupLabel className="flex h-4.25 items-center px-1.5 whitespace-nowrap text-muted-foreground">
                {t("caption")}
              </Menu.GroupLabel>
              {QUICK_ACCESS_ITEMS.map((item) => (
                <Menu.CheckboxItem
                  key={item}
                  checked={shown.includes(item)}
                  onCheckedChange={(on) =>
                    onChange(toggleQuickAccess(shown, item, on))
                  }
                  // A pick closes the list, as a Windows list's click does
                  // (whether AutoCAD's stays open is unverified).
                  closeOnClick
                  className={MENU_CHECK_ROW}
                >
                  <Menu.CheckboxItemIndicator className="absolute inset-s-1.5 flex">
                    <CheckIcon className="size-3 text-primary" />
                  </Menu.CheckboxItemIndicator>
                  {t(item)}
                </Menu.CheckboxItem>
              ))}
            </Menu.Group>
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
