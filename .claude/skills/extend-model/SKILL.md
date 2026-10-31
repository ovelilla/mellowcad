---
name: extend-model
description: Checklists for extending the CAD engine's model. Use when adding an entity type, a dimension kind, an entity property (like colour or linetype), a style table, or an object snap type.
---

# Extending the model

The rules these steps serve are in `cad-engine.md` (modelling, dimensions, style tables) and
`cad-runtime.md` (snapping). Look up the AutoCAD behaviour before wiring anything in.

## An entity type

**The compiler points at every `switch (entity.type)`**: each names all the types, and one with a
fallback ends in `const unhandled: never`, so a new type fails to compile in each — the transforms,
overrides and queries, `applyEntityProperty`, `cloneEntityShape`, `planarPrimitives`,
`singleEntityInfo`, the editing tools' plans, and the switches that answer "nothing" for most types
(`objectArea`, `hatchLoopFromEntity`, `collectCurves`, `clipboardSnapshot`, `usesTextStyle`,
`selectedGrips`, `continuePoint`, UCS OBject in `ucsObjects.ts`). Place the type in each; never add
a `default:` that answers for the types it does not name.

**A test points at the file**: `ENTITY_TYPES` in `cad/serialization/drawingFile.test.ts` fails to
compile until the type is listed, then fails until the `entity` arbitrary in `test/arbitraries.ts`
generates it, and the round trip fails until `parseEntityShape` reads it (its `default:` must stay:
the file is untrusted). Bump `DRAWING_FILE_VERSION`. The Z fields come through `planeOf` /
`parsePlane`; thickness only if DXF gives the type one (then `hasThickness`).

**Neither sees** the subsets by design; decide for each: `TRIMMED` in `EdgeEditTool.ts`, `BROKEN` in
`BreakTool.ts`, `BOUNDARY_TYPES` in `HatchTool.ts`, `PLANE_ROWS` in `entityProperties.ts`,
`hasThickness`. A type that wears a **text style** (text, mtext, attdef, a reference's attributes)
also owes the type tests in `assignTextStyle`, `reconcile`, `setSelectionTextStyle` and
`EngineState`'s `hasStyleOf`: miss one and a style in use can be deleted.

A type that is drawn as other objects (a reference, a region, a solid) answers each query through
them (`insertFlatGeometry`, `regionLevelEdgeEntities`, `solidEdgeEntities`), and a command that takes "the edge picked" reads
it as that object (`regionEdgeAt`).

Then the parts that are no switch at all:

- Name anything new the type exports in the `entities.ts` barrel.
- `snapping/providers.ts`: **snapping is opt-in**. A hatch is in no provider because OSOPTIONS
  ships at 7 ("Object snaps ignore hatch objects"): look up what AutoCAD snaps to first. A curve
  whose intersections have no closed form joins Intersection as the chords of its tessellation near
  the cursor only (`collectShapes`'s `near`), tagged with `curveId` so its own chords never meet.
- The type's name in `interface.entity` and its rows in `interface.property` (`cad/locales/en.json`,
  then `npm run locales`).

## A dimension kind

A `DimensionKind` is not an entity type: transforms, grips, snapping and the file format come for
free. It owes:

1. A branch in `dimensionAxisAngle`, `dimensionMeasurement` and, if it carries a symbol or another
   unit, `dimensionText`; a body in `dimensionGeometry` (its runs in `lines`, `arc` if it curves).
2. `dimensionMeasurementUnit` if it does not measure a length.
3. `parseDimensionKind` in `drawingFile.ts`.
4. Its name in `interface.property.dimensionKind`.
5. If it is not linear, check the filters of `lastDimension`, `DimensionChainTool` and
   `DimSpaceTool`, with a comment where AutoCAD accepts it and we do not.
6. The `dimensionEntity` arbitrary generates it.

## An entity property

Colour, linetype and lineweight are structural twins: copy the closest one (colour's names below).

- `BaseEntity` gets an **optional** field; absent means ByLayer and nothing is stored.
- `Layer` gets a **required** field with a default.
- `Document` gets a resolver like `resolveEntityColor` (override ?? layer ?? base default), exposed
  on `DocumentReader`.
- `carryOverrides` carries it onto copies.
- `drawingFile.ts`: bump `DRAWING_FILE_VERSION`, persist through the `overrides` spread, read
  tolerantly.
- `CadRuntime`: a setter like `setSelectionColor(value, scope)` = one `UpdateEntitiesCommand` over
  `scopeIds(scope)`, plus a reader like `commonSelectionColor` for `EngineState`
  (`selectionColor`) and `buildPropertiesUi`.
- Its current value (CECOLOR, CELTYPE, CELWEIGHT) is a `DocumentSettings` field, ByLayer by
  default and written only when it is not, set through `setCurrentProperties` as one
  `UpdateSettingsCommand`, read by `withCurrentProperties` at every creation from scratch, shown on
  `EngineState`; the ribbon's drop-down is like `applyColorControl` (the selection, else the
  current value).

## A style table

`textStyles.ts` and `dimStyles.ts` are the twins to copy:

1. A default base that always exists (`createDefaultDimStyle`).
2. A table on `CadDocument`: like `getDimStyles` / `getDimStyle` / `getCurrentDimStyleId` /
   `setCurrentDimStyle` / `addDimStyle`.
3. A field on `DocumentTables` (`load()` takes tables by name, not position).
4. A `reconcile` branch remapping a dangling id onto the base.
5. A tolerant parser that fills missing settings from the base, persisted from the first release.
6. What a fragment carries: `clipboardSnapshot` and `planPaste`.

A new **style setting** owes: the field with its metric default on the style, a branch in
`clampDimStyle`, a tolerant read with a `DRAWING_FILE_VERSION` bump, a fold into `scaledDimStyle`
if it is a plotted size, and a control in `packages/editor/src/styles-control.tsx` **under the heading
AutoCAD files it under** (Lines, Symbols and arrows, Text, Fit, Primary units): users look for a
setting where they were taught to.

## An object snap type

1. A `SnapType` member and a provider (`notable` for a point of an object).
2. Its place in `defaultSnapProviders` (position = tie-break).
3. Its word in `OSNAP_MODES` and in `commands.keywords.-OSNAP` of every catalog.
4. The `TRACKABLE` set if OTRACK acquires it; `FOUND_FROM_AFAR` if it is found from anywhere over
   its object.
5. A `SceneBuilder` marker.
6. Its name in `interface.snap` (menus) and `commands.feedback.snap` (the canvas tooltip).
7. The menu order in `packages/editor/src/snap-override-menu.tsx`.
8. The `CadRuntime` constructor turns off every snap a fresh AutoCAD has off (OSMODE 4133 runs
   Endpoint, Center, Intersection and Extension): add it there unless it is one of those.
