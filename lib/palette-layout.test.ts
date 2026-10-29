import { readFileSync } from "node:fs"
import { describe, expect, it, vi } from "vitest"

import {
  paletteLayoutAtLoad,
  paletteLayoutScript,
  PALETTE_OPEN_FROM,
  PALETTE_WIDTH,
  rememberPalette,
  resolvePaletteLayout,
  type RememberedPalette,
} from "./palette-layout"

const KEY = "host:palette"

/** Runs the head script against a fake page and reads what it wrote. */
function runScript(stored: string | null, windowWidth: number) {
  const attributes: Record<string, string> = {}
  const style: Record<string, string> = {}
  const documentElement = {
    setAttribute: (name: string, value: string) => (attributes[name] = value),
    style: {
      setProperty: (name: string, value: string) => (style[name] = value),
    },
  }
  const localStorage = {
    getItem: (key: string) => (key === KEY ? stored : null),
  }
  new Function(
    "localStorage",
    "innerWidth",
    "document",
    paletteLayoutScript(KEY)
  )(localStorage, windowWidth, { documentElement })
  return {
    open: attributes["data-palette"] === "open",
    width: Number.parseInt(style["--palette-width"], 10),
  }
}

describe("the palette layout before the first paint", () => {
  const cases: Array<[RememberedPalette | null, number]> = [
    [null, 1280],
    [null, 1600],
    [null, 1920],
    [{ open: true }, 1280],
    [{ open: false }, 1920],
    [{ width: 360 }, 1920],
    [{ width: 9000 }, 1280],
    [{ width: 10 }, 1600],
    [{ open: false, width: 300 }, 1920],
  ]

  it.each(cases)(
    "the script agrees with the workspace (%j at %i px)",
    (r, w) => {
      expect(runScript(r === null ? null : JSON.stringify(r), w)).toEqual(
        resolvePaletteLayout(r, w)
      )
    }
  )

  it("opens from 1600 px and folds below", () => {
    expect(resolvePaletteLayout(null, 1599).open).toBe(false)
    expect(resolvePaletteLayout(null, 1600).open).toBe(true)
  })

  it("keeps what the user chose over the window's width", () => {
    expect(resolvePaletteLayout({ open: true }, 1280)).toEqual({
      open: true,
      width: 280,
    })
  })

  it("clamps a remembered width", () => {
    expect(resolvePaletteLayout({ width: 9000 }, 1920).width).toBe(480)
    expect(resolvePaletteLayout({ width: 10 }, 1920).width).toBe(280)
  })

  it("matches the CSS that decides without the script", () => {
    const css = readFileSync(
      new URL("../app/[locale]/(app)/globals.css", import.meta.url),
      "utf8"
    )
    expect(css).toContain(`@media (width >= ${PALETTE_OPEN_FROM}px)`)
    expect(css).toContain(`--palette-width: ${PALETTE_WIDTH.initial}px;`)
  })

  it("falls back to the window's width on a broken entry", () => {
    expect(runScript("{not json", 1920)).toEqual({ open: true, width: 280 })
    expect(runScript('"open"', 1280)).toEqual({ open: false, width: 280 })
  })
})

describe("the palette layout's storage", () => {
  function stubStorage(entries: Record<string, string>) {
    const store = new Map(Object.entries(entries))
    vi.stubGlobal("window", {
      innerWidth: 1280,
      localStorage: {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => store.set(key, value),
      },
    })
    return store
  }

  it("keeps each part under the host's key", () => {
    const store = stubStorage({})
    rememberPalette(KEY, { open: true })
    rememberPalette(KEY, { width: 320 })
    expect(JSON.parse(store.get(KEY) ?? "null")).toEqual({
      open: true,
      width: 320,
    })
    expect(paletteLayoutAtLoad(KEY)).toEqual({ open: true, width: 320 })
  })

  it("remembers nothing without a key", () => {
    const store = stubStorage({ [KEY]: JSON.stringify({ open: true }) })
    rememberPalette(undefined, { width: 400 })
    expect([...store.keys()]).toEqual([KEY])
    expect(paletteLayoutAtLoad(undefined)).toEqual(
      resolvePaletteLayout(null, 1280)
    )
  })
})
