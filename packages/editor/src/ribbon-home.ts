import type { EditorMessages } from "./locales/types"

type RibbonWords = EditorMessages["Ribbon"]
export type PanelId = keyof RibbonWords["panels"]
export type ItemId = keyof RibbonWords["items"]
type SplitText = keyof RibbonWords["splits"]

/**
 * A drop-down's behaviour, acad.cuix's own (docs/plans/autocad-ui.md, §2.3):
 * `follow` shows the member used last and runs it, `followStaticText` the
 * same under a text that stays, `noFollow` always runs its first member, and
 * `dropDownFollow` shows the member used last and only opens its list.
 */
export type SplitBehaviour =
  "follow" | "followStaticText" | "noFollow" | "dropDownFollow"

/**
 * A control's size (`LargeWithText`, `SmallWithText`, `SmallWithoutText`):
 * 72 high with a 32 px icon, or 22 high with a 16 px icon and its text, or
 * alone.
 */
export type ControlSize = "large" | "small" | "icon"

/** A drop-down's list: tool ids in acad.cuix's order, `null` its lines. */
type Members = readonly (ItemId | null)[]

export type RibbonControl =
  | { readonly kind: "tool"; readonly size: ControlSize; readonly tool: ItemId }
  | {
      readonly kind: "split"
      /** Its key in `state.ribbon.members`. */
      readonly id: string
      readonly size: ControlSize
      readonly behaviour: SplitBehaviour
      readonly members: Members
      /** `followStaticText`'s text. */
      readonly text?: SplitText
    }
  /** A ribbon button that runs a command of its own: `runRibbonButton`. */
  | {
      readonly kind: "command"
      readonly button: "textStyle" | "dimensionStyle"
    }
  /** ATTDISP's tool, under the engine's name for it. */
  | { readonly kind: "engineTool"; readonly tool: string }
  | { readonly kind: "layerProperties" }
  | { readonly kind: "layerCombo" }
  | {
      readonly kind: "propertyCombo"
      readonly property: "color" | "lineweight" | "linetype"
    }
  | { readonly kind: "insertGallery" }

/** A column of up to three small controls, one row each. */
export interface RibbonColumn {
  readonly kind: "column"
  readonly rows: readonly RibbonControl[]
}

/** The 4 px acad.cuix puts between a slide-out row's groups (its `Spacer`). */
export const SPACER = "spacer"

export interface RibbonPanel {
  readonly id: PanelId
  /** What shows before the panel's break, left to right. */
  readonly slots: readonly (RibbonControl | RibbonColumn)[]
  /** What slides out from under it: rows of small controls. */
  readonly slideOut?: readonly (readonly (RibbonControl | typeof SPACER)[])[]
  /** The title bar's dialog launcher, and the button it is. */
  readonly launcher?: "properties"
}

const tool = (id: ItemId, size: ControlSize = "icon"): RibbonControl => ({
  kind: "tool",
  size,
  tool: id,
})

const column = (...rows: RibbonControl[]): RibbonColumn => ({
  kind: "column",
  rows,
})

/**
 * The Home tab of Drafting & Annotation (`node scripts/research/ribbon.mjs
 * --tab Home --built`): its panels in order, each with what the engine has, in
 * acad.cuix's rows. Groups and View are not drawn: nothing in them is built
 * (decision 3). What each panel lacks is its entry in docs/coverage/.
 */
export const HOME: readonly RibbonPanel[] = [
  {
    id: "draw",
    slots: [
      tool("line", "large"),
      tool("polyline", "large"),
      {
        kind: "split",
        id: "circle",
        size: "large",
        behaviour: "followStaticText",
        text: "circle",
        // Less Tan, Tan, Radius and Tan, Tan, Tan, which no tool runs.
        members: ["circle", "circlediameter", null, "circle2p", "circle3p"],
      },
      {
        kind: "split",
        id: "arc",
        size: "large",
        behaviour: "followStaticText",
        text: "arc",
        // 3-Point | Start, Center, … | Start, End, … | Center, Start, … |
        // Continue, with the members a tool runs.
        members: ["arc", null, "arcsce", null, "arccse"],
      },
      column(
        {
          kind: "split",
          id: "rectangle",
          size: "icon",
          behaviour: "follow",
          members: ["rectangle", "polygon"],
        },
        {
          kind: "split",
          id: "ellipse",
          size: "icon",
          behaviour: "follow",
          members: ["ellipsecenter", "ellipse", null, "ellipsearc"],
        },
        {
          kind: "split",
          id: "hatch",
          size: "icon",
          behaviour: "follow",
          members: ["hatch"],
        }
      ),
    ],
    slideOut: [
      [
        tool("splinefit"),
        tool("splinecv"),
        SPACER,
        tool("xline"),
        tool("ray"),
        tool("point"),
        SPACER,
        tool("divide"),
        tool("measuresegments"),
      ],
      [tool("region"), SPACER, tool("wipeout"), tool("polyline3d")],
    ],
  },
  {
    id: "modify",
    slots: [
      column(
        tool("move", "small"),
        tool("copy", "small"),
        tool("stretch", "small")
      ),
      column(
        tool("rotate", "small"),
        tool("mirror", "small"),
        tool("scale", "small")
      ),
      column(
        {
          kind: "split",
          id: "trim",
          size: "small",
          behaviour: "follow",
          members: ["trim", "extend"],
        },
        {
          kind: "split",
          id: "fillet",
          size: "small",
          behaviour: "follow",
          members: ["fillet", "chamfer"],
        },
        {
          kind: "split",
          id: "array",
          size: "small",
          behaviour: "followStaticText",
          text: "array",
          members: ["array", "arraypath", "arraypolar"],
        }
      ),
      column(tool("erase"), tool("explode"), tool("offset")),
    ],
    slideOut: [
      [tool("pedit"), tool("splinedit")],
      [tool("break"), tool("breakatpoint"), SPACER, tool("join")],
    ],
  },
  {
    id: "annotation",
    slots: [
      {
        kind: "split",
        id: "text",
        size: "large",
        behaviour: "followStaticText",
        text: "text",
        members: ["mtext", "text"],
      },
      column({
        kind: "split",
        id: "dimension",
        size: "small",
        behaviour: "follow",
        // Linear, Aligned, Angular | Arc Length, Radius, Diameter |
        // Ordinate, Jogged, with what is built.
        members: [
          "dimlinear",
          "dimaligned",
          "dimangular",
          null,
          "dimradius",
          "dimdiameter",
        ],
      }),
    ],
    // Each style's button; its combo comes with the style dialogs (phase 3).
    slideOut: [
      [{ kind: "command", button: "textStyle" }],
      [{ kind: "command", button: "dimensionStyle" }],
    ],
  },
  {
    id: "layers",
    slots: [{ kind: "layerProperties" }, column({ kind: "layerCombo" })],
  },
  {
    id: "block",
    slots: [
      { kind: "insertGallery" },
      column(tool("block", "small"), {
        kind: "split",
        id: "editAttributes",
        size: "small",
        behaviour: "followStaticText",
        text: "editAttributes",
        members: ["attedit"],
      }),
    ],
    // WHY ATTDISP's button where acad.cuix has the Attribute Display
    // drop-down: its three entries (ID_AttdispNo, On, Of) are ATTDISP's
    // options, which the tool asks for (docs/coverage/workspace.md).
    slideOut: [[tool("attdef"), { kind: "engineTool", tool: "attdisp" }]],
  },
  {
    id: "properties",
    slots: [
      tool("matchprop", "large"),
      column(
        { kind: "propertyCombo", property: "color" },
        { kind: "propertyCombo", property: "lineweight" },
        { kind: "propertyCombo", property: "linetype" }
      ),
    ],
    slideOut: [[tool("list", "small")]],
    launcher: "properties",
  },
  {
    id: "utilities",
    slots: [
      // WHY DIST and AREA, where the ribbon's Distance and Area run
      // MEASUREGEOM (`^C^C_MEASUREGEOM _distance`, `_area`): their prompts
      // are MEASUREGEOM's Distance and Area word for word, and MEASUREGEOM,
      // whose loop asks again after each measure, is not built
      // (docs/coverage/inquiry.md).
      {
        kind: "split",
        id: "measure",
        size: "large",
        behaviour: "followStaticText",
        text: "measure",
        members: ["measure", "measurearea"],
      },
    ],
    slideOut: [[tool("id", "small")], [tool("ptype", "small")]],
  },
  {
    id: "clipboard",
    slots: [
      {
        kind: "split",
        id: "paste",
        size: "large",
        behaviour: "noFollow",
        members: ["paste"],
      },
      column(
        {
          kind: "split",
          id: "cut",
          size: "icon",
          behaviour: "dropDownFollow",
          members: ["cutclip"],
        },
        {
          kind: "split",
          id: "copy",
          size: "icon",
          behaviour: "dropDownFollow",
          members: ["copyclip", "copybase"],
        }
      ),
    ],
  },
]

/**
 * Tools with no button on the ribbon, each typed (the views and the
 * coordinates until block 4 of the plan's §6 builds View's panels, which
 * AutoCAD's Drafting & Annotation hides).
 */
export const TYPED: ReadonlySet<string> = new Set([
  // Select has no button: it is where Escape leaves every command.
  "select",
  // MASSPROP is typed: no ribbon panel offers it, only the Inquiry toolbar
  // and the Tools menu (acad.cuix's ID_Massprop).
  "massprop",
  // CHPROP is typed: no ribbon panel offers it.
  "chprop",
  // TEXTEDIT is typed, or a double-click on a text (DBLCLKEDIT): its
  // `^C^C_textedit` is on the Text toolbar, on no panel of AutoCAD 2027.
  "textedit",
  // SOLID is typed: acad.cuix's ID_Solid is on no ribbon panel, toolbar or
  // menu of AutoCAD 2027.
  "solid",
  // 3DFACE is typed: acad.cuix's ID_3dface is on no ribbon panel of AutoCAD
  // 2027, only the menu bar's Draw > Modeling > Meshes.
  "face3d",
  // 3DMESH is typed: acad.cuix's ID_3dmesh is on no ribbon panel, toolbar or
  // menu of AutoCAD 2027.
  "mesh3d",
  // LEADER is typed: no acad.cuix macro runs it in AutoCAD 2027 (its
  // ID_Leader, "Dimension, Leader", is QLEADER's), and the ribbon's Leaders
  // panel is MLEADER's.
  "leader",
  // MINSERT is typed: no acad.cuix macro runs it in AutoCAD 2027.
  "minsert",
  // SECTION is typed: the ribbon offers SECTIONPLANE in its place.
  "section",
  // SOLIDEDIT is typed: the ribbon offers its options, as the face buttons.
  "solidedit",
  // Zoom, Pan and Orbit are the navigation bar's, the preset views the
  // viewport controls'.
  "zoom",
  "pan",
  "dashpan",
  "orbit",
  "view",
  "navvcube",
  // -DIMSTYLE is typed; the Styles palette stands in for its manager.
  "dashdimstyle",
  // DIMHORIZONTAL, DIMVERTICAL and DIMROTATED are typed: no panel offers them.
  "dimhorizontal",
  "dimvertical",
  "dimrotated",
  // UCS, UCSICON, PLAN, ELEV and VPOINT: View's Coordinates panel, which
  // block 4 builds.
  "ucs",
  "ucsicon",
  "plan",
  "elev",
  "vpoint",
  // VSCURRENT is View's Visual Styles gallery, which block 4 builds.
  "vscurrent",
  // REGEN and REGENALL are typed: no panel here offers them.
  "regen",
  "regenall",
  // FILL is typed, as AutoCAD's: no panel offers it.
  "fill",
  "ltscale",
  "auprec",
  // UNDO and MREDO are typed; the Quick Access Toolbar has Undo and Redo.
  "undo",
  "mredo",
  // SETVAR and the system variables: typed only.
  "setvar",
  // -OSNAP is typed; the status bar's Object snap menu is its chrome.
  "osnap",
  // SNAP is typed; the status bar's Snap mode button and menu are its chrome.
  "snap",
  // SPLINE is typed; Draw's slide-out runs it as Spline Fit and Spline CV.
  "spline",
  // ARRAY is typed; the Array drop-down runs the three kinds.
  "arraycommand",
  // CECOLOR, CELTYPE and CELWEIGHT are the Properties panel's combos.
  "color",
  "linetype",
  "lweight",
  // -LAYER is typed; the Layer Properties Manager is LAYER's palette.
  "dashlayer",
  // PURGE is typed: AutoCAD files it in the Application menu and the Manage
  // tab, neither of which this editor has.
  "purge",
])

/**
 * Tools the tool palette offered that Home does not hold: Annotate's
 * Dimensions panel and the 3D Tools tab, which block 4 of the plan's §6
 * builds before any push (docs/plans/autocad-ui.md). Empty once it has.
 */
export const OTHER_TABS: ReadonlySet<string> = new Set([
  "dimcontinue",
  "dimbaseline",
  "dimspace",
  "box",
  "cylinder",
  "cone",
  "sphere",
  "pyramid",
  "wedge",
  "torus",
  "extrude",
  "revolve",
  "presspull",
  "union",
  "subtract",
  "intersect",
  "slice",
  "filletedge",
  "chamferedge",
  "solideditextrude",
  "solidedittaper",
  "solideditmove",
  "solideditcopy",
  "solideditoffset",
  "solideditdelete",
  "solideditrotate",
])

/** Every tool a control of `panels` runs, by id. */
export function toolsOn(panels: readonly RibbonPanel[]): Set<string> {
  const out = new Set<string>()
  const add = (control: RibbonControl | RibbonColumn | typeof SPACER) => {
    if (control === SPACER) return
    switch (control.kind) {
      case "column":
        control.rows.forEach(add)
        break
      case "tool":
      case "engineTool":
        out.add(control.tool)
        break
      case "split":
        for (const member of control.members) if (member) out.add(member)
        break
      case "insertGallery":
        out.add("insert")
        break
    }
  }
  for (const panel of panels) {
    panel.slots.forEach(add)
    panel.slideOut?.forEach((row) => row.forEach(add))
  }
  return out
}
