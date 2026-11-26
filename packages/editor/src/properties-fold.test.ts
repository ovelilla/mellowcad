import { describe, expect, it, vi } from "vitest"

import {
  NO_SELECTION,
  isFolded,
  parsePropertiesFold,
  readPropertiesFold,
  rememberPropertiesFold,
  withFold,
} from "./properties-fold"

const KEY = "host:properties"

function stubStorage(store: Map<string, string>) {
  vi.stubGlobal("window", {
    localStorage: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
    },
  })
}

describe("the Properties palette's folds", () => {
  it("are kept per object type, as AutoCAD keeps them per class", () => {
    const fold = withFold({}, "line", "general", true)

    expect(isFolded(fold, "line", "general")).toBe(true)
    expect(isFolded(fold, "circle", "general")).toBe(false)
    expect(isFolded(fold, NO_SELECTION, "general")).toBe(false)
  })

  it("open again, and forget a type with nothing folded", () => {
    const fold = withFold(
      withFold({}, "line", "geometry", true),
      "line",
      "geometry",
      false
    )

    expect(fold).toEqual({})
  })

  it("keep only what they can read", () => {
    expect(
      parsePropertiesFold(
        JSON.stringify({
          line: ["general", 3, "general", "geometry"],
          circle: "general",
          arc: [],
        })
      )
    ).toEqual({ line: ["general", "geometry"] })
  })

  it.each([null, "", "{", "[]", '"general"', "null"])(
    "open every category when nothing usable is stored (%s)",
    (stored) => {
      expect(parsePropertiesFold(stored)).toEqual({})
    }
  )

  it("are remembered on this device", () => {
    const store = new Map<string, string>()
    stubStorage(store)

    rememberPropertiesFold(KEY, withFold({}, "text", "text", true))

    expect(store.get(KEY)).toBe('{"text":["text"]}')
    expect(readPropertiesFold(KEY)).toEqual({ text: ["text"] })
  })

  it("are not remembered without a key", () => {
    const store = new Map([[KEY, '{"line":["general"]}']])
    stubStorage(store)

    rememberPropertiesFold(undefined, { circle: ["general"] })

    expect([...store.values()]).toEqual(['{"line":["general"]}'])
    expect(readPropertiesFold(undefined)).toEqual({})
  })

  it("open every category when storage is blocked", () => {
    vi.stubGlobal("window", {
      get localStorage(): Storage {
        throw new Error("blocked")
      },
    })

    expect(readPropertiesFold(KEY)).toEqual({})
    expect(() =>
      rememberPropertiesFold(KEY, { line: ["general"] })
    ).not.toThrow()
  })
})
