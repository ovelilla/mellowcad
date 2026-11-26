import {
  HOME,
  HOME_FOLD,
  SPACER,
  column,
  rows,
  tool,
  type RibbonPanel,
  type RibbonTab,
} from "./ribbon-home"

/**
 * Insert (`ribbon.mjs --tab Insert --built`): Block and Block Definition.
 * Detect and Convert, Replace, Write Block, Manage Attributes, Block Editor,
 * Set Base Point, Synchronize and the Reference, Import, Data, Linking &
 * Extraction and Location panels are not built (docs/coverage/workspace.md).
 */
export const INSERT: readonly RibbonPanel[] = [
  {
    id: "insertBlock",
    icon: "insert",
    slots: [
      { kind: "insertGallery" },
      column(
        {
          kind: "split",
          id: "insertEditAttribute",
          size: "small",
          behaviour: "followStaticText",
          text: "editAttribute",
          members: ["insertAttedit"],
        },
        { kind: "attributeDisplay", size: "small" }
      ),
    ],
  },
  {
    id: "blockDefinition",
    icon: "block",
    slots: [
      {
        kind: "split",
        id: "createBlock",
        size: "large",
        behaviour: "follow",
        members: ["createBlock"],
      },
      tool("defineAttributes", "large"),
    ],
  },
]

/**
 * Annotate (`--tab Annotate --built`): Text, Dimensions and Markup, each
 * style's list in its panel and its dialog launcher on its title bar.
 * Centerlines, Leaders, Tables and Annotation Scaling hold nothing built.
 */
export const ANNOTATE: readonly RibbonPanel[] = [
  {
    id: "text",
    icon: "mtext",
    // After Multiline Text, a sub-panel of Check Spelling, Text Align and
    // Justify, none built, and one of [Text Style list], [Find Text], [Text
    // Height], with what is built.
    slots: [
      {
        kind: "split",
        id: "annotateText",
        size: "large",
        behaviour: "follow",
        members: ["multilineText", "text"],
      },
      column({ kind: "styleList", style: "text" }),
    ],
    launcher: "textStyle",
  },
  {
    id: "dimensions",
    icon: "dimlinear",
    // Its rows: [style list, Break, Adjust Space, Jog Line], [layer combo,
    // Inspect, Update, Reassociate], [Linear ▾, Quick, Continue ▾], with
    // what is built.
    slots: [
      rows(
        [{ kind: "styleList", style: "dimension" }, tool("dimspace")],
        [tool("dimensionUpdate")],
        [
          {
            kind: "split",
            id: "dimensionsLinear",
            size: "small",
            behaviour: "follow",
            // Linear, Aligned, Angular | Arc Length, Radius, Diameter |
            // Jogged, Ordinate, with what is built.
            members: [
              "dimensionsLinear",
              "dimensionsAligned",
              "dimensionsAngular",
              null,
              "dimensionsRadius",
              "dimensionsDiameter",
            ],
          },
          {
            kind: "split",
            id: "dimensionsContinue",
            size: "small",
            behaviour: "follow",
            members: ["dimcontinue", "dimbaseline"],
          },
        ]
      ),
    ],
    launcher: "dimensionStyle",
  },
  {
    id: "markup",
    icon: "wipeout",
    slots: [tool("wipeout", "large")],
  },
]

/**
 * 3D Tools, a hidden tab of Drafting & Annotation shown here (decision 4,
 * R9): Modeling, Solid Editing and Coordinates (`--tab "3D Tools"
 * --built`). Surfaces, Mesh, Section and Selection hold nothing built.
 */
export const TOOLS_3D: readonly RibbonPanel[] = [
  {
    id: "modeling",
    icon: "box",
    slots: [
      {
        kind: "split",
        id: "solidPrimitives",
        size: "large",
        behaviour: "follow",
        // Polysolid, the eighth, is not built.
        members: [
          "box",
          "cylinder",
          "cone",
          "sphere",
          "pyramid",
          "wedge",
          "torus",
        ],
      },
      tool("extrude", "large"),
      tool("revolve", "large"),
    ],
  },
  {
    id: "solidEditing",
    icon: "filletedge",
    slots: [
      column(tool("presspull", "small"), {
        kind: "split",
        id: "edgeFillet",
        size: "small",
        behaviour: "dropDownFollow",
        members: ["filletedge", "chamferedge"],
      }),
      column(tool("slice", "small")),
      column(
        tool("union", "small"),
        tool("subtract", "small"),
        tool("intersect", "small")
      ),
    ],
    // The faces' row; the edges' (Extract, Imprint, Copy, Color) and Color
    // faces wait for SOLIDEDIT's Edge and Body (docs/coverage/modify.md).
    slideOut: [
      [
        tool("solideditextrude"),
        tool("solidedittaper"),
        tool("solideditmove"),
        tool("solideditcopy"),
        tool("solideditoffset"),
        tool("solideditrotate"),
        tool("solideditdelete"),
      ],
    ],
  },
  {
    id: "coordinates3d",
    icon: "ucsWorld",
    slots: [
      tool("world", "large"),
      {
        kind: "split",
        id: "ucsAxis",
        size: "large",
        behaviour: "follow",
        members: ["axisX", "axisY", "axisZ"],
      },
      {
        kind: "split",
        id: "ucs3Point",
        size: "large",
        behaviour: "follow",
        members: ["ucs3Point", "previous", "view3d", "ucsFace", "ucsObject"],
      },
    ],
  },
]

/**
 * View (`--tab View --built`), with its hidden Visual Styles, Coordinates and
 * Navigate shown (decision 4). Navigation Bar, Show Motion, Named Views
 * (its View Manager is a dialog not built), Model Viewports, Review,
 * History and Interface hold nothing built.
 */
export const VIEW: readonly RibbonPanel[] = [
  {
    id: "viewportTools",
    icon: "ucsIcon",
    slots: [
      { kind: "toggle", toggle: "ucsIcon", size: "large" },
      { kind: "toggle", toggle: "viewCube", size: "large" },
    ],
  },
  {
    id: "visualStyles",
    icon: "vs2dWireframe",
    slots: [rows([{ kind: "visualStyles" }])],
  },
  {
    id: "coordinates",
    icon: "ucsWorld",
    // [UCSICON ▾ | UCS Icon Properties | UCS, Named UCS, World],
    // [Rotate ▾ | Previous | Origin, Z-Axis Vector, 3 Point],
    // [Define ▾ | named UCS combo], with what is built.
    slots: [
      rows(
        [tool("ucs"), tool("ucsWorld")],
        [
          {
            kind: "split",
            id: "rotateUcs",
            size: "icon",
            behaviour: "dropDownFollow",
            text: "rotateUcs",
            members: ["ucsX", "ucsY", "ucsZ"],
          },
          SPACER,
          tool("ucsPrevious"),
          SPACER,
          tool("ucsOrigin"),
          tool("ucsZAxis"),
          tool("ucs3Point"),
        ],
        [
          {
            kind: "split",
            id: "defineUcs",
            size: "icon",
            behaviour: "dropDownFollow",
            text: "defineUcs",
            members: ["ucsView", "ucsObject", "ucsFace"],
          },
        ]
      ),
    ],
  },
  {
    id: "palettes",
    icon: "propertiesPalette",
    slots: [
      { kind: "toggle", toggle: "propertiesPalette", size: "large" },
      { kind: "toggle", toggle: "blocksPalette", size: "large" },
      rows(
        [{ kind: "toggle", toggle: "commandLine", size: "icon" }],
        [{ kind: "toggle", toggle: "layerProperties", size: "icon" }]
      ),
    ],
  },
  {
    id: "navigate",
    icon: "orbit",
    // Back and Forward (VIEWBACK, VIEWFORWARD) are not built.
    slots: [
      column(
        tool("pan", "small"),
        {
          kind: "split",
          id: "orbit",
          size: "small",
          behaviour: "follow",
          // Free Orbit and Continuous Orbit are not built.
          members: ["orbit"],
        },
        {
          kind: "split",
          id: "zoom",
          size: "small",
          behaviour: "follow",
          // Extents, Window, Previous, …, In, Out: Realtime, All, Dynamic,
          // Scale, Center and Object are not offered (zoomMenu.ts).
          members: [
            "zoomExtents",
            "zoomWindow",
            "zoomPrevious",
            "zoomIn",
            "zoomOut",
          ],
        }
      ),
    ],
  },
]

/**
 * The tabs in Drafting & Annotation's order — Home, Insert, Annotate,
 * Parametric, 3D Tools, Visualize, View, … — with only those holding
 * something built (decision 3).
 */
export const RIBBON_TABS: readonly RibbonTab[] = [
  { id: "home", panels: HOME, fold: HOME_FOLD },
  { id: "insert", panels: INSERT },
  { id: "annotate", panels: ANNOTATE },
  { id: "tools3d", panels: TOOLS_3D },
  { id: "view", panels: VIEW },
]
