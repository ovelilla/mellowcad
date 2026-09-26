import {
  beforeEach,
  describe,
  expect,
  it,
  onTestFinished,
  vi,
  type Mock,
} from "vitest"
import { serializeDrawing } from "../serialization/drawingFile"
import { circleOf, lineOf, p, snapshotOf } from "../../test/builders"
import { CadEngine, type CadEngineOptions } from "./CadEngine"
import { createMemoryDrawingStore } from "./memoryDrawingStore"

/**
 * `CadEngine` is the one class that owns the browser, and it is thin enough to
 * be driven through a DOM this small: event targets that know their parent,
 * and the few globals it reads. No jsdom — nothing else in `cad/` needs one.
 */

class FakeNode extends EventTarget {
  parent: FakeNode | null = null
  readonly tagName: string
  readonly ownerDocument: FakeDocument

  constructor(ownerDocument: FakeDocument | null, tagName: string) {
    super()
    this.ownerDocument = ownerDocument ?? (this as unknown as FakeDocument)
    this.tagName = tagName
  }

  append(...children: FakeNode[]): this {
    for (const child of children) child.parent = this
    return this
  }

  contains(other: unknown): boolean {
    return lineage(other as FakeNode | null).includes(this)
  }

  /** Only the selector the engine asks with: editable fields. */
  closest(): FakeNode | null {
    return (
      lineage(this).find((node) =>
        ["INPUT", "TEXTAREA", "SELECT"].includes(node.tagName)
      ) ?? null
    )
  }

  focus(): void {
    this.ownerDocument.activeElement = this
    dispatch(this.ownerDocument, "focusin", this)
  }
}

class FakeDocument extends FakeNode {
  activeElement: FakeNode | null = null
  readonly body: FakeNode

  constructor() {
    super(null, "#document")
    this.body = new FakeNode(this, "BODY")
    this.append(this.body)
    this.activeElement = this.body
  }
}

class FakeCanvas extends FakeNode {
  tabIndex = -1
  width = 0
  height = 0
  readonly style = { cursor: "" }

  getContext() {
    return {}
  }

  getBoundingClientRect() {
    return { left: 0, top: 0, width: 400, height: 300 }
  }

  setPointerCapture(): void {}
  releasePointerCapture(): void {}
}

/** A node and its ancestors, nearest first. */
function lineage(node: FakeNode | null): FakeNode[] {
  const nodes: FakeNode[] = []
  for (let current = node; current; current = current.parent) {
    nodes.push(current)
  }
  return nodes
}

/** An event as the browser would deliver it to `target`. */
function dispatch(
  on: EventTarget,
  type: string,
  target: FakeNode,
  fields: Record<string, unknown> = {}
): Event {
  const event = new Event(type, { cancelable: true })
  for (const [name, value] of Object.entries({ target, ...fields })) {
    Object.defineProperty(event, name, { value })
  }
  on.dispatchEvent(event)
  return event
}

function keyAt(page: Page, target: FakeNode, key: string, ctrlKey = false) {
  return dispatch(page.document, "keydown", target, {
    key,
    ctrlKey,
    shiftKey: false,
    altKey: false,
  })
}

interface Page {
  readonly document: FakeDocument
  readonly canvas: FakeCanvas
  /** The element the engine is embedded in, holding the canvas and a field. */
  readonly scope: FakeNode
  readonly field: FakeNode
  readonly button: FakeNode
  /** Page content outside the scope: a link and a search box. */
  readonly link: FakeNode
  readonly search: FakeNode
  readonly storage: {
    readonly getItem: Mock<(key: string) => string | null>
    readonly setItem: Mock<(key: string, value: string) => void>
  }
}

let page: Page

beforeEach(() => {
  const document = new FakeDocument()
  const canvas = new FakeCanvas(document, "CANVAS")
  const field = new FakeNode(document, "INPUT")
  const button = new FakeNode(document, "BUTTON")
  const scope = new FakeNode(document, "DIV").append(canvas, field, button)
  const link = new FakeNode(document, "A")
  const search = new FakeNode(document, "INPUT")
  document.body.append(scope, link, search)

  const saved = new Map<string, string>()
  const storage = {
    getItem: vi.fn((key: string) => saved.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => void saved.set(key, value)),
  }
  vi.stubGlobal("Node", FakeNode)
  vi.stubGlobal("window", { devicePixelRatio: 1, localStorage: storage })
  vi.stubGlobal("requestAnimationFrame", () => 0)
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    }
  )
  page = { document, canvas, scope, field, button, link, search, storage }
})

function engineOn(options?: CadEngineOptions): CadEngine {
  const engine = new CadEngine(
    page.canvas as unknown as HTMLCanvasElement,
    options
  )
  onTestFinished(() => engine.dispose())
  return engine
}

function embedded(options: CadEngineOptions = {}): CadEngine {
  return engineOn({
    store: createMemoryDrawingStore(),
    scope: page.scope as unknown as HTMLElement,
    ...options,
  })
}

const drawingOf = (...entities: Parameters<typeof snapshotOf>[0]) =>
  serializeDrawing(snapshotOf(entities))

describe("CadEngine owning the document (the editor)", () => {
  it("hears keys wherever focus sits", () => {
    const engine = engineOn()
    page.link.focus()

    const typed = keyAt(page, page.link, "L")

    expect(typed.defaultPrevented).toBe(true)
    expect(engine.getState().commandLine.buffer).toBe("L")
  })

  it("passes on the keys the runtime does not claim", () => {
    engineOn()

    // Space at the neutral prompt: its page cannot scroll, and a toolbar
    // button with focus must still be pressable with it.
    expect(keyAt(page, page.button, " ").defaultPrevented).toBe(false)
  })

  it("leaves a field its keys, except function keys and Ctrl+S/O", () => {
    const engine = engineOn()

    expect(keyAt(page, page.search, "L").defaultPrevented).toBe(false)
    expect(engine.getState().commandLine.buffer).toBe("")

    keyAt(page, page.search, "F8")
    expect(engine.getState().orthoActive).toBe(true)
  })

  it("zooms on every wheel turn over the canvas", () => {
    const engine = engineOn()
    const wheel = dispatch(page.canvas, "wheel", page.canvas, {
      deltaY: -100,
      clientX: 200,
      clientY: 150,
    })

    expect(wheel.defaultPrevented).toBe(true)
    expect(engine.getState().scale).toBeGreaterThan(1)
  })

  it("keeps the native context menu from opening anywhere but a field", () => {
    engineOn()

    expect(
      dispatch(page.document, "contextmenu", page.link).defaultPrevented
    ).toBe(true)
    expect(
      dispatch(page.document, "contextmenu", page.search).defaultPrevented
    ).toBe(false)
  })

  it("autosaves to this device's store", () => {
    page.storage.setItem("easycad:autosave:v1", drawingOf(circleOf(p(0, 0), 5)))
    const engine = engineOn()

    expect(engine.getState().entityCount).toBe(1)
    engine.loadDrawing(drawingOf(lineOf(p(0, 0), p(10, 0))))
    expect(page.storage.setItem).toHaveBeenLastCalledWith(
      "easycad:autosave:v1",
      expect.any(String)
    )
  })

  it("may take focus from anywhere", () => {
    const engine = engineOn()

    expect(engine.mayTakeFocus(page.button as unknown as Element)).toBe(true)
    expect(engine.mayTakeFocus(page.link as unknown as Element)).toBe(true)
  })
})

describe("CadEngine embedded in a scope", () => {
  it("restores from and autosaves to its own store, never the device's", () => {
    const store = createMemoryDrawingStore(drawingOf(circleOf(p(0, 0), 5)))
    const engine = embedded({ store })

    expect(engine.getState().entityCount).toBe(1)
    engine.loadDrawing(drawingOf(lineOf(p(0, 0), p(10, 0))))

    expect(store.read()).toContain('"type": "line"')
    expect(page.storage.getItem).not.toHaveBeenCalled()
    expect(page.storage.setItem).not.toHaveBeenCalled()
  })

  it("hears no keys until it is pressed or focused", () => {
    const engine = embedded()

    const typed = keyAt(page, page.document.body, "L")

    expect(typed.defaultPrevented).toBe(false)
    expect(engine.getState().commandLine.buffer).toBe("")
  })

  it("hears keys at its canvas once focused", () => {
    const engine = embedded()
    engine.focusSurface()

    expect(keyAt(page, page.canvas, "L").defaultPrevented).toBe(true)
    expect(engine.getState().commandLine.buffer).toBe("L")
  })

  it("is in use from a press inside it", () => {
    const engine = embedded()
    dispatch(page.document, "pointerdown", page.button)

    keyAt(page, page.document.body, "L")

    expect(engine.getState().commandLine.buffer).toBe("L")
  })

  // A dynamic-input field that unmounts while focused drops focus to the body,
  // as OFFSET's does between its distance and its object prompt.
  it("keeps hearing keys when focus falls to the body", () => {
    const engine = embedded()
    engine.focusSurface()
    page.document.activeElement = page.document.body

    keyAt(page, page.document.body, "L")

    expect(engine.getState().commandLine.buffer).toBe("L")
  })

  it("lets go after a press or a focus outside it", () => {
    const engine = embedded()
    engine.focusSurface()
    dispatch(page.document, "pointerdown", page.link)
    keyAt(page, page.document.body, "L")

    engine.focusSurface()
    page.search.focus()
    keyAt(page, page.search, "F8")

    expect(engine.getState().commandLine.buffer).toBe("")
    expect(engine.getState().orthoActive).toBe(false)
  })

  // Space confirms a selection set in the tool that asked for it; the runtime
  // does not claim it, and the page around the sketch must not scroll.
  it("keeps the keys it hears from scrolling the page", () => {
    const engine = embedded()
    engine.focusSurface()

    expect(keyAt(page, page.canvas, " ").defaultPrevented).toBe(true)
    expect(keyAt(page, page.canvas, "PageDown").defaultPrevented).toBe(true)
    expect(keyAt(page, page.canvas, "Tab").defaultPrevented).toBe(false)
  })

  it("leaves a control beside the canvas its own keys", () => {
    const engine = embedded()
    page.button.focus()

    expect(keyAt(page, page.button, "Enter").defaultPrevented).toBe(false)
    keyAt(page, page.button, "L")
    expect(engine.getState().commandLine.buffer).toBe("")
  })

  it("applies the editor's rule to a field inside it", () => {
    const engine = embedded()
    page.field.focus()

    keyAt(page, page.field, "L")
    expect(engine.getState().commandLine.buffer).toBe("")
    keyAt(page, page.field, "F8")
    expect(engine.getState().orthoActive).toBe(true)
  })

  it("leaves the wheel to scroll the page until it is in use", () => {
    const engine = embedded()
    const turn = () =>
      dispatch(page.canvas, "wheel", page.canvas, {
        deltaY: -100,
        clientX: 200,
        clientY: 150,
      })

    expect(turn().defaultPrevented).toBe(false)
    expect(engine.getState().scale).toBe(1)

    engine.focusSurface()
    expect(turn().defaultPrevented).toBe(true)
    expect(engine.getState().scale).toBeGreaterThan(1)
  })

  it("keeps the native context menu only from its own scope", () => {
    embedded()

    expect(
      dispatch(page.document, "contextmenu", page.link).defaultPrevented
    ).toBe(false)
    expect(
      dispatch(page.document, "contextmenu", page.canvas).defaultPrevented
    ).toBe(true)
  })

  it("never takes focus while the page has it", () => {
    const engine = embedded()
    page.link.focus()

    // Starting a command focuses the drawing surface in the editor.
    engine.setActiveTool("line")

    expect(page.document.activeElement).toBe(page.link)
  })

  it("lets its UI take focus back only from the canvas or the body", () => {
    const engine = embedded()
    const from = (node: FakeNode) => engine.mayTakeFocus(node as never)

    expect(from(page.canvas)).toBe(false)
    engine.focusSurface()
    expect(from(page.canvas)).toBe(true)
    expect(from(page.document.body)).toBe(true)
    expect(from(page.button)).toBe(false)
    expect(from(page.link)).toBe(false)
  })

  it("stops listening once disposed", () => {
    const engine = embedded()
    engine.focusSurface()
    engine.dispose()

    expect(keyAt(page, page.canvas, "L").defaultPrevented).toBe(false)
  })
})

describe("createMemoryDrawingStore", () => {
  it("hands back what it was given, then what was last written", () => {
    const store = createMemoryDrawingStore("first")
    expect(store.read()).toBe("first")
    store.write("second")
    expect(store.read()).toBe("second")
    expect(createMemoryDrawingStore().read()).toBeNull()
  })
})
