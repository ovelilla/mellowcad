import {
  SvgScenePresenter,
  THEME,
  buildDrawingPreview,
  demo,
  entityDrawOrder,
  primitiveLength,
  promptText,
  recordDemo,
  themePalette,
  transcript,
  type Bounds,
  type DemoRecording,
  type DemoScript,
  type Entity,
  type EntityId,
  type ScenePrimitive,
  type TranscriptLine,
} from "@/cad"

/**
 * Turns a recorded session into what the landing shows: the drawing as SVG,
 * each primitive carrying the moment it is plotted, and the command-line
 * history timed to match. Runs at build time only — it replays the engine.
 */

/** Geist Mono's capitals are 0.71 of its em (OS/2 sCapHeight 710 / 1000). */
export const DRAWING_FONT = "var(--font-mono), ui-monospace, monospace"
const DRAWING_FONT_CAP_RATIO = 0.71

/** Typing speed of the scripted user. Fast — this is a practised hand. */
const CHAR_MS = 42
/** An Enter, an option letter or a pick, once the input is ready. */
const KEY_MS = 140
const PICK_MS = 260
/** Picking a layer from the Layer control. */
const LAYER_MS = 320
const LEAD_IN_MS = 500

/** A plotted stroke takes 250–700 ms, by how far the pen travels. */
const PLOT_MIN_MS = 250
const PLOT_MAX_MS = 700
const PLOT_MS_PER_PX = 1.4
/** Primitives of one step start 40–80 ms apart. */
const STAGGER_MS = 55

/** The whole sequence is held to this, so it never outstays its welcome. */
const MAX_TOTAL_MS = 11_500

export interface PlotOptions {
  readonly width: number
  readonly height: number
  readonly padding?: number
  /** What to frame; the whole drawing by default. */
  readonly frame?: Bounds
}

export interface PlottedLine extends TranscriptLine {
  /** When the line starts to appear, in ms from the start. */
  readonly at: number
  /** How long its typed part takes to type. */
  readonly typing: number
}

export interface Plot {
  readonly width: number
  readonly height: number
  /** The drawing's elements, each timed with `--t` / `--d` (ms). */
  readonly markup: string
  readonly lines: readonly PlottedLine[]
  /** When the last stroke lands. */
  readonly duration: number
  readonly recording: DemoRecording
}

/** How long an action takes the scripted user before its effect shows. */
function actionMs(action: DemoRecording["steps"][number]["action"]): number {
  switch (action.kind) {
    case "command":
      return action.text.length * CHAR_MS + KEY_MS
    case "type":
      return action.text.length * CHAR_MS
    case "option":
      return CHAR_MS + KEY_MS
    case "enter":
    case "escape":
      return KEY_MS
    case "click":
    case "moveTo":
    case "hover":
    case "down":
    case "up":
      return PICK_MS
    case "press":
    case "osnap":
      return KEY_MS
    case "layer":
      return LAYER_MS
  }
}

function strokeMs(length: number): number {
  return Math.min(
    PLOT_MAX_MS,
    Math.max(PLOT_MIN_MS, PLOT_MIN_MS + length * PLOT_MS_PER_PX)
  )
}

/**
 * Replays `script` and times it. An object is plotted when the step that
 * created it runs; the drawing shown is the one the session ends with, so an
 * object edited later appears in its final shape from the start.
 */
export async function plotDemo(
  script: DemoScript,
  options: PlotOptions
): Promise<Plot> {
  const recording = await recordDemo(script)
  const { document } = recording
  const scene = (entities: readonly Entity[]) =>
    buildDrawingPreview(document, {
      width: options.width,
      height: options.height,
      padding: options.padding ?? 0,
      entities,
      frame: options.frame,
    })?.primitives ?? []

  // Natural timeline: when each step starts and when its input is done.
  const starts: number[] = []
  const ends: number[] = []
  // When each object's first stroke starts; the rest follow it, staggered.
  const firstStroke = new Map<EntityId, number>()
  let clock = LEAD_IN_MS
  recording.steps.forEach((step, index) => {
    starts[index] = clock
    clock += actionMs(step.action)
    ends[index] = clock
    let span = 0
    let order = 0
    for (const id of step.added) {
      const entity = document.get(id)
      if (!entity) continue
      firstStroke.set(id, clock + order * STAGGER_MS)
      for (const primitive of scene([entity])) {
        span = Math.max(
          span,
          order * STAGGER_MS + strokeMs(primitiveLength(primitive))
        )
        order += 1
      }
    }
    clock += span
  })
  const natural = clock
  const k = natural > MAX_TOTAL_MS ? MAX_TOTAL_MS / natural : 1
  const ms = (value: number) => Math.round(value * k)

  const presenter = new SvgScenePresenter({
    palette: themePalette(),
    fontFamily: DRAWING_FONT,
    capHeightRatio: DRAWING_FONT_CAP_RATIO,
    plot: true,
    frame: options,
  })

  // Paint in the drawing's own order (hatches behind), each object's strokes
  // timed from the step that made it.
  const entities = [...document.getEntities()].sort(
    (a, b) => entityDrawOrder(a) - entityDrawOrder(b)
  )
  let markup = ""
  for (const entity of entities) {
    const first = firstStroke.get(entity.id) ?? 0
    markup += presenter.elements(scene([entity]), (primitive, index) => ({
      style: `--t:${ms(first + index * STAGGER_MS)}ms;--d:${ms(
        strokeMs(primitiveLength(primitive))
      )}ms`,
    }))
  }

  const steps = recording.steps
  const lines: PlottedLine[] = transcript(recording).map((line) => {
    // An answer typed before its Enter starts appearing as it is typed.
    const previous = steps[line.step - 1]
    const typedFrom =
      line.kind === "input" && previous?.action.kind === "type"
        ? line.step - 1
        : line.step
    const at = starts[typedFrom]
    const typing =
      line.kind === "command" || line.kind === "input"
        ? ends[line.step] - at
        : 0
    return { ...line, at: ms(at), typing: ms(typing) }
  })

  return {
    width: options.width,
    height: options.height,
    markup,
    lines,
    duration: ms(natural),
    recording,
  }
}

/** The idle prompt a finished session returns to, as the engine words it. */
export const IDLE_PROMPT = promptText({
  command: null,
  field: null,
  fieldKind: null,
  options: [],
})

/** A still — a drawing, or the editor's own frame — for the smaller figures. */
export function drawingMarkup(
  primitives: readonly ScenePrimitive[],
  frame: { readonly width: number; readonly height: number }
): string {
  return new SvgScenePresenter({
    palette: themePalette(),
    fontFamily: DRAWING_FONT,
    capHeightRatio: DRAWING_FONT_CAP_RATIO,
    frame,
  }).elements(primitives)
}

export interface RenderedFigure {
  readonly width: number
  readonly height: number
  readonly markup: string
  readonly recording: DemoRecording
}

/**
 * A figure as SVG elements: a still of the drawing it ends with, or — for a
 * live figure — the editor's own frame at that moment, aids and all.
 */
export async function renderFigure(spec: {
  readonly script: DemoScript
  readonly width: number
  readonly height: number
  readonly padding?: number
  readonly frame?: Bounds
  readonly live?: boolean
}): Promise<RenderedFigure> {
  const recording = await recordDemo(spec.script)
  const primitives = spec.live
    ? recording.scene.primitives
    : (buildDrawingPreview(recording.document, {
        width: spec.width,
        height: spec.height,
        padding: spec.padding ?? 0,
        frame: spec.frame,
      })?.primitives ?? [])
  return {
    width: spec.width,
    height: spec.height,
    markup: drawingMarkup(primitives, spec),
    recording,
  }
}

export interface Glyph {
  readonly viewBox: string
  readonly markup: string
}

/**
 * The marker the editor draws for an object snap — the engine's own glyph,
 * taken from a frame in which the cursor rests on such a point — trimmed to
 * its box. Its colour is the precision cyan the editor uses.
 */
export async function snapGlyph(kind: "endpoint" | "center"): Promise<Glyph> {
  const setup =
    kind === "endpoint"
      ? demo({ snap: true })
          .command("LINE")
          .type("0,0")
          .enter()
          .type("@60,0")
          .enter()
          .escape()
      : demo({ snap: true })
          .command("CIRCLE")
          .type("0,0")
          .enter()
          .type("40")
          .enter()
  const recording = await recordDemo(
    setup.command("LINE").moveTo(kind === "endpoint" ? 60 : 0, 0)
  )
  const marker = recording.scene.primitives.filter(
    (primitive) =>
      primitive.kind !== "label" &&
      "stroke" in primitive &&
      primitive.stroke?.color === THEME.snap
  )
  if (marker.length === 0) throw new Error(`No ${kind} marker was drawn.`)
  const box = primitivesBox(marker)
  const pad = 1
  return {
    viewBox: `${box.min.x - pad} ${box.min.y - pad} ${box.max.x - box.min.x + 2 * pad} ${
      box.max.y - box.min.y + 2 * pad
    }`,
    markup: new SvgScenePresenter({ palette: themePalette() }).elements(marker),
  }
}

/**
 * A dimension's filled arrowhead, as the engine shapes it (ISO-25's closed
 * filled: a third as wide as it is long), pointing left from the origin.
 */
export async function arrowheadGlyph(): Promise<Glyph> {
  const recording = await recordDemo(
    demo().command("DIMLINEAR").click(0, 0).click(100, 0).click(50, 10)
  )
  const arrows = recording.scene.primitives.filter(
    (primitive) => primitive.kind === "path" && primitive.fill !== undefined
  )
  const arrow = arrows[0]
  if (!arrow || arrow.kind !== "path") throw new Error("No arrowhead drawn.")
  const [tip, a, b] = arrow.points
  const length = Math.hypot((a.x + b.x) / 2 - tip.x, (a.y + b.y) / 2 - tip.y)
  const half = Math.hypot(a.x - b.x, a.y - b.y) / 2
  const k = 10 / length
  const r = (n: number) => Math.round(n * 100) / 100
  return {
    viewBox: `0 0 10 ${r(2 * half * k)}`,
    markup: `<path d="M0 ${r(half * k)}L10 0L10 ${r(2 * half * k)}Z" fill="currentColor"/>`,
  }
}

function primitivesBox(primitives: readonly ScenePrimitive[]) {
  const xs: number[] = []
  const ys: number[] = []
  for (const p of primitives) {
    switch (p.kind) {
      case "rect":
        xs.push(p.min.x, p.min.x + p.width)
        ys.push(p.min.y, p.min.y + p.height)
        break
      case "circle":
        xs.push(p.center.x - p.radius, p.center.x + p.radius)
        ys.push(p.center.y - p.radius, p.center.y + p.radius)
        break
      case "segment":
        xs.push(p.a.x, p.b.x)
        ys.push(p.a.y, p.b.y)
        break
      case "path":
        for (const point of p.points) {
          xs.push(point.x)
          ys.push(point.y)
        }
        break
      default:
        break
    }
  }
  return {
    min: { x: Math.min(...xs), y: Math.min(...ys) },
    max: { x: Math.max(...xs), y: Math.max(...ys) },
  }
}
