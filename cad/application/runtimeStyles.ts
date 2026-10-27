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
import { newStyleIdentity, sameStyleName } from "../domain/styleNames"
import {
  createDefaultTextStyle,
  TextStyle,
  TextStyleId,
} from "../domain/textStyles"
import { Command, CommandHistory } from "./commands/Command"
import {
  RemoveDimStyleCommand,
  SetCurrentDimStyleCommand,
  UpdateDimStyleCommand,
} from "./commands/dimStyleCommands"
import { UpdateEntitiesCommand } from "./commands/entityCommands"
import {
  RemoveTextStyleCommand,
  SetCurrentTextStyleCommand,
  UpdateTextStyleCommand,
} from "./commands/textStyleCommands"

/** Why a style's new name is refused: another style of the table has it. */
export type StyleNameRefusal = "inUse"

/** Whether another style than `id` is named `name`, any case. */
function nameTaken(
  styles: ReadonlyArray<{ readonly id: string; readonly name: string }>,
  id: string,
  name: string
): boolean {
  return styles.some(
    (style) => style.id !== id && sameStyleName(style.name, name)
  )
}

/**
 * A dimension style copied from `basedOn`, not yet in the table — AutoCAD's
 * Create New Dimension Style dialog, which names the style and "sets a style
 * to use as a basis for the new one".
 */
export function newDimStyle(
  document: CadDocument,
  name: string | undefined,
  basedOn: DimStyleId | undefined,
  copyName: (base: string) => string
): DimStyle {
  const base =
    document.getDimStyle(basedOn ?? document.getCurrentDimStyleId()) ??
    DEFAULT_DIM_STYLE
  return {
    ...base,
    ...newStyleIdentity(name ?? copyName(base.name), document.getDimStyles()),
  }
}

/**
 * Applies a partial change to a dimension style through `execute`, one step
 * — every control of the Dimension Style Manager goes through this one patch.
 * A new name another style has, any case, is refused and changes nothing; a
 * change of nothing makes no step.
 */
export function updateDimStyle(
  document: CadDocument,
  execute: (command: Command) => void,
  id: DimStyleId,
  patch: Partial<Omit<DimStyle, "id">>
): StyleNameRefusal | null {
  const style = document.getDimStyle(id)
  if (!style) return null
  const name = patch.name?.trim() || style.name
  if (nameTaken(document.getDimStyles(), id, name)) return "inUse"
  const next = clampDimStyle({ ...style, ...patch, name })
  const changed = (Object.keys(next) as (keyof DimStyle)[]).some(
    (key) => next[key] !== style[key]
  )
  if (changed) execute(new UpdateDimStyleCommand(next))
  return null
}

/** Makes `id` the current dimension style through `execute`, when it is not already. */
export function setCurrentDimStyle(
  document: CadDocument,
  execute: (command: Command) => void,
  id: DimStyleId
): void {
  if (id === document.getCurrentDimStyleId() || !document.getDimStyle(id)) {
    return
  }
  execute(new SetCurrentDimStyleCommand(id))
}

/** Deletes an unused dimension style through `execute`. Returns whether it did. */
export function removeDimStyle(
  document: CadDocument,
  execute: (command: Command) => void,
  id: DimStyleId
): boolean {
  if (!document.canRemoveDimStyle(id)) return false
  execute(new RemoveDimStyleCommand(id))
  return true
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
    styles.some((style) => sameStyleName(style.name, defaultName(n)))
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
