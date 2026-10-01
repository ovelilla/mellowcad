import { Vec2, V } from "../../geometry/Vec2"
import { Vec3 } from "../../geometry/Vec3"
import {
  createPolyline,
  onPlaneOf,
  withElevation,
  withThickness,
} from "../../domain/entities"
import { formatLength } from "../../domain/units"
import {
  Ucs,
  ucsPointToWorld,
  worldDirectionToUcs,
  worldPointToUcs,
} from "../../domain/ucs"
import { AddEntityCommand } from "../commands/entityCommands"
import { DynamicInputSession } from "../input/DynamicInput"
import type { PromptId } from "../../locales/types"
import {
  isCoordinateExpression,
  parseCoordinate,
} from "../input/coordinateInput"
import { ScenePrimitive } from "../../scene/types"
import { THEME } from "../../scene/theme"
import {
  CommandOption,
  CommandOptionOutcome,
  KeyInput,
  PointerInput,
  Tool,
  ToolContext,
} from "./Tool"
import { withCurrentProperties } from "./currentProperties"

/**
 * AutoCAD's RECTANG: two opposite corners define a rectangle squared to the
 * UCS, created as a single closed four-vertex polyline. Single-shot — the command
 * ends the moment the second corner is placed. Of the first prompt's options
 * only Elevation and Thickness are offered; Chamfer, Fillet, Width and the
 * second prompt's Area, Dimensions and Rotation are later work.
 */
type RectangleToolState =
  /** Awaiting the first corner. */
  | { readonly phase: "first" }
  /** Asking the Elevation or the Thickness option's value. */
  | { readonly phase: "elevation" | "thickness" }
  /** First corner placed; rubber-banding the opposite corner. */
  | { readonly phase: "second"; readonly first: Vec3; readonly cursor: Vec2 }

export class RectangleTool implements Tool {
  readonly id = "rectangle"

  private state: RectangleToolState = { phase: "first" }
  private lastScreen: Vec2 | null = null
  /**
   * The Elevation and Thickness options, kept "until you enter a different
   * value" for the session; RECTANG uses them instead of ELEVATION and THICKNESS.
   */
  private elevation = 0
  private thickness = 0

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    ctx.selection.clear()
    this.state = { phase: "first" }
    if (this.elevation !== 0 || this.thickness !== 0) {
      const settings = ctx.document.getSettings()
      ctx.report(
        ctx.text.message("rectangleModes", {
          hasElevation: this.elevation !== 0 ? "yes" : "no",
          elevation: formatLength(this.elevation, settings),
          hasThickness: this.thickness !== 0 ? "yes" : "no",
          thickness: formatLength(this.thickness, settings),
        })
      )
    }
    this.openPointInput(ctx, "firstCorner")
  }

  onDeactivate(ctx: ToolContext): void {
    this.state = { phase: "first" }
    ctx.dynamicInput.close()
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen
    if (this.state.phase === "second") {
      this.state = { ...this.state, cursor: input.point }
    }
    ctx.dynamicInput.setPosition(input.screen)
    ctx.requestRender()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0 || !this.wantsSnap()) return
    this.advanceWithPoint(input.point, ctx, input.screen)
  }

  onKeyDown(input: KeyInput, ctx: ToolContext): void {
    if (input.key === "Escape") {
      this.state = { phase: "first" }
      ctx.dynamicInput.close()
      ctx.requestRender()
    }
  }

  commandOptions(): readonly CommandOption[] {
    return this.state.phase === "first"
      ? [{ id: "Elevation" }, { id: "Thickness" }]
      : []
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    if (this.state.phase !== "first") return "unhandled"
    switch (id) {
      case "Elevation":
        this.askMode("elevation", ctx)
        return "continue"
      case "Thickness":
        this.askMode("thickness", ctx)
        return "continue"
      default:
        return "unhandled"
    }
  }

  wantsSnap(): boolean {
    return this.state.phase === "first" || this.state.phase === "second"
  }

  getConstraintAnchor(): Vec2 | null {
    return this.state.phase === "second" ? this.state.first : null
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    if (this.state.phase !== "second") return []
    const corners = rectangleCorners(
      this.state.first,
      this.state.cursor,
      ctx.ucs
    )
    return [
      {
        kind: "path",
        points: corners.map((c) => ctx.viewport.worldToScreen(c)),
        closed: true,
        stroke: { color: THEME.rubberBand, width: 1 },
      },
    ]
  }

  /**
   * Advances the point phases with a resolved world point, shared by the click
   * path and the typed-coordinate path so both behave identically.
   */
  private advanceWithPoint(point: Vec3, ctx: ToolContext, screen?: Vec2): void {
    const at = screen ?? this.lastScreen ?? ctx.viewport.worldToScreen(point)
    if (this.state.phase === "first") {
      this.state = { phase: "second", first: point, cursor: point }
      this.openPointInput(ctx, "otherCorner", at)
      ctx.requestRender()
      return
    }
    if (this.state.phase === "second") {
      this.commitRectangle(this.state.first, point, ctx)
    }
  }

  /** The Elevation or Thickness sub-prompt, offering the current value. */
  private askMode(mode: "elevation" | "thickness", ctx: ToolContext): void {
    this.state = { phase: mode }
    ctx.dynamicInput.open({
      fields: [
        {
          id: "value",
          prompt:
            mode === "elevation" ? "rectangleElevation" : "rectangleThickness",
          kind: "distance",
        },
      ],
      commit: (values, commitCtx) => {
        if (!Number.isFinite(values.value)) return
        this[mode] = values.value
        this.state = { phase: "first" }
        this.openPointInput(commitCtx, "firstCorner")
        commitCtx.requestRender()
      },
    })
    ctx.dynamicInput.setLive("value", this[mode])
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  /**
   * An Elevation set here puts the rectangle that far above the UCS's XY plane
   * whatever the corners' Z; at 0 the first corner fixes its plane, as for any
   * flat object.
   */
  private commitRectangle(first: Vec3, other: Vec2, ctx: ToolContext): void {
    // A degenerate rectangle (zero width or height) has no area — ignore it and
    // keep prompting, mirroring AutoCAD, which rejects a zero-size rectangle.
    const diagonal = worldDirectionToUcs(ctx.ucs, V.sub(other, first))
    if (Math.abs(diagonal.x) < 1e-9 || Math.abs(diagonal.y) < 1e-9) {
      return
    }
    const rectangle = createPolyline(
      rectangleCorners(first, other, ctx.ucs),
      true,
      ctx.document.getCurrentLayerId()
    )
    const placed =
      this.elevation !== 0
        ? withElevation(rectangle, ctx.ucs.origin.z + this.elevation)
        : onPlaneOf(rectangle, first)
    ctx.execute(
      new AddEntityCommand(
        withCurrentProperties(withThickness(placed, this.thickness), ctx)
      )
    )
    ctx.endCommand()
  }

  private openPointInput(
    ctx: ToolContext,
    prompt: PromptId,
    screen?: Vec2
  ): void {
    const session: DynamicInputSession = {
      fields: [{ id: "point", prompt, kind: "coordinate" }],
      commit: () => {},
      commitRaw: (commitCtx) => this.commitTypedPoint(commitCtx),
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setPosition(screen ?? this.lastScreen ?? { x: 0, y: 0 })
  }

  /** Places a corner from a typed coordinate (e.g. `50,20` or `@100,50`). */
  private commitTypedPoint(ctx: ToolContext): boolean {
    const text = ctx.dynamicInput.getText("point").trim()
    if (!isCoordinateExpression(text)) return false
    const last = this.state.phase === "second" ? this.state.first : null
    const point = parseCoordinate(text, {
      lastPoint: last,
      relativeByDefault: last !== null,
      ucs: ctx.ucs,
      elevation: ctx.elevation,
    })
    if (!point) return false
    this.advanceWithPoint(point, ctx)
    return true
  }
}

/** The four corners of the rectangle two points span, its sides along the UCS axes. */
function rectangleCorners(a: Vec2, b: Vec2, ucs: Ucs): Vec2[] {
  const la = worldPointToUcs(ucs, a)
  const lb = worldPointToUcs(ucs, b)
  return [
    { x: la.x, y: la.y },
    { x: lb.x, y: la.y },
    { x: lb.x, y: lb.y },
    { x: la.x, y: lb.y },
  ].map((corner) => ucsPointToWorld(ucs, corner))
}
