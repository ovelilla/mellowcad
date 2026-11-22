import { Vec2 } from "../../geometry/Vec2"
import { Vec3 } from "../../geometry/Vec3"
import { createPolygonMesh } from "../../domain/entities"
import type { PromptId } from "../../locales/types"
import { AddEntityCommand } from "../commands/entityCommands"
import {
  isCoordinateExpression,
  parseCoordinate,
} from "../input/coordinateInput"
import { withCurrentProperties } from "./currentProperties"
import type {
  PointerInput,
  QuestionInput,
  Tool,
  ToolContext,
  ToolQuestion,
} from "./Tool"

/** 3DMESH's sizes, either way (mesh/p02: `Requires an integer between 2 and 256.`). */
export const MIN_MESH_SIZE = 2
export const MAX_MESH_SIZE = 256

type Mesh3dState =
  | { readonly phase: "m" }
  | { readonly phase: "n"; readonly m: number }
  | {
      readonly phase: "vertex"
      readonly m: number
      readonly n: number
      readonly points: readonly Vec3[]
    }

/**
 * AutoCAD's 3DMESH (mesh/p01, p02; tables 20273–20275): `Enter size of mesh
 * in M direction:`, `Enter size of mesh in N direction:` — integers from 2 to
 * 256, anything else `Requires an integer between 2 and 256.` and asked
 * again —, then `Specify location for vertex (0, 0):` for each vertex, row
 * by row along N, each keeping its own Z; a word or Enter there `Invalid
 * point.` (p02). No rubber band (the trace's UseBasePoint false). The last
 * vertex makes the mesh, open both ways, in the current properties, and ends
 * the command. Not transparent.
 */
export class Mesh3dTool implements Tool {
  readonly id = "mesh3d"

  private state: Mesh3dState = { phase: "m" }
  private lastScreen: Vec2 | null = null

  onActivate(ctx: ToolContext): void {
    this.state = { phase: "m" }
    ctx.setCursor("crosshair")
    this.openInput(ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    this.state = { phase: "m" }
    ctx.dynamicInput.close()
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen
    ctx.dynamicInput.setPosition(input.screen)
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button === 0 && this.state.phase === "vertex") {
      this.take(input.point, ctx)
    }
  }

  /** Enter is refused at every prompt (p02's vertex; the sizes, `AllowNone` false). */
  onEnter(ctx: ToolContext): boolean {
    this.refuse(ctx)
    return true
  }

  wantsSnap(): boolean {
    return this.state.phase === "vertex"
  }

  getConstraintAnchor(): Vec3 | null {
    return null
  }

  question(): ToolQuestion | PromptId {
    const state = this.state
    switch (state.phase) {
      case "m":
        return "enterMeshSizeM"
      case "n":
        return "enterMeshSizeN"
      case "vertex": {
        const k = state.points.length
        return {
          id: "specifyMeshVertex",
          values: { m: Math.floor(k / state.n), n: k % state.n },
        }
      }
    }
  }

  takes(): QuestionInput | null {
    return this.state.phase === "vertex"
      ? null
      : {
          refusal: "requiresIntegerBetween",
          values: { min: MIN_MESH_SIZE, max: MAX_MESH_SIZE },
        }
  }

  private refuse(ctx: ToolContext): void {
    ctx.report(
      this.state.phase === "vertex"
        ? ctx.text.message("invalidPoint")
        : ctx.text.message("requiresIntegerBetween", {
            min: MIN_MESH_SIZE,
            max: MAX_MESH_SIZE,
          }),
      "error"
    )
    this.openInput(ctx)
  }

  private openInput(ctx: ToolContext): void {
    if (this.state.phase === "vertex") {
      ctx.dynamicInput.open({
        fields: [
          // No prompt of its own: its words need the vertex, `question()`'s.
          { id: "point", kind: "coordinate" },
        ],
        commit: () => {},
        commitRaw: (commitCtx) => {
          if (!commitCtx.dynamicInput.hasTypedText())
            return this.onEnter(commitCtx)
          const text = commitCtx.dynamicInput.getText("point").trim()
          if (!isCoordinateExpression(text)) return false
          const point = parseCoordinate(text, {
            lastPoint: commitCtx.lastPoint,
            relativeByDefault: false,
            ucs: commitCtx.ucs,
            elevation: commitCtx.elevation,
          })
          if (!point) return false
          this.take(point, commitCtx)
          return true
        },
      })
    } else {
      const prompt: PromptId =
        this.state.phase === "m" ? "enterMeshSizeM" : "enterMeshSizeN"
      ctx.dynamicInput.open({
        fields: [{ id: "size", prompt, kind: "number" }],
        // A number reaches `commit`, anything else `commitRaw`: both read
        // what was written, as `2.5` and `1e1` are refused (p02).
        commit: (_values, commitCtx) =>
          this.size(commitCtx.dynamicInput.getText("size").trim(), commitCtx),
        commitRaw: (commitCtx) => {
          this.size(commitCtx.dynamicInput.getText("size").trim(), commitCtx)
          return true
        },
      })
    }
    if (this.lastScreen) ctx.dynamicInput.setPosition(this.lastScreen)
  }

  /** A size, an integer written as one from 2 to 256, else refused (p02: `2.5`, `-3`, `FOO`, `1`, `257`). */
  private size(typed: string, ctx: ToolContext): void {
    const value = /^[+-]?\d+$/.test(typed) ? Number.parseInt(typed, 10) : NaN
    if (
      !Number.isInteger(value) ||
      value < MIN_MESH_SIZE ||
      value > MAX_MESH_SIZE
    ) {
      this.refuse(ctx)
      return
    }
    const state = this.state
    this.state =
      state.phase === "m"
        ? { phase: "n", m: value }
        : state.phase === "n"
          ? { phase: "vertex", m: state.m, n: value, points: [] }
          : state
    this.openInput(ctx)
  }

  private take(point: Vec3, ctx: ToolContext): void {
    const state = this.state
    if (state.phase !== "vertex") return
    const points = [...state.points, point]
    if (points.length < state.m * state.n) {
      this.state = { ...state, points }
      this.openInput(ctx)
      return
    }
    // Reset before the commit, which rebuilds the state (cad-tools.md).
    this.state = { phase: "m" }
    const mesh = createPolygonMesh(
      state.m,
      state.n,
      points,
      ctx.document.getCurrentLayerId()
    )
    ctx.execute(new AddEntityCommand(withCurrentProperties(mesh, ctx)))
    ctx.endCommand()
  }
}
