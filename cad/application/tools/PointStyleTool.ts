import { Tool } from "./Tool"

/**
 * PTYPE (DDPTYPE its alias) while its Point Style dialog shows, as UNITS'
 * does: the run lasts until the dialog closes, one step U names PTYPE with
 * OK's change in it. Its button's macro is `'_ptype `, so it runs inside a
 * command (acad.cuix). The host draws the dialog (desktop point/d01).
 */
export class PointStyleTool implements Tool {
  readonly id = "ptype"
  readonly transparentMacro = true

  constructor(private readonly show: (open: boolean) => void) {}

  onActivate(): void {
    this.show(true)
  }

  onDeactivate(): void {
    this.show(false)
  }
}
