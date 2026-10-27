import type { Viewport, ViewState } from "../Viewport"
import { Command } from "./Command"

/** A unit direction's components, apart by rounding only. */
const DIRECTION_TOLERANCE = 1e-9

/**
 * What a command did to the view — ZOOM, PAN, -VIEW, VPOINT, PLAN, a ZOOM
 * typed inside LINE —, which U takes back and REDO does again with the ZOOM
 * Previous list as it was (AutoCAD 2027's console, probes view/p336–p344,
 * p362, p363). It brings nothing into the drawing.
 */
export class ViewChangeCommand implements Command {
  readonly label = "view-change"

  constructor(
    private readonly viewport: Viewport,
    readonly before: ViewState,
    readonly after: ViewState
  ) {}

  execute(): void {
    this.viewport.restoreView(this.after)
  }

  undo(): void {
    this.viewport.restoreView(this.before)
  }

  mapEntities(): Command {
    return this
  }

  /** This change and `next` as one, as UNDO Combine joins consecutive ZOOMs. */
  then(next: ViewChangeCommand): ViewChangeCommand {
    return new ViewChangeCommand(this.viewport, this.before, next.after)
  }

  /**
   * Whether its line of sight differs before and after, which U and REDO
   * regenerate for (probes view/p337, p339, p349, p350).
   */
  turns(): boolean {
    const a = this.before.camera.direction
    const b = this.after.camera.direction
    return (
      Math.abs(a.x - b.x) > DIRECTION_TOLERANCE ||
      Math.abs(a.y - b.y) > DIRECTION_TOLERANCE ||
      Math.abs(a.z - b.z) > DIRECTION_TOLERANCE
    )
  }
}
