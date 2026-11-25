"use client"

import {
  createContext,
  Fragment,
  useContext,
  useEffect,
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
  ArrowLeftFromLine,
  ArrowRightToLine,
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
import { MENU_AT_CURSOR, MENU_ITEM, SEPARATOR } from "./snap-override-menu"
import { useEditorText } from "./editor-text"
import {
  anchoredAt,
  anchorSide,
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
 * end (plan §2.8; whether the bar changes side with where it floats is
 * unverified there, and it stayed on the right when the window was moved, so
 * here it stays at the inline end). Its edges size it. With auto-hide it
 * shrinks to its title bar, its whole height, on the edge it had, and opens
 * whole while the pointer is over it (or the keys are in it, or its menu is
 * open), folding as soon as it leaves.
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
  const { layout } = usePaletteLayout()
  const name = usePaletteName()(id)
  const [element, setElement] = useState<HTMLElement | null>(null)
  const hover = usePointerOver(element)
  const focus = useFocusHeld<true>(element)
  const focused = focus.held !== null
  const [menuOpen, setMenuOpen] = useState(false)
  const { drag, Content, engine, state } = host
  const place = layout.palettes[id]
  const gesture = drag && drag.id === id ? drag : null
  const shown = fit(gesture ? gesture.to : boxOf(place), area)
  const folded = place.autoHide && !hover && !focused && !menuOpen && !gesture

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
      ref={setElement}
      aria-label={name}
      onPointerDownCapture={() => host.raise(id)}
      onFocus={(event) => focus.hold(true, event)}
      style={{
        insetInlineEnd: shown.end,
        top: shown.top,
        width: folded ? undefined : shown.width,
        height: shown.height,
      }}
      className={cn(
        "pointer-events-auto absolute isolate flex rounded-sm border bg-card shadow-lg",
        // Opened over the others while the pointer is in it.
        place.autoHide && !folded && "z-10"
      )}
    >
      <div
        className={cn(
          "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden",
          folded && "hidden"
        )}
      >
        <Content engine={engine} state={state} palette={id} />
      </div>
      <VerticalTitleBar
        id={id}
        host={host}
        box={shown}
        at="end"
        border={!folded}
        press={{
          onPointerDown: (event) => begin(event, "move", NO_EDGES),
        }}
        onMenuOpenChange={setMenuOpen}
      />
      {!folded && (
        <SizeEdges onBegin={(event, edges) => begin(event, "size", edges)} />
      )}
    </section>
  )
}

/**
 * Whether the pointer is over `element`, by the DOM's own enter and leave.
 * WHY not React's: React counts a portalled popup — a menu, its backdrop, a
 * drop-down's list — as inside what rendered it, so a palette whose menu or
 * list closed over the drawing never heard the pointer leave, and stayed
 * open; and it never heard it come back from the menu.
 */
function usePointerOver(element: HTMLElement | null): boolean {
  const [over, setOver] = useState(false)
  useEffect(() => {
    if (!element) return
    const enter = () => setOver(true)
    const leave = () => setOver(false)
    element.addEventListener("pointerenter", enter)
    element.addEventListener("pointerleave", leave)
    return () => {
      element.removeEventListener("pointerenter", enter)
      element.removeEventListener("pointerleave", leave)
    }
  }, [element])
  return over
}

/**
 * Which part of a palette holds the focus, its portalled popups included:
 * * taken by React's `onFocus` (`hold`), let go by a focus that lands anywhere
 * else in the editor. WHY not `onBlur`: a menu or a drop-down's list that
 * closes is removed with the focus in it before the drawing is focused, and
 * no blur reports the focus leaving, so the palette stayed open.
 */
function useFocusHeld<T>(element: HTMLElement | null): {
  held: T | null
  hold: (value: T, event: React.FocusEvent) => void
  release: () => void
} {
  const [held, setHeld] = useState<T | null>(null)
  const claimed = useRef<Event | null>(null)
  const holding = held !== null
  useEffect(() => {
    const view = element?.ownerDocument.defaultView
    if (!view || !holding) return
    // WHY on the window: a focus bubbles there after React's own listener
    // (on its root, at most the document) has run this part's `onFocus`.
    // A listener before it, its update rendered in the microtask between
    // the two, unmounted the slid-out palette under a focus moving into it.
    const focusIn = (event: Event) => {
      if (event !== claimed.current) setHeld(null)
    }
    view.addEventListener("focusin", focusIn)
    return () => view.removeEventListener("focusin", focusIn)
  }, [element, holding])
  return {
    held,
    hold: (value, event) => {
      claimed.current = event.nativeEvent
      setHeld(value)
    },
    release: () => setHeld(null),
  }
}

/**
 * A palette's vertical title bar, at the side `at` of its content: Close,
 * Auto-hide, the properties menu, the name written upwards in capitals and
 * its icon at the foot, as AutoCAD's (plan §2.8; floating-left.png,
 * anchored-right-open.png). A press on the bar itself, not on a button, is
 * handed to `press`, which moves or floats the palette.
 */
function VerticalTitleBar({
  id,
  host,
  box,
  at,
  border = true,
  press,
  onMenuOpenChange,
}: {
  id: PaletteId
  host: PaletteHost
  box: Box
  at: "start" | "end"
  border?: boolean
  press: React.DOMAttributes<HTMLElement>
  onMenuOpenChange: (open: boolean) => void
}): ReactElement {
  const t = useEditorText("Palette")
  const name = usePaletteName()(id)
  const { engine } = host
  const Icon = ICONS[id]
  // The popups open over the drawing, away from the bar's side.
  const away = at === "end" ? "inline-start" : "inline-end"
  return (
    <div
      {...press}
      onPointerDown={(event) => {
        if (event.button !== 0 || !ownPress(event)) return
        press.onPointerDown?.(event)
      }}
      className={cn(
        "flex w-5.5 shrink-0 cursor-move touch-none flex-col items-center gap-0.5 bg-muted/40 py-0.5 select-none",
        border && (at === "end" ? "border-s" : "border-e")
      )}
    >
      <IconAction
        icon={X}
        label={t("close")}
        size="palette"
        side={away}
        onClick={() => {
          engine.closePalette(id)
          engine.focusSurface()
        }}
      />
      <AutoHideButton id={id} host={host} side={away} />
      <PaletteMenu
        id={id}
        host={host}
        box={box}
        side={away}
        onOpenChange={onMenuOpenChange}
      />
      <span className="min-h-0 flex-1 overflow-hidden pt-1 whitespace-nowrap text-muted-foreground uppercase [writing-mode:sideways-lr]">
        {name}
      </span>
      <Icon
        aria-hidden
        className="mb-1 size-4 shrink-0 text-muted-foreground"
      />
    </div>
  )
}

/**
 * The title bar's Auto-hide (adui26res.dll's string 14), lit while it is on:
 * floating, the palette folds to its title bar; docked, it anchors to its
 * side's strip; anchored, it docks again (plan §2.8).
 */
function AutoHideButton({
  id,
  host,
  side,
  className,
}: {
  id: PaletteId
  host: PaletteHost
  side: "inline-start" | "inline-end" | "bottom"
  className?: string
}): ReactElement {
  const t = useEditorText("Palette")
  const { layout, setLayout } = usePaletteLayout()
  const on = layout.palettes[id].autoHide
  return (
    <IconAction
      icon={on ? ArrowLeftFromLine : ArrowRightToLine}
      label={t("autoHideButton")}
      size="palette"
      side={side}
      active={on}
      mirrored
      className={className}
      onClick={() => {
        setLayout(placed(layout, id, { autoHide: !on }), true)
        host.engine.focusSurface()
      }}
    />
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

/** The sign each Anchor entry ends with, a physical side's in any direction. */
const ANCHOR_SIGN = { left: "<", right: ">" } as const

/**
 * The title bar's properties menu (adui26res.dll's PaletteOptionsMenu, plan
 * §2.8), as AutoCAD orders it: Move, Size, Close, Allow Docking | Anchor
 * Left, Anchor Right | Auto-hide. Transparency is not built
 * (docs/coverage/workspace.md). WHY no tooltip: its trigger opens a popup.
 */
function PaletteMenu({
  id,
  host,
  box,
  side,
  onOpenChange,
}: {
  id: PaletteId
  host: PaletteHost
  box: Box
  side: "inline-start" | "inline-end"
  onOpenChange: (open: boolean) => void
}): ReactElement {
  const t = useEditorText("Palette")
  const portal = usePortalContainer()
  const { layout, setLayout } = usePaletteLayout()
  const rtl = useDirection() === "rtl"
  const { engine } = host
  const place = layout.palettes[id]
  // Anchored, its place is the strip's: neither moved nor sized from here.
  const anchored =
    place.docked !== null && place.autoHide
      ? (place.docked === "start") !== rtl
        ? "left"
        : "right"
      : null
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
      onOpenChange={onOpenChange}
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
        <Menu.Positioner side={side} align="start" className="z-50">
          <Menu.Popup
            finalFocus={drawingFocus(engine)}
            className={MENU_AT_CURSOR}
          >
            <Menu.Item
              className={MENU_ITEM}
              disabled={anchored !== null}
              onClick={() => gesture("move", NO_EDGES)}
            >
              {t("move")}
            </Menu.Item>
            <Menu.Item
              className={MENU_ITEM}
              disabled={anchored !== null}
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
              // Docking disallowed, an anchored palette floats where it was.
              onChange={(allowDocking) =>
                setLayout(
                  placed(layout, id, {
                    allowDocking,
                    ...(!allowDocking && { docked: null }),
                  }),
                  true
                )
              }
              Item={Menu.CheckboxItem}
              Indicator={Menu.CheckboxItemIndicator}
            />
            <Menu.Separator className={SEPARATOR} />
            {(["left", "right"] as const).map((physical) => (
              <Menu.Item
                key={physical}
                className={MENU_ITEM}
                disabled={!place.allowDocking || anchored === physical}
                onClick={() =>
                  setLayout(
                    placed(layout, id, {
                      docked: anchorSide(physical, rtl),
                      autoHide: true,
                    }),
                    true
                  )
                }
              >
                {physical === "left" ? t("anchorLeft") : t("anchorRight")}
                <span dir="ltr" aria-hidden className="absolute inset-e-3">
                  {ANCHOR_SIGN[physical]}
                </span>
              </Menu.Item>
            ))}
            <Menu.Separator className={SEPARATOR} />
            <Menu.CheckboxItem
              checked={place.autoHide}
              closeOnClick
              onCheckedChange={(autoHide) =>
                setLayout(placed(layout, id, { autoHide }), true)
              }
              className={MENU_ITEM}
            >
              {t("autoHide")}
              <Menu.CheckboxItemIndicator className="absolute inset-e-2">
                <Check className="size-4 text-primary" />
              </Menu.CheckboxItemIndicator>
            </Menu.CheckboxItem>
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
  const floatOut = useFloatOut(id, host)
  const { engine, state, Content } = host
  const place = layout.palettes[id]

  return (
    <section
      aria-label={name}
      className="flex min-h-0 flex-1 flex-col border-b last:border-b-0"
    >
      <ContextMenu.Root>
        <ContextMenu.Trigger
          render={
            <div
              {...floatOut}
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
          <AutoHideButton
            id={id}
            host={host}
            side="bottom"
            className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
          />
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
 * A docked or anchored palette's title bar pressed and dragged past a few
 * pixels: it floats under the pointer, which keeps it by its title bar, and
 * is dragged on, so a release at a side docks it again. An anchored one
 * keeps its auto-hide, as a floating palette has it.
 */
function useFloatOut(
  id: PaletteId,
  host: PaletteHost
): Pick<
  React.HTMLAttributes<HTMLElement>,
  | "onPointerDown"
  | "onPointerMove"
  | "onPointerUp"
  | "onPointerCancel"
  | "onLostPointerCapture"
> {
  const { layout, setLayout } = usePaletteLayout()
  const rtl = useDirection() === "rtl"
  const press = useRef<{ x: number; y: number } | null>(null)
  const place = layout.palettes[id]
  const release = () => {
    press.current = null
  }

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

  return {
    onPointerDown: (event) => {
      if (event.button !== 0 || !ownPress(event)) return
      event.currentTarget.setPointerCapture(event.pointerId)
      press.current = { x: event.clientX, y: event.clientY }
    },
    onPointerMove: (event) => {
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
    },
    onPointerUp: release,
    onPointerCancel: release,
    onLostPointerCapture: release,
  }
}

/**
 * The strip of the palettes anchored at one side (plan §2.8,
 * anchored-right-strip.png): 25 px down the drawing's edge, each palette a
 * tab with its name written upwards. The pointer on a tab, or the keys,
 * slide its palette out over the drawing; it goes back as soon as the
 * pointer leaves both (or the keys, or Escape). How several tabs share the
 * strip is unverified (one was captured, filling it): here evenly.
 */
export function PaletteStrip({
  side,
}: {
  side: DockSide
}): ReactElement | null {
  const host = useContext(PaletteHostContext)
  const { layout } = usePaletteLayout()
  if (!host) return null
  const anchored = anchoredAt(layout, side, (id) =>
    paletteShows(host.state, id)
  )
  // WHY its tabs a component of their own: the strip going with its last
  // palette drops what the pointer and the keys held, which no leave or
  // blur reports once the strip is gone, so the next palette anchored there
  // does not slide out unasked.
  return anchored.length === 0 ? null : (
    <StripTabs side={side} host={host} anchored={anchored} />
  )
}

function StripTabs({
  side,
  host,
  anchored,
}: {
  side: DockSide
  host: PaletteHost
  anchored: readonly PaletteId[]
}): ReactElement {
  const name = usePaletteName()
  // The pointer over the strip or the palette slid out of it, by the DOM:
  // `hovered` says which tab it came in by.
  const [element, setElement] = useState<HTMLElement | null>(null)
  const over = usePointerOver(element)
  const [hovered, setHovered] = useState<PaletteId | null>(null)
  const focus = useFocusHeld<PaletteId>(element)
  const focused = focus.held
  const [menu, setMenu] = useState<PaletteId | null>(null)
  // A palette that left the strip under the pointer or with the keys in it
  // is let go, or it would slide out unasked when anchored here again.
  if (hovered !== null && !anchored.includes(hovered)) setHovered(null)
  if (focused !== null && !anchored.includes(focused)) focus.release()
  if (menu !== null && !anchored.includes(menu)) setMenu(null)
  const out =
    [menu, over ? hovered : null, focused].find(
      (id): id is PaletteId => id !== null && anchored.includes(id)
    ) ?? null

  return (
    <TooltipProvider>
      <div
        ref={setElement}
        onKeyDown={(event) => {
          // Its own keys, not a portalled menu's, which reach it through
          // React too; nor a field's, whose Escape puts its value back.
          const target = event.target as Element
          if (event.key !== "Escape" || out === null) return
          if (!event.currentTarget.contains(target)) return
          if (event.defaultPrevented || target.closest("input, textarea"))
            return
          event.stopPropagation()
          setHovered(null)
          focus.release()
          host.engine.focusSurface()
        }}
        className={cn(
          "flex min-h-0 min-w-0 flex-1 flex-col bg-muted/40",
          side === "start" ? "border-e" : "border-s"
        )}
      >
        {anchored.map((id) => (
          <Fragment key={id}>
            <button
              type="button"
              aria-expanded={out === id}
              onPointerEnter={() => setHovered(id)}
              onPointerMove={() => setHovered(id)}
              onFocus={(event) => focus.hold(id, event)}
              onClick={(event) => {
                // The pointer opened it; a click hands the keys back.
                if (event.detail > 0) host.engine.focusSurface()
              }}
              className={cn(
                // Never shorter than its name: the strip shares out what is left.
                "flex flex-1 items-center justify-center py-1 whitespace-nowrap text-muted-foreground outline-none [writing-mode:sideways-lr] hover:text-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-inset",
                out === id && "bg-card text-foreground"
              )}
            >
              {name(id)}
            </button>
            {out === id && (
              <SlidPalette
                id={id}
                host={host}
                side={side}
                // The keys in it hold it out, as the pointer does.
                onFocus={(event) => focus.hold(id, event)}
                onMenuOpenChange={(open) => setMenu(open ? id : null)}
              />
            )}
          </Fragment>
        ))}
      </div>
    </TooltipProvider>
  )
}

/**
 * An anchored palette slid out of its strip over the drawing: the drawing
 * area's whole height and its own width, its vertical title bar against the
 * strip (plan §2.8, anchored-right-open.png). Its title bar dragged floats
 * it.
 */
function SlidPalette({
  id,
  host,
  side,
  onFocus,
  onMenuOpenChange,
}: {
  id: PaletteId
  host: PaletteHost
  side: DockSide
  onFocus: (event: React.FocusEvent) => void
  onMenuOpenChange: (open: boolean) => void
}): ReactElement {
  const { layout } = usePaletteLayout()
  const name = usePaletteName()(id)
  const floatOut = useFloatOut(id, host)
  const { engine, state, Content } = host
  const place = layout.palettes[id]
  const width = Math.min(place.width, host.area?.width ?? place.width)
  const bar = (
    <VerticalTitleBar
      id={id}
      host={host}
      box={{ end: 0, top: 0, width, height: place.height }}
      at={side === "start" ? "start" : "end"}
      press={floatOut}
      onMenuOpenChange={onMenuOpenChange}
    />
  )
  return (
    <section
      aria-label={name}
      onFocus={onFocus}
      style={{ width }}
      className={cn(
        // Over the floating palettes; its strip stays under the command
        // line's lists, which open upwards over the drawing.
        "absolute inset-y-0 z-30 flex border bg-card shadow-lg",
        side === "start" ? "inset-s-full" : "inset-e-full"
      )}
    >
      {side === "start" && bar}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <Content engine={engine} state={state} palette={id} />
      </div>
      {side === "end" && bar}
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
        // Docked, as the preview showed, even if it floated auto-hidden:
        // anchoring is the menu's (whether AutoCAD's drag anchors an
        // auto-hidden palette is unverified, docs/coverage/workspace.md).
        setLayout(
          {
            ...placed(layout, drag.id, { docked: side, autoHide: false }),
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
