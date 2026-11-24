import { createElement } from "react"
import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import type { CadEngine } from "@mellowcad/engine"
import type { EditorState } from "@mellowcad/react"
import { createHarness } from "../../../test/harness"
import { LARGE_TOOL_ICONS } from "./large-icons"
import { TOOL_ICONS } from "./tool-icons"
import { Ribbon } from "./ribbon"
import {
  HOME,
  OTHER_TABS,
  SPACER,
  TYPED,
  toolsOn,
  type RibbonColumn,
  type RibbonControl,
} from "./ribbon-home"

/** Every control of Home, the columns' rows and the slide-outs' included. */
function controls(): RibbonControl[] {
  const out: RibbonControl[] = []
  const add = (c: RibbonControl | RibbonColumn | typeof SPACER) => {
    if (c === SPACER) return
    if (c.kind === "column") c.rows.forEach(add)
    else out.push(c)
  }
  for (const panel of HOME) {
    panel.slots.forEach(add)
    panel.slideOut?.forEach((row) => row.forEach(add))
  }
  return out
}

const toolIds = () =>
  createHarness()
    .state()
    .tools.map((tool) => tool.id)

describe("the ribbon's Home tab", () => {
  // No tool is dropped: the tool palette's fallback group is gone, so a new
  // tool must find its panel or say why it is typed.
  it("gives every tool a button, or says where it waits", () => {
    const home = toolsOn(HOME)
    const unplaced = toolIds().filter(
      (id) => !home.has(id) && !TYPED.has(id) && !OTHER_TABS.has(id)
    )
    expect(unplaced).toEqual([])
  })

  it("keeps no tool in two places, nor one the engine lacks", () => {
    const tools = new Set(toolIds())
    const home = toolsOn(HOME)
    for (const id of [...TYPED, ...OTHER_TABS]) {
      expect(tools.has(id), id).toBe(true)
      expect(home.has(id), id).toBe(false)
    }
    for (const id of home) expect(tools.has(id), id).toBe(true)
    for (const id of TYPED) expect(OTHER_TABS.has(id), id).toBe(false)
  })

  // Decision 5: a large button and a list's row draw the tool at 32.
  it("draws each large button and each list's member at 32 px", () => {
    for (const control of controls()) {
      if (control.kind === "tool" && control.size === "large")
        expect(LARGE_TOOL_ICONS[control.tool], control.tool).toBeDefined()
      if (control.kind === "tool" && control.size !== "large")
        expect(TOOL_ICONS[control.tool], control.tool).toBeDefined()
      if (control.kind === "split")
        for (const member of control.members) {
          if (member === null) continue
          expect(LARGE_TOOL_ICONS[member], member).toBeDefined()
          if (control.size !== "large")
            expect(TOOL_ICONS[member], member).toBeDefined()
        }
    }
  })
})

describe("a split button's member", () => {
  /** Home rendered with the engine's state, its drop-downs' members set. */
  function render(members: Record<string, string>) {
    const cad = createHarness()
    for (const [dropDown, member] of Object.entries(members))
      cad.runtime.setRibbonMember(dropDown, member)
    return renderToString(
      createElement(Ribbon, {
        engine: cad.runtime as unknown as CadEngine,
        state: cad.state() as EditorState,
      })
    )
  }

  it("is the first one until another is picked, for the session", () => {
    expect(render({})).toContain('aria-label="Rectangle"')
    const html = render({ rectangle: "polygon", trim: "extend" })
    expect(html).toContain('aria-label="Polygon"')
    expect(html).not.toContain('aria-label="Rectangle"')
    expect(html).toContain(">Extend</button>")
  })

  // Circle's is SplitFollowStaticText: the icon follows, the text stays.
  it("keeps its text where acad.cuix fixes it", () => {
    const html = render({ circle: "circle2p" })
    // Circle's button still says Circle (SplitFollowStaticText).
    expect(html).toContain('aria-label="Circle"')
    expect(html).not.toContain('aria-label="2-Point"')
  })

  it("lights no button for the command that runs (R15)", () => {
    const cad = createHarness()
    cad.command("LINE")
    const html = renderToString(
      createElement(Ribbon, {
        engine: cad.runtime as unknown as CadEngine,
        state: cad.state() as EditorState,
      })
    )
    expect(html).not.toContain("bg-active/15")
  })
})
