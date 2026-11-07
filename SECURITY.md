# Security policy

**Report a vulnerability privately, never in an issue**: in this repository's Security tab,
**Report a vulnerability** ([straight to the form](https://github.com/ovelilla/mellowcad/security/advisories/new)).
Only the maintainer sees it. Without a GitHub account, write to hello@mellowcad.com.

Say what it affects, how to reproduce it and what it lets an attacker do. The fix is published
with an advisory, which credits you if you want.

## What is supported

| What                                                                   | Fixed      |
| ---------------------------------------------------------------------- | ---------- |
| The site, mellowcad.com, deployed from `main`                          | yes        |
| `@mellowcad/engine`, `@mellowcad/react` and `@mellowcad/editor` on npm | the latest |
| An older version of a package                                          | no: update |

MellowCAD has no accounts and no server that sees a drawing: a file it opens is read in the
browser. A drawing, a DXF or a link that makes a page run code it should not is what to report
here. A fault in a service it runs on (Vercel, Cloudflare, GitHub, npm) goes to that service.
