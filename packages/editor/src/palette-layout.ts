import { PALETTES, type PaletteId } from "@mellowcad/engine"

import { EDITOR_ROOT_ATTRIBUTE } from "./editor-root"

/**
 * Where each palette shows, kept on the device as AutoCAD keeps it in the
 * profile, and decided before the first paint (docs/plans/autocad-ui.md,
 * §2.8): floating over the drawing, or docked in a column at either side.
 *
 * A docked palette takes its column's width off the drawing, so the canvas's
 * box depends on what this device remembers. Every zone of the editor has its
 * size in CSS before the engine mounts, so the canvas is born with its final
 * box: the landing's sheet grows into it and the first view is centred in it.
 * So an inline script in the layout's `<head>` ({@link paletteLayoutScript})
 * reads the layout before the body is parsed and writes each column's width
 * on the editor's root as the parser inserts it (`--palette-dock-start`,
 * `--palette-dock-end`), which the grid reads; the workspace then hands the
 * engine the palettes that were open ({@link paletteLayoutAtLoad}), so the
 * two never disagree. Floating palettes take nothing off the drawing.
 *
 * Kept under the host's key (`layoutStorage.palette`); with none, nothing is
 * remembered, every palette starts closed and floating, and no script is
 * needed.
 */

/** A column at the drawing's inline start or end: mirrored right to left. */
export type DockSide = "start" | "end"

export const DOCK_SIDES: readonly DockSide[] = ["start", "end"]

/** One palette's place. */
export interface PalettePlace {
  /** Open when the page was left, to open it again (AutoCAD's profile). */
  readonly open: boolean
  /** The column it is docked in, or `null`: floating. */
  readonly docked: DockSide | null
  /** The properties menu's Allow Docking: a drag docks it at a side. */
  readonly allowDocking: boolean
  /** Floating, its outer edge's distance from the drawing's inline end, px. */
  readonly end: number
  /** Floating, its top's distance from the drawing's top, px. */
  readonly top: number
  /** Floating, its size, px; it shrinks to fit a smaller drawing. */
  readonly width: number
  readonly height: number
}

export interface PaletteLayout {
  readonly palettes: Readonly<Record<PaletteId, PalettePlace>>
  /**
   * Each column's width, its splitter left out; `null` until a palette is
   * docked there, which then gives it its own width.
   */
  readonly dock: Readonly<Record<DockSide, number | null>>
}

/**
 * Each palette's size as AutoCAD 2027 first showed it (plan §2.8: 360×720,
 * 650×350, 430×560).
 */
export const PALETTE_SIZE: Readonly<
  Record<PaletteId, { readonly width: number; readonly height: number }>
> = {
  properties: { width: 360, height: 720 },
  layers: { width: 650, height: 350 },
  blocks: { width: 430, height: 560 },
}

/**
 * The smallest a palette is made: its rows' labels and values still read in
 * every language (a label wraps, never a value).
 */
export const PALETTE_MIN = { width: 240, height: 160 } as const

/** A column's width, its splitter left out. */
export const DOCK_WIDTH = { min: 240, max: 800 } as const

/** The splitter between a column and the drawing (plan §2.8: 4 px). */
export const SPLITTER = 4

/**
 * Where a palette first floats: at the drawing's inline-end top, each
 * offset by a title bar's width from the one before, so three opened at
 * once never hide each other's title bars.
 */
function initialPlace(id: PaletteId): PalettePlace {
  const step = PALETTES.indexOf(id) * 24
  return {
    open: false,
    docked: null,
    allowDocking: true,
    end: step,
    top: step,
    ...PALETTE_SIZE[id],
  }
}

export const PALETTE_LAYOUT: PaletteLayout = {
  palettes: {
    properties: initialPlace("properties"),
    layers: initialPlace("layers"),
    blocks: initialPlace("blocks"),
  },
  dock: { start: null, end: null },
}

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value)

export const clampDockWidth = (width: number): number =>
  Math.round(Math.min(DOCK_WIDTH.max, Math.max(DOCK_WIDTH.min, width)))

function resolvePlace(id: PaletteId, stored: unknown): PalettePlace {
  const base = initialPlace(id)
  if (stored === null || typeof stored !== "object") return base
  const value = stored as Record<string, unknown>
  const number = (key: "end" | "top" | "width" | "height", min: number) =>
    isFiniteNumber(value[key])
      ? Math.max(min, Math.round(value[key]))
      : base[key]
  return {
    open: typeof value.open === "boolean" ? value.open : base.open,
    docked:
      value.docked === "start" || value.docked === "end" ? value.docked : null,
    allowDocking:
      typeof value.allowDocking === "boolean"
        ? value.allowDocking
        : base.allowDocking,
    end: number("end", 0),
    top: number("top", 0),
    width: number("width", PALETTE_MIN.width),
    height: number("height", PALETTE_MIN.height),
  }
}

/** What is stored, read leniently: a part that is not one is the default. */
export function resolvePaletteLayout(stored: unknown): PaletteLayout {
  const value =
    stored !== null && typeof stored === "object"
      ? (stored as Record<string, unknown>)
      : {}
  const palettes =
    value.palettes !== null && typeof value.palettes === "object"
      ? (value.palettes as Record<string, unknown>)
      : {}
  const dock =
    value.dock !== null && typeof value.dock === "object"
      ? (value.dock as Record<string, unknown>)
      : {}
  const width = (side: DockSide) =>
    isFiniteNumber(dock[side]) ? clampDockWidth(dock[side]) : null
  return {
    palettes: {
      properties: resolvePlace("properties", palettes.properties),
      layers: resolvePlace("layers", palettes.layers),
      blocks: resolvePlace("blocks", palettes.blocks),
    },
    dock: { start: width("start"), end: width("end") },
  }
}

/** The palettes `layout` docks at `side`, in their order. */
export const dockedAt = (
  layout: PaletteLayout,
  side: DockSide,
  shows: (id: PaletteId) => boolean
): PaletteId[] =>
  PALETTES.filter((id) => layout.palettes[id].docked === side && shows(id))

/**
 * A column's width as laid out, splitter included: 0 with no palette there.
 * The column has its width, else the first palette docked there gives its own.
 */
export function dockColumnWidth(
  layout: PaletteLayout,
  side: DockSide,
  shows: (id: PaletteId) => boolean
): number {
  const [first] = dockedAt(layout, side, shows)
  if (first === undefined) return 0
  return (
    (layout.dock[side] ?? clampDockWidth(layout.palettes[first].width)) +
    SPLITTER
  )
}

/** The layout this page loaded with: what the head script read, read again. */
export function paletteLayoutAtLoad(key: string | undefined): PaletteLayout {
  if (key === undefined) return PALETTE_LAYOUT
  try {
    return resolvePaletteLayout(
      JSON.parse(window.localStorage.getItem(key) ?? "null")
    )
  } catch {
    // Storage blocked (a private window) or a value not JSON: the default.
    return PALETTE_LAYOUT
  }
}

/** The palettes open at load, for the engine to open. */
export const openAtLoad = (layout: PaletteLayout): PaletteId[] =>
  PALETTES.filter((id) => layout.palettes[id].open)

/** Stores the layout, once the user has changed it. */
export function rememberPalettes(
  key: string | undefined,
  layout: PaletteLayout
): void {
  if (key === undefined) return
  try {
    window.localStorage.setItem(key, JSON.stringify(layout))
  } catch {
    // Not remembered: the next visit opens with no palette.
  }
}

/**
 * Writes the columns' widths on the editor's `root`, where the grid reads
 * them. The head script does this during parsing; a root rendered on the
 * client (a host without the script, a remount) gets it from the workspace.
 */
export function applyPaletteColumns(
  root: HTMLElement,
  widths: Readonly<Record<DockSide, number>>
): void {
  for (const side of DOCK_SIDES) {
    root.style.setProperty(`--palette-dock-${side}`, `${widths[side]}px`)
  }
}

/**
 * The `<head>` script for the layout kept under `key` (`layoutStorage.palette`):
 * each docked column's width, from the palettes open when the page was left,
 * in plain ES5, as it runs before any bundle. The root does not exist yet, so a
 * MutationObserver waits for the parser to insert it: its callback is a
 * microtask, which runs before the frame that could paint the root. Without
 * the script (storage blocked, a script error) no column is laid out until
 * the editor's scripts run.
 */
export const paletteLayoutScript = (key: string): string =>
  `(function(){try{var r=null;try{r=JSON.parse(localStorage.getItem(${JSON.stringify(
    key
  )})||"null")}catch(e){}if(!r||typeof r!=="object"||!r.palettes||typeof r.palettes!=="object")return;var ids=${JSON.stringify(
    PALETTES
  )},k=r.dock&&typeof r.dock==="object"?r.dock:{},w={start:0,end:0};function c(v){return Math.round(Math.min(${DOCK_WIDTH.max},Math.max(${DOCK_WIDTH.min},v)))}function n(v){return typeof v==="number"&&isFinite(v)}for(var s in w){for(var i=0;i<ids.length;i++){var p=r.palettes[ids[i]];if(p&&p.open===true&&p.docked===s){var d=${JSON.stringify(
    Object.fromEntries(PALETTES.map((id) => [id, PALETTE_SIZE[id].width]))
  )}[ids[i]];w[s]=(n(k[s])?c(k[s]):c(n(p.width)?Math.max(${PALETTE_MIN.width},Math.round(p.width)):d))+${SPLITTER};break}}}if(!w.start&&!w.end)return;var doc=document;function a(){var e=doc.querySelector("[${EDITOR_ROOT_ATTRIBUTE}]");if(!e)return false;e.style.setProperty("--palette-dock-start",w.start+"px");e.style.setProperty("--palette-dock-end",w.end+"px");return true}if(!a()){var m=new MutationObserver(function(){if(a())m.disconnect()});m.observe(doc.documentElement,{childList:true,subtree:true});doc.addEventListener("DOMContentLoaded",function(){m.disconnect()})}}catch(e){}})()`
