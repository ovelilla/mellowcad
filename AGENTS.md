<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# mellowcad

A browser CAD drafting app modelled on AutoCAD. `cad/` is a framework-free, DOM-free
engine; Next.js/React is only a presentation shell around it.

## Commands

| Task       | Command                                                                                    |
| ---------- | ------------------------------------------------------------------------------------------ |
| Dev server | `npm run dev` (often already running; check the port — it hops to 3001 when 3000 is taken) |
| Types      | `npm run typecheck`                                                                        |
| Lint       | `npm run lint`                                                                             |
| Tests      | `npm test` / `npm run test:watch` / `npm run test:coverage`                                |
| Catalogs   | `npm run locales` after editing `cad/locales/<tag>.json`                                   |
| Knowledge  | `npm run knowledge` (part of `npm test`; prints the rules loaded per file)                 |

`typecheck` + `lint` + `format:check` + `test:coverage` must pass before a change is done;
`.githooks/pre-commit` runs exactly that. GitHub Actions (`.github/workflows/ci.yml`) has not run since 2026-10-18
(billing), so the hook is the only gate: never `--no-verify` unless the same checks just passed in
a clean worktree. `npm run build` is outside the gate (it fights the dev server over `.next`).

## Architecture

Hexagonal. Dependencies point **downward only**; a layer never imports from one above it (the
table per layer, with `shared/`, `i18n/` and `locales/`, is in `cad-engine.md`).

```
cad/geometry/      pure math kernel (Vec2, primitives). Zero dependencies.
cad/domain/        persistent model (entities, Document, layers, units, linetypes, lineweights, colors)
cad/scene/         neutral render representation (ScenePrimitive, THEME). Screen-space.
cad/serialization/ versioned tolerant JSON drawing file
cad/application/   orchestration: CadRuntime, tools, snapping, constraints, tracking, commands
cad/adapters/      the only browser-aware layer: CadEngine (composition root), presenters, storage
```

React imports the public barrel `@/cad` only — never a deep path (`cad/entryPoints.test.ts`).
Two root layouts under the `[locale]` root param: the editor is `/draw` (`app/[locale]/(app)/`),
the landing is `/` (`app/[locale]/(marketing)/`, `components/marketing/`). Other languages are
prefixed (`/es/draw`). Texts live in `messages/` (next-intl) and `cad/locales/` (the engine).

## Non-negotiable invariants

- **`cad/` outside `adapters/` is DOM-free.** No `window`, `document`, `canvas`, `HTMLElement`
  (ESLint). A test that suddenly needs jsdom means a layering rule was broken.
- **`cad/` is visually agnostic.** Tools and the scene builder emit `ScenePrimitive[]`;
  only the presenters touch a canvas or SVG.
- **Every entity mutation goes through a `Command`** executed via `ctx.execute(...)` /
  `history.execute(...)`. Direct `document.add/update/remove` from a tool is a bug — it breaks
  undo. (Drawing settings and style tables have setters of their own: `cad-runtime.md`.)
- **One user gesture = one undo step.** A gesture's edit is one command (`UpdateEntitiesCommand` /
  `AddEntitiesCommand` / `ReplaceEntitiesCommand`); the runtime groups a command's whole run.
- **`geometry/` and `domain/` are pure**: no I/O, no mutation of inputs, no hidden state but the id
  counters.
- **The engine's words live only in `cad/locales/en.json`** (run `npm run locales` after editing it):
  tools name prompts and keywords by id, `domain/` exposes ids, never display names.

## AutoCAD fidelity is the spec

The bar: **someone who uses AutoCAD every day should sit down at this app and work from muscle
memory.** Command names and aliases, the order of the prompts, the keyword letters, the defaults
and what each option does must be the ones they already know.

- **Match the current AutoCAD** (2027, the one installed, and its Autodesk Help). Do not implement
  from a vague recollection of an older release — when a behaviour is unclear or you are guessing,
  look it up first (skill `autocad-research`). Research has repeatedly overturned the "obvious"
  design here.
- **What must match**: the functional and interaction contract — commands, aliases, prompt
  sequences, keywords, defaults, option semantics, what a gesture produces.
- **What may differ**: visual presentation and chrome — panel layout, styling, iconography, and
  anything the browser cannot reproduce. A different-looking palette is fine; a different-behaving
  command is not.
- **Do not "improve" a behaviour that looks awkward** — it is usually load-bearing. OFFSET really
  is one object at a time; the Center-Diameter guide really does extend past the rim, because its
  length _is_ the diameter cue. Bespoke visuals invented to compensate get rejected.
- **A partial command is fine; a reinvented one is not.** Implement the core faithfully and record
  the missing options in its entry in `docs/coverage/`, rather than substituting an easier gesture
  of our own.
- **Deviations are allowed only when the platform forces them** or the surrounding feature does
  not exist here — e.g. F4 for selection cycling because browsers keep Ctrl+W, or LWDISPLAY
  defaulting on because we have no layouts or plotting. Check the platform first: Chrome does
  let a page take Ctrl+9, Ctrl+0 and Ctrl+1. Every one gets a `WHY` comment at the
  code and a note in its coverage entry.

## How this project works

- **Reply in Spanish.** Code, comments, commit messages and everything in the repo's knowledge
  are in English.
- **Decide, don't ask.** The owner does not answer technical, design or product questions: take
  the most standard option by current conventions, note why in one line, and go on. Never end a
  plan with "open decisions". This does not cover destructive or outward-facing actions (deleting
  data, publishing, spending): take the conservative path, and still confirm when it cannot be
  avoided.
- **Commit when the gate passes; never push unasked.** A push to `main` deploys to production on
  Vercel, so it waits for the owner's word. Commits are `feat(engine): …`, `fix(engine): …`,
  `docs: …`; a multi-line message goes through `git commit -F - <<'EOF'`.
- **Verify tool behaviour with the Vitest harness** (`test/harness.ts`), not a browser. The
  browser is only for what the harness cannot see: skill `browser-verify`.
- **Comments**: only non-obvious _why_ — fidelity rationale, workarounds, ordering constraints,
  invariants, gotchas. No banner dividers, no JSDoc that echoes the symbol name, no restating code.
- **Naming is already good — do not mass-rename.** Single-letter math variables in
  `geometry/` are correct notation.
- Do not add features, options or abstractions that were not asked for. This codebase grows one
  AutoCAD command at a time, each fully finished: skill `finish-feature`.
- **Several sessions may work in this tree at once.** Stage only your own files or hunks. The hook
  checks the whole tree, so when someone else's change turns it red, verify yours in a clean
  worktree and commit once the tree is green.
- **Everything runs in WSL2 (Ubuntu) with Bash.** The repo lives in `~/projects/mellowcad`, on
  the Linux disk, and VS Code connects through Remote-WSL: no native Windows, PowerShell or
  `/mnt/c` working copy (slow, and the watchers miss changes there). The one Windows program used
  is AutoCAD 2027 (console and desktop), through `scripts/research/`. Scratch files go in a `mktemp -d`
  directory outside the repo.

## Where the knowledge lives

- **`.claude/rules/`** — the rules of each area, loaded with the files their `paths:` match (by
  Claude Code and by Copilot). Creating something in an area without having opened a file of it,
  read its rule first: `cad-engine.md` (layers, model), `cad-runtime.md` (input, snapping,
  history, adapters), `cad-scene.md` (scene, presenters), `cad-tools.md` (writing a tool),
  `cad-catalogs.md` (prompts, keywords), `testing.md`, `ui.md` (the editor), `marketing.md` (the
  landing), `i18n.md` (languages), `knowledge.md` (where knowledge goes).
- **Skills** (`.claude/skills/`, loaded on demand): `new-command`, `extend-model`,
  `autocad-research`, `browser-verify`, `add-language`, `finish-feature`, `deps-review`.
- **`docs/coverage/`** — what each implemented command does and which AutoCAD options it still
  lacks, one file per area, plus the roadmap. **Read a command's entry before extending it** —
  the gaps are deliberate and already researched.
- `docs/i18n-glossary.md` — the interface terms in each language and how each one is written.
- `cad/README.md` — the engine's public contract for whoever integrates it. Keep it true when that
  contract changes.
- `docs/next-*.md` — the brief for the next piece of work, when one has been agreed; deleted once
  it ships.
- `scripts/research/` and `research/` (gitignored) — AutoCAD's runners, its tracer plugin and
  its string tables.

A rule that is now wrong is worse than no rule: fix or delete it in the change that made it wrong.
Keep this file short: it is loaded on every request (`test/knowledge.test.ts` caps it).
