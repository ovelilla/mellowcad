import { Vec2 } from "../geometry/Vec2"
import { DEFAULT_LAYER_ID, LayerId } from "./layers"
import {
  DEFAULT_TEXT_HEIGHT,
  DEFAULT_TEXT_STYLE_ID,
  TextStyleId,
} from "./textStyles"
import {
  AttributeDefinitionEntity,
  AttributeDisplay,
  AttributeModes,
  BlockAttribute,
  BlockDefinition,
  EntityId,
  TextEntity,
  TextJustify,
} from "./entityTypes"
import { nextEntityId } from "./entityFactories"

/** AFLAGS' initial value, 16: only Lock position. */
export const DEFAULT_ATTRIBUTE_MODES: AttributeModes = {
  invisible: false,
  constant: false,
  verify: false,
  preset: false,
  lockPosition: true,
}

export interface AttributeDefinitionOptions {
  readonly prompt?: string
  readonly value?: string
  readonly modes?: AttributeModes
  readonly height?: number
  readonly rotation?: number
  readonly justify?: TextJustify
  readonly styleId?: TextStyleId
  readonly layerId?: LayerId
  readonly id?: EntityId
}

export function createAttributeDefinition(
  position: Vec2,
  tag: string,
  options: AttributeDefinitionOptions = {}
): AttributeDefinitionEntity {
  return {
    id: options.id ?? nextEntityId(),
    type: "attdef",
    layerId: options.layerId ?? DEFAULT_LAYER_ID,
    position: { x: position.x, y: position.y },
    height: options.height ?? DEFAULT_TEXT_HEIGHT,
    rotation: options.rotation ?? 0,
    justify: options.justify ?? "left",
    styleId: options.styleId ?? DEFAULT_TEXT_STYLE_ID,
    tag,
    prompt: options.prompt ?? "",
    value: options.value ?? "",
    modes: { ...(options.modes ?? DEFAULT_ATTRIBUTE_MODES) },
  }
}

/**
 * A tag as AutoCAD keeps it: "any characters except spaces or exclamation
 * marks (!). Lowercase letters are automatically changed to uppercase." Null
 * when what was typed cannot be one.
 */
export function attributeTag(typed: string): string | null {
  const tag = typed.trim().toUpperCase()
  return tag.length === 0 || /[\s!]/.test(tag) ? null : tag
}

/**
 * A prompt or value as typed at the command line, where leading blanks are
 * dropped: "start the string with a backslash (\) … To make the first character
 * a backslash, start the string with two backslashes."
 */
export function attributeInput(typed: string): string {
  return typed.startsWith("\\") ? typed.slice(1) : typed.trimStart()
}

/** What INSERT asks for a definition: its prompt, or its tag when it has none. */
export function attributePrompt(definition: AttributeDefinitionEntity): string {
  return definition.prompt.length > 0 ? definition.prompt : definition.tag
}

/** The definitions an insertion gives a value to, in prompt order: all but the constants. */
export function variableAttributes(
  block: BlockDefinition
): AttributeDefinitionEntity[] {
  return block.entities.filter(
    (entity): entity is AttributeDefinitionEntity =>
      entity.type === "attdef" && !entity.modes.constant
  )
}

/** A reference's attribute for `definition`, laid out exactly as the definition. */
export function blockAttribute(
  definition: AttributeDefinitionEntity,
  value: string
): BlockAttribute {
  return {
    tag: definition.tag,
    value,
    position: { x: definition.position.x, y: definition.position.y },
    ...(definition.elevation ? { elevation: definition.elevation } : {}),
    height: definition.height,
    rotation: definition.rotation,
    justify: definition.justify,
    styleId: definition.styleId,
    invisible: definition.modes.invisible,
    layerId: definition.layerId,
    ...(definition.color !== undefined ? { color: definition.color } : {}),
    ...(definition.linetype !== undefined
      ? { linetype: definition.linetype }
      : {}),
    ...(definition.lineweight !== undefined
      ? { lineweight: definition.lineweight }
      : {}),
  }
}

/** Whether ATTMODE shows an attribute that is, or is not, invisible. */
export function attributeShown(
  invisible: boolean,
  display: AttributeDisplay
): boolean {
  return display === "on" || (display === "normal" && !invisible)
}

/**
 * A definition drawn as a line of text reading `value` — its tag when it is
 * loose in the drawing, its value when a reference shows a constant one.
 */
export function attributeDefinitionText(
  definition: AttributeDefinitionEntity,
  value: string = definition.tag
): TextEntity {
  return {
    id: definition.id,
    type: "text",
    layerId: definition.layerId,
    ...(definition.color !== undefined ? { color: definition.color } : {}),
    ...(definition.linetype !== undefined
      ? { linetype: definition.linetype }
      : {}),
    ...(definition.lineweight !== undefined
      ? { lineweight: definition.lineweight }
      : {}),
    ...(definition.elevation ? { elevation: definition.elevation } : {}),
    position: definition.position,
    value,
    height: definition.height,
    rotation: definition.rotation,
    justify: definition.justify,
    styleId: definition.styleId,
  }
}

/** A reference's attribute as the text it draws, still in the block's frame. */
export function blockAttributeText(
  attribute: BlockAttribute,
  id: EntityId
): TextEntity {
  return {
    id,
    type: "text",
    layerId: attribute.layerId,
    ...(attribute.color !== undefined ? { color: attribute.color } : {}),
    ...(attribute.linetype !== undefined
      ? { linetype: attribute.linetype }
      : {}),
    ...(attribute.lineweight !== undefined
      ? { lineweight: attribute.lineweight }
      : {}),
    ...(attribute.elevation ? { elevation: attribute.elevation } : {}),
    position: attribute.position,
    value: attribute.value,
    height: attribute.height,
    rotation: attribute.rotation,
    justify: attribute.justify,
    styleId: attribute.styleId,
  }
}
