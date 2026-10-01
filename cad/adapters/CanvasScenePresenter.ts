import { Scene, ScenePrimitive } from "../scene/types"
import { DRAWING_FONT } from "../scene/theme"
import { TEXT_FONT_CAP_RATIO } from "../domain/text"

/** Em size the cap-height probe measures at; big enough to be precise. */
const CAP_PROBE_SIZE = 100

/** Cap-height ratio assumed when a font refuses to report its metrics. */
const FALLBACK_CAP_RATIO = 0.7

/**
 * Canvas 2D render adapter: walks the neutral {@link Scene} display list and
 * draws it. This is the only place in the system that talks to
 * `CanvasRenderingContext2D`; an SVG or WebGL presenter could replace it
 * without touching the core.
 */
export class CanvasScenePresenter {
  private readonly capHeights = new Map<string, number>()

  /**
   * Draws a full frame. `dpr` scaling is applied here so the scene stays in
   * CSS pixels.
   */
  draw(ctx: CanvasRenderingContext2D, scene: Scene, dpr: number): void {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, scene.width, scene.height)
    // WHY: the drawing is geometry and never mirrors. A canvas inherits its
    // element's direction, and in a right-to-left page `start` would anchor
    // every label and text at its right end.
    ctx.direction = "ltr"
    // And the labels are in the command language, whatever the page's: a
    // context inherits its element's `lang`, which picks the font a generic
    // family resolves to (Arabic's `monospace` is not English's).
    if (scene.lang)
      (ctx as CanvasRenderingContext2D & { lang?: string }).lang = scene.lang

    ctx.fillStyle = scene.background
    ctx.fillRect(0, 0, scene.width, scene.height)

    for (const primitive of scene.primitives) {
      this.drawPrimitive(ctx, primitive)
    }
  }

  private drawPrimitive(
    ctx: CanvasRenderingContext2D,
    p: ScenePrimitive
  ): void {
    switch (p.kind) {
      case "segment":
        this.applyStroke(ctx, p.stroke)
        ctx.beginPath()
        ctx.moveTo(p.a.x, p.a.y)
        ctx.lineTo(p.b.x, p.b.y)
        ctx.stroke()
        this.resetDash(ctx, p.stroke.dash)
        break

      case "circle":
        ctx.beginPath()
        ctx.arc(p.center.x, p.center.y, p.radius, 0, Math.PI * 2)
        if (p.fill) {
          ctx.fillStyle = p.fill
          ctx.fill()
        }
        if (p.stroke) {
          this.applyStroke(ctx, p.stroke)
          ctx.stroke()
          this.resetDash(ctx, p.stroke.dash)
        }
        break

      case "arc":
        this.applyStroke(ctx, p.stroke)
        ctx.beginPath()
        ctx.arc(
          p.center.x,
          p.center.y,
          p.radius,
          p.startAngle,
          p.endAngle,
          p.counterclockwise
        )
        ctx.stroke()
        this.resetDash(ctx, p.stroke.dash)
        break

      case "ellipse":
        this.applyStroke(ctx, p.stroke)
        ctx.beginPath()
        ctx.ellipse(
          p.center.x,
          p.center.y,
          p.radiusX,
          p.radiusY,
          p.rotation,
          p.startAngle,
          p.endAngle,
          p.counterclockwise
        )
        ctx.stroke()
        this.resetDash(ctx, p.stroke.dash)
        break

      case "rect":
        if (p.fill) {
          ctx.fillStyle = p.fill
          ctx.fillRect(p.min.x, p.min.y, p.width, p.height)
        }
        if (p.stroke) {
          this.applyStroke(ctx, p.stroke)
          ctx.strokeRect(p.min.x, p.min.y, p.width, p.height)
          this.resetDash(ctx, p.stroke.dash)
        }
        break

      case "path": {
        if (p.points.length < 2) break
        ctx.beginPath()
        ctx.moveTo(p.points[0].x, p.points[0].y)
        for (let i = 1; i < p.points.length; i++) {
          ctx.lineTo(p.points[i].x, p.points[i].y)
        }
        if (p.closed) ctx.closePath()
        for (const sub of p.subpaths ?? []) {
          if (sub.length < 2) continue
          ctx.moveTo(sub[0].x, sub[0].y)
          for (let i = 1; i < sub.length; i++) ctx.lineTo(sub[i].x, sub[i].y)
          ctx.closePath()
        }
        if (p.fill) {
          ctx.fillStyle = p.fill
          ctx.fill("evenodd")
        }
        if (p.stroke) {
          this.applyStroke(ctx, p.stroke)
          ctx.stroke()
          this.resetDash(ctx, p.stroke.dash)
        }
        break
      }

      case "label":
        ctx.fillStyle = p.color
        ctx.font = p.font ?? "11px ui-monospace, monospace"
        ctx.textAlign = "left"
        ctx.fillText(p.text, p.at.x, p.at.y)
        break

      case "text": {
        if (p.text.length === 0) break
        const family = p.font ?? DRAWING_FONT
        ctx.save()
        ctx.translate(p.at.x, p.at.y)
        if (p.matrix) ctx.transform(...p.matrix, 0, 0)
        else if (p.rotation !== 0) ctx.rotate(p.rotation)
        // A CAD text height is the height of its capitals, whereas a font
        // size is the em box, so the font is enlarged by the cap-height ratio.
        // WHY: the drawing font takes Arial's ratio rather than a measured one,
        // so a face with Arial's widths but shorter caps (Liberation Sans)
        // still paints the widths the engine measured.
        const capRatio =
          family === DRAWING_FONT
            ? TEXT_FONT_CAP_RATIO
            : this.capHeightRatio(ctx, family)
        ctx.font = `${p.height / capRatio}px ${family}`
        ctx.fontKerning = "none"
        ctx.textAlign = p.align
        ctx.fillStyle = p.color
        if (p.baseline === "capMiddle") {
          ctx.textBaseline = "alphabetic"
          ctx.fillText(p.text, 0, p.height / 2)
        } else {
          ctx.textBaseline = p.baseline
          ctx.fillText(p.text, 0, 0)
        }
        ctx.restore()
        break
      }
    }
  }

  /**
   * Cap height of a font family as a fraction of its em size, measured once per
   * family (it is a constant of the font, and measuring is not free).
   */
  private capHeightRatio(
    ctx: CanvasRenderingContext2D,
    family: string
  ): number {
    const cached = this.capHeights.get(family)
    if (cached !== undefined) return cached
    const previous = ctx.font
    ctx.font = `${CAP_PROBE_SIZE}px ${family}`
    const ascent = ctx.measureText("H").actualBoundingBoxAscent
    ctx.font = previous
    const ratio =
      Number.isFinite(ascent) && ascent > 0
        ? ascent / CAP_PROBE_SIZE
        : FALLBACK_CAP_RATIO
    this.capHeights.set(family, ratio)
    return ratio
  }

  private applyStroke(
    ctx: CanvasRenderingContext2D,
    stroke: { color: string; width: number; dash?: readonly number[] }
  ): void {
    ctx.strokeStyle = stroke.color
    ctx.lineWidth = stroke.width
    if (stroke.dash && stroke.dash.length > 0) ctx.setLineDash([...stroke.dash])
  }

  private resetDash(
    ctx: CanvasRenderingContext2D,
    dash: readonly number[] | undefined
  ): void {
    if (dash && dash.length > 0) ctx.setLineDash([])
  }
}
