# Arabic interface (`ar`)

`/ar/draw` is English AutoCAD with its interface in Arabic: palettes, menus, tooltips, the status
bar
and the language menu speak Arabic and mirror right to left; the drawing, the command line, the
dynamic input, the coordinates and every technical value stay left to right.

- **Deviation, forced by what does not exist:** there is no Arabic AutoCAD — Autodesk ships 14
  languages and none is right to left — and whoever drafts in Arabic works in the English one. So
  Arabic's command language is the global one: the same names, aliases, prompts, keywords and
  canvas labels as `/draw` (`cad/locales/ar.json` holds only `interface`; `WHY` in
  `i18n/engine.ts`). An Arabic vocabulary would be one no AutoCAD user has ever seen, and would put
  bidirectional text in the command line.
- **Deviation, forced by the platform:** a Ctrl shortcut is read by its physical key (`e.code`)
  when the layout sends a letter that is not latin — with the Arabic layout Ctrl+Z arrives as
  `ئ`. Desktop accelerators, AutoCAD's included, do not depend on the layout. Typed text is taken
  as typed: `LINE` typed on the Arabic layout is an unknown command, as in AutoCAD.
- The interface words are the project's, written in Modern Standard Arabic with the glossary
  (`docs/i18n-glossary.md`). `ar` is `live` since 01/10/2026 **without a native speaker's
  review**, by the author's decision: none was available. Where one should look first, if one
  ever is: the glossary's † terms and the ViewCube's compass letters, then `messages/ar.json` and
  `cad/locales/ar.json`.
- **Missing:** drawing text in a right-to-left script. TEXT and MTEXT draw whatever is typed,
  Arabic included, but with no paragraph direction of their own (always left to right), measured
  as an average glyph (Arial's widths cover latin only), so an Arabic label's box and centring are
  approximate.
