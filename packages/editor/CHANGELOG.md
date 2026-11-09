# @mellowcad/editor

## 0.2.0

### Minor Changes

- 916ed1e: `@mellowcad/editor/locales/fr`, French's catalog, is an entry point, with every message.
- 594eb80: `@mellowcad/editor/locales/pt-BR` (exported as `ptBR`), Brazilian Portuguese's catalog, is an entry point, with every message.
- 40a53e2: REGION, UNION, SUBTRACT and INTERSECT of regions, as AutoCAD 2027 asks and reports them, on the engine's own planar kernel (exact edges: lines, circular and elliptical arcs, NURBS pieces; one tolerance, 1e-6). A new entity type, `RegionEntity` (`"region"` in `EntityType`): faces of loops of edges in the plane of its normal, drawn, picked and snapped by its edges, with grips at its corners and a whole loop's centre; the palette shows Area and Perimeter (`perimeter`), LIST and AREA report it, EXPLODE breaks it up. Drawing file version 42. The editor's tool palette gains Region in Draw and the Solid Editing drop-down (Union, Subtract, Intersect) in Modify.
- ff49313: BOX, as AutoCAD 2027 asks it — two corners, Center, Cube, Length, the height or 2Point, its defaults and refusals — making the engine's first 3D solid. A new entity type, `Solid3dEntity` (`"solid3d"` in `EntityType`): a B-rep of the engine's own kernel (vertices, edges with their curve, faces with their surface and loops of coedges) in the WCS, keeping the box it was made as (`BoxPrimitive`); drawn in 2D Wireframe as its edges, picked and snapped by them, carried by MOVE, COPY, ROTATE, SCALE, MIRROR and STRETCH, listed by LIST, measured by AREA, exploded into regions. The palette shows its Geometry and Solid History (`solidType`, `width`, `history`, `showHistory` rows; the `solidHistory` group). `DocumentSettings.isolines` (ISOLINES, saved with the drawing). Drawing file version 43. The editor's tool palette gains Box in Draw.
- 186a944: CYLINDER and CONE, as AutoCAD 2027 asks them: the base by its centre and radius or diameter, 3P, 2P, Ttr or Elliptical, the height, 2Point or Axis endpoint, CONE's Top radius, with their refusals and shared defaults. The solid kernel gains curved geometry: an edge's `BrepCurve` may be a `circle`, an `ellipse` or an apex's `point`, a face's `BrepSurface` a `cylinder` or a `cone`; area and volume are exact for them, and `brepMapped` takes the map's scale. `CylinderPrimitive` and `ConePrimitive` join `SolidPrimitive`. A solid draws ISOLINES' rulings on its curved faces and is picked and windowed by them; it snaps at its circles' centres and quadrants and a cone's apex. EXPLODE refuses a solid with a curved face (no surface object yet). Drawing file version 45. The editor's Modeling drop-down gains Cylinder and Cone.
- a3d656f: SPHERE and TORUS, as AutoCAD 2027 asks them: the centre by a point, 3P, 2P or Ttr, the radius or Diameter, TORUS's tube radius, 2Point or Diameter, measured from the ring's point last given, a negative ring making an apple or a lemon, with their refusals and shared defaults. The solid kernel's `BrepSurface` may be a `sphere` or a `torus`, a face with no edge or with an apple's or a lemon's poles; area and volume are exact for them, `closedSurfaceReach` bounds them and `brepAnchor` places a solid with no vertex. `SpherePrimitive` and `TorusPrimitive` join `SolidPrimitive`. Their isolines are ISOLINES' meridians and parallels, and Center finds their centre from any of them. A failed Nearest override now says `No found for specified point.`, as AutoCAD does. Drawing file version 46. The editor's Modeling drop-down gains Sphere and Torus.
- 9f93d4b: WEDGE and PYRAMID, as AutoCAD 2027 asks them. WEDGE asks BOX's prompts, its slope down from the first corner, its cube and length along the UCS's X; PYRAMID asks its sides, Edge, Inscribed or Circumscribed, Top radius, Axis endpoint and 2Point, says its sides and Type first and turns its base towards the cursor. The primitives share their defaults (length, width, height, radius, top radius), and a negative cube or length from BOX's or WEDGE's centre is twice as long, as AutoCAD makes it. A solid's primitive is now a union by kind, `SolidPrimitive` (`BoxPrimitive`, `WedgePrimitive`, `PyramidPrimitive`), which LIST and the palette read; LIST's `listSolidType` message takes the kind. Drawing file version 44. The editor's tool palette gains a Modeling drop-down with Box, Pyramid and Wedge.

### Patch Changes

- 33b2d11: French's catalog takes three of French AutoCAD's own words: `Entrer` in the command's shortcut menu and `Depuis` in the object snap menu, as its menus write them, and `Contrôles de la vue` for the viewport's view control.
- 4f005c3: `HelpLinks` takes `commands`, the commands with a help page of their own by global name in lower case: F1 opens a running command's page there, and `command`'s template for the others.
- e363aba: The palette toggles of the top bar and the palette panel's tabs leave room for longer names: in Brazilian Portuguese, «Camadas» lost its end and the four tabs ran past the panel at its narrowest.
- f376cb6: `CadEditor` takes `feedback`, the page where the host's users report a problem: the application menu ends with Send Feedback, AutoCAD's name for it in each language, which opens that page in a tab of its own. Without it, the menu is as it was. The catalog's new key is `TopBar.feedback`.
- ec8b839: The tool palette no longer shows a vertical and a horizontal scrollbar while a button of its last row (ID Point) is pressed, nor in a window 700 to 719 px high, where the whole palette did not fit its zone: it now folds below 720 px.
- c8d0e32: FILLETEDGE, CHAMFEREDGE and SOLIDEDIT's faces, as AutoCAD 2027 asks them in English, Spanish (ARISTAEMPALME, ACHAFLANAARISTA, EDITSOLIDO) and Brazilian Portuguese (ARESTACONCORD, CHANFRARARESTA, EDITARSOLIDO): edges taken by a click or a typed point, Chain and Loop, the radius or the distances with Expression, the blend previewed in the solid's place and FILLETEDGE's radius grip, asked as AutoCAD's nested `>>Specify radius or [eXit]:`; SOLIDEDIT's Extrude, Move, Rotate, Offset, Taper, Delete and Copy of faces, the solid lit as the pick box crosses its edge, a dashed band from each point prompt's base, the extrusion's taper EXTRUDE's and Enter at its height the solid primitives' last one, which EXTRUDE's height now is too, and SOLIDCHECK, the system variable that writes its validation lines. The kernel fillets and chamfers straight edges between planes and circles round cylinders exactly, as ACIS does. FILLETRAD3D is saved in the drawing (`DocumentSettings.filletRadius3d`, file version 49). The editor's rail gains the Solid Editing panel's Fillet Edge and faces split buttons. New catalog keys: `interface.tool.filletedge`, `chamferedge`, `solidedit` and its seven face options, `commands.names`/`keywords` FILLETEDGE, CHAMFEREDGE and SOLIDEDIT, `keywordLabels.SOLIDEDIT`, `promptKeywordLabels.filletEdgeLoopOr`, the `filletEdge*`, `chamferEdge*`, `solidedit*` prompts and messages, and the messages `filletMultipleBodies`, `chamferMultipleBodies`, `edgeAlreadyPicked`, `noTangentChainEdges`, `faceSelectionUndone`, `noSolidsDetected`, `taperAngleNonzero`, `zeroDisplacement`, `zeroRotation` and `offsetDistanceBound`.
- 4fa4daf: MASSPROP, as AutoCAD 2027 reports it: a set's solids and regions, each summed as one body, in the current UCS — mass, volume, bounding box, centroid, moments and products of inertia, radii of gyration and the principal moments with their directions; a region off the XY plane, its area, perimeter, box and centroid —, word for word in English, Spanish (PROPFIS) and Brazilian Portuguese (PROPMASS), then `Write analysis to a file?`, whose Yes hands an `.mpr` file to the `FileTransport` (`save` receives it as it receives a drawing; the browser's names its download's type by the extension). The kernel integrates every face exactly. The editor's rail leaves MASSPROP out, as AutoCAD's ribbon does: it is typed. New catalog keys: `interface.tool.massprop`, `commands.names.MASSPROP`, `commands.keywords.MASSPROP`, `commands.prompts.massPropWriteFile`, the `massProp*` messages.
- 8e5507f: A solid that UNION, SUBTRACT or INTERSECT made shows one grip, as AutoCAD 2027 does, at its box's X-Y centre and lowest Z, which moves it whole. The Properties palette's drop-down names one object alone by its type, without the count (`Line`, not `Line (1)`): `EngineText.propertiesFilter`'s count is optional. The editor's command line hints `Type a command` only at `Command:`, not while a command asks.
- 545fb31: SLICE (SL) and SECTION (SEC), PRESSPULL on a solid's faces and a solid's faces, edges and vertices selected with Ctrl+click, as AutoCAD 2027 does them — in English, Spanish (CORTE, SECCION) and Brazilian Portuguese (FATIAR, CORTE). SLICE cuts the solids of a set by a plane given by two points, three, a point and its normal, the view, the UCS's planes or a planar object, keeping a side or both, the halves keeping the solid's properties, a dashed band from the plane's first point; SECTION adds a region of each solid where the plane cuts it, on the current layer. PRESSPULL extrudes a planar face clicked, or offsets one Ctrl+clicked, its neighbours carried on to meet it. Ctrl+click at `Command:` selects a face, an edge or a vertex, lit as Ctrl goes down, a locked solid's too with no grip, Ctrl+Space walks to the one behind, and the selection holds them apart from whole objects (`Selection.subobjects()`), with AutoCAD's highlight and red grips. The engine's kernel fixes a boolean of faces that coincide with their shared edges run opposite ways, such as two boxes stacked. The editor's rail gains Slice beside the booleans. New catalog keys: `interface.tool.slice`, `interface.tool.section`, `commands.names.SLICE`, `commands.names.SECTION`, their keywords and `keywordLabels.SLICE`, the plane's prompts (`selectObjectsToSlice`, `sliceStartOr`, `sectionFirstPointOr`, `planeSecondPoint`, `sliceObject`, `sectionObject`, `sliceSurface`, `planeSectionPoint`, `planeZAxisPoint`, `planeViewPoint`, `planeXYPoint`, `planeYZPoint`, `planeZXPoint`, `planeFirstPoint`, `planeThirdPoint`, `sliceSideOr`, `sliceBoth`, `presspullOffsetOr`), their messages, `promptForms.sliceStartOr`, `answerForms.presspullOffsetOr` and `format.promptWithDefaultOpen`.
- 1c3741f: VSCURRENT (VS), as AutoCAD 2027 asks it, with 2D Wireframe, Hidden and Conceptual — in English, Spanish (ESTVISACTUAL) and Brazilian Portuguese (EVATUAL). Hidden draws each solid's edges and outlines that no solid hides, worked out by the engine and emitted as ordinary scene primitives, so the canvas and the SVG presenter draw them alike; Conceptual paints the solids' faces as filled paths, back to front, in Gooch shading, its edges over them. The style is the drawing's setting `visualStyle` (`VisualStyle`), saved in the file (version 48). The editor's rail leaves VSCURRENT out, as it lives in AutoCAD's viewport controls: it is typed. New catalog keys: `interface.tool.vscurrent`, `commands.names.VSCURRENT`, `commands.keywords.VSCURRENT`, `commands.prompts.vscurrentOption`, `vscurrent2dWireframe`, `vscurrentHidden`, `vscurrentConceptual`. In Hidden and Conceptual the UCS icon's arms are X red, Y green and Z blue: `THEME.ucsIconX` and `ucsIconY` take AutoCAD's colours there, and `THEME.ucsIconZ` is new. `EngineState.dynamicInput` holds `Select objects:` (and `Remove objects:`) with no fields, as AutoCAD's dynamic prompt shows it at the cursor.
- fc5daa1: PEDIT (PE) edits polylines as AutoCAD 2027 does: a line, an arc or a spline turned into one, Close / Open, Join, Width, Edit vertex (Next, Previous, Break, Insert, Move, Regen, Straighten, Tangent, Width), Ltype gen, Reverse, its own Undo per step, and Multiple with Join's fuzz distance and join types; a double-click on a polyline opens it. A polyline gains `linetypeGeneration`, its linetype laid along all of it. The editor's rail gains Edit Polyline, with Edit Spline in its drop-down. `THEME.splineEditFrame` is new: the dashed control frame SPLINEDIT's Edit vertex draws.
- Updated dependencies [30861f3]
- Updated dependencies [1afba9d]
- Updated dependencies [f6a4d2c]
- Updated dependencies [6fc0fec]
- Updated dependencies [cc6df9a]
- Updated dependencies [7c988f3]
- Updated dependencies [242d031]
- Updated dependencies [4c31ea2]
- Updated dependencies [c8d0e32]
- Updated dependencies [10d28c9]
- Updated dependencies [f11b842]
- Updated dependencies [56d4d08]
- Updated dependencies [4fa4daf]
- Updated dependencies [761a608]
- Updated dependencies [cc5435a]
- Updated dependencies [5b58d00]
- Updated dependencies [b48a1b5]
- Updated dependencies [ece5a3d]
- Updated dependencies [8e5507f]
- Updated dependencies [40a53e2]
- Updated dependencies [3d5a9f7]
- Updated dependencies [f22e1ae]
- Updated dependencies [ff49313]
- Updated dependencies [186a944]
- Updated dependencies [5b36612]
- Updated dependencies [d5eaa77]
- Updated dependencies [a453ff4]
- Updated dependencies [545fb31]
- Updated dependencies [a3d656f]
- Updated dependencies [9f93d4b]
- Updated dependencies [1c3741f]
- Updated dependencies [50ac55d]
- Updated dependencies [fc5daa1]
  - @mellowcad/engine@0.3.0
  - @mellowcad/react@0.1.1

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
