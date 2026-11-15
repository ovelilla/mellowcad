import { createMcpHandler, getPublicOrigin } from "mcp-handler"
import { z } from "zod"

import {
  DRAW_TOOL_NAME,
  DRAW_TOOL_TITLE,
  draw,
  drawDescription,
} from "@/lib/mcp/draw"
import {
  DRAW_TOOL_META,
  VIEWER_MIME_TYPE,
  VIEWER_URI,
  VIEW_META_KEY,
  viewerContents,
} from "@/lib/mcp/viewer"
import { SITE_NAME, SITE_URL } from "@/lib/site"

// The MCP server (`docs/next-mcp.md`): stateless, one tool, nothing stored.
// Its guards against a flood are the Vercel firewall's, set in the
// dashboard (`.claude/rules/mcp.md`); here, what bounds one call.

/**
 * A call is about 25 ms and is cut at `MAX_CALL_MILLISECONDS`; the
 * platform's end is behind it, for a request of several calls (a JSON-RPC
 * batch) or whatever the cut does not reach.
 */
export const maxDuration = 5

/** A script is 10,000 characters at most; the JSON around it is small. */
const MAX_BODY_BYTES = 64 * 1024

const description = drawDescription()

function handlerFor(origin: string): (request: Request) => Promise<Response> {
  return createMcpHandler(
    (server) => {
      server.registerTool(
        DRAW_TOOL_NAME,
        {
          title: DRAW_TOOL_TITLE,
          description,
          inputSchema: z.object({
            script: z
              .string()
              .describe(
                "The command-line input, one answer per line. Example: LINE\\n0,0\\n@100,0\\n@0,50\\nC"
              ),
          }),
          annotations: {
            // It writes nothing anywhere: ChatGPT asks the user before each
            // call of a tool that does not say so.
            readOnlyHint: true,
            idempotentHint: true,
            openWorldHint: false,
          },
          _meta: DRAW_TOOL_META,
        },
        ({ script }) => {
          const answer = draw(script, origin)
          return {
            content: [{ type: "text", text: answer.text }],
            isError: answer.isError,
            // The chat's view reads it; the model never does.
            _meta: { [VIEW_META_KEY]: answer.view },
          }
        }
      )
      server.registerResource(
        "drawing",
        VIEWER_URI,
        { title: `${SITE_NAME} drawing`, mimeType: VIEWER_MIME_TYPE },
        () => ({ contents: [viewerContents(origin)] })
      )
    },
    {
      serverInfo: { name: SITE_NAME, version: "1.0.0" },
      capabilities: { extensions: { "io.modelcontextprotocol/ui": {} } },
    }
  )
}

/**
 * The editor's link points at the site in production, and at the
 * deployment itself elsewhere, so a preview's link opens that preview.
 */
function editorOrigin(request: Request): string {
  return process.env.VERCEL_ENV === "production"
    ? SITE_URL
    : getPublicOrigin(request)
}

/**
 * The body, read up to `MAX_BODY_BYTES`; null past it. WHY read, not the
 * header: a chunked body carries no `Content-Length`.
 */
async function boundedBody(request: Request): Promise<string | null> {
  if (request.body === null) return ""
  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let size = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    size += value.byteLength
    if (size > MAX_BODY_BYTES) {
      await reader.cancel()
      return null
    }
    chunks.push(value)
  }
  return new TextDecoder().decode(Buffer.concat(chunks))
}

function rpcError(status: number, message: string): Response {
  return Response.json(
    { jsonrpc: "2.0", id: null, error: { code: -32600, message } },
    { status }
  )
}

async function handle(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return handlerFor(editorOrigin(request))(request)
  }
  const body = await boundedBody(request)
  if (body === null) return rpcError(413, "Request too large.")
  // WHY: the SDK takes a JSON-RPC batch of up to 100 messages, each draw a
  // call's whole cost, in one request no limit per call sees. Neither Claude
  // nor ChatGPT sends one.
  if (body.trimStart().startsWith("[")) {
    return rpcError(
      400,
      "Batches are not accepted: send one request at a time."
    )
  }
  return handlerFor(editorOrigin(request))(
    new Request(request.url, {
      method: "POST",
      headers: request.headers,
      body,
    })
  )
}

export { handle as DELETE, handle as GET, handle as POST }
