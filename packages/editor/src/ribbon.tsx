"use client"

import {
  createElement,
  Fragment,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from "react"
import { flushSync } from "react-dom"
import { Menu } from "@base-ui/react/menu"
import { Popover } from "@base-ui/react/popover"
import { Tabs } from "@base-ui/react/tabs"
import {
  ArrowUpFromLine,
  Check,
  ChevronDown,
  ChevronsDown,
  ChevronUp,
  Grid3x3,
  Scaling,
  SquareDashedMousePointer,
  ChevronsUp,
  CircleDashed,
  Columns3,
  FoldHorizontal,
  FoldVertical,
  Hash,
  Layers,
  MoveHorizontal,
  MoveVertical,
  RotateCcw,
  Rows3,
  MoveDiagonal2,
  PanelTopClose,
  PanelTopOpen,
  PencilRuler,
  Pin,
  PinOff,
  CaseSensitive,
  type LucideIcon,
} from "lucide-react"

import {
  CanvasScenePresenter,
  HATCH_PATTERNS,
  type CadEngine,
  type ContextualFieldId,
  type ContextualToggleId,
  type ContextualTab,
  type PaletteId,
} from "@mellowcad/engine"
import { isImeKey, type EditorState } from "@mellowcad/react"
import { cn } from "./utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip"
import { isTip, RibbonTip, type TipKey } from "./ribbon-tip"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import { usePortalContainer } from "./ui/portal-container"
import { ColorSelect } from "./color-select"
import { LinetypeSelect } from "./linetype-select"
import { LineweightSelect } from "./lineweight-select"
import { LayerSwatch } from "./layers-control"
import { BlockThumbnail } from "./blocks-control"
import { drawingFocus } from "./drawing-focus"
import { paletteShows } from "./palettes"
import { LinetypeIcon, LineweightIcon } from "./icons"
import {
  LARGE_BUTTON_ICONS,
  LARGE_TOOL_ICONS,
  LayerPropertiesLarge,
  type LargeIcon,
} from "./large-icons"
import { BUTTON_ICONS, toolIcon } from "./tool-icons"
import {
  ACTIONS,
  SPACER,
  actionOf,
  tabText,
  toolOfAction,
  type ControlSize,
  type ItemId,
  type RibbonControl,
  type RibbonPanel,
  type RibbonSlot,
  type RibbonTab,
  type RibbonToggle,
} from "./ribbon-home"
import { RIBBON_TABS } from "./ribbon-tabs"
import { CONTEXTUAL_TABS } from "./ribbon-contextual"
import {
  foldAt,
  foldSteps,
  levelFor,
  panelShape,
  type PanelShape,
} from "./ribbon-fold"
import {
  nextRibbonState,
  RIBBON_MINIMIZE_MODES,
  type RibbonLayout,
  type RibbonMinimizeMode,
} from "./ribbon-layout"
import { useRibbonLayout } from "./ribbon-layout-context"
import { RibbonMenu } from "./ribbon-menu"
import { keepControlKeys } from "./control-keys"
import { useEditorText } from "./editor-text"
import type { PieceProps } from "./piece"

/**
 * A ribbon button's look: the editor's tokens at AutoCAD's sizes (decision
 * 7). The faint frame under the pointer and the darker fill while pressed are
 * AutoCAD's states (desktop autocad-mouse/press-line.png); it never moves.
 * The button of a running command is not lit (R15): only a state is.
 */
const BUTTON =
  "inline-flex shrink-0 items-center rounded-sm border border-transparent text-ui whitespace-nowrap outline-none select-none hover:border-border hover:bg-muted active:bg-background focus-visible:border-ring aria-expanded:border-border aria-expanded:bg-muted"
const LIT = "bg-active/15 text-active-foreground hover:bg-active/25"
/** A drop-down's list row: a 32 px icon and the member's name, 38 high. */
const LIST_ROW =
  "flex h-9.5 cursor-default items-center gap-1.5 rounded-sm ps-0.75 pe-3 text-ui outline-hidden select-none data-highlighted:bg-accent data-current:bg-active/15"
const POPUP =
  "origin-(--transform-origin) rounded-md border bg-card text-popover-foreground shadow-md outline-none"
/**
 * A control sized by its text, rounded up to a whole pixel: a fraction would
 * leave every icon after it off the pixel grid, blurred (.claude/rules/ui.md,
 * "Size"). Where `calc-size` is not supported it keeps its text's width.
 */
const WHOLE = "w-[calc-size(fit-content,round(up,size,1px))]"
/**
 * A large control, rounded up to an even width: its 32 px icon is centred,
 * and in an odd one it would land on half a pixel.
 */
const WHOLE_EVEN = "w-[calc-size(fit-content,round(up,size,2px))]"
/**
 * A contextual tab: the accent's tint, and its text, AutoCAD's filled tab
 * drawn with the editor's one accent (decision 7).
 */
const CONTEXTUAL_TAB =
  "bg-active/15 text-active-foreground hover:bg-active/25 hover:text-active-foreground data-active:bg-active/25 data-active:text-active-foreground"
/** A small combo: AutoCAD's 22 (§2.3). */
const COMBO =
  "h-5.5 py-0 border-input bg-background shadow-none dark:bg-background"

interface Context {
  readonly engine: CadEngine
  readonly state: EditorState
  /** AutoCAD's ribbon text of an item, in the page's language. */
  readonly text: (id: ItemId) => string
  /** Runs what a button does, then gives the drawing its keys back. */
  readonly act: (run: () => void) => void
  /** A modal list's `finalFocus`: the drawing's, once it has closed. */
  readonly toDrawing: () => false
  /** Show Panel Titles: off, a title bar keeps its ▾ and launcher, not its name. */
  readonly titles: boolean
}

/**
 * AutoCAD's ribbon (docs/plans/autocad-ui.md, §2.3): its tab row, 24, with
 * the minimize button after the last tab, and under it the tab in front in
 * the state this device left it in — its panels (100), one button per panel
 * (62), one title per panel (21) or nothing. Each panel is acad.cuix's rows
 * at AutoCAD's sizes, with its title bar, the slide-out under it and their
 * push pin; the panels shed text and fold from the right as the window
 * narrows; the drop-downs keep the member last used in the engine
 * (`state.ribbon.members`), for the session.
 */
export function Ribbon({ engine, state }: PieceProps): ReactElement {
  const t = useEditorText("Ribbon")
  const items = useEditorText("Ribbon.items")
  const { layout, setLayout } = useRibbonLayout()
  const tabRow = useRef<HTMLDivElement>(null)
  // Minimized to the tabs, a tab's panels drop over the drawing while open.
  const [dropped, setDropped] = useState(false)
  const ctx: Context = {
    engine,
    state,
    text: (id) => items(id),
    act: (run) => {
      run()
      engine.focusSurface()
    },
    toDrawing: drawingFocus(engine),
    titles: layout.panelTitles,
  }
  // Where the right-click menu opened, while it is open.
  const [menuAt, setMenuAt] = useState<{ x: number; y: number } | null>(null)

  // The tab in front is the engine's (`setRibbonTab`), so it outlives the
  // piece, which unmounts while the ribbon is closed; hidden by Show Tabs,
  // the first one shown is in front instead. Its panels are those Show Panels
  // leaves (`layout.hiddenPanels`).
  // A running command's contextual tab follows the last, in front as it
  // opens (the engine's `ribbon.tab`); Show Tabs lists the workspace's only.
  const contextual = state.ribbon.contextual
  const contextualId = contextual?.id ?? null
  // A contextual tab closing under one of its focused boxes leaves the focus
  // on the page, the box gone: the drawing takes it.
  const wasContextual = useRef(contextualId)
  useEffect(() => {
    const was = wasContextual.current
    wasContextual.current = contextualId
    const page = tabRow.current?.ownerDocument
    if (was === null || contextualId !== null || !page) return
    if (!page.activeElement || page.activeElement === page.body)
      engine.focusSurface()
  }, [contextualId, engine])
  const shown = [
    ...RIBBON_TABS.filter((tab) => !layout.hiddenTabs.includes(tab.id)),
    ...(contextual ? [CONTEXTUAL_TABS[contextual.id]] : []),
  ]
  const chosen = shown.find((tab) => tab.id === state.ribbon.tab) ?? shown[0]
  const front = chosen && withPanelsShown(chosen, layout.hiddenPanels)
  const panelsLabel = front ? t(`tabs.${tabText(front)}`) : t("menu.empty")

  return (
    <TooltipProvider>
      <Tabs.Root
        value={front?.id ?? null}
        onValueChange={(value) => engine.setRibbonTab(String(value))}
        // A right-click on the tab row or a panel opens the ribbon's menu;
        // in one of its open lists or menus (portalled, reached here through
        // React) it is theirs, or the menu would open over a modal list.
        onContextMenu={(event) => {
          event.preventDefault()
          const target = event.target as HTMLElement
          if (target.closest('[role="listbox"], [role="menu"]')) return
          setMenuAt({ x: event.clientX, y: event.clientY })
        }}
        // The keys a control keeps (`keepControlKeys`).
        onKeyDownCapture={(event) => keepControlKeys(event, engine)}
      >
        {/* The tab row: the tabs 20 high on its foot, the one in front on
        the panels' surface, and after the last the minimize button and its
        arrow (20 × 18 and 10 × 18). */}
        <div ref={tabRow} className="flex h-6 items-end bg-background ps-1">
          <Tabs.List className="flex items-end">
            {shown.map((tab) => (
              <Tabs.Tab
                key={tab.id}
                value={tab.id}
                // A click hands the keys back to the drawing; the arrow keys
                // keep moving along the tabs. Minimized to the tabs, it drops
                // the tab's panels over the drawing.
                onClick={(event) => {
                  // In front only because the engine's tab is hidden: a click
                  // on it changes no value, so it is said here.
                  if (state.ribbon.tab !== tab.id) engine.setRibbonTab(tab.id)
                  if (layout.state === "tabs")
                    setDropped(!(dropped && tab.id === front?.id))
                  if (event.detail > 0) engine.focusSurface()
                }}
                className={cn(
                  "h-5 rounded-t-sm px-2.5 whitespace-nowrap text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50",
                  layout.state === "tabs"
                    ? dropped &&
                        "data-active:bg-card data-active:text-foreground"
                    : "data-active:bg-card data-active:text-foreground",
                  // A contextual tab wears the accent, in front or not
                  // (desktop hatch/d01-2, arrays/d07-1).
                  tab.id === contextual?.id && CONTEXTUAL_TAB
                )}
              >
                {t(`tabs.${tabText(tab)}`)}
              </Tabs.Tab>
            ))}
          </Tabs.List>
          <MinimizeButton
            layout={layout}
            onLayout={(next) => {
              setDropped(false)
              setLayout(next)
            }}
            ctx={ctx}
          />
        </div>
        {layout.state === "full" && !front && (
          // Every tab hidden: AutoCAD's words for an empty ribbon
          // (AdWindows' system:String_81) where the panels were.
          <div className="flex h-25 items-center justify-center text-muted-foreground">
            {panelsLabel}
          </div>
        )}
        {layout.state === "full" && front && (
          <Tabs.Panel
            key={front.id}
            value={front.id}
            aria-label={panelsLabel}
            className="flex h-25 pt-px outline-none"
          >
            <FoldingRow
              key={layout.hiddenPanels.join()}
              tab={front}
              ctx={ctx}
            />
          </Tabs.Panel>
        )}
        {front &&
          (layout.state === "panelButtons" ||
            layout.state === "panelTitles") && (
            <Tabs.Panel
              key={front.id}
              value={front.id}
              aria-label={panelsLabel}
              ref={rounded}
              className={cn(
                "flex overflow-hidden outline-none",
                layout.state === "panelButtons"
                  ? "h-15.5 pt-px"
                  : "h-5.25 pt-px"
              )}
            >
              <UnderTextEditor tab={front} ctx={ctx}>
                {front.panels.map((panel) => (
                  <PanelPopup
                    key={panel.id}
                    panel={panel}
                    as={layout.state === "panelButtons" ? "button" : "title"}
                    ctx={ctx}
                  />
                ))}
              </UnderTextEditor>
            </Tabs.Panel>
          )}
        {front && layout.state === "tabs" && (
          <DroppedPanels
            open={dropped}
            onOpenChange={setDropped}
            anchor={tabRow}
            label={panelsLabel}
            tab={front}
            ctx={ctx}
          />
        )}
      </Tabs.Root>
      <RibbonMenu
        at={menuAt}
        onClose={() => setMenuAt(null)}
        layout={layout}
        setLayout={setLayout}
        tab={chosen}
        engine={engine}
      />
    </TooltipProvider>
  )
}

/** A tab with the panels Show Panels hid taken out, and their steps of its fold. */
function withPanelsShown(tab: RibbonTab, hidden: readonly string[]): RibbonTab {
  if (!tab.panels.some((panel) => hidden.includes(panel.id))) return tab
  return {
    ...tab,
    panels: tab.panels.filter((panel) => !hidden.includes(panel.id)),
    fold: tab.fold?.filter((step) => !hidden.includes(step.panel)),
  }
}

/**
 * The minimize button and its arrow's menu (plan §2.3): a click steps to the
 * state its mode leads to (`nextRibbonState`); the menu, rows of 22, sets
 * the mode — Minimize to Tabs, to Panel Titles, to Panel Buttons | Cycle
 * through All — each culture's AdWindows.resources.dll's words. The button
 * is named for what it does next, as its tooltip on the desktop is.
 */
function MinimizeButton({
  layout,
  onLayout,
  ctx,
}: {
  layout: RibbonLayout
  onLayout: (layout: RibbonLayout) => void
  ctx: Context
}) {
  const t = useEditorText("Ribbon.minimize")
  const portal = usePortalContainer()
  const next = nextRibbonState(layout)
  const label = next === "full" ? t("full") : t(next)
  // A box with ▲ while a click minimizes further, with ▼ once it shows the
  // full ribbon again (block5/minbtn-*.png).
  const Icon = next === "full" ? PanelTopOpen : PanelTopClose
  return (
    <div className="ms-1 mb-px flex h-4.5 items-stretch text-muted-foreground">
      <button
        type="button"
        aria-label={label}
        className="flex w-5 items-center justify-center rounded-s-sm outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
        onClick={() => {
          onLayout({ ...layout, state: next })
          ctx.engine.focusSurface()
        }}
      >
        <Icon aria-hidden className="size-3.5" />
      </button>
      <Menu.Root>
        {/* Named by the mode it holds: the button beside it is named for what
        it does next, and two controls of one name could not be told apart. */}
        <Menu.Trigger
          aria-label={t(layout.mode)}
          className="flex w-2.5 items-center justify-center rounded-e-sm outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 aria-expanded:bg-muted"
        >
          <ChevronDown aria-hidden className="size-2.5" />
        </Menu.Trigger>
        <Menu.Portal container={portal}>
          <Menu.Positioner
            side="bottom"
            align="start"
            sideOffset={1}
            className="z-50"
          >
            <Menu.Popup
              className={cn(POPUP, "min-w-57.5 p-0.5")}
              finalFocus={ctx.toDrawing}
            >
              <Menu.RadioGroup
                value={layout.mode}
                onValueChange={(mode: RibbonMinimizeMode) =>
                  onLayout({ ...layout, mode })
                }
              >
                {RIBBON_MINIMIZE_MODES.map((mode) => (
                  <Fragment key={mode}>
                    {mode === "cycle" && (
                      <Menu.Separator className="-mx-0.5 my-0.5 h-px bg-border" />
                    )}
                    <Menu.RadioItem
                      value={mode}
                      closeOnClick
                      className="relative flex h-5.5 cursor-default items-center rounded-sm ps-8.75 pe-3 whitespace-nowrap outline-hidden select-none data-highlighted:bg-accent"
                    >
                      <Menu.RadioItemIndicator className="absolute inset-s-2.5 flex">
                        <Check aria-hidden className="size-3.5 text-primary" />
                      </Menu.RadioItemIndicator>
                      {t(mode)}
                    </Menu.RadioItem>
                  </Fragment>
                ))}
              </Menu.RadioGroup>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
    </div>
  )
}

/**
 * The panels of the tab in front, folded to fit the row (plan §2.3): its
 * steps (`foldSteps`) taken one by one until what they leave fits, each
 * level's width measured once and kept, so a wider window goes straight back
 * to the first level that fits. WHY measured and not a table of widths: the
 * panels are as wide as their words in the page's language and the members
 * they show. WHY no sideways scroll any more: a panel past the edge folds.
 */
function FoldingRow({ tab, ctx }: { tab: RibbonTab; ctx: Context }) {
  const row = useRef<HTMLDivElement>(null)
  const content = useRef<HTMLDivElement>(null)
  const steps = foldSteps(tab).length
  const [level, setLevel] = useState(0)
  const at = useRef(0)
  const needed = useRef<(number | undefined)[]>([])
  const fit = useRef<() => void>(() => {})

  useLayoutEffect(() => {
    at.current = level
    fit.current = () => {
      const box = row.current
      const panels = content.current
      if (!box || !panels) return
      roundWidths(panels)
      const width = box.clientWidth
      const need = Math.ceil(panels.getBoundingClientRect().width)
      const now = at.current
      // What a level needs changes with the members shown and the words:
      // then what the others were measured to need is no longer known.
      if (needed.current[now] !== undefined && needed.current[now] !== need)
        needed.current = []
      needed.current[now] = need
      const next =
        need > width
          ? Math.min(now + 1, steps)
          : levelFor(width, needed.current, steps)
      if (next !== now) setLevel(next)
    }
  })

  // After every render, before it is painted: a step that leaves the panels
  // too wide takes the next at once, so no frame shows them cut.
  useLayoutEffect(() => fit.current())

  // The window's width, and the panels' own: a font that arrives after the
  // first paint (Arabic's Readex Pro) widens them with no render.
  useLayoutEffect(() => {
    const box = row.current
    const panels = content.current
    if (!box || !panels) return
    // Synchronous, so the frame the resize is painted in is already folded.
    const observer = new ResizeObserver(() => flushSync(() => fit.current()))
    observer.observe(box)
    observer.observe(panels)
    return () => observer.disconnect()
  }, [])

  const folds = foldAt(tab, level)
  return (
    <div ref={row} className="flex min-w-0 flex-1 overflow-hidden">
      {/* WHY shrink-0: a flex item, the panels shrank to the row as a label
      wrapped, and the fold measured the row's width, never theirs (Arabic,
      Japanese and Chinese at 1280 kept a level 44 px too wide). */}
      <div ref={content} className="flex w-max shrink-0">
        <UnderTextEditor tab={tab} ctx={ctx}>
          {tab.panels.map((panel) => {
            const fold = folds.get(panel.id) ?? { reduced: 0, folded: false }
            return fold.folded ? (
              <PanelPopup key={panel.id} panel={panel} as="folded" ctx={ctx} />
            ) : (
              <PanelView
                key={panel.id}
                panel={panel}
                shape={panelShape(panel, fold.reduced)}
                ctx={ctx}
              />
            )
          })}
        </UnderTextEditor>
      </div>
    </div>
  )
}

/**
 * A tab's panels, every control greyed while the text editor is open on
 * another tab, as AutoCAD's (desktop 2026-11-27, bt-home, bt-tree: Home's
 * Draw disabled under MTEXT's and TEXTEDIT's editor), so no button reaches
 * the editor; a lit toggle loses its tint too.
 */
function UnderTextEditor({
  tab,
  ctx,
  children,
}: {
  tab: RibbonTab
  ctx: Context
  children: ReactNode
}) {
  const greyed =
    ctx.state.ribbon.contextual?.id === "textEditor" && tab.id !== "textEditor"
  return (
    <fieldset
      disabled={greyed}
      className={cn(
        "contents",
        greyed &&
          "pointer-events-none [&_*]:text-faint-foreground [&_[aria-pressed=true]]:bg-transparent"
      )}
    >
      {children}
    </fieldset>
  )
}

/** Whether this browser rounds a text's width itself (`WHOLE`). */
const roundsWidths = (): boolean =>
  typeof CSS !== "undefined" &&
  CSS.supports("width", "calc-size(fit-content, size)")

/**
 * Rounds up, where `calc-size` is not supported, the width of what `WHOLE`
 * and `WHOLE_EVEN` size by their text, deepest first so a panel is measured
 * round its rounded buttons: a fraction would push every icon after it off
 * the pixel grid (plan §6, block 3's review). Firefox and Safari, without
 * `calc-size`, are unverified: neither is installed here.
 */
function roundWidths(root: HTMLElement): void {
  if (roundsWidths()) return
  const sized = [
    ...root.querySelectorAll<HTMLElement>('[class*="calc-size(fit-content"]'),
  ]
  if (root.matches('[class*="calc-size(fit-content"]')) sized.push(root)
  const depth = (element: HTMLElement) => {
    let n = 0
    for (
      let at: Element | null = element;
      at && at !== root;
      at = at.parentElement
    )
      n++
    return n
  }
  for (const element of sized) element.style.width = ""
  const byDepth = new Map<number, HTMLElement[]>()
  for (const element of sized) {
    const d = depth(element)
    byDepth.set(d, [...(byDepth.get(d) ?? []), element])
  }
  for (const d of [...byDepth.keys()].sort((a, b) => b - a)) {
    const level = byDepth.get(d) ?? []
    const widths = level.map((element) => element.getBoundingClientRect().width)
    level.forEach((element, i) => {
      const step = element.className.includes("2px))") ? 2 : 1
      element.style.width = `${Math.ceil(widths[i] / step) * step}px`
    })
  }
}

/**
 * Rounds the widths inside what it is the ref of, once it is in the page: a
 * popup, or the panel titles' row, which no `FoldingRow` measures.
 */
function rounded(element: HTMLElement | null): void {
  if (element) roundWidths(element)
}

/**
 * A panel, 97 high: 4, its rows (72), 3 and its title bar (18). Its
 * slide-out drops from the title bar over the drawing and closes as the
 * pointer leaves it, unless pinned (desktop autocad-mouse/ds-a.png).
 */
function PanelView({
  panel,
  shape,
  ctx,
}: {
  panel: RibbonPanel
  shape: PanelShape
  ctx: Context
}) {
  const t = useEditorText("Ribbon")
  const portal = usePortalContainer()
  const anchor = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [pinned, setPinned] = useState(false)
  const name = t(`panels.${panel.id}`)
  const slideOut = slideOutOf(panel, ctx)
  const launcher = <Launcher panel={panel} ctx={ctx} />

  return (
    <div
      ref={anchor}
      className={cn("flex h-24.25 shrink-0 flex-col border-e", WHOLE)}
      onPointerLeave={() => {
        if (!pinned) setOpen(false)
      }}
    >
      <PanelRows panel={panel} shape={shape} ctx={ctx} untitled={!ctx.titles} />
      <div
        className={cn(
          "mx-px flex text-muted-foreground",
          ctx.titles ? "mt-0.75 h-4.5" : "mt-1.75 h-2.75"
        )}
      >
        {slideOut.length > 0 ? (
          <Popover.Root
            open={open}
            onOpenChange={(next, details) => {
              // Pinned, it stays until its own title bar closes it: the
              // pointer leaving it, a click outside or Escape do not.
              if (!next && pinned && details.reason !== "close-press") return
              setOpen(next)
              if (!next) setPinned(false)
            }}
          >
            {/* A click focuses the title bar, whose next Space would close
            the slide-out and repeat no command: the drawing takes the keys
            back, the slide-out staying open (a popover closes on a press
            elsewhere, not on focus leaving). */}
            <Popover.Trigger
              aria-label={name}
              className="flex flex-1 items-center justify-center gap-1 rounded-sm outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
              onClick={(event) => {
                if (event.detail > 0) ctx.engine.focusSurface()
              }}
            >
              {ctx.titles && name}
              <ChevronDown aria-hidden className="size-3" />
            </Popover.Trigger>
            <Popover.Portal container={portal}>
              <Popover.Positioner
                anchor={anchor}
                side="bottom"
                align="start"
                sideOffset={ctx.titles ? -18 : -11}
                collisionPadding={0}
                className="z-50"
              >
                {/* The drawing keeps the keys: opening takes no focus, and
                closing gives none back to the title bar. WHY not
                `toDrawing`: a popover that is not modal also closes on a
                press elsewhere, and Base UI runs the function on every
                close — it would take focus from the field just pressed. */}
                <Popover.Popup
                  ref={rounded}
                  initialFocus={false}
                  finalFocus={false}
                  className={cn(
                    POPUP,
                    "min-w-(--anchor-width) rounded-t-none border-t-0 pt-5.5 shadow-lg"
                  )}
                >
                  <SlideOutRows rows={slideOut} ctx={ctx} />
                  <div className="mx-px mt-px flex h-4.5 items-center text-muted-foreground">
                    <button
                      type="button"
                      aria-label={t("pin")}
                      aria-pressed={pinned}
                      className="flex h-4.5 w-4 items-center justify-center rounded-sm outline-none hover:bg-muted hover:text-foreground"
                      onClick={() => setPinned(!pinned)}
                    >
                      {pinned ? (
                        <Pin className="size-3" />
                      ) : (
                        <PinOff className="size-3" />
                      )}
                    </button>
                    {/* The title bar moved under the rows: it closes the
                    slide-out, as the one it covers opened it. */}
                    <Popover.Close
                      aria-label={name}
                      className="flex h-4.5 flex-1 items-center justify-center rounded-sm outline-none hover:bg-muted hover:text-foreground"
                      onClick={() => ctx.engine.focusSurface()}
                    >
                      {ctx.titles && name}
                    </Popover.Close>
                    {panel.launcher ? (
                      launcher
                    ) : (
                      <span aria-hidden className="w-4" />
                    )}
                  </div>
                </Popover.Popup>
              </Popover.Positioner>
            </Popover.Portal>
          </Popover.Root>
        ) : (
          <span className="flex flex-1 items-center justify-center">
            {ctx.titles && name}
          </span>
        )}
        {panel.launcher && launcher}
      </div>
    </div>
  )
}

/**
 * A panel's rows before its break: 4 above them, 72 high. With Show Panel
 * Titles off AutoCAD's title bar keeps its ▾ in 11 of its 18 and the panel
 * its 97, the rows 7 under its top and the bar 7 under them (desktop
 * 2026-11-26, rc-after-titles: Draw's bar 143 to 154, Line's text 3 lower).
 */
function PanelRows({
  panel,
  shape,
  ctx,
  untitled = false,
}: {
  panel: RibbonPanel
  shape: PanelShape
  ctx: Context
  untitled?: boolean
}) {
  return (
    <div
      className={cn(
        "flex h-18 items-start ps-0.75 pe-0.5",
        untitled ? "mt-1.75" : "mt-1"
      )}
    >
      {panel.slots.map((slot, i) => (
        <Fragment key={i}>
          {i > 0 && (
            <span
              aria-hidden
              className={gapBetween(panel.slots[i - 1], slot)}
            />
          )}
          <Slot slot={slot} at={i} shape={shape} ctx={ctx} />
        </Fragment>
      ))}
    </div>
  )
}

/** A panel's slide-out rows, with what the engine has. */
function slideOutOf(
  panel: RibbonPanel,
  ctx: Context
): (RibbonControl | typeof SPACER)[][] {
  return (panel.slideOut ?? [])
    .map((row) => row.filter((c) => c === SPACER || shows(c, ctx)))
    .filter((row) => row.some((c) => c !== SPACER))
}

/** The slide-out's rows on the 24 px pitch. */
function SlideOutRows({
  rows,
  ctx,
}: {
  rows: readonly (readonly (RibbonControl | typeof SPACER)[])[]
  ctx: Context
}) {
  return (
    <div className="flex flex-col gap-0.5 ps-0.5 pe-0.5">
      {rows.map((row, r) => (
        <div key={r} className="flex h-5.5 items-center">
          {row.map((control, c) =>
            control === SPACER ? (
              <span key={c} aria-hidden className="w-1" />
            ) : (
              <Control key={c} control={control} ctx={ctx} />
            )
          )}
        </div>
      ))}
    </div>
  )
}

/**
 * A panel's dialog launcher, at the end of its title bar, the slide-out's
 * too, which covers the panel's: Properties' runs PROPERTIES as Ctrl+1,
 * Text's and Dimensions' `'_style` and `'_dimstyle` (acad.cuix's ID_Style,
 * ID_Ddim), named as AutoCAD's tooltips name them.
 */
function Launcher({ panel, ctx }: { panel: RibbonPanel; ctx: Context }) {
  const t = useEditorText("Ribbon")
  const button = panel.launcher
  if (!button) return null
  const name =
    button === "properties" ? t(`panels.${panel.id}`) : ctx.text(button)
  return (
    <Tip
      tip={button === "properties" ? "propertiesLauncher" : button}
      title={name}
      ctx={ctx}
    >
      <button
        type="button"
        aria-label={name}
        className="flex h-4.5 max-h-full w-3 items-end justify-center rounded-sm pb-0.5 outline-none hover:bg-muted hover:text-foreground"
        onClick={() => ctx.act(() => ctx.engine.runRibbonButton(button))}
      >
        <MoveDiagonal2
          aria-hidden
          className="size-2.5 -scale-y-100 rtl:-scale-x-100"
        />
      </button>
    </Tip>
  )
}

/**
 * A panel as one button that opens it whole under it (plan §2.3): folded as
 * the window narrows (`folded`, 61 × 97: its 32 px icon, its name and ▾), or
 * the ribbon minimized to panel buttons (`button`, 60 × 59, the icon over
 * the name) or to panel titles (`title`, 18 high). Open, the panel shows its
 * rows, its slide-out's rows already out, and its title bar at the foot,
 * left-aligned with the button. A popover that is not modal: the drawing
 * keeps the keys.
 */
function PanelPopup({
  panel,
  as,
  ctx,
}: {
  panel: RibbonPanel
  as: "folded" | "button" | "title"
  ctx: Context
}) {
  const t = useEditorText("Ribbon")
  const portal = usePortalContainer()
  const name = t(`panels.${panel.id}`)
  const slideOut = slideOutOf(panel, ctx)

  const trigger = (() => {
    switch (as) {
      case "folded":
        return cn(
          BUTTON,
          "me-px h-24.25 w-15 flex-col justify-start bg-muted/60 pt-1"
        )
      case "button":
        return cn(BUTTON, "me-px h-14.75 w-15 flex-col justify-start pt-1")
      case "title":
        return cn(BUTTON, "h-4.5 px-1.5", WHOLE)
    }
  })()

  const popover = (
    <Popover.Root>
      {/* A click on the button leaves the drawing the keys, as a slide-out's
      title bar does; no tooltip, which would keep the popover shut. */}
      <Popover.Trigger
        aria-label={as === "title" ? undefined : name}
        className={trigger}
        onClick={(event) => {
          if (event.detail > 0) ctx.engine.focusSurface()
        }}
      >
        {as !== "title" && <LargeGlyph action={panel.icon} />}
        {as === "title" ? (
          name
        ) : (
          <span className="mt-0.5 w-full truncate px-0.5 text-center">
            {name}
          </span>
        )}
        {as === "folded" && (
          <ChevronDown aria-hidden className="mt-auto mb-1 size-3" />
        )}
      </Popover.Trigger>
      <Popover.Portal container={portal}>
        <Popover.Positioner
          side="bottom"
          align="start"
          collisionPadding={0}
          className="z-50"
        >
          <Popover.Popup
            ref={rounded}
            initialFocus={false}
            finalFocus={false}
            aria-label={name}
            className={cn(POPUP, "rounded-t-none shadow-lg")}
          >
            <PanelRows panel={panel} shape={WHOLE_SHAPE} ctx={ctx} />
            {slideOut.length > 0 && (
              <div className="mt-0.5">
                <SlideOutRows rows={slideOut} ctx={ctx} />
              </div>
            )}
            <div className="mx-px mt-0.75 flex h-4.5 text-muted-foreground">
              <span className="flex flex-1 items-center justify-center">
                {name}
              </span>
              <Launcher panel={panel} ctx={ctx} />
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
  // A title keeps its panel's dialog launcher after it, as on the desktop
  // (block5/titles-draw.png: Properties' ↘), and no ▾.
  return as === "title" ? (
    <div className="mt-px flex h-4.5 shrink-0 items-center border-e pe-px text-muted-foreground">
      {popover}
      <Launcher panel={panel} ctx={ctx} />
    </div>
  ) : (
    popover
  )
}

/** A panel shown whole: nothing shed. */
const WHOLE_SHAPE: PanelShape = panelShape(
  { id: "draw", icon: "line", slots: [] },
  0
)

/**
 * Minimized to the tabs, the tab's panels drop over the drawing from under
 * the tab row, as wide as it, while the tab is open: a click on a tab opens
 * them, another or a press elsewhere closes them.
 */
function DroppedPanels({
  open,
  onOpenChange,
  anchor,
  label,
  tab,
  ctx,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  anchor: RefObject<HTMLDivElement | null>
  label: string
  tab: RibbonTab
  ctx: Context
}) {
  const portal = usePortalContainer()
  return (
    <Popover.Root
      open={open}
      onOpenChange={(next, details) => {
        // A press on the tab row is the tabs': a tab's click opens its panels
        // or closes them.
        const target = details.event?.target
        if (!next && target instanceof Node && anchor.current?.contains(target))
          return
        onOpenChange(next)
      }}
    >
      <Popover.Portal container={portal}>
        <Popover.Positioner
          anchor={anchor}
          side="bottom"
          align="start"
          collisionPadding={0}
          className="z-50"
        >
          <Popover.Popup
            initialFocus={false}
            finalFocus={false}
            aria-label={label}
            className="flex h-25 w-(--anchor-width) border-b bg-card pt-px shadow-lg outline-none"
          >
            <FoldingRow key={tab.id} tab={tab} ctx={ctx} />
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}

/**
 * What parts two slots of a panel's row (acad.cuix's, measured in
 * uia-a-1920-tab-ID_TabHome.txt): large buttons abut, a column sits 1 px
 * after a large one, and columns of small ones stand 5 apart.
 */
function gapBetween(before: RibbonSlot, after: RibbonSlot): string {
  const stacked = (slot: RibbonSlot) =>
    slot.kind === "column" || slot.kind === "rows" || slot.kind === "fields"
  if (stacked(before) && stacked(after)) return "w-1.25"
  if (stacked(before) || stacked(after)) return "w-px"
  return "hidden"
}

/** A control that sheds its text: a small one shows its icon alone. */
function iconsOnly(control: RibbonControl): RibbonControl {
  switch (control.kind) {
    case "tool":
    case "split":
    case "attributeDisplay":
      return control.size === "small" ? { ...control, size: "icon" } : control
    default:
      return control
  }
}

/** The `at`-th slot of a panel's row, as much of it as its shape leaves. */
function Slot({
  slot,
  at,
  shape,
  ctx,
}: {
  slot: RibbonSlot
  at: number
  shape: PanelShape
  ctx: Context
}) {
  const shed = (control: RibbonControl, row?: number) =>
    shape.iconsOnly(at, row) ? iconsOnly(control) : control
  if (slot.kind === "column") {
    // Three rows on a 24 px pitch, the first 1 px below a large button's top.
    return (
      <div className="mt-px flex flex-col items-start gap-0.5">
        {slot.rows.map((row, i) => (
          <Control
            key={i}
            control={shed(row, i)}
            narrow={shape.narrowCombos}
            ctx={ctx}
          />
        ))}
      </div>
    )
  }
  if (slot.kind === "rows") {
    // A sub-panel's rows, each its controls side by side, on the same pitch.
    return (
      <div className="mt-px flex flex-col items-start gap-0.5">
        {slot.rows.map((row, i) => (
          <div key={i} className="flex h-5.5 items-center">
            {row.map((control, c) =>
              control === SPACER ? (
                <span key={c} aria-hidden className="w-1" />
              ) : (
                <Control key={c} control={shed(control, i)} ctx={ctx} />
              )
            )}
          </div>
        ))}
      </div>
    )
  }
  if (slot.kind === "fields") return <Fields fields={slot.fields} ctx={ctx} />
  return <Control control={shed(slot)} ctx={ctx} />
}

/** Whether the engine has what an item runs. */
function hasAction(action: string, ctx: Context): boolean {
  const tool = toolOfAction(action)
  return ctx.state.tools.some((t) => t.id === tool)
}

/** Whether a control has what it runs: a tool the engine lacks shows none. */
function shows(control: RibbonControl, ctx: Context): boolean {
  switch (control.kind) {
    case "tool":
      return hasAction(actionOf(control.tool), ctx)
    case "split":
      return control.members.some(
        (m) => m !== null && hasAction(actionOf(m), ctx)
      )
    default:
      return true
  }
}

/**
 * Runs an item's action as its button does: a tool's start (`_line`), a
 * button's macro, a member of the navigation bar's Zoom, or its Pan or Orbit.
 */
function runAction(engine: CadEngine, action: string): void {
  const known = ACTIONS[action]
  if (!known) engine.setActiveTool(action)
  else if (known.kind === "button") engine.runRibbonButton(known.button)
  else if (known.kind === "zoom") engine.zoom(known.option)
  else engine.navigate(known.command)
}

/**
 * The actions whose glyph is a direction in time, mirrored in a right-to-left
 * page as Zoom Previous is on the navigation bar (.claude/rules/ui.md).
 */
const MIRRORED: ReadonlySet<string> = new Set(["zoomPrevious", "ucsPrevious"])
const mirror = (action: string) =>
  MIRRORED.has(action) ? "rtl:-scale-x-100" : undefined

/** An action's 16 px glyph. */
function smallIcon(action: string): LucideIcon {
  return BUTTON_ICONS[action] ?? toolIcon(action)
}

/** An action's 32 px glyph. */
function largeIcon(action: string): LargeIcon | undefined {
  return LARGE_TOOL_ICONS[action] ?? LARGE_BUTTON_ICONS[action]
}

/** An action's 32 px glyph, drawn: a list's row, a large split's icon. */
function LargeGlyph({ action }: { action: string }): ReactElement | null {
  const icon = largeIcon(action)
  return icon ? createElement(icon, { className: mirror(action) }) : null
}

function Control({
  control,
  narrow = false,
  ctx,
}: {
  control: RibbonControl
  /** The Properties panel's combos narrowed as the window narrows. */
  narrow?: boolean
  ctx: Context
}) {
  const { engine } = ctx
  if (!shows(control, ctx)) return null

  switch (control.kind) {
    case "tool": {
      const action = actionOf(control.tool)
      return (
        <ToolButton
          size={control.size}
          action={action}
          text={ctx.text(control.tool)}
          tip={control.tool}
          ctx={ctx}
          onClick={() => ctx.act(() => runAction(engine, action))}
        />
      )
    }
    case "command":
      return (
        <SmallButton
          icon={control.button === "textStyle" ? CaseSensitive : PencilRuler}
          label={ctx.text(control.button)}
          tip={control.button}
          ctx={ctx}
          onClick={() => ctx.act(() => engine.runRibbonButton(control.button))}
        />
      )
    case "toggle":
      return <ToggleButton toggle={control.toggle} ctx={ctx} />
    case "split":
      return <SplitButton control={control} ctx={ctx} />
    case "layerProperties":
      return <LayerPropertiesButton ctx={ctx} />
    case "layerCombo":
      return <LayerCombo ctx={ctx} />
    case "propertyCombo":
      return (
        <PropertyCombo property={control.property} narrow={narrow} ctx={ctx} />
      )
    case "insertGallery":
      return <InsertGallery ctx={ctx} />
    case "attributeDisplay":
      return <AttributeDisplay size={control.size} ctx={ctx} />
    case "visualStyles":
      return <VisualStyles ctx={ctx} />
    case "styleList":
      return <StyleList style={control.style} ctx={ctx} />
    case "field":
      // A field alone (a slide-out's row): a grid of its own.
      return <Fields fields={[control.field]} ctx={ctx} />
    case "arrayType":
      return <ArrayType type={control.type} ctx={ctx} />
    case "contextualToggle":
      return <ContextualToggle toggle={control.toggle} ctx={ctx} />
    case "pathMethod":
      return <PathMethod ctx={ctx} />
    case "closeContextual":
      return (
        <LargeButton
          icon={LARGE_BUTTON_ICONS[control.text]}
          text={ctx.text(control.text)}
          tip={control.text}
          ctx={ctx}
          onClick={() =>
            ctx.act(() => engine.editContextualTab({ close: true }))
          }
        />
      )
    case "hatchBoundary": {
      const item =
        control.boundary === "pick" ? "hatchPickPoints" : "hatchSelect"
      const act = () =>
        ctx.act(() => engine.editContextualTab({ boundary: control.boundary }))
      return control.size === "large" ? (
        <LargeButton
          icon={LARGE_BUTTON_ICONS[item]}
          text={ctx.text(item)}
          tip={item}
          ctx={ctx}
          // WHY one line: acad.CUIX's Text has no break (`Pick Points`),
          // where Set Origin's and Close Hatch Creation's have their `&#xD;`.
          oneLine
          onClick={act}
        />
      ) : (
        <SmallButton
          icon={SquareDashedMousePointer}
          label={ctx.text(item)}
          withText={control.size === "small"}
          tip={item}
          ctx={ctx}
          onClick={act}
        />
      )
    }
    case "hatchPatterns":
      return <HatchPatterns ctx={ctx} />
    case "hatchProperties":
      return <HatchProperties ctx={ctx} />
    case "textStyles":
      return <TextStyles ctx={ctx} />
    case "textHeight":
      return <TextHeight ctx={ctx} />
    case "textJustification":
      return <TextJustification ctx={ctx} />
  }
}

/** Each field's 16 px glyph, ours (the BAML's are Autodesk's art). */
const FIELD_ICONS: Readonly<Record<ContextualFieldId, LucideIcon>> = {
  columns: Columns3,
  columnSpacing: MoveHorizontal,
  columnTotal: FoldHorizontal,
  rows: Rows3,
  rowSpacing: MoveVertical,
  rowTotal: FoldVertical,
  rowElevation: ArrowUpFromLine,
  levels: Layers,
  levelSpacing: ChevronsUp,
  levelTotal: FoldVertical,
  items: Hash,
  angleBetween: RotateCcw,
  fillAngle: CircleDashed,
  itemSpacing: MoveHorizontal,
  hatchAngle: RotateCcw,
  hatchScale: Scaling,
  textHeight: CaseSensitive,
}

/** Each field's tooltip, its AcWindows `TT_…` (Items: the polar or the path one's). */
function fieldTip(field: ContextualFieldId, ctx: Context): TipKey {
  switch (field) {
    case "columns":
      return "arrayColumns"
    case "columnSpacing":
      return "arrayColumnSpacing"
    case "columnTotal":
      return "arrayColumnTotal"
    case "rows":
      return "arrayRows"
    case "rowSpacing":
      return "arrayRowSpacing"
    case "rowTotal":
      return "arrayRowTotal"
    case "rowElevation":
      return "arrayRowElevation"
    case "levels":
      return "arrayLevels"
    case "levelSpacing":
      return "arrayLevelSpacing"
    case "levelTotal":
      return "arrayLevelTotal"
    case "items":
      return onPath(ctx) ? "arrayPathItems" : "arrayPolarItems"
    case "angleBetween":
      return "arrayAngleBetween"
    case "fillAngle":
      return "arrayFillAngle"
    case "itemSpacing":
      return "arrayItemSpacing"
    case "hatchAngle":
    case "hatchScale":
    case "textHeight":
      return field
  }
}

/** Whether the tab in front is a path array's, created or selected. */
function onPath(ctx: Context): boolean {
  const id = ctx.state.ribbon.contextual?.id
  return id === "arrayCreationPath" || id === "arraySelectionPath"
}

/**
 * A contextual tab's fields, one a row of 22 on the 24 px pitch: a 16 px
 * glyph, the label and a box of 98, the boxes in a column after the longest
 * label, as the BAML's `Grid` lays them (desktop arrays/d07-1).
 */
function Fields({
  fields,
  ctx,
}: {
  fields: readonly ContextualFieldId[]
  ctx: Context
}) {
  return (
    <div className="mt-px grid grid-cols-[auto_auto_auto] gap-y-0.5">
      {fields.map((field) => (
        <Field key={field} field={field} ctx={ctx} />
      ))}
    </div>
  )
}

/**
 * A field: what its prompt offers, and what is typed in it going to the
 * running command as that prompt takes it (`editContextualTab`), on Enter or
 * on leaving the box (the BAML's `AcceptTextOnLostFocus`); Escape puts the
 * value back. Enter and Escape give the drawing the keys back; the box's
 * other keys are its own (the engine leaves a text box's alone). WHY no
 * `DecimalInput`: the box takes what its prompt takes, read by the engine (a
 * length in the drawing's units, an angle), and its arrows move the caret as
 * the BAML's text box does, stepping nothing.
 */
function Field({ field, ctx }: { field: ContextualFieldId; ctx: Context }) {
  const t = useEditorText("Ribbon")
  if (!ctx.state.ribbon.contextual?.fields[field]) return null
  const Icon = FIELD_ICONS[field]
  const label = t(`fields.${field}`)
  const id = `ribbon-field-${field}`
  // A path's count has its toggle where the glyph is (arraypath-tab).
  const toggle =
    field === "items" && ctx.state.ribbon.contextual?.id === "arrayCreationPath"
  return (
    <Tip tip={fieldTip(field, ctx)} title={label} ctx={ctx}>
      <div className="col-span-3 grid h-5.5 grid-cols-subgrid items-center">
        {toggle ? (
          <FillPathToggle ctx={ctx} />
        ) : (
          <Icon aria-hidden className="mx-1 size-4 text-muted-foreground" />
        )}
        <label htmlFor={id} className="pe-1 whitespace-nowrap">
          {label}
        </label>
        <FieldBox field={field} id={id} className="w-24.5" ctx={ctx} />
      </div>
    </Tip>
  )
}

/**
 * ARRAYPATH's count toggle (a BindableToggleButton of 24 × 22 before Items,
 * desktop arraypath-tab): lit while Measure works the count out from the
 * path, which greys Items, as the prompt's Fill entire path; Divide gives the
 * count, so it is greyed then (**unverified**: only Measure was seen). Its
 * tooltip is the field's (TT_AcPathArrayItemCount), its name that tooltip's.
 */
function FillPathToggle({ ctx }: { ctx: Context }) {
  const t = useEditorText("Ribbon")
  const contextual = ctx.state.ribbon.contextual
  const on = contextual?.toggles.fillPath === true
  return (
    <button
      type="button"
      aria-label={t("tipTitles.arrayPathItems")}
      aria-pressed={on}
      disabled={contextual?.method !== "measure"}
      className={cn(BUTTON, "h-5.5 w-6 justify-center", on && LIT)}
      onClick={() =>
        ctx.act(() => ctx.engine.editContextualTab({ toggle: "fillPath" }))
      }
    >
      <Hash aria-hidden className="size-4" />
    </button>
  )
}

/** A field's box, as `Field` describes it; its width the caller's. */
function FieldBox({
  field,
  id,
  label,
  varies = "",
  className,
  ctx,
}: {
  field: ContextualFieldId
  id?: string
  /** Its name, where no `label` element names it. */
  label?: string
  /** What it reads where the objects differ (Hatch Editor's Angle: *VARIES*). */
  varies?: string
  className: string
  ctx: Context
}) {
  const { engine } = ctx
  const value = ctx.state.ribbon.contextual?.fields[field]
  const [draft, setDraft] = useState<string | null>(null)
  // WHY a ref: Escape's blur would commit the draft the state still holds.
  const typed = useRef<string | null>(null)
  if (!value) return null
  const set = (text: string | null) => {
    typed.current = text
    setDraft(text)
  }
  return (
    <input
      id={id}
      aria-label={label}
      type="text"
      inputMode="decimal"
      dir="ltr"
      autoComplete="off"
      spellCheck={false}
      disabled={value.disabled}
      value={draft ?? (value.varies ? varies : value.text)}
      onChange={(event) => set(event.target.value)}
      onBlur={() => {
        const text = typed.current
        set(null)
        // Retyped as shown too: a box may show what its prompt refuses (a
        // scale under 0.00005 reads 0), refused then in its words.
        if (text !== null && text.trim() !== "")
          engine.editContextualTab({ field, text })
      }}
      onKeyDown={(event) => {
        // An IME's Enter confirms a conversion, its Escape drops it.
        if (isImeKey(event)) return
        if (event.key === "Enter" || event.key === "Escape") {
          event.preventDefault()
          if (event.key === "Escape") set(null)
          event.currentTarget.blur()
          engine.focusSurface()
        }
      }}
      className={cn(
        "h-5.5 rounded-sm border border-input bg-background px-1 text-ui outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:text-faint-foreground",
        className
      )}
    />
  )
}

/** Array Creation's Type: each kind's 32 px glyph, its tool's. */
const TYPE_GLYPHS = {
  arrayRectangular: "array",
  arrayPolar: "arraypolar",
  arrayPath: "arraypath",
} as const

/**
 * Array Creation's Type: the kind's 32 px glyph over its name, a label that
 * runs nothing (the BAML's `DataTemplate`, an image and a text box).
 */
function ArrayType({
  type,
  ctx,
}: {
  type: keyof typeof TYPE_GLYPHS
  ctx: Context
}) {
  return (
    <div
      className={cn(
        "flex h-18 min-w-9.5 flex-col items-center px-0.5 pt-0.75",
        WHOLE_EVEN
      )}
    >
      <LargeGlyph action={TYPE_GLYPHS[type]} />
      <span className="mt-0.5">{ctx.text(type)}</span>
    </div>
  )
}

/** A contextual tab's toggle's item: its text, glyph and tooltip. */
const TOGGLE_ITEMS: Readonly<
  Record<Exclude<ContextualToggleId, "fillPath">, ItemId & TipKey>
> = {
  associative: "arrayAssociative",
  rotateItems: "arrayRotateItems",
  direction: "arrayDirection",
  alignItems: "arrayAlignItems",
}

/** A contextual tab's large toggle, lit while on (`contextual.toggles`). */
function ContextualToggle({
  toggle,
  ctx,
}: {
  toggle: Exclude<ContextualToggleId, "fillPath">
  ctx: Context
}) {
  const item = TOGGLE_ITEMS[toggle]
  return (
    <LargeButton
      icon={LARGE_BUTTON_ICONS[item]}
      text={ctx.text(item)}
      tip={item}
      ctx={ctx}
      pressed={ctx.state.ribbon.contextual?.toggles[toggle] === true}
      onClick={() => ctx.act(() => ctx.engine.editContextualTab({ toggle }))}
    />
  )
}

const PATH_METHODS = [
  ["divide", "arrayDivide"],
  ["measure", "arrayMeasure"],
] as const

/**
 * ARRAYPATH's Method (AcPathArrayMethodSplitDropDown): large, the method in
 * force's glyph over `Method`, one target listing Divide and Measure, a row
 * of 38 each; a pick is Method's answer. Its tooltip is the method's.
 */
function PathMethod({ ctx }: { ctx: Context }) {
  const portal = usePortalContainer()
  const method = ctx.state.ribbon.contextual?.method ?? "measure"
  const current =
    PATH_METHODS.find(([each]) => each === method) ?? PATH_METHODS[1]
  return (
    <Menu.Root>
      <Tip tip={current[1]} title={ctx.text(current[1])} ctx={ctx}>
        <div className="flex shrink-0">
          <Menu.Trigger
            className={cn(
              BUTTON,
              "h-18 min-w-9.5 flex-col justify-start px-0.5 pt-0.75",
              WHOLE_EVEN
            )}
          >
            <LargeGlyph action={current[1]} />
            <span className="mt-0.5 flex items-center gap-0.5">
              {ctx.text("arrayMethod")}
              <ChevronDown aria-hidden className="size-2.5" />
            </span>
          </Menu.Trigger>
        </div>
      </Tip>
      <Menu.Portal container={portal}>
        <Menu.Positioner
          side="bottom"
          align="start"
          sideOffset={1}
          className="z-50"
        >
          <Menu.Popup className={cn(POPUP, "p-0.5")} finalFocus={ctx.toDrawing}>
            {PATH_METHODS.map(([each, item]) => (
              <Menu.Item
                key={each}
                data-current={each === method ? "" : undefined}
                className={LIST_ROW}
                onClick={() => ctx.engine.editContextualTab({ method: each })}
              >
                <span className="flex size-8 shrink-0 items-center justify-center">
                  <LargeGlyph action={item} />
                </span>
                {ctx.text(item)}
              </Menu.Item>
            ))}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}

/**
 * A toggle with no macro (acad.cuix's `Ac…ToggleButton`), lit while what it
 * shows is: UCS Icon (`_ucsicon _off` / `_on`) and View Cube
 * (NAVVCUBEDISPLAY), both the engine's buttons; the palettes', which open
 * and close each its own with no echo, as the desktop's do
 * (research/ui/2026-11-24/block4); Command Line, Ctrl+9's window.
 */
function ToggleButton({ toggle, ctx }: { toggle: RibbonToggle; ctx: Context }) {
  const { engine, state } = ctx
  const shows = (id: PaletteId) => paletteShows(state, id)
  const [on, run]: [boolean, () => void] = (() => {
    switch (toggle) {
      case "ucsIcon":
        return [state.ucsIconOn, () => engine.runRibbonButton("ucsIcon")]
      case "viewCube":
        return [
          state.viewCube.visible,
          () => engine.runRibbonButton("viewCube"),
        ]
      case "propertiesPalette":
        return [shows("properties"), () => engine.togglePalette("properties")]
      case "blocksPalette":
        return [shows("blocks"), () => engine.togglePalette("blocks")]
      case "layerProperties":
        return [shows("layers"), () => engine.togglePalette("layers")]
      case "commandLine":
        return [state.commandLine.visible, () => engine.toggleCommandLine()]
    }
  })()
  const text = ctx.text(toggle)
  if (toggle === "commandLine" || toggle === "layerProperties") {
    return (
      <SmallButton
        icon={BUTTON_ICONS[toggle] ?? toolIcon(toggle)}
        label={text}
        tip={toggle}
        ctx={ctx}
        pressed={on}
        onClick={() => ctx.act(run)}
      />
    )
  }
  return (
    <LargeButton
      icon={LARGE_BUTTON_ICONS[toggle]}
      text={text}
      tip={toggle}
      ctx={ctx}
      pressed={on}
      onClick={() => ctx.act(run)}
    />
  )
}

/** A tool's button at its size: large, small with its text, or its icon alone. */
function ToolButton({
  size,
  action,
  text,
  tip,
  ctx,
  onClick,
}: {
  size: ControlSize
  action: string
  text: string
  tip: TipKey | ItemId
  ctx: Context
  onClick: () => void
}) {
  if (size === "large") {
    return (
      <LargeButton
        icon={largeIcon(action)}
        mirrored={MIRRORED.has(action)}
        text={text}
        tip={tip}
        ctx={ctx}
        onClick={onClick}
      />
    )
  }
  return (
    <SmallButton
      icon={smallIcon(action)}
      mirrored={MIRRORED.has(action)}
      label={text}
      withText={size === "small"}
      tip={tip}
      ctx={ctx}
      onClick={onClick}
    />
  )
}

/** An action's 16 px icon: the member a split button shows. */
function ToolIcon({ id }: { id: string }): ReactElement {
  return createElement(smallIcon(id), {
    "aria-hidden": true,
    className: cn("size-4", mirror(id)),
  })
}

/**
 * A large button's text: on one line, or two parted at the space nearest its
 * middle, as AutoCAD writes Layer Properties and Match Properties; where its
 * text carries acad.CUIX's own break (`Close&#xD;Hatch Creation`), there.
 */
function largeLines(text: string, oneLine = false): string[] {
  if (oneLine) return [text]
  if (text.includes("\n")) return text.split("\n", 2)
  const spaces = [...text.matchAll(/ /g)].map((match) => match.index)
  if (spaces.length === 0) return [text]
  const middle = text.length / 2
  const at = spaces.reduce((best, i) =>
    Math.abs(i - middle) < Math.abs(best - middle) ? i : best
  )
  return [text.slice(0, at), text.slice(at + 1)]
}

/**
 * The tooltip AutoCAD shows a control (`RibbonTip`), titled `title` where its
 * words name none: a button's text, a split button's member shown.
 */
function Tip({
  tip,
  title,
  ctx,
  children,
}: {
  /** An item with no tooltip of its own (a list's row) shows none. */
  tip: TipKey | ItemId
  title: string
  ctx: Context
  children: ReactElement
}) {
  if (!isTip(tip)) return children
  return (
    <RibbonTip
      tip={tip}
      title={title}
      engine={ctx.engine}
      lang={ctx.state.commandLine.lang}
    >
      {children}
    </RibbonTip>
  )
}

/** A large button: 72 high, its 32 px icon over its text. */
function LargeButton({
  icon: Icon,
  mirrored = false,
  text,
  tip,
  ctx,
  pressed,
  oneLine = false,
  onClick,
}: {
  icon: LargeIcon | undefined
  /** A glyph of direction in time, mirrored right to left. */
  mirrored?: boolean
  text: string
  tip: TipKey | ItemId
  ctx: Context
  pressed?: boolean
  /** Its text on one line, where acad.CUIX's has no break (`Pick Points`). */
  oneLine?: boolean
  onClick: () => void
}) {
  return (
    <Tip tip={tip} title={text.replace("\n", " ")} ctx={ctx}>
      <button
        type="button"
        aria-pressed={pressed}
        className={cn(
          BUTTON,
          "h-18 min-w-9.5 flex-col justify-start px-0.5 pt-0.75",
          WHOLE_EVEN,
          pressed && LIT
        )}
        onClick={onClick}
      >
        {Icon && <Icon className={mirrored ? "rtl:-scale-x-100" : undefined} />}
        <span className="mt-0.5 flex flex-col items-center">
          {largeLines(text, oneLine).map((line, i) => (
            <span key={i}>{line}</span>
          ))}
        </span>
      </button>
    </Tip>
  )
}

/** A small button, 22 high: its 16 px icon in a box of 24, and its text. */
function SmallButton({
  icon: Icon,
  mirrored = false,
  label,
  withText = false,
  tip,
  ctx,
  pressed,
  onClick,
}: {
  icon: LucideIcon
  /** A glyph of direction in time, mirrored right to left. */
  mirrored?: boolean
  label: string
  withText?: boolean
  tip: TipKey | ItemId
  ctx: Context
  /** A toggle's state: lit while on. */
  pressed?: boolean
  onClick: () => void
}) {
  return (
    <Tip tip={tip} title={label} ctx={ctx}>
      <button
        type="button"
        aria-label={withText ? undefined : label}
        aria-pressed={pressed}
        className={cn(
          BUTTON,
          "h-5.5",
          withText ? cn("pe-1.5", WHOLE) : "w-6",
          pressed && LIT
        )}
        onClick={onClick}
      >
        <span className="flex w-5.5 justify-center">
          <Icon
            aria-hidden
            className={cn("size-4", mirrored && "rtl:-scale-x-100")}
          />
        </span>
        {withText && label}
      </button>
    </Tip>
  )
}

/**
 * A split button and its list (§2.3): `follow` and `followStaticText` show
 * the member used last and run it, `noFollow` always runs its first, and
 * `dropDownFollow` only opens its list. The member is the engine's, for the
 * session, whichever tab or state the ribbon is in.
 */
function SplitButton({
  control,
  ctx,
}: {
  control: Extract<RibbonControl, { kind: "split" }>
  ctx: Context
}) {
  const { engine, state } = ctx
  const t = useEditorText("Ribbon.splits")
  const members = control.members.filter(
    (m): m is ItemId | null => m === null || hasAction(actionOf(m), ctx)
  )
  const tools = members.filter((m): m is ItemId => m !== null)
  const follows = control.behaviour !== "noFollow"
  const remembered = state.ribbon.members[control.id]
  const shown =
    follows && tools.includes(remembered as ItemId)
      ? (remembered as ItemId)
      : tools[0]
  const text = control.text ? t(control.text) : ctx.text(shown)
  const run = (id: ItemId) =>
    ctx.act(() => {
      if (follows) engine.setRibbonMember(control.id, id)
      runAction(engine, actionOf(id))
    })

  const list = (
    <MemberList
      members={members}
      shown={shown}
      large={control.size === "large"}
      ctx={ctx}
      onPick={run}
    />
  )

  if (control.behaviour === "dropDownFollow") {
    // One target: the shown member's icon and the arrow, 35 × 22, or with
    // its text between them (3D Tools' Fillet Edge, `SmallWithText`).
    const withText = control.size === "small"
    return (
      <Menu.Root>
        <Tip tip={shown} title={ctx.text(shown)} ctx={ctx}>
          <div className="flex shrink-0">
            <Menu.Trigger
              aria-label={withText ? undefined : text}
              className={cn(
                BUTTON,
                "h-5.5",
                withText ? cn("pe-1", WHOLE) : "w-8.75"
              )}
            >
              <span className="flex w-5.5 justify-center">
                <ToolIcon id={actionOf(shown)} />
              </span>
              {withText && <span className="pe-1">{ctx.text(shown)}</span>}
              <ChevronDown aria-hidden className="size-2.5" />
            </Menu.Trigger>
          </div>
        </Tip>
        {list}
      </Menu.Root>
    )
  }

  if (control.size === "large") {
    const lines = largeLines(text)
    // Two targets (§2.3): the icon, 38 high, runs; the text and its arrow,
    // 35, open the list. They share a pixel (`-mt-px`), as 38 and 35 do in
    // AutoCAD's 72: one under the other the button ends a pixel below its
    // neighbours.
    return (
      <Menu.Root>
        <Tip tip={shown} title={ctx.text(shown)} ctx={ctx}>
          <div className={cn("group flex h-18 shrink-0 flex-col", WHOLE_EVEN)}>
            <button
              type="button"
              aria-label={text}
              className={cn(
                BUTTON,
                "h-9.5 items-start justify-center rounded-b-none pt-0.75 group-hover:border-border"
              )}
              onClick={() => run(shown)}
            >
              <LargeGlyph action={actionOf(shown)} />
            </button>
            <Menu.Trigger
              aria-label={text}
              className={cn(
                BUTTON,
                "-mt-px h-8.75 flex-col justify-start rounded-t-none px-2.5 group-hover:border-border"
              )}
            >
              {lines.map((line, i) => (
                <span key={i} className="flex items-center gap-0.5">
                  {line}
                  {lines.length > 1 && i === lines.length - 1 && (
                    <ChevronDown aria-hidden className="size-2.5" />
                  )}
                </span>
              ))}
              {lines.length === 1 && (
                <ChevronDown aria-hidden className="size-2.5" />
              )}
            </Menu.Trigger>
          </div>
        </Tip>
        {list}
      </Menu.Root>
    )
  }

  const withText = control.size === "small"
  return (
    <Menu.Root>
      <Tip tip={shown} title={ctx.text(shown)} ctx={ctx}>
        <div className="group flex h-5.5 shrink-0">
          <button
            type="button"
            aria-label={withText ? undefined : text}
            className={cn(
              BUTTON,
              "h-5.5 rounded-e-none group-hover:border-border",
              withText ? cn("pe-1.5", WHOLE) : "w-6"
            )}
            onClick={() => run(shown)}
          >
            <span className="flex w-5.5 justify-center">
              <ToolIcon id={actionOf(shown)} />
            </span>
            {withText && text}
          </button>
          <Menu.Trigger
            aria-label={text}
            className={cn(
              BUTTON,
              "h-5.5 w-3.25 justify-start rounded-s-none group-hover:border-border"
            )}
          >
            {/* From the start of the 11 inside the border: centred, the 10 px
          arrow would land on half a pixel. */}
            <ChevronDown aria-hidden className="size-2.5" />
          </Menu.Trigger>
        </div>
      </Tip>
      {list}
    </Menu.Root>
  )
}

/**
 * A drop-down's list, under its button and aligned with its start: each
 * member a row of 38, its 32 px icon and its name, groups parted by a line,
 * the member shown marked (§2.3, a small split's list as a large one's:
 * desktop autocad-mouse/rect-list.png).
 */
function MemberList({
  members,
  shown,
  large,
  ctx,
  onPick,
}: {
  members: readonly (ItemId | null)[]
  shown: ItemId
  large: boolean
  ctx: Context
  onPick: (id: ItemId) => void
}) {
  const portal = usePortalContainer()
  return (
    <Menu.Portal container={portal}>
      <Menu.Positioner
        side="bottom"
        align="start"
        sideOffset={large ? 0 : 1}
        className="z-50"
      >
        <Menu.Popup className={cn(POPUP, "p-0.5")} finalFocus={ctx.toDrawing}>
          {members.map((member, i) => {
            if (member === null) {
              return (
                <Menu.Separator
                  key={i}
                  className="-mx-0.5 my-0.5 h-px bg-border"
                />
              )
            }
            return (
              <Menu.Item
                key={member}
                data-current={member === shown ? "" : undefined}
                className={LIST_ROW}
                onClick={() => onPick(member)}
              >
                <span className="flex size-8 shrink-0 items-center justify-center">
                  <LargeGlyph action={actionOf(member)} />
                </span>
                {ctx.text(member)}
              </Menu.Item>
            )
          })}
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  )
}

/**
 * Layer Properties: the Layer Properties Manager's toggle, lit while it is
 * open, as AutoCAD's (AcLayerCommandToggleButton).
 */
function LayerPropertiesButton({ ctx }: { ctx: Context }) {
  const { engine, state } = ctx
  const open = paletteShows(state, "layers")
  return (
    <LargeButton
      icon={LayerPropertiesLarge}
      text={ctx.text("layerProperties")}
      tip="layerProperties"
      ctx={ctx}
      pressed={open}
      onClick={() => ctx.act(() => engine.togglePalette("layers"))}
    />
  )
}

/**
 * The Layers panel's combo, 208 × 22: the selection's layer, or the current
 * one with nothing selected. Choosing moves the selection there, or makes the
 * layer current.
 */
function LayerCombo({ ctx }: { ctx: Context }) {
  const { engine, state } = ctx
  const t = useEditorText("Ribbon")
  const properties = useEditorText("Properties")
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
      <Tip tip="layer" title={t("layer")} ctx={ctx}>
        <div className="flex">
          <SelectTrigger aria-label={t("layer")} className={cn(COMBO, "w-52")}>
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
        </div>
      </Tip>
      <SelectContent
        align="start"
        alignItemWithTrigger={false}
        finalFocus={ctx.toDrawing}
      >
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
 * One of the Properties panel's combos, a 20 px icon and a list of 180: the
 * selection's colour, lineweight or linetype, or with nothing selected the
 * current one new objects take (CECOLOR, CELWEIGHT, CELTYPE).
 */
function PropertyCombo({
  property,
  narrow,
  ctx,
}: {
  property: "color" | "lineweight" | "linetype"
  /** 33 narrower, as AutoCAD's 170 become 137 (desktop, at 1680). */
  narrow: boolean
  ctx: Context
}) {
  const outer = narrow ? "w-42" : "w-50"
  const inner = narrow ? "w-37" : "w-45"
  const { engine, state } = ctx
  const t = useEditorText("Ribbon")
  const selected = state.selectionCount > 0
  const done = () => engine.focusSurface()

  if (property === "color") {
    return (
      <Tip tip="color" title={t("color")} ctx={ctx}>
        <div className="flex">
          <ColorSelect
            below
            ribbon
            value={selected ? state.selectionColor : state.currentColor}
            names={state.names}
            onValueChange={(value) => {
              engine.applyColorControl(value)
              done()
            }}
            ariaLabel={t("color")}
            className={outer}
            triggerClassName={COMBO}
            finalFocus={ctx.toDrawing}
          />
        </div>
      </Tip>
    )
  }
  const Icon = property === "lineweight" ? LineweightIcon : LinetypeIcon
  return (
    <Tip tip={property} title={t(property)} ctx={ctx}>
      <div className={cn("flex items-center", outer)}>
        <span
          aria-hidden
          className="flex w-5 justify-center text-muted-foreground"
        >
          <Icon className="size-4" />
        </span>
        {property === "lineweight" ? (
          <LineweightSelect
            below
            includeByLayer
            value={
              selected ? state.selectionLineweight : state.currentLineweight
            }
            names={state.names}
            onValueChange={(value) => {
              engine.applyLineweightControl(value)
              done()
            }}
            ariaLabel={t("lineweight")}
            className={cn(COMBO, inner)}
            finalFocus={ctx.toDrawing}
          />
        ) : (
          <LinetypeSelect
            below
            includeByLayer
            value={selected ? state.selectionLinetype : state.currentLinetype}
            names={state.names}
            linetypes={state.linetypes}
            onValueChange={(value) => {
              engine.applyLinetypeControl(value)
              done()
            }}
            ariaLabel={t("linetype")}
            className={cn(COMBO, inner)}
            finalFocus={ctx.toDrawing}
          />
        )}
      </div>
    </Tip>
  )
}

/** The Manage entry's value in a style list: no style's id is blank. */
const MANAGE_STYLES = " manage"

/**
 * The Text Style and Dimension Style lists (AcTextStyleCombo,
 * AcDimensionStyleGallery), 200 × 22 at every width the desktop showed
 * (block5): the engine's `textStyleControl` or `dimStyleControl` (the
 * selection's style, or the current one), the drawing's styles, then after a
 * line Manage Text Styles... or Manage Dimension Styles...
 * (AcWindows.resources.dll's BAML). A pick restyles what is selected or sets
 * the current style, as the layer drop-down does (`applyTextStyleControl`).
 * WHY names in rows, where AutoCAD's gallery shows a thumbnail per style
 * (80 × 68 and 120 × 92, GALLERYVIEW 1): no style preview is built here, the
 * dialogs' neither (docs/coverage/dimensions.md, STYLE and DIMSTYLE).
 */
function StyleList({
  style,
  ctx,
}: {
  style: "text" | "dimension"
  ctx: Context
}) {
  const { engine, state } = ctx
  const properties = useEditorText("Properties")
  const text = style === "text"
  const styles = text ? state.textStyles : state.dimStyles
  const value = text ? state.textStyleControl : state.dimStyleControl
  const manage = text ? "manageTextStyles" : "manageDimensionStyles"
  const items: Record<string, string> = {
    ...Object.fromEntries(styles.map((entry) => [entry.id, entry.name])),
    [MANAGE_STYLES]: ctx.text(manage),
  }

  return (
    <Select
      items={items}
      value={value}
      onValueChange={(id) => {
        if (id == null) return
        // Its dialog takes the keys: `toDrawing` leaves them to it.
        if (id === MANAGE_STYLES) {
          engine.runRibbonButton(manage)
          return
        }
        if (text) engine.applyTextStyleControl(id)
        else engine.applyDimStyleControl(id)
        engine.focusSurface()
      }}
    >
      <Tip
        tip={text ? "textStyleList" : "dimensionStyleList"}
        title={ctx.text(text ? "textStyle" : "dimensionStyle")}
        ctx={ctx}
      >
        <div className="flex">
          <SelectTrigger
            aria-label={ctx.text(text ? "textStyle" : "dimensionStyle")}
            className={cn(COMBO, "w-50")}
          >
            <SelectValue placeholder={properties("varies")}>
              {(id: string | null) =>
                id === null ? null : (
                  <span className="truncate">{items[id]}</span>
                )
              }
            </SelectValue>
          </SelectTrigger>
        </div>
      </Tip>
      {/* As wide as its longest row: `Zarządzaj stylami wymiarowania...`
      would be cut at the trigger's 200. */}
      <SelectContent
        align="start"
        alignItemWithTrigger={false}
        finalFocus={ctx.toDrawing}
        className="w-max min-w-(--anchor-width)"
      >
        {styles.map((entry) => (
          <SelectItem key={entry.id} value={entry.id}>
            <span className="truncate">{entry.name}</span>
          </SelectItem>
        ))}
        <SelectSeparator />
        <SelectItem value={MANAGE_STYLES}>{ctx.text(manage)}</SelectItem>
      </SelectContent>
    </Select>
  )
}

/**
 * Insert, the Block panel's gallery (AcInsertGalleryControl): one target that
 * opens the drawing's blocks under it; a block picked starts -INSERT with it,
 * as the Blocks palette's does.
 */
function InsertGallery({ ctx }: { ctx: Context }) {
  const { engine, state } = ctx
  const portal = usePortalContainer()
  const blocks = useEditorText("Blocks")
  const [open, setOpen] = useState(false)
  const Icon = LARGE_TOOL_ICONS.insert
  const text = ctx.text("insert")

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Tip tip="insert" title={text} ctx={ctx}>
        <div className="flex shrink-0">
          <Popover.Trigger
            className={cn(
              BUTTON,
              "h-18 min-w-9.5 flex-col justify-start px-0.5 pt-0.75",
              WHOLE_EVEN
            )}
            // The drawing keeps the keys while the gallery is open, as after a
            // slide-out's title bar.
            onClick={(event) => {
              if (event.detail > 0) engine.focusSurface()
            }}
          >
            {Icon && <Icon />}
            <span className="mt-0.5">{text}</span>
            <ChevronDown aria-hidden className="size-2.5" />
          </Popover.Trigger>
        </div>
      </Tip>
      <Popover.Portal container={portal}>
        <Popover.Positioner side="bottom" align="start" className="z-50">
          {/* No focus taken: the drawing keeps the keys while it is open. */}
          <Popover.Popup
            data-ribbon-list
            initialFocus={false}
            finalFocus={false}
            className={cn(POPUP, "w-60 p-1")}
          >
            {state.blocks.length === 0 ? (
              <p className="px-2 py-4 text-center text-muted-foreground">
                {blocks("empty")}
              </p>
            ) : (
              <div className="grid max-h-80 grid-cols-3 gap-1 overflow-y-auto">
                {state.blocks.map((block) => (
                  <button
                    key={block.id}
                    type="button"
                    title={block.name}
                    className="flex flex-col items-center gap-1 rounded-sm p-1 outline-none hover:bg-accent focus-visible:bg-accent"
                    onClick={() => {
                      setOpen(false)
                      engine.insertBlock(block.id)
                      engine.focusSurface()
                    }}
                  >
                    <BlockThumbnail engine={engine} id={block.id} />
                    <span className="w-full truncate text-center">
                      {block.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}

/** The Attribute Display drop-down's entries, in its list's order, by ATTMODE. */
const ATTRIBUTE_DISPLAYS = [
  ["normal", "attModeNormal"],
  ["on", "attModeOn"],
  ["off", "attModeOff"],
] as const

/**
 * Attribute Display (AcATTMODEDataBoundDropDown), in Home's Block slide-out
 * by its icon and in Insert's Block with its text: one target showing the
 * entry ATTMODE holds, its list a row of 38 per entry; a pick sets ATTMODE
 * (research/ui/2026-11-24/block4, 165 × 22 with its text).
 */
function AttributeDisplay({ size, ctx }: { size: ControlSize; ctx: Context }) {
  const { engine, state } = ctx
  const portal = usePortalContainer()
  const current =
    ATTRIBUTE_DISPLAYS.find(([mode]) => mode === state.attributeDisplay) ??
    ATTRIBUTE_DISPLAYS[0]
  const withText = size === "small"
  const text = ctx.text(current[1])
  return (
    <Menu.Root>
      <Tip tip={current[1]} title={text} ctx={ctx}>
        <div className="flex shrink-0">
          <Menu.Trigger
            aria-label={withText ? undefined : text}
            className={cn(
              BUTTON,
              "h-5.5",
              withText ? cn("pe-1", WHOLE) : "w-8.75"
            )}
          >
            <span className="flex w-5.5 justify-center">
              <ToolIcon id={current[1]} />
            </span>
            {withText && <span className="pe-1">{text}</span>}
            <ChevronDown aria-hidden className="size-2.5" />
          </Menu.Trigger>
        </div>
      </Tip>
      <Menu.Portal container={portal}>
        <Menu.Positioner
          side="bottom"
          align="start"
          sideOffset={1}
          className="z-50"
        >
          <Menu.Popup className={cn(POPUP, "p-0.5")} finalFocus={ctx.toDrawing}>
            {ATTRIBUTE_DISPLAYS.map(([mode, item]) => {
              return (
                <Menu.Item
                  key={mode}
                  data-current={mode === current[0] ? "" : undefined}
                  className={LIST_ROW}
                  onClick={() => engine.setAttributeDisplay(mode)}
                >
                  <span className="flex size-8 shrink-0 items-center justify-center">
                    <LargeGlyph action={item} />
                  </span>
                  {ctx.text(item)}
                </Menu.Item>
              )
            })}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}

/** The visual styles built, in the gallery's order (VSCURRENT's). */
const VISUAL_STYLES = [
  ["2dWireframe", "vs2dWireframe"],
  ["hidden", "vsHidden"],
  ["conceptual", "vsConceptual"],
] as const

/**
 * The Visual Styles gallery (AcVisualStyleGalleryControl): a combo of 200 ×
 * 22 showing the view's style, its gallery four cells of 82 × 70 across on an
 * 84 pitch, each a picture over the style's name (research/ui/2026-11-24/
 * block4). Only the styles VSCURRENT has are offered; a pick sets it with no
 * echo. Save as a New Visual Style and the Visual Styles Manager are not
 * built.
 */
function VisualStyles({ ctx }: { ctx: Context }) {
  const { engine, state } = ctx
  const t = useEditorText("Ribbon")
  const portal = usePortalContainer()
  const [open, setOpen] = useState(false)
  const current =
    VISUAL_STYLES.find(([style]) => style === state.visualStyle) ??
    VISUAL_STYLES[0]

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Tip tip="visualStyleList" title={t("panels.visualStyles")} ctx={ctx}>
        <div className="flex">
          <Popover.Trigger
            aria-label={`${t("panels.visualStyles")}: ${state.names.visualStyles[current[0]]}`}
            className={cn(
              COMBO,
              "flex w-50 items-center gap-1 rounded-sm border ps-0.75 pe-1 outline-none hover:bg-muted focus-visible:border-ring aria-expanded:bg-muted"
            )}
            onClick={(event) => {
              if (event.detail > 0) engine.focusSurface()
            }}
          >
            <ToolIcon id={current[1]} />
            <span className="min-w-0 flex-1 truncate text-start">
              {state.names.visualStyles[current[0]]}
            </span>
            <ChevronDown
              aria-hidden
              className="size-2.5 text-muted-foreground"
            />
          </Popover.Trigger>
        </div>
      </Tip>
      <Popover.Portal container={portal}>
        <Popover.Positioner side="bottom" align="start" className="z-50">
          {/* No focus taken or given back: the drawing keeps the keys, as
          after Insert's gallery. */}
          <Popover.Popup
            data-ribbon-list
            initialFocus={false}
            finalFocus={false}
            className={cn(POPUP, "p-px")}
          >
            <div className="grid w-83.5 grid-cols-4 gap-0.5">
              {VISUAL_STYLES.map(([style, icon]) => {
                return (
                  <button
                    key={style}
                    type="button"
                    aria-pressed={style === current[0]}
                    className="flex h-17.5 min-w-0 flex-col items-center rounded-sm outline-none hover:bg-accent focus-visible:bg-accent aria-pressed:bg-active/15"
                    onClick={() => {
                      setOpen(false)
                      engine.setVisualStyle(style)
                      engine.focusSurface()
                    }}
                  >
                    <span className="flex size-12 shrink-0 items-center justify-center">
                      <LargeGlyph action={icon} />
                    </span>
                    <span className="w-full truncate text-center">
                      {state.names.visualStyles[style]}
                    </span>
                  </button>
                )
              })}
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}

/** The patterns built, in acadiso.pat's order: the gallery's (hatch/d01-2). */
const PATTERNS: readonly string[] = HATCH_PATTERNS.map((pattern) => pattern.id)
/** The cells the panel shows in a row, and the open gallery's (d01-2). */
const ACROSS = 4
const ACROSS_OPEN = 6

/**
 * Hatch Creation's Pattern gallery (AcHatchPatternGallery): a row of cells,
 * 74 × 70, each the pattern's swatch over its name, the current one marked,
 * then a column of 14 with the rows' up and down and the arrow that opens
 * every pattern under it (desktop hatch/d01-2). A pick is HPNAME, as
 * Properties' answer. WHY the up and down are out of the keys' way: the
 * arrow's list holds every pattern, reached by the keyboard.
 */
function HatchPatterns({ ctx }: { ctx: Context }) {
  const t = useEditorText("Ribbon")
  const current = ctx.state.ribbon.contextual?.pattern ?? null
  return (
    <Gallery
      items={PATTERNS}
      current={current}
      across={ACROSS}
      acrossOpen={ACROSS_OPEN}
      label={t("panels.hatchPattern")}
      engine={ctx.engine}
      cell={(pattern, onPick) => (
        <PatternCell
          key={pattern}
          pattern={pattern}
          current={pattern === current}
          ctx={ctx}
          onPick={onPick}
        />
      )}
      onPick={(pattern) =>
        ctx.act(() => ctx.engine.editContextualTab({ pattern }))
      }
    />
  )
}

/**
 * A ribbon gallery in window mode: a row of cells, the current one's row
 * scrolled to, then a column of 14 with the rows' up and down and the arrow
 * that opens every cell under it. WHY the up and down are out of the keys'
 * way: the arrow's list holds every cell, reached by the keyboard.
 */
function Gallery<T extends string>({
  items,
  current,
  across,
  acrossOpen,
  label,
  engine,
  rowClassName,
  cell,
  onPick,
}: {
  items: readonly T[]
  current: T | null
  across: number
  acrossOpen: number
  label: string
  engine: CadEngine
  /** The row's width, where fewer cells than `across` would shrink it. */
  rowClassName?: string
  cell: (item: T, onPick: () => void) => ReactElement
  onPick: (item: T) => void
}) {
  const portal = usePortalContainer()
  const [open, setOpen] = useState(false)
  // The row scrolled to; null, the current item's.
  const [row, setRow] = useState<number | null>(null)
  const rows = Math.ceil(items.length / across)
  const at = current === null ? 0 : Math.max(0, items.indexOf(current))
  const shown = row ?? Math.floor(at / across)
  const scroll =
    "flex flex-1 items-center justify-center rounded-sm text-muted-foreground outline-none hover:bg-muted disabled:text-faint-foreground"
  return (
    <div className="mt-px flex h-18 rounded-sm border border-input">
      <div className={cn("flex", rowClassName)}>
        {items
          .slice(shown * across, (shown + 1) * across)
          .map((item) => cell(item, () => onPick(item)))}
      </div>
      <div className="flex w-3.5 flex-col border-s border-input">
        <button
          type="button"
          tabIndex={-1}
          aria-hidden
          disabled={shown === 0}
          className={scroll}
          onClick={() => {
            setRow(shown - 1)
            engine.focusSurface()
          }}
        >
          <ChevronUp className="size-2.5" />
        </button>
        <button
          type="button"
          tabIndex={-1}
          aria-hidden
          disabled={shown >= rows - 1}
          className={scroll}
          onClick={() => {
            setRow(shown + 1)
            engine.focusSurface()
          }}
        >
          <ChevronDown className="size-2.5" />
        </button>
        <Popover.Root open={open} onOpenChange={setOpen}>
          <Popover.Trigger
            aria-label={label}
            className={cn(scroll, "flex-none basis-4.5 aria-expanded:bg-muted")}
            onClick={(event) => {
              if (event.detail > 0) engine.focusSurface()
            }}
          >
            <ChevronsDown aria-hidden className="size-2.5" />
          </Popover.Trigger>
          <Popover.Portal container={portal}>
            <Popover.Positioner side="bottom" align="end" className="z-50">
              {/* No focus taken or given back: the drawing keeps the keys,
              as after the Visual Styles gallery. */}
              <Popover.Popup
                data-ribbon-list
                initialFocus={false}
                finalFocus={false}
                className={cn(POPUP, "p-px")}
              >
                <div
                  className="grid gap-0.5"
                  style={{
                    gridTemplateColumns: `repeat(${acrossOpen}, auto)`,
                  }}
                >
                  {items.map((item) =>
                    cell(item, () => {
                      setOpen(false)
                      setRow(null)
                      onPick(item)
                    })
                  )}
                </div>
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        </Popover.Root>
      </div>
    </div>
  )
}

/** A gallery cell: the pattern's 32 px swatch over its name, 74 × 70. */
function PatternCell({
  pattern,
  current,
  ctx,
  onPick,
}: {
  pattern: string
  current: boolean
  ctx: Context
  onPick: () => void
}) {
  // A cell's tooltip is its pattern's name alone, a plain label, not the
  // ribbon's four parts (desktop 2026-11-26, hatch-gal-tip: `ANGLE`), taking
  // no pointer: in the open list it lies over the next row's cells.
  return (
    <Tooltip disableHoverablePopup>
      <TooltipTrigger
        render={
          <button
            type="button"
            aria-pressed={current}
            className="flex h-17.5 w-18.5 shrink-0 flex-col items-center justify-center gap-1 rounded-sm outline-none hover:bg-accent focus-visible:bg-accent aria-pressed:bg-active/15"
            onClick={onPick}
          />
        }
      >
        <PatternSwatch engine={ctx.engine} pattern={pattern} />
        {/* A pattern's name is drawing data, the same in every language. */}
        <span dir="ltr" className="w-full truncate px-0.5 text-center">
          {pattern}
        </span>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={2}>
        <span dir="ltr">{pattern}</span>
      </TooltipContent>
    </Tooltip>
  )
}

/** A pattern's swatch, the engine's scene (`buildHatchSwatch`) painted, 32 px. */
function PatternSwatch({
  engine,
  pattern,
}: {
  engine: CadEngine
  pattern: string
}) {
  const ref = useRef<HTMLCanvasElement | null>(null)
  useEffect(() => {
    const canvas = ref.current
    const context = canvas?.getContext("2d")
    if (!canvas || !context) return
    const scene = engine.buildHatchSwatch(pattern, SWATCH_PX)
    if (!scene) return
    const dpr = window.devicePixelRatio || 1
    canvas.width = SWATCH_PX * dpr
    canvas.height = SWATCH_PX * dpr
    new CanvasScenePresenter().draw(context, scene, dpr)
  }, [engine, pattern])
  return (
    <canvas
      ref={ref}
      aria-hidden
      style={{ width: SWATCH_PX, height: SWATCH_PX }}
      className="shrink-0"
    />
  )
}

const SWATCH_PX = 32

/**
 * A style cell's sample: AutoCAD's, the same in every language, so no word
 * of a catalog (desktop, 2026-11-26, mtext-tab-crop).
 */
const STYLE_SAMPLE = "AaBb12"
/** Text Editor's gallery: two cells a row, as the open list (desktop, 2026-11-26). */
const STYLES_ACROSS = 2

/**
 * Text Editor's gallery of text styles (AcIPEFontStyleGallery, 184 × 74):
 * every style of the drawing, by name, two cells of 82 × 70 a row, the
 * edited text's marked and its row scrolled to (desktop, 2026-11-26,
 * mtext-tab-tree). A pick is the text's style, asked about first while the
 * editor holds text (`state.textStyleChangeDialog`).
 */
function TextStyles({ ctx }: { ctx: Context }) {
  const t = useEditorText("Ribbon")
  const styles = [...ctx.state.textStyles].sort((a, b) =>
    a.name.localeCompare(b.name, "en", { sensitivity: "base" })
  )
  const ids = styles.map((style) => style.id)
  const names = new Map(styles.map((style) => [style.id, style.name]))
  const current = ctx.state.ribbon.contextual?.textStyle ?? null
  return (
    <Gallery
      items={ids}
      current={current}
      across={STYLES_ACROSS}
      acrossOpen={STYLES_ACROSS}
      label={t("fields.textStyle")}
      engine={ctx.engine}
      // Two cells of 82 even with one style: AutoCAD's gallery is 184 wide.
      rowClassName="w-41"
      cell={(id, onPick) => (
        <TextStyleCell
          key={id}
          name={names.get(id) ?? id}
          current={id === current}
          onPick={onPick}
        />
      )}
      onPick={(textStyle) =>
        ctx.act(() => ctx.engine.editContextualTab({ textStyle }))
      }
    />
  )
}

/**
 * A style's cell, 82 × 70: its sample over its name. WHY one sample for
 * every style: a style here names no font, all text is drawn in one.
 */
function TextStyleCell({
  name,
  current,
  onPick,
}: {
  name: string
  current: boolean
  onPick: () => void
}) {
  // Its tooltip is the style's name alone, as a pattern cell's (desktop,
  // 2026-11-26: `S5`).
  return (
    <Tooltip disableHoverablePopup>
      <TooltipTrigger
        render={
          <button
            type="button"
            aria-pressed={current}
            className="flex h-17.5 w-20.5 shrink-0 flex-col items-center justify-center gap-1 rounded-sm px-0.5 outline-none hover:bg-accent focus-visible:bg-accent aria-pressed:bg-active/15"
            onClick={onPick}
          />
        }
      >
        {/* A sample, not words: the same in every language, as AutoCAD's. */}
        <span
          aria-hidden
          dir="ltr"
          className="flex h-9.5 w-full items-center justify-center overflow-hidden rounded-xs bg-white text-black"
        >
          {STYLE_SAMPLE}
        </span>
        {/* A style's name is drawing data, the same in every language. */}
        <span dir="ltr" className="w-full truncate text-center">
          {name}
        </span>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={2}>
        <span dir="ltr">{name}</span>
      </TooltipContent>
    </Tooltip>
  )
}

/**
 * Text Editor's height (AcIPEFontSizeCombo, 100 × 22) in Style's second row
 * (WHY its first is empty: Annotative is not built): the edited text's
 * height, typed as a field's value, its list the one height it shows
 * (desktop, 2026-11-26). A value refused, 0 or below, is put back.
 */
function TextHeight({ ctx }: { ctx: Context }) {
  const t = useEditorText("Ribbon")
  const portal = usePortalContainer()
  const value = ctx.state.ribbon.contextual?.fields.textHeight
  if (!value) return null
  const label = t("fields.textHeight")
  return (
    <Tip tip="textHeight" title={label} ctx={ctx}>
      <div className="mt-6 flex h-5.5 w-25">
        <FieldBox
          field="textHeight"
          label={label}
          className="min-w-0 flex-1 rounded-e-none"
          ctx={ctx}
        />
        <Menu.Root>
          <Menu.Trigger
            aria-label={label}
            className="flex w-4 items-center justify-center rounded-e-sm border border-s-0 border-input bg-background text-muted-foreground outline-none hover:bg-muted aria-expanded:bg-muted"
          >
            <ChevronDown aria-hidden className="size-2.5" />
          </Menu.Trigger>
          <Menu.Portal container={portal}>
            <Menu.Positioner
              side="bottom"
              align="end"
              sideOffset={1}
              className="z-50"
            >
              <Menu.Popup
                className={cn(POPUP, "w-25 p-0.5")}
                finalFocus={ctx.toDrawing}
              >
                <Menu.Item
                  className="flex h-5 cursor-default items-center rounded-sm px-1 outline-hidden data-highlighted:bg-accent"
                  onClick={() =>
                    ctx.engine.editContextualTab({
                      field: "textHeight",
                      text: value.text,
                    })
                  }
                >
                  <span dir="ltr">{value.text}</span>
                </Menu.Item>
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.Root>
      </div>
    </Tip>
  )
}

type Attachment = NonNullable<ContextualTab["attachment"]>

/** Justification's rows, acmtedRes 1024 to 1032's order on the menu. */
const ATTACHMENTS: readonly Attachment[] = [
  "tl",
  "tc",
  "tr",
  "ml",
  "mc",
  "mr",
  "bl",
  "bc",
  "br",
]

/**
 * Text Editor's Justification (AcIPEJustificationMenu, 81 × 72): large, its
 * glyph over `Justification` and an arrow; its list the nine attachments,
 * rows of 24 with each one's letters after it and a check at the edited
 * text's (desktop, 2026-11-26, mtext-just-menu). A pick writes no line.
 * Its tooltip its name alone (desktop 2026-11-27, tip-just).
 */
function TextJustification({ ctx }: { ctx: Context }) {
  const t = useEditorText("Ribbon")
  const portal = usePortalContainer()
  const current = ctx.state.ribbon.contextual?.attachment ?? null
  return (
    <Menu.Root>
      <Tip
        tip="textJustification"
        title={ctx.text("textJustification")}
        ctx={ctx}
      >
        <div className="flex shrink-0">
          <Menu.Trigger
            className={cn(
              BUTTON,
              "h-18 min-w-9.5 flex-col justify-start px-0.5 pt-0.75",
              WHOLE_EVEN
            )}
          >
            <LargeGlyph action="textJustification" />
            <span className="mt-0.5">{ctx.text("textJustification")}</span>
            <ChevronDown aria-hidden className="size-2.5" />
          </Menu.Trigger>
        </div>
      </Tip>
      <Menu.Portal container={portal}>
        <Menu.Positioner
          side="bottom"
          align="start"
          sideOffset={1}
          className="z-50"
        >
          <Menu.Popup className={cn(POPUP, "p-0.5")} finalFocus={ctx.toDrawing}>
            {ATTACHMENTS.map((attachment) => {
              const [name, letters] = t(`justifications.${attachment}`).split(
                "\t"
              )
              return (
                <Menu.Item
                  key={attachment}
                  className="flex h-6 cursor-default items-center gap-1.5 rounded-sm ps-1 pe-3 outline-hidden select-none data-highlighted:bg-accent"
                  onClick={() => ctx.engine.editContextualTab({ attachment })}
                >
                  <Check
                    aria-hidden
                    className={cn(
                      "size-4 text-primary",
                      attachment !== current && "invisible"
                    )}
                  />
                  <span className="flex-1">{name}</span>
                  <span dir="ltr" className="ps-3">
                    {letters}
                  </span>
                </Menu.Item>
              )
            })}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}

/**
 * Hatch Creation's Properties in AutoCAD's rows (hatch/d01-2): Type in the
 * first sub-panel's first row; after its Spacer, Angle in the third
 * sub-panel's second row and Scale in its third, their first row's
 * Transparency not built.
 */
function HatchProperties({ ctx }: { ctx: Context }) {
  return (
    <div className="mt-px grid grid-cols-[auto_4px_auto] grid-rows-[repeat(3,22px)] gap-y-0.5">
      <div className="col-start-1 row-start-1">
        <HatchType ctx={ctx} />
      </div>
      <div className="col-start-3 row-start-2">
        <HatchAngle ctx={ctx} />
      </div>
      <div className="col-start-3 row-start-3">
        <HatchScale ctx={ctx} />
      </div>
    </div>
  )
}

/**
 * Type (AcHatchTypeCombo): its 16 px glyph and a combo of 178 × 22 listing
 * the types built, Solid and Pattern; a pick is Properties' Solid, or the
 * last pattern back.
 */
function HatchType({ ctx }: { ctx: Context }) {
  const t = useEditorText("Ribbon")
  const pattern = ctx.state.ribbon.contextual?.pattern ?? null
  const items = {
    solid: ctx.text("hatchSolid"),
    pattern: ctx.text("hatchPattern"),
  }
  return (
    <Select
      items={items}
      // None where the hatches' patterns differ (desktop 2026-11-27, he-two).
      value={
        pattern === null ? null : pattern === "SOLID" ? "solid" : "pattern"
      }
      onValueChange={(type) => {
        if (type !== "solid" && type !== "pattern") return
        ctx.engine.editContextualTab({ hatchType: type })
        ctx.engine.focusSurface()
      }}
    >
      <Tip tip="hatchType" title={t("tipTitles.hatchType")} ctx={ctx}>
        <div className="flex items-center">
          <span
            aria-hidden
            className="flex w-5 justify-center text-muted-foreground"
          >
            <Grid3x3 className="size-4" />
          </span>
          <SelectTrigger
            aria-label={t("tipTitles.hatchType")}
            className={cn(COMBO, "w-44.5")}
          >
            <SelectValue>
              {(type: string | null) =>
                type === "solid" || type === "pattern" ? (
                  <span className="truncate">{items[type]}</span>
                ) : null
              }
            </SelectValue>
          </SelectTrigger>
        </div>
      </Tip>
      <SelectContent
        align="start"
        alignItemWithTrigger={false}
        finalFocus={ctx.toDrawing}
      >
        <SelectItem value="solid">{items.solid}</SelectItem>
        <SelectItem value="pattern">{items.pattern}</SelectItem>
      </SelectContent>
    </Select>
  )
}

/**
 * The Angle slider's range, AutoCAD's 0 to 360 in steps of 1 (desktop
 * 2026-11-26, hatch-tab-tree: AcHatchPatternAngleSlider's RangeValue 0..360).
 */
const ANGLE_MAX = 360

/**
 * Angle (AcHatchPatternAngleSlider): a slider of 157 with its name in it and
 * a box of 50 with the value (d01-2). Dragging sets whole degrees from 0 to
 * 360, which HPANG keeps as 0; the box takes what Properties' angle prompt takes. WHY the slider is
 * for the pointer only, out of the keys' way: the box is the same value,
 * typed, and its name.
 */
function HatchAngle({ ctx }: { ctx: Context }) {
  const t = useEditorText("Ribbon")
  const properties = useEditorText("Properties")
  const value = ctx.state.ribbon.contextual?.fields.hatchAngle
  // The degree dragged to: the thumb stays there while the pointer drags it,
  // 360 too, which HPANG keeps as 0 (what AutoCAD's box then reads is
  // **unverified**).
  const [dragged, setDragged] = useState<number | null>(null)
  if (!value) return null
  const degrees = Number(value.text)
  const at = Number.isFinite(degrees) ? Math.min(degrees, ANGLE_MAX) : 0
  const label = t("fields.hatchAngle")
  const slide = (event: ReactPointerEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect()
    const share = Math.min(
      1,
      Math.max(0, (event.clientX - box.left) / box.width)
    )
    const next = Math.round(share * ANGLE_MAX)
    if (next === dragged) return
    setDragged(next)
    ctx.engine.editContextualTab({ field: "hatchAngle", text: String(next) })
  }
  return (
    <Tip tip="hatchAngle" title={label} ctx={ctx}>
      <div className="flex h-5.5 items-center gap-px">
        {/* An island: its value grows rightwards, as the box's figures. */}
        <div
          aria-hidden
          dir="ltr"
          className={cn(
            "relative flex h-5.5 w-39.25 items-center rounded-sm border border-input bg-muted/40 ps-2 select-none",
            value.disabled
              ? "pointer-events-none text-faint-foreground"
              : "cursor-ew-resize"
          )}
          onPointerDown={(event) => {
            if (event.button !== 0) return
            event.currentTarget.setPointerCapture(event.pointerId)
            setDragged(null)
            slide(event)
          }}
          onPointerMove={(event) => {
            if (event.buttons & 1) slide(event)
          }}
          onPointerUp={() => {
            setDragged(null)
            ctx.engine.focusSurface()
          }}
          onPointerCancel={() => {
            setDragged(null)
            ctx.engine.focusSurface()
          }}
        >
          <span
            className="absolute inset-y-0.5 w-0.75 rounded-full bg-muted-foreground"
            style={{
              left: `calc(${(dragged ?? at) / ANGLE_MAX} * (100% - 3px))`,
            }}
          />
          <span className="relative">{label}</span>
        </div>
        <FieldBox
          field="hatchAngle"
          label={label}
          varies={properties("varies")}
          className="w-12.5"
          ctx={ctx}
        />
      </div>
    </Tip>
  )
}

/**
 * Scale (AcHatchScaleSpinner): its 16 px glyph and a box of 177 with the
 * value, which sets the scale as Properties does (`editHatchScale`). Its spin
 * arrows are not drawn (the desktop's up arrow stepped 1 to 1.1).
 */
function HatchScale({ ctx }: { ctx: Context }) {
  const t = useEditorText("Ribbon")
  const label = t("fields.hatchScale")
  return (
    <Tip tip="hatchScale" title={label} ctx={ctx}>
      <div className="flex h-5.5 items-center">
        <span
          aria-hidden
          className="flex w-5 justify-center text-muted-foreground"
        >
          <Scaling className="size-4" />
        </span>
        <FieldBox
          field="hatchScale"
          label={label}
          className="w-44.25"
          ctx={ctx}
        />
      </div>
    </Tip>
  )
}
