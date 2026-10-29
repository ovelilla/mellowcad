import { describe, expect, it, vi } from "vitest"

import {
  parseHiddenStatusItems,
  readHiddenStatusItems,
  rememberHiddenStatusItems,
} from "./status-bar-layout"

const KEY = "host:status-bar"

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

    rememberHiddenStatusItems(KEY, new Set(["units", "coordinates"]))

    expect(store.get(KEY)).toBe('["coordinates","units"]')
    expect([...readHiddenStatusItems(KEY)]).toEqual(["coordinates", "units"])
  })

  it("remembers nothing without a key", () => {
    const store = new Map([[KEY, '["grid"]']])
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => store.set(key, value),
      },
    })

    rememberHiddenStatusItems(undefined, new Set(["units"]))

    expect([...store.keys()]).toEqual([KEY])
    expect(readHiddenStatusItems(undefined).size).toBe(0)
  })

  it("shows every tool when storage is blocked", () => {
    vi.stubGlobal("window", {
      get localStorage(): Storage {
        throw new Error("blocked")
      },
    })

    expect(readHiddenStatusItems(KEY).size).toBe(0)
    expect(() =>
      rememberHiddenStatusItems(KEY, new Set(["grid"]))
    ).not.toThrow()
  })
})
