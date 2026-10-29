import { EDITOR_ROOT_ATTRIBUTE } from "./editor-root"

/**
 * The palette panel's open state and width, decided before the first paint.
 *
 * Every zone of the editor has its size in CSS before the engine mounts, so
 * the canvas is born with its final box: the landing's sheet grows into it
 * and the first view is centred in it. The panel's size depends on the window
 * (open from {@link PALETTE_OPEN_FROM}, folded below) and on what the user
 * last chose, which only this device knows. So an inline script in the
 * layout's `<head>` ({@link paletteLayoutScript}) reads the choice before
 * the body is parsed and writes it on the editor's root as the parser
 * inserts it — `data-palette` and `--palette-width` — which the zone's
 * `palette-open:` variant reads; the workspace then hands the same answer
 * ({@link paletteLayoutAtLoad}) to the engine, so the two never disagree.
 *
 * Only the width and the fold are remembered, each once the user has changed
 * it: until then the window's width decides. They are kept under the host's
 * key (`layoutStorage.palette`); with none, nothing is remembered and no
 * script is needed, since the zone's CSS decides by the window's width alone.
 */

/** From this window width (px) the panel starts open; below, folded. */
export const PALETTE_OPEN_FROM = 1600

/**
 * The panel only widens from its 280 px: narrower, the four tabs' names stop
 * fitting in Spanish.
 */
export const PALETTE_WIDTH = { initial: 280, min: 280, max: 480 } as const

/** What is stored: each part only after the user changed it. */
export interface RememberedPalette {
  readonly open?: boolean
  readonly width?: number
}

export interface PaletteLayout {
  readonly open: boolean
  readonly width: number
}

export function clampPaletteWidth(width: number): number {
  if (!Number.isFinite(width)) return PALETTE_WIDTH.initial
  return Math.round(
    Math.min(PALETTE_WIDTH.max, Math.max(PALETTE_WIDTH.min, width))
  )
}

/** The layout a window of `windowWidth` px opens with, given what is stored. */
export function resolvePaletteLayout(
  remembered: RememberedPalette | null,
  windowWidth: number
): PaletteLayout {
  return {
    open:
      typeof remembered?.open === "boolean"
        ? remembered.open
        : windowWidth >= PALETTE_OPEN_FROM,
    width:
      typeof remembered?.width === "number"
        ? clampPaletteWidth(remembered.width)
        : PALETTE_WIDTH.initial,
  }
}

function readRemembered(
  storage: Storage,
  key: string
): RememberedPalette | null {
  try {
    const parsed: unknown = JSON.parse(storage.getItem(key) ?? "null")
    return parsed !== null && typeof parsed === "object"
      ? (parsed as RememberedPalette)
      : null
  } catch {
    return null
  }
}

/** The layout this page loaded with: what the head script wrote, read again. */
export function paletteLayoutAtLoad(key: string | undefined): PaletteLayout {
  let remembered: RememberedPalette | null = null
  try {
    if (key !== undefined) remembered = readRemembered(window.localStorage, key)
  } catch {
    // Storage blocked (a private window): the window's width decides.
  }
  return resolvePaletteLayout(remembered, window.innerWidth)
}

/** Stores one part of the layout once the user has changed it. */
export function rememberPalette(
  key: string | undefined,
  patch: RememberedPalette
): void {
  if (key === undefined) return
  try {
    const storage = window.localStorage
    storage.setItem(
      key,
      JSON.stringify({ ...readRemembered(storage, key), ...patch })
    )
  } catch {
    // Not remembered: the next visit opens as the window's width says.
  }
}

/**
 * Writes `layout` on the editor's `root`, where the zone's CSS reads it. The
 * head script does this during parsing; a root rendered on the client (a
 * host without the script, a remount) gets it from the workspace.
 */
export function applyPaletteLayout(
  root: HTMLElement,
  layout: PaletteLayout
): void {
  root.dataset.palette = layout.open ? "open" : "folded"
  root.style.setProperty("--palette-width", `${layout.width}px`)
}

/**
 * The `<head>` script for the layout kept under `key`:
 * {@link paletteLayoutAtLoad} and {@link applyPaletteLayout} in plain ES5, as
 * it runs before any bundle. The root does not exist yet, so a
 * MutationObserver waits for the parser to insert it: its callback is a
 * microtask, which runs before the frame that could paint the root. Without
 * the script (storage blocked, a script error) the zone's CSS still decides
 * by the window's width, so the canvas keeps its final box.
 */
export const paletteLayoutScript = (key: string): string =>
  `(function(){try{var r=null;try{r=JSON.parse(localStorage.getItem(${JSON.stringify(
    key
  )})||"null")}catch(e){}if(!r||typeof r!=="object")r={};var o=typeof r.open==="boolean"?r.open:innerWidth>=${PALETTE_OPEN_FROM};var w=typeof r.width==="number"&&isFinite(r.width)?Math.round(Math.min(${PALETTE_WIDTH.max},Math.max(${PALETTE_WIDTH.min},r.width))):${PALETTE_WIDTH.initial};var d=document;function a(){var e=d.querySelector("[${EDITOR_ROOT_ATTRIBUTE}]");if(!e)return false;e.setAttribute("data-palette",o?"open":"folded");e.style.setProperty("--palette-width",w+"px");return true}if(!a()){var m=new MutationObserver(function(){if(a())m.disconnect()});m.observe(d.documentElement,{childList:true,subtree:true});d.addEventListener("DOMContentLoaded",function(){m.disconnect()})}}catch(e){}})()`
