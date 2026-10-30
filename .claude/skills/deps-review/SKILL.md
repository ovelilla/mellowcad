---
name: deps-review
description: The weekly review of mellowcad's dependencies — claim it with the deps-review branch, read npm run deps:check, advisories first, then each update with its changelog and published diff, the rules that cite it, majors studied and deferred with a reason, a clean install in its worktree, the gate, one commit per package or group, and docs/deps-review.json closed. Use when the session hook says a review is due (before the session's task), when asked to update dependencies, or on a security advisory.
---

# Reviewing dependencies

Every week, to the latest stable with the risk controlled: no direct dependency moves without its
changelog and published code read, and what an update makes false in a rule is fixed in the same
commit. Updates need no permission and are reported at the end. **Replacing a package with another,
or adding an `overrides`, waits for the owner's OK**: present the recommendation and its analysis,
install nothing.

**Why it is enforced.** A reminder that said "when the task allows" let the review slip, because a
task never allows. Now `docs/deps-review.json` dates it (only the review's close moves
`lastReview`, never a one-off update) and, once due, the session hook puts it before the session's
task. No gate fails on a date: a red build on a calendar would block every session at once.

## 0. Claim it and read the report

- **The branch is the claim.** Several sessions share the tree, and the clean install deletes
  `node_modules` under them. Work in a worktree on branch `deps-review`:

  ```bash
  git worktree add ../mellowcad-deps -b deps-review main && cd ../mellowcad-deps && npm ci
  ```

  If the branch already exists another session holds the review (the hook says since when): leave
  `package.json` and the lockfile alone. One idle for a day was abandoned: read
  `git log main..deps-review`, then finish it or delete it.

- `npm run deps:check`, read whole (`scripts/deps/check.ts`). It lists the advisories, the updates
  by kind with their changelog, `npm diff` command, **peer blockers** (installed packages whose peer
  range misses the new version) and the files that cite the package; what sits in the quarantine;
  deprecated and unmaintained packages; the workflows' actions; Node; and what
  `docs/deps-review.json` deferred or accepted, flagging what expired. `npm outdated` is no
  substitute: it stops at `ENOVERSIONS` while a package of ours is younger than the quarantine.
- **The quarantine** (`.npmrc`, `min-release-age=3`): the target is the newest stable release at
  least 3 days old, so a compromised release is usually pulled before it reaches us. Younger ones
  wait for the next review; only a security fix skips it (`--min-release-age=0`, after reading its
  `npm diff`).

## 1. Security first

An advisory does not wait for the weekly review. For each one the report flags:

- Read it (`gh api advisories/<GHSA>`): which function fails, under what input.
- Does our use reach it? Runtime or tooling (the report marks `RUNTIME`; `npm ls <package>` gives
  the path), and who controls the input. Example: `next/og`'s 2026 RCE needed attacker values in the
  image, and our OG routes are `force-static` with `dynamicParams = false`.
- **A fixed version the tree accepts**: take it, even in dev tooling — updating the direct
  dependency that brings it, or `npm update <transitive>` aimed at it, never a blanket update. Then
  read the lockfile's diff: an aimed update can move others in its subtree. Never
  `npm audit fix --force`, which takes majors unread.
- **Reached and only an `overrides` or nothing fixes it**: tell the owner at once; it is their
  decision.
- **Not reached and no fix the tree accepts** (dev tooling fed our own input, a feature we do not
  use): accept it in `acceptedAdvisories` (`id`, `reason` with what fix to watch and where, `date`).
  The report flags it again after 180 days, and when it leaves the audit.

## 2. Each update (patch, minor, major)

1. **Changelog or releases** of every version in between: behaviour changes, deprecations, new
   APIs that replace code or a workaround of ours, peer and Node requirements.
2. **Published code**: the report's `npm diff` (`--diff-name-only` first on a big package). Always
   `package.json`: new dependencies and install scripts (`preinstall`, `install`, `postinstall`) —
   a new script in a patch is how a compromised package looks. Then the `.d.ts` of what we use
   (`git grep` the symbol) for changed signatures and `@deprecated`.
3. **Groups that move together**, and the report's `peers:` line: `next` with
   `eslint-config-next`; `react`, `react-dom` and `@types/react*`; `vitest` with `@vitest/*`;
   `typescript` within the peer range of the `typescript-eslint` that `eslint-config-next` brings;
   `@types/node` with the Node major we run (CI's `node-version`, Vercel's runtime and the local
   one), never ahead of it. `eslint` follows `eslint-config-next`'s peer range (`>=9.0.0`), not
   that of the plugins it brings: `import`, `jsx-a11y` and `react` still declare ESLint 9, so
   every install warns `ERESOLVE overriding peer dependency` — expected (their rules ran under
   ESLint 10.13, 2026-10-30).
4. **The examples** (`examples/*/package.json`) are not workspaces: a tool the repo also has
   follows the root's range (`test/packages.test.ts`), and `vite` and `@vitejs/plugin-react` are
   reviewed here like a direct dependency. `npm run check:hosts -w packages/editor` installs them.
5. **What cites it** (the report's `cited by:`). A rule whose header says
   `> Verified against **<pkg> <version>**` fails `test/knowledge.test.ts` until its claims are
   checked against the new source in `node_modules` and the version updated.
6. **Install** keeping the manifest's range style (`^`, or exact with `-E` where it is exact), in
   every manifest that lists it; a caret's floor moves up to the version installed.
7. **Adapt the code** to the changelog; adopt a new API when it replaces our own code.
8. **A major not taken is deferred**, never just left: what was read and what blocks it go in
   `deferred` (`name`, `version` studied, `reason` with what to wait for). The report repeats the
   reason each week and asks for a new study once a later version comes out.
   `test/deps.test.ts` fails on a deferral that is already installed. Prereleases are read to
   anticipate the work, never installed.
9. **Transitive dependencies** move with the direct one that brings them or for security, never by
   a blanket `npm update` (it fights the quarantine and moves directs unread).

## 3. Outside the manifests

- **Actions** of `.github/workflows/`: a new major after reading its releases (Node runtime
  changes). CI runs them only after a push.
- **Node**: a security release of our major is installed now (`nvm install`, `nvm alias default`).
  A new LTS moves `node-version` in the workflows, the local Node and `@types/node` together, once
  Vercel offers it.
- **MCP servers** pinned with `npx` in `.mcp.json` and `.vscode/mcp.json`: like a direct
  dependency, both files at once; the change shows after reloading VS Code.

## 4. Deprecated or unmaintained

A package with no stable release in 12 months, an archived repository or a deprecated version:
check its real activity and the alternatives, measure our use (`git grep`), and either recommend a
replacement to the owner or keep it in `keptUnmaintained` (`name`, `reason`, `date`). A small
finished package is not abandoned.

## 5. Clean install, once per batch, in the worktree

```bash
rm -rf node_modules .next
npm ci 2>&1 | tee "$(mktemp -d)/npm-ci.txt"
npm audit signatures --min-release-age=0
```

`npm ci` fails when `package.json` and the lockfile disagree: fix with `npm install`, never by
deleting the lockfile. Read its `npm warn deprecated` lines (section 4). `npm audit signatures`
needs `--min-release-age=0` once the lockfile holds a release younger than the quarantine.

npm 11 runs no install script that `allowScripts` in `package.json` does not list, and every
entry there is `false` today (native builds and checks whose prebuilt binaries arrive as optional
dependencies). An `npm warn install-scripts` naming a package is a new script: read it
(`npm install-scripts ls`, then the script in `node_modules/<pkg>`) and
`npm install-scripts deny <pkg>` unless the package fails without it.

## 6. Verify

- The gate, in the worktree, on every commit (`.githooks/pre-commit`).
- Next, React, next-intl, Base UI, Tailwind, lucide or the PostCSS chain: also `npm run build` in
  the worktree (no dev server there to fight over `.next`) and a look at `/draw` and `/` in each
  language (skill `browser-verify`).
- Vitest or its config: the whole suite, and the coverage thresholds unchanged.
- A package's build dependency (`tsdown`, the editor's Babel and PostCSS chain):
  `npm run check:hosts -w packages/editor`, which needs the network.

## 7. Close, merge and report

- One commit per package or group, so one can be reverted alone:
  `chore(deps): update <pkg> to <version>`, with what mattered in the changelog and what changed in
  code or rules in the body.
- The last commit closes the review: `lastReview` today and `deferred`, `acceptedAdvisories` and
  `keptUnmaintained` up to date (`chore(deps): close the review of <date>`).
- **Back to `main`**, from the main tree: `git rebase main` in the worktree if `main` moved, then
  `git merge --ff-only deps-review`, `npm install` (never `npm ci` there: other sessions' tests and
  dev server use that `node_modules`), `git worktree remove ../mellowcad-deps` and
  `git branch -d deps-review`, which releases the claim. A `next` update needs the dev server
  restarted: say so.
- Report: what was updated, what was deferred and why, the advisories accepted, and the
  replacements waiting for the owner. Push only on the owner's word.
