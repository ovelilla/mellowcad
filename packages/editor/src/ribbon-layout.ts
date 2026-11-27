import { EDITOR_ROOT_ATTRIBUTE } from "./editor-root"

/**
 * The ribbon's minimize state and what its button does, kept on the device
 * as AutoCAD keeps them in the profile (docs/plans/autocad-ui.md, decision
 * 2), with what its right-click menu hides, and decided before the first paint as the docked palettes' columns are
 * (`palette-layout.ts`): the ribbon's zone is 124, 86, 45 or 24 high by the
 * state, so an inline script in the layout's `<head>`
 * ({@link ribbonLayoutScript}) writes it on the editor's root as the parser
 * inserts it (`data-ribbon`), which the zone's `ribbon-*:` variants read, and
 * the canvas is born with its final box. Without the script, or with no key,
 * the zone is the full ribbon's.
 */

/**
 * The four states, in the order Cycle through All steps through them (the
 * help's "full ribbon, minimize to panel buttons, minimize to panel titles,
 * and minimize to tabs"): the panels; one button per panel; one title per
 * panel; the tab row alone.
 */
export const RIBBON_STATES = [
  "full",
  "panelButtons",
  "panelTitles",
  "tabs",
] as const
export type RibbonState = (typeof RIBBON_STATES)[number]

/**
 * What the minimize button does, as its arrow's menu sets it: toggle between
 * the full ribbon and one minimized state, or step through all four.
 */
export const RIBBON_MINIMIZE_MODES = [
  "tabs",
  "panelTitles",
  "panelButtons",
  "cycle",
] as const
export type RibbonMinimizeMode = (typeof RIBBON_MINIMIZE_MODES)[number]

/** The zone's height in each state (plan §2.3), its border outside it. */
export const RIBBON_HEIGHT: Readonly<Record<RibbonState, number>> = {
  full: 124,
  panelButtons: 86,
  panelTitles: 45,
  tabs: 24,
}

/**
 * The ribbon's minimize state, what its minimize button does, and what its
 * right-click menu shows and hides (Show Tabs, Show Panels, Show Panel Titles).
 */
export interface RibbonLayout {
  readonly state: RibbonState
  readonly mode: RibbonMinimizeMode
  /** The tabs hidden, by id (`RIBBON_TABS`). */
  readonly hiddenTabs: readonly string[]
  /** The panels hidden, by id, whichever tab holds them. */
  readonly hiddenPanels: readonly string[]
  readonly panelTitles: boolean
}

/**
 * What a device starts with: the full ribbon, the button cycling, every tab
 * and panel shown. WHY not Drafting & Annotation's hidden 3D Tools tab and
 * View's Visual Styles, Coordinates and Navigate panels: the owner wants the
 * 3D tools in sight (2026-11-27; docs/plans/autocad-ui.md, decision 4), and
 * there is no 3D Modeling workspace here to switch to. Show Tabs and Show
 * Panels hide them as AutoCAD's do.
 */
export const RIBBON_LAYOUT: RibbonLayout = {
  state: "full",
  mode: "cycle",
  hiddenTabs: [],
  hiddenPanels: [],
  panelTitles: true,
}

/**
 * What a device stored from 2026-11-27's deploy, which hid them, without
 * touching Show Tabs or Show Panels: read as no choice made, so it gets the
 * tools shown too. A device that hid something else keeps its choice, and
 * what is stored from now on carries {@link SHOWN_AT_FIRST}, so hiding the
 * same four again is kept.
 */
const HIDDEN_AT_FIRST = {
  tabs: ["tools3d"],
  panels: ["visualStyles", "coordinates", "navigate"],
} as const

const isState = (value: unknown): value is RibbonState =>
  (RIBBON_STATES as readonly unknown[]).includes(value)
const isMode = (value: unknown): value is RibbonMinimizeMode =>
  (RIBBON_MINIMIZE_MODES as readonly unknown[]).includes(value)

/** What is stored, read leniently: a part that is not one is the default. */
export function resolveRibbonLayout(stored: unknown): RibbonLayout {
  const value =
    stored !== null && typeof stored === "object"
      ? (stored as Record<string, unknown>)
      : {}
  const ids = (list: unknown, fallback: readonly string[]) =>
    Array.isArray(list) && list.every((id) => typeof id === "string")
      ? (list as string[])
      : fallback
  const untouched =
    value[SHOWN_AT_FIRST] !== true &&
    sameIds(value.hiddenTabs, HIDDEN_AT_FIRST.tabs) &&
    sameIds(value.hiddenPanels, HIDDEN_AT_FIRST.panels)
  if (untouched) {
    return resolveRibbonLayout({
      ...value,
      hiddenTabs: [],
      hiddenPanels: [],
      [SHOWN_AT_FIRST]: true,
    })
  }
  return {
    state: isState(value.state) ? value.state : RIBBON_LAYOUT.state,
    mode: isMode(value.mode) ? value.mode : RIBBON_LAYOUT.mode,
    hiddenTabs: ids(value.hiddenTabs, RIBBON_LAYOUT.hiddenTabs),
    hiddenPanels: ids(value.hiddenPanels, RIBBON_LAYOUT.hiddenPanels),
    panelTitles:
      typeof value.panelTitles === "boolean"
        ? value.panelTitles
        : RIBBON_LAYOUT.panelTitles,
  }
}

/** The mark of a layout stored since every tab and panel starts shown. */
const SHOWN_AT_FIRST = "shownAtFirst"

function sameIds(list: unknown, ids: readonly string[]): boolean {
  return (
    Array.isArray(list) &&
    list.length === ids.length &&
    ids.every((id) => list.includes(id))
  )
}

/**
 * The state a click on the minimize button leads to: the next of the four
 * in Cycle through All, else between the full ribbon and the one chosen
 * (help, "To Display and Control the Display State of the Ribbon").
 */
export function nextRibbonState(
  layout: Pick<RibbonLayout, "state" | "mode">
): RibbonState {
  if (layout.mode === "cycle") {
    const at = RIBBON_STATES.indexOf(layout.state)
    return RIBBON_STATES[(at + 1) % RIBBON_STATES.length]
  }
  return layout.state === "full" ? layout.mode : "full"
}

/** The layout this page loaded with: what the head script wrote, read again. */
export function ribbonLayoutAtLoad(key: string | undefined): RibbonLayout {
  if (key === undefined) return RIBBON_LAYOUT
  try {
    return resolveRibbonLayout(
      JSON.parse(window.localStorage.getItem(key) ?? "null")
    )
  } catch {
    // Storage blocked (a private window) or a value not JSON: the default.
    return RIBBON_LAYOUT
  }
}

/** Stores the layout, once the user has changed it. */
export function rememberRibbon(
  key: string | undefined,
  layout: RibbonLayout
): void {
  if (key === undefined) return
  try {
    window.localStorage.setItem(
      key,
      JSON.stringify({ ...layout, [SHOWN_AT_FIRST]: true })
    )
  } catch {
    // Not remembered: the next visit opens with the full ribbon.
  }
}

/** Writes the state on the editor's `root`, where the zone's CSS reads it. */
export function applyRibbonLayout(
  root: HTMLElement,
  layout: RibbonLayout
): void {
  root.dataset.ribbon = layout.state
}

/**
 * The `<head>` script that lays out the ribbon's minimize state kept under
 * `key` (`layoutStorage.ribbon`) as the page is parsed, so the drawing's
 * first box is its final one: plain ES5, run before any bundle, it marks the
 * editor's root as the parser inserts it, as `paletteLayoutScript` does.
 * Without it the ribbon shows whole until the editor's scripts run.
 */
export const ribbonLayoutScript = (key: string): string =>
  `(function(){try{var r=null;try{r=JSON.parse(localStorage.getItem(${JSON.stringify(
    key
  )})||"null")}catch(e){}var s=r&&typeof r==="object"?r.state:null;if(${JSON.stringify(
    RIBBON_STATES.slice(1)
  )}.indexOf(s)<0)return;var d=document;function a(){var e=d.querySelector("[${EDITOR_ROOT_ATTRIBUTE}]");if(!e)return false;e.setAttribute("data-ribbon",s);return true}if(!a()){var m=new MutationObserver(function(){if(a())m.disconnect()});m.observe(d.documentElement,{childList:true,subtree:true});d.addEventListener("DOMContentLoaded",function(){m.disconnect()})}}catch(e){}})()`
