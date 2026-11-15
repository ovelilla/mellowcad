import {
  CadDriver,
  SvgScenePresenter,
  buildDrawingPreview,
} from "@mellowcad/engine"
import type { Entity, EntityId } from "@mellowcad/engine"
import { describeGeometry, extentsText } from "../../lib/mcp/describe"
import {
  SCRIPT_VIEW,
  runScript,
  type ScriptStop,
  type ScriptTarget,
} from "../../lib/command-script"

export interface RunResult {
  /** The command line's history for this script, as AutoCAD's would read. */
  readonly transcript: readonly string[]
  readonly stopped: ScriptStop | null
  /** The prompt a command was still asking when the script ended, then cancelled. */
  readonly cancelled: string | null
  readonly added: readonly Entity[]
  readonly modified: readonly Entity[]
  readonly removed: readonly EntityId[]
}

export interface LayerRequest {
  readonly name: string
  /** `#rrggbb`. */
  readonly color?: string
}

const VIEW = SCRIPT_VIEW

/**
 * One drawing an agent works on through the engine's command line: every
 * line is typed at the prompt and entered, as a user would, so what the
 * agent reads back is the history AutoCAD's command window would show.
 *
 * WHY the driver's internal `runtime` still: the layers, the files and the
 * document a picture is drawn from have no public way yet; the brief says
 * which belong on the package (`docs/next-mcp.md`, §6).
 */
export class DrawingSession {
  private cad: CadDriver
  /** Short handles for the engine's long ids: what a listing shows. */
  private readonly handles = new Map<EntityId, number>()
  private readonly ids = new Map<number, EntityId>()

  constructor() {
    // WHY off the drawing: the editor types a link's script with no pointer
    // yet, and a length typed alone runs towards the cursor.
    this.cad = new CadDriver(VIEW).leave()
  }

  dispose(): void {
    this.cad.dispose()
  }

  reset(): void {
    this.cad.dispose()
    this.cad = new CadDriver(VIEW).leave()
    this.handles.clear()
    this.ids.clear()
  }

  entities(): Entity[] {
    return this.cad.entities()
  }

  handleOf(id: EntityId): number {
    let handle = this.handles.get(id)
    if (handle === undefined) {
      handle = this.handles.size + 1
      this.handles.set(id, handle)
      this.ids.set(handle, id)
    }
    return handle
  }

  /**
   * Types `script` at the command line, a line at a time. It starts at
   * `Command:` (a command left open is cancelled first, as a menu macro's
   * `^C^C` does) with `select` preselected, stops at the first line the
   * engine refuses, and cancels what is still asking at its end: a derailed
   * script would otherwise answer the wrong prompts with its remaining lines.
   */
  run(script: string, select: readonly number[] = []): RunResult {
    this.cancel()
    const before = new Map(this.entities().map((e) => [e.id, e]))
    const logBefore = this.cad.state().commandLine.lines
    if (select.length > 0) {
      this.cad.select(...select.flatMap((handle) => this.ids.get(handle) ?? []))
    }
    const { stopped, cancelled } = runScript(this.target(), script)
    const after = this.entities()
    const afterIds = new Set(after.map((e) => e.id))
    return {
      transcript: newLines(logBefore, this.cad.state().commandLine.lines),
      stopped,
      cancelled,
      added: after.filter((e) => !before.has(e.id)),
      modified: after.filter((e) => before.has(e.id) && before.get(e.id) !== e),
      removed: [...before.keys()].filter((id) => !afterIds.has(id)),
    }
  }

  private target(): ScriptTarget {
    const cad = this.cad
    return {
      keyIn: (line) => cad.keyIn(line),
      getState: () => cad.state(),
      zoomToFit: () => cad.zoomToFit(),
      cancelCommand: () => cad.cancelCommand(),
      withViewSize: (width, height, work) =>
        cad.withViewSize(width, height, work),
    }
  }

  /** Escape until `Command:`; the prompt that was asking, if one was. */
  private cancel(): string | null {
    if (this.cad.activeToolId() === "select") return null
    const prompt = this.cad.state().commandLine.prompt
    this.cad.cancelCommand()
    return prompt
  }

  /** Makes `name` the current layer, creating it when the drawing has none so named. */
  layer(request: LayerRequest): string {
    const runtime = this.cad.runtime
    this.cancel()
    const existing = runtime.document
      .getLayers()
      .find((l) => l.name.toLowerCase() === request.name.toLowerCase())
    if (existing) {
      runtime.setCurrentLayer(existing.id)
      if (request.color !== undefined) {
        runtime.updateLayer(existing.id, { color: request.color })
      }
      return `Layer "${existing.name}" is now current.`
    }
    runtime.createLayer(request.name, request.color)
    return `Layer "${request.name}" created and made current.`
  }

  layersText(): string {
    const document = this.cad.runtime.document
    const current = document.getCurrentLayerId()
    const counts = new Map<string, number>()
    for (const entity of this.entities()) {
      counts.set(entity.layerId, (counts.get(entity.layerId) ?? 0) + 1)
    }
    return document
      .getLayers()
      .map(
        (layer) =>
          `${layer.name}${layer.id === current ? " (current)" : ""}: ` +
          `${counts.get(layer.id) ?? 0} objects, color ${layer.color}`
      )
      .join("\n")
  }

  layerName(entity: Entity): string {
    return (
      this.cad.runtime.document.getLayer(entity.layerId)?.name ?? entity.layerId
    )
  }

  extentsText(): string {
    return extentsText(this.cad.entityCount, this.cad.extents())
  }

  /** `#handle type layer geometry`, a line per object. */
  describe(entity: Entity): string {
    return `#${this.handleOf(entity.id)} ${describeGeometry(entity)} layer=${this.layerName(entity)}`
  }

  async openFile(name: string, bytes: Uint8Array): Promise<readonly string[]> {
    this.cancel()
    const logBefore = this.cad.state().commandLine.lines
    await this.cad.openFile({ name, bytes })
    this.cad.zoomToFit()
    this.handles.clear()
    this.ids.clear()
    return newLines(logBefore, this.cad.state().commandLine.lines)
  }

  drawingFile(): string {
    return this.cad.runtime.serializeDrawing()
  }

  /** The drawing as an AutoCAD 2018 DXF, with no step in the agent's undo history. */
  async dxf(): Promise<Uint8Array> {
    return (await this.cad.writeDxf()).bytes
  }

  /** The objects alone, framed, as an SVG document; null for an empty drawing. */
  svg(width = 1200, height = 900): string | null {
    const scene = buildDrawingPreview(this.cad.runtime.document, {
      width,
      height,
      padding: 40,
    })
    if (!scene) return null
    return new SvgScenePresenter().render(scene, {
      background: true,
      attributes: { width, height },
    })
  }
}

/**
 * The lines of `after` written since `before`. The log keeps its entries'
 * identity and drops its oldest, so the last entry of `before` still in
 * `after` marks where the new ones start.
 */
function newLines(
  before: readonly { readonly text: string }[],
  after: readonly { readonly text: string }[]
): string[] {
  for (let i = before.length - 1; i >= 0; i--) {
    const at = after.lastIndexOf(before[i])
    if (at >= 0) return after.slice(at + 1).map((line) => line.text)
  }
  return after.map((line) => line.text)
}
