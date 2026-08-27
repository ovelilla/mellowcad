import { EdgeEditTool } from "./EdgeEditTool"

/**
 * AutoCAD's TRIM: click a portion of a line to remove it up to its nearest
 * intersections with the surrounding geometry. Holding **Shift** extends
 * instead, mirroring AutoCAD's on-the-fly toggle. See {@link EdgeEditTool} for
 * the shared behaviour.
 */
export class TrimTool extends EdgeEditTool {
  readonly id = "trim"
  readonly label = "Trim"
  readonly shortcut = "t"
  protected readonly defaultMode = "trim" as const
}
