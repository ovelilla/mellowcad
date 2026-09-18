import { Vec2 } from "../../geometry/Vec2"
import { Entity, EntityId } from "../../domain/entities"

export type LineEnd = "start" | "end"

/** Which of a dimension's definition points a grip drags. */
export type DimensionPoint = "first" | "second" | "line" | "vertex"

/**
 * What editing a grip does, mirroring AutoCAD's per-object grips:
 * - `lineEnd`  — a line endpoint: lengthen/shorten along the line's own axis.
 * - `move`     — a line midpoint or a circle/arc centre: move the selection.
 * - `radius`   — a circle quadrant or an arc's midpoint: resize the radius.
 * - `arcEnd`   — an arc endpoint: swing it around, changing the sweep.
 * - `vertex`   — a polyline vertex: stretch it, reshaping the chain.
 * - `addVertex`— a straight polyline segment's midpoint: insert a new vertex.
 * - `bulge`    — an arc polyline segment's midpoint: change its curvature.
 * - `dimPoint` — a dimension's definition point: an extension-line origin, an
 *   angular one's vertex, or the dimension line itself, which slides the whole
 *   assembly.
 */
export type GripRole =
  | { readonly kind: "lineEnd"; readonly end: LineEnd }
  | { readonly kind: "move" }
  | { readonly kind: "radius" }
  | { readonly kind: "arcEnd"; readonly end: LineEnd }
  | { readonly kind: "vertex"; readonly index: number }
  | { readonly kind: "addVertex"; readonly segmentIndex: number }
  | { readonly kind: "bulge"; readonly segmentIndex: number }
  | { readonly kind: "dimPoint"; readonly point: DimensionPoint }

export interface Grip {
  readonly entityId: EntityId
  readonly role: GripRole
  readonly world: Vec2
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
      /** Whether shift was held at press (adds the box result to selection). */
      readonly additive: boolean
      /**
       * The press landed on an object that was already selected, so dragging
       * moves the selection instead of opening a selection box.
       */
      readonly onSelection: boolean
    }
  | {
      readonly phase: "boxing"
      readonly startWorld: Vec2
      readonly currentWorld: Vec2
      readonly additive: boolean
    }
  | {
      /** An endpoint grip is hot: the line is being lengthened along its axis. */
      readonly phase: "grip"
      readonly entityId: EntityId
      readonly end: LineEnd
      /** The endpoint that stays put (the far end of the line). */
      readonly fixed: Vec2
      /** Unit direction from `fixed` towards the moving endpoint. */
      readonly dir: Vec2
      /** Original line length, so typed input is a *delta* lengthening. */
      readonly origLength: number
      /** Live position of the moving endpoint (projected onto the axis). */
      readonly moving: Vec2
      /** Screen position where the grip was grabbed (drag vs click-click). */
      readonly pressScreen: Vec2
    }
  | {
      /** The midpoint grip is hot: the whole selection is being translated. */
      readonly phase: "moveLine"
      /** Snapshot of every entity being moved (the whole selection). */
      readonly originals: readonly Entity[]
      /** The base point (grabbed line's midpoint) that anchors the move. */
      readonly origMid: Vec2
      /** Live position of the base point (follows the cursor). */
      readonly current: Vec2
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
       * A straight segment's midpoint grip is hot: dragging it inserts a new
       * vertex there, bending the segment in two (AutoCAD's "add vertex").
       */
      readonly phase: "insertVertex"
      readonly entityId: EntityId
      readonly segmentIndex: number
      /** The segment midpoint (the insertion's base / constraint anchor). */
      readonly origin: Vec2
      /** Live position of the new vertex (follows the cursor). */
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
