---
description: Cloudflare in front of Vercel — the zone as code, the page cache and its purge per deploy, the /mcp firewall, the token
paths:
  - "scripts/cloudflare/**"
  - ".github/workflows/purge-cache.yml"
---

# Cloudflare, in front of Vercel

Since 18/11/2026 mellowcad.com and www are proxied by Cloudflare (Free), to keep Vercel's Hobby ISR
reads and Fast Origin Transfer under their caps (`docs/next-vercel-usage.md`). **The zone is
code**: `scripts/cloudflare/zone.ts` declares it, `npm run cloudflare` prints what differs,
`-- --apply` makes it so and reads it back, `-- --purge` empties the cache. Never change it in the
dashboard: the next apply undoes it, or the code lies.

- **The token** is MELLOWCAD_CLOUDFLARE_TOKEN in `~/.config/mcp-keys.env`: the account token
  "mellowcad ops (local scripts)", the zone's read, DNS, settings, cache, purge, analytics and WAF,
  plus the account's rule lists, until 18/11/2027 (the owner makes another: Manage Account →
  Account API Tokens). The shell's CLOUDFLARE_API_TOKEN is nubigest's. A shell started before the
  file changed lacks it: `bash -ic "npm run cloudflare"`.
- **Pages stay a week at the edge** (the rule overrides Vercel's `max-age=0` there, never in the
  browser), and **each production deploy purges everything**: `.github/workflows/purge-cache.yml`,
  on Vercel's deployment status, once the domain serves the new commit (the report link names it),
  with the CLOUDFLARE_PURGE_TOKEN secret (purge only, no expiry) and the CLOUDFLARE_ZONE_ID
  variable. Unpurged, a cached page names scripts the new deployment no longer has.
- **Never cached**: the functions (`/mcp`, `/api/`), Vercel's `/_vercel/` and `/.well-known/`,
  `/_next/` (its own headers), and the router's requests (an `RSC` header or `_rsc`): Cloudflare
  ignores `Vary`. Vercel renews its certificates through `/.well-known/acme-challenge/` over plain
  HTTP, so Always Use HTTPS stays off; theirs run to 27/01/2027: check the renewal in January.
- **Vercel sees Cloudflare's addresses**, never the client's (Verified Proxy Lite keeps none): its
  per-IP rules count nobody behind the proxy. `/mcp`'s limit and switches are Cloudflare's
  (`mcp.md`), checked by `test/cloudflare.test.ts`.
- From WSL, past a resolver that still caches Vercel's address:
  `curl --resolve mellowcad.com:443:188.114.97.5 …`; `cf-cache-status` says HIT, MISS or DYNAMIC.
