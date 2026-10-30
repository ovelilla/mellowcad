import { CadDriver } from "./CadDriver"
import type { CommandLineEntry } from "./CommandLine"
import type { DynamicFieldKind } from "./input/DynamicInput"
import { isCoordinateExpression } from "./input/coordinateInput"
import type { DocumentReader } from "../domain/Document"
import type { Bounds, EntityId } from "../domain/entities"
import type { LinetypeId } from "../domain/linetypes"
import type { Lineweight } from "../domain/lineweights"
import type { Vec2 } from "../geometry/Vec2"
import type { Scene } from "../scene/types"
import type { SnapType } from "./snapping/types"
import type { EngineLocale } from "../locales/types"
import { engineText, promptString, type PromptSegment } from "./EngineText"

/**
 * A scripted drafting session, written in the same chained style as the test
 * harness and replayed through {@link CadDriver}. Replaying it yields every
 * step's prompt, what the engine printed and which objects appeared — the raw
 * material for an animated transcript that cannot drift from the product.
 */

export type DemoAction =
  | { readonly kind: "command"; readonly text: string }
  | { readonly kind: "type"; readonly text: string }
  | { readonly kind: "enter" }
  | { readonly kind: "escape" }
  | { readonly kind: "option"; readonly id: string }
  | { readonly kind: "click"; readonly at: Vec2 }
  | { readonly kind: "moveTo"; readonly at: Vec2 }
  | { readonly kind: "hover"; readonly at: Vec2 }
  | { readonly kind: "down"; readonly at: Vec2 }
  | { readonly kind: "up"; readonly at: Vec2 }
  | { readonly kind: "press"; readonly key: string }
  | { readonly kind: "osnap"; readonly type: SnapType }
  | { readonly kind: "layer"; readonly name: string }

/** A layer the session starts with, as a drawing template would provide. */
export interface DemoLayer {
  readonly name: string
  readonly color?: string
  readonly linetype?: LinetypeId
  readonly lineweight?: Lineweight
}

export interface DemoOptions {
  /** View size the session runs at (and the final scene is framed in). */
  readonly width?: number
  readonly height?: number
  /** Running object snaps; off unless the script is about them. */
  readonly snap?: boolean
  readonly layers?: readonly DemoLayer[]
  /** DIMSCALE of the current dimension style, as a template sets it. */
  readonly dimScale?: number
  /** POLARANG, the polar tracking increment in degrees. */
  readonly polarAngle?: number
  /** Frame this rectangle before the first action (ZOOM Window). */
  readonly view?: Bounds
  /** Screen padding around {@link view}. */
  readonly viewPadding?: number
}

export class DemoScript {
  private constructor(
    readonly options: DemoOptions,
    readonly actions: readonly DemoAction[]
  ) {}

  static create(options: DemoOptions = {}): DemoScript {
    return new DemoScript(options, [])
  }

  /** Runs a command by name or alias, as typed at the `Command:` prompt. */
  command(text: string): DemoScript {
    return this.then({ kind: "command", text })
  }

  /** Types into the prompt's input; {@link enter} commits it. */
  type(text: string): DemoScript {
    return this.then({ kind: "type", text })
  }

  enter(): DemoScript {
    return this.then({ kind: "enter" })
  }

  escape(): DemoScript {
    return this.then({ kind: "escape" })
  }

  /**
   * Answers a `[Keyword]` prompt with the keyword whose global id is `id`
   * (`"Close"`), typed as the recording's command language spells it.
   */
  option(id: string): DemoScript {
    return this.then({ kind: "option", id })
  }

  click(x: number, y: number): DemoScript {
    return this.then({ kind: "click", at: { x, y } })
  }

  moveTo(x: number, y: number): DemoScript {
    return this.then({ kind: "moveTo", at: { x, y } })
  }

  /**
   * Rests the cursor on a point long enough for object snap tracking to
   * acquire it — the engine's own dwell, elapsed at once rather than timed.
   */
  hover(x: number, y: number): DemoScript {
    return this.then({ kind: "hover", at: { x, y } })
  }

  /** Presses the mouse button and holds it, as a selection box starts. */
  down(x: number, y: number): DemoScript {
    return this.then({ kind: "down", at: { x, y } })
  }

  up(x: number, y: number): DemoScript {
    return this.then({ kind: "up", at: { x, y } })
  }

  /** A key on the drawing surface, e.g. `F10` for Polar. */
  press(key: string): DemoScript {
    return this.then({ kind: "press", key })
  }

  /** A one-shot object snap, picked from the Shift+right-click menu. */
  osnap(type: SnapType): DemoScript {
    return this.then({ kind: "osnap", type })
  }

  /**
   * Makes a template layer current, as picking it in the Layer control does —
   * a click in the UI, so it prints nothing on the command line.
   */
  layer(name: string): DemoScript {
    return this.then({ kind: "layer", name })
  }

  private then(action: DemoAction): DemoScript {
    return new DemoScript(this.options, [...this.actions, action])
  }
}

/** Starts a script; each call returns a new script, so scripts can share a prefix. */
export function demo(options: DemoOptions = {}): DemoScript {
  return DemoScript.create(options)
}

/** What the engine was asking when an action was taken. */
export interface DemoPrompt {
  /** The running command's name, or null at the neutral `Command:` prompt. */
  readonly command: string | null
  /** The dynamic-input field being asked for, e.g. `Radius`. */
  readonly field: string | null
  readonly fieldKind: DynamicFieldKind | null
  /** The keywords offered, as the command line lists them. */
  readonly options: readonly string[]
  /**
   * The question the command asks as the history writes it, `Specify next
   * point or [Undo]:` — null when it names none.
   */
  readonly echo: readonly PromptSegment[] | null
}

export interface DemoStep {
  readonly action: DemoAction
  readonly prompt: DemoPrompt
  /** For an option, what was typed to answer it (its key, or abbreviation). */
  readonly answer?: string
  /** Lines the engine wrote to its scrollback while the action ran. */
  readonly output: readonly CommandLineEntry[]
  readonly added: readonly EntityId[]
  readonly removed: readonly EntityId[]
}

export interface DemoRecording {
  /** The language it was recorded in; English when left out. */
  readonly locale?: EngineLocale
  readonly steps: readonly DemoStep[]
  /** The drawing as the session left it. */
  readonly document: DocumentReader
  /**
   * The editor's own frame at the end of the session — overlays, markers and
   * tooltips included, since those are what a precision demo is about.
   */
  readonly scene: Scene
}

export interface RecordOptions {
  /**
   * The language to record in, so a build can record the same script in every
   * language it publishes without any state shared between them.
   */
  readonly locale?: EngineLocale
}

/**
 * Replays `script` on a fresh headless engine. Asynchronous because a command
 * may wait on a host port (PASTECLIP reads the clipboard), never on the clock:
 * a recording is the same however loaded the machine that makes it.
 */
export async function recordDemo(
  script: DemoScript,
  { locale }: RecordOptions = {}
): Promise<DemoRecording> {
  const { options } = script
  const driver = new CadDriver({
    width: options.width,
    height: options.height,
    snap: options.snap ?? false,
    clipboard: null,
    locale,
  })
  try {
    const runtime = driver.runtime
    // A demo is a drawing, not the editor: no grid behind it, and no F7
    // echoed into its transcript.
    runtime.document.setDraftingModes({ gridMode: false })
    const layers = new Map<string, string>(
      runtime.document.getLayers().map((layer) => [layer.name, layer.id])
    )
    for (const layer of options.layers ?? []) {
      const id = runtime.createLayer(layer.name, layer.color, false)
      runtime.updateLayer(id, {
        ...(layer.linetype !== undefined && { linetype: layer.linetype }),
        ...(layer.lineweight !== undefined && { lineweight: layer.lineweight }),
      })
      layers.set(layer.name, id)
    }
    if (options.dimScale !== undefined) runtime.setDimScale(options.dimScale)
    if (options.polarAngle !== undefined) {
      runtime.setPolarAngleStep(options.polarAngle)
    }
    if (options.view) {
      runtime.viewport.zoomToBounds(
        options.view.min,
        options.view.max,
        options.viewPadding ?? 0
      )
    }

    const steps: DemoStep[] = []
    for (const action of script.actions) {
      const prompt = currentPrompt(driver)
      const linesBefore = runtime.commandLine.getLines().length
      const idsBefore = new Set(driver.entities().map((entity) => entity.id))
      const answer =
        action.kind === "option" ? driver.optionAnswer(action.id) : undefined

      await perform(driver, action, layers)

      const idsAfter = driver.entities().map((entity) => entity.id)
      const after = new Set(idsAfter)
      steps.push({
        action,
        prompt,
        ...(answer !== undefined && { answer }),
        output: runtime.commandLine.getLines().slice(linesBefore),
        added: idsAfter.filter((id) => !idsBefore.has(id)),
        removed: [...idsBefore].filter((id) => !after.has(id)),
      })
    }

    return {
      ...(locale && { locale }),
      steps,
      document: runtime.document,
      scene: runtime.buildScene(),
    }
  } finally {
    driver.dispose()
  }
}

// Awaited even where nothing in it waits: the turn lets a port's answer
// (the clipboard's, settled at once) reach its command before the next step.
async function perform(
  driver: CadDriver,
  action: DemoAction,
  layers: ReadonlyMap<string, string>
): Promise<void> {
  switch (action.kind) {
    case "command":
      driver.command(action.text)
      return
    case "type":
      driver.type(action.text)
      return
    case "enter":
      driver.enter()
      return
    case "escape":
      driver.escape()
      return
    case "option":
      driver.option(action.id)
      return
    case "click":
      driver.click(action.at)
      return
    case "moveTo":
      driver.moveTo(action.at)
      return
    case "hover":
      // WHY no timer: a build's prerender records many figures at once, and
      // with its event loop late Node runs every due timer of one duration
      // before the next, so a wait past the dwell could fire before the
      // dwell itself and the point went unacquired.
      driver.moveTo(action.at)
      driver.runtime.tracking.elapseDwell()
      driver.runtime.parallelRefs.elapseDwell()
      return
    case "down":
      driver.mouseDown(action.at)
      return
    case "up":
      driver.mouseUp(action.at)
      return
    case "press":
      driver.press(action.key)
      return
    case "osnap":
      driver.runtime.setSnapOverride(action.type)
      return
    case "layer": {
      const id = layers.get(action.name)
      if (id === undefined) throw new Error(`No layer "${action.name}".`)
      driver.runtime.setCurrentLayer(id)
      return
    }
  }
}

function currentPrompt(driver: CadDriver): DemoPrompt {
  const state = driver.state()
  const input = driver.runtime.dynamicInput
  const session = input.isOpen() ? input.getSession() : null
  const activeId = input.getActiveFieldId()
  const field =
    session?.fields.find((f) => f.id === activeId) ?? session?.fields[0]
  return {
    command: state.commandLine.command,
    field:
      field?.label ??
      (field?.prompt === undefined
        ? null
        : driver.runtime.text.prompt(field.prompt)),
    fieldKind: field?.kind ?? null,
    options: state.commandOptions.map((option) => option.label),
    echo: state.commandLine.question,
  }
}

/** One line of a session's command-line history, as AutoCAD would scroll it. */
export interface TranscriptLine {
  /** `command`: a command started; `input`: a prompt answered; else a report. */
  readonly kind: "command" | "input" | "info" | "error"
  /** For an answered prompt, the question; empty otherwise. */
  readonly prompt: string
  /** The same question in spans, its keyword list set apart. */
  readonly segments: readonly PromptSegment[]
  /** The command's name, what was typed (empty for a pick), or the report. */
  readonly text: string
  /** Which step produced the line. */
  readonly step: number
}

/**
 * Folds a recording into command-line history: `Command: NAME` for each command
 * started, `<prompt>: <answer>` for each prompt answered — a typed value, an
 * option letter, or nothing for a pick or a bare Enter — and whatever the
 * engine reported. Moving the cursor, cancelling, switching layers or picking
 * from a menu answer nothing, so they leave no line.
 */
export function transcript(recording: DemoRecording): TranscriptLine[] {
  const lines: TranscriptLine[] = []
  let typed = ""
  recording.steps.forEach((step, index) => {
    const { action } = step
    if (action.kind === "type") {
      typed = action.text
      return
    }
    const answer =
      action.kind === "enter"
        ? typed
        : action.kind === "option"
          ? (step.answer ?? action.id)
          : action.kind === "click"
            ? ""
            : null
    typed = ""
    if (answer !== null) {
      const segments = promptSegments(step.prompt, answer, recording.locale)
      const prompt = promptString(segments)
      // The engine's own line, when it wrote one, also says what a pick found
      // (`Select objects: 1 found`).
      const written = step.output.find(
        (entry) => entry.kind === "prompt" && entry.text.startsWith(prompt)
      )
      lines.push({
        kind: "input",
        prompt,
        segments,
        text: written ? written.text.slice(prompt.length).trim() : answer,
        step: index,
      })
    }
    // The prompts the engine wrote answered are the ones folded in above.
    for (const entry of step.output) {
      if (entry.kind === "prompt") continue
      lines.push({
        kind: entry.kind,
        prompt: "",
        segments: [],
        text: entry.text,
        step: index,
      })
    }
  })
  return lines
}

/**
 * `Specify next point or [Undo]:` — the question the command asks, as its
 * history writes it — or, for a command that names none, `Radius [Diameter]:`:
 * the field asked for, else the command, plus its keywords, in spans. A point
 * typed where the box offered a distance is no answer to that field — the box
 * turns into X,Y — so the command's own prompt is the question it answered.
 */
export function promptSegments(
  prompt: DemoPrompt,
  answer = "",
  locale?: EngineLocale
): PromptSegment[] {
  if (prompt.echo !== null) return [...prompt.echo]
  const text = engineText(locale)
  const pointForDistance =
    prompt.fieldKind !== "coordinate" && isCoordinateExpression(answer)
  const field = prompt.field && !pointForDistance ? prompt.field : null
  const head = field ?? prompt.command ?? text.idleHead()
  return text.composePrompt(head, prompt.options)
}

/** {@link promptSegments} as one string. */
export function promptText(
  prompt: DemoPrompt,
  answer = "",
  locale?: EngineLocale
): string {
  return promptString(promptSegments(prompt, answer, locale))
}
