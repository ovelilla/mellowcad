import { Vec2, V } from "../../geometry/Vec2"
import { planar } from "../../geometry/Vec3"
import type { ArrayParameters } from "../../domain/entities"
import type { ArrayPlacement } from "../../domain/arrayEdits"
import { MAX_ARRAY_COUNT } from "../../domain/arrays"
import { ScenePrimitive } from "../../scene/types"
import {
  ARRAY_GRIP_FIELDS,
  ArrayGrip,
  arrayGripValue,
  arrayGrips,
  dragArrayGrip,
  typedArrayGrip,
} from "./arrayGrips"
import { GRIP_PICK_PX, gripPrimitives } from "./selectToolGrips"
import { arrowOnScreen, gripRubberBand } from "./selectToolOverlay"
import { PointerInput, ToolContext } from "./Tool"

/** Screen-pixel movement past which a press on a grip is a drag, as at `Command:`. */
const DRAG_THRESHOLD_PX = 4

const STILL: Vec2 = { x: 0, y: 0 }

/**
 * The array an array command's main prompt shows: its parameters in the
 * UCS's frame, as `makeArray` takes them, and its block's base point there.
 */
export interface ArrayAtPrompt {
  readonly array: ArrayParameters
  readonly base: Vec2
}

/** What the command does with what a grip makes. */
export interface ArrayGripHost {
  /** Takes the parameters a grip's drag or typed value made. */
  take(array: ArrayParameters): void
  /** Asks the main prompt again. */
  main(ctx: ToolContext): void
}

interface Hot {
  readonly grip: ArrayGrip
  readonly cursor: Vec2
  readonly pressScreen: Vec2
}

/**
 * The grips ARRAYRECT, ARRAYPOLAR and ARRAYPATH's main prompt picks
 * (`Select grip to edit array or`, ARRAYS-D77): the preview wears the grips
 * the array wears at `Command:`, drawn and hit as there (desktop arrays/d18-1,
 * d01-1, d02-2, d03-2, d01b-1), the polar ring left out (d02-2). A click on one
 * makes it hot and the preview follows the cursor with its default drag,
 * `dragArrayGrip`, the grips hidden and a dashed line from the grip (d18c-1);
 * a second click, or the release of a drag, takes it and asks the main prompt
 * again (d18c: 32 at 6 apart is 6 columns). A number typed while it is hot is
 * the value, as at `Command:` (d17). Enter while a count grip is hot is
 * refused in the console's words and asks the main prompt again (d18d); at
 * any other grip it goes back in silence (**unverified**). The move grips —
 * the base square, a ring's centre, a path's start — move the whole preview,
 * the source with it (**unverified** mid-command; d14h at `Command:`). No grip
 * writes its own prompt lines (`** COLUMN COUNT **`): while one is hot the
 * command names no question.
 */
export class ArrayPromptGrips {
  /** How far the move grips moved the array from its block's base point. */
  private offset: Vec2 = STILL
  private hover: ArrayGrip | null = null
  private hot: Hot | null = null

  constructor(private readonly host: ArrayGripHost) {}

  /** A new run: nothing moved, nothing hot. */
  start(): void {
    this.offset = STILL
    this.hover = null
    this.hot = null
  }

  isHot(): boolean {
    return this.hot !== null
  }

  /** How far the move grips moved the array, for the preview and the commit. */
  moved(): Vec2 {
    return this.offset
  }

  /** Where the hot grip was taken, which Ortho and Polar measure from. */
  anchor(): Vec2 | null {
    return this.hot?.grip.at ?? null
  }

  onPointerMove(
    input: PointerInput,
    at: ArrayAtPrompt,
    ctx: ToolContext
  ): void {
    if (this.hot === null) {
      this.hover = this.gripAt(input.screen, at, ctx)
      return
    }
    this.hot = { ...this.hot, cursor: planar(input.point) }
    const reading = this.reading(at)
    if (reading !== null) ctx.dynamicInput.setLive("value", reading)
  }

  /**
   * A press at the main prompt: a grip under it made hot, or the hot one's
   * drag taken there. False where it hit no grip and none was hot.
   */
  onPointerDown(
    input: PointerInput,
    at: ArrayAtPrompt,
    ctx: ToolContext
  ): boolean {
    if (this.hot !== null) {
      this.place(planar(input.point), at, ctx)
      return true
    }
    const grip = this.gripAt(input.screen, at, ctx)
    if (grip === null) return false
    this.hover = null
    this.hot = { grip, cursor: grip.at, pressScreen: input.screen }
    const field = grip.role === "move" ? null : ARRAY_GRIP_FIELDS[grip.role]
    ctx.dynamicInput.open({
      fields: field ? [{ id: "value", ...field }] : [],
      commit: (values, commitCtx) => this.typed(values.value, at, commitCtx),
    })
    const reading = this.reading(at)
    if (reading !== null) ctx.dynamicInput.setLive("value", reading)
    ctx.dynamicInput.setPosition(input.screen)
    ctx.requestRender()
    return true
  }

  /** The release of a press dragged off its grip takes the drag, as at `Command:`. */
  onPointerUp(input: PointerInput, at: ArrayAtPrompt, ctx: ToolContext): void {
    const hot = this.hot
    if (hot === null) return
    const dragged =
      V.distance(input.screen, hot.pressScreen) >= DRAG_THRESHOLD_PX
    if (dragged) this.place(planar(input.point), at, ctx)
  }

  /**
   * Enter while a grip is hot: at a count, `Requires an integer between 1
   * and 32767, or option keyword.` (desktop arrays/d18d; AutoCAD's `an` typo
   * not copied, ARRAYS-D77; the corner's **unverified**); elsewhere nothing
   * said (**unverified**). Either way the main prompt is asked again.
   */
  onEnter(ctx: ToolContext): boolean {
    const hot = this.hot
    if (hot === null) return false
    const role = hot.grip.role
    if (role === "columnCount" || role === "rowCount" || role === "counts") {
      ctx.report(
        ctx.text.message("requiresIntegerBetweenOrKeyword", {
          min: 1,
          max: MAX_ARRAY_COUNT,
        }),
        "error"
      )
    }
    this.back(ctx)
    return true
  }

  /**
   * What the main prompt draws over the array: its grips, the one under the
   * cursor hot (d18-1, d01b-1); while one is hot none, but the dashed line
   * from it to the cursor (d18c-1).
   */
  overlay(at: ArrayAtPrompt, ctx: ToolContext): ScenePrimitive[] {
    const toScreen = (point: Vec2) => ctx.viewport.worldToScreen(point)
    if (this.hot !== null) {
      return [
        gripRubberBand(toScreen(this.hot.grip.at), toScreen(this.hot.cursor)),
      ]
    }
    return this.grips(at).flatMap((grip) =>
      gripPrimitives(
        toScreen(grip.at),
        this.hover !== null && sameSpot(grip, this.hover),
        grip.along ? "arrow" : "square",
        arrowOnScreen({ ...grip.at, z: 0 }, grip.along, ctx)
      )
    )
  }

  /**
   * The array the preview shows, and how far it is moved: the hot grip's
   * drag to the cursor applied, or the array as it is where the drag is
   * refused (a count past 32767, a ring past a turn).
   */
  shown(at: ArrayAtPrompt): { array: ArrayParameters; offset: Vec2 } {
    const hot = this.hot
    if (hot === null) return { array: at.array, offset: this.offset }
    if (hot.grip.role === "move") {
      return {
        array: at.array,
        offset: V.add(this.offset, V.sub(hot.cursor, hot.grip.at)),
      }
    }
    const dragged = dragArrayGrip(
      at.array,
      this.placement(at.base),
      hot.grip.role,
      hot.cursor
    )
    return { array: dragged ?? at.array, offset: this.offset }
  }

  private grips(at: ArrayAtPrompt): ArrayGrip[] {
    return arrayGrips(at.array, this.placement(at.base))
  }

  /** The preview's placement: the block's base point where the move grips put it. */
  private placement(base: Vec2): ArrayPlacement {
    return {
      origin: base,
      position: V.add(base, this.offset),
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
    }
  }

  /** The grip nearest `screen` within the pick radius; a later one on a tie, as at `Command:`. */
  private gripAt(
    screen: Vec2,
    at: ArrayAtPrompt,
    ctx: ToolContext
  ): ArrayGrip | null {
    let best: ArrayGrip | null = null
    let bestDist = GRIP_PICK_PX
    for (const grip of this.grips(at)) {
      const dist = V.distance(ctx.viewport.worldToScreen(grip.at), screen)
      if (dist <= bestDist) {
        bestDist = dist
        best = grip
      }
    }
    return best
  }

  /** What the hot grip's box reads with the cursor where it is. */
  private reading(at: ArrayAtPrompt): number | null {
    const hot = this.hot
    if (hot === null || hot.grip.role === "move") return null
    if (!ARRAY_GRIP_FIELDS[hot.grip.role]) return null
    return arrayGripValue(
      this.shown(at).array,
      this.placement(at.base),
      hot.grip.role
    )
  }

  /** The hot grip's drag to `cursor` taken; refused, the grip stays hot (ARRAYS-D72). */
  private place(cursor: Vec2, at: ArrayAtPrompt, ctx: ToolContext): void {
    const hot = this.hot
    if (hot === null) return
    if (hot.grip.role === "move") {
      this.offset = V.add(this.offset, V.sub(cursor, hot.grip.at))
      this.back(ctx)
      return
    }
    const array = dragArrayGrip(
      at.array,
      this.placement(at.base),
      hot.grip.role,
      cursor
    )
    if (array === null) return
    this.host.take(array)
    this.back(ctx)
  }

  /** A value typed while the grip is hot; refused, the grip stays hot, as at `Command:`. */
  private typed(value: number, at: ArrayAtPrompt, ctx: ToolContext): void {
    const hot = this.hot
    if (hot === null || hot.grip.role === "move") return
    const array = typedArrayGrip(
      at.array,
      this.placement(at.base),
      hot.grip.role,
      value
    )
    if (array === null) return
    this.host.take(array)
    this.back(ctx)
  }

  private back(ctx: ToolContext): void {
    this.hot = null
    this.host.main(ctx)
  }
}

function sameSpot(a: ArrayGrip, b: ArrayGrip): boolean {
  return a.role === b.role && V.equals(a.at, b.at)
}
