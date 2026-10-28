import { systemVariableNamed } from "../systemVariables"
import { type SetvarMemory, SystemVariableTool } from "./SystemVariableTool"

/**
 * AUPREC typed by its name, a command here so that the landing files it:
 * `Enter new value for AUPREC <0>:`, the decimal places every angle is
 * written with — a prompt's `<90>`, DIST's `Angle in XY Plane = 45` — apart
 * from lengths' (LUPREC), "0 to 8 decimal places" (probes workspace/p100,
 * p132, p133).
 */
export class AuPrecTool extends SystemVariableTool {
  constructor(memory?: SetvarMemory) {
    super(memory, systemVariableNamed("AUPREC")!, "auprec")
  }
}
