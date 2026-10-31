import type { Vec2 } from "../geometry/Vec2"
import { type Vec3, withZOf } from "../geometry/Vec3"
import { normalizeAngle, normalizeDegrees } from "../geometry/primitives"
import { COLOR_BYLAYER, STANDARD_COLORS } from "../domain/colors"
import { DEFAULT_HATCH_PATTERN_ID } from "../domain/hatchPatterns"
import { LINETYPE_BYLAYER, LINETYPES } from "../domain/linetypes"
import { LINEWEIGHT_BYLAYER, LINEWEIGHTS } from "../domain/lineweights"
import {
  type DocumentSettings,
  formatAngle,
  formatLength,
  LENGTH_PRECISIONS,
  LengthUnit,
} from "../domain/units"
import type { AttributeDisplay } from "../domain/entityTypes"
import type { Command } from "./commands/Command"
import { SetCurrentLayerCommand } from "./commands/layerCommands"
import {
  SessionSettingCommand,
  SetAttributeDisplayCommand,
  UpdateSettingsCommand,
} from "./commands/settingsCommands"
import { SetCurrentTextStyleCommand } from "./commands/textStyleCommands"
import { hatchPatternNameFor } from "./tools/HatchTool"
import type { HeldValues, ToolContext } from "./tools/Tool"

/**
 * What setting a value does: the command that stores it, run as the step of
 * the SETVAR that set it (WORKSPACE-D4) — `UpdateSettingsCommand` for the
 * drawing's, a table's own command (CLAYER), `SessionSettingCommand` for a
 * value kept by the program. Null: `Cannot set X to that value.`, SETVAR
 * ends (WORKSPACE-D5).
 */
export type VariableChange = Command | null

interface Variable<T> {
  /** Its name, the same in every language. */
  readonly name: string
  /** Its value now. */
  read(ctx: ToolContext): T
  /** The change setting `value` makes; left out for a read-only one. */
  set?(value: T, ctx: ToolContext): VariableChange
  /** Changing it regenerates, as its command does (ATTMODE's, p213). */
  readonly regenerates?: true
}

/**
 * An integer, asked by getint (table 26127): `Requires 0 or 1 only.` for a
 * switch, else `Requires an integer between a and b.`, and asked again; the
 * range is SETVAR's, from the probes (WORKSPACE-D37). A switch with
 * `keywords` (LWDISPLAY) takes and shows its words too.
 */
export interface IntegerVariable extends Variable<number> {
  readonly type: "integer"
  readonly min: number
  readonly max: number
  /** The keywords it takes as 1 and 0, the first two shown as its value. */
  readonly keywords?: readonly SwitchKeyword[]
}

/** A distance (getdist), written at LUPREC: `<0.0000>`. */
export interface RealVariable extends Variable<number> {
  readonly type: "real"
}

/** An angle in degrees (getangle), written at AUPREC: HPANG's `<0>`. */
export interface AngleVariable extends Variable<number> {
  readonly type: "angle"
}

/** A string, shown quoted (`<"0">`); a nullable one takes `.` for none. */
export interface StringVariable extends Variable<string> {
  readonly type: "string"
  readonly nullable?: true
}

/** A point, `Invalid 2D point.` for what is none, written at LUPREC. */
export interface PointVariable extends Variable<Vec2 | Vec3> {
  readonly type: "point"
  readonly dimensions: 2 | 3
}

export type SystemVariable =
  | IntegerVariable
  | RealVariable
  | AngleVariable
  | StringVariable
  | PointVariable

/** A switch's keyword (`ON`) and the value it means. */
export interface SwitchKeyword {
  readonly id: string
  readonly value: 0 | 1
}

/**
 * LWDISPLAY's getint declares ON, OFF, True, False, Yes and No, and shows
 * the value as ON or OFF (es ACT, DES; probes workspace/p203, p213).
 */
const ON_OFF: readonly SwitchKeyword[] = [
  { id: "ON", value: 1 },
  { id: "OFF", value: 0 },
  { id: "True", value: 1 },
  { id: "False", value: 0 },
  { id: "Yes", value: 1 },
  { id: "No", value: 0 },
]

/** The drawing's settings, patched as one step. */
function patch(settings: Partial<DocumentSettings>): Command {
  return new UpdateSettingsCommand(settings)
}

function integer(
  name: string,
  min: number,
  max: number,
  read: (settings: DocumentSettings) => number,
  set: (value: number, ctx: ToolContext) => VariableChange,
  keywords?: readonly SwitchKeyword[]
): IntegerVariable {
  return {
    type: "integer",
    name,
    min,
    max,
    keywords,
    read: (ctx) => read(ctx.document.getSettings()),
    set,
  }
}

function toggle(
  name: string,
  key: "orthoMode" | "gridMode" | "fillMode" | "lwDisplay",
  keywords?: readonly SwitchKeyword[]
): IntegerVariable {
  return integer(
    name,
    0,
    1,
    (settings) => (settings[key] ? 1 : 0),
    (value) => patch({ [key]: value === 1 }),
    keywords
  )
}

/** A distance kept in the drawing; `valid` is what SETVAR takes. */
function distance(
  name: string,
  key:
    | "elevation"
    | "thickness"
    | "polylineWidth"
    | "filletRadius"
    | "chamferDistance1"
    | "chamferDistance2"
    | "hatchPatternScale",
  valid: (value: number) => boolean
): RealVariable {
  return {
    type: "real",
    name,
    read: (ctx) => ctx.document.getSettings()[key],
    set: (value) => (valid(value) ? patch({ [key]: value }) : null),
  }
}

const anyValue = () => true
const notNegative = (value: number) => value >= 0

/** The step setting a variable kept outside the drawing makes (WORKSPACE-D35). */
function heldChange<K extends keyof HeldValues>(
  name: K,
  value: HeldValues[K],
  ctx: ToolContext
): Command {
  const held = ctx.held(name)
  return new SessionSettingCommand(
    (next: HeldValues[K]) => held.write(next),
    held.read(),
    value
  )
}

type HeldNumber = {
  [K in keyof HeldValues]: HeldValues[K] extends number ? K : never
}[keyof HeldValues]

/** An integer kept outside the drawing; `valid` is what SETVAR takes. */
function heldInteger(
  name: HeldNumber,
  min: number,
  max: number,
  valid: (value: number) => boolean = anyValue
): IntegerVariable {
  return {
    type: "integer",
    name,
    min,
    max,
    read: (ctx) => ctx.held(name).read(),
    set: (value, ctx) => (valid(value) ? heldChange(name, value, ctx) : null),
  }
}

/** A distance kept outside the drawing; `valid` is what SETVAR takes. */
function heldDistance(
  name: HeldNumber,
  valid: (value: number) => boolean
): RealVariable {
  return {
    type: "real",
    name,
    read: (ctx) => ctx.held(name).read(),
    set: (value, ctx) => (valid(value) ? heldChange(name, value, ctx) : null),
  }
}

const ATTMODE_VALUES: readonly AttributeDisplay[] = ["off", "normal", "on"]

/** INSUNITS' values for the units modelled here (mm, cm, m). */
const INSUNITS: ReadonlyMap<number, LengthUnit> = new Map([
  [4, LengthUnit.Millimeter],
  [5, LengthUnit.Centimeter],
  [6, LengthUnit.Meter],
])

/**
 * Every system variable mellowcad models that SETVAR sets or reads, typed by
 * name or at its prompt (WORKSPACE-D1, D30). Its words are AutoCAD 2027's
 * console's (probes workspace/p203–p224), its order the one `?` lists them in:
 * the older ones, then the newer, each alphabetical (p127).
 */
export const SYSTEM_VARIABLES: readonly SystemVariable[] = [
  // WHY Multiple lines (32) is refused where AutoCAD takes it (p213): -ATTDEF
  // then asks a multiline attribute's lines (p224), which is not modelled.
  heldInteger("AFLAGS", 0, 63, (value) => (value & 32) === 0),
  {
    type: "real",
    name: "AREA",
    read: (ctx) => ctx.inquiry().area,
  },
  {
    ...integer(
      "ATTMODE",
      0,
      2,
      (settings) => ATTMODE_VALUES.indexOf(settings.attributeDisplay),
      (value) => new SetAttributeDisplayCommand(ATTMODE_VALUES[value])
    ),
    regenerates: true,
  },
  integer(
    "AUPREC",
    0,
    8,
    (settings) => settings.anglePrecision,
    (value) => patch({ anglePrecision: value })
  ),
  {
    type: "string",
    name: "CECOLOR",
    read: (ctx) => colorValue(ctx),
    set: (value, ctx) => {
      const color = colorNamed(value, ctx)
      return color === null ? null : patch({ currentColor: color })
    },
  },
  {
    type: "string",
    name: "CELTYPE",
    read: (ctx) => {
      const linetype = ctx.document.getSettings().currentLinetype
      return linetype === LINETYPE_BYLAYER ? byWord(ctx, "BYLAYER") : linetype
    },
    set: (value, ctx) => {
      const word = value.toUpperCase()
      if (word === "BYLAYER" || word === byWord(ctx, "BYLAYER")) {
        return patch({ currentLinetype: LINETYPE_BYLAYER })
      }
      // WHY refused where AutoCAD takes it (p215): ByBlock is not modelled
      // (cad-engine.md, Blocks).
      const linetype = LINETYPES.find((def) => def.id.toUpperCase() === word)
      return linetype ? patch({ currentLinetype: linetype.id }) : null
    },
  },
  integer(
    "CELWEIGHT",
    -3,
    211,
    (settings) =>
      settings.currentLineweight === LINEWEIGHT_BYLAYER
        ? -1
        : Math.round(settings.currentLineweight * 100),
    (value) => {
      if (value === -1) return patch({ currentLineweight: LINEWEIGHT_BYLAYER })
      // WHY −2 (ByBlock) and −3 (Default) refused where AutoCAD takes them
      // (p209): neither is modelled (WORKSPACE-D34). A value that is no
      // standard lineweight AutoCAD refuses too (p217), where -LWEIGHT rounds.
      const lineweight = LINEWEIGHTS.find(
        (weight) => Math.round(weight * 100) === value
      )
      return lineweight === undefined
        ? null
        : patch({ currentLineweight: lineweight })
    }
  ),
  distance("CHAMFERA", "chamferDistance1", notNegative),
  distance("CHAMFERB", "chamferDistance2", notNegative),
  // U after CIRCLE leaves it (RECTANG-D48); typed, it is a step (p218).
  heldDistance("CIRCLERAD", notNegative),
  {
    type: "string",
    name: "CLAYER",
    read: (ctx) => {
      const id = ctx.document.getCurrentLayerId()
      return ctx.document.getLayer(id)?.name ?? ""
    },
    set: (value, ctx) => {
      const layer = ctx.document
        .getLayers()
        .find((each) => each.name.toUpperCase() === value.toUpperCase())
      return layer ? new SetCurrentLayerCommand(layer.id) : null
    },
  },
  {
    type: "real",
    name: "DISTANCE",
    read: (ctx) => ctx.inquiry().distance,
  },
  heldInteger("EDGEMODE", 0, 1),
  distance("ELEVATION", "elevation", anyValue),
  distance("FILLETRAD", "filletRadius", notNegative),
  toggle("FILLMODE", "fillMode"),
  toggle("GRIDMODE", "gridMode"),
  {
    type: "angle",
    name: "HPANG",
    read: (ctx) =>
      (ctx.document.getSettings().hatchPatternAngle * 180) / Math.PI,
    set: (degrees) =>
      patch({ hatchPatternAngle: normalizeAngle((degrees * Math.PI) / 180) }),
  },
  {
    type: "string",
    name: "HPNAME",
    read: (ctx) => ctx.document.getSettings().hatchPatternName,
    set: (value) => {
      // `.` puts the default back (p216).
      if (value === ".") {
        return patch({ hatchPatternName: DEFAULT_HATCH_PATTERN_ID })
      }
      const name = hatchPatternNameFor(value)
      return name === null ? null : patch({ hatchPatternName: name })
    },
  },
  distance("HPSCALE", "hatchPatternScale", (value) => value > 0),
  {
    type: "string",
    name: "INSNAME",
    nullable: true,
    read: (ctx) => ctx.held("INSNAME").read(),
    // A name no block has is taken (p216).
    set: (value, ctx) => heldChange("INSNAME", value, ctx),
  },
  integer(
    "INSUNITS",
    0,
    24,
    (settings) =>
      [...INSUNITS].find(([, unit]) => unit === settings.unit)?.[0] ?? 4,
    // WHY the others are refused where AutoCAD takes them (but 0 and 21,
    // p222): a drawing unit here is a millimetre, a centimetre or a metre.
    (value) => {
      const unit = INSUNITS.get(value)
      return unit === undefined ? null : patch({ unit })
    }
  ),
  {
    type: "point",
    name: "LASTPOINT",
    dimensions: 3,
    // In the UCS, `@` from itself, kept in the WCS (p212, p224; WORKSPACE-D41).
    read: (ctx) => ctx.held("LASTPOINT").read(),
    set: (point, ctx) => heldChange("LASTPOINT", withZOf(point, point), ctx),
  },
  integer(
    "LUPREC",
    0,
    LENGTH_PRECISIONS.length - 1,
    (settings) => settings.precision,
    (value) => patch({ precision: value })
  ),
  toggle("LWDISPLAY", "lwDisplay", ON_OFF),
  integer(
    "NAVVCUBEDISPLAY",
    0,
    3,
    // WHY 1 when hidden: NAVVCUBE OFF clears the 2D Wireframe bit, leaving
    // 1 (view/p262); only that bit is kept here (WORKSPACE-D39 not built).
    (settings) => (settings.viewCube.visible ? 3 : 1),
    (value, ctx) =>
      patch({
        viewCube: {
          ...ctx.document.getSettings().viewCube,
          visible: (value & 2) !== 0,
        },
      })
  ),
  // Less than 0 is Through (p211).
  heldDistance("OFFSETDIST", anyValue),
  toggle("ORTHOMODE", "orthoMode"),
  // NOD's 8 and GCEN's 1024 are kept without a snap; 16384 suspends the
  // running snaps as F3 does (p214; WORKSPACE-D40).
  heldInteger("OSMODE", 0, 32767),
  heldInteger("OSNAPZ", 0, 1),
  {
    type: "real",
    name: "PERIMETER",
    read: (ctx) => ctx.inquiry().perimeter,
  },
  distance("PLINEWID", "polylineWidth", notNegative),
  // 0 is Snap X's spacing (SnapMode); any sign taken (p211; WORKSPACE-D36).
  heldDistance("POLARDIST", anyValue),
  heldInteger("POLYSIDES", 3, 1024),
  // SNAPMODE 2 is taken (p222); what it means is SNAP's Type here, so it is
  // snap on.
  integer(
    "SNAPMODE",
    0,
    2,
    (settings) => (settings.snapMode ? 1 : 0),
    (value) => patch({ snapMode: value !== 0 })
  ),
  {
    type: "point",
    name: "SNAPUNIT",
    dimensions: 2,
    read: (ctx) => ctx.document.getSettings().snapUnit,
    set: (point) =>
      point.x > 0 && point.y > 0
        ? patch({ snapUnit: { x: point.x, y: point.y } })
        : null,
  },
  // Taken as getint takes any integer, then `Cannot set` but for 5 and 6, and
  // for 0 (pedit/p161, p199).
  integer(
    "SPLINESEGS",
    -32768,
    32767,
    (settings) => settings.splineSegments,
    (value) => (value === 0 ? null : patch({ splineSegments: value }))
  ),
  integer(
    "SPLINETYPE",
    -32768,
    32767,
    (settings) => settings.splineType,
    (value) =>
      value === 5 || value === 6 ? patch({ splineType: value }) : null
  ),
  {
    type: "real",
    name: "TEXTSIZE",
    read: (ctx) => ctx.document.getSettings().textSize,
    // A negative is taken as its size, 0 refused (p211, p222; WORKSPACE-D38).
    set: (value) => (value === 0 ? null : patch({ textSize: Math.abs(value) })),
  },
  {
    type: "string",
    name: "TEXTSTYLE",
    read: (ctx) => {
      const id = ctx.document.getCurrentTextStyleId()
      return ctx.document.getTextStyle(id)?.name ?? ""
    },
    set: (value, ctx) => {
      const style = ctx.document
        .getTextStyles()
        .find((each) => each.name.toUpperCase() === value.toUpperCase())
      return style ? new SetCurrentTextStyleCommand(style.id) : null
    },
  },
  distance("THICKNESS", "thickness", anyValue),
  integer(
    "UCSICON",
    0,
    3,
    ({ ucsIcon }) => (ucsIcon.visible ? 1 : 0) + (ucsIcon.atOrigin ? 2 : 0),
    (value) =>
      patch({
        ucsIcon: { visible: (value & 1) !== 0, atOrigin: (value & 2) !== 0 },
      })
  ),
  {
    type: "string",
    name: "UCSNAME",
    read: (ctx) => ctx.document.getSettings().ucsName ?? "",
  },
  {
    type: "point",
    name: "UCSORG",
    dimensions: 3,
    read: (ctx) => ctx.document.getSettings().ucs.origin,
  },
  {
    type: "point",
    name: "UCSXDIR",
    dimensions: 3,
    read: (ctx) => ctx.document.getSettings().ucs.xAxis,
  },
  {
    type: "integer",
    name: "UNDOCTL",
    min: 0,
    max: 63,
    read: (ctx) => ctx.inquiry().undoControl,
  },
  heldInteger("ARRAYASSOCIATIVITY", 0, 1),
  {
    type: "integer",
    name: "CLEANSCREENSTATE",
    min: 0,
    max: 1,
    read: (ctx) => ctx.inquiry().cleanScreenState,
  },
  heldInteger("CLIPROMPTLINES", 0, 50),
  {
    type: "angle",
    name: "POLARANG",
    read: (ctx) => ctx.held("POLARANG").read(),
    // WHY 0 is refused where AutoCAD takes it (p223): polar tracking here
    // needs an increment to step by.
    set: (degrees, ctx) => {
      const step = normalizeDegrees(degrees)
      return step === 0 ? null : heldChange("POLARANG", step, ctx)
    },
  },
  heldInteger("SELECTIONCYCLING", -2, 2),
  heldInteger("SPLDEGREE", 1, 10),
  heldInteger("SPLKNOTS", 0, 2),
  heldInteger("SPLMETHOD", 0, 1),
  heldInteger("TEXTEDITMODE", 0, 1),
  heldInteger("TRIMEXTENDMODE", 0, 1),
]

const BY_NAME = new Map(
  SYSTEM_VARIABLES.map((variable) => [variable.name, variable])
)

/** The variable `name` names, case-blind; global names only (p100). */
export function systemVariableNamed(name: string): SystemVariable | undefined {
  return BY_NAME.get(name.trim().toUpperCase())
}

/**
 * A variable's value as SETVAR writes it: at its prompt's `<…>`, in the `?`
 * listing and after `=` when read only — a length at LUPREC, an angle at
 * AUPREC (inquiry/p237), a string quoted, a switch's keyword in the command
 * language (`OFF`, es `DES`).
 */
export function formatVariable(
  variable: SystemVariable,
  ctx: ToolContext
): string {
  const settings = ctx.document.getSettings()
  switch (variable.type) {
    case "integer": {
      const value = variable.read(ctx)
      const keyword = variable.keywords?.find((each) => each.value === value)
      return keyword ? ctx.text.keyword(keyword.id) : String(value)
    }
    case "real":
      return formatLength(variable.read(ctx), settings)
    case "angle":
      return formatAngle(variable.read(ctx), settings)
    case "string":
      return `"${variable.read(ctx)}"`
    case "point": {
      const point = variable.read(ctx)
      const parts =
        variable.dimensions === 3 && "z" in point
          ? [point.x, point.y, point.z]
          : [point.x, point.y]
      return parts.map((part) => formatLength(part, settings)).join(",")
    }
  }
}

/** -COLOR's word for ByLayer or ByBlock, as CECOLOR shows it (es `PORCAPA`). */
function byWord(ctx: ToolContext, id: "BYLAYER" | "BYBLOCK"): string {
  return ctx.text.commandKeyword("COLOR", id).toUpperCase()
}

/**
 * CECOLOR as AutoCAD writes it: `BYLAYER` (es `PORCAPA`), an index colour
 * by its number, any other `RGB:r,g,b` (p208).
 */
function colorValue(ctx: ToolContext): string {
  const color = ctx.document.getSettings().currentColor
  if (color === COLOR_BYLAYER) return byWord(ctx, "BYLAYER")
  const index = STANDARD_COLORS.findIndex((each) => each.value === color)
  if (index >= 0) return String(index + 1)
  const [r, g, b] = [1, 3, 5].map((at) => parseInt(color.slice(at, at + 2), 16))
  return `RGB:${r},${g},${b}`
}

/**
 * What CECOLOR takes (p204, p208, p215): a colour number (256 ByLayer), an
 * index colour's name in English or in the command language, ByLayer, and
 * `r,g,b` with or without `RGB:`. WHY ByBlock, 0 and 8–255 are refused where
 * AutoCAD takes them (WORKSPACE-D33): ByBlock is not modelled and those
 * index colours' RGB values are not known here.
 */
function colorNamed(
  typed: string,
  ctx: ToolContext
): string | typeof COLOR_BYLAYER | null {
  const word = typed.replace(/^#/, "").toUpperCase()
  if (/^\d+$/.test(word)) {
    const index = Number(word)
    if (index === 256) return COLOR_BYLAYER
    return STANDARD_COLORS[index - 1]?.value ?? null
  }
  if (word === "BYLAYER" || word === byWord(ctx, "BYLAYER")) {
    return COLOR_BYLAYER
  }
  const named = STANDARD_COLORS.find(
    (color) =>
      color.id.toUpperCase() === word ||
      ctx.text.commandKeyword("COLOR", color.id.toUpperCase()).toUpperCase() ===
        word
  )
  if (named) return named.value
  const rgb = /^(?:RGB:)?(\d{1,3}),(\d{1,3}),(\d{1,3})$/.exec(word)
  if (!rgb) return null
  const values = rgb.slice(1).map(Number)
  if (values.some((value) => value > 255)) return null
  return `#${values.map((value) => value.toString(16).padStart(2, "0")).join("")}`
}
