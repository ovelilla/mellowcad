import { describe, expect, it } from "vitest"

import { p } from "../../test/builders"
import { createHarness } from "../../test/harness"
import { es } from "../locales/es"

// AutoCAD's F1 (Function Key Reference): Help for the active command, or
// Help itself with none. The host shows it; the engine says which.
describe("F1", () => {
  const helped = () => {
    const asked: (string | null)[] = []
    const h = createHarness({ help: (command) => asked.push(command) })
    return { h, asked }
  }

  it("asks for the help's start with no command running", () => {
    const { h, asked } = helped()
    expect(h.press("F1")).toBe(true)
    expect(asked).toEqual([null])
  })

  it("asks for the running command's help by its global name, in any language", () => {
    const { h, asked } = helped()
    h.command("LINE").click(p(0, 0))
    expect(h.press("F1")).toBe(true)
    expect(asked).toEqual(["LINE"])
    expect(h.state().commandLine.command).toBe("LINE")

    const spanish: (string | null)[] = []
    const s = createHarness({
      locale: es,
      help: (command) => spanish.push(command),
    })
    s.command("LINEA").click(p(0, 0))
    s.press("F1")
    expect(spanish).toEqual(["LINE"])
  })

  it("asks about a transparent command, not the one it runs inside", () => {
    const { h, asked } = helped()
    h.command("LINE").click(p(0, 0)).command("'ZOOM")
    h.press("F1")
    expect(asked).toEqual(["ZOOM"])
  })

  it("is the platform's when the host shows no help", () => {
    const h = createHarness()
    expect(h.press("F1")).toBe(false)
  })
})
