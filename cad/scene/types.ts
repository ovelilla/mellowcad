import { Vec2 } from "../geometry/Vec2"

/**
 * A renderer-agnostic description of one frame: a flat display list of styled
 * primitives in *screen* (CSS-pixel) coordinates.
 *
 * The application layer builds a {@link Scene} from the document, viewport,
 * selection and transient interaction state; a concrete adapter (Canvas 2D
 * today — SVG, WebGL or a test serialiser tomorrow) merely walks the list and
 * draws. Nothing in here references the DOM, Canvas or React.
 */

export interface StrokeStyle {
  readonly color: string
  readonly width: number
  /** Dash pattern in pixels; omitted/empty means solid. */
  readonly dash?: readonly number[]
}

export type ScenePrimitive =
  | {
      readonly kind: "segment"
      readonly a: Vec2
      readonly b: Vec2
      readonly stroke: StrokeStyle
    }
  | {
      readonly kind: "circle"
      readonly center: Vec2
      readonly radius: number
      readonly stroke?: StrokeStyle
      readonly fill?: string
    }
  | {
      /**
       * A circular arc. Angles are in *screen* space (already transformed);
       * `counterclockwise` matches the Canvas 2D `arc()` sweep flag, so the
       * builder resolves the world→screen orientation once.
       */
      readonly kind: "arc"
      readonly center: Vec2
      readonly radius: number
      readonly startAngle: number
      readonly endAngle: number
      readonly counterclockwise: boolean
      readonly stroke: StrokeStyle
    }
  | {
      /**
       * An ellipse or elliptical arc. Like `arc`, everything here is already in
       * *screen* space: `rotation` and the two parameters are the arguments the
       * Canvas 2D `ellipse()` call takes, so the builder resolves the camera's
       * Y flip once instead of every renderer repeating it.
       */
      readonly kind: "ellipse"
      readonly center: Vec2
      readonly radiusX: number
      readonly radiusY: number
      /** Major-axis direction in screen radians (clockwise-positive). */
      readonly rotation: number
      readonly startAngle: number
      readonly endAngle: number
      readonly counterclockwise: boolean
      readonly stroke: StrokeStyle
    }
  | {
      readonly kind: "rect"
      readonly min: Vec2
      readonly width: number
      readonly height: number
      readonly stroke?: StrokeStyle
      readonly fill?: string
    }
  | {
      /** A polyline / polygon, e.g. triangle and diamond markers. */
      readonly kind: "path"
      readonly points: readonly Vec2[]
      readonly closed?: boolean
      /**
       * Further closed rings filled together with `points` under the even-odd
       * rule, so a ring inside another punches a hole — a hatch's islands. The
       * same rule decides where a hatch's pattern lines are drawn, so the two
       * fill types agree about what is inside.
       */
      readonly subpaths?: readonly (readonly Vec2[])[]
      /**
       * Omit on a solid shape. A stroke around a very sharp corner spikes far
       * past the vertex through its mitre join — and by a screen-pixel amount,
       * so the spike never shrinks with the zoom (see dimension arrowheads).
       */
      readonly stroke?: StrokeStyle
      /** Solid fill for a closed path, e.g. a dimension arrowhead. */
      readonly fill?: string
    }
  | {
      readonly kind: "label"
      readonly at: Vec2
      readonly text: string
      readonly color: string
      readonly font?: string
    }
  | {
      /**
       * A *world-space* text object: unlike {@link ScenePrimitive} `label`,
       * which is chrome pinned to the screen at a fixed size, this one carries
       * the size and angle the drawing gives it, so it zooms and rotates with
       * the geometry.
       *
       * The presenter draws it with a transform and resolves the justification
       * through the renderer's own alignment — the engine stays free of glyph
       * metrics, which it could not measure without a DOM.
       */
      readonly kind: "text"
      /** Screen position of the justification point. */
      readonly at: Vec2
      readonly text: string
      /** Capital-letter height in screen pixels. */
      readonly height: number
      /** Baseline rotation in *screen* radians (clockwise-positive). */
      readonly rotation: number
      readonly align: TextAlign
      readonly baseline: TextBaseline
      readonly color: string
      /** Font family; the presenter supplies a default. */
      readonly font?: string
    }

/** Horizontal alignment of a `text` primitive around its point. */
export type TextAlign = "left" | "center" | "right"

/**
 * Vertical alignment of a `text` primitive around its point. The names follow
 * the renderer's own baselines, plus `capMiddle` — the midpoint of the capital
 * letters, which AutoCAD's MC/ML/MR justifications use and which `middle` (the
 * midpoint of *all* text, descenders included) deliberately differs from.
 */
export type TextBaseline =
  "top" | "middle" | "capMiddle" | "alphabetic" | "bottom"

export interface Scene {
  /** Frame size in CSS pixels. */
  readonly width: number
  readonly height: number
  readonly background: string
  readonly primitives: readonly ScenePrimitive[]
}

/**
 * The world↔screen mapping the scene builder needs. The application layer's
 * `Viewport` satisfies it structurally; keeping the scene layer typed against
 * this minimal interface avoids a dependency on the application layer.
 */
export interface CameraTransform {
  readonly width: number
  readonly height: number
  readonly scale: number
  worldToScreen(p: Vec2): Vec2
  screenToWorld(p: Vec2): Vec2
  worldToScreenDistance(distance: number): number
}
