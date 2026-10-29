import { describe, expect, it, vi } from "vitest"
import type {
  CadEngine,
  DynamicInputFieldUi,
  DynamicInputUi,
} from "@mellowcad/engine"

import { renderHook } from "../../../test/renderHook"
import { takeFocus, useDynamicInput } from "./useDynamicInput"

const length = field({ id: "length", kind: "distance", active: true })
const angle = field({ id: "angle", kind: "angle" })

function field(
  overrides: Partial<DynamicInputFieldUi> & Pick<DynamicInputFieldUi, "id">
): DynamicInputFieldUi {
  return { value: "", active: false, kind: "distance", ...overrides } as never
}

/** A stand-in engine: a box of `fields`, taking the keys `taken`. */
function engineWith(fields: DynamicInputFieldUi[], ...taken: string[]) {
  const engine = {
    box: { fields } as Partial<DynamicInputUi>,
    subscribe: () => () => {},
    getState: () => ({ dynamicInput: engine.box }),
    setActiveDynamicField: vi.fn(),
    setDynamicInputText: vi.fn(),
    dynamicInputKey: vi.fn((_id: string, key: string) => taken.includes(key)),
    mayTakeFocus: vi.fn(() => true),
  }
  return engine
}

/** A field's element, inside the box or not; its document's focus starts nowhere. */
function element(value = "", inBox = true) {
  const node = {
    value,
    dataset: {} as Record<string, string>,
    ownerDocument: { activeElement: null as unknown },
    focus: vi.fn(() => {
      node.ownerDocument.activeElement = node
    }),
    select: vi.fn(),
    setSelectionRange: vi.fn(),
    closest: (selector: string) =>
      inBox && selector === "[data-dynamic-input]" ? box : null,
  }
  return node
}

const box = { querySelectorAll: vi.fn() }

function key(key: string, modifiers: Record<string, boolean> = {}) {
  return {
    key,
    shiftKey: false,
    ctrlKey: false,
    altKey: false,
    metaKey: false,
    ...modifiers,
    preventDefault: vi.fn(),
    currentTarget: element(),
  }
}

function render(engine: ReturnType<typeof engineWith>) {
  return renderHook(() => useDynamicInput(engine as unknown as CadEngine))
}

describe("useDynamicInput", () => {
  it("shows the engine's box and marks its element", () => {
    const engine = engineWith([length, angle])
    const { dynamicInput, box } = render(engine)
    expect(dynamicInput).toBe(engine.box)
    expect(box).toEqual({ "data-dynamic-input": "" })
  })

  it("holds only the active field, and writes what is typed into its own", () => {
    const engine = engineWith([length, angle])
    const { field } = render(engine)
    expect(field(length).ref).toBeTypeOf("function")
    expect(field(angle).ref).toBeUndefined()
    field(angle).onChange({ target: { value: "45" } } as never)
    expect(engine.setDynamicInputText).toHaveBeenCalledWith("45", "angle")
  })

  it("hands the engine each key with the Mac's Command as Ctrl, preventing only what it took", () => {
    const engine = engineWith([length], "z")
    const { field } = render(engine)
    const undo = key("z", { metaKey: true })
    const digit = key("5")
    field(length).onKeyDown(undo as never)
    field(length).onKeyDown(digit as never)
    expect(engine.dynamicInputKey.mock.calls).toEqual([
      ["length", "z", { shiftKey: false, ctrlKey: true, altKey: false }],
      ["length", "5", { shiftKey: false, ctrlKey: false, altKey: false }],
    ])
    expect(undo.preventDefault).toHaveBeenCalled()
    expect(digit.preventDefault).not.toHaveBeenCalled()
  })

  it("moves focus to the field a Tab made active, selected", () => {
    const engine = engineWith([length, angle], "Tab")
    const { field } = render(engine)
    const inputs = [element(), element("90")]
    box.querySelectorAll.mockReturnValue(inputs)
    engine.box = {
      fields: [
        { ...length, active: false },
        { ...angle, active: true },
      ],
    }
    const tab = key("Tab")
    field(length).onKeyDown(tab as never)
    expect(tab.preventDefault).toHaveBeenCalled()
    expect(box.querySelectorAll).toHaveBeenCalledWith("input")
    expect(inputs[1].focus).toHaveBeenCalled()
    expect(inputs[1].select).toHaveBeenCalled()
    expect(inputs[0].focus).not.toHaveBeenCalled()
  })

  it("leaves focus where it is when a Tab keeps the same field active", () => {
    const engine = engineWith([length, angle], "Tab")
    const { field } = render(engine)
    box.querySelectorAll.mockClear()
    field(length).onKeyDown(key("Tab") as never)
    expect(box.querySelectorAll).not.toHaveBeenCalled()
  })

  it("selects a field focused by the user, and opens a paragraph after its text once", () => {
    const paragraphs = field({ id: "text", kind: "paragraphs", active: true })
    const engine = engineWith([length, paragraphs])
    const { field: props } = render(engine)
    const input = element("12")
    props(length).onFocus({ currentTarget: input } as never)
    expect(engine.setActiveDynamicField).toHaveBeenCalledWith("length")
    expect(input.select).toHaveBeenCalled()

    const area = element("Two\nlines")
    props(paragraphs).onFocus({ currentTarget: area } as never)
    area.setSelectionRange.mockClear()
    props(paragraphs).onFocus({ currentTarget: area } as never)
    expect(area.dataset.opened).toBe("true")
    expect(area.setSelectionRange).not.toHaveBeenCalled()
    expect(area.select).not.toHaveBeenCalled()
  })
})

describe("takeFocus, run after each render", () => {
  const take = (
    engine: ReturnType<typeof engineWith>,
    el: ReturnType<typeof element>,
    f: DynamicInputFieldUi
  ) =>
    takeFocus(engine as unknown as CadEngine, el as never, f, {
      current: false,
    })

  it("focuses the active field, selected when empty, the caret at the end of a value", () => {
    const engine = engineWith([length])
    const empty = element()
    take(engine, empty, length)
    expect(empty.focus).toHaveBeenCalled()
    expect(empty.select).toHaveBeenCalled()

    const typed = element("12")
    take(engine, typed, length)
    expect(typed.setSelectionRange).toHaveBeenCalledWith(2, 2)
    expect(typed.select).not.toHaveBeenCalled()
  })

  it("selects a text field whatever it holds, and never touches a paragraph's", () => {
    const engine = engineWith([])
    const text = element("Hello")
    take(engine, text, field({ id: "t", kind: "text", active: true }))
    expect(text.select).toHaveBeenCalled()

    const area = element("Two\nlines")
    take(engine, area, field({ id: "p", kind: "paragraphs", active: true }))
    expect(area.focus).toHaveBeenCalled()
    expect(area.select).not.toHaveBeenCalled()
    expect(area.setSelectionRange).not.toHaveBeenCalled()
  })

  it("tells its own focus apart, so a refocus does not reselect", () => {
    const engine = engineWith([length])
    const el = element()
    const refocusing = { current: false }
    el.focus.mockImplementation(() => {
      expect(refocusing.current).toBe(true)
    })
    takeFocus(engine as unknown as CadEngine, el as never, length, refocusing)
    expect(refocusing.current).toBe(false)
  })

  it("never takes focus from another of the box's fields, nor where the engine refuses", () => {
    const engine = engineWith([length])
    const el = element()
    el.ownerDocument.activeElement = element("", true)
    take(engine, el, length)
    expect(engine.mayTakeFocus).not.toHaveBeenCalled()

    const outside = element("", false)
    el.ownerDocument.activeElement = outside
    engine.mayTakeFocus.mockReturnValue(false)
    take(engine, el, length)
    expect(engine.mayTakeFocus).toHaveBeenCalledWith(outside)
    expect(el.focus).not.toHaveBeenCalled()
  })

  it("does nothing when the field already has focus", () => {
    const engine = engineWith([length])
    const el = element()
    el.ownerDocument.activeElement = el
    take(engine, el, length)
    expect(engine.mayTakeFocus).not.toHaveBeenCalled()
    expect(el.focus).not.toHaveBeenCalled()
  })
})
