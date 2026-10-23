import { Vec2, V } from "../../geometry/Vec2"
import { Vec3, planar, sub3, withZ, withZOf } from "../../geometry/Vec3"
import {
  Entity,
  EntityId,
  InsertEntity,
  createArc,
  createLine,
  carryOverrides,
  lineEndZ,
  lineStartZ,
  polylineSegmentGeometries,
  setPolylineBulge,
  translateEntity,
  withLineZ,
} from "../../domain/entities"
import type { Command } from "../commands/Command"
import {
  UpdateEntitiesCommand,
  UpdateEntityCommand,
} from "../commands/entityCommands"
import { DynamicInputSession } from "../input/DynamicInput"
import { bulgeThroughPoint, normalizeDegrees } from "../../geometry/primitives"
import { ScenePrimitive } from "../../scene/types"
import {
  Lasso,
  boxSelect,
  extendLasso,
  lassoSelect,
  nextLassoMode,
  startLasso,
} from "./boxSelection"
import { riseAlongCursor, showRise } from "./directDistance"
import { KeyInput, PointerInput, Tool, ToolContext } from "./Tool"
import type { CursorBadge } from "../SceneBuilder"
import {
  ArrayEditRole,
  DimensionPoint,
  EllipseGripRole,
  Grip,
  LineEnd,
  SelectToolState,
} from "./selectToolState"
import { ARRAY_GRIP_FIELDS, arrayGripValue } from "./arrayGrips"
import { arrayPlacement } from "../../domain/arrayEdits"
import { hitGrip, sameGrip } from "./selectToolGrips"
import {
  arrayGripped,
  arrayGripTyped,
  movedDimension,
  mtextWidthThrough,
  arcStretchedThrough,
  ellipseGripped,
  radiusHandle,
  toDegrees,
  withRadius,
  withSegmentStretched,
  withVertexAt,
} from "./selectToolEdits"
import {
  buildArrayGripEdit,
  buildArcAngleEdit,
  buildArcStretch,
  buildBulgeEdit,
  buildDimPointEdit,
  buildEllipseGripEdit,
  buildGripEdit,
  buildGrips,
  buildMoveEdit,
  buildMTextWidthEdit,
  buildRadiusEdit,
  buildSegmentStretch,
  buildSelectionBox,
  buildVertexEdit,
  pickRolloverEntity,
} from "./selectToolOverlay"

/** Screen-pixel movement past which a press-drag becomes a lasso. */
const DRAG_THRESHOLD_PX = 4

/**
 * The select tool's interaction flow as an explicit state machine:
 *
 * ```
 *          press                 move ≥ threshold           release
 *  idle ─────────► pressed ───────────────────► lasso ────────────► idle
 *                     │ release (no drag)                  (lasso select)
 *                     ├────────────────────► idle (click select)
 *                     └─ on nothing ───────► boxing ─ click ──► idle
 * ```
 *
 * Behaves like AutoCAD's default pick (PICKADD 2, PICKAUTO, PICKDRAG 2):
 * - A click adds the object under the cursor to the selection; Shift+click
 *   removes it. Only Escape clears the selection.
 * - A click on nothing starts a window that the next click closes. Left→right
 *   selects only fully-enclosed objects (a blue *window*); right→left also
 *   selects objects the box merely touches (a green *crossing* window). A
 *   drag draws a lasso along its path instead (PICKAUTO 5), a window or a
 *   crossing by the way it sets off, which Space cycles through a fence. Each
 *   adds what it finds, or removes it with Shift.
 *
 * Selected objects also show *grips* (small squares). Lines show endpoint grips
 * (stretch) and a midpoint grip (move). Circles show a centre
 * grip (move) and four quadrant grips (resize the radius). Arcs show a centre
 * grip (move), two endpoint grips (swing the sweep) and a midpoint grip
 * (stretch through it). Ellipses show a centre grip (move) and four quadrant
 * grips (set that half-axis), an elliptical arc two end grips besides (swing
 * the end). You can drag and click to place, and for most type the exact
 * amount in the dynamic input, exactly like AutoCAD grip editing.
 *
 * The Delete key is not the tool's: the runtime runs ERASE on the selection
 * (`CadRuntime.deleteSelection`).
 */
export class SelectTool implements Tool {
  readonly id = "select"
  readonly shortcut = "s"

  private state: SelectToolState = { phase: "idle" }

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("default")
  }

  onDeactivate(ctx: ToolContext): void {
    this.state = { phase: "idle" }
    ctx.dynamicInput.close()
    // Selection is intentionally NOT cleared: it must survive switching to a
    // modify command that operates on it (MOVE, COPY, ...). Draw tools that
    // need a clean slate clear the selection in their own onActivate.
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return

    // Second click of a hot grip: place it at the current cursor projection.
    if (this.state.phase === "grip") {
      this.placeGrip(this.state, this.state.moving, ctx)
      return
    }
    if (this.state.phase === "moveLine") {
      this.placeMove(this.state, this.state.current, ctx)
      return
    }
    if (this.state.phase === "resizeRadius") {
      this.placeRadius(this.state, this.state.radius, ctx)
      return
    }
    if (this.state.phase === "arcAngle") {
      this.placeArcAngle(this.state, this.state.angle, ctx)
      return
    }
    if (this.state.phase === "arcStretch") {
      this.placeArcStretch(this.state, this.state.current, ctx)
      return
    }
    if (this.state.phase === "ellipseGrip") {
      this.placeEllipseGrip(this.state, this.state.current, ctx)
      return
    }
    if (this.state.phase === "moveVertex") {
      this.placeVertex(this.state, this.state.current, ctx)
      return
    }
    if (this.state.phase === "stretchSegment") {
      this.placeSegmentStretch(this.state, this.state.current, ctx)
      return
    }
    if (this.state.phase === "bulgeEdit") {
      this.placeBulge(this.state, this.state.bulge, ctx)
      return
    }
    if (this.state.phase === "moveDimPoint") {
      this.placeDimPoint(this.state, this.state.current, ctx)
      return
    }
    if (this.state.phase === "arrayGrip") {
      this.placeArrayGrip(this.state, this.state.current, ctx)
      return
    }
    if (this.state.phase === "mtextWidth") {
      this.placeMTextWidth(this.state, this.state.width, ctx)
      return
    }
    // The second click of a window begun by a click on nothing.
    if (this.state.phase === "boxing") {
      this.commitBoxSelection(
        this.state.startWorld,
        input.world,
        this.state.subtract || input.shiftKey,
        ctx
      )
      this.state = { phase: "idle" }
      ctx.requestRender()
      return
    }

    // Grab a grip of a selected object, if the click lands on one, and begin
    // the edit its role prescribes.
    const grip = hitGrip(input.screen, ctx)
    if (grip) {
      switch (grip.role.kind) {
        case "lineEnd":
          this.beginGrip(grip, grip.role.end, input.screen, ctx)
          break
        case "move":
          this.beginMove(grip, input.screen, ctx)
          break
        case "radius":
          this.beginRadius(grip, input.screen, ctx)
          break
        case "arcEnd":
          this.beginArcAngle(grip, grip.role.end, input.screen, ctx)
          break
        case "arcMiddle":
          this.beginArcStretch(grip, input.screen, ctx)
          break
        case "ellipseAxis":
        case "ellipseEnd":
          this.beginEllipseGrip(grip, grip.role, input.screen, ctx)
          break
        case "vertex":
          this.beginVertexMove(grip, grip.role.index, input.screen, ctx)
          break
        case "stretchSegment":
          this.beginSegmentStretch(
            grip,
            grip.role.segmentIndex,
            input.screen,
            ctx
          )
          break
        case "bulge":
          this.beginBulgeEdit(grip, grip.role.segmentIndex, input.screen, ctx)
          break
        case "dimPoint":
          this.beginDimPointMove(grip, grip.role.point, input.screen, ctx)
          break
        case "mtextWidth":
          this.beginMTextWidth(grip, grip.role.side, input.screen, ctx)
          break
        case "array":
          this.beginArrayGrip(grip, grip.role.grip, input.screen, ctx)
          break
      }
      return
    }

    // Selection boxes track the raw cursor, not snapped/constrained points.
    this.state = {
      phase: "pressed",
      startWorld: input.world,
      startScreen: input.screen,
      currentWorld: input.world,
      subtract: input.shiftKey,
      onSelection: this.pressedOnSelection(input, ctx),
    }
    ctx.requestRender()
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    switch (this.state.phase) {
      case "grip": {
        // STRETCH, the default grip mode: the end goes where a click would
        // (desktop line/d15), Z included. Lengthen is the hover menu's other
        // entry, not built.
        const moving = input.point
        this.state = { ...this.state, moving }
        ctx.dynamicInput.setLive("length", V.distance(this.state.fixed, moving))
        ctx.dynamicInput.setPosition(input.screen)
        ctx.requestRender()
        break
      }
      case "moveLine": {
        // The midpoint follows the cursor (snapped when a snap is active); the
        // whole line translates with it.
        const current = input.point
        this.state = { ...this.state, current }
        if (!showRise(ctx, this.state.origMid, current)) {
          ctx.dynamicInput.setLive(
            "distance",
            V.distance(this.state.origMid, current)
          )
        }
        ctx.dynamicInput.setPosition(input.screen)
        ctx.requestRender()
        break
      }
      case "resizeRadius": {
        // The radius follows the cursor's distance from the centre (snapped
        // when a snap is active); the handle rides the resized outline.
        const radius = V.distance(this.state.center, input.point)
        const handle = radiusHandle(this.state.center, input.point, radius)
        this.state = { ...this.state, radius, handle }
        ctx.dynamicInput.setLive("radius", radius)
        ctx.dynamicInput.setPosition(input.screen)
        ctx.requestRender()
        break
      }
      case "arcAngle": {
        // The grabbed endpoint swings to wherever the cursor points from the
        // centre, keeping the radius fixed.
        const dir = V.sub(input.point, this.state.center)
        const angle = Math.atan2(dir.y, dir.x)
        this.state = { ...this.state, angle }
        ctx.dynamicInput.setLive("angle", normalizeDegrees(toDegrees(angle)))
        ctx.dynamicInput.setPosition(input.screen)
        ctx.requestRender()
        break
      }
      case "arcStretch":
      case "ellipseGrip": {
        this.state = { ...this.state, current: input.point }
        ctx.requestRender()
        break
      }
      case "moveVertex": {
        // The vertex follows the cursor (snapped/Ortho-locked relative to its
        // original position); the two adjacent segments stretch with it.
        const current = input.point
        this.state = { ...this.state, current }
        ctx.dynamicInput.setLive(
          "distance",
          V.distance(this.state.origin, current)
        )
        ctx.dynamicInput.setPosition(input.screen)
        ctx.requestRender()
        break
      }
      case "moveDimPoint": {
        const current = input.point
        this.state = { ...this.state, current }
        ctx.dynamicInput.setLive(
          "distance",
          V.distance(this.state.origin, current)
        )
        ctx.dynamicInput.setPosition(input.screen)
        ctx.requestRender()
        break
      }
      case "arrayGrip": {
        const current = planar(input.point)
        this.state = { ...this.state, current }
        const reading = this.arrayReading(this.state, ctx)
        if (reading !== null) ctx.dynamicInput.setLive("value", reading)
        ctx.dynamicInput.setPosition(input.screen)
        ctx.requestRender()
        break
      }
      case "mtextWidth": {
        const mtext = ctx.document.get(this.state.entityId)
        if (mtext?.type !== "mtext") break
        const width = mtextWidthThrough(mtext, input.point)
        this.state = { ...this.state, width }
        ctx.dynamicInput.setLive("width", width)
        ctx.dynamicInput.setPosition(input.screen)
        ctx.requestRender()
        break
      }
      case "stretchSegment": {
        // The midpoint follows the cursor, the segment moving with it.
        const current = input.point
        this.state = { ...this.state, current }
        ctx.dynamicInput.setLive(
          "distance",
          V.distance(this.state.origin, current)
        )
        ctx.dynamicInput.setPosition(input.screen)
        ctx.requestRender()
        break
      }
      case "bulgeEdit": {
        // The arc bulges to pass through the cursor; the bulge value tracks it.
        const current = input.point
        const bulge = bulgeThroughPoint(this.state.a, this.state.b, current)
        this.state = { ...this.state, current, bulge }
        ctx.dynamicInput.setLive("bulge", bulge)
        ctx.dynamicInput.setPosition(input.screen)
        ctx.requestRender()
        break
      }
      case "pressed": {
        const moved = Math.hypot(
          input.screen.x - this.state.startScreen.x,
          input.screen.y - this.state.startScreen.y
        )
        if (moved >= DRAG_THRESHOLD_PX) {
          // Dragging from an already-selected object moves the whole selection
          // (the direct gesture for objects whose grips all reshape rather than
          // move, like a rectangle); dragging from anywhere else boxes.
          if (this.state.onSelection && !this.state.subtract) {
            this.beginSelectionDrag(
              this.state.startWorld,
              this.state.startScreen,
              ctx
            )
          } else {
            const lasso = startLasso(
              ctx.viewport,
              this.state.startWorld,
              input.world
            )
            this.state = {
              phase: "lasso",
              lasso,
              subtract: this.state.subtract,
              preview: lassoPreview(lasso, ctx),
            }
            sayLasso(lasso, ctx)
          }
          ctx.requestRender()
        } else {
          this.state = { ...this.state, currentWorld: input.world }
        }
        break
      }
      case "boxing":
        this.state = {
          ...this.state,
          currentWorld: input.world,
          preview: previewOf(
            boxSelect(
              ctx.document,
              this.state.startWorld,
              input.world,
              ctx.viewport
            ),
            ctx
          ),
        }
        ctx.requestRender()
        break
      case "lasso": {
        const lasso = extendLasso(ctx.viewport, this.state.lasso, input.world)
        const grew = lasso.path.length !== this.state.lasso.path.length
        this.state = {
          ...this.state,
          lasso,
          preview: grew ? lassoPreview(lasso, ctx) : this.state.preview,
        }
        ctx.requestRender()
        break
      }
      case "idle": {
        // Track which grip the cursor hovers so it can be drawn hot, matching
        // AutoCAD's grip highlight. The magnetic crosshair snap is handled
        // separately via magneticCursor(). Also track the unselected entity
        // under the cursor for AutoCAD's selection-preview (rollover) highlight.
        const hoverGrip = hitGrip(input.screen, ctx)
        const { id: hoverEntityId, locked: hoverLocked } = pickRolloverEntity(
          input,
          ctx
        )
        const gripChanged = !sameGrip(hoverGrip, this.state.hoverGrip ?? null)
        const entityChanged =
          hoverEntityId !== (this.state.hoverEntityId ?? null) ||
          hoverLocked !== (this.state.hoverLocked ?? false)
        if (gripChanged || entityChanged) {
          this.state = { phase: "idle", hoverGrip, hoverEntityId, hoverLocked }
          ctx.requestRender()
        }
        break
      }
    }
  }

  onPointerUp(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return

    switch (this.state.phase) {
      case "grip": {
        // Support both AutoCAD grip gestures: a press-drag places the endpoint
        // on release, while a plain click keeps the grip hot for a second click
        // (which also frees the mouse to type an exact length).
        const dragged =
          Math.hypot(
            input.screen.x - this.state.pressScreen.x,
            input.screen.y - this.state.pressScreen.y
          ) >= DRAG_THRESHOLD_PX
        if (dragged) this.placeGrip(this.state, this.state.moving, ctx)
        return
      }
      case "moveLine": {
        // Same dual gesture as the endpoint grips: drag-release places it,
        // a plain click keeps it hot for a second click / typed distance.
        const dragged =
          Math.hypot(
            input.screen.x - this.state.pressScreen.x,
            input.screen.y - this.state.pressScreen.y
          ) >= DRAG_THRESHOLD_PX
        if (dragged) this.placeMove(this.state, this.state.current, ctx)
        return
      }
      case "resizeRadius": {
        const dragged =
          Math.hypot(
            input.screen.x - this.state.pressScreen.x,
            input.screen.y - this.state.pressScreen.y
          ) >= DRAG_THRESHOLD_PX
        if (dragged) this.placeRadius(this.state, this.state.radius, ctx)
        return
      }
      case "arcAngle": {
        const dragged =
          Math.hypot(
            input.screen.x - this.state.pressScreen.x,
            input.screen.y - this.state.pressScreen.y
          ) >= DRAG_THRESHOLD_PX
        if (dragged) this.placeArcAngle(this.state, this.state.angle, ctx)
        return
      }
      case "arcStretch": {
        const dragged =
          Math.hypot(
            input.screen.x - this.state.pressScreen.x,
            input.screen.y - this.state.pressScreen.y
          ) >= DRAG_THRESHOLD_PX
        if (dragged) this.placeArcStretch(this.state, this.state.current, ctx)
        return
      }
      case "ellipseGrip": {
        const dragged =
          Math.hypot(
            input.screen.x - this.state.pressScreen.x,
            input.screen.y - this.state.pressScreen.y
          ) >= DRAG_THRESHOLD_PX
        if (dragged) this.placeEllipseGrip(this.state, this.state.current, ctx)
        return
      }
      case "moveVertex": {
        const dragged =
          Math.hypot(
            input.screen.x - this.state.pressScreen.x,
            input.screen.y - this.state.pressScreen.y
          ) >= DRAG_THRESHOLD_PX
        if (dragged) this.placeVertex(this.state, this.state.current, ctx)
        return
      }
      case "moveDimPoint": {
        const dragged =
          Math.hypot(
            input.screen.x - this.state.pressScreen.x,
            input.screen.y - this.state.pressScreen.y
          ) >= DRAG_THRESHOLD_PX
        if (dragged) this.placeDimPoint(this.state, this.state.current, ctx)
        return
      }
      case "mtextWidth": {
        const dragged =
          Math.hypot(
            input.screen.x - this.state.pressScreen.x,
            input.screen.y - this.state.pressScreen.y
          ) >= DRAG_THRESHOLD_PX
        if (dragged) this.placeMTextWidth(this.state, this.state.width, ctx)
        return
      }
      case "arrayGrip": {
        const dragged =
          Math.hypot(
            input.screen.x - this.state.pressScreen.x,
            input.screen.y - this.state.pressScreen.y
          ) >= DRAG_THRESHOLD_PX
        if (dragged) this.placeArrayGrip(this.state, this.state.current, ctx)
        return
      }
      case "stretchSegment": {
        const dragged =
          Math.hypot(
            input.screen.x - this.state.pressScreen.x,
            input.screen.y - this.state.pressScreen.y
          ) >= DRAG_THRESHOLD_PX
        if (dragged) {
          this.placeSegmentStretch(this.state, this.state.current, ctx)
        }
        return
      }
      case "bulgeEdit": {
        const dragged =
          Math.hypot(
            input.screen.x - this.state.pressScreen.x,
            input.screen.y - this.state.pressScreen.y
          ) >= DRAG_THRESHOLD_PX
        if (dragged) this.placeBulge(this.state, this.state.bulge, ctx)
        return
      }
      case "lasso": {
        const hits = lassoSelect(
          ctx.document,
          this.state.lasso,
          ctx.viewport,
          (entity) => ctx.document.isEntitySelectable(entity)
        )
        this.addOrRemove(hits, this.state.subtract, ctx)
        break
      }
      case "pressed":
        if (!this.commitClickSelection(input, ctx)) {
          this.state = {
            phase: "boxing",
            startWorld: this.state.startWorld,
            currentWorld: input.world,
            subtract: this.state.subtract,
            preview: [],
          }
          ctx.requestRender()
          return
        }
        break
      case "boxing":
      case "idle":
        return
    }

    this.state = { phase: "idle" }
    ctx.requestRender()
  }

  /** Space with the button held: the lasso's next mode, said (erase/d04). */
  cycleLasso(ctx: ToolContext): boolean {
    if (this.state.phase !== "lasso") return false
    const lasso = {
      ...this.state.lasso,
      mode: nextLassoMode(this.state.lasso.mode),
    }
    this.state = { ...this.state, lasso, preview: lassoPreview(lasso, ctx) }
    sayLasso(lasso, ctx)
    ctx.requestRender()
    return true
  }

  onKeyDown(input: KeyInput, ctx: ToolContext): void {
    if (input.key === "Escape") {
      if (this.state.phase === "grip" || this.state.phase === "moveLine") {
        // Abort the grip edit, leaving the line untouched.
        ctx.dynamicInput.close()
        this.state = { phase: "idle" }
        ctx.requestRender()
        return
      }
      if (
        this.state.phase === "resizeRadius" ||
        this.state.phase === "arcAngle" ||
        this.state.phase === "arcStretch" ||
        this.state.phase === "ellipseGrip"
      ) {
        // Abort the radius/angle grip edit, leaving the object untouched.
        ctx.dynamicInput.close()
        this.state = { phase: "idle" }
        ctx.requestRender()
        return
      }
      if (this.state.phase === "moveVertex") {
        // Abort the vertex stretch, leaving the polyline untouched.
        ctx.dynamicInput.close()
        this.state = { phase: "idle" }
        ctx.requestRender()
        return
      }
      if (
        this.state.phase === "moveDimPoint" ||
        this.state.phase === "mtextWidth" ||
        this.state.phase === "arrayGrip"
      ) {
        // Abort the definition-point drag, leaving the dimension untouched.
        ctx.dynamicInput.close()
        this.state = { phase: "idle" }
        ctx.requestRender()
        return
      }
      if (
        this.state.phase === "stretchSegment" ||
        this.state.phase === "bulgeEdit"
      ) {
        // Abort the segment stretch / curvature edit, leaving the polyline untouched.
        ctx.dynamicInput.close()
        this.state = { phase: "idle" }
        ctx.requestRender()
        return
      }
      if (this.state.phase !== "idle") {
        // Cancel an in-progress press / box selection.
        this.state = { phase: "idle" }
        ctx.requestRender()
        return
      }
      // Idle with nothing in progress: Escape clears the current selection,
      // just like pressing Esc in AutoCAD deselects and removes the grips.
      if (!ctx.selection.isEmpty()) {
        ctx.selection.clear()
        ctx.requestRender()
      }
      return
    }
  }

  /**
   * Object snaps (and their markers) are wanted while a grip edit is actually
   * placing a point — moving the whole line snaps its midpoint onto geometry,
   * and stretching an endpoint can align it to an object snap or an acquired
   * object-snap-tracking reference. While merely selecting, AutoCAD shows no
   * osnap markers, so the midpoint snap glyph never fights with the midpoint
   * grip.
   */
  /**
   * WHY a grip edit swallows Enter: AutoCAD's Enter there cycles to the next
   * grip mode (Move, Rotate…), which is not built; ending or committing the
   * edit would be a different gesture.
   */
  onEnter(): boolean {
    return this.wantsSnap()
  }

  wantsSnap(): boolean {
    return (
      this.state.phase === "moveLine" ||
      this.state.phase === "grip" ||
      this.state.phase === "resizeRadius" ||
      this.state.phase === "arcAngle" ||
      this.state.phase === "arcStretch" ||
      this.state.phase === "ellipseGrip" ||
      this.state.phase === "moveVertex" ||
      this.state.phase === "stretchSegment" ||
      this.state.phase === "bulgeEdit" ||
      this.state.phase === "moveDimPoint" ||
      this.state.phase === "mtextWidth" ||
      this.state.phase === "arrayGrip"
    )
  }

  /**
   * While merely selecting, magnetically pull the crosshair onto the nearest
   * grip of the selected objects, exactly like AutoCAD — the cursor clings to
   * any grip it passes over so the grips are easy to grab. Only in the idle
   * phase (a drag or grip edit already has the cursor committed elsewhere), and
   * only for grips within the same pick radius used to grab them, so the magnet
   * and the click stay consistent.
   */
  magneticCursor(screen: Vec2, ctx: ToolContext): Vec2 | null {
    if (this.state.phase !== "idle") return null
    const grip = hitGrip(screen, ctx)
    return grip ? ctx.viewport.worldToScreen(grip.world) : null
  }

  /**
   * Grabbing a grip (endpoint stretch or midpoint move) only *begins* an edit —
   * the point is placed later — so the acquired object-snap-tracking references
   * must survive this pointer-down and stay usable while dragging the grip.
   */
  retainsTrackingAfterPointerDown(): boolean {
    return (
      this.state.phase === "grip" ||
      this.state.phase === "moveLine" ||
      this.state.phase === "moveVertex" ||
      this.state.phase === "stretchSegment" ||
      this.state.phase === "arcStretch" ||
      this.state.phase === "arrayGrip"
    )
  }

  /**
   * The base point that drawing constraints (Ortho, ...) and object-snap
   * tracking restrict against. While moving the whole line it is the grabbed
   * midpoint; while stretching an endpoint it is the *fixed* far end, so Ortho
   * locks the stretch to a horizontal/vertical direction through that end and
   * tracking guides can intersect the Ortho ray. While resizing a radius or
   * swinging an arc endpoint it is the centre. No anchor while merely selecting.
   */
  getConstraintAnchor(): Vec2 | null {
    if (this.state.phase === "moveLine") return this.state.origMid
    if (this.state.phase === "grip") return this.state.fixed
    if (this.state.phase === "resizeRadius") return this.state.center
    if (this.state.phase === "arcAngle") return this.state.center
    if (this.state.phase === "arcStretch") return this.state.origin
    if (this.state.phase === "ellipseGrip") return this.state.center
    if (this.state.phase === "moveVertex") return this.state.origin
    if (this.state.phase === "moveDimPoint") return this.state.origin
    if (this.state.phase === "mtextWidth") return this.state.origin
    if (this.state.phase === "arrayGrip") return this.state.origin
    if (this.state.phase === "stretchSegment") return this.state.origin
    if (this.state.phase === "bulgeEdit")
      return V.midpoint(this.state.a, this.state.b)
    return null
  }

  /** A selection dragged fades where it was, as MOVE's does (desktop move/d08-1). */
  fadedEntityIds(): readonly EntityId[] {
    if (this.state.phase !== "moveLine" || !this.state.dragsSelection) return []
    return this.state.originals.map((entity) => entity.id)
  }

  /** The padlock over a locked layer's object at `Command:` (desktop properties/d01-1). */
  cursorBadge(): CursorBadge | null {
    return this.state.phase === "idle" && this.state.hoverLocked
      ? "locked"
      : null
  }

  rolloverEntityId(): EntityId | null {
    return this.state.phase === "idle"
      ? (this.state.hoverEntityId ?? null)
      : null
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    const state = this.state
    switch (state.phase) {
      case "boxing":
      case "lasso":
        return buildSelectionBox(state, ctx)
      case "grip":
        return buildGripEdit(state, ctx)
      case "moveLine":
        return buildMoveEdit(state, ctx)
      case "resizeRadius":
        return buildRadiusEdit(state, ctx)
      case "arcAngle":
        return buildArcAngleEdit(state, ctx)
      case "arcStretch":
        return buildArcStretch(state, ctx)
      case "ellipseGrip":
        return buildEllipseGripEdit(state, ctx)
      case "moveVertex":
        return buildVertexEdit(state, ctx)
      case "stretchSegment":
        return buildSegmentStretch(state, ctx)
      case "bulgeEdit":
        return buildBulgeEdit(state, ctx)
      case "moveDimPoint":
        return buildDimPointEdit(state, ctx)
      case "mtextWidth":
        return buildMTextWidthEdit(state, ctx)
      case "arrayGrip":
        return buildArrayGripEdit(state, ctx)
      default:
        return buildGrips(state, ctx)
    }
  }

  private commitBoxSelection(
    start: Vec2,
    current: Vec2,
    subtract: boolean,
    ctx: ToolContext
  ): void {
    const hits = boxSelect(ctx.document, start, current, ctx.viewport)
    this.addOrRemove(hits, subtract, ctx)
  }

  private addOrRemove(
    ids: readonly EntityId[],
    subtract: boolean,
    ctx: ToolContext
  ): void {
    for (const id of ids) {
      if (subtract) ctx.selection.remove(id)
      else ctx.selection.add(id)
    }
  }

  /** Adds or removes the object clicked; false when the click found none. */
  private commitClickSelection(input: PointerInput, ctx: ToolContext): boolean {
    const hit = ctx.pick(input.world)
    if (!hit) return false
    if (input.shiftKey) ctx.selection.remove(hit.id)
    else ctx.selection.add(hit.id)
    return true
  }

  /** Makes an endpoint grip hot and opens the length dynamic input. */
  private beginGrip(
    grip: Grip,
    end: LineEnd,
    screen: Vec2,
    ctx: ToolContext
  ): void {
    const line = ctx.document.get(grip.entityId)
    if (line?.type !== "line") return
    const start = withZ(line.start, lineStartZ(line))
    const finish = withZ(line.end, lineEndZ(line))
    this.state = {
      phase: "grip",
      entityId: grip.entityId,
      end,
      fixed: end === "start" ? finish : start,
      moving: end === "start" ? start : finish,
      pressScreen: screen,
    }
    this.openLengthInput(ctx, screen)
    ctx.requestRender()
  }

  /**
   * Whether the press landed on an object that is already selected and can
   * be moved: a drag from a locked one boxes, as from nothing.
   */
  private pressedOnSelection(input: PointerInput, ctx: ToolContext): boolean {
    if (ctx.selection.isEmpty()) return false
    const hit = ctx.pick(input.world)
    return (
      hit !== null &&
      ctx.selection.has(hit.id) &&
      ctx.document.isEntityEditable(hit)
    )
  }

  /**
   * Starts moving the whole selection from `base` — the point that was pressed,
   * on the elevation plane like any unsnapped cursor point. Reuses the
   * move-grip machinery for the snaps and Ortho; AutoCAD shows no tooltip
   * there (desktop move/d08-1), so no box opens.
   */
  private beginSelectionDrag(base: Vec2, screen: Vec2, ctx: ToolContext): void {
    // A locked object stays where it is, as MOVE leaves it (properties/p381).
    const originals = ctx.selection
      .toArray()
      .map((id) => ctx.document.get(id))
      .filter((e): e is Entity => e !== undefined)
      .filter((e) => ctx.document.isEntityEditable(e))
    if (originals.length === 0) return
    const origin = withZ(base, ctx.ucs.origin.z + ctx.elevation)
    this.state = {
      phase: "moveLine",
      originals,
      origMid: origin,
      current: origin,
      pressScreen: screen,
      dragsSelection: true,
    }
    ctx.requestRender()
  }

  /**
   * Makes a move grip (line midpoint / circle-arc centre) hot and moves its
   * own object: in STRETCH mode only the hot grip's object changes (desktop
   * line/d15), whatever else is selected.
   */
  private beginMove(grip: Grip, screen: Vec2, ctx: ToolContext): void {
    const entity = ctx.document.get(grip.entityId)
    if (!entity) return
    const originals = [entity]
    const base = grip.world
    this.state = {
      phase: "moveLine",
      originals,
      origMid: base,
      current: base,
      pressScreen: screen,
      dragsSelection: false,
    }
    this.openMoveInput(ctx, screen)
    ctx.requestRender()
  }

  /** Makes a radius grip hot and opens the radius dynamic input. */
  private beginRadius(grip: Grip, screen: Vec2, ctx: ToolContext): void {
    const entity = ctx.document.get(grip.entityId)
    if (entity?.type !== "circle" && entity?.type !== "arc") return
    this.state = {
      phase: "resizeRadius",
      entityId: grip.entityId,
      center: entity.center,
      radius: entity.radius,
      handle: grip.world,
      pressScreen: screen,
    }
    this.openRadiusInput(ctx, screen, entity.radius)
    ctx.requestRender()
  }

  /** Makes an arc endpoint grip hot and opens the angle dynamic input. */
  private beginArcAngle(
    grip: Grip,
    end: LineEnd,
    screen: Vec2,
    ctx: ToolContext
  ): void {
    const arc = ctx.document.get(grip.entityId)
    if (arc?.type !== "arc") return
    const angle = end === "start" ? arc.startAngle : arc.endAngle
    this.state = {
      phase: "arcAngle",
      entityId: grip.entityId,
      end,
      center: arc.center,
      radius: arc.radius,
      angle,
      pressScreen: screen,
    }
    this.openAngleInput(ctx, screen, normalizeDegrees(toDegrees(angle)))
    ctx.requestRender()
  }

  /**
   * Makes an arc's middle grip hot in Stretch, its default (desktop arc/d08).
   * No value box: a stretch typed while hot is not built.
   */
  private beginArcStretch(grip: Grip, screen: Vec2, ctx: ToolContext): void {
    if (ctx.document.get(grip.entityId)?.type !== "arc") return
    this.state = {
      phase: "arcStretch",
      entityId: grip.entityId,
      origin: grip.world,
      current: grip.world,
      pressScreen: screen,
    }
    ctx.requestRender()
  }

  /**
   * Makes an ellipse's quadrant or end grip hot in Stretch (desktop
   * ellipse/d07). No value box: a length or an angle typed while hot is not
   * built.
   */
  private beginEllipseGrip(
    grip: Grip,
    role: EllipseGripRole,
    screen: Vec2,
    ctx: ToolContext
  ): void {
    const ellipse = ctx.document.get(grip.entityId)
    if (ellipse?.type !== "ellipse") return
    this.state = {
      phase: "ellipseGrip",
      entityId: grip.entityId,
      role,
      center: ellipse.center,
      origin: grip.world,
      current: grip.world,
      pressScreen: screen,
    }
    ctx.requestRender()
  }

  /** Makes a polyline vertex grip hot and opens the move dynamic input. */
  private beginVertexMove(
    grip: Grip,
    index: number,
    screen: Vec2,
    ctx: ToolContext
  ): void {
    const poly = ctx.document.get(grip.entityId)
    if (poly?.type !== "polyline" && poly?.type !== "spline") return
    this.state = {
      phase: "moveVertex",
      entityId: grip.entityId,
      index,
      origin: grip.world,
      current: grip.world,
      pressScreen: screen,
    }
    this.openVertexInput(ctx, screen)
    ctx.requestRender()
  }

  /** Makes a dimension definition-point grip hot and opens its move input. */
  private beginDimPointMove(
    grip: Grip,
    point: DimensionPoint,
    screen: Vec2,
    ctx: ToolContext
  ): void {
    if (ctx.document.get(grip.entityId)?.type !== "dimension") return
    this.state = {
      phase: "moveDimPoint",
      entityId: grip.entityId,
      point,
      origin: grip.world,
      current: grip.world,
      pressScreen: screen,
    }
    this.openDimPointInput(ctx, screen)
    ctx.requestRender()
  }

  /**
   * Makes an array's spacing, count, radius or angle grip hot, opening the
   * box of the value it sets (none at the corner).
   */
  private beginArrayGrip(
    grip: Grip,
    role: ArrayEditRole,
    screen: Vec2,
    ctx: ToolContext
  ): void {
    const insert = ctx.document.get(grip.entityId)
    if (insert?.type !== "insert" || !insert.array) return
    this.state = {
      phase: "arrayGrip",
      entityId: grip.entityId,
      role,
      origin: grip.world,
      shape: grip.shape ?? "square",
      along: grip.along,
      current: planar(grip.world),
      pressScreen: screen,
    }
    const field = ARRAY_GRIP_FIELDS[role]
    if (field) {
      ctx.dynamicInput.open({
        fields: [{ id: "value", ...field }],
        commit: (values, commitCtx) =>
          this.commitArrayGrip(values.value, commitCtx),
      })
      const reading = arrayGripValue(
        insert.array,
        arrayPlacement(insert, ctx.blocks(insert.blockId)),
        role
      )
      if (reading !== null) ctx.dynamicInput.setLive("value", reading)
      ctx.dynamicInput.setPosition(screen)
    }
    ctx.requestRender()
  }

  /** What the hot array grip's box reads with the cursor where it is. */
  private arrayReading(
    state: Extract<SelectToolState, { phase: "arrayGrip" }>,
    ctx: ToolContext
  ): number | null {
    if (!ARRAY_GRIP_FIELDS[state.role]) return null
    const insert = ctx.document.get(state.entityId)
    if (insert?.type !== "insert") return null
    const edited = arrayGripped(insert, state.role, state.current, ctx.blocks)
    return edited?.array
      ? arrayGripValue(
          edited.array,
          arrayPlacement(edited, ctx.blocks(edited.blockId)),
          state.role
        )
      : null
  }

  /** A value typed while an array grip is hot; refused, the grip stays hot. */
  private commitArrayGrip(value: number, ctx: ToolContext): void {
    if (this.state.phase !== "arrayGrip") return
    const insert = ctx.document.get(this.state.entityId)
    const edited =
      insert?.type === "insert"
        ? arrayGripTyped(insert, this.state.role, value, ctx.blocks)
        : null
    if (edited) this.finishArrayGrip(edited, ctx)
  }

  /**
   * Commits the array its grip dragged to `cursor` makes, one undo step; a
   * drag the grip refuses (a count past 32767, a ring past a turn) leaves it
   * hot, as AutoCAD keeps asking (desktop arrays/d15c, ARRAYS-D72).
   */
  private placeArrayGrip(
    state: Extract<SelectToolState, { phase: "arrayGrip" }>,
    cursor: Vec2,
    ctx: ToolContext
  ): void {
    const insert = ctx.document.get(state.entityId)
    if (insert?.type !== "insert") {
      ctx.dynamicInput.close()
      this.state = { phase: "idle" }
      ctx.requestRender()
      return
    }
    const edited = arrayGripped(insert, state.role, cursor, ctx.blocks)
    if (edited) this.finishArrayGrip(edited, ctx)
  }

  private finishArrayGrip(edited: InsertEntity, ctx: ToolContext): void {
    ctx.dynamicInput.close()
    this.state = { phase: "idle" }
    const before = ctx.document.get(edited.id)
    if (JSON.stringify(before) !== JSON.stringify(edited)) {
      gripEdit(ctx, new UpdateEntitiesCommand([edited]))
    }
    ctx.requestRender()
  }

  /** Makes a multiline text's width grip hot and opens the width input. */
  private beginMTextWidth(
    grip: Grip,
    side: "left" | "right",
    screen: Vec2,
    ctx: ToolContext
  ): void {
    const mtext = ctx.document.get(grip.entityId)
    if (mtext?.type !== "mtext") return
    this.state = {
      phase: "mtextWidth",
      entityId: grip.entityId,
      side,
      origin: grip.world,
      width: mtext.width,
      pressScreen: screen,
    }
    const session: DynamicInputSession = {
      fields: [{ id: "width", prompt: "mtextWidth", kind: "distance" }],
      commit: (values, commitCtx) => {
        if (this.state.phase !== "mtextWidth" || !(values.width >= 0)) return
        this.placeMTextWidth(this.state, values.width, commitCtx)
      },
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setLive("width", mtext.width)
    ctx.dynamicInput.setPosition(screen)
    ctx.requestRender()
  }

  private placeMTextWidth(
    state: Extract<SelectToolState, { phase: "mtextWidth" }>,
    width: number,
    ctx: ToolContext
  ): void {
    const mtext = ctx.document.get(state.entityId)
    if (mtext?.type === "mtext" && width !== mtext.width) {
      gripEdit(ctx, new UpdateEntityCommand({ ...mtext, width }))
    }
    ctx.dynamicInput.close()
    this.state = { phase: "idle" }
    ctx.requestRender()
  }

  /** Makes a straight segment's midpoint grip hot to stretch the segment. */
  private beginSegmentStretch(
    grip: Grip,
    segmentIndex: number,
    screen: Vec2,
    ctx: ToolContext
  ): void {
    const poly = ctx.document.get(grip.entityId)
    if (poly?.type !== "polyline") return
    this.state = {
      phase: "stretchSegment",
      entityId: grip.entityId,
      segmentIndex,
      origin: grip.world,
      current: grip.world,
      pressScreen: screen,
    }
    this.openSegmentInput(ctx, screen)
    ctx.requestRender()
  }

  /** Makes an arc-segment midpoint grip hot to change its curvature. */
  private beginBulgeEdit(
    grip: Grip,
    segmentIndex: number,
    screen: Vec2,
    ctx: ToolContext
  ): void {
    const poly = ctx.document.get(grip.entityId)
    if (poly?.type !== "polyline") return
    const seg = polylineSegmentGeometries(poly)[segmentIndex]
    if (!seg) return
    this.state = {
      phase: "bulgeEdit",
      entityId: grip.entityId,
      segmentIndex,
      a: seg.a,
      b: seg.b,
      bulge: seg.kind === "arc" ? seg.bulge : 0,
      current: grip.world,
      pressScreen: screen,
    }
    this.openBulgeInput(ctx, screen, seg.kind === "arc" ? seg.bulge : 0)
    ctx.requestRender()
  }

  /**
   * Opens the box of a stretched line's resulting length: DYNDIVIS's default
   * shows it first, Length Change after a Tab (help 2027, Dimension Input
   * Settings); this box holds the first only.
   */
  private openLengthInput(ctx: ToolContext, screen: Vec2): void {
    if (this.state.phase !== "grip") return
    const session: DynamicInputSession = {
      fields: [{ id: "length", prompt: "length", kind: "length" }],
      commit: (values, commitCtx) =>
        this.commitLength(values.length, commitCtx),
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setLive(
      "length",
      V.distance(this.state.fixed, this.state.moving)
    )
    ctx.dynamicInput.setPosition(screen)
  }

  /** Opens the dynamic-input session offering the move distance. */
  private openMoveInput(ctx: ToolContext, screen: Vec2): void {
    const session: DynamicInputSession = {
      fields: [{ id: "distance", prompt: "move", kind: "distance" }],
      commit: (values, commitCtx) =>
        this.commitMove(values.distance, commitCtx),
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setLive("distance", 0)
    ctx.dynamicInput.setPosition(screen)
  }

  /** Opens the dynamic-input session offering the vertex-stretch distance. */
  private openVertexInput(ctx: ToolContext, screen: Vec2): void {
    const session: DynamicInputSession = {
      fields: [{ id: "distance", prompt: "move", kind: "distance" }],
      commit: (values, commitCtx) =>
        this.commitVertex(values.distance, commitCtx),
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setLive("distance", 0)
    ctx.dynamicInput.setPosition(screen)
  }

  /** Opens the dynamic-input session offering the dimension-point distance. */
  private openDimPointInput(ctx: ToolContext, screen: Vec2): void {
    const session: DynamicInputSession = {
      fields: [{ id: "distance", prompt: "move", kind: "distance" }],
      commit: (values, commitCtx) =>
        this.commitDimPoint(values.distance, commitCtx),
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setLive("distance", 0)
    ctx.dynamicInput.setPosition(screen)
  }

  /** Opens the dynamic-input session offering the segment's stretch distance. */
  private openSegmentInput(ctx: ToolContext, screen: Vec2): void {
    const session: DynamicInputSession = {
      fields: [{ id: "distance", prompt: "move", kind: "distance" }],
      commit: (values, commitCtx) =>
        this.commitSegmentStretch(values.distance, commitCtx),
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setLive("distance", 0)
    ctx.dynamicInput.setPosition(screen)
  }

  /** Opens the dynamic-input session offering the segment's bulge value. */
  private openBulgeInput(ctx: ToolContext, screen: Vec2, bulge: number): void {
    const session: DynamicInputSession = {
      fields: [{ id: "bulge", prompt: "bulge", kind: "number" }],
      commit: (values, commitCtx) => this.commitBulge(values.bulge, commitCtx),
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setLive("bulge", bulge)
    ctx.dynamicInput.setPosition(screen)
  }

  /** Opens the dynamic-input session offering the new radius. */
  private openRadiusInput(
    ctx: ToolContext,
    screen: Vec2,
    radius: number
  ): void {
    const session: DynamicInputSession = {
      fields: [{ id: "radius", prompt: "radius", kind: "distance" }],
      commit: (values, commitCtx) =>
        this.commitRadius(values.radius, commitCtx),
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setLive("radius", radius)
    ctx.dynamicInput.setPosition(screen)
  }

  /** Opens the dynamic-input session offering the new endpoint angle. */
  private openAngleInput(
    ctx: ToolContext,
    screen: Vec2,
    degrees: number
  ): void {
    const session: DynamicInputSession = {
      fields: [{ id: "angle", prompt: "angle", kind: "angle" }],
      commit: (values, commitCtx) =>
        this.commitArcAngle(values.angle, commitCtx),
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setLive("angle", degrees)
    ctx.dynamicInput.setPosition(screen)
  }

  /**
   * Applies a typed resulting length from the fixed end towards the cursor,
   * then commits. With the cursor on the fixed end there is no direction yet.
   */
  private commitLength(length: number, ctx: ToolContext): void {
    if (this.state.phase !== "grip") return
    const offset = V.sub(this.state.moving, this.state.fixed)
    const reach = V.length(offset)
    if (reach < 1e-9) return
    // A typed length keeps the end at its own height, as the line has it.
    const line = ctx.document.get(this.state.entityId)
    const point = withZ(
      V.add(this.state.fixed, V.scale(offset, length / reach)),
      line?.type !== "line"
        ? 0
        : this.state.end === "start"
          ? lineStartZ(line)
          : lineEndZ(line)
    )
    this.placeGrip(this.state, point, ctx)
  }

  /**
   * Writes the moving endpoint to `point` through an undoable command, keeping
   * the line's other end fixed, then returns to idle. An end dropped on the
   * other end in space is ignored; one above or below it stands the line
   * vertical. The grabbed end takes the point's Z and the other keeps its own.
   */
  private placeGrip(
    state: Extract<SelectToolState, { phase: "grip" }>,
    point: Vec3,
    ctx: ToolContext
  ): void {
    const line = ctx.document.get(state.entityId)
    if (line?.type === "line") {
      const moved = carryOverrides(
        line,
        state.end === "start"
          ? createLine(point, line.end, line.layerId, line.id)
          : createLine(line.start, point, line.layerId, line.id)
      )
      const next =
        state.end === "start"
          ? withLineZ(moved, point.z, lineEndZ(line))
          : withLineZ(moved, lineStartZ(line), point.z)
      if (
        !V.equals(next.start, next.end) ||
        lineStartZ(next) !== lineEndZ(next)
      ) {
        gripEdit(ctx, new UpdateEntityCommand(next))
      }
    }
    ctx.dynamicInput.close()
    this.state = { phase: "idle" }
    ctx.requestRender()
  }

  /**
   * Applies a typed move distance along the current pointing direction (from
   * the grabbed midpoint towards the cursor), then commits. Without a pointing
   * direction (the cursor has not moved) there is nothing to apply.
   */
  private commitMove(distance: number, ctx: ToolContext): void {
    if (this.state.phase !== "moveLine") return
    const rise = riseAlongCursor(
      this.state.origMid,
      this.state.current,
      distance
    )
    if (rise) return this.placeMove(this.state, rise, ctx)
    const offset = V.sub(this.state.current, this.state.origMid)
    const length = V.length(offset)
    if (length < 1e-9) return // no direction indicated yet
    const dir = V.scale(offset, 1 / length)
    const newMid = withZOf(
      V.add(this.state.origMid, V.scale(dir, distance)),
      this.state.origMid
    )
    this.placeMove(this.state, newMid, ctx)
  }

  /**
   * Translates what is being moved so the base point lands on `newMid`, Z
   * included, through a single undoable command, then returns to idle. A
   * selection dragged drops the set, and U names its step `DROPGEOM GROUP`
   * (desktop move/d08; string table 52629 and 52656), where a grip edit's
   * names nothing and keeps the set.
   */
  private placeMove(
    state: Extract<SelectToolState, { phase: "moveLine" }>,
    newMid: Vec3,
    ctx: ToolContext
  ): void {
    ctx.dynamicInput.close()
    this.state = { phase: "idle" }
    if (state.dragsSelection) ctx.selection.clear()
    const delta = sub3(newMid, state.origMid)
    if (!V.equals(delta, V.zero()) || delta.z !== 0) {
      const moved = state.originals.map((entity) =>
        translateEntity(entity, delta)
      )
      const step = state.dragsSelection
        ? ctx.text.message("dropGeometryStep")
        : ctx.text.message("gripEditStep")
      if (moved.length > 0) {
        ctx.execute(new UpdateEntitiesCommand(moved), step)
      }
    }
    ctx.requestRender()
  }

  /** Applies a typed radius, then commits. */
  private commitRadius(radius: number, ctx: ToolContext): void {
    if (this.state.phase !== "resizeRadius") return
    this.placeRadius(this.state, radius, ctx)
  }

  /**
   * Resizes the circle/arc to `radius` (about its unchanged centre) through an
   * undoable command, then returns to idle. Non-positive radii are ignored.
   */
  private placeRadius(
    state: Extract<SelectToolState, { phase: "resizeRadius" }>,
    radius: number,
    ctx: ToolContext
  ): void {
    const entity = ctx.document.get(state.entityId)
    const next = entity ? withRadius(entity, radius) : null
    if (next && radius > 1e-9) gripEdit(ctx, new UpdateEntityCommand(next))
    ctx.dynamicInput.close()
    this.state = { phase: "idle" }
    ctx.requestRender()
  }

  /** Applies a typed absolute endpoint angle (degrees), then commits. */
  private commitArcAngle(degrees: number, ctx: ToolContext): void {
    if (this.state.phase !== "arcAngle") return
    this.placeArcAngle(this.state, (degrees * Math.PI) / 180, ctx)
  }

  /**
   * Swings the grabbed arc endpoint to `angle` (radians), keeping the radius and
   * the other endpoint, through an undoable command, then returns to idle.
   */
  private placeArcAngle(
    state: Extract<SelectToolState, { phase: "arcAngle" }>,
    angle: number,
    ctx: ToolContext
  ): void {
    const arc = ctx.document.get(state.entityId)
    if (arc?.type === "arc") {
      const startAngle = state.end === "start" ? angle : arc.startAngle
      const endAngle = state.end === "end" ? angle : arc.endAngle
      gripEdit(
        ctx,
        new UpdateEntityCommand(
          carryOverrides(
            arc,
            createArc(
              arc.center,
              arc.radius,
              startAngle,
              endAngle,
              arc.layerId,
              arc.id
            )
          )
        )
      )
    }
    ctx.dynamicInput.close()
    this.state = { phase: "idle" }
    ctx.requestRender()
  }

  /**
   * Applies a typed stretch distance along the current pointing direction (from
   * the vertex's original position towards the cursor), then commits. Without a
   * direction (the cursor has not moved) there is nothing to apply.
   */
  private commitVertex(distance: number, ctx: ToolContext): void {
    if (this.state.phase !== "moveVertex") return
    const offset = V.sub(this.state.current, this.state.origin)
    const length = V.length(offset)
    if (length < 1e-9) return // no direction indicated yet
    const dir = V.scale(offset, 1 / length)
    const point = V.add(this.state.origin, V.scale(dir, distance))
    this.placeVertex(this.state, point, ctx)
  }

  /**
   * Moves the grabbed polyline vertex to `point` through an undoable command,
   * then returns to idle. A no-op move (vertex unchanged) is skipped.
   */
  private placeVertex(
    state: Extract<SelectToolState, { phase: "moveVertex" }>,
    point: Vec2,
    ctx: ToolContext
  ): void {
    const entity = ctx.document.get(state.entityId)
    const moved = entity && withVertexAt(entity, state.index, point)
    if (moved && !V.equals(point, state.origin)) {
      gripEdit(ctx, new UpdateEntityCommand(moved))
    }
    ctx.dynamicInput.close()
    this.state = { phase: "idle" }
    ctx.requestRender()
  }

  /** Applies a typed distance along the current pointing direction, then commits. */
  private commitDimPoint(distance: number, ctx: ToolContext): void {
    if (this.state.phase !== "moveDimPoint") return
    const offset = V.sub(this.state.current, this.state.origin)
    const length = V.length(offset)
    if (length < 1e-9) return // no direction indicated yet
    const dir = V.scale(offset, 1 / length)
    const point = V.add(this.state.origin, V.scale(dir, distance))
    this.placeDimPoint(this.state, point, ctx)
  }

  /**
   * Moves the grabbed definition point to `point` through an undoable command,
   * then returns to idle. A no-op move is skipped.
   */
  private placeDimPoint(
    state: Extract<SelectToolState, { phase: "moveDimPoint" }>,
    point: Vec2,
    ctx: ToolContext
  ): void {
    const dim = ctx.document.get(state.entityId)
    if (dim?.type === "dimension" && !V.equals(point, state.origin)) {
      gripEdit(ctx, new UpdateEntityCommand(movedDimension(dim, state, point)))
    }
    ctx.dynamicInput.close()
    this.state = { phase: "idle" }
    ctx.requestRender()
  }

  /**
   * Applies a typed distance along the pointing direction (from the segment
   * midpoint towards the cursor), then commits. Without a direction (the
   * cursor has not moved) there is nothing to apply.
   */
  private commitSegmentStretch(distance: number, ctx: ToolContext): void {
    if (this.state.phase !== "stretchSegment") return
    const offset = V.sub(this.state.current, this.state.origin)
    const length = V.length(offset)
    if (length < 1e-9) return
    const dir = V.scale(offset, 1 / length)
    const point = V.add(this.state.origin, V.scale(dir, distance))
    this.placeSegmentStretch(this.state, point, ctx)
  }

  /**
   * Moves the grabbed segment so its midpoint lands on `point`, through an
   * undoable command, then returns to idle. A no-op move is skipped.
   */
  private placeSegmentStretch(
    state: Extract<SelectToolState, { phase: "stretchSegment" }>,
    point: Vec2,
    ctx: ToolContext
  ): void {
    const poly = ctx.document.get(state.entityId)
    if (poly?.type === "polyline" && !V.equals(point, state.origin)) {
      gripEdit(
        ctx,
        new UpdateEntityCommand(
          withSegmentStretched(
            poly,
            state.segmentIndex,
            V.sub(point, state.origin)
          )
        )
      )
    }
    ctx.dynamicInput.close()
    this.state = { phase: "idle" }
    ctx.requestRender()
  }

  /**
   * Bends the arc through `point`, its ends kept, as one undoable command;
   * onto its chord it is left as it was, with nothing said (desktop arc/d08).
   */
  private placeArcStretch(
    state: Extract<SelectToolState, { phase: "arcStretch" }>,
    point: Vec2,
    ctx: ToolContext
  ): void {
    const arc = ctx.document.get(state.entityId)
    const next = arc?.type === "arc" ? arcStretchedThrough(arc, point) : null
    if (next) gripEdit(ctx, new UpdateEntityCommand(next))
    this.state = { phase: "idle" }
    ctx.requestRender()
  }

  /**
   * Reshapes the ellipse as its grip dragged to `point` does, as one undoable
   * command; onto the centre, or an arc's end onto its other, it is left as
   * it was.
   */
  private placeEllipseGrip(
    state: Extract<SelectToolState, { phase: "ellipseGrip" }>,
    point: Vec2,
    ctx: ToolContext
  ): void {
    const ellipse = ctx.document.get(state.entityId)
    const next =
      ellipse?.type === "ellipse"
        ? ellipseGripped(ellipse, state.role, point)
        : null
    if (next) gripEdit(ctx, new UpdateEntityCommand(next))
    this.state = { phase: "idle" }
    ctx.requestRender()
  }

  /** Applies a typed bulge value to the grabbed segment, then commits. */
  private commitBulge(bulge: number, ctx: ToolContext): void {
    if (this.state.phase !== "bulgeEdit") return
    this.placeBulge(this.state, bulge, ctx)
  }

  /**
   * Sets the grabbed segment's bulge to `bulge` through an undoable command,
   * then returns to idle.
   */
  private placeBulge(
    state: Extract<SelectToolState, { phase: "bulgeEdit" }>,
    bulge: number,
    ctx: ToolContext
  ): void {
    const poly = ctx.document.get(state.entityId)
    if (poly?.type === "polyline") {
      gripEdit(
        ctx,
        new UpdateEntityCommand(
          setPolylineBulge(poly, state.segmentIndex, bulge)
        )
      )
    }
    ctx.dynamicInput.close()
    this.state = { phase: "idle" }
    ctx.requestRender()
  }
}

/** What the lasso would take that is not selected yet, previewed. */
function lassoPreview(lasso: Lasso, ctx: ToolContext): readonly EntityId[] {
  return previewOf(
    lassoSelect(ctx.document, lasso, ctx.viewport, (entity) =>
      ctx.document.isEntitySelectable(entity)
    ),
    ctx
  )
}

function previewOf(
  ids: readonly EntityId[],
  ctx: ToolContext
): readonly EntityId[] {
  return ids.filter((id) => !ctx.selection.has(id))
}

/** The lasso's line, as it starts and at each Space (desktop erase/d04-cl3). */
function sayLasso(lasso: Lasso, ctx: ToolContext): void {
  ctx.report(ctx.text.message("lassoMode", { mode: lasso.mode }))
}

/**
 * A grip's edit at `Command:`: a step U and REDO name `Grip Edit` (desktop
 * arrays/d14; es `Editar pinzamiento`, table 6001).
 */
function gripEdit(ctx: ToolContext, command: Command): void {
  ctx.execute(command, ctx.text.message("gripEditStep"))
}
