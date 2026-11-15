import { describe, expect, it, onTestFinished } from "vitest"
import { shapesOfDxf } from "../scripts/mcp/bench/shapes.ts"
import { CadDriver } from "@mellowcad/engine"
import { SCRIPT_VIEW } from "../lib/command-script"
import { drawOn } from "../lib/mcp/draw"
import { SOLUTIONS, solve } from "../scripts/mcp/bench/solutions.ts"
import { TASKS } from "../scripts/mcp/bench/tasks.ts"
import { createServer } from "../scripts/mcp/server.ts"
import type { Feedback } from "../scripts/mcp/server.ts"
import { DrawingSession } from "../scripts/mcp/session.ts"

// The prototype MCP server of `docs/next-mcp.md` and the bench that measures
// agents with it.

describe("a drawing session at the command line", () => {
  it("types a script a line at a time and says what it changed", () => {
    const session = new DrawingSession()
    const result = session.run("LINE\n0,0\n100,0\n@0,50\nC\nCIRCLE\n50,25\n10")
    expect(result.transcript).toContain("Specify next point or [Close/Undo]: C")
    expect(result.stopped).toBeNull()
    expect(result.cancelled).toBeNull()
    expect(result.added.map((e) => e.type)).toEqual([
      "line",
      "line",
      "line",
      "circle",
    ])
    expect(session.describe(result.added[3])).toBe(
      "#1 circle center (50,25) radius 10 layer=0"
    )
  })

  it("ends an answer at a space, as a script file does, but not in a text", () => {
    const session = new DrawingSession()
    const result = session.run(
      "CIRCLE 50, 25 10\nTEXT 0,0 5 0\nHello big world\n"
    )
    expect(result.stopped).toBeNull()
    expect(result.added.map((e) => session.describe(e))).toEqual([
      "#1 circle center (50,25) radius 10 layer=0",
      '#2 text "Hello big world" at (0,0) height 5 rotation 0° layer=0',
    ])
  })

  it("stops at the first refused answer and leaves the rest unrun", () => {
    const session = new DrawingSession()
    const result = session.run("-PLOT\nY\nModel\n\nERASE\nALL\n")
    expect(result.stopped).toEqual({
      reason: "refused",
      line: 1,
      typed: "-PLOT",
      linesNotRun: 6,
    })
    expect(result.transcript.at(-1)).toMatch(/^Unknown command "-PLOT"/)

    const refused = session.run("LINE\n0,0\nfoo\n10,10")
    expect(refused.stopped).toMatchObject({ line: 3, typed: "foo" })
    expect(refused.cancelled).toBe("LINE Specify next point or [Undo]:")
    expect(refused.added).toEqual([])
  })

  it("cancels a command still asking when the script ends, keeping what it drew", () => {
    const session = new DrawingSession()
    const result = session.run("LINE\n0,0\n10,10")
    expect(result.cancelled).toBe("LINE Specify next point or [Undo]:")
    expect(result.added).toHaveLength(1)
    expect(session.run("CIRCLE\n0,0\n5\n\n").cancelled).toBeNull()
  })

  it("starts a script with the handles given selected", () => {
    const session = new DrawingSession()
    const [circle] = session.run("CIRCLE\n0,0\n5").added
    const handle = session.handleOf(circle.id)
    const moved = session.run("MOVE\n0,0\n20,0", [handle])
    expect(moved.modified.map((e) => session.describe(e))).toEqual([
      "#1 circle center (20,0) radius 5 layer=0",
    ])
  })

  it("makes layers and draws on the current one", async () => {
    const session = new DrawingSession()
    expect(session.layer({ name: "WALLS", color: "#ff0000" })).toMatch(
      /created/
    )
    session.run("LINE\n0,0\n10,0\n")
    session.layer({ name: "0" })
    session.run("CLAYER\nWALLS\nCIRCLE\n0,0\n5")
    expect(session.entities().map((e) => session.layerName(e))).toEqual([
      "WALLS",
      "WALLS",
    ])
    const shapes = shapesOfDxf(await session.dxf())
    expect(shapes.layers).toEqual(["WALLS", "WALLS"])
    expect(session.svg()).toMatch(/^<svg /)
  })
})

describe("the prototype server", () => {
  function server(feedback: Feedback) {
    return createServer(new DrawingSession(), { feedback, outDir: null })
  }

  async function call(
    feedback: Feedback,
    name: string,
    args: Record<string, unknown>
  ) {
    const reply = (await server(feedback).handle({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: { name, arguments: args },
    })) as { result: { content: { text: string }[]; isError?: boolean } }
    return reply.result
  }

  it("answers the handshake and lists each condition's tools", async () => {
    const reply = await server("text").handle({
      jsonrpc: "2.0",
      id: 0,
      method: "initialize",
      params: { protocolVersion: "2025-06-18" },
    })
    expect(reply).toMatchObject({
      id: 0,
      result: { protocolVersion: "2025-06-18", capabilities: { tools: {} } },
    })
    expect(
      await server("text").handle({ method: "notifications/initialized" })
    ).toBeNull()
    const names = (feedback: Feedback) =>
      server(feedback)
        .tools()
        .map((tool) => tool.name)
    expect(names("bare")).toEqual(["draw", "layer", "open", "save"])
    expect(names("text")).toEqual(["draw", "inspect", "layer", "open", "save"])
    expect(names("image")).toContain("view")
    expect(names("stateless")).toEqual(["draw"])
  })

  it("returns the transcript alone when bare, and what changed otherwise", async () => {
    const script = "CIRCLE\n0,0\n5"
    const bare = await call("bare", "draw", { script })
    expect(bare.content[0].text).toBe(
      "CIRCLE\n" +
        "Specify center point for circle or [3P/2P/Ttr (tan tan radius)]: 0,0\n" +
        "Specify radius of circle or [Diameter]: 5"
    )
    const text = await call("text", "draw", { script })
    expect(text.content[0].text).toContain(
      "+ #1 circle center (0,0) radius 5 layer=0"
    )
    expect(text.content[0].text).toContain(
      "Drawing: 1 objects, extents (-5,-5) to (5,5)"
    )
  })

  it("marks a stopped script as an error", async () => {
    const result = await call("text", "draw", { script: "BOGUS\nLINE" })
    expect(result.isError).toBe(true)
    expect(result.content[0].text).toContain("STOPPED at script line 1")
  })

  it("draws from nothing on every call when stateless", async () => {
    const stateless = server("stateless")
    const draw = async (script: string) =>
      (
        (await stateless.handle({
          id: 1,
          method: "tools/call",
          params: {
            name: "draw",
            arguments: { script, layers: [{ name: "A", color: "red" }] },
          },
        })) as { result: { content: { text: string }[] } }
      ).result.content[0].text
    expect(await draw("CIRCLE\n0,0\n5")).toContain("Drawing: 1 objects")
    expect(await draw("LINE\n0,0\n5,5\n")).toContain(
      "+ #1 line (0,0) to (5,5) layer=A"
    )
  })

  it("refuses an unknown method and an unknown tool", async () => {
    expect(
      await server("text").handle({ id: 7, method: "nope" })
    ).toMatchObject({ id: 7, error: { code: -32601 } })
    expect((await call("bare", "inspect", {})).isError).toBe(true)
  })
})

describe("the bench", () => {
  it.each(TASKS.map((task) => [task.id, task] as const))(
    "%s: its reference script passes every check, and an empty drawing none of the positive ones",
    async (_id, task) => {
      const session = new DrawingSession()
      if (task.seed) await session.openFile("seed.dxf", await task.seed())
      const before = task
        .checks(shapesOfDxf(await session.dxf()))
        .filter(([, pass]) => pass)
      solve(session, task.id)
      const checks = task.checks(shapesOfDxf(await session.dxf()))
      expect(checks.filter(([, pass]) => !pass).map(([name]) => name)).toEqual(
        []
      )
      // What is true of the untouched drawing cannot be all of a task.
      expect(before.length).toBeLessThan(checks.length)
    }
  )
})

describe("the bench through the remote tool", () => {
  // WHY not the two that open a DXF: the remote server reads no file
  // (`docs/next-mcp.md`, §8); they are the npm package's.
  it.each(
    TASKS.filter((task) => !task.seed).map((task) => [task.id, task] as const)
  )(
    "%s: its reference, as one stateless script, passes every check",
    async (_id, task) => {
      const script = (SOLUTIONS[task.id] ?? [])
        .map((step) =>
          "layer" in step ? `-LAYER\nM\n${step.layer}\n` : step.script
        )
        .join("\n")
      const cad = new CadDriver(SCRIPT_VIEW).leave()
      onTestFinished(() => cad.dispose())
      const answer = drawOn(cad, script, "https://mellowcad.com")
      expect(answer.isError).toBe(false)
      const checks = task.checks(shapesOfDxf((await cad.writeDxf()).bytes))
      expect(checks.filter(([, pass]) => !pass).map(([name]) => name)).toEqual(
        []
      )
    }
  )
})
