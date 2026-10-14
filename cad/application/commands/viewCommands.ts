import { sameCamera, type Viewport, type ViewState } from "../Viewport"
import { Command } from "./Command"

/**
 * What a command did to the view — ZOOM, PAN, -VIEW, VPOINT, PLAN, a ZOOM
 * typed inside LINE —, which U takes back and REDO does again with the ZOOM
 * Previous list as it was (AutoCAD 2023's console, acc/z1–z38 of the MREDO
 * session). It brings nothing into the drawing.
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

  /** Whether undoing it puts the camera elsewhere. */
  moves(): boolean {
    return !sameCamera(this.before.camera, this.after.camera)
  }
}
