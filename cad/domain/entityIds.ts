import { EntityId } from "./entityTypes"

let idCounter = 0

export function nextEntityId(): EntityId {
  idCounter += 1
  return `e${idCounter.toString(36)}-${Date.now().toString(36)}`
}
