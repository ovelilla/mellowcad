import { describe, expect, it } from "vitest"

import { POST } from "@/app/mcp/route"

const URL_ = "https://preview.example/mcp"

async function rpc(
  method: string,
  params: Record<string, unknown> = {}
): Promise<{ status: number; body: Record<string, unknown> }> {
  const response = await POST(
    new Request(URL_, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json, text/event-stream",
        "mcp-protocol-version": "2025-06-18",
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
