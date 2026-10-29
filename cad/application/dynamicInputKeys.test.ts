import { describe, expect, it } from "vitest"

import { createHarness, type CadHarness } from "../../test/harness"
import { p } from "../../test/builders"
import { createMText, type MTextEntity } from "../domain/entities"

/**
 * The keys of a dynamic-input field, which the drawing's `keyDown` never
 * hears: what `dynamicInputKey` takes, as the host's field hands them over.
 */

function active(cad: CadHarness) {
  const field = cad.state().dynamicInput?.fields.find((entry) => entry.active)
  if (!field) throw new Error("no active field")
  return field
}

const key = (
  cad: CadHarness,
  name: string,
  modifiers?: { shiftKey?: boolean; ctrlKey?: boolean }
) => cad.runtime.dynamicInputKey(active(cad).id, name, modifiers)

describe("a dynamic-input field's keys", () => {
  it("types a first point's comma with Tab after its X", () => {
    const cad = createHarness()
    cad.command("LINE").type("10")
    expect(key(cad, "Tab")).toBe(true)
    expect(active(cad).value).toBe("10,")
    // Once there is a comma, Tab has nothing to type.
    expect(key(cad, "Tab")).toBe(false)
  })

  it("moves between Length and Angle with Tab and Shift+Tab", () => {
    const cad = createHarness()
    cad.command("LINE").click(p(0, 0)).moveTo(p(50, 20))
    const [length, angle] = cad.state().dynamicInput!.fields
    expect(active(cad).id).toBe(length.id)
    expect(key(cad, "Tab")).toBe(true)
    expect(active(cad).id).toBe(angle.id)
    expect(key(cad, "Tab", { shiftKey: true })).toBe(true)
    expect(active(cad).id).toBe(length.id)
  })

  it("answers with Space as Enter", () => {
    const cad = createHarness()
    cad.command("LINE").click(p(0, 0)).type("@10,0")
    expect(key(cad, " ")).toBe(true)
    expect(cad.entityCount).toBe(1)
  })

  it("is the drawing's Ctrl+Z with nothing typed, the box's with text", () => {
    const cad = createHarness()
    cad.command("LINE").click(p(0, 0)).click(p(10, 0))
    cad.type("5")
    expect(key(cad, "z", { ctrlKey: true })).toBe(false)
    cad.type("")
    expect(key(cad, "z", { ctrlKey: true })).toBe(true)
    // LINE's Undo: the segment goes, the command stays.
    expect(cad.entityCount).toBe(0)
    expect(cad.activeToolId()).toBe("line")
  })

  it("cancels with Escape", () => {
    const cad = createHarness()
    cad.command("LINE")
    expect(key(cad, "Escape")).toBe(true)
    expect(cad.activeToolId()).toBe("select")
  })

  it("leaves Enter to a paragraphs box as a line break; Ctrl+Enter closes it", () => {
    const cad = createHarness({
      entities: [createMText(p(0, 0), "OLD", { height: 10, id: "M1" })],
    })
    cad.doubleClick(p(5, -5))
    expect(active(cad).kind).toBe("paragraphs")
    expect(key(cad, "Enter")).toBe(false)
    cad.type("NEW")
    expect(key(cad, "Enter", { ctrlKey: true })).toBe(true)
    expect(cad.byId<MTextEntity>("M1").contents).toBe("NEW")
  })

  it("ignores a field that is not shown", () => {
    const cad = createHarness()
    cad.command("LINE")
    expect(cad.runtime.dynamicInputKey("nothing", "Enter")).toBe(false)
    expect(cad.activeToolId()).toBe("line")
  })
})
