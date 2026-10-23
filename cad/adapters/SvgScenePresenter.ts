import { Scene, ScenePrimitive, StrokeStyle } from "../scene/types"
import { DRAWING_FONT, THEME } from "../scene/theme"
import { clipSegment } from "./clipSegment"
import { dashPhase, drawnDash } from "./dashPattern"
import { TEXT_FONT_CAP_RATIO } from "../domain/text"

/** Chrome labels, as the canvas draws them. */
const LABEL_FONT = "11px ui-monospace, monospace"

const FULL_TURN = Math.PI * 2

export interface SvgScenePresenterOptions {
  /**
   * The command language its labels are in (`Scene.lang`), set on every text
   * so the page's language never changes the font a generic family picks.
   */
  readonly lang?: string
  /**
   * Maps a scene colour to what the SVG writes — {@link themePalette} turns
   * `THEME`'s into CSS custom properties, so a page can restyle the drawing
   * without rendering it again. Colours it does not know pass through.
   */
  readonly palette?: (color: string) => string
  /** Decimals kept in coordinates; one is invisible at any sane zoom. */
  readonly precision?: number
  /** Family for `text` primitives that name none. */
  readonly fontFamily?: string
  /** Cap height ÷ em of {@link fontFamily}. */
  readonly capHeightRatio?: number
  /**
   * Prepares every solid stroke to be plotted — `pathLength="1"`, so a CSS
   * `stroke-dashoffset` from 1 to 0 draws it along its length whatever its
   * size. Dashed strokes and fills are left alone: their dash array is taken.
   */
  readonly plot?: boolean
  /**
   * The frame the elements will be shown in. Segments are clipped to it (see
   * {@link clipSegment}). {@link SvgScenePresenter.render} uses the scene's
   * own size.
   */
  readonly frame?: { readonly width: number; readonly height: number }
}

export interface SvgDocumentOptions {
  /** Accessible name, emitted as `<title>` with `role="img"`. */
  readonly title?: string
  /** Longer accessible description, emitted as `<desc>`. */
  readonly description?: string
  /** Paint the scene's background; off when the page behind is the sheet. */
  readonly background?: boolean
  /** Extra attributes for the root `<svg>`. */
  readonly attributes?: Readonly<Record<string, string | number>>
}

/** Extra attributes for one element, e.g. the timing of its animation. */
export type SvgDecorator = (
  primitive: ScenePrimitive,
  index: number
) => Readonly<Record<string, string | number>> | undefined

/**
 * SVG render adapter: the twin of `CanvasScenePresenter`, walking the same
 * neutral {@link Scene} but returning markup instead of drawing. It runs
 * anywhere — at build time on a server, in a test — because it touches no DOM.
 * A primitive kind added to the scene needs a branch here as well.
 */
export class SvgScenePresenter {
  private readonly palette: (color: string) => string
  private readonly factor: number
  private readonly fontFamily: string
  private readonly capHeightRatio: number
  private readonly plot: boolean
  private readonly frame: SvgScenePresenterOptions["frame"]
  private readonly lang: string | undefined

  constructor(options: SvgScenePresenterOptions = {}) {
    this.palette = options.palette ?? ((color) => color)
    this.factor = 10 ** (options.precision ?? 1)
    this.fontFamily = options.fontFamily ?? DRAWING_FONT
    this.capHeightRatio = options.capHeightRatio ?? TEXT_FONT_CAP_RATIO
    this.plot = options.plot ?? false
    this.frame = options.frame
    this.lang = options.lang
  }

  /** A standalone `<svg>` document for the whole scene. */
  render(scene: Scene, options: SvgDocumentOptions = {}): string {
    const labelled = options.title !== undefined
    const attributes = attrs({
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: `0 0 ${this.n(scene.width)} ${this.n(scene.height)}`,
      ...(labelled && { role: "img" }),
      ...options.attributes,
    })
    const accessible =
      (labelled ? `<title>${escapeText(options.title ?? "")}</title>` : "") +
      (options.description !== undefined
        ? `<desc>${escapeText(options.description)}</desc>`
        : "")
    const background = options.background
      ? `<rect width="${this.n(scene.width)}" height="${this.n(
          scene.height
        )}" fill="${this.color(scene.background)}"/>`
      : ""
    const framed = this.frame
      ? this
      : new SvgScenePresenter({
          ...this.options(),
          frame: scene,
          lang: this.lang ?? scene.lang,
        })
    return `<svg ${attributes}>${accessible}${background}${framed.elements(
      scene.primitives
    )}</svg>`
  }

  private options(): SvgScenePresenterOptions {
    return {
      palette: this.palette,
      precision: Math.log10(this.factor),
      fontFamily: this.fontFamily,
      capHeightRatio: this.capHeightRatio,
      plot: this.plot,
      frame: this.frame,
      lang: this.lang,
    }
  }

  /** Just the elements, for a caller that groups or times them itself. */
  elements(
    primitives: readonly ScenePrimitive[],
    decorate?: SvgDecorator
  ): string {
    return primitives
      .map((primitive, index) =>
        this.element(primitive, decorate?.(primitive, index))
      )
      .join("")
  }

  private element(
    p: ScenePrimitive,
    extra: Readonly<Record<string, string | number>> | undefined
  ): string {
    switch (p.kind) {
      case "segment": {
        const clipped = this.frame
          ? clipSegment(p.a, p.b, this.frame)
          : [p.a, p.b]
        if (!clipped) return ""
        const [a, b] = clipped
        return this.tag("line", {
          x1: this.n(a.x),
          y1: this.n(a.y),
          x2: this.n(b.x),
          y2: this.n(b.y),
          ...this.stroke(p.stroke, Math.hypot(a.x - p.a.x, a.y - p.a.y)),
          ...extra,
        })
      }

      case "circle":
        return this.tag("circle", {
          cx: this.n(p.center.x),
          cy: this.n(p.center.y),
          r: this.n(p.radius),
          fill: p.fill ? this.color(p.fill) : "none",
          ...(p.stroke && this.stroke(p.stroke)),
          ...extra,
        })

      case "arc":
        return this.tag("path", {
          d: this.ellipticalArc(
            p.center.x,
            p.center.y,
            p.radius,
            p.radius,
            0,
            p.startAngle,
            p.endAngle,
            p.counterclockwise
          ),
          fill: "none",
          ...this.stroke(p.stroke),
          ...extra,
        })

      case "ellipse":
        return this.tag("path", {
          d: this.ellipticalArc(
            p.center.x,
            p.center.y,
            p.radiusX,
            p.radiusY,
            p.rotation,
            p.startAngle,
            p.endAngle,
            p.counterclockwise
          ),
          fill: "none",
          ...this.stroke(p.stroke),
          ...extra,
        })

      case "rect":
        return this.tag("rect", {
          x: this.n(p.min.x),
          y: this.n(p.min.y),
          width: this.n(p.width),
          height: this.n(p.height),
          fill: p.fill ? this.color(p.fill) : "none",
          ...(p.stroke && this.stroke(p.stroke)),
          ...extra,
        })

      case "path": {
        if (p.points.length < 2) return ""
        let d = this.polyline(p.points) + (p.closed ? "Z" : "")
        for (const sub of p.subpaths ?? []) {
          if (sub.length >= 2) d += this.polyline(sub) + "Z"
        }
        return this.tag("path", {
          d,
          fill: p.fill ? this.color(p.fill) : "none",
          // The canvas fills every path even-odd, which is what makes a
          // nested loop a hole; nonzero would fill it in.
          ...(p.fill && { "fill-rule": "evenodd" }),
          ...(p.stroke && {
            ...this.stroke(p.stroke),
            "stroke-linejoin": "round",
          }),
          ...extra,
        })
      }

      case "label":
        return this.text(
          {
            x: this.n(p.at.x),
            y: this.n(p.at.y),
            "text-anchor": "start",
            fill: this.color(p.color),
            style: `font:${p.font ?? LABEL_FONT}`,
            ...extra,
          },
          p.text
        )

      case "text": {
        if (p.text.length === 0) return ""
        const fontSize = p.height / this.capHeightRatio
        const rotation = p.matrix
          ? ` matrix(${p.matrix.map((value) => +value.toFixed(4)).join(" ")} 0 0)`
          : p.rotation !== 0
            ? ` rotate(${this.n((p.rotation * 180) / Math.PI)})`
            : ""
        return this.text(
          {
            transform: `translate(${this.n(p.at.x)} ${this.n(
              p.at.y
            )})${rotation}`,
            "font-family": p.font ?? this.fontFamily,
            "font-size": this.n(fontSize),
            "text-anchor":
              p.align === "left"
                ? "start"
                : p.align === "center"
                  ? "middle"
                  : "end",
            fill: this.color(p.color),
            ...extra,
          },
          p.text
        )
      }
    }
  }

  /**
   * Canvas's `arc()` / `ellipse()` as an SVG path: both sweep the same way on a
   * Y-down screen (a clockwise sweep is SVG's positive `sweep-flag`), and SVG's
   * large-arc flag is decided on the same parametric angle. A full turn is two
   * half arcs, because an arc whose ends coincide draws nothing.
   */
  private ellipticalArc(
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    rotation: number,
    start: number,
    end: number,
    counterclockwise: boolean
  ): string {
    const raw = counterclockwise ? start - end : end - start
    const sweep = sweepOf(raw)
    const full = sweep === FULL_TURN
    const direction = counterclockwise ? -1 : 1
    const cos = Math.cos(rotation)
    const sin = Math.sin(rotation)
    const at = (t: number) => {
      const x = rx * Math.cos(t)
      const y = ry * Math.sin(t)
      return `${this.n(cx + x * cos - y * sin)} ${this.n(cy + x * sin + y * cos)}`
    }
    const rotate = this.n((rotation * 180) / Math.PI)
    const sweepFlag = counterclockwise ? 0 : 1
    const arcTo = (t: number, large: number) =>
      `A${this.n(rx)} ${this.n(ry)} ${rotate} ${large} ${sweepFlag} ${at(t)}`
    if (full) {
      return `M${at(start)}${arcTo(start + direction * Math.PI, 0)}${arcTo(
        start,
        0
      )}`
    }
    return `M${at(start)}${arcTo(
      start + direction * sweep,
      sweep > Math.PI ? 1 : 0
    )}`
  }

  private polyline(points: readonly { x: number; y: number }[]): string {
    return points
      .map((pt, i) => `${i === 0 ? "M" : "L"}${this.n(pt.x)} ${this.n(pt.y)}`)
      .join("")
  }

  /** `clipped` is how much of a segment's start the frame cut off. */
  private stroke(
    stroke: StrokeStyle,
    clipped = 0
  ): Record<string, string | number> {
    const dashed = !!stroke.dash && stroke.dash.length > 0
    const offset = dashed
      ? dashPhase((stroke.dashOffset ?? 0) + clipped, stroke.dash!)
      : 0
    return {
      stroke: this.color(stroke.color),
      "stroke-width": this.n(stroke.width),
      ...(dashed && {
        "stroke-dasharray": drawnDash(stroke.dash!, stroke.width)
          .map((d) => this.n(d))
          .join(" "),
      }),
      ...(offset > 0 && { "stroke-dashoffset": this.n(offset) }),
      ...(this.plot && !dashed && { pathLength: 1 }),
    }
  }

  private tag(name: string, attributes: Record<string, string | number>) {
    return `<${name} ${attrs(attributes)}/>`
  }

  // WHY `direction` on every text: the markup lands inside a page's own
  // <svg>, which inherits the page's direction, and in a right-to-left page a
  // `start` anchor is the text's right end. The drawing never mirrors. And
  // `lang`, the command language's: the page's would pick another font for a
  // generic family (an Arabic page's `monospace` is not an English one's).
  private text(attributes: Record<string, string | number>, content: string) {
    const lang: Record<string, string> =
      this.lang === undefined ? {} : { lang: this.lang }
    return `<text ${attrs({ direction: "ltr", ...lang, ...attributes })}>${escapeText(
      content
    )}</text>`
  }

  private color(color: string): string {
    return this.palette(color)
  }

  /** Rounded to the configured precision, with no `-0`. */
  private n(value: number): number {
    const rounded = Math.round(value * this.factor) / this.factor
    return rounded === 0 ? 0 : rounded
  }
}

/**
 * The angle an arc turns through, by canvas's rule: a difference of a full turn
 * or more *in the sweep's own direction* is the whole circle; anything else is
 * reduced into [0, 2π).
 */
function sweepOf(raw: number): number {
  if (raw >= FULL_TURN) return FULL_TURN
  return ((raw % FULL_TURN) + FULL_TURN) % FULL_TURN
}

/**
 * How far a primitive's outline runs on screen — what a plotter would travel —
 * so an animation can give long strokes more time than short ones.
 */
export function primitiveLength(p: ScenePrimitive): number {
  switch (p.kind) {
    case "segment":
      return Math.hypot(p.b.x - p.a.x, p.b.y - p.a.y)
    case "circle":
      return FULL_TURN * p.radius
    case "arc":
      return (
        sweepOf(
          p.counterclockwise
            ? p.startAngle - p.endAngle
            : p.endAngle - p.startAngle
        ) * p.radius
      )
    case "ellipse": {
      // Ramanujan's perimeter, scaled by the share of the turn swept: close
      // enough to budget an animation, which is all this is for.
      const a = p.radiusX
      const b = p.radiusY
      const perimeter =
        Math.PI * (3 * (a + b) - Math.sqrt((3 * a + b) * (a + 3 * b)))
      const sweep = sweepOf(
        p.counterclockwise
          ? p.startAngle - p.endAngle
          : p.endAngle - p.startAngle
      )
      return (perimeter * sweep) / FULL_TURN
    }
    case "rect":
      return 2 * (p.width + p.height)
    case "path": {
      let length = 0
      for (let i = 1; i < p.points.length; i++) {
        const a = p.points[i - 1]
        const b = p.points[i]
        length += Math.hypot(b.x - a.x, b.y - a.y)
      }
      return length
    }
    case "label":
    case "text":
      return 0
  }
}

/** `selectionWindowFill` → `selection-window-fill`. */
function kebab(name: string): string {
  return name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
}

/**
 * `THEME`'s colours as CSS custom properties: a palette for
 * {@link SvgScenePresenter} that writes `var(--cad-entity)` instead of a hex.
 * Where two roles share a value the first one named in `THEME` wins.
 */
export function themePalette(prefix = "--cad-"): (color: string) => string {
  const byValue = new Map<string, string>()
  for (const [name, value] of Object.entries(THEME)) {
    if (!byValue.has(value)) byValue.set(value, `var(${prefix}${kebab(name)})`)
  }
  return (color) => byValue.get(color) ?? color
}

/** The declarations {@link themePalette} refers to, e.g. `--cad-entity:#e2e8f0;`. */
export function themeCustomProperties(prefix = "--cad-"): string {
  return Object.entries(THEME)
    .map(([name, value]) => `${prefix}${kebab(name)}:${value};`)
    .join("")
}

function attrs(attributes: Readonly<Record<string, string | number>>): string {
  return Object.entries(attributes)
    .map(([name, value]) => `${name}="${escapeAttribute(String(value))}"`)
    .join(" ")
}

function escapeText(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

function escapeAttribute(text: string): string {
  return escapeText(text).replace(/"/g, "&quot;")
}
