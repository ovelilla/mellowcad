---
paths:
  - "**/*.test.ts"
  - "test/**"
---

# Testing

Vitest + fast-check, `environment: "node"`, `globals: false` (explicit imports). What `npm test`
runs is `include` in `vitest.config.ts`. Browser checks (Playwright): skill `browser-verify`.

**A test that needs jsdom means a layering rule was broken**: `cad/` outside `adapters/` is DOM-free
by design. Fix the layering, never the environment.

## The harness is the default way to verify a tool

`createHarness` (`test/harness.ts`) builds a headless `CadRuntime` with in-memory store, files and
clipboard, disposed by `onTestFinished`. It is a thin subclass of `CadDriver`
(`cad/application/CadDriver.ts`), the engine's one DOM-free way of being driven, which the landing's
demo scripts replay through too (`DemoScript.ts`): its inputs and readers are the API. **A new
chainable input belongs on `CadDriver`**, never on the harness, so the engine is never driven two
ways.

```ts
const h = createHarness({ entities: [lineOf(p(0, 0), p(100, 0))] })
h.command("LINE").click(p(0, 0)).type("@100,0").enter().escape()
expect(h.latest()).toBeDefined()
```

- Everything is in **world coordinates**, projected through the live viewport (1000×800, scale 1).
  Off the plan or in a tilted UCS, click a world `Vec3`; what is typed is still read in the UCS.
  `-VIEW` Orthographic Front is the quickest tilted UCS (`front()` in `cad/application/tools/tiltedUcs.test.ts`).
- Off by default, for determinism: snapping (`{ snap: true }`), polar tracking (`{ polar: true }`
  or F10) and the UCS icon (`{ ucsIcon: true }`), which would add its parts to every scene counted.
  Seed a block table with `blocks`, as `entities` seeds geometry.
- **`option(id)` names a keyword by its global id** (`.option("Close")`) and answers as a user of
  the command language would; an id the running command lacks throws. Letters are tested apart,
  per language (`optionAbbreviations()`, and `locale.test.ts`).
- `createHarness({ locale })` runs another language: `locale.test.ts` types what a Spanish AutoCAD
  user types (LINEA, `_LINE`, `H` to undo). `cad/locales/foreignHost.test.ts` is a host from
  outside, testing what `cad/README.md` promises an integrator.
- Keys route exactly like the real UI: through the dynamic input when a field is focused, else
  `keyDown`. A menu at the cursor holds focus while open, so `escape()` closes it and the command
  goes on; a shortcut menu's entry is `runtime.chooseShortcutMenuAction(id)` /
  `chooseShortcutMenuOption(id)`.
- `enter()` with a field focused commits the box as the keyboard's Enter does, and a right-click's
  Enter is the same path: with nothing typed, the prompt's default or the end of the command, never
  the cursor's reading (`cad/application/dynamicInputEnter.test.ts` runs each case both ways). A keyword-only
  prompt is answered with `press` per key and Enter (`type` only fills a field); in MTEXT's editor
  `type` writes newlines and `enter()` is Ctrl+Enter.

Known behaviours: grips are hit before click-selection (a shift-click meant to remove must miss the
entity's grips). With no command, picks add to the selection (PICKADD 2) and a click on nothing
starts a window, so empty the set with `escape()`. With snapping on, a click _on_ a line lands on
its nearer endpoint: aim off it, or turn that snap off. Extension and OTRACK need a dwell:
`vi.useFakeTimers()`, `moveTo`, `vi.advanceTimersByTime(300)`, `moveTo` again. The pointer stays
where the last gesture left it and SelectTool draws a rollover preview of what is under it: a test
that counts scene primitives `moveTo`s a clear spot first.

## Snapshots

**Two snapshots guard what the engine says in English**: `englishSurface.test.ts` walks every
command through its prompts, keywords, messages, canvas text, grips and the Properties palette, and
`content/transcripts.test.ts` holds the landing's transcripts and the hero's timing. A change that
moves or rewords text leaves both untouched; update them (`-u`) only when the English is meant to
change, and read the diff.

## The browser adapter

`cad/adapters/CadEngine.test.ts` drives the one browser-aware class in Node through a hand-made DOM
(`EventTarget` subclasses that know their parent, stubbed `window`, `ResizeObserver`,
`requestAnimationFrame`), still no jsdom. An event reaches a target by defining `target` on it and
dispatching on the document, where the engine listens. Use it for wiring (which keys reach the
runtime, what is prevented, which store is written), never for tool behaviour.

## Helpers

- `test/matchers.ts` — `toBeCloseToPoint`, `toBeCloseToPoints`, `toBeCloseToAngle`. **Never
  `toEqual` on a `Vec2`**: `-0 !== 0` under `Object.is`.
- `test/builders.ts` — `p`, `deg`, entity builders, `documentWith`, `snapshotOf`. Pass explicit
  ids whenever identity matters (update in place against replace).
- `test/arbitraries.ts` — fast-check generators (`coordinate` is well-conditioned on purpose,
  `wildCoordinate` for stress). Use property tests for `geometry/` and `domain/` invariants.

## Coverage

The thresholds in `vitest.config.ts` are a **ratchet**: raise them as coverage grows, never lower
one to turn a build green. The pre-commit hook runs `npm run test:coverage`, so a type that adds a
parser branch owes the tolerance tests that walk it (`cad/serialization/drawingFile.test.ts`).
