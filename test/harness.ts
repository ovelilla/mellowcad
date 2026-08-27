import { onTestFinished } from "vitest"
import { CadRuntime } from "../cad/application/CadRuntime"
import type { EngineState } from "../cad/application/EngineState"
import type {
  DrawingStore,
  EngineHost,
  FileTransport,
} from "../cad/application/ports"
import type { Entity, EntityId } from "../cad/domain/entities"
import type { Scene } from "../cad/scene/types"
import type { Vec2 } from "../cad/geometry/Vec2"

/**
 * A headless driver for the whole engine.
 *
 * `CadRuntime` is deliberately DOM-free — it talks to the outside world only
 * through the {@link EngineHost} and {@link DrawingStore} ports — so a tool can
 * be exercised exactly as a user would drive it (move, click, type, press keys)
 * without a browser, a canvas or a screenshot. That makes tool behaviour
 * *unit*-testable: no coordinate calibration, no synthetic pointer events, no
 * waiting for a render.
 *
 * Everything is expressed in **world coordinates**; the harness projects
 * through the live viewport, so a test stays correct even if a command zooms.
 *
 * ```ts
 * const cad = createHarness()
 * cad.command("LINE").type("0,0").enter().type("@100,0").enter().escape()
 * expect(cad.only<LineEntity>("line").end).toBeCloseToPoint(p(100, 0))
 * ```
 */

export interface RecordingHost extends EngineHost {
  /** How many frames the runtime asked for; a cheap "did anything change?". */
  readonly renderCount: number
  /** Every cursor the runtime set, in order. */
  readonly cursors: readonly string[]
  readonly focusCount: number
}

function createRecordingHost(): RecordingHost {
  const cursors: string[] = []
  let renderCount = 0
  let focusCount = 0
  return {
    requestRender: () => {
      renderCount += 1
    },
    setCursor: (cursor) => {
      cursors.push(cursor)
    },
    focusSurface: () => {
      focusCount += 1
    },
    get renderCount() {
      return renderCount
    },
    get cursors() {
      return cursors
    },
    get focusCount() {
      return focusCount
    },
  }
}

/** In-memory {@link DrawingStore}, for exercising autosave/restore. */
export class MemoryStore implements DrawingStore {
  private text: string | null
  readonly writes: string[] = []

  constructor(initial: string | null = null) {
    this.text = initial
  }

  read(): string | null {
    return this.text
  }

  write(text: string): void {
    this.text = text
    this.writes.push(text)
  }
}

/**
 * In-memory {@link FileTransport}, for exercising SAVE/OPEN. `open()` hands
 * back {@link nextFile} — `null` stands for a cancelled pick.
 */
export class MemoryFileTransport implements FileTransport {
  readonly saved: { text: string; fileName: string }[] = []
  openCalls = 0
  nextFile: string | null = null
  /** Set to make `open()` reject, as an unreadable file would. */
  openError: Error | null = null

  constructor(nextFile: string | null = null) {
    this.nextFile = nextFile
  }

  save(text: string, fileName: string): void {
    this.saved.push({ text, fileName })
  }

  open(): Promise<string | null> {
    this.openCalls += 1
    if (this.openError) return Promise.reject(this.openError)
    return Promise.resolve(this.nextFile)
  }
}

export interface HarnessOptions {
  /** Viewport size in CSS pixels. The default keeps world→screen trivial. */
  readonly width?: number
  readonly height?: number
  /** Geometry present before the test starts (loaded outside the undo stack). */
  readonly entities?: readonly Entity[]
  /**
   * Running object snaps. Off by default so a click lands exactly where the
   * test asked; turn it on in tests that are *about* snapping.
   */
  readonly snap?: boolean
  readonly store?: DrawingStore | null
  /** File save/open. Absent means the host offers none (SSR, headless). */
  readonly files?: FileTransport | null
}

export interface PointerModifiers {
  readonly shiftKey?: boolean
  readonly ctrlKey?: boolean
  readonly altKey?: boolean
  readonly button?: number
}

export class CadHarness {
  readonly runtime: CadRuntime
  readonly host: RecordingHost

  constructor(options: HarnessOptions = {}) {
    this.host = createRecordingHost()
    this.runtime = new CadRuntime(
      this.host,
      options.store ?? null,
      options.files ?? null
    )
    this.runtime.setViewSize(options.width ?? 1000, options.height ?? 800)
    this.runtime.snapping.setActive(options.snap ?? false)
    if (options.entities?.length) {
      this.runtime.document.load(options.entities)
    }
    // Park the pointer at the view centre. Real users always have the mouse
    // *somewhere*, and the runtime replays that position when a command starts
    // from the keyboard so its prompt appears immediately.
    this.moveTo({ x: 0, y: 0 })
  }

  dispose(): void {
    this.runtime.dispose()
  }

  // ---- coordinates -------------------------------------------------------

  /** World → screen through the live viewport (survives zoom/pan). */
  toScreen(world: Vec2): Vec2 {
    return this.runtime.viewport.worldToScreen(world)
  }

  toWorld(screen: Vec2): Vec2 {
    return this.runtime.viewport.screenToWorld(screen)
  }

  // ---- pointer -----------------------------------------------------------

  moveTo(world: Vec2, modifiers: PointerModifiers = {}): this {
    this.runtime.pointerMove(this.pointerEvent(world, modifiers))
    return this
  }

  /** A full press-and-release at one point: the ordinary "pick". */
  click(world: Vec2, modifiers: PointerModifiers = {}): this {
    const event = this.pointerEvent(world, modifiers)
    this.runtime.pointerMove(event)
    this.runtime.pointerDown(event)
    this.runtime.pointerUp(event)
    return this
  }

  /**
   * Two picks followed by the double-click the browser then fires — the order
   * the real adapter delivers, so the tool sees the selection the clicks made.
   */
  doubleClick(world: Vec2, modifiers: PointerModifiers = {}): this {
    this.click(world, modifiers)
    this.click(world, modifiers)
    this.runtime.doubleClick(this.pointerEvent(world, modifiers))
    return this
  }

  /**
   * A press-move-release gesture. Two intermediate moves are sent so tools that
   * only start dragging past a pixel threshold (box selection, grips) see the
   * motion they expect.
   */
  drag(from: Vec2, to: Vec2, modifiers: PointerModifiers = {}): this {
    const start = this.pointerEvent(from, modifiers)
    this.runtime.pointerMove(start)
    this.runtime.pointerDown(start)
    const midpoint = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 }
    this.runtime.pointerMove(this.pointerEvent(midpoint, modifiers))
    const end = this.pointerEvent(to, modifiers)
    this.runtime.pointerMove(end)
    this.runtime.pointerUp(end)
    return this
  }

  wheel(world: Vec2, deltaY: number): this {
    this.runtime.wheel({ screen: this.toScreen(world), deltaY })
    return this
  }

  private pointerEvent(world: Vec2, modifiers: PointerModifiers) {
    return {
      screen: this.toScreen(world),
      button: modifiers.button ?? 0,
      shiftKey: modifiers.shiftKey ?? false,
      ctrlKey: modifiers.ctrlKey ?? false,
      altKey: modifiers.altKey ?? false,
    }
  }

  // ---- keyboard ----------------------------------------------------------

  /** Sends a key to the drawing surface. Returns whether it was consumed. */
  press(
    key: string,
    modifiers: Omit<PointerModifiers, "button"> = {}
  ): boolean {
    return this.runtime.keyDown({
      key,
      shiftKey: modifiers.shiftKey ?? false,
      ctrlKey: modifiers.ctrlKey ?? false,
      altKey: modifiers.altKey ?? false,
    })
  }

  /**
   * True when a dynamic-input *field* is on screen. This mirrors focus in the
   * real UI: a session with fields auto-focuses its input (so keys go to the
   * box), whereas a keyword-only prompt renders chips and leaves focus on the
   * canvas. Routing test keystrokes the same way keeps the tests honest.
   */
  hasFocusedField(): boolean {
    const session = this.runtime.dynamicInput.getSession()
    return (
      this.runtime.dynamicInput.isOpen() && (session?.fields.length ?? 0) > 0
    )
  }

  /** Types into a dynamic-input field (the active one unless `fieldId` given). */
  type(text: string, fieldId?: string): this {
    this.runtime.setDynamicInputText(text, fieldId)
    return this
  }

  /** Enter: commits dynamic input when open, otherwise goes to the runtime. */
  enter(): this {
    if (this.hasFocusedField()) {
      this.runtime.commitDynamicInput()
    } else {
      this.press("Enter")
    }
    return this
  }

  /** Escape: cancels dynamic input when open, otherwise goes to the runtime. */
  escape(): this {
    if (this.hasFocusedField()) {
      this.runtime.cancelDynamicInput()
    } else {
      this.press("Escape")
    }
    return this
  }

  /**
   * Presses a command-option keyword (AutoCAD's `[Close/Undo]`). Routed like
   * the UI does: through the focused input when there is one, else as a plain
   * key press, which the runtime resolves against the tool's options first.
   */
  option(key: string): this {
    if (this.hasFocusedField()) {
      this.runtime.invokeToolOption(key)
    } else {
      this.press(key)
    }
    return this
  }

  // ---- commands ----------------------------------------------------------

  /** Runs a command by name or alias, as typing it at the prompt would. */
  command(text: string): this {
    this.runtime.runCommand(text)
    return this
  }

  tool(id: string): this {
    this.runtime.setActiveTool(id)
    return this
  }

  activeToolId(): string {
    return this.state().activeToolId
  }

  undo(): this {
    this.runtime.undo()
    return this
  }

  redo(): this {
    this.runtime.redo()
    return this
  }

  // ---- selection ---------------------------------------------------------

  select(...ids: EntityId[]): this {
    this.runtime.selection.set(ids)
    return this
  }

  selectAll(): this {
    return this.select(...this.entities().map((entity) => entity.id))
  }

  selectedIds(): EntityId[] {
    return this.runtime.selection.toArray()
  }

  // ---- reading -----------------------------------------------------------

  entities(): Entity[] {
    return this.runtime.document.getEntities()
  }

  get entityCount(): number {
    return this.runtime.document.size
  }

  /** The most recently added entity — what a draw command just produced. */
  latest(): Entity {
    const entities = this.entities()
    const entity = entities[entities.length - 1]
    if (!entity) throw new Error("The drawing is empty.")
    return entity
  }

  /**
   * The single entity of `type` in the drawing, failing loudly otherwise. Makes
   * a wrong entity count fail with a useful message instead of a `undefined`
   * property access three lines later.
   */
  only<T extends Entity>(type: Entity["type"]): T {
    const matches = this.entities().filter((entity) => entity.type === type)
    if (matches.length !== 1) {
      throw new Error(
        `expected exactly one ${type} but found ${matches.length} ` +
          `(drawing: ${
            this.entities()
              .map((e) => e.type)
              .join(", ") || "empty"
          })`
      )
    }
    return matches[0] as T
  }

  byId<T extends Entity>(id: EntityId): T {
    const entity = this.runtime.document.get(id)
    if (!entity) throw new Error(`No entity with id "${id}".`)
    return entity as T
  }

  typeCounts(): Record<string, number> {
    const counts: Record<string, number> = {}
    for (const entity of this.entities()) {
      counts[entity.type] = (counts[entity.type] ?? 0) + 1
    }
    return counts
  }

  state(): EngineState {
    return this.runtime.getState()
  }

  scene(): Scene {
    return this.runtime.buildScene()
  }

  /** The keyword chips the active tool currently offers. */
  optionKeys(): string[] {
    return this.state().commandOptions.map((option) => option.key)
  }

  /** Everything written to the command prompt, in order. */
  commandLog(): string[] {
    return this.state().commandLine.lines.map((line) => line.text)
  }
}

/**
 * Creates a harness and disposes it when the test ends, so a forgotten teardown
 * can never leak a timer into the next test.
 */
export function createHarness(options: HarnessOptions = {}): CadHarness {
  const harness = new CadHarness(options)
  onTestFinished(() => harness.dispose())
  return harness
}
