---
applyTo: "**/*.test.ts,test/**"
description: "Testing conventions: the headless CadRuntime harness, custom matchers, builders, property-based arbitraries and the coverage ratchet."
---

# Testing

Vitest + fast-check, `environment: "node"`, `globals: false` (explicit imports).
`npm test` runs `cad/**/*.test.ts`, `test/**/*.test.ts` and `content/**/*.test.ts` — the last
being the landing's scripts and derived facts (see `marketing.instructions.md`).

**A test that needs jsdom means a layering rule was broken** — `cad/` outside `adapters/` is
DOM-free by design. Fix the layering, do not switch the environment.

## The harness is the default way to verify a tool

`test/harness.ts` builds a headless `CadRuntime` with fake `EngineHost` / `DrawingStore`,
auto-disposed via `onTestFinished`. It is a thin wrapper over `CadDriver`
(`cad/application/CadDriver.ts`), the engine's one DOM-free way of being driven — the landing replays
its demo scripts through the same driver (`DemoScript.ts`). **A new chainable input belongs on
`CadDriver`**, not on the harness, so tests and scripts can never drive the engine two ways.

```ts
const h = createHarness({ entities: [lineOf(p(0, 0), p(100, 0))] })
h.command("LINE").click(p(0, 0)).type("@100,0").enter().escape()
expect(h.latest()).toBeDefined()
```

- Everything is in **world coordinates**, projected through the live viewport — no calibration,
  survives zoom. Default 1000×800 viewport → scale 1.
- Snapping is **off by default** for determinism; pass `{ snap: true }` to exercise it.
- Chainable input: `command / click / drag / moveTo / wheel / type / enter / escape / option /
press / select / undo / redo`.
- Readers: `entities() / only<T>(type) / byId / latest / typeCounts / state() / scene() /
optionKeys() / selectedIds()`.
- Keys route exactly like the real UI: Enter/Escape/option keys go through the dynamic input when
  a field is focused, otherwise through `keyDown`.

Known harness behaviours worth remembering: grips are hit before click-selection (a shift-click
meant to toggle must avoid the entity's own grip positions), and the rubber band is construction
geometry, so anchor-free snaps are best asserted on the _first_ point.

The harness parks the pointer wherever the last gesture left it, and SelectTool draws a **rollover
preview** of whatever is under it. A test that counts scene primitives must therefore `moveTo` a
clear spot first, or it counts everything twice. Seed a block table with the `blocks` option, the
same way `entities` seeds geometry.

## The browser adapter

`cad/adapters/CadEngine.test.ts` drives the one browser-aware class in Node through a hand-made
DOM — `EventTarget` subclasses that know their parent, and stubbed `window`, `Node`,
`ResizeObserver` and `requestAnimationFrame` — still no jsdom. An event reaches a target by
defining `target` on it and dispatching on the document, which is where the engine listens. Use it
for wiring (which keys reach the runtime, what is prevented, which store is written), never for
tool behaviour: that is the harness's.

## Helpers

- `test/matchers.ts` — `toBeCloseToPoint`, `toBeCloseToPoints`, `toBeCloseToAngle`.
  **Never use `toEqual` on a `Vec2`** (`-0 !== 0` under `Object.is`).
- `test/builders.ts` — `p`, `deg`, `lineOf / circleOf / arcOf / polylineOf / rectOf / layerOf`,
  `documentWith`, `snapshotOf`. Pass explicit ids whenever identity matters (update-in-place
  versus replace).
- `test/arbitraries.ts` — fast-check generators (`coordinate` is deliberately well-conditioned;
  `wildCoordinate` for stress). Use property tests for `geometry/` and `domain/` invariants.

## Coverage

The thresholds in `vitest.config.ts` are a **ratchet** set just under what the suite achieves,
with `geometry/`, `domain/` and `serialization/` held much higher. Raise them as coverage grows;
never lower one to make a red build green.

## Playwright

Only for what the harness cannot see: canvas rendering, DOM, theming, CSS. If you do use it:

- **Verify against an empty drawing with default settings**, seeding only the few entities the
  check needs. Never test on top of whatever drawing happens to be loaded: a real drawing brings
  its own units, scales and layers, so a result is impossible to attribute and the values a
  feature should be judged on (DIMSCALE, LTSCALE, layer colours) are not the defaults.
- **Back up `localStorage` before seeding.** Copy `easycad:autosave:v1` to a `__…_backup` key and
  restore it afterwards — that key holds the user's drawing.
- Check the dev-server port first (it hops to 3001), and remember `localStorage` is per-origin.
- Scope dynamic-input typing to `[data-dynamic-input] input`; a bare `querySelector("input")`
  matches the hidden file input.
- A typed length takes its direction from the cursor, as AutoCAD's direct distance entry does:
  move the mouse off the last point before typing it, or LINE draws nothing.
- **Playwright launches Chromium without the back/forward cache.** Anything on `pageshow` or
  `pagereveal` after Back needs `ignoreDefaultArgs: ["--disable-back-forward-cache"]`, and then
  `goBack` / `waitForURL` with `waitUntil: "commit"` — a restored page fires no `load`.
- A cross-document view transition is observed from the new page: an init script runs before its
  first render, like a head script, so its `pagereveal` listener sees `viewTransition` and, once
  `ready`, the `::view-transition-*` animations by name. Repeat it a few dozen times — one flaky
  opt-in skipped a transition in five and a single run passed.
- Dispatch events in one `page.evaluate` and read the DOM in another — React commits async.
- **Anything that opens a menu or popover from a canvas gesture must be verified with trusted
  clicks** (`page.locator(…).click()`), never `dispatchEvent`. Synthetic events do not reproduce
  how a popup reacts to the release that follows the press, nor the `pointerleave` a portalled
  modal backdrop causes on the canvas — both have shipped bugs past a green synthetic check.
- A **React panel input** does not commit on a synthetic `blur`: React delegates `onBlur` from
  `focusout`. Drive those with `fill()` + `press("Enter")`, and give each field an `aria-label` so
  there is something to select it by.
- Autodesk's help viewer is a SPA that `fetch_webpage` cannot extract; **read it with Playwright**
  (`help.autodesk.com/view/ACD/2026/ENU/?guid=…`, then take `innerText`). Search engines start
  serving captchas after a few queries, so collect the GUIDs early and navigate by GUID after that.
  The viewer has its own search — `…/view/ACD/2026/ENU/?query=COPYCLIP`, then harvest the `?guid=`
  links — which beats guessing, and `…/cloudhelp/2026/ENU/AutoCAD-Core/files/<GUID>.htm` opens a
  page straight from its GUID.
- **A thin command page is not an undocumented behaviour.** COPYCLIP's reference page has no
  prompts at all; the rule that decides the whole feature ("the cursor location is based on the
  lower-left corner of the extents of the objects you selected") is on a _Have You Tried_ page, and
  the prompt order is on a _To …_ task page. Read `About …`, `To …` and `Have You Tried` before
  concluding that something cannot be verified.
- **Some rules only exist outside the harness.** The keys a focused field must keep (Ctrl+C in a
  dynamic-input box), the browser dialogs a shortcut must suppress, and an async host call that
  never settles are all invisible to the headless runtime — the clipboard shipped a hang that 31
  green harness tests could not see. Drive those with real keys on a real page.
