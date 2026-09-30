"use client"

import { Fragment, useState } from "react"
import {
  ArrowRightToLine,
  CopyPlus,
  Eraser,
  Eye,
  FlipHorizontal2,
  Grid3x3,
  CircleDotDashed,
  LetterText,
  Merge,
  type LucideIcon,
  MousePointer2,
  Move,
  Paintbrush,
  PenLine,
  Pentagon,
  Redo2,
  RotateCw,
  Ruler,
  Scaling,
  Scan,
  Scissors,
  Shapes,
  Slash,
  Spline,
  Split,
  Square,
  Tag,
  TextCursorInput,
  Trash2,
  Type,
  Undo2,
  Waypoints,
} from "lucide-react"
import { useTranslations } from "next-intl"

import { TooltipProvider } from "@/components/ui/tooltip"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { CadEngine, EngineState } from "@/cad"

import { IconAction, Panel } from "./toolbar-primitives"
import {
  Circle2PointsIcon,
  Circle3PointsIcon,
  CircleDiameterIcon,
  CircleRadiusIcon,
  ArcIcon,
  ArcStartCenterEndIcon,
  ArcCenterStartEndIcon,
  BlockIcon,
  BreakIcon,
  BreakAtPointIcon,
  ChamferIcon,
  DimAlignedIcon,
  DimAngularIcon,
  DimBaselineIcon,
  DimContinueIcon,
  DimDiameterIcon,
  DimLinearIcon,
  DimRadiusIcon,
  DimSpaceIcon,
  EllipseIcon,
  EllipseArcIcon,
  EllipseCenterIcon,
  FilletIcon,
  HatchIcon,
  InsertIcon,
  OffsetIcon,
  PolylineIcon,
  StretchIcon,
} from "./icons"

/** Maps a tool id to an icon. Unknown/new tools fall back to a generic glyph. */
const TOOL_ICONS: Record<string, LucideIcon> = {
  select: MousePointer2,
  line: Slash,
  polyline: PolylineIcon,
  circle: CircleRadiusIcon,
  circlediameter: CircleDiameterIcon,
  circle2p: Circle2PointsIcon,
  circle3p: Circle3PointsIcon,
  arc: ArcIcon,
  arcsce: ArcStartCenterEndIcon,
  arccse: ArcCenterStartEndIcon,
  ellipse: EllipseIcon,
  ellipsecenter: EllipseCenterIcon,
  ellipsearc: EllipseArcIcon,
  spline: Spline,
  rectangle: Square,
  polygon: Pentagon,
  hatch: HatchIcon,
  block: BlockIcon,
  insert: InsertIcon,
  attdef: Tag,
  attedit: TextCursorInput,
  attdisp: Eye,
  offset: OffsetIcon,
  move: Move,
  copy: CopyPlus,
  stretch: StretchIcon,
  rotate: RotateCw,
  scale: Scaling,
  mirror: FlipHorizontal2,
  array: Grid3x3,
  arraypolar: CircleDotDashed,
  arraypath: Waypoints,
  trim: Scissors,
  extend: ArrowRightToLine,
  fillet: FilletIcon,
  chamfer: ChamferIcon,
  explode: Split,
  join: Merge,
  break: BreakIcon,
  breakatpoint: BreakAtPointIcon,
  matchprop: Paintbrush,
  text: Type,
  mtext: LetterText,
  textedit: PenLine,
  dimlinear: DimLinearIcon,
  dimaligned: DimAlignedIcon,
  dimangular: DimAngularIcon,
  dimradius: DimRadiusIcon,
  dimdiameter: DimDiameterIcon,
  dimbaseline: DimBaselineIcon,
  dimcontinue: DimContinueIcon,
  dimspace: DimSpaceIcon,
  measure: Ruler,
  measurearea: Scan,
}

/**
 * A family of related tools collapsed behind one rail button — AutoCAD's
 * flyout. Keeps near-identical variants (the three array modes) as a single
 * slot so the rail doesn't grow a button per variant as the app scales.
 */
interface ToolFlyoutFamily {
  /** Its name in `Editor.ToolRail.flyouts`. */
  readonly id: FlyoutId
  /** Tool ids shown inside the flyout, in order. */
  readonly members: readonly string[]
}

type FlyoutId =
  | "circle"
  | "arc"
  | "ellipse"
  | "rectangle"
  | "fillet"
  | "break"
  | "array"
  | "text"
  | "dimension"
  | "attributes"
  | "measure"

type RailItem = string | ToolFlyoutFamily

/**
 * A functional cluster of the rail, mirroring AutoCAD's ribbon panels
 * (Draw / Modify / …). Clustering the tools by what they *do* — rather than a
 * flat list — is what keeps the rail scannable as more tools land.
 */
interface RailGroup {
  readonly id: string
  readonly items: readonly RailItem[]
}

/**
 * The rail's structure, declared as data so adding a tool is a one-line edit
 * (or nothing at all — unlisted tools fall into a trailing "More" group).
 * Grouping lives here, in the UI, keeping the engine visually agnostic.
 */
const RAIL_LAYOUT: readonly RailGroup[] = [
  { id: "select", items: ["select"] },
  {
    id: "draw",
    items: [
      "line",
      "polyline",
      {
        id: "circle",
        members: ["circle", "circlediameter", "circle2p", "circle3p"],
      },
      {
        id: "arc",
        members: ["arc", "arcsce", "arccse"],
      },
      {
        id: "ellipse",
        members: ["ellipse", "ellipsecenter", "ellipsearc"],
      },
      "spline",
      {
        id: "rectangle",
        members: ["rectangle", "polygon"],
      },
      "hatch",
    ],
  },
  {
    id: "modify",
    items: [
      "move",
      "copy",
      "stretch",
      "rotate",
      "scale",
      "mirror",
      "offset",
      "trim",
      "extend",
      { id: "fillet", members: ["fillet", "chamfer"] },
      { id: "break", members: ["break", "breakatpoint"] },
      "explode",
      "join",
      "matchprop",
      { id: "array", members: ["array", "arraypolar", "arraypath"] },
    ],
  },
  {
    id: "annotate",
    items: [
      // The ribbon's Text split button: Multiline Text first, Single Line after.
      { id: "text", members: ["mtext", "text"] },
      "textedit",
      {
        id: "dimension",
        members: [
          "dimlinear",
          "dimaligned",
          "dimangular",
          "dimradius",
          "dimdiameter",
          "dimbaseline",
          "dimcontinue",
          "dimspace",
        ],
      },
    ],
  },
  {
    id: "block",
    // The ribbon's Block panel puts Insert first and Create Block after it;
    // the attribute commands share one slot, as its Edit Attributes split button does.
    items: [
      "insert",
      "block",
      { id: "attributes", members: ["attdef", "attedit", "attdisp"] },
    ],
  },
  {
    id: "measure",
    items: [{ id: "measure", members: ["measure", "measurearea"] }],
  },
]

function isFlyout(item: RailItem): item is ToolFlyoutFamily {
  return typeof item !== "string"
}

/**
 * Tools that live elsewhere in the chrome. View navigation sits with the other
 * view controls in the command bar, the way AutoCAD keeps it off the Draw and
 * Modify ribbon panels. The clipboard commands are reached by Ctrl+C/X/V or by
 * name; AutoCAD's own Clipboard panel is not built yet, and a Paste button that
 * only works when something has been copied would be a poor first one.
 */
const RAIL_EXCLUDED = new Set([
  "zoom",
  "pan",
  "copyclip",
  "cutclip",
  "copybase",
  "paste",
])

interface ToolMeta {
  id: string
  label: string
  shortcut?: string
}

/**
 * The vertical command rail, modelled on AutoCAD's ribbon: tools are clustered
 * by function (Select / Draw / Modify) with variant families (the array modes)
 * tucked into a flyout, so choosing a tool stays quick and the strip scales
 * without crowding the drawing.
 */
export function ToolRail({
  engine,
  state,
}: {
  engine: CadEngine
  state: EngineState
}) {
  const t = useTranslations("Editor.ToolRail")
  const keys = useTranslations("Editor.Keys")
  const metaById = new Map<string, ToolMeta>(
    state.tools.map((tool) => [tool.id, tool])
  )

  const listed = new Set<string>()
  for (const group of RAIL_LAYOUT) {
    for (const item of group.items) {
      if (isFlyout(item)) item.members.forEach((id) => listed.add(id))
      else listed.add(item)
    }
  }

  // Any registered tool the layout doesn't place still shows up, so a newly
  // added tool is never silently dropped from the rail.
  const uncategorized = state.tools
    .map((tool) => tool.id)
    .filter((id) => !listed.has(id) && !RAIL_EXCLUDED.has(id))
  const groups: RailGroup[] = [
    ...RAIL_LAYOUT,
    ...(uncategorized.length ? [{ id: "more", items: uncategorized }] : []),
  ]

  const renderTool = (id: string) => {
    const meta = metaById.get(id)
    if (!meta) return null
    return (
      <IconAction
        key={id}
        icon={TOOL_ICONS[id] ?? Shapes}
        label={meta.label}
        shortcut={meta.shortcut?.toUpperCase()}
        active={state.activeToolId === id}
        onClick={() => engine.setActiveTool(id)}
      />
    )
  }

  return (
    <TooltipProvider>
      <Panel className="max-h-[calc(100svh-8rem)] flex-col overflow-y-auto">
        {groups.map((group) => (
          <Fragment key={group.id}>
            {group.items.map((item, i) =>
              isFlyout(item) ? (
                <ToolFlyout
                  key={`${group.id}-flyout-${i}`}
                  engine={engine}
                  state={state}
                  family={item}
                  metaById={metaById}
                />
              ) : (
                renderTool(item)
              )
            )}
          </Fragment>
        ))}

        <IconAction
          icon={Undo2}
          label={t("undo")}
          shortcut={keys("undo")}
          disabled={!state.canUndo}
          onClick={() => engine.undo()}
        />
        <IconAction
          icon={Redo2}
          label={t("redo")}
          shortcut={keys("redo")}
          disabled={!state.canRedo}
          onClick={() => engine.redo()}
        />
        <IconAction
          icon={Trash2}
          label={t("deleteSelection")}
          shortcut={keys("delete")}
          disabled={state.selectionCount === 0}
          onClick={() => engine.deleteSelection()}
          className="text-destructive/80 hover:bg-destructive/10 hover:text-destructive"
        />
        <IconAction
          icon={Eraser}
          label={t("clearAll")}
          disabled={state.entityCount === 0}
          onClick={() => engine.clearAll()}
        />
      </Panel>
    </TooltipProvider>
  )
}

/**
 * A single rail slot standing in for a family of related tools. The button
 * shows the active member (or the last one picked), a corner triangle marks it
 * as a flyout, and the popover lets you pick a variant — AutoCAD's flyout.
 */
function ToolFlyout({
  engine,
  state,
  family,
  metaById,
}: {
  engine: CadEngine
  state: EngineState
  family: ToolFlyoutFamily
  metaById: Map<string, ToolMeta>
}) {
  const t = useTranslations("Editor.ToolRail.flyouts")
  const members = family.members
    .map((id) => metaById.get(id))
    .filter((meta): meta is ToolMeta => meta !== undefined)

  const [open, setOpen] = useState(false)
  const [lastPicked, setLastPicked] = useState(members[0]?.id)

  if (members.length === 0) return null

  const activeMember = members.find((m) => m.id === state.activeToolId)
  const shownId = activeMember?.id ?? lastPicked ?? members[0].id
  const ShownIcon = TOOL_ICONS[shownId] ?? Shapes

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            size="icon-sm"
            variant={activeMember ? "default" : "ghost"}
            aria-label={t(family.id)}
            className="relative"
          >
            <ShownIcon />
            <span
              aria-hidden
              className="pointer-events-none absolute right-0.75 bottom-0.75 h-0 w-0 border-[3px] border-transparent border-r-current border-b-current opacity-70"
            />
          </Button>
        }
      />
      <PopoverContent side="right" align="start" className="w-auto p-1">
        <div className="flex flex-col gap-1">
          {members.map((member) => (
            <IconAction
              key={member.id}
              icon={TOOL_ICONS[member.id] ?? Shapes}
              label={member.label}
              shortcut={member.shortcut?.toUpperCase()}
              side="right"
              active={state.activeToolId === member.id}
              onClick={() => {
                engine.setActiveTool(member.id)
                setLastPicked(member.id)
                setOpen(false)
              }}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
