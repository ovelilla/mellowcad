import { Tool } from "./tools/Tool"
import { SelectTool } from "./tools/SelectTool"
import { LineTool } from "./tools/LineTool"
import { PolylineTool } from "./tools/PolylineTool"
import { CircleTool } from "./tools/CircleTool"
import { ArcTool } from "./tools/ArcTool"
import { EllipseTool } from "./tools/EllipseTool"
import { RectangleTool } from "./tools/RectangleTool"
import { PolygonTool } from "./tools/PolygonTool"
import { HatchTool } from "./tools/HatchTool"
import { BlockTool } from "./tools/BlockTool"
import { InsertTool } from "./tools/InsertTool"
import { TextTool } from "./tools/TextTool"
import { TextEditTool } from "./tools/TextEditTool"
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
import { ExplodeTool } from "./tools/ExplodeTool"
import { JoinTool } from "./tools/JoinTool"
import { BreakTool } from "./tools/BreakTool"
import { MatchPropTool } from "./tools/MatchPropTool"
import { CopyClipTool } from "./tools/CopyClipTool"
import { PasteTool } from "./tools/PasteTool"
import { MeasureTool } from "./tools/MeasureTool"
import { ZoomTool } from "./tools/ZoomTool"
import { PanTool } from "./tools/PanTool"

/**
 * Every tool the runtime registers, in registration order — which is the order
 * the toolbar shows them in. The three the runtime holds as fields (it has to
 * drive them directly) are passed in rather than built here.
 */
export function defaultTools(
  textEdit: TextEditTool,
  insert: InsertTool,
  paste: PasteTool
): Tool[] {
  return [
    new SelectTool(),
    new LineTool(),
    new PolylineTool(),
    new CircleTool("center", "circle", "c"),
    new CircleTool("centerDiameter", "circlediameter"),
    new CircleTool("twoPoint", "circle2p"),
    new CircleTool("threePoint", "circle3p"),
    new ArcTool("threePoint", "arc"),
    new ArcTool("startCenterEnd", "arcsce"),
    new ArcTool("centerStartEnd", "arccse"),
    new EllipseTool("axis", "ellipse", "el"),
    new EllipseTool("center", "ellipsecenter"),
    new EllipseTool("arc", "ellipsearc"),
    new RectangleTool(),
    new PolygonTool(),
    new HatchTool(),
    new BlockTool(),
    insert,
    new TextTool(),
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
    new ZoomTool(),
    new PanTool(),
  ]
}
