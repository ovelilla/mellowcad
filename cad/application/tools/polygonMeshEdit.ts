import { Vec3 } from "../../geometry/Vec3"
import {
  EntityId,
  PolygonMeshEntity,
  PolygonMeshSmoothRefusal,
  isPolygonMeshRefusal,
  polygonMeshDesmoothed,
  polygonMeshSmoothed,
} from "../../domain/entities"
import type { PromptId } from "../../locales/types"
import type { ScenePrimitive } from "../../scene/types"
import { THEME } from "../../scene/theme"
import { UpdateEntitiesCommand } from "../commands/entityCommands"
import {
  isCoordinateExpression,
  parseCoordinate,
} from "../input/coordinateInput"
import { glow } from "./ghostLook"
import type {
  CommandOption,
  CommandOptionOutcome,
  PointerInput,
  QuestionInput,
  ToolContext,
  ToolQuestion,
} from "./Tool"

type MeshStep = "main" | "vertex" | "move"

/** Edit vertex's ways, each its keyword and the default it leaves (mesh/p12, p14). */
type Walk = "Next" | "Previous" | "Left" | "Right" | "Up" | "Down"

const WALK_PHRASE: Readonly<Record<Walk, PromptId>> = {
  Next: "peditNextShort",
  Previous: "previousShort",
  Left: "leftShort",
  Right: "rightShort",
  Up: "upShort",
  Down: "downShort",
}

/** The X on the current vertex, half its size in pixels: PEDIT's polyline's (pedit/d01-2; unverified on a mesh). */
const MARK_SIZE = 24

/**
 * PEDIT on a polygon mesh, as AutoCAD 2027's console asks it (mesh/p03, p12,
 * p14, p15, p18–p21; tables 21136–21143): `Enter an option [Edit vertex/
 * Smooth surface/Desmooth/Mclose/Nclose/Undo]:`, Mopen and Nopen in their
 * places on a closed direction, each option done at once and one step of
 * its Undo, a whole Edit vertex at once; Enter, eXit or X end PEDIT.
 *
 * Smooth surface lays SURFTYPE's surface at SURFU and SURFV (each under 2
 * taken as 2, said: 21595, 21596), or says why it cannot (21583, 21587) and
 * leaves the mesh unsmoothed (p18). Closing or opening a smoothed one, or
 * moving its vertex, smooths it again at the variables as they now stand
 * (p15, p21). Edit vertex walks the vertices by `Current vertex (m,n).`,
 * Next and Previous along the rows, Left and Right along N, Up and Down
 * along M, staying put at an edge, a closed one's too (p14); Enter repeats
 * the last way; Move takes a point with its Z (p12); REgen does nothing
 * here; eXit goes back.
 */
export class PolygonMeshEdit {
  private step: MeshStep = "main"
  /** The undo history before each step of the main prompt, for its Undo. */
  private steps: number[] = []
  private stepStart = 0
  private current = 0
  private walk: Walk = "Next"
  private cursor: Vec3 | null = null
  /** How M and N closed when the prompt was asked, for its keywords. */
  private closedShown = { m: false, n: false }

  constructor(readonly id: EntityId) {}

  begin(ctx: ToolContext): void {
    this.steps = []
    this.stepStart = ctx.historyDepth()
    this.ask("main", ctx)
  }

  private mesh(ctx: ToolContext): PolygonMeshEntity | null {
    const entity = ctx.document.get(this.id)
    return entity?.type === "polygonMesh" ? entity : null
  }

  question(): PromptId | ToolQuestion {
    switch (this.step) {
      case "main":
        return "peditMeshOption"
      case "vertex":
        return { id: "peditMeshVertexOption", enter: WALK_PHRASE[this.walk] }
      case "move":
        return "specifyNewLocationForMarkedVertex"
    }
  }

  takes(): QuestionInput | null {
    return this.step === "move" ? "point" : "keyword"
  }

  /** The main prompt's: Mclose or Mopen as M stands, likewise N (p03), eXit and X hidden. */
  commandOptions(): readonly CommandOption[] {
    if (this.step === "main") {
      return [
        { id: "Edit vertex" },
        { id: "Smooth surface" },
        { id: "Desmooth" },
        { id: this.closedShown.m ? "Mopen" : "Mclose" },
        { id: this.closedShown.n ? "Nopen" : "Nclose" },
        { id: "Undo" },
        { id: "eXit", hidden: true },
        { id: "X", hidden: true },
      ]
    }
    if (this.step === "vertex") {
      return [
        { id: "Next" },
        { id: "Previous" },
        { id: "Left" },
        { id: "Right" },
        { id: "Up" },
        { id: "Down" },
        { id: "Move" },
        { id: "Regen" },
        { id: "eXit" },
      ]
    }
    return []
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    const mesh = this.mesh(ctx)
    if (!mesh) return "unhandled"
    if (this.step === "vertex") return this.vertexOption(id, ctx)
    if (this.step !== "main") return "unhandled"
    switch (id) {
      case "Edit vertex":
        // With none of its vertices in the view, it says so and asks again
        // (p03, p13: the console's view held none; 21142).
        if (!mesh.vertices.some((v) => this.onScreen(v, ctx))) {
          ctx.report(ctx.text.message("noVisibleVertices"))
          this.ask("main", ctx)
          return "continue"
        }
        this.stepStart = ctx.historyDepth()
        this.current = 0
        this.walk = "Next"
        this.ask("vertex", ctx)
        return "continue"
      case "Smooth surface":
        this.mainStep(ctx, () => this.smooth(mesh, mesh, ctx))
        return "continue"
      case "Desmooth":
        this.mainStep(ctx, () => {
          if (mesh.smooth) this.update(polygonMeshDesmoothed(mesh), ctx)
        })
        return "continue"
      case "Mclose":
      case "Mopen":
      case "Nclose":
      case "Nopen": {
        const inM = id === "Mclose" || id === "Mopen"
        const closed = id === "Mclose" || id === "Nclose"
        this.mainStep(ctx, () => {
          const toggled: PolygonMeshEntity = inM
            ? { ...mesh, closedM: closed }
            : { ...mesh, closedN: closed }
          if (mesh.smooth) this.smooth(toggled, mesh, ctx)
          else this.update(toggled, ctx)
        })
        return "continue"
      }
      case "Undo":
        this.undoStep(ctx)
        return "continue"
      case "eXit":
      case "X":
        ctx.endCommand()
        return "end"
      default:
        return "unhandled"
    }
  }

  private vertexOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    switch (id) {
      case "Next":
      case "Previous":
      case "Left":
      case "Right":
      case "Up":
      case "Down":
        this.walk = id
        this.stepVertex(ctx)
        this.ask("vertex", ctx)
        return "continue"
      case "Move":
        this.ask("move", ctx)
        return "continue"
      case "Regen":
        this.ask("vertex", ctx)
        return "continue"
      case "eXit":
        this.backToMain(ctx)
        return "continue"
      default:
        return "unhandled"
    }
  }

  /** One step of `walk`, staying put at an edge (p12, p14). */
  private stepVertex(ctx: ToolContext): void {
    const mesh = this.mesh(ctx)
    if (!mesh) return
    const { m, n } = mesh
    const i = Math.floor(this.current / n)
    const j = this.current % n
    const at = (row: number, col: number) => row * n + col
    switch (this.walk) {
      case "Next":
        this.current = Math.min(this.current + 1, m * n - 1)
        break
      case "Previous":
        this.current = Math.max(this.current - 1, 0)
        break
      case "Left":
        this.current = at(i, Math.max(j - 1, 0))
        break
      case "Right":
        this.current = at(i, Math.min(j + 1, n - 1))
        break
      case "Up":
        this.current = at(Math.min(i + 1, m - 1), j)
        break
      case "Down":
        this.current = at(Math.max(i - 1, 0), j)
        break
    }
  }

  /**
   * `mesh` smoothed at SURFTYPE, SURFU and SURFV, saying each one taken as 2
   * (p21) or why it cannot be, `before` then left unsmoothed (p18, p19).
   */
  private smooth(
    mesh: PolygonMeshEntity,
    before: PolygonMeshEntity,
    ctx: ToolContext
  ): void {
    const { surfaceType, surfaceU, surfaceV } = ctx.document.getSettings()
    const smoothed = polygonMeshSmoothed(mesh, surfaceType, surfaceU, surfaceV)
    if (isPolygonMeshRefusal(smoothed)) {
      ctx.report(refusalText(smoothed, ctx))
      if (before.smooth || mesh !== before) {
        this.update(polygonMeshDesmoothed(mesh), ctx)
      }
      return
    }
    if (surfaceU < 2) {
      ctx.report(ctx.text.message("surfuOutOfRange", { value: 2 }))
    }
    if (surfaceV < 2) {
      ctx.report(ctx.text.message("surfvOutOfRange", { value: 2 }))
    }
    this.update(smoothed, ctx)
  }

  private update(mesh: PolygonMeshEntity, ctx: ToolContext): void {
    ctx.execute(new UpdateEntitiesCommand([mesh]))
  }

  /** A step of the main prompt done at once, which its Undo takes back. */
  private mainStep(ctx: ToolContext, run: () => void): void {
    this.stepStart = ctx.historyDepth()
    run()
    this.backToMain(ctx)
  }

  private backToMain(ctx: ToolContext): void {
    if (ctx.historyDepth() > this.stepStart) this.steps.push(this.stepStart)
    this.stepStart = ctx.historyDepth()
    this.ask("main", ctx)
  }

  /** As a polyline's: the last step back, `Command has been completely undone.` once none is left (p03). */
  private undoStep(ctx: ToolContext): void {
    const mark = this.steps.pop()
    if (mark !== undefined) ctx.undoTo(mark)
    if (this.steps.length === 0) {
      ctx.report(ctx.text.message("commandCompletelyUndone"))
    }
    this.stepStart = ctx.historyDepth()
    this.ask("main", ctx)
  }

  /** Enter: the end at the main prompt, the last way again at Edit vertex's, nothing at Move's. */
  onEnter(ctx: ToolContext): boolean {
    switch (this.step) {
      case "main":
        ctx.endCommand()
        return true
      case "vertex":
        this.stepVertex(ctx)
        this.ask("vertex", ctx)
        return true
      case "move":
        this.ask("vertex", ctx)
        return true
    }
  }

  wantsSnap(): boolean {
    return this.step === "move"
  }

  getConstraintAnchor(ctx: ToolContext): Vec3 | null {
    return this.step === "move" ? this.vertexAt(ctx) : null
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.cursor = input.point
    ctx.requestRender()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button === 0 && this.step === "move") this.move(input.point, ctx)
  }

  private onScreen(point: Vec3, ctx: ToolContext): boolean {
    const { viewport } = ctx
    const at = viewport.worldToScreen(point)
    return (
      at.x >= 0 &&
      at.y >= 0 &&
      at.x <= viewport.width &&
      at.y <= viewport.height
    )
  }

  private vertexAt(ctx: ToolContext): Vec3 | null {
    return this.mesh(ctx)?.vertices[this.current] ?? null
  }

  /** Move's point: the vertex to it with its Z, a smoothed mesh smoothed again (p12, p15). */
  private move(point: Vec3, ctx: ToolContext): void {
    const mesh = this.mesh(ctx)
    if (mesh) {
      const vertices = [...mesh.vertices]
      vertices[this.current] = point
      const moved = { ...mesh, vertices }
      if (mesh.smooth) this.smooth(moved, mesh, ctx)
      else this.update(moved, ctx)
    }
    this.ask("vertex", ctx)
  }

  private ask(step: MeshStep, ctx: ToolContext): void {
    this.step = step
    const shown = this.mesh(ctx)
    if (shown) this.closedShown = { m: shown.closedM, n: shown.closedN }
    if (step === "vertex") {
      const mesh = this.mesh(ctx)
      if (mesh) {
        ctx.report(
          ctx.text.message("meshCurrentVertex", {
            m: Math.floor(this.current / mesh.n),
            n: this.current % mesh.n,
          })
        )
      }
    }
    if (step === "move") {
      ctx.dynamicInput.open({
        fields: [{ id: "point", kind: "coordinate" }],
        commit: () => {},
        commitRaw: (commitCtx) => {
          const text = commitCtx.dynamicInput.getText("point").trim()
          if (text === "") {
            this.ask("vertex", commitCtx)
            return true
          }
          if (!isCoordinateExpression(text)) return false
          // `@` read from the X, as a polyline's Move reads it (pedit/p227).
          const point = parseCoordinate(text, {
            lastPoint: this.vertexAt(commitCtx) ?? commitCtx.lastPoint,
            relativeByDefault: false,
            ucs: commitCtx.ucs,
            elevation: commitCtx.elevation,
          })
          if (!point) return false
          this.move(point, commitCtx)
          return true
        },
      })
    } else {
      ctx.dynamicInput.open({ fields: [], commit: () => {} })
    }
    ctx.requestRender()
  }

  /** The mesh's glow at the main prompt; the X on its vertex at Edit vertex's, a band to the cursor at Move's. */
  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    const mesh = this.mesh(ctx)
    if (!mesh) return []
    if (this.step === "main") return glow(ctx, mesh)
    const vertex = this.vertexAt(ctx)
    if (!vertex) return []
    const at = ctx.viewport.worldToScreen(vertex)
    const mark = { color: THEME.crosshair, width: 1 }
    const out: ScenePrimitive[] = [
      {
        kind: "segment",
        a: { x: at.x - MARK_SIZE, y: at.y - MARK_SIZE },
        b: { x: at.x + MARK_SIZE, y: at.y + MARK_SIZE },
        stroke: mark,
      },
      {
        kind: "segment",
        a: { x: at.x - MARK_SIZE, y: at.y + MARK_SIZE },
        b: { x: at.x + MARK_SIZE, y: at.y - MARK_SIZE },
        stroke: mark,
      },
    ]
    if (this.step === "move" && this.cursor) {
      out.push({
        kind: "segment",
        a: at,
        b: ctx.viewport.worldToScreen(this.cursor),
        stroke: { color: THEME.dashedRubberBand, width: 1, dash: [2, 3] },
      })
    }
    return out
  }
}

function refusalText(
  refusal: PolygonMeshSmoothRefusal,
  ctx: ToolContext
): string {
  return "tooMany" in refusal
    ? ctx.text.message("tooManyControlVertices")
    : ctx.text.message("tooFewControlVertices", {
        direction: refusal.tooFew,
        count: refusal.needs,
      })
}
