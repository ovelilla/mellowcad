import { describe, expect, it, vi } from "vitest"

import {
  anchorSide,
  DOCK_WIDTH,
  NO_COLUMNS,
  openAtLoad,
  PALETTE_LAYOUT,
  PALETTE_MIN,
  PALETTE_SIZE,
  paletteColumns,
  paletteLayoutAtLoad,
  paletteLayoutScript,
  rememberPalettes,
  resolvePaletteLayout,
  SPLITTER,
  STRIP,
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
  const px = (name: string) => Number.parseInt(style[name], 10)
  return {
    dock: { start: px("--palette-dock-start"), end: px("--palette-dock-end") },
    strip: {
      start: px("--palette-strip-start"),
      end: px("--palette-strip-end"),
    },
  }
}

/** The columns the workspace lays out for what is stored, before the engine. */
function columns(stored: unknown) {
  const layout = resolvePaletteLayout(stored)
  return paletteColumns(layout, (id) => layout.palettes[id].open)
}

const dock = (start: number, end: number) => ({
  dock: { start, end },
  strip: { start: 0, end: 0 },
})

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
    { palettes: { properties: docked("end", { autoHide: true }) } },
    {
      palettes: {
        properties: docked("start", { autoHide: true }),
        layers: docked("start", { width: 500 }),
        blocks: docked("end", { autoHide: true }),
      },
    },
    {
      palettes: {
        properties: docked("end", { autoHide: true, open: false }),
        layers: { open: true, autoHide: true },
      },
    },
    { palettes: { blocks: docked("end", { autoHide: "yes" }) } },
  ]

  it.each(cases)("the script agrees with the workspace (%j)", (stored) => {
    const expected = columns(stored)
    const written = runScript(JSON.stringify(stored))
    expect(written ?? NO_COLUMNS).toEqual(expected)
  })

  it("lays out a docked palette's column: its width and the splitter", () => {
    expect(columns({ palettes: { properties: docked("end") } })).toEqual(
      dock(0, PALETTE_SIZE.properties.width + SPLITTER)
    )
    expect(
      columns({ palettes: { properties: docked("end") }, dock: { end: 420 } })
    ).toEqual(dock(0, 420 + SPLITTER))
  })

  it("lays out a strip for the palettes anchored at a side, not a column", () => {
    expect(
      columns({
        palettes: {
          properties: docked("end", { autoHide: true }),
          blocks: docked("end", { autoHide: true }),
        },
      })
    ).toEqual({ dock: { start: 0, end: 0 }, strip: { start: 0, end: STRIP } })
    // A column and a strip at one side: the docked palette gives the width.
    expect(
      columns({
        palettes: {
          properties: docked("start", { autoHide: true }),
          blocks: docked("start"),
        },
      })
    ).toEqual({
      dock: { start: PALETTE_SIZE.blocks.width + SPLITTER, end: 0 },
      strip: { start: STRIP, end: 0 },
    })
  })

  it("lays out no column for a palette closed or floating", () => {
    expect(
      columns({ palettes: { properties: docked("end", { open: false }) } })
    ).toEqual(NO_COLUMNS)
    expect(columns({ palettes: { properties: { open: true } } })).toEqual(
      NO_COLUMNS
    )
    // Floating with auto-hide: it shrinks over the drawing, taking nothing.
    expect(
      columns({ palettes: { properties: { open: true, autoHide: true } } })
    ).toEqual(NO_COLUMNS)
  })

  it("writes on the root as the parser inserts it, then stops watching", () => {
    const stored = JSON.stringify({ palettes: { layers: docked("start") } })
    const expected = dock(PALETTE_SIZE.layers.width + SPLITTER, 0)
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
        autoHide: false,
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
          autoHide: 1,
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
      autoHide: false,
      allowDocking: true,
      end: 0,
      top: 13,
      width: PALETTE_MIN.width,
      height: 9000,
    })
    expect(layout.dock).toEqual({ start: DOCK_WIDTH.min, end: DOCK_WIDTH.max })
    expect(openAtLoad(layout)).toEqual(["layers"])
  })

  it("anchors Anchor Left at the physical left, whatever the direction", () => {
    expect(anchorSide("left", false)).toBe("start")
    expect(anchorSide("right", false)).toBe("end")
    expect(anchorSide("left", true)).toBe("end")
    expect(anchorSide("right", true)).toBe("start")
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
