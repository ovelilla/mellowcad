---
name: deps-review
description: Review and update mellowcad's npm dependencies — security advisories first, then each update with its changelog and published diff, the rules that cite it, a clean install, verification and one commit per package or group. Use when the session hook says a review is due, when asked to update dependencies, or on a security advisory.
---

# Reviewing dependencies

Every update to the latest stable, with the risk controlled: no direct dependency moves without its
changelog and published code read, and what an update makes false in a rule is fixed in the same
commit. Updates need no permission and are reported at the end. **Replacing a package with another,
or adding an `overrides`, waits for the owner's OK**: present the recommendation and its analysis,
install nothing.

## 0. Start

- `git status --short`. The clean install deletes `node_modules`: with another session in the tree,
  work in a worktree (`git worktree add ../mellowcad-deps -b deps`).
- `npm outdated` and `npm audit`. `.npmrc` sets `min-release-age=3`: npm resolves only versions at
  least 3 days old, so `npm outdated`'s Wanted/Latest can be younger than what installs.
- `next-devtools-mcp` is pinned in `.mcp.json` and `.vscode/mcp.json`, outside `package.json`:
  `npm view next-devtools-mcp version`, and it moves like a direct dependency (section 2).

## 1. Security first

An advisory does not wait for the next review. For each one (`npm audit --json`):

- Read the advisory (`gh api advisories/<GHSA>`): which function fails, under what input.
- Does our use reach it? Runtime or tooling (`npm audit --omit=dev`, `npm ls <package>`), and who
  controls the input. Example: `next/og`'s 2026 RCE needed attacker values in the image, and our OG
  routes are `force-static` with `dynamicParams = false`.
- **Reached**: tell the owner at once, then fix — a fixed version the tree accepts (update the
  direct dependency that brings it; a release younger than 3 days with `--min-release-age=0` after
  reading its `npm diff`); never `npm audit fix --force`, which takes majors unread. A fix only an
  `overrides` reaches, or no fix at all, is the owner's decision.
- **Not reached** (dev tooling fed our own input, a feature we do not use): say why in the report
  and leave it; it goes when the direct dependency updates.

## 2. Each update (patch, minor, major)

1. **Changelog or releases** of every version in between: behaviour changes, deprecations, new
   APIs that replace code or a workaround of ours, peer and Node requirements.
2. **Published code**: `npm diff --diff=<pkg>@<current> --diff=<pkg>@<new>` (`--diff-name-only`
   first on a big package). Always check `package.json`: new dependencies and install scripts
   (`preinstall`, `install`, `postinstall`) — a new script in a patch is how a compromised package
   looks. Then the `.d.ts` of what we use (`git grep` the symbol) for changed signatures and
   `@deprecated`.
3. **Groups that move together**: `next` with `eslint-config-next`; `react`, `react-dom` and
   `@types/react*`; `vitest` with `@vitest/*`; `typescript` within the peer range of the
   `typescript-eslint` that `eslint-config-next` brings. `npm view <pkg>@<new> peerDependencies`.
4. **What cites it**: `git grep -n "<pkg>" -- .claude AGENTS.md README.md docs`. A rule whose
   header says `> Verified against **<pkg> <version>**` fails `test/knowledge.test.ts` until its
   claims are checked against the new source in `node_modules` and the version updated.
5. **Install** keeping the manifest's range style (`^`, or exact with `-E` where it is exact); a
   caret's floor moves up to the version installed, as npm writes it.
6. **Adapt the code** to the changelog; adopt a new API when it replaces our own code.
7. **A major not finished in the session is deferred**: say what was read and what is left in the
   report, and leave it; the next review starts from there.
8. **Transitive dependencies** move with the direct one that brings them or for security, never by
   a blanket `npm update` (it fights the quarantine and moves directs unread).

## 3. Deprecated or unmaintained

A package with no stable release in 12 months, an archived repository or a deprecated version:
check its real activity and the alternatives, measure our use (`git grep`), and recommend to the
owner (replace, or keep with the reason). A small finished package is not abandoned.

## 4. Clean install, once per batch

With `next dev` stopped:

```bash
rm -rf node_modules .next
npm ci 2>&1 | tee "$(mktemp -d)/npm-ci.txt"
npm audit signatures --min-release-age=0
```

`npm ci` fails when `package.json` and the lockfile disagree: fix with `npm install`, never by
deleting the lockfile. Read its `npm warn deprecated` lines (section 3).

npm 11 runs no install script that `allowScripts` in `package.json` does not list. Today all three
are `false` (`@parcel/watcher`, `@swc/core`, `unrs-resolver`: native-binary builds and checks; the
prebuilt binaries arrive as optional dependencies). An `npm warn install-scripts` naming a package is
a new script: read it (`npm install-scripts ls`, then the script in `node_modules/<pkg>`) and
`npm install-scripts deny <pkg>` unless the package fails without it.

## 5. Verify

- Always the gate (`.githooks/pre-commit`): typecheck, the engine package's build and check,
  lint, format and `npm run test:coverage`.
- Next, React, next-intl, Base UI, Tailwind, lucide or the PostCSS chain: also `npm run build`
  and a look at `/draw` and `/` in each language (skill `browser-verify`).
- Vitest or its config: the whole suite, and the coverage thresholds unchanged.

## 6. Commit and report

- One commit per package or group, so one can be reverted alone:
  `chore(deps): update <pkg> to <version>`, with what mattered in the changelog and what changed
  in code or rules in the body. The session hook dates the last review from these commits.
- Report: what was updated, what was deferred and why, the advisories left and why they are not
  reached, and the replacements waiting for the owner. Push only on the owner's word.
