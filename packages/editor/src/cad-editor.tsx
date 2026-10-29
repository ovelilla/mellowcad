"use client"

import {
  useEffect,
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
  type EngineLocale,
} from "@mellowcad/engine"
import { CadCanvas, useEditorState } from "@mellowcad/react"
import { DirectionProvider } from "./ui/direction"
import { PortalContainerProvider } from "./ui/portal-container"
import { cn } from "./utils"
import { EDITOR_ROOT_ATTRIBUTE, EDITOR_THEME_STYLE } from "./editor-root"
import {
  applyPaletteLayout,
  paletteLayoutAtLoad,
  PALETTE_WIDTH,
  rememberPalette,
} from "./palette-layout"
import { CommandLine } from "./command-line"
import { ToolRail } from "./tool-rail"
import { StatusBar, type StatusBarProps } from "./status-bar"
import { UnitsDialog } from "./units-dialog"
import { LockedObjectsDialog } from "./locked-objects-dialog"
import { UnsavedTextDialog } from "./unsaved-text-dialog"
import { DynamicInput } from "./dynamic-input"
import { RolloverTooltip } from "./rollover-tooltip"
import { PalettePanel, PaletteResizeHandle } from "./palette-panel"
import { ViewCube } from "./view-cube"
import { NavigationBar } from "./navigation-bar"
import { ViewportControls } from "./viewport-controls"
import { type LanguageLink, TopBar, type TopBarProps } from "./top-bar"
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
  /** The palette panel's width and fold, also read by the `<head>` script. */
  readonly palette?: string
  /** The status bar's Customization. */
  readonly statusBar?: string
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
 * The pieces a host may replace with its own component, each by its default's
 * name, or turn off with `null`: its zone goes with it and the canvas takes
 * the room. A replacement is handed what the default is (`PieceProps`, and
 * the host's props for the top bar and the status bar) and renders inside the
 * editor's root, where its tokens, catalog and popups' container reach it;
 * its classes are the host's to compile. The menus and dialogs the engine
 * opens are not pieces: the engine waits on their answer.
 */
export interface CadEditorComponents {
  readonly TopBar?: ComponentType<TopBarProps> | null
  readonly ToolRail?: ComponentType<PieceProps> | null
  readonly PalettePanel?: ComponentType<PieceProps> | null
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
  /** The pieces the host replaces or turns off; the rest are the editor's. */
  components?: CadEditorComponents
}

/**
 * The editor's docked workspace: a grid of named areas round the canvas, which
 * takes what is left. The engine resizes its drawing with the canvas, so ZOOM
 * Extents frames what is visible; nothing but the viewport controls, the
 * ViewCube with the navigation bar, the dynamic input and the menus at the
 * cursor sits on the drawing.
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
  components = {},
  lang,
  dir,
}: Omit<CadEditorProps, "editorLocale" | "dir"> & {
  lang: string
  dir: "ltr" | "rtl"
}) {
  const paletteKey = layoutStorage.palette
  const [engine, setEngine] = useState<CadEngine | null>(null)
  const state = useEditorState(engine)
  const t = useEditorText("Workspace")
  const [portal, setPortal] = useState<HTMLDivElement | null>(null)
  const root = useRef<HTMLDivElement>(null)
  const ready = engine && state
  const paletteOpen = state?.palette.open ?? null
  // The width the head script laid out. Nothing renders it before the engine
  // exists, so the server's default never meets the client's.
  const [paletteWidth, setPaletteWidth] = useState(() =>
    typeof window === "undefined"
      ? PALETTE_WIDTH.initial
      : paletteLayoutAtLoad(paletteKey).width
  )

  // What the head script wrote, again: a root rendered on the client never
  // met the script.
  useLayoutEffect(() => {
    if (root.current)
      applyPaletteLayout(root.current, paletteLayoutAtLoad(paletteKey))
  }, [paletteKey])

  // From then on the engine's open state and the dragged width drive the
  // same CSS, before the frame is painted.
  useLayoutEffect(() => {
    if (paletteOpen === null || !root.current) return
    applyPaletteLayout(root.current, { open: paletteOpen, width: paletteWidth })
  }, [paletteOpen, paletteWidth])

  // The fold is remembered once it changes, so until the user folds or
  // opens the panel the window's width decides.
  const firstOpen = useRef<boolean | null>(null)
  useEffect(() => {
    if (paletteOpen === null) return
    if (firstOpen.current === null) firstOpen.current = paletteOpen
    else rememberPalette(paletteKey, { open: paletteOpen })
  }, [paletteOpen, paletteKey])

  // Every zone has its size before the engine mounts, so the canvas's box at
  // the first paint is already the final one: the landing's sheet grows into
  // it, and the first view is centred in it. The grid follows the page's
  // direction: in a right-to-left page the tools are on the right and the
  // palettes on the left.
  //
  // The sizes are one system (.claude/rules/ui.md, "Size"): every control is
  // 28 px; a bar of them, 36 — the control and 4 px either side —, the command
  // line among them; the tool palette, two columns of 28, 2 px apart. Each
  // zone sizes its content (`box-content`) and its border lies outside it, or
  // the border eats a pixel and every control lands on a half pixel, which
  // blurs its icon.
  //
  // The editor is the page's main content: a landmark, so every control on
  // it sits in one (axe's region rule). The head script writes the palette's
  // layout on the root before React hydrates (lib/palette-layout.ts): the
  // DOM wins.
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
        <main className="grid h-svh w-full grid-cols-[auto_minmax(0,1fr)_auto] grid-rows-[auto_minmax(0,1fr)_auto_auto] overflow-hidden bg-card [grid-template-areas:'top_top_top'_'tools_canvas_panel'_'command_command_command'_'status_status_status']">
          <EditorZones
            components={components}
            ready={ready ? { engine, state } : null}
            mark={mark}
            languages={languages}
            statusBarKey={layoutStorage.statusBar}
            sheet={sheet}
            canvas={
              // The editor is the page: it keeps this device's drawing and
              // takes every key, which the engine leaves to whoever asks. The
              // drawing is geometry: it never mirrors, whatever the page.
              <CadCanvas
                store={createLocalStorageDrawingStore}
                scope="document"
                locale={engineLocale}
                paletteOpen={() => paletteLayoutAtLoad(paletteKey).open}
                onEngine={setEngine}
                dir="ltr"
                className="absolute inset-0 h-full w-full touch-none outline-none"
                aria-label={t("canvas")}
              />
            }
            paletteHandle={
              state?.palette.open && (
                <PaletteResizeHandle
                  width={paletteWidth}
                  onResize={setPaletteWidth}
                  onCommit={(width) => rememberPalette(paletteKey, { width })}
                />
              )
            }
          />

          {ready && (
            <>
              <ShortcutMenu engine={engine} state={state} />
              <SnapOverrideMenu engine={engine} state={state} />
              <SelectionCyclingList engine={engine} state={state} />
              <UnitsDialog engine={engine} state={state} />
              <LockedObjectsDialog engine={engine} state={state} />
              <UnsavedTextDialog engine={engine} state={state} />
            </>
          )}
        </main>
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
  statusBarKey,
  sheet,
  canvas,
  paletteHandle,
}: {
  components: CadEditorComponents
  ready: PieceProps | null
  mark?: ReactNode
  languages?: readonly LanguageLink[]
  statusBarKey?: string
  sheet?: SheetTransition
  canvas: ReactNode
  paletteHandle: ReactNode
}): ReactElement {
  const {
    TopBar: Top = TopBar,
    ToolRail: Tools = ToolRail,
    PalettePanel: Palettes = PalettePanel,
    CommandLine: Command = CommandLine,
    StatusBar: Status = StatusBar,
    ViewportControls: Viewport = ViewportControls,
    ViewCube: Cube = ViewCube,
    NavigationBar: Navigation = NavigationBar,
    DynamicInput: Input = DynamicInput,
  } = components
  // Clean Screen hides the tool palette and the palette panel (a palette
  // opened meanwhile shows the panel again); it is never on at the first
  // paint, as AutoCAD does not save it.
  const clean = ready?.state.cleanScreen
  const commandLine = ready?.state.commandLine

  return (
    <>
      {Top && (
        <div className="box-content flex h-9 min-w-0 items-center gap-1 border-b px-1 [grid-area:top]">
          {ready && <Top {...ready} mark={mark} languages={languages} />}
        </div>
      )}

      {Tools && (
        <div
          className={cn(
            "box-content flex min-h-0 w-14.5 flex-col border-e p-1 [grid-area:tools]",
            clean?.active && "hidden"
          )}
        >
          {ready && <Tools {...ready} />}
        </div>
      )}

      {/* Whatever is placed in the canvas's pixels — the dynamic input and its
      option chips, the rollover tooltip — is positioned in this cell, which is exactly the
      canvas's box; the menus at the cursor convert to the viewport
      (`engine.clientFromScreen`). */}
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
              <div className="absolute inset-s-1 top-1 z-10">
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
          </>
        )}
      </div>

      {/* Its width is CSS, read off the root (lib/palette-layout.ts): the
      head script's answer before the engine exists, the engine's open
      state and the dragged width after — the same box either way. */}
      {Palettes && (
        <div
          className={cn(
            "box-content flex min-h-0 w-9 border-s [grid-area:panel] palette-open:w-(--palette-width)",
            clean?.active && !clean.palette && "hidden"
          )}
        >
          {ready && (
            <>
              {paletteHandle}
              <Palettes {...ready} />
            </>
          )}
        </div>
      )}

      {/* One prompt line. Above the canvas in the stacking order: its
      history and suggestions open upwards over the drawing. */}
      {Command && (
        <div
          className={cn(
            "relative z-10 [grid-area:command]",
            (!commandLine || commandLine.visible || commandLine.buffer) &&
              "box-content h-9 border-t"
          )}
        >
          {ready && <Command {...ready} />}
        </div>
      )}

      {Status && (
        <div className="box-content flex h-9 min-w-0 items-center gap-2 border-t px-1 [grid-area:status]">
          {ready && <Status {...ready} storageKey={statusBarKey} />}
        </div>
      )}
    </>
  )
}
