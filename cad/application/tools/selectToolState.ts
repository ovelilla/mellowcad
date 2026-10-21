import { Vec2 } from "../../geometry/Vec2"
import { Vec3 } from "../../geometry/Vec3"
import { Entity, EntityId } from "../../domain/entities"

export type LineEnd = "start" | "end"

/** Which of a dimension's definition points a grip drags. */
export type DimensionPoint = "first" | "second" | "line" | "vertex"

/**
 * What editing a grip does, mirroring AutoCAD's per-object grips:
 * - `lineEnd`  — a line endpoint: stretch it to the cursor.
 * - `move`     — a line midpoint or a circle/arc centre: move its object.
 * - `radius`   — a circle quadrant: resize the radius.
 * - `arcEnd`   — an arc endpoint: swing it around, changing the sweep.
 * - `arcMiddle` — an arc's midpoint: stretch the arc through the cursor, its
 *   ends kept.
 * - `vertex`   — a polyline vertex, or a spline's fit point or control
 *   vertex: stretch it, reshaping the curve.
 * - `stretchSegment` — a straight polyline segment's midpoint: move both its
 *   ends by the drag.
 * - `bulge`    — an arc polyline segment's midpoint: change its curvature.
 * - `dimPoint` — a dimension's definition point: an extension-line origin, an
 *   angular one's vertex, or the dimension line itself, which slides the whole
 *   assembly.
 * - `mtextWidth` — a multiline text's width arrow: rewrap it to a new width.
 * - `ellipseAxis` — an ellipse's quadrant, its axis end at a quarter-turn
 *   `quadrant` of its parameter: that half-axis to the cursor's distance.
 * - `ellipseEnd` — an elliptical arc's end: swing it round the ellipse.
 */
export type GripRole =
  | { readonly kind: "lineEnd"; readonly end: LineEnd }
  | { readonly kind: "move" }
  | { readonly kind: "radius" }
  | { readonly kind: "arcEnd"; readonly end: LineEnd }
  | { readonly kind: "arcMiddle" }
  | { readonly kind: "vertex"; readonly index: number }
  | { readonly kind: "stretchSegment"; readonly segmentIndex: number }
  | { readonly kind: "bulge"; readonly segmentIndex: number }
  | { readonly kind: "dimPoint"; readonly point: DimensionPoint }
  | { readonly kind: "mtextWidth" }
  | { readonly kind: "ellipseAxis"; readonly quadrant: 0 | 1 | 2 | 3 }
  | { readonly kind: "ellipseEnd"; readonly end: LineEnd }

/** The grips that reshape an ellipse (desktop ellipse/d07). */
export type EllipseGripRole = Extract<
  GripRole,
  { kind: "ellipseAxis" } | { kind: "ellipseEnd" }
>

export interface Grip {
  readonly entityId: EntityId
  readonly role: GripRole
  /** In the WCS, on its object: at its height there and in its plane. */
  readonly world: Vec3
}

export type SelectToolState =
  | {
      readonly phase: "idle"
      /** The grip the cursor is currently hovering (drawn hot), if any. */
      readonly hoverGrip?: Grip | null
      /** The unselected entity under the cursor to preview-highlight, if any. */
      readonly hoverEntityId?: EntityId | null
    }
  | {
      readonly phase: "pressed"
      readonly startWorld: Vec2
      readonly startScreen: Vec2
      readonly currentWorld: Vec2
      /** Whether shift was held at press (removes what it finds). */
      readonly subtract: boolean
      /**
       * The press landed on an object that was already selected, so dragging
       * moves the selection instead of opening a selection box.
       */
      readonly onSelection: boolean
    }
  | {
      /**
       * A window or crossing under way: dragged (released to close) or begun
       * by a click on nothing (closed by the next click).
       */
      readonly phase: "boxing"
      readonly startWorld: Vec2
      readonly currentWorld: Vec2
      readonly subtract: boolean
    }
  | {
      /** An endpoint grip is hot: the line's end is being stretched. */
      readonly phase: "grip"
      readonly entityId: EntityId
      readonly end: LineEnd
      /** The endpoint that stays put (the far end of the line), at its Z. */
      readonly fixed: Vec3
      /** Live position of the moving endpoint, with the Z it will take. */
      readonly moving: Vec3
      /** Screen position where the grip was grabbed (drag vs click-click). */
      readonly pressScreen: Vec2
    }
  | {
      /**
       * A move grip is hot, its object being translated; or a drag begun on
       * the selection, translating all of it.
       */
      readonly phase: "moveLine"
      /** Snapshot of every entity being moved. */
      readonly originals: readonly Entity[]
      /** The base point (grabbed line's midpoint) that anchors the move, at its object's Z. */
      readonly origMid: Vec3
      /** Live position of the base point (follows the cursor). */
      readonly current: Vec3
      /** Screen position where the grip was grabbed (drag vs click-click). */
      readonly pressScreen: Vec2
    }
  | {
      /** A radius grip is hot: a circle or arc is being resized about its centre. */
      readonly phase: "resizeRadius"
      readonly entityId: EntityId
      readonly center: Vec2
      /** Live radius (distance from the centre to the cursor). */
      readonly radius: number
      /** Live point on the resized outline nearest the cursor (the hot handle). */
      readonly handle: Vec2
      /** Screen position where the grip was grabbed (drag vs click-click). */
      readonly pressScreen: Vec2
    }
  | {
      /** An arc endpoint grip is hot: it swings around, changing the sweep. */
      readonly phase: "arcAngle"
      readonly entityId: EntityId
      readonly end: LineEnd
      readonly center: Vec2
      readonly radius: number
      /** Live angle (radians) of the grabbed endpoint. */
      readonly angle: number
      /** Screen position where the grip was grabbed (drag vs click-click). */
      readonly pressScreen: Vec2
    }
  | {
      /**
       * An arc's middle grip is hot: Stretch, its default, bends the arc
       * through its two ends and the cursor (desktop arc/d08).
       */
      readonly phase: "arcStretch"
      readonly entityId: EntityId
      /** Where the grip was taken: the stretch's base, drawn hot there. */
      readonly origin: Vec2
      /** Live cursor position (the point the arc is bent through). */
      readonly current: Vec2
      readonly pressScreen: Vec2
    }
  | {
      /**
       * An ellipse's quadrant or an elliptical arc's end grip is hot, its
       * default Stretch reshaping the object from its centre (desktop
       * ellipse/d07).
       */
      readonly phase: "ellipseGrip"
      readonly entityId: EntityId
      readonly role: EllipseGripRole
      /** The ellipse's centre: the dashed line's start and Ortho's base. */
      readonly center: Vec2
      /** Where the grip was taken, drawn hot there. */
      readonly origin: Vec2
      /** Live cursor position. */
      readonly current: Vec2
      readonly pressScreen: Vec2
    }
  | {
      /**
       * A dimension definition-point grip is hot: dragging an extension-line
       * origin restates the measurement, dragging the dimension line slides it.
       */
      readonly phase: "moveDimPoint"
      readonly entityId: EntityId
      readonly point: DimensionPoint
      readonly origin: Vec2
      readonly current: Vec2
      readonly pressScreen: Vec2
    }
  | {
      /** A multiline text's width grip is hot: the text rewraps as it moves. */
      readonly phase: "mtextWidth"
      readonly entityId: EntityId
      readonly origin: Vec2
      /** Live width the text wraps to. */
      readonly width: number
      readonly pressScreen: Vec2
    }
  | {
      /** A polyline vertex grip is hot: it stretches, reshaping the chain. */
      readonly phase: "moveVertex"
      readonly entityId: EntityId
      readonly index: number
      /** The vertex's original position (the move's base / constraint anchor). */
      readonly origin: Vec2
      /** Live position of the vertex (follows the cursor). */
      readonly current: Vec2
      /** Screen position where the grip was grabbed (drag vs click-click). */
      readonly pressScreen: Vec2
    }
  | {
      /**
       * A straight segment's midpoint grip is hot: the segment moves with it,
       * its neighbours stretching (AutoCAD's Stretch, the grip's default).
       */
      readonly phase: "stretchSegment"
      readonly entityId: EntityId
      readonly segmentIndex: number
      /** The segment midpoint (the stretch's base / constraint anchor). */
      readonly origin: Vec2
      /** Live position of the midpoint (follows the cursor). */
      readonly current: Vec2
      readonly pressScreen: Vec2
    }
  | {
      /**
       * An arc segment's midpoint grip is hot: dragging it changes the segment's
       * bulge (curvature) so its arc passes through the cursor.
       */
      readonly phase: "bulgeEdit"
      readonly entityId: EntityId
      readonly segmentIndex: number
      /** The segment's two chord endpoints (fixed). */
      readonly a: Vec2
      readonly b: Vec2
      /** Live bulge derived from the cursor. */
      readonly bulge: number
      /** Live cursor position (the point the arc is dragged through). */
      readonly current: Vec2
      readonly pressScreen: Vec2
    }
