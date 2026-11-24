"use client"

import {
  createElement,
  Fragment,
  useRef,
  useState,
  type ReactElement,
} from "react"
import { Menu } from "@base-ui/react/menu"
import { Popover } from "@base-ui/react/popover"
import {
  ChevronDown,
  MoveDiagonal2,
  PencilRuler,
  Pin,
  PinOff,
  CaseSensitive,
  type LucideIcon,
} from "lucide-react"

import type { CadEngine } from "@mellowcad/engine"
import type { EditorState } from "@mellowcad/react"
import { cn } from "./utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip"
import {
  Select,
  SelectContent,
  SelectItem,
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
import { LinetypeIcon, LineweightIcon } from "./icons"
import {
  LARGE_TOOL_ICONS,
  LayerPropertiesLarge,
  type LargeIcon,
} from "./large-icons"
import { toolIcon } from "./tool-icons"
import {
  HOME,
  SPACER,
  type ControlSize,
  type ItemId,
  type RibbonColumn,
  type RibbonControl,
  type RibbonPanel,
} from "./ribbon-home"
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
}

/**
 * How far a turn of the wheel moves the panels' row sideways: down goes on
 * towards the panels' end, which in a right-to-left page is a scrollLeft
 * below 0. A sideways turn is the browser's own (a trackpad, Shift with the
 * wheel). WHY `inRow`: React hands the row the wheel of every popup it
 * rendered, portalled or not, so a turn over a list — the layers', a
 * drop-down's, Insert's gallery — would move the row under it as well.
 */
export function panelsScroll(
  wheel: { readonly deltaX: number; readonly deltaY: number },
  inRow: boolean,
  rtl: boolean
): number {
  if (!inRow || wheel.deltaX !== 0) return 0
  return rtl ? -wheel.deltaY : wheel.deltaY
}

/**
 * AutoCAD's ribbon (docs/plans/autocad-ui.md, §2.3): its tab row, 24, and
 * the panels of the tab in front, 100, of which Home is built. Each panel is
 * acad.cuix's rows at AutoCAD's sizes, with its title bar, the slide-out
 * under it and their push pin; the drop-downs keep the member last used in
 * the engine (`state.ribbon.members`), for the session.
 */
export function Ribbon({ engine, state }: PieceProps): ReactElement {
  const t = useEditorText("Ribbon")
  const items = useEditorText("Ribbon.items")
  const ctx: Context = {
    engine,
    state,
    text: (id) => items(id),
    act: (run) => {
      run()
      engine.focusSurface()
    },
    toDrawing: drawingFocus(engine),
  }

  return (
    <TooltipProvider>
      {/* The tab row: the tabs 20 high on its foot, the one in front on the
      panels' surface. */}
      <div role="tablist" className="flex h-6 items-end bg-background ps-1">
        <button
          type="button"
          role="tab"
          aria-selected
          className="h-5 rounded-t-sm bg-card px-2.5 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          onClick={() => {
            engine.setRibbonTab("home")
            engine.focusSurface()
          }}
        >
          {t("tabs.home")}
        </button>
      </div>
      {/* WHY it scrolls sideways: until the panels fold as the window
      narrows (block 5 of the plan's §6), Home's built panels are wider than
      a window of 1280 (docs/plans/autocad-ui.md, §6, decision 6); the
      wheel or a trackpad scrolls it, Shift with the wheel, and no bar
      takes the panels' height. */}
      <div
        role="tabpanel"
        aria-label={t("tabs.home")}
        className="flex h-25 scrollbar-none overflow-x-auto overflow-y-hidden pt-px"
        onWheel={(event) => {
          const row = event.currentTarget
          const by = panelsScroll(
            event,
            event.target instanceof Node && row.contains(event.target),
            getComputedStyle(row).direction === "rtl"
          )
          // Nothing written where the turn is the browser's: a write would
          // cut its own sideways scroll short.
          if (by !== 0) row.scrollLeft += by
        }}
      >
        {HOME.map((panel) => (
          <PanelView key={panel.id} panel={panel} ctx={ctx} />
        ))}
      </div>
    </TooltipProvider>
  )
}

/**
 * A panel, 97 high: 4, its rows (72), 3 and its title bar (18). Its
 * slide-out drops from the title bar over the drawing and closes as the
 * pointer leaves it, unless pinned (desktop autocad-mouse/ds-a.png).
 */
function PanelView({ panel, ctx }: { panel: RibbonPanel; ctx: Context }) {
  const t = useEditorText("Ribbon")
  const portal = usePortalContainer()
  const anchor = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [pinned, setPinned] = useState(false)
  const name = t(`panels.${panel.id}`)
  const slideOut = panel.slideOut
    ?.map((row) => row.filter((c) => c === SPACER || shows(c, ctx)))
    .filter((row) => row.some((c) => c !== SPACER))

  // The Properties panel's dialog launcher, at the end of its title bar, the
  // slide-out's too, which covers the panel's.
  const launcher = panel.launcher === "properties" && (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            aria-label={name}
            className="flex h-4.5 w-3 items-end justify-center rounded-sm pb-0.5 outline-none hover:bg-muted hover:text-foreground"
            onClick={() =>
              ctx.act(() => ctx.engine.runRibbonButton("properties"))
            }
          >
            <MoveDiagonal2
              aria-hidden
              className="size-2.5 -scale-y-100 rtl:-scale-x-100"
            />
          </button>
        }
      />
      <TooltipContent side="bottom">{name}</TooltipContent>
    </Tooltip>
  )

  return (
    <div
      ref={anchor}
      className={cn("flex h-24.25 shrink-0 flex-col border-e", WHOLE)}
      onPointerLeave={() => {
        if (!pinned) setOpen(false)
      }}
    >
      <div className="mt-1 flex h-18 items-start ps-0.75 pe-0.5">
        {panel.slots.map((slot, i) => (
          <Fragment key={i}>
            {i > 0 && (
              <span
                aria-hidden
                className={gapBetween(panel.slots[i - 1], slot)}
              />
            )}
            <Slot slot={slot} ctx={ctx} />
          </Fragment>
        ))}
      </div>
      <div className="mx-px mt-0.75 flex h-4.5 text-muted-foreground">
        {slideOut && slideOut.length > 0 ? (
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
            <Popover.Trigger className="flex flex-1 items-center justify-center gap-1 rounded-sm outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50">
              {name}
              <ChevronDown aria-hidden className="size-3" />
            </Popover.Trigger>
            <Popover.Portal container={portal}>
              <Popover.Positioner
                anchor={anchor}
                side="bottom"
                align="start"
                sideOffset={-18}
                collisionPadding={0}
                className="z-50"
              >
                {/* The drawing keeps the keys: opening takes no focus, and
                closing gives none back to the title bar. WHY not
                `toDrawing`: a popover that is not modal also closes on a
                press elsewhere, and Base UI runs the function on every
                close — it would take focus from the field just pressed. */}
                <Popover.Popup
                  initialFocus={false}
                  finalFocus={false}
                  className={cn(
                    POPUP,
                    "min-w-(--anchor-width) rounded-t-none border-t-0 pt-5.5 shadow-lg"
                  )}
                >
                  <div className="flex flex-col gap-0.5 ps-0.5 pe-0.5">
                    {slideOut.map((row, r) => (
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
                      className="flex h-4.5 flex-1 items-center justify-center rounded-sm outline-none hover:bg-muted hover:text-foreground"
                      onClick={() => ctx.engine.focusSurface()}
                    >
                      {name}
                    </Popover.Close>
                    {launcher || <span aria-hidden className="w-4" />}
                  </div>
                </Popover.Popup>
              </Popover.Positioner>
            </Popover.Portal>
          </Popover.Root>
        ) : (
          <span className="flex flex-1 items-center justify-center">
            {name}
          </span>
        )}
        {launcher}
      </div>
    </div>
  )
}

/**
 * What parts two slots of a panel's row (acad.cuix's, measured in
 * uia-a-1920-tab-ID_TabHome.txt): large buttons abut, a column sits 1 px
 * after a large one, and columns of small ones stand 5 apart.
 */
function gapBetween(
  before: RibbonControl | RibbonColumn,
  after: RibbonControl | RibbonColumn
): string {
  if (before.kind === "column" && after.kind === "column") return "w-1.25"
  if (before.kind === "column" || after.kind === "column") return "w-px"
  return "hidden"
}

function Slot({
  slot,
  ctx,
}: {
  slot: RibbonControl | RibbonColumn
  ctx: Context
}) {
  if (slot.kind !== "column") return <Control control={slot} ctx={ctx} />
  // Three rows on a 24 px pitch, the first 1 px below a large button's top.
  return (
    <div className="mt-px flex flex-col items-start gap-0.5">
      {slot.rows.map((row, i) => (
        <Control key={i} control={row} ctx={ctx} />
      ))}
    </div>
  )
}

/** Whether a control has what it runs: a tool the engine lacks shows none. */
function shows(control: RibbonControl, ctx: Context): boolean {
  const has = (id: string) => ctx.state.tools.some((tool) => tool.id === id)
  switch (control.kind) {
    case "tool":
      return has(control.tool)
    case "engineTool":
      return has(control.tool)
    case "split":
      return control.members.some((m) => m !== null && has(m))
    default:
      return true
  }
}

function Control({ control, ctx }: { control: RibbonControl; ctx: Context }) {
  const { engine, state } = ctx
  const shortcutOf = (id: string) =>
    state.tools.find((tool) => tool.id === id)?.shortcut?.toUpperCase()
  if (!shows(control, ctx)) return null

  switch (control.kind) {
    case "tool":
      return (
        <ToolButton
          size={control.size}
          icon={control.tool}
          text={ctx.text(control.tool)}
          shortcut={shortcutOf(control.tool)}
          onClick={() => ctx.act(() => engine.setActiveTool(control.tool))}
        />
      )
    case "engineTool": {
      const label =
        state.tools.find((tool) => tool.id === control.tool)?.label ??
        control.tool
      return (
        <ToolButton
          size="icon"
          icon={control.tool}
          text={label}
          shortcut={shortcutOf(control.tool)}
          onClick={() => ctx.act(() => engine.setActiveTool(control.tool))}
        />
      )
    }
    case "command":
      return (
        <SmallButton
          icon={control.button === "textStyle" ? CaseSensitive : PencilRuler}
          label={ctx.text(control.button)}
          onClick={() => ctx.act(() => engine.runRibbonButton(control.button))}
        />
      )
    case "split":
      return <SplitButton control={control} ctx={ctx} />
    case "layerProperties":
      return <LayerPropertiesButton ctx={ctx} />
    case "layerCombo":
      return <LayerCombo ctx={ctx} />
    case "propertyCombo":
      return <PropertyCombo property={control.property} ctx={ctx} />
    case "insertGallery":
      return <InsertGallery ctx={ctx} />
  }
}

/** A tool's button at its size: large, small with its text, or its icon alone. */
function ToolButton({
  size,
  icon,
  text,
  shortcut,
  onClick,
}: {
  size: ControlSize
  icon: string
  text: string
  shortcut?: string
  onClick: () => void
}) {
  if (size === "large") {
    return (
      <LargeButton
        icon={LARGE_TOOL_ICONS[icon]}
        text={text}
        shortcut={shortcut}
        onClick={onClick}
      />
    )
  }
  return (
    <SmallButton
      icon={toolIcon(icon)}
      label={text}
      withText={size === "small"}
      shortcut={shortcut}
      onClick={onClick}
    />
  )
}

/** A tool's 16 px icon, by its id: the member a split button shows. */
function ToolIcon({ id }: { id: string }): ReactElement {
  return createElement(toolIcon(id), {
    "aria-hidden": true,
    className: "size-4",
  })
}

/**
 * A large button's text: on one line, or two parted at the space nearest its
 * middle, as AutoCAD writes Layer Properties and Match Properties.
 */
function largeLines(text: string): string[] {
  const spaces = [...text.matchAll(/ /g)].map((match) => match.index)
  if (spaces.length === 0) return [text]
  const middle = text.length / 2
  const at = spaces.reduce((best, i) =>
    Math.abs(i - middle) < Math.abs(best - middle) ? i : best
  )
  return [text.slice(0, at), text.slice(at + 1)]
}

/** The tooltip AutoCAD shows a button: its name and, here, its alias. */
function Tip({
  label,
  shortcut,
  children,
}: {
  label: string
  shortcut?: string
  children: ReactElement
}) {
  return (
    <Tooltip>
      <TooltipTrigger render={children} />
      <TooltipContent side="bottom">
        <span className="flex items-center gap-2">
          {label}
          {shortcut && (
            <kbd
              dir="ltr"
              className="rounded border border-border/60 bg-muted px-1 font-mono text-muted-foreground"
            >
              {shortcut}
            </kbd>
          )}
        </span>
      </TooltipContent>
    </Tooltip>
  )
}

/** A large button: 72 high, its 32 px icon over its text. */
function LargeButton({
  icon: Icon,
  text,
  shortcut,
  pressed,
  onClick,
}: {
  icon: LargeIcon | undefined
  text: string
  shortcut?: string
  pressed?: boolean
  onClick: () => void
}) {
  return (
    <Tip label={text} shortcut={shortcut}>
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
        {Icon && <Icon />}
        <span className="mt-0.5 flex flex-col items-center">
          {largeLines(text).map((line, i) => (
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
  label,
  withText = false,
  shortcut,
  onClick,
}: {
  icon: LucideIcon
  label: string
  withText?: boolean
  shortcut?: string
  onClick: () => void
}) {
  return (
    <Tip label={label} shortcut={shortcut}>
      <button
        type="button"
        aria-label={withText ? undefined : label}
        className={cn(BUTTON, "h-5.5", withText ? cn("pe-1.5", WHOLE) : "w-6")}
        onClick={onClick}
      >
        <span className="flex w-5.5 justify-center">
          <Icon aria-hidden className="size-4" />
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
    (m): m is ItemId => m === null || state.tools.some((tool) => tool.id === m)
  )
  const tools = members.filter((m): m is ItemId => m !== null)
  const follows = control.behaviour !== "noFollow"
  const remembered = state.ribbon.members[control.id]
  const shown =
    follows && tools.includes(remembered as ItemId)
      ? (remembered as ItemId)
      : tools[0]
  const shortcut = state.tools
    .find((tool) => tool.id === shown)
    ?.shortcut?.toUpperCase()
  const text = control.text ? t(control.text) : ctx.text(shown)
  const run = (id: ItemId) =>
    ctx.act(() => {
      if (follows) engine.setRibbonMember(control.id, id)
      engine.setActiveTool(id)
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
    // One target: the shown member's icon and the arrow, 35 × 22.
    return (
      <Menu.Root>
        <Menu.Trigger
          aria-label={ctx.text(shown)}
          className={cn(BUTTON, "h-5.5 w-8.75")}
        >
          <span className="flex w-5.5 justify-center">
            <ToolIcon id={shown} />
          </span>
          <ChevronDown aria-hidden className="size-2.5" />
        </Menu.Trigger>
        {list}
      </Menu.Root>
    )
  }

  if (control.size === "large") {
    const Icon = LARGE_TOOL_ICONS[shown]
    const lines = largeLines(text)
    // Two targets (§2.3): the icon, 38 high, runs; the text and its arrow,
    // 35, open the list. They share a pixel (`-mt-px`), as 38 and 35 do in
    // AutoCAD's 72: one under the other the button ends a pixel below its
    // neighbours.
    return (
      <Menu.Root>
        <div className={cn("group flex h-18 shrink-0 flex-col", WHOLE_EVEN)}>
          <Tip label={ctx.text(shown)} shortcut={shortcut}>
            <button
              type="button"
              aria-label={text}
              className={cn(
                BUTTON,
                "h-9.5 items-start justify-center rounded-b-none pt-0.75 group-hover:border-border"
              )}
              onClick={() => run(shown)}
            >
              {Icon && <Icon />}
            </button>
          </Tip>
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
        {list}
      </Menu.Root>
    )
  }

  const withText = control.size === "small"
  return (
    <Menu.Root>
      <div className="group flex h-5.5 shrink-0">
        <Tip label={ctx.text(shown)} shortcut={shortcut}>
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
              <ToolIcon id={shown} />
            </span>
            {withText && text}
          </button>
        </Tip>
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
            const Icon = LARGE_TOOL_ICONS[member]
            return (
              <Menu.Item
                key={member}
                data-current={member === shown ? "" : undefined}
                className={LIST_ROW}
                onClick={() => onPick(member)}
              >
                <span className="flex size-8 shrink-0 items-center justify-center">
                  {Icon && <Icon />}
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
  const open = state.palette.open && state.palette.tab === "layers"
  return (
    <LargeButton
      icon={LayerPropertiesLarge}
      text={ctx.text("layerProperties")}
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
  ctx,
}: {
  property: "color" | "lineweight" | "linetype"
  ctx: Context
}) {
  const { engine, state } = ctx
  const t = useEditorText("Ribbon")
  const selected = state.selectionCount > 0
  const done = () => engine.focusSurface()

  if (property === "color") {
    return (
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
        className="w-50"
        triggerClassName={COMBO}
        finalFocus={ctx.toDrawing}
      />
    )
  }
  const Icon = property === "lineweight" ? LineweightIcon : LinetypeIcon
  return (
    <div className="flex w-50 items-center">
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
          value={selected ? state.selectionLineweight : state.currentLineweight}
          names={state.names}
          onValueChange={(value) => {
            engine.applyLineweightControl(value)
            done()
          }}
          ariaLabel={t("lineweight")}
          className={cn(COMBO, "w-45")}
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
          className={cn(COMBO, "w-45")}
          finalFocus={ctx.toDrawing}
        />
      )}
    </div>
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
      <Popover.Trigger
        className={cn(
          BUTTON,
          "h-18 min-w-9.5 flex-col justify-start px-0.5 pt-0.75",
          WHOLE_EVEN
        )}
      >
        {Icon && <Icon />}
        <span className="mt-0.5">{text}</span>
        <ChevronDown aria-hidden className="size-2.5" />
      </Popover.Trigger>
      <Popover.Portal container={portal}>
        <Popover.Positioner side="bottom" align="start" className="z-50">
          <Popover.Popup className={cn(POPUP, "w-60 p-1")}>
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
