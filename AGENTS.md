<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# mellowcad

A browser CAD drafting app modelled on AutoCAD. `cad/` is a framework-free, DOM-free
engine; Next.js/React is only a presentation shell around it.

## Commands

Run from the workspace root (`package.json` is at the root).

| Task       | Command                                                                                    |
| ---------- | ------------------------------------------------------------------------------------------ |
| Dev server | `npm run dev` (often already running; check the port — it hops to 3001 when 3000 is taken) |
| Types      | `npm run typecheck`                                                                        |
| Lint       | `npm run lint`                                                                             |
| Tests      | `npm test` / `npm run test:watch` / `npm run test:coverage`                                |

`typecheck` + `lint` + `test` must all pass before a change is done — `.githooks/pre-commit`
and `.github/workflows/ci.yml` run exactly that. `npm run build` is deliberately outside both
gates (it fights the dev server over `.next`).

## Architecture

Hexagonal. Dependencies point **downward only**; a layer never imports from one above it.

```
cad/geometry/     pure math kernel (Vec2, primitives). Zero dependencies.
cad/domain/       persistent model (entities, Document, layers, units, linetypes, lineweights, colors)
cad/scene/        neutral render representation (ScenePrimitive, THEME). Screen-space.
cad/serialization/ versioned tolerant JSON drawing file
cad/application/  orchestration: CadRuntime, tools, snapping, constraints, tracking, commands
cad/adapters/     the only browser-aware layer: CadEngine (composition root), canvas presenter, localStorage
```

React imports the public barrel `@/cad` only — never a deep path.

Two root layouts: the editor is `/draw` (`app/(app)/`), the landing is `/` (`app/(marketing)/`,
`components/marketing/`, copy in `messages/`). The landing's rules are in
`.github/instructions/marketing.instructions.md`.

## Non-negotiable invariants

- **`cad/` outside `adapters/` is DOM-free.** No `window`, `document`, `canvas`, `HTMLElement`.
  A test that suddenly needs jsdom means a layering rule was broken.
- **`cad/` is visually agnostic.** Tools and the scene builder emit `ScenePrimitive[]`;
  only `CanvasScenePresenter` touches `CanvasRenderingContext2D`.
- **Every document mutation goes through a `Command`** executed via `ctx.execute(...)` /
  `history.execute(...)`. Direct `document.add/update/remove` from a tool is a bug — it breaks undo.
- **One user gesture = one undo step.** Batch with `UpdateEntitiesCommand` / `AddEntitiesCommand` /
  `ReplaceEntitiesCommand` rather than emitting several commands.
- **`geometry/` and `domain/` are pure**: no I/O, no mutation of inputs, no hidden state.

## AutoCAD fidelity is the spec

The bar: **someone who uses AutoCAD every day should sit down at this app and work from muscle
memory.** Command names and aliases, the order of the prompts, the keyword letters, the defaults
and what each option does must be the ones they already know.

- **Match the current AutoCAD** (2025/2026 documented behaviour, Autodesk Help). Do not implement
  from a vague recollection of an older release — when a behaviour is unclear or you are guessing,
  look it up first. Research has repeatedly overturned the "obvious" design here.
- **What must match**: the functional and interaction contract — commands, aliases, prompt
  sequences, keywords, defaults, option semantics, what a gesture produces.
- **What may differ**: visual presentation and chrome — panel layout, styling, iconography, and
  anything the browser cannot reproduce. A different-looking palette is fine; a different-behaving
  command is not.
- **Do not "improve" a behaviour that looks awkward** — it is usually load-bearing. OFFSET really
  is one object at a time; the Center-Diameter guide really does extend past the rim, because its
  length _is_ the diameter cue. Bespoke visuals invented to compensate get rejected.
- **A partial command is fine; a reinvented one is not.** Implement the core faithfully and record
  the missing options in `docs/autocad-coverage.md`, rather than substituting an easier gesture of
  our own.
- **Deviations are allowed only when the platform forces them** or the surrounding feature does
  not exist here — e.g. F2 for the command prompt because browsers reserve Ctrl+9, or LWDISPLAY
  defaulting on because we have no layouts or plotting. Every one gets a `WHY` comment at the
  code and a note in `docs/autocad-coverage.md`.

## How this project works

- **Verify tool behaviour with the Vitest harness** (`test/harness.ts`), not Playwright.
  Playwright is only for things the harness cannot see: rendering, DOM, theming, CSS.
- **Comments**: only non-obvious _why_ — fidelity rationale, workarounds, ordering constraints,
  invariants, gotchas. No banner dividers, no JSDoc that echoes the symbol name, no restating code.
- **Naming is already good — do not mass-rename.** Single-letter math variables in
  `geometry/` are correct notation.
- Do not add features, options or abstractions that were not asked for. This codebase grows one
  AutoCAD command at a time, each fully finished.

## Where the details live

- `.github/instructions/` — scoped rules that load automatically with the files you touch
  (engine layering, tool authoring, UI, testing). **This is where every durable rule lives.**
- `docs/autocad-coverage.md` — what each implemented command does and which AutoCAD options it
  still lacks, plus the roadmap. Not auto-loaded. **Read the row for a command before extending it**
  — the gaps are deliberate and already researched.
- `docs/next-*.md` — the brief for the next feature, when one has been agreed; deleted once it ships.

## Finishing a feature

Alongside green `typecheck` + `lint` + `test`, close the loop on the written knowledge:

1. **Update the affected row in `docs/autocad-coverage.md`** — what the command now does and what
   it still lacks. Edit the row; do not append a narrative of the work. History belongs in git.
2. **Promote durable lessons to `.github/instructions/`.** The coverage file records capability;
   the instructions files are the rules. If while building it you hit any of these, the matching
   instructions file is now out of date and must be updated in the same change:
   - a new reusable base class, shared helper or extension point other tools should use;
   - a new step in a checklist (another switch to update for an entity type, another registration
     point for a tool);
   - a routing/ordering rule you had to discover by debugging;
   - a convention or invariant future work must respect.
3. **Correct anything the feature invalidated.** A rule that is now wrong is worse than no rule —
   edit or delete it rather than layering an exception on top.

Keep this file short: it is loaded on every request. Detail belongs in the scoped instructions.
