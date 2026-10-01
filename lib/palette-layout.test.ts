import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

import {
  PALETTE_LAYOUT_SCRIPT,
  PALETTE_OPEN_FROM,
  PALETTE_WIDTH,
  PALETTE_STORAGE_KEY,
  resolvePaletteLayout,
  type RememberedPalette,
} from "./palette-layout"

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
    getItem: (key: string) => (key === PALETTE_STORAGE_KEY ? stored : null),
  }
  new Function("localStorage", "innerWidth", "document", PALETTE_LAYOUT_SCRIPT)(
    localStorage,
    windowWidth,
    { documentElement }
  )
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
