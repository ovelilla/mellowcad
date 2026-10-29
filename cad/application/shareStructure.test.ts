import { describe, expect, it } from "vitest"
import { createHarness } from "../../test/harness"
import { shareStructure } from "./shareStructure"

describe("shareStructure", () => {
  it("keeps the previous value when nothing differs", () => {
    const previous = { a: [1, { b: "x" }], c: null }
    expect(shareStructure(previous, { a: [1, { b: "x" }], c: null })).toBe(
      previous
    )
  })

  it("keeps each untouched part, and only those", () => {
    const previous = { kept: { x: 1 }, changed: { x: 1 }, list: [{ id: 1 }] }
    const next = shareStructure(previous, {
      kept: { x: 1 },
      changed: { x: 2 },
      list: [{ id: 1 }, { id: 2 }],
    })
    expect(next).not.toBe(previous)
    expect(next.kept).toBe(previous.kept)
    expect(next.changed).toEqual({ x: 2 })
    expect(next.list).not.toBe(previous.list)
    expect(next.list[0]).toBe(previous.list[0])
  })

  it("tells a key added or removed from an equal object", () => {
    const previous: Record<string, number | undefined> = { a: 1 }
    expect(shareStructure(previous, { a: 1, b: undefined })).not.toBe(previous)
    expect(shareStructure({ a: 1, b: 2 }, { a: 1 })).toEqual({ a: 1 })
  })

  it("compares anything but plain objects and arrays by identity", () => {
    const previous = { at: new Date(0) }
    const next = { at: new Date(0) }
    expect(shareStructure(previous, next).at).toBe(next.at)
  })
})

describe("the engine's state snapshot", () => {
  it("changes on a pointer move only in what the move changed", () => {
    const cad = createHarness({ snap: true, polar: true })
    cad.command("LINE").click({ x: 0, y: 0 }).moveTo({ x: 40, y: 0 })
    const before = cad.state()
    cad.moveTo({ x: 60, y: 0 })
    const after = cad.state()
    const changed = Object.keys(after).filter(
      (key) =>
        after[key as keyof typeof after] !== before[key as keyof typeof before]
    )
    // The editor re-renders from everything else on every change: a new
    // reference there would re-render the whole of it as the cursor moves.
    expect(changed.sort()).toEqual(["coordinates", "cursorUcs", "dynamicInput"])
  })

  it("is not announced again when nothing in it changed", () => {
    const cad = createHarness({ snap: true, polar: true })
    cad.command("LINE").click({ x: 0, y: 0 }).moveTo({ x: 40, y: 0 })
    let announced = 0
    cad.runtime.subscribe(() => announced++)
    const before = cad.state()
    cad.moveTo({ x: 40, y: 0 })
    expect(announced).toBe(0)
    expect(cad.state()).toBe(before)
  })
})
