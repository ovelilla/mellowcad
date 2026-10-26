import { afterEach, describe, expect, it, vi } from "vitest"

import {
  type CadHarness,
  MemoryClipboard,
  MemoryFileTransport,
  createHarness,
} from "../../test/harness"
import {
  arcOf,
  circleOf,
  ellipseOf,
  hatchOf,
  lineOf,
  loopOf,
  p,
  polylineOf,
  rectOf,
  textOf,
} from "../../test/builders"
import {
  createBlockDefinition,
  createDimension,
  createInsert,
  createMText,
  type Entity,
  withElevation,
} from "../domain/entities"
import { SnapType } from "./snapping/types"
import { commandCatalog } from "./commandCatalog"
import type { PropertyRow } from "./EngineState"
import type { Vec2 } from "../geometry/Vec2"

/**
 * Everything the engine puts in front of a user, in English, walked command by
 * command: the command-line prompt, the dynamic-input fields, the keyword
 * chips, what is written to the scrollback, the text drawn on the canvas and
 * the Properties palette. It is the safety net of the internationalisation:
 * moving the text into catalogs must leave this file byte for byte the same.
 */

/** Answers a keyword prompt by its letter, routed as the UI routes a key. */
/** A keyword typed and confirmed, as at AutoCAD's prompt. */
function answer(cad: CadHarness, letter: string): void {
  if (cad.hasFocusedField()) cad.runtime.invokeToolOption(letter)
  else {
    for (const char of letter) cad.press(char)
    cad.press("Enter")
  }
}

/** The text of the prompt each open field asks, before the X,Y collapse. */
function sessionPrompts(cad: CadHarness): string {
  const session = cad.runtime.dynamicInput.getSession()
  if (!session) return "-"
  return session.fields
    .map((field) =>
      JSON.stringify(
        field.prompt === undefined ? "" : cad.runtime.text.prompt(field.prompt)
      )
    )
    .join(" ")
}

class Surface {
  readonly out: string[] = []
  private readonly last = new Map<string, string>()
  private logged = 0

  constructor(
    readonly cad: CadHarness,
    title: string
  ) {
    this.out.push(`## ${title}`)
    this.capture("start")
  }

  do(label: string, act: (cad: CadHarness) => unknown): this {
    act(this.cad)
    this.capture(label)
    return this
  }

  private capture(label: string): void {
    const cad = this.cad
    const state = cad.state()
    this.out.push(`> ${label}`)

    const dynamicInput = state.dynamicInput
      ? state.dynamicInput.fields
          .map(
            (field) =>
              `${JSON.stringify(field.label)}=${JSON.stringify(field.value)}` +
              `|${field.placeholder}|${field.unitSuffix}${field.active ? "*" : ""}`
          )
          .join(" ")
      : "-"
    const info = state.properties.info
    const row = (cell: PropertyRow) =>
      `${cell.label}=${cell.value}${cell.edit ? "~" : ""}`
    const properties = info
      ? `${info.title} (${info.count}) ` +
        (info.general.length > 0
          ? `{${info.general.map(row).join(", ")}} `
          : "") +
        info.groups
          .map((group) => `[${group.title}: ${group.rows.map(row).join(", ")}]`)
          .join(" ")
      : "-"
    const canvas = cad
      .scene()
      .primitives.flatMap((primitive) =>
        primitive.kind === "label" ? [JSON.stringify(primitive.text)] : []
      )
      .join(" ")

    const sections: [string, string][] = [
      ["prompt", state.commandLine.prompt],
      ["asks", sessionPrompts(cad)],
      ["tip", state.dynamicInput?.prompt ?? "-"],
      ["dyn", dynamicInput],
      [
        "options",
        state.commandOptions
          .map((option) => `[${option.abbreviation}] ${option.label}`)
          .join(", ") || "-",
      ],
      ["canvas", canvas || "-"],
      ["properties", properties],
      [
        "cycling",
        state.selectionCycling.candidates
          .map((candidate) => candidate.label)
          .join(", ") || "-",
      ],
    ]
    for (const [name, value] of sections) {
      if (this.last.get(name) === value) continue
      this.last.set(name, value)
      this.out.push(`  ${name}: ${value}`)
    }

    const lines = state.commandLine.lines
    for (const line of lines.slice(this.logged)) {
      this.out.push(`  ${line.kind}| ${line.text.replace(/\n/g, "\n        ")}`)
    }
    this.logged = lines.length
  }
}

const surfaces: string[] = []

function walk(
  title: string,
  cad: CadHarness,
  script: (surface: Surface) => unknown
): void {
  const surface = new Surface(cad, title)
  script(surface)
  surfaces.push(surface.out.join("\n"))
}

const at = (x: number, y: number): Vec2 => p(x, y)

const line = () => lineOf(p(0, 0), p(100, 0), { id: "L1" })
const corner = () => [
  lineOf(p(0, 0), p(200, 0), { id: "A" }),
  lineOf(p(0, 0), p(0, 200), { id: "B" }),
]
const square = () => [
  lineOf(p(0, 0), p(100, 0), { id: "S1" }),
  lineOf(p(100, 0), p(100, 100), { id: "S2" }),
  lineOf(p(100, 100), p(0, 100), { id: "S3" }),
  lineOf(p(0, 100), p(0, 0), { id: "S4" }),
]
const bar = () =>
  createBlockDefinition("BAR", p(0, 0), [lineOf(p(0, 0), p(100, 0))])

afterEach(() => {
  vi.useRealTimers()
})

describe("the engine's English surface", () => {
  it("names its commands and tools", () => {
    const commands = commandCatalog().map(
      (command) =>
        `${command.name} ${JSON.stringify(command.aliases)} ${JSON.stringify(
          command.description
        )}`
    )
    const tools = createHarness()
      .state()
      .tools.map(
        (tool) =>
          `${tool.id} ${JSON.stringify(tool.label)} ${tool.shortcut ?? "-"}`
      )
    surfaces.push(["## commands", ...commands, "## tools", ...tools].join("\n"))
  })

  it("answers at the Command: prompt", () => {
    walk("neutral prompt", createHarness({ entities: [line()] }), (s) =>
      s
        .do("type FOO", (c) => c.command("FOO"))
        .do("lowercase l runs LINE", (c) => c.command("l"))
        .do("escape", (c) => c.escape())
        .do("ERASE with nothing selected", (c) => c.command("ERASE"))
        .do("ERASE one", (c) => c.escape().select("L1").command("E"))
        .do("UNDO", (c) => c.command("U"))
        .do("REDO", (c) => c.command("REDO"))
        .do("F3 Osnap", (c) => c.press("F3"))
        .do("F8 Ortho", (c) => c.press("F8"))
        .do("F9 Snap", (c) => c.press("F9"))
        .do("F10 Polar", (c) => c.press("F10"))
        .do("F11 Object Snap Tracking", (c) => c.press("F11"))
        .do("FROM at Command:", (c) => c.command("FRO"))
        .do("QSAVE without files", (c) => c.command("QSAVE"))
        .do("OPEN without files", (c) => c.command("OPEN"))
        .do("DIMSTYLE", (c) => c.command("D"))
        .do("STYLE", (c) => c.command("ST"))
        .do("BLOCKSPALETTE", (c) => c.command("BLOCKSPALETTE"))
        .do("LAYER", (c) => c.command("LA"))
        .do("LAYERCLOSE", (c) => c.command("LAYERCLOSE"))
        .do("PROPERTIES", (c) => c.command("PR"))
        .do("PROPERTIESCLOSE", (c) => c.command("PROPERTIESCLOSE"))
        .do("PURGE with nothing", (c) => c.command("PU"))
        .do("Enter repeats", (c) => c.press("Enter"))
    )
    walk(
      "erase two",
      createHarness({
        entities: [line(), circleOf(p(0, 0), 10, { id: "C1" })],
      }),
      (s) => s.do("ERASE two", (c) => c.select("L1", "C1").command("ERASE"))
    )
    walk(
      "purge",
      createHarness({
        blocks: [bar(), createBlockDefinition("NUT", p(0, 0), [line()])],
      }),
      (s) => s.do("PURGE two", (c) => c.command("PURGE"))
    )
    walk("purge one", createHarness({ blocks: [bar()] }), (s) =>
      s.do("PURGE one", (c) => c.command("PURGE"))
    )
  })

  it("reports on files and the clipboard", async () => {
    const cases: [string, string][] = [
      ["not JSON", "{"],
      ["not a record", "null"],
      ["not a drawing", JSON.stringify({ type: "other" })],
      [
        "newer version",
        JSON.stringify({ type: "easycad-drawing", version: 1e9 }),
      ],
    ]
    for (const [name, text] of cases) {
      const files = new MemoryFileTransport(text)
      const cad = createHarness({ files })
      cad.command("OPEN")
      await Promise.resolve()
      await Promise.resolve()
      walk(`open ${name}`, cad, (s) => s.do("after open", () => {}))
    }
    const failing = new MemoryFileTransport()
    failing.openError = new Error("Disk on fire.")
    const cad = createHarness({ files: failing })
    cad.command("OPEN")
    await Promise.resolve()
    await Promise.resolve()
    walk("open failing", cad, (s) => s.do("after open", () => {}))

    const refusing = new MemoryFileTransport()
    refusing.openError = "no" as unknown as Error
    const refused = createHarness({ files: refusing })
    refused.command("OPEN")
    await Promise.resolve()
    await Promise.resolve()
    walk("open refused", refused, (s) => s.do("after open", () => {}))

    const empty = createHarness({ clipboard: new MemoryClipboard() })
    await empty.runtime.pasteFromClipboard()
    walk("paste nothing", empty, (s) => s.do("after paste", () => {}))

    const clipboard = new MemoryClipboard()
    const source = createHarness({ entities: [line()], clipboard })
    source.select("L1").command("COPYCLIP")
    await Promise.resolve()
    const target = createHarness({ clipboard })
    await target.runtime.pasteFromClipboard()
    walk("paste", target, (s) =>
      s
        .do("move", (c) => c.moveTo(at(50, 50)))
        .do("place", (c) => c.click(at(50, 50)))
    )
  })

  it("draws", () => {
    walk("LINE", createHarness(), (s) =>
      s
        .do("LINE", (c) => c.command("LINE"))
        .do("type first point", (c) => c.type("0,0"))
        .do("enter", (c) => c.enter())
        .do("move", (c) => c.moveTo(at(50, 0)))
        .do("type length", (c) => c.type("100"))
        .do("enter", (c) => c.enter())
        .do("polar coordinate", (c) => c.type("100<90"))
        .do("enter", (c) => c.enter())
        .do("click", (c) => c.click(at(0, 100)))
        .do("U", (c) => answer(c, "U"))
        .do("click", (c) => c.click(at(0, 100)))
        .do("C", (c) => answer(c, "C"))
        .do("LINE again", (c) => c.command("L"))
        .do("Enter continues", (c) => c.enter())
        .do("escape", (c) => c.escape())
    )
    walk("LINE on nothing", createHarness(), (s) =>
      s
        .do("LINE", (c) => c.command("LINE"))
        .do("Enter continues nothing", (c) => c.enter())
        .do("type first point", (c) => c.type("0,0"))
        .do("enter", (c) => c.enter())
        .do("type 0", (c) => c.type("0"))
        .do("enter", (c) => c.enter())
        .do("U", (c) => answer(c, "U"))
        .do("U at the first point's Undo", (c) => answer(c, "U"))
        .do("escape", (c) => c.escape())
    )
    walk(
      "LINE Continue from an arc",
      createHarness({ entities: [arcOf(p(0, 0), 50, 0, Math.PI / 2)] }),
      (s) =>
        s
          .do("LINE", (c) => c.command("LINE"))
          .do("Enter continues", (c) => c.enter())
          .do("Enter at the length", (c) => c.enter())
          .do("type length", (c) => c.type("40"))
          .do("enter", (c) => c.enter())
          .do("U", (c) => answer(c, "U"))
          .do("escape", (c) => c.escape())
    )
    walk(
      "LINE offset from a tracked point",
      createHarness({ entities: [line()], snap: true }),
      (s) => {
        vi.useFakeTimers()
        s.do("LINE", (c) => c.command("LINE"))
          .do("hover the endpoint", (c) => {
            c.moveTo(at(100, 0))
            vi.advanceTimersByTime(500)
          })
          .do("move along the guide", (c) => c.moveTo(at(160, 0.5)))
          .do("escape", (c) => c.escape())
      }
    )
    walk("PLINE", createHarness(), (s) =>
      s
        .do("PLINE", (c) => c.command("PL"))
        .do("first", (c) => c.click(at(0, 0)))
        .do("second", (c) => c.click(at(100, 0)))
        .do("A", (c) => answer(c, "A"))
        .do("arc", (c) => c.click(at(100, 100)))
        .do("C", (c) => answer(c, "C"))
        .do("enter", (c) => c.enter())
        .do("L", (c) => answer(c, "L"))
        .do("third", (c) => c.click(at(0, 100)))
        .do("U", (c) => answer(c, "U"))
        .do("CL", (c) => answer(c, "CL"))
    )
    walk("PLINE Length", createHarness(), (s) =>
      s
        .do("PLINE", (c) => c.command("PL"))
        .do("first", (c) => c.click(at(0, 0)))
        .do("second", (c) => c.click(at(100, 0)))
        .do("L", (c) => answer(c, "L"))
        .do("FOO", (c) => c.type("FOO").enter())
        .do("length", (c) => c.type("50").enter())
        .do("enter", (c) => c.enter())
    )
    walk("CIRCLE", createHarness(), (s) =>
      s
        .do("CIRCLE", (c) => c.command("C"))
        .do("centre", (c) => c.click(at(0, 0)))
        .do("move", (c) => c.moveTo(at(30, 0)))
        .do("radius", (c) => c.type("50"))
        .do("enter", (c) => c.enter())
        .do("CIRCLED", (c) => c.command("CIRCLED"))
        .do("centre", (c) => c.click(at(0, 0)))
        .do("diameter", (c) => c.click(at(40, 0)))
        .do("CIRCLE2P", (c) => c.command("CIRCLE2P"))
        .do("first", (c) => c.click(at(-50, 0)))
        .do("second", (c) => c.click(at(50, 0)))
        .do("CIRCLE3P", (c) => c.command("CIRCLE3P"))
        .do("first", (c) => c.click(at(100, 0)))
        .do("second", (c) => c.click(at(0, 100)))
        .do("third", (c) => c.click(at(-100, 0)))
    )
    walk("ARC", createHarness(), (s) =>
      s
        .do("ARC", (c) => c.command("A"))
        .do("start", (c) => c.click(at(100, 0)))
        .do("second", (c) => c.click(at(0, 100)))
        .do("end", (c) => c.click(at(-100, 0)))
        .do("ARCSCE", (c) => c.command("ARCSCE"))
        .do("start", (c) => c.click(at(100, 0)))
        .do("centre", (c) => c.click(at(0, 0)))
        .do("end", (c) => c.click(at(0, 100)))
        .do("ARCCSE", (c) => c.command("ARCCSE"))
        .do("centre", (c) => c.click(at(0, 0)))
        .do("start", (c) => c.click(at(100, 0)))
        .do("escape", (c) => c.escape())
    )
    walk("ELLIPSE", createHarness(), (s) =>
      s
        .do("ELLIPSE", (c) => c.command("EL"))
        .do("first axis end", (c) => c.click(at(-100, 0)))
        .do("second axis end", (c) => c.click(at(100, 0)))
        .do("R", (c) => answer(c, "R"))
        .do("rotation", (c) => c.type("60"))
        .do("enter", (c) => c.enter())
        .do("ELLIPSE C", (c) => c.command("ELLIPSE"))
        .do("C", (c) => answer(c, "C"))
        .do("centre", (c) => c.click(at(0, 0)))
        .do("axis end", (c) => c.click(at(100, 0)))
        .do("other axis", (c) => c.click(at(0, 50)))
        .do("ELLIPSE A", (c) => c.command("ELLIPSE"))
        .do("A", (c) => answer(c, "A"))
        .do("escape", (c) => c.escape())
        .do("ELLIPSEC", (c) => c.command("ELLIPSEC"))
        .do("escape", (c) => c.escape())
        .do("ELLIPSEARC", (c) => c.command("ELLIPSEARC"))
        .do("first", (c) => c.click(at(-100, 0)))
        .do("second", (c) => c.click(at(100, 0)))
        .do("other axis", (c) => c.click(at(0, 50)))
        .do("start angle", (c) => c.type("0"))
        .do("enter", (c) => c.enter())
        .do("I", (c) => answer(c, "I"))
        .do("included", (c) => c.type("90"))
        .do("enter", (c) => c.enter())
    )
    walk("SPLINE", createHarness(), (s) =>
      s
        .do("SPLINE", (c) => c.command("SPL"))
        .do("K", (c) => answer(c, "K"))
        .do("S", (c) => answer(c, "S"))
        .do("first", (c) => c.click(at(0, 0)))
        .do("T", (c) => answer(c, "T"))
        .do("start tangent", (c) => c.click(at(0, 50)))
        .do("second", (c) => c.click(at(100, 50)))
        .do("third", (c) => c.click(at(200, 0)))
        .do("U", (c) => answer(c, "U"))
        .do("third again", (c) => c.click(at(200, 0)))
        .do("T", (c) => answer(c, "T"))
        .do("end tangent", (c) => c.click(at(200, -50)))
        .do("select it", (c) => c.selectAll())
        .do("escape", (c) => c.escape())
        .do("SPLINE CV", (c) => c.command("SPLINE"))
        .do("M", (c) => answer(c, "M"))
        .do("CV", (c) => c.option("CV"))
        .do("D", (c) => answer(c, "D"))
        .do("degree", (c) => c.type("2"))
        .do("enter", (c) => c.enter())
        .do("first", (c) => c.click(at(0, 0)))
        .do("second", (c) => c.click(at(100, 100)))
        .do("third", (c) => c.click(at(200, 0)))
        .do("C", (c) => answer(c, "C"))
        .do("SPLINE closed fit", (c) => c.command("SPLINE"))
        .do("M", (c) => answer(c, "M"))
        .do("F", (c) => answer(c, "F"))
        .do("first", (c) => c.click(at(0, 0)))
        .do("second", (c) => c.click(at(100, 0)))
        .do("third", (c) => c.click(at(50, 80)))
        .do("C", (c) => answer(c, "C"))
        .do("enter repeats SPLINE", (c) => c.enter())
    )
    walk("RECTANG and POLYGON", createHarness(), (s) =>
      s
        .do("RECTANG", (c) => c.command("REC"))
        .do("E", (c) => answer(c, "E"))
        .do("elevation", (c) => c.type("5"))
        .do("enter", (c) => c.enter())
        .do("T", (c) => answer(c, "T"))
        .do("thickness", (c) => c.type("2"))
        .do("enter", (c) => c.enter())
        .do("first corner", (c) => c.click(at(0, 0)))
        .do("other corner", (c) => c.click(at(200, 120)))
        .do("RECTANG with modes", (c) => c.command("RECTANG"))
        .do("escape", (c) => c.escape())
        .do("POLYGON", (c) => c.command("POL"))
        .do("sides", (c) => c.type("6"))
        .do("enter", (c) => c.enter())
        .do("centre", (c) => c.type("0,0"))
        .do("enter", (c) => c.enter())
        .do("C", (c) => answer(c, "C"))
        .do("radius", (c) => c.type("100"))
        .do("enter", (c) => c.enter())
        .do("POLYGON again", (c) => c.command("POL"))
        .do("enter", (c) => c.enter())
        .do("E", (c) => answer(c, "E"))
        .do("first endpoint", (c) => c.click(at(300, 0)))
        .do("second endpoint", (c) => c.click(at(400, 0)))
        .do("POLYGON refused", (c) => c.command("POL"))
        .do("sides", (c) => c.type("2"))
        .do("enter", (c) => c.enter())
    )
  })

  it("hatches", () => {
    walk("HATCH", createHarness({ entities: square() }), (s) =>
      s
        .do("HATCH", (c) => c.command("H"))
        .do("quick preview", (c) => c.moveTo(at(50, 50)))
        .do("P", (c) => answer(c, "P"))
        .do("?", (c) => c.type("?"))
        .do("enter", (c) => c.enter())
        .do("P", (c) => answer(c, "P"))
        .do("unknown pattern", (c) => c.type("NOPE"))
        .do("enter", (c) => c.enter())
        .do("ANSI31", (c) => c.type("ANSI31"))
        .do("enter", (c) => c.enter())
        .do("scale", (c) => c.type("0.0001"))
        .do("enter", (c) => c.enter())
        .do("angle", (c) => c.type("0"))
        .do("enter", (c) => c.enter())
        .do("pick inside", (c) => c.click(at(50, 50)))
        .do("pick outside", (c) => c.click(at(500, 500)))
        .do("S", (c) => answer(c, "S"))
        .do("pick object", (c) => c.click(at(50, 0)))
        .do("enter", (c) => c.enter())
    )
    walk("-HATCH", createHarness({ entities: square() }), (s) =>
      s
        .do("-HATCH", (c) => c.command("-H"))
        .do("pick inside", (c) => c.click(at(50, 50)))
        .do("escape", (c) => c.escape())
        .do("-HATCH again", (c) => c.command("-HATCH"))
        .do("S", (c) => answer(c, "S"))
        .do("pick line", (c) => c.click(at(50, 0)))
        .do("enter", (c) => c.enter())
        .do("enter", (c) => c.enter())
    )
  })

  it("makes and places blocks", () => {
    walk("BLOCK", createHarness({ entities: [line()] }), (s) =>
      s
        .do("BLOCK", (c) => c.command("B"))
        .do("?", (c) => c.type("?"))
        .do("enter", (c) => c.enter())
        .do("name", (c) => c.type("BAR"))
        .do("enter", (c) => c.enter())
        .do("base", (c) => c.click(at(0, 0)))
        .do("pick", (c) => c.click(at(50, 0)))
        .do("enter", (c) => c.enter())
    )
    walk(
      "INSERT",
      createHarness({
        blocks: [bar(), createBlockDefinition("NUT", p(0, 0), [line()])],
      }),
      (s) =>
        s
          .do("INSERT", (c) => c.command("I"))
          .do("?", (c) => c.type("?"))
          .do("enter", (c) => c.enter())
          .do("unknown", (c) => c.type("NOPE"))
          .do("enter", (c) => c.enter())
          .do("name", (c) => c.type("BAR"))
          .do("enter", (c) => c.enter())
          .do("S", (c) => answer(c, "S"))
          .do("scale", (c) => c.type("2"))
          .do("enter", (c) => c.enter())
          .do("R", (c) => answer(c, "R"))
          .do("rotation", (c) => c.type("90"))
          .do("enter", (c) => c.enter())
          .do("place", (c) => c.click(at(300, 50)))
    )
    walk("BLOCK ? with none", createHarness(), (s) =>
      s
        .do("BLOCK", (c) => c.command("BLOCK"))
        .do("?", (c) => c.type("?"))
        .do("enter", (c) => c.enter())
        .do("INSERT", (c) => c.command("INSERT"))
        .do("?", (c) => c.type("?"))
        .do("enter", (c) => c.enter())
    )
  })

  it("writes and edits text", () => {
    walk("TEXT", createHarness(), (s) =>
      s
        .do("TEXT", (c) => c.command("DT"))
        .do("enter", (c) => c.enter())
        .do("S", (c) => answer(c, "S"))
        .do("missing style", (c) => c.type("Fancy"))
        .do("enter", (c) => c.enter())
        .do("Standard", (c) => c.type("Standard"))
        .do("enter", (c) => c.enter())
        .do("J", (c) => answer(c, "J"))
        .do("nope", (c) => answer(c, "nope"))
        .do("enter", (c) => c.enter())
        .do("tc", (c) => answer(c, "tc"))
        .do("start", (c) => c.click(at(0, 0)))
        .do("height", (c) => c.type("5"))
        .do("enter", (c) => c.enter())
        .do("rotation", (c) => c.type("0"))
        .do("enter", (c) => c.enter())
        .do("content", (c) => c.type("HELLO"))
        .do("enter", (c) => c.enter())
        .do("escape", (c) => c.escape())
    )
    walk(
      "TEXTEDIT",
      createHarness({
        entities: [textOf(p(0, 0), "WORD", { id: "T1", height: 10 })],
      }),
      (s) =>
        s
          .do("TEXTEDIT", (c) => c.command("ED"))
          .do("pick", (c) => c.click(at(20, 5)))
          .do("retype", (c) => c.type("NEW"))
          .do("enter", (c) => c.enter())
          .do("U", (c) => answer(c, "U"))
          .do("M", (c) => answer(c, "M"))
          .do("pick", (c) => c.click(at(20, 5)))
          .do("enter", (c) => c.enter())
          .do("double-click", (c) => c.doubleClick(at(20, 5)))
          .do("escape", (c) => c.escape())
    )
    walk("MTEXT", createHarness(), (s) =>
      s
        .do("MTEXT", (c) => c.command("T"))
        .do("first corner", (c) => c.click(at(0, 0)))
        .do("H", (c) => answer(c, "H"))
        .do("height", (c) => c.type("10"))
        .do("enter", (c) => c.enter())
        .do("J", (c) => answer(c, "J"))
        .do("MC", (c) => c.option("MC"))
        .do("L", (c) => answer(c, "L"))
        .do("E", (c) => answer(c, "E"))
        .do("spacing", (c) => c.type("1.5x"))
        .do("enter", (c) => c.enter())
        .do("R", (c) => answer(c, "R"))
        .do("rotation", (c) => c.type("0"))
        .do("enter", (c) => c.enter())
        .do("S", (c) => answer(c, "S"))
        .do("missing style", (c) => c.type("Fancy"))
        .do("enter", (c) => c.enter())
        .do("Standard", (c) => c.type("Standard"))
        .do("enter", (c) => c.enter())
        .do("W", (c) => answer(c, "W"))
        .do("width", (c) => c.type("120"))
        .do("enter", (c) => c.enter())
        .do("content", (c) => c.type("FIRST LINE\nSECOND"))
        .do("ctrl+enter", (c) => c.enter())
        .do("select", (c) => c.select(c.latest().id))
    )
    walk("-TEXT", createHarness(), (s) =>
      s
        .do("-TEXT", (c) => c.command("-TEXT"))
        .do("enter", (c) => c.enter())
        .do("start", (c) => c.click(at(0, 0)))
        .do("height", (c) => c.type("0"))
        .do("enter", (c) => c.enter())
        .do("enter", (c) => c.enter())
        .do("enter", (c) => c.enter())
        .do("content", (c) => c.type("ONE"))
        .do("enter", (c) => c.enter())
    )
    walk("-MTEXT", createHarness(), (s) =>
      s
        .do("-MTEXT", (c) => c.command("-MTEXT"))
        .do("first corner", (c) => c.click(at(0, 0)))
        .do("opposite corner", (c) => c.click(at(200, -100)))
        .do("line", (c) => c.type("ONE"))
        .do("enter", (c) => c.enter())
        .do("enter", (c) => c.enter())
    )
    walk(
      "MTEXT edit",
      createHarness({
        entities: [
          createMText(p(0, 0), "OLD\\PLINES", { height: 10, width: 200 }),
        ],
      }),
      (s) =>
        s
          .do("double-click", (c) => c.doubleClick(at(10, -5)))
          .do("escape", (c) => c.escape())
    )
  })

  it("dimensions", () => {
    walk("DIMLINEAR", createHarness(), (s) =>
      s
        .do("DIMLINEAR", (c) => c.command("DLI"))
        .do("first", (c) => c.click(at(0, 0)))
        .do("second", (c) => c.click(at(100, 0)))
        .do("T", (c) => answer(c, "T"))
        .do("text", (c) => c.type("<> TYP"))
        .do("enter", (c) => c.enter())
        .do("A", (c) => answer(c, "A"))
        .do("angle", (c) => c.type("10"))
        .do("enter", (c) => c.enter())
        .do("H", (c) => answer(c, "H"))
        .do("V", (c) => answer(c, "V"))
        .do("R", (c) => answer(c, "R"))
        .do("rotation", (c) => c.type("30"))
        .do("enter", (c) => c.enter())
        .do("location", (c) => c.click(at(50, 40)))
        .do("DIMALIGNED", (c) => c.command("DAL"))
        .do("first", (c) => c.click(at(0, 0)))
        .do("second", (c) => c.click(at(60, 80)))
        .do("location", (c) => c.click(at(-40, 60)))
    )
    walk(
      "DIMLINEAR select object",
      createHarness({ entities: [line()] }),
      (s) =>
        s
          .do("DIMLINEAR", (c) => c.command("DIMLINEAR"))
          .do("enter", (c) => c.enter())
          .do("pick", (c) => c.click(at(50, 0)))
          .do("location", (c) => c.click(at(50, 30)))
    )
    walk(
      "DIMRADIUS and DIMDIAMETER",
      createHarness({ entities: [circleOf(p(0, 0), 50)] }),
      (s) =>
        s
          .do("DIMRADIUS", (c) => c.command("DRA"))
          .do("pick", (c) => c.click(at(50, 0)))
          .do("T", (c) => answer(c, "T"))
          .do("text", (c) => c.type("R<>"))
          .do("enter", (c) => c.enter())
          .do("A", (c) => answer(c, "A"))
          .do("angle", (c) => c.type("15"))
          .do("enter", (c) => c.enter())
          .do("location", (c) => c.click(at(80, 0)))
          .do("DIMDIAMETER", (c) => c.command("DDI"))
          .do("pick", (c) => c.click(at(0, 50)))
          .do("location", (c) => c.click(at(0, 80)))
    )
    walk("DIMANGULAR", createHarness(), (s) =>
      s
        .do("DIMANGULAR", (c) => c.command("DAN"))
        .do("enter", (c) => c.enter())
        .do("vertex", (c) => c.click(at(0, 0)))
        .do("first endpoint", (c) => c.click(at(100, 0)))
        .do("second endpoint", (c) => c.click(at(0, 100)))
        .do("T", (c) => answer(c, "T"))
        .do("text", (c) => c.type("<> TYP"))
        .do("enter", (c) => c.enter())
        .do("A", (c) => answer(c, "A"))
        .do("angle", (c) => c.type("30"))
        .do("enter", (c) => c.enter())
        .do("arc location", (c) => c.click(at(60, 60)))
    )
    walk(
      "DIMANGULAR lines",
      createHarness({
        entities: [lineOf(p(0, 0), p(100, 0)), lineOf(p(0, 0), p(0, 100))],
      }),
      (s) =>
        s
          .do("DIMANGULAR", (c) => c.command("DIMANGULAR"))
          .do("first line", (c) => c.click(at(100, 0)))
          .do("second line", (c) => c.click(at(0, 100)))
          .do("escape", (c) => c.escape())
    )
    walk(
      "DIMBASELINE and DIMCONTINUE",
      createHarness({
        entities: [createDimension("linear", p(0, 0), p(100, 0), p(50, -30))],
      }),
      (s) =>
        s
          .do("DIMBASELINE", (c) => c.command("DBA"))
          .do("second origin", (c) => c.click(at(180, 0)))
          .do("U", (c) => answer(c, "U"))
          .do("S", (c) => answer(c, "S"))
          .do("pick", (c) => c.click(at(95, -30)))
          .do("escape", (c) => c.escape())
          .do("DIMCONTINUE", (c) => c.command("DCO"))
          .do("second origin", (c) => c.click(at(180, 0)))
          .do("escape", (c) => c.escape())
          .do("DIMBASELINE with none", (c) => {
            c.undo().undo()
            c.select(...c.entities().map((e) => e.id)).command("ERASE")
            c.command("DIMBASELINE")
          })
    )
    walk(
      "DIMSPACE",
      createHarness({
        entities: [
          createDimension("linear", p(0, 0), p(100, 0), p(50, 20), {
            id: "D1",
          }),
          createDimension("linear", p(0, 0), p(100, 0), p(50, 25), {
            id: "D2",
          }),
          createDimension("linear", p(0, 0), p(100, 0), p(50, 60), {
            id: "D3",
          }),
        ],
      }),
      (s) =>
        s
          .do("DIMSPACE", (c) => c.command("DIMSPACE"))
          .do("base", (c) => c.click(at(50, 20)))
          .do("pick", (c) => c.click(at(50, 25)))
          .do("pick", (c) => c.click(at(50, 60)))
          .do("enter", (c) => c.enter())
          .do("A", (c) => answer(c, "A"))
    )
  })

  it("modifies", () => {
    walk("OFFSET", createHarness({ entities: [line()] }), (s) =>
      s
        .do("OFFSET", (c) => c.command("O"))
        .do("E", (c) => answer(c, "E"))
        .do("Y", (c) => answer(c, "Y"))
        .do("L", (c) => answer(c, "L"))
        .do("C", (c) => answer(c, "C"))
        .do("distance", (c) => c.type("20"))
        .do("enter", (c) => c.enter())
        .do("pick", (c) => c.click(at(50, 0)))
        .do("M", (c) => answer(c, "M"))
        .do("side", (c) => c.click(at(50, 50)))
        .do("enter", (c) => c.enter())
        .do("U", (c) => answer(c, "U"))
        .do("enter", (c) => c.enter())
        .do("OFFSET T", (c) => answer(c.command("O"), "T"))
        .do("pick", (c) => c.click(at(50, 0)))
        .do("through", (c) => c.click(at(50, -30)))
        .do("escape", (c) => c.escape())
    )
    for (const [name, alias] of [
      ["MOVE", "M"],
      ["COPY", "CO"],
      ["STRETCH", "S"],
    ]) {
      walk(name, createHarness({ entities: [line()] }), (s) =>
        s
          .do(name, (c) => c.command(alias))
          .do("pick", (c) =>
            name === "STRETCH"
              ? c.drag(at(120, 20), at(80, -20))
              : c.click(at(50, 0))
          )
          .do("enter", (c) => c.enter())
          .do("base", (c) => c.click(at(0, 0)))
          .do("move", (c) => c.moveTo(at(30, 30)))
          .do("second", (c) => c.click(at(50, 30)))
          .do("escape", (c) => c.escape())
      )
    }
    walk("ROTATE", createHarness({ entities: [line()] }), (s) =>
      s
        .do("ROTATE", (c) => c.select("L1").command("RO"))
        .do("base", (c) => c.click(at(0, 0)))
        .do("C", (c) => answer(c, "C"))
        .do("R", (c) => answer(c, "R"))
        .do("reference", (c) => c.type("0"))
        .do("enter", (c) => c.enter())
        .do("new angle", (c) => c.type("90"))
        .do("enter", (c) => c.enter())
        .do("ROTATE by points", (c) => c.select("L1").command("ROTATE"))
        .do("base", (c) => c.click(at(0, 0)))
        .do("R", (c) => answer(c, "R"))
        .do("first reference point", (c) => c.click(at(0, 0)))
        .do("second reference point", (c) => c.click(at(0, 100)))
        .do("escape", (c) => c.escape())
    )
    walk("SCALE", createHarness({ entities: [line()] }), (s) =>
      s
        .do("SCALE", (c) => c.select("L1").command("SC"))
        .do("base", (c) => c.click(at(0, 0)))
        .do("C", (c) => answer(c, "C"))
        .do("R", (c) => answer(c, "R"))
        .do("reference", (c) => c.type("100"))
        .do("enter", (c) => c.enter())
        .do("new length", (c) => c.type("50"))
        .do("enter", (c) => c.enter())
        .do("SCALE by points", (c) => c.select("L1").command("SCALE"))
        .do("base", (c) => c.click(at(0, 0)))
        .do("R", (c) => answer(c, "R"))
        .do("first reference point", (c) => c.click(at(0, 0)))
        .do("second reference point", (c) => c.click(at(0, 100)))
        .do("escape", (c) => c.escape())
    )
    walk("MIRROR", createHarness({ entities: [line()] }), (s) =>
      s
        .do("MIRROR", (c) => c.select("L1").command("MI"))
        .do("first", (c) => c.click(at(0, 50)))
        .do("second", (c) => c.click(at(100, 50)))
        .do("Y", (c) => answer(c, "Y"))
        .do("MIRROR N", (c) => c.select("L1").command("MIRROR"))
        .do("first", (c) => c.click(at(0, 50)))
        .do("second", (c) => c.click(at(100, 50)))
        .do("N", (c) => answer(c, "N"))
    )
    walk(
      "arrays",
      createHarness({
        entities: [
          circleOf(p(0, 0), 10, { id: "SRC" }),
          lineOf(p(0, 100), p(300, 100), { id: "PATH" }),
        ],
      }),
      (s) =>
        s
          .do("ARRAY", (c) => c.select("SRC").command("AR"))
          .do("_X", (c) => answer(c, "_X"))
          .do("PO", (c) => answer(c, "PO"))
          .do("centre", (c) => c.click(at(0, -100)))
          // Loose copies from here on, SRC kept for the next runs.
          .do("AS", (c) => answer(c, "AS"))
          .do("N", (c) => answer(c, "N"))
          .do("enter", (c) => c.enter())
          .do("ARRAYRECT", (c) => c.select("SRC").command("ARRAYRECT"))
          .do("S", (c) => answer(c, "S"))
          .do("U", (c) => answer(c, "U"))
          .do("FOO", (c) => c.type("FOO").enter())
          .do("S", (c) => answer(c, "S"))
          .do("U", (c) => answer(c, "U"))
          .do("corner", (c) => c.click(at(0, 0)))
          .do("opposite", (c) => c.click(at(60, 40)))
          .do("enter", (c) => c.enter())
          .do("ARRAYPOLAR", (c) => c.select("SRC").command("ARRAYPOLAR"))
          .do("centre", (c) => c.click(at(0, -100)))
          .do("R", (c) => answer(c, "R"))
          .do("ROT", (c) => answer(c, "ROT"))
          .do("enter", (c) => c.enter())
          .do("enter", (c) => c.enter())
          .do("ARRAYPATH", (c) => c.select("SRC").command("ARRAYPATH"))
          .do("path", (c) => c.click(at(150, 100)))
          .do("M", (c) => answer(c, "M"))
          .do("A", (c) => answer(c, "A"))
          .do("M back", (c) => answer(c, "M"))
          .do("AS", (c) => answer(c, "AS"))
          .do("Y", (c) => answer(c, "Y"))
          .do("enter", (c) => c.enter())
          .do("pick the array", (c) => c.click(at(10, 0)))
    )
    walk(
      "TRIM EXTEND FILLET CHAMFER",
      createHarness({
        entities: [
          ...corner(),
          lineOf(p(-50, 300), p(250, 300), { id: "T" }),
          lineOf(p(100, 250), p(100, 350), { id: "U" }),
          polylineOf([p(-300, 0), p(-300, 100), p(-200, 100)], { id: "PL" }),
        ],
      }),
      (s) =>
        s
          .do("TRIM", (c) => c.command("TR"))
          .do("trim", (c) => c.click(at(200, 300)))
          .do("U", (c) => answer(c, "U"))
          .do("escape", (c) => c.escape())
          .do("EXTEND", (c) => c.command("EX"))
          .do("escape", (c) => c.escape())
          .do("FILLET", (c) => c.command("F"))
          .do("R", (c) => answer(c, "R"))
          .do("radius", (c) => c.type("20"))
          .do("enter", (c) => c.enter())
          .do("M", (c) => answer(c, "M"))
          .do("first", (c) => c.click(at(100, 0)))
          .do("second", (c) => c.click(at(0, 100)))
          .do("U", (c) => answer(c, "U"))
          .do("P", (c) => answer(c, "P"))
          .do("polyline", (c) => c.click(at(-300, 50)))
          .do("enter", (c) => c.enter())
          .do("CHAMFER", (c) => c.command("CHA"))
          .do("D", (c) => answer(c, "D"))
          .do("first distance", (c) => c.type("10"))
          .do("enter", (c) => c.enter())
          .do("enter", (c) => c.enter())
          .do("first", (c) => c.click(at(100, 0)))
          .do("second", (c) => c.click(at(0, 100), { shiftKey: true }))
          .do("CHAMFER", (c) => c.command("CHA"))
          .do("P", (c) => answer(c, "P"))
          .do("polyline", (c) => c.click(at(-250, 100)))
    )
    walk(
      "EXPLODE JOIN",
      createHarness({
        entities: [
          line(),
          circleOf(p(0, 0), 10, { id: "C1" }),
          rectOf(p(200, 200), p(300, 300), { id: "R1" }),
        ],
      }),
      (s) =>
        s
          .do("EXPLODE one rejected", (c) => c.select("L1", "R1").command("X"))
          .do("EXPLODE two rejected", (c) =>
            c
              .select(
                ...c
                  .entities()
                  .slice(0, 2)
                  .map((e) => e.id)
              )
              .command("X")
          )
          .do("escape", (c) => c.escape())
          .do("JOIN", (c) =>
            c
              .select(
                ...c
                  .entities()
                  .slice(0, 2)
                  .map((e) => e.id)
              )
              .command("J")
          )
          .do("escape", (c) => c.escape())
    )
    walk(
      "JOIN made",
      createHarness({
        entities: [
          lineOf(p(0, 0), p(50, 0), { id: "J1" }),
          lineOf(p(50, 0), p(100, 0), { id: "J2" }),
          arcOf(p(0, 300), 50, 0, Math.PI / 2, { id: "R1" }),
          arcOf(p(0, 300), 50, -Math.PI / 2, 0, { id: "R2" }),
          arcOf(p(300, 300), 50, 0, Math.PI / 2, { id: "R3" }),
          arcOf(p(300, 300), 50, Math.PI, 1.5 * Math.PI, { id: "R4" }),
          polylineOf([p(300, 0), p(350, 0)], { id: "P1" }),
          lineOf(p(350, 0), p(350, 50), { id: "J3" }),
          lineOf(p(0, -300), p(50, -300), { id: "J4" }),
          lineOf(p(50, -300), p(50, -250), { id: "J5" }),
        ],
      }),
      (s) =>
        s
          .do("lines", (c) => c.select("J1", "J2").command("J"))
          .do("arcs", (c) => c.select("R3", "R4").command("J"))
          .do("circle", (c) => c.select("R1", "R2").command("J"))
          .do("enter", (c) => c.enter())
          .do("polyline", (c) => c.select("P1", "J3").command("J"))
          .do("new polyline", (c) => c.select("J4", "J5").command("J"))
    )
    walk(
      "BREAK",
      createHarness({ entities: [lineOf(p(-100, 0), p(100, 0))] }),
      (s) =>
        s
          .do("BREAK", (c) => c.command("BR"))
          .do("pick", (c) => c.click(at(-50, 0)))
          .do("F", (c) => answer(c, "F"))
          .do("first", (c) => c.click(at(-20, 0)))
          .do("second", (c) => c.click(at(20, 0)))
          .do("BREAKATPOINT", (c) => c.command("BREAKATPOINT"))
          .do("pick", (c) => c.click(at(-80, 0)))
          .do("point", (c) => c.click(at(-60, 0)))
    )
    walk(
      "MATCHPROP",
      createHarness({ entities: [line(), circleOf(p(0, 50), 10)] }),
      (s) =>
        s
          .do("MATCHPROP", (c) => c.command("MA"))
          .do("source", (c) => c.click(at(50, 0)))
          .do("escape", (c) => c.escape())
    )
    walk("clipboard copies", createHarness({ entities: [line()] }), (s) =>
      s
        .do("COPYCLIP", (c) => c.command("COPYCLIP"))
        .do("pick", (c) => c.click(at(50, 0)))
        .do("enter", (c) => c.enter())
        .do("CUTCLIP", (c) => c.select("L1").command("CUTCLIP"))
        .do("undo", (c) => c.undo())
        .do("COPYBASE", (c) => c.command("COPYBASE"))
        .do("escape", (c) => c.escape())
    )
  })

  it("measures and views", () => {
    walk("DIST AREA", createHarness(), (s) =>
      s
        .do("DIST", (c) => c.command("DI"))
        .do("first", (c) => c.click(at(0, 0)))
        .do("move", (c) => c.moveTo(at(300, 400)))
        .do("second", (c) => c.click(at(300, 400)))
        .do("DIST again", (c) => c.command("DIST"))
        .do("typed first", (c) => c.type("0,0").enter())
        .do("typed second", (c) => c.type("@30,40,120").enter())
        .do("DIST Multiple", (c) => c.command("DIST").click(at(0, 0)))
        .do("Multiple", (c) => c.option("Multiple"))
        .do("next", (c) => c.click(at(300, 0)))
        .do("Length", (c) => c.option("Length"))
        .do("length", (c) => c.type("100").enter())
        .do("Total", (c) => c.enter())
        .do("AREA", (c) => c.command("AA"))
        .do("first", (c) => c.click(at(0, 0)))
        .do("second", (c) => c.click(at(100, 0)))
        .do("move", (c) => c.moveTo(at(100, 100)))
        .do("U", (c) => answer(c, "U"))
        .do("second", (c) => c.click(at(100, 0)))
        .do("third", (c) => c.click(at(100, 100)))
        .do("enter", (c) => c.enter())
        .do("AREA Object", (c) => c.command("AREA"))
        .do("enter", (c) => c.enter())
        .do("FOO", (c) => answer(c, "FOO"))
        .do("escape", (c) => c.escape())
    )
    walk("ZOOM PAN", createHarness({ entities: [line()] }), (s) =>
      s
        .do("ZOOM", (c) => c.command("Z"))
        .do("S", (c) => answer(c, "S"))
        .do("factor", (c) => c.type("2"))
        .do("enter", (c) => c.enter())
        .do("ZOOM A", (c) => c.command("ZOOM"))
        .do("A", (c) => answer(c, "A"))
        .do("ZOOM E", (c) => c.command("ZOOM"))
        .do("E", (c) => answer(c, "E"))
        .do("ZOOM P", (c) => c.command("ZOOM"))
        .do("P", (c) => answer(c, "P"))
        .do("ZOOM O", (c) => c.command("ZOOM"))
        .do("O", (c) => answer(c, "O"))
        .do("pick", (c) => c.click(at(50, 0)))
        .do("enter", (c) => c.enter())
        .do("ZOOM W", (c) => c.command("ZOOM"))
        .do("W", (c) => answer(c, "W"))
        .do("escape", (c) => c.escape())
        .do("PAN", (c) => c.command("P"))
        .do("escape", (c) => c.escape())
        .do("-PAN", (c) => c.command("-PAN"))
        .do("enter", (c) => c.enter())
        .do("base", (c) => c.click(at(0, 0)))
        .do("second", (c) => c.click(at(50, 0)))
    )
    walk("UCS UCSICON", createHarness({ entities: [line()] }), (s) =>
      s
        .do("UCS", (c) => c.command("UCS"))
        .do("origin", (c) => c.click(at(100, 0)))
        .do("x axis", (c) => c.click(at(100, 100)))
        .do("enter accepts", (c) => c.enter())
        .do("UCS Z", (c) => c.command("UCS"))
        .do("Z", (c) => answer(c, "Z"))
        .do("angle", (c) => c.type("45"))
        .do("enter", (c) => c.enter())
        .do("UCS NA", (c) => c.command("UCS"))
        .do("NA", (c) => answer(c, "NA"))
        .do("S", (c) => answer(c, "S"))
        .do("name", (c) => c.type("PLOT"))
        .do("enter", (c) => c.enter())
        .do("UCS NA ?", (c) => c.command("UCS"))
        .do("NA", (c) => answer(c, "NA"))
        .do("?", (c) => c.type("?"))
        .do("enter", (c) => c.enter())
        .do("all", (c) => c.enter())
        .do("R", (c) => answer(c, "R"))
        .do("unknown", (c) => c.type("NOPE"))
        .do("enter", (c) => c.enter())
        .do("escape", (c) => c.escape())
        .do("UCS W", (c) => c.command("UCS"))
        .do("W", (c) => answer(c, "W"))
        .do("UCS P", (c) => c.command("UCS"))
        .do("P", (c) => answer(c, "P"))
        .do("UCS OB", (c) => c.command("UCS"))
        .do("OB", (c) => answer(c, "OB"))
        .do("pick", (c) => c.click(at(90, 0)))
        .do("UCSICON", (c) => c.command("UCSICON"))
        .do("N", (c) => answer(c, "N"))
        .do("PLAN", (c) => c.command("PLAN"))
        .do("U", (c) => answer(c, "U"))
        .do("?", (c) => c.type("?"))
        .do("enter", (c) => c.enter())
        .do("all", (c) => c.enter())
        .do("unknown", (c) => c.type("NOPE"))
        .do("enter", (c) => c.enter())
        .do("name", (c) => c.type("PLOT"))
        .do("enter", (c) => c.enter())
        .do("PLAN enter", (c) => c.command("PLAN"))
        .do("enter is Current ucs", (c) => c.enter())
        .do("PLAN W", (c) => c.command("PLAN"))
        .do("W", (c) => answer(c, "W"))
    )
    walk("UCS tilted", createHarness({ entities: [line()] }), (s) =>
      s
        .do("UCS X", (c) => c.command("UCS"))
        .do("X", (c) => answer(c, "X"))
        .do("angle", (c) => c.type("90"))
        .do("enter", (c) => c.enter())
        .do("UCS Y", (c) => c.command("UCS"))
        .do("Y", (c) => answer(c, "Y"))
        .do("enter", (c) => c.enter())
        .do("UCS ZA", (c) => c.command("UCS"))
        .do("ZA", (c) => answer(c, "ZA"))
        .do("origin", (c) => c.enter())
        .do("z point", (c) => c.type("1,0,0"))
        .do("enter", (c) => c.enter())
        .do("UCS ZA O", (c) => c.command("UCS"))
        .do("ZA", (c) => answer(c, "ZA"))
        .do("O", (c) => answer(c, "O"))
        .do("pick", (c) => c.click(at(90, 0)))
        .do("UCS NA", (c) => c.command("UCS"))
        .do("NA", (c) => answer(c, "NA"))
        .do("S", (c) => answer(c, "S"))
        .do("name", (c) => c.type("END"))
        .do("enter", (c) => c.enter())
        .do("UCS W", (c) => c.command("UCS"))
        .do("W", (c) => answer(c, "W"))
        .do("UCS NA ?", (c) => c.command("UCS"))
        .do("NA", (c) => answer(c, "NA"))
        .do("?", (c) => c.type("?"))
        .do("enter", (c) => c.enter())
        .do("all", (c) => c.enter())
        .do("escape", (c) => c.escape())
    )
    walk("ELEV", createHarness(), (s) =>
      s
        .do("ELEV", (c) => c.command("ELEV"))
        .do("elevation", (c) => c.type("5"))
        .do("enter", (c) => c.enter())
        .do("thickness", (c) => c.type("-2"))
        .do("enter", (c) => c.enter())
        .do("ELEV again", (c) => c.command("ELEV"))
        .do("escape", (c) => c.escape())
    )
    walk("LTSCALE", createHarness(), (s) =>
      s
        .do("LTSCALE", (c) => c.command("LTSCALE"))
        .do("zero", (c) => c.type("0").enter())
        .do("factor", (c) => c.type("2.5").enter())
        .do("LTS enter", (c) => c.command("LTS").enter())
    )
    walk("FILL", createHarness(), (s) =>
      s
        .do("FILL", (c) => c.command("FILL"))
        .do("FOO", (c) => answer(c, "FOO"))
        .do("O", (c) => answer(c, "O"))
        .do("OF", (c) => answer(c, "OF"))
        .do("FILL again", (c) => c.command("FILL"))
        .do("1", (c) => answer(c, "1"))
        .do("U", (c) => c.command("U"))
    )
    walk("-COLOR", createHarness(), (s) =>
      s
        .do("-COLOR", (c) => c.command("-COLOR"))
        .do("pink", (c) => c.type("pink").enter())
        .do("red", (c) => c.type("red").enter())
        .do("COLOR", (c) => c.command("COLOR"))
        .do("T", (c) => c.type("T").enter())
        .do("rgb", (c) => c.type("210,155,95").enter())
    )
    walk("-LINETYPE", createHarness(), (s) =>
      s
        .do("-LINETYPE", (c) => c.command("-LINETYPE"))
        .do("?", (c) => answer(c, "?"))
        .do("S", (c) => answer(c, "S"))
        .do("?", (c) => c.type("?").enter())
        .do("pattern", (c) => c.type("C*").enter())
        .do("S", (c) => answer(c, "S"))
        .do("name", (c) => c.type("Center").enter())
        .do("enter", (c) => c.enter())
        .do("unknown", (c) =>
          c.command("LT").option("Set").type("NOPE").enter()
        )
    )
    walk("-LWEIGHT", createHarness(), (s) =>
      s
        .do("-LWEIGHT", (c) => c.command("-LWEIGHT"))
        .do("?", (c) => c.type("?").enter())
        .do("value", (c) => c.type("0.33").enter())
        .do("LW", (c) => c.command("LW"))
        .do("enter", (c) => c.enter())
    )
    walk("ID", createHarness(), (s) =>
      s
        .do("ID", (c) => c.command("ID"))
        .do("pick", (c) => c.click(at(30, 40)))
        .do("ID typed", (c) => c.command("ID"))
        .do("point", (c) => c.type("1,2,3").enter())
    )
    walk("VPOINT VIEW", createHarness({ entities: [line()] }), (s) =>
      s
        .do("VPOINT", (c) => c.command("VPOINT"))
        .do("view point", (c) => c.type("1,-1,1").enter())
        .do("-VPOINT R", (c) => c.command("-VPOINT"))
        .do("R", (c) => answer(c, "R"))
        .do("in plane", (c) => c.type("225").enter())
        .do("from plane", (c) => c.type("35").enter())
        .do("-VIEW", (c) => c.command("-VIEW"))
        .do("O", (c) => answer(c, "O"))
        .do("F", (c) => answer(c, "F"))
        .do("-VIEW _SWISO", (c) => c.command("-VIEW"))
        .do("_SWISO", (c) => {
          for (const char of "_SWISO") c.press(char)
          c.press("Enter")
        })
        .do("VIEW O enter", (c) => c.command("VIEW"))
        .do("O", (c) => answer(c, "O"))
        .do("enter is Top", (c) => c.enter())
        .do("NAVVCUBE", (c) => c.command("NAVVCUBE"))
        .do("OFF", (c) => answer(c, "OFF"))
        .do("CUBE", (c) => c.command("CUBE"))
        .do("ON", (c) => answer(c, "ON"))
    )
  })

  it("edits with grips", () => {
    walk(
      "grips",
      createHarness({
        entities: [
          line(),
          circleOf(p(0, 300), 50, { id: "C1" }),
          arcOf(p(300, 300), 50, 0, Math.PI / 2, { id: "A1" }),
          polylineOf([p(0, -300), p(100, -300), p(100, -200)], {
            id: "P1",
            bulges: [0, 0.5],
          }),
          createDimension("linear", p(300, 0), p(400, 0), p(350, -40), {
            id: "D1",
          }),
        ],
      }),
      (s) =>
        s
          .do("select line", (c) => c.click(at(50, 0)))
          .do("grab end", (c) => c.mouseDown(at(100, 0)))
          .do("drag", (c) => c.moveTo(at(150, 0)))
          .do("release", (c) => c.mouseUp(at(150, 0)))
          .do("grab middle", (c) => c.mouseDown(at(75, 0)))
          .do("drag", (c) => c.moveTo(at(75, 40)))
          .do("release", (c) => c.mouseUp(at(75, 40)))
          .do("escape", (c) => c.escape())
          .do("select circle", (c) => c.click(at(50, 300)))
          .do("grab quadrant", (c) => c.mouseDown(at(50, 300)))
          .do("drag", (c) => c.moveTo(at(70, 300)))
          .do("release", (c) => c.mouseUp(at(70, 300)))
          .do("escape", (c) => c.escape())
          .do("select arc", (c) =>
            c.click(at(300 + 50 * Math.SQRT1_2, 300 + 50 * Math.SQRT1_2))
          )
          .do("grab end", (c) => c.mouseDown(at(350, 300)))
          .do("drag", (c) => c.moveTo(at(340, 330)))
          .do("release", (c) => c.mouseUp(at(340, 330)))
          .do("escape", (c) => c.escape())
          .do("select polyline", (c) => c.click(at(50, -300)))
          .do("grab vertex", (c) => c.mouseDown(at(100, -300)))
          .do("drag", (c) => c.moveTo(at(120, -300)))
          .do("release", (c) => c.mouseUp(at(120, -300)))
          .do("grab straight midpoint", (c) => c.mouseDown(at(60, -300)))
          .do("drag", (c) => c.moveTo(at(60, -320)))
          .do("release", (c) => c.mouseUp(at(60, -320)))
          .do("escape", (c) => c.escape())
          .do("select dimension", (c) => c.click(at(350, -40)))
          .do("grab definition point", (c) => c.mouseDown(at(300, 0)))
          .do("drag", (c) => c.moveTo(at(290, 0)))
          .do("release", (c) => c.mouseUp(at(290, 0)))
          .do("escape", (c) => c.escape())
    )
    const typed = (c: CadHarness, ...texts: string[]) => {
      for (const text of texts) {
        c.runtime.setCommandLineText(text)
        c.runtime.submitCommandLine()
      }
    }
    walk(
      "array grips and palette",
      createHarness({
        entities: [
          circleOf(p(-30, 0), 2, { id: "R" }),
          circleOf(p(23, 43), 3, { id: "O" }),
          lineOf(p(60, 0), p(140, 0), { id: "PATH" }),
          circleOf(p(62, 5), 2, { id: "Q" }),
        ],
      }),
      (s) =>
        s
          .do("the three arrays", (c) => {
            typed(c, "_ZOOM", "-50,-40", "150,90")
            c.select("R").command("ARRAYRECT")
            typed(c, "_COU", "4", "3", "_S", "8", "8", "_X")
            c.select("O").command("ARRAYPOLAR")
            typed(c, "23,25", "_X")
            c.select("Q").command("ARRAYPATH")
            typed(c, "65,0", "_X")
            c.moveTo(at(0, 100))
          })
          .do("select rectangular", (c) => c.click(at(-28, 0)))
          .do("grab column count", (c) => c.click(at(-6, 0)))
          .do("type 6", (c) => c.type("6").enter())
          .do("grab column spacing", (c) => c.click(at(-22, 0)))
          .do("escape", (c) => c.escape())
          .do("escape", (c) => c.escape())
          .do("select polar", (c) => c.click(at(26, 43)))
          .do("grab radius", (c) => c.click(at(23, 43)))
          .do("escape", (c) => c.escape())
          .do("grab angle between", (c) => c.click(at(7.4115, 34)))
          .do("escape", (c) => c.escape())
          .do("escape", (c) => c.escape())
          .do("select path", (c) => c.click(at(64, 5)))
          .do("grab item spacing", (c) => c.click(at(66, 0)))
          .do("escape", (c) => c.escape())
          .do("escape", (c) => c.escape())
    )
    walk(
      "arc segment grip",
      createHarness({
        entities: [polylineOf([p(0, 0), p(100, 0)], { id: "P1", bulges: [1] })],
      }),
      (s) =>
        s
          .do("select", (c) => c.click(at(50, -50)))
          .do("grab arc middle", (c) => c.mouseDown(at(50, -50)))
          .do("drag", (c) => c.moveTo(at(50, -70)))
          .do("release", (c) => c.mouseUp(at(50, -70)))
          .do("escape", (c) => c.escape())
    )
  })

  it("describes what is selected", () => {
    const hatch = hatchOf([loopOf(p(0, 0), p(100, 100))], { id: "H1" })
    const solid = hatchOf([loopOf(p(0, 0), p(100, 100))], {
      id: "H2",
      patternId: "SOLID",
    })
    const entities: Entity[] = [
      line(),
      circleOf(p(0, 0), 50, { id: "C1" }),
      arcOf(p(0, 0), 50, 0, Math.PI / 2, { id: "A1" }),
      ellipseOf(p(0, 0), p(100, 0), 0.5, { id: "E1" }),
      ellipseOf(p(0, 0), p(100, 0), 0.5, {
        id: "E2",
        startParam: 0,
        endParam: Math.PI,
      }),
      polylineOf([p(0, 0), p(100, 0), p(100, 100)], { id: "P1" }),
      rectOf(p(0, 0), p(100, 100), { id: "P2" }),
      ...(
        [
          "left",
          "center",
          "right",
          "middle",
          "tl",
          "tc",
          "tr",
          "ml",
          "mc",
          "mr",
          "bl",
          "bc",
          "br",
        ] as const
      ).map((justify) =>
        textOf(p(0, 0), "NOTE", { id: `T-${justify}`, justify })
      ),
      createDimension("linear", p(0, 0), p(100, 0), p(50, 30), { id: "D1" }),
      createDimension("angular", p(100, 0), p(0, 100), p(60, 60), {
        id: "D2",
        vertex: p(0, 0),
      }),
      createDimension("radius", p(0, 0), p(50, 0), p(80, 0), {
        id: "D3",
        text: "R<>",
      }),
      createDimension("aligned", p(0, 0), p(60, 80), p(-40, 60), { id: "D4" }),
      createDimension("diameter", p(0, 0), p(50, 0), p(80, 0), { id: "D5" }),
      hatch,
      solid,
      createInsert("BAR", p(0, 0), { id: "I1" }),
      createInsert("BAR", p(0, 0), { id: "I2" }),
      lineOf(p(0, 0), p(10, 10), { id: "L2" }),
      circleOf(p(0, 0), 5, { id: "C2" }),
      arcOf(p(0, 0), 5, 0, 1, { id: "A2" }),
    ]
    walk("properties", createHarness({ entities, blocks: [bar()] }), (s) => {
      s.do("park the cursor", (c) => c.moveTo(at(5000, 5000)))
      for (const entity of entities) {
        s.do(`select ${entity.id}`, (c) => c.select(entity.id))
      }
      s.do("select everything", (c) => c.selectAll())
        .do("select one of each", (c) =>
          c.select("L1", "C1", "A1", "E1", "P1", "T-left", "D1", "H1", "I1")
        )
        .do("select two of each", (c) =>
          c.select(
            ...["L1", "C1", "A1", "E1", "P1", "T-left", "D1", "H1", "I1"],
            ...["L2", "C2", "A2", "E2", "P2", "T-mc", "D2", "H2", "I2"]
          )
        )
    })
    walk(
      "selection cycling",
      createHarness({
        entities: [
          line(),
          circleOf(p(50, 20), 20, { id: "C1" }),
          polylineOf([p(50, -50), p(50, 50)], { id: "P1" }),
        ],
      }),
      (s) =>
        s
          .do("turn cycling on", (c) => c.press("F4"))
          .do("hover the stack", (c) => c.moveTo(at(50, 0)))
          .do("shift+space", (c) => c.press(" ", { shiftKey: true }))
    )
  })

  it("draws its aids on the canvas", () => {
    // Each object snap forced through the Shift+right-click override, on the
    // geometry its provider's own tests aim at, so its tooltip is drawn.
    const snaps: [SnapType, Entity[], Vec2 | null, Vec2][] = [
      [SnapType.Endpoint, [lineOf(p(0, 0), p(100, 0))], null, p(97, 3)],
      [SnapType.Midpoint, [lineOf(p(0, 0), p(100, 0))], null, p(52, 3)],
      [
        SnapType.Center,
        [ellipseOf(p(40, 20), p(100, 0), 0.5)],
        null,
        p(44, 23),
      ],
      [
        SnapType.Intersection,
        [lineOf(p(0, 0), p(100, 0)), lineOf(p(50, -50), p(50, 50))],
        null,
        p(52, 2),
      ],
      [
        SnapType.ApparentIntersection,
        [
          lineOf(p(-100, 0), p(100, 0)),
          withElevation(lineOf(p(20, -100), p(20, 100)), 30),
        ],
        null,
        p(22, 3),
      ],
      [
        SnapType.Perpendicular,
        [lineOf(p(0, 0), p(100, 0))],
        p(50, 80),
        p(52, 3),
      ],
      [SnapType.Tangent, [circleOf(p(0, 0), 50)], p(200, 0), p(33, 40)],
      [SnapType.Insertion, [textOf(p(0, 0), "NOTE")], null, p(1, 1)],
      [SnapType.Quadrant, [circleOf(p(0, 0), 100)], null, p(3, 103)],
      [SnapType.Nearest, [lineOf(p(0, 0), p(100, 0))], null, p(37, 4)],
    ]
    for (const [type, entities, from, aim] of snaps) {
      walk(
        `object snap ${type}`,
        createHarness({ entities, snap: true }),
        (s) => {
          s.do("LINE", (c) => c.command("LINE"))
          if (from) s.do("first", (c) => c.click(from))
          s.do(`override ${type}`, (c) => {
            c.runtime.setSnapOverride(type)
            c.moveTo(aim)
          }).do("escape", (c) => c.escape())
        }
      )
    }
    walk(
      "object snap parallel",
      createHarness({
        entities: [lineOf(p(-200, -100), p(0, 50))],
        snap: true,
      }),
      (s) => {
        vi.useFakeTimers()
        s.do("LINE", (c) => c.command("LINE"))
          .do("first", (c) => c.click(p(100, -100)))
          .do("override parallel and dwell", (c) => {
            c.runtime.setSnapOverride(SnapType.Parallel)
            c.moveTo(p(-100, -25))
            vi.advanceTimersByTime(300)
            c.moveTo(p(-100, -25))
          })
          .do("aim along it", (c) => c.moveTo(p(297.6, 53.2)))
          .do("escape", (c) => c.escape())
      }
    )
    walk(
      "object snap extension",
      createHarness({ entities: [lineOf(p(0, 0), p(100, 0))], snap: true }),
      (s) => {
        vi.useFakeTimers()
        s.do("LINE", (c) => c.command("LINE"))
          .do("override extension and pass over the end", (c) => {
            c.runtime.setSnapOverride(SnapType.Extension)
            c.moveTo(p(100, 0))
            vi.advanceTimersByTime(300)
            c.moveTo(p(100, 0))
          })
          .do("aim past it", (c) => c.moveTo(p(150, 3)))
          .do("escape", (c) => c.escape())
      }
    )
    walk("SNAP", createHarness(), (s) =>
      s
        .do("SNAP", (c) => c.command("SN"))
        .do("a word", (c) => c.type("FOO").enter())
        .do("zero", (c) => c.type("0").enter())
        .do("a spacing", (c) => c.type("5").enter())
        .do("SNAP again", (c) => c.command("SNAP"))
        .do("Aspect", (c) => c.option("Aspect"))
        .do("horizontal spacing", (c) => c.type("5").enter())
        .do("vertical spacing", (c) => c.type("10").enter())
        .do("SNAP with spacings apart", (c) => c.command("SNAP"))
        .do("OFF", (c) => c.option("OFF"))
    )
    walk("-OSNAP", createHarness(), (s) =>
      s
        .do("-OSNAP", (c) => c.command("-OSNAP"))
        .do("a mode it does not know", (c) => c.type("END,XYZ").enter())
        .do("a list", (c) => c.type("mid,per").enter())
    )
    walk(
      "a wrong answer mid-command",
      createHarness({ entities: [line()] }),
      (s) => {
        const typed = (c: CadHarness, text: string) => {
          c.runtime.setCommandLineText(text)
          c.runtime.submitCommandLine()
        }
        return s
          .do("LINE", (c) => c.command("LINE"))
          .do("FOO", (c) => typed(c, "FOO"))
          .do("first point", (c) => c.click(at(0, 50)))
          .do("CIRCLE", (c) => typed(c, "CIRCLE"))
          .do("escape", (c) => c.escape())
          .do("ERASE", (c) => c.command("ERASE"))
          .do("FOO", (c) => typed(c, "FOO"))
          .do("escape", (c) => c.escape())
          .do("OFFSET", (c) => c.command("OFFSET"))
          .do("FOO", (c) => typed(c, "FOO"))
          .do("distance", (c) => c.type("10").enter())
          .do("FOO", (c) => typed(c, "FOO"))
          .do("escape", (c) => c.escape())
      }
    )
    walk("an object snap typed at a point prompt", createHarness(), (s) =>
      s
        .do("LINE", (c) => c.command("LINE"))
        .do("MID", (c) => c.type("MID").enter())
        .do("escape", (c) => c.escape())
    )
    walk("polar", createHarness(), (s) =>
      s
        .do("F10", (c) => {
          c.runtime.setPolarAngleStep(45)
          c.press("F10")
        })
        .do("LINE", (c) => c.command("LINE"))
        .do("first", (c) => c.click(at(0, 0)))
        .do("near 45", (c) => c.moveTo(at(70, 71)))
        .do("escape", (c) => c.escape())
    )
    walk("FROM", createHarness({ entities: [line()] }), (s) =>
      s
        .do("LINE", (c) => c.command("LINE"))
        .do("FROM", (c) => c.command("FROM"))
        .do("base", (c) => c.click(at(100, 0)))
        .do("offset", (c) => c.type("@10,0"))
        .do("enter", (c) => c.enter())
        .do("escape", (c) => c.escape())
    )
  })

  it("names what it creates", () => {
    const cad = createHarness()
    const layers = [cad.runtime.createLayer(), cad.runtime.createLayer()]
    const dimStyle = cad.runtime.createDimStyle()
    const textStyle = cad.runtime.createTextStyle()
    surfaces.push(
      [
        "## default names",
        ...layers.map((id) => cad.runtime.document.getLayer(id)?.name),
        dimStyle,
        textStyle,
        cad.runtime.suggestedFileName().replace(/\d/g, "#"),
      ].join("\n")
    )
    const from = cad.commandLog().length
    cad.runtime.updateTextStyle(textStyle, { name: "STANDARD" })
    cad.runtime.updateDimStyle(dimStyle, { name: "iso-25" })
    surfaces.push(
      ["## style names refused", ...cad.commandLog().slice(from)].join("\n")
    )
  })

  it("is written down", async () => {
    await expect(surfaces.join("\n\n") + "\n").toMatchFileSnapshot(
      "./__snapshots__/englishSurface.txt"
    )
  })
})
