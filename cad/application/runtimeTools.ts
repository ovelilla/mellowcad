import { Tool } from "./tools/Tool"
import { SelectTool } from "./tools/SelectTool"
import { LineTool } from "./tools/LineTool"
import { PolylineTool } from "./tools/PolylineTool"
import { CircleTool } from "./tools/CircleTool"
import { ArcTool } from "./tools/ArcTool"
import { EllipseTool } from "./tools/EllipseTool"
import { SplineTool } from "./tools/SplineTool"
import { RectangleTool } from "./tools/RectangleTool"
import { PolygonTool } from "./tools/PolygonTool"
import { HatchTool } from "./tools/HatchTool"
import { BlockTool } from "./tools/BlockTool"
import { InsertTool } from "./tools/InsertTool"
import { TextTool } from "./tools/TextTool"
import { MTextTool } from "./tools/MTextTool"
import { TextEditTool } from "./tools/TextEditTool"
import { AttDefTool } from "./tools/AttDefTool"
import { AttEditTool } from "./tools/AttEditTool"
import { AttDispTool } from "./tools/AttDispTool"
import { DimensionTool } from "./tools/DimensionTool"
import { DimensionChainTool } from "./tools/DimensionChainTool"
import { RadialDimensionTool } from "./tools/RadialDimensionTool"
import { AngularDimensionTool } from "./tools/AngularDimensionTool"
import { DimSpaceTool } from "./tools/DimSpaceTool"
import { OffsetTool } from "./tools/OffsetTool"
import { MoveTool } from "./tools/MoveTool"
import { CopyTool } from "./tools/CopyTool"
import { StretchTool } from "./tools/StretchTool"
import { RotateTool } from "./tools/RotateTool"
import { ScaleTool } from "./tools/ScaleTool"
import { MirrorTool } from "./tools/MirrorTool"
import { ArrayTool } from "./tools/ArrayTool"
import { ArrayPolarTool } from "./tools/ArrayPolarTool"
import { ArrayPathTool } from "./tools/ArrayPathTool"
import { TrimTool } from "./tools/TrimTool"
import { ExtendTool } from "./tools/ExtendTool"
import { FilletTool } from "./tools/FilletTool"
import { ChamferTool } from "./tools/ChamferTool"
import { EraseTool } from "./tools/EraseTool"
import { ExplodeTool } from "./tools/ExplodeTool"
import { JoinTool } from "./tools/JoinTool"
import { BreakTool } from "./tools/BreakTool"
import { MatchPropTool } from "./tools/MatchPropTool"
import { CopyClipTool } from "./tools/CopyClipTool"
import { PasteTool } from "./tools/PasteTool"
import { MeasureTool } from "./tools/MeasureTool"
import { IdTool } from "./tools/IdTool"
import { ZoomTool } from "./tools/ZoomTool"
import { PanTool } from "./tools/PanTool"
import { DashPanTool } from "./tools/DashPanTool"
import { UcsTool } from "./tools/UcsTool"
import { UcsIconTool, UcsIconVariableTool } from "./tools/UcsIconTool"
import { PlanTool } from "./tools/PlanTool"
import { ElevTool } from "./tools/ElevTool"
import { VPointTool } from "./tools/VPointTool"
import { ViewTool } from "./tools/ViewTool"
import { OrbitTool } from "./tools/OrbitTool"
import { NavVCubeTool } from "./tools/NavVCubeTool"
import { FillTool } from "./tools/FillTool"
import { LtScaleTool } from "./tools/LtScaleTool"
import { AuPrecTool } from "./tools/AuPrecTool"
import { UndoTool } from "./tools/UndoTool"
import { MredoTool } from "./tools/MredoTool"
import { OsnapTool } from "./tools/OsnapTool"
import { ColorTool } from "./tools/ColorTool"
import { LinetypeTool } from "./tools/LinetypeTool"
import { LweightTool } from "./tools/LweightTool"

/**
 * Every tool the runtime registers, in registration order — which is the order
 * the toolbar shows them in. The ones the runtime holds as fields (it has to
 * drive them directly) are passed in rather than built here.
 */
export function defaultTools(
  textEdit: TextEditTool,
  insert: InsertTool,
  paste: PasteTool,
  attEdit: AttEditTool
): Tool[] {
  const circleRadius = { radius: 0 }
  return [
    new SelectTool(),
    new LineTool(),
    new PolylineTool(),
    new CircleTool("center", "circle", "c", circleRadius),
    new CircleTool("centerDiameter", "circlediameter", undefined, circleRadius),
    new CircleTool("twoPoint", "circle2p", undefined, circleRadius),
    new CircleTool("threePoint", "circle3p", undefined, circleRadius),
    new ArcTool("threePoint", "arc"),
    new ArcTool("startCenterEnd", "arcsce"),
    new ArcTool("centerStartEnd", "arccse"),
    new EllipseTool("axis", "ellipse", "el"),
    new EllipseTool("center", "ellipsecenter"),
    new EllipseTool("arc", "ellipsearc"),
    new SplineTool(),
    new RectangleTool(),
    new PolygonTool(),
    new HatchTool(),
    new BlockTool(),
    insert,
    attEdit,
    new AttDefTool(),
    new AttDispTool(),
    new TextTool(),
    new MTextTool(),
    textEdit,
    new DimensionTool("linear", "dimlinear"),
    new DimensionTool("aligned", "dimaligned"),
    new RadialDimensionTool("radius", "dimradius"),
    new RadialDimensionTool("diameter", "dimdiameter"),
    new AngularDimensionTool(),
    new DimensionChainTool("baseline", "dimbaseline"),
    new DimensionChainTool("continue", "dimcontinue"),
    new DimSpaceTool(),
    new OffsetTool(),
    new MoveTool(),
    new CopyTool(),
    new StretchTool(),
    new RotateTool(),
    new ScaleTool(),
    new MirrorTool(),
    new ArrayTool(),
    new ArrayPolarTool(),
    new ArrayPathTool(),
    new TrimTool(),
    new ExtendTool(),
    new FilletTool(),
    new ChamferTool(),
    new EraseTool(),
    new ExplodeTool(),
    new JoinTool(),
    new BreakTool("gap", "break"),
    new BreakTool("atPoint", "breakatpoint"),
    new MatchPropTool(),
    new CopyClipTool("copy", "copyclip"),
    new CopyClipTool("cut", "cutclip"),
    new CopyClipTool("base", "copybase"),
    paste,
    new MeasureTool("distance", "measure", "d"),
    new MeasureTool("area", "measurearea"),
    new IdTool(),
    new ZoomTool(),
    new PanTool(),
    new DashPanTool(),
    new UcsTool(),
    new UcsIconTool(),
    new PlanTool(),
    new ElevTool(),
    new VPointTool(),
    new ViewTool(),
    new OrbitTool(),
    new NavVCubeTool(),
    new FillTool(),
    new LtScaleTool(),
    new AuPrecTool(),
    new UndoTool(),
    new MredoTool(),
    new UcsIconVariableTool(),
    new OsnapTool(),
    new ColorTool(),
    new LinetypeTool(),
    new LweightTool(),
  ]
}
