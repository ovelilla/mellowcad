import { describe, expect, it, vi } from "vitest"

import {
  parseHiddenStatusItems,
  readHiddenStatusItems,
  rememberHiddenStatusItems,
  STATUS_BAR_STORAGE_KEY,
} from "./status-bar-layout"

describe("the status bar's customization", () => {
  it("hides only the tools it knows", () => {
    expect([
      ...parseHiddenStatusItems(JSON.stringify(["grid", "model", "nope"])),
    ]).toEqual(["model", "grid"])
  })

  it.each([null, "", "{", "{}", '"grid"'])(
    "shows every tool when nothing usable is stored (%s)",
    (stored) => {
      expect(parseHiddenStatusItems(stored).size).toBe(0)
    }
  )

  it("remembers what is hidden on this device, in the bar's order", () => {
    const store = new Map<string, string>()
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => store.set(key, value),
      },
    })

    rememberHiddenStatusItems(new Set(["units", "coordinates"]))

    expect(store.get(STATUS_BAR_STORAGE_KEY)).toBe('["coordinates","units"]')
    expect([...readHiddenStatusItems()]).toEqual(["coordinates", "units"])
  })

  it("shows every tool when storage is blocked", () => {
    vi.stubGlobal("window", {
      get localStorage(): Storage {
        throw new Error("blocked")
      },
    })

    expect(readHiddenStatusItems().size).toBe(0)
    expect(() => rememberHiddenStatusItems(new Set(["grid"]))).not.toThrow()
  })
})
