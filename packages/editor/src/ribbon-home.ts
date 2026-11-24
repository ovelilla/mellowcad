import type { RibbonButton, ZoomOption } from "@mellowcad/engine"
import type { EditorMessages } from "./locales/types"

type RibbonWords = EditorMessages["Ribbon"]
export type PanelId = keyof RibbonWords["panels"]
export type ItemId = keyof RibbonWords["items"]
export type TabId = keyof RibbonWords["tabs"]
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

/** A drop-down's list: items in acad.cuix's order, `null` its lines. */
type Members = readonly (ItemId | null)[]

/**
 * A toggle with no macro of its own, lit while what it shows is (acad.cuix's
 * `Ac…ToggleButton`): View's UCS Icon and View Cube, and the palettes'.
 */
export type RibbonToggle =
  | "ucsIcon"
  | "viewCube"
  | "propertiesPalette"
  | "blocksPalette"
  | "commandLine"
  | "layerProperties"

export type RibbonControl =
  /** A button that runs its item's action (`actionOf`). */
  | { readonly kind: "tool"; readonly size: ControlSize; readonly tool: ItemId }
  | {
      readonly kind: "split"
      /** Its key in `state.ribbon.members`. */
      readonly id: string
      readonly size: ControlSize
      readonly behaviour: SplitBehaviour
      readonly members: Members
      /** `followStaticText`'s text, and a list-only one's name. */
      readonly text?: SplitText
    }
  /** A ribbon button that runs a command of its own: `runRibbonButton`. */
  | {
      readonly kind: "command"
      readonly button: "textStyle" | "dimensionStyle"
    }
  | {
      readonly kind: "toggle"
      readonly toggle: RibbonToggle
      readonly size: ControlSize
    }
  | { readonly kind: "layerProperties" }
  | { readonly kind: "layerCombo" }
  | {
      readonly kind: "propertyCombo"
      readonly property: "color" | "lineweight" | "linetype"
    }
  | { readonly kind: "insertGallery" }
  /** The Attribute Display drop-down (AcATTMODEDataBoundDropDown): ATTMODE. */
  | { readonly kind: "attributeDisplay"; readonly size: ControlSize }
  /** The Visual Styles gallery (AcVisualStyleGalleryControl): VSCURRENT. */
  | { readonly kind: "visualStyles" }

/** A column of up to three small controls, one row each. */
export interface RibbonColumn {
  readonly kind: "column"
  readonly rows: readonly RibbonControl[]
}

/**
 * A sub-panel of acad.cuix (`RibbonRowPanel`) whose rows hold several small
 * controls side by side, on the same 24 px pitch as a column's.
 */
export interface RibbonRows {
  readonly kind: "rows"
  readonly rows: readonly (readonly (RibbonControl | typeof SPACER)[])[]
}

export type RibbonSlot = RibbonControl | RibbonColumn | RibbonRows

/** The 4 px acad.cuix puts between a row's groups (its `Spacer`). */
export const SPACER = "spacer"

export interface RibbonPanel {
  readonly id: PanelId
  /** What shows before the panel's break, left to right. */
  readonly slots: readonly RibbonSlot[]
  /** What slides out from under it: rows of small controls. */
  readonly slideOut?: readonly (readonly (RibbonControl | typeof SPACER)[])[]
  /** The title bar's dialog launcher, and the button it is. */
  readonly launcher?: "properties" | "textStyle" | "dimensionStyle"
}

export interface RibbonTab {
  readonly id: TabId
  readonly panels: readonly RibbonPanel[]
}

/**
 * What an item runs that is no tool of the same id: a ribbon button of the
 * engine's (`runRibbonButton`), a member of the navigation bar's Zoom
 * (`zoom`) or its Pan and Orbit (`navigate`), each with the tool it starts,
 * so `ribbon.test.ts` can tell every tool has a button.
 */
export type RibbonAction =
  | {
      readonly kind: "button"
      readonly button: RibbonButton
      readonly tool: string
    }
  | { readonly kind: "zoom"; readonly option: ZoomOption }
  | { readonly kind: "navigate"; readonly command: "PAN" | "3DORBIT" }

const ucs = (button: RibbonButton): RibbonAction => ({
  kind: "button",
  button,
  tool: "ucs",
})

/** The actions that are no tool, by the id their icons are drawn under. */
export const ACTIONS: Readonly<Record<string, RibbonAction>> = {
  dimensionUpdate: {
    kind: "button",
    button: "dimensionUpdate",
    tool: "dashdimstyle",
  },
  ucsWorld: ucs("ucsWorld"),
  ucsPrevious: ucs("ucsPrevious"),
  ucsOrigin: ucs("ucsOrigin"),
  ucsZAxis: ucs("ucsZAxis"),
  ucs3Point: ucs("ucs3Point"),
  ucsX: ucs("ucsX"),
  ucsY: ucs("ucsY"),
  ucsZ: ucs("ucsZ"),
  ucsView: ucs("ucsView"),
  ucsObject: ucs("ucsObject"),
  ucsFace: ucs("ucsFace"),
  extrude: { kind: "button", button: "extrude", tool: "extrude" },
  revolve: { kind: "button", button: "revolve", tool: "revolve" },
  pan: { kind: "navigate", command: "PAN" },
  orbit: { kind: "navigate", command: "3DORBIT" },
  zoomExtents: { kind: "zoom", option: "extents" },
  zoomWindow: { kind: "zoom", option: "window" },
  zoomPrevious: { kind: "zoom", option: "previous" },
  zoomIn: { kind: "zoom", option: "in" },
  zoomOut: { kind: "zoom", option: "out" },
}

/**
 * Items another panel words otherwise than the action's own id, by the
 * action they run: Insert's `Create Block` is BLOCK, Home's `Create`.
 */
const ITEM_ACTIONS: Partial<Record<ItemId, string>> = {
  createBlock: "block",
  insertAttedit: "attedit",
  defineAttributes: "attdef",
  multilineText: "mtext",
  dimensionsLinear: "dimlinear",
  dimensionsAligned: "dimaligned",
  dimensionsAngular: "dimangular",
  dimensionsRadius: "dimradius",
  dimensionsDiameter: "dimdiameter",
  world: "ucsWorld",
  previous: "ucsPrevious",
  axisX: "ucsX",
  axisY: "ucsY",
  axisZ: "ucsZ",
  view3d: "ucsView",
}

/** What an item runs: a tool's id or one of `ACTIONS`. */
export function actionOf(item: ItemId): string {
  return ITEM_ACTIONS[item] ?? item
}

/** The tool an action starts. */
export function toolOfAction(action: string): string {
  const known = ACTIONS[action]
  if (!known) return action
  switch (known.kind) {
    case "button":
      return known.tool
    case "zoom":
      return "zoom"
    case "navigate":
      return known.command === "PAN" ? "pan" : "orbit"
  }
}

/** What each toggle stands for, by the tool it is the button of. */
const TOGGLE_TOOLS: Readonly<Partial<Record<RibbonToggle, string>>> = {
  ucsIcon: "ucsicon",
}

export const tool = (
  id: ItemId,
  size: ControlSize = "icon"
): RibbonControl => ({
  kind: "tool",
  size,
  tool: id,
})

export const column = (...rows: RibbonControl[]): RibbonColumn => ({
  kind: "column",
  rows,
})

export const rows = (
  ...lines: (readonly (RibbonControl | typeof SPACER)[])[]
): RibbonRows => ({ kind: "rows", rows: lines })

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
    // Replace, Manage and Synchronize Attributes and Set Base Point are not
    // built (docs/coverage/workspace.md).
    slideOut: [[tool("attdef"), { kind: "attributeDisplay", size: "icon" }]],
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

/** Tools with no button on the ribbon, each typed, with the reason. */
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
  // -PAN is typed: the ribbon's and the navigation bar's Pan are PAN's.
  "dashpan",
  // VIEW is typed: here it is -VIEW's presets (the viewport controls' menu),
  // and the ribbon's View Manager (`^C^C_view`) opens a dialog not built.
  "view",
  // NAVVCUBE is typed: View's View Cube toggle sets NAVVCUBEDISPLAY, with no
  // command (UI Automation, research/ui/2026-11-24/block4).
  "navvcube",
  // ATTDISP is typed: the Attribute Display drop-down sets ATTMODE with no
  // command (block4), where its entries' macros would run ATTDISP.
  "attdisp",
  // DIMHORIZONTAL, DIMVERTICAL and DIMROTATED are typed: no panel offers them.
  "dimhorizontal",
  "dimvertical",
  "dimrotated",
  // PLAN, ELEV and VPOINT are typed: no panel of Drafting & Annotation, its
  // hidden ones included, offers them.
  "plan",
  "elev",
  "vpoint",
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

/** Every tool a control of `panels` runs, by id. */
export function toolsOn(panels: readonly RibbonPanel[]): Set<string> {
  const out = new Set<string>()
  const item = (id: ItemId) => out.add(toolOfAction(actionOf(id)))
  const add = (control: RibbonSlot | typeof SPACER) => {
    if (control === SPACER) return
    switch (control.kind) {
      case "column":
        control.rows.forEach(add)
        break
      case "rows":
        control.rows.forEach((row) => row.forEach(add))
        break
      case "tool":
        item(control.tool)
        break
      case "toggle": {
        const tool = TOGGLE_TOOLS[control.toggle]
        if (tool) out.add(tool)
        break
      }
      case "split":
        for (const member of control.members) if (member) item(member)
        break
      case "insertGallery":
        out.add("insert")
        break
      case "visualStyles":
        out.add("vscurrent")
        break
    }
  }
  for (const panel of panels) {
    panel.slots.forEach(add)
    panel.slideOut?.forEach((row) => row.forEach(add))
  }
  return out
}
