---
description: The MCP server at /mcp — stateless, one tool over the command line, its limits, its firewall and what it promises
paths:
  - "app/mcp/**"
  - "lib/mcp/**"
  - "lib/command-script.ts"
  - "scripts/mcp/**"
---

# The MCP server (`/mcp`)

> Verified against **mcp-handler 2.3.1**, **@modelcontextprotocol/server 2.4.0**.

Why it exists, what it measured and what comes next: `docs/next-mcp.md`.

- **Stateless, one tool** (`draw`): every call types its script on an empty drawing
  (`lib/mcp/draw.ts`, nothing of Vercel's in it, so it can move) and answers with the command
  window, the objects and the editor's link. No session, store, account or log of a script:
  `/privacy` says so (`Privacy.assistant*`), and anything kept would change it in the same commit.
- **The script is typed by `runScript`** (`lib/command-script.ts`), the editor's `#run=` too, so a
  link draws what the server answered. Its leniencies and stops are the script's, never the
  engine's; a command that opens a dialog box stops it (`DIALOG_COMMANDS`, which a test holds to
  every command that opens one).
- **The description is built from the engine's catalog** (`drawDescription`): a command added is
  offered, and one that reaches a file, the clipboard or the screen is left out (`NOT_OFFERED`).
- **Limits**: the script's size and objects (`MAX_SCRIPT_CHARACTERS`, `MAX_SCRIPT_LINES`,
  `MAX_SCRIPT_OBJECTS`, the editor's too), a deadline checked between answers
  (`MAX_DRAW_MILLISECONDS`), a body read up to 64 KB whatever its header says, **no JSON-RPC
  batch** (the SDK takes 100 calls in one request, which no limit per call sees; neither Claude
  nor ChatGPT sends one), and **the cut**: one answer can run long
  (a 1000 × 1000 ARRAYRECT, a million objects in 3.3 s), so `draw` runs in a `node:vm` context
  whose timeout ends it mid-answer (`MAX_CALL_MILLISECONDS`), the route's `maxDuration` behind it.
  Never a worker: it loads the engine per call. A cut drawing is never read again.
- **The chat's view** (MCP Apps, `lib/mcp/viewer.ts`): one static page, `VIEWER_URI`, that a
  host may fetch before the call and cache by its URI, so a change it cannot read is a new URI.
  Everything inline, nothing fetched (the default CSP; Claude's `ui.domain` is left out: a wrong
  one hides the view). The drawing travels in the result's `_meta` (`VIEW_META_KEY`), never in
  `structuredContent`, which ChatGPT reads to the model and Claude Code sends instead of the
  text. Its SVG is the engine's preview and presenter, capped at `MAX_VIEW_CHARACTERS` (Claude
  shows no view of a result past some 150,000). The script is hand-written ES2020 in a string
  (no compiler touches it; the SDK is 300 KB): a test parses it, a browser runs it against
  ext-apps' own AppBridge (skill `browser-verify`). It reports its height inline only.
- **The link draws what the answer says**: none after a stop by time, which the editor would
  outrun. Its origin is `SITE_URL` in production and the request's elsewhere, so a preview's link
  opens that preview. `/draw`'s measurements drop the fragment (`EditorMetrics`): `/privacy`
  promises the script never reaches a server.

## The firewall (Vercel, set through its API)

The Vercel CLI runs as `npm run vercel -- <args>`, with MELLOWCAD_VERCEL_TOKEN (a token scoped
to the `mellowcad` project, with an expiry, the owner's, in `~/.config/mcp-keys.env`): the shell's
`VERCEL_TOKEN` is nubigest's and answers "User not found" here, and `vercel login` lapses in 8 h.
The script pins the team and project, as a worktree has no `.vercel/`. A project token reads no
user, so `whoami`, `ls`, `inspect` and `remove` fail: use `vercel api`
(`/v1/security/firewall/config`, `/v6/deployments`, `/v13/deployments/<id>`). Usage and the
deployment retention are dashboard-only. A token past its expiry: the owner makes another.

Hobby pauses the whole team past a limit, the site with it; Active CPU (4 h a month) is the one
an abuser reaches. Three custom rules, Hobby's all, applied without a deploy:

1. **`mcp-off`**: path `/mcp`, Deny; kept **disabled**. Enabled, it is the switch that turns the
   server off at once.
2. **`mcp-rate`**: path `/mcp` and IP **not** in Claude's egress (`160.79.104.0/21`,
   `153.61.208.0/20`, platform.claude.com/docs/en/api/ip-addresses) nor ChatGPT's
   (openai.com/chatgpt-connectors.json, 289 prefixes on 2026-11-06, 75 a condition): Rate Limit,
   10 requests per 60 s by IP, fixed window, 429. Per IP, never for the providers: all their
   users leave through the same addresses. A stale list only limits a ChatGPT address it lacks.
3. **`mcp-providers-only`**: path `/mcp` and IP not in those lists, Deny; kept **disabled**. The
   switch for an attack from many addresses, which a limit per IP does not stop, that leaves
   Claude and ChatGPT working.

**Behind Cloudflare (18/11/2026, `cloudflare.md`) these see Cloudflare's addresses**: they guard
only calls to Vercel's own address, and `mcp-providers-only` enabled would block everyone. The
working copies are Cloudflare's, in `scripts/cloudflare/zone.ts`: `mcp_rate` (10 in 10 s, Free's
only period), skipped by the `mcp_providers` list, which `--apply` syncs from OpenAI's file, and
the switches `mcp_off` and `mcp_providers_only`, disabled. To flip one, its `enabled` there and
`npm run cloudflare -- --apply`.

What none of them bounds: one answer's memory (a large ARRAYRECT passed 2 GB before the cut,
which would end the instance and the requests it shares), and abuse sent through the providers.
On Hobby only moving the function off the team's plan removes that (`docs/next-mcp.md`, §7).
