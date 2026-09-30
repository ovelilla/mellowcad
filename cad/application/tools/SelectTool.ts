import { Vec2, V } from "../../geometry/Vec2"
import {
  Entity,
  EntityId,
  createArc,
  createLine,
  insertPolylineVertex,
  polylineSegmentGeometries,
  removePolylineVertex,
  setPolylineBulge,
  translateEntity,
} from "../../domain/entities"
import {
  RemoveEntitiesCommand,
  UpdateEntitiesCommand,
  UpdateEntityCommand,
} from "../commands/entityCommands"
import { DynamicInputSession } from "../input/DynamicInput"
import { ConstructionGeometry } from "../snapping/types"
import { bulgeThroughPoint, normalizeDegrees } from "../../geometry/primitives"
import { ScenePrimitive } from "../../scene/types"
import { boxSelect } from "./boxSelection"
import { KeyInput, PointerInput, Tool, ToolContext } from "./Tool"
import {
  DimensionPoint,
  Grip,
  LineEnd,
  SelectToolState,
} from "./selectToolState"
import { hitGrip, sameGrip } from "./selectToolGrips"
import {
  movedDimension,
  mtextWidthThrough,
  radiusHandle,
  toDegrees,
  withRadius,
  withVertexAt,
} from "./selectToolEdits"
import {
  buildArcAngleEdit,
  buildBulgeEdit,
  buildDimPointEdit,
  buildGripEdit,
  buildGrips,
  buildInsertEdit,
  buildMoveEdit,
  buildMTextWidthEdit,
  buildRadiusEdit,
  buildSelectionBox,
  buildVertexEdit,
  pickRolloverEntity,
} from "./selectToolOverlay"

/** Screen-pixel movement past which a press-drag becomes a box selection. */
const DRAG_THRESHOLD_PX = 4

/**
 * The select tool's interaction flow as an explicit state machine:
 *
 * ```
 *          press                 move ≥ threshold           release
 *  idle ─────────► pressed ───────────────────► boxing ───────────► idle
 *                     │ release (no drag)                    (box select)
 *                     └────────────────────► idle (click select)
 * ```
 *
 * Behaves like AutoCAD's default pick:
 * - A plain click selects the entity under the cursor (shift-click toggles it,
 *   clicking empty space clears the selection).
 * - Dragging left→right selects only fully-enclosed objects (a blue *window*);
 *   dragging right→left also selects objects the box merely touches (a green
 *   *crossing* window). Holding shift adds the box result to the selection.
 *
 * Selected objects also show *grips* (small squares). Lines show endpoint grips
 * (lengthen along the axis) and a midpoint grip (move). Circles show a centre
 * grip (move) and four quadrant grips (resize the radius). Arcs show a centre
 * grip (move), two endpoint grips (swing the sweep) and a midpoint grip (resize
 * the radius). In every case you can drag and click to place, or type the exact
 * amount in the dynamic input, exactly like AutoCAD grip editing.
 *
 * Deleting the selection goes through {@link RemoveEntitiesCommand}, so it is
 * undoable like any other document change.
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
    if (this.state.phase === "moveVertex") {
      this.placeVertex(this.state, this.state.current, ctx)
      return
    }
    if (this.state.phase === "insertVertex") {
      this.placeInsert(this.state, this.state.current, ctx)
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
    if (this.state.phase === "mtextWidth") {
      this.placeMTextWidth(this.state, this.state.width, ctx)
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
        case "vertex":
          // Ctrl-click removes the vertex (AutoCAD's multifunction-grip "Remove
          // Vertex"); a plain click grabs it to stretch.
          if (input.ctrlKey) {
            this.removeVertexAt(grip.entityId, grip.role.index, ctx)
          } else {
            this.beginVertexMove(grip, grip.role.index, input.screen, ctx)
          }
          break
        case "addVertex":
          this.beginInsertVertex(
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
          this.beginMTextWidth(grip, input.screen, ctx)
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
      additive: input.shiftKey,
      onSelection: this.pressedOnSelection(input, ctx),
    }
    ctx.requestRender()
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    switch (this.state.phase) {
      case "grip": {
        // The resolver already folds snap → tracking → Ortho into `input.point`
        // relative to the fixed end (our constraint anchor), so an osnap, an
        // acquired tracking alignment or an Ortho lock all drive the endpoint —
        // and Ortho combines with tracking (the point lands on the Ortho×guide
        // intersection). Only when nothing has moved the raw cursor do we fall
        // back to sliding along the line's own axis (a plain collinear
        // lengthen/shorten that keeps the line's direction).
        const moving = V.equals(input.point, input.world)
          ? V.add(
              this.state.fixed,
              V.scale(
                this.state.dir,
                V.dot(V.sub(input.world, this.state.fixed), this.state.dir)
              )
            )
          : input.point
        this.state = { ...this.state, moving }
        // The typed field is a *magnitude*; its direction (lengthen vs shorten)
        // is inferred from where the cursor is, so no sign is ever needed.
        ctx.dynamicInput.setLive(
          "lengthen",
          Math.abs(V.distance(this.state.fixed, moving) - this.state.origLength)
        )
        ctx.dynamicInput.setPosition(input.screen)
        ctx.requestRender()
        break
      }
      case "moveLine": {
        // The midpoint follows the cursor (snapped when a snap is active); the
        // whole line translates with it.
        const current = input.point
        this.state = { ...this.state, current }
        ctx.dynamicInput.setLive(
          "distance",
          V.distance(this.state.origMid, current)
        )
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
      case "insertVertex": {
        // The new vertex follows the cursor; both halves of the split segment
        // rubber-band to it.
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
          if (this.state.onSelection && !this.state.additive) {
            this.beginSelectionDrag(
              this.state.startWorld,
              this.state.startScreen,
              ctx
            )
          } else {
            this.state = {
              phase: "boxing",
              startWorld: this.state.startWorld,
              currentWorld: input.world,
              additive: this.state.additive,
            }
          }
          ctx.requestRender()
        } else {
          this.state = { ...this.state, currentWorld: input.world }
        }
        break
      }
      case "boxing":
        this.state = { ...this.state, currentWorld: input.world }
        ctx.requestRender()
        break
      case "idle": {
        // Track which grip the cursor hovers so it can be drawn hot, matching
        // AutoCAD's grip highlight. The magnetic crosshair snap is handled
        // separately via magneticCursor(). Also track the unselected entity
        // under the cursor for AutoCAD's selection-preview (rollover) highlight.
        const hoverGrip = hitGrip(input.screen, ctx)
        const hoverEntityId = pickRolloverEntity(input, ctx)
        const gripChanged = !sameGrip(hoverGrip, this.state.hoverGrip ?? null)
        const entityChanged =
          hoverEntityId !== (this.state.hoverEntityId ?? null)
        if (gripChanged || entityChanged) {
          this.state = { phase: "idle", hoverGrip, hoverEntityId }
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
        // (which also frees the mouse to type an exact lengthening).
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
      case "insertVertex": {
        const dragged =
          Math.hypot(
            input.screen.x - this.state.pressScreen.x,
            input.screen.y - this.state.pressScreen.y
          ) >= DRAG_THRESHOLD_PX
        if (dragged) this.placeInsert(this.state, this.state.current, ctx)
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
      case "boxing":
        this.commitBoxSelection(
          this.state.startWorld,
          this.state.currentWorld,
          this.state.additive,
          ctx
        )
        break
      case "pressed":
        this.commitClickSelection(input, ctx)
        break
      case "idle":
        return
    }

    this.state = { phase: "idle" }
    ctx.requestRender()
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
        this.state.phase === "arcAngle"
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
        this.state.phase === "mtextWidth"
      ) {
        // Abort the definition-point drag, leaving the dimension untouched.
        ctx.dynamicInput.close()
        this.state = { phase: "idle" }
        ctx.requestRender()
        return
      }
      if (
        this.state.phase === "insertVertex" ||
        this.state.phase === "bulgeEdit"
      ) {
        // Abort the add-vertex / curvature edit, leaving the polyline untouched.
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
    if (input.key === "Delete" || input.key === "Backspace") {
      if (ctx.selection.isEmpty()) return
      ctx.execute(new RemoveEntitiesCommand(ctx.selection.toArray()))
      ctx.selection.clear()
      ctx.requestRender()
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
  wantsSnap(): boolean {
    return (
      this.state.phase === "moveLine" ||
      this.state.phase === "grip" ||
      this.state.phase === "resizeRadius" ||
      this.state.phase === "arcAngle" ||
      this.state.phase === "moveVertex" ||
      this.state.phase === "insertVertex" ||
      this.state.phase === "bulgeEdit" ||
      this.state.phase === "moveDimPoint" ||
      this.state.phase === "mtextWidth"
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
      this.state.phase === "insertVertex"
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
    if (this.state.phase === "moveVertex") return this.state.origin
    if (this.state.phase === "moveDimPoint") return this.state.origin
    if (this.state.phase === "mtextWidth") return this.state.origin
    if (this.state.phase === "insertVertex") return this.state.origin
    if (this.state.phase === "bulgeEdit")
      return V.midpoint(this.state.a, this.state.b)
    return null
  }

  /**
   * Exposes the line being grip-edited as provisional geometry so object snaps —
   * chiefly intersection — engage on it while it is stretched or moved, exactly
   * as they do on the rubber-band of the line tool. Stretching keeps the segment
   * collinear (endpoint projected onto the line axis); moving translates the
   * whole segment. `cursor` is the raw world cursor.
   */
  getSnapGeometry(cursor: Vec2): readonly ConstructionGeometry[] {
    if (this.state.phase === "grip") {
      const { fixed, dir } = this.state
      const moving = V.add(
        fixed,
        V.scale(dir, V.dot(V.sub(cursor, fixed), dir))
      )
      return [{ kind: "segment", a: fixed, b: moving }]
    }
    if (this.state.phase === "moveLine") {
      const delta = V.sub(cursor, this.state.origMid)
      const out: ConstructionGeometry[] = []
      for (const entity of this.state.originals) {
        if (entity.type !== "line") continue
        out.push({
          kind: "segment",
          a: V.add(entity.start, delta),
          b: V.add(entity.end, delta),
        })
      }
      return out
    }
    return []
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    const state = this.state
    switch (state.phase) {
      case "boxing":
        return buildSelectionBox(state, ctx)
      case "grip":
        return buildGripEdit(state, ctx)
      case "moveLine":
        return buildMoveEdit(state, ctx)
      case "resizeRadius":
        return buildRadiusEdit(state, ctx)
      case "arcAngle":
        return buildArcAngleEdit(state, ctx)
      case "moveVertex":
        return buildVertexEdit(state, ctx)
      case "insertVertex":
        return buildInsertEdit(state, ctx)
      case "bulgeEdit":
        return buildBulgeEdit(state, ctx)
      case "moveDimPoint":
        return buildDimPointEdit(state, ctx)
      case "mtextWidth":
        return buildMTextWidthEdit(state, ctx)
      default:
        return buildGrips(state, ctx)
    }
  }

  private commitBoxSelection(
    start: Vec2,
    current: Vec2,
    additive: boolean,
    ctx: ToolContext
  ): void {
    const hits = boxSelect(ctx.document, start, current)
    if (additive) {
      for (const id of hits) ctx.selection.add(id)
    } else {
      ctx.selection.set(hits)
    }
  }

  private commitClickSelection(input: PointerInput, ctx: ToolContext): void {
    const hit = ctx.pick(input.world)

    if (!hit) {
      if (!input.shiftKey) ctx.selection.clear()
      return
    }

    if (input.shiftKey) {
      ctx.selection.toggle(hit.id)
    } else {
      ctx.selection.set([hit.id])
    }
  }

  /** Makes an endpoint grip hot and opens the lengthen dynamic input. */
  private beginGrip(
    grip: Grip,
    end: LineEnd,
    screen: Vec2,
    ctx: ToolContext
  ): void {
    const line = ctx.document.get(grip.entityId)
    if (line?.type !== "line") return

    const moving = end === "start" ? line.start : line.end
    const fixed = end === "start" ? line.end : line.start
    const axis = V.sub(moving, fixed)
    const origLength = V.length(axis)
    if (origLength < 1e-9) return // a degenerate line has no axis to lengthen

    this.state = {
      phase: "grip",
      entityId: grip.entityId,
      end,
      fixed,
      dir: V.scale(axis, 1 / origLength),
      origLength,
      moving,
      pressScreen: screen,
    }
    this.openLengthenInput(ctx, screen)
    ctx.requestRender()
  }

  /** Whether the press landed on an object that is already selected. */
  private pressedOnSelection(input: PointerInput, ctx: ToolContext): boolean {
    if (ctx.selection.isEmpty()) return false
    const hit = ctx.pick(input.world)
    return hit !== null && ctx.selection.has(hit.id)
  }

  /**
   * Starts moving the whole selection from `base` — the point that was pressed.
   * Reuses the move-grip machinery, so the drag gets the same dashed preview,
   * object snap, Ortho lock and typed-distance entry, and commits as one
   * undoable step on release.
   */
  private beginSelectionDrag(base: Vec2, screen: Vec2, ctx: ToolContext): void {
    const originals = ctx.selection
      .toArray()
      .map((id) => ctx.document.get(id))
      .filter((e): e is Entity => e !== undefined)
    if (originals.length === 0) return
    this.state = {
      phase: "moveLine",
      originals,
      origMid: base,
      current: base,
      pressScreen: screen,
    }
    this.openMoveInput(ctx, screen)
  }

  /** Makes a move grip (line midpoint / circle-arc centre) hot and starts a move. */
  private beginMove(grip: Grip, screen: Vec2, ctx: ToolContext): void {
    // Move the whole selection together, anchored on the grabbed grip.
    const originals = ctx.selection
      .toArray()
      .map((id) => ctx.document.get(id))
      .filter((e): e is Entity => e !== undefined)
    if (originals.length === 0) return
    this.state = {
      phase: "moveLine",
      originals,
      origMid: grip.world,
      current: grip.world,
      pressScreen: screen,
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

  /** Makes a multiline text's width grip hot and opens the width input. */
  private beginMTextWidth(grip: Grip, screen: Vec2, ctx: ToolContext): void {
    const mtext = ctx.document.get(grip.entityId)
    if (mtext?.type !== "mtext") return
    this.state = {
      phase: "mtextWidth",
      entityId: grip.entityId,
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
      ctx.execute(new UpdateEntityCommand({ ...mtext, width }))
    }
    ctx.dynamicInput.close()
    this.state = { phase: "idle" }
    ctx.requestRender()
  }

  /** Makes a straight-segment midpoint grip hot to insert a new vertex. */
  private beginInsertVertex(
    grip: Grip,
    segmentIndex: number,
    screen: Vec2,
    ctx: ToolContext
  ): void {
    const poly = ctx.document.get(grip.entityId)
    if (poly?.type !== "polyline") return
    this.state = {
      phase: "insertVertex",
      entityId: grip.entityId,
      segmentIndex,
      origin: grip.world,
      current: grip.world,
      pressScreen: screen,
    }
    this.openInsertInput(ctx, screen)
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

  /** Removes vertex `index` from a polyline through an undoable command. */
  private removeVertexAt(
    entityId: EntityId,
    index: number,
    ctx: ToolContext
  ): void {
    const poly = ctx.document.get(entityId)
    if (poly?.type !== "polyline") return
    const next = removePolylineVertex(poly, index)
    if (next) ctx.execute(new UpdateEntityCommand(next))
    ctx.requestRender()
  }
  private openLengthenInput(ctx: ToolContext, screen: Vec2): void {
    const session: DynamicInputSession = {
      fields: [{ id: "lengthen", prompt: "lengthen", kind: "length" }],
      commit: (values, commitCtx) =>
        this.commitLengthen(values.lengthen, commitCtx),
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setLive("lengthen", 0)
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

  /** Opens the dynamic-input session offering the new vertex distance. */
  private openInsertInput(ctx: ToolContext, screen: Vec2): void {
    const session: DynamicInputSession = {
      fields: [{ id: "distance", prompt: "move", kind: "distance" }],
      commit: (values, commitCtx) =>
        this.commitInsert(values.distance, commitCtx),
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

  /** Applies a typed lengthening magnitude along the line's axis, then commits. */
  private commitLengthen(amount: number, ctx: ToolContext): void {
    if (this.state.phase !== "grip") return
    // Infer the direction from the current drag: if the cursor is pulling the
    // endpoint back past its original spot the value shortens, otherwise it
    // lengthens — so the user never has to type a sign.
    const currentLength = V.dot(
      V.sub(this.state.moving, this.state.fixed),
      this.state.dir
    )
    const sign = currentLength < this.state.origLength ? -1 : 1
    const newLength = this.state.origLength + sign * Math.abs(amount)
    const point = V.add(this.state.fixed, V.scale(this.state.dir, newLength))
    this.placeGrip(this.state, point, ctx)
  }

  /**
   * Writes the moving endpoint to `point` through an undoable command, keeping
   * the line's other end fixed, then returns to idle. Zero-length results are
   * ignored so a line can never collapse onto a single point.
   */
  private placeGrip(
    state: Extract<SelectToolState, { phase: "grip" }>,
    point: Vec2,
    ctx: ToolContext
  ): void {
    const line = ctx.document.get(state.entityId)
    if (line?.type === "line") {
      const next =
        state.end === "start"
          ? createLine(point, line.end, line.layerId, line.id)
          : createLine(line.start, point, line.layerId, line.id)
      if (!V.equals(next.start, next.end)) {
        ctx.execute(new UpdateEntityCommand(next))
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
    const offset = V.sub(this.state.current, this.state.origMid)
    const length = V.length(offset)
    if (length < 1e-9) return // no direction indicated yet
    const dir = V.scale(offset, 1 / length)
    const newMid = V.add(this.state.origMid, V.scale(dir, distance))
    this.placeMove(this.state, newMid, ctx)
  }

  /**
   * Translates the whole selection so the base point lands on `newMid`, through
   * a single undoable command, then returns to idle.
   */
  private placeMove(
    state: Extract<SelectToolState, { phase: "moveLine" }>,
    newMid: Vec2,
    ctx: ToolContext
  ): void {
    const delta = V.sub(newMid, state.origMid)
    if (!V.equals(delta, V.zero())) {
      const moved = state.originals.map((entity) =>
        translateEntity(entity, delta)
      )
      if (moved.length > 0) ctx.execute(new UpdateEntitiesCommand(moved))
    }
    ctx.dynamicInput.close()
    this.state = { phase: "idle" }
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
    if (next && radius > 1e-9) ctx.execute(new UpdateEntityCommand(next))
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
      ctx.execute(
        new UpdateEntityCommand(
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
      ctx.execute(new UpdateEntityCommand(moved))
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
      ctx.execute(new UpdateEntityCommand(movedDimension(dim, state, point)))
    }
    ctx.dynamicInput.close()
    this.state = { phase: "idle" }
    ctx.requestRender()
  }

  /**
   * Applies a typed distance along the pointing direction (from the segment
   * midpoint towards the cursor) for the inserted vertex, then commits. Without
   * a direction (the cursor has not moved) there is nothing to apply.
   */
  private commitInsert(distance: number, ctx: ToolContext): void {
    if (this.state.phase !== "insertVertex") return
    const offset = V.sub(this.state.current, this.state.origin)
    const length = V.length(offset)
    if (length < 1e-9) return
    const dir = V.scale(offset, 1 / length)
    const point = V.add(this.state.origin, V.scale(dir, distance))
    this.placeInsert(this.state, point, ctx)
  }

  /**
   * Inserts a new vertex at `point`, splitting the grabbed segment, through an
   * undoable command, then returns to idle.
   */
  private placeInsert(
    state: Extract<SelectToolState, { phase: "insertVertex" }>,
    point: Vec2,
    ctx: ToolContext
  ): void {
    const poly = ctx.document.get(state.entityId)
    if (poly?.type === "polyline") {
      ctx.execute(
        new UpdateEntityCommand(
          insertPolylineVertex(poly, state.segmentIndex, point)
        )
      )
    }
    ctx.dynamicInput.close()
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
      ctx.execute(
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
