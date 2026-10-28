import { Vec2 } from "../../geometry/Vec2"
import { WORLD_UCS } from "../../domain/ucs"
import { parseCoordinate } from "../input/coordinateInput"
import { matchesWildcard } from "../../shared/wildcard"
import {
  formatVariable,
  SYSTEM_VARIABLES,
  type SystemVariable,
  systemVariableNamed,
  type VariableChange,
} from "../systemVariables"
import {
  CommandOption,
  CommandOptionOutcome,
  PointerInput,
  QuestionInput,
  Tool,
  ToolContext,
  ToolQuestion,
} from "./Tool"

/**
 * What SETVAR remembers for the session: the last variable named at its
 * prompt or typed by its name, its `<default>` (WORKSPACE-D3; probes
 * workspace/p140, p148, p162), none at first (p169) and never saved.
 */
export interface SetvarMemory {
  last: string | null
}

type SetvarState =
  | { readonly phase: "name" }
  | { readonly phase: "list" }
  /** `?`'s lines not yet listed, at `Press ENTER to continue:`. */
  | { readonly phase: "page"; readonly lines: readonly string[] }
  | { readonly phase: "value"; readonly variable: SystemVariable }

/** A string listed longer than this is cut, with `...` (p126). */
const LISTED_STRING = 60

/** `?` lists this many variables, then pauses (desktop workspace/d07-1). */
const LISTED_PAGE = 20

/**
 * AutoCAD's SETVAR (es MODIVAR), which runs for every system variable typed
 * by its name (WORKSPACE-D1): `Enter variable name or [?] <LAST>:`, then
 * `Enter new value for ORTHOMODE <0>:`, asked as the variable's type asks
 * (`systemVariables.ts`). A refusal of its type asks again; a value the
 * variable rejects writes `Cannot set X to that value.` and `*Invalid*` and
 * ends; a read-only one writes `AREA = 0.0000 (read only)` and ends (probes
 * workspace/p101–p147). Every run is a step U names as it was invoked
 * (SETVAR, ORTHOMODE, 'AUPREC), a run that changes nothing too (p150–p159).
 *
 * Given a variable, it is that variable typed by name: one tool per run, so
 * that another variable typed at its prompt runs inside it (SVA-05).
 */
export class SystemVariableTool implements Tool {
  readonly id: string

  private state: SetvarState = { phase: "name" }
  private lastScreen: Vec2 | null = null
  /** The value the prompt offers, as it was when asked. */
  private shown = ""

  constructor(
    readonly memory: SetvarMemory = { last: null },
    private readonly fixed: SystemVariable | null = null,
    id = "setvar"
  ) {
    this.id = id
  }

  /** The run of `variable` typed by its name, sharing SETVAR's memory. */
  typedByName(variable: SystemVariable): SystemVariableTool {
    return new SystemVariableTool(this.memory, variable)
  }

  systemVariable(): string {
    return this.state.phase === "value" ? this.state.variable.name : ""
  }

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    if (this.fixed === null) this.askName(ctx)
    else this.askValue(this.fixed, ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    this.state = { phase: "name" }
    ctx.dynamicInput.close()
  }

  onAskAgain(ctx: ToolContext): void {
    if (this.state.phase === "value") this.askValue(this.state.variable, ctx)
    else if (this.state.phase === "list") this.askList(ctx)
    else if (this.state.phase === "page") ctx.dynamicInput.close()
    else this.askName(ctx)
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen
    ctx.dynamicInput.setPosition(input.screen)
  }

  wantsSnap(): boolean {
    return false
  }

  question(): ToolQuestion {
    switch (this.state.phase) {
      case "name":
        return this.memory.last === null
          ? { id: "enterVariableName" }
          : { id: "enterVariableName", enter: { name: this.memory.last } }
      case "list":
        return { id: "enterVariablesToList", enter: { name: "*" } }
      // Table 4054; es `Pulse INTRO para continuar:`.
      case "page":
        return { id: "pressEnterToContinue" }
      case "value": {
        const { variable } = this.state
        const string = variable.type === "string"
        return {
          id:
            string && variable.nullable
              ? "enterNewValueForOrNone"
              : "enterNewValueFor",
          values: { name: variable.name },
          enter: { name: this.shown },
          // USERS1 `AB CD` typed key by key is set whole (desktop d06).
          ...(string && { takesSpaces: true as const }),
        }
      }
    }
  }

  takes(): QuestionInput | null {
    if (this.state.phase !== "value") return null
    return refusalOf(this.state.variable)
  }

  commandOptions(): readonly CommandOption[] {
    if (this.state.phase === "name") return [{ id: "?" }]
    if (this.state.phase !== "value") return []
    const { variable } = this.state
    if (variable.type !== "integer") return []
    return (variable.keywords ?? []).map(({ id }) => ({ id, hidden: true }))
  }

  /** Enter at `Press ENTER to continue:`: the next page. */
  onEnter(ctx: ToolContext): boolean {
    if (this.state.phase !== "page") return false
    this.listPage(this.state.lines, ctx)
    return true
  }

  /** Whatever is typed there goes on too, as Enter does (unverified). */
  answerTyped(_text: string, ctx: ToolContext): boolean {
    return this.onEnter(ctx)
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    if (this.state.phase === "name" && id === "?") {
      this.askList(ctx)
      return "continue"
    }
    if (this.state.phase !== "value") return "unhandled"
    const { variable } = this.state
    if (variable.type !== "integer") return "unhandled"
    const keyword = variable.keywords?.find((each) => each.id === id)
    if (!keyword) return "unhandled"
    this.set(variable, keyword.value, ctx)
    return "continue"
  }

  private askName(ctx: ToolContext): void {
    this.state = { phase: "name" }
    this.openBox(ctx, "word", this.memory.last ?? "", (typed, answerCtx) =>
      this.answerName(typed, answerCtx)
    )
  }

  private askList(ctx: ToolContext): void {
    this.state = { phase: "list" }
    this.openBox(ctx, "word", "*", (typed, answerCtx) =>
      this.list(typed, answerCtx)
    )
  }

  private askValue(variable: SystemVariable, ctx: ToolContext): void {
    this.memory.last = variable.name
    this.state = { phase: "value", variable }
    this.shown = formatVariable(variable, ctx)
    if (variable.set === undefined) {
      ctx.report(
        ctx.text.message("readOnlyVariable", {
          name: variable.name,
          value: this.shown,
        })
      )
      ctx.endCommand()
      return
    }
    if (variable.type === "real" || variable.type === "angle") {
      this.askMeasure(variable.type === "real" ? "distance" : "angle", ctx)
      return
    }
    const kind = variable.type === "string" ? "word" : "number"
    this.openBox(ctx, kind, this.shown, (typed, answerCtx) =>
      this.answerValue(variable, typed, answerCtx)
    )
  }

  /**
   * A getint's, getstring's or getpoint's box: a value's, so that a
   * transparent command typed there runs (`'ZOOM`), whatever the type; a
   * name or a string typed as a word. It shows what Enter keeps (desktop
   * workspace/d07-4, d07-5).
   */
  private openBox(
    ctx: ToolContext,
    kind: "number" | "word",
    shown: string,
    answer: (typed: string, ctx: ToolContext) => void
  ): void {
    const take = (commitCtx: ToolContext) => {
      answer(commitCtx.dynamicInput.getText("value").trim(), commitCtx)
      return true
    }
    ctx.dynamicInput.open({
      fields: [{ id: "value", kind }],
      commit: (_values, commitCtx) => void take(commitCtx),
      commitRaw: take,
    })
    if (shown !== "") ctx.dynamicInput.setLiveText("value", shown)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }

  /**
   * A getdist's or getangle's box: two points measure it, what is no
   * distance or angle is the runtime's refusal, and Enter keeps the value.
   */
  private askMeasure(kind: "distance" | "angle", ctx: ToolContext): void {
    ctx.dynamicInput.open({
      fields: [{ id: "value", kind }],
      commit: (values, commitCtx) => {
        if (this.state.phase !== "value") return
        this.set(this.state.variable, values.value, commitCtx)
      },
      commitRaw: (commitCtx) => {
        if (commitCtx.dynamicInput.hasTypedText()) return false
        commitCtx.endCommand()
        return true
      },
    })
    ctx.dynamicInput.setLiveText("value", this.shown)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }

  /**
   * A name, case-blind and global only (`_ORTHOMODE` is unknown, p100), or
   * Enter for the last one; an unknown name ends SETVAR (p103, p122, p124),
   * as Enter does with no last one (p169).
   */
  private answerName(typed: string, ctx: ToolContext): void {
    const name = typed === "" ? this.memory.last : typed
    if (name === null) {
      ctx.endCommand()
      return
    }
    const variable = systemVariableNamed(name)
    if (!variable) {
      ctx.report(ctx.text.message("unknownVariableName"), "error")
      ctx.endCommand()
      return
    }
    this.askValue(variable, ctx)
  }

  private answerValue(
    variable: SystemVariable,
    typed: string,
    ctx: ToolContext
  ): void {
    if (typed === "") {
      ctx.endCommand()
      return
    }
    switch (variable.type) {
      case "integer": {
        const value = /^[-+]?\d+$/.test(typed) ? Number(typed) : NaN
        if (!(value >= variable.min && value <= variable.max)) {
          this.refuse(variable, ctx)
          return
        }
        this.set(variable, value, ctx)
        return
      }
      case "string":
        this.set(variable, variable.nullable && typed === "." ? "" : typed, ctx)
        return
      case "point": {
        if (variable.dimensions === 3) {
          // As a getpoint reads it, in the UCS LASTPOINT is kept in (p224).
          const point = parseCoordinate(typed, {
            lastPoint: ctx.held("LASTPOINT").read(),
            relativeByDefault: false,
            ucs: WORLD_UCS,
            elevation: ctx.elevation,
          })
          if (point === null) this.refuse(variable, ctx)
          else this.set(variable, point, ctx)
          return
        }
        const point = /^#?([-+]?[\d.]+),([-+]?[\d.]+)$/.exec(typed)
        const [x, y] = point ? [Number(point[1]), Number(point[2])] : [NaN, NaN]
        if (!Number.isFinite(x) || !Number.isFinite(y)) {
          this.refuse(variable, ctx)
          return
        }
        this.set(variable, { x, y }, ctx)
        return
      }
      default:
        this.refuse(variable, ctx)
    }
  }

  /** The type's refusal, and the prompt again (SVA-03). */
  private refuse(variable: SystemVariable, ctx: ToolContext): void {
    const refusal = refusalOf(variable)
    if (typeof refusal === "object" && typeof refusal?.refusal === "string") {
      ctx.report(ctx.text.message(refusal.refusal, refusal.values), "error")
    }
    this.askValue(variable, ctx)
  }

  private set(variable: SystemVariable, value: unknown, ctx: ToolContext) {
    // `value` is of the variable's type: its prompt read it so.
    const set = variable.set as
      ((value: unknown, ctx: ToolContext) => VariableChange) | undefined
    const change = set?.(value, ctx) ?? null
    if (change === null) {
      ctx.report(
        ctx.text.message("cannotSetVariable", { name: variable.name }),
        "error"
      )
      ctx.report(ctx.text.message("invalid"), "error")
    } else {
      const changes = variable.read(ctx) !== value
      ctx.execute(change)
      // As ATTDISP, only a change regenerates, U and REDO not (blocks/p04).
      if (variable.regenerates && changes) ctx.regenerate("once")
    }
    ctx.endCommand()
  }

  /**
   * `?`: each variable `typed`'s wild cards match (`*` for Enter), the name
   * padded to 18 columns, a read-only one's value to 36 then `(read only)`
   * (p125–p127), 20 at a time with `Press ENTER to continue:` between them,
   * as the desktop pauses (WORKSPACE-D7 revised; desktop workspace/d07-1).
   */
  private list(typed: string, ctx: ToolContext): void {
    const pattern = typed === "" ? "*" : typed
    const lines = SYSTEM_VARIABLES.filter((variable) =>
      matchesWildcard(variable.name, pattern)
    ).map((variable) => {
      const head = variable.name.padEnd(17) + " "
      const value = listedValue(variable, ctx)
      return variable.set === undefined
        ? `${head}${value.padEnd(36)} ${ctx.text.message("readOnlyListed")}`
        : `${head}${value}`
    })
    this.listPage(lines, ctx)
  }

  /** One page of `lines`, then the pause if any are left, else the end. */
  private listPage(lines: readonly string[], ctx: ToolContext): void {
    const page = lines.slice(0, LISTED_PAGE)
    const rest = lines.slice(LISTED_PAGE)
    if (page.length > 0) ctx.report(page.join("\n"))
    if (rest.length === 0) {
      ctx.endCommand()
      return
    }
    this.state = { phase: "page", lines: rest }
    ctx.dynamicInput.close()
    ctx.requestRender()
  }
}

function listedValue(variable: SystemVariable, ctx: ToolContext): string {
  if (variable.type !== "string") return formatVariable(variable, ctx)
  const value = variable.read(ctx)
  return value.length > LISTED_STRING
    ? `"${value.slice(0, LISTED_STRING)}..."`
    : `"${value}"`
}

/**
 * The words a type refuses with (p128–p147, p213): a switch `Requires 0 or
 * 1 only.`, with keywords `…, or option keyword.`, a range `Requires an
 * integer between a and b.`, a distance or an angle the runtime's, a point
 * `Invalid 2D point.`, a 3D one `Invalid point.` (p224).
 */
function refusalOf(variable: SystemVariable): QuestionInput | null {
  switch (variable.type) {
    case "integer":
      if (variable.min === 0 && variable.max === 1) {
        return {
          refusal: variable.keywords
            ? "requiresZeroOrOneOrKeyword"
            : "requiresZeroOrOne",
        }
      }
      return {
        refusal: "requiresIntegerBetween",
        values: { min: variable.min, max: variable.max },
      }
    case "real":
      return "distance"
    case "angle":
      return "angle"
    case "point":
      return {
        refusal: variable.dimensions === 3 ? "invalidPoint" : "invalidPoint2d",
      }
    case "string":
      return null
  }
}
