import { CadDocument } from "../domain/Document"
import { assignDimStyle, assignTextStyle } from "../domain/entities"
import {
  clampDimStyle,
  DEFAULT_DIM_STYLE,
  DimStyle,
  DimStyleId,
} from "../domain/dimStyles"
import {
  createDefaultTextStyle,
  TextStyle,
  TextStyleId,
} from "../domain/textStyles"
import { Selection } from "./Selection"
import { CommandHistory } from "./commands/Command"
import { UpdateEntityCommand } from "./commands/entityCommands"

/**
 * A style name not already taken, so creating one twice does not silently
 * overwrite the first — style names are the id here, as they are in AutoCAD,
 * where they identify the style.
 */
function uniqueStyleName(
  name: string,
  existing: ReadonlyArray<{ readonly id: string }>
): string {
  const taken = new Set(existing.map((style) => style.id))
  if (!taken.has(name)) return name
  let n = 2
  while (taken.has(`${name} (${n})`)) n += 1
  return `${name} (${n})`
}

/**
 * Creates a dimension style copied from `basedOn` — AutoCAD's Create New
 * Dimension Style dialog, which names the style and "sets a style to use as a
 * basis for the new one". Returns the new style's id.
 */
export function createDimStyle(
  document: CadDocument,
  name: string | undefined,
  basedOn: DimStyleId | undefined,
  makeCurrent: boolean
): DimStyleId {
  const base =
    document.getDimStyle(basedOn ?? document.getCurrentDimStyleId()) ??
    DEFAULT_DIM_STYLE
  const styleName = uniqueStyleName(
    name ?? `Copy of ${base.name}`,
    document.getDimStyles()
  )
  const style: DimStyle = { ...base, id: styleName, name: styleName }
  document.addDimStyle(style)
  if (makeCurrent) document.setCurrentDimStyle(style.id)
  return style.id
}

/**
 * Applies a partial change to a dimension style — every control of the
 * Dimension Style Manager goes through this one patch. Like the layer table,
 * editing a style is not undoable.
 */
export function updateDimStyle(
  document: CadDocument,
  id: DimStyleId,
  patch: Partial<Omit<DimStyle, "id">>
): void {
  const style = document.getDimStyle(id)
  if (!style) return
  document.updateDimStyle(clampDimStyle({ ...style, ...patch }))
}

/** Puts every selected dimension on style `id` (individually undoable). */
export function setSelectionDimStyle(
  document: CadDocument,
  selection: Selection,
  history: CommandHistory,
  id: DimStyleId
): void {
  if (selection.isEmpty() || !document.getDimStyle(id)) return
  for (const entityId of selection.toArray()) {
    const entity = document.get(entityId)
    if (entity?.type !== "dimension" || entity.styleId === id) continue
    history.execute(new UpdateEntityCommand(assignDimStyle(entity, id)))
  }
}

/** Creates a text style copied from `basedOn`. Returns its id. */
export function createTextStyle(
  document: CadDocument,
  name: string | undefined,
  basedOn: TextStyleId | undefined,
  makeCurrent: boolean
): TextStyleId {
  const base =
    document.getTextStyle(basedOn ?? document.getCurrentTextStyleId()) ??
    createDefaultTextStyle()
  const styleName = uniqueStyleName(
    name ?? `Copy of ${base.name}`,
    document.getTextStyles()
  )
  const style: TextStyle = { ...base, id: styleName, name: styleName }
  document.addTextStyle(style)
  if (makeCurrent) document.setCurrentTextStyle(style.id)
  return style.id
}

/**
 * Applies a partial change to a text style. A height of 0 is meaningful:
 * AutoCAD's "if you enter 0.0, the text height defaults to the last text
 * height used", which is why TEXT prompts for one.
 */
export function updateTextStyle(
  document: CadDocument,
  id: TextStyleId,
  patch: Partial<Omit<TextStyle, "id">>
): void {
  const style = document.getTextStyle(id)
  if (!style) return
  const height = patch.height ?? style.height
  document.updateTextStyle({
    ...style,
    ...patch,
    height: Number.isFinite(height) && height >= 0 ? height : style.height,
  })
}

/** Puts every selected text object on style `id` (individually undoable). */
export function setSelectionTextStyle(
  document: CadDocument,
  selection: Selection,
  history: CommandHistory,
  id: TextStyleId
): void {
  if (selection.isEmpty() || !document.getTextStyle(id)) return
  for (const entityId of selection.toArray()) {
    const entity = document.get(entityId)
    if (entity?.type !== "text" || entity.styleId === id) continue
    history.execute(new UpdateEntityCommand(assignTextStyle(entity, id)))
  }
}
