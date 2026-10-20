---
name: extend-model
description: Checklists for extending the CAD engine's model. Use when adding an entity type, a dimension kind, an entity property (like colour or linetype), a style table, or an object snap type.
---

# Extending the model

The rules these steps serve are in `cad-engine.md` (modelling, dimensions, style tables) and
`cad-runtime.md` (snapping). Look up the AutoCAD behaviour before wiring anything in.

## An entity type

**The compiler points at** the exhaustive `switch (entity.type)` with no `default:`: the `assign*`
in `entityOverrides.ts`; translate, stretch, copy, rotate, scale, mirror (and the `*Copy`) in
`entityTransforms.ts`; `closestOnEntity`, `entityBounds`, `entityCrossesRect`;
`applyEntityProperty`; `cloneEntityShape` in `drawingFile.ts`; `planarPrimitives` in
`SceneBuilder.ts`; `singleEntityInfo`; and the editing tools' plans (`computeBreak`, `planTrim` /
`planExtend`, `OffsetTool`, `DimensionTool`, `implicitEdges` in `curveCrossings.ts`). A type they
cannot act on returns `null` explicitly rather than falling through.

**The compiler does not see** a `switch` with a `default:` or one that lists only some types. Go
through each and decide:

- `cad/serialization/drawingFile.ts`: `parseEntityShape` (its `default:` drops the type from every
  file) and a `DRAWING_FILE_VERSION` bump. The Z fields come through `planeOf` / `parsePlane`;
  thickness only if DXF gives the type one (then `hasThickness`).
- `cad/application/tools/ucsObjects.ts`: UCS OBject's four switches (alignment, `hasEnds`,
  `planarEnd`, `unpickedStart`).
- `cad/domain/objectArea.ts`: whether AREA and LIST give it an area.
- `cad/application/clipboard.ts`: `clipboardSnapshot`, the table entries the type references (a
  pasted object loses its style otherwise).
- `cad/domain/boundary.ts` (`collectCurves`), `cad/domain/hatch.ts` (`hatchLoopFromEntity`), the
  stretch vertices in `entityTransforms.ts`, `cad/application/tools/selectToolGrips.ts`
  (`selectedGrips`), `cad/application/tools/lastDrawnPoint.ts`, and the per-tool filters
  (`cannotBreak` and `BROKEN` in `BreakTool.ts`, `TRIMMED` in `EdgeEditTool.ts`,
  `BOUNDARY_TYPES` in `HatchTool.ts`, `RadialDimensionTool.ts`, `cornerObjects.ts`).
- A type that wears a **text style** (text, mtext, attdef, a reference's attributes): also
  `assignTextStyle`, `CadDocument.textStyleInUse` (its `usesTextStyle` has a `default:`) and
  `reconcile`, `setSelectionTextStyle` and `EngineState`'s `hasStyleOf`. Miss one and a style in
  use can be deleted.

Then the parts that are no switch at all:

- Name anything new the type exports in the `entities.ts` barrel.
- `snapping/providers.ts`: **snapping is opt-in**. A hatch is in no provider because OSOPTIONS
  ships at 7 ("Object snaps ignore hatch objects"): look up what AutoCAD snaps to first. A curve
  whose intersections have no closed form joins Intersection as the chords of its tessellation near
  the cursor only (`collectShapes`'s `near`), tagged with `curveId` so its own chords never meet.
- The type's name in `interface.entity` and its rows in `interface.property` (`cad/locales/en.json`,
  then `npm run locales`).
- The fast-check `entity` arbitrary in `test/arbitraries.ts` must generate it, or every transform,
  bounds and round-trip property silently stops covering it.

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
if it is a plotted size, and a control in `components/cad/styles-control.tsx` **under the heading
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
7. The menu order in `components/cad/snap-override-menu.tsx`.
8. The `CadRuntime` constructor turns off every snap a fresh AutoCAD has off (OSMODE 4133 runs
   Endpoint, Center, Intersection and Extension): add it there unless it is one of those.
