import type { ContextualTabId } from "@mellowcad/engine"

import type { RibbonPanel, RibbonTab } from "./ribbon-home"

/**
 * The close panel every Array Creation shows (ID_CloseArrayCreationPanel):
 * Close Array, the command's eXit.
 */
const CLOSE: RibbonPanel = {
  id: "arrayClose",
  icon: "arrayClose",
  slots: [{ kind: "closeContextual", text: "arrayClose" }],
}

/**
 * The contextual tabs a running command shows after the last tab
 * (`state.ribbon.contextual`), acad.cuix's RibbonTabSelectors
 * (`ribbon.mjs --contextual`, `--source <uid>`), with what the engine has
 * (decision 3). Array Creation is three tabs, one per kind
 * (RBN_01740514, RBN_01740500, RBN_01740507): not drawn, as none of their
 * commands offers them, are Base Point, Columns' and Rows' Total (ARRAYRECT),
 * Rows and Levels (ARRAYPOLAR), and Total, Rows, Levels, Tangent Direction
 * and Z Direction (ARRAYPATH; docs/coverage/modify.md). Hatch Creation
 * (RBN_01738148) has Boundaries' Pick Points and Select, Pattern, Properties'
 * Type, Angle and Scale, and Close; the rest (Remove, Recreate, the colours,
 * Transparency, Origin, Options, the slide-outs) is not built
 * (docs/coverage/draw.md, HATCH). Text Editor (ID_MText_Tab) has Style's
 * gallery and height, Paragraph's Justification and Close; Annotative, Mask,
 * Formatting, Bullets and Numbering, Line Spacing, the paragraph alignments,
 * Insert, Spell Check, Tools and Options are not built (MTEXT's Missing).
 * Hatch Editor, the selection's (RBN_01738281: hatches only selected), has
 * Pattern, Properties' Type, Angle and Scale, and Close Hatch Editor, each
 * running -HATCHEDIT on the selection as AutoCAD's does; Boundaries (Pick
 * Points, Select, Remove, Recreate), the colours, Transparency, Origin and
 * Options are not built (docs/coverage/draw.md, HATCH and -HATCHEDIT).
 * Array, the selection's (RBN_01740317, RBN_01740329, RBN_01740323), has
 * Type, the counts, spacings and Totals, a ring's Rotate Items and Direction
 * and a path's Method and Align Items: the array's Properties rows. Not drawn:
 * Base Point, Options and Close Array, ARRAYEDIT's, which does not exist
 * here; a ring's and a path's Rows and Levels, a path's Total and Z Direction
 * (docs/coverage/modify.md, ARRAY).
 */
export const CONTEXTUAL_TABS: Readonly<Record<ContextualTabId, RibbonTab>> = {
  arrayCreationRectangular: {
    id: "arrayCreationRectangular",
    text: "arrayCreation",
    panels: [
      {
        id: "arrayType",
        icon: "array",
        slots: [{ kind: "arrayType", type: "arrayRectangular" }],
      },
      {
        id: "arrayColumns",
        icon: "arrayColumns",
        // Total is not asked by ARRAYRECT's COLumns (its Missing).
        slots: [{ kind: "fields", fields: ["columns", "columnSpacing"] }],
      },
      {
        id: "arrayRows",
        icon: "arrayRows",
        slots: [{ kind: "fields", fields: ["rows", "rowSpacing"] }],
        // Incremental elevation slides out (RBN_01740160's break).
        slideOut: [[{ kind: "field", field: "rowElevation" }]],
      },
      {
        id: "arrayLevels",
        icon: "arrayLevels",
        slots: [
          {
            kind: "fields",
            fields: ["levels", "levelSpacing", "levelTotal"],
          },
        ],
      },
      {
        id: "arrayProperties",
        icon: "arrayAssociative",
        slots: [{ kind: "contextualToggle", toggle: "associative" }],
      },
      CLOSE,
    ],
  },
  arrayCreationPolar: {
    id: "arrayCreationPolar",
    text: "arrayCreation",
    panels: [
      {
        id: "arrayType",
        icon: "arraypolar",
        slots: [{ kind: "arrayType", type: "arrayPolar" }],
      },
      {
        id: "arrayItems",
        icon: "arrayItems",
        slots: [
          { kind: "fields", fields: ["items", "angleBetween", "fillAngle"] },
        ],
      },
      {
        id: "arrayProperties",
        icon: "arrayAssociative",
        slots: [
          { kind: "contextualToggle", toggle: "associative" },
          { kind: "contextualToggle", toggle: "rotateItems" },
          { kind: "contextualToggle", toggle: "direction" },
        ],
      },
      CLOSE,
    ],
  },
  arrayCreationPath: {
    id: "arrayCreationPath",
    text: "arrayCreation",
    panels: [
      {
        id: "arrayType",
        icon: "arraypath",
        slots: [{ kind: "arrayType", type: "arrayPath" }],
      },
      {
        id: "arrayItems",
        icon: "arrayItems",
        slots: [{ kind: "fields", fields: ["items", "itemSpacing"] }],
      },
      {
        id: "arrayProperties",
        icon: "arrayAssociative",
        slots: [
          { kind: "contextualToggle", toggle: "associative" },
          { kind: "pathMethod" },
          { kind: "contextualToggle", toggle: "alignItems" },
        ],
      },
      CLOSE,
    ],
  },
  arraySelectionRectangular: {
    id: "arraySelectionRectangular",
    text: "array",
    panels: [
      {
        id: "arrayType",
        icon: "array",
        slots: [{ kind: "arrayType", type: "arrayRectangular" }],
      },
      {
        id: "arrayColumns",
        icon: "arrayColumns",
        slots: [
          {
            kind: "fields",
            fields: ["columns", "columnSpacing", "columnTotal"],
          },
        ],
      },
      {
        id: "arrayRows",
        icon: "arrayRows",
        slots: [{ kind: "fields", fields: ["rows", "rowSpacing", "rowTotal"] }],
        slideOut: [[{ kind: "field", field: "rowElevation" }]],
      },
      {
        id: "arrayLevels",
        icon: "arrayLevels",
        slots: [
          {
            kind: "fields",
            fields: ["levels", "levelSpacing", "levelTotal"],
          },
        ],
      },
    ],
  },
  arraySelectionPolar: {
    id: "arraySelectionPolar",
    text: "array",
    panels: [
      {
        id: "arrayType",
        icon: "arraypolar",
        slots: [{ kind: "arrayType", type: "arrayPolar" }],
      },
      {
        id: "arrayItems",
        icon: "arrayItems",
        slots: [
          { kind: "fields", fields: ["items", "angleBetween", "fillAngle"] },
        ],
      },
      {
        id: "arrayProperties",
        icon: "arrayRotateItems",
        slots: [
          { kind: "contextualToggle", toggle: "rotateItems" },
          { kind: "contextualToggle", toggle: "direction" },
        ],
      },
    ],
  },
  arraySelectionPath: {
    id: "arraySelectionPath",
    text: "array",
    panels: [
      {
        id: "arrayType",
        icon: "arraypath",
        slots: [{ kind: "arrayType", type: "arrayPath" }],
      },
      {
        id: "arrayItems",
        icon: "arrayItems",
        slots: [{ kind: "fields", fields: ["items", "itemSpacing"] }],
      },
      {
        id: "arrayProperties",
        icon: "arrayAlignItems",
        slots: [
          { kind: "pathMethod" },
          { kind: "contextualToggle", toggle: "alignItems" },
        ],
      },
    ],
  },
  hatchCreation: {
    id: "hatchCreation",
    panels: [
      {
        id: "hatchBoundaries",
        icon: "hatchPickPoints",
        slots: [
          { kind: "hatchBoundary", boundary: "pick", size: "large" },
          {
            kind: "column",
            rows: [
              { kind: "hatchBoundary", boundary: "select", size: "small" },
            ],
          },
        ],
      },
      {
        id: "hatchPattern",
        icon: "hatch",
        slots: [{ kind: "hatchPatterns" }],
      },
      {
        id: "hatchProperties",
        icon: "hatchProperties",
        slots: [{ kind: "hatchProperties" }],
      },
      {
        id: "hatchClose",
        icon: "hatchClose",
        // Close Hatch Creation, `^M` (MM_1928): Enter.
        slots: [{ kind: "closeContextual", text: "hatchClose" }],
      },
    ],
  },
  hatchEditor: {
    id: "hatchEditor",
    panels: [
      {
        id: "hatchPattern",
        icon: "hatch",
        slots: [{ kind: "hatchPatterns" }],
      },
      {
        id: "hatchProperties",
        icon: "hatchProperties",
        slots: [{ kind: "hatchProperties" }],
      },
      {
        id: "hatchEditorClose",
        icon: "hatchEditorClose",
        // Close Hatch Editor, `^R^C^C_-HATCHEDIT _CA` (MM_1932).
        slots: [{ kind: "closeContextual", text: "hatchEditorClose" }],
      },
    ],
  },
  textEditor: {
    id: "textEditor",
    panels: [
      {
        id: "textStyle",
        icon: "textStyle",
        slots: [
          { kind: "textStyles" },
          { kind: "column", rows: [{ kind: "textHeight" }] },
        ],
      },
      {
        id: "textParagraph",
        icon: "textJustification",
        slots: [{ kind: "textJustification" }],
      },
      {
        id: "textClose",
        icon: "textClose",
        slots: [{ kind: "closeContextual", text: "textClose" }],
      },
    ],
  },
}
