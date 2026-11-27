import { describe, expect, it, vi } from "vitest"

import {
  parseHiddenStatusItems,
  readHiddenStatusItems,
  rememberHiddenStatusItems,
} from "./status-bar-layout"

const KEY = "host:status-bar"

describe("the status bar's customization", () => {
  it("hides only the tools it knows, and Dynamic UCS until shown", () => {
    expect([
      ...parseHiddenStatusItems(JSON.stringify(["grid", "model", "nope"])),
    ]).toEqual(["model", "grid", "dynamicUcs"])
    expect([
      ...parseHiddenStatusItems(JSON.stringify(["grid", "+dynamicUcs"])),
    ]).toEqual(["grid"])
  })

  it.each([null, "", "{", "{}", '"grid"'])(
    "shows every tool but Dynamic UCS when nothing usable is stored (%s)",
    (stored) => {
      expect([...parseHiddenStatusItems(stored)]).toEqual(["dynamicUcs"])
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

    expect(store.get(KEY)).toBe('["coordinates","units","+dynamicUcs"]')
    expect([...readHiddenStatusItems(KEY)]).toEqual(["coordinates", "units"])
    rememberHiddenStatusItems(KEY, new Set(["dynamicUcs"]))
    expect(store.get(KEY)).toBe('["dynamicUcs"]')
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
    expect([...readHiddenStatusItems(undefined)]).toEqual(["dynamicUcs"])
  })

  it("shows the first bar when storage is blocked", () => {
    vi.stubGlobal("window", {
      get localStorage(): Storage {
        throw new Error("blocked")
      },
    })

    expect([...readHiddenStatusItems(KEY)]).toEqual(["dynamicUcs"])
    expect(() =>
      rememberHiddenStatusItems(KEY, new Set(["grid"]))
    ).not.toThrow()
  })
})
