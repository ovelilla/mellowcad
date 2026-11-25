"use client"

import {
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentType,
  type ReactElement,
  type ReactNode,
} from "react"
import { ContextMenu } from "@base-ui/react/context-menu"
import { Menu } from "@base-ui/react/menu"
import {
  Check,
  GripVertical,
  Layers,
  LibraryBig,
  Settings,
  SlidersHorizontal,
  X,
  type LucideIcon,
} from "lucide-react"

import { PALETTES, type CadEngine, type PaletteId } from "@mellowcad/engine"
import type { EditorState } from "@mellowcad/react"
import { cn } from "./utils"
import { Button } from "./ui/button"
import { useDirection } from "./ui/direction"
import { usePortalContainer } from "./ui/portal-container"
import { TooltipProvider } from "./ui/tooltip"
import { IconAction } from "./toolbar-primitives"
import { drawingFocus } from "./drawing-focus"
import { MENU_AT_CURSOR, MENU_ITEM } from "./snap-override-menu"
import { useEditorText } from "./editor-text"
import {
  clampDockWidth,
  dockedAt,
  DOCK_WIDTH,
  PALETTE_MIN,
  type DockSide,
  type PaletteLayout,
  type PalettePlace,
} from "./palette-layout"
import { usePaletteLayout } from "./palette-layout-context"
import type { PieceProps } from "./piece"

/** What a palette's content is handed: a piece's props and which palette. */
export interface PaletteProps extends PieceProps {
  readonly palette: PaletteId
}

/**
 * Whether a palette shows: open, and not hidden by Clean Screen unless it was
 * opened while Clean Screen was on.
 */
export function paletteShows(
  state: Pick<EditorState, "palettes" | "cleanScreen">,
  id: PaletteId
): boolean {
  return (
    state.palettes[id] &&
    (!state.cleanScreen.active || state.cleanScreen.palettes.includes(id))
  )
}

const ICONS: Record<PaletteId, LucideIcon> = {
  properties: SlidersHorizontal,
  layers: Layers,
  blocks: LibraryBig,
}

/** A palette's name, its title bar's: AutoCAD's palette's own. */
function usePaletteName(): (id: PaletteId) => string {
  const t = useEditorText()
  return (id) =>
    id === "properties"
      ? t("Properties.title")
      : id === "blocks"
        ? t("Blocks.title")
        : t("Palette.layers")
}

/**
 * A floating palette's box in the drawing area, logical: its outer edge's
 * distance from the drawing's inline end, its top's from the drawing's top.
 */
interface Box {
  readonly end: number
  readonly top: number
  readonly width: number
  readonly height: number
}

interface Area {
  readonly width: number
  readonly height: number
}

/** `box` made to fit `area`: no bigger, and wholly inside it. */
function fit(box: Box, area: Area): Box {
  const width = Math.max(0, Math.min(box.width, area.width))
  const height = Math.max(0, Math.min(box.height, area.height))
  return {
    width,
    height,
    end: Math.round(Math.min(Math.max(box.end, 0), area.width - width)),
    top: Math.round(Math.min(Math.max(box.top, 0), area.height - height)),
  }
}

const boxOf = (place: PalettePlace): Box => ({
  end: place.end,
  top: place.top,
  width: place.width,
  height: place.height,
})

/** Which edges a Size moves: the start and the bottom, the title bar's opposite corner. */
interface Edges {
  readonly start: boolean
  readonly end: boolean
  readonly top: boolean
  readonly bottom: boolean
}

/**
 * `from` with its `edges` moved by `inline` (towards the inline end) and
 * `dy` (down), no smaller than a palette may be, inside `area`.
 */
function resized(
  from: Box,
  edges: Edges,
  inline: number,
  dy: number,
  area: Area
): Box {
  let x1 = area.width - from.end
  let x0 = x1 - from.width
  let y0 = from.top
  let y1 = from.top + from.height
  if (edges.start)
    x0 = Math.min(Math.max(0, x0 + inline), x1 - PALETTE_MIN.width)
  if (edges.end)
    x1 = Math.max(Math.min(area.width, x1 + inline), x0 + PALETTE_MIN.width)
  if (edges.top) y0 = Math.min(Math.max(0, y0 + dy), y1 - PALETTE_MIN.height)
  if (edges.bottom)
    y1 = Math.max(Math.min(area.height, y1 + dy), y0 + PALETTE_MIN.height)
  return {
    end: Math.round(area.width - x1),
    top: Math.round(y0),
    width: Math.round(x1 - x0),
    height: Math.round(y1 - y0),
  }
}

/**
 * A gesture on a palette: moving it (its title bar dragged, or Move from its
 * menu) or sizing it (an edge dragged, or Size).
 */
interface Drag {
  readonly kind: "move" | "size"
  readonly id: PaletteId
  /** The button held, or `null`: Move or Size from the menu, until a click. */
  readonly pointerId: number | null
  /** Where the pointer was when it began; `null` until it first moves. */
  readonly start: { readonly x: number; readonly y: number } | null
  /**
   * The box as it began and as it is now. Moving, its size is the one kept
   * (shrunk only to show), so a move in a small window never shrinks it.
   */
  readonly from: Box
  readonly to: Box
  readonly edges: Edges
  /**
   * Moving, where the pointer holds the palette: from its outer edge and its
   * top; `null` until the pointer first moves.
   */
  readonly grab: { readonly end: number; readonly top: number } | null
  /** The layout before the gesture, which Escape puts back. */
  readonly before: PaletteLayout
  /** The side a release docks it at. */
  readonly target: DockSide | null
  /** The Ctrl key, which turns Allow Docking round while held. */
  readonly ctrl: boolean
  readonly pointer: { readonly x: number; readonly y: number } | null
}

/** How near the drawing's side a dragged palette's pointer docks it. */
const DOCK_REACH = 24

/** How far a docked title bar's press travels before it floats the palette. */
const UNDOCK_TRAVEL = 4

/**
 * Where a palette floated from its column hangs from the pointer: the middle
 * of its vertical title bar, near its top.
 */
const TITLE_GRAB = 11

/** What the palettes share across the zones they show in. */
interface PaletteHost {
  readonly engine: CadEngine
  readonly state: EditorState
  readonly Content: ComponentType<PaletteProps>
  readonly drag: Drag | null
  readonly setDrag: (drag: Drag | null) => void
  /** The floating palettes, the frontmost last. */
  readonly front: readonly PaletteId[]
  readonly raise: (id: PaletteId) => void
  /** The drawing area's box, where palettes float, once it is laid out. */
  readonly area: Area | null
  readonly setArea: (area: Area | null) => void
  /** The drawing area's element, where palettes float. */
  readonly areaElement: HTMLElement | null
  readonly setAreaElement: (element: HTMLElement | null) => void
}

const PaletteHostContext = createContext<PaletteHost | null>(null)

/**
 * The palettes' host, round the zones they show in: the drawing (floating),
 * the columns (docked) and a drag's overlay. `null` before the engine exists,
 * or with the palettes turned off.
 */
export function PaletteHostProvider({
  ready,
  Content,
  children,
}: {
  ready: PieceProps | null
  Content: ComponentType<PaletteProps> | null
  children: ReactNode
}): ReactElement {
  const [drag, setDrag] = useState<Drag | null>(null)
  const [front, setFront] = useState<readonly PaletteId[]>(PALETTES)
  const [area, setArea] = useState<Area | null>(null)
  const [areaElement, setAreaElement] = useState<HTMLElement | null>(null)
  const host: PaletteHost | null =
    ready && Content
      ? {
          ...ready,
          Content,
          drag,
          setDrag,
          front,
          raise: (id) => {
            if (front.at(-1) !== id)
              setFront([...front.filter((other) => other !== id), id])
          },
          area,
          setArea,
          areaElement,
          setAreaElement,
        }
      : null
  return <PaletteHostContext value={host}>{children}</PaletteHostContext>
}

/** Sets `place`'s fields on palette `id` of `layout`. */
const placed = (
  layout: PaletteLayout,
  id: PaletteId,
  place: Partial<PalettePlace>
): PaletteLayout => ({
  ...layout,
  palettes: { ...layout.palettes, [id]: { ...layout.palettes[id], ...place } },
})

/**
 * The floating palettes, over the drawing in the canvas cell: AutoCAD's
 * palettes float over the drawing area wherever they were left; here inside
 * it, as nothing leaves the page (plan §4, P3), so none covers the ribbon or
 * the command line.
 */
export function FloatingPalettes(): ReactElement | null {
  const host = useContext(PaletteHostContext)
  const { layout } = usePaletteLayout()
  const setArea = host?.setArea
  const element = host?.areaElement ?? null
  const setAreaElement = host?.setAreaElement

  useLayoutEffect(() => {
    if (!element || !setArea) return
    const measure = () =>
      setArea({ width: element.clientWidth, height: element.clientHeight })
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => {
      observer.disconnect()
      setArea(null)
    }
  }, [setArea, element])

  if (!host) return null
  const area = host.area
  const floating = host.front.filter(
    (id) => layout.palettes[id].docked === null && paletteShows(host.state, id)
  )
  return (
    <div
      ref={(node) => setAreaElement?.(node)}
      className="pointer-events-none absolute inset-0 z-20 overflow-hidden"
    >
      {area &&
        floating.map((id) => (
          <FloatingPalette key={id} id={id} host={host} area={area} />
        ))}
    </div>
  )
}

/**
 * A floating palette: its content, and its vertical title bar on its inline
 * end — Close, the properties menu, the name written upwards in capitals and
 * its icon at the foot, as AutoCAD's (plan §2.8; whether the bar changes
 * side with where it floats is unverified there, and it stayed on the right
 * when the window was moved, so here it stays at the inline end). Its edges
 * size it.
 */
function FloatingPalette({
  id,
  host,
  area,
}: {
  id: PaletteId
  host: PaletteHost
  area: Area
}): ReactElement {
  const t = useEditorText("Palette")
  const { layout } = usePaletteLayout()
  const name = usePaletteName()(id)
  const { drag, Content, engine, state } = host
  const place = layout.palettes[id]
  const gesture = drag && drag.id === id ? drag : null
  const shown = fit(gesture ? gesture.to : boxOf(place), area)
  const Icon = ICONS[id]

  const begin = (
    event: React.PointerEvent,
    kind: "move" | "size",
    edges: Edges
  ) => {
    if (event.button !== 0) return
    event.preventDefault()
    const box = kind === "move" ? { ...boxOf(place), ...at(shown) } : shown
    host.setDrag({
      kind,
      id,
      pointerId: event.pointerId,
      start: { x: event.clientX, y: event.clientY },
      from: box,
      to: box,
      edges,
      grab: null,
      before: layout,
      target: null,
      ctrl: event.ctrlKey,
      pointer: { x: event.clientX, y: event.clientY },
    })
  }

  return (
    <section
      aria-label={name}
      onPointerDownCapture={() => host.raise(id)}
      style={{
        insetInlineEnd: shown.end,
        top: shown.top,
        width: shown.width,
        height: shown.height,
      }}
      className="pointer-events-auto absolute isolate flex rounded-sm border bg-card shadow-lg"
    >
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <Content engine={engine} state={state} palette={id} />
      </div>
      <div
        onPointerDown={(event) => {
          if (!ownPress(event)) return
          begin(event, "move", NO_EDGES)
        }}
        className="flex w-5.5 shrink-0 cursor-move touch-none flex-col items-center gap-0.5 border-s bg-muted/40 py-0.5 select-none"
      >
        <IconAction
          icon={X}
          label={t("close")}
          size="palette"
          side="inline-start"
          onClick={() => {
            engine.closePalette(id)
            engine.focusSurface()
          }}
        />
        <PaletteMenu id={id} host={host} box={shown} />
        <span className="min-h-0 flex-1 overflow-hidden pt-1 whitespace-nowrap text-muted-foreground uppercase [writing-mode:sideways-lr]">
          {name}
        </span>
        <Icon
          aria-hidden
          className="mb-1 size-4 shrink-0 text-muted-foreground"
        />
      </div>
      <SizeEdges onBegin={(event, edges) => begin(event, "size", edges)} />
    </section>
  )
}

const NO_EDGES: Edges = { start: false, end: false, top: false, bottom: false }

/** A box's place alone. */
const at = (box: Box) => ({ end: box.end, top: box.top })

/**
 * A press on a title bar itself, not on one of its buttons. WHY the DOM's
 * own tree: React hands a portalled popup's events to what rendered it, so
 * a press on the properties menu's entries reaches the title bar too, and
 * started a drag that swallowed the entry's click.
 */
function ownPress(event: React.MouseEvent): boolean {
  const target = event.target as Element
  return (
    event.currentTarget.contains(target) && target.closest("button") === null
  )
}

/** The four edges and four corners a floating palette is sized by. */
function SizeEdges({
  onBegin,
}: {
  onBegin: (event: React.PointerEvent, edges: Edges) => void
}): ReactElement {
  const handles: [string, Partial<Edges>][] = [
    ["inset-y-2 -inset-s-1 w-2 cursor-ew-resize", { start: true }],
    ["inset-y-2 -inset-e-1 w-2 cursor-ew-resize", { end: true }],
    ["inset-x-2 -top-1 h-2 cursor-ns-resize", { top: true }],
    ["inset-x-2 -bottom-1 h-2 cursor-ns-resize", { bottom: true }],
    [
      "-inset-s-1 -top-1 size-3 ltr:cursor-nwse-resize rtl:cursor-nesw-resize",
      { start: true, top: true },
    ],
    [
      "-inset-e-1 -top-1 size-3 ltr:cursor-nesw-resize rtl:cursor-nwse-resize",
      { end: true, top: true },
    ],
    [
      "-inset-s-1 -bottom-1 size-3 ltr:cursor-nesw-resize rtl:cursor-nwse-resize",
      { start: true, bottom: true },
    ],
    [
      "-inset-e-1 -bottom-1 size-3 ltr:cursor-nwse-resize rtl:cursor-nesw-resize",
      { end: true, bottom: true },
    ],
  ]
  return (
    <>
      {handles.map(([where, edges]) => (
        <div
          key={where}
          aria-hidden
          onPointerDown={(event) => onBegin(event, { ...NO_EDGES, ...edges })}
          className={cn("absolute touch-none", where)}
        />
      ))}
    </>
  )
}

/**
 * The title bar's properties menu (adui26res.dll's PaletteOptionsMenu, plan
 * §2.8): Move, Size, Close, Allow Docking, as AutoCAD orders them. Anchor
 * Left, Anchor Right, Auto-hide and Transparency are not built yet
 * (docs/coverage/workspace.md). WHY no tooltip: its trigger opens a popup.
 */
function PaletteMenu({
  id,
  host,
  box,
}: {
  id: PaletteId
  host: PaletteHost
  box: Box
}): ReactElement {
  const t = useEditorText("Palette")
  const portal = usePortalContainer()
  const { layout, setLayout } = usePaletteLayout()
  const { engine } = host
  const place = layout.palettes[id]
  const from = (kind: "move" | "size") =>
    kind === "move" ? { ...boxOf(place), ...at(box) } : box
  // WHY once the menu has closed: a modal menu leaves the page inert until
  // then, so the gesture's overlay could take neither the focus nor the
  // pointer, and the menu's own close would hand the keys to the drawing.
  const [chosen, setChosen] = useState<{
    kind: "move" | "size"
    edges: Edges
  } | null>(null)
  const gesture = (kind: "move" | "size", edges: Edges) =>
    setChosen({ kind, edges })

  return (
    <Menu.Root
      onOpenChangeComplete={(open) => {
        if (open || !chosen) return
        setChosen(null)
        host.setDrag({
          ...chosen,
          id,
          pointerId: null,
          start: null,
          from: from(chosen.kind),
          to: from(chosen.kind),
          grab: null,
          before: layout,
          target: null,
          ctrl: false,
          pointer: null,
        })
      }}
    >
      <Menu.Trigger
        render={
          <Button size="palette" variant="ghost" aria-label={t("options")}>
            <Settings />
          </Button>
        }
      />
      <Menu.Portal container={portal}>
        <Menu.Positioner side="inline-start" align="start" className="z-50">
          <Menu.Popup
            finalFocus={drawingFocus(engine)}
            className={MENU_AT_CURSOR}
          >
            <Menu.Item
              className={MENU_ITEM}
              onClick={() => gesture("move", NO_EDGES)}
            >
              {t("move")}
            </Menu.Item>
            <Menu.Item
              className={MENU_ITEM}
              onClick={() =>
                gesture("size", { ...NO_EDGES, start: true, bottom: true })
              }
            >
              {t("size")}
            </Menu.Item>
            <Menu.Item
              className={MENU_ITEM}
              onClick={() => engine.closePalette(id)}
            >
              {t("close")}
            </Menu.Item>
            <AllowDockingItem
              checked={place.allowDocking}
              onChange={(allowDocking) =>
                setLayout(placed(layout, id, { allowDocking }), true)
              }
              Item={Menu.CheckboxItem}
              Indicator={Menu.CheckboxItemIndicator}
            />
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}

/** Allow Docking, checked while a drag may dock the palette. */
function AllowDockingItem({
  checked,
  onChange,
  Item,
  Indicator,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  Item: typeof Menu.CheckboxItem | typeof ContextMenu.CheckboxItem
  Indicator:
    typeof Menu.CheckboxItemIndicator | typeof ContextMenu.CheckboxItemIndicator
}): ReactElement {
  const t = useEditorText("Palette")
  return (
    <Item
      checked={checked}
      closeOnClick
      onCheckedChange={onChange}
      className={MENU_ITEM}
    >
      {t("allowDocking")}
      <Indicator className="absolute inset-e-2">
        <Check className="size-4 text-primary" />
      </Indicator>
    </Item>
  )
}

/**
 * A column of docked palettes at one side of the drawing: each its title
 * bar along its top and its content, stacked, and the splitter that sizes
 * the column on its inner edge (plan §2.8).
 */
export function PaletteDock({ side }: { side: DockSide }): ReactElement | null {
  const host = useContext(PaletteHostContext)
  const { layout, setLayout } = usePaletteLayout()
  if (!host) return null
  const docked = dockedAt(layout, side, (id) => paletteShows(host.state, id))
  if (docked.length === 0) return null
  const width =
    layout.dock[side] ?? clampDockWidth(layout.palettes[docked[0]].width)
  const splitter = (
    <Splitter
      side={side}
      width={width}
      onResize={(next) =>
        setLayout({ ...layout, dock: { ...layout.dock, [side]: next } })
      }
      onCommit={(next, byPointer) => {
        setLayout({ ...layout, dock: { ...layout.dock, [side]: next } }, true)
        if (byPointer) host.engine.focusSurface()
      }}
    />
  )
  return (
    <TooltipProvider>
      <div className="flex min-h-0 min-w-0 flex-1">
        {side === "end" && splitter}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {docked.map((id) => (
            <DockedPalette key={id} id={id} host={host} />
          ))}
        </div>
        {side === "start" && splitter}
      </div>
    </TooltipProvider>
  )
}

/**
 * A docked palette: its title bar turns horizontal along its top, 22 high, a
 * grip and its name in capitals, Close only under the pointer; its
 * right-click menu is Close and Allow Docking alone; a double-click floats it
 * again where it was; dragged, it floats under the pointer (plan §2.8,
 * docked-title-hover.png, docked-title-rclick.png).
 */
function DockedPalette({
  id,
  host,
}: {
  id: PaletteId
  host: PaletteHost
}): ReactElement {
  const t = useEditorText("Palette")
  const portal = usePortalContainer()
  const name = usePaletteName()(id)
  const { layout, setLayout } = usePaletteLayout()
  const rtl = useDirection() === "rtl"
  const press = useRef<{ x: number; y: number } | null>(null)
  const { engine, state, Content } = host
  const place = layout.palettes[id]

  // Floated under the pointer, which keeps it by its title bar, and dragged
  // on: a release at a side docks it again.
  const undock = (event: React.PointerEvent) => {
    const rect = host.areaElement?.getBoundingClientRect()
    if (!rect) return
    const x = event.clientX
    const y = event.clientY
    const grab = { end: TITLE_GRAB, top: TITLE_GRAB }
    const box = {
      ...boxOf(place),
      end: Math.max(0, (rtl ? x - rect.left : rect.right - x) - grab.end),
      top: Math.max(0, y - rect.top - grab.top),
    }
    setLayout(placed(layout, id, { docked: null, ...at(box) }))
    host.raise(id)
    host.setDrag({
      kind: "move",
      id,
      pointerId: event.pointerId,
      start: { x, y },
      from: box,
      to: box,
      edges: NO_EDGES,
      grab,
      before: layout,
      target: null,
      ctrl: event.ctrlKey,
      pointer: { x, y },
    })
  }

  return (
    <section
      aria-label={name}
      className="flex min-h-0 flex-1 flex-col border-b last:border-b-0"
    >
      <ContextMenu.Root>
        <ContextMenu.Trigger
          render={
            <div
              onPointerDown={(event) => {
                if (event.button !== 0) return
                if (!ownPress(event)) return
                event.currentTarget.setPointerCapture(event.pointerId)
                press.current = { x: event.clientX, y: event.clientY }
              }}
              onPointerMove={(event) => {
                const start = press.current
                if (
                  !start ||
                  Math.hypot(event.clientX - start.x, event.clientY - start.y) <
                    UNDOCK_TRAVEL
                )
                  return
                press.current = null
                event.currentTarget.releasePointerCapture(event.pointerId)
                undock(event)
              }}
              onPointerUp={() => {
                press.current = null
              }}
              onPointerCancel={() => {
                press.current = null
              }}
              onLostPointerCapture={() => {
                press.current = null
              }}
              onDoubleClick={(event) => {
                if (!ownPress(event)) return
                setLayout(placed(layout, id, { docked: null }), true)
                engine.focusSurface()
              }}
              className="group flex h-5.5 shrink-0 cursor-move touch-none items-center gap-1 border-b bg-muted/40 ps-0.5 select-none"
            />
          }
        >
          <GripVertical aria-hidden className="size-4 text-faint-foreground" />
          <span className="min-w-0 flex-1 truncate text-muted-foreground uppercase">
            {name}
          </span>
          <IconAction
            icon={X}
            label={t("close")}
            size="palette"
            side="bottom"
            className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
            onClick={() => {
              engine.closePalette(id)
              engine.focusSurface()
            }}
          />
        </ContextMenu.Trigger>
        <ContextMenu.Portal container={portal}>
          <ContextMenu.Positioner className="z-50">
            <ContextMenu.Popup
              finalFocus={drawingFocus(engine)}
              className={MENU_AT_CURSOR}
            >
              <ContextMenu.Item
                className={MENU_ITEM}
                onClick={() => engine.closePalette(id)}
              >
                {t("close")}
              </ContextMenu.Item>
              <AllowDockingItem
                checked={place.allowDocking}
                // Docking disallowed, a docked palette floats where it was.
                onChange={(allowDocking) =>
                  setLayout(
                    placed(layout, id, {
                      allowDocking,
                      ...(!allowDocking && { docked: null }),
                    }),
                    true
                  )
                }
                Item={ContextMenu.CheckboxItem}
                Indicator={ContextMenu.CheckboxItemIndicator}
              />
            </ContextMenu.Popup>
          </ContextMenu.Positioner>
        </ContextMenu.Portal>
      </ContextMenu.Root>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <Content engine={engine} state={state} palette={id} />
      </div>
    </section>
  )
}

/**
 * A column's inner edge, AutoCAD's 4 px splitter, dragged (or stepped with
 * the arrow keys) to change the column's width.
 */
function Splitter({
  side,
  width,
  onResize,
  onCommit,
}: {
  side: DockSide
  width: number
  onResize: (width: number) => void
  /** `byPointer`: a drag's release, after which the drawing takes the keys. */
  onCommit: (width: number, byPointer: boolean) => void
}): ReactElement {
  const t = useEditorText("Palette")
  const rtl = useDirection() === "rtl"
  // A column grows moving its inner edge away from its side: the start
  // column towards the inline end, the end column towards the inline start.
  const grows = (dx: number) => (rtl ? -dx : dx) * (side === "start" ? 1 : -1)
  const drag = useRef<{ x: number; width: number; last: number } | null>(null)

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={t("resize")}
      aria-valuemin={DOCK_WIDTH.min}
      aria-valuemax={DOCK_WIDTH.max}
      aria-valuenow={width}
      tabIndex={0}
      onPointerDown={(event) => {
        if (event.button !== 0) return
        event.currentTarget.setPointerCapture(event.pointerId)
        drag.current = { x: event.clientX, width, last: width }
      }}
      onPointerMove={(event) => {
        const start = drag.current
        if (!start) return
        const next = clampDockWidth(
          start.width + grows(event.clientX - start.x)
        )
        if (next === start.last) return
        start.last = next
        onResize(next)
      }}
      onPointerUp={() => {
        const start = drag.current
        drag.current = null
        if (start && start.last !== start.width) onCommit(start.last, true)
      }}
      onPointerCancel={() => {
        drag.current = null
      }}
      onKeyDown={(event) => {
        const step = event.shiftKey ? 48 : 16
        const dx =
          event.key === "ArrowLeft"
            ? -step
            : event.key === "ArrowRight"
              ? step
              : 0
        if (dx === 0) return
        event.preventDefault()
        // The arrows move the edge where they point, as a drag would, and
        // keep the focus for the next step.
        const next = clampDockWidth(width + grows(dx))
        onResize(next)
        onCommit(next, false)
      }}
      className="w-1 shrink-0 cursor-col-resize bg-border outline-none hover:bg-active/40 focus-visible:bg-active/60"
    />
  )
}

/**
 * A palette's gesture in progress, over the whole page: it takes the
 * pointer (captured, so a drag past the window still ends), draws where a
 * release would dock the palette and AutoCAD's hint on the Ctrl key, and
 * during Move and Size from the menu takes the arrow keys, Enter and
 * Escape. WHY a modal dialog: the engine leaves such a one its keys, or
 * Escape would also cancel the command.
 */
export function PaletteDragOverlay(): ReactElement | null {
  const host = useContext(PaletteHostContext)
  const { layout, setLayout } = usePaletteLayout()
  const t = useEditorText("Palette")
  const rtl = useDirection() === "rtl"
  const overlay = useRef<HTMLDivElement>(null)
  const drag = host?.drag ?? null
  const dragging = drag !== null
  const pointerId = drag?.pointerId ?? null

  useLayoutEffect(() => {
    const element = overlay.current
    if (!element) return
    element.focus({ preventScroll: true })
    if (pointerId === null) return
    try {
      element.setPointerCapture(pointerId)
    } catch {
      // The pointer is gone: its next move, with no button, ends the gesture.
    }
  }, [dragging, pointerId])

  if (!host || !drag) return null
  const { engine } = host
  const area = host.area
  const place = layout.palettes[drag.id]

  /** The pointer's travel, the inline part towards the inline end. */
  const travel = (x: number, y: number, from: { x: number; y: number }) => ({
    inline: rtl ? from.x - x : x - from.x,
    dy: y - from.y,
  })

  /** Where a release at (x, y) docks the palette, the Ctrl key held or not. */
  const targetAt = (x: number, ctrl: boolean): DockSide | null => {
    const rect = host.areaElement?.getBoundingClientRect()
    if (!rect || place.allowDocking === ctrl) return null
    const left = x < rect.left + DOCK_REACH
    const right = x > rect.right - DOCK_REACH
    if (!left && !right) return null
    return left !== rtl ? "start" : "end"
  }

  const end = (commit: boolean) => {
    host.setDrag(null)
    if (commit) {
      if (drag.kind === "move" && drag.target) {
        const side = drag.target
        setLayout(
          {
            ...placed(layout, drag.id, { docked: side }),
            dock: {
              ...layout.dock,
              [side]: layout.dock[side] ?? clampDockWidth(place.width),
            },
          },
          true
        )
      } else setLayout(placed(layout, drag.id, drag.to), true)
    } else setLayout(drag.before, true)
    engine.focusSurface()
  }

  // Measured against the drawing as it is at each move: a palette floated
  // from its column widens it as the column goes.
  const moved = (x: number, y: number, ctrl: boolean) => {
    const rect = host.areaElement?.getBoundingClientRect()
    if (!rect) return
    const now = { width: rect.width, height: rect.height }
    if (drag.kind === "move") {
      const end = rtl ? x - rect.left : rect.right - x
      const top = y - rect.top
      const grab = drag.grab ?? {
        end: end - drag.to.end,
        top: top - drag.to.top,
      }
      const box = { ...drag.to, end: end - grab.end, top: top - grab.top }
      host.setDrag({
        ...drag,
        grab,
        to: { ...drag.to, ...at(fit(box, now)) },
        ctrl,
        pointer: { x, y },
        target: drag.pointerId !== null ? targetAt(x, ctrl) : null,
      })
      return
    }
    // Sized from the box as the pointer first found it, the arrows' steps in.
    const start = drag.start ?? { x, y }
    const from = drag.start ? drag.from : drag.to
    const { inline, dy } = travel(x, y, start)
    host.setDrag({
      ...drag,
      start,
      from,
      to: resized(from, drag.edges, inline, dy, now),
      ctrl,
      pointer: { x, y },
      target: null,
    })
  }

  const hint =
    drag.kind === "move" && drag.pointerId !== null && drag.pointer
      ? place.allowDocking
        ? drag.ctrl
          ? null
          : t("ctrlPrevents")
        : drag.ctrl
          ? t("releasePrevents")
          : t("ctrlAllows")
      : null

  const preview =
    drag.kind === "move" && drag.target && area
      ? (() => {
          const rect = host.areaElement?.getBoundingClientRect()
          if (!rect) return null
          const width = Math.min(
            area.width,
            layout.dock[drag.target] ?? clampDockWidth(place.width)
          )
          const left = (drag.target === "start") !== rtl
          return {
            left: left ? rect.left : rect.right - width,
            top: rect.top,
            width,
            height: rect.height,
          }
        })()
      : null

  return (
    <div
      ref={overlay}
      role="dialog"
      aria-modal="true"
      aria-label={drag.kind === "size" ? t("size") : t("move")}
      tabIndex={-1}
      onPointerMove={(event) => {
        // A flick released before the overlay held the pointer.
        if (drag.pointerId !== null && event.buttons === 0) end(true)
        else moved(event.clientX, event.clientY, event.ctrlKey)
      }}
      onPointerUp={() => {
        if (drag.pointerId !== null) end(true)
      }}
      onPointerDown={(event) => {
        // Move and Size from the menu end with a click.
        event.preventDefault()
        if (drag.pointerId === null) end(true)
      }}
      onPointerCancel={() => end(false)}
      onContextMenu={(event) => event.preventDefault()}
      onKeyDown={(event) => {
        event.stopPropagation()
        if (event.key === "Control" && drag.kind === "move" && drag.pointer) {
          moved(drag.pointer.x, drag.pointer.y, true)
          return
        }
        if (event.key === "Escape") {
          event.preventDefault()
          end(false)
          return
        }
        if (event.key === "Enter") {
          event.preventDefault()
          end(true)
          return
        }
        if (drag.pointerId !== null || !area) return
        const step = event.shiftKey ? 32 : 8
        const [dx, dy] =
          event.key === "ArrowLeft"
            ? [-step, 0]
            : event.key === "ArrowRight"
              ? [step, 0]
              : event.key === "ArrowUp"
                ? [0, -step]
                : event.key === "ArrowDown"
                  ? [0, step]
                  : [0, 0]
        if (dx === 0 && dy === 0) return
        event.preventDefault()
        const inline = rtl ? -dx : dx
        const box = {
          ...drag.to,
          end: drag.to.end - inline,
          top: drag.to.top + dy,
        }
        const to =
          drag.kind === "move"
            ? { ...drag.to, ...at(fit(box, area)) }
            : resized(drag.to, drag.edges, inline, dy, area)
        host.setDrag({ ...drag, to })
      }}
      onKeyUp={(event) => {
        if (event.key === "Control" && drag.kind === "move" && drag.pointer)
          moved(drag.pointer.x, drag.pointer.y, false)
      }}
      className={cn(
        "fixed inset-0 z-40 outline-none",
        drag.kind === "size" ? "cursor-nwse-resize" : "cursor-move"
      )}
    >
      {preview && (
        <div
          aria-hidden
          style={{
            left: preview.left,
            top: preview.top,
            width: preview.width,
            height: preview.height,
          }}
          className="fixed border-2 border-active bg-active/10"
        />
      )}
      {hint && drag.kind === "move" && drag.pointer && (
        <div
          style={{ left: drag.pointer.x + 16, top: drag.pointer.y + 20 }}
          className="fixed rounded-md border bg-popover px-2 py-1 whitespace-nowrap text-popover-foreground shadow-md"
        >
          {hint}
        </div>
      )}
    </div>
  )
}
