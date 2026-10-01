"use client"

import { Fragment, useState } from "react"
import {
  ArrowRightToLine,
  ChevronDown,
  CopyPlus,
  Eraser,
  Eye,
  FlipHorizontal2,
  Grid3x3,
  CircleDotDashed,
  LetterText,
  LocateFixed,
  Merge,
  type LucideIcon,
  MousePointer2,
  Move,
  Paintbrush,
  PenLine,
  Pentagon,
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
  Type,
  Waypoints,
} from "lucide-react"
import { Menu } from "@base-ui/react/menu"
import { useTranslations } from "next-intl"

import { TooltipProvider } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { CadEngine, EngineState } from "@/cad"
import { cn } from "@/lib/utils"

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
  erase: Eraser,
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
  id: LocateFixed,
}

/**
 * A family of related tools collapsed behind one slot — the ribbon's
 * drop-down, whose button shows the member last used.
 */
interface ToolFlyoutFamily {
  readonly kind: "flyout"
  /** Its name in `Editor.ToolRail.flyouts`. */
  readonly id: FlyoutId
  /** Tool ids shown inside the flyout, in order. */
  readonly members: readonly string[]
}

/** The section's expanded panel (the ribbon's slide-out): its less used tools. */
interface ExpandedPanel {
  readonly kind: "more"
  readonly members: readonly string[]
}

type FlyoutId =
  | "circle"
  | "arc"
  | "ellipse"
  | "rectangle"
  | "trim"
  | "fillet"
  | "array"
  | "text"
  | "dimension"
  | "dimchain"
  | "measure"

type SectionId = "draw" | "modify" | "annotation" | "block" | "utilities"

type PaletteItem = string | ToolFlyoutFamily | ExpandedPanel

/**
 * A section of the palette: one of the Home tab's ribbon panels, its slots in
 * the panel's reading order, two to a row.
 */
interface PaletteSection {
  readonly id: SectionId
  readonly items: readonly PaletteItem[]
  /**
   * Whether a short window folds it into one drop-down, as the ribbon's
   * "Minimize to Panel Buttons" state does.
   */
  readonly folds?: boolean
}

const flyout = (
  id: FlyoutId,
  members: readonly string[]
): ToolFlyoutFamily => ({
  kind: "flyout",
  id,
  members,
})

const more = (...members: readonly string[]): ExpandedPanel => ({
  kind: "more",
  members,
})

/**
 * The palette's structure, declared as data so adding a tool is a one-line
 * edit (or nothing at all — unlisted tools fall into a trailing group). The
 * slots follow the ribbon's Home tab, panel by panel; Continue/Baseline and
 * Adjust Space come from the Annotate tab, which this palette also stands for.
 */
const PALETTE: readonly PaletteSection[] = [
  {
    id: "draw",
    items: [
      "line",
      "polyline",
      flyout("circle", ["circle", "circlediameter", "circle2p", "circle3p"]),
      flyout("arc", ["arc", "arcsce", "arccse"]),
      flyout("rectangle", ["rectangle", "polygon"]),
      flyout("ellipse", ["ellipse", "ellipsecenter", "ellipsearc"]),
      "hatch",
      // On the ribbon Spline is in the expanded Draw panel; the palette has
      // room for it, and a drop-down of one would only add a click.
      "spline",
    ],
  },
  {
    id: "modify",
    items: [
      "move",
      "rotate",
      flyout("trim", ["trim", "extend"]),
      "erase",
      "copy",
      "mirror",
      flyout("fillet", ["fillet", "chamfer"]),
      "explode",
      "stretch",
      "scale",
      flyout("array", ["array", "arraypolar", "arraypath"]),
      "offset",
      more("breakatpoint", "join", "break"),
    ],
  },
  {
    id: "annotation",
    folds: true,
    items: [
      // The ribbon's Text split button: Multiline Text first, Single Line after.
      flyout("text", ["mtext", "text"]),
      // The Annotate tab's Dimensions drop-down, less Arc Length, Jogged and
      // Ordinate (not built); the Home tab's Linear drop-down is undocumented.
      flyout("dimension", [
        "dimlinear",
        "dimaligned",
        "dimangular",
        "dimradius",
        "dimdiameter",
      ]),
      flyout("dimchain", ["dimcontinue", "dimbaseline"]),
      more("textedit", "dimspace"),
    ],
  },
  {
    id: "block",
    folds: true,
    // The ribbon's Edit Attributes drop-down holds Single and Multiple
    // (-ATTEDIT), which is not built, so one command takes the slot.
    items: ["insert", "block", "attedit", more("attdef", "attdisp")],
  },
  {
    id: "utilities",
    folds: true,
    // The ribbon's Utilities panel keeps ID Point beside the Measure drop-down.
    items: [flyout("measure", ["measure", "measurearea"]), "id"],
  },
]

/**
 * Tools that live elsewhere in the chrome. View navigation sits with the other
 * view controls in the command bar, the way AutoCAD keeps it off the Draw and
 * Modify ribbon panels. Select and Match Properties wait there for the top bar
 * (docs/next-ui-redesign.md, phase 3). The clipboard commands are reached by
 * Ctrl+C/X/V or by name; AutoCAD's own Clipboard panel is not built yet, and a
 * Paste button that only works when something has been copied would be a poor
 * first one. UCS, UCSICON, PLAN, ELEV, VPOINT and VIEW are typed: AutoCAD's
 * Coordinates panel is hidden by default too.
 */
const RAIL_EXCLUDED = new Set([
  "select",
  "matchprop",
  "zoom",
  "pan",
  "orbit",
  "copyclip",
  "cutclip",
  "copybase",
  "paste",
  "ucs",
  "ucsicon",
  "plan",
  "elev",
  "vpoint",
  "view",
  "navvcube",
])

interface ToolMeta {
  id: string
  label: string
  shortcut?: string
}

const membersOf = (item: PaletteItem): readonly string[] =>
  typeof item === "string" ? [item] : item.members

/**
 * The tool palette, two columns of the ribbon's Home tab panels (Draw,
 * Modify, Annotation, Block, Utilities): only commands that act on the
 * drawing. A window too short for it folds the last three into a drop-down
 * each.
 */
export function ToolRail({
  engine,
  state,
}: {
  engine: CadEngine
  state: EngineState
}) {
  const metaById = new Map<string, ToolMeta>(
    state.tools.map((tool) => [tool.id, tool])
  )

  const listed = new Set(
    PALETTE.flatMap((section) => section.items.flatMap(membersOf))
  )
  // Any registered tool the layout doesn't place still shows up, so a newly
  // added tool is never silently dropped from the palette.
  const uncategorized = state.tools
    .map((tool) => tool.id)
    .filter((id) => !listed.has(id) && !RAIL_EXCLUDED.has(id))

  const slot = (item: PaletteItem, section: SectionId, key: string) => {
    if (typeof item !== "string") {
      return item.kind === "flyout" ? (
        <ToolFlyout
          key={key}
          engine={engine}
          state={state}
          family={item}
          metaById={metaById}
        />
      ) : (
        <ToolMenu
          key={key}
          engine={engine}
          state={state}
          groups={[item.members]}
          metaById={metaById}
          trigger={{ kind: "more", section }}
        />
      )
    }
    const meta = metaById.get(item)
    if (!meta) return null
    return (
      <IconAction
        key={key}
        icon={TOOL_ICONS[item] ?? Shapes}
        label={meta.label}
        shortcut={meta.shortcut?.toUpperCase()}
        size="icon-tool"
        active={state.activeToolId === item}
        onClick={() => engine.setActiveTool(item)}
      />
    )
  }

  return (
    <TooltipProvider>
      <Panel className="min-h-0 w-full flex-col gap-0 overflow-y-auto">
        {PALETTE.map((section, s) => (
          <Fragment key={section.id}>
            {s > 0 && <Separator className="my-1" />}
            <div
              className={cn(
                "grid grid-cols-2 justify-items-center gap-0.5",
                section.folds && "short:hidden"
              )}
            >
              {section.items.map((item, i) =>
                slot(item, section.id, `${section.id}-${i}`)
              )}
            </div>
            {section.folds && (
              <ToolMenu
                engine={engine}
                state={state}
                groups={groupsOf(section.items)}
                metaById={metaById}
                trigger={{ kind: "section", id: section.id }}
              />
            )}
          </Fragment>
        ))}
        {uncategorized.length > 0 && (
          <>
            <Separator className="my-1" />
            <div className="grid grid-cols-2 justify-items-center gap-0.5">
              {uncategorized.map((id) => slot(id, "utilities", id))}
            </div>
          </>
        )}
      </Panel>
    </TooltipProvider>
  )
}

/**
 * A folded section's menu lists every tool of it, the drop-downs' members
 * kept together: a run of single tools is one group, each drop-down another.
 */
function groupsOf(items: readonly PaletteItem[]): string[][] {
  const groups: string[][] = []
  let singles: string[] | null = null
  for (const item of items) {
    if (typeof item === "string") {
      if (!singles) groups.push((singles = []))
      singles.push(item)
    } else {
      singles = null
      groups.push([...item.members])
    }
  }
  return groups
}

/** The flyout corner: a small triangle that marks a slot as a drop-down. */
function FlyoutMark() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-e-0.5 bottom-0.5 h-0 w-0 border-[3px] border-transparent border-e-current border-b-current opacity-70"
    />
  )
}

/**
 * A single slot standing in for a family of related tools. The button shows
 * the active member (or the last one picked), a corner triangle marks it as a
 * flyout, and its menu lists the variants with icon, name and alias, as the
 * ribbon's drop-downs do — near-identical glyphs alone don't tell them apart.
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

  const [lastPicked, setLastPicked] = useState(members[0]?.id)

  if (members.length === 0) return null

  const activeMember = members.find((m) => m.id === state.activeToolId)
  const shownId = activeMember?.id ?? lastPicked ?? members[0].id
  const ShownIcon = TOOL_ICONS[shownId] ?? Shapes

  return (
    <Menu.Root>
      <Menu.Trigger
        render={
          <Button
            size="icon-tool"
            variant={activeMember ? "active" : "ghost"}
            aria-label={t(family.id)}
            className="relative"
          >
            <ShownIcon />
            <FlyoutMark />
          </Button>
        }
      />
      <ToolMenuPopup
        engine={engine}
        groups={[members]}
        activeId={state.activeToolId}
        onPick={setLastPicked}
      />
    </Menu.Root>
  )
}

/**
 * A menu of whole tools behind one trigger: a section's expanded panel ("▾"),
 * or a whole section folded by a short window, whose button carries the
 * icon of its first tool, as the ribbon's panel buttons do.
 */
function ToolMenu({
  engine,
  state,
  groups,
  metaById,
  trigger,
}: {
  engine: CadEngine
  state: EngineState
  groups: readonly (readonly string[])[]
  metaById: Map<string, ToolMeta>
  trigger:
    { kind: "more"; section: SectionId } | { kind: "section"; id: SectionId }
}) {
  const t = useTranslations("Editor.ToolRail")
  const metas = groups
    .map((group) =>
      group
        .map((id) => metaById.get(id))
        .filter((meta): meta is ToolMeta => meta !== undefined)
    )
    .filter((group) => group.length > 0)
  if (metas.length === 0) return null

  const active = metas.some((group) =>
    group.some((meta) => meta.id === state.activeToolId)
  )
  const FirstIcon = TOOL_ICONS[metas[0][0].id] ?? Shapes

  return (
    <Menu.Root>
      <Menu.Trigger
        render={
          trigger.kind === "more" ? (
            <Button
              size="icon-tool"
              variant={active ? "active" : "ghost"}
              aria-label={t("more", {
                section: t(`sections.${trigger.section}`),
              })}
            >
              <ChevronDown />
            </Button>
          ) : (
            <Button
              size="icon-tool"
              variant={active ? "active" : "ghost"}
              aria-label={t(`sections.${trigger.id}`)}
              className="relative hidden w-full short:inline-flex"
            >
              <FirstIcon />
              <FlyoutMark />
            </Button>
          )
        }
      />
      <ToolMenuPopup
        engine={engine}
        groups={metas}
        activeId={state.activeToolId}
      />
    </Menu.Root>
  )
}

/**
 * The palette's drop-down list, on its inline end: each tool with its icon,
 * name and alias, the running one checked.
 */
function ToolMenuPopup({
  engine,
  groups,
  activeId,
  onPick,
}: {
  engine: CadEngine
  groups: readonly (readonly ToolMeta[])[]
  activeId: string
  onPick?: (id: string) => void
}) {
  return (
    <Menu.Portal>
      <Menu.Positioner
        side="inline-end"
        align="start"
        sideOffset={6}
        className="z-50"
      >
        <Menu.Popup className="min-w-48 origin-(--transform-origin) overflow-hidden rounded-md border bg-card/90 p-1 text-popover-foreground shadow-md backdrop-blur transition-[transform,opacity] outline-none data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
          {groups.map((group, g) => (
            <Fragment key={group[0].id}>
              {g > 0 && (
                <Menu.Separator className="-mx-1 my-1 h-px bg-border" />
              )}
              <Menu.RadioGroup value={activeId}>
                {group.map((member) => {
                  const Icon = TOOL_ICONS[member.id] ?? Shapes
                  return (
                    <Menu.RadioItem
                      key={member.id}
                      value={member.id}
                      closeOnClick
                      onClick={() => {
                        engine.setActiveTool(member.id)
                        onPick?.(member.id)
                      }}
                      className="flex cursor-default items-center gap-2 rounded-sm py-1.5 ps-2 pe-2 text-sm outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-checked:bg-active/15 data-checked:text-active"
                    >
                      <Icon className="size-4 shrink-0" />
                      <span className="flex-1">{member.label}</span>
                      {member.shortcut && (
                        <kbd
                          dir="ltr"
                          className="ms-4 font-mono text-xs text-muted-foreground"
                        >
                          {member.shortcut.toUpperCase()}
                        </kbd>
                      )}
                    </Menu.RadioItem>
                  )
                })}
              </Menu.RadioGroup>
            </Fragment>
          ))}
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  )
}
