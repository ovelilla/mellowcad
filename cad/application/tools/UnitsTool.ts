import { Tool } from "./Tool"

/**
 * UNITS while its Drawing Units dialog shows: the dialog is modal, so the
 * run lasts until it closes (`setUnitsDialog(false)`), one step U names UNITS
 * with OK's change in it, an unchanged OK too (probes workspace/p307–p309),
 * and `'UNITS` resumes the command it interrupted only then (p303,
 * WORKSPACE-D61). The host draws the dialog; `show` opens and closes it.
 */
export class UnitsTool implements Tool {
  readonly id = "units"

  constructor(private readonly show: (open: boolean) => void) {}

  onActivate(): void {
    this.show(true)
  }

  onDeactivate(): void {
    this.show(false)
  }
}
