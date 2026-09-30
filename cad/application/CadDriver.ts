import { CadRuntime } from "./CadRuntime"
import { TOOL_COMMANDS } from "./CommandLine"
import { abbreviationOf } from "../i18n/keywords"
import source from "../locales/en.json"
import type { EngineLocale } from "../locales/types"
import type { EngineState } from "./EngineState"
import type {
  Clipboard,
  DrawingStore,
  EngineHost,
  FileTransport,
} from "./ports"
import type { BlockDefinition, Entity, EntityId } from "../domain/entities"
import type { Scene } from "../scene/types"
import type { Vec2 } from "../geometry/Vec2"

/**
 * Drives a headless {@link CadRuntime} exactly as a user would — move, click,
 * type, press keys — with no browser, canvas or screenshot involved.
 *
 * It is the one way the engine is scripted: the test harness wraps it, and the
 * landing replays its demo scripts through it at build time, so a prompt shown
 * on the page is the prompt the engine printed and a script that stops working
 * fails a test rather than silently lying.
 *
 * Everything is in **world coordinates**, projected through the live viewport,
 * so a script stays correct even if a command zooms.
 */

export interface RecordingHost extends EngineHost {
  /** How many frames the runtime asked for; a cheap "did anything change?". */
  readonly renderCount: number
  /** Every cursor the runtime set, in order. */
  readonly cursors: readonly string[]
  readonly focusCount: number
}

export function createRecordingHost(): RecordingHost {
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

export interface CadDriverOptions {
  /** Viewport size in CSS pixels. The default keeps world→screen trivial. */
  readonly width?: number
  readonly height?: number
  /** Geometry present before the script starts (loaded outside the undo stack). */
  readonly entities?: readonly Entity[]
  /** Block definitions present before the script starts. */
  readonly blocks?: readonly BlockDefinition[]
  /**
   * Running object snaps. Off by default so a click lands exactly where the
   * script asked; turn it on for scripts that are *about* snapping.
   */
  readonly snap?: boolean
  /**
   * The UCS icon. Off by default so a frame holds only what the script drew;
   * turn it on for scripts that are *about* the icon.
   */
  readonly ucsIcon?: boolean
  readonly store?: DrawingStore | null
  /** The language the engine speaks; English when left out. */
  readonly locale?: EngineLocale
  /** File save/open. Absent means the host offers none (SSR, headless). */
  readonly files?: FileTransport | null
  readonly clipboard?: Clipboard | null
}

export interface PointerModifiers {
  readonly shiftKey?: boolean
  readonly ctrlKey?: boolean
  readonly altKey?: boolean
  readonly button?: number
}

export class CadDriver {
  readonly runtime: CadRuntime
  readonly host: RecordingHost
  readonly clipboard: Clipboard | null

  constructor(options: CadDriverOptions = {}) {
    this.host = createRecordingHost()
    this.clipboard = options.clipboard ?? null
    this.runtime = new CadRuntime(
      this.host,
      options.store ?? null,
      options.files ?? null,
      this.clipboard,
      { locale: options.locale }
    )
    this.runtime.setViewSize(options.width ?? 1000, options.height ?? 800)
    this.runtime.snapping.setActive(options.snap ?? false)
    this.runtime.setUcsIconShown(options.ucsIcon ?? false)
    if (options.entities?.length || options.blocks?.length) {
      this.runtime.document.load(options.entities ?? [], {
        blocks: options.blocks,
      })
    }
    // Park the pointer at the view centre. Real users always have the mouse
    // *somewhere*, and the runtime replays that position when a command starts
    // from the keyboard so its prompt appears immediately.
    this.moveTo({ x: 0, y: 0 })
  }

  dispose(): void {
    this.runtime.dispose()
  }

  /** World → screen through the live viewport (survives zoom/pan). */
  toScreen(world: Vec2): Vec2 {
    return this.runtime.viewport.worldToScreen(world)
  }

  toWorld(screen: Vec2): Vec2 {
    return this.runtime.viewport.screenToWorld(screen)
  }

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

  /** The press half of a gesture, left held until {@link mouseUp}. */
  mouseDown(world: Vec2, modifiers: PointerModifiers = {}): this {
    const event = this.pointerEvent(world, modifiers)
    this.runtime.pointerMove(event)
    this.runtime.pointerDown(event)
    return this
  }

  mouseUp(world: Vec2, modifiers: PointerModifiers = {}): this {
    const event = this.pointerEvent(world, modifiers)
    this.runtime.pointerMove(event)
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
   * canvas. Routing scripted keystrokes the same way keeps them honest.
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
   * Answers a keyword prompt (AutoCAD's `[Close/Undo]`) with the keyword whose
   * global id is `id` — `option("Close")` in every language — typed as a
   * user of the command language would: its key when it has one, otherwise its
   * abbreviation and Enter. Routed like the UI does: through the focused input
   * when there is one, else on the drawing surface, which resolves keywords
   * before anything else. An id the running command does not have is a
   * mistake in the script, and throws.
   */
  option(id: string): this {
    const typed = this.optionAnswer(id)
    const offered = this.state().commandOptions.find(
      (option) => option.id === id
    )
    // A keyword not on offer is typed like any other letter — the prompt
    // ignores it exactly as it ignores a stray key.
    const immediate = offered ? offered.key !== null : typed.length === 1
    if (immediate) {
      if (this.hasFocusedField()) this.runtime.invokeToolOption(typed)
      else this.press(typed)
    } else if (this.hasFocusedField()) {
      this.type(typed).enter()
    } else {
      for (const char of typed) this.press(char)
      this.press("Enter")
    }
    return this
  }

  /**
   * What a user types to answer with keyword `id` at the current prompt: the
   * key that runs it, or else its abbreviation in the command language.
   */
  optionAnswer(id: string): string {
    const toolId = this.activeToolId()
    const command = TOOL_COMMANDS[toolId] ?? null
    const text = this.runtime.text
    const inventory: Readonly<Record<string, object>> = source.commands.keywords
    if (command === null || !(id in (inventory[command] ?? {}))) {
      throw new Error(`"${id}" is not a keyword of ${command ?? toolId}.`)
    }
    const offered = this.state().commandOptions.find(
      (option) => option.id === id
    )
    return (
      offered?.key ??
      offered?.abbreviation ??
      abbreviationOf(text.keyword(command, id))
    )
  }

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

  /** The keys of the keyword chips the active tool currently offers. */
  optionKeys(): (string | null)[] {
    return this.state().commandOptions.map((option) => option.key)
  }

  /** The global ids of the keywords the active tool currently offers. */
  optionIds(): string[] {
    return this.state().commandOptions.map((option) => option.id)
  }

  /** Everything written to the command prompt, in order. */
  commandLog(): string[] {
    return this.state().commandLine.lines.map((line) => line.text)
  }
}
