import { Vec2 } from "../geometry/Vec2"
import { Viewport } from "./Viewport"
import { SnapEngine } from "./snapping/SnapEngine"
import {
  DynamicInputController,
  DynamicInputSession,
} from "./input/DynamicInput"
import { parseCoordinate } from "./input/coordinateInput"
import { CommandLineController } from "./CommandLine"
import { Tool, ToolContext } from "./tools/Tool"
import { EngineHost } from "./ports"

/**
 * AutoCAD's FROM modifier: the next pick becomes a base point, and the point
 * the tool actually receives is typed as an offset from it. The tool's own
 * dynamic input is parked while the offset is entered and restored after.
 */
export interface FromState {
  pending: boolean
  base: Vec2 | null
  parkedSession: DynamicInputSession | null
}

/** Consumes the base-point pick and asks for the offset instead. */
export function beginFromOffset(
  from: FromState,
  base: Vec2,
  dynamicInput: DynamicInputController,
  commandLine: CommandLineController,
  pointerScreen: Vec2 | null,
  place: (point: Vec2) => void
): void {
  from.pending = false
  from.base = base
  from.parkedSession = dynamicInput.getSession()
  dynamicInput.open({
    fields: [{ id: "offset", label: "", kind: "coordinate" }],
    commit: () => {},
    commitRaw: () => commitFromOffset(from, dynamicInput, place),
  })
  if (pointerScreen) dynamicInput.setPosition(pointerScreen)
  commandLine.write("info", "FROM: offset from the base point.")
}

function commitFromOffset(
  from: FromState,
  dynamicInput: DynamicInputController,
  place: (point: Vec2) => void
): boolean {
  const base = from.base
  if (!base) return false
  const point = parseCoordinate(dynamicInput.getText("offset").trim(), {
    lastPoint: base,
    relativeByDefault: true,
  })
  if (!point) return false
  endFrom(from, dynamicInput)
  place(point)
  return true
}

/** Leaves FROM, giving the tool back the dynamic input it had open. */
export function endFrom(
  from: FromState,
  dynamicInput: DynamicInputController
): void {
  if (!from.pending && !from.base) return
  from.pending = false
  from.base = null
  if (from.parkedSession) dynamicInput.open(from.parkedSession)
  else dynamicInput.close()
  from.parkedSession = null
}

/**
 * Feeds a point to the active tool as if it had been picked there — the
 * primitive behind any "the runtime works the point out for the tool" feature,
 * FROM being the first of them.
 */
export function placePoint(
  point: Vec2,
  activeTool: Tool,
  viewport: Viewport,
  toolContext: ToolContext,
  snapping: SnapEngine,
  resetTracking: () => void,
  host: EngineHost
): void {
  activeTool.onPointerDown?.(
    {
      screen: viewport.worldToScreen(point),
      world: point,
      snap: null,
      tracking: null,
      point,
      button: 0,
      shiftKey: false,
      ctrlKey: false,
      altKey: false,
    },
    toolContext
  )
  snapping.clearOverride()
  if (!(activeTool.retainsTrackingAfterPointerDown?.() ?? false)) {
    resetTracking()
  }
  host.requestRender()
}
