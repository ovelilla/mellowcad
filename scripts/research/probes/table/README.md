# A table

How AutoCAD 2027 makes, opens, draws, lists, edits and writes a table (ACAD_TABLE). Every probe
runs in the console on ezdxf's `acad_table_with_blk_ref.dxf` (from `research/dxf-corpus/`, its
copy `%TEMP%\mcaddxf\table\ez.dxf`: ten rows of five columns, a title spanning them, a merged
cell, a block cell), `runacc.sh -i …\ez.dxf <probe> en-US`, but t00, on a new drawing.

- `t00`: -TABLE's prompts (columns, rows, insertion point and its Style, Layer, Width and Height),
  its DXFOUT, then SCALE, MIRROR, ROTATE and EXPLODE of the table and the entity each leaves.
- `variant.py t00.dxf <dir>` writes t00's variants (a circle added to its `*T` block, a column
  widened in its data only, its 41 set to 2, its block emptied) and `t01` opens each: AutoCAD
  draws a table from its cells, whatever its block holds.
- `t02`: SCALE 2, ROTATE 30 and MIRROR (the data each writes); `t03` DXFOUTs ez.dxf, its block
  redrawn by AutoCAD; `t04`, `t04b`, `t04c` what the edit commands say of it; `t05` STRETCH;
  `t06`, `t06b` EXPLODE (the pieces' layer and colour); `t07` the snaps; `t08` LIST, run in every
  console; `t09` its DXFOUT in each version.
- `t10` builds the reference drawing of `cad/serialization/dxf/fixtures/tables-2018.dxf.gz`
  (ez's table, a copy scaled by 0.5, one turned 30°, one mirrored, a red one on L1, an empty
  -TABLE); `t11` DXFOUTs a file of ours as AutoCAD reads it.
- `compare.ts <acad.dxf>` prints what the engine draws of each table beside AutoCAD's `*T`
  block of it; `same.ts <a.dxf> <b.dxf>` the tables two files hold that differ.
