import { regionArea, regionPerimeter } from "../../domain/regions"
import { boxInUcs } from "../../domain/solids"
import { curveBox, curveTessellation } from "../../geometry/planarCurves"
import { Vec2, V } from "../../geometry/Vec2"
import { Vec3, add3, cross3, length3, sub3 } from "../../geometry/Vec3"
import { axesToWorld } from "../../geometry/ocs"
import { bulgeToArc, normalizeDegrees } from "../../geometry/primitives"
import { periodicLoop } from "../../geometry/nurbs"
import type {
  ArcEntity,
  AttributeDefinitionEntity,
  BlockAttribute,
  BlockDefinition,
  CircleEntity,
  DimensionEntity,
  EllipseEntity,
  Entity,
  HatchEntity,
  RegionEntity,
  Solid3dEntity,
  InsertEntity,
  LineEntity,
  MTextEntity,
  Polyline3dEntity,
  PolylineEntity,
  SplineEntity,
  TextEntity,
  TextJustify,
} from "../../domain/entityTypes"
import { entitiesBounds } from "../../domain/entities"
import { entityAxes, entityPointToWorld } from "../../domain/elevation"
import {
  ellipseEndPoint,
  ellipseMinorAxis,
  ellipseSemiMajor,
  ellipseSemiMinor,
  ellipseStartPoint,
  ellipseSweepParams,
  isFullEllipse,
} from "../../domain/ellipses"
import { objectArea } from "../../domain/objectArea"
import {
  polylineBulge,
  polylineConstantWidth,
  polylineLength,
  polylineWidth,
} from "../../domain/polylines"
import { polyline3dCurve, polylineCurve } from "../../domain/polylineFits"
import { polyline3dLength } from "../../domain/polylines3d"
import {
  drawsPeriodic,
  isLevelSpline,
  splineCurve,
  splineDataPoints,
  splineLength,
  splinePolyline,
} from "../../domain/splines"
import { dimensionGeometry } from "../../domain/dimensions"
import {
  arraySourceSize,
  pathDivideStep,
  polarAngleBetween,
} from "../../domain/arrays"
import { formatAngle, formatLength } from "../../domain/units"
import { worldDirectionToUcs, worldPointToUcs } from "../../domain/ucs"
import type { MessageId } from "../EngineText"
import type { MessageValues } from "../../i18n/types"
import { colorWord } from "./ColorTool"
import type { ToolContext } from "./Tool"

/**
 * LIST's report of one object, line by line as AutoCAD 2027's console writes
 * it (probes inquiry/p400–p446): each line a catalog message holding its own
 * columns, the values padded here as the console's printf widths pad them —
 * `%9` a length at LUPREC, `%6` an angle at AUPREC, `%-9` the left-aligned
 * coordinates of an ellipse or a spline. Every point and direction is in the
 * current UCS.
 */
export function listReport(entity: Entity, ctx: ToolContext): string[] {
  return new Report(ctx).of(entity)
}

/** A preselection lists newest first, as the console lists `ssget "_X"`'s set (p421). */
export function newestFirst(
  ids: readonly string[],
  ctx: ToolContext
): string[] {
  const order = new Map(
    ctx.document.getEntities().map((entity, index) => [entity.id, index])
  )
  return [...ids].sort((a, b) => (order.get(b) ?? 0) - (order.get(a) ?? 0))
}

type ObjectName =
  | "line"
  | "circle"
  | "arc"
  | "ellipse"
  | "spline"
  | "lwpolyline"
  | "polyline"
  | "vertex"
  | "endSequence"
  | "text"
  | "mtext"
  | "attdef"
  | "attribute"
  | "dimension"
  | "hatch"
  | "insert"
  | "array"
  | "region"
  | "solid3d"

/** What the header line reads an object's appearance from. */
interface Wearing {
  readonly layerId: string
  readonly color?: string
  readonly linetype?: string
  readonly lineweight?: number
  readonly thickness?: number
}

const UP: Vec3 = { x: 0, y: 0, z: 1 }
const TILT = 1e-10

/** The words of TEXT's justification as LIST names the point (acdb 6492–6506). */
const JUSTIFY_POINT: Record<TextJustify, string> = {
  left: "start",
  center: "center",
  right: "end",
  middle: "mid",
  tl: "topLeft",
  tc: "topCenter",
  tr: "topRight",
  ml: "midLeft",
  mc: "mid",
  mr: "midRight",
  bl: "bottomLeft",
  bc: "bottomCenter",
  br: "bottomRight",
}

class Report {
  private readonly lines: string[] = []
  private readonly settings

  constructor(private readonly ctx: ToolContext) {
    this.settings = ctx.document.getSettings()
  }

  of(entity: Entity): string[] {
    switch (entity.type) {
      case "line":
        this.line(entity)
        break
      case "circle":
        this.circle(entity)
        break
      case "arc":
        this.arc(entity)
        break
      case "ellipse":
        this.ellipse(entity)
        break
      case "spline":
        this.spline(entity)
        break
      case "polyline":
        if (entity.fit) this.heavyPolyline(entity)
        else this.lwpolyline(entity)
        break
      case "polyline3d":
        this.polyline3d(entity)
        break
      case "text":
        this.text(entity)
        break
      case "mtext":
        this.mtext(entity)
        break
      case "attdef":
        this.attdef(entity)
        break
      case "dimension":
        this.dimension(entity)
        break
      case "hatch":
        this.hatch(entity)
        break
      case "insert":
        if (entity.array) this.array(entity)
        else this.insert(entity)
        break
      case "region":
        this.region(entity)
        break
      case "solid3d":
        this.solid(entity)
        break
    }
    return this.lines
  }

  private say(id: MessageId, values?: MessageValues): void {
    // The console drops a line's trailing spaces (`%-9` fields, an empty prompt).
    this.lines.push(
      this.ctx.text
        .message(id, values)
        .split("\n")
        .map((line) => line.trimEnd())
        .join("\n")
    )
  }

  private length(value: number): string {
    return formatLength(value, this.settings)
  }

  /** `%9.16q0`: a length at LUPREC, right-aligned in nine. */
  private n9(value: number): string {
    return this.length(value).padStart(9)
  }

  private angle(degrees: number): string {
    return formatAngle(normalizeDegrees(degrees), this.settings)
  }

  /** `%6.20q2`: an angle at AUPREC, right-aligned in six. */
  private a6(degrees: number): string {
    return this.angle(degrees).padStart(6)
  }

  /** An angle that may be a whole turn, which a fill angle of 360 is (p419). */
  private whole9(degrees: number): string {
    return formatAngle(degrees, this.settings).padStart(9)
  }

  private a9(degrees: number): string {
    return this.angle(degrees).padStart(9)
  }

  private xyz(point: Vec3): MessageValues {
    return { x: this.n9(point.x), y: this.n9(point.y), z: this.n9(point.z) }
  }

  /** `X = %-9.16q0, Y = …`: the ellipse's and the spline's coordinates. */
  private leftXyz(point: Vec3): MessageValues {
    const left = (value: number) => this.length(value).padEnd(9)
    return { x: left(point.x), y: left(point.y), z: left(point.z) }
  }

  private ucsPoint(point: Vec3): Vec3 {
    return worldPointToUcs(this.settings.ucs, point)
  }

  /** A point of the object, as it stores its points, in the UCS. */
  private at(entity: Entity, point: Vec2): Vec3 {
    return this.ucsPoint(entityPointToWorld(entity, point))
  }

  /** A direction of the object's plane, in the UCS. */
  private direction(entity: Entity, v: Vec2): Vec3 {
    return worldDirectionToUcs(
      this.settings.ucs,
      entity.normal ? axesToWorld(entityAxes(entity), v) : { ...v, z: 0 }
    )
  }

  /** An angle of the object's plane, as the UCS's XY plane reads it. */
  private ucsAngle(entity: Entity, radians: number): number {
    const d = this.direction(entity, {
      x: Math.cos(radians),
      y: Math.sin(radians),
    })
    return (Math.atan2(d.y, d.x) * 180) / Math.PI
  }

  /** The object's normal in the UCS, when it is not the UCS's Z. */
  private extrusion(entity: Entity): Vec3 | null {
    const normal = worldDirectionToUcs(this.settings.ucs, entity.normal ?? UP)
    const tilted =
      Math.abs(normal.x) > TILT || Math.abs(normal.y) > TILT || normal.z < 0
    return tilted ? normal : null
  }

  private sayExtrusion(entity: Entity): void {
    const normal = this.extrusion(entity)
    if (normal) this.say("listExtrusion", this.xyz(normal))
  }

  /**
   * The lines every object opens with: its type and layer, the space, the
   * colour and linetype when either is not ByLayer, the lineweight and the
   * thickness when set.
   *
   * WHY no `Handle = 2d7` line: the model has no handles (an object's id is
   * no hex number, nor one a VERTEX or an ATTRIBUTE has), and a made-up one
   * would read as AutoCAD's.
   */
  private header(name: ObjectName, wearing: Wearing): void {
    const layer = this.ctx.document.getLayer(wearing.layerId)
    this.say("listObject", {
      name: this.ctx.text.message("listObjectName", { name }).padEnd(8),
      layer: layer?.name ?? wearing.layerId,
    })
    this.say("listSpace")
    if (wearing.color !== undefined || wearing.linetype !== undefined) {
      const byLayer = this.ctx.text
        .commandKeyword("COLOR", "BYLAYER")
        .toUpperCase()
      this.say("listColor", {
        color:
          wearing.color === undefined
            ? byLayer
            : colorWord(wearing.color, this.ctx),
        linetype:
          wearing.linetype === undefined
            ? byLayer
            : linetypeName(wearing.linetype),
      })
    }
    if (wearing.lineweight !== undefined) {
      this.say("listLineweight", {
        lineweight: wearing.lineweight.toFixed(2),
      })
    }
    if (wearing.thickness) {
      this.say("listThickness", { thickness: this.n9(wearing.thickness) })
    }
  }

  private line(line: LineEntity): void {
    this.header("line", line)
    const z = line.elevation ?? 0
    const start = this.ucsPoint({ ...line.start, z })
    const end = this.ucsPoint({ ...line.end, z: z + (line.deltaZ ?? 0) })
    this.say("listLineFrom", this.xyz(start))
    this.say("listLineTo", this.xyz(end))
    this.sayExtrusion(line)
    const delta = sub3(end, start)
    const inPlane = Math.hypot(delta.x, delta.y)
    const rises = Math.abs(delta.z) > 1e-12
    this.say("listLineLength", {
      inUcs: rises ? "yes" : "no",
      length: this.n9(inPlane),
      angle: this.a6((Math.atan2(delta.y, delta.x) * 180) / Math.PI),
    })
    // A line that rises gives its length in space too (p401), one that
    // stays at its Z does not (p427).
    if (rises) {
      this.say("listLine3d", {
        length: this.n9(length3(delta)),
        angle: this.a6((Math.atan2(delta.z, inPlane) * 180) / Math.PI),
      })
    }
    this.say("listLineDelta", {
      x: this.n9(delta.x),
      y: this.n9(delta.y),
      z: this.n9(delta.z),
    })
  }

  private circle(circle: CircleEntity): void {
    this.header("circle", circle)
    this.say("listCenter", this.xyz(this.at(circle, circle.center)))
    this.say("listRadius", { radius: this.n9(circle.radius) })
    this.sayExtrusion(circle)
    this.say("listCircumference", {
      length: this.n9(2 * Math.PI * circle.radius),
    })
    this.say("listArea", { area: this.n9(Math.PI * circle.radius ** 2) })
  }

  private arc(arc: ArcEntity): void {
    this.header("arc", arc)
    this.say("listCenter", this.xyz(this.at(arc, arc.center)))
    this.say("listRadius", { radius: this.n9(arc.radius) })
    let sweep = arc.endAngle - arc.startAngle
    while (sweep <= 0) sweep += 2 * Math.PI
    const length = this.n9(arc.radius * sweep)
    // An arc off the UCS's plane gives no angles in it, its sweep instead
    // (p436).
    if (this.extrusion(arc)) {
      this.sayExtrusion(arc)
      this.say("listLength", { length })
      this.say("listTotalAngle", { angle: this.a6((sweep * 180) / Math.PI) })
      return
    }
    this.say("listStartAngle", {
      angle: this.a6(this.ucsAngle(arc, arc.startAngle)),
    })
    this.say("listEndAngle", {
      angle: this.a6(this.ucsAngle(arc, arc.endAngle)),
    })
    this.say("listLength", { length })
  }

  private ellipse(ellipse: EllipseEntity): void {
    this.header("ellipse", ellipse)
    const measured = objectArea(ellipse)
    if (isFullEllipse(ellipse)) {
      this.say("listCurveArea", { area: this.length(measured?.area ?? 0) })
      this.say("listCurveCircumference", {
        length: this.length(measured?.around ?? 0),
      })
    } else {
      this.say("listCurveLength", {
        length: this.length(measured?.around ?? 0),
      })
    }
    const vector = (v: Vec2) => this.leftXyz(this.direction(ellipse, v))
    this.say(
      "listEllipseCenter",
      this.leftXyz(this.at(ellipse, ellipse.center))
    )
    this.say("listEllipseMajor", vector(ellipse.majorAxis))
    this.say("listEllipseMinor", vector(ellipseMinorAxis(ellipse)))
    if (!isFullEllipse(ellipse)) {
      const { start, sweep } = ellipseSweepParams(ellipse)
      // ELLIPSE's angles, from the major axis to the point, not its parameters.
      const a = ellipseSemiMajor(ellipse)
      const b = ellipseSemiMinor(ellipse)
      const angleAt = (t: number) =>
        (Math.atan2(b * Math.sin(t), a * Math.cos(t)) * 180) / Math.PI
      this.say(
        "listEllipseStart",
        this.leftXyz(this.at(ellipse, ellipseStartPoint(ellipse)))
      )
      this.say(
        "listEllipseEnd",
        this.leftXyz(this.at(ellipse, ellipseEndPoint(ellipse)))
      )
      this.say("listEllipseStartAngle", { angle: this.angle(angleAt(start)) })
      this.say("listEllipseEndAngle", {
        angle: this.angle(angleAt(start + sweep)),
      })
    }
    this.say("listEllipseRatio", { ratio: this.length(ellipse.ratio) })
  }

  private spline(spline: SplineEntity): void {
    this.header("spline", spline)
    const planar = isLevelSpline(spline)
    const length = this.length(splineLength(spline))
    if (spline.closed) {
      // One that crosses itself gives no area (p429, p444), though AREA
      // measures its loops; one in no plane none either (unprobed).
      const measured = objectArea(spline)
      if (planar && measured && !crossesItself(spline)) {
        this.say("listCurveArea", { area: this.length(measured.area) })
      }
      this.say("listCurveCircumference", { length })
    } else {
      this.say("listCurveLength", { length })
    }
    const curve = splineCurve(spline)
    const periodic = drawsPeriodic(spline)
    // A periodic spline is held as one period's loop (spline/p311), which
    // the console lists (p406: three control points for three fit points).
    const held = periodic ? periodicLoop(curve) : curve
    const p = held.degree
    const knots = held.knots
    const [start, end] = periodic
      ? [knots[0], knots[knots.length - 1]]
      : [knots[p], knots[knots.length - 1 - p]]
    this.say("listSplineOrder", { order: p + 1 })
    this.say("listSplineProperties", {
      planar: planar ? "yes" : "no",
      rational: held.weights ? "yes" : "no",
      periodic: periodic ? "yes" : "no",
    })
    this.say("listSplineRange", { start: this.n9(start), end: this.n9(end) })
    this.say("listSplineControlCount", { count: held.controlPoints.length })
    const point = (p: Vec3) => this.leftXyz(this.at(spline, p))
    held.controlPoints.forEach((control, i) => {
      this.say(
        i === 0 ? "listSplineControlPoints" : "listPointMore",
        point(control)
      )
      if (held.weights) {
        this.say("listSplineWeight", { weight: this.n9(held.weights[i]) })
      }
    })
    if (spline.method !== "fit") return
    const fitPoints = splineDataPoints(spline)
    this.say("listSplineFitCount", { count: fitPoints.length })
    this.say("listSplineFitPoints")
    for (const fit of fitPoints) this.say("listPointMore", point(fit))
    // SPLINE's tolerance 0 is held as 1e-10 (p405), at LUPREC (p438).
    this.say("listSplineTolerance", {
      tolerance: `${(1).toFixed(this.settings.precision)}E-10`.padStart(9),
    })
    const tangent = (v: Vec3) =>
      this.leftXyz(
        worldDirectionToUcs(this.settings.ucs, this.toPlane(spline, v))
      )
    if (spline.startTangent) {
      this.say("listSplineStartTangent")
      this.say("listPointMore", tangent(spline.startTangent))
    }
    if (spline.endTangent) {
      this.say("listSplineEndTangent")
      this.say("listPointMore", tangent(spline.endTangent))
    }
  }

  private toPlane(entity: Entity, v: Vec3): Vec3 {
    return entity.normal ? axesToWorld(entityAxes(entity), v) : v
  }

  private lwpolyline(poly: PolylineEntity): void {
    this.header("lwpolyline", poly)
    this.say("listLwState", { closed: poly.closed ? "yes" : "no" })
    if (poly.thickness) {
      this.say("listLwThickness", { thickness: this.n9(poly.thickness) })
    }
    const constant = polylineConstantWidth(poly)
    if (constant !== null) {
      this.say("listLwConstantWidth", { width: this.n9(constant) })
    }
    this.sayExtrusion(poly)
    const measured = objectArea(poly)
    // LWPOLYLINE's area, length and perimeter are written unpadded, three
    // spaces after the word (p438: `area   50.00`).
    this.say("listLwArea", { area: this.length(measured?.area ?? 0) })
    this.say(poly.closed ? "listLwPerimeter" : "listLwLength", {
      length: this.length(polylineLength(poly)),
    })
    const n = poly.vertices.length
    const segments = poly.closed ? n : n - 1
    poly.vertices.forEach((vertex, i) => {
      this.say("listLwPoint", this.xyz(this.at(poly, vertex)))
      if (i >= segments) return
      if (constant === null) {
        const [startWidth, endWidth] = polylineWidth(poly, i)
        this.say("listStartingWidth", { width: this.n9(startWidth) })
        this.say("listEndingWidth", { width: this.n9(endWidth) })
      }
      const bulge = polylineBulge(poly, i)
      if (bulge !== 0) {
        this.bulgeArc(poly, vertex, poly.vertices[(i + 1) % n], bulge, "lw")
      }
    })
  }

  /** A bulged segment's arc: LWPOLYLINE writes its angles in nine, a VERTEX in six. */
  private bulgeArc(
    poly: PolylineEntity,
    from: Vec2,
    to: Vec2,
    bulge: number,
    kind: "lw" | "vertex"
  ): void {
    const arc = bulgeToArc(from, to, bulge)
    const angle = (radians: number) => {
      const degrees = this.ucsAngle(poly, radians)
      return kind === "lw" ? this.a9(degrees) : this.a6(degrees)
    }
    this.say("listBulge", { bulge: this.n9(bulge) })
    this.say(kind === "lw" ? "listLwCenter" : "listVertexCenter", {
      ...this.xyz(this.at(poly, arc.center)),
    })
    this.say("listRadius", { radius: this.n9(arc.radius) })
    this.say("listPolylineStartAngle", { angle: angle(arc.startAngle) })
    this.say("listPolylineEndAngle", { angle: angle(arc.endAngle) })
  }

  /**
   * A fitted polyline, which AutoCAD keeps as a heavy POLYLINE (Decurve
   * makes it an LWPOLYLINE again, p409): its VERTEX entries and END SEQUENCE.
   */
  private heavyPolyline(poly: PolylineEntity): void {
    const fit = poly.fit
    if (!fit) return
    const curve = polylineCurve(poly)
    const spline = fit.kind !== "curve"
    this.header("polyline", poly)
    this.say("listPolylineState", {
      state: `${poly.closed ? "closed" : "open"}${spline ? "Spline" : ""}`,
    })
    // The header's widths are the first segment's (p430).
    const [startWidth, endWidth] = polylineWidth(poly, 0)
    this.say("listStartingWidth", { width: this.n9(startWidth) })
    this.say("listEndingWidth", { width: this.n9(endWidth) })
    this.sayExtrusion(poly)
    const measured = objectArea(poly)
    this.say("listArea", { area: this.n9(measured?.area ?? 0) })
    this.say(poly.closed ? "listPolylinePerimeter" : "listLength", {
      length: this.n9(measured?.around ?? 0),
    })
    const widthsOf = (shape: PolylineEntity, i: number) => {
      const segments = shape.closed
        ? shape.vertices.length
        : shape.vertices.length - 1
      // WHY an open one's last vertex holds the last segment's ending width:
      // unverified, the probes' widths being the same throughout (p430).
      return i < segments
        ? polylineWidth(shape, i)
        : ([
            polylineWidth(shape, segments - 1)[1],
            polylineWidth(shape, segments - 1)[1],
          ] as const)
    }
    const vertex = (
      shape: PolylineEntity,
      i: number,
      mark: MessageId | null,
      withArc: boolean
    ) => {
      this.header("vertex", poly)
      this.say("listVertexPoint", this.xyz(this.at(poly, shape.vertices[i])))
      const [a, b] = widthsOf(shape, i)
      this.say("listStartingWidth", { width: this.n9(a) })
      this.say("listEndingWidth", { width: this.n9(b) })
      if (mark) this.say(mark)
      const n = shape.vertices.length
      const bulge = polylineBulge(shape, i)
      if (withArc && bulge !== 0 && (shape.closed || i < n - 1)) {
        this.bulgeArc(
          poly,
          shape.vertices[i],
          shape.vertices[(i + 1) % n],
          bulge,
          "vertex"
        )
      }
    }
    if (fit.kind === "curve") {
      // Each segment's joint between its two arcs is a VERTEX of its own
      // (p409, p430).
      const frame = new Set<number>()
      let at = 0
      poly.vertices.forEach((_, i) => {
        frame.add(at)
        at += fit.arcs[i] ? 2 : 1
      })
      curve.vertices.forEach((_, i) =>
        vertex(curve, i, frame.has(i) ? null : "listVertexCurveFit", true)
      )
    } else {
      // The frame's first vertex, the curve's points, then the rest of the
      // frame (pedit/p177).
      vertex(poly, 0, "listVertexControl", false)
      curve.vertices.forEach((_, i) =>
        vertex(curve, i, "listVertexSplineFit", true)
      )
      for (let i = 1; i < poly.vertices.length; i++) {
        vertex(poly, i, "listVertexControl", false)
      }
    }
    this.header("endSequence", poly)
  }

  private polyline3d(poly: Polyline3dEntity): void {
    this.header("polyline", poly)
    this.say("listPolylineState", {
      state: `${poly.closed ? "closed" : "open"}${poly.fit ? "Spline" : ""}Space`,
    })
    const curve = polyline3dCurve(poly)
    // The vector area of the ring the vertices close (3dpoly/p08).
    let area: Vec3 = { x: 0, y: 0, z: 0 }
    const v = curve.vertices
    for (let i = 0; i < v.length; i++) {
      area = add3(area, cross3(v[i], v[(i + 1) % v.length]))
    }
    this.say("listArea", { area: this.n9(length3(area) / 2) })
    this.say(poly.closed ? "listPolylinePerimeter" : "listLength", {
      length: this.n9(polyline3dLength(curve)),
    })
    const vertex = (point: Vec3, mark: MessageId | null) => {
      this.header("vertex", poly)
      this.say("listVertexSpace")
      this.say("listVertex3dPoint", this.xyz(this.ucsPoint(point)))
      if (mark) this.say(mark)
    }
    if (poly.fit) {
      vertex(poly.vertices[0], "listVertexControl")
      for (const point of curve.vertices) vertex(point, "listVertexSplineFit")
      for (const point of poly.vertices.slice(1)) {
        vertex(point, "listVertexControl")
      }
    } else {
      for (const point of poly.vertices) vertex(point, null)
    }
    this.header("endSequence", poly)
  }

  /** The lines TEXT, ATTDEF and ATTRIBUTE share before their own. */
  private textOpening(
    name: ObjectName,
    wearing: Wearing,
    styleId: string,
    justify: TextJustify,
    point: Vec3,
    height: number
  ): void {
    this.header(name, wearing)
    const style = this.ctx.document.getTextStyle(styleId)
    this.say("listTextStyle", { style: style?.name ?? styleId })
    this.say("listTextAnnotative")
    // Every style here draws Arial (textFontMetrics), as Standard does.
    this.say("listTypeface", { font: "Arial" })
    this.say("listTextPoint", {
      ...this.xyz(point),
      point: this.ctx.text
        .message("listJustifyPoint", { justify: JUSTIFY_POINT[justify] })
        .padStart(16),
    })
    this.say("listTextHeight", { height: this.n9(height) })
  }

  private textClosing(
    entity: Entity,
    rotation: number,
    width: number,
    flags: MessageValues | null
  ): void {
    const tilted = this.extrusion(entity) !== null
    // Text off the UCS's plane gives no rotation in it (p436).
    if (!tilted) this.say("listTextRotation", { angle: this.a6(rotation) })
    this.say("listTextWidth", { factor: this.n9(width) })
    this.say("listTextOblique", { angle: this.a6(0) })
    // After the obliquing angle (p436); an ATTDEF's place is unprobed.
    this.sayExtrusion(entity)
    if (flags) {
      const normal = Object.values(flags).every((flag) => flag === "no")
      this.say("listAttributeFlags", {
        ...flags,
        normal: normal ? "yes" : "no",
      })
    }
    this.say("listTextGeneration")
  }

  private text(text: TextEntity): void {
    this.textOpening(
      "text",
      text,
      text.styleId,
      text.justify,
      this.at(text, text.position),
      text.height
    )
    this.say("listTextValue", { text: text.value })
    this.textClosing(text, this.ucsAngle(text, text.rotation), 1, null)
  }

  private attdef(definition: AttributeDefinitionEntity): void {
    this.textOpening(
      "attdef",
      definition,
      definition.styleId,
      definition.justify,
      this.at(definition, definition.position),
      definition.height
    )
    this.say("listAttributeDefault", { value: definition.value })
    this.say("listAttributePrompt", { prompt: definition.prompt })
    this.say("listAttributeTag", { tag: definition.tag })
    const { modes } = definition
    this.textClosing(
      definition,
      this.ucsAngle(definition, definition.rotation),
      1,
      {
        invisible: modes.invisible ? "yes" : "no",
        constant: modes.constant ? "yes" : "no",
        verify: modes.verify ? "yes" : "no",
        preset: modes.preset ? "yes" : "no",
      }
    )
  }

  private mtext(mtext: MTextEntity): void {
    this.header("mtext", mtext)
    const style = this.ctx.document.getTextStyle(mtext.styleId)
    this.say("listTextStyle", { style: style?.name ?? mtext.styleId })
    this.say("listTextAnnotative")
    this.say("listMtextLocation", this.xyz(this.at(mtext, mtext.position)))
    this.say("listMtextWidth", { width: this.n9(mtext.width) })
    this.say(
      "listMtextNormal",
      this.xyz(worldDirectionToUcs(this.settings.ucs, mtext.normal ?? UP))
    )
    this.say("listMtextRotation", {
      angle: this.a9(this.ucsAngle(mtext, mtext.rotation)),
    })
    this.say("listMtextHeight", { height: this.n9(mtext.height) })
    // `%gx = …`: the spacing as a multiple of single spacing, 5/3 of the
    // height (p412: 1x = 4.1667 at 2.5; p432: Exactly 0.48x = 2.0000).
    const factor = mtext.lineSpacingFactor
    this.say("listMtextSpacing", {
      style: mtext.lineSpacingStyle === "exactly" ? "exactly" : "multiple",
      factor: String(Number(factor.toPrecision(6))),
      distance: this.n9((factor * mtext.height * 5) / 3),
    })
    this.say("listMtextAttachment", { attachment: mtext.attachment })
    this.say("listMtextFlow")
    this.say("listMtextContents", { contents: mtext.contents })
  }

  private dimension(dim: DimensionEntity): void {
    this.header("dimension", dim)
    const tilted = this.extrusion(dim) !== null
    // A dimension says its plane first (p437).
    this.sayExtrusion(dim)
    this.say("listDimensionAssociative")
    const point = (p: Vec2) => this.xyz(this.at(dim, p))
    const geometry = dimensionGeometry(
      dim,
      this.ctx.document.getDimStyle(dim.styleId)
    )
    switch (dim.kind) {
      case "linear":
      case "aligned": {
        const rotation = normalizeDegrees(this.ucsAngle(dim, dim.rotation))
        const type =
          dim.kind === "aligned"
            ? "aligned"
            : tilted
              ? "notParallel"
              : Math.abs(rotation) < 1e-9 || Math.abs(rotation - 360) < 1e-9
                ? "horizontal"
                : Math.abs(rotation - 90) < 1e-9
                  ? "vertical"
                  : "rotated"
        this.say("listDimensionType", { type })
        if (type === "rotated") {
          this.say("listDimensionRotation", { angle: this.a6(rotation) })
        }
        this.say("listDimensionFirstExtension", point(dim.first))
        this.say("listDimensionSecondExtension", point(dim.second))
        // DXF 10, where the dimension line meets the second extension line.
        this.say("listDimensionLine", point(geometry.lineEnd))
        break
      }
      case "angular":
        // The three-point form (AcDb3PointAngularDimension), which LIST
        // types `arc` (p415); DIMANGULAR's two lines are not kept here.
        this.say("listDimensionType", { type: "arc" })
        this.say("listDimensionArcFirst", point(dim.first))
        this.say("listDimensionArcSecond", point(dim.second))
        this.say("listDimensionArcCenter", point(dim.vertex ?? dim.first))
        // DXF 16 lies a third of the way round from the arc's start (p415:
        // 15° of 0–45°; 17.7° of 0–53.1°), on the arc through the location.
        this.say("listDimensionArc", point(thirdOfArc(geometry, dim.linePoint)))
        break
      case "radius":
        this.say("listDimensionType", { type: "radial" })
        this.say("listDimensionRadialCenter", point(dim.first))
        this.say("listDimensionDefiningPoint", point(dim.second))
        break
      case "diameter":
        this.say("listDimensionType", { type: "diameter" })
        this.say(
          "listDimensionFarPoint",
          point(V.sub(V.scale(dim.first, 2), dim.second))
        )
        this.say("listDimensionDefiningPoint", point(dim.second))
        break
    }
    if (dim.textAngle !== undefined) {
      this.say("listDimensionTextAngle", {
        angle: this.a6(this.ucsAngle(dim, dim.textAngle)),
      })
    }
    const radial = dim.kind === "radius" || dim.kind === "diameter"
    // A radial dimension's text is where it was put (p416), any other's
    // where its grip put it, else its own middle.
    const user = radial || dim.textPoint !== undefined
    this.say("listDimensionTextPosition", {
      user: user ? "yes" : "no",
      ...point(radial ? dim.linePoint : (dim.textPoint ?? geometry.textPoint)),
    })
    if (dim.text !== undefined) {
      this.say("listDimensionTextModifier", { text: dim.text })
    } else {
      this.say("listDimensionDefaultText")
    }
    const style = this.ctx.document.getDimStyle(dim.styleId)
    this.say("listDimensionStyle", { style: style?.name ?? dim.styleId })
    // DIMRADIUS and DIMDIAMETER place the text themselves (p416, p439).
    if (radial) this.say("listDimensionOverrides")
    this.say("listDimensionAnnotative")
  }

  /**
   * Its area, its perimeter and its box in the UCS (region/p01, p07), the
   * box's coordinates left-aligned in nine as the console pads them.
   */
  private region(region: RegionEntity): void {
    this.header("region", region)
    this.say("listRegionArea", { area: this.length(regionArea(region)) })
    this.say("listRegionPerimeter", {
      perimeter: this.length(regionPerimeter(region)),
    })
    const points = region.faces.flatMap((face) =>
      face.loops.flatMap((loop) =>
        loop.flatMap((edge) => {
          // Within a ten-millionth of its size: past what LUPREC can show.
          const box = curveBox(edge)
          const size = V.distance(box.min, box.max)
          return curveTessellation(edge, Math.max(size * 1e-7, 1e-12)).points
        })
      )
    )
    const placed = points.map((p) => this.at(region, p))
    const low = (axis: "x" | "y" | "z") =>
      Math.min(...placed.map((p) => p[axis]))
    const high = (axis: "x" | "y" | "z") =>
      Math.max(...placed.map((p) => p[axis]))
    const left = (value: number) => this.length(value).padEnd(9)
    this.say("listRegionBounds", {
      minX: left(low("x")),
      minY: left(low("y")),
      minZ: left(low("z")),
      maxX: left(high("x")),
      maxY: left(high("y")),
      maxZ: left(high("z")),
    })
  }

  /**
   * Its history, and a box's parameters in the UCS: the base's centre, the
   * normal when it is not the UCS's Z, the sizes, the length's heading
   * (solid/p01, p06, p13).
   */
  private solid(solid: Solid3dEntity): void {
    this.header("solid3d", solid)
    this.say("listSolidHistory")
    const box = solid.primitive
    if (!box) return
    const placed = boxInUcs(box, this.settings.ucs)
    this.say("listSolidType")
    this.say("listBoxPosition", this.leftXyz(placed.position))
    if (placed.normal) this.say("listBoxNormal", this.leftXyz(placed.normal))
    this.say("listBoxLength", { length: this.length(box.length) })
    this.say("listBoxWidth", { width: this.length(box.width) })
    this.say("listBoxHeight", { height: this.length(box.height) })
    this.say("listBoxRotation", { angle: this.angle(placed.rotation) })
  }

  private hatch(hatch: HatchEntity): void {
    this.header("hatch", hatch)
    this.say("listHatchPattern", { pattern: hatch.patternId })
    if (hatch.patternId !== "SOLID") {
      this.say("listHatchAnnotative")
      this.say("listHatchScale", { scale: this.n9(hatch.patternScale) })
      this.say("listHatchAngle", {
        angle: this.a6(this.ucsAngle(hatch, hatch.patternAngle)),
      })
    }
    this.say("listHatchNotAssociative")
    // Unpadded, as LWPOLYLINE's (p441: `Area      50.00`).
    this.say("listHatchArea", {
      area: this.length(objectArea(hatch)?.area ?? 0),
    })
    this.say("listHatchOrigin", this.xyz(this.at(hatch, hatch.origin)))
  }

  /** A point of `insert`'s block, where the reference puts it, in the UCS. */
  private placed(insert: InsertEntity, block: BlockDefinition, p: Vec2): Vec3 {
    const local = {
      x: (p.x - block.basePoint.x) * insert.scaleX,
      y: (p.y - block.basePoint.y) * insert.scaleY,
    }
    return this.at(
      insert,
      V.add(insert.position, turned(local, insert.rotation))
    )
  }

  private insertLines(insert: InsertEntity): void {
    this.say("listInsertPoint", this.xyz(this.at(insert, insert.position)))
    const tilted = this.extrusion(insert) !== null
    this.say("listInsertScaleX", { scale: this.n9(insert.scaleX) })
    this.say("listInsertScaleY", { scale: this.n9(insert.scaleY) })
    // A reference off the UCS's plane gives no rotation in it (p437).
    if (!tilted) {
      this.say("listInsertRotation", {
        angle: this.a6(this.ucsAngle(insert, insert.rotation)),
      })
    }
    this.say("listInsertScaleZ", { scale: this.n9(Math.abs(insert.scaleX)) })
    this.sayExtrusion(insert)
    this.say("listInsertUnits", { unit: this.settings.unit })
    this.say("listInsertConversion", { factor: this.n9(1) })
    this.say("listInsertUniform")
    this.say("listInsertExploding")
  }

  private insert(insert: InsertEntity): void {
    this.header("insert", insert)
    const block = this.ctx.document.getBlock(insert.blockId)
    this.say("listInsertName", { name: block?.name ?? insert.blockId })
    this.insertLines(insert)
    const attributes = insert.attributes ?? []
    if (!block || attributes.length === 0) return
    for (const attribute of attributes) this.attribute(insert, block, attribute)
    this.header("endSequence", insert)
  }

  /**
   * A reference's attribute, its text where the reference puts it: Y's
   * scale its height, X's over Y's its width (p418: 7.5000 and 0.6667 in a
   * reference at 2 by 3).
   */
  private attribute(
    insert: InsertEntity,
    block: BlockDefinition,
    attribute: BlockAttribute
  ): void {
    const sx = Math.abs(insert.scaleX)
    const sy = Math.abs(insert.scaleY)
    this.textOpening(
      "attribute",
      attribute,
      attribute.styleId,
      attribute.justify,
      this.placed(insert, block, attribute.position),
      attribute.height * sy
    )
    this.say("listAttributeValue", { value: attribute.value })
    this.say("listAttributeTag", { tag: attribute.tag })
    this.textClosing(
      insert,
      this.ucsAngle(insert, insert.rotation + attribute.rotation),
      sx / sy,
      {
        invisible: attribute.invisible ? "yes" : "no",
        constant: "no",
        verify: "no",
        preset: "no",
      }
    )
  }

  /** An associative array, AutoCAD's ARRAY object (arrays/p401–p406; p419, p434). */
  private array(insert: InsertEntity): void {
    const array = insert.array
    const block = this.ctx.document.getBlock(insert.blockId)
    if (!array || !block) return
    this.header("array", insert)
    const sx = Math.abs(insert.scaleX)
    const count = (value: number) => String(value).padStart(9)
    const spacing = (value: number) => this.n9(value * sx)
    // The ring and the path keep no rows: their defaults, one and a half times
    // the source across (p419: 6.0000 for a circle of radius 2).
    const source = arraySourceSize(
      entitiesBounds(block.entities),
      this.settings.ucs
    )
    // Nor levels: one, 1 apart (p420).
    const rows =
      array.kind === "rectangular"
        ? {
            rows: array.rows,
            spacing: array.rowSpacing,
            rise: array.rowElevation,
            levels: array.levels,
            levelSpacing: array.levelSpacing,
          }
        : {
            rows: 1,
            spacing: source.height * 1.5,
            rise: 0,
            levels: 1,
            levelSpacing: 1,
          }
    const rowLines = () => {
      this.say("listArrayRows", { count: count(rows.rows) })
      this.say("listArrayRowSpacing", { spacing: spacing(rows.spacing) })
      this.say("listArrayRowElevation", { spacing: this.n9(rows.rise) })
      this.say("listArrayLevels", { count: count(rows.levels) })
      this.say("listArrayLevelSpacing", {
        spacing: spacing(rows.levelSpacing),
      })
    }
    switch (array.kind) {
      case "rectangular":
        this.say("listArrayType", { kind: "rectangular" })
        this.say(
          "listArrayBasePoint",
          this.xyz(this.at(insert, insert.position))
        )
        this.say("listArrayColumns", { count: count(array.columns) })
        this.say("listArrayColumnSpacing", {
          spacing: spacing(array.colSpacing),
        })
        rowLines()
        this.say("listArrayAxisAngle", { angle: this.whole9(90) })
        break
      case "polar": {
        const center = this.placed(insert, block, array.center)
        const base = this.placed(insert, block, array.basePoint)
        this.say("listArrayType", { kind: "polar" })
        this.say("listArrayBasePoint", this.xyz(base))
        this.say("listArrayCenter", this.xyz(center))
        this.say("listArrayRadius", {
          radius: this.n9(length3(sub3(base, center))),
        })
        this.say("listArrayDirection", {
          direction: array.clockwise ? "clockwise" : "counterclockwise",
        })
        this.say("listArrayItems", { count: count(array.items) })
        this.say("listArrayAngleBetween", {
          angle: this.whole9(polarAngleBetween(array)),
        })
        this.say("listArrayFillAngle", { angle: this.whole9(array.fill) })
        rowLines()
        this.say("listArrayRotate", { answer: array.rotate ? "yes" : "no" })
        break
      }
      case "path": {
        const first = array.path.pieces[0]
        const start =
          first?.kind === "arc"
            ? V.add(
                first.center,
                V.scale(
                  { x: Math.cos(first.start), y: Math.sin(first.start) },
                  first.radius
                )
              )
            : (first?.a ?? insert.position)
        this.say("listArrayType", { kind: "path" })
        this.say("listArrayMethod", { method: array.method })
        this.say(
          "listArrayBasePoint",
          this.xyz(this.placed(insert, block, start))
        )
        this.say("listArrayItems", { count: count(array.items) })
        this.say("listArrayItemSpacing", {
          spacing: spacing(
            array.method === "measure"
              ? array.spacing
              : pathDivideStep(array.path, array.items)
          ),
        })
        this.say("listArrayStartOffset", { spacing: this.n9(0) })
        this.say("listArrayEndOffset", { spacing: this.n9(0) })
        rowLines()
        this.say("listArrayAlign", { answer: array.align ? "yes" : "no" })
        break
      }
    }
  }
}

function turned(v: Vec2, radians: number): Vec2 {
  const c = Math.cos(radians)
  const s = Math.sin(radians)
  return { x: v.x * c - v.y * s, y: v.x * s + v.y * c }
}

/**
 * A linetype's name as AutoCAD loaded it: acadiso.lin's in capitals (p427),
 * Continuous as the drawing has it.
 */
function linetypeName(id: string): string {
  return id === "Continuous" ? id : id.toUpperCase()
}

/** The point a third of the way round an angular dimension's arc (DXF 16). */
function thirdOfArc(
  geometry: ReturnType<typeof dimensionGeometry>,
  fallback: Vec2
): Vec2 {
  const arc = geometry.arc
  if (!arc) return fallback
  let sweep = arc.endAngle - arc.startAngle
  while (sweep <= 0) sweep += 2 * Math.PI
  const angle = arc.startAngle + sweep / 3
  return V.add(
    arc.center,
    V.scale({ x: Math.cos(angle), y: Math.sin(angle) }, arc.radius)
  )
}

/** Whether a closed spline's curve crosses itself, on its query tessellation. */
function crossesItself(spline: SplineEntity): boolean {
  const points = splinePolyline(spline)
  const n = points.length - 1
  const cross = (a: Vec2, b: Vec2, c: Vec2) =>
    (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)
  for (let i = 0; i < n; i++) {
    for (let j = i + 2; j < n; j++) {
      if (i === 0 && j === n - 1) continue
      const [a, b, c, d] = [points[i], points[i + 1], points[j], points[j + 1]]
      // A crossing on a vertex counts (p429's loop crosses at one, 15,5).
      const [ac, ad] = [cross(a, b, c), cross(a, b, d)]
      const [ca, cb] = [cross(c, d, a), cross(c, d, b)]
      if (
        ac * ad <= 0 &&
        ca * cb <= 0 &&
        !(ac === 0 && ad === 0) &&
        !(ca === 0 && cb === 0)
      ) {
        return true
      }
    }
  }
  return false
}
