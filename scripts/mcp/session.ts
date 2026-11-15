import {
  CadDriver,
  SvgScenePresenter,
  buildDrawingPreview,
} from "@mellowcad/engine"
import type { Entity, EntityId, Vec2 } from "@mellowcad/engine"
// WHY deep: the prototype measures before the engine grows a public surface
// for it; what the product needs exported is listed in `docs/next-mcp.md`.
import { entitiesBounds } from "../../cad/domain/entities"
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
    const bounds = entitiesBounds(
      this.entities(),
      this.cad.runtime.document.blockLookup()
    )
    if (!bounds) return "The drawing is empty."
    return (
      `${this.cad.entityCount} objects, extents ` +
      `${point(bounds.min)} to ${point(bounds.max)}`
    )
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

function num(value: number): string {
  const rounded = Math.round(value * 1e4) / 1e4
  return Object.is(rounded, -0) ? "0" : String(rounded)
}

function point(p: Vec2): string {
  return `(${num(p.x)},${num(p.y)})`
}

function degrees(radians: number): string {
  return num((radians * 180) / Math.PI)
}

function describeGeometry(entity: Entity): string {
  switch (entity.type) {
    case "line":
      return `line ${point(entity.start)} to ${point(entity.end)}`
    case "circle":
      return `circle center ${point(entity.center)} radius ${num(entity.radius)}`
    case "arc": {
      const at = (angle: number) => ({
        x: entity.center.x + entity.radius * Math.cos(angle),
        y: entity.center.y + entity.radius * Math.sin(angle),
      })
      return (
        `arc center ${point(entity.center)} radius ${num(entity.radius)} ` +
        `from ${degrees(entity.startAngle)}° to ${degrees(entity.endAngle)}° ccw, ` +
        `ends ${point(at(entity.startAngle))} ${point(at(entity.endAngle))}`
      )
    }
    case "polyline": {
      const vertices = entity.vertices.map((vertex, i) => {
        const bulge = entity.bulges?.[i] ?? 0
        return point(vertex) + (bulge === 0 ? "" : ` bulge ${num(bulge)}`)
      })
      return `polyline ${entity.closed ? "closed" : "open"} ${vertices.join(" ")}`
    }
    case "ellipse":
      return (
        `ellipse center ${point(entity.center)} major axis vector ` +
        `${point(entity.majorAxis)} ratio ${num(entity.ratio)}`
      )
    case "text":
      return (
        `text "${entity.value}" at ${point(entity.position)} ` +
        `height ${num(entity.height)} rotation ${degrees(entity.rotation)}°`
      )
    case "mtext":
      return (
        `mtext "${entity.contents}" at ${point(entity.position)} ` +
        `height ${num(entity.height)}`
      )
    case "dimension":
      return (
        `dimension ${entity.kind} from ${point(entity.first)} to ` +
        `${point(entity.second)}, dimension line through ${point(entity.linePoint)}`
      )
    case "hatch":
      return `hatch ${entity.patternId}, ${entity.loops.length} loop(s)`
    case "insert":
      return `block reference at ${point(entity.position)} rotation ${degrees(entity.rotation)}°`
    case "point":
      return `point ${point(entity.position)}`
    default:
      return entity.type
  }
}
