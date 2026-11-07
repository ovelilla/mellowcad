import { describe, expect, it } from "vitest"

import {
  drawingStorageKey,
  keyedDrawingStore,
  openedDrawing,
  withDrawing,
  type PublishedDrawings,
} from "./opened-drawing"

const DRAWINGS: PublishedDrawings = {
  gasket: {
    url: "/es/drawings/gasket",
    view: { min: { x: -190, y: -24 }, max: { x: 146, y: 102 } },
  },
}

function memoryStorage(): Storage {
  const items = new Map<string, string>()
  return {
    get length() {
      return items.size
    },
    clear: () => items.clear(),
    getItem: (key) => items.get(key) ?? null,
    key: (index) => [...items.keys()][index] ?? null,
    removeItem: (key) => void items.delete(key),
    setItem: (key, value) => void items.set(key, value),
  }
}

describe("a drawing opened by its URL", () => {
  it("is one the site publishes, named by the query", () => {
    expect(openedDrawing("?drawing=gasket", DRAWINGS)).toEqual({
      name: "gasket",
      ...DRAWINGS.gasket,
    })
    expect(openedDrawing("?drawing=nope", DRAWINGS)).toBeNull()
    expect(openedDrawing("?drawing=toString", DRAWINGS)).toBeNull()
    expect(openedDrawing("", DRAWINGS)).toBeNull()
  })

  // A renamed key does not fail anywhere else: every exercise a reader left
  // half done is silently forgotten.
  it("keeps its work under a key of its own, frozen", () => {
    expect(drawingStorageKey("gasket")).toBe("mellowcad:drawing:gasket:v1")
  })

  it("never touches the editor's own autosave", () => {
    const storage = memoryStorage()
    storage.setItem("easycad:autosave:v1", "the drawing someone was working on")
    const store = keyedDrawingStore(drawingStorageKey("gasket"), () => storage)

    expect(store.read()).toBeNull()
    store.write("the exercise, half done")
    expect(store.read()).toBe("the exercise, half done")
    expect(storage.getItem("easycad:autosave:v1")).toBe(
      "the drawing someone was working on"
    )
  })

  it("keeps nothing where storage is blocked, and says nothing", () => {
    const blocked = () => {
      throw new DOMException("The operation is insecure.", "SecurityError")
    }
    const store = keyedDrawingStore(drawingStorageKey("gasket"), blocked)

    expect(() => store.write("text")).not.toThrow()
    expect(store.read()).toBeNull()
  })

  it("stays open across the language links", () => {
    expect(withDrawing("/es/draw", "gasket")).toBe("/es/draw?drawing=gasket")
    expect(withDrawing("/draw", "gasket")).toBe("/draw?drawing=gasket")
  })
})
