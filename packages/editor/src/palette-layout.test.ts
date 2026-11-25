import { describe, expect, it, vi } from "vitest"

import {
  DOCK_WIDTH,
  dockColumnWidth,
  openAtLoad,
  PALETTE_LAYOUT,
  PALETTE_MIN,
  PALETTE_SIZE,
  paletteLayoutAtLoad,
  paletteLayoutScript,
  rememberPalettes,
  resolvePaletteLayout,
  SPLITTER,
  type DockSide,
} from "./palette-layout"
import { EDITOR_ROOT_ATTRIBUTE } from "./editor-root"

const KEY = "host:palette"

let observing = false

/**
 * Runs the head script against a fake page and reads the columns it wrote on
 * the editor's root, which the parser inserts after the script unless
 * `rootFirst`: something else first, then the root. `null` when it wrote
 * nothing.
 */
function runScript(stored: string | null, rootFirst = false) {
  const style: Record<string, string> = {}
  const root = {
    style: {
      setProperty: (name: string, value: string) => (style[name] = value),
    },
  }
  let parsed = rootFirst
  let mutated: (() => void) | undefined
  observing = false
  class MutationObserver {
    constructor(callback: () => void) {
      mutated = callback
    }
    observe() {
      observing = true
    }
    disconnect() {
      observing = false
    }
  }
  const document = {
    documentElement: {},
    querySelector: (selector: string) =>
      parsed && selector === `[${EDITOR_ROOT_ATTRIBUTE}]` ? root : null,
    addEventListener: () => {},
  }
  const localStorage = {
    getItem: (key: string) => (key === KEY ? stored : null),
  }
  new Function(
    "localStorage",
    "document",
    "MutationObserver",
    paletteLayoutScript(KEY)
  )(localStorage, document, MutationObserver)
  if (observing) mutated?.()
  parsed = true
  if (observing) mutated?.()
  if (!("--palette-dock-start" in style)) return null
  return {
    start: Number.parseInt(style["--palette-dock-start"], 10),
    end: Number.parseInt(style["--palette-dock-end"], 10),
  }
}

/** The columns the workspace lays out for what is stored, before the engine. */
function columns(stored: unknown) {
  const layout = resolvePaletteLayout(stored)
  const width = (side: DockSide) =>
    dockColumnWidth(layout, side, (id) => layout.palettes[id].open)
  return { start: width("start"), end: width("end") }
}

const docked = (
  side: DockSide,
  rest: Record<string, unknown> = {}
): Record<string, unknown> => ({ open: true, docked: side, ...rest })

describe("the palette layout before the first paint", () => {
  const cases: unknown[] = [
    { palettes: { properties: docked("end") } },
    { palettes: { properties: docked("end") }, dock: { end: 420 } },
    { palettes: { layers: docked("start"), blocks: docked("end") } },
    { palettes: { blocks: docked("start", { width: 9000 }) } },
    { palettes: { blocks: docked("start", { width: 10 }) } },
    { palettes: { blocks: docked("end", { width: "wide" }) } },
    { palettes: { properties: docked("end") }, dock: { end: 9000 } },
    {
      palettes: {
        properties: docked("end", { open: false }),
        layers: docked("end", { width: 500 }),
      },
    },
    { palettes: { properties: { open: true, docked: null } } },
  ]

  it.each(cases)("the script agrees with the workspace (%j)", (stored) => {
    const expected = columns(stored)
    const written = runScript(JSON.stringify(stored))
    expect(written ?? { start: 0, end: 0 }).toEqual(expected)
  })

  it("lays out a docked palette's column: its width and the splitter", () => {
    expect(columns({ palettes: { properties: docked("end") } })).toEqual({
      start: 0,
      end: PALETTE_SIZE.properties.width + SPLITTER,
    })
    expect(
      columns({ palettes: { properties: docked("end") }, dock: { end: 420 } })
    ).toEqual({ start: 0, end: 420 + SPLITTER })
  })

  it("lays out no column for a palette closed or floating", () => {
    expect(
      columns({ palettes: { properties: docked("end", { open: false }) } })
    ).toEqual({ start: 0, end: 0 })
    expect(columns({ palettes: { properties: { open: true } } })).toEqual({
      start: 0,
      end: 0,
    })
  })

  it("writes on the root as the parser inserts it, then stops watching", () => {
    const stored = JSON.stringify({ palettes: { layers: docked("start") } })
    const expected = { start: PALETTE_SIZE.layers.width + SPLITTER, end: 0 }
    expect(runScript(stored)).toEqual(expected)
    expect(observing).toBe(false)
    expect(runScript(stored, true)).toEqual(expected)
    expect(observing).toBe(false)
  })

  it("writes nothing on a broken entry or an old one", () => {
    expect(runScript("{not json")).toBeNull()
    expect(runScript('"open"')).toBeNull()
    // The single panel's, before each palette had its own.
    expect(runScript(JSON.stringify({ open: true, width: 360 }))).toBeNull()
    expect(resolvePaletteLayout({ open: true, width: 360 })).toEqual(
      PALETTE_LAYOUT
    )
  })
})

describe("the palette layout", () => {
  it("opens none, each floating at its AutoCAD size, docking allowed", () => {
    expect(openAtLoad(PALETTE_LAYOUT)).toEqual([])
    for (const [id, place] of Object.entries(PALETTE_LAYOUT.palettes)) {
      expect(place).toMatchObject({
        open: false,
        docked: null,
        allowDocking: true,
        ...PALETTE_SIZE[id as keyof typeof PALETTE_SIZE],
      })
    }
  })

  it("reads a stored layout leniently, clamping what it sizes", () => {
    const layout = resolvePaletteLayout({
      palettes: {
        layers: {
          open: true,
          docked: "middle",
          allowDocking: "no",
          end: -40,
          top: 12.6,
          width: 10,
          height: 9000,
        },
      },
      dock: { start: 10, end: 9000 },
    })
    expect(layout.palettes.layers).toEqual({
      open: true,
      docked: null,
      allowDocking: true,
      end: 0,
      top: 13,
      width: PALETTE_MIN.width,
      height: 9000,
    })
    expect(layout.dock).toEqual({ start: DOCK_WIDTH.min, end: DOCK_WIDTH.max })
    expect(openAtLoad(layout)).toEqual(["layers"])
  })
})

describe("the palette layout's storage", () => {
  function stubStorage(entries: Record<string, string>) {
    const store = new Map(Object.entries(entries))
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => store.set(key, value),
      },
    })
    return store
  }

  it("keeps the layout under the host's key", () => {
    const store = stubStorage({})
    const layout = resolvePaletteLayout({
      palettes: { blocks: docked("start") },
      dock: { start: 300 },
    })
    rememberPalettes(KEY, layout)
    expect(JSON.parse(store.get(KEY) ?? "null")).toEqual(layout)
    expect(paletteLayoutAtLoad(KEY)).toEqual(layout)
  })

  it("remembers nothing without a key", () => {
    const store = stubStorage({
      [KEY]: JSON.stringify({ palettes: { blocks: docked("end") } }),
    })
    rememberPalettes(undefined, PALETTE_LAYOUT)
    expect([...store.keys()]).toEqual([KEY])
    expect(paletteLayoutAtLoad(undefined)).toEqual(PALETTE_LAYOUT)
  })
})
