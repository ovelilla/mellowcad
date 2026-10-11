import type { DocumentSettings } from "../../domain/units"
import { SystemVariableTool } from "./SystemVariableTool"

/**
 * AutoCAD's AUPREC system variable typed as a command: `Enter new value for
 * AUPREC <0>:`, the decimal places every angle is written with — a prompt's
 * `<90>`, DIST's `Angle in XY Plane = 45` — apart from lengths' (LUPREC),
 * "0 to 8 decimal places".
 */
export class AuPrecTool extends SystemVariableTool {
  readonly id = "auprec"
  protected readonly variable = "AUPREC"
  protected readonly max = 8

  protected read(settings: DocumentSettings): number {
    return settings.anglePrecision
  }

  protected settingsFor(value: number): Partial<DocumentSettings> {
    return { anglePrecision: value }
  }
}
