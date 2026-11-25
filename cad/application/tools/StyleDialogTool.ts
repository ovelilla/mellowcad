import type { StyleDialog } from "../EngineState"
import { Tool } from "./Tool"

/**
 * STYLE and DIMSTYLE while their dialog shows (Text Style, Dimension Style
 * Manager), as PTYPE's does: the run lasts until the dialog closes, and every
 * change made in it joins one step U names after the command (desktop d05,
 * d07). Their buttons' macros are `'_style` and `'_dimstyle`, so they run
 * inside a command (acad.cuix ID_Style, ID_Ddim). The host draws the dialog.
 */
export class StyleDialogTool implements Tool {
  readonly transparentMacro = true

  constructor(
    readonly id: "style" | "dimstyle",
    private readonly show: (dialog: StyleDialog | null) => void,
    private readonly onStart: () => void = () => {}
  ) {}

  onActivate(): void {
    this.onStart()
    this.show(this.id === "style" ? "text" : "dimension")
  }

  onDeactivate(): void {
    this.show(null)
  }
}
