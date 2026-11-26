# Blocks palette

### `BLOCKSPALETTE` · es `PALETABLOQUES` · pt-BR `PALETABLOCOS` · fr `PALETTEBLOCS` · it `TAVOLOZZABLOCCHI` · de `BLOCKPALETTE` · ru `ПАЛБЛОКИ` · pl `PALETABLOKI` · cs `PALETABLOKY` · hu `BLOKKPALETTA`

**Implemented:** the Blocks palette, a modeless palette of its own (workspace.md, Palettes), laid
out as 2027's (plan §2.8): its tab written upwards at its edge, the filter and the view drop-down
over `Current Drawing Blocks` and the blocks, and Options at its foot, in each culture's words
(AcWindows.resources.dll: BP_Tab_CurrentDrawing, BP_CurrentDrawingTitle and its BAML's; Arabic
ours). INSERT (`I`, es `IN`) opens it too, as 2027's INSERT does (desktop blocks/d06); the ribbon's
Insert is its gallery of blocks (`docs/coverage/workspace.md`, Ribbon). `'BLOCKSPALETTE` opens it
inside a running command, which resumes at once (desktop workspace/d02-t). The Current Drawing tab
alone; the filter (`Filter...`) takes AutoCAD's wildcards (`?` / `*`); the view drop-down offers
Extra Large Icon, Large Icon (the profile's CurrentViewMode 1, the first shown), Medium Icon, Small
Icon and List at AcWindows' sizes (140/128/160, 80/64/92, 50/32/60, 100/16/28; a list's row 28,
AutoCAD's 20), kept while the page lives; thumbnails rendered through the real `SceneBuilder`. A
click on a block runs -INSERT with the block chosen, asking what Options leave to ask and writing
only the prompt line, and U and REDO name the step `-INSERT` (d06-6, d06-9); AutoCAD lists
`[Basepoint/Scale/X/Y/Z/Rotate]` there, of which Basepoint, X, Y and Z are -INSERT's Missing.
Options (2027 help, Blocks Palette), each checked to be asked as the block is inserted, else taken
from its fields, as the profile starts them (d06-3; Dialogs\BlockStream): Insertion Point,
checked (cleared, its X, Y and Z show, read in the UCS, and a double-click inserts the block there,
as the help says, asking nothing more); Scale, cleared, X 1 and Y 1 (checked, -INSERT's X and Y
prompts after the point), Uniform Scale one factor for both; Rotation, cleared, Angle 0 (checked,
-INSERT's angle prompt). A field reads a number or an angle as the command line does and refuses
what is none, or a scale of 0; Options fold under their heading; they last through NEW and OPEN,
as AutoCAD keeps them for the program. From the keyboard: the arrows move through the blocks
(mirrored right to left, Up and Down a row), Home and End, Enter or Space inserts, a letter types a
command, Delete does nothing; after a pick, a check or a value the keys are the drawing's. The
palette stays open while blocks are placed, so one block after another is a click on each. No
delete, as AutoCAD's palette has none: its thumbnail menu offers Insert, Insert and Explode and Copy
to Favorites (desktop blocks/d06-4); PURGE deletes. **Unverified**: whether a click with Insertion
Point cleared does more than select (here it selects), what Scale checked asks with Uniform Scale
(here -INSERT's X and Y), and whether the ribbon's gallery follows Options (here it does)

**Missing:** the Recent, Favorites and Libraries tabs, not drawn: they list blocks of other drawings
and need files and a history kept between sessions; Insert DWG as Block; the filter's list of the
filters typed before; the Details view, whose one column, Annotative / Dynamic, no block here has;
Block Sync Settings (Options' gear); Scale's Z, which is |X| for a reference here; Auto-Placement,
Repeat Placement ("prompted automatically for additional insertion points until you press Esc") and
Explode; the view and the Scale, Uniform Scale and Rotation checks kept across sessions, as
AutoCAD's profile keeps them; drag and drop; the thumbnail's context menu
