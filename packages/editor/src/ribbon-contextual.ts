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
 * and Z Direction (ARRAYPATH; docs/coverage/modify.md).
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
}
