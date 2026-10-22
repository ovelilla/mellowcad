import { describe, expect, it } from "vitest"

import { createHarness } from "../../test/harness"
import { lineOf, p } from "../../test/builders"
import type { LineEntity } from "../domain/entities"
import { es } from "../locales/es"
import type { ShortcutMenuEntry, ShortcutMenuUi } from "./EngineState"
import { SnapType } from "./snapping/types"

/**
 * The right button on the drawing, as AutoCAD answers it with SHORTCUTMENU at
 * its initial 11: the Default menu with nothing selected and no command, the
 * Edit menu with objects selected, the Command menu while the prompt offers
 * options in brackets, and Enter otherwise. The wheel button pans.
 */

const CLEAR = p(300, 300)

function entriesOf(menu: ShortcutMenuUi | null): string[] {
  const name = (entry: ShortcutMenuEntry): string =>
    entry.kind === "action"
      ? entry.action
      : entry.kind === "option"
        ? `option:${entry.option.label}`
        : entry.kind === "submenu"
          ? `${entry.submenu}(${entry.entries.map(name).join(",")})`
          : "snapOverrides"
  return (menu?.groups ?? []).map((group) => group.map(name).join(" "))
}

describe("the right button", () => {
  it("no longer pans: the wheel button does", () => {
    const cad = createHarness()
    const before = cad.toScreen(p(0, 0))

    cad.drag(p(0, 0), p(60, 0), { button: 2 })
    expect(cad.toScreen(p(0, 0))).toBeCloseToPoint(before)

    cad.escape().drag(p(0, 0), p(60, 0), { button: 1 })
    expect(cad.toScreen(p(0, 0)).x).toBeCloseTo(before.x + 60)
    expect(cad.entityCount).toBe(0)
  })

  it("opens nothing on the press, only on the release", () => {
    const cad = createHarness()

    cad.mouseDown(CLEAR, { button: 2 })
    expect(cad.state().shortcutMenu).toBeNull()

    cad.mouseUp(CLEAR, { button: 2 })
    expect(cad.state().shortcutMenu?.mode).toBe("default")
    expect(cad.state().shortcutMenu?.at).toBeCloseToPoint(cad.toScreen(CLEAR))
  })
})

describe("the Default menu", () => {
  it("offers Repeat for the last command, and repeats it", () => {
    const cad = createHarness()
    cad.command("LINE").click(p(0, 0)).click(p(100, 0)).escape()

    cad.rightClick(CLEAR)
    const menu = cad.state().shortcutMenu
    expect(menu?.mode).toBe("default")
    expect(menu?.repeat).toBe("LINE")
    expect(entriesOf(menu)).toEqual([
      "repeat",
      "clipboard(cut,copy,copyBase,paste)",
      "undo redo pan",
    ])

    cad.runtime.chooseShortcutMenuAction("repeat")
    expect(cad.state().shortcutMenu).toBeNull()
    expect(cad.activeToolId()).toBe("line")
    expect(cad.commandLog().filter((line) => line === "LINE")).toHaveLength(2)
  })

  it("has no Repeat before the first command", () => {
    const cad = createHarness()

    cad.rightClick(CLEAR)
    expect(entriesOf(cad.state().shortcutMenu)[0]).toBe(
      "clipboard(cut,copy,copyBase,paste)"
    )
  })

  it("runs its entries as their commands: Undo is U, one step back", () => {
    const cad = createHarness()
    cad.command("LINE").click(p(0, 0)).click(p(100, 0)).escape()

    cad.rightClick(CLEAR)
    cad.runtime.chooseShortcutMenuAction("undo")

    expect(cad.entityCount).toBe(0)
    expect(cad.commandLog().slice(-2)).toEqual(["U", "LINE"])
  })

  it("starts PAN from Pan", () => {
    const cad = createHarness()

    cad.rightClick(CLEAR)
    cad.runtime.chooseShortcutMenuAction("pan")
    expect(cad.activeToolId()).toBe("pan")
  })
})

describe("the Edit menu", () => {
  it("opens with objects selected and acts on them", () => {
    const cad = createHarness({
      entities: [
        lineOf(p(0, 0), p(100, 0), { id: "A" }),
        lineOf(p(0, 50), p(100, 50), { id: "B" }),
      ],
    })
    cad.select("A")

    cad.rightClick(CLEAR)
    const menu = cad.state().shortcutMenu
    expect(menu?.mode).toBe("edit")
    expect(entriesOf(menu)).toEqual([
      "clipboard(cut,copy,copyBase,paste)",
      "erase move copySelection scale rotate deselectAll",
      "properties",
    ])

    cad.runtime.chooseShortcutMenuAction("erase")
    expect(cad.entities().map((entity) => entity.id)).toEqual(["B"])

    cad.undo()
    expect(cad.entityCount).toBe(2)
  })

  it("deselects everything with Deselect All", () => {
    const cad = createHarness({ entities: [lineOf(p(0, 0), p(100, 0))] })
    cad.selectAll()

    cad.rightClick(CLEAR)
    cad.runtime.chooseShortcutMenuAction("deselectAll")
    expect(cad.selectedIds()).toEqual([])
  })

  it("opens the Properties palette", () => {
    const cad = createHarness({ entities: [lineOf(p(0, 0), p(100, 0))] })
    cad.selectAll()
    cad.runtime.setPaletteOpen(false)

    cad.rightClick(CLEAR)
    cad.runtime.chooseShortcutMenuAction("properties")
    expect(cad.state().palette).toEqual({ open: true, tab: "properties" })
  })
})

describe("during a command", () => {
  it("opens the Command menu where the prompt offers options, and its Enter ends LINE", () => {
    const cad = createHarness()
    cad.command("LINE").click(p(0, 0)).click(p(100, 0))

    cad.rightClick(CLEAR)
    const menu = cad.state().shortcutMenu
    expect(menu?.mode).toBe("command")
    expect(entriesOf(menu)).toEqual([
      "enter cancel",
      "option:Undo",
      "snapOverrides",
    ])

    cad.runtime.chooseShortcutMenuAction("enter")
    expect(cad.activeToolId()).toBe("select")
    expect(cad.only<LineEntity>("line").end).toBeCloseToPoint(p(100, 0))
  })

  it("offers Snap Overrides only where the question takes a point", () => {
    const cad = createHarness({ entities: [lineOf(p(0, 0), p(100, 0))] })

    // desktop offset/d04-1: the distance, which two points measure.
    cad.command("OFFSET")
    cad.rightClick(CLEAR)
    expect(entriesOf(cad.state().shortcutMenu)).toEqual([
      "enter cancel",
      "option:Through option:Erase option:Layer",
      "snapOverrides",
    ])

    // desktop offset/d04-2: `Select object to offset` takes none.
    cad.escape().type("20").enter()
    cad.rightClick(CLEAR)
    expect(entriesOf(cad.state().shortcutMenu)).toEqual([
      "enter cancel",
      "option:Exit option:Undo",
    ])
  })

  it("lists the prompt's options with its words, and runs the one chosen", () => {
    const cad = createHarness()
    cad.command("LINE").click(p(0, 0)).click(p(100, 0)).click(p(100, 100))

    cad.rightClick(CLEAR)
    expect(entriesOf(cad.state().shortcutMenu)[1]).toBe(
      "option:Close option:Undo"
    )

    cad.runtime.chooseShortcutMenuOption("Close")
    expect(cad.activeToolId()).toBe("select")
    expect(cad.typeCounts()).toEqual({ line: 3 })
  })

  it("words the options in the command language", () => {
    const cad = createHarness({ locale: es })
    cad.command("LINEA").click(p(0, 0)).click(p(100, 0)).click(p(100, 100))

    cad.rightClick(CLEAR)
    expect(entriesOf(cad.state().shortcutMenu)[1]).toBe(
      "option:Cerrar option:desHacer"
    )
    cad.runtime.chooseShortcutMenuOption("Undo")
    expect(cad.entityCount).toBe(1)
  })

  it("is Enter at a prompt without options: LINE continues from the last line", () => {
    const cad = createHarness({ entities: [lineOf(p(0, 0), p(100, 0))] })
    cad.command("LINE")

    cad.rightClick(CLEAR)
    expect(cad.state().shortcutMenu).toBeNull()
    cad.click(p(100, 100)).escape()

    const drawn = cad.latest() as LineEntity
    expect(drawn.start).toBeCloseToPoint(p(100, 0))
    expect(drawn.end).toBeCloseToPoint(p(100, 100))
  })

  it("submits what is typed in the dynamic input, as Enter there would", () => {
    const cad = createHarness()
    cad.command("LINE").type("10,10")

    cad.rightClick(CLEAR)
    cad.click(p(100, 10)).escape()
    expect(cad.only<LineEntity>("line").start).toBeCloseToPoint(p(10, 10))
  })

  it("confirms ERASE's selection at Select objects", () => {
    const cad = createHarness({
      entities: [
        lineOf(p(0, 0), p(100, 0), { id: "A" }),
        lineOf(p(0, 50), p(100, 50), { id: "B" }),
      ],
    })
    cad.command("ERASE").click(p(50, 0))

    cad.rightClick(CLEAR)
    expect(cad.state().shortcutMenu).toBeNull()
    expect(cad.entities().map((entity) => entity.id)).toEqual(["B"])
    expect(cad.activeToolId()).toBe("select")
  })

  it("confirms MOVE's selection, then asks for the base point", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "A" })],
    })
    cad.command("MOVE").click(p(50, 0))

    cad.rightClick(CLEAR)
    expect(cad.state().shortcutMenu).toBeNull()
    cad.click(p(0, 0)).click(p(0, 40))

    expect(cad.byId<LineEntity>("A").start).toBeCloseToPoint(p(0, 40))
  })

  it("ends the command with Cancel", () => {
    const cad = createHarness()
    cad.command("LINE").click(p(0, 0)).click(p(100, 0))

    cad.rightClick(CLEAR)
    cad.runtime.chooseShortcutMenuAction("cancel")
    expect(cad.activeToolId()).toBe("select")
    expect(cad.entityCount).toBe(1)
  })

  it("forces an object snap for the next point from Snap Overrides", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0))],
      snap: true,
    })
    cad.command("LINE").click(p(0, 100)).click(p(0, 200))

    cad.rightClick(CLEAR)
    cad.runtime.setSnapOverride(SnapType.Nearest)
    expect(cad.state().shortcutMenu).toBeNull()
    expect(cad.state().snapOverride).toBe(SnapType.Nearest)

    cad.click(p(30, 3)).escape()
    expect((cad.latest() as LineEntity).end).toBeCloseToPoint(p(30, 0))
  })
})

describe("closing the menu", () => {
  it("leaves the command running on Escape", () => {
    const cad = createHarness()
    cad.command("LINE").click(p(0, 0)).click(p(100, 0))

    cad.rightClick(CLEAR).escape()
    expect(cad.state().shortcutMenu).toBeNull()
    expect(cad.activeToolId()).toBe("line")
  })

  it("takes the press that dismisses it, which places no point", () => {
    const cad = createHarness()
    cad.command("LINE").click(p(0, 0)).click(p(100, 0))

    cad.rightClick(CLEAR).click(p(200, 0))
    expect(cad.state().shortcutMenu).toBeNull()
    expect(cad.entityCount).toBe(1)
    expect(cad.activeToolId()).toBe("line")
  })

  it("gives focus back to the drawing", () => {
    const cad = createHarness()
    cad.rightClick(CLEAR)
    const before = cad.host.focusCount

    cad.escape()
    expect(cad.host.focusCount).toBeGreaterThan(before)
  })
})

describe("Shift+right-click", () => {
  it("still opens the object-snap override menu at a point prompt, on the press", () => {
    const cad = createHarness()
    cad.command("LINE")

    cad.mouseDown(CLEAR, { button: 2, shiftKey: true })
    expect(cad.state().snapOverrideMenu).toBeCloseToPoint(cad.toScreen(CLEAR))
    cad.mouseUp(CLEAR, { button: 2, shiftKey: true })
    expect(cad.state().shortcutMenu).toBeNull()
  })
})
