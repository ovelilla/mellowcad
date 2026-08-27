import { EdgeEditTool } from "./EdgeEditTool"

/**
 * AutoCAD's EXTEND: click near the end of a line to grow it along its own
 * direction until it reaches the nearest boundary. Holding **Shift** trims
 * instead, mirroring AutoCAD's on-the-fly toggle. See {@link EdgeEditTool} for
 * the shared behaviour.
 */
export class ExtendTool extends EdgeEditTool {
  readonly id = "extend"
  readonly label = "Extend"
  readonly shortcut = "e"
  protected readonly defaultMode = "extend" as const
}
