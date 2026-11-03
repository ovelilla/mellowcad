import { afterEach, describe, expect, it, vi } from "vitest"

import { type CadHarness, createHarness } from "../../../test/harness"
import { p } from "../../../test/builders"
import type { Polyline3dEntity, PolylineEntity } from "../../domain/entities"

/** Typed at the command line and confirmed, as AutoCAD's prompt reads it. */
function answer(cad: CadHarness, ...answers: string[]): CadHarness {
  for (const text of answers) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

afterEach(() => {
  vi.useRealTimers()
})

// AutoCAD adds the polyline at its start point, so the chain drawn so far is
// an object the snaps and OTRACK see before PLINE ends (pline/p259, desktop
// pline/d13); 3DPOLY's is not (3dpoly/p79).
describe("PLINE's own segments", () => {
  it("are snapped to by an override, exactly (pline/p259)", () => {
    const cad = createHarness()
    answer(cad, "PLINE", "0,0", "100,0", "100,50")
    answer(cad, "_MID", "50,0.5", "_END", "0.5,0.5", "")

    const polyline = cad.only<PolylineEntity>("polyline")
    expect(polyline.vertices).toBeCloseToPoints(
      [p(0, 0), p(100, 0), p(100, 50), p(50, 0), p(0, 0)],
      12
    )
  })

  it("are snapped to on an arc too: its centre, end, foot and nearest point (p259)", () => {
    const cad = createHarness()
    answer(cad, "PLINE", "0,-10", "100,-10", "_A", "100,-30", "_L")
    answer(cad, "_CEN", "110,-20", "_END", "100.3,-30.3")
    answer(cad, "_PER", "50,-9.5", "_NEA", "50,-9.7", "")

    const polyline = cad.only<PolylineEntity>("polyline")
    expect(polyline.vertices).toBeCloseToPoints([
      p(0, -10),
      p(100, -10),
      p(100, -30),
      p(100, -20),
      p(100, -30),
      p(100, -10),
      p(50, -10),
    ])
    expect(polyline.bulges?.[1]).toBeCloseTo(-1, 9)
  })

  it("show the running snaps under the cursor and are tracked from (d13)", () => {
    vi.useFakeTimers()
    const cad = createHarness({ snap: true })
    cad.command("PLINE").click(p(0, 0)).click(p(100, 0)).click(p(100, 50))

    cad.moveTo(p(1, 1))
    expect(cad.state().snap).toMatchObject({ type: "endpoint" })
    vi.advanceTimersByTime(500)
    cad.moveTo(p(0.5, 50)).click(p(0.5, 50)).enter()

    expect(
      cad.only<PolylineEntity>("polyline").vertices.at(-1)
    ).toBeCloseToPoint(p(0, 50), 9)
  })

  it("are not 3DPOLY's, which finds nothing on its own chain (3dpoly/p79)", () => {
    const cad = createHarness()
    answer(cad, "3DPOLY", "0,0,0", "100,0,0", "100,50,0")
    const log = cad.commandLog().length
    answer(cad, "_MID", "50,0.5", "")

    expect(cad.commandLog().slice(log)).toContain(
      "No Midpoint found for specified point."
    )
    expect(cad.only<Polyline3dEntity>("polyline3d").vertices).toHaveLength(3)
  })
})
