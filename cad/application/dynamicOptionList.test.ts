// The dynamic prompt's option list (DYN-02): AutoCAD's Down arrow at a prompt
// with options opens the list under the tooltip, each further Down moves the
// dot, Enter picks (desktop d11; help, "To Enter Coordinate Values in the
// Pointer Input Tooltip": "press the DOWN ARROW key until a dot is displayed
// next to the option. Press Enter.").
import { describe, expect, it } from "vitest"

import { createHarness } from "@/test/harness"
import { p } from "@/test/builders"

/** LINE at its third point, offering Close and Undo. */
function threePoints() {
  const cad = createHarness()
  cad.command("LINE").click(p(0, 0)).click(p(100, 0)).click(p(100, 100))
  return cad
}

const list = (cad: ReturnType<typeof createHarness>) =>
  cad.state().commandOptionList

describe("the dynamic prompt's option list", () => {
  it("opens on the first Down with no option marked, as d11 shows it", () => {
    const cad = threePoints()
    expect(list(cad)).toBeNull()
    cad.arrow("down")
    expect(list(cad)).toEqual({ marked: null })
  })

  it("Down, Down, Enter is Close", () => {
    const cad = threePoints()
    cad.arrow("down").arrow("down")
    expect(list(cad)).toEqual({ marked: "Close" })
    cad.enter()
    expect(cad.typeCounts()).toEqual({ line: 3 })
    expect(cad.activeToolId()).toBe("select")
  })

  it("a third Down marks Undo, whose Enter takes a segment back and goes on", () => {
    const cad = threePoints()
    cad.arrow("down").arrow("down").arrow("down").enter()
    expect(cad.entityCount).toBe(1)
    expect(cad.activeToolId()).toBe("line")
    expect(list(cad)).toBeNull()
  })

  it("Up and Down wrap around the list", () => {
    const cad = threePoints()
    cad.arrow("down").arrow("up")
    expect(list(cad)).toEqual({ marked: "Undo" })
    cad.arrow("down")
    expect(list(cad)).toEqual({ marked: "Close" })
  })

  it("echoes the option at the prompt as the shortcut menu's does", () => {
    const cad = threePoints()
    cad.arrow("down").arrow("down").arrow("down").enter()
    expect(cad.commandLog().at(-1)).toMatch(/\[Close\/Undo\]: _Undo$/)
  })

  it("Escape closes the list and leaves LINE running", () => {
    const cad = threePoints()
    cad.arrow("down").arrow("down").escape()
    expect(list(cad)).toBeNull()
    expect(cad.activeToolId()).toBe("line")
    expect(cad.entityCount).toBe(2)
  })

  it("Enter with the list open and nothing marked only closes it", () => {
    const cad = threePoints()
    cad.arrow("down").enter()
    expect(list(cad)).toBeNull()
    expect(cad.activeToolId()).toBe("line")
  })

  it("works the same from the drawing, through keyDown", () => {
    const cad = threePoints()
    expect(cad.press("ArrowDown")).toBe(true)
    cad.press("ArrowDown")
    cad.press("Enter")
    expect(cad.typeCounts()).toEqual({ line: 3 })
  })

  it("stays shut with a value typed, a prompt without options or text at the command line", () => {
    const cad = threePoints()
    cad.type("5").arrow("down")
    expect(list(cad)).toBeNull()

    const fresh = createHarness()
    fresh.command("LINE").arrow("down")
    expect(fresh.state().commandOptionList).toBeNull()
  })

  it("closes when a key is typed or a point picked", () => {
    const cad = threePoints()
    cad.arrow("down").arrow("down").type("1")
    expect(list(cad)).toBeNull()
    cad.type("")
    cad.arrow("down").arrow("down").click(p(0, 100))
    expect(list(cad)).toBeNull()
    expect(cad.entityCount).toBe(3)
  })

  it("leaves F12 alone: dynamic input cannot be turned off (Missing)", () => {
    const cad = threePoints()
    const log = cad.commandLog().length
    expect(cad.press("F12")).toBe(false)
    expect(cad.commandLog()).toHaveLength(log)
    cad.arrow("down")
    expect(list(cad)).toEqual({ marked: null })
  })

  it("leaves the arrows to command recall at the neutral prompt", () => {
    const cad = threePoints()
    cad.escape()
    expect(cad.press("ArrowUp")).toBe(true)
    expect(cad.state().commandLine.buffer).toBe("LINE")
    expect(list(cad)).toBeNull()
  })
})
