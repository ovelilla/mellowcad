import { describe, expect, it, vi } from "vitest"
import type { CadEngine } from "@mellowcad/engine"

import { renderHook } from "../../../test/renderHook"
import { useCommandLineInput } from "./useCommandLineInput"

function engineTaking(...taken: string[]) {
  return {
    subscribe: () => () => {},
    getState: () => ({ commandLine: { buffer: "LI" } }),
    setCommandLineText: vi.fn(),
    commandLineKey: vi.fn((key: string) => taken.includes(key)),
  }
}

function keyDown(key: string, isComposing = false, keyCode = 0) {
  return { key, keyCode, nativeEvent: { isComposing }, preventDefault: vi.fn() }
}

describe("useCommandLineInput", () => {
  it("shows the engine's buffer and writes what is typed into it", () => {
    const engine = engineTaking()
    const field = renderHook(() =>
      useCommandLineInput(engine as unknown as CadEngine)
    )
    expect(field).toMatchObject({
      value: "LI",
      autoComplete: "off",
      spellCheck: false,
    })
    field.onChange({ target: { value: "LIN" } } as never)
    expect(engine.setCommandLineText).toHaveBeenCalledWith("LIN")
  })

  it("prevents the browser's action for each key the engine takes, and only those", () => {
    const engine = engineTaking(" ", "ArrowUp")
    const field = renderHook(() =>
      useCommandLineInput(engine as unknown as CadEngine)
    )
    const space = keyDown(" ")
    const up = keyDown("ArrowUp")
    const letter = keyDown("E")
    for (const event of [space, up, letter]) field.onKeyDown(event as never)
    expect(engine.commandLineKey.mock.calls).toEqual([
      [" "],
      ["ArrowUp"],
      ["E"],
    ])
    expect(space.preventDefault).toHaveBeenCalled()
    expect(up.preventDefault).toHaveBeenCalled()
    expect(letter.preventDefault).not.toHaveBeenCalled()
  })

  it("leaves the keys an IME composes with to the IME", () => {
    const engine = engineTaking("Enter", " ")
    const field = renderHook(() =>
      useCommandLineInput(engine as unknown as CadEngine)
    )
    const confirm = keyDown("Enter", true)
    const convert = keyDown(" ", true)
    // Safari's Enter after compositionend: not composing, keyCode 229.
    const safari = keyDown("Enter", false, 229)
    for (const event of [confirm, convert, safari])
      field.onKeyDown(event as never)
    expect(engine.commandLineKey).not.toHaveBeenCalled()
    expect(convert.preventDefault).not.toHaveBeenCalled()
  })
})
