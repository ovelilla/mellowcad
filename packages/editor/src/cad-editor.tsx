"use client"

import {
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentType,
  type ReactElement,
  type ReactNode,
} from "react"

import {
  type CadEngine,
  createLocalStorageDrawingStore,
  PALETTES,
  type PaletteId,
  type DrawingStore,
  type EngineLocale,
} from "@mellowcad/engine"
import { CadCanvas, useEditorState } from "@mellowcad/react"
import { DirectionProvider } from "./ui/direction"
import { PortalContainerProvider } from "./ui/portal-container"
import { cn } from "./utils"
import { EDITOR_ROOT_ATTRIBUTE, EDITOR_THEME_STYLE } from "./editor-root"
import {
  applyPaletteColumns,
  NO_COLUMNS,
  paletteColumns,
  openAtLoad,
  PALETTE_LAYOUT,
  paletteLayoutAtLoad,
  rememberPalettes,
  type PaletteLayout,
} from "./palette-layout"
import { PaletteLayoutProvider } from "./palette-layout-context"
import { LayoutStorageProvider } from "./layout-storage-context"
import {
  FloatingPalettes,
  PaletteDock,
  PaletteDragOverlay,
  PaletteHostProvider,
  PaletteStrip,
  paletteShows,
  type PaletteProps,
} from "./palettes"
import { PaletteContent } from "./palette-content"
import {
  applyRibbonLayout,
  rememberRibbon,
  ribbonLayoutAtLoad,
  type RibbonLayout,
} from "./ribbon-layout"
import { RibbonLayoutProvider } from "./ribbon-layout-context"
import { CommandLine } from "./command-line"
import { Ribbon } from "./ribbon"
import { StatusBar, type StatusBarProps } from "./status-bar"
import { UnitsDialog } from "./units-dialog"
import { PointStyleDialog } from "./point-style-dialog"
import { TextStyleDialog } from "./text-style-dialog"
import { DimStyleDialog } from "./dim-style-dialog"
import { SaveAsDialog } from "./save-as-dialog"
import { LockedObjectsDialog } from "./locked-objects-dialog"
import { UnsavedTextDialog } from "./unsaved-text-dialog"
import { DynamicInput } from "./dynamic-input"
import { RolloverTooltip } from "./rollover-tooltip"
import { ViewCube } from "./view-cube"
import { NavigationBar } from "./navigation-bar"
import { ViewportControls } from "./viewport-controls"
import { type LanguageLink, TitleBar, type TitleBarProps } from "./title-bar"
import { ShortcutMenu } from "./shortcut-menu"
import { SnapOverrideMenu } from "./snap-override-menu"
import { SelectionCyclingList } from "./selection-cycling-list"
import { EditorTextProvider, useEditorText } from "./editor-text"
import type { EditorLocale } from "./locales/types"
import type { PieceProps } from "./piece"

/**
 * The localStorage keys this device's layout is kept under, each part's own;
 * a part with no key is not remembered. A key is the host's promise to its
 * users: renaming it orphans what they saved.
 */
export interface LayoutStorage {
  /**
   * Where each palette shows (floating, docked or anchored), its size, the
   * columns' widths and which palettes were open, also read by the `<head>`
   * script.
   */
  readonly palette?: string
  /** The status bar's Customization. */
  readonly statusBar?: string
  /** The Properties palette's folded categories, per object type. */
  readonly properties?: string
  /**
   * The ribbon's minimize state and what its button does, also read by the
   * `<head>` script, and the tabs, panels and titles its right-click menu
   * shows.
   */
  readonly ribbon?: string
  /** The Quick Access Toolbar's commands, as its Customize ▾ leaves them. */
  readonly quickAccess?: string
}

/**
 * What names the canvas cell for a host's view transition into the editor:
 * the element's id (for `<link rel="expect">`) and its `view-transition-name`.
 */
export interface SheetTransition {
  readonly id: string
  readonly name: string
}

/**
 * Where F1 opens help, as AutoCAD's does: `command` while one runs, its
 * `{command}` replaced by the command's global name in lower case, and
 * `index` with none. Strings, so a server page can hand them over.
 */
export interface HelpLinks {
  readonly index: string
  readonly command: string
  /**
   * The commands with a help page of their own, by global name in lower case
   * (`offset`): F1 opens that page rather than `command`'s.
   */
  readonly commands?: Readonly<Record<string, string>>
}

/** The page F1 opens for `command`, the running command's global name, or for none. */
export function helpUrl(help: HelpLinks, command: string | null): string {
  if (command === null) return help.index
  const name = command.toLowerCase()
  return (
    (Object.hasOwn(help.commands ?? {}, name)
      ? help.commands?.[name]
      : undefined) ??
    help.command.replace("{command}", encodeURIComponent(name))
  )
}

/**
 * The pieces a host may replace with its own component, each by its default's
 * name, or turn off with `null`: its zone goes with it and the canvas takes
 * the room. A replacement is handed what the default is (`PieceProps`, and
 * the host's props for the title bar and the status bar) and renders inside the
 * editor's root, where its tokens, catalog and popups' container reach it;
 * its classes are the host's to compile. The menus and dialogs the engine
 * opens are not pieces: the engine waits on their answer.
 */
export interface CadEditorComponents {
  readonly TitleBar?: ComponentType<TitleBarProps> | null
  readonly Ribbon?: ComponentType<PieceProps> | null
  /**
   * What each palette holds, handed which one (`palette`); its frame is the
   * editor's. `null` turns the palettes off, their columns too.
   */
  readonly PaletteContent?: ComponentType<PaletteProps> | null
  readonly CommandLine?: ComponentType<PieceProps> | null
  readonly StatusBar?: ComponentType<StatusBarProps> | null
  readonly ViewportControls?: ComponentType<PieceProps> | null
  readonly ViewCube?: ComponentType<PieceProps> | null
  readonly NavigationBar?: ComponentType<PieceProps> | null
  readonly DynamicInput?: ComponentType<PieceProps> | null
}

export interface CadEditorProps {
  /** The page language's catalog for the engine; English when absent. */
  engineLocale?: EngineLocale
  /** The page language's catalog for the editor's own words; English when absent. */
  editorLocale?: EditorLocale
  /** The page's direction: the shell mirrors in `rtl`, the drawing never. */
  dir?: "ltr" | "rtl"
  /** The host's product mark, the application menu's glyph. */
  mark?: ReactNode
  /** The page in each language the host offers, for the application menu. */
  languages?: readonly LanguageLink[]
  /** Where this device's layout is kept; nothing is, without it. */
  layoutStorage?: LayoutStorage
  /** The canvas cell's name for a page that transitions into it. */
  sheet?: SheetTransition
  /**
   * Where F1 and the title bar's Help open help; without it F1 is the
   * browser's and the title bar has no Help button.
   */
  help?: HelpLinks
  /**
   * The page the title bar's Help list's Send Feedback opens, in a tab of its
   * own: where the host's users report a problem. Without it, no Send Feedback.
   */
  feedback?: string
  /** The pieces the host replaces or turns off; the rest are the editor's. */
  components?: CadEditorComponents
  /**
   * Makes the store the drawing is restored from when the editor starts and
   * autosaved to after every change; `null` from it keeps nothing. Called
   * once, when the engine is built. Without it, this browser's
   * `localStorage` (`createLocalStorageDrawingStore`), whose one key every
   * page of the site that keeps the default shares.
   */
  store?: () => DrawingStore | null
  /**
   * Handed the engine once it is built, and `null` once it is disposed, for
   * the host's own code to save, open or run commands with. Read once, like
   * `store`.
   */
  onEngine?: (engine: CadEngine | null) => void
}

/**
 * The editor's docked workspace: a grid of named areas round the canvas, which
 * takes what is left. The engine resizes its drawing with the canvas, so ZOOM
 * Extents frames the drawing area; nothing but what AutoCAD puts there sits
 * on the drawing: the viewport controls, the ViewCube with the navigation
 * bar, the command line, the dynamic input, the floating palettes and the
 * menus at the cursor.
 */
export function CadEditor({
  editorLocale,
  dir = "ltr",
  ...props
}: CadEditorProps): ReactElement {
  // The editor marks its own root and tells Base UI its direction: it never
  // writes on the host's <html> or <body>.
  return (
    <DirectionProvider direction={dir}>
      <EditorTextProvider locale={editorLocale}>
        <Workspace {...props} lang={editorLocale?.tag ?? "en"} dir={dir} />
      </EditorTextProvider>
    </DirectionProvider>
  )
}

function Workspace({
  engineLocale,
  mark,
  languages,
  layoutStorage = {},
  sheet,
  help,
  feedback,
  components = {},
  store = createLocalStorageDrawingStore,
  onEngine,
  lang,
  dir,
}: Omit<CadEditorProps, "editorLocale" | "dir"> & {
  lang: string
  dir: "ltr" | "rtl"
}) {
  const paletteKey = layoutStorage.palette
  const ribbonKey = layoutStorage.ribbon
  const [engine, setEngine] = useState<CadEngine | null>(null)
  const state = useEditorState(engine)
  const t = useEditorText("Workspace")
  const [portal, setPortal] = useState<HTMLDivElement | null>(null)
  const root = useRef<HTMLDivElement>(null)
  const ready = engine && state
  // Where each palette shows, as the head script read it. Nothing renders a
  // palette before the engine exists, so the server's default never meets
  // the client's.
  const [paletteLayout, setPaletteLayout] = useState<PaletteLayout>(() =>
    typeof window === "undefined"
      ? PALETTE_LAYOUT
      : paletteLayoutAtLoad(paletteKey)
  )
  const palettesOff = components.PaletteContent === null

  // The ribbon's minimize state, as the head script laid it out.
  const [ribbonLayout, setRibbonLayout] = useState<RibbonLayout>(() =>
    typeof window === "undefined"
      ? ribbonLayoutAtLoad(undefined)
      : ribbonLayoutAtLoad(ribbonKey)
  )

  // The ribbon's zone takes its height before the frame is painted.
  useLayoutEffect(() => {
    if (root.current) applyRibbonLayout(root.current, ribbonLayout)
  }, [ribbonLayout])

  // Each column's and strip's width, before the frame is painted: what the
  // head script wrote, again, for a root rendered on the client, then the
  // engine's open palettes and Clean Screen with the dragged widths.
  const palettes = state?.palettes
  const cleanScreen = state?.cleanScreen
  useLayoutEffect(() => {
    if (!root.current) return
    const shows =
      palettes && cleanScreen
        ? (id: PaletteId) => paletteShows({ palettes, cleanScreen }, id)
        : (id: PaletteId) => paletteLayout.palettes[id].open
    applyPaletteColumns(
      root.current,
      palettesOff ? NO_COLUMNS : paletteColumns(paletteLayout, shows)
    )
  }, [paletteLayout, palettes, cleanScreen, palettesOff])

  // Which palettes are open is the engine's; it is kept with the layout, so
  // the next visit opens them again, as AutoCAD reopens its palettes.
  const keep = (layout: PaletteLayout) =>
    rememberPalettes(
      paletteKey,
      palettes
        ? {
            ...layout,
            palettes: Object.fromEntries(
              PALETTES.map((id) => [
                id,
                { ...layout.palettes[id], open: palettes[id] },
              ])
            ) as PaletteLayout["palettes"],
          }
        : layout
    )
  // An effect event, as a move or a resize keeps itself: only the open
  // palettes changing is kept here.
  const keepOpen = useEffectEvent(() => keep(paletteLayout))
  const firstPalettes = useRef<typeof palettes | null>(null)
  useEffect(() => {
    if (!palettes) return
    if (firstPalettes.current === null) firstPalettes.current = palettes
    else keepOpen()
  }, [palettes])

  // Every zone has its size before the engine mounts, so the canvas's box at
  // the first paint is already the final one: the landing's sheet grows into
  // it, and the first view is centred in it. The grid follows the page's
  // direction: in a right-to-left page the palettes are on the left.
  //
  // The frame is AutoCAD's, top to bottom (docs/plans/autocad-ui.md, §2.1):
  // the title bar, 32; the ribbon, 124 (its tab row and its panels); the
  // drawing with the palettes, the command line floating over its foot; the
  // bottom row, 33. The title bar, the ribbon and the bottom row take
  // AutoCAD's sizes; the rest, the editor's system of 28 px controls
  // (.claude/rules/ui.md, "Size"). Each zone sizes its content (`box-content`)
  // and its border lies outside it, or the border eats a pixel and every
  // control lands on a half pixel, which blurs its icon.
  //
  // The editor is the page's main content: a landmark, so every control on
  // it sits in one (axe's region rule). The head script writes the docked
  // columns' and the anchored strips' widths on the root before React
  // hydrates (palette-layout.ts): the DOM wins. A strip lies outside its
  // side's column, at the frame's edge.
  return (
    <div
      ref={root}
      suppressHydrationWarning
      {...{ [EDITOR_ROOT_ATTRIBUTE]: "" }}
      lang={lang}
      dir={dir}
      style={EDITOR_THEME_STYLE as React.CSSProperties}
    >
      <PortalContainerProvider container={portal}>
        <RibbonLayoutProvider
          value={{
            layout: ribbonLayout,
            setLayout: (layout) => {
              setRibbonLayout(layout)
              rememberRibbon(ribbonKey, layout)
            },
          }}
        >
          <PaletteLayoutProvider
            value={{
              layout: paletteLayout,
              setLayout: (layout, remember = false) => {
                setPaletteLayout(layout)
                if (remember) keep(layout)
              },
            }}
          >
            <LayoutStorageProvider value={layoutStorage}>
              <main className="grid h-svh w-full grid-cols-[var(--palette-strip-start,0px)_var(--palette-dock-start,0px)_minmax(0,1fr)_var(--palette-dock-end,0px)_var(--palette-strip-end,0px)] grid-rows-[auto_auto_minmax(0,1fr)_auto] overflow-hidden bg-card [grid-template-areas:'title_title_title_title_title'_'ribbon_ribbon_ribbon_ribbon_ribbon'_'stripStart_dockStart_canvas_dockEnd_stripEnd'_'status_status_status_status_status']">
                <EditorZones
                  components={components}
                  ready={ready ? { engine, state } : null}
                  mark={mark}
                  languages={languages}
                  help={help !== undefined}
                  feedback={feedback}
                  statusBarKey={layoutStorage.statusBar}
                  sheet={sheet}
                  canvas={
                    // The editor is the page: it takes every key, which the engine
                    // leaves to whoever asks. The drawing is geometry: it never
                    // mirrors, whatever the page.
                    <CadCanvas
                      store={store}
                      scope="document"
                      locale={engineLocale}
                      palettes={() =>
                        openAtLoad(paletteLayoutAtLoad(paletteKey))
                      }
                      // AutoCAD opens its help in a browser: here, a tab of its own.
                      onHelp={
                        help &&
                        ((command) => {
                          window.open(
                            helpUrl(help, command),
                            "_blank",
                            "noopener"
                          )
                        })
                      }
                      onEngine={(next) => {
                        setEngine(next)
                        onEngine?.(next)
                      }}
                      dir="ltr"
                      className="absolute inset-0 h-full w-full touch-none outline-none"
                      aria-label={t("canvas")}
                    />
                  }
                />

                {ready && (
                  <>
                    <ShortcutMenu engine={engine} state={state} />
                    <SnapOverrideMenu engine={engine} state={state} />
                    <SelectionCyclingList engine={engine} state={state} />
                    <UnitsDialog engine={engine} state={state} />
                    <PointStyleDialog engine={engine} state={state} />
                    <TextStyleDialog engine={engine} state={state} />
                    <DimStyleDialog engine={engine} state={state} />
                    <SaveAsDialog engine={engine} state={state} />
                    <LockedObjectsDialog engine={engine} state={state} />
                    <UnsavedTextDialog engine={engine} state={state} />
                  </>
                )}
              </main>
            </LayoutStorageProvider>
          </PaletteLayoutProvider>
        </RibbonLayoutProvider>
      </PortalContainerProvider>
      {/* The popups mount here, inside the root, so its tokens, `dir` and
          `lang` reach them. Like the <body> they mounted in before, it comes after the
          workspace and is not positioned, so each popup's z-50 stacks over the
          canvas, the dynamic input and the ViewCube, and nothing clips it. */}
      <div ref={setPortal} />
    </div>
  )
}

/**
 * The zones of the grid, each holding its piece once the engine exists, and
 * the canvas cell with what sits on the drawing. A piece turned off takes its
 * zone with it, from the first paint.
 *
 * @internal Its own component so a test can hand it an engine: the server
 * renderer never runs the effect that builds one.
 */
export function EditorZones({
  components,
  ready,
  mark,
  languages,
  help,
  feedback,
  statusBarKey,
  sheet,
  canvas,
}: {
  components: CadEditorComponents
  ready: PieceProps | null
  mark?: ReactNode
  languages?: readonly LanguageLink[]
  help?: boolean
  feedback?: string
  statusBarKey?: string
  sheet?: SheetTransition
  canvas: ReactNode
}): ReactElement {
  const {
    TitleBar: Title = TitleBar,
    Ribbon: Tabs = Ribbon,
    PaletteContent: Content = PaletteContent,
    CommandLine: Command = CommandLine,
    StatusBar: Status = StatusBar,
    ViewportControls: Viewport = ViewportControls,
    ViewCube: Cube = ViewCube,
    NavigationBar: Navigation = NavigationBar,
    DynamicInput: Input = DynamicInput,
  } = components
  // Clean Screen hides the palettes (one opened meanwhile shows) and closes
  // the ribbon; it is not on at the first paint, as AutoCAD does not save it.
  const ribbon = ready?.state.ribbon

  // A column of docked palettes at the drawing's side: its width is CSS,
  // read off the root (palette-layout.ts), the head script's before the
  // engine exists, the open palettes' after — the same box either way.
  const dock = (side: "start" | "end") =>
    Content && (
      <div
        className={cn(
          "flex min-h-0 min-w-0 overflow-hidden",
          side === "start" ? "[grid-area:dockStart]" : "[grid-area:dockEnd]"
        )}
      >
        {ready && <PaletteDock side={side} />}
      </div>
    )

  // The strip of the palettes anchored at that side, outside its column. WHY
  // not clipped, and no stacking context of its own: the palette a tab
  // slides out lies over the drawing, the floating palettes and the command
  // line.
  const strip = (side: "start" | "end") =>
    Content && (
      <div
        className={cn(
          "relative flex min-h-0 min-w-0",
          side === "start" ? "[grid-area:stripStart]" : "[grid-area:stripEnd]"
        )}
      >
        {ready && <PaletteStrip side={side} />}
      </div>
    )

  return (
    <PaletteHostProvider ready={ready} Content={Content ?? null}>
      {/* AutoCAD's title bar: the application button flush at the start,
      as the window's own frame has it, and the Quick Access Toolbar. */}
      {Title && (
        <div className="relative box-content flex h-8 min-w-0 items-center gap-1 border-b [grid-area:title]">
          {ready && (
            <Title
              {...ready}
              mark={mark}
              languages={languages}
              help={help}
              feedback={feedback}
            />
          )}
        </div>
      )}

      {/* The ribbon, its tab row (24) and its panels (100), shown from the
      first paint as AutoCAD starts with it, or minimized as this device left
      it — to panel buttons (86), panel titles (45) or the tabs (24): the head
      script's `data-ribbon` (ribbon-layout.ts) —; RIBBONCLOSE and Clean
      Screen take it away, whatever its state. WHY its piece goes with it, not only hidden: what it has
      open over the drawing is portalled out of the zone — a slide-out pinned
      open, a list, Insert's gallery — and would stay there, anchored to
      nothing. */}
      {Tabs && (
        <div
          className={cn(
            "box-content flex h-31 min-w-0 flex-col border-b [grid-area:ribbon] ribbon-buttons:h-21.5 ribbon-titles:h-11.25 ribbon-tabs:h-6",
            ribbon?.open === false && "hidden"
          )}
        >
          {ready && ready.state.ribbon.open && <Tabs {...ready} />}
        </div>
      )}

      {/* Whatever is placed in the canvas's pixels — the dynamic input and its
      option chips, the rollover tooltip — is positioned in this cell, which is exactly the
      canvas's box; the menus at the cursor convert to the viewport
      (`engine.clientFromScreen`). */}
      {strip("start")}
      {dock("start")}

      <div
        id={sheet?.id}
        className="relative min-h-0 min-w-0 bg-[#0b0f14] [grid-area:canvas]"
        style={sheet && { viewTransitionName: sheet.name }}
      >
        {canvas}

        {ready && (
          <>
            {Input && <Input {...ready} />}
            <RolloverTooltip state={ready.state} />

            {/* WHY inset-s and inset-e: no AutoCAD reads right to left, and
            in a page that does the viewport controls and the ViewCube
            swap corners with the shell; the cube itself never mirrors. */}
            {Viewport && (
              // Only the labels take the pointer: while a command runs they
              // give it up, and the click under them is the command's.
              <div className="pointer-events-none absolute inset-s-1 top-1 z-10">
                <Viewport {...ready} />
              </div>
            )}

            {/* The ViewCube keeps AutoCAD's corner of the drawing
            (NAVVCUBELOCATION 0), the navigation bar linked under it. */}
            {(Cube || Navigation) && (
              <div className="pointer-events-none absolute inset-e-4 top-4 z-10 flex flex-col items-center gap-2">
                {Cube && <Cube {...ready} />}
                {Navigation && <Navigation {...ready} />}
              </div>
            )}

            {Content && <FloatingPalettes />}

            {/* The command window floats over the drawing's foot, as wide
            as the drawing (§2.6): the canvas keeps its whole box, as
            AutoCAD's drawing area runs under it (§2.1). Under the floating
            palettes (z-20), which the drawing area holds whole, their
            edges and title bars within reach. */}
            {Command && (
              <div className="absolute inset-x-0 bottom-0 z-15">
                <Command {...ready} />
              </div>
            )}
          </>
        )}
      </div>

      {dock("end")}
      {strip("end")}

      {/* AutoCAD's bottom row, 33 (§2.1): its layout tabs at the start, not
      drawn (no layouts here), and the status bar laid from its end. */}
      {Status && (
        <div className="box-content flex h-8 min-w-0 items-center border-t px-0.5 [grid-area:status]">
          {ready && <Status {...ready} storageKey={statusBarKey} />}
        </div>
      )}

      {Content && <PaletteDragOverlay />}
    </PaletteHostProvider>
  )
}
