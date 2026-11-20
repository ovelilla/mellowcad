// The MCP server (`/mcp`, rewritten here) as a Vercel function beside the
// exported site, which has no route handlers that read a request. WHY a stub:
// Vercel finds its functions by the files in `api/` before the build runs, so
// this one is committed, and the handler it re-exports is bundled from
// `lib/mcp/handler.ts` by `npm run build` (`scripts/mcp/function.ts`).
export { DELETE, GET, POST } from "./_handler.mjs"
