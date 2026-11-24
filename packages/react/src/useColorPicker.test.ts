import { describe, expect, it, vi } from "vitest"

import { renderHook } from "../../../test/renderHook"
import { useColorPicker } from "./useColorPicker"

/** A colour field that keeps its listeners, as the DOM's would. */
function colorField() {
  const listeners = new Map<string, Set<() => void>>()
  return {
    value: "#ffffff",
    showPicker: vi.fn(),
    click: vi.fn(),
    addEventListener(type: string, listener: () => void) {
      if (!listeners.has(type)) listeners.set(type, new Set())
      listeners.get(type)?.add(listener)
    },
    removeEventListener(type: string, listener: () => void) {
      listeners.get(type)?.delete(listener)
    },
    fire(type: string) {
      for (const listener of listeners.get(type) ?? []) listener()
    },
  }
}

describe("useColorPicker", () => {
  // A drag across the picker fires `input` on every move: each one applied
  // the colour, an undo step apiece. One pick is one step.
  it("hands the colour on once, when the picker commits it", () => {
    const onPick = vi.fn()
    const picker = renderHook(() => useColorPicker(onPick))
    const field = colorField()
    picker.field(field as unknown as HTMLInputElement)
    for (const value of ["#100000", "#200000", "#300000"]) {
      field.value = value
      field.fire("input")
    }
    expect(onPick).not.toHaveBeenCalled()
    field.fire("change")
    expect(onPick.mock.calls).toEqual([["#300000"]])
  })

  it("stops listening once the field is gone", () => {
    const onPick = vi.fn()
    const picker = renderHook(() => useColorPicker(onPick))
    const field = colorField()
    const cleanup = picker.field(field as unknown as HTMLInputElement)
    cleanup()
    field.fire("change")
    expect(onPick).not.toHaveBeenCalled()
  })

  it("opens the browser's picker, or clicks the field where it has none", () => {
    const picker = renderHook(() => useColorPicker(vi.fn()))
    const field = colorField()
    picker.field(field as unknown as HTMLInputElement)
    picker.open()
    expect(field.showPicker).toHaveBeenCalledOnce()
    const old = { ...colorField(), showPicker: undefined }
    picker.field(old as unknown as HTMLInputElement)
    picker.open()
    expect(old.click).toHaveBeenCalledOnce()
  })
})
