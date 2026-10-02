import { Vec2, V, vec2 } from "../../geometry/Vec2"
import { Vec3 } from "../../geometry/Vec3"
import { createPolyline, onPlaneOf } from "../../domain/entities"
import { parseNumber } from "../../domain/units"
import { ucsRotation } from "../../domain/ucs"
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
import {
  withCurrentProperties,
  withCurrentThickness,
} from "./currentProperties"

const DEFAULT_SIDES = 4
const MIN_SIDES = 3
const MAX_SIDES = 1024

/**
 * AutoCAD's POLYGON: a regular N-sided closed polyline. After the side count
 * and centre, the polygon is either *inscribed* in a circle (vertices on the
 * radius) or *circumscribed* about it (edge midpoints on the radius). Pointing
 * sets the size and rotation at once; a typed radius fixes the size while the
 * cursor still orients it. Single-shot, undoable. The Edge option (define one
 * edge instead of a centre+radius) is later work.
 */
type PolygonToolState =
  /** Awaiting the number of sides. */
  | { readonly phase: "sides" }
  /** Side count fixed; awaiting the centre. */
  | { readonly phase: "center"; readonly sides: number }
  /** Centre placed; rubber-banding the radius (and orientation). */
  | {
      readonly phase: "radius"
      readonly sides: number
      readonly center: Vec3
      readonly cursor: Vec2
      /** Radius is the apothem (edge midpoints) when true, else the circumradius. */
      readonly circumscribed: boolean
    }

export class PolygonTool implements Tool {
  readonly id = "polygon"

  private state: PolygonToolState = { phase: "sides" }
  private lastScreen: Vec2 | null = null

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    ctx.selection.clear()
    this.state = { phase: "sides" }
    this.openSidesInput(ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    this.state = { phase: "sides" }
    ctx.dynamicInput.close()
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen
    if (this.state.phase === "radius") {
      this.state = { ...this.state, cursor: input.point }
      ctx.dynamicInput.setLive(
        "radius",
        V.distance(this.state.center, input.point)
      )
    }
    ctx.dynamicInput.setPosition(input.screen)
    ctx.requestRender()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return

    switch (this.state.phase) {
      case "sides":
        return // the side count is typed, not clicked
      case "center":
        this.state = {
          phase: "radius",
          sides: this.state.sides,
          center: input.point,
          cursor: input.point,
          circumscribed: false,
        }
        this.openRadiusInput(ctx, input.screen)
        ctx.requestRender()
        return
      case "radius":
        this.commitPolygonAt(input.point, ctx)
        return
    }
  }

  onKeyDown(input: KeyInput, ctx: ToolContext): void {
    if (input.key === "Escape") {
      this.state = { phase: "sides" }
      ctx.dynamicInput.close()
      ctx.requestRender()
    }
  }

  commandOptions(): readonly CommandOption[] {
    if (this.state.phase !== "radius") return []
    return [
      {
        id: "Type",
        value: this.state.circumscribed ? "Circumscribed" : "Inscribed",
      },
    ]
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    if (this.state.phase === "radius" && id === "Type") {
      this.state = { ...this.state, circumscribed: !this.state.circumscribed }
      ctx.requestRender()
      return "continue"
    }
    return "unhandled"
  }

  getConstraintAnchor(): Vec2 | null {
    return this.state.phase === "radius" ? this.state.center : null
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    if (this.state.phase !== "radius") return []
    const { viewport } = ctx
    const rubber = { color: THEME.rubberBand, width: 1 }
    const vertices = this.resolvePolygon(ctx)
    const out: ScenePrimitive[] = []
    if (vertices) {
      out.push({
        kind: "path",
        points: vertices.map((v) => viewport.worldToScreen(v)),
        closed: true,
        stroke: rubber,
      })
    }
    // A guide from the centre to the cursor shows the size and orientation.
    out.push({
      kind: "segment",
      a: viewport.worldToScreen(this.state.center),
      b: viewport.worldToScreen(this.state.cursor),
      stroke: rubber,
    })
    return out
  }

  private openSidesInput(ctx: ToolContext): void {
    const session: DynamicInputSession = {
      fields: [{ id: "sides", prompt: "numberOfSides", kind: "number" }],
      commit: (values, commitCtx) => this.commitSides(values.sides, commitCtx),
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setDefault("sides", DEFAULT_SIDES)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  private commitSides(value: number, ctx: ToolContext): void {
    if (this.state.phase !== "sides") return
    const sides = clampSides(value)
    this.state = { phase: "center", sides }
    this.openPointInput(ctx, "center")
  }

  private openPointInput(ctx: ToolContext, prompt: PromptId): void {
    const session: DynamicInputSession = {
      fields: [{ id: "point", prompt, kind: "coordinate" }],
      commit: () => {},
      commitRaw: (commitCtx) => this.commitTypedCenter(commitCtx),
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  private commitTypedCenter(ctx: ToolContext): boolean {
    if (this.state.phase !== "center") return false
    const text = ctx.dynamicInput.getText("point").trim()
    if (!isCoordinateExpression(text)) return false
    const point = parseCoordinate(text, {
      lastPoint: null,
      relativeByDefault: false,
      ucs: ctx.ucs,
      elevation: ctx.elevation,
    })
    if (!point) return false
    this.state = {
      phase: "radius",
      sides: this.state.sides,
      center: point,
      cursor: point,
      circumscribed: false,
    }
    this.openRadiusInput(ctx, this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
    return true
  }

  private openRadiusInput(ctx: ToolContext, screen: Vec2): void {
    const session: DynamicInputSession = {
      fields: [{ id: "radius", prompt: "radius", kind: "distance" }],
      commit: (values, commitCtx) =>
        this.commitPolygonValue(values.radius, commitCtx),
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setLive("radius", 0)
    ctx.dynamicInput.setPosition(screen)
  }

  private commitPolygonAt(point: Vec2, ctx: ToolContext): void {
    if (this.state.phase !== "radius") return
    const typed = parseField(ctx, "radius")
    const radius = typed ?? V.distance(this.state.center, point)
    const angle = orientationAngle(this.state.center, point, ctx)
    this.commitPolygon(radius, angle, ctx)
  }

  private commitPolygonValue(value: number, ctx: ToolContext): void {
    if (this.state.phase !== "radius") return
    const angle = orientationAngle(this.state.center, this.state.cursor, ctx)
    this.commitPolygon(value, angle, ctx)
  }

  private commitPolygon(radius: number, angle: number, ctx: ToolContext): void {
    if (this.state.phase !== "radius" || !(radius > 0)) return
    const vertices = polygonVertices(
      this.state.center,
      this.state.sides,
      radius,
      angle,
      this.state.circumscribed
    )
    ctx.execute(
      new AddEntityCommand(
        withCurrentProperties(
          withCurrentThickness(
            onPlaneOf(
              createPolyline(vertices, true, ctx.document.getCurrentLayerId()),
              this.state.center
            ),
            ctx
          ),
          ctx
        )
      )
    )
    ctx.endCommand()
  }

  /** The polygon at the current (typed or pointed) radius, for the preview. */
  private resolvePolygon(ctx: ToolContext): Vec2[] | null {
    if (this.state.phase !== "radius") return null
    const typed = parseField(ctx, "radius")
    const radius = typed ?? V.distance(this.state.center, this.state.cursor)
    if (!(radius > 0)) return null
    const angle = orientationAngle(this.state.center, this.state.cursor, ctx)
    return polygonVertices(
      this.state.center,
      this.state.sides,
      radius,
      angle,
      this.state.circumscribed
    )
  }
}

/**
 * The vertices of a regular polygon. `angle` orients the figure: it points at
 * the first vertex when inscribed, or at the midpoint of the first edge when
 * circumscribed (so the specified radius runs to an edge, matching AutoCAD).
 * The circumscribed radius is the apothem, so the circumradius is scaled up by
 * `1 / cos(π/n)`.
 */
function polygonVertices(
  center: Vec2,
  sides: number,
  radius: number,
  angle: number,
  circumscribed: boolean
): Vec2[] {
  const step = (Math.PI * 2) / sides
  const circumradius = circumscribed
    ? radius / Math.cos(Math.PI / sides)
    : radius
  const start = circumscribed ? angle + Math.PI / sides : angle
  const vertices: Vec2[] = []
  for (let k = 0; k < sides; k++) {
    const a = start + k * step
    vertices.push(
      V.add(center, V.scale(vec2(Math.cos(a), Math.sin(a)), circumradius))
    )
  }
  return vertices
}

/** The orientation angle from the centre to the cursor; defaults to the UCS's up. */
function orientationAngle(
  center: Vec2,
  cursor: Vec2,
  ctx: ToolContext
): number {
  const dir = V.sub(cursor, center)
  // No direction yet: a vertex up.
  if (V.length(dir) < 1e-9) return ucsRotation(ctx.ucs) + Math.PI / 2
  return Math.atan2(dir.y, dir.x)
}

function clampSides(value: number): number {
  return Math.max(MIN_SIDES, Math.min(MAX_SIDES, Math.round(value)))
}

/** Reads a numeric field, returning `null` when empty or not a number. */
function parseField(ctx: ToolContext, fieldId: string): number | null {
  const text = ctx.dynamicInput.getText(fieldId).trim()
  if (text === "") return null
  const value = parseNumber(text)
  return value !== null && Number.isFinite(value) ? value : null
}
