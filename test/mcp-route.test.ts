import { describe, expect, it } from "vitest"

import { POST } from "@/lib/mcp/handler"
import { VIEWER_URI, VIEW_META_KEY } from "@/lib/mcp/viewer"

const URL_ = "https://preview.example/mcp"

async function rpc(
  method: string,
  params: Record<string, unknown> = {},
  version = "2025-06-18"
): Promise<{ status: number; body: Record<string, unknown> }> {
  const response = await POST(
    new Request(URL_, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json, text/event-stream",
        "mcp-protocol-version": version,
        "mcp-method": method,
      },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    })
  )
  const text = await response.text()
  // A Streamable HTTP answer may come as one server-sent event.
  const json = text.startsWith("{")
    ? text
    : (text.match(/^data: (.*)$/m)?.[1] ?? "{}")
  return { status: response.status, body: JSON.parse(json) }
}

describe("the MCP route", () => {
  it("initializes as a server of one tool", async () => {
    const { status, body } = await rpc("initialize", {
      protocolVersion: "2025-06-18",
      capabilities: {},
      clientInfo: { name: "test", version: "0" },
    })
    expect(status).toBe(200)
    expect(body.result).toMatchObject({
      serverInfo: { name: "MellowCAD" },
      capabilities: { tools: {} },
    })
  })

  it("lists draw, read-only, taking a script", async () => {
    const { body } = await rpc("tools/list")
    const tools = (body.result as { tools: Record<string, unknown>[] }).tools
    expect(tools.map((tool) => tool.name)).toEqual(["draw"])
    expect(tools[0]).toMatchObject({
      annotations: { readOnlyHint: true },
      inputSchema: { required: ["script"] },
    })
  })

  it("draws, and links to the editor where it was called", async () => {
    const { body } = await rpc("tools/call", {
      name: "draw",
      arguments: { script: "CIRCLE 0,0 10" },
    })
    const result = body.result as {
      content: { text: string }[]
      isError?: boolean
    }
    expect(result.isError).toBeFalsy()
    expect(result.content[0].text).toContain(
      "Open it in MellowCAD: https://preview.example/draw#run=CIRCLE+0,0+10"
    )
  })

  it("offers the chat's view: the extension, the tool's link to it, its page", async () => {
    const { body: init } = await rpc("initialize", {
      protocolVersion: "2025-06-18",
      capabilities: {},
      clientInfo: { name: "test", version: "0" },
    })
    expect(init.result).toMatchObject({
      capabilities: { extensions: { "io.modelcontextprotocol/ui": {} } },
    })
    // The revision without a handshake says it where it says the rest.
    const modern = "2026-07-28"
    const { body: discover } = await rpc(
      "server/discover",
      {
        _meta: {
          "io.modelcontextprotocol/protocolVersion": modern,
          "io.modelcontextprotocol/clientInfo": { name: "test", version: "0" },
          "io.modelcontextprotocol/clientCapabilities": {},
        },
      },
      modern
    )
    expect(discover.result).toMatchObject({
      capabilities: { extensions: { "io.modelcontextprotocol/ui": {} } },
    })
    const { body: list } = await rpc("tools/list")
    const [tool] = (list.result as { tools: Record<string, unknown>[] }).tools
    expect(tool._meta).toEqual({
      ui: { resourceUri: VIEWER_URI },
      "ui/resourceUri": VIEWER_URI,
    })
    const { body: read } = await rpc("resources/read", { uri: VIEWER_URI })
    const [page] = (
      read.result as {
        contents: { mimeType: string; text: string; _meta: unknown }[]
      }
    ).contents
    expect(page.mimeType).toBe("text/html;profile=mcp-app")
    expect(page.text).toMatch(/^<!doctype html>/)
    expect(page._meta).toMatchObject({
      ui: { prefersBorder: true },
      "openai/widgetCSP": { redirect_domains: ["https://preview.example"] },
    })
  })

  it("gives the view the drawing and its link, beside the text", async () => {
    const { body } = await rpc("tools/call", {
      name: "draw",
      arguments: { script: "CIRCLE 0,0 10" },
    })
    const result = body.result as {
      content: { text: string }[]
      _meta: Record<string, { svg: string; link: string; objects: number }>
    }
    const view = result._meta[VIEW_META_KEY]
    expect(view.objects).toBe(1)
    expect(view.svg).toMatch(/^<svg [^>]*viewBox="0 0 1200 1200"/)
    expect(view.link).toBe("https://preview.example/draw#run=CIRCLE+0,0+10")
    expect(result.content[0].text).not.toContain("<svg")
  })

  it("refuses a body larger than a script can make, whatever its header says", async () => {
    // A stream carries no Content-Length: the body is measured as it is read.
    const big = new TextEncoder().encode(" ".repeat(1024 * 1024))
    const response = await POST(
      new Request(URL_, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: new ReadableStream({
          start(controller) {
            controller.enqueue(big)
            controller.close()
          },
        }),
        duplex: "half",
      } as RequestInit)
    )
    expect(response.status).toBe(413)
  })

  it("refuses a batch, which would hold many calls in one request", async () => {
    const call = {
      jsonrpc: "2.0",
      method: "tools/call",
      params: { name: "draw", arguments: { script: "CIRCLE 0,0 10" } },
    }
    const response = await POST(
      new Request(URL_, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "application/json, text/event-stream",
        },
        body: JSON.stringify([
          { ...call, id: 1 },
          { ...call, id: 2 },
        ]),
      })
    )
    expect(response.status).toBe(400)
    expect(await response.json()).toMatchObject({
      error: { message: /Batches are not accepted/ },
    })
  })
})
