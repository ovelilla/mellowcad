import { CadDocument } from "../domain/Document"
import {
  assignDimStyle,
  assignTextStyle,
  Entity,
  EntityId,
} from "../domain/entities"
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
import { Command, CommandHistory } from "./commands/Command"
import { UpdateEntitiesCommand } from "./commands/entityCommands"
import {
  RemoveTextStyleCommand,
  SetCurrentTextStyleCommand,
  UpdateTextStyleCommand,
} from "./commands/textStyleCommands"

/** Why a style's new name is refused: another style of the table has it. */
export type StyleNameRefusal = "inUse"

/** Whether two names are one, compared as AutoCAD compares table names (p324). */
function sameName(a: string, b: string): boolean {
  return a.toUpperCase() === b.toUpperCase()
}

/**
 * `name`, or `name (2)`… when taken: creating a style twice never overwrites
 * the first. Case-blind, as AutoCAD's tables are (`STANDARD` is Standard,
 * text/p324).
 */
function freeName(name: string, taken: readonly string[]): string {
  const free = (candidate: string) =>
    !taken.some((other) => sameName(other, candidate))
  if (free(name)) return name
  let n = 2
  while (!free(`${name} (${n})`)) n += 1
  return `${name} (${n})`
}

/**
 * A new style's name, free in the table, and its id: the name too, unless a
 * renamed style still holds that id.
 */
function newStyleIdentity(
  name: string,
  styles: ReadonlyArray<{ readonly id: string; readonly name: string }>
): { id: string; name: string } {
  const styleName = freeName(
    name,
    styles.map((style) => style.name)
  )
  return {
    id: freeName(
      styleName,
      styles.map((style) => style.id)
    ),
    name: styleName,
  }
}

/** Whether another style than `id` is named `name`, any case. */
function nameTaken(
  styles: ReadonlyArray<{ readonly id: string; readonly name: string }>,
  id: string,
  name: string
): boolean {
  return styles.some((style) => style.id !== id && sameName(style.name, name))
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
  makeCurrent: boolean,
  copyName: (base: string) => string
): DimStyleId {
  const base =
    document.getDimStyle(basedOn ?? document.getCurrentDimStyleId()) ??
    DEFAULT_DIM_STYLE
  const style: DimStyle = {
    ...base,
    ...newStyleIdentity(name ?? copyName(base.name), document.getDimStyles()),
  }
  document.addDimStyle(style)
  if (makeCurrent) document.setCurrentDimStyle(style.id)
  return style.id
}

/**
 * Applies a partial change to a dimension style — every control of the
 * Dimension Style Manager goes through this one patch. Editing a dimension
 * style is not undoable yet (the Dimensions review's). A new name another
 * style has, any case, is refused and changes nothing.
 */
export function updateDimStyle(
  document: CadDocument,
  id: DimStyleId,
  patch: Partial<Omit<DimStyle, "id">>
): StyleNameRefusal | null {
  const style = document.getDimStyle(id)
  if (!style) return null
  const name = patch.name?.trim() || style.name
  if (nameTaken(document.getDimStyles(), id, name)) return "inUse"
  document.updateDimStyle(clampDimStyle({ ...style, ...patch, name }))
  return null
}

/** Puts every selected dimension on style `id`: one step. */
export function setSelectionDimStyle(
  document: CadDocument,
  ids: readonly EntityId[],
  history: CommandHistory,
  id: DimStyleId
): void {
  if (!document.getDimStyle(id)) return
  const changed = ids
    .map((entityId) => document.get(entityId))
    .filter(
      (entity): entity is Entity =>
        entity?.type === "dimension" && entity.styleId !== id
    )
    .map((entity) => assignDimStyle(entity, id))
  if (changed.length > 0) history.execute(new UpdateEntitiesCommand(changed))
}

/**
 * A text style copied from `basedOn`, not yet in the table. Unnamed, it is
 * the first free `style1`, `style2`… the Text Style dialog's New… proposes
 * (desktop d07-2; table 9391).
 */
export function newTextStyle(
  document: CadDocument,
  name: string | undefined,
  basedOn: TextStyleId | undefined,
  defaultName: (n: number) => string
): TextStyle {
  const base =
    document.getTextStyle(basedOn ?? document.getCurrentTextStyleId()) ??
    createDefaultTextStyle()
  const styles = document.getTextStyles()
  let n = 1
  while (
    name === undefined &&
    styles.some((style) => sameName(style.name, defaultName(n)))
  ) {
    n += 1
  }
  return { ...base, ...newStyleIdentity(name ?? defaultName(n), styles) }
}

/**
 * Applies a partial change to a text style through `execute`, one step. A
 * height of 0 is meaningful: AutoCAD's "if you enter 0.0, the text height
 * defaults to the last text height used", which is why TEXT prompts for one.
 * A new name another style has, any case, is refused and changes nothing
 * (text/p323); a change of nothing makes no step.
 */
export function updateTextStyle(
  document: CadDocument,
  execute: (command: Command) => void,
  id: TextStyleId,
  patch: Partial<Omit<TextStyle, "id">>
): StyleNameRefusal | null {
  const style = document.getTextStyle(id)
  if (!style) return null
  const name = patch.name?.trim() || style.name
  if (nameTaken(document.getTextStyles(), id, name)) return "inUse"
  const height = patch.height ?? style.height
  const next: TextStyle = {
    ...style,
    ...patch,
    name,
    height: Number.isFinite(height) && height >= 0 ? height : style.height,
  }
  const changed = (Object.keys(next) as (keyof TextStyle)[]).some(
    (key) => next[key] !== style[key]
  )
  if (changed) execute(new UpdateTextStyleCommand(next))
  return null
}

/** Makes `id` the current text style through `execute`, when it is not already. */
export function setCurrentTextStyle(
  document: CadDocument,
  execute: (command: Command) => void,
  id: TextStyleId
): void {
  if (id === document.getCurrentTextStyleId() || !document.getTextStyle(id)) {
    return
  }
  execute(new SetCurrentTextStyleCommand(id))
}

/** Deletes an unused text style through `execute`. Returns whether it did. */
export function removeTextStyle(
  document: CadDocument,
  execute: (command: Command) => void,
  id: TextStyleId
): boolean {
  if (!document.canRemoveTextStyle(id)) return false
  execute(new RemoveTextStyleCommand(id))
  return true
}

/** Puts every selected text object on style `id`: one step. */
export function setSelectionTextStyle(
  document: CadDocument,
  ids: readonly EntityId[],
  history: CommandHistory,
  id: TextStyleId
): void {
  if (!document.getTextStyle(id)) return
  const changed = ids
    .map((entityId) => document.get(entityId))
    .filter(
      (entity): entity is Entity =>
        (entity?.type === "text" || entity?.type === "mtext") &&
        entity.styleId !== id
    )
    .map((entity) => assignTextStyle(entity, id))
  if (changed.length > 0) history.execute(new UpdateEntitiesCommand(changed))
}
