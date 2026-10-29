import { describe, expect, it } from "vitest"
import { createHarness, MemoryClipboard } from "../../../test/harness"
import { layerOf, lineOf, loopOf, p, textOf } from "../../../test/builders"
import {
  createBlockDefinition,
  createHatch,
  createInsert,
  HatchEntity,
  InsertEntity,
  LineEntity,
  lineEndZ,
  lineStartZ,
  TextEntity,
} from "../../domain/entities"
import { createTextStyle } from "../../domain/textStyles"
import { parseClipboard } from "../../serialization/clipboardFile"
import { es } from "../../locales/es"

/** Each answer typed at the command line and confirmed, as the console types it. */
function answer(cad: ReturnType<typeof createHarness>, ...texts: string[]) {
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

/** Copies `ids` through COPYCLIP, the noun→verb way a user with a selection does. */
function copy(cad: ReturnType<typeof createHarness>, ...ids: string[]) {
  return cad.select(...ids).command("COPYCLIP")
}

/** Reads the clipboard and drops the fragment at `at`. */
async function pasteAt(
  cad: ReturnType<typeof createHarness>,
  at: { x: number; y: number }
) {
  await cad.runtime.pasteFromClipboard()
  cad.click(at)
}

/** Lets the clipboard's read settle. */
function settled() {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

/** A clipboard whose read answers only when told to, what it last held. */
class LateClipboard extends MemoryClipboard {
  private pending: ((text: string | null) => void) | null = null

  read(): Promise<string | null> {
    this.readCalls += 1
    return new Promise((resolve) => {
      this.pending = resolve
    })
  }

  answer(): void {
    this.pending?.(this.text)
    this.pending = null
  }
}

describe("COPYCLIP", () => {
  it("measures the fragment from the lower-left of its extents", async () => {
    const cad = createHarness({
      entities: [lineOf(p(100, 50), p(200, 150), { id: "L1" })],
    })
    copy(cad, "L1")
    await pasteAt(cad, p(0, 0))

    // The documented rule: "the cursor location is based on the lower-left
    // corner of the extents of the objects you selected".
    const pasted = cad
      .entities()
      .find((entity) => entity.id !== "L1") as LineEntity
    expect(pasted.start).toBeCloseToPoint(p(0, 0))
    expect(pasted.end).toBeCloseToPoint(p(100, 100))
  })

  it("gives the copies fresh ids and leaves the originals alone", async () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })
    copy(cad, "L1")
    await pasteAt(cad, p(0, 200))

    expect(cad.entityCount).toBe(2)
    expect(cad.byId<LineEntity>("L1").start).toBeCloseToPoint(p(0, 0))
    const ids = cad.entities().map((entity) => entity.id)
    expect(new Set(ids).size).toBe(2)
  })

  it("asks what to copy when nothing is selected", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })
    cad.command("COPYCLIP")
    expect(cad.activeToolId()).toBe("copyclip")

    cad.click(p(50, 0)).enter()
    expect(cad.activeToolId()).toBe("select")
    expect(parseClipboard((cad.clipboard as MemoryClipboard).text!)).not.toBe(
      null
    )
  })

  it("leaves the originals selected, so the copy can be repeated", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })
    copy(cad, "L1")
    expect(cad.selectedIds()).toEqual(["L1"])
  })
})

describe("a hatch through the clipboard", () => {
  // HATCH review (HOB-11): its pattern settings and loops arrive whole, the
  // pattern carried along with it as COPY carries it (probe hatch/p311).
  it("keeps its pattern, scale, angle and loops, its origin moved with it", async () => {
    const hatch = createHatch(
      [
        loopOf(p(0, 0), p(100, 50)),
        { vertices: [p(60, 25), p(40, 25)], bulges: [1, 1] },
      ],
      {
        patternId: "ANSI31",
        patternScale: 20,
        patternAngle: 0.5,
        origin: p(3, 4),
        id: "H",
      }
    )
    const cad = createHarness({ entities: [{ ...hatch, color: "#ff0000" }] })
    copy(cad, "H")
    await pasteAt(cad, p(200, 0))

    const pasted = cad
      .entities()
      .find((entity) => entity.id !== "H") as HatchEntity
    expect(pasted.patternId).toBe("ANSI31")
    expect(pasted.patternScale).toBe(20)
    expect(pasted.patternAngle).toBe(0.5)
    expect(pasted.origin).toBeCloseToPoint(p(203, 4))
    expect(pasted.color).toBe("#ff0000")
    expect(pasted.loops[0].vertices).toBeCloseToPoints([
      p(200, 0),
      p(300, 0),
      p(300, 50),
      p(200, 50),
    ])
    expect(pasted.loops[1].bulges).toEqual([1, 1])
  })
})

describe("CUTCLIP", () => {
  it("copies the objects and removes them", async () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })
    cad.select("L1").command("CUTCLIP")
    expect(cad.entityCount).toBe(0)

    await pasteAt(cad, p(0, 0))
    expect(cad.only<LineEntity>("line").end).toBeCloseToPoint(p(100, 0))
  })

  it("restores the objects in one undo step", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })
    cad.select("L1").command("CUTCLIP").undo()
    expect(cad.byId<LineEntity>("L1").end).toBeCloseToPoint(p(100, 0))
  })
})

describe("COPYBASE", () => {
  it("measures the fragment from the point that was picked", async () => {
    const cad = createHarness({
      entities: [lineOf(p(100, 50), p(200, 150), { id: "L1" })],
    })
    // Base point first, then the objects — the order AutoCAD's task page gives.
    cad.select("L1").command("COPYBASE").click(p(200, 150))
    await pasteAt(cad, p(0, 0))

    const pasted = cad
      .entities()
      .find((entity) => entity.id !== "L1") as LineEntity
    expect(pasted.start).toBeCloseToPoint(p(-100, -100))
    expect(pasted.end).toBeCloseToPoint(p(0, 0))
  })

  it("accepts a typed base point and then asks for the objects", async () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })
    cad.command("COPYBASE").type("100,0").enter()
    expect(cad.activeToolId()).toBe("copybase")

    cad.click(p(50, 0)).enter()
    await pasteAt(cad, p(0, 0))
    const pasted = cad
      .entities()
      .find((entity) => entity.id !== "L1") as LineEntity
    expect(pasted.start).toBeCloseToPoint(p(-100, 0))
  })
})

// AutoCAD 2027's console, probes clipboard/p101–p127.
describe("the clipboard copies at the console", () => {
  const two = () => [
    lineOf(p(0, 0), p(100, 0), { id: "L1" }),
    lineOf(p(0, 50), p(100, 50), { id: "L2" }),
  ]

  it("refuses what is no point at COPYBASE's base point (p106)", () => {
    const cad = answer(createHarness({ entities: two() }), "_COPYBASE", "FOO")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Specify base point: FOO",
      "Invalid point.",
    ])
    expect(cad.state().commandLine.prompt).toBe("COPYBASE Specify base point:")
  })

  it("refuses Enter at COPYBASE's base point and asks again (p107)", () => {
    const cad = answer(createHarness({ entities: two() }), "_COPYBASE", "")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Specify base point:",
      "Invalid point.",
    ])
    expect(cad.activeToolId()).toBe("copybase")
    expect(cad.state().commandLine.prompt).toBe("COPYBASE Specify base point:")

    cad.enter()
    expect(cad.commandLog().at(-1)).toBe("Invalid point.")
    expect(cad.activeToolId()).toBe("copybase")
  })

  it("leaves LASTPOINT at COPYBASE's base point (p106)", () => {
    const cad = answer(
      createHarness({ entities: two() }),
      "_COPYBASE",
      "10,10",
      "_L",
      "",
      "ID",
      "@"
    )
    expect(cad.commandLog().at(-1)).toBe(
      " X = 10.00     Y = 10.00     Z = 0.00"
    )
  })

  it("keeps COPYBASE's preselection (p121)", () => {
    const cad = createHarness({ entities: two() })
    cad.select("L1", "L2")
    answer(cad, "_COPYBASE", "0,0")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Specify base point: 0,0",
      "2 found",
    ])
    expect(cad.selectedIds()).toEqual(["L1", "L2"])
  })

  it("takes whole objects at COPYBASE's Select objects (p127)", () => {
    const cad = answer(
      createHarness({ entities: two() }),
      "_COPYBASE",
      "0,0",
      "FOO"
    )
    expect(cad.commandLog().slice(-2)).toEqual([
      "*Invalid selection*",
      "Expects a point or Window/Last/Crossing/BOX/ALL/Fence/WPolygon/CPolygon/Group/Add/Remove/Multiple/Previous/Undo/AUto/SIngle",
    ])
  })

  it("copies and cuts nothing on a locked layer (p119)", () => {
    for (const command of ["_COPYCLIP", "_CUTCLIP"]) {
      const clipboard = new MemoryClipboard()
      const cad = createHarness({ entities: two(), clipboard })
      cad.runtime.updateLayer("0", { locked: true })
      answer(cad, command, "_L")
      expect(cad.commandLog().slice(-2)).toEqual([
        "1 found",
        "1 was on a locked layer.",
      ])
      answer(cad, "")
      expect(cad.activeToolId()).toBe("select")
      expect(cad.entityCount).toBe(2)
      expect(clipboard.writes).toEqual([])
    }
  })

  it("names each command at U, in Spanish too (p101–p103)", () => {
    for (const command of ["COPYCLIP", "CUTCLIP", "COPYBASE"]) {
      const cad = createHarness({ entities: two() })
      const base = command === "COPYBASE" ? ["0,0"] : []
      answer(cad, `_${command}`, ...base, "_L", "", "_U")
      expect(cad.commandLog().at(-1)).toBe(command)
      expect(cad.entityCount).toBe(2)
    }
    const cad = createHarness({ entities: two(), locale: es })
    answer(cad, "_COPYCLIP", "_L", "", "_U")
    expect(cad.commandLog().at(-1)).toBe("COPIAPP")
  })

  it("cuts a preselection, drops it, and U brings the object back unselected (p124, p125)", () => {
    const cad = createHarness({ entities: two() })
    cad.select("L1")
    answer(cad, "_CUTCLIP")
    expect(cad.commandLog().slice(-2)).toEqual(["CUTCLIP", "1 found"])
    expect(cad.selectedIds()).toEqual([])
    expect(cad.entityCount).toBe(1)

    answer(cad, "_U")
    expect(cad.commandLog().at(-1)).toBe("CUTCLIP")
    expect(cad.entityCount).toBe(2)
    expect(cad.selectedIds()).toEqual([])
  })
})

describe("PASTECLIP", () => {
  it("previews exactly what it will commit", async () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })
    copy(cad, "L1")
    await cad.runtime.pasteFromClipboard()
    cad.moveTo(p(0, 200))

    // The ghost is drawn where the fragment would land, at its own base point.
    const ghostStart = cad.toScreen(p(0, 200))
    const ghost = cad
      .scene()
      .primitives.filter(
        (prim) =>
          prim.kind === "segment" &&
          Math.hypot(prim.a.x - ghostStart.x, prim.a.y - ghostStart.y) < 1e-6
      )
    expect(ghost).toHaveLength(1)

    cad.click(p(0, 200))
    const pasted = cad
      .entities()
      .find((entity) => entity.id !== "L1") as LineEntity
    expect(pasted.start).toBeCloseToPoint(p(0, 200))
  })

  // desktop clipboard/d04-3: a red circle ghosts red — the objects drawn as
  // they land, on a layer the target has yet to get, in its colour.
  it("draws the ghost as the objects land, on the layers they bring (d04)", async () => {
    const clipboard = new MemoryClipboard()
    const source = createHarness({ clipboard })
    const walls = source.runtime.createLayer("WALLS", "#ff0000")
    source.runtime.document.load([
      lineOf(p(0, 0), p(100, 0), { id: "L1", layerId: walls }),
    ])
    copy(source, "L1")

    const target = createHarness({ clipboard })
    await target.runtime.pasteFromClipboard()
    target.moveTo(p(0, 200))
    const ghostStart = target.toScreen(p(0, 200))
    const ghost = target
      .scene()
      .primitives.filter(
        (prim) =>
          prim.kind === "segment" &&
          Math.hypot(prim.a.x - ghostStart.x, prim.a.y - ghostStart.y) < 1e-6
      )
    expect(ghost).toHaveLength(1)
    expect(ghost[0].kind === "segment" && ghost[0].stroke.color).toBe("#ff0000")
  })

  it("accepts a typed insertion point", async () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })
    copy(cad, "L1")
    await cad.runtime.pasteFromClipboard()
    cad.type("300,400").enter()

    const pasted = cad
      .entities()
      .find((entity) => entity.id !== "L1") as LineEntity
    expect(pasted.start).toBeCloseToPoint(p(300, 400))
    expect(cad.activeToolId()).toBe("select")
    // desktop clipboard/d01: LASTPOINT is the insertion point.
    answer(cad, "ID", "@")
    expect(cad.commandLog().at(-1)).toBe(
      " X = 300.00     Y = 400.00     Z = 0.00"
    )
  })

  // desktop clipboard/d02: INSERT's jig (`udKWORD, udDRAG, udGETZ`), its
  // keywords hidden, so FOO and Enter are what a point prompt with keywords
  // refuses, and a Z is taken.
  it("refuses Enter and FOO as Point or option keyword required., and asks again (d02)", async () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })
    copy(cad, "L1")
    answer(cad, "_PASTECLIP")
    await settled()
    expect(cad.state().commandLine.prompt).toBe(
      "PASTECLIP Specify insertion point:"
    )
    answer(cad, "", "FOO", "5,5")

    expect(cad.commandLog().slice(-5)).toEqual([
      "Specify insertion point:",
      "Point or option keyword required.",
      "Specify insertion point: FOO",
      "Point or option keyword required.",
      "Specify insertion point: 5,5",
    ])
    expect(cad.entityCount).toBe(2)
  })

  it("refuses Enter in Spanish too (d02)", async () => {
    const cad = createHarness({
      locale: es,
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })
    answer(cad, "_COPYCLIP", "_L", "", "_PASTECLIP")
    await settled()
    answer(cad, "")
    expect(cad.commandLog().at(-1)).toBe("Se requiere un punto o una opción.")
    expect(cad.activeToolId()).toBe("paste")
  })

  // desktop clipboard/d02: COPYBASE's base at Z 10, `100,100,5` → Z −5, and
  // a 2D point at the WCS's Z 0 → Z −10.
  it("takes a 3D point, the base's Z kept off it (d02)", async () => {
    for (const [at, z] of [
      ["100,100,5", -5],
      ["100,100", -10],
    ] as const) {
      const cad = createHarness({
        entities: [lineOf(p(0, 0), p(50, 0), { id: "L1" })],
      })
      answer(cad, "_COPYBASE", "0,0,10", "_L", "", "_PASTECLIP")
      await settled()
      answer(cad, at)
      const pasted = cad
        .entities()
        .find((entity) => entity.id !== "L1") as LineEntity
      expect(pasted.start).toBeCloseToPoint(p(100, 100))
      expect(lineStartZ(pasted)).toBeCloseTo(z)
      expect(lineEndZ(pasted)).toBeCloseTo(z)
    }
  })

  // desktop clipboard/d02: `_UCS _Z 30`, then 100,100 lands the line
  // 0,0–50,0 at (36.6025,136.6025)–(79.9038,161.6025): its WCS coordinates
  // read as the UCS's, as INSERT lays a block; the ghost is laid so too.
  it("lays the fragment in a turned UCS, the ghost with it (d02)", async () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(50, 0), { id: "L1" })],
    })
    answer(cad, "_COPYBASE", "0,0", "_L", "", "_UCS", "_Z", "30", "_PASTECLIP")
    await settled()
    const start = p(36.60254037844388, 136.60254037844388)
    const end = p(79.90381056766581, 161.60254037844388)
    cad.moveTo(start)
    const [a, b] = [cad.toScreen(start), cad.toScreen(end)]
    const ghost = cad
      .scene()
      .primitives.filter(
        (prim) =>
          prim.kind === "segment" &&
          Math.hypot(prim.a.x - a.x, prim.a.y - a.y) < 1e-6 &&
          Math.hypot(prim.b.x - b.x, prim.b.y - b.y) < 1e-6
      )
    expect(ghost).toHaveLength(1)

    answer(cad, "100,100")
    const pasted = cad
      .entities()
      .find((entity) => entity.id !== "L1") as LineEntity
    expect(pasted.start).toBeCloseToPoint(start)
    expect(pasted.end).toBeCloseToPoint(end)
  })

  // The same reading in a tilted UCS (CLIPBOARD-D18): the front view's Y is
  // the WCS's Z, so a line along the WCS's Y lands upright.
  it("lays the fragment in a tilted UCS's plane", async () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(0, 50), { id: "L1" })],
    })
    answer(cad, "_COPYBASE", "0,0", "_L", "")
    cad.press("F7")
    cad.command("-VIEW").option("Orthographic").option("Front")
    answer(cad, "_PASTECLIP")
    await settled()
    answer(cad, "100,100")
    const pasted = cad
      .entities()
      .find((entity) => entity.id !== "L1") as LineEntity
    expect(pasted.start).toBeCloseToPoint(p(100, 0))
    expect(pasted.end).toBeCloseToPoint(p(100, 0))
    expect(lineStartZ(pasted)).toBeCloseTo(100)
    expect(lineEndZ(pasted)).toBeCloseTo(150)
  })

  it("names the step PASTECLIP at U, PEGAPP in Spanish (p104)", async () => {
    for (const [locale, name] of [
      [undefined, "PASTECLIP"],
      [es, "PEGAPP"],
    ] as const) {
      const cad = createHarness({
        locale,
        entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
      })
      answer(cad, "_COPYCLIP", "_L", "", "_PASTECLIP")
      await settled()
      answer(cad, "0,50")
      expect(cad.entityCount).toBe(2)

      answer(cad, "_U")
      expect(cad.commandLog().at(-1)).toBe(name)
      expect(cad.entityCount).toBe(1)
    }
  })

  it("is repeated by Enter (p118)", async () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })
    answer(cad, "_COPYCLIP", "_L", "", "_PASTECLIP")
    await settled()
    answer(cad, "0,10", "")
    await settled()
    expect(cad.state().commandLine.prompt).toBe(
      "PASTECLIP Specify insertion point:"
    )
    answer(cad, "0,20")
    expect(cad.entityCount).toBe(3)
  })

  // The menu's other entries are one group U names by the entry (`Erase
  // GROUP`, desktop workspace/d03): the read must not split it in two. An
  // entry showing a key names it glued to the label (desktop clipboard/d05).
  it("is one step from the shortcut menu, U naming it PasteCtrl+V GROUP (d05)", async () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })
    answer(cad, "_COPYCLIP", "_L", "", "_CIRCLE", "5,5", "2")
    cad.runtime.chooseShortcutMenuAction("paste")
    await settled()
    answer(cad, "0,50")
    expect(cad.entityCount).toBe(3)

    answer(cad, "_U")
    expect(cad.commandLog().at(-1)).toBe("PasteCtrl+V GROUP")
    expect(cad.entityCount).toBe(2)
    answer(cad, "_U")
    expect(cad.commandLog().at(-1)).toBe("CIRCLE")
    expect(cad.entityCount).toBe(1)
  })

  // desktop clipboard/e01: `PegarCtrl+V GRUPO`, `CopiarCtrl+C GRUPO`,
  // `Copiar con punto baseCtrl+Mayús+C GRUPO`; English's Cut, Copy and Copy
  // with Base Point by d05's pattern (CLIPBOARD-D21).
  it("names each Clipboard entry's group by its label and key (d05, e01)", async () => {
    for (const [locale, entry, name] of [
      [es, "paste", "PegarCtrl+V GRUPO"],
      [es, "copy", "CopiarCtrl+C GRUPO"],
      [es, "copyBase", "Copiar con punto baseCtrl+Mayús+C GRUPO"],
      [es, "cut", "CortarCtrl+X GRUPO"],
      [undefined, "copy", "CopyCtrl+C GROUP"],
      [undefined, "copyBase", "Copy with Base PointCtrl+Shift+C GROUP"],
      [undefined, "cut", "CutCtrl+X GROUP"],
    ] as const) {
      const cad = createHarness({
        locale,
        entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
      })
      if (entry === "paste") answer(cad, "_COPYCLIP", "_L", "")
      cad.runtime.chooseShortcutMenuAction(entry)
      if (entry === "paste") {
        await settled()
        answer(cad, "0,50")
      } else if (entry === "copyBase") answer(cad, "0,0", "_L", "")
      else answer(cad, "_L", "")
      answer(cad, "_U")
      expect(cad.commandLog().at(-1)).toBe(name)
    }
  })

  // desktop clipboard/d07: an empty clipboard writes nothing.
  it("is an empty step from the shortcut menu with nothing to paste (d07)", async () => {
    const cad = createHarness({ clipboard: null })
    answer(cad, "_CIRCLE", "5,5", "2")
    cad.runtime.chooseShortcutMenuAction("paste")
    await settled()
    expect(cad.commandLog().at(-1)).toBe("_pasteclip")

    answer(cad, "_U")
    expect(cad.commandLog().at(-1)).toBe("GROUP PasteCtrl+V")
    expect(cad.entityCount).toBe(1)
  })

  // desktop clipboard/d01, d04-5, d04-6: no grips and `(ssget "_I")` nil
  // after a paste; `(ssget "_P")` is the pasted set.
  it("leaves nothing selected, the pasted objects the Previous set (d04)", async () => {
    const cad = createHarness({
      entities: [
        lineOf(p(0, 0), p(100, 0), { id: "L1" }),
        lineOf(p(0, 10), p(100, 10), { id: "L2" }),
      ],
    })
    copy(cad, "L1", "L2")
    await pasteAt(cad, p(0, 200))
    expect(cad.entityCount).toBe(4)
    expect(cad.selectedIds()).toEqual([])

    answer(cad, "_ERASE", "_P", "")
    expect(cad.entities().map((entity) => entity.id)).toEqual(["L1", "L2"])
  })

  it("undoes a whole paste in one step", async () => {
    const cad = createHarness({
      entities: [
        lineOf(p(0, 0), p(100, 0), { id: "L1" }),
        lineOf(p(0, 10), p(100, 10), { id: "L2" }),
      ],
    })
    copy(cad, "L1", "L2")
    await pasteAt(cad, p(0, 200))
    expect(cad.entityCount).toBe(4)

    cad.undo()
    expect(cad.entityCount).toBe(2)
  })

  // desktop clipboard/d07: nothing written; the typed command's run is a
  // step U names PASTECLIP, PEGAPP in Spanish.
  it("writes nothing when there is nothing to paste, a step U names (d07)", async () => {
    for (const [locale, name] of [
      [undefined, "PASTECLIP"],
      [es, "PEGAPP"],
    ] as const) {
      const cad = createHarness({ locale, clipboard: null })
      answer(cad, "_CIRCLE", "5,5", "2", "_PASTECLIP")
      await settled()
      expect(cad.commandLog().at(-1)).toBe(name)
      expect(cad.activeToolId()).toBe("select")

      answer(cad, "_U")
      expect(cad.commandLog().at(-1)).toBe(name)
      expect(cad.entityCount).toBe(1)
    }
  })

  it("Escape cancels without placing anything", async () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })
    copy(cad, "L1")
    await cad.runtime.pasteFromClipboard()
    cad.escape()

    expect(cad.entityCount).toBe(1)
    expect(cad.activeToolId()).toBe("select")
  })
})

describe("the fragment's tables", () => {
  it("carries the layer an object is on into another drawing", async () => {
    const clipboard = new MemoryClipboard()
    const source = createHarness({ clipboard })
    const walls = source.runtime.createLayer("WALLS", "#ff0000")
    source.runtime.document.load([
      lineOf(p(0, 0), p(100, 0), { id: "L1", layerId: walls }),
    ])
    copy(source, "L1")

    const target = createHarness({ clipboard })
    await pasteAt(target, p(0, 0))

    const pasted = target.only<LineEntity>("line")
    const layer = target.runtime.document.getLayer(pasted.layerId)
    expect(layer?.name).toBe("WALLS")
    expect(layer?.color).toBe("#ff0000")
  })

  it("joins a layer of the same name rather than adding a second", async () => {
    const clipboard = new MemoryClipboard()
    const source = createHarness({ clipboard })
    const walls = source.runtime.createLayer("WALLS", "#ff0000")
    source.runtime.document.load([
      lineOf(p(0, 0), p(100, 0), { id: "L1", layerId: walls }),
    ])
    copy(source, "L1")

    const target = createHarness({ clipboard })
    // The same name, a different id and a different colour: pasting must not
    // redefine the drawing it lands in.
    const existing = target.runtime.createLayer("WALLS", "#00ff00")
    const before = target.runtime.document.getLayers().length
    await pasteAt(target, p(0, 0))

    expect(target.runtime.document.getLayers()).toHaveLength(before)
    expect(target.only<LineEntity>("line").layerId).toBe(existing)
  })

  it("carries the text style a text object uses", async () => {
    const clipboard = new MemoryClipboard()
    const source = createHarness({ clipboard })
    source.runtime.document.load(
      [textOf(p(0, 0), "NOTE", { id: "T1", styleId: "TITLES" })],
      { textStyles: [createTextStyle("TITLES", 5)] }
    )
    copy(source, "T1")

    const target = createHarness({ clipboard })
    await pasteAt(target, p(0, 0))

    expect(target.only<TextEntity>("text").styleId).toBe("TITLES")
    expect(target.runtime.document.getTextStyle("TITLES")?.height).toBe(5)
  })

  it("carries the block definition a reference needs", async () => {
    const clipboard = new MemoryClipboard()
    const bar = createBlockDefinition("BAR", p(0, 0), [
      lineOf(p(0, 0), p(100, 0), { id: "bar-line" }),
    ])
    const source = createHarness({
      clipboard,
      blocks: [bar],
      entities: [createInsert("BAR", p(0, 0), { id: "I1" })],
    })
    copy(source, "I1")

    const target = createHarness({ clipboard })
    await pasteAt(target, p(50, 0))

    expect(target.runtime.document.getBlock("BAR")?.entities).toHaveLength(1)
    expect(target.only<InsertEntity>("insert").position).toBeCloseToPoint(
      p(50, 0)
    )
  })

  it("keeps the definition the target already has under that name", async () => {
    const clipboard = new MemoryClipboard()
    const source = createHarness({
      clipboard,
      blocks: [
        createBlockDefinition("BAR", p(0, 0), [
          lineOf(p(0, 0), p(100, 0), { id: "a" }),
        ]),
      ],
      entities: [createInsert("BAR", p(0, 0), { id: "I1" })],
    })
    copy(source, "I1")

    const target = createHarness({
      clipboard,
      blocks: [
        createBlockDefinition("BAR", p(0, 0), [
          lineOf(p(0, 0), p(7, 0), { id: "b" }),
          lineOf(p(0, 0), p(0, 7), { id: "c" }),
        ]),
      ],
    })
    await pasteAt(target, p(0, 0))

    expect(target.runtime.document.getBlock("BAR")?.entities).toHaveLength(2)
    expect(target.runtime.document.getBlocks()).toHaveLength(1)
  })

  it("lands on the target's definition named in another case (probe blocks/p210)", async () => {
    const clipboard = new MemoryClipboard()
    const source = createHarness({
      clipboard,
      blocks: [
        createBlockDefinition("bar", p(0, 0), [
          lineOf(p(0, 0), p(100, 0), { id: "a" }),
        ]),
      ],
      entities: [createInsert("bar", p(0, 0), { id: "I1" })],
    })
    copy(source, "I1")

    const target = createHarness({
      clipboard,
      blocks: [
        createBlockDefinition("BAR", p(0, 0), [
          lineOf(p(0, 0), p(7, 0), { id: "b" }),
          lineOf(p(0, 0), p(0, 7), { id: "c" }),
        ]),
      ],
    })
    await pasteAt(target, p(0, 0))

    expect(target.runtime.document.getBlocks().map((b) => b.name)).toEqual([
      "BAR",
    ])
    expect(target.only<InsertEntity>("insert").blockId).toBe("BAR")
  })

  it("takes the tables it added back out on undo", async () => {
    const clipboard = new MemoryClipboard()
    const source = createHarness({ clipboard })
    const walls = source.runtime.createLayer("WALLS", "#ff0000")
    source.runtime.document.load([
      lineOf(p(0, 0), p(100, 0), { id: "L1", layerId: walls }),
    ])
    copy(source, "L1")

    const target = createHarness({ clipboard })
    const before = target.runtime.document.getLayers().length
    await pasteAt(target, p(0, 0))
    target.undo()

    expect(target.entityCount).toBe(0)
    expect(target.runtime.document.getLayers()).toHaveLength(before)
  })

  it("carries only the layers the objects actually use", async () => {
    const clipboard = new MemoryClipboard()
    const source = createHarness({ clipboard })
    source.runtime.createLayer("UNUSED", "#0000ff")
    const walls = source.runtime.createLayer("WALLS", "#ff0000")
    source.runtime.document.load([
      lineOf(p(0, 0), p(100, 0), { id: "L1", layerId: walls }),
    ])
    copy(source, "L1")

    const fragment = parseClipboard((clipboard as MemoryClipboard).text!)!
    expect(fragment.drawing.layers.map((layer) => layer.name)).not.toContain(
      "UNUSED"
    )
  })
})

describe("the clipboard host", () => {
  it("falls back to the session copy when reading is refused", async () => {
    const clipboard = new MemoryClipboard()
    const cad = createHarness({
      clipboard,
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })
    copy(cad, "L1")
    clipboard.readError = new Error("denied")

    await pasteAt(cad, p(0, 200))
    expect(cad.entityCount).toBe(2)
  })

  it("falls back to the session copy when the clipboard holds other text", async () => {
    const clipboard = new MemoryClipboard()
    const cad = createHarness({
      clipboard,
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })
    copy(cad, "L1")
    clipboard.text = "https://example.com"

    await pasteAt(cad, p(0, 200))
    expect(cad.entityCount).toBe(2)
  })

  it("does not wait forever on a host that never answers", async () => {
    const clipboard = new MemoryClipboard()
    const cad = createHarness({
      clipboard,
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })
    copy(cad, "L1")
    // A browser showing an unanswered clipboard permission prompt: without a
    // bound on the wait, PASTECLIP would silently do nothing at all.
    clipboard.readHangs = true

    await pasteAt(cad, p(0, 200))
    expect(cad.entityCount).toBe(2)
  })

  it("drops the read when a command starts before it answers", async () => {
    const clipboard = new LateClipboard()
    const cad = createHarness({
      clipboard,
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })
    copy(cad, "L1")
    answer(cad, "_PASTECLIP", "_LINE")
    clipboard.answer()
    await settled()

    expect(cad.activeToolId()).toBe("line")
    expect(cad.state().commandLine.prompt).toBe("LINE Specify first point:")
    expect(cad.commandLog()).not.toContain("Specify insertion point:")
    answer(cad, "0,0", "10,0", "")
    expect(cad.entityCount).toBe(2)
  })

  it("drops the read when Escape is pressed before it answers", async () => {
    const clipboard = new LateClipboard()
    const cad = createHarness({
      clipboard,
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })
    copy(cad, "L1")
    answer(cad, "_PASTECLIP")
    cad.escape()
    clipboard.answer()
    await settled()

    expect(cad.activeToolId()).toBe("select")
    expect(cad.state().commandLine.prompt).toBe("Command:")
    expect(cad.entityCount).toBe(1)
  })

  it("works with no clipboard port at all", async () => {
    const cad = createHarness({
      clipboard: null,
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })
    copy(cad, "L1")
    await pasteAt(cad, p(0, 200))
    expect(cad.entityCount).toBe(2)
  })

  it("does not report a failed write", () => {
    const clipboard = new MemoryClipboard()
    clipboard.writeError = new Error("denied")
    const cad = createHarness({
      clipboard,
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })
    copy(cad, "L1")
    expect(cad.commandLog()).toEqual(["COPYCLIP", "1 found"])
  })
})

describe("clipboard shortcuts", () => {
  const drawing = () => ({
    entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
  })

  /** What Ctrl+`key` wrote in the history. */
  function pressed(
    cad: ReturnType<typeof createHarness>,
    key: string,
    shiftKey = false
  ): string[] {
    const from = cad.commandLog().length
    expect(cad.press(key, { ctrlKey: true, shiftKey })).toBe(true)
    return cad.commandLog().slice(from)
  }

  const CANCEL = "Specify next point or [Undo]: *Cancel*"

  it("Ctrl+C starts COPYCLIP and Ctrl+Shift+C starts COPYBASE", () => {
    const cad = createHarness(drawing())
    expect(cad.press("c", { ctrlKey: true })).toBe(true)
    expect(cad.activeToolId()).toBe("copyclip")

    cad.escape()
    expect(cad.press("C", { ctrlKey: true, shiftKey: true })).toBe(true)
    expect(cad.activeToolId()).toBe("copybase")
  })

  it("Ctrl+X starts CUTCLIP and Ctrl+V pastes", async () => {
    const cad = createHarness(drawing())
    cad.select("L1")
    expect(cad.press("x", { ctrlKey: true })).toBe(true)
    expect(cad.entityCount).toBe(0)

    expect(cad.press("v", { ctrlKey: true })).toBe(true)
    // The read is asynchronous; the tool starts once it settles.
    await settled()
    expect(cad.activeToolId()).toBe("paste")
  })

  // acad.cuix: ID_Copyclip `^C^C_copyclip`, ID_Cutclip `^C^C_cutclip`,
  // ID_Copybase `^C^C_copybase`; the `^C^C` as Ctrl+S's (desktop
  // workspace/d04: `Specify next point or [Undo]: *Cancel*`, then `_qsave`).
  it("Ctrl+C, X and Shift+C cancel LINE, echo their macro and ask", () => {
    for (const [key, shiftKey, echo, prompt] of [
      ["c", false, "_copyclip", "COPYCLIP Select objects:"],
      ["x", false, "_cutclip", "CUTCLIP Select objects:"],
      ["C", true, "_copybase", "COPYBASE Specify base point:"],
    ] as const) {
      const cad = answer(createHarness(drawing()), "_LINE", "0,0")
      expect(pressed(cad, key, shiftKey)).toEqual([CANCEL, echo])
      expect(cad.state().commandLine.prompt).toBe(prompt)
    }
  })

  // acad.cuix: ID_Pasteclip `^C^C_pasteclip`.
  it("Ctrl+V cancels LINE, echoes _pasteclip and asks for the point", async () => {
    const cad = answer(createHarness(drawing()), "_COPYCLIP", "_L", "")
    answer(cad, "_LINE", "0,0")
    expect(pressed(cad, "v")).toEqual([CANCEL, "_pasteclip"])
    await settled()
    expect(cad.state().commandLine.prompt).toBe(
      "PASTECLIP Specify insertion point:"
    )
  })

  // The `^C^C` leaves a preselection at Command:, which COPYCLIP counts on
  // the macro's echo (desktop erase/d11) and keeps (clipboard/p124); U names
  // the group as d04 names Ctrl+S's (CLIPBOARD-D8).
  it("Ctrl+C at Command: copies the preselection, one step U names COPYCLIP GROUP", () => {
    const cad = answer(createHarness(drawing()), "_CIRCLE", "5,5", "2")
    cad.select("L1")
    expect(pressed(cad, "c")).toEqual(["_copyclip 1 found"])
    expect(cad.selectedIds()).toEqual(["L1"])

    cad.escape()
    expect(answer(cad, "_U").commandLog().slice(-2)).toEqual([
      "U",
      "COPYCLIP GROUP",
    ])
    expect(cad.entityCount).toBe(2)
  })

  // PASTECLIP's name survives the read (CLIPBOARD-D9) as the group's.
  it("Ctrl+V then a point is one step U names PASTECLIP GROUP", async () => {
    const cad = answer(createHarness(drawing()), "_COPYCLIP", "_L", "")
    answer(cad, "_CIRCLE", "5,5", "2")
    cad.press("v", { ctrlKey: true })
    await settled()
    answer(cad, "0,50")
    expect(cad.entityCount).toBe(3)

    expect(answer(cad, "_U").commandLog().at(-1)).toBe("PASTECLIP GROUP")
    expect(cad.entityCount).toBe(2)
    expect(answer(cad, "_U").commandLog().at(-1)).toBe("CIRCLE")
    expect(cad.entityCount).toBe(1)
  })

  // desktop clipboard/d07: nothing written, U `GROUP PASTECLIP`.
  it("Ctrl+V with nothing to paste writes nothing, an empty group U names (d07)", async () => {
    const cad = answer(
      createHarness({ clipboard: null }),
      "_CIRCLE",
      "5,5",
      "2"
    )
    expect(pressed(cad, "v")).toEqual(["_pasteclip"])
    await settled()
    expect(cad.commandLog().at(-1)).toBe("_pasteclip")

    expect(answer(cad, "_U").commandLog().at(-1)).toBe("GROUP PASTECLIP")
    expect(cad.entityCount).toBe(1)
  })

  // acad.cuix: ID_Pastebloc and ID_Cutbaseclip, commands not built here;
  // Ctrl+Shift+A toggles groups (PICKSTYLE), not built either.
  it("leaves Ctrl+Shift+V, X and A to the browser (PASTEBLOCK, CUTBASE, groups)", () => {
    const cad = createHarness(drawing())
    expect(cad.press("V", { ctrlKey: true, shiftKey: true })).toBe(false)
    cad.select("L1")
    expect(cad.press("X", { ctrlKey: true, shiftKey: true })).toBe(false)
    expect(cad.press("A", { ctrlKey: true, shiftKey: true })).toBe(false)
    expect(cad.entityCount).toBe(1)
    expect(cad.commandLog()).toEqual([])
  })

  it("never leaks into the command prompt", () => {
    const cad = createHarness(drawing())
    for (const key of ["c", "x", "v", "a"]) {
      cad.press(key, { ctrlKey: true })
    }
    expect(cad.state().commandLine.buffer).toBe("")
  })
})

// acad.cuix's ID_SelAll `^C^C_ai_selall`: acad2027doc.lsp's `c:ai_selall`
// writes `Selecting objects...` and `done.` around `_.SELECT _ALL ""`.
describe("Ctrl+A", () => {
  const two = () => [
    lineOf(p(0, 0), p(100, 0), { id: "L1" }),
    lineOf(p(0, 10), p(100, 10), { id: "L2" }),
  ]

  it("selects everything that can be selected", () => {
    const cad = createHarness({ entities: two() })
    expect(cad.press("a", { ctrlKey: true })).toBe(true)
    expect(cad.selectedIds().sort()).toEqual(["L1", "L2"])
  })

  it("cancels LINE first, as its `^C^C` does", () => {
    const cad = answer(createHarness({ entities: two() }), "_LINE", "0,0")
    cad.press("a", { ctrlKey: true })
    expect(cad.commandLog().slice(-2)).toEqual([
      "Specify next point or [Undo]: *Cancel*",
      "_ai_selall Selecting objects...done.",
    ])
    expect(cad.activeToolId()).toBe("select")
    expect(cad.state().commandLine.prompt).toBe("Command:")
    expect(cad.selectedIds().sort()).toEqual(["L1", "L2"])
  })

  // clipboard/p122, p123: `Selecting objects...done.`, and U `AI_SELALL
  // GROUP`, the objects all still there; on the echo's line (desktop
  // clipboard/d06-1).
  it("writes _ai_selall Selecting objects...done., a step U names AI_SELALL GROUP (p123, d06)", () => {
    const cad = answer(createHarness(), "_LINE", "0,0", "10,0", "")
    answer(cad, "_CIRCLE", "5,5", "2")
    cad.press("a", { ctrlKey: true })
    expect(cad.commandLog().slice(-2)).toEqual([
      "Specify radius of circle or [Diameter]: 2",
      "_ai_selall Selecting objects...done.",
    ])
    expect(cad.selectedIds()).toHaveLength(2)

    expect(answer(cad, "_U").commandLog().slice(-2)).toEqual([
      "U",
      "AI_SELALL GROUP",
    ])
    expect(cad.entityCount).toBe(2)
    expect(answer(cad, "_U").commandLog().at(-1)).toBe("CIRCLE")
  })

  it("in Spanish, Designando objetos...terminado. and AI_SELALL GRUPO (p123)", () => {
    const cad = createHarness({ entities: two(), locale: es })
    cad.press("a", { ctrlKey: true })
    expect(cad.commandLog().at(-1)).toBe(
      "_ai_selall Designando objetos...terminado."
    )
    expect(answer(cad, "_U").commandLog().at(-1)).toBe("AI_SELALL GRUPO")
    expect(cad.entityCount).toBe(2)
  })

  // clipboard/p126: ALL takes the objects on Off and on locked layers, never
  // a frozen one's (no Freeze here), as the selector's ALL does.
  it("takes objects on a locked layer and on an Off one (p126)", () => {
    const cad = createHarness()
    cad.runtime.document.load(
      [
        lineOf(p(0, 0), p(100, 0), { id: "L1" }),
        lineOf(p(0, 10), p(100, 10), { id: "LOCKED", layerId: "locked" }),
        lineOf(p(0, 20), p(100, 20), { id: "OFF", layerId: "off" }),
      ],
      {
        layers: [
          layerOf("0"),
          layerOf("locked", { locked: true }),
          layerOf("off"),
        ],
      }
    )
    cad.runtime.updateLayer("off", { visible: false })
    cad.press("a", { ctrlKey: true })
    expect(cad.selectedIds()).toEqual(["L1", "LOCKED", "OFF"])
  })
})
