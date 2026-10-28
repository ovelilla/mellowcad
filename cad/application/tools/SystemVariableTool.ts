import { Vec2 } from "../../geometry/Vec2"
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
  | { readonly phase: "value"; readonly variable: SystemVariable }

/** A string listed longer than this is cut, with `...` (p126). */
const LISTED_STRING = 60

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
      case "value": {
        const { variable } = this.state
        return {
          id:
            variable.type === "string" && variable.nullable
              ? "enterNewValueForOrNone"
              : "enterNewValueFor",
          values: { name: variable.name },
          enter: { name: this.shown },
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
    this.openBox(ctx, (typed, answerCtx) => this.answerName(typed, answerCtx))
  }

  private askList(ctx: ToolContext): void {
    this.state = { phase: "list" }
    this.openBox(ctx, (typed, answerCtx) => this.list(typed, answerCtx))
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
    this.openBox(ctx, (typed, answerCtx) =>
      this.answerValue(variable, typed, answerCtx)
    )
  }

  /**
   * A getint's, getstring's or getpoint's box: a value's, so that a
   * transparent command typed there runs (`'ZOOM`), whatever the type.
   */
  private openBox(
    ctx: ToolContext,
    answer: (typed: string, ctx: ToolContext) => void
  ): void {
    const take = (commitCtx: ToolContext) => {
      answer(commitCtx.dynamicInput.getText("value").trim(), commitCtx)
      return true
    }
    ctx.dynamicInput.open({
      fields: [{ id: "value", kind: "number" }],
      commit: (_values, commitCtx) => void take(commitCtx),
      commitRaw: take,
    })
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
   * padded to 18 columns, a read-only one's value to 36 then `(read only)`;
   * the console's `Press ENTER to continue:` pause is left out: the history
   * scrolls (WORKSPACE-D7; p125–p127).
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
    if (lines.length > 0) ctx.report(lines.join("\n"))
    ctx.endCommand()
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
 * `Invalid 2D point.`.
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
      return { refusal: "invalidPoint2d" }
    case "string":
      return null
  }
}
