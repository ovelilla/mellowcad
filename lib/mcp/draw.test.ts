import { describe, expect, it } from "vitest"

import { commandCatalog } from "@mellowcad/engine"

import { MAX_SCRIPT_CHARACTERS } from "@/lib/command-script"
import { scriptOfHash } from "@/lib/script-link"

import {
  MAX_DRAW_MILLISECONDS,
  MAX_VIEW_CHARACTERS,
  draw,
  drawDescription,
} from "./draw"

const ORIGIN = "https://mellowcad.com"

describe("a call of the draw tool", () => {
  it("answers with the command window, the objects and the editor's link", () => {
    const script =
      "-LAYER M WALLS C red\n\n\nRECTANG 0,0 100,50\nCIRCLE 50,25 10"
    const answer = draw(script, ORIGIN)
    expect(answer.isError).toBe(false)
    expect(answer.objects).toBe(2)
    expect(answer.text).toContain("Specify radius of circle or [Diameter]: 10")
    expect(answer.text).toContain(
      "Objects:\npolyline closed (0,0) (100,0) (100,50) (0,50) layer=WALLS\n" +
        "circle center (50,25) radius 10 layer=WALLS"
    )
    expect(answer.text).toContain("Layers: 0 (white), WALLS (red, current)")
    expect(answer.text).toContain(
      "Drawing: 2 objects, extents (0,0) to (100,50)"
    )
    const link = answer.text.match(/Open it in MellowCAD: (\S+)$/)?.[1] ?? ""
    expect(link.startsWith(`${ORIGIN}/draw#run=`)).toBe(true)
    expect(scriptOfHash(new URL(link).hash)).toBe(script)
  })

  it("says so when nothing is drawn, as a call keeps nothing", () => {
    const answer = draw("LIST\nALL\n", ORIGIN)
    expect(answer.objects).toBe(0)
    expect(answer.text).toContain("each call starts from an empty drawing")
    expect(answer.text).not.toContain("Open it in MellowCAD")
  })

  it("stops at a refused answer and says which", () => {
    const answer = draw("LINE 0,0 10,0\nfoo\nCIRCLE 0,0 5", ORIGIN)
    expect(answer.isError).toBe(true)
    expect(answer.text).toContain(
      'STOPPED at script line 2: "foo" was refused (see the last lines above). 1 line(s) after it were not run.'
    )
    expect(answer.text).toContain(
      'A command was still asking "LINE Specify next point or [Undo]:"'
    )
  })

  it("stops at a command that opens a dialog box, naming its script form", () => {
    expect(draw("CIRCLE 0,0 5\nLA\nWALLS", ORIGIN).text).toContain(
      "STOPPED at script line 2: LA opens a dialog box, which a script cannot answer; type -LAYER instead. 1 line(s) after it were not run."
    )
    expect(draw("CIRCLE 0,0 5\nUNITS", ORIGIN).text).toContain(
      "UNITS opens a dialog box, which a script cannot answer, and has no command-line form here."
    )
  })

  it("stops once its time is up, with no link the editor would outrun", () => {
    let clock = 0
    const answer = draw("CIRCLE 0,0 5\nCIRCLE 0,0 6", ORIGIN, {
      now: () => {
        clock += MAX_DRAW_MILLISECONDS / 3
        return clock
      },
    })
    expect(answer.text).toContain(
      `STOPPED at script line 2, before "CIRCLE": one call types for ${MAX_DRAW_MILLISECONDS / 1000} seconds at most.`
    )
    expect(answer.text).toContain("circle center (0,0) radius 5")
    expect(answer.text).not.toContain("Open it in MellowCAD")
    expect(answer.view.link).toBeNull()
  })

  it("is cut in the middle of an answer that runs long", () => {
    // One answer, COUnt's rows, makes a million objects: no check between
    // answers sees it coming.
    const started = performance.now()
    const answer = draw(
      "CIRCLE 0,0 1\nARRAYRECT L\n\nAS N COU 1000 1000\nX\nCIRCLE 5,5 1",
      ORIGIN,
      { cutAfter: 300 }
    )
    expect(performance.now() - started).toBeLessThan(3000)
    expect(answer).toMatchObject({ isError: true, objects: 0 })
    expect(answer.text).toMatch(/^CUT: one call runs for /)
    // The process goes on: the next call draws.
    expect(draw("CIRCLE 0,0 1", ORIGIN).objects).toBe(1)
  })

  it("gives the chat's view the drawing as SVG, framed to its proportions", () => {
    const { view, text } = draw("RECTANG 0,0 100,25", ORIGIN)
    expect(view.objects).toBe(1)
    expect(view.svg).toMatch(/^<svg [^>]*viewBox="0 0 1200 300"/)
    expect(view.link).toBe(text.match(/Open it in MellowCAD: (\S+)$/)?.[1])
    expect(draw("LIST", ORIGIN).view).toEqual({
      svg: null,
      link: null,
      objects: 0,
    })
  })

  it("leaves out an SVG past its cap, and keeps the link", () => {
    // ANSI31 at 0.01 over a square of 1000 is 44,000 lines on screen.
    const { view } = draw(
      "RECTANG 0,0 1000,1000\n-HATCH P ANSI31 0.01 0\nS L\n\n\n",
      ORIGIN
    )
    expect(view).toMatchObject({ svg: null, objects: 2 })
    expect(view.link).toMatch(/\/draw#run=/)
    // Under the count it is cut by size: 4,900 circles are 420,000 characters.
    const circles = draw(
      "CIRCLE 0,0 1\nARRAYRECT L\n\nAS N COU 70 70 S 3 3\nX",
      ORIGIN
    )
    expect(circles.view).toMatchObject({ svg: null, objects: 4900 })
    expect(MAX_VIEW_CHARACTERS).toBeLessThan(150_000 / 1.5)
  })

  it("refuses a script longer than a call takes, drawing nothing", () => {
    const answer = draw("x".repeat(MAX_SCRIPT_CHARACTERS + 1), ORIGIN)
    expect(answer).toMatchObject({ isError: true, objects: 0 })
    expect(answer.text).toContain("Nothing was drawn.")
  })
})

describe("the tool's description", () => {
  const description = drawDescription()

  it("names the commands of the engine's catalog, with their aliases", () => {
    expect(description).toContain("LINE (L), ")
    expect(description).toContain("-LAYER (-LA)")
    expect(description).not.toMatch(/\bQSAVE\b/)
    const named = commandCatalog().filter((c) =>
      new RegExp(`(^|[ ,])${c.name.replace(/[-]/g, "\\-")}[ ,.]`).test(
        description
      )
    )
    expect(named.length).toBeGreaterThan(100)
  })

  it("says twice that a call keeps nothing, and what each dialog's form is", () => {
    expect(description).toContain("Every call starts from an empty drawing")
    expect(description).toContain("send its whole script again")
    expect(description).toContain(
      "LAYER, INSERT, BLOCKSPALETTE, PROPERTIES, DIMSTYLE stop it: type -LAYER, -INSERT, -INSERT, CHPROP, -DIMSTYLE instead."
    )
  })
})
