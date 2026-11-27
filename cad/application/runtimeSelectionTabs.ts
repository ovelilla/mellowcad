import { CadDocument } from "../domain/Document"
import {
  applyEntityProperty,
  insertReflects,
  type ArrayParameters,
  type EntityId,
  type EntityProperty,
  type HatchEntity,
  type InsertEntity,
} from "../domain/entities"
import {
  arrayPlacement,
  pathArrayCount,
  pathArraySpacing,
  placedLength,
} from "../domain/arrayEdits"
import { polarAngleBetween } from "../domain/arrays"
import { isSolidHatchPattern } from "../domain/hatchPatterns"
import { parseAngleDegrees, parseNumber } from "../domain/units"
import { CommandHistory } from "./commands/Command"
import { UpdateEntityCommand } from "./commands/entityCommands"
import type { ContextualEdit, ContextualFieldId } from "./EngineState"
import type { ContextualTabSource } from "./tools/Tool"

/**
 * The contextual tab the selection opens at `Command:`, or null: Hatch
 * Editor with hatches only selected (AcHatchSelected), its pattern, angle
 * and scale; Array with one array reference selected, its kind's (AcContextualTabSelectorRules.xaml,
 * AcRectangularAssociativeArraySelected and its twins: `Selection.Count == 1`,
 * a block reference that is an associative array; an array here is always
 * one). Its fields are the array's Properties rows (desktop arrays/d13), each
 * Total the span its count and spacing give, as AutoCAD's tab shows it with
 * one level (sel-arr-rect: Levels 1, Between 1, Total 1). Not shown, as
 * nothing here offers them: Base Point and Options (ARRAYEDIT's), Close Array
 * (`^P_ARRAYEDIT _caNcel`), a ring's and a path's Rows and Levels, a path's
 * Total and Z Direction, and the path's Fill entire path, which the array
 * does not keep here (docs/coverage/modify.md, ARRAY).
 */
export function selectionContextualTab(
  document: CadDocument,
  ids: readonly EntityId[]
): ContextualTabSource | null {
  const hatch = selectedHatches(document, ids)[0]
  if (hatch) {
    const solid = isSolidHatchPattern(hatch.patternId)
    // The first hatch's values where several differ (**unverified**: what
    // AutoCAD's boxes show then).
    return {
      id: "hatchEditor",
      fields: [
        {
          id: "hatchAngle",
          value: (hatch.patternAngle * 180) / Math.PI,
          kind: "angle",
          disabled: solid,
        },
        {
          id: "hatchScale",
          value: hatch.patternScale,
          kind: "factor",
          disabled: solid,
        },
      ],
      pattern: hatch.patternId,
    }
  }
  const insert = selectedArray(document, ids)
  if (!insert) return null
  const array = insert.array
  const place = arrayPlacement(insert, document.blockLookup()(insert.blockId))
  const scaled = (value: number) => placedLength(place, value)
  switch (array.kind) {
    case "rectangular":
      return {
        id: "arraySelectionRectangular",
        fields: [
          { id: "columns", value: array.columns, kind: "count" },
          ...spans("column", array.columns, scaled(array.colSpacing)),
          { id: "rows", value: array.rows, kind: "count" },
          ...spans("row", array.rows, scaled(array.rowSpacing)),
          {
            id: "rowElevation",
            value: scaled(array.rowElevation),
            kind: "distance",
          },
          { id: "levels", value: array.levels, kind: "count" },
          ...spans("level", array.levels, scaled(array.levelSpacing)),
        ],
      }
    case "polar":
      return {
        id: "arraySelectionPolar",
        fields: [
          { id: "items", value: array.items, kind: "count" },
          {
            id: "angleBetween",
            value: polarAngleBetween(array),
            kind: "angle",
          },
          { id: "fillAngle", value: array.fill, kind: "angle" },
        ],
        toggles: {
          rotateItems: array.rotate,
          // Lit counter-clockwise, as at the default fill (sel-arr-polar).
          direction: !shownClockwise(insert, array),
        },
      }
    case "path": {
      const divide = array.method === "divide"
      return {
        id: "arraySelectionPath",
        fields: [
          { id: "items", value: pathArrayCount(array), kind: "count" },
          {
            id: "itemSpacing",
            value: scaled(pathArraySpacing(array)),
            kind: "distance",
            // Divide's spacing is its share of the path, as the palette's row.
            disabled: divide,
          },
        ],
        toggles: { alignItems: array.align },
        method: array.method,
      }
    }
  }
}

/**
 * A control of the selection's Array tab acting on the array as its
 * Properties row would: one undo step U names nothing (desktop 2026-11-26,
 * sel-arr-rect-col5: `Command: _U` alone), nothing written, a value its row
 * refuses put back in silence. Whether it applied.
 */
export function editSelectionTab(
  document: CadDocument,
  ids: readonly EntityId[],
  history: CommandHistory,
  edit: ContextualEdit
): boolean {
  const insert = selectedArray(document, ids)
  if (!insert) return false
  const array = insert.array
  const change = arrayEdit(insert, array, edit)
  if (!change) return false
  const updated = applyEntityProperty(insert, change.property, change.value)
  if (!updated) return false
  history.execute(new UpdateEntityCommand(updated))
  return true
}

/**
 * What a control of the Hatch Editor types after `'_-hatchedit` on the
 * selected hatches, as AcWindows.dll's macros do (`'^R_-hatchedit\n_p\n…`,
 * read from its strings): a pattern `_p`, its name and Enter at the scale
 * and the angle (desktop sel-hatch-ansi32 writes them so); Type › Solid
 * `_p SOLID`, Type › Pattern HPLASTPATTERN as a pattern; Angle `_p`, Enter,
 * Enter and the angle; Scale `_p`, Enter, the scale and Enter, a last Enter
 * of its macro left out (**unverified** where it goes: it would repeat the
 * command at `Command:`). A value its box refuses (`abc`, a scale of 0) types
 * nothing, the box showing the value again. Null where the control applies
 * to none.
 */
export function hatchEditorAnswers(
  document: CadDocument,
  ids: readonly EntityId[],
  edit: ContextualEdit,
  lastPattern: string
): readonly string[] | null {
  const hatches = selectedHatches(document, ids)
  if (hatches.length === 0) return null
  if ("pattern" in edit) return ["_p", edit.pattern, "", ""]
  if ("hatchType" in edit) {
    // The type the tab shows, the first hatch's.
    const solid = isSolidHatchPattern(hatches[0].patternId)
    if (edit.hatchType === "solid") return solid ? null : ["_p", "SOLID"]
    return solid ? ["_p", lastPattern, "", ""] : null
  }
  if (!("field" in edit)) return null
  const text = edit.text.trim()
  if (edit.field === "hatchAngle") {
    return parseAngleDegrees(text) === null ? null : ["_p", "", "", text]
  }
  if (edit.field === "hatchScale") {
    const scale = parseNumber(text)
    return scale === null || !(scale > 0) ? null : ["_p", "", text, ""]
  }
  return null
}

/**
 * The hatches of a selection made of hatches only, as AcHatchSelected asks
 * (`Selection.Count >= 1 && Selection.ContainsOnly("Hatch")`), else none.
 */
function selectedHatches(
  document: CadDocument,
  ids: readonly EntityId[]
): HatchEntity[] {
  const entities = ids.map((id) => document.get(id))
  return entities.length > 0 &&
    entities.every((entity) => entity?.type === "hatch")
    ? (entities as HatchEntity[])
    : []
}

type ArrayInsert = InsertEntity & { readonly array: ArrayParameters }

function selectedArray(
  document: CadDocument,
  ids: readonly EntityId[]
): ArrayInsert | null {
  if (ids.length !== 1) return null
  const entity = document.get(ids[0])
  return entity?.type === "insert" && entity.array
    ? (entity as ArrayInsert)
    : null
}

/** Between and Total of a grid's columns, rows or levels. */
function spans(
  along: "column" | "row" | "level",
  count: number,
  spacing: number
): ContextualTabSource["fields"] {
  return [
    { id: `${along}Spacing`, value: spacing, kind: "distance" },
    {
      id: `${along}Total`,
      value: Math.max(count - 1, 1) * spacing,
      kind: "distance",
    },
  ]
}

/** Clockwise as the drawing shows it: a mirrored reference turns the other way. */
function shownClockwise(
  insert: InsertEntity,
  array: Extract<ArrayParameters, { kind: "polar" }>
): boolean {
  return array.clockwise !== insertReflects(insert)
}

const FIELD_PROPERTY: Readonly<
  Partial<Record<ContextualFieldId, EntityProperty>>
> = {
  columns: "arrayColumns",
  columnSpacing: "arrayColumnSpacing",
  rows: "arrayRows",
  rowSpacing: "arrayRowSpacing",
  rowElevation: "arrayRowElevation",
  levels: "arrayLevels",
  levelSpacing: "arrayLevelSpacing",
  items: "arrayItems",
  angleBetween: "arrayAngleBetween",
  fillAngle: "arrayFillAngle",
  itemSpacing: "arrayItemSpacing",
}

/** A Total's spacing row and the count it spans. */
const TOTALS: Readonly<
  Partial<
    Record<
      ContextualFieldId,
      {
        readonly property: EntityProperty
        readonly count: "columns" | "rows" | "levels"
      }
    >
  >
> = {
  columnTotal: { property: "arrayColumnSpacing", count: "columns" },
  rowTotal: { property: "arrayRowSpacing", count: "rows" },
  levelTotal: { property: "arrayLevelSpacing", count: "levels" },
}

/** The Properties row an edit retypes and its value, or null where none applies. */
function arrayEdit(
  insert: ArrayInsert,
  array: ArrayParameters,
  edit: ContextualEdit
): { readonly property: EntityProperty; readonly value: number } | null {
  if ("method" in edit) {
    return array.kind === "path"
      ? { property: "arrayMethod", value: edit.method === "measure" ? 1 : 0 }
      : null
  }
  if ("toggle" in edit) {
    if (array.kind === "polar" && edit.toggle === "rotateItems") {
      return { property: "arrayRotateItems", value: array.rotate ? 0 : 1 }
    }
    if (array.kind === "polar" && edit.toggle === "direction") {
      const clockwise = shownClockwise(insert, array)
      return { property: "arrayClockwise", value: clockwise ? 0 : 1 }
    }
    if (array.kind === "path" && edit.toggle === "alignItems") {
      return { property: "arrayAlignItems", value: array.align ? 0 : 1 }
    }
    return null
  }
  if (!("field" in edit)) return null
  const value = parseNumber(edit.text.trim())
  if (value === null) return null
  const total = TOTALS[edit.field]
  if (total && array.kind === "rectangular") {
    return {
      property: total.property,
      value: value / Math.max(array[total.count] - 1, 1),
    }
  }
  const property = FIELD_PROPERTY[edit.field]
  return property ? { property, value } : null
}
