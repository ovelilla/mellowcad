import { createElement } from "react"
import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { commandCatalog, type CadEngine } from "@mellowcad/engine"
import type { EditorState } from "@mellowcad/react"
import { createHarness } from "../../../test/harness"
import { LARGE_BUTTON_ICONS, LARGE_TOOL_ICONS } from "./large-icons"
import { BUTTON_ICONS, TOOL_ICONS } from "./tool-icons"
import { Ribbon } from "./ribbon"
import { RibbonLayoutProvider } from "./ribbon-layout-context"
import {
  RIBBON_LAYOUT,
  type RibbonLayout,
  type RibbonState,
} from "./ribbon-layout"
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
import { en } from "./locales/en"
import { HELP_INSTEAD } from "./ribbon-tip"
import { editorTags, readEditorCatalog } from "../../../scripts/locales/editor"

const PANELS = RIBBON_TABS.flatMap((tab) => tab.panels)

/** Every control of every tab, the columns' and rows' and slide-outs' too. */
function controls(): RibbonControl[] {
  const out: RibbonControl[] = []
  const add = (c: RibbonSlot | typeof SPACER) => {
    if (c === SPACER) return
    if (c.kind === "column") c.rows.forEach(add)
    else if (c.kind === "rows") c.rows.forEach((row) => row.forEach(add))
    else if (c.kind !== "fields") out.push(c)
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

/**
 * The ribbon rendered with the engine's state, after `prepare`, in the
 * device's minimize state `minimized` (the full ribbon by default).
 */
function renderRibbon(
  prepare: (cad: ReturnType<typeof createHarness>) => void = () => {},
  minimized: RibbonState = "full",
  shown: Partial<RibbonLayout> = {}
) {
  const cad = createHarness()
  prepare(cad)
  return renderToString(
    createElement(
      RibbonLayoutProvider,
      {
        value: {
          layout: { ...RIBBON_LAYOUT, ...shown, state: minimized },
          setLayout: () => {},
        },
      },
      createElement(Ribbon, {
        engine: cad.runtime as unknown as CadEngine,
        state: cad.state() as EditorState,
      })
    )
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

  // Drafting & Annotation's order; 3D Tools shown at first, the owner's
  // choice where the workspace hides it, until Show Tabs hides it (decision 4).
  it("are Home, Insert, Annotate, 3D Tools and View, in that order", () => {
    const tabs = (html: string) =>
      [...html.matchAll(/role="tab"[^>]*>([^<]+)</g)].map((m) => m[1])
    expect(tabs(renderRibbon())).toEqual([
      "Home",
      "Insert",
      "Annotate",
      "3D Tools",
      "View",
    ])
    const hidden = { hiddenTabs: ["tools3d"] }
    expect(tabs(renderRibbon(undefined, "full", hidden))).toEqual([
      "Home",
      "Insert",
      "Annotate",
      "View",
    ])
  })

  it("show View with Visual Styles, Coordinates and Navigate at first", () => {
    const view = (shown?: Partial<RibbonLayout>) =>
      renderRibbon((cad) => cad.runtime.setRibbonTab("view"), "full", shown)
    expect(view()).toContain(">Visual Styles<")
    expect(view()).toContain(">Navigate<")
    const hidden = { hiddenPanels: ["visualStyles", "navigate"] }
    expect(view(hidden)).not.toContain(">Visual Styles<")
    expect(view(hidden)).not.toContain(">Navigate<")
  })

  it("put the first tab shown in front of a hidden one, the names off without titles", () => {
    const html = renderRibbon(
      (cad) => cad.runtime.setRibbonTab("tools3d"),
      "full",
      { hiddenTabs: ["tools3d"], panelTitles: false }
    )
    expect(html).toContain('aria-label="Home"')
    expect(html).not.toContain(">Draw<")
    expect(html).toContain('aria-label="Draw"')
  })
})

// AutoCAD's tooltip: the name, the description, the command, Press F1 — each
// culture's words (scripts/research/ribbon-tips.mjs).
describe("the ribbon's tooltips", () => {
  const words = en.messages.Ribbon
  const tipped = (id: string) => id in words.tips

  it("describe every button; a list's row has none", () => {
    const untipped = Object.keys(words.items).filter((id) => !tipped(id))
    // Array Creation's Type is a label (a `DataTemplate`, no `TT_`), and its
    // Method shows the tooltip of the method in force. Text Editor's
    // Justification and Close have no `TT_` in AcWindows, nor a macro.
    expect(untipped.sort()).toEqual([
      "arrayMethod",
      "arrayPath",
      "arrayPolar",
      "arrayRectangular",
      "manageDimensionStyles",
      "manageTextStyles",
      "textClose",
      "textJustification",
    ])
    for (const control of controls()) {
      if (control.kind === "tool") expect(tipped(control.tool)).toBe(true)
      if (control.kind === "split")
        for (const member of control.members)
          if (member !== null) expect(tipped(member)).toBe(true)
    }
  })

  it("name the command in capitals, the one F1 asks Help for", () => {
    // Array Creation's, Hatch Creation's and Text Editor's `TT_…` name no
    // command, nor do Close Hatch Creation's `^M` (MM_1928) and Close Hatch
    // Editor's (MM_1932, no CLICommand): their tooltips show none.
    const commandless = Object.keys(words.tips).filter(
      (tip) => !(tip in words.tipCommands)
    )
    expect(commandless).toHaveLength(32)
    for (const tip of commandless)
      expect(tip).toMatch(/^(array|hatch|text)[A-Z]/)
    const commands = new Set(commandCatalog().map((command) => command.id))
    for (const [tip, command] of Object.entries(words.tipCommands)) {
      expect(String(command)).toMatch(/^[A-Z0-9-]+$/)
      // F1 asks about a command the engine has, or what the button runs.
      if (tip in HELP_INSTEAD) {
        const instead = HELP_INSTEAD[tip as keyof typeof HELP_INSTEAD]
        expect(commands.has(String(command)), tip).toBe(false)
        if (instead) expect(commands.has(instead), tip).toBe(true)
      } else expect(commands.has(String(command)), tip).toBe(true)
    }
  })

  it("are worded in every language, none left to English", () => {
    for (const tag of editorTags()) {
      const ribbon = (readEditorCatalog(tag) as typeof en.messages).Ribbon
      expect(Object.keys(ribbon.tips), tag).toEqual(Object.keys(words.tips))
      expect(ribbon.pressF1, tag).toBeTruthy()
    }
  })
})

// The running command's contextual tab (plan §6, phase 6, block 1): after the
// last tab, in front, its fields the engine's values.
describe("the contextual tab", () => {
  const arrayRect = (cad: ReturnType<typeof createHarness>) => {
    cad.command("CIRCLE").type("0,0").enter().type("5").enter()
    cad.selectAll().command("ARRAYRECT")
  }

  it("shows Array Creation in front while ARRAYRECT asks its main prompt", () => {
    const html = renderRibbon(arrayRect)
    expect(html).toMatch(/aria-selected="true"[^>]*>Array Creation</)
    expect(html).toContain(">Columns:<")
    expect(html).toContain('value="4"')
    expect(html).toMatch(/>Close<\/span><span>Array</)
    expect(html).toMatch(
      /aria-pressed="true"[^>]*>(?:(?!<\/button>).)*Associative</
    )
    // Total is not asked by COLumns here: not drawn.
    expect(html.match(/>Total:</g)).toHaveLength(1)
  })

  it("is gone once the command ends, Show Tabs never listing it", () => {
    const html = renderRibbon((cad) => {
      arrayRect(cad)
      cad.enter()
    })
    expect(html).not.toContain("Array Creation")
    expect(html).toMatch(/aria-selected="true"[^>]*>Home</)
  })

  it("shows ARRAYPATH's count toggle lit and Items greyed while Measure fills the path", () => {
    const html = renderRibbon((cad) => {
      cad.command("LINE").type("0,5").enter().type("20,5").enter().enter()
      cad.command("CIRCLE").type("0,0").enter().type("1").enter()
      cad.select(cad.latest().id).command("ARRAYPATH").click({ x: 10, y: 5 })
    })
    expect(html).toMatch(/aria-label="Item Count" aria-pressed="true"/)
    expect(html).toMatch(/id="ribbon-field-items"[^>]*disabled=""/)
  })

  it("shows the selection's Array tab with its Totals, and no Close Array", () => {
    const html = renderRibbon((cad) => {
      arrayRect(cad)
      cad.enter()
      cad.select(cad.latest().id)
    })
    expect(html).toMatch(/aria-selected="true"[^>]*>Array</)
    expect(html.match(/>Total:</g)).toHaveLength(3)
    expect(html).not.toContain(">Close<")
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
      renderRibbon(
        (cad) => {
          cad.runtime.setRibbonTab("view")
          if (style) cad.runtime.setVisualStyle(style)
        },
        "full",
        { hiddenPanels: [] }
      )
    expect(html()).toContain(">2D Wireframe<")
    expect(html("hidden")).toContain(">Hidden<")
  })
})

describe("Annotate's style lists", () => {
  it("show the engine's text and dimension styles, by name", () => {
    const html = (pick?: boolean) =>
      renderRibbon((cad) => {
        cad.runtime.setRibbonTab("annotate")
        if (!pick) return
        cad.runtime.applyTextStyleControl(
          cad.runtime.createTextStyle("Notes", undefined, false)
        )
        cad.runtime.applyDimStyleControl(
          cad.runtime.createDimStyle("Coarse", undefined, false)
        )
      })
    expect(html()).toContain('aria-label="Text Style"')
    expect(html()).toContain(">Standard<")
    expect(html()).toContain(">ISO-25<")
    expect(html(true)).toContain(">Notes<")
    expect(html(true)).toContain(">Coarse<")
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

describe("the ribbon minimized", () => {
  const tabpanel = (html: string) =>
    /<div[^>]*role="tabpanel"[^>]*>/.exec(html)?.[0] ?? ""

  it("shows the panels, one button per panel, one title per panel or none", () => {
    const full = renderRibbon()
    expect(tabpanel(full)).toContain("h-25")
    expect(full).toContain(">Draw<")

    // One button per panel, named by it: its icon over its name, no ▾.
    const buttons = renderRibbon(undefined, "panelButtons")
    expect(tabpanel(buttons)).toContain("h-15.5")
    expect(buttons).toContain('aria-label="Draw"')
    expect(buttons).not.toContain('aria-label="Line"')

    // One title per panel; Properties keeps its dialog launcher.
    const titles = renderRibbon(undefined, "panelTitles")
    expect(tabpanel(titles)).toContain("h-5.25")
    expect(titles).toContain(">Modify<")
    expect(titles).not.toContain('aria-label="Line"')

    // The tab row alone.
    const tabs = renderRibbon(undefined, "tabs")
    expect(tabpanel(tabs)).toBe("")
    expect(tabs).toContain(">Home<")
    expect(tabs).not.toContain(">Draw<")
  })

  // The button is named for what a click does next, as its tooltip is.
  it("names the minimize button for the state it leads to", () => {
    expect(renderRibbon()).toContain('aria-label="Minimize to Panel Buttons"')
    expect(renderRibbon(undefined, "panelTitles")).toContain(
      'aria-label="Minimize to Tabs"'
    )
    expect(renderRibbon(undefined, "tabs")).toContain(
      'aria-label="Show Full Ribbon"'
    )
  })
})
