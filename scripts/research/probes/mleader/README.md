# A multileader

How AutoCAD 2027 makes, opens, draws, edits, lists and writes a multileader (MULTILEADER). The
files go to `%TEMP%\mcaddxf\mleader`; each probe runs with `runacc.sh [-i <file>] <probe> en-US`.

- `m00`: MLEADER's first prompts; its text opens the in-place editor, where the console hangs.
- `m01`: dxf-parser's `test_data_mleader.dxf`, which AutoCAD refuses (`Undefined group code 330`).
- `m02`: an MTEXT made a multileader's text (Content first, select Mtext), its entity data, its
  style, LIST and DXFOUT; `m03` makes five (that text, none, a block, a spline, two lines), DXFOUTs
  and explodes them: the pieces EXPLODE leaves.
- `variant.py m03.dxf <dir>` writes `v1`–`v23`, each changing one group of the first, and `m04`
  explodes one: what AutoCAD draws from (the context's text place, landing, dogleg length,
  arrowhead size 140 and text height; not the object's 41 and 42, its scale or landing gap), the
  dogleg off (v7), a short first segment (v15, v16), a text in columns (v13, v14), the colours'
  methods (v17–v21: `m13` plots v19 and v20).
- `m05` ROTATE, SCALE, MIRROR and MOVE; `m06`, `m07` MIRROR about other lines, a block's, and
  STRETCH by each point; `m08` the snaps and the edit commands' refusals, `m09` the rest.
- `m10` LIST of m03's five, run in every console; `m14` LIST of v23 (no leader lines, the dogleg
  off) in every console, for the words m10 has not.
- `m11` DXFOUTs m03 in 2000 to 2013; `m12` adds two leaders to the first with MLEADEREDIT, on its
  side and the other, LISTs and explodes it, and DXFOUTs the drawing of
  `cad/serialization/dxf/fixtures/mleaders-2018.dxf.gz`.
- `compare.ts <file.dxf>` prints what the engine draws of each multileader, piece by piece;
  `same.sh <theirs.dxf> <ours.dxf>…` explodes every multileader of each file in the console (`m15`)
  and prints how ours differ from theirs.
