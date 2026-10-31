# @mellowcad/editor

## 0.1.0

### Minor Changes

- 62cc47d: `CadEditor` takes a `store`, where the drawing is restored from and autosaved to (this browser's `localStorage` when absent, as before), and `onEngine`, which hands the host the engine once it is built and `null` once it is disposed, to save, open or run commands from its own code.
- 118bbdb: F1 is AutoCAD's Help: the engine asks its host for the help of the running command, by its global name, or for the help's start with none (`CadEngineOptions.onHelp`, `CadDriverOptions.help`); `CadCanvas` hands `onHelp` on, and `CadEditor` opens its `help` links in a new tab. Without a help to show, F1 stays the browser's.
- The first version on npm: `@mellowcad/react` and `@mellowcad/editor` are public, with their npm page (description, keywords, and their docs as the homepage).

### Patch Changes

- f480eac: 3DPOLY draws a 3D polyline, a new entity type (`Polyline3dEntity`, `type: "polyline3d"`) whose vertices each keep their own Z: a host switching over `Entity["type"]` gains a case. The editor's palette offers it beside the splines, as the ribbon's expanded Draw panel does.
- e8e7697: The editor's documentation: a README to start from and four guides beside it (`docs/customizing.md`, `drawings.md`, `languages.md`, `nextjs.md`), and its API reference grouped by topic.
- eda1bd1: SPLINEDIT (SPE) edits a spline as AutoCAD 2027 does: Close / Open, Join, Fit data (Add, Close / Open, Delete, Move, Purge, Tangents), Edit vertex (Add, Delete, Elevate order up to 26, Move, Weight), convert to Polyline, Reverse and an Undo of its own per step, each run one undo step. The editor's rail gains Edit Spline in the Modify panel.
- Updated dependencies [f480eac]
- Updated dependencies [a9d7383]
- Updated dependencies [118bbdb]
- Updated dependencies
- Updated dependencies [8cbb6b6]
- Updated dependencies [3755cc8]
- Updated dependencies [d673436]
- Updated dependencies [c22ccae]
- Updated dependencies [11e075f]
- Updated dependencies [eda1bd1]
  - @mellowcad/engine@0.2.0
  - @mellowcad/react@0.1.0

## 0.0.1

### Patch Changes

- Updated dependencies
  - @mellowcad/engine@0.1.0
  - @mellowcad/react@0.0.1
