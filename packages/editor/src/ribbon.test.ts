import { createElement } from "react"
import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import type { CadEngine } from "@mellowcad/engine"
import type { EditorState } from "@mellowcad/react"
import { createHarness } from "../../../test/harness"
import { LARGE_BUTTON_ICONS, LARGE_TOOL_ICONS } from "./large-icons"
import { BUTTON_ICONS, TOOL_ICONS } from "./tool-icons"
import { panelsScroll, Ribbon } from "./ribbon"
import {
  ACTIONS,
  SPACER,
  TYPED,
  actionOf,
  toolsOn,
  type RibbonControl,
  type RibbonSlot,
} from "./ribbon-home"
import { RIBBON_TABS } from "./ribbon-tabs"

const PANELS = RIBBON_TABS.flatMap((tab) => tab.panels)

/** Every control of every tab, the columns' and rows' and slide-outs' too. */
function controls(): RibbonControl[] {
  const out: RibbonControl[] = []
  const add = (c: RibbonSlot | typeof SPACER) => {
    if (c === SPACER) return
    if (c.kind === "column") c.rows.forEach(add)
    else if (c.kind === "rows") c.rows.forEach((row) => row.forEach(add))
    else out.push(c)
  }
  for (const panel of PANELS) {
    panel.slots.forEach(add)
    panel.slideOut?.forEach((row) => row.forEach(add))
  }
  return out
}

const toolIds = () =>
  createHarness()
    .state()
    .tools.map((tool) => tool.id)

/** The ribbon rendered with the engine's state, after `prepare`. */
function renderRibbon(
  prepare: (cad: ReturnType<typeof createHarness>) => void = () => {}
) {
  const cad = createHarness()
  prepare(cad)
  return renderToString(
    createElement(Ribbon, {
      engine: cad.runtime as unknown as CadEngine,
      state: cad.state() as EditorState,
    })
  )
}

describe("the ribbon's tabs", () => {
  // No tool is dropped: a new tool must find its panel or say why it is
  // typed (the tool palette's fallback group is gone).
  it("give every tool a button, or say why it is typed", () => {
    const placed = toolsOn(PANELS)
    const unplaced = toolIds().filter((id) => !placed.has(id) && !TYPED.has(id))
    expect(unplaced).toEqual([])
  })

  it("keep no tool both typed and placed, nor one the engine lacks", () => {
    const tools = new Set(toolIds())
    const placed = toolsOn(PANELS)
    for (const id of TYPED) {
      expect(tools.has(id), id).toBe(true)
      expect(placed.has(id), id).toBe(false)
    }
    for (const id of placed) expect(tools.has(id), id).toBe(true)
  })

  // Decision 5: a large button and a list's row draw the tool at 32.
  it("draw each large button and each list's member at 32 px", () => {
    const large = (action: string) =>
      LARGE_TOOL_ICONS[action] ?? LARGE_BUTTON_ICONS[action]
    const small = (action: string) => TOOL_ICONS[action] ?? BUTTON_ICONS[action]
    for (const control of controls()) {
      if (control.kind === "tool") {
        const action = actionOf(control.tool)
        if (control.size === "large")
          expect(large(action), action).toBeDefined()
        else expect(small(action), action).toBeDefined()
      }
      if (control.kind === "split")
        for (const member of control.members) {
          if (member === null) continue
          const action = actionOf(member)
          expect(large(action), action).toBeDefined()
          if (control.size !== "large")
            expect(small(action), action).toBeDefined()
        }
    }
    for (const action of Object.keys(ACTIONS))
      expect(small(action), action).toBeDefined()
    // The toggles, Attribute Display's entries and the gallery's styles.
    for (const icon of [
      "ucsIcon",
      "viewCube",
      "propertiesPalette",
      "blocksPalette",
      "attModeNormal",
      "attModeOn",
      "attModeOff",
      "vs2dWireframe",
      "vsHidden",
      "vsConceptual",
    ])
      expect(large(icon), icon).toBeDefined()
    for (const icon of ["commandLine", "layerProperties", "attModeNormal"])
      expect(small(icon), icon).toBeDefined()
  })

  it("show the engine's tab in front, Home by default", () => {
    const panel = (html: string) =>
      /<div[^>]*role="tabpanel"[^>]*>/.exec(html)?.[0]
    expect(panel(renderRibbon())).toContain('aria-label="Home"')
    const view = renderRibbon((cad) => cad.runtime.setRibbonTab("view"))
    expect(panel(view)).toContain('aria-label="View"')
    expect(view).toContain(">Palettes<")
    expect(view).not.toContain(">Draw<")
  })

  // Drafting & Annotation's order, with 3D Tools shown (decision 4).
  it("are Home, Insert, Annotate, 3D Tools and View, in that order", () => {
    const tabs = [...renderRibbon().matchAll(/role="tab"[^>]*>([^<]+)</g)].map(
      (m) => m[1]
    )
    expect(tabs).toEqual(["Home", "Insert", "Annotate", "3D Tools", "View"])
  })
})

describe("View's toggles", () => {
  it("light UCS Icon while UCSICON is on, View Cube while it shows", () => {
    const lit = (html: string, name: string) =>
      new RegExp(`aria-pressed="true"[^>]*>(?:(?!</button>).)*>${name}<`).test(
        html
      )
    const on = renderRibbon((cad) => cad.runtime.setRibbonTab("view"))
    expect(lit(on, "UCS")).toBe(true)
    expect(lit(on, "View")).toBe(true)
    const off = renderRibbon((cad) => {
      cad.runtime.setRibbonTab("view")
      cad.runtime.runRibbonButton("ucsIcon")
      cad.runtime.runRibbonButton("viewCube")
    })
    expect(lit(off, "UCS")).toBe(false)
    expect(lit(off, "View")).toBe(false)
  })
})

describe("the Visual Styles gallery", () => {
  it("shows the view's style by the drawing's name for it", () => {
    const html = (style?: "hidden") =>
      renderRibbon((cad) => {
        cad.runtime.setRibbonTab("view")
        if (style) cad.runtime.setVisualStyle(style)
      })
    expect(html()).toContain(">2D Wireframe<")
    expect(html("hidden")).toContain(">Hidden<")
  })
})

describe("Attribute Display", () => {
  it("shows the entry ATTMODE holds", () => {
    const html = (display?: "on") =>
      renderRibbon((cad) => {
        cad.runtime.setRibbonTab("insert")
        if (display) cad.runtime.setAttributeDisplay(display)
      })
    expect(html()).toContain(">Retain Attribute Display<")
    expect(html("on")).toContain(">Display All Attributes<")
  })
})

describe("a split button's member", () => {
  const render = (members: Record<string, string>) =>
    renderRibbon((cad) => {
      for (const [dropDown, member] of Object.entries(members))
        cad.runtime.setRibbonMember(dropDown, member)
    })

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

  // 38 and 35 in AutoCAD's 72 (§2.3): the two targets share a pixel. One
  // under the other, the button ended a pixel below Line's.
  it("keeps a large one's two targets inside its 72", () => {
    const triggers = [
      ...render({}).matchAll(/class="([^"]*\bh-8\.75\b[^"]*)"/g),
    ]
    expect(triggers.length).toBeGreaterThan(0)
    for (const [, classes] of triggers) expect(classes).toContain("-mt-px")
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

describe("the wheel over the panels' row", () => {
  it("goes on towards the panels' end, in either direction of the page", () => {
    expect(panelsScroll({ deltaX: 0, deltaY: 100 }, true, false)).toBe(100)
    expect(panelsScroll({ deltaX: 0, deltaY: -100 }, true, false)).toBe(-100)
    expect(panelsScroll({ deltaX: 0, deltaY: 100 }, true, true)).toBe(-100)
  })

  it("leaves a sideways turn to the browser", () => {
    expect(panelsScroll({ deltaX: 40, deltaY: 0 }, true, false)).toBe(0)
    expect(panelsScroll({ deltaX: 40, deltaY: 12 }, true, false)).toBe(0)
  })

  // React bubbles a portalled popup's wheel to the row that rendered it: over
  // the layer list or a drop-down's, the row moved under the list.
  it("is not the row's over a list the ribbon opened", () => {
    expect(panelsScroll({ deltaX: 0, deltaY: 100 }, false, false)).toBe(0)
    expect(panelsScroll({ deltaX: 0, deltaY: 100 }, false, true)).toBe(0)
  })
})
