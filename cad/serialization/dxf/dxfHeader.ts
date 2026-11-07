import { Vec3 } from "../../geometry/Vec3"
import { COLOR_BYLAYER } from "../../domain/colors"
import { LINETYPE_BYLAYER, LinetypeId } from "../../domain/linetypes"
import { LINEWEIGHT_BYLAYER } from "../../domain/lineweights"
import {
  DEFAULT_DOCUMENT_SETTINGS,
  DocumentSettings,
  LengthUnit,
} from "../../domain/units"
import { WORLD_UCS, ucsFromAxes } from "../../domain/ucs"
import { AttributeDisplay } from "../../domain/entities"
import { dxfColor, dxfLineweight } from "./dxfEntities"
import { DxfRecord } from "./dxfSections"
import { int, num, point, str } from "./dxfValues"

/** INSUNITS' values for the units the model has (systemVariables' INSUNITS). */
const UNITS: ReadonlyMap<number, LengthUnit> = new Map([
  [4, LengthUnit.Millimeter],
  [5, LengthUnit.Centimeter],
  [6, LengthUnit.Meter],
])

const ATTMODE: readonly AttributeDisplay[] = ["off", "normal", "on"]

/**
 * The drawing's settings from the HEADER's variables and the active
 * viewport (snap and grid live there from 2000 on, in the header in R12),
 * each over a new drawing's default when the file leaves it out.
 */
export function dxfSettings(
  header: ReadonlyMap<string, DxfRecord>,
  activeViewport: DxfRecord | undefined,
  linetype: (name: string | undefined) => LinetypeId | undefined
): DocumentSettings {
  const d = DEFAULT_DOCUMENT_SETTINGS
  const variable = (name: string) => header.get(name)
  const integer = (name: string, code: number) => {
    const record = variable(name)
    return record ? int(record, code) : undefined
  }
  const real = (name: string, code: number) => {
    const record = variable(name)
    return record ? num(record, code) : undefined
  }
  const places = (value: number | undefined, fallback: number) =>
    value !== undefined && value >= 0 && value <= 8 ? value : fallback
  const positive = (value: number | undefined, fallback: number) =>
    value !== undefined && value > 0 ? value : fallback
  const notNegative = (value: number | undefined, fallback: number) =>
    value !== undefined && value >= 0 ? value : fallback
  const flag = (value: number | undefined, fallback: boolean) =>
    value === undefined ? fallback : value !== 0
  const color = variable("$CECOLOR")
  const celtype = variable("$CELTYPE")
  const celweight = integer("$CELWEIGHT", 370)
  const splineType = integer("$SPLINETYPE", 70)
  const splineSegments = integer("$SPLINESEGS", 70)
  const snapRecord = variable("$SNAPUNIT")
  const snapUnit =
    (activeViewport && point(activeViewport, 14)) ??
    (snapRecord && point(snapRecord, 10))
  const ucs = dxfUcs(header)
  const ucsRecord = variable("$UCSNAME")
  const ucsName = ucsRecord ? str(ucsRecord, 2) : undefined
  return {
    ...d,
    unit: UNITS.get(integer("$INSUNITS", 70) ?? -1) ?? d.unit,
    precision: places(integer("$LUPREC", 70), d.precision),
    anglePrecision: places(integer("$AUPREC", 70), d.anglePrecision),
    ltScale: positive(real("$LTSCALE", 40), d.ltScale),
    // WHY not $LWDISPLAY: as for a new drawing here (AGENTS.md), with no
    // plotting the screen is the only place a lineweight shows.
    attributeDisplay:
      ATTMODE[integer("$ATTMODE", 70) ?? 1] ?? d.attributeDisplay,
    ucs,
    ucsName: ucs !== WORLD_UCS && ucsName ? ucsName : null,
    elevation: real("$ELEVATION", 40) ?? d.elevation,
    thickness: real("$THICKNESS", 40) ?? d.thickness,
    currentColor: (color && dxfColor(color)) ?? COLOR_BYLAYER,
    currentLinetype: (celtype && linetype(str(celtype, 6))) ?? LINETYPE_BYLAYER,
    currentLineweight: dxfLineweight(celweight) ?? LINEWEIGHT_BYLAYER,
    fillMode: flag(integer("$FILLMODE", 70), d.fillMode),
    polylineWidth: notNegative(real("$PLINEWID", 40), d.polylineWidth),
    filletRadius: notNegative(real("$FILLETRAD", 40), d.filletRadius),
    splineType:
      splineType === 5 || splineType === 6 ? splineType : d.splineType,
    splineSegments:
      splineSegments !== undefined && splineSegments !== 0
        ? splineSegments
        : d.splineSegments,
    isolines: notNegative(integer("$ISOLINES", 70), d.isolines),
    chamferDistance1: notNegative(real("$CHAMFERA", 40), d.chamferDistance1),
    chamferDistance2: notNegative(real("$CHAMFERB", 40), d.chamferDistance2),
    textSize: positive(real("$TEXTSIZE", 40), d.textSize),
    orthoMode: flag(integer("$ORTHOMODE", 70), d.orthoMode),
    snapMode: flag(
      activeViewport ? int(activeViewport, 75) : integer("$SNAPMODE", 70),
      d.snapMode
    ),
    snapUnit:
      snapUnit && snapUnit.x > 0 && snapUnit.y > 0
        ? { x: snapUnit.x, y: snapUnit.y }
        : d.snapUnit,
    gridMode: flag(
      activeViewport ? int(activeViewport, 76) : integer("$GRIDMODE", 70),
      d.gridMode
    ),
  }
}

/** The current UCS ($UCSORG, $UCSXDIR, $UCSYDIR), the world's when it is that or makes no plane. */
function dxfUcs(header: ReadonlyMap<string, DxfRecord>) {
  const read = (name: string, fallback: Vec3): Vec3 => {
    const record = header.get(name)
    return (record && point(record, 10)) ?? fallback
  }
  const origin = read("$UCSORG", { x: 0, y: 0, z: 0 })
  const x = read("$UCSXDIR", { x: 1, y: 0, z: 0 })
  const y = read("$UCSYDIR", { x: 0, y: 1, z: 0 })
  const world =
    origin.x === 0 &&
    origin.y === 0 &&
    origin.z === 0 &&
    x.x === 1 &&
    x.y === 0 &&
    x.z === 0 &&
    y.x === 0 &&
    y.y === 1 &&
    y.z === 0
  return world ? WORLD_UCS : (ucsFromAxes(origin, x, y) ?? WORLD_UCS)
}
