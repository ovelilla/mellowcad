import { Vec2 } from "../../geometry/Vec2"
import { Vec3, add3, dot3, length3, scale3, sub3 } from "../../geometry/Vec3"
import { axesToWorld } from "../../geometry/ocs"
import { curveBox } from "../../geometry/planarCurves"
import { MODEL_TOLERANCE } from "../../geometry/planarCurves"
import { PlanarProfile, extrusionBrep } from "../../geometry/sweeps"
import { Entity, EntityId } from "../../domain/entities"
import { createSweptSolid, sweepProfile } from "../../domain/sweptSolids"
import { normalizeDegrees } from "../../geometry/primitives"
import {
  AddEntitiesCommand,
  ReplaceEntitiesCommand,
} from "../commands/entityCommands"
import { evaluateExpression } from "../input/expression"
import {
  isCoordinateExpression,
  parseCoordinate,
} from "../input/coordinateInput"
import type { PromptId } from "../../locales/types"
import { ScenePrimitive } from "../../scene/types"
import { entityScenePrimitive } from "../SceneBuilder"
import {
  CommandOption,
  CommandOptionOutcome,
  HeldVariables,
  PointerInput,
  QuestionInput,
  Tool,
  ToolContext,
  ToolQuestion,
} from "./Tool"
import { currentColor, withCurrentProperties } from "./currentProperties"
import { ObjectSelector } from "./objectSelection"
import { SweepSettings, sweepSettings } from "./sweepSettings"

/** A profile EXTRUDE took, and the object it came from. */
interface Profile {
  readonly id: EntityId
  readonly profile: PlanarProfile | "crosses"
}

type ExtrudeState =
  | { readonly phase: "select" }
  | { readonly phase: "mode" }
  | { readonly phase: "height"; readonly cursor: Vec3 }
  | { readonly phase: "taper" }
  | { readonly phase: "expression"; readonly of: "height" | "taper" }
  | { readonly phase: "directionStart" }
  | { readonly phase: "directionEnd"; readonly start: Vec3 }
  | {
      readonly phase: "erase"
      readonly made: readonly Entity[]
      readonly used: readonly EntityId[]
    }

const PREVIEW_ID = "extrude-preview"

/**
 * AutoCAD's EXTRUDE, as 2027's console asks it (extrude/x01–x12), in en, es
 * and pt-BR: it says the wire frame density and the creation mode, asks
 * `Select objects to extrude or [MOde]:`, sifts the set as Enter closes it
 * (`Cannot sweep or extrude an object of this type.`, x10, x11), then
 * `Specify height of extrusion or [Direction/Path/Taper angle/Expression]:`,
 * the last height its default. Taper angle asks its angle, under a right
 * angle either way, and the height again; Direction two points, the profiles
 * extruded along them, untapered (x06); Expression a value. Each closed
 * profile becomes a solid of the current layer and properties (x10), a
 * region's faces one; one a taper cannot take makes nothing, silently (x06).
 * DELOBJ erases the profiles (3, its initial value), keeps them (0) or asks
 * (negative, x07). One undo step.
 *
 * WHY no Path and no SUrface: a path sweeps the profile (x12's `Solid type =
 * Sweep`), and a surface is an object this engine has none of; both stay
 * refused, and an open profile, which AutoCAD makes a surface of, is sifted
 * out with the objects it cannot sweep.
 */
export class ExtrudeTool implements Tool {
  readonly id = "extrude"

  private state: ExtrudeState = { phase: "select" }
  private profiles: readonly Profile[] = []
  private lastScreen: Vec2 | null = null
  private readonly selector = new ObjectSelector({
    done: (ctx) => this.closeSet(ctx),
    question: () => "extrudeSelectOr",
    noneFound: "sweepNothingSelected",
  })

  constructor(private readonly settings: SweepSettings = sweepSettings()) {}

  heldVariables(): Partial<HeldVariables> {
    return {
      DELOBJ: {
        read: () => this.settings.delobj,
        write: (value) => {
          this.settings.delobj = value
        },
      },
    }
  }

  onNewDrawing(): void {
    this.settings.height = null
    this.settings.taper = 0
  }

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    this.profiles = []
    this.state = { phase: "select" }
    ctx.report(
      ctx.text.message("sweepDensity", {
        isolines: ctx.document.getSettings().isolines,
      })
    )
    this.selector.start()
    if (this.selector.preselect(ctx)) this.closeSet(ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    this.state = { phase: "select" }
    this.profiles = []
    this.selector.start()
    ctx.dynamicInput.close()
  }

  question(): PromptId | ToolQuestion {
    const { height, taper } = this.settings
    switch (this.state.phase) {
      case "select":
        return this.selector.question()
      case "mode":
        // The mode Enter keeps, worded as the prompt words it (pt-BR's
        // `<Sólido>` against its keyword `SÓlido`).
        return { id: "closedProfilesMode", enter: "closedProfilesSolid" }
      case "height":
        return height === null
          ? "extrudeHeightOr"
          : { id: "extrudeHeightDefaultOr", enter: height }
      case "taper":
        return { id: "extrudeTaperOr", enter: { angle: taper } }
      case "expression":
        return "enterExpression"
      case "directionStart":
        return "directionStart"
      case "directionEnd":
        return "directionEnd"
      case "erase":
        return "eraseDefiningObjects"
    }
  }

  defaultOption(): string | null {
    if (this.state.phase === "erase") return this.settings.erase ? "Yes" : "No"
    return null
  }

  takes(): QuestionInput | null {
    switch (this.state.phase) {
      case "select":
        return this.selector.takes()
      case "mode":
      case "erase":
        return "keyword"
      case "height":
      case "taper":
        return {
          refusal: "requiresDistance",
          values: { points: "second", keyword: "yes" },
        }
      case "directionStart":
      case "directionEnd":
        return { refusal: "pointOrKeywordRequired" }
      case "expression":
        return null
    }
  }

  /**
   * WHY Path and SUrface are offered and left unhandled: their words are
   * AutoCAD's prompt's, and the option is refused as one not built is.
   */
  commandOptions(): readonly CommandOption[] {
    switch (this.state.phase) {
      case "select":
        return this.selector.inMode()
          ? this.selector.commandOptions()
          : [{ id: "MOde" }, ...this.selector.commandOptions()]
      case "mode":
        return [{ id: "SOlid" }, { id: "SUrface" }]
      case "height":
        return [
          { id: "Direction" },
          { id: "Path" },
          { id: "Taper" },
          { id: "Expression" },
        ]
      case "taper":
        return [{ id: "Expression" }]
      case "erase":
        return [{ id: "Yes" }, { id: "No" }]
      default:
        return []
    }
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    const state = this.state
    switch (state.phase) {
      case "select":
        if (id === "MOde" && !this.selector.inMode()) {
          this.state = { phase: "mode" }
          this.openKeywords(ctx)
          return "continue"
        }
        return this.selector.invokeOption(id, ctx) ? "continue" : "unhandled"
      case "mode":
        if (id !== "SOlid") return "unhandled"
        this.state = { phase: "select" }
        ctx.dynamicInput.close()
        return "continue"
      case "height":
        if (id === "Direction") {
          this.state = { phase: "directionStart" }
          this.openPoint(ctx, "directionStart")
          return "continue"
        }
        if (id === "Taper") {
          this.state = { phase: "taper" }
          this.openValue(ctx, "extrudeTaperOr")
          return "continue"
        }
        if (id === "Expression") {
          this.state = { phase: "expression", of: "height" }
          this.openExpression(ctx)
          return "continue"
        }
        return "unhandled"
      case "taper":
        if (id !== "Expression") return "unhandled"
        this.state = { phase: "expression", of: "taper" }
        this.openExpression(ctx)
        return "continue"
      case "erase":
        if (id !== "Yes" && id !== "No") return "unhandled"
        this.settings.erase = id === "Yes"
        this.finish(state.made, id === "Yes" ? state.used : [], ctx)
        return "end"
      default:
        return "unhandled"
    }
  }

  onEnter(ctx: ToolContext): boolean {
    const state = this.state
    if (state.phase === "select") return this.selector.onEnter(ctx)
    if (state.phase === "mode") {
      this.state = { phase: "select" }
      ctx.dynamicInput.close()
      return true
    }
    if (state.phase === "erase") {
      this.finish(state.made, this.settings.erase ? state.used : [], ctx)
      ctx.endCommand()
      return true
    }
    return false
  }

  answerTyped(text: string, ctx: ToolContext): boolean {
    return this.state.phase === "select" && this.selector.answerTyped(text, ctx)
  }

  cycleLasso(ctx: ToolContext): boolean {
    return this.state.phase === "select" && this.selector.cycleLasso(ctx)
  }

  wantsSnap(): boolean {
    switch (this.state.phase) {
      case "select":
        return this.selector.wantsSnap()
      case "height":
      case "taper":
      case "directionStart":
      case "directionEnd":
        return true
      default:
        return false
    }
  }

  getConstraintAnchor(): Vec3 | null {
    const state = this.state
    if (state.phase === "height") return this.base()
    if (state.phase === "directionEnd") return state.start
    return null
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen
    if (this.state.phase === "select") {
      this.selector.onPointerMove(input, ctx)
      return
    }
    if (this.state.phase === "height") {
      this.state = { phase: "height", cursor: input.point }
    }
    ctx.dynamicInput.setPosition(input.screen)
    ctx.requestRender()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (this.state.phase === "select") {
      this.selector.onPointerDown(input, ctx)
      return
    }
    if (input.button !== 0) return
    this.takePoint(input.point, ctx)
  }

  onPointerUp(input: PointerInput, ctx: ToolContext): void {
    if (this.state.phase === "select") this.selector.onPointerUp(input, ctx)
  }

  /** The set as it closes, then the solids the cursor's height makes. */
  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    const state = this.state
    if (state.phase === "select") return this.selector.buildOverlay(ctx)
    if (state.phase !== "height") return []
    const height = length3(sub3(state.cursor, this.base()))
    if (!(height > 0)) return []
    const stroke = { color: currentColor(ctx), width: 1 }
    return this.solids(height, null, this.settings.taper, ctx).flatMap(
      (solid) => entityScenePrimitive(ctx.viewport, solid, stroke)
    )
  }

  /**
   * The set closed: what cannot be swept leaves it, said as AutoCAD says it
   * on Enter, and with nothing left it is asked again (x11).
   */
  private closeSet(ctx: ToolContext): void {
    const ids = ctx.selection.toArray()
    const profiles: Profile[] = []
    let refused = 0
    for (const id of ids) {
      const entity = ctx.document.get(id)
      const profile = entity ? sweepProfile(entity) : null
      if (profile === null || profile === "open") refused++
      else profiles.push({ id, profile })
    }
    if (refused > 0) {
      ctx.report(ctx.text.message("sweepRefused", { count: refused }), "error")
    }
    if (profiles.length === 0) {
      ctx.selection.clear()
      this.selector.start()
      this.state = { phase: "select" }
      ctx.requestRender()
      return
    }
    this.profiles = profiles
    ctx.selection.clear()
    this.state = { phase: "height", cursor: this.base() }
    this.openValue(
      ctx,
      this.settings.height === null
        ? "extrudeHeightOr"
        : "extrudeHeightDefaultOr"
    )
  }

  /** Where the height is measured from: the middle of the first profile's outline. */
  private base(): Vec3 {
    const first = this.profiles.find((p) => p.profile !== "crosses")
    if (!first || first.profile === "crosses") return { x: 0, y: 0, z: 0 }
    const { axes, elevation, faces } = first.profile
    const boxes = faces[0].loops[0].map(curveBox)
    const x =
      (Math.min(...boxes.map((b) => b.min.x)) +
        Math.max(...boxes.map((b) => b.max.x))) /
      2
    const y =
      (Math.min(...boxes.map((b) => b.min.y)) +
        Math.max(...boxes.map((b) => b.max.y))) /
      2
    return axesToWorld(axes, { x, y, z: elevation })
  }

  private takePoint(point: Vec3, ctx: ToolContext): void {
    const state = this.state
    switch (state.phase) {
      case "height":
        this.takeHeight(length3(sub3(point, this.base())), ctx)
        return
      case "taper":
        // A point gives the angle of the line from the base to it, as a
        // distance prompt's second point gives its length.
        this.takeTaper(length3(sub3(point, this.base())), ctx)
        return
      case "directionStart":
        this.state = { phase: "directionEnd", start: point }
        this.openPoint(ctx, "directionEnd")
        return
      case "directionEnd": {
        const offset = sub3(point, state.start)
        if (length3(offset) <= MODEL_TOLERANCE) {
          ctx.report(ctx.text.message("directionCoincident"), "error")
          return
        }
        this.extrude(null, offset, ctx)
        return
      }
    }
  }

  /** `Value must be nonzero.` for none, and the prompt asked again (x03). */
  private takeHeight(height: number, ctx: ToolContext): void {
    if (height === 0) {
      ctx.report(ctx.text.message("extrudeValueNonzero"), "error")
      return
    }
    this.settings.height = height
    this.extrude(height, null, ctx)
  }

  /** Degrees, strictly between -90 and 90 (x06); then the height again. */
  private takeTaper(degrees: number, ctx: ToolContext): void {
    if (!(Math.abs(degrees) < 90)) {
      ctx.report(ctx.text.message("taperAngleRange"), "error")
      return
    }
    this.settings.taper = degrees
    this.state = { phase: "height", cursor: this.base() }
    this.openValue(
      ctx,
      this.settings.height === null
        ? "extrudeHeightOr"
        : "extrudeHeightDefaultOr"
    )
  }

  /**
   * The solids: each profile along its normal `height`, tapered, or along
   * `offset` (Direction) untapered, its history still the taper given (x06).
   */
  private solids(
    height: number | null,
    offset: Vec3 | null,
    degrees: number,
    ctx: ToolContext,
    report = false
  ): Entity[] {
    const made: Entity[] = []
    const taper = (degrees * Math.PI) / 180
    for (const { profile } of this.profiles) {
      if (profile === "crosses") {
        if (report) {
          ctx.report(ctx.text.message("sweepSelfIntersecting"), "error")
        }
        continue
      }
      const along = offset ?? scale3(profile.axes.z, height ?? 0)
      const brep = extrusionBrep(profile, along, offset ? 0 : taper)
      if (!brep) continue
      const solid = createSweptSolid(
        brep,
        {
          kind: "extrusion",
          height: offset ? length3(offset) : (height ?? 0),
          taper,
        },
        ctx.document.getCurrentLayerId(),
        report ? undefined : `${PREVIEW_ID}-${made.length}`
      )
      made.push(report ? withCurrentProperties(solid, ctx) : solid)
    }
    return made
  }

  private extrude(
    height: number | null,
    offset: Vec3 | null,
    ctx: ToolContext
  ): void {
    if (offset) {
      // A direction along a profile's plane extrudes nothing (x11).
      const flat = this.profiles.some(
        ({ profile }) =>
          profile !== "crosses" &&
          Math.abs(dot3(offset, profile.axes.z)) <=
            MODEL_TOLERANCE * length3(offset)
      )
      if (flat) {
        ctx.report(ctx.text.message("directionParallel"), "error")
        ctx.dynamicInput.close()
        ctx.endCommand()
        return
      }
    }
    const made = this.solids(height, offset, this.settings.taper, ctx, true)
    const used = this.profiles
      .filter((_, i) => i < this.profiles.length)
      .filter(({ profile }) => profile !== "crosses")
      .map(({ id }) => id)
    const delobj = this.settings.delobj
    if (made.length > 0 && delobj < 0) {
      this.state = { phase: "erase", made, used }
      this.openKeywords(ctx)
      return
    }
    this.finish(made, made.length > 0 && delobj !== 0 ? used : [], ctx)
    ctx.endCommand()
  }

  private finish(
    made: readonly Entity[],
    erase: readonly EntityId[],
    ctx: ToolContext
  ): void {
    this.state = { phase: "select" }
    ctx.dynamicInput.close()
    if (made.length === 0) return
    ctx.execute(
      erase.length > 0
        ? new ReplaceEntitiesCommand(erase, made)
        : new AddEntitiesCommand(made)
    )
  }

  private openKeywords(ctx: ToolContext): void {
    ctx.dynamicInput.open({ fields: [], commit: () => {} })
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }

  private openPoint(ctx: ToolContext, prompt: PromptId): void {
    ctx.dynamicInput.open({
      fields: [{ id: "point", prompt, kind: "coordinate" }],
      commit: () => {},
      commitRaw: (commitCtx) => this.commitTypedPoint(commitCtx),
    })
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }

  /**
   * The height's or the taper's box: a number typed is the value, a
   * coordinate a point, and Enter takes the default or is refused as `FOO`
   * is (x03).
   */
  private openValue(ctx: ToolContext, prompt: PromptId): void {
    const taper = this.state.phase === "taper"
    ctx.dynamicInput.open({
      fields: [{ id: "value", prompt, kind: taper ? "angle" : "distance" }],
      commit: (values, commitCtx) => {
        if (!Number.isFinite(values.value)) return
        if (this.state.phase === "taper")
          this.takeTaper(values.value, commitCtx)
        else this.takeHeight(values.value, commitCtx)
      },
      commitRaw: (commitCtx) => {
        if (commitCtx.dynamicInput.hasTypedText()) {
          return this.commitTypedPoint(commitCtx)
        }
        commitCtx.report(
          commitCtx.text.message("requiresDistance", {
            points: "second",
            keyword: "yes",
          }),
          "error"
        )
        return true
      },
    })
    const value = taper ? this.settings.taper : this.settings.height
    if (value !== null) ctx.dynamicInput.setDefault("value", value)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }

  private openExpression(ctx: ToolContext): void {
    ctx.dynamicInput.open({
      fields: [{ id: "expression", prompt: "enterExpression", kind: "text" }],
      commit: () => {},
      commitRaw: (commitCtx) => {
        const text = commitCtx.dynamicInput.getText("expression").trim()
        const value = evaluateExpression(text)
        if (value === null) {
          commitCtx.report(commitCtx.text.message("expressionSyntax"), "error")
          return true
        }
        const state = this.state
        if (state.phase !== "expression") return true
        if (state.of === "taper") {
          this.state = { phase: "taper" }
          this.takeTaper(value, commitCtx)
        } else {
          this.state = { phase: "height", cursor: this.base() }
          this.takeHeight(value, commitCtx)
        }
        return true
      },
    })
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }

  /** A coordinate typed at a point or a distance is the point it names. */
  private commitTypedPoint(ctx: ToolContext): boolean {
    const field = ctx.dynamicInput.getActiveFieldId()
    const text = field === null ? "" : ctx.dynamicInput.getText(field).trim()
    if (!ctx.dynamicInput.hasTypedText()) {
      ctx.report(ctx.text.message("pointOrKeywordRequired"), "error")
      return true
    }
    if (!isCoordinateExpression(text)) return false
    const base = this.getConstraintAnchor()
    const point = parseCoordinate(text, {
      lastPoint: base ?? ctx.lastPoint,
      relativeByDefault: base !== null,
      ucs: ctx.ucs,
      elevation: ctx.elevation,
    })
    if (!point) return false
    this.takePoint(point, ctx)
    return true
  }
}

/** A taper angle as LIST writes it: degrees round a turn (x03: -30 is `330`). */
export function taperDegrees(taper: number): number {
  return normalizeDegrees((taper * 180) / Math.PI)
}

void add3
