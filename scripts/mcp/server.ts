import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { createRequire } from "node:module"
import { basename, extname, join } from "node:path"
import { createInterface } from "node:readline"
import { pathToFileURL } from "node:url"
import { STANDARD_COLORS, normalizeColor } from "@mellowcad/engine"
import { DrawingSession } from "./session.ts"
import type { RunResult } from "./session.ts"

/**
 * A prototype MCP server over the engine's command line, on stdio, to measure
 * how agents draw with it (`docs/next-mcp.md`). It speaks the three methods a
 * client needs and no more: the product is built on the official SDK.
 */

/**
 * What the agent gets back, the variable the bench measures: `bare` is the
 * command window alone, `text` adds what each script changed and a listing
 * tool, `image` adds a rendered view. `stateless` is `text` with one tool and
 * no memory: every call draws from an empty drawing, as a remote server that
 * stores nothing would.
 */
export type Feedback = "bare" | "text" | "image" | "stateless"

const FEEDBACKS: readonly Feedback[] = ["bare", "text", "image", "stateless"]
const STATEFUL: readonly Feedback[] = ["bare", "text", "image"]

export interface ServerOptions {
  readonly feedback: Feedback
  /** Where each call leaves the drawing and its log, for the bench's checker. */
  readonly outDir: string | null
}

interface ToolContent {
  readonly type: "text" | "image"
  readonly text?: string
  readonly data?: string
  readonly mimeType?: string
}

interface ToolResult {
  readonly content: readonly ToolContent[]
  readonly isError?: boolean
}

interface Tool {
  readonly name: string
  readonly description: string
  readonly inputSchema: Record<string, unknown>
  readonly feedback?: readonly Feedback[]
  readonly call: (args: Record<string, unknown>) => Promise<ToolResult>
}

const MAX_LISTED = 60

const DRAW_DESCRIPTION = `Types a script at the drawing's command line, which works like AutoCAD's: the same command names and aliases (LINE, PLINE, CIRCLE, ARC, RECTANG, POLYGON, ELLIPSE, SPLINE, HATCH, TEXT, MTEXT, DIMLINEAR, DIMALIGNED, DIMRADIUS, DIMDIAMETER, DIMANGULAR, MOVE, COPY, ROTATE, SCALE, MIRROR, STRETCH, OFFSET, TRIM, EXTEND, FILLET, CHAMFER, BREAK, JOIN, ARRAYRECT, ARRAYPOLAR, ERASE, EXPLODE, PEDIT, BLOCK, INSERT, CHPROP, U, LIST, DIST, AREA, ID...), the same prompts, keywords and defaults.

One answer per line; an empty line is Enter. Points are typed: absolute x,y, relative @dx,dy, polar @distance<angle (degrees, counter-clockwise from +X). An object snap (END, MID, CEN, INT, QUA, TAN, PER, NEA) goes on its own line before the point it applies to. Objects are picked by typing a point that lies on them (choose one away from crossings and shared corners), or with AutoCAD's selection options at "Select objects:": L (last), ALL, P (previous), W or C and two corners (window, crossing), F (fence); or pass their #handles in "select" to start the script with them selected.

Each call starts at the Command: prompt. The script stops at the first answer a prompt refuses, and a command still asking when the script ends is cancelled, so end each command (the empty line that ends LINE or a selection). There are no dialog boxes: LAYER, UNITS and PROPERTIES do nothing useful here; use the layer tool for layers. Returns the command window's transcript.`

export function createServer(
  session: DrawingSession,
  options: ServerOptions
): {
  handle(message: unknown): Promise<unknown>
  tools(): readonly Tool[]
} {
  const rich = options.feedback !== "bare"
  const stateless = options.feedback === "stateless"

  function text(body: string, isError = false): ToolResult {
    return { content: [{ type: "text", text: body }], isError }
  }

  function runText(result: RunResult): string {
    const parts = [result.transcript.join("\n")]
    if (result.stopped) {
      parts.push(
        `STOPPED at script line ${result.stopped.line}: "${result.stopped.typed}" was refused (see the last lines above). ` +
          `${result.stopped.linesNotRun} line(s) after it were not run.`
      )
    }
    if (result.cancelled !== null) {
      parts.push(
        `A command was still asking "${result.cancelled}" and was cancelled; what it had already drawn stays.`
      )
    }
    if (rich) {
      const changes = [
        ...result.added.map((e) => `+ ${session.describe(e)}`),
        ...result.modified.map((e) => `~ ${session.describe(e)}`),
        ...result.removed.map((id) => `- #${session.handleOf(id)}`),
      ]
      parts.push(
        changes.length === 0
          ? "Nothing in the drawing changed."
          : "Changed (+ added, ~ modified, - removed):\n" +
              changes.slice(0, MAX_LISTED).join("\n") +
              (changes.length > MAX_LISTED
                ? `\n... and ${changes.length - MAX_LISTED} more: see inspect.`
                : "")
      )
      parts.push(`Drawing: ${session.extentsText()}`)
    }
    return parts.join("\n\n")
  }

  const tools: Tool[] = [
    {
      name: "draw",
      description:
        DRAW_DESCRIPTION +
        (rich ? " It also lists the objects the script changed." : "") +
        (stateless
          ? ' This server keeps nothing between calls: every call draws on an empty drawing, so to correct a drawing send its whole script again, corrected. Name the layers the script needs in "layers" and switch between them in the script with CLAYER (CLAYER, then the layer\'s name on the next line).'
          : ""),
      inputSchema: {
        type: "object",
        properties: {
          script: {
            type: "string",
            description:
              "Command-line input, one answer per line. Example: LINE\\n0,0\\n@100,0\\n@0,50\\nC",
          },
          ...(stateless && {
            layers: {
              type: "array",
              description:
                "Layers to create before the script runs; the last one is current when it starts.",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  color: {
                    type: "string",
                    description:
                      "red, yellow, green, cyan, blue, magenta, white, or #rrggbb.",
                  },
                },
                required: ["name"],
              },
            },
          }),
          ...(rich &&
            !stateless && {
              select: {
                type: "array",
                items: { type: "integer" },
                description:
                  "Handles (#n) of objects to select before the script, as clicking them first would: MOVE, COPY, ROTATE, ERASE and the like then act on them without asking.",
              },
            }),
        },
        required: ["script"],
      },
      call: (args) => {
        const select = Array.isArray(args.select)
          ? args.select.filter((h): h is number => typeof h === "number")
          : []
        if (stateless) {
          session.reset()
          const layers = Array.isArray(args.layers) ? args.layers : []
          for (const layer of layers as Record<string, unknown>[]) {
            session.layer({
              name: String(layer.name ?? ""),
              color: colorOf(layer.color),
            })
          }
        }
        const result = session.run(String(args.script ?? ""), select)
        return Promise.resolve(text(runText(result), result.stopped !== null))
      },
    },
    {
      name: "inspect",
      description:
        "Lists the drawing's objects, a line each: #handle, type, exact geometry and layer; then its layers and extents. Filter by layer or type to keep the listing short.",
      feedback: ["text", "image"],
      inputSchema: {
        type: "object",
        properties: {
          layer: { type: "string", description: "Only this layer's objects." },
          type: {
            type: "string",
            description: "Only this type: line, circle, arc, polyline, text...",
          },
        },
      },
      call: (args) => {
        const layer =
          typeof args.layer === "string" ? args.layer.toLowerCase() : null
        const type =
          typeof args.type === "string" ? args.type.toLowerCase() : null
        const listed = session
          .entities()
          .filter(
            (e) =>
              (layer === null ||
                session.layerName(e).toLowerCase() === layer) &&
              (type === null || e.type === type)
          )
        const lines = listed
          .slice(0, MAX_LISTED * 4)
          .map((e) => session.describe(e))
        if (listed.length > lines.length) {
          lines.push(`... and ${listed.length - lines.length} more: filter.`)
        }
        return Promise.resolve(
          text(
            [
              lines.join("\n") || "No objects.",
              `Layers:\n${session.layersText()}`,
              `Drawing: ${session.extentsText()}`,
            ].join("\n\n")
          )
        )
      },
    },
    {
      name: "view",
      description:
        "Renders the whole drawing as a PNG image, framed to its extents, on a dark background.",
      feedback: ["image"],
      inputSchema: { type: "object", properties: {} },
      call: async () => {
        const svg = session.svg()
        if (svg === null) return text("The drawing is empty.")
        return {
          content: [
            { type: "text", text: `Drawing: ${session.extentsText()}` },
            {
              type: "image",
              data: (await rasterize(svg)).toString("base64"),
              mimeType: "image/png",
            },
          ],
        }
      },
    },
    {
      name: "layer",
      description:
        "Makes a layer current, creating it if the drawing has none of that name; what is drawn next goes on it. Stands in for AutoCAD's -LAYER Make and Color.",
      feedback: STATEFUL,
      inputSchema: {
        type: "object",
        properties: {
          name: { type: "string" },
          color: {
            type: "string",
            description:
              "red, yellow, green, cyan, blue, magenta, white, or #rrggbb.",
          },
        },
        required: ["name"],
      },
      call: (args) => {
        return Promise.resolve(
          text(
            session.layer({
              name: String(args.name ?? ""),
              color: colorOf(args.color),
            })
          )
        )
      },
    },
    {
      name: "open",
      description:
        "Opens a DXF file (or a MellowCAD drawing) from disk in place of the current drawing.",
      feedback: STATEFUL,
      inputSchema: {
        type: "object",
        properties: { path: { type: "string" } },
        required: ["path"],
      },
      call: async (args) => {
        const path = String(args.path ?? "")
        const report = await session.openFile(
          basename(path),
          readFileSync(path)
        )
        return text(
          [...report, `Opened. Drawing: ${session.extentsText()}`].join("\n")
        )
      },
    },
    {
      name: "save",
      description:
        "Writes the drawing to disk by the path's extension: .dxf (AutoCAD 2018 DXF), .svg, or .json (MellowCAD's own drawing, which mellowcad.com opens).",
      feedback: STATEFUL,
      inputSchema: {
        type: "object",
        properties: { path: { type: "string" } },
        required: ["path"],
      },
      call: async (args) => {
        const path = String(args.path ?? "")
        const kind = extname(path).toLowerCase()
        if (kind === ".dxf") writeFileSync(path, await session.dxf())
        else if (kind === ".svg") writeFileSync(path, session.svg() ?? "")
        else if (kind === ".json") writeFileSync(path, session.drawingFile())
        else return text("The path must end in .dxf, .svg or .json.", true)
        return text(`Saved ${path}. Drawing: ${session.extentsText()}`)
      },
    },
  ]

  const offered = tools.filter(
    (tool) => !tool.feedback || tool.feedback.includes(options.feedback)
  )

  async function callTool(
    name: string,
    args: Record<string, unknown>
  ): Promise<ToolResult> {
    const tool = offered.find((t) => t.name === name)
    if (!tool) return text(`Unknown tool "${name}".`, true)
    let result: ToolResult
    try {
      result = await tool.call(args)
    } catch (error) {
      result = text(
        error instanceof Error ? error.message : String(error),
        true
      )
    }
    if (options.outDir !== null) await record(name, args, result)
    return result
  }

  async function record(
    name: string,
    args: Record<string, unknown>,
    result: ToolResult
  ): Promise<void> {
    const dir = options.outDir
    if (dir === null) return
    mkdirSync(dir, { recursive: true })
    writeFileSync(join(dir, "drawing.dxf"), await session.dxf())
    writeFileSync(join(dir, "drawing.json"), session.drawingFile())
    writeFileSync(
      join(dir, "calls.jsonl"),
      JSON.stringify({
        name,
        args,
        isError: result.isError === true,
        text: result.content.map((c) => c.text ?? `[${c.type}]`).join("\n"),
      }) + "\n",
      { flag: "a" }
    )
  }

  async function handle(message: unknown): Promise<unknown> {
    const request = message as {
      id?: number | string
      method?: string
      params?: Record<string, unknown>
    }
    const reply = (result: unknown) => ({
      jsonrpc: "2.0",
      id: request.id,
      result,
    })
    // A notification takes no answer.
    if (request.id === undefined) return null
    switch (request.method) {
      case "initialize":
        return reply({
          protocolVersion: request.params?.protocolVersion ?? "2025-06-18",
          capabilities: { tools: {} },
          serverInfo: { name: "mellowcad-prototype", version: "0.0.0" },
        })
      case "ping":
        return reply({})
      case "tools/list":
        return reply({
          tools: offered.map(({ name, description, inputSchema }) => ({
            name,
            description,
            inputSchema,
          })),
        })
      case "tools/call":
        return reply(
          await callTool(
            String(request.params?.name ?? ""),
            (request.params?.arguments ?? {}) as Record<string, unknown>
          )
        )
      default:
        return {
          jsonrpc: "2.0",
          id: request.id,
          error: { code: -32601, message: `Unknown method ${request.method}` },
        }
    }
  }

  return { handle, tools: () => offered }
}

/**
 * WHY sharp, undeclared: Next installs it, and only the bench's `image`
 * condition rasterises; the product's choice of rasteriser is the brief's.
 */
function colorOf(value: unknown): string | undefined {
  const named = String(value ?? "").toLowerCase()
  return (
    STANDARD_COLORS.find((color) => color.id === named)?.value ??
    normalizeColor(named) ??
    undefined
  )
}

function rasterize(svg: string): Promise<Buffer> {
  // The bundle runs from a scratch directory, where no node_modules is.
  const root = process.env.MELLOWCAD_MCP_ROOT ?? process.cwd()
  const sharp = createRequire(pathToFileURL(join(root, "package.json")))(
    "sharp"
  ) as (input: Buffer) => { png(): { toBuffer(): Promise<Buffer> } }
  return sharp(Buffer.from(svg)).png().toBuffer()
}

async function main(): Promise<void> {
  const feedback = process.env.MELLOWCAD_MCP_FEEDBACK
  const server = createServer(new DrawingSession(), {
    feedback: FEEDBACKS.find((known) => known === feedback) ?? "text",
    outDir: process.env.MELLOWCAD_MCP_OUT ?? null,
  })
  // One message at a time: a call must not start on a drawing the one before
  // it is still changing.
  for await (const line of createInterface({ input: process.stdin })) {
    if (line.trim() === "") continue
    const response = await server.handle(JSON.parse(line))
    if (response !== null) process.stdout.write(JSON.stringify(response) + "\n")
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  await main()
}
