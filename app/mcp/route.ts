import { createMcpHandler, getPublicOrigin } from "mcp-handler"
import { z } from "zod"

import {
  DRAW_TOOL_NAME,
  DRAW_TOOL_TITLE,
  draw,
  drawDescription,
} from "@/lib/mcp/draw"
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
        },
        ({ script }) => {
          const answer = draw(script, origin)
          return {
            content: [{ type: "text", text: answer.text }],
            isError: answer.isError,
          }
        }
      )
    },
    { serverInfo: { name: SITE_NAME, version: "1.0.0" } }
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

async function handle(request: Request): Promise<Response> {
  const length = Number(request.headers.get("content-length") ?? 0)
  if (length > MAX_BODY_BYTES) {
    return new Response("Request too large.", { status: 413 })
  }
  return handlerFor(editorOrigin(request))(request)
}

export { handle as DELETE, handle as GET, handle as POST }
